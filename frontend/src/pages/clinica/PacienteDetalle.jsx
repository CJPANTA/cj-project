import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

export default function PacienteDetalle({ temaOscuro }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pestanaActiva, setPestanaActiva] = useState('resumen');
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [cargandoEval, setCargandoEval] = useState(false);
  const [generandoInforme, setGenerandoInforme] = useState(null);
  const [usuarioRol, setUsuarioRol] = useState(null);

  useEffect(() => {
    const cargarPaciente = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase.from('pacientes').select('*').eq('id', id).single();
        if (error) throw error;
        if (!data) { setError('Paciente no encontrado'); return; }
        setPaciente(data);
        cargarEvaluaciones(id);

        // Obtener rol del usuario actual
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: perfil } = await supabase.from('profiles').select('rol').eq('id', user.id).single();
          if (perfil) setUsuarioRol(perfil.rol);
        }
      } catch (err) {
        console.error(err);
        setError('Error al cargar los datos del paciente.');
      } finally {
        setLoading(false);
      }
    };
    if (id) cargarPaciente();
  }, [id]);

  const cargarEvaluaciones = async (pacienteId) => {
    setCargandoEval(true);
    try {
      const { data, error } = await supabase
        .from('evaluaciones')
        .select('*')
        .eq('paciente_id', pacienteId)
        .order('created_at', { ascending: false });
      if (!error) setEvaluaciones(data || []);
    } catch (e) { console.error(e); } finally { setCargandoEval(false); }
  };

  const calcularEdad = (fechaNac) => {
    if (!fechaNac) return '—';
    const hoy = new Date();
    const nac = new Date(fechaNac);
    let edad = hoy.getFullYear() - nac.getFullYear();
    const mes = hoy.getMonth() - nac.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nac.getDate())) edad--;
    return edad;
  };

  // ============================================================
  // FUNCIÓN DE APROBACIÓN (desde la ficha)
  // ============================================================
  const cambiarEstadoEvaluacion = async (evalId, nuevoEstado) => {
    try {
      const { error } = await supabase
        .from('evaluaciones')
        .update({ estado: nuevoEstado })
        .eq('id', evalId);
      if (error) throw error;
      alert(`✅ Evaluación ${nuevoEstado === 'aprobado' ? 'aprobada' : 'rechazada'}.`);
      cargarEvaluaciones(id);
    } catch (error) {
      alert('Error al cambiar estado: ' + error.message);
    }
  };

  // ============================================================
  // GENERAR INFORME (copia de la función de EvaluacionPostural)
  // ============================================================
  const generarInformeDesdeEvaluacion = async (evaluacionId) => {
    setGenerandoInforme(evaluacionId);
    try {
      const { data: evaluacion, error: evalError } = await supabase
        .from('evaluaciones')
        .select('*')
        .eq('id', evaluacionId)
        .single();
      if (evalError) throw evalError;
      if (!evaluacion) { alert('Evaluación no encontrada.'); return; }

      const { data: pacienteData } = await supabase
        .from('pacientes')
        .select('*')
        .eq('id', evaluacion.paciente_id)
        .single();

      const { data: { user } } = await supabase.auth.getUser();
      const { data: perfil } = await supabase
        .from('profiles')
        .select('nombre_completo, centro_id')
        .eq('id', user.id)
        .single();

      let centroNombre = 'Centro CJ';
      let logoUrl = '';
      if (perfil?.centro_id) {
        const { data: centro } = await supabase
          .from('centros')
          .select('nombre, logo_url')
          .eq('id', perfil.centro_id)
          .single();
        if (centro) {
          centroNombre = centro.nombre || 'Centro CJ';
          logoUrl = centro.logo_url || '';
        }
        if (!logoUrl) {
          const publicLogo = `/logo_centros/${perfil.centro_id}.png`;
          try {
            const response = await fetch(publicLogo);
            if (response.ok) logoUrl = publicLogo;
          } catch (e) {}
        }
      }

      const nombrePaciente = pacienteData ? `${pacienteData.nombre} ${pacienteData.apellidos}` : 'Paciente';
      const fecha = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const hora = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      const usuario = perfil?.nombre_completo || 'Usuario';
      const regiones = evaluacion.regiones || [];
      const datosRegiones = evaluacion.datos_regiones || {};
      const recomendaciones = datosRegiones._recomendaciones || '';
      const planTratamiento = datosRegiones._plan_tratamiento || '';

      // --- Agrupar por zona ---
      const zonas = {
        'Cabeza y Cuello': ['cabeza', 'cuello', 'nuca', 'cervical'],
        'Tronco': ['torax', 'pecho', 'espalda', 'abdomen', 'lumbar', 'dorsal', 'clavicula', 'trapecio', 'escapula'],
        'Miembro Superior': ['hombro', 'brazo', 'antebrazo', 'mano', 'muneca', 'codo', 'biceps', 'triceps', 'olecranon', 'deltoides', 'manguito', 'acromion'],
        'Miembro Inferior': ['pierna', 'muslo', 'rodilla', 'rotula', 'gemelo', 'tobillo', 'pie', 'talon', 'cuadriceps', 'isquiotibial', 'soleo', 'tendon_aquiles', 'tibial', 'poplitea', 'lca', 'lcp', 'lcm', 'lcl', 'menisco'],
        'Pelvis': ['pelvis', 'cadera', 'sacro', 'pubis', 'gluteo'],
      };
      const regionesPorZona = {};
      regiones.forEach(r => {
        let asignada = false;
        for (const [zona, keywords] of Object.entries(zonas)) {
          if (keywords.some(k => r.includes(k))) {
            if (!regionesPorZona[zona]) regionesPorZona[zona] = [];
            regionesPorZona[zona].push(r);
            asignada = true;
            break;
          }
        }
        if (!asignada) {
          if (!regionesPorZona['Otras']) regionesPorZona['Otras'] = [];
          regionesPorZona['Otras'].push(r);
        }
      });

      // --- Clasificar vistas ---
      const esPosterior = (r) => {
        const postRegions = ['nuca', 'espalda', 'sacro', 'gluteo', 'poplitea', 'lumbar', 'dorsal', 'escapula', 'trapecio', 'post'];
        if (postRegions.some(p => r.includes(p))) return true;
        return false;
      };
      const esAnterior = (r) => !esPosterior(r);
      const regionesAnteriores = regiones.filter(esAnterior);
      const regionesPosteriores = regiones.filter(esPosterior);

      // --- Generar stickman (copia exacta de la función) ---
      const generarStickman = (regionesVista, titulo, isPosterior) => {
        if (regionesVista.length === 0) return '';
        const centroides = {
          cabeza: { cx: 100, cy: 30 }, cuello: { cx: 100, cy: 50 }, nuca: { cx: 100, cy: 50 },
          torax: { cx: 100, cy: 85 }, pecho: { cx: 100, cy: 85 }, espalda: { cx: 100, cy: 85 },
          hombro_izq: { cx: 75, cy: 45 }, hombro_der: { cx: 125, cy: 45 },
          brazo_izq: { cx: 60, cy: 80 }, brazo_der: { cx: 140, cy: 80 },
          biceps: { cx: 60, cy: 80 }, biceps_izq: { cx: 60, cy: 80 }, biceps_der: { cx: 140, cy: 80 },
          codo: { cx: 60, cy: 105 }, codo_izq: { cx: 60, cy: 105 }, codo_der: { cx: 140, cy: 105 },
          antebrazo: { cx: 60, cy: 125 }, antebrazo_izq: { cx: 60, cy: 125 }, antebrazo_der: { cx: 140, cy: 125 },
          muneca: { cx: 60, cy: 145 }, muneca_izq: { cx: 60, cy: 145 }, muneca_der: { cx: 140, cy: 145 },
          mano: { cx: 60, cy: 155 }, mano_izq: { cx: 60, cy: 155 }, mano_der: { cx: 140, cy: 155 },
          pelvis: { cx: 100, cy: 145 }, cadera: { cx: 100, cy: 145 },
          sacro: { cx: 100, cy: 145 }, pubis: { cx: 100, cy: 155 },
          pierna_izq: { cx: 80, cy: 200 }, pierna_der: { cx: 120, cy: 200 },
          cuadriceps: { cx: 80, cy: 200 }, cuadriceps_izq: { cx: 80, cy: 200 }, cuadriceps_der: { cx: 120, cy: 200 },
          isquiotibial: { cx: 80, cy: 200 }, isquiotibiales: { cx: 80, cy: 200 },
          rodilla_izq: { cx: 80, cy: 235 }, rodilla_der: { cx: 120, cy: 235 },
          rotula: { cx: 80, cy: 235 }, rotula_izq: { cx: 80, cy: 235 }, rotula_der: { cx: 120, cy: 235 },
          gemelo: { cx: 80, cy: 260 }, gemelo_izq: { cx: 80, cy: 260 }, gemelo_der: { cx: 120, cy: 260 },
          tobillo: { cx: 80, cy: 280 }, tobillo_izq: { cx: 80, cy: 280 }, tobillo_der: { cx: 120, cy: 280 },
          pie_izq: { cx: 75, cy: 295 }, pie_der: { cx: 125, cy: 295 },
          acromion: { cx: 75, cy: 45 }, acromion_izq: { cx: 75, cy: 45 }, acromion_der: { cx: 125, cy: 45 },
          deltoides: { cx: 75, cy: 55 }, deltoides_ant: { cx: 75, cy: 55 }, deltoides_post: { cx: 75, cy: 55 },
          manguito: { cx: 75, cy: 60 }, manguito_ant: { cx: 75, cy: 60 }, manguito_post: { cx: 75, cy: 60 },
          clavicula_izq: { cx: 90, cy: 40 }, clavicula_der: { cx: 110, cy: 40 },
          trapecio_izq: { cx: 90, cy: 45 }, trapecio_der: { cx: 110, cy: 45 },
          escapula_izq: { cx: 90, cy: 55 }, escapula_der: { cx: 110, cy: 55 },
          lumbar: { cx: 100, cy: 100 }, cervical: { cx: 100, cy: 30 }, dorsal: { cx: 100, cy: 50 },
          poplitea_izq: { cx: 80, cy: 195 }, poplitea_der: { cx: 120, cy: 195 },
          lca: { cx: 80, cy: 195 }, lcp: { cx: 80, cy: 195 },
          menisco_med: { cx: 80, cy: 195 }, menisco_lat: { cx: 120, cy: 195 },
        };
        const puntosHTML = regionesVista.map(r => {
          let coords = centroides[r];
          if (!coords) {
            const baseKey = r.split('_')[0];
            coords = centroides[baseKey];
          }
          if (!coords) coords = { cx: 100, cy: 100 };
          return `<circle cx="${coords.cx}" cy="${coords.cy}" r="5" fill="#ef4444" stroke="#fff" stroke-width="1.5"/>`;
        }).join('');
        const siluetaPaths = `
          <path d="M 87,22 C 87,7 113,7 113,22 C 113,34 107,42 105,46 C 106,50 112,52 115,55 L 85,55 C 88,52 94,50 95,46 C 93,42 87,34 87,22 Z"/>
          <path d="M 85,55 C 98,58 115,55 115,55 C 122,68 118,98 112,120 L 88,120 C 82,98 78,68 85,55 Z"/>
          <path d="M 115,55 C 126,55 132,60 129,71 C 123,73 117,67 115,55 Z"/>
          <path d="M 85,55 C 74,55 68,60 71,71 C 77,73 83,67 85,55 Z"/>
          <path d="M 129,71 C 138,83 134,112 130,142 C 128,154 123,154 120,142 C 118,112 121,88 116,73 C 119,69 125,69 129,71 Z"/>
          <path d="M 71,71 C 62,83 66,112 70,142 C 72,154 77,154 80,142 C 82,112 79,88 84,73 C 81,69 75,69 71,71 Z"/>
          <path d="M 120,142 L 130,142 C 131,148 133,156 131,163 C 129,167 124,167 121,160 C 119,152 119,146 120,142 Z"/>
          <path d="M 80,142 L 70,142 C 69,148 67,156 69,163 C 71,167 76,167 79,160 C 81,152 81,146 80,142 Z"/>
          <path d="M 88,120 L 112,120 C 116,136 114,154 106,168 L 100,172 L 94,168 C 86,154 84,136 88,120 Z"/>
          <path d="M 103,172 L 108,168 C 120,185 121,210 114,235 C 111,245 113,268 111,288 L 103,288 C 104,268 107,245 105,235 C 107,210 105,185 103,172 Z"/>
          <path d="M 97,172 L 92,168 C 80,185 79,210 86,235 C 89,245 87,268 89,288 L 97,288 C 96,268 93,245 95,235 C 93,210 95,185 97,172 Z"/>
          <path d="M 103,288 L 111,288 C 115,294 119,303 113,308 C 107,311 101,304 103,288 Z"/>
          <path d="M 97,288 L 89,288 C 85,294 81,303 87,308 C 93,311 99,304 97,288 Z"/>
        `;
        return `
          <div style="text-align:center; margin: 5px 0;">
            <h3 style="font-size:11pt; margin: 3px 0;">${titulo}</h3>
            <svg viewBox="0 0 200 320" width="140" height="224" xmlns="http://www.w3.org/2000/svg" style="max-width:160px; height:auto;">
              <defs><linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#f8fafc"/><stop offset="100%" stopColor="#e2e8f0"/></linearGradient></defs>
              <g fill="url(#bodyGrad)" stroke="#94a3b8" stroke-width="1.2" opacity="0.8">${siluetaPaths}</g>
              ${puntosHTML}
            </svg>
          </div>
        `;
      };

      const stickmanAnterior = generarStickman(regionesAnteriores, 'Vista Anterior', false);
      const stickmanPosterior = generarStickman(regionesPosteriores, 'Vista Posterior', true);

      // --- Tabla única para evaluación por región ---
      const formatearNombreRegion = (nombre) => {
        const map = {
          'cabeza': 'Cabeza', 'cuello': 'Cuello', 'nuca': 'Nuca',
          'torax': 'Tórax', 'pecho': 'Pecho', 'espalda': 'Espalda',
          'hombro': 'Hombro', 'brazo': 'Brazo', 'antebrazo': 'Antebrazo',
          'mano': 'Mano', 'muneca': 'Muñeca', 'codo': 'Codo',
          'pelvis': 'Pelvis', 'cadera': 'Cadera', 'sacro': 'Sacro', 'pubis': 'Pubis',
          'pierna': 'Pierna', 'muslo': 'Muslo', 'rodilla': 'Rodilla',
          'rotula': 'Rótula', 'gemelo': 'Gemelo', 'tobillo': 'Tobillo',
          'pie': 'Pie', 'talon': 'Talón',
          'acromion': 'Acromion', 'deltoides': 'Deltoides', 'manguito': 'Manguito Rotador',
          'clavicula': 'Clavícula', 'trapecio': 'Trapecio', 'escapula': 'Escápula',
          'lumbar': 'Lumbar', 'cervical': 'Cervical', 'dorsal': 'Dorsal',
          'poplitea': 'Fosa Poplítea', 'lca': 'LCA', 'lcp': 'LCP',
          'lcm': 'LCM', 'lcl': 'LCL', 'menisco': 'Menisco',
          'cuadriceps': 'Cuádriceps', 'isquiotibial': 'Isquiotibial',
          'soleo': 'Sóleo', 'tendon_aquiles': 'Tendón de Aquiles',
          'biceps': 'Bíceps', 'triceps': 'Tríceps', 'olecranon': 'Olécranon',
          'tibial': 'Tibial',
          'izq': 'Izquierdo', 'der': 'Derecho',
          'ant': 'Anterior', 'post': 'Posterior',
          'med': 'Medial', 'lat': 'Lateral',
          'inf': 'Inferior', 'sup': 'Superior',
          'prox': 'Proximal', 'dist': 'Distal',
        };
        let resultado = nombre;
        Object.keys(map).forEach(key => {
          resultado = resultado.replace(new RegExp(`_${key}(_|$)`, 'g'), ` ${map[key]}$1`);
        });
        resultado = resultado.split('_').map(p => {
          if (map[p]) return map[p];
          return p.charAt(0).toUpperCase() + p.slice(1);
        }).join(' ').trim();
        resultado = resultado.replace(/\bLCA\b/g, 'Ligamento Cruzado Anterior');
        resultado = resultado.replace(/\bLCP\b/g, 'Ligamento Cruzado Posterior');
        resultado = resultado.replace(/\bLCM\b/g, 'Ligamento Colateral Medial');
        resultado = resultado.replace(/\bLCL\b/g, 'Ligamento Colateral Lateral');
        return resultado;
      };

      const tablaRegiones = regiones.map(region => {
        const data = datosRegiones[region] || {};
        const nombreFormateado = formatearNombreRegion(region);
        const eva = data.eva !== undefined ? `${data.eva}/10` : '—';
        const rom = data.rom || '—';
        const tests = (data.tests && data.tests.length > 0) ? data.tests.join(', ') : '—';
        const obs = data.observaciones || '—';
        const notas = data.notas || '—';
        return { region: nombreFormateado, eva, rom, tests, obs, notas };
      });

      const tablaHTML = tablaRegiones.map(row => `
        <tr>
          <td style="font-weight:600;">${row.region}</td>
          <td>${row.eva}</td>
          <td>${row.rom}</td>
          <td>${row.tests}</td>
          <td>${row.obs}</td>
          <td>${row.notas}</td>
        </tr>
      `).join('');

      // ===== CONTENIDO HTML DEL INFORME =====
      const contenidoHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Informe Clínico - ${nombrePaciente}</title>
          <style>
            @page { size: A4; margin: 1.5cm 1.5cm 1cm 1.5cm; }
            * { box-sizing: border-box; }
            body {
              font-family: 'Calibri', 'Roboto', Arial, sans-serif;
              font-size: 10pt;
              line-height: 1.4;
              color: #1e293b;
              background: white;
              margin: 0;
              padding: 0;
            }
            .pagina {
              display: flex;
              flex-direction: column;
              height: 100vh;
              padding: 0;
              page-break-after: always;
              position: relative;
            }
            .pagina:last-child { page-break-after: avoid; }
            .contenido {
              flex: 1;
              padding-bottom: 15px;
            }
            .encabezado {
              text-align: center;
              border-bottom: 2px solid #22d3ee;
              padding-bottom: 8px;
              margin-bottom: 15px;
              position: relative;
              min-height: 70px;
            }
            .encabezado .logo {
              max-width: 60px;
              max-height: 60px;
              float: left;
              margin-right: 12px;
            }
            .encabezado .logo-derecho {
              max-width: 50px;
              max-height: 50px;
              float: right;
              margin-left: 12px;
            }
            .encabezado .titulo {
              font-size: 16pt;
              font-weight: 700;
              color: #0f172a;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .encabezado .subtitulo {
              font-size: 9pt;
              color: #64748b;
            }
            .encabezado .datos {
              font-size: 8pt;
              color: #475569;
              margin-top: 3px;
            }
            .pie {
              text-align: center;
              font-size: 8pt;
              color: #94a3b8;
              border-top: 1px solid #e2e8f0;
              padding-top: 6px;
              margin-top: auto;
              width: 100%;
            }
            .marca-agua {
              position: fixed;
              top: 0; left: 0; right: 0; bottom: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              pointer-events: none;
              z-index: 1000;
              opacity: 0.04;
              font-size: 80pt;
              font-weight: 900;
              color: #22d3ee;
              transform: rotate(-30deg);
              text-transform: uppercase;
              letter-spacing: 20px;
              user-select: none;
            }
            h1 {
              font-size: 13pt;
              font-weight: 700;
              color: #0f172a;
              border-left: 4px solid #22d3ee;
              padding-left: 10px;
              margin-top: 14px;
              margin-bottom: 6px;
              text-transform: uppercase;
              page-break-after: avoid;
            }
            h2 {
              font-size: 11pt;
              font-weight: 700;
              color: #1e293b;
              margin-top: 10px;
              margin-bottom: 4px;
              page-break-after: avoid;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 4px 0;
              font-size: 9pt;
              page-break-inside: avoid;
            }
            th, td {
              border: 1px solid #cbd5e1;
              padding: 3px 5px;
              text-align: left;
              vertical-align: top;
            }
            th { background-color: #f1f5f9; font-weight: 700; }
            ul {
              padding-left: 16px;
              margin: 2px 0;
            }
            li { margin-bottom: 1px; }
            .alerta {
              background-color: #fee2e2;
              border-left: 4px solid #ef4444;
              padding: 5px 10px;
              margin: 6px 0;
              border-radius: 3px;
              font-weight: 600;
              font-size: 9pt;
            }
            .seccion { margin-bottom: 8px; }
            .clearfix::after { content: ""; clear: both; display: table; }
            .stickman-container {
              display: flex;
              flex-wrap: wrap;
              justify-content: center;
              gap: 15px;
              margin: 8px 0;
            }
            .stickman-container > div {
              flex: 0 1 auto;
              text-align: center;
            }
            .firma {
              margin-top: 25px;
              border-top: 1px solid #94a3b8;
              padding-top: 8px;
              text-align: right;
              font-size: 10pt;
            }
            .campo-vacio {
              color: #94a3b8;
              font-style: italic;
            }
            .zona-titulo {
              font-weight: 700;
              margin-top: 6px;
              margin-bottom: 2px;
              font-size: 10pt;
              color: #0f172a;
            }
            @media print {
              .marca-agua { opacity: 0.03; }
              .pagina { height: auto; min-height: 100vh; }
            }
          </style>
        </head>
        <body>
          <div class="marca-agua">CONFIDENCIAL</div>

          <!-- PÁGINA 1 -->
          <div class="pagina">
            <div class="contenido">
              <div class="encabezado clearfix">
                ${logoUrl ? `<img src="${logoUrl}" class="logo" alt="Logo Centro" onerror="this.style.display='none'" />` : ''}
                <img src="/logos_cj_circular.png" class="logo-derecho" alt="CJ Fisioterapia" onerror="this.style.display='none'" />
                <div>
                  <div class="titulo">Informe de Evaluación Clínica</div>
                  <div class="subtitulo">${centroNombre}</div>
                  <div class="datos">
                    Paciente: ${nombrePaciente} &nbsp;|&nbsp; Fecha: ${fecha} &nbsp;|&nbsp; ID: ${evaluacion.paciente_id}
                  </div>
                </div>
              </div>

              <h1>1. Datos Generales</h1>
              <table>
                <tr><th>Campo</th><th>Valor</th></tr>
                ${evaluacion.edad ? `<tr><td>Edad</td><td>${evaluacion.edad}</td></tr>` : ''}
                ${evaluacion.sexo ? `<tr><td>Sexo</td><td>${evaluacion.sexo}</td></tr>` : ''}
                ${evaluacion.ocupacion ? `<tr><td>Ocupación</td><td>${evaluacion.ocupacion}</td></tr>` : ''}
                ${evaluacion.telefono ? `<tr><td>Teléfono</td><td>${evaluacion.telefono}</td></tr>` : ''}
                ${evaluacion.direccion ? `<tr><td>Dirección</td><td>${evaluacion.direccion}</td></tr>` : ''}
              </table>

              <h1>2. Motivo de Consulta</h1>
              ${evaluacion.motivo_consulta ? `<p><strong>Motivo principal:</strong> ${evaluacion.motivo_consulta}</p>` : ''}
              ${evaluacion.tiempo_evolucion ? `<p><strong>Tiempo de evolución:</strong> ${evaluacion.tiempo_evolucion}</p>` : ''}
              ${evaluacion.mecanismo_lesion ? `<p><strong>Mecanismo de lesión:</strong> ${evaluacion.mecanismo_lesion}</p>` : ''}

              <h1>3. Antecedentes</h1>
              <table>
                ${evaluacion.antecedentes_medicos ? `<tr><th>Antecedentes médicos</th><td>${evaluacion.antecedentes_medicos}</td></tr>` : ''}
                ${evaluacion.alergias ? `<tr><th>Alergias</th><td>${evaluacion.alergias}</td></tr>` : ''}
                ${evaluacion.medicamentos ? `<tr><th>Medicamentos actuales</th><td>${evaluacion.medicamentos}</td></tr>` : ''}
                ${evaluacion.cirugias_previas ? `<tr><th>Cirugías previas</th><td>${evaluacion.cirugias_previas}</td></tr>` : ''}
              </table>
            </div>
            <div class="pie">Documento Clínico Confidencial - ${centroNombre} - Pág. 1</div>
          </div>

          <!-- PÁGINA 2 -->
          <div class="pagina">
            <div class="contenido">
              <h1>4. Evaluación del Dolor</h1>
              ${evaluacion.tipo_dolor && evaluacion.tipo_dolor.length > 0 ? `<p><strong>Tipo de dolor:</strong> ${evaluacion.tipo_dolor.join(', ')}</p>` : ''}
              <table>
                <tr><th>Intensidad en reposo (EVA)</th><td>${evaluacion.intensidad_reposo || 0} / 10</td></tr>
                <tr><th>Intensidad en actividad (EVA)</th><td>${evaluacion.intensidad_actividad || 0} / 10</td></tr>
                ${evaluacion.factores_agravantes ? `<tr><th>Factores agravantes</th><td>${evaluacion.factores_agravantes}</td></tr>` : ''}
                ${evaluacion.factores_atenuantes ? `<tr><th>Factores atenuantes</th><td>${evaluacion.factores_atenuantes}</td></tr>` : ''}
                ${evaluacion.sintomas_asociados ? `<tr><th>Síntomas asociados</th><td>${evaluacion.sintomas_asociados}</td></tr>` : ''}
              </table>

              <h1>5. Regiones Afectadas</h1>
              ${Object.entries(regionesPorZona).map(([zona, lista]) => `
                <div class="zona-titulo">${zona}</div>
                <ul>
                  ${lista.map(r => `<li>${formatearNombreRegion(r)}</li>`).join('')}
                </ul>
              `).join('')}

              <div class="stickman-container">
                ${stickmanAnterior}
                ${stickmanPosterior}
                <p style="width:100%; text-align:center; font-size:8pt; color:#64748b; margin:0;">Los puntos rojos indican las regiones afectadas</p>
              </div>

              <h1>6. Evaluación por Región</h1>
              <table>
                <thead>
                  <tr>
                    <th style="width:22%;">Región</th>
                    <th style="width:8%;">EVA</th>
                    <th style="width:10%;">ROM</th>
                    <th style="width:18%;">Tests</th>
                    <th style="width:22%;">Observaciones</th>
                    <th style="width:20%;">Notas</th>
                  </tr>
                </thead>
                <tbody>
                  ${tablaHTML}
                </tbody>
              </table>
            </div>
            <div class="pie">Documento Clínico Confidencial - ${centroNombre} - Pág. 2</div>
          </div>

          <!-- PÁGINA 3 -->
          <div class="pagina">
            <div class="contenido">
              <h1>7. Recomendaciones</h1>
              <p>${recomendaciones || '<span class="campo-vacio">No se han registrado recomendaciones.</span>'}</p>

              <h1>8. Plan de Tratamiento</h1>
              <p>${planTratamiento || '<span class="campo-vacio">No se ha registrado un plan de tratamiento.</span>'}</p>

              <h1>9. Alerta de Seguridad</h1>
              <div class="alerta">
                ⚠️ Este informe contiene información confidencial del paciente. Solo debe ser utilizado por personal autorizado.
              </div>

              <h1>10. Datos de Generación</h1>
              <table>
                <tr><th>Informe generado por</th><td>${usuario}</td></tr>
                <tr><th>Fecha de generación</th><td>${fecha}</td></tr>
                <tr><th>Hora de generación</th><td>${hora}</td></tr>
                <tr><th>Centro</th><td>${centroNombre}</td></tr>
              </table>

              <div class="firma">
                <p>Firma del terapeuta: ________________________</p>
                <p style="font-size:8pt; color:#94a3b8;">${usuario}</p>
              </div>

              <div style="text-align: center; margin-top: 15px; font-size: 9pt; color: #64748b;">
                --- Fin del informe ---
              </div>
            </div>
            <div class="pie">Documento Clínico Confidencial - ${centroNombre} - Pág. 3</div>
          </div>
        </body>
        </html>
      `;

      const ventana = window.open('', '_blank', 'width=800,height=600,scrollbars=yes');
      if (ventana) {
        ventana.document.title = `Informe Clínico - ${nombrePaciente}`;
        ventana.document.write(contenidoHTML);
        ventana.document.close();
        setTimeout(() => ventana.print(), 1000);
      } else {
        alert('Por favor, permite las ventanas emergentes para generar el informe.');
      }
    } catch (error) {
      console.error('Error al generar informe:', error);
      alert('Error al generar el informe: ' + error.message);
    } finally {
      setGenerandoInforme(null);
    }
  };

  // ========== ESTILOS ==========
  const bgPrincipal = temaOscuro ? 'bg-[#0a141d]' : 'bg-[#e2e8f0]';
  const textoPrincipal = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const bgTarjeta = temaOscuro ? 'bg-[#0a141d] border-gray-800' : 'bg-white border-gray-200';
  const bgPestanaActiva = temaOscuro ? 'bg-[#22d3ee]/20 text-[#22d3ee] border-[#22d3ee]' : 'bg-[#22d3ee] text-black border-[#22d3ee]';
  const bgPestanaInactiva = temaOscuro ? 'text-gray-400 hover:text-white border-transparent' : 'text-gray-600 hover:text-black border-transparent';

  if (loading) {
    return <div className={`min-h-screen ${bgPrincipal} flex items-center justify-center`}><div className="animate-spin rounded-full h-10 w-10 border-4 border-[#22d3ee] border-t-transparent"></div></div>;
  }

  if (error || !paciente) {
    return (
      <div className={`min-h-screen ${bgPrincipal} flex flex-col items-center justify-center p-4`}>
        <p className="text-red-500 text-lg font-bold">{error || 'Paciente no encontrado'}</p>
        <button onClick={() => navigate('/clinica/pacientes')} className="mt-4 px-6 py-2 bg-[#22d3ee] text-black font-bold rounded-xl text-sm hover:scale-105 transition-all">Volver</button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgPrincipal} p-4 md:p-8 transition-colors duration-500`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className={`text-3xl font-black tracking-tight ${textoPrincipal}`}>{paciente.nombre} {paciente.apellidos}</h1>
            <p className="text-gray-400 text-sm">{calcularEdad(paciente.fecha_nacimiento)} años · {paciente.telefono || 'Sin teléfono'} · {paciente.email || 'Sin email'}</p>
            <p className="text-xs text-gray-500">Diagnóstico: <span className="font-bold text-[#22d3ee]">{paciente.diagnostico || 'Pendiente'}</span></p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to={`/clinica/evaluacion/${paciente.id}`} className="px-4 py-2 bg-[#22d3ee]/20 text-[#22d3ee] font-bold rounded-xl text-xs hover:bg-[#22d3ee] hover:text-black transition-all">+ Agregar Evaluación</Link>
            <button className="px-4 py-2 bg-purple-600/20 text-purple-400 font-bold rounded-xl text-xs hover:bg-purple-600 hover:text-white transition-all">+ Nueva Sesión</button>
            <button className="px-4 py-2 bg-yellow-600/20 text-yellow-400 font-bold rounded-xl text-xs hover:bg-yellow-600 hover:text-white transition-all">✎ Editar Ficha</button>
          </div>
        </div>

        <div className="flex border-b border-gray-700 mb-6 overflow-x-auto">
          {['resumen', 'evaluaciones', 'planes', 'sesiones'].map((tab) => (
            <button key={tab} onClick={() => setPestanaActiva(tab)} className={`px-6 py-3 text-sm font-bold uppercase tracking-wider transition-all border-b-2 ${pestanaActiva === tab ? bgPestanaActiva : bgPestanaInactiva}`}>
              {tab === 'resumen' && '📋 Resumen'}
              {tab === 'evaluaciones' && `📊 Evaluaciones (${evaluaciones.length})`}
              {tab === 'planes' && '📝 Planes'}
              {tab === 'sesiones' && '🔄 Sesiones'}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {pestanaActiva === 'resumen' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`${bgTarjeta} p-5 rounded-2xl border col-span-2`}>
                <h3 className={`text-xs font-black uppercase tracking-wider text-[#22d3ee] mb-2`}>Motivo de consulta</h3>
                <p className={`text-sm ${textoPrincipal}`}>{paciente.motivo_de_visita || 'No registrado'}</p>
              </div>
              <div className={`${bgTarjeta} p-5 rounded-2xl border space-y-4`}>
                <div><h4 className={`text-[10px] font-black uppercase tracking-wider text-gray-400`}>Medicamentos</h4><p className={`text-sm ${textoPrincipal}`}>{paciente.antecedentes_medicos || 'No registrados'}</p></div>
                <div><h4 className={`text-[10px] font-black uppercase tracking-wider text-gray-400`}>Alergias</h4><p className={`text-sm ${textoPrincipal}`}>{paciente.alergias || 'No registradas'}</p></div>
              </div>
              <div className={`${bgTarjeta} p-5 rounded-2xl border col-span-full`}>
                <h3 className={`text-xs font-black uppercase tracking-wider text-[#22d3ee] mb-4`}>📅 Línea de tiempo visual</h3>
                <div className="relative pl-6 border-l-2 border-[#22d3ee] space-y-4">
                  <div className="relative"><div className="absolute -left-8 top-1 w-4 h-4 rounded-full bg-[#22d3ee] border-2 border-[#0a141d]"></div><div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4"><span className="text-xs font-mono text-gray-400">{new Date(paciente.created_at).toLocaleDateString()}</span><span className={`text-sm font-medium ${textoPrincipal}`}>Fecha de apertura</span></div></div>
                  {evaluaciones.slice(0, 3).map((ev) => (
                    <div key={ev.id} className="relative"><div className="absolute -left-8 top-1 w-4 h-4 rounded-full bg-purple-400 border-2 border-[#0a141d]"></div><div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4"><span className="text-xs font-mono text-gray-400">{new Date(ev.created_at).toLocaleDateString()}</span><span className={`text-sm font-medium ${textoPrincipal}`}>Evaluación postural</span><span className="text-[10px] text-purple-400">Regiones: {(ev.regiones || []).join(', ')}</span></div></div>
                  ))}
                  <div className="relative opacity-50"><div className="absolute -left-8 top-1 w-4 h-4 rounded-full bg-gray-500 border-2 border-[#0a141d]"></div><div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4"><span className="text-xs font-mono text-gray-400">—</span><span className={`text-sm font-medium ${textoPrincipal} text-gray-500`}>Próximas evaluaciones...</span></div></div>
                </div>
              </div>
            </div>
          )}

          {pestanaActiva === 'evaluaciones' && (
            <div className={`${bgTarjeta} p-5 rounded-2xl border`}>
              <h3 className={`text-sm font-black uppercase tracking-wider text-[#22d3ee] mb-4`}>📋 Lista de Evaluaciones</h3>
              {cargandoEval ? (
                <p className="text-gray-400 text-center py-4">Cargando evaluaciones...</p>
              ) : evaluaciones.length === 0 ? (
                <div className="text-center py-8"><p className="text-gray-400">No hay evaluaciones registradas.</p><Link to={`/clinica/evaluacion/${paciente.id}`} className="mt-4 inline-block px-4 py-2 bg-[#22d3ee]/20 text-[#22d3ee] font-bold rounded-xl text-xs hover:bg-[#22d3ee] hover:text-black transition-all">+ Crear primera evaluación</Link></div>
              ) : (
                <div className="space-y-3">
                  {evaluaciones.map((ev) => {
                    const estado = ev.estado || 'borrador';
                    let estadoColor = 'bg-gray-500/20 text-gray-400', estadoTexto = 'Borrador';
                    if (estado === 'pendiente') { estadoColor = 'bg-yellow-500/20 text-yellow-400'; estadoTexto = 'Pendiente'; }
                    if (estado === 'aprobado') { estadoColor = 'bg-green-500/20 text-green-400'; estadoTexto = 'Aprobado'; }
                    if (estado === 'rechazado') { estadoColor = 'bg-red-500/20 text-red-400'; estadoTexto = 'Rechazado'; }
                    const puedeEditar = estado === 'borrador' || estado === 'rechazado';
                    const esDirector = usuarioRol === 1 || usuarioRol === 7;

                    return (
                      <div key={ev.id} className={`p-4 rounded-xl border ${temaOscuro ? 'border-gray-700' : 'border-gray-200'} hover:border-[#22d3ee]/40 transition-all`}>
                        <div className="flex flex-wrap justify-between items-start gap-2">
                          <div>
                            <div className="flex items-center gap-3">
                              <p className={`text-sm font-bold ${textoPrincipal}`}>{new Date(ev.created_at).toLocaleDateString()} - {new Date(ev.created_at).toLocaleTimeString()}</p>
                              <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${estadoColor}`}>{estadoTexto}</span>
                            </div>
                            <p className="text-xs text-gray-400">Regiones: {(ev.regiones || []).join(', ') || 'No especificadas'}</p>
                            {ev.analisis_ia && <p className="text-xs text-purple-400 mt-1 truncate max-w-md">🤖 {ev.analisis_ia.substring(0, 100)}...</p>}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {puedeEditar && (
                              <button onClick={() => navigate(`/clinica/evaluacion/${ev.paciente_id}?evaluacion_id=${ev.id}`)} className="px-3 py-1 bg-[#22d3ee]/20 text-[#22d3ee] font-bold rounded-lg text-xs hover:bg-[#22d3ee] hover:text-black transition-all">✏️ Continuar</button>
                            )}
                            <button onClick={() => generarInformeDesdeEvaluacion(ev.id)} disabled={generandoInforme === ev.id} className="px-3 py-1 bg-blue-500/20 text-blue-400 font-bold rounded-lg text-xs hover:bg-blue-500 hover:text-white transition-all disabled:opacity-50">{generandoInforme === ev.id ? 'Generando...' : '📄 Informe'}</button>
                            {esDirector && estado === 'pendiente' && (
                              <>
                                <button onClick={() => cambiarEstadoEvaluacion(ev.id, 'aprobado')} className="px-3 py-1 bg-green-500/20 text-green-400 font-bold rounded-lg text-xs hover:bg-green-500 hover:text-white transition-all">✅ Aprobar</button>
                                <button onClick={() => cambiarEstadoEvaluacion(ev.id, 'rechazado')} className="px-3 py-1 bg-red-500/20 text-red-400 font-bold rounded-lg text-xs hover:bg-red-500 hover:text-white transition-all">❌ Rechazar</button>
                              </>
                            )}
                            {estado === 'pendiente' && !esDirector && (
                              <button className="px-3 py-1 bg-yellow-500/20 text-yellow-400 font-bold rounded-lg text-xs cursor-default">⏳ En revisión</button>
                            )}
                            {estado === 'aprobado' && (
                              <button className="px-3 py-1 bg-green-500/20 text-green-400 font-bold rounded-lg text-xs cursor-default">✅ Aprobado</button>
                            )}
                            {puedeEditar && (
                              <button onClick={() => { if (confirm('¿Eliminar esta evaluación?')) { supabase.from('evaluaciones').delete().eq('id', ev.id).then(() => { alert('Evaluación eliminada.'); cargarEvaluaciones(id); }); } }} className="px-3 py-1 bg-red-500/20 text-red-400 font-bold rounded-lg text-xs hover:bg-red-500 hover:text-white transition-all">Eliminar</button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {pestanaActiva === 'planes' && (
            <div className={`${bgTarjeta} p-10 rounded-2xl border text-center`}>
              <p className="text-gray-400">Planes de tratamiento se mostrarán aquí.</p>
              <p className="text-sm text-gray-500 mt-2">(Módulo en construcción – Fase 4)</p>
            </div>
          )}

          {pestanaActiva === 'sesiones' && (
            <div className={`${bgTarjeta} p-10 rounded-2xl border text-center`}>
              <p className="text-gray-400">Historial de sesiones del paciente.</p>
              <p className="text-sm text-gray-500 mt-2">(Módulo en construcción – Fase 4)</p>
            </div>
          )}
        </div>

        <div className="mt-8">
          <button onClick={() => navigate('/clinica/pacientes')} className="px-6 py-2 bg-gray-600 text-white font-bold rounded-xl text-sm hover:bg-gray-700 transition-all">← Volver a la lista</button>
        </div>
      </div>
    </div>
  );
}