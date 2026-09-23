// src/utils/generarInforme.js
import { supabase } from '../lib/supabaseClient';

export async function generarInformeDesdeEvaluacion(evaluacionId) {
  const { data: evaluacion, error: evalError } = await supabase
    .from('evaluaciones')
    .select('*')
    .eq('id', evaluacionId)
    .single();
  if (evalError) throw evalError;
  if (!evaluacion) throw new Error('Evaluación no encontrada.');

  const { data: pacienteData } = await supabase
    .from('pacientes')
    .select('*')
    .eq('id', evaluacion.paciente_id)
    .single();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: perfil } = await supabase
    .from('profiles')
    .select('nombre_completo, centro_id, titulo_profesional, numero_colegiatura, dni, tipo_profesional, tipo_documento, registro_interno')
    .eq('id', user.id)
    .single();

  // ============================================================
  // DETECTAR TIPO DE PROFESIONAL Y TIPO DE CENTRO
  // ============================================================
  const tipoProfesional = perfil?.tipo_profesional || 'licenciado';
  const esLicenciado = tipoProfesional === 'licenciado';
  const firmaComoTecnico = !esLicenciado;

  let centroNombre = 'Centro CJ';
  let centroTelefono = '';
  let centroDireccion = '';
  let logoUrl = '';
  let tipoCentro = 'gimnasio_terapeutico';

  if (perfil?.centro_id) {
    const { data: centro } = await supabase
      .from('centros')
      .select('nombre, logo_url, telefono, direccion, tipo_centro')
      .eq('id', perfil.centro_id)
      .single();
    if (centro) {
      centroNombre = centro.nombre || 'Centro CJ';
      centroTelefono = centro.telefono || '';
      centroDireccion = centro.direccion || '';
      logoUrl = centro.logo_url || '';
      tipoCentro = centro.tipo_centro || 'gimnasio_terapeutico';
    }
    if (!logoUrl) {
      const publicLogo = `/logo_centros/${perfil.centro_id}.png`;
      try {
        const response = await fetch(publicLogo);
        if (response.ok) logoUrl = publicLogo;
      } catch (e) {}
    }
  }

  const esGimnasioTerapeutico = tipoCentro === 'gimnasio_terapeutico';

  // ============================================================
  // TÍTULOS DINÁMICOS SEGÚN TIPO
  // ============================================================
  const tituloDocumento = firmaComoTecnico
    ? 'Evaluación Funcional y Plan de Ejercicios'
    : 'Informe de Evaluación Clínica';

  const seccion1Titulo = firmaComoTecnico ? '1. Datos del Usuario' : '1. Datos Generales';
  const seccion8Titulo = firmaComoTecnico
    ? '8. Plan de Ejercicios Terapéuticos'
    : '8. Plan de Tratamiento Fisioterapéutico';

  const subtituloTipoCentro = esGimnasioTerapeutico
    ? 'Gimnasio Terapéutico'
    : 'Centro Fisioterapéutico';

  const nombreCentroConTipo = centroNombre.toLowerCase().includes(subtituloTipoCentro.toLowerCase())
    ? centroNombre
    : `${centroNombre} (${subtituloTipoCentro})`;

  // ============================================================
  // DATOS DEL PROFESIONAL Y FIRMA
  // ============================================================
  const nombrePaciente = pacienteData ? `${pacienteData.nombre} ${pacienteData.apellidos}` : 'Paciente';
  const fecha = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const hora = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  const usuario = perfil?.nombre_completo || 'Usuario';
  const titulo = perfil?.titulo_profesional || '';
  const colegiatura = perfil?.numero_colegiatura || '';
  const dni = perfil?.dni || '';
  const registroInterno = perfil?.registro_interno || '';

  let credenciales = '';
  if (firmaComoTecnico) {
    if (dni) credenciales = `Técnico en Fisioterapia y Rehabilitación — DNI: ${dni}`;
    else if (registroInterno) credenciales = `Técnico en Fisioterapia — Registro Interno: ${registroInterno}`;
    else credenciales = titulo || 'Técnico en Fisioterapia';
  } else {
    if (colegiatura) credenciales = `Lic. T.M. Fisioterapia — C.T.M.P. N° ${colegiatura}`;
    else if (titulo) credenciales = titulo;
  }

  const regiones = evaluacion.regiones || [];
  const datosRegiones = evaluacion.datos_regiones || {};

  // ============================================================
  // CORRECTOR DE TYPOS DE LA IA
  // ============================================================
  const corregirTypos = (t) => (t || '')
    .replace(/Estimamientos/gi, 'Estiramientos')
    .replace(/estimamiento/gi, 'estiramiento')
    .replace(/Susponder/gi, 'Suspender')
    .replace(/susponder/gi, 'suspender')
    .replace(/Lumbalgia mecanica/gi, 'Lumbalgia mecánica')
    .replace(/Aplicaciòn/gi, 'Aplicación')
    .replace(/aplicaciòn/gi, 'aplicación');

  const recomendaciones = corregirTypos(datosRegiones._recomendaciones || '');
  const alertas = corregirTypos(datosRegiones._alertas || '');
  const planTratamiento = corregirTypos(datosRegiones._plan_tratamiento || '');
  const hijos = datosRegiones._hijos || [];
  const contactosEmergencia = datosRegiones._contactos_emergencia || [];
  const signosVitales = datosRegiones._signos_vitales || {};
  const familiares = datosRegiones._antecedentes_familiares || [];
  const familiaresOtros = datosRegiones._antecedentes_familiares_otros || '';
  const habitos = datosRegiones._habitos || {};
  const actividadFisica = datosRegiones._actividad_fisica || '';
  const nivelDeportivo = datosRegiones._nivel_deportivo || '';
  const deportePracticado = datosRegiones._deporte_practicado || '';
  const calidadSuenio = datosRegiones._calidad_suenio;
  const estresPercibido = datosRegiones._estres_percibido || '';
  const gineco = datosRegiones._gineco_obstetricos || {};
  const uro = datosRegiones._urologicos || {};

  // ============================================================
  // FORMATEAR NOMBRES DE REGIONES
  // ============================================================
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
      'lumbar': 'Lumbar', 'cervical': 'Cervical', 'dorsal': 'Dorsal', 'columna_dorsal': 'Columna Dorsal', 'columna': 'Columna',
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
      'ilion': 'Ilion', 'isquion': 'Isquion', 'gluteo': 'Glúteo',
      'coxis': 'Coxis', 'carpo': 'Carpo', 'metacarpo': 'Metacarpo',
      'falanges_prox': 'Falanges Proximales', 'falanges_dist': 'Falanges Distales',
      'pulgar': 'Pulgar', 'eminencia_tenar': 'Eminencia Tenar',
      'retropie_calcaneo': 'Retropié', 'mediopie_tarso': 'Mediopié',
      'antepie_metatarso': 'Antepié', 'falanges_lateral': 'Dedos del Pie',
      'talon_plantar': 'Talón', 'mediopie_plantar': 'Arco Plantar',
      'metatarsianos_plantar': 'Metatarsianos', 'falanges_plantar': 'Dedos del Pie',
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

  // ============================================================
  // TABLA POR ZONAS (COLUMNAS)
  // ============================================================
  const zonas = {
    'Cabeza y Cuello': ['cabeza', 'cuello', 'nuca', 'cervical'],
    'Columna': ['lumbar', 'dorsal', 'columna'],
    'Tronco': ['torax', 'pecho', 'espalda', 'abdomen', 'clavicula', 'trapecio', 'escapula'],
    'Miembro Superior': ['hombro', 'brazo', 'antebrazo', 'mano', 'muneca', 'codo', 'biceps', 'triceps', 'olecranon', 'deltoides', 'manguito', 'acromion', 'carpo', 'metacarpo', 'falanges_prox', 'falanges_dist', 'pulgar', 'eminencia_tenar'],
    'Miembro Inferior': ['pierna', 'muslo', 'rodilla', 'rotula', 'gemelo', 'tobillo', 'pie', 'talon', 'cuadriceps', 'isquiotibial', 'soleo', 'tendon_aquiles', 'tibial', 'poplitea', 'lca', 'lcp', 'lcm', 'lcl', 'menisco', 'retropie_calcaneo', 'mediopie_tarso', 'antepie_metatarso', 'falanges_lateral', 'talon_plantar', 'mediopie_plantar', 'metatarsianos_plantar', 'falanges_plantar'],
    'Pelvis': ['pelvis', 'cadera', 'sacro', 'pubis', 'gluteo', 'ilion', 'isquion', 'coxis'],
    'Otras': [],
  };
  const zonasKeys = Object.keys(zonas);
  const regionesPorZona = {};
  zonasKeys.forEach(z => regionesPorZona[z] = []);
  regiones.forEach(r => {
    let asignada = false;
    for (const [zona, keywords] of Object.entries(zonas)) {
      if (zona === 'Otras') continue;
      if (keywords.some(k => r.includes(k))) {
        regionesPorZona[zona].push(r);
        asignada = true;
        break;
      }
    }
    if (!asignada) regionesPorZona['Otras'].push(r);
  });

  const zonasConContenido = zonasKeys.filter(z => regionesPorZona[z].length > 0);

  let regionesColumnasHTML = '';
  if (zonasConContenido.length === 0) {
    regionesColumnasHTML = '<p class="campo-vacio">No se han registrado regiones afectadas.</p>';
  } else {
    const maxItems = Math.max(...zonasConContenido.map(z => regionesPorZona[z].length), 1);
    regionesColumnasHTML = '<table style="width:100%; border-collapse: collapse; font-size:8.5pt; margin: 4px 0;">';
    regionesColumnasHTML += '<thead><tr>';
    zonasConContenido.forEach(zona => {
      regionesColumnasHTML += `<th style="background:#f1f5f9; border:1px solid #cbd5e1; padding:4px; text-align:center; font-weight:700; font-size:8.5pt;">${zona}</th>`;
    });
    regionesColumnasHTML += '</tr></thead><tbody>';
    for (let i = 0; i < maxItems; i++) {
      regionesColumnasHTML += '<tr>';
      zonasConContenido.forEach(zona => {
        const items = regionesPorZona[zona] || [];
        const nombre = items[i] ? formatearNombreRegion(items[i]) : '';
        regionesColumnasHTML += `<td style="border:1px solid #cbd5e1; padding:4px; text-align:center; vertical-align:top; font-size:8.5pt;">${nombre}</td>`;
      });
      regionesColumnasHTML += '</tr>';
    }
    regionesColumnasHTML += '</tbody></table>';
  }

  // ============================================================
  // STICKMAN (Vista Anterior / Posterior)
  // ============================================================
  const esPosterior = (r) => {
    const postRegions = ['nuca', 'espalda', 'sacro', 'gluteo', 'poplitea', 'lumbar', 'dorsal', 'escapula', 'trapecio', 'post', 'isquion', 'ilion'];
    if (postRegions.some(p => r.includes(p))) return true;
    return false;
  };
  const esAnterior = (r) => !esPosterior(r);
  const regionesAnteriores = regiones.filter(esAnterior);
  const regionesPosteriores = regiones.filter(esPosterior);

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
    sacro: { cx: 100, cy: 138 }, pubis: { cx: 100, cy: 158 },
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
    lumbar: { cx: 100, cy: 110 }, cervical: { cx: 100, cy: 30 }, dorsal: { cx: 100, cy: 70 }, abdomen: { cx: 100, cy: 118 },
    poplitea_izq: { cx: 80, cy: 195 }, poplitea_der: { cx: 120, cy: 195 },
    lca: { cx: 80, cy: 195 }, lcp: { cx: 80, cy: 195 },
    menisco_med: { cx: 80, cy: 195 }, menisco_lat: { cx: 120, cy: 195 },
    ilion_der: { cx: 130, cy: 140 }, isquion_der: { cx: 130, cy: 155 },
    gluteo_der: { cx: 120, cy: 140 }, gluteo_izq: { cx: 80, cy: 140 },
    carpo: { cx: 140, cy: 152 }, carpo_izq: { cx: 60, cy: 152 }, carpo_der: { cx: 140, cy: 152 },
    metacarpo: { cx: 140, cy: 140 }, metacarpo_izq: { cx: 60, cy: 140 }, metacarpo_der: { cx: 140, cy: 140 },
    falanges_prox: { cx: 140, cy: 128 }, falanges_prox_izq: { cx: 60, cy: 128 }, falanges_prox_der: { cx: 140, cy: 128 },
    falanges_dist: { cx: 140, cy: 118 }, falanges_dist_izq: { cx: 60, cy: 118 }, falanges_dist_der: { cx: 140, cy: 118 },
    pulgar: { cx: 148, cy: 145 }, pulgar_izq: { cx: 52, cy: 145 }, pulgar_der: { cx: 148, cy: 145 },
    eminencia_tenar: { cx: 135, cy: 155 }, eminencia_tenar_izq: { cx: 65, cy: 155 }, eminencia_tenar_der: { cx: 135, cy: 155 },
    retropie_calcaneo: { cx: 105, cy: 293 }, retropie_calcaneo_izq: { cx: 95, cy: 293 }, retropie_calcaneo_der: { cx: 105, cy: 293 },
    mediopie_tarso: { cx: 115, cy: 285 }, mediopie_tarso_izq: { cx: 85, cy: 285 }, mediopie_tarso_der: { cx: 115, cy: 285 },
    antepie_metatarso: { cx: 120, cy: 288 }, antepie_metatarso_izq: { cx: 80, cy: 288 }, antepie_metatarso_der: { cx: 120, cy: 288 },
    falanges_lateral: { cx: 125, cy: 295 }, falanges_lateral_izq: { cx: 75, cy: 295 }, falanges_lateral_der: { cx: 125, cy: 295 },
    talon_plantar: { cx: 105, cy: 295 }, talon_plantar_izq: { cx: 95, cy: 295 }, talon_plantar_der: { cx: 105, cy: 295 },
    mediopie_plantar: { cx: 110, cy: 285 }, mediopie_plantar_izq: { cx: 90, cy: 285 }, mediopie_plantar_der: { cx: 110, cy: 285 },
    metatarsianos_plantar: { cx: 115, cy: 290 }, metatarsianos_plantar_izq: { cx: 85, cy: 290 }, metatarsianos_plantar_der: { cx: 115, cy: 290 },
    falanges_plantar: { cx: 120, cy: 298 }, falanges_plantar_izq: { cx: 80, cy: 298 }, falanges_plantar_der: { cx: 120, cy: 298 },
  };

  const generarStickman = (regionesVista, tituloVista) => {
    if (regionesVista.length === 0) return '';
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
        <h3 style="font-size:11pt; margin: 3px 0;">${tituloVista}</h3>
        <svg viewBox="0 0 200 320" width="140" height="224" xmlns="http://www.w3.org/2000/svg" style="max-width:160px; height:auto;">
          <defs><linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#f8fafc"/><stop offset="100%" stopColor="#e2e8f0"/></linearGradient></defs>
          <g fill="url(#bodyGrad)" stroke="#94a3b8" stroke-width="1.2" opacity="0.8">${siluetaPaths}</g>
          ${puntosHTML}
        </svg>
      </div>
    `;
  };

  const stickmanAnterior = generarStickman(regionesAnteriores, 'Vista Anterior');
  const stickmanPosterior = generarStickman(regionesPosteriores, 'Vista Posterior');

  // ============================================================
  // PUNTO 6: EVALUACIÓN POR REGIÓN
  // ============================================================
  const tablaRegiones = regiones.map(region => {
    const data = datosRegiones[region] || {};
    const nombreFormateado = formatearNombreRegion(region);
    const eva = data.eva !== undefined ? `${data.eva}/10` : '—';
    const rom = data.rom || '—';
    let testsTexto = '—';
    if (data.tests && data.tests.length > 0) {
      const testsDetalle = data.tests_detalle || {};
      const esPlaceholder = (t) =>
        t === 'Test realizado (escribir cuál)' ||
        t === 'Test no específico' ||
        t === 'Test no especifico' ||
        t === 'Test realizado';
      const testsAMostrar = data.tests
        .map(t => {
          const detalle = testsDetalle[t];
          if (esPlaceholder(t)) return detalle ? detalle : null;
          return detalle ? `${t} (${detalle})` : t;
        })
        .filter(Boolean);
      testsTexto = testsAMostrar.length > 0 ? testsAMostrar.join('; ') : '—';
    }
    const obs = data.observaciones || '—';
    const notas = data.notas || '—';
    return { region: nombreFormateado, eva, rom, tests: testsTexto, obs, notas };
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

  // ============================================================
  // PUNTO 7: RECOMENDACIONES
  // ============================================================
  const recomLines = recomendaciones.split('\n').map(l => l.trim()).filter(l => l !== '');
  let recomendacionesHTML = '';
  if (recomLines.length > 0) {
    recomendacionesHTML = '<div style="font-size:9.5pt; line-height:1.6;">';
    recomLines.forEach((line, idx) => {
      recomendacionesHTML += `<div style="margin-bottom: 4px;"><strong>${idx + 1}.</strong> ${line}</div>`;
    });
    recomendacionesHTML += '</div>';
  } else {
    recomendacionesHTML = '<span class="campo-vacio">No se han registrado recomendaciones.</span>';
  }

  // ============================================================
  // PUNTO 8: PLAN DE TRATAMIENTO
  // ============================================================
  let planHTML = '<div style="font-size:9.5pt; line-height:1.55;">';
  if (planTratamiento) {
    const planLines = planTratamiento.split('\n');
    planLines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed === '') {
        planHTML += '<div style="height: 6px;"></div>';
        return;
      }
      if (/^\d+\./.test(trimmed)) {
        planHTML += `<div style="font-weight: 700; margin-top: 8px; margin-bottom: 3px; color:#0f172a;">${trimmed}</div>`;
        return;
      }
      if (trimmed.endsWith(':') && !trimmed.startsWith('-')) {
        planHTML += `<div style="font-weight: 600; margin-top: 5px; margin-bottom: 2px; margin-left: 15px;">${trimmed}</div>`;
        return;
      }
      if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
        const indentMatch = line.match(/^\s*/);
        const indentLevel = indentMatch ? indentMatch[0].length : 0;
        const marginLeft = indentLevel >= 6 ? 45 : 25;
        const content = trimmed.replace(/^[-•]\s*/, '');
        planHTML += `<div style="margin-left: ${marginLeft}px; margin-bottom: 2px;">• ${content}</div>`;
        return;
      }
      const indentMatch = line.match(/^\s*/);
      const indentLevel = indentMatch ? indentMatch[0].length : 0;
      const marginLeft = indentLevel >= 6 ? 45 : (indentLevel >= 3 ? 25 : 0);
      planHTML += `<div style="margin-left: ${marginLeft}px; margin-bottom: 2px;">${trimmed}</div>`;
    });
  } else {
    planHTML += '<span class="campo-vacio">No se ha registrado un plan de tratamiento.</span>';
  }
  planHTML += '</div>';

  // ============================================================
  // PUNTO 9: ALERTAS
  // ============================================================
  const alertLines = alertas.split('\n').map(l => l.trim()).filter(l => l !== '');
  let alertasHTML = '<div style="font-size:9.5pt; line-height:1.55; margin-bottom: 8px;">';
  alertasHTML += '<div style="font-weight:600; margin-bottom: 4px;">9.1 Alertas Clínicas Específicas:</div>';
  if (alertLines.length > 0) {
    alertasHTML += '<div style="background:#fef2f2; border-left:3px solid #ef4444; padding:6px 10px; border-radius:3px;">';
    alertLines.forEach(line => {
      alertasHTML += `<div style="margin-bottom: 2px;"><strong>!</strong> ${line}</div>`;
    });
    alertasHTML += '</div>';
  } else {
    alertasHTML += '<div style="background:#f8fafc; padding:6px 10px; border-radius:3px; color:#94a3b8; font-style:italic;">No se han registrado alertas específicas.</div>';
  }
  alertasHTML += '</div>';

  if (firmaComoTecnico) {
    alertasHTML += `<div class="alerta" style="background:#fef3c7; border-left-color:#f59e0b; color:#78350f;">
      AVISO: Documento funcional elaborado por un Técnico en Fisioterapia y Rehabilitación. NO constituye diagnóstico clínico ni prescripción médica. Para diagnóstico o prescripción, consulte con un <strong>Lic. T.M. Fisioterapia</strong>.
    </div>`;
  } else {
    alertasHTML += `<div class="alerta">Este informe contiene información confidencial del paciente. Solo debe ser utilizado por personal autorizado.</div>`;
  }

  // ============================================================
  // BLOQUES AUXILIARES
  // ============================================================
  const nivelEducativoHTML = evaluacion.nivel_educativo
    ? `<tr><td>Nivel educativo</td><td>${evaluacion.nivel_educativo}</td></tr>`
    : '';

  let hijosHTML = '';
  if (hijos && hijos.length > 0) {
    const hijosTexto = hijos.map((h, i) => {
      const sexo = h.sexo === 'M' ? 'Masculino' : h.sexo === 'F' ? 'Femenino' : '';
      return `Hijo ${i + 1}: ${h.edad || '?'} años${sexo ? ` (${sexo})` : ''}`;
    }).join(' | ');
    hijosHTML = `<tr><td>Nº de hijos</td><td>${hijosTexto}</td></tr>`;
  }

  const contactosValidos = contactosEmergencia.filter(c => c.nombre || c.telefono);
  let contactosEmergenciaHTML = '';
  if (contactosValidos.length > 0) {
    const texto = contactosValidos
      .map((c, i) => `Contacto ${i + 1}: ${c.nombre || '?'} (${c.parentesco || '?'}) — ${c.telefono || '?'}`)
      .join(' | ');
    contactosEmergenciaHTML = `<tr><td>Contactos de emergencia</td><td>${texto}</td></tr>`;
  }

  const tieneSignosVitales = signosVitales && (
    signosVitales.ta_sistolica || signosVitales.ta_diastolica || signosVitales.fc || signosVitales.fr ||
    signosVitales.temperatura || signosVitales.spo2 || signosVitales.peso || signosVitales.talla || signosVitales.glucemia
  );

  let signosVitalesHTML = '';
  if (tieneSignosVitales) {
    let imcTexto = '—';
    let imcAlerta = '';
    if (signosVitales.peso && signosVitales.talla) {
      const p = parseFloat(signosVitales.peso);
      const t = parseFloat(signosVitales.talla);
      const tM = t > 3 ? t / 100 : t;
      const imc = p / (tM * tM);
      if (isFinite(imc) && imc > 0) {
        imcTexto = imc.toFixed(1);
        if (imc < 18.5) imcAlerta = ' (bajo peso)';
        else if (imc < 25) imcAlerta = ' (normal)';
        else if (imc < 30) imcAlerta = ' (sobrepeso)';
        else imcAlerta = ' (obesidad)';
      }
    }

    const alertasSV = [];
    const s = parseFloat(signosVitales.ta_sistolica);
    const d = parseFloat(signosVitales.ta_diastolica);
    if ((!isNaN(s) && s >= 140) || (!isNaN(d) && d >= 90)) alertasSV.push('TA elevada');
    else if ((!isNaN(s) && s >= 130) || (!isNaN(d) && d >= 85)) alertasSV.push('TA limítrofe');

    const fc = parseFloat(signosVitales.fc);
    if (!isNaN(fc) && (fc > 110 || fc < 50)) alertasSV.push('FC fuera de rango');
    else if (!isNaN(fc) && (fc > 100 || fc < 60)) alertasSV.push('FC limítrofe');

    const fr = parseFloat(signosVitales.fr);
    if (!isNaN(fr) && (fr > 24 || fr < 10)) alertasSV.push('FR fuera de rango');

    const temp = parseFloat(signosVitales.temperatura);
    if (!isNaN(temp) && (temp >= 38 || temp < 35.5)) alertasSV.push('Temperatura fuera de rango');
    else if (!isNaN(temp) && temp > 37.2) alertasSV.push('Febrícula');

    const spo2 = parseFloat(signosVitales.spo2);
    if (!isNaN(spo2) && spo2 < 90) alertasSV.push('SpO2 baja');
    else if (!isNaN(spo2) && spo2 < 95) alertasSV.push('SpO2 limítrofe');

    const glu = parseFloat(signosVitales.glucemia);
    if (!isNaN(glu) && (glu > 140 || glu < 60)) alertasSV.push('Glucemia fuera de rango');
    else if (!isNaN(glu) && (glu > 110 || glu < 70)) alertasSV.push('Glucemia limítrofe');

    let fechaToma = '';
    if (signosVitales.fecha_toma) {
      const df = new Date(signosVitales.fecha_toma);
      if (!isNaN(df)) {
        const dia = String(df.getDate()).padStart(2, '0');
        const mes = String(df.getMonth() + 1).padStart(2, '0');
        const anio = df.getFullYear();
        const hora2 = String(df.getHours()).padStart(2, '0');
        const min = String(df.getMinutes()).padStart(2, '0');
        fechaToma = `${dia}/${mes}/${anio} ${hora2}:${min}`;
      }
    }

    signosVitalesHTML = `
      <h1>1.1 Signos Vitales</h1>
      ${fechaToma ? `<p style="font-size:8pt; color:#64748b; margin:2px 0 4px 0;">Toma registrada: ${fechaToma}</p>` : ''}
      <table>
        <tr><th>Signo</th><th>Valor</th></tr>
        ${signosVitales.ta_sistolica || signosVitales.ta_diastolica ? `<tr><td>Presión Arterial</td><td>${signosVitales.ta_sistolica || '—'}/${signosVitales.ta_diastolica || '—'} mmHg</td></tr>` : ''}
        ${signosVitales.fc ? `<tr><td>Frecuencia Cardíaca</td><td>${signosVitales.fc} lpm</td></tr>` : ''}
        ${signosVitales.fr ? `<tr><td>Frecuencia Respiratoria</td><td>${signosVitales.fr} rpm</td></tr>` : ''}
        ${signosVitales.temperatura ? `<tr><td>Temperatura</td><td>${signosVitales.temperatura} °C</td></tr>` : ''}
        ${signosVitales.spo2 ? `<tr><td>Saturación de Oxígeno</td><td>${signosVitales.spo2} %</td></tr>` : ''}
        ${signosVitales.peso ? `<tr><td>Peso</td><td>${signosVitales.peso} kg</td></tr>` : ''}
        ${signosVitales.talla ? `<tr><td>Talla</td><td>${signosVitales.talla} cm</td></tr>` : ''}
        ${imcTexto !== '—' ? `<tr><td>IMC</td><td>${imcTexto}${imcAlerta}</td></tr>` : ''}
        ${signosVitales.glucemia ? `<tr><td>Glucemia</td><td>${signosVitales.glucemia} mg/dL</td></tr>` : ''}
      </table>
      ${alertasSV.length > 0 ? `<div class="alerta">Observaciones de signos vitales: ${alertasSV.join(', ')}</div>` : ''}
    `;
  }

  let familiaresTexto = '';
  if (familiares.length > 0) {
    familiaresTexto = familiares.filter(f => f !== 'Otros').join(', ');
    if (familiares.includes('Otros') && familiaresOtros) {
      familiaresTexto += (familiaresTexto ? ', ' : '') + familiaresOtros;
    }
  } else if (familiaresOtros) {
    familiaresTexto = familiaresOtros;
  }
  const familiaresHTML = familiaresTexto ? `<tr><th>Antecedentes familiares</th><td>${familiaresTexto}</td></tr>` : '';

  const tieneHabitos = habitos.tabaquismo || habitos.alcohol || habitos.drogas || habitos.dependencia_medicamentos ||
    actividadFisica || nivelDeportivo || (calidadSuenio !== null && calidadSuenio !== undefined) || estresPercibido;

  let habitosHTML = '';
  if (tieneHabitos) {
    const items = [];
    items.push(`Tabaquismo: ${habitos.tabaquismo ? `Sí${habitos.cigarrillos_dia ? ` (${habitos.cigarrillos_dia} cig/día` : ''}${habitos.anios_tabaquismo ? `, ${habitos.anios_tabaquismo} años` : ''}${habitos.cigarrillos_dia ? ')' : ''}` : 'No'}`);
    items.push(`Alcohol: ${habitos.alcohol ? `Sí (${habitos.alcohol_frecuencia || 'frecuencia no especificada'})` : 'No'}`);
    if (habitos.drogas) items.push('Drogas recreativas: Sí');
    if (habitos.dependencia_medicamentos) items.push('Dependencia a medicamentos: Sí');
    if (actividadFisica) items.push(`Actividad física: ${actividadFisica}`);
    if (nivelDeportivo) items.push(`Nivel deportivo: ${nivelDeportivo}${deportePracticado ? ` (${deportePracticado})` : ''}`);
    if (calidadSuenio !== null && calidadSuenio !== undefined) items.push(`Calidad del sueño: ${calidadSuenio}/10`);
    if (estresPercibido) items.push(`Estrés percibido: ${estresPercibido}`);

    habitosHTML = `
      <h1>3.1 Hábitos y estilo de vida</h1>
      <table>
        <tr><th>Aspecto</th><th>Detalle</th></tr>
        ${items.map(i => {
          const idx = i.indexOf(':');
          const k = i.substring(0, idx);
          const v = i.substring(idx + 1).trim();
          return `<tr><td>${k}</td><td>${v}</td></tr>`;
        }).join('')}
      </table>
      ${estresPercibido === 'Alto' ? `<div class="alerta">Se sugiere abordar manejo de estrés como parte complementaria del tratamiento.</div>` : ''}
    `;
  }

  const tieneGineco = gineco.embarazo || gineco.lactancia || gineco.fum || gineco.metodo_anticonceptivo ||
    gineco.menopausia || gineco.num_embarazos || gineco.num_partos || gineco.num_abortos;

  let ginecoHTML = '';
  if (tieneGineco) {
    const items = [];
    if (gineco.embarazo) items.push(['¿Embarazo?', gineco.embarazo]);
    if (gineco.lactancia) items.push(['¿Lactancia?', gineco.lactancia]);
    if (gineco.fum) {
      const fumDate = new Date(gineco.fum);
      const fumFormato = !isNaN(fumDate)
        ? `${String(fumDate.getDate()).padStart(2, '0')}/${String(fumDate.getMonth() + 1).padStart(2, '0')}/${fumDate.getFullYear()}`
        : gineco.fum;
      items.push(['Fecha de última menstruación (FUM)', fumFormato]);
    }
    if (gineco.metodo_anticonceptivo) items.push(['Método anticonceptivo', gineco.metodo_anticonceptivo]);
    if (gineco.menopausia) items.push(['Menopausia', gineco.menopausia]);
    if (gineco.edad_menopausia !== '' && gineco.edad_menopausia !== undefined) {
      items.push(['Edad de menopausia', `${gineco.edad_menopausia} años`]);
    }
    if (gineco.num_embarazos) items.push(['Nº de embarazos', gineco.num_embarazos]);
    if (gineco.num_partos) items.push(['Nº de partos', gineco.num_partos]);
    if (gineco.num_abortos !== '' && gineco.num_abortos !== undefined) {
      items.push(['Nº de abortos', gineco.num_abortos]);
    }

    ginecoHTML = `
      <h1>3.2 Antecedentes Gineco-obstétricos</h1>
      <table>
        <tr><th>Aspecto</th><th>Detalle</th></tr>
        ${items.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('')}
      </table>
      ${gineco.embarazo === 'Sí' ? `<div class="alerta">Paciente embarazada: revisar contraindicaciones antes de aplicar agentes físicos, masoterapia profunda o electroterapia.</div>` : ''}
    `;
  }

  const tieneUro = uro.visita_urologo || uro.hiperplasia_prostata || uro.medicacion_prostata;

  let uroHTML = '';
  if (tieneUro) {
    const items = [];
    if (uro.visita_urologo) items.push(['Visita al urólogo (último año)', uro.visita_urologo]);
    if (uro.hiperplasia_prostata) items.push(['Hiperplasia prostática', uro.hiperplasia_prostata]);
    if (uro.medicacion_prostata) items.push(['Medicación prostática', uro.medicacion_prostata]);

    uroHTML = `
      <h1>3.2 Antecedentes urológicos</h1>
      <table>
        <tr><th>Aspecto</th><th>Detalle</th></tr>
        ${items.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('')}
      </table>
    `;
  }

  // BANDERAS ROJAS
  const banderasRojasSeleccionadas = datosRegiones._banderas_rojas || [];
  const BANDERAS_LABELS = {
    cancer: 'Antecedente de cáncer (últimos 5 años)',
    anticoagulantes: 'Uso de anticoagulantes (warfarina, rivaroxabán, etc.)',
    marcapasos: 'Marcapasos o dispositivo implantado',
    cirugia_reciente: 'Cirugía reciente (< 6 semanas) en la zona afectada',
    perdida_peso: 'Pérdida de peso inexplicable en los últimos 3 meses',
    fiebre_persistente: 'Fiebre o sudoración nocturna persistente',
    embarazo: 'Embarazo o sospecha de embarazo',
    deficit_motor: 'Pérdida de fuerza o sensibilidad progresiva en extremidades',
    deficit_neuro: 'Déficit neurológico progresivo (adormecimiento, entumecimiento)',
    trauma: 'Trauma grave reciente (>1m de altura o accidente)',
    cronico_peso: 'Pérdida de peso inexplicable asociada al dolor',
    esfinteres: 'Pérdida de control de esfínteres (orina o heces)',
    silla_montar: 'Alteración de sensibilidad en silla de montar',
    deficit_mmii: 'Déficit neurológico progresivo en miembros inferiores',
    rigidez_nuca: 'Rigidez de nuca intensa con fiebre',
  };

  let banderasRojasHTML = '';
  if (banderasRojasSeleccionadas.length > 0) {
    banderasRojasHTML = `
      <h1>3.3 Banderas Rojas Detectadas</h1>
      <div style="background:#fef2f2; border-left:4px solid #ef4444; padding:8px 12px; border-radius:4px; margin:4px 0;">
        <div style="font-weight:700; color:#b91c1c; margin-bottom:4px;">Se identificaron las siguientes banderas rojas:</div>
        <ul style="margin:4px 0 8px 20px; padding:0; color:#7f1d1d;">
          ${banderasRojasSeleccionadas.map(id => BANDERAS_LABELS[id] ? `<li style="margin-bottom:2px;">${BANDERAS_LABELS[id]}</li>` : '').join('')}
        </ul>
        <div style="font-size:9pt; color:#7f1d1d; font-style:italic;">
          Estas condiciones pueden requerir evaluación médica previa antes de iniciar el tratamiento. Se recomienda revisar la pertinencia de los agentes físicos seleccionados.
        </div>
      </div>
    `;
  }

  let alertaBanderasHTML = '';
  if (banderasRojasSeleccionadas.length > 0) {
    alertaBanderasHTML = `
      <div class="alerta">
        ATENCIÓN: El paciente presenta ${banderasRojasSeleccionadas.length} bandera(s) roja(s). Revisar antes de aplicar tratamiento.
      </div>
    `;
  }

  // ============================================================
  // BADGE DEL TIPO DE CENTRO
  // ============================================================
  const badgeCentroHTML = esGimnasioTerapeutico
    ? `<div style="display:inline-block; padding:3px 10px; background:#fef3c7; color:#78350f; font-size:8pt; font-weight:700; border-radius:4px; letter-spacing:1px; text-transform:uppercase; margin-bottom:6px;">Gimnasio Terapéutico</div>`
    : `<div style="display:inline-block; padding:3px 10px; background:#dbeafe; color:#1e40af; font-size:8pt; font-weight:700; border-radius:4px; letter-spacing:1px; text-transform:uppercase; margin-bottom:6px;">Centro Fisioterapéutico</div>`;

  // ============================================================
  // HTML FINAL
  // ============================================================
  const contenidoHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${tituloDocumento} - ${nombrePaciente}</title>
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
        .pagina { display: flex; flex-direction: column; height: 100vh; padding: 0; page-break-after: always; position: relative; }
        .pagina:last-child { page-break-after: avoid; }
        .contenido { flex: 1; padding-bottom: 15px; }
        .encabezado { text-align: center; border-bottom: 2px solid #22d3ee; padding-bottom: 8px; margin-bottom: 15px; position: relative; min-height: 70px; }
        .encabezado .logo { max-width: 60px; max-height: 60px; float: left; margin-right: 12px; }
        .encabezado .logo-derecho { max-width: 50px; max-height: 50px; float: right; margin-left: 12px; }
        .encabezado .titulo { font-size: 16pt; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 1px; }
        .encabezado .subtitulo { font-size: 9pt; color: #64748b; }
        .encabezado .datos { font-size: 8pt; color: #475569; margin-top: 3px; }
        .pie { text-align: center; font-size: 8pt; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 6px; margin-top: auto; width: 100%; }
        .marca-agua { position: fixed; top: 0; left: 0; right: 0; bottom: 0; display: flex; justify-content: center; align-items: center; pointer-events: none; z-index: 1000; opacity: 0.04; font-size: 80pt; font-weight: 900; color: #22d3ee; transform: rotate(-30deg); text-transform: uppercase; letter-spacing: 20px; user-select: none; }
        h1 { font-size: 13pt; font-weight: 700; color: #0f172a; border-left: 4px solid #22d3ee; padding-left: 10px; margin-top: 14px; margin-bottom: 6px; text-transform: uppercase; page-break-after: avoid; }
        table { width: 100%; border-collapse: collapse; margin: 4px 0; font-size: 9pt; page-break-inside: avoid; }
        th, td { border: 1px solid #cbd5e1; padding: 3px 5px; text-align: left; vertical-align: top; }
        th { background-color: #f1f5f9; font-weight: 700; }
        .alerta { background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 5px 10px; margin: 6px 0; border-radius: 3px; font-weight: 600; font-size: 9pt; }
        .stickman-container { display: flex; flex-wrap: wrap; justify-content: center; gap: 15px; margin: 8px 0; }
        .stickman-container > div { flex: 0 1 auto; text-align: center; }
        .firma { margin-top: 30px; border-top: 1px solid #94a3b8; padding-top: 30px; padding-right: 60px; }
        .firma .firma-bloque { max-width: 320px; margin-left: auto; text-align: left; }
        .firma .firma-label { font-size: 9pt; color: #475569; font-weight: 600; margin: 0 0 50px 0; }
        .firma .firma-linea { border-top: 1.5px solid #475569; padding-top: 6px; margin: 0; }
        .firma .firma-nombre { font-size: 10pt; font-weight: 700; color: #0f172a; margin: 0; }
        .firma .firma-credenciales { font-size: 8.5pt; color: #64748b; margin: 2px 0 0 0; }
        .campo-vacio { color: #94a3b8; font-style: italic; }
        @media print { .marca-agua { opacity: 0.03; } .pagina { height: auto; min-height: 100vh; } }
      </style>
    </head>
    <body>
      <div class="marca-agua">${firmaComoTecnico ? 'DOCUMENTO FUNCIONAL' : 'CONFIDENCIAL'}</div>

      <div class="pagina">
        <div class="contenido">
          ${alertaBanderasHTML}
          <div class="encabezado clearfix">
            ${logoUrl ? `<img src="${logoUrl}" class="logo" alt="Logo Centro" onerror="this.style.display='none'" />` : ''}
            <img src="/logos_cj_circular.png" class="logo-derecho" alt="CJ Fisioterapia" onerror="this.style.display='none'" />
            <div>
              <div class="titulo">${tituloDocumento}</div>
              <div class="subtitulo">${centroNombre}</div>
              <div style="text-align:center;">${badgeCentroHTML}</div>
              <div class="datos">Paciente: ${nombrePaciente} &nbsp;|&nbsp; Fecha: ${fecha} &nbsp;|&nbsp; ID: ${evaluacion.paciente_id}</div>
            </div>
          </div>

          <h1>${seccion1Titulo}</h1>
          <table>
            <tr><th>Campo</th><th>Valor</th></tr>
            ${evaluacion.edad ? `<tr><td>Edad</td><td>${evaluacion.edad}</td></tr>` : ''}
            ${evaluacion.sexo ? `<tr><td>Sexo</td><td>${evaluacion.sexo}</td></tr>` : ''}
            ${evaluacion.estado_civil ? `<tr><td>Estado Civil</td><td>${evaluacion.estado_civil}</td></tr>` : ''}
            ${evaluacion.ocupacion ? `<tr><td>Ocupación</td><td>${evaluacion.ocupacion}</td></tr>` : ''}
            ${nivelEducativoHTML}
            ${evaluacion.telefono ? `<tr><td>Teléfono</td><td>${evaluacion.telefono}</td></tr>` : ''}
            ${evaluacion.direccion ? `<tr><td>Dirección</td><td>${evaluacion.direccion}</td></tr>` : ''}
            ${evaluacion.como_llego ? `<tr><td>¿Cómo llegó al centro?</td><td>${evaluacion.como_llego}</td></tr>` : ''}
            ${hijosHTML}
            ${contactosEmergenciaHTML}
          </table>

          ${signosVitalesHTML}

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
            ${familiaresHTML}
          </table>

          ${habitosHTML}
          ${ginecoHTML}
          ${uroHTML}
          ${banderasRojasHTML}
        </div>
        <div class="pie">${tituloDocumento} - ${centroNombre} - Pág. 1</div>
      </div>

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
          ${regionesColumnasHTML}

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
            <tbody>${tablaHTML}</tbody>
          </table>
        </div>
        <div class="pie">${tituloDocumento} - ${centroNombre} - Pág. 2</div>
      </div>

      <div class="pagina">
        <div class="contenido">
          <h1>7. Recomendaciones Generales</h1>
          ${recomendacionesHTML}

          <h1>${seccion8Titulo}</h1>
          ${firmaComoTecnico ? `<p style="font-size:8.5pt; color:#78350f; background:#fef3c7; padding:5px 8px; border-radius:4px; margin-bottom:6px;"><strong>Nota:</strong> Los agentes físicos y técnicas manuales aquí descritos son <strong>sugerencias de aplicación</strong> basadas en protocolos estándar de rehabilitación funcional. Su aplicación está sujeta a validación por un <strong>Lic. T.M. Fisioterapia</strong>.</p>` : ''}
          ${planHTML}

          <h1>9. Alertas de Seguridad</h1>
          ${alertasHTML}

          <h1>10. Datos de Generación</h1>
          <table>
            <tr><th>Documento generado por</th><td>${usuario}</td></tr>
            <tr><th>Tipo de profesional</th><td>${firmaComoTecnico ? 'Técnico en Fisioterapia y Rehabilitación' : 'Licenciado en Tecnología Médica - Fisioterapia'}</td></tr>
            <tr><th>Fecha de generación</th><td>${fecha}</td></tr>
            <tr><th>Hora de generación</th><td>${hora}</td></tr>
            <tr><th>Centro</th><td>${nombreCentroConTipo}</td></tr>
          </table>

          <div class="firma">
            <div class="firma-bloque">
              <p class="firma-label">${firmaComoTecnico ? 'Firma del profesional técnico:' : 'Firma del profesional:'}</p>
              <div class="firma-linea">
                <p class="firma-nombre">${usuario}</p>
                ${credenciales ? `<p class="firma-credenciales">${credenciales}</p>` : ''}
              </div>
            </div>
          </div>

          <div style="text-align: center; margin-top: 15px; font-size: 9pt; color: #64748b;">--- Fin del documento ---</div>
        </div>
        <div class="pie">${tituloDocumento} - ${centroNombre} - Pág. 3</div>
      </div>
    </body>
    </html>
  `;

  const ventana = window.open('', '_blank', 'width=800,height=600,scrollbars=yes');
  if (ventana) {
    ventana.document.title = `${tituloDocumento} - ${nombrePaciente}`;
    ventana.document.write(contenidoHTML);
    ventana.document.close();
    setTimeout(() => ventana.print(), 1000);
  } else {
    alert('Por favor, permite las ventanas emergentes para generar el informe.');
  }
}