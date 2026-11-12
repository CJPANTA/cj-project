// src/utils/generarInforme.js
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { supabase } from '../lib/supabaseClient';

// Vistas Pro
import VistaLumbarPro from '../components/clinica/BodyChart/vistas/VistaLumbarPro';
import VistaPelvisPro from '../components/clinica/BodyChart/vistas/VistaPelvisPro';
import VistaRodillaPro from '../components/clinica/BodyChart/vistas/VistaRodillaPro';
import VistaHombroPro from '../components/clinica/BodyChart/vistas/VistaHombroPro';
import VistaCodoPro from '../components/clinica/BodyChart/vistas/VistaCodoPro';
import VistaManoPro from '../components/clinica/BodyChart/vistas/VistaManoPro';
import VistaPiePro from '../components/clinica/BodyChart/vistas/VistaPiePro';
import VistaTobilloPro from '../components/clinica/BodyChart/vistas/VistaTobilloPro';
import VistaPiernaPro from '../components/clinica/BodyChart/vistas/VistaPiernaPro';
import VistaCabezaPro from '../components/clinica/BodyChart/vistas/VistaCabezaPro';
import VistaToraxPro from '../components/clinica/BodyChart/vistas/VistaToraxPro';
import VistaColumnaPro from '../components/clinica/BodyChart/vistas/VistaColumnaPro';
import VistaBrazoPro from '../components/clinica/BodyChart/vistas/VistaBrazoPro';

// Helpers
const normalizarDatosRegiones = (dr) => {
  if (!dr || typeof dr !== 'object') return { regiones: {}, _meta: {} };
  if (dr.regiones && typeof dr.regiones === 'object') return { regiones: dr.regiones, _meta: dr._meta || {} };
  const regiones = {}; const _meta = {};
  Object.entries(dr).forEach(([key, val]) => { if (key.startsWith('_')) _meta[key] = val; else regiones[key] = val; });
  return { regiones, _meta };
};

const SINTOMAS_COLORES = { dolor: '#ef4444', inflamacion: '#f59e0b', neuropatia: '#a855f7', rigidez: '#22d3ee' };
const SINTOMAS_NOMBRES = { dolor: 'Dolor', inflamacion: 'Inflamación', neuropatia: 'Neuropatía', rigidez: 'Rigidez' };

const PRIORIDAD_FILL = ['inflamacion', 'dolor', 'neuropatia', 'rigidez'];

const calcularColoresAfectacion = (sintomasArray) => {
  const arr = (sintomasArray && sintomasArray.length) ? sintomasArray : ['dolor'];
  const fillSymptom = PRIORIDAD_FILL.find(s => arr.includes(s)) || arr[0];
  const borderSymptom = arr.find(s => s !== fillSymptom) || fillSymptom;
  return {
    fillSymptom,
    borderSymptom,
    color: SINTOMAS_COLORES[fillSymptom] || '#ef4444',
    border: SINTOMAS_COLORES[borderSymptom] || '#ef4444',
  };
};

const urlToBase64 = async (url) => {
  if (!url) return '';
  let absoluteUrl = url.startsWith('http') ? url : new URL(url, window.location.origin).href;
  try {
    const response = await fetch(absoluteUrl);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) { return absoluteUrl; }
};

const corregirTypos = (t) => (t || '')
  .replace(/Estimamientos/gi, 'Estiramientos').replace(/estimamiento/gi, 'estiramiento')
  .replace(/Susponder/gi, 'Suspender').replace(/susponder/gi, 'suspender')
  .replace(/Lumbalgia mecanica/gi, 'Lumbalgia mecánica').replace(/Aplicaciòn/gi, 'Aplicación').replace(/aplicaciòn/gi, 'aplicación');

const formatearNombreRegion = (nombre) => {
  const map = {
    'cabeza': 'Cabeza', 'cuello': 'Cuello', 'nuca': 'Nuca', 'torax': 'Tórax', 'pecho': 'Pecho', 'espalda': 'Espalda',
    'hombro': 'Hombro', 'brazo': 'Brazo', 'antebrazo': 'Antebrazo', 'mano': 'Mano', 'muneca': 'Muñeca', 'codo': 'Codo',
    'pelvis': 'Pelvis', 'cadera': 'Cadera', 'sacro': 'Sacro', 'pubis': 'Pubis', 'pierna': 'Pierna', 'muslo': 'Muslo', 'rodilla': 'Rodilla',
    'rotula': 'Rótula', 'gemelo': 'Gemelo', 'tobillo': 'Tobillo', 'pie': 'Pie', 'talon': 'Talón',
    'acromion': 'Acromion', 'deltoides': 'Deltoides', 'manguito': 'Manguito Rotador',
    'clavicula': 'Clavícula', 'trapecio': 'Trapecio', 'escapula': 'Escápula',
    'lumbar': 'Lumbar', 'cervical': 'Cervical', 'dorsal': 'Dorsal', 'columna_dorsal': 'Columna Dorsal', 'columna': 'Columna',
    'poplitea': 'Fosa Poplítea', 'lca': 'LCA', 'lcp': 'LCP', 'lcm': 'LCM', 'lcl': 'LCL', 'menisco': 'Menisco',
    'cuadriceps': 'Cuádriceps', 'isquiotibial': 'Isquiotibial', 'soleo': 'Sóleo', 'tendon_aquiles': 'Tendón de Aquiles',
    'biceps': 'Bíceps', 'triceps': 'Tríceps', 'olecranon': 'Olécranon', 'tibial': 'Tibial',
    'izq': 'Izquierdo', 'der': 'Derecho', 'ant': 'Anterior', 'post': 'Posterior', 'med': 'Medial', 'lat': 'Lateral',
    'inf': 'Inferior', 'sup': 'Superior', 'prox': 'Proximal', 'dist': 'Distal',
    'ilion': 'Ilion', 'isquion': 'Isquion', 'gluteo': 'Glúteo', 'coxis': 'Coxis', 'carpo': 'Carpo',
    'metacarpo': 'Metacarpo', 'metacarpiano': 'Metacarpiano',
    'falanges_prox': 'Falanges Proximales', 'falanges_dist': 'Falanges Distales', 'pulgar': 'Pulgar', 'eminencia_tenar': 'Eminencia Tenar',
    'retropie_calcaneo': 'Retropié', 'mediopie_tarso': 'Mediopié', 'antepie_metatarso': 'Antepié', 'falanges_lateral': 'Dedos del Pie',
    'talon_plantar': 'Talón', 'mediopie_plantar': 'Arco Plantar', 'metatarsianos_plantar': 'Metatarsianos', 'falanges_plantar': 'Dedos del Pie',
    'pulpejo': 'Pulpejo', 'pulpejos': 'Pulpejos', 'almohadilla': 'Almohadilla', 'almohadillas': 'Almohadillas',
    'tendones': 'Tendones', 'tendon': 'Tendón', 'extensores': 'Extensores', 'flexores': 'Flexores',
    'extensor': 'Extensor', 'flexor': 'Flexor',
    'semilunar': 'Semilunar', 'piramidal': 'Piramidal', 'pisiforme': 'Pisiforme', 'trapezoide': 'Trapezoide',
  };
  let resultado = nombre;
  Object.keys(map).forEach(key => { resultado = resultado.replace(new RegExp(`_${key}(_|$)`, 'g'), ` ${map[key]}$1`); });
  resultado = resultado.split('_').map(p => map[p] ? map[p] : p.charAt(0).toUpperCase() + p.slice(1)).join(' ').trim();
  return resultado;
};

export async function generarInformeDesdeEvaluacion(evaluacionId) {
  const { data: evaluacion, error: evalError } = await supabase.from('evaluaciones').select('*').eq('id', evaluacionId).single();
  if (evalError) throw evalError;
  if (!evaluacion) throw new Error('Evaluación no encontrada.');

  const { data: pacienteData } = await supabase.from('pacientes').select('*').eq('id', evaluacion.paciente_id).single();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: perfil } = await supabase.from('profiles').select('nombre_completo, centro_id, titulo_profesional, numero_colegiatura, dni, tipo_profesional, tipo_documento, registro_interno').eq('id', user.id).single();

  const firmaComoTecnico = (perfil?.tipo_profesional || 'licenciado') !== 'licenciado';
  let centroNombre = 'Centro CJ', logoUrl = '';
  if (perfil?.centro_id) {
    const { data: centro } = await supabase.from('centros').select('nombre, logo_url').eq('id', perfil.centro_id).single();
    if (centro) { centroNombre = centro.nombre || 'Centro CJ'; logoUrl = centro.logo_url || ''; }
  }
  const logoBase64 = await urlToBase64(logoUrl);

  const nombrePaciente = pacienteData ? `${pacienteData.nombre} ${pacienteData.apellidos}` : 'Paciente';
  const fecha = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const hora = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  const usuario = perfil?.nombre_completo || 'Usuario';
  const credenciales = firmaComoTecnico ? `Técnico en Fisioterapia y Rehabilitación — DNI: ${perfil?.dni || ''}` : `Lic. T.M. Fisioterapia — C.T.M.P. N° ${perfil?.numero_colegiatura || ''}`;

  const regiones = evaluacion.regiones || [];
  const dataNorm = normalizarDatosRegiones(evaluacion.datos_regiones);
  const datosRegiones = dataNorm._meta;
  const regionesData = dataNorm.regiones;

  // === LÓGICA DE VISTAS PRO ===
  const VISTAS_PRO_CONFIG = {
    rodilla: { componente: VistaRodillaPro, keywords: ['rodilla', 'menisco', 'lca', 'lcp', 'rotula'] },
    pie: { componente: VistaPiePro, keywords: ['pie', 'calcaneo', 'talon', 'fascia_plantar', 'metatarsiano', 'hallux', 'falanges_plantar', 'mediopie', 'antepie'] },
    tobillo: { componente: VistaTobilloPro, keywords: ['tobillo', 'aquiles', 'peroneo'] },
    pelvis: { componente: VistaPelvisPro, keywords: ['pelvis', 'cadera', 'sacro', 'gluteo', 'acetabulo', 'cresta_iliaca', 'pubis', 'isquion', 'coxis'] },
    pierna: { componente: VistaPiernaPro, keywords: ['pierna', 'cuadriceps', 'femoral', 'tibial', 'perone', 'gemelo', 'soleo'] },
    lumbar: { componente: VistaLumbarPro, keywords: ['lumbar', 'l1', 'l2', 'l3', 'l4', 'l5', 'faceta_l', 'disco_l'] },
    columna: { componente: VistaColumnaPro, keywords: ['columna', 'cervical', 'dorsal'] },
    hombro: { componente: VistaHombroPro, keywords: ['hombro', 'acromion', 'clavicula', 'escapula', 'manguito', 'deltoides'] },
    brazo: { componente: VistaBrazoPro, keywords: ['brazo', 'biceps', 'triceps', 'humero'] },
    codo: { componente: VistaCodoPro, keywords: ['codo', 'olecranon', 'epicondilo'] },
    mano: { componente: VistaManoPro, keywords: [
      'mano', 'muneca', 'carpo', 'metacarpo', 'metacarpiano', 'falange', 'pulgar',
      'pulpejo', 'pulpejos', 'almohadilla', 'almohadillas',
      'tendones_extensor', 'tendones_flexor', 'tendon_extensor', 'tendon_flexor',
      'tunel_carpo', 'escafoides', 'grande', 'ganchoso', 'tenar',
      'nervio_mediano', 'nervio_cubital', 'retinaculo', 'semilunar', 'piramidal', 'pisiforme', 'trapezoide'
    ]},
    cabeza: { componente: VistaCabezaPro, keywords: ['cabeza', 'cuello', 'nuca', 'craneo', 'mandibula', 'ecom', 'temporal', 'occipital'] },
    torax: { componente: VistaToraxPro, keywords: ['torax', 'pecho', 'costilla', 'esternon', 'pectoral', 'trapecio'] }
  };

  const vistasAgrupadas = {};
  regiones.forEach(r => {
    for (const [vistaBase, config] of Object.entries(VISTAS_PRO_CONFIG)) {
      if (config.keywords.some(k => r.includes(k)) || r === vistaBase) {
        if (!vistasAgrupadas[vistaBase]) vistasAgrupadas[vistaBase] = { componente: config.componente, afectaciones: {} };
        const sintomasArray = regionesData[r]?.sintomas || ['dolor'];
        const colores = calcularColoresAfectacion(sintomasArray);
        vistasAgrupadas[vistaBase].afectaciones[r] = {
          color: colores.color,
          border: colores.border,
          sintomas: sintomasArray,
          colors: sintomasArray.map(s => SINTOMAS_COLORES[s] || '#ef4444')
        };
        return;
      }
    }
  });

  const vistaProHTML = Object.entries(vistasAgrupadas).map(([vistaBase, data]) => {
    const afectacionesKeys = Object.keys(data.afectaciones);

    let carasAGenerar = [];
    if (vistaBase === 'mano') {
      const palmarKeys = ['tendones_flexor', 'tendon_flexor', 'nervio_mediano', 'tunel_carpo', 'tenar', 'pulpejo', 'nervio_cubital', 'almohadilla'];
      const tienePalmar = afectacionesKeys.some(k => palmarKeys.some(pk => k.includes(pk)));
      const tieneDorsal = afectacionesKeys.some(k => !palmarKeys.some(pk => k.includes(pk)));
      if (tienePalmar) carasAGenerar.push('palmar');
      if (tieneDorsal || !tienePalmar) carasAGenerar.push('dorsal');
    } else if (vistaBase === 'pie') {
      const plantarKeys = ['fascia_plantar', 'talon_plantar', 'pulpejo'];
      const tienePlantar = afectacionesKeys.some(k => plantarKeys.some(pk => k.includes(pk)));
      const tieneLateral = afectacionesKeys.some(k => !plantarKeys.some(pk => k.includes(pk)));
      if (tienePlantar) carasAGenerar.push('plantar');
      if (tieneLateral || !tienePlantar) carasAGenerar.push('lateral');
    } else {
      const esPosterior = afectacionesKeys.some(k => k.includes('_post') || k.includes('poplitea') || k.includes('sacro') || k.includes('gluteo') || k.includes('isquio'));
      carasAGenerar = [esPosterior ? 'posterior' : 'anterior'];
    }

    return carasAGenerar.map(cara => {
      const clavesCara = afectacionesKeys.filter(k => {
        if (vistaBase === 'mano') {
          const esPalmar = ['tendones_flexor', 'tendon_flexor', 'nervio_mediano', 'tunel_carpo', 'tenar', 'pulpejo', 'nervio_cubital', 'almohadilla'].some(pk => k.includes(pk));
          return cara === 'palmar' ? esPalmar : !esPalmar;
        }
        if (vistaBase === 'pie') {
          const esPlantar = ['fascia_plantar', 'talon_plantar', 'pulpejo'].some(pk => k.includes(pk));
          return cara === 'plantar' ? esPlantar : !esPlantar;
        }
        return true;
      });

      const hallazgosHTML = clavesCara.map(r => {
        const nombre = formatearNombreRegion(r);
        const sintomasArray = regionesData[r]?.sintomas || ['dolor'];
        const nombresSintomas = sintomasArray.map(s => SINTOMAS_NOMBRES[s] || s).join(', ');
        const colores = calcularColoresAfectacion(sintomasArray);
        return `<span style="display:inline-block; background:${colores.color}15; color:${colores.color}; border:1px solid ${colores.color}40; padding:2px 8px; border-radius:12px; font-size:8pt; font-weight:700; margin:2px;">${nombre} (${nombresSintomas})</span>`;
      }).join('');

      const afectacionesFiltradas = {};
      clavesCara.forEach(k => { afectacionesFiltradas[k] = data.afectaciones[k]; });

      const props = { cara: cara, lado: 'derecho', afectaciones: afectacionesFiltradas };
      
      try {
        let svgStr = renderToStaticMarkup(React.createElement(data.componente, props));
        svgStr = svgStr.replace(/<h4[^>]*>.*?<\/h4>/g, '');
        svgStr = svgStr
          .replace(/#09131f/gi, '#f8fafc').replace(/#070d18/gi, '#f8fafc').replace(/#0b1622/gi, '#f8fafc')
          .replace(/#1e293b/gi, '#e2e8f0').replace(/#2d3748/gi, '#e2e8f0').replace(/#334155/gi, '#cbd5e1')
          .replace(/#475569/gi, '#94a3b8').replace(/#2d4355/gi, '#e2e8f0').replace(/#354b60/gi, '#e2e8f0')
          .replace(/#384f63/gi, '#e2e8f0').replace(/#263f54/gi, '#e2e8f0').replace(/#3b5064/gi, '#e2e8f0')
          .replace(/#2a475a/gi, '#e2e8f0').replace(/#354f63/gi, '#e2e8f0');
        const svgLimpio = svgStr.replace(/<svg /g, '<svg style="max-width:180px; height:auto; margin-top:10px;" ');

        return `
          <div class="vista-pro">
            <div>
              <h4 style="margin:0 0 5px 0; font-size:11pt; text-transform:capitalize; color:#0f172a;">${vistaBase.replace(/_/g, ' ')} (${cara.charAt(0).toUpperCase() + cara.slice(1)})</h4>
              <div style="margin-bottom:5px;">${hallazgosHTML}</div>
            </div>
            <div style="text-align:center;">${svgLimpio}</div>
          </div>
        `;
      } catch (e) { return ''; }
    }).join('');
  }).join('');

  // === STICKMAN ===
  const centroides = {
    cabeza: { cx: 100, cy: 30 }, cuello: { cx: 100, cy: 50 }, hombro_izq: { cx: 125, cy: 45 }, hombro_der: { cx: 75, cy: 45 },
    brazo_izq: { cx: 138, cy: 80 }, brazo_der: { cx: 62, cy: 80 }, codo_izq: { cx: 138, cy: 105 }, codo_der: { cx: 62, cy: 105 },
    mano_izq: { cx: 138, cy: 155 }, mano_der: { cx: 62, cy: 155 }, torax: { cx: 100, cy: 85 }, columna: { cx: 100, cy: 90 },
    lumbar: { cx: 100, cy: 110 }, pelvis: { cx: 100, cy: 145 }, sacro: { cx: 100, cy: 138 },
    grande: { cx: 138, cy: 155 }, ganchoso: { cx: 138, cy: 155 }, escafoides: { cx: 138, cy: 155 }, semilunar: { cx: 138, cy: 155 },
    metacarpiano_1: { cx: 138, cy: 155 }, metacarpiano_2: { cx: 138, cy: 155 }, metacarpiano_3: { cx: 138, cy: 155 },
    metacarpiano_4: { cx: 138, cy: 155 }, metacarpiano_5: { cx: 138, cy: 155 },
    dedo_2_falanges: { cx: 138, cy: 155 }, dedo_3_falanges: { cx: 138, cy: 155 }, dedo_4_falanges: { cx: 138, cy: 155 }, dedo_5_falanges: { cx: 138, cy: 155 },
    tendones_flexores: { cx: 138, cy: 155 }, tendones_extensores: { cx: 138, cy: 155 },
    pulpejos_digitales: { cx: 138, cy: 155 }, pulpejos: { cx: 138, cy: 155 }, pulpejo: { cx: 138, cy: 155 },
    almohadillas_palmares: { cx: 138, cy: 155 }, almohadillas: { cx: 138, cy: 155 }, almohadilla: { cx: 138, cy: 155 },
    tunel_carpo: { cx: 138, cy: 155 }, nervio_mediano: { cx: 138, cy: 155 }, nervio_cubital: { cx: 138, cy: 155 },
    retinaculo_extensor: { cx: 138, cy: 155 }, trapecio: { cx: 110, cy: 48 }
  };

  // 🆕 MEJORA 2: Clasificar correctamente las regiones de la mano (palmar=anterior, dorsal=posterior)
  const esPosterior = (r) => {
    const palmarKeys = ['tendones_flexor', 'tendon_flexor', 'nervio_mediano', 'tunel_carpo', 'tenar', 'pulpejo', 'nervio_cubital', 'almohadilla'];
    if (palmarKeys.some(pk => r.includes(pk))) return false; // Palmar se ve en Anterior

    const dorsalKeys = ['extensor', 'retinaculo', 'escafoides', 'dedo_', 'metacarpiano', 'grande', 'ganchoso', 'semilunar'];
    if (dorsalKeys.some(dk => r.includes(dk))) return true; // Dorsal se ve en Posterior

    return ['nuca','espalda','sacro','gluteo','poplitea','lumbar','dorsal','escapula','trapecio','post','isquion','ilion'].some(p => r.includes(p));
  };

  const generarPuntosSVG = (regionesVista, esPost) => {
    return regionesVista.map(r => {
      let coords = centroides[r] || centroides[r.split('_')[0]] || { cx: 100, cy: 100 };
      if (r.includes('_izq') || regionesVista.some(rv => rv.includes('mano_izq'))) coords = { ...coords, cx: 62 };
      const cxFinal = esPost ? (200 - coords.cx) : coords.cx;
      const sintomasArray = regionesData[r]?.sintomas || ['dolor'];
      const { color, border } = calcularColoresAfectacion(sintomasArray);
      return `<circle cx="${cxFinal}" cy="${coords.cy}" r="5" fill="${color}" stroke="${border}" stroke-width="2"/>`;
    }).join('');
  };

  const siluetaPaths = `M 87,22 C 87,7 113,7 113,22 C 113,34 107,42 105,46 C 106,50 112,52 115,55 L 85,55 C 88,52 94,50 95,46 C 93,42 87,34 87,22 Z M 85,55 C 98,58 115,55 115,55 C 122,68 118,98 112,120 L 88,120 C 82,98 78,68 85,55 Z M 115,55 C 126,55 132,60 129,71 C 123,73 117,67 115,55 Z M 85,55 C 74,55 68,60 71,71 C 77,73 83,67 85,55 Z M 129,71 C 138,83 134,112 130,142 C 128,154 123,154 120,142 C 118,112 121,88 116,73 C 119,69 125,69 129,71 Z M 71,71 C 62,83 66,112 70,142 C 72,154 77,154 80,142 C 82,112 79,88 84,73 C 81,69 75,69 71,71 Z M 120,142 L 130,142 C 131,148 133,156 131,163 C 129,167 124,167 121,160 C 119,152 119,146 120,142 Z M 80,142 L 70,142 C 69,148 67,156 69,163 C 71,167 76,167 79,160 C 81,152 81,146 80,142 Z M 88,120 L 112,120 C 116,136 114,154 106,168 L 100,172 L 94,168 C 86,154 84,136 88,120 Z M 103,172 L 108,168 C 120,185 121,210 114,235 C 111,245 113,268 111,288 L 103,288 C 104,268 107,245 105,235 C 107,210 105,185 103,172 Z M 97,172 L 92,168 C 80,185 79,210 86,235 C 89,245 87,268 89,288 L 97,288 C 96,268 93,245 95,235 C 93,210 95,185 97,172 Z M 103,288 L 111,288 C 115,294 119,303 113,308 C 107,311 101,304 103,288 Z M 97,288 L 89,288 C 85,294 81,303 87,308 C 93,311 99,304 97,288 Z`;

  const generarStickman = (regionesVista, tituloVista, esPost) => {
    if (regionesVista.length === 0) return '';
    return `<div style="text-align:center; margin: 5px 0;"><h3 style="font-size:11pt; margin: 3px 0;">${tituloVista}</h3><svg viewBox="0 0 200 320" width="140" height="224" xmlns="http://www.w3.org/2000/svg" style="max-width:160px; height:auto;"><g fill="#f8fafc" stroke="#94a3b8" stroke-width="1.2" opacity="0.9"><path d="${siluetaPaths}"/></g>${generarPuntosSVG(regionesVista, esPost)}</svg></div>`;
  };

  const rAnt = regiones.filter(r => !esPosterior(r));
  const rPost = regiones.filter(r => esPosterior(r));
  const stickmanAnterior = generarStickman(rAnt, 'Vista Anterior', false);
  const stickmanPosterior = generarStickman(rPost, 'Vista Posterior', true);

  const leyendaSintomasHTML = () => {
    const activos = new Set();
    regiones.forEach(r => (regionesData[r]?.sintomas || ['dolor']).forEach(s => activos.add(s)));
    if (activos.size === 0) return '';
    return `<div style="text-align:center; font-size:8pt; font-weight:700; margin-top:5px;">${Array.from(activos).map(s => `<span style="color:${SINTOMAS_COLORES[s]}; margin:0 8px;">● ${SINTOMAS_NOMBRES[s]}</span>`).join('')}</div>`;
  };

  // === JERARQUÍA ===
  const jerarquia = {
    'Cabeza y Cuello': ['cabeza', 'cuello', 'nuca', 'craneo', 'mandibula', 'frontal', 'parietal', 'temporal', 'occipital', 'atm', 'ecom', 'masetero', 'trapecio'],
    'Columna': ['cervical', 'dorsal', 'lumbar', 'sacro', 'columna', 'l1', 'l2', 'l3', 'l4', 'l5', 'disco_l', 'faceta_l'],
    'Tórax / Tronco': ['torax', 'pecho', 'costilla', 'esternon', 'pectoral', 'serrato', 'abdomen'],
    'Miembro Superior': [
      'hombro', 'brazo', 'codo', 'muneca', 'mano', 'dedo', 'pulgar', 'carpo', 'metacarpo', 'metacarpiano',
      'falange', 'tenar', 'grande', 'ganchoso', 'escafoides', 'semilunar', 'piramidal', 'pisiforme', 'trapezoide',
      'pulpejo', 'pulpejos', 'almohadilla', 'almohadillas',
      'tendones_extensor', 'tendones_flexor', 'tendon_extensor', 'tendon_flexor',
      'epicondilo', 'olecranon', 'tunel_carpo', 'nervio_mediano', 'nervio_cubital', 'retinaculo'
    ],
    'Miembro Inferior': ['cadera', 'muslo', 'rodilla', 'pierna', 'tobillo', 'pie', 'cuadriceps', 'femoral', 'tibial', 'peroneo', 'gemelo', 'soleo', 'aquiles', 'calcaneo', 'metatarsiano', 'menisco', 'lca'],
    'Pelvis': ['pelvis', 'gluteo', 'cresta', 'acetabulo', 'pubis', 'isquion', 'coxis']
  };

  const subRegionKeysMano = ['mano', 'dedo', 'carpo', 'metacarpo', 'metacarpiano', 'falange', 'pulgar', 'tenar', 'grande', 'ganchoso', 'tunel_carpo', 'nervio_mediano', 'escafoides', 'retinaculo', 'pulpejo', 'almohadilla', 'tendones_extensor', 'tendones_flexor', 'semilunar', 'nervio_cubital'];

  const generarBadgesSintomas = (sintomasArray, tamano = '7.5pt') => {
    return (sintomasArray || ['dolor']).map(s => {
      const color = SINTOMAS_COLORES[s] || '#ef4444';
      return `<span style="display:inline-block; margin:1px; background:${color}15; color:${color}; border:1px solid ${color}40; padding:1px 7px; border-radius:10px; font-size:${tamano}; font-weight:700;">${SINTOMAS_NOMBRES[s] || s}</span>`;
    }).join('');
  };

  // 🆕 MEJORA 1: Agrupar datos para combinar celdas con rowspan
  const tablaData = [];
  Object.entries(jerarquia).forEach(([macro, keys]) => {
    const hallazgosMacro = regiones.filter(r => keys.some(k => r.includes(k)));
    if (hallazgosMacro.length === 0) return;

    const subRegiones = {};
    hallazgosMacro.forEach(r => {
      let subRegion = 'General';
      if (subRegionKeysMano.some(k => r.includes(k))) subRegion = 'Mano y Dedos';
      else if (r.includes('muneca')) subRegion = 'Muñeca';
      else if (r.includes('hombro')) subRegion = 'Hombro';
      else if (r.includes('codo')) subRegion = 'Codo';
      else if (r.includes('rodilla') || r.includes('menisco')) subRegion = 'Rodilla';
      else if (r.includes('tobillo')) subRegion = 'Tobillo';
      else if (r.includes('pie') || r.includes('calcaneo')) subRegion = 'Pie';
      else if (r.includes('lumbar') || r.includes('l1')) subRegion = 'Lumbar';
      else if (r.includes('sacro') || r.includes('gluteo')) subRegion = 'Sacro/Glúteo';
      else if (r.includes('trapecio')) subRegion = 'Cuello/Trapecio';

      if (!subRegiones[subRegion]) subRegiones[subRegion] = [];
      subRegiones[subRegion].push(r);
    });

    tablaData.push({
      macro,
      totalMacro: hallazgosMacro.length,
      subRegiones: Object.entries(subRegiones).map(([subName, regs]) => ({
        subName,
        totalSub: regs.length,
        regiones: regs
      }))
    });
  });

  let tablaJerarquicaHTML = '<table style="width:100%; border-collapse: collapse; font-size:9pt; margin-top:10px;">';
  tablaJerarquicaHTML += '<thead><tr><th style="background:#f1f5f9; padding:8px; text-align:left; border:1px solid #cbd5e1; width: 30%;">Región Principal</th><th style="background:#f1f5f9; padding:8px; text-align:left; border:1px solid #cbd5e1; width: 30%;">Sub-región / Estructura</th><th style="background:#f1f5f9; padding:8px; text-align:left; border:1px solid #cbd5e1; width: 40%;">Estructura Afectada</th></tr></thead><tbody>';

  if (tablaData.length === 0) {
    tablaJerarquicaHTML += '<tr><td colspan="3" style="text-align:center; padding:15px; color:#94a3b8; font-style:italic;">No se han registrado regiones afectadas.</td></tr>';
  } else {
    tablaData.forEach(macroData => {
      let isFirstMacroRow = true;
      macroData.subRegiones.forEach(subData => {
        let isFirstSubRow = true;
        subData.regiones.forEach(r => {
          const nombreFormateado = formatearNombreRegion(r);
          let tds = '';

          if (isFirstMacroRow) {
            tds += `<td rowspan="${macroData.totalMacro}" style="padding:8px; border:1px solid #cbd5e1; background:#f8fafc; font-weight:700; vertical-align:middle;">${macroData.macro}</td>`;
            isFirstMacroRow = false;
          }
          if (isFirstSubRow) {
            tds += `<td rowspan="${subData.totalSub}" style="padding:8px; border:1px solid #cbd5e1; color:#475569; vertical-align:middle;">${subData.subName}</td>`;
            isFirstSubRow = false;
          }

          tds += `<td style="padding:8px; border:1px solid #cbd5e1; font-weight:600;">${nombreFormateado}</td>`;
          tablaJerarquicaHTML += `<tr>${tds}</tr>`;
        });
      });
    });
  }
  tablaJerarquicaHTML += '</tbody></table>';

  // === TABLA EVALUACIÓN POR REGIÓN ===
  const tablaRegiones = regiones.map(region => {
    const data = regionesData[region] || {};
    const eva = data.eva !== undefined ? `${data.eva}/10` : '—';
    const sintomasArray = data.sintomas || ['dolor'];
    return {
      region: formatearNombreRegion(region),
      sintomasArray,
      eva,
      rom: data.rom || '—',
      tests: '—',
      obs: data.observaciones || '—',
      notas: data.notas || '—'
    };
  });

  const tablaHTML = tablaRegiones.map(row => `<tr>
    <td style="font-weight:600;">${row.region}</td>
    <td>${generarBadgesSintomas(row.sintomasArray, '7.5pt')}</td>
    <td>${row.eva}</td>
    <td>${row.rom}</td>
    <td>${row.tests}</td>
    <td>${row.obs}</td>
    <td>${row.notas}</td>
  </tr>`).join('');

  // === PLAN DE TRATAMIENTO ===
  let planHTML = '<div style="font-size:9.5pt; line-height:1.55;">';
  if (datosRegiones._plan_tratamiento) {
    corregirTypos(datosRegiones._plan_tratamiento).split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed === '') { planHTML += '<div style="height: 6px;"></div>'; return; }
      if (/^\d+\./.test(trimmed)) { planHTML += `<div style="font-weight: 700; margin-top: 8px; margin-bottom: 3px; color:#0f172a;">${trimmed}</div>`; return; }
      if (trimmed.endsWith(':') && !trimmed.startsWith('-')) { planHTML += `<div style="font-weight: 600; margin-top: 5px; margin-bottom: 2px; margin-left: 15px;">${trimmed}</div>`; return; }
      if (trimmed.startsWith('-') || trimmed.startsWith('•')) { planHTML += `<div style="margin-left: 25px; margin-bottom: 2px;">• ${trimmed.replace(/^[-•]\s*/, '')}</div>`; return; }
      planHTML += `<div style="margin-left: 0px; margin-bottom: 2px;">${trimmed}</div>`;
    });
  } else { planHTML += '<span style="color:#94a3b8; font-style:italic;">No registrado.</span>'; }
  planHTML += '</div>';

  // === HTML FINAL ===
  const contenidoHTML = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><title>${firmaComoTecnico ? 'Evaluación Funcional' : 'Informe Clínico'} - ${nombrePaciente}</title>
      <style>
        @page { size: A4; margin: 1.5cm; }
        body { font-family: 'Calibri', Arial, sans-serif; font-size: 10pt; color: #1e293b; margin: 0; padding: 0; }
        .pagina { page-break-after: always; padding-bottom: 20px; }
        h1 { font-size: 13pt; font-weight: 700; color: #0f172a; border-left: 4px solid #22d3ee; padding-left: 10px; margin-top: 14px; margin-bottom: 6px; text-transform: uppercase; }
        table { width: 100%; border-collapse: collapse; margin: 4px 0; font-size: 9pt; }
        th, td { border: 1px solid #cbd5e1; padding: 4px 6px; }
        th { background-color: #f1f5f9; }
        .alerta { background: #fee2e2; border-left: 4px solid #ef4444; padding: 6px 10px; margin: 6px 0; border-radius: 3px; font-size: 9pt; }
        .stickman-container { display: flex; justify-content: center; gap: 20px; margin: 10px 0; }
        .vista-pro { border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; break-inside: avoid; text-align: center; background: #fff; display:flex; flex-direction:column; justify-content:space-between; }
        .seccion-anatomica { page-break-inside: avoid; break-inside: avoid; margin-top: 20px; }
      </style>
    </head>
    <body>
      <!-- PÁGINA 1 -->
      <div class="pagina">
        <div style="text-align:center; border-bottom:2px solid #22d3ee; padding-bottom:10px; margin-bottom:15px;">
          ${logoBase64 ? `<img src="${logoBase64}" style="max-height:60px; float:left;" />` : ''}
          <h2 style="margin:0; color:#0f172a;">${firmaComoTecnico ? 'Evaluación Funcional y Plan de Ejercicios' : 'Informe de Evaluación Clínica'}</h2>
          <p style="margin:2px 0; color:#64748b; font-size:9pt;">${centroNombre}</p>
          <p style="margin:2px 0; font-size:9pt;">Paciente: ${nombrePaciente} | Fecha: ${fecha}</p>
        </div>

        <h1>1. Datos del Paciente</h1>
        <table>
          <tr><th>Campo</th><th>Valor</th></tr>
          ${evaluacion.edad ? `<tr><td>Edad</td><td>${evaluacion.edad}</td></tr>` : ''}
          ${evaluacion.sexo ? `<tr><td>Sexo</td><td>${evaluacion.sexo}</td></tr>` : ''}
          ${evaluacion.telefono ? `<tr><td>Teléfono</td><td>${evaluacion.telefono}</td></tr>` : ''}
          ${evaluacion.direccion ? `<tr><td>Dirección</td><td>${evaluacion.direccion}</td></tr>` : ''}
        </table>

        <h1>2. Motivo de Consulta</h1>
        <p>${evaluacion.motivo_consulta || 'No registrado'}</p>

        <h1>3. Antecedentes</h1>
        <table>
          ${evaluacion.antecedentes_medicos ? `<tr><th>Antecedentes médicos</th><td>${evaluacion.antecedentes_medicos}</td></tr>` : ''}
          ${evaluacion.alergias ? `<tr><th>Alergias</th><td>${evaluacion.alergias}</td></tr>` : ''}
          ${evaluacion.medicamentos ? `<tr><th>Medicamentos</th><td>${evaluacion.medicamentos}</td></tr>` : ''}
          ${evaluacion.cirugias_previas ? `<tr><th>Cirugías previas</th><td>${evaluacion.cirugias_previas}</td></tr>` : ''}
        </table>
      </div>

      <!-- PÁGINA 2 -->
      <div class="pagina">
        <h1>4. Evaluación del Dolor</h1>
        <table>
          <tr><th>Intensidad en reposo (EVA)</th><td>${evaluacion.intensidad_reposo || 0} / 10</td></tr>
          <tr><th>Intensidad en actividad (EVA)</th><td>${evaluacion.intensidad_actividad || 0} / 10</td></tr>
        </table>

        <h1>5. Regiones Afectadas</h1>
        ${tablaJerarquicaHTML}

        <div class="stickman-container">${stickmanAnterior}${stickmanPosterior}</div>
        ${leyendaSintomasHTML()}

        <h1>6. Evaluación por Región</h1>
        <table>
          <thead><tr>
            <th style="width:19%;">Región</th>
            <th style="width:17%; font-size:8pt; line-height:1.15;">
              Hallazgo<br/>
              <span style="font-size:7pt; font-weight:500; color:#64748b;">/ Síntomas</span>
            </th>
            <th style="width:7%;">EVA</th>
            <th style="width:9%;">ROM</th>
            <th style="width:13%;">Tests</th>
            <th style="width:17%;">Observaciones</th>
            <th style="width:18%;">Notas</th>
          </tr></thead>
          <tbody>${tablaHTML}</tbody>
        </table>

        <div class="seccion-anatomica">
          <h1>6.5 Detalle Anatómico</h1>
          <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:15px;">
            ${vistaProHTML}
          </div>
        </div>

        <div class="seccion-anatomica">
          <h1>7. Recomendaciones Generales</h1>
          <div style="font-size:9.5pt;">${corregirTypos(datosRegiones._recomendaciones) || 'No registradas.'}</div>
        </div>
      </div>

      <!-- PÁGINA 3 -->
      <div class="pagina">
        <h1>${firmaComoTecnico ? '8. Plan de Ejercicios Terapéuticos' : '8. Plan de Tratamiento Fisioterapéutico'}</h1>
        ${firmaComoTecnico ? `<p style="font-size:8.5pt; color:#78350f; background:#fef3c7; padding:5px 8px; border-radius:4px; margin-bottom:6px;"><strong>Nota:</strong> Los agentes físicos y técnicas manuales aquí descritos son <strong>sugerencias de aplicación</strong> basadas en protocolos estándar. Su aplicación está sujeta a validación por un <strong>Lic. T.M. Fisioterapia</strong>.</p>` : ''}
        ${planHTML}

        <h1>9. Alertas de Seguridad</h1>
        <div class="alerta">${corregirTypos(datosRegiones._alertas) || 'Sin alertas específicas.'}</div>

        <h1>10. Datos de Generación</h1>
        <table>
          <tr><th>Documento generado por</th><td>${usuario}</td></tr>
          <tr><th>Tipo de profesional</th><td>${firmaComoTecnico ? 'Técnico en Fisioterapia y Rehabilitación' : 'Licenciado en Tecnología Médica - Fisioterapia'}</td></tr>
          <tr><th>Fecha de generación</th><td>${fecha}</td></tr>
          <tr><th>Centro</th><td>${centroNombre}</td></tr>
        </table>

        <div style="margin-top:40px; text-align:right;">
          <p style="margin:0 0 30px 0;">Firma del Profesional:</p>
          <p style="border-top:1px solid #000; display:inline-block; padding-top:5px; min-width:250px; font-weight:bold;">${usuario}</p>
          <p style="margin:2px 0 0 0; font-size:8.5pt; color:#64748b;">${credenciales}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const ventana = window.open('', '_blank', 'width=800,height=600');
  if (ventana) {
    ventana.document.write(contenidoHTML);
    ventana.document.close();
    setTimeout(() => { ventana.print(); }, 800);
  } else { alert('Permite las ventanas emergentes.'); }
}