// src/utils/generarInforme.js
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { supabase } from '../lib/supabaseClient';
import { TIPOS_FORMULARIO } from '../components/clinica/Formularios/plantillas';

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

// ============================================================
// HELPERS
// ============================================================
const normalizarDatosRegiones = (dr) => {
  if (!dr || typeof dr !== 'object') return { regiones: {}, _meta: {} };
  if (dr.regiones && typeof dr.regiones === 'object') return { regiones: dr.regiones, _meta: dr._meta || {} };
  const regiones = {}; const _meta = {};
  Object.entries(dr).forEach(([key, val]) => { if (key.startsWith('_')) _meta[key] = val; else regiones[key] = val; });
  return { regiones, _meta };
};

// 🆕 FASE 1A: Helpers de claves bilaterales (__izq / __der)
// - Puro parseo, NO modifican datos.
// - Retrocompatibles: si la clave no tiene sufijo, devuelve el `lado` del data object.
const SIDE_SUFFIX = { izquierdo: '__izq', derecho: '__der' };

const parseRegionKey = (key, data) => {
  if (typeof key !== 'string') return { baseId: key, lado: data?.lado || null, isSuffixed: false };
  if (key.endsWith('__izq')) return { baseId: key.slice(0, -5), lado: 'izquierdo', isSuffixed: true };
  if (key.endsWith('__der')) return { baseId: key.slice(0, -5), lado: 'derecho', isSuffixed: true };
  return { baseId: key, lado: data?.lado || null, isSuffixed: false };
};

const buildRegionKey = (baseId, lado) => {
  if (!lado) return baseId;
  return `${baseId}${SIDE_SUFFIX[lado] || ''}`;
};
// 🆕 Clasificación de IMC con color
const clasificarIMC = (imc) => {
  const n = parseFloat(imc);
  if (isNaN(n)) return null;
  if (n < 18.5) return { nivel: 'amarilla', msg: 'Bajo peso', color: '#f59e0b' };
  if (n < 25) return { nivel: 'verde', msg: 'Normal', color: '#10b981' };
  if (n < 30) return { nivel: 'amarilla', msg: 'Sobrepeso', color: '#f59e0b' };
  return { nivel: 'roja', msg: 'Obesidad', color: '#ef4444' };
};

const SINTOMAS_COLORES = { dolor: '#ef4444', inflamacion: '#f59e0b', neuropatia: '#a855f7', rigidez: '#22d3ee' };
const SINTOMAS_NOMBRES = { dolor: 'Dolor', inflamacion: 'Inflamación', neuropatia: 'Neuropatía', rigidez: 'Rigidez' };
const PRIORIDAD_FILL = ['inflamacion', 'dolor', 'neuropatia', 'rigidez'];

const calcularColoresAfectacion = (sintomasArray) => {
  const arr = (sintomasArray && sintomasArray.length) ? sintomasArray : ['dolor'];
  const fillSymptom = PRIORIDAD_FILL.find(s => arr.includes(s)) || arr[0];
  const borderSymptom = arr.find(s => s !== fillSymptom) || fillSymptom;
  return {
    fillSymptom, borderSymptom,
    color: SINTOMAS_COLORES[fillSymptom] || '#ef4444',
    border: SINTOMAS_COLORES[borderSymptom] || '#ef4444',
  };
};

// 🆕 Mapa de etiquetas para banderas rojas (duplicado de RedFlagsForm)
const BANDERAS_ROJAS_LABELS = {
  cancer: 'Antecedente de cáncer (últimos 5 años)',
  anticoagulantes: 'Uso de anticoagulantes',
  marcapasos: 'Marcapasos o dispositivo implantado',
  cirugia_reciente: 'Cirugía reciente (<6 semanas)',
  perdida_peso: 'Pérdida de peso inexplicable (>3 meses)',
  fiebre_persistente: 'Fiebre o sudoración nocturna persistente',
  embarazo: 'Embarazo o sospecha de embarazo',
  deficit_motor: 'Pérdida de fuerza o sensibilidad progresiva',
  deficit_neuro: 'Déficit neurológico progresivo',
  trauma: 'Trauma grave reciente',
  cronico_peso: 'Pérdida de peso inexplicable asociada al dolor',
  esfinteres: 'Pérdida de control de esfínteres',
  silla_montar: 'Alteración de sensibilidad en silla de montar',
  deficit_mmii: 'Déficit neurológico progresivo en MMII',
  rigidez_nuca: 'Rigidez de nuca intensa con fiebre',
};

// 🆕 Orden anatómico top-down (cabeza → pies)
const PRIORIDAD_ANATOMICA = {
  // Cabeza y cuello (1-19)
  'cabeza': 1, 'craneo': 1, 'frontal': 1, 'parietal': 1, 'temporal': 2, 'temporal_musc': 2,
  'occipital': 2, 'occipital_mayor': 2, 'zigomatico': 3, 'masetero': 3, 'atm': 3, 'ecom': 4,
  'mandibula': 3, 'cuello': 5, 'nuca': 5, 'trapecio_sup': 6, 'trapecio': 6, 'trapecio_der': 6, 'trapecio_izq': 6,
  // Hombro / escápula (20-29)
  'hombro': 20, 'acromion': 21, 'clavicula': 21, 'escapula': 22, 'deltoides': 23,
  'deltoides_ant': 23, 'deltoides_post': 23, 'deltoides_izq': 23, 'deltoides_der': 23,
  'manguito': 24, 'manguito_ant': 24, 'manguito_post': 24, 'elevador_escapula': 25,
  // Brazo / codo / antebrazo / mano (30-49)
  'brazo': 30, 'biceps': 31, 'triceps': 32, 'braquial': 32, 'humero': 33,
  'codo': 35, 'olecranon': 36, 'epicondilo': 36, 'antebrazo': 37,
  'muneca': 40, 'carpo': 41, 'metacarpo': 42, 'metacarpiano': 42,
  'mano': 43, 'tenar': 44, 'pulgar': 45,
  'dedo': 46, 'falange': 46, 'pulpejo': 47, 'pulpejos': 47,
  'almohadilla_palmar': 47, 'almohadilla_palmares': 47,
  'tendones_flexor': 48, 'tendones_extensor': 48,
  'nervio_mediano': 49, 'nervio_cubital': 49, 'nervio_radial': 49,
  'tunel_carpo': 49, 'retinaculo': 49, 'escafoides': 42, 'grande': 42, 'ganchoso': 42,
  // Tórax / columna (50-69)
  'torax': 50, 'pecho': 50, 'costilla': 51, 'costillas': 51, 'esternon': 52,
  'pectoral': 53, 'serrato': 54,
  'cervical': 55, 'dorsal': 56, 'columna_dorsal': 56, 'dorsal_ancho': 56,
  'columna': 57, 'lumbar': 58, 'l1': 58, 'l2': 58, 'l3': 58, 'l4': 58, 'l5': 59,
  'disco_l': 59, 'faceta_l': 59,
  // Pelvis / cadera (70-79)
  'pelvis': 70, 'sacro': 71, 'coxis': 72, 'ilion': 73, 'isquion': 73,
  'pubis': 74, 'cresta_iliaca': 74, 'acetabulo': 75,
  'cadera': 76, 'gluteo': 77, 'gluteo_mayor': 77, 'gluteo_medio': 77, 'gluteo_izq': 77, 'gluteo_der': 77,
  // Muslo / rodilla (80-89)
  'muslo': 80, 'cuadriceps': 81, 'recto_femoral': 81, 'isquiotibial': 82, 'femoral': 82,
  'aductor': 83, 'adductor': 83,
  'rodilla': 85, 'rotula': 86, 'patelar': 86, 'tendon_patelar': 86,
  'lca': 87, 'lcp': 87, 'lcm': 87, 'lcl': 87, 'menisco': 87, 'menisco_lat': 87, 'menisco_med': 87,
  'poplitea': 88, 'fosa_poplitea': 88,
  // Pierna / tobillo (90-99)
  'pierna': 90, 'tibial': 91, 'tibial_ant': 91, 'tibial_post': 91,
  'perone': 92, 'peroneo': 92, 'gemelo': 93, 'gemelo_lat': 93, 'gemelo_med': 93, 'soleo': 94,
  'aquiles': 95, 'tendon_aquiles': 95,
  // Tobillo (100-109)
  'tobillo': 100,
  // Pie (110-119)
  'pie': 110, 'calcaneo': 111, 'talon': 111, 'talon_plantar': 111, 'retropie': 111,
  'astragalo': 112, 'mediopie': 113, 'navicular': 114, 'cuboides': 114, 'cuneiforme': 114,
  'metatarsiano': 115, 'metatarsianos_plantar': 115,
  'antepie': 116, 'hallux': 117,
  'dedo_pie': 118, 'falanges_plantar': 118, 'falanges_lateral': 118,
  'almohadilla_metatarsal': 119,
};

const prioridadAnatomica = (region) => {
  const r = (region || '').toLowerCase();
  for (const key of Object.keys(PRIORIDAD_ANATOMICA).sort((a, b) => b.length - a.length)) {
    if (matcheaKeyword(r, key)) return PRIORIDAD_ANATOMICA[key];
  }
  return 999;
};

const ordenarPorAnatomia = (arr) => [...arr].sort((a, b) => prioridadAnatomica(a) - prioridadAnatomica(b));

// 🆕 MAPA MAESTRO: cada región → su macro-región EXACTA (elimina duplicados)
const MACRO_REGION_MAP = {
  // Cabeza y Cuello
  'cabeza': 'Cabeza y Cuello', 'craneo': 'Cabeza y Cuello', 'frontal': 'Cabeza y Cuello', 'parietal': 'Cabeza y Cuello',
  'temporal': 'Cabeza y Cuello', 'temporal_musc': 'Cabeza y Cuello', 'occipital': 'Cabeza y Cuello', 'occipital_mayor': 'Cabeza y Cuello',
  'zigomatico': 'Cabeza y Cuello', 'masetero': 'Cabeza y Cuello', 'atm': 'Cabeza y Cuello', 'mandibula': 'Cabeza y Cuello',
  'ecom': 'Cabeza y Cuello', 'cuello': 'Cabeza y Cuello', 'nuca': 'Cabeza y Cuello',
  'trapecio': 'Cabeza y Cuello', 'trapecio_sup': 'Cabeza y Cuello', 'trapecio_der': 'Cabeza y Cuello', 'trapecio_izq': 'Cabeza y Cuello',

  // Tórax / Tronco
  'torax': 'Tórax / Tronco', 'pecho': 'Tórax / Tronco', 'costilla': 'Tórax / Tronco', 'costillas': 'Tórax / Tronco',
  'esternon': 'Tórax / Tronco', 'pectoral': 'Tórax / Tronco', 'serrato': 'Tórax / Tronco', 'abdomen': 'Tórax / Tronco',

  // Columna
  'cervical': 'Columna', 'dorsal': 'Columna', 'columna_dorsal': 'Columna', 'dorsal_ancho': 'Columna', 'columna': 'Columna',
  'lumbar': 'Columna', 'l1': 'Columna', 'l2': 'Columna', 'l3': 'Columna', 'l4': 'Columna', 'l5': 'Columna',
  'disco_l': 'Columna', 'faceta_l': 'Columna', 'sacro': 'Columna', 'coxis': 'Columna',

  // Miembro Superior (hombro + brazo + codo + muñeca + mano + dedos + nervios)
  'hombro': 'Miembro Superior', 'acromion': 'Miembro Superior', 'clavicula': 'Miembro Superior', 'escapula': 'Miembro Superior',
  'deltoides': 'Miembro Superior', 'manguito': 'Miembro Superior', 'elevador_escapula': 'Miembro Superior',
  'brazo': 'Miembro Superior', 'biceps': 'Miembro Superior', 'triceps': 'Miembro Superior', 'braquial': 'Miembro Superior',
  'coracobraquial': 'Miembro Superior', 'humero': 'Miembro Superior',
  'codo': 'Miembro Superior', 'olecranon': 'Miembro Superior', 'epicondilo': 'Miembro Superior', 'antebrazo': 'Miembro Superior',
  'muneca': 'Miembro Superior', 'carpo': 'Miembro Superior', 'metacarpo': 'Miembro Superior', 'metacarpiano': 'Miembro Superior',
  'mano': 'Miembro Superior', 'tenar': 'Miembro Superior', 'pulgar': 'Miembro Superior',
  'dedo': 'Miembro Superior', 'falange': 'Miembro Superior', 'pulpejo': 'Miembro Superior', 'pulpejos': 'Miembro Superior',
  'almohadilla_palmar': 'Miembro Superior', 'almohadillas_palmar': 'Miembro Superior',
  'almohadilla_palmares': 'Miembro Superior', 'almohadillas_palmares': 'Miembro Superior',
  'tendones_flexor': 'Miembro Superior', 'tendones_extensor': 'Miembro Superior',
  'tendon_flexor': 'Miembro Superior', 'tendon_extensor': 'Miembro Superior',
  'nervio_mediano': 'Miembro Superior', 'nervio_cubital': 'Miembro Superior', 'nervio_radial': 'Miembro Superior',
  'nervio_musculocutaneo': 'Miembro Superior', 'tunel_carpo': 'Miembro Superior', 'retinaculo': 'Miembro Superior',
  'escafoides': 'Miembro Superior', 'grande': 'Miembro Superior', 'ganchoso': 'Miembro Superior',
  'semilunar': 'Miembro Superior', 'piramidal': 'Miembro Superior', 'pisiforme': 'Miembro Superior', 'trapezoide': 'Miembro Superior',

  // Pelvis
  'pelvis': 'Pelvis', 'ilion': 'Pelvis', 'isquion': 'Pelvis', 'pubis': 'Pelvis', 'cresta_iliaca': 'Pelvis',
  'acetabulo': 'Pelvis', 'cadera': 'Pelvis', 'gluteo': 'Pelvis', 'gluteo_mayor': 'Pelvis', 'gluteo_medio': 'Pelvis',

  // Miembro Inferior
  'muslo': 'Miembro Inferior', 'cuadriceps': 'Miembro Inferior', 'recto_femoral': 'Miembro Inferior',
  'isquiotibial': 'Miembro Inferior', 'femoral': 'Miembro Inferior', 'aductor': 'Miembro Inferior', 'adductor': 'Miembro Inferior',
  'rodilla': 'Miembro Inferior', 'rotula': 'Miembro Inferior', 'patelar': 'Miembro Inferior', 'tendon_patelar': 'Miembro Inferior',
  'lca': 'Miembro Inferior', 'lcp': 'Miembro Inferior', 'lcm': 'Miembro Inferior', 'lcl': 'Miembro Inferior',
  'menisco': 'Miembro Inferior', 'poplitea': 'Miembro Inferior', 'fosa_poplitea': 'Miembro Inferior',
  'pierna': 'Miembro Inferior', 'tibial': 'Miembro Inferior', 'perone': 'Miembro Inferior', 'peroneo': 'Miembro Inferior',
  'gemelo': 'Miembro Inferior', 'soleo': 'Miembro Inferior',
  'aquiles': 'Miembro Inferior', 'tendon_aquiles': 'Miembro Inferior', 'tobillo': 'Miembro Inferior',
  'pie': 'Miembro Inferior', 'calcaneo': 'Miembro Inferior', 'talon': 'Miembro Inferior', 'talon_plantar': 'Miembro Inferior',
  'retropie': 'Miembro Inferior', 'astragalo': 'Miembro Inferior', 'mediopie': 'Miembro Inferior',
  'navicular': 'Miembro Inferior', 'cuboides': 'Miembro Inferior', 'cuneiforme': 'Miembro Inferior',
  'metatarsiano': 'Miembro Inferior', 'metatarsianos_plantar': 'Miembro Inferior',
  'antepie': 'Miembro Inferior', 'hallux': 'Miembro Inferior', 'dedo_pie': 'Miembro Inferior',
  'falanges_plantar': 'Miembro Inferior', 'almohadilla_metatarsal': 'Miembro Inferior',
  'patela': 'Miembro Inferior', 'femur': 'Miembro Inferior', 'semitendinoso_membranoso': 'Miembro Inferior',
  'tensor_fascia_lata': 'Miembro Inferior', 'fascia_plantar': 'Miembro Inferior',
};

// 🆕 MAPA MAESTRO: cada región → su SUB-región específica (elimina "General")
const SUBREGION_MAP = {
  // Cabeza y Cuello
  'cabeza': 'Cráneo', 'craneo': 'Cráneo', 'frontal': 'Cráneo', 'parietal': 'Cráneo',
  'occipital': 'Cráneo', 'occipital_mayor': 'Cráneo', 'suboccipitales': 'Cráneo',
  'temporal': 'Cara', 'temporal_musc': 'Cara', 'zigomatico': 'Cara', 'masetero': 'Cara', 'atm': 'Cara', 'mandibula': 'Cara',
  'ecom': 'Cuello', 'cuello': 'Cuello', 'nuca': 'Cuello',
  'trapecio': 'Cuello/Trapecio', 'trapecio_sup': 'Cuello/Trapecio', 'trapecio_der': 'Cuello/Trapecio', 'trapecio_izq': 'Cuello/Trapecio',

  // Tórax / Tronco
  'torax': 'Pecho', 'pecho': 'Pecho', 'esternon': 'Pecho', 'pectoral': 'Pecho',
  'costilla': 'Costillas', 'costillas': 'Costillas', 'serrato': 'Costillas',
  'abdomen': 'Abdomen',

  // Columna
  'cervical': 'Cervical', 'dorsal': 'Dorsal', 'columna_dorsal': 'Dorsal', 'dorsal_ancho': 'Dorsal',
  'columna': 'Columna',
  'lumbar': 'Lumbar', 'l1': 'Lumbar', 'l2': 'Lumbar', 'l3': 'Lumbar', 'l4': 'Lumbar', 'l5': 'Lumbar',
  'disco_l': 'Lumbar', 'faceta_l': 'Lumbar',
  'sacro': 'Sacro', 'coxis': 'Sacro',

  // Miembro Superior
  'hombro': 'Hombro', 'acromion': 'Hombro', 'clavicula': 'Hombro', 'escapula': 'Hombro',
  'deltoides': 'Hombro', 'manguito': 'Hombro', 'elevador_escapula': 'Hombro',
  'brazo': 'Brazo', 'biceps': 'Brazo', 'triceps': 'Brazo', 'braquial': 'Brazo', 'coracobraquial': 'Brazo', 'humero': 'Brazo',
  'codo': 'Codo', 'olecranon': 'Codo', 'epicondilo': 'Codo',
  'antebrazo': 'Antebrazo',
  'muneca': 'Muñeca', 'carpo': 'Muñeca', 'tunel_carpo': 'Muñeca', 'retinaculo': 'Muñeca',
  'escafoides': 'Muñeca', 'grande': 'Muñeca', 'ganchoso': 'Muñeca', 'semilunar': 'Muñeca',
  'piramidal': 'Muñeca', 'pisiforme': 'Muñeca', 'trapezoide': 'Muñeca',
  'mano': 'Mano', 'tenar': 'Mano', 'pulgar': 'Mano', 'metacarpo': 'Mano', 'metacarpiano': 'Mano',
  'almohadilla_palmar': 'Mano', 'almohadillas_palmar': 'Mano',
  'almohadilla_palmares': 'Mano', 'almohadillas_palmares': 'Mano',
  'tendones_flexor': 'Mano', 'tendones_extensor': 'Mano', 'tendon_flexor': 'Mano', 'tendon_extensor': 'Mano',
  'dedo': 'Dedos', 'falange': 'Dedos', 'pulpejo': 'Dedos', 'pulpejos': 'Dedos',
  'nervio_mediano': 'Nervios', 'nervio_cubital': 'Nervios', 'nervio_radial': 'Nervios', 'nervio_musculocutaneo': 'Nervios',

  // Pelvis
  'pelvis': 'Pelvis', 'ilion': 'Pelvis', 'isquion': 'Pelvis', 'pubis': 'Pelvis', 'cresta_iliaca': 'Pelvis', 'acetabulo': 'Pelvis',
  'cadera': 'Cadera',
  'gluteo': 'Glúteo', 'gluteo_mayor': 'Glúteo', 'gluteo_medio': 'Glúteo',

  // Miembro Inferior
  'muslo': 'Muslo', 'cuadriceps': 'Muslo', 'recto_femoral': 'Muslo',
  'isquiotibial': 'Muslo', 'femoral': 'Muslo', 'aductor': 'Muslo', 'adductor': 'Muslo',
  'rodilla': 'Rodilla', 'rotula': 'Rodilla', 'patelar': 'Rodilla', 'tendon_patelar': 'Rodilla',
  'lca': 'Rodilla', 'lcp': 'Rodilla', 'lcm': 'Rodilla', 'lcl': 'Rodilla', 'menisco': 'Rodilla',
  'poplitea': 'Fosa Poplítea', 'fosa_poplitea': 'Fosa Poplítea',
  'pierna': 'Pierna', 'tibial': 'Pierna', 'perone': 'Pierna', 'peroneo': 'Pierna', 'gemelo': 'Pierna', 'soleo': 'Pierna',
  'aquiles': 'Tobillo', 'tendon_aquiles': 'Tobillo', 'tobillo': 'Tobillo',
  'pie': 'Pie', 'calcaneo': 'Pie', 'talon': 'Pie', 'talon_plantar': 'Pie', 'retropie': 'Pie',
  'astragalo': 'Pie', 'mediopie': 'Pie', 'navicular': 'Pie', 'cuboides': 'Pie', 'cuneiforme': 'Pie',
  'metatarsiano': 'Pie', 'metatarsianos_plantar': 'Pie', 'antepie': 'Pie', 'hallux': 'Pie', 'dedo_pie': 'Pie',
  'falanges_plantar': 'Pie', 'almohadilla_metatarsal': 'Pie',
  'patela': 'Rodilla', 'femur': 'Muslo', 'semitendinoso_membranoso': 'Muslo',
  'tensor_fascia_lata': 'Muslo', 'fascia_plantar': 'Pie',
};

// 🆕 Funciones auxiliares
const obtenerMacroRegion = (region) => {
  const { baseId } = parseRegionKey(region, null);   // 🆕 FASE 1A
  const r = (baseId || '').toLowerCase();
  const keys = Object.keys(MACRO_REGION_MAP).sort((a, b) => b.length - a.length);
  for (const key of keys) if (r.includes(key)) return MACRO_REGION_MAP[key];
  return 'Otros';
};

// 🆕 TAREA 3: Matcher estricto para evitar falsos positivos (ej: 'calcaneo' contiene 'lca')
const matcheaKeyword = (key, keyword) => {
  if (!key || !keyword) return false;
  if (key === keyword) return true;
  if (key.startsWith(keyword + '_')) return true;
  if (key.endsWith('_' + keyword)) return true;
  if (key.includes('_' + keyword + '_')) return true;
  return false;
};

const obtenerSubRegion = (region) => {
  const { baseId } = parseRegionKey(region, null);   // 🆕 FASE 1A
  const r = (baseId || '').toLowerCase();
  const keys = Object.keys(SUBREGION_MAP).sort((a, b) => b.length - a.length);
  for (const key of keys) if (matcheaKeyword(r, key)) return SUBREGION_MAP[key];
  return 'Otras';
};

// 🆕 QR sin librería externa (usa API pública de qrserver)
const URL_APP = 'https://cj-project-86im.vercel.app';
// 🆕 FASE 1B.2: Tamaño por defecto aumentado a 200
const generarQR = (url, size = 200) => `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&bgcolor=ffffff&color=0f172a&margin=0`;

// 🆕 Numerar recomendaciones automáticamente
const numerarRecomendaciones = (texto) => {
  if (!texto) return '';
  const lineas = texto.split('\n').map(l => l.trim()).filter(Boolean);
  const yaNumerado = lineas.every(l => /^\d+\./.test(l) || /^[A-Z]\./.test(l));
  if (yaNumerado) return texto;

  return lineas.map((l, idx) => {
    const sinBullet = l.replace(/^[-•]\s*/, '').trim();
    if (!sinBullet) return '';
    return `${idx + 1}. ${sinBullet}`;
  }).join('\n');
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

// 🆕 Helpers para tablas condicionales
const val = (v) => (v === undefined || v === null || v === '') ? null : v;
const filaSi = (label, valor) => val(valor) ? `<tr><th>${label}</th><td>${valor}</td></tr>` : '';
const tieneContenido = (obj) => obj && Object.keys(obj).length > 0;

// 🆕 Acentos correctos
const ACENTOS_REGION = {
  'clavicula': 'Clavícula', 'escapula': 'Escápula', 'rotula': 'Rótula',
  'calcaneo': 'Calcáneo', 'astragalo': 'Astrágalo', 'zigomatico': 'Zigomático',
  'femur': 'Fémur', 'perone': 'Peroné', 'cubito': 'Cúbito',
  'epitroclea': 'Epitróclea', 'musculocutaneo': 'Musculocutáneo',
  'cuadriceps': 'Cuádriceps', 'soleo': 'Sóleo', 'isquion': 'Isquion',
  'ilion': 'Ilion', 'coxis': 'Coxis', 'poplitea': 'Poplítea',
  'masetero': 'Masetero', 'ecom': 'ECOM', 'atm': 'ATM',
  'menisco': 'Menisco', 'isquiotibial': 'Isquiotibial',
  'semitendinoso': 'Semitendinoso', 'seminembranoso': 'Semimembranoso',
  'gastrocnemio': 'Gastrocnemio', 'gemelo': 'Gemelo',
  'trapecio': 'Trapecio', 'deltoides': 'Deltoides', 'romboide': 'Romboides',
  'esplenio': 'Esplenio', 'angular': 'Angular',
};

// 🆕 Regiones femeninas (para concordancia Izquierda/Derecha)
const REGIONES_FEMENINAS = new Set([
  'clavicula', 'escapula', 'rotula', 'patela', 'mano', 'pierna', 'rodilla',
  'tibia', 'fibula', 'perone', 'fosa', 'poplitea', 'costilla', 'costillas',
  'falange', 'falanges', 'cresta', 'cabeza', 'columna', 'pelvis',
  'oreja', 'ceja', 'boca', 'nariz', 'frente', 'mandibula', 'atm',
  'articulacion', 'vertebra', 'cintura', 'espalda', 'cadera', 'muneca',
  'aponeurosis', 'pupila', 'cornea', 'sindesmosis', 'cintura_escapular',
  'cintura_pelvica', 'planta', 'boveda', 'cúpula', 'cupula',
]);

// 🆕 Corrige la concordancia: "Clavícula Izquierdo" → "Clavícula Izquierda"
const corregirConcordancia = (nombre) => {
  return nombre.replace(
    /([A-Za-zÁÉÍÓÚáéíóúñÑ]+(?:\s+[A-Za-zÁÉÍÓÚáéíóúñÑ]+)*?)\s+(Izquierdo|Derecho)\b/g,
    (match, sustantivos, sufijo) => {
      const palabras = sustantivos.toLowerCase().split(/\s+/);
      const nucleo = palabras[palabras.length - 1];
      const esFem = REGIONES_FEMENINAS.has(nucleo);
      if (sufijo === 'Izquierdo') return `${sustantivos} ${esFem ? 'Izquierda' : 'Izquierdo'}`;
      return `${sustantivos} ${esFem ? 'Derecha' : 'Derecho'}`;
    }
  );
};

const añadirLado = (nombre, lado) => {
  if (!lado) return nombre;
  if (/\b(Izquierdo|Izquierda|Derecho|Derecha)\b/.test(nombre)) return nombre;
  // 🆕 Normalizar tildes para comparar con REGIONES_FEMENINAS (que está sin tildes)
  const quitarTildes = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const palabras = nombre.split(/\s+/);
  const nucleo = quitarTildes(palabras[palabras.length - 1]);
  const esFem = REGIONES_FEMENINAS.has(nucleo);
  if (lado === 'izquierdo') return `${nombre} ${esFem ? 'Izquierda' : 'Izquierdo'}`;
  if (lado === 'derecho') return `${nombre} ${esFem ? 'Derecha' : 'Derecho'}`;
  return nombre;
};


const formatearNombreRegion = (nombre) => {
  // 🆕 Casos específicos con prioridad
  const casosEspecificos = {
    'fosa_poplitea': 'Fosa Poplítea',
    'zigomatico': 'Zigomático',
    'temporal_musc': 'Temporal',
    'occipital_mayor': 'Occipital Mayor',
    'dorsal_ancho_der': 'Dorsal Ancho Derecho',
    'dorsal_ancho_izq': 'Dorsal Ancho Izquierdo',
    'elevador_escapula': 'Elevador de la Escápula',
    'nervio_radial': 'Nervio Radial',
    'nervio_musculocutaneo': 'Nervio Musculocutáneo',
    'biceps_cabeza_corta': 'Bíceps Cabeza Corta',
    'biceps_cabeza_larga': 'Bíceps Cabeza Larga',
    'triceps_cabeza_medial': 'Tríceps Cabeza Medial',
    'almohadilla_metatarsal': 'Almohadilla Metatarsal',
    'serrato_izq': 'Serrato Izquierdo',
    'costillas_izq': 'Costillas Izquierdas',
  };
  const { baseId: nombreBase } = parseRegionKey(nombre, null);   // 🆕 FASE 1A
  if (casosEspecificos[nombreBase]) return casosEspecificos[nombreBase];

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
    'atm': 'ATM', 'ecom': 'ECOM', 'masetero': 'Masetero',
    'astragalo': 'Astrágalo', 'cuneiforme': 'Cuneiforme', 'cuboides': 'Cuboides', 'navicular': 'Navicular',
    'recto_femoral': 'Recto Femoral', 'aductor': 'Aductor', 'adductor': 'Aductor',
    'perone': 'Peroneo', 'tibial_ant': 'Tibial Anterior', 'tibial_post': 'Tibial Posterior',
  };
  let resultado = nombreBase;   // 🆕 FASE 1A (antes: nombre)
  Object.keys(map).forEach(key => { resultado = resultado.replace(new RegExp(`_${key}(_|$)`, 'g'), ` ${map[key]}$1`); });
  resultado = resultado.split('_').map(p => map[p] ? map[p] : p.charAt(0).toUpperCase() + p.slice(1)).join(' ').trim();

  // 🆕 Aplicar acentos correctos palabra por palabra
  resultado = resultado.split(' ').map(palabra => {
    const key = palabra.toLowerCase();
    return ACENTOS_REGION[key] || palabra;
  }).join(' ');

  // 🆕 Corregir concordancia de género
  resultado = corregirConcordancia(resultado);

  return resultado;
};

// ============================================================
// FUNCIÓN PRINCIPAL
// ============================================================
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
  // 🆕 FASE 1B.2: Precargar el QR como Base64 para evitar que salga en blanco en móviles
  const qrBase64 = await urlToBase64(generarQR(`${URL_APP}/login?redirect=/mi-ficha`));

  const nombrePaciente = pacienteData ? `${pacienteData.nombre} ${pacienteData.apellidos}` : 'Paciente';
  const fecha = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const hora = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  const usuario = perfil?.nombre_completo || 'Usuario';
  const credenciales = firmaComoTecnico
    ? `Técnico en Fisioterapia y Rehabilitación — DNI: ${perfil?.dni || ''}`
    : `Lic. T.M. Fisioterapia — C.T.M.P. N° ${perfil?.numero_colegiatura || ''}`;

  const regiones = evaluacion.regiones || [];
  const dataNorm = normalizarDatosRegiones(evaluacion.datos_regiones);
  const meta = dataNorm._meta;
  const regionesData = dataNorm.regiones;

  // ============================================================
  // 🆕 EXTRACCIÓN UNIFICADA DE TODOS LOS DATOS CLÍNICOS
  // (con fallbacks porque en tu BD hay datos en múltiples rutas)
  // ============================================================
  const sv = meta._signos_vitales || {};

  const habitos = meta._habitos || sv.habitos || evaluacion.habitos || {};
  const gineco = meta._gineco_obstetricos || sv.gineco_obstetricos || evaluacion.gineco_obstetricos || {};
  const uro = meta._urologicos || sv.urologicos || evaluacion.urologicos || {};
  const hijos = meta._hijos || evaluacion.hijos || [];
  const contactos = meta._contactos_emergencia || evaluacion.contactos_emergencia || [];
  const antFamiliares = sv.antecedentes_familiares || meta._antecedentes_familiares || evaluacion.antecedentes_familiares || [];
  const antFamiliaresOtros = sv.antecedentes_familiares_otros || meta._antecedentes_familiares_otros || evaluacion.antecedentes_familiares_otros || '';
  const camposExtra = meta._campos_extra || {};
  const banderasRojas = meta._banderas_rojas || evaluacion.banderas_rojas || [];
  const notasClinicas = meta._notas_clinicas || evaluacion.notas_clinicas || '';
  const calidadSuenio = val(meta._calidad_suenio) ?? val(sv.calidad_suenio) ?? val(evaluacion.calidad_suenio);
  const nivelDeportivo = val(meta._nivel_deportivo) || val(sv.nivel_deportivo) || val(evaluacion.nivel_deportivo);
  const deportePracticado = val(sv.deporte_practicado) || val(meta._deporte_practicado) || val(evaluacion.deporte_practicado);
  const actividadFisica = val(meta._actividad_fisica) || val(sv.actividad_fisica) || val(evaluacion.actividad_fisica);
  const estresPercibido = val(meta._estres_percibido) || val(sv.estres_percibido) || val(evaluacion.estres_percibido);
  const nivelEducativo = val(meta._nivel_educativo) || val(evaluacion.nivel_educativo);
  const comoLlego = val(meta._como_llego) || val(evaluacion.como_llego);
  const diagnosticoSugerido = val(meta._diagnostico_sugerido) || val(evaluacion.diagnostico_sugerido);

  const tiposFormulario = (evaluacion.tipo_formulario || '').split(',').map(t => t.trim()).filter(Boolean);
  const esDeportista = tiposFormulario.includes('deportivo');

  // Cálculo IMC
let imc = val(sv.imc);
if (!imc && val(sv.peso) && val(sv.talla)) {
  const p = parseFloat(sv.peso); const t = parseFloat(sv.talla);
  if (p > 0 && t > 0) {
    const tm = t > 3 ? t / 100 : t;
    imc = (p / (tm * tm)).toFixed(1);
  }
}
const imcClasif = clasificarIMC(imc);

  // ============================================================
  // 🆕 SECCIÓN 1: DATOS DEL USUARIO (expandida)
  // ============================================================
  const hijosHTML = hijos.length > 0
    ? hijos.map((h, i) => `Hijo ${i + 1}: ${h.edad || '?'} años (${h.sexo === 'M' ? 'Masculino' : h.sexo === 'F' ? 'Femenino' : '—'})`).join(' | ')
    : '';
  const contactosHTML = contactos.filter(c => c.nombre || c.telefono).length > 0
    ? contactos.filter(c => c.nombre || c.telefono).map((c, i) => `Contacto ${i + 1}: ${c.nombre || '—'} (${c.parentesco || '—'}) — ${c.telefono || '—'}`).join(' | ')
    : '';

  // 🆕 Alertas de signos vitales (movido arriba para que resumenEjecutivo las use)
  const alertasSV = [];
  const nta_s = parseFloat(sv.ta_sistolica); const nta_d = parseFloat(sv.ta_diastolica);
  if (!isNaN(nta_s) && nta_s >= 140) alertasSV.push('Presión arterial sistólica elevada (≥140 mmHg)');
  if (!isNaN(nta_d) && nta_d >= 90) alertasSV.push('Presión arterial diastólica elevada (≥90 mmHg)');
  const nfc = parseFloat(sv.fc);
  if (!isNaN(nfc) && (nfc > 100 || nfc < 60)) alertasSV.push('Frecuencia cardíaca fuera de rango (60-100 lpm)');
  const nfr = parseFloat(sv.fr);
  if (!isNaN(nfr) && (nfr > 20 || nfr < 12)) alertasSV.push('Frecuencia respiratoria fuera de rango (12-20 rpm)');
  const ntemp = parseFloat(sv.temperatura);
  if (!isNaN(ntemp) && (ntemp > 37.2 || ntemp < 35.5)) alertasSV.push('Temperatura fuera de rango (35.5-37.2 °C)');
  const nspo2 = parseFloat(sv.spo2);
  if (!isNaN(nspo2) && nspo2 < 95) alertasSV.push('Saturación de oxígeno baja (<95%)');
  const nglu = parseFloat(sv.glucemia);
  if (!isNaN(nglu) && (nglu > 110 || nglu < 70)) alertasSV.push('Glucemia fuera de rango (70-110 mg/dL)');

// 🆕 Resumen Ejecutivo (KPIs)
const evaMax = Math.max(
  ...regiones.map(r => parseFloat(regionesData[r]?.eva) || 0),
  parseFloat(evaluacion.intensidad_reposo) || 0,
  parseFloat(evaluacion.intensidad_actividad) || 0
);
const sintomasSet = new Set();
regiones.forEach(r => (regionesData[r]?.sintomas || []).forEach(s => sintomasSet.add(s)));
const totalAlertas = banderasRojas.length + alertasSV.length;

// Diagnóstico sugerido (fallback al plan)
let diagnosticoFinal = diagnosticoSugerido;
if (!diagnosticoFinal && meta._plan_tratamiento) {
  const m = meta._plan_tratamiento.match(/Diagnóstico sugerido:\s*(.+)/i);
  if (m) diagnosticoFinal = m[1].trim();
}

const resumenEjecutivoHTML = `
  <div style="background: linear-gradient(135deg, #f0f9ff 0%, #ecfdf5 100%); border: 1px solid #22d3ee; border-radius: 8px; padding: 12px; margin-bottom: 15px;">
    <div style="font-size: 10pt; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">📊 Resumen Ejecutivo</div>
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">
      <div style="background: white; padding: 8px; border-radius: 4px; border-left: 3px solid #ef4444; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
        <div style="font-size: 7.5pt; color: #64748b; text-transform: uppercase; font-weight: 600;">EVA Máx</div>
        <div style="font-weight: 800; color: #ef4444; font-size: 14pt; line-height: 1;">${evaMax}/10</div>
      </div>
      <div style="background: white; padding: 8px; border-radius: 4px; border-left: 3px solid #22d3ee; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
        <div style="font-size: 7.5pt; color: #64748b; text-transform: uppercase; font-weight: 600;">Regiones</div>
        <div style="font-weight: 800; color: #22d3ee; font-size: 14pt; line-height: 1;">${regiones.length}</div>
      </div>
      <div style="background: white; padding: 8px; border-radius: 4px; border-left: 3px solid #a855f7; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
        <div style="font-size: 7.5pt; color: #64748b; text-transform: uppercase; font-weight: 600;">Síntomas</div>
        <div style="font-weight: 800; color: #a855f7; font-size: 14pt; line-height: 1;">${sintomasSet.size}</div>
      </div>
      <div style="background: white; padding: 8px; border-radius: 4px; border-left: 3px solid ${totalAlertas > 0 ? '#ef4444' : '#10b981'}; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
        <div style="font-size: 7.5pt; color: #64748b; text-transform: uppercase; font-weight: 600;">Alertas</div>
        <div style="font-weight: 800; color: ${totalAlertas > 0 ? '#ef4444' : '#10b981'}; font-size: 14pt; line-height: 1;">${totalAlertas}</div>
      </div>
    </div>
    ${diagnosticoFinal ? `
      <div style="margin-top: 10px; padding: 8px 12px; background: white; border-left: 3px solid #10b981; border-radius: 4px;">
        <div style="font-size: 8pt; color: #10b981; font-weight: 700; text-transform: uppercase;">Diagnóstico Sugerido</div>
        <div style="font-size: 10pt; color: #0f172a; font-weight: 600; margin-top: 2px;">${diagnosticoFinal}</div>
      </div>
    ` : ''}
  </div>
`;

  const datosUsuarioHTML = `
    <h1>1. Datos del Usuario</h1>
    <table>
      ${filaSi('Edad', evaluacion.edad)}
      ${filaSi('Sexo', evaluacion.sexo)}
      ${filaSi('Estado Civil', evaluacion.estado_civil)}
      ${filaSi('Ocupación', evaluacion.ocupacion)}
      ${filaSi('Nivel educativo', nivelEducativo)}
      ${filaSi('Teléfono', evaluacion.telefono)}
      ${filaSi('Dirección', evaluacion.direccion)}
      ${filaSi('¿Cómo llegó al centro?', comoLlego)}
      ${filaSi('Hijos', hijosHTML)}
      ${filaSi('Contactos de emergencia', contactosHTML)}
    </table>
  `;

  // ============================================================
  // 🆕 SECCIÓN 1.1: SIGNOS VITALES
  // ============================================================
  const tieneSignosVitales = val(sv.ta_sistolica) || val(sv.ta_diastolica) || val(sv.fc) || val(sv.fr)
    || val(sv.temperatura) || val(sv.spo2) || val(sv.peso) || val(sv.talla) || imc || val(sv.glucemia);

  const taTexto = (val(sv.ta_sistolica) || val(sv.ta_diastolica))
    ? `${sv.ta_sistolica || '?'}/${sv.ta_diastolica || '?'} mmHg` : '';

  const fechaTomaTexto = val(sv.fecha_toma)
    ? new Date(sv.fecha_toma).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '';

  const signosVitalesHTML = tieneSignosVitales ? `
    <h2>1.1 Signos Vitales</h2>
    ${fechaTomaTexto ? `<p style="font-size:9pt; color:#64748b; margin:2px 0;">Toma registrada: ${fechaTomaTexto}</p>` : ''}
    <table>
      ${filaSi('Presión Arterial', taTexto)}
      ${filaSi('Frecuencia Cardíaca', val(sv.fc) ? `${sv.fc} lpm` : '')}
      ${filaSi('Frecuencia Respiratoria', val(sv.fr) ? `${sv.fr} rpm` : '')}
      ${filaSi('Temperatura', val(sv.temperatura) ? `${sv.temperatura} °C` : '')}
      ${filaSi('Saturación de Oxígeno', val(sv.spo2) ? `${sv.spo2} %` : '')}
      ${filaSi('Peso', val(sv.peso) ? `${sv.peso} kg` : '')}
      ${filaSi('Talla', val(sv.talla) ? `${sv.talla} cm` : '')}
      ${imc ? `<tr><th>IMC</th><td><strong style="font-size:11pt;">${imc}</strong> ${imcClasif ? `<span style="color:${imcClasif.color}; font-weight:700; font-size:9pt;"> — ${imcClasif.msg}</span>` : ''}</td></tr>` : ''}
      ${filaSi('Glucemia', val(sv.glucemia) ? `${sv.glucemia} mg/dL` : '')}
    </table>
    ${alertasSV.length > 0 ? `<div class="alerta" style="margin-top:6px;"><strong>Alertas de signos vitales:</strong> ${alertasSV.join(' · ')}</div>` : ''}
  ` : '';

  // ============================================================
  // SECCIÓN 2: MOTIVO DE CONSULTA
  // ============================================================
  const motivoHTML = `
    <h1>2. Motivo de Consulta</h1>
    <table>
      ${filaSi('Motivo principal', evaluacion.motivo_consulta)}
      ${filaSi('Tiempo de evolución', evaluacion.tiempo_evolucion)}
      ${filaSi('Mecanismo de lesión', evaluacion.mecanismo_lesion)}
    </table>
  `;

  // ============================================================
  // SECCIÓN 3: ANTECEDENTES
  // ============================================================
  const antecedentesFamiliaresHTML = (antFamiliares && antFamiliares.length > 0)
    ? antFamiliares.map(a => a === 'Otros' && antFamiliaresOtros ? `Otros: ${antFamiliaresOtros}` : a).join(', ')
    : '';

  const antecedentesHTML = `
    <h1>3. Antecedentes</h1>
    <table>
      ${filaSi('Antecedentes médicos', evaluacion.antecedentes_medicos)}
      ${filaSi('Alergias', evaluacion.alergias)}
      ${filaSi('Medicamentos actuales', evaluacion.medicamentos)}
      ${filaSi('Cirugías previas', evaluacion.cirugias_previas)}
      ${filaSi('Antecedentes familiares', antecedentesFamiliaresHTML)}
    </table>
  `;

  // ============================================================
  // 🆕 SECCIÓN 3.1: HÁBITOS Y ESTILO DE VIDA
  // ============================================================
  const tabaquismoTexto = habitos.tabaquismo
    ? `Sí${val(habitos.cigarrillos_dia) ? ` — ${habitos.cigarrillos_dia} cig/día` : ''}${val(habitos.anios_tabaquismo) ? ` (${habitos.anios_tabaquismo} años)` : ''}`
    : 'No';
  const alcoholTexto = habitos.alcohol
    ? `Sí${val(habitos.alcohol_frecuencia) ? ` — ${habitos.alcohol_frecuencia}` : ''}`
    : 'No';

  const actividadTexto = esDeportista
    ? [nivelDeportivo ? `Nivel: ${nivelDeportivo}` : null, deportePracticado ? `Deporte: ${deportePracticado}` : null].filter(Boolean).join(' — ')
    : actividadFisica;

  const tieneHabitos = habitos.tabaquismo !== undefined || habitos.alcohol !== undefined
    || val(actividadTexto) || val(calidadSuenio) || val(estresPercibido) || habitos.drogas || habitos.dependencia_medicamentos;

  const habitosHTML = tieneHabitos ? `
    <h2>3.1 Hábitos y Estilo de Vida</h2>
    <table>
      ${filaSi('Tabaquismo', tabaquismoTexto)}
      ${filaSi('Consumo de alcohol', alcoholTexto)}
      ${filaSi('Drogas recreativas', habitos.drogas ? 'Sí' : 'No')}
      ${filaSi('Dependencia a medicamentos', habitos.dependencia_medicamentos ? 'Sí' : 'No')}
      ${filaSi(esDeportista ? 'Nivel deportivo' : 'Actividad física', actividadTexto)}
      ${filaSi('Calidad del sueño', calidadSuenio !== null && calidadSuenio !== undefined ? `${calidadSuenio} / 10` : '')}
      ${filaSi('Estrés percibido', estresPercibido)}
    </table>
  ` : '';

  // ============================================================
  // 🆕 SECCIÓN 3.4: NOTAS CLÍNICAS
  // ============================================================
  const notasHTML = val(notasClinicas) ? `
    <h2>3.4 Notas Clínicas del Terapeuta</h2>
    <div style="white-space:pre-line; font-size:9.5pt; padding:6px 10px; border-left:3px solid #22d3ee; background:#f8fafc;">${notasClinicas}</div>
  ` : '';

  // ============================================================
  // 🆕 SECCIÓN 3.5: EVALUACIÓN ESPECIALIZADA (plantillas dinámicas)
  // ============================================================
  const gruposEspecializados = tiposFormulario
    .filter(tipo => tipo !== 'general' && TIPOS_FORMULARIO[tipo] && (TIPOS_FORMULARIO[tipo].preguntas || []).length > 0)
    .map(tipo => {
      const preguntas = TIPOS_FORMULARIO[tipo].preguntas;
      const respuestas = preguntas.map((p, idx) => {
        const campoId = `especial_${tipo}_${idx}`;
        const valor = camposExtra[campoId] ?? evaluacion[campoId] ?? '';
        return { label: p.label, valor: valor };
      }).filter(r => val(r.valor));
      return { tipo, nombre: TIPOS_FORMULARIO[tipo].nombre, descripcion: TIPOS_FORMULARIO[tipo].descripcion, respuestas };
    })
    .filter(g => g.respuestas.length > 0);

  const especializadaHTML = gruposEspecializados.length > 0 ? `
    <h2 style="page-break-after: avoid; break-after: avoid;">3.5 Evaluación Especializada</h2>
    ${gruposEspecializados.map(g => `
      <div class="form-grupo" style="margin-bottom:10px; padding:8px 10px; border:1px solid #e2e8f0; border-radius:6px; background:#fafbfc;">
        <div style="font-weight:700; font-size:10pt; color:#0f172a; margin-bottom:4px; border-bottom:1px solid #e2e8f0; padding-bottom:3px;">
          ${g.nombre}
        </div>
        ${g.descripcion ? `<div style="font-size:8pt; color:#64748b; font-style:italic; margin-bottom:4px;">${g.descripcion}</div>` : ''}
        <table class="tabla-preguntas" style="margin:0;">
          ${g.respuestas.map((r, i) => `<tr><th style="font-weight:600; font-size:8.5pt;">${r.label}</th><td style="font-size:8.5pt;">${r.valor}</td></tr>`).join('')}
        </table>
      </div>
    `).join('')}
  ` : '';

  // ============================================================
  // SECCIÓN 4: EVALUACIÓN DEL DOLOR
  // ============================================================
  const tipoDolorTexto = Array.isArray(evaluacion.tipo_dolor)
    ? evaluacion.tipo_dolor.join(', ')
    : (evaluacion.tipo_dolor || '');

  const dolorHTML = `
    <h1>4. Evaluación del Dolor</h1>
    ${val(tipoDolorTexto) ? `<p style="font-size:9.5pt; margin:4px 0;"><strong>Tipo de dolor:</strong> ${tipoDolorTexto}</p>` : ''}
    <table>
      ${filaSi('Intensidad en reposo (EVA)', `${evaluacion.intensidad_reposo ?? 0} / 10`)}
      ${filaSi('Intensidad en actividad (EVA)', `${evaluacion.intensidad_actividad ?? 0} / 10`)}
      ${filaSi('Factores agravantes', evaluacion.factores_agravantes)}
      ${filaSi('Factores atenuantes', evaluacion.factores_atenuantes)}
      ${filaSi('Síntomas asociados', evaluacion.sintomas_asociados)}
    </table>
  `;

  // ============================================================
  // 🆕 UROLOGÍA / GINECO-OBSTÉTRICO
  // ============================================================
  const esFemenino = evaluacion.sexo === 'Femenino';
  const edadNum = parseInt(evaluacion.edad) || 0;
  const esMasculinoMayor = evaluacion.sexo === 'Masculino' && edadNum >= 40;

  const ginecoHTML = (esFemenino && tieneContenido(gineco)) ? `
    <h2>Gineco-Obstétricos</h2>
    <table>
      ${filaSi('¿Embarazo?', gineco.embarazo)}
      ${filaSi('¿Lactancia?', gineco.lactancia)}
      ${filaSi('FUM (última menstruación)', gineco.fum)}
      ${filaSi('Método anticonceptivo', gineco.metodo_anticonceptivo)}
      ${filaSi('¿Menopausia?', gineco.menopausia)}
      ${filaSi('Edad de menopausia', gineco.edad_menopausia)}
      ${filaSi('Nº de embarazos', gineco.num_embarazos)}
      ${filaSi('Nº de partos', gineco.num_partos)}
      ${filaSi('Nº de abortos', gineco.num_abortos)}
    </table>
    ${gineco.embarazo === 'Sí' ? `<div class="alerta" style="margin-top:6px;"><strong>Paciente embarazada:</strong> revisar contraindicaciones antes de aplicar agentes físicos, masoterapia profunda o electroterapia.</div>` : ''}
  ` : '';

  const uroHTML = (esMasculinoMayor && tieneContenido(uro)) ? `
    <h2>Antecedentes Urológicos</h2>
    <table>
      ${filaSi('¿Visitó al urólogo en el último año?', uro.visita_urologo)}
      ${filaSi('¿Hiperplasia prostática?', uro.hiperplasia_prostata)}
      ${filaSi('¿Medicación para próstata?', uro.medicacion_prostata)}
    </table>
  ` : '';

  const ginecoUroHTML = (ginecoHTML || uroHTML) ? `${ginecoHTML}${uroHTML}` : '';

  // ============================================================
  // 🆕 BANDERAS ROJAS
  // ============================================================
  const banderasHTML = banderasRojas.length > 0 ? `
    <h2>Banderas Rojas (Red Flags)</h2>
    <div class="alerta">
      <strong>⚠ Se detectaron ${banderasRojas.length} bandera(s) roja(s):</strong>
      <ul style="margin:6px 0 0 20px; padding:0;">
        ${banderasRojas.map(id => `<li>${BANDERAS_ROJAS_LABELS[id] || id}</li>`).join('')}
      </ul>
      <p style="margin-top:6px; font-size:8.5pt;">Estas condiciones pueden requerir evaluación médica previa antes de iniciar el tratamiento.</p>
    </div>
  ` : `
    <h2>Banderas Rojas (Red Flags)</h2>
    <div style="background:#d1fae5; border-left:4px solid #10b981; padding:6px 10px; border-radius:3px; font-size:9pt;">
      Sin banderas rojas detectadas.
    </div>
  `;

  // ============================================================
  // CONFIGURACIÓN DE VISTAS PRO (mantenido)
  // ============================================================
  
  // 🆕 Mapeo de IDs genéricos → IDs específicos que las Vistas Pro esperan
  const SINONIMOS_IDS_POR_VISTA = {
    torax: {
      'trapecio': ['trapecio_der', 'trapecio_izq'],
      'trapecio_sup': ['trapecio_der', 'trapecio_izq'],
    },
    lumbar: {
      'cuadrado_lumbar': ['cuadrado_lumbar_der', 'cuadrado_lumbar_izq'],
      // 🆕 'lumbar' genérico → resaltar las 5 vértebras
      'lumbar': ['l1', 'l2', 'l3', 'l4', 'l5'],
      'columna': ['l1', 'l2', 'l3', 'l4', 'l5'],
    },
    pierna: {
      // 🆕 tendon_cuadriceps → resaltar los 3 vientres del cuádriceps
      'tendon_cuadriceps': ['recto_femoral', 'vasto_lateral', 'vasto_medial'],
      'cuadriceps': ['recto_femoral', 'vasto_lateral', 'vasto_medial'],
      'nervio_tibial_plantar': ['nervio_tibial'],
      'nervio_peroneo_comun': ['nervio_peroneo_comun'],
    },
    rodilla: {
      // 🆕 patela → rotula (VistaRodillaPro usa 'rotula')
      'patela': ['rotula'],
    },
    pie: {
      // 🆕 en lateral, el talón es el calcáneo
      'talon_plantar': ['calcaneo'],
      // 🆕 en lateral, el mediopié son navicular + cuboides
      'mediopie_plantar': ['navicular', 'cuboides'],
    },
  };
  
  const VISTAS_PRO_CONFIG = {
    rodilla: { componente: VistaRodillaPro, keywords: ['rodilla', 'menisco', 'lca', 'lcp', 'rotula', 'poplitea'] },
    pie: { componente: VistaPiePro, keywords: ['pie', 'calcaneo', 'talon', 'fascia_plantar', 'metatarsiano', 'hallux', 'falanges_plantar', 'mediopie', 'antepie', 'dedo_pie'] },
    tobillo: { componente: VistaTobilloPro, keywords: ['tobillo', 'aquiles', 'peroneo'] },
    pelvis: { componente: VistaPelvisPro, keywords: ['pelvis', 'cadera', 'sacro', 'gluteo', 'acetabulo', 'cresta_iliaca', 'pubis', 'isquion', 'coxis', 'ilion'] },
    pierna: { componente: VistaPiernaPro, keywords: ['pierna', 'cuadriceps', 'femoral', 'tibial', 'perone', 'gemelo', 'soleo', 'isquiotibial'] },
    lumbar: { componente: VistaLumbarPro, keywords: ['lumbar', 'l1', 'l2', 'l3', 'l4', 'l5', 'faceta_l', 'disco_l'] },
    columna: { componente: VistaColumnaPro, keywords: ['columna', 'cervical', 'dorsal', 'sacro'] },
    hombro: { componente: VistaHombroPro, keywords: ['hombro', 'acromion', 'clavicula', 'escapula', 'manguito', 'deltoides'] },
    brazo: { componente: VistaBrazoPro, keywords: ['brazo', 'biceps', 'triceps', 'humero'] },
    codo: { componente: VistaCodoPro, keywords: ['codo', 'olecranon', 'epicondilo'] },
    mano: { componente: VistaManoPro, keywords: ['mano', 'muneca', 'carpo', 'metacarpo', 'metacarpiano', 'falange', 'pulgar', 'pulpejo', 'pulpejos', 'almohadilla', 'almohadillas', 'tendones_extensor', 'tendones_flexor', 'tendon_extensor', 'tendon_flexor', 'tunel_carpo', 'escafoides', 'grande', 'ganchoso', 'tenar', 'nervio_mediano', 'nervio_cubital', 'retinaculo', 'semilunar', 'piramidal', 'pisiforme', 'trapezoide'] },
    cabeza: { componente: VistaCabezaPro, keywords: ['cabeza', 'cuello', 'nuca', 'craneo', 'mandibula', 'ecom', 'temporal', 'occipital', 'frontal', 'parietal', 'atm', 'masetero'] },
    torax: { componente: VistaToraxPro, keywords: ['torax', 'pecho', 'costilla', 'esternon', 'pectoral', 'trapecio', 'escapula', 'serrato'] }
  };

  const CARAS_CONFIG = {
    cabeza: { caras: ['anterior', 'posterior'], anterior: ['cabeza', 'craneo', 'mandibula', 'frontal', 'parietal', 'temporal', 'atm', 'masetero', 'facial'], posterior: ['nuca', 'occipital', 'ecom', 'trapecio'] },
    columna: { caras: ['anterior', 'posterior'], anterior: ['cervical_ant', 'dorsal_ant', 'lumbar_ant', 'esternon_col'], posterior: ['cervical', 'dorsal', 'lumbar', 'sacro', 'columna', 'l1', 'l2', 'l3', 'l4', 'l5', 'disco_l', 'faceta_l', 'coxis'] },
    torax: { caras: ['anterior', 'posterior'], anterior: ['torax', 'pecho', 'costilla', 'esternon', 'pectoral'], posterior: ['escapula', 'trapecio', 'dorsal', 'costilla_post'] },
    mano: { caras: ['palmar', 'dorsal'], palmar: ['tendones_flexor', 'tendon_flexor', 'nervio_mediano', 'tunel_carpo', 'tenar', 'pulpejo', 'nervio_cubital', 'almohadilla'], dorsal: ['extensor', 'retinaculo', 'escafoides', 'dedo_', 'metacarpiano', 'grande', 'ganchoso', 'semilunar', 'piramidal', 'pisiforme', 'trapezoide'] },
        pierna: {
      caras: ['anterior', 'posterior'],
      anterior: [
        'tibial_anterior', 'tibial_ant', 'perone', 'peroneo',
        'recto_femoral', 'vasto_lateral', 'vasto_medial', 'sartorio', 'tensor_fascia_lata',
        'cuadriceps', 'extensor_largo_dedos', 'nervio_femoral', 'nervio_peroneo',
        'tendon_cuadriceps',
        'femur', 'patela', 'tibia', 'pierna_ant'
      ],
      posterior: [
        'biceps_femoral', 'semitendinoso', 'semimembranoso',
        'gastrocnemio', 'gemelo', 'soleo', 'tendon_aquiles',
        'nervio_ciatico', 'nervio_tibial', 'isquiotibial', 'pierna_post'
      ]
    },
    pelvis: { caras: ['anterior', 'posterior'], anterior: ['pubis', 'cresta_iliaca_ant', 'cadera_ant', 'ilion_ant'], posterior: ['sacro', 'gluteo', 'isquion', 'coxis', 'cresta_iliaca', 'ilion', 'acetabulo', 'cadera_post'] },
    rodilla: { caras: ['anterior', 'posterior'], anterior: ['rotula', 'rodilla_ant', 'tendon_rotuliano'], posterior: ['poplitea', 'menisco_post', 'lca', 'lcp', 'rodilla_post'] },
    pie: { caras: ['lateral', 'plantar'], lateral: ['pie', 'metatarsiano', 'hallux', 'dedo_pie', 'calcaneo', 'aquiles', 'tobillo'],  // 🔧 quitar 'talon' (rompe 'talon_plantar')
    plantar: ['fascia_plantar', 'talon_plantar', 'pulpejo_plantar', 'metatarsianos_plantar', 'mediopie_plantar']  // 🆕 añadir mediopie_plantar
    }
  };

  const vistasAgrupadas = {};
  regiones.forEach(r => {
    for (const [vistaBase, config] of Object.entries(VISTAS_PRO_CONFIG)) {
        if (config.keywords.some(k => matcheaKeyword(r, k)) || r === vistaBase) {
        if (!vistasAgrupadas[vistaBase]) vistasAgrupadas[vistaBase] = { componente: config.componente, afectaciones: {} };
        const sintomasArray = regionesData[r]?.sintomas || ['dolor'];
        const colores = calcularColoresAfectacion(sintomasArray);

      // Guardar el ID original (los sinónimos se expanden al renderizar SVG)
        vistasAgrupadas[vistaBase].afectaciones[r] = {
          color: colores.color, border: colores.border,
          sintomas: sintomasArray,
          colors: sintomasArray.map(s => SINTOMAS_COLORES[s] || '#ef4444')
        };
        return;
      }
    }
  });

    // 🆕 Ordenar vistas Pro por anatomía (cabeza → pies)
  const ordenVistasPro = ['cabeza', 'torax', 'columna', 'hombro', 'brazo', 'codo', 'mano', 'lumbar', 'pelvis', 'pierna', 'rodilla', 'tobillo', 'pie'];
  const vistasProOrdenadas = ordenVistasPro
    .filter(v => vistasAgrupadas[v])
    .map(v => [v, vistasAgrupadas[v]])
    .concat(Object.entries(vistasAgrupadas).filter(([k]) => !ordenVistasPro.includes(k)));

  // 🆕 FASE 3: Helpers para detectar lado y dividir tarjetas
  const esVistaLateral = (vistaBase) => {
    return ['hombro', 'brazo', 'codo', 'mano', 'pierna', 'rodilla', 'tobillo', 'pie'].includes(vistaBase);
  };

  const dividirPorLado = (claves, vistaBase) => {
    if (!esVistaLateral(vistaBase)) {
      return [{ lado: null, claves }];
    }
    const izq = [], der = [], sinLado = [];
    claves.forEach(k => {
      const l = parseRegionKey(k, regionesData[k]).lado;   // 🆕 FASE 1A
      if (l === 'izquierdo') izq.push(k);
      else if (l === 'derecho') der.push(k);
      else sinLado.push(k);
    });

    // Claves sin lado (evaluaciones viejas) van al grupo mayoritario
    if (sinLado.length > 0) {
      if (izq.length >= der.length) izq.push(...sinLado);
      else der.push(...sinLado);
    }
    const grupos = [];
    if (izq.length > 0) grupos.push({ lado: 'izquierdo', claves: izq });
    if (der.length > 0) grupos.push({ lado: 'derecho', claves: der });
    if (grupos.length === 0) grupos.push({ lado: null, claves });
    return grupos;
  };


    const vistaProHTML = vistasProOrdenadas.map(([vistaBase, data]) => {
    const afectacionesKeys = Object.keys(data.afectaciones);
    const configCaras = CARAS_CONFIG[vistaBase];

    const generarTarjeta = (cara, clavesFiltradas, lado) => {
      if (clavesFiltradas.length === 0) return '';

    const afectacionesFiltradas = {};
      clavesFiltradas.forEach(k => {
        // 🆕 FASE 1C: parsear sufijo para que el SVG (VistaRodillaPro, etc.) pinte correctamente
      const { baseId } = parseRegionKey(k, regionesData[k]);
        afectacionesFiltradas[baseId] = data.afectaciones[k];
      });

      // 🆕 Expandir con sinónimos SOLO para el SVG (badges muestran el ID original)
      const afectacionesParaSVG = { ...afectacionesFiltradas };
      clavesFiltradas.forEach(k => {
        const { baseId: kBase } = parseRegionKey(k, null);   // 🆕 FASE 1A
        const sinonimos = SINONIMOS_IDS_POR_VISTA[vistaBase]?.[kBase];
        if (sinonimos) {
          sinonimos.forEach(alias => {
            afectacionesParaSVG[alias] = afectacionesFiltradas[k];
          });
        }
      });

      const hallazgosHTML = clavesFiltradas.map(r => {
        const { baseId: rBase, lado: ladoH } = parseRegionKey(r, regionesData[r]);   // 🆕 FASE 1A
        let nombre = formatearNombreRegion(rBase);
        if (ladoH) nombre = añadirLado(nombre, ladoH);
        const sintomasArray = regionesData[r]?.sintomas || ['dolor'];
        const nombresSintomas = sintomasArray.map(s => SINTOMAS_NOMBRES[s] || s).join(', ');
        const colores = calcularColoresAfectacion(sintomasArray);
        return `<span style="display:inline-block; background:${colores.color}15; color:${colores.color}; border:1px solid ${colores.color}40; padding:2px 8px; border-radius:12px; font-size:8pt; font-weight:700; margin:2px;">${nombre} (${nombresSintomas})</span>`;
      }).join('');

      // 🆕 Lado real para renderizar SVG + título
      const ladoFinal = lado || null;
      const ladoSVG = ladoFinal || 'derecho';

      const props = { cara: cara, lado: ladoSVG, afectaciones: afectacionesParaSVG };
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

        // 🆕 Título con lado y concordancia de género
        const tituloBase = formatearNombreRegion(vistaBase);
        const tituloFinal = ladoFinal ? añadirLado(tituloBase, ladoFinal) : tituloBase;
        const tituloCara = cara.charAt(0).toUpperCase() + cara.slice(1);

        return `
          <div class="vista-pro">
            <div>
              <h4 style="margin:0 0 5px 0; font-size:11pt; color:#0f172a;">${tituloFinal} (${tituloCara})</h4>
              <div style="margin-bottom:5px;">${hallazgosHTML}</div>
            </div>
            <div style="text-align:center;">${svgLimpio}</div>
          </div>
        `;
      } catch (e) { return ''; }
    };

    // Vistas sin caras → 1 tarjeta (o 2 si hay ambos lados)
    if (!configCaras) {
      return dividirPorLado(afectacionesKeys, vistaBase)
        .map(g => generarTarjeta('anterior', g.claves, g.lado))
        .filter(x => x).join('');
    }

    // Vistas con caras (anterior/posterior, dorsal/palmar, etc.)
    return configCaras.caras.map(cara => {
      const keywordsCara = configCaras[cara] || [];
      const clavesCara = afectacionesKeys.filter(k => {
  // 🆕 TAREA 3: Usar matcheaKeyword para evitar que 'lca' atrape a 'calcaneo', etc.
  if (!keywordsCara.some(kw => matcheaKeyword(k, kw))) return false;
  for (const otraCara of configCaras.caras) {
    if (otraCara === cara) continue;
    const keywordsOtra = configCaras[otraCara] || [];
    if (keywordsOtra.some(kw => matcheaKeyword(k, kw)) && configCaras.caras.indexOf(otraCara) < configCaras.caras.indexOf(cara)) return false;
  }
  return true;
});
      return dividirPorLado(clavesCara, vistaBase)
        .map(g => generarTarjeta(cara, g.claves, g.lado))
        .filter(x => x).join('');
    }).filter(x => x).join('');
  }).join('');

  // ============================================================
  // STICKMAN — v2: agrupación por zona visual anatómica
  // ============================================================
  const GRUPOS_STICKMAN = {
    // === Vista Anterior ===
    cabeza_ant:        { cx: 100, cy: 30,  vista: 'anterior' },
    cuello_ant:        { cx: 100, cy: 52,  vista: 'anterior' },
    trapecio_izq:      { cx: 115, cy: 60,  vista: 'anterior' },
    trapecio_der:      { cx: 85,  cy: 60,  vista: 'anterior' },
    hombro_izq:        { cx: 122, cy: 66,  vista: 'anterior' },
    hombro_der:        { cx: 78,  cy: 66,  vista: 'anterior' },
    brazo_izq:         { cx: 128, cy: 95,  vista: 'anterior' },
    brazo_der:         { cx: 72,  cy: 95,  vista: 'anterior' },
    codo_izq:          { cx: 130, cy: 118, vista: 'anterior' },
    codo_der:          { cx: 70,  cy: 118, vista: 'anterior' },
    mano_izq:          { cx: 130, cy: 155, vista: 'anterior' },
    mano_der:          { cx: 70,  cy: 155, vista: 'anterior' },
    torax:             { cx: 100, cy: 85,  vista: 'anterior' },
    abdomen:           { cx: 100, cy: 115, vista: 'anterior' },
    pelvis_ant:        { cx: 100, cy: 145, vista: 'anterior' },
    muslo_izq:         { cx: 115, cy: 185, vista: 'anterior' },
    muslo_der:         { cx: 85,  cy: 185, vista: 'anterior' },
    rodilla_izq:       { cx: 115, cy: 225, vista: 'anterior' },
    rodilla_der:       { cx: 85,  cy: 225, vista: 'anterior' },
    pierna_izq:        { cx: 115, cy: 265, vista: 'anterior' },
    pierna_der:        { cx: 85,  cy: 265, vista: 'anterior' },
    tobillo_izq:       { cx: 115, cy: 295, vista: 'anterior' },
    tobillo_der:       { cx: 85,  cy: 295, vista: 'anterior' },
    pie_izq:           { cx: 115, cy: 308, vista: 'anterior' },
    pie_der:           { cx: 85,  cy: 308, vista: 'anterior' },

    // === Vista Posterior ===
    cabeza_post:       { cx: 100, cy: 30,  vista: 'posterior' },
    cuello_post:       { cx: 100, cy: 52,  vista: 'posterior' },
    trapecio_post:     { cx: 100, cy: 60,  vista: 'posterior' },
    escapula_izq:      { cx: 115, cy: 75,  vista: 'posterior' },
    escapula_der:      { cx: 85,  cy: 75,  vista: 'posterior' },
    dorsal_ancho_izq:  { cx: 115, cy: 95,  vista: 'posterior' },
    dorsal_ancho_der:  { cx: 85,  cy: 95,  vista: 'posterior' },
    columna_dorsal:    { cx: 100, cy: 95,  vista: 'posterior' },
    lumbar_post:       { cx: 100, cy: 122, vista: 'posterior' },
    sacro_post:        { cx: 100, cy: 138, vista: 'posterior' },
    gluteo_izq:        { cx: 115, cy: 160, vista: 'posterior' },
    gluteo_der:        { cx: 85,  cy: 160, vista: 'posterior' },
    isquio_izq:        { cx: 115, cy: 195, vista: 'posterior' },
    isquio_der:        { cx: 85,  cy: 195, vista: 'posterior' },
    poplitea_post:     { cx: 100, cy: 235, vista: 'posterior' },
    gemelo_izq:        { cx: 115, cy: 265, vista: 'posterior' },
    gemelo_der:        { cx: 85,  cy: 265, vista: 'posterior' },
  };

    const mapearGrupoStickman = (r) => {
    // 🆕 FASE 1A: parsear sufijo __izq/__der
    const { baseId, lado: ladoReal } = parseRegionKey(r, regionesData[r]);
    const s = baseId.toLowerCase();
    const esIzq = ladoReal === 'izquierdo';
    const esDer = ladoReal === 'derecho';

    // ===== CABEZA =====
    if (/occipital_mayor|occipital|nuca|suboccipitales/.test(s)) return 'cabeza_post';
    if (/(cabeza|craneo|frontal|parietal|zigomatico|masetero|atm|mandibula|temporal|trigemino)/.test(s)) return 'cabeza_ant';

    // ===== CUELLO =====
    if (/cervical|ecom|cuello|escalenos|plexo_braquial/.test(s)) return 'cuello_ant';

    // ===== TRAPECIO =====
    if (/trapecio/.test(s)) {
      if (esIzq || /_izq/.test(s)) return 'trapecio_izq';
      if (esDer || /_der/.test(s)) return 'trapecio_der';
      return 'trapecio_post';
    }
    if (/elevador_escapula/.test(s)) return 'trapecio_post';

    // ===== ESCÁPULA =====
    if (/(escapula|manguito|supraespinoso|infraespinoso|subescapular|romboide|romboides)/.test(s)) {
      if (esIzq || /_izq/.test(s)) return 'escapula_izq';
      if (esDer || /_der/.test(s)) return 'escapula_der';
      return 'escapula_der';
    }

    // ===== HOMBRO =====
    if (/(hombro|deltoides|clavicula|coracoides|glenoides|acromion)/.test(s)) {
      if (esIzq || /_izq/.test(s)) return 'hombro_izq';
      if (esDer || /_der/.test(s)) return 'hombro_der';
      return 'hombro_izq';
    }

    // ===== ISQUIOTIBIALES (muslo posterior) — ANTES que brazo para no capturar biceps_femoral =====
    if (/(isquiotibial|isquiotibiales|biceps_femoral|semitendinoso|semimembranoso)/.test(s)) {
      if (esIzq || /_izq/.test(s)) return 'isquio_izq';
      if (esDer || /_der/.test(s)) return 'isquio_der';
      return 'isquio_izq';
    }

    // ===== BRAZO =====
    if (/(brazo|biceps|triceps|humero|braquial|coracobraquial|epicondilo|epitroclea|olecranon)/.test(s)) {
      if (esIzq || /_izq/.test(s)) return 'brazo_izq';
      if (esDer || /_der/.test(s)) return 'brazo_der';
      return 'brazo_izq';
    }

    // ===== CODO =====
    if (/codo/.test(s)) {
      if (esIzq || /_izq/.test(s)) return 'codo_izq';
      if (esDer || /_der/.test(s)) return 'codo_der';
      return 'codo_izq';
    }

    // ===== MANO Y NERVIOS MMSS =====
    if (/(mano|muneca|carpo|metacarpo|metacarpiano|tenar|pulgar|grande|ganchoso|escafoides|semilunar|piramidal|pisiforme|trapezoide|dedo_\d|pulpejo|almohadilla|tendones_flexor|tendones_extensor|tendon_flexor|tendon_extensor|tunel_carpo|retinaculo|nervio_mediano|nervio_cubital|nervio_radial|nervio_musculocutaneo|lcc_pulgar|radio|cubito|braquiorradial|anconeo)/.test(s)) {
      if (esIzq || /_izq/.test(s)) return 'mano_izq';
      if (esDer || /_der/.test(s)) return 'mano_der';
      return 'mano_izq';
    }

    // ===== TÓRAX =====
    if (/(torax|pecho|costilla|costillas|esternon|pectoral|serrato)/.test(s)) return 'torax';

    // ===== ABDOMEN =====
    if (/abdomen/.test(s)) return 'abdomen';

    // ===== COLUMNA =====
    if (/dorsal_ancho/.test(s)) {
      if (esIzq || /_izq/.test(s)) return 'dorsal_ancho_izq';
      if (esDer || /_der/.test(s)) return 'dorsal_ancho_der';
      return 'columna_dorsal';
    }
    if (/columna_dorsal|dorsal/.test(s)) return 'columna_dorsal';
    if (/lumbar|l1|l2|l3|l4|l5|disco_l|faceta_l/.test(s)) return 'lumbar_post';
    if (/sacro|coxis/.test(s)) return 'sacro_post';

    // ===== PELVIS =====
    if (/(pelvis|cadera|ilion|cresta_iliaca|acetabulo|pubis|isquion)/.test(s)) return 'pelvis_ant';

    // ===== GLÚTEO =====
    if (/gluteo|piriforme/.test(s)) {
      if (esIzq || /_izq/.test(s)) return 'gluteo_izq';
      if (esDer || /_der/.test(s)) return 'gluteo_der';
      return 'gluteo_izq';
    }

    // ===== MUSLO ANTERIOR =====
    if (/(muslo|cuadriceps|recto_femoral|aductor|adductor|femoral|tendon_cuadriceps|tensor_fascia_lata)/.test(s)) {
      if (esIzq || /_izq/.test(s)) return 'muslo_izq';
      if (esDer || /_der/.test(s)) return 'muslo_der';
      return 'muslo_izq';
    }

    // ===== RODILLA =====
    if (/(rodilla|rotula|patela|patelar|menisco|lca|lcp|lcm|lcl|tendon_patelar)/.test(s)) {
      if (esIzq || /_izq/.test(s)) return 'rodilla_izq';
      if (esDer || /_der/.test(s)) return 'rodilla_der';
      return 'rodilla_izq';
    }

    // ===== FOSA POPLÍTEA =====
    if (/(poplitea|fosa_poplitea)/.test(s)) return 'poplitea_post';

    // ===== GEMELOS / SÓLEO =====
    if (/(gemelo|soleo|gastrocnemio)/.test(s)) {
      if (esIzq || /_izq/.test(s)) return 'gemelo_izq';
      if (esDer || /_der/.test(s)) return 'gemelo_der';
      return 'gemelo_izq';
    }

    // ===== PIERNA ANTERIOR + NERVIOS =====
    if (/(pierna|tibial|perone|peroneo|extensor_largo_dedos|nervio_tibial|nervio_peroneo|nervio_sural)/.test(s)) {
      if (esIzq || /_izq/.test(s)) return 'pierna_izq';
      if (esDer || /_der/.test(s)) return 'pierna_der';
      return 'pierna_izq';
    }

    // ===== TOBILLO / AQUILES =====
    if (/(tobillo|aquiles|tendon_aquiles|tibia_distal|perone_distal)/.test(s)) {
      if (esIzq || /_izq/.test(s)) return 'tobillo_izq';
      if (esDer || /_der/.test(s)) return 'tobillo_der';
      return 'tobillo_izq';
    }

    // ===== PIE =====
    if (/(pie|calcaneo|talon|astragalo|navicular|cuboides|cuneiforme|metatarsiano|hallux|dedo_pie|falanges_plantar|fascia_plantar|almohadilla_metatarsal|pulpejo_hallux|pulpejo_dedo|nervio_tibial_posterior|mediopie_plantar|nervio_tibial_plantar)/.test(s)) {
      if (esIzq || /_izq/.test(s)) return 'pie_izq';
      if (esDer || /_der/.test(s)) return 'pie_der';
      return 'pie_izq';
    }

    return null;
  };

  const generarPuntosSVG = (todasRegiones, esPost) => {
    const grupos = {};
    todasRegiones.forEach(r => {
      const grupoId = mapearGrupoStickman(r);
      if (!grupoId || !GRUPOS_STICKMAN[grupoId]) return;
      const g = GRUPOS_STICKMAN[grupoId];
      if (esPost && g.vista !== 'posterior') return;
      if (!esPost && g.vista !== 'anterior') return;
      if (!grupos[grupoId]) grupos[grupoId] = { cx: g.cx, cy: g.cy, sintomas: new Set() };
      (regionesData[r]?.sintomas || ['dolor']).forEach(s => grupos[grupoId].sintomas.add(s));
    });

    return Object.values(grupos).map(g => {
      const sintomasArray = Array.from(g.sintomas);
      const { color, border } = calcularColoresAfectacion(sintomasArray);
      return `<circle cx="${g.cx}" cy="${g.cy}" r="5" fill="${color}" stroke="${border}" stroke-width="2"/>`;
    }).join('');
  };

  const contarGruposEnVista = (regiones, esPost) => {
    const grupos = new Set();
    regiones.forEach(r => {
      const g = mapearGrupoStickman(r);
      if (!g || !GRUPOS_STICKMAN[g]) return;
      if (esPost && GRUPOS_STICKMAN[g].vista !== 'posterior') return;
      if (!esPost && GRUPOS_STICKMAN[g].vista !== 'anterior') return;
      grupos.add(g);
    });
    return grupos.size;
  };

  const siluetaPaths = `M 87,22 C 87,7 113,7 113,22 C 113,34 107,42 105,46 C 106,50 112,52 115,55 L 85,55 C 88,52 94,50 95,46 C 93,42 87,34 87,22 Z M 85,55 C 98,58 115,55 115,55 C 122,68 118,98 112,120 L 88,120 C 82,98 78,68 85,55 Z M 115,55 C 126,55 132,60 129,71 C 123,73 117,67 115,55 Z M 85,55 C 74,55 68,60 71,71 C 77,73 83,67 85,55 Z M 129,71 C 138,83 134,112 130,142 C 128,154 123,154 120,142 C 118,112 121,88 116,73 C 119,69 125,69 129,71 Z M 71,71 C 62,83 66,112 70,142 C 72,154 77,154 80,142 C 82,112 79,88 84,73 C 81,69 75,69 71,71 Z M 120,142 L 130,142 C 131,148 133,156 131,163 C 129,167 124,167 121,160 C 119,152 119,146 120,142 Z M 80,142 L 70,142 C 69,148 67,156 69,163 C 71,167 76,167 79,160 C 81,152 81,146 80,142 Z M 88,120 L 112,120 C 116,136 114,154 106,168 L 100,172 L 94,168 C 86,154 84,136 88,120 Z M 103,172 L 108,168 C 120,185 121,210 114,235 C 111,245 113,268 111,288 L 103,288 C 104,268 107,245 105,235 C 107,210 105,185 103,172 Z M 97,172 L 92,168 C 80,185 79,210 86,235 C 89,245 87,268 89,288 L 97,288 C 96,268 93,245 95,235 C 93,210 95,185 97,172 Z M 103,288 L 111,288 C 115,294 119,303 113,308 C 107,311 101,304 103,288 Z M 97,288 L 89,288 C 85,294 81,303 87,308 C 93,311 99,304 97,288 Z`;

  const generarStickman = (regiones, tituloVista, esPost) => {
    if (contarGruposEnVista(regiones, esPost) === 0) return '';
    return `<div style="text-align:center; margin: 5px 0;"><h3 style="font-size:11pt; margin: 3px 0;">${tituloVista}</h3><svg viewBox="0 0 200 320" width="140" height="224" xmlns="http://www.w3.org/2000/svg" style="max-width:160px; height:auto;"><g fill="#f8fafc" stroke="#94a3b8" stroke-width="1.2" opacity="0.9"><path d="${siluetaPaths}"/></g>${generarPuntosSVG(regiones, esPost)}</svg></div>`;
  };

  const stickmanAnterior = generarStickman(regiones, 'Vista Anterior', false);
  const stickmanPosterior = generarStickman(regiones, 'Vista Posterior', true);

  const leyendaSintomasHTML = () => {
    const activos = new Set();
    regiones.forEach(r => (regionesData[r]?.sintomas || ['dolor']).forEach(s => activos.add(s)));
    if (activos.size === 0) return '';
    return `<div style="text-align:center; font-size:8pt; font-weight:700; margin-top:5px;">${Array.from(activos).map(s => `<span style="color:${SINTOMAS_COLORES[s]}; margin:0 8px;">● ${SINTOMAS_NOMBRES[s]}</span>`).join('')}</div>`;
  };

  // ============================================================
  // TABLA JERÁRQUICA (Regiones afectadas)
  // ============================================================
// 🆕 Orden por especificidad (Miembro Superior primero para que bíceps/tríceps no caigan en "cabeza")
const jerarquia = {
  'Miembro Superior': [
    'hombro', 'brazo', 'codo', 'muneca', 'mano', 'dedo', 'pulgar', 'carpo', 'metacarpo', 'metacarpiano',
    'falange', 'tenar', 'grande', 'ganchoso', 'escafoides', 'semilunar', 'piramidal', 'pisiforme', 'trapezoide',
    'pulpejo', 'pulpejos', 'almohadilla_palmar', 'almohadillas_palmar', 'almohadilla_palmares', 'almohadillas_palmares',
    'tendones_extensor', 'tendones_flexor', 'tendon_extensor', 'tendon_flexor',
    'epicondilo', 'olecranon', 'tunel_carpo', 'nervio_mediano', 'nervio_cubital', 'nervio_radial', 'nervio_musculocutaneo',
    'retinaculo', 'acromion', 'deltoides', 'manguito', 'clavicula', 'escapula',
    'biceps', 'triceps', 'braquial', 'coracobraquial', 'elevador_escapula',
  ],
  'Miembro Inferior': [
    'cadera', 'muslo', 'rodilla', 'pierna', 'tobillo', 'pie', 'cuadriceps', 'femoral', 'tibial', 'peroneo',
    'gemelo', 'soleo', 'aquiles', 'calcaneo', 'metatarsiano', 'menisco', 'lca', 'lcp',
    'poplitea', 'rotula', 'patelar', 'fosa_poplitea',
    'almohadilla_metatarsal', 'almohadillas_metatarsal', 'astragalo', 'cuneiforme', 'cuboides', 'navicular',
    'talon_plantar', 'hallux', 'recto_femoral', 'isquiotibial', 'aductor', 'adductor',
  ],
  'Cabeza y Cuello': [
    'cabeza', 'cuello', 'nuca', 'craneo', 'mandibula', 'frontal', 'parietal', 'temporal_musc', 'temporal',
    'occipital_mayor', 'occipital', 'atm', 'ecom', 'masetero', 'trapecio', 'trapecio_sup', 'trapecio_der', 'trapecio_izq', 'zigomatico',
  ],
  'Columna': [
    'cervical', 'dorsal', 'dorsal_ancho', 'lumbar', 'sacro', 'columna', 'l1', 'l2', 'l3', 'l4', 'l5',
    'disco_l', 'faceta_l',
  ],
  'Tórax / Tronco': ['torax', 'pecho', 'costilla', 'costillas', 'esternon', 'pectoral', 'serrato', 'abdomen'],
  'Pelvis': ['pelvis', 'gluteo', 'cresta', 'acetabulo', 'pubis', 'isquion', 'coxis', 'ilion'],
};

  const subRegionKeysMano = ['mano', 'dedo', 'carpo', 'metacarpo', 'metacarpiano', 'falange', 'pulgar', 'tenar', 'grande', 'ganchoso', 'tunel_carpo', 'nervio_mediano', 'escafoides', 'retinaculo', 'pulpejo', 'almohadilla', 'tendones_extensor', 'tendones_flexor', 'semilunar', 'nervio_cubital'];

  const generarBadgesSintomas = (sintomasArray, tamano = '7.5pt') => {
    return (sintomasArray || ['dolor']).map(s => {
      const color = SINTOMAS_COLORES[s] || '#ef4444';
      return `<span style="display:inline-block; margin:1px; background:${color}15; color:${color}; border:1px solid ${color}40; padding:1px 7px; border-radius:10px; font-size:${tamano}; font-weight:700;">${SINTOMAS_NOMBRES[s] || s}</span>`;
    }).join('');
  };

  // Agrupar datos para rowspan
    // 🆕 Agrupar por macro-región y sub-región usando los mapas maestros (elimina duplicados y "General")
  const macroOrden = [
    'Cabeza y Cuello',
    'Tórax / Tronco',
    'Columna',
    'Miembro Superior',
    'Pelvis',
    'Miembro Inferior',
    'Otros',
  ];

  // Agrupar regiones por macro-región (con clasificación explícita, sin includes ambiguo)
  const regionesPorMacro = {};
  regiones.forEach(r => {
    const macro = obtenerMacroRegion(r);
    if (!regionesPorMacro[macro]) regionesPorMacro[macro] = [];
    regionesPorMacro[macro].push(r);
  });

  const tablaData = [];
  macroOrden.forEach(macro => {
    const hallazgosMacro = ordenarPorAnatomia(regionesPorMacro[macro] || []);
    if (hallazgosMacro.length === 0) return;

    // Agrupar por sub-región (con el SUBREGION_MAP, sin "General" genérico)
    const subRegiones = {};
    hallazgosMacro.forEach(r => {
      const subRegion = obtenerSubRegion(r);
      if (!subRegiones[subRegion]) subRegiones[subRegion] = [];
      subRegiones[subRegion].push(r);
    });

    // 🆕 Ordenar sub-regiones de arriba hacia abajo (por su prioridad anatómica)
    const subRegionesOrdenadas = Object.entries(subRegiones)
      .sort(([subA], [subB]) => {
        // Orden de sub-regiones dentro de cada macro
        const ORDEN_SUB = {
          'Cráneo': 1, 'Cara': 2, 'Cuello': 3, 'Cuello/Trapecio': 4,
          'Pecho': 10, 'Costillas': 11, 'Abdomen': 12,
          'Cervical': 20, 'Dorsal': 21, 'Columna': 22, 'Lumbar': 23, 'Sacro': 24,
          'Hombro': 30, 'Brazo': 31, 'Codo': 32, 'Antebrazo': 33,
          'Muñeca': 34, 'Mano': 35, 'Dedos': 36, 'Nervios': 37,
          'Pelvis': 40, 'Cadera': 41, 'Glúteo': 42,
          'Muslo': 50, 'Rodilla': 51, 'Fosa Poplítea': 52, 'Pierna': 53, 'Tobillo': 54, 'Pie': 55,
          'Otras': 99,
        };
        return (ORDEN_SUB[subA] || 50) - (ORDEN_SUB[subB] || 50);
      })
      .map(([subName, regs]) => ({ subName, totalSub: regs.length, regiones: regs }));

    tablaData.push({
      macro,
      totalMacro: hallazgosMacro.length,
      subRegiones: subRegionesOrdenadas,
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
          // 🆕 FASE 1A: parsear sufijo __izq/__der
          const { baseId: rBase, lado: ladoT5 } = parseRegionKey(r, regionesData[r]);
          let nombreFormateado = formatearNombreRegion(rBase);
          if (ladoT5) nombreFormateado = añadirLado(nombreFormateado, ladoT5);
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

  // ============================================================
  // TABLA EVALUACIÓN POR REGIÓN
  // ============================================================
    const tablaRegiones = ordenarPorAnatomia(regiones).map(region => {
    const data = regionesData[region] || {};
    const eva = data.eva !== undefined ? `${data.eva}/10` : '—';
    const sintomasArray = data.sintomas || ['dolor'];
    // 🆕 FASE 1A: parsear sufijo __izq/__der
    const { baseId: regionBase, lado: ladoT6 } = parseRegionKey(region, data);
    let nombreFormateado = formatearNombreRegion(regionBase);
    if (ladoT6) nombreFormateado = añadirLado(nombreFormateado, ladoT6);
    return {
      region: nombreFormateado,
      sintomasArray, eva,
      rom: data.rom || '—',
      tests: Array.isArray(data.tests) && data.tests.length > 0 ? data.tests.join(', ') : '—',
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

  // ============================================================
  // PLAN DE TRATAMIENTO
  // ============================================================
  let planHTML = '<div style="font-size:9.5pt; line-height:1.55;">';
  if (val(meta._plan_tratamiento)) {
    corregirTypos(meta._plan_tratamiento).split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed === '') { planHTML += '<div style="height: 6px;"></div>'; return; }
      if (/^\d+\./.test(trimmed)) { planHTML += `<div style="font-weight: 700; margin-top: 8px; margin-bottom: 3px; color:#0f172a;">${trimmed}</div>`; return; }
      if (trimmed.endsWith(':') && !trimmed.startsWith('-')) { planHTML += `<div style="font-weight: 600; margin-top: 5px; margin-bottom: 2px; margin-left: 15px;">${trimmed}</div>`; return; }
      if (trimmed.startsWith('-') || trimmed.startsWith('•')) { planHTML += `<div style="margin-left: 25px; margin-bottom: 2px;">• ${trimmed.replace(/^[-•]\s*/, '')}</div>`; return; }
      planHTML += `<div style="margin-left: 0px; margin-bottom: 2px;">${trimmed}</div>`;
    });
  } else { planHTML += '<span style="color:#94a3b8; font-style:italic;">No registrado.</span>'; }
  planHTML += '</div>';

  // ============================================================
  // HTML FINAL
  // ============================================================
    const contenidoHTML = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><title>${firmaComoTecnico ? 'Evaluación Funcional' : 'Informe Clínico'} - ${nombrePaciente}</title>
       <style>
        @page { size: A4; margin: 1.4cm 1.4cm 2cm 1.4cm; }
        body { font-family: 'Calibri', Arial, sans-serif; font-size: 10pt; color: #1e293b; margin: 0; padding: 0; position: relative; }
        h1 { font-size: 12pt; font-weight: 700; color: #0f172a; border-left: 4px solid #22d3ee; padding-left: 8px; margin-top: 10px; margin-bottom: 4px; text-transform: uppercase; page-break-after: avoid; break-after: avoid; }
        h2 { font-size: 10.5pt; font-weight: 700; color: #0f172a; margin: 8px 0 3px 0; page-break-after: avoid; break-after: avoid; }
        h3 { font-size: 9.5pt; font-weight: 700; color: #475569; margin: 6px 0 3px 0; page-break-after: avoid; break-after: avoid; }
        table { width: 100%; border-collapse: collapse; margin: 2px 0; font-size: 8.5pt; table-layout: auto; }
        th, td { border: 1px solid #cbd5e1; padding: 3px 6px; text-align: left; vertical-align: top; }
        th { background-color: #f1f5f9; font-weight: 600; white-space: nowrap; }
        .alerta { background: #fee2e2; border-left: 4px solid #ef4444; padding: 6px 10px; margin: 6px 0; border-radius: 3px; font-size: 9pt; }
        .aviso { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 6px 10px; margin: 6px 0; border-radius: 3px; font-size: 8.5pt; color: #78350f; }
        .stickman-container { display: flex; justify-content: center; gap: 20px; margin: 10px 0; }
        .vista-pro { border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; break-inside: avoid; text-align: center; background: #fff; display:flex; flex-direction:column; justify-content:space-between; }
        .seccion-anatomica { page-break-inside: avoid; break-inside: avoid; margin-top: 20px; }
        .header-info { text-align:center; border-bottom:2px solid #22d3ee; padding:6px 0 6px 0; margin-bottom:8px; position:relative; min-height:62px; display:flex; align-items:center; justify-content:center; flex-direction:column; }
        .header-info h2 { margin:0; color:#0f172a; font-size:12.5pt; }
        .header-info p { margin:1px 0; font-size:8pt; color:#64748b; }
        .logo-header { position:absolute; left:0; top:50%; transform:translateY(-50%); max-height:56px; max-width:72px; background:#fff; padding:4px; border-radius:8px; box-shadow:0 1px 3px rgba(0,0,0,0.08); object-fit:contain; }
        
        /* Bloques inteligentes anti-corte */
        .seccion-bloque { page-break-inside: avoid; break-inside: avoid; }
        .form-grupo { page-break-inside: avoid; break-inside: avoid; }
        
        /* Página contenedora */
        /* 🆕 Permite que las tablas largas rompan entre páginas correctamente */
        table { page-break-inside: auto; break-inside: auto; }
        tr { page-break-inside: avoid; break-inside: avoid; page-break-after: auto; }
        thead { display: table-header-group; }
        tfoot { display: table-footer-group; }
        .pagina { page-break-after: always; padding-bottom: 22mm; position: relative; z-index: 1; min-height: 235mm; }
        .pagina:last-of-type { page-break-after: auto; }
        
        /* Marca de agua con logo (o texto fallback) */
        .marca-agua {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          opacity: 0.06;
          width: 55%;
          max-width: 450px;
          height: auto;
          z-index: 0;
          pointer-events: none;
        }
        .marca-agua-texto {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 90pt;
          font-weight: 900;
          color: rgba(34, 211, 238, 0.06);
          z-index: 0;
          pointer-events: none;
          white-space: nowrap;
          letter-spacing: 8px;
        }
        
        /* Footer GLOBAL fijo que se repite en cada hoja */
        .footer-global {
          position: fixed;
          bottom: 0mm;
          left: 1.4cm;
          right: 1.4cm;
          font-size: 6.5pt;
          color: #94a3b8;
          border-top: 1px solid #e2e8f0;
          padding: 2px 4px 0 4px;
          display: flex;
          justify-content: space-between;
          background: rgba(255, 255, 255, 0.92);
          z-index: 100;
        }
        
        .tabla-preguntas { width: 100%; border-collapse: collapse; margin: 0; font-size: 8.5pt; table-layout: auto; }
        .tabla-preguntas th { white-space: normal; }
        .tabla-preguntas th:first-child { width: 40%; }
        .qr-box { display: flex; align-items: center; gap: 10px; padding: 8px 12px; background: #f0f9ff; border: 1px solid #22d3ee; border-radius: 8px; margin: 8px 0; page-break-inside: avoid; }
        .qr-box img { width: 80px; height: 80px; border-radius: 4px; }
        .qr-box .qr-texto { font-size: 8.5pt; color: #0f172a; line-height: 1.3; }
      </style>
    </head>
        <body>
      <!-- 🆕 Marca de agua = logo del centro (o texto fallback) -->
      ${logoBase64 
        ? `<img src="${logoBase64}" class="marca-agua" alt="" />` 
        : `<div class="marca-agua-texto">CJPANTA</div>`
      }

      <!-- ============ PÁGINA 1: Header + Resumen/QR + Datos + Signos ============ -->
      <div class="pagina">
        <!-- Footer GLOBAL -->
        <div class="footer-global">
          <span>Confidencial · ${centroNombre}</span>
          <span>${nombrePaciente} · ${fecha}</span>
        </div>

        <div class="header-info">
          ${logoBase64 ? `<img src="${logoBase64}" class="logo-header" />` : ''}
          <h2>${firmaComoTecnico ? 'EVALUACIÓN FUNCIONAL Y PLAN DE EJERCICIOS' : 'INFORME DE EVALUACIÓN CLÍNICA'}</h2>
          <p><strong>${centroNombre}</strong>${firmaComoTecnico ? ' — GIMNASIO TERAPÉUTICO' : ''}</p>
          <p>Paciente: <strong>${nombrePaciente}</strong> | Fecha: ${fecha}${evaluacion.id ? ` | ID: ${evaluacion.id}` : ''}</p>
        </div>

        <!-- 🆕 QR + Resumen Ejecutivo en 50/50 (AHORA ARRIBA) -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px;">
         <!-- Columna izquierda: QR (Ahora más grande y usando Base64) -->
          <div style="border: 1px solid #22d3ee; border-radius: 6px; padding: 8px; background: #f0f9ff; display: flex; align-items: center; gap: 12px;">
            <img src="${qrBase64}" alt="QR Ficha" style="width: 105px; height: 105px; border-radius: 4px; flex-shrink: 0;" />
            <div style="font-size: 7.5pt; color: #0f172a; line-height: 1.25;">
              <div style="font-weight: 800; font-size: 10pt; margin-bottom: 2px;">📱 Mi ficha</div>
              <div style="font-size: 7.5pt; color: #475569;">Escanea para entrar a tu cuenta</div>
              <div style="color: #64748b; margin-top: 4px; font-size: 7pt;">${URL_APP}</div>
            </div>
          </div>

          <!-- Columna derecha: Resumen compacto -->
          <div style="border: 1px solid #22d3ee; border-radius: 6px; padding: 8px; background: linear-gradient(135deg, #f0f9ff 0%, #ecfdf5 100%);">
            <div style="font-size: 8pt; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 5px;">📊 Resumen</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 7.5pt;">
              <div style="background: white; padding: 3px 5px; border-radius: 3px; border-left: 2px solid #ef4444;">
                <span style="color: #64748b; font-size: 6.5pt; text-transform: uppercase; font-weight: 600;">EVA</span>
                <div style="font-weight: 800; color: #ef4444; font-size: 11pt; line-height: 1;">${evaMax}/10</div>
              </div>
              <div style="background: white; padding: 3px 5px; border-radius: 3px; border-left: 2px solid #22d3ee;">
                <span style="color: #64748b; font-size: 6.5pt; text-transform: uppercase; font-weight: 600;">Regiones</span>
                <div style="font-weight: 800; color: #22d3ee; font-size: 11pt; line-height: 1;">${regiones.length}</div>
              </div>
              <div style="background: white; padding: 3px 5px; border-radius: 3px; border-left: 2px solid #a855f7;">
                <span style="color: #64748b; font-size: 6.5pt; text-transform: uppercase; font-weight: 600;">Síntomas</span>
                <div style="font-weight: 800; color: #a855f7; font-size: 11pt; line-height: 1;">${sintomasSet.size}</div>
              </div>
              <div style="background: white; padding: 3px 5px; border-radius: 3px; border-left: 2px solid ${totalAlertas > 0 ? '#ef4444' : '#10b981'};">
                <span style="color: #64748b; font-size: 6.5pt; text-transform: uppercase; font-weight: 600;">Alertas</span>
                <div style="font-weight: 800; color: ${totalAlertas > 0 ? '#ef4444' : '#10b981'}; font-size: 11pt; line-height: 1;">${totalAlertas}</div>
              </div>
            </div>
            ${diagnosticoFinal ? `
              <div style="margin-top: 5px; padding: 4px 6px; background: white; border-left: 2px solid #10b981; border-radius: 3px; font-size: 7pt; color: #0f172a;">
                <div style="font-size: 6pt; color: #10b981; font-weight: 800; text-transform: uppercase;">Dx Sugerido</div>
                <div style="font-weight: 600; line-height: 1.2;">${diagnosticoFinal}</div>
              </div>
            ` : ''}
          </div>
        </div>

        ${datosUsuarioHTML}
        ${signosVitalesHTML}
      </div>

      <!-- ============ PÁGINA 2 FUSIONADA: Motivo + Antecedentes + Hábitos + Notas + 3.5 + Dolor + Gineco/Uro + Banderas ============ -->
      <div class="pagina">
        <div class="seccion-bloque">${motivoHTML}</div>
        <div class="seccion-bloque">${antecedentesHTML}</div>
        <div class="seccion-bloque">${habitosHTML}</div>
        <div class="seccion-bloque">${notasHTML}</div>
        ${especializadaHTML}
        <div class="seccion-bloque">${dolorHTML}</div>
        <div class="seccion-bloque">${ginecoUroHTML}</div>
        <div class="seccion-bloque">${banderasHTML}</div>
      </div>

      <!-- ============ PÁGINA 3: Regiones Afectadas + Stickman ============ -->
      <div class="pagina">
        <h1>5. Regiones Afectadas</h1>
        ${tablaJerarquicaHTML}

        <div class="stickman-container">${stickmanAnterior}${stickmanPosterior}</div>
        ${leyendaSintomasHTML()}
      </div>

      <!-- ============ PÁGINA 4: Evaluación por Región ============ -->
      <div class="pagina">
        <h1>6. Evaluación por Región</h1>
        <table>
          <thead><tr>
            <th style="width:19%;">Región</th>
            <th style="width:17%; font-size:8pt; line-height:1.15;">Hallazgo<br/><span style="font-size:7pt; font-weight:500; color:#64748b;">/ Síntomas</span></th>
            <th style="width:7%;">EVA</th>
            <th style="width:9%;">ROM</th>
            <th style="width:13%;">Tests</th>
            <th style="width:17%;">Observaciones</th>
            <th style="width:18%;">Notas</th>
          </tr></thead>
          <tbody>${tablaHTML}</tbody>
        </table>
      </div>

      <!-- ============ PÁGINA 5: Detalle Anatómico ============ -->
      <div class="seccion-anatomica" style="page-break-after: always; break-after: page;">
        <h1>6.5 Detalle Anatómico</h1>
        <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:15px;">
          ${vistaProHTML}
        </div>
      </div>

      <!-- ============ PÁGINA 6: Recomendaciones + Plan + Alertas + Datos ============ -->
      <div class="pagina">
        <h1>7. Recomendaciones Generales</h1>
        <div style="font-size:9.5pt; white-space:pre-line; line-height:1.6;">
          ${(() => {
            const rec = corregirTypos(meta._recomendaciones);
            if (!rec) return 'No registradas.';
            return numerarRecomendaciones(rec);
          })()}
        </div>

        <h1>${firmaComoTecnico ? '8. Plan de Ejercicios Terapéuticos' : '8. Plan de Tratamiento Fisioterapéutico'}</h1>
        ${firmaComoTecnico ? `<p class="aviso"><strong>Nota:</strong> Los agentes físicos y técnicas manuales aquí descritos son <strong>sugerencias de aplicación</strong> basadas en protocolos estándar. Su aplicación está sujeta a validación por un <strong>Lic. T.M. Fisioterapia</strong>.</p>` : ''}
        ${planHTML}

        <div style="page-break-inside: avoid; break-inside: avoid; page-break-before: auto;">
          <h1>9. Alertas de Seguridad</h1>
          ${(() => {
            // ... (todo tu código de las alertas se mantiene igual)
            const alertasTexto = corregirTypos(meta._alertas) || 'Sin banderas rojas detectadas.';
            const tieneBanderaRoja = banderasRojas.length > 0;
            const tieneAlertaVital = alertasSV.length > 0;
            const esCritico = tieneBanderaRoja;
            const esMedio = !esCritico && tieneAlertaVital;
            const bg = esCritico ? '#fee2e2' : esMedio ? '#fef3c7' : '#d1fae5';
            const border = esCritico ? '#ef4444' : esMedio ? '#f59e0b' : '#10b981';
            const icono = esCritico ? '🚨' : esMedio ? '⚠️' : '✅';
            const etiqueta = esCritico ? 'CRÍTICO' : esMedio ? 'PRECAUCIÓN' : 'SIN ALERTAS';
            return `
              <div style="background: ${bg}; border-left: 4px solid ${border}; padding: 8px 12px; margin: 6px 0; border-radius: 3px;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                  <span style="font-size: 14pt;">${icono}</span>
                  <span style="font-weight: 800; font-size: 9pt; color: ${border}; text-transform: uppercase; letter-spacing: 0.5px;">${etiqueta}</span>
                </div>
                <div style="font-size: 9pt; color: #1e293b; white-space: pre-line;">${alertasTexto}</div>
                ${tieneBanderaRoja ? `<div style="margin-top: 6px; font-size: 8.5pt; font-weight: 700; color: #991b1b;">Banderas rojas: ${banderasRojas.map(id => BANDERAS_ROJAS_LABELS[id] || id).join(' · ')}</div>` : ''}
                ${tieneAlertaVital && !tieneBanderaRoja ? `<div style="margin-top: 6px; font-size: 8.5pt; color: #78350f;">Alertas vitales: ${alertasSV.join(' · ')}</div>` : ''}
              </div>
            `;
          })()}
          ${firmaComoTecnico ? `<p class="aviso" style="margin-top:10px;"><strong>AVISO:</strong> Documento funcional elaborado por un Técnico en Fisioterapia y Rehabilitación. NO constituye diagnóstico clínico ni prescripción médica. Para diagnóstico o prescripción, consulte con un Lic. T.M. Fisioterapia.</p>` : ''}

          <h1>10. Datos de Generación</h1>
          <table>
            <tr><th>Documento generado por</th><td>${usuario}</td></tr>
            <tr><th>Tipo de profesional</th><td>${firmaComoTecnico ? 'Técnico en Fisioterapia y Rehabilitación' : 'Licenciado en Tecnología Médica - Fisioterapia'}</td></tr>
            <tr><th>Fecha de generación</th><td>${fecha} ${hora}</td></tr>
            <tr><th>Centro</th><td>${centroNombre}</td></tr>
          </table>

          <div style="margin-top:50px; text-align:right;">
            <p style="margin:0 0 70px 0; font-size:9.5pt;">Firma del Profesional:</p>
            <p style="border-top:1px solid #000; display:inline-block; padding-top:5px; min-width:320px; font-weight:bold; text-align:center;">${usuario}</p>
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