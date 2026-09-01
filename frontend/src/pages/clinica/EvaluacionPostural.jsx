import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import BodyChartContainer from '../../components/clinica/BodyChart/BodyChartContainer';
import { RANGOS_ROM, TESTS_POR_REGION } from '../../components/clinica/BodyChart/regionesConfig';
import AnamnesisForm from '../../components/clinica/Formularios/AnamnesisForm';

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function EvaluacionPostural({ temaOscuro }) {
  const { pacienteId } = useParams();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paso, setPaso] = useState(1);
  const [guardando, setGuardando] = useState(false);
  const [microfonoActivo, setMicrofonoActivo] = useState(false);
  const [vistaDetalle, setVistaDetalle] = useState(null);
  const [generandoInforme, setGenerandoInforme] = useState(false);
  const [tipoFormulario, setTipoFormulario] = useState(['general']);

  const [evaluacion, setEvaluacion] = useState({
    paciente_id: pacienteId,
    edad: '',
    ocupacion: '',
    sexo: '',
    estado_civil: '',
    telefono: '',
    direccion: '',
    motivo_consulta: '',
    tiempo_evolucion: '',
    mecanismo_lesion: '',
    antecedentes_medicos: '',
    alergias: '',
    medicamentos: '',
    cirugias_previas: '',
    tipo_dolor: [],
    intensidad_reposo: 0,
    intensidad_actividad: 0,
    factores_agravantes: '',
    factores_atenuantes: '',
    sintomas_asociados: '',
    regiones: [],
    datos_regiones: {},
    analisis_ia: '',
  });

  // ========== DICTADO DE VOZ ==========
  const [escuchando, setEscuchando] = useState(false);
  const [campoActivo, setCampoActivo] = useState(null);
  const recognitionRef = useRef(null);
  const inputRefs = useRef({});

  useEffect(() => {
    const pedirPermiso = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        setMicrofonoActivo(true);
      } catch (err) {
        console.warn('Permiso de micrófono denegado:', err);
        setMicrofonoActivo(false);
      }
    };
    pedirPermiso();

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'es-ES';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setEscuchando(true);
      recognition.onend = () => setEscuchando(false);
      recognition.onerror = (event) => {
        console.error(event.error);
        setEscuchando(false);
        if (event.error === 'not-allowed') {
          alert('Por favor, permite el acceso al micrófono en la configuración del navegador.');
        } else if (event.error !== 'no-speech') {
          alert('Error al escuchar: ' + event.error + '. Intenta de nuevo.');
        }
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (campoActivo) {
          if (campoActivo.startsWith('especial_')) {
            handleInputChange(campoActivo, transcript);
          } else if (campoActivo.startsWith('obs_') || campoActivo.startsWith('notas_')) {
            const partes = campoActivo.split('_');
            const tipo = partes[0];
            const region = partes.slice(1).join('_');
            const campoReal = tipo === 'obs' ? 'observaciones' : 'notas';
            handleRegionDataChange(region, campoReal, transcript);
          } else {
            handleInputChange(campoActivo, transcript);
          }
          setEscuchando(false);
          setCampoActivo(null);
        }
      };

      recognitionRef.current = recognition;
    } else {
      alert('Reconocimiento de voz no disponible en este navegador. Usa Chrome o Edge.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const iniciarDictado = (campo) => {
    if (!microfonoActivo) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          stream.getTracks().forEach(track => track.stop());
          setMicrofonoActivo(true);
          iniciarDictado(campo);
        })
        .catch(() => {
          alert('No se pudo acceder al micrófono. Por favor, permite el acceso en la configuración del navegador.');
        });
      return;
    }

    if (!recognitionRef.current) {
      alert('Reconocimiento de voz no disponible.');
      return;
    }

    if (escuchando) {
      recognitionRef.current.stop();
      setEscuchando(false);
      return;
    }

    setCampoActivo(campo);
    recognitionRef.current.start();
  };

  // ========== CARGAR PACIENTE ==========
  useEffect(() => {
    const cargarPaciente = async () => {
      if (!pacienteId) { setLoading(false); return; }
      const { data, error } = await supabase
        .from('pacientes')
        .select('*')
        .eq('id', pacienteId)
        .single();
      if (!error && data) {
        setPaciente(data);
        if (data.fecha_nacimiento) {
          const edad = new Date().getFullYear() - new Date(data.fecha_nacimiento).getFullYear();
          setEvaluacion(prev => ({ ...prev, edad: edad.toString() }));
        }
      }
      setLoading(false);
    };
    cargarPaciente();
  }, [pacienteId]);

  // ========== MANEJAR CAMBIOS ==========
  const handleInputChange = (campo, valor) => {
    setEvaluacion(prev => ({ ...prev, [campo]: valor }));
  };

  const handleRegionDataChange = (region, campo, valor) => {
    setEvaluacion(prev => ({
      ...prev,
      datos_regiones: {
        ...prev.datos_regiones,
        [region]: {
          ...prev.datos_regiones[region],
          [campo]: valor,
        },
      },
    }));
  };

  const toggleRegion = (regionId) => {
    setEvaluacion(prev => {
      const nuevasRegiones = prev.regiones.includes(regionId)
        ? prev.regiones.filter(r => r !== regionId)
        : [...prev.regiones, regionId];
      const nuevosDatos = { ...prev.datos_regiones };
      if (!nuevasRegiones.includes(regionId)) {
        delete nuevosDatos[regionId];
      }
      return { ...prev, regiones: nuevasRegiones, datos_regiones: nuevosDatos };
    });
  };

  // ============================================================
  // GUARDAR EVALUACIÓN (con campos extra)
  // ============================================================
  const guardarEvaluacion = async () => {
    if (evaluacion.regiones.length === 0) {
      alert('Selecciona al menos una región afectada.');
      return;
    }
    setGuardando(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');
      const { data: perfil } = await supabase
        .from('profiles')
        .select('centro_id')
        .eq('id', user.id)
        .single();

      const camposEspeciales = {};
      Object.keys(evaluacion).forEach(key => {
        if (key.startsWith('especial_')) {
          camposEspeciales[key] = evaluacion[key];
        }
      });

      const datos = {
        paciente_id: pacienteId,
        user_id: user.id,
        centro_id: perfil?.centro_id || null,
        edad: evaluacion.edad ? parseInt(evaluacion.edad) : null,
        ocupacion: evaluacion.ocupacion,
        sexo: evaluacion.sexo,
        estado_civil: evaluacion.estado_civil,
        telefono: evaluacion.telefono,
        direccion: evaluacion.direccion,
        motivo_consulta: evaluacion.motivo_consulta,
        tiempo_evolucion: evaluacion.tiempo_evolucion,
        mecanismo_lesion: evaluacion.mecanismo_lesion,
        antecedentes_medicos: evaluacion.antecedentes_medicos,
        alergias: evaluacion.alergias,
        medicamentos: evaluacion.medicamentos,
        cirugias_previas: evaluacion.cirugias_previas,
        tipo_dolor: evaluacion.tipo_dolor,
        intensidad_reposo: evaluacion.intensidad_reposo,
        intensidad_actividad: evaluacion.intensidad_actividad,
        factores_agravantes: evaluacion.factores_agravantes,
        factores_atenuantes: evaluacion.factores_atenuantes,
        sintomas_asociados: evaluacion.sintomas_asociados,
        regiones: evaluacion.regiones,
        datos_regiones: evaluacion.datos_regiones,
        analisis_ia: evaluacion.analisis_ia || null,
        campos_extra: camposEspeciales,
        tipo_formulario: tipoFormulario.join(','),
      };

      const { error } = await supabase
        .from('evaluaciones')
        .insert([datos]);

      if (error) throw error;
      alert('✅ Evaluación guardada correctamente.');
      navigate(`/clinica/pacientes/${pacienteId}`);
    } catch (error) {
      console.error(error);
      alert('Error al guardar: ' + error.message);
    } finally {
      setGuardando(false);
    }
  };

  // ============================================================
  // FUNCIÓN PARA FORMATEAR NOMBRES DE REGIONES
  // ============================================================
  const formatearNombreRegion = (nombre) => {
    const map = {
      'izq': 'Izquierda',
      'der': 'Derecha',
      'ant': 'Anterior',
      'post': 'Posterior',
      'inf': 'Inferior',
      'sup': 'Superior',
      'med': 'Medial',
      'lat': 'Lateral',
      'prox': 'Proximal',
      'dist': 'Distal'
    };
    let palabras = nombre.split('_');
    let resultado = palabras.map(p => {
      if (map[p]) return map[p];
      return p.charAt(0).toUpperCase() + p.slice(1);
    }).join(' ');
    return resultado;
  };

  // ============================================================
  // GENERAR INFORME (VERSIÓN DEFINITIVA CORREGIDA)
  // ============================================================
  const generarInforme = async () => {
    if (evaluacion.regiones.length === 0) {
      alert('No hay regiones seleccionadas para generar el informe.');
      return;
    }

    setGenerandoInforme(true);
    try {
      const { data: pacienteData } = await supabase
        .from('pacientes')
        .select('*')
        .eq('id', pacienteId)
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
          logoUrl = `/logo_centros/${perfil.centro_id}.png`;
        }
      }

      const nombrePaciente = pacienteData ? `${pacienteData.nombre} ${pacienteData.apellidos}` : 'Paciente';
      const fecha = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const hora = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      const usuario = perfil?.nombre_completo || 'Usuario';
      const regiones = evaluacion.regiones || [];
      const datosRegiones = evaluacion.datos_regiones || {};

      // ----- MAPEO DE REGIONES A CENTROIDES PARA PUNTOS ROJOS -----
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

      // ----- GENERACIÓN DE PUNTOS ROJOS -----
      const puntosHTML = regiones.map(r => {
        let coords = centroides[r];
        if (!coords) {
          const baseKey = r.split('_')[0];
          coords = centroides[baseKey];
        }
        if (!coords) coords = { cx: 100, cy: 100 };
        return `<circle cx="${coords.cx}" cy="${coords.cy}" r="5" fill="#ef4444" stroke="#fff" stroke-width="1.5"/>`;
      }).join('');

      // ----- SILUETA ANATÓMICA (path de VistaGeneral) -----
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

      const stickmanSVG = `
        <svg viewBox="0 0 200 320" width="180" height="288" xmlns="http://www.w3.org/2000/svg" style="max-width:200px; height:auto;">
          <defs>
            <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f8fafc"/>
              <stop offset="100%" stopColor="#e2e8f0"/>
            </linearGradient>
          </defs>
          <g fill="url(#bodyGrad)" stroke="#94a3b8" stroke-width="1.2" opacity="0.8">
            ${siluetaPaths}
          </g>
          ${puntosHTML}
        </svg>
      `;

      // ===== CONTENIDO HTML DEL INFORME =====
      const contenidoHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Informe Clínico - ${nombrePaciente}</title>
          <style>
            @page { size: A4; margin: 2.54cm 2.54cm 1.5cm 2.54cm; }
            * { box-sizing: border-box; }
            body {
              font-family: 'Calibri', 'Roboto', Arial, sans-serif;
              font-size: 11pt;
              line-height: 1.5;
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
              padding-bottom: 30px;
            }
            .encabezado {
              text-align: center;
              border-bottom: 2px solid #22d3ee;
              padding-bottom: 10px;
              margin-bottom: 20px;
              position: relative;
              min-height: 80px;
            }
            .encabezado .logo {
              max-width: 70px;
              max-height: 70px;
              float: left;
              margin-right: 15px;
            }
            .encabezado .logo-derecho {
              max-width: 60px;
              max-height: 60px;
              float: right;
              margin-left: 15px;
            }
            .encabezado .titulo {
              font-size: 18pt;
              font-weight: 700;
              color: #0f172a;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .encabezado .subtitulo {
              font-size: 10pt;
              color: #64748b;
            }
            .encabezado .datos {
              font-size: 9pt;
              color: #475569;
              margin-top: 5px;
            }
            .pie {
              text-align: center;
              font-size: 8pt;
              color: #94a3b8;
              border-top: 1px solid #e2e8f0;
              padding-top: 8px;
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
              opacity: 0.05;
              font-size: 80pt;
              font-weight: 900;
              color: #22d3ee;
              transform: rotate(-30deg);
              text-transform: uppercase;
              letter-spacing: 20px;
              user-select: none;
            }
            .marca-agua img { max-width: 300px; opacity: 0.10; }
            h1 {
              font-size: 16pt;
              font-weight: 700;
              color: #0f172a;
              border-left: 6px solid #22d3ee;
              padding-left: 12px;
              margin-top: 24px;
              margin-bottom: 12px;
              text-transform: uppercase;
              page-break-after: avoid;
            }
            h2 {
              font-size: 13pt;
              font-weight: 700;
              color: #1e293b;
              margin-top: 16px;
              margin-bottom: 8px;
              page-break-after: avoid;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 12px 0;
              font-size: 10pt;
              page-break-inside: avoid;
            }
            th, td {
              border: 1px solid #cbd5e1;
              padding: 6px 8px;
              text-align: left;
              vertical-align: top;
            }
            th { background-color: #f1f5f9; font-weight: 700; }
            ul, ol { padding-left: 20px; margin: 6px 0; page-break-inside: avoid; }
            li { margin-bottom: 2px; }
            .alerta {
              background-color: #fee2e2;
              border-left: 4px solid #ef4444;
              padding: 10px 14px;
              margin: 12px 0;
              border-radius: 4px;
              font-weight: 600;
            }
            .seccion { margin-bottom: 16px; }
            .clearfix::after { content: ""; clear: both; display: table; }
            .stickman-container {
              text-align: center;
              margin: 15px 0;
            }
            .stickman-container svg {
              max-width: 200px;
              height: auto;
            }
            @media print {
              .marca-agua { opacity: 0.04; }
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
                <tr><td>Edad</td><td>${evaluacion.edad || 'No registrado'}</td></tr>
                <tr><td>Sexo</td><td>${evaluacion.sexo || 'No registrado'}</td></tr>
                <tr><td>Ocupación</td><td>${evaluacion.ocupacion || 'No registrado'}</td></tr>
                <tr><td>Teléfono</td><td>${evaluacion.telefono || 'No registrado'}</td></tr>
                <tr><td>Dirección</td><td>${evaluacion.direccion || 'No registrado'}</td></tr>
              </table>

              <h1>2. Motivo de Consulta</h1>
              <p><strong>Motivo principal:</strong> ${evaluacion.motivo_consulta || 'No registrado'}</p>
              <p><strong>Tiempo de evolución:</strong> ${evaluacion.tiempo_evolucion || 'No registrado'}</p>
              <p><strong>Mecanismo de lesión:</strong> ${evaluacion.mecanismo_lesion || 'No registrado'}</p>

              <h1>3. Antecedentes</h1>
              <table>
                <tr><th>Antecedentes médicos</th><td>${evaluacion.antecedentes_medicos || 'No registrado'}</td></tr>
                <tr><th>Alergias</th><td>${evaluacion.alergias || 'No registrado'}</td></tr>
                <tr><th>Medicamentos actuales</th><td>${evaluacion.medicamentos || 'No registrado'}</td></tr>
                <tr><th>Cirugías previas</th><td>${evaluacion.cirugias_previas || 'No registrado'}</td></tr>
              </table>
            </div>
            <div class="pie">
              Documento Clínico Confidencial - ${centroNombre} - Pág. 1
            </div>
          </div>

          <!-- PÁGINA 2 -->
          <div class="pagina">
            <div class="contenido">
              <h1>4. Evaluación del Dolor</h1>
              <p><strong>Tipo de dolor:</strong> ${(evaluacion.tipo_dolor || []).join(', ') || 'No registrado'}</p>
              <table>
                <tr><th>Intensidad en reposo (EVA)</th><td>${evaluacion.intensidad_reposo || 0} / 10</td></tr>
                <tr><th>Intensidad en actividad (EVA)</th><td>${evaluacion.intensidad_actividad || 0} / 10</td></tr>
                <tr><th>Factores agravantes</th><td>${evaluacion.factores_agravantes || 'No registrado'}</td></tr>
                <tr><th>Factores atenuantes</th><td>${evaluacion.factores_atenuantes || 'No registrado'}</td></tr>
                <tr><th>Síntomas asociados</th><td>${evaluacion.sintomas_asociados || 'No registrado'}</td></tr>
              </table>

              <h1>5. Regiones Afectadas</h1>
              <ul>
                ${regiones.map(r => `<li>${formatearNombreRegion(r)}</li>`).join('')}
              </ul>

              <div class="stickman-container">
                <h2>Mapa corporal del dolor</h2>
                ${stickmanSVG}
                <p style="font-size: 8pt; color: #64748b;">Las zonas en rojo indican las regiones afectadas</p>
              </div>

              <h1>6. Evaluación por Región</h1>
              ${regiones.map(region => {
                const data = datosRegiones[region] || {};
                return `
                  <div class="seccion">
                    <h2>${formatearNombreRegion(region)}</h2>
                    <table>
                      <tr><th>EVA</th><td>${data.eva !== undefined ? data.eva + '/10' : 'No registrado'}</td></tr>
                      <tr><th>ROM (grados)</th><td>${data.rom || 'No registrado'}</td></tr>
                      <tr><th>Tests realizados</th><td>${(data.tests || []).join(', ') || 'Ninguno'}</td></tr>
                      <tr><th>Observaciones</th><td>${data.observaciones || 'Ninguna'}</td></tr>
                      <tr><th>Notas adicionales</th><td>${data.notas || 'Ninguna'}</td></tr>
                    </table>
                  </div>
                `;
              }).join('')}
            </div>
            <div class="pie">
              Documento Clínico Confidencial - ${centroNombre} - Pág. 2
            </div>
          </div>

          <!-- PÁGINA 3 -->
          <div class="pagina">
            <div class="contenido">
              <h1>7. Análisis Clínico (IA)</h1>
              ${evaluacion.analisis_ia ? `<p>${evaluacion.analisis_ia}</p>` : '<p>No se generó análisis con IA.</p>'}

              <h1>8. Alerta de Seguridad</h1>
              <div class="alerta">
                ⚠️ Este informe contiene información confidencial del paciente. Solo debe ser utilizado por personal autorizado.
              </div>

              <h1>9. Datos de Generación</h1>
              <table>
                <tr><th>Informe generado por</th><td>${usuario}</td></tr>
                <tr><th>Fecha de generación</th><td>${fecha}</td></tr>
                <tr><th>Hora de generación</th><td>${hora}</td></tr>
                <tr><th>Centro</th><td>${centroNombre}</td></tr>
              </table>

              <div style="text-align: center; margin-top: 40px; font-size: 10pt; color: #64748b;">
                --- Fin del informe ---
              </div>
            </div>
            <div class="pie">
              Documento Clínico Confidencial - ${centroNombre} - Pág. 3
            </div>
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
      setGenerandoInforme(false);
    }
  };

  // ========== ESTILOS ==========
  const bgPrincipal = temaOscuro ? 'bg-[#0a141d]' : 'bg-[#e2e8f0]';
  const textoPrincipal = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const bgTarjeta = temaOscuro ? 'bg-[#0a141d] border-gray-800' : 'bg-white border-gray-200';
  const bgInput = temaOscuro ? 'bg-black/20 border-white/10 text-white' : 'bg-gray-100 border-gray-300 text-[#0f172a]';

  if (loading) {
    return <div className={`min-h-screen ${bgPrincipal} flex items-center justify-center`}><div className="animate-spin rounded-full h-10 w-10 border-4 border-[#22d3ee] border-t-transparent"></div></div>;
  }

  return (
    <div className={`min-h-screen ${bgPrincipal} p-4 md:p-8 transition-colors duration-500`}>
      <div className="max-w-5xl mx-auto">
        <h1 className={`text-3xl font-black tracking-tight ${textoPrincipal} mb-2`}>
          {paciente ? `Evaluación - ${paciente.nombre} ${paciente.apellidos}` : 'Nueva Evaluación'}
        </h1>
        <div className="flex justify-between items-center mb-4">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Paso {paso} de 3</p>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold uppercase ${microfonoActivo ? 'text-green-400' : 'text-yellow-400'}`}>
              {microfonoActivo ? '🎤 Micrófono activo' : '🔇 Micrófono inactivo'}
            </span>
          </div>
        </div>
        <div className="w-full h-1.5 bg-gray-700 rounded-full mb-3">
          <div className="h-full bg-[#22d3ee] rounded-full transition-all duration-500" style={{ width: `${(paso / 3) * 100}%` }} />
        </div>
        <div className="flex justify-between text-[8px] text-gray-500 uppercase tracking-wider mb-4">
          <span className={paso >= 1 ? 'text-[#22d3ee]' : ''}>1. Anamnesis</span>
          <span className={paso >= 2 ? 'text-[#22d3ee]' : ''}>2. BodyChart</span>
          <span className={paso >= 3 ? 'text-[#22d3ee]' : ''}>3. Evaluación</span>
        </div>

        {paso === 1 && (
          <div className={`${bgTarjeta} p-6 rounded-3xl border`}>
            <h2 className={`text-2xl font-black ${textoPrincipal} mb-4`}>📋 Anamnesis</h2>
            <AnamnesisForm
              evaluacion={evaluacion}
              handleInputChange={handleInputChange}
              iniciarDictado={iniciarDictado}
              escuchando={escuchando}
              campoActivo={campoActivo}
              temaOscuro={temaOscuro}
              tipoFormulario={tipoFormulario}
              setTipoFormulario={setTipoFormulario}
              setPaso={setPaso}
            />
          </div>
        )}

        {paso === 2 && (
          <div className={`${bgTarjeta} p-6 rounded-3xl border`}>
            <h2 className={`text-xl font-black ${textoPrincipal} mb-4`}>📍 Selecciona las regiones afectadas</h2>
            <p className={`text-sm ${textoPrincipal} opacity-70 mb-4`}>
              Haz clic en una zona general (🔍) para ampliarla, o directamente en los puntos para seleccionar.
            </p>
            <BodyChartContainer
              regionesSeleccionadas={evaluacion.regiones}
              onRegionToggle={toggleRegion}
              temaOscuro={temaOscuro}
              vistaDetalle={vistaDetalle}
              setVistaDetalle={setVistaDetalle}
            />
            <div className="flex justify-between mt-6">
              <button onClick={() => setPaso(1)} className="px-6 py-3 bg-gray-600 text-white font-black rounded-xl text-sm hover:opacity-80 transition-all">← Anterior</button>
              <button onClick={() => { if (evaluacion.regiones.length === 0) { alert('Selecciona al menos una región afectada.'); return; } setPaso(3); }} className="px-6 py-3 bg-[#22d3ee] text-black font-black rounded-xl text-sm hover:scale-105 transition-all">Siguiente →</button>
            </div>
          </div>
        )}

        {paso === 3 && (
          <div className={`${bgTarjeta} p-6 rounded-3xl border`}>
            <h2 className={`text-xl font-black ${textoPrincipal} mb-4`}>📊 Evaluación por región</h2>
            {evaluacion.regiones.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No hay regiones seleccionadas.</p>
            ) : (
              <div className="space-y-8 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                {evaluacion.regiones.map((region) => {
                  const data = evaluacion.datos_regiones[region] || {};
                  const tests = TESTS_POR_REGION[region] || ['Test no específico'];
                  const rangos = RANGOS_ROM[region] || {};
                  return (
                    <div key={region} className={`p-5 rounded-2xl border ${temaOscuro ? 'border-gray-700' : 'border-gray-200'} shadow-sm`}>
                      <h3 className={`text-lg font-bold ${textoPrincipal} capitalize mb-3`}>{region.replace('_', ' ')}</h3>

                      <div className="mb-4">
                        <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Dolor (EVA 0-10)</label>
                        <div className="flex flex-wrap gap-1 mb-1">
                          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                            <button key={num} onClick={() => handleRegionDataChange(region, 'eva', num)} className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${data.eva === num ? 'bg-[#22d3ee] text-black scale-110 shadow-lg shadow-[#22d3ee]/30' : `${temaOscuro ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'} hover:scale-110`}`}>{num}</button>
                          ))}
                        </div>
                        <div className="flex justify-between text-xs text-gray-400"><span>Sin dolor</span><span>Máximo dolor</span></div>
                      </div>

                      <div className="mb-4">
                        <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>ROM (grados)</label>
                        <div className="relative">
                          <input type="number" value={data.rom || ''} onChange={(e) => handleRegionDataChange(region, 'rom', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`} placeholder="Ej: 120°" />
                        </div>
                        {Object.keys(rangos).length > 0 && (
                          <div className="mt-1 text-xs text-gray-400 flex flex-wrap gap-2">
                            <span className="font-bold">Rango normal:</span>
                            {Object.entries(rangos).map(([mov, rango]) => (
                              <span key={mov} className="bg-black/10 px-2 py-0.5 rounded-full">{mov.replace('_', ' ')}: {rango}</span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mb-4">
                        <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Tests especiales</label>
                        <div className="grid grid-cols-2 gap-2">
                          {tests.map((test) => (
                            <label key={test} className="flex items-center gap-2 text-sm">
                              <input type="checkbox" checked={(data.tests || []).includes(test)} onChange={(e) => {
                                const current = data.tests || [];
                                const nuevos = e.target.checked ? [...current, test] : current.filter(t => t !== test);
                                handleRegionDataChange(region, 'tests', nuevos);
                              }} className="accent-[#22d3ee] w-4 h-4" />
                              <span className={`${textoPrincipal} text-xs`}>{test}</span>
                            </label>
                          ))}
                        </div>
                        <div className="relative mt-2">
                          <input type="text" placeholder="Observaciones del test..." value={data.observaciones || ''} onChange={(e) => handleRegionDataChange(region, 'observaciones', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm pr-10`} ref={(el) => { if (el) inputRefs.current[`obs_${region}`] = el; }} />
                          <button onClick={() => iniciarDictado(`obs_${region}`)} className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${escuchando && campoActivo === `obs_${region}` ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all text-xs`}>🎙️</button>
                        </div>
                      </div>

                      <div className="relative">
                        <input type="text" placeholder="Notas adicionales..." value={data.notas || ''} onChange={(e) => handleRegionDataChange(region, 'notas', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm pr-10`} ref={(el) => { if (el) inputRefs.current[`notas_${region}`] = el; }} />
                        <button onClick={() => iniciarDictado(`notas_${region}`)} className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${escuchando && campoActivo === `notas_${region}` ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all text-xs`}>🎙️</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="flex justify-between mt-6">
              <button onClick={() => setPaso(2)} className="px-6 py-3 bg-gray-600 text-white font-black rounded-xl text-sm hover:opacity-80 transition-all">← Anterior</button>
              <div className="flex gap-3">
                <button onClick={generarInforme} disabled={generandoInforme} className="px-6 py-3 bg-blue-500 text-white font-black rounded-xl text-sm hover:scale-105 transition-all disabled:opacity-50">
                  {generandoInforme ? 'Generando...' : '📄 Generar Informe'}
                </button>
                <button onClick={guardarEvaluacion} disabled={guardando} className="px-6 py-3 bg-green-500 text-white font-black rounded-xl text-sm hover:scale-105 transition-all disabled:opacity-50">
                  {guardando ? 'Guardando...' : '💾 Guardar Evaluación'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}