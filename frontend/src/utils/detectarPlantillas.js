// src/utils/detectarPlantillas.js
// ============================================================
// DETECCIÓN AUTOMÁTICA DE PLANTILLAS POR PALABRAS CLAVE
// ============================================================

const MAPA_KEYWORDS = {
  algias: [
    'dolor', 'algia', 'lumbalgia', 'cervicalgia', 'dorsalgia',
    'mialgia', 'artralgia', 'dolor muscular', 'dolor articular',
    'dolor de espalda', 'dolor lumbar', 'dolor cervical',
    'dolor de rodilla', 'dolor de hombro', 'dolor de codo',
    'dolor de muñeca', 'dolor de tobillo', 'dolor de cadera',
    'dolor de pie', 'dolor de mano', 'dolor de cuello',
    'contractura', 'calambre', 'punzada',
  ],
  reumatologico: [
    'artrosis', 'artritis', 'reuma', 'reumatoide', 'lupus',
    'espondilitis', 'espondiloartritis', 'gota', 'fibromialgia',
    'esclerodermia', 'polimialgia', 'polimiositis', 'sjögren', 'sjogren',
    'gonartrosis', 'coxartrosis', 'condrocalcinosis',
    'rigidez matutina', 'rigidez articular',
    // ⬇️ Nuevas keywords para captar mejor el contexto reumato
    'lumbalgia inflamatoria', 'lumbalgia crónica', 'lumbalgia cronica',
    'cervicalgia crónica', 'cervicalgia cronica',
    'dolor inflamatorio', 'dolor articular crónico', 'dolor articular cronico',
    'poliartralgia', 'oligoartritis', 'monoartritis',
    'sacroileitis', 'entesitis', 'entesitis aquílea', 'entesitis aquilea',
    'anticuerpos', 'factor reumatoide', 'anti-ccp',
    'sinovitis', 'derrame articular',
  ],
  deportivo: [
    'deportivo', 'deportista', 'futbol', 'fútbol', 'running',
    'correr', 'maratón', 'maraton', 'natación', 'natacion',
    'crossfit', 'gimnasio', 'pesas', 'ciclismo', 'baloncesto',
    'vóley', 'voley', 'tenis', 'squash', 'artes marciales',
    'esguince', 'distensión', 'desgarro', 'rotura fibrilar',
    'sobrecarga deportiva', 'lesión deportiva', 'lesion deportiva',
  ],
  geriatrico: [
    'adulto mayor', 'anciano', 'geriatría', 'geriatria',
    'caída', 'caidas', 'caídas', 'fragilidad', 'osteoporosis',
    'fractura de cadera', 'fractura de fémur', 'sarcopenia',
    'deterioro cognitivo', 'alzhéimer', 'alzheimer', 'parkinson',
    'polifarmacia', 'dependencia funcional',
  ],
  neurologico: [
    'neurológico', 'neurologico', 'ictus', 'acv', 'derrame cerebral',
    'hemiplejia', 'hemiparesia', 'paraplejia', 'tetraplejia',
    'esclerosis múltiple', 'esclerosis multiple', 'ELA',
    'temblor', 'convulsión', 'convulsion',
    'neuropatía', 'neuropatia', 'hormigueo', 'parestesia',
    'pérdida de fuerza', 'perdida de fuerza', 'debilidad muscular',
    'paresia', 'plejia', 'diplopía', 'disartria',
  ],
  oncologico: [
    'cáncer', 'cancer', 'oncológico', 'oncologico', 'tumor',
    'quimioterapia', 'radioterapia', 'metástasis', 'metastasis',
    'linfoma', 'leucemia', 'carcinoma', 'melanoma',
    'neoplasia', 'masectomía', 'mastectomia',
  ],
  pediatrico: [
    'niño', 'niña', 'bebé', 'bebe', 'lactante', 'infantil',
    'pediátrico', 'pediatrico', 'pediatría', 'pediatria',
    'adolescente', 'escolar', 'pubertad', 'recién nacido',
  ],
  vestibular: [
    'vértigo', 'vertigo', 'mareo', 'inestabilidad', 'equilibrio',
    'menière', 'meniere', 'nistagmo', 'vppb', 'vestibular',
    'desorientación', 'desorientacion', 'caídas por mareo',
    'acúfeno', 'acufeno', 'tinnitus',
  ],
  postquirurgico: [
    'post-operatorio', 'postoperatorio', 'post quirúrgico',
    'postquirurgico', 'post-quirurgico', 'cirugía reciente',
    'cirugia reciente', 'operación', 'operacion', 'artroscopia',
    'prótesis', 'protesis', 'reemplazo', 'osteosíntesis',
    'osteosintesis', 'rehabilitación post', 'rehabilitacion post',
    'post cirugía', 'post cirugia', 'post operatorio',
    'ligamentoplastia', 'plastía', 'plastia',
  ],
  dolor_cronico: [
    'dolor crónico', 'dolor cronico', 'crónico', 'cronico',
    'dolor persistente', 'más de 3 meses', 'mas de 3 meses',
    'dolor de larga data', 'fibromialgia', 'dolor neuropático',
    'dolor neuropatico', 'síndrome de dolor', 'sindrome de dolor',
    'dolor central', 'sensibilización central', 'sensibilizacion central',
  ],
  laboral: [
    'laboral', 'trabajo', 'oficina', 'oficinista', 'conductor',
    'obrero', 'operario', 'construcción', 'construccion',
    'repetitivo', 'movimiento repetitivo', 'ergonomía', 'ergonomia',
    'postura forzada', 'posturas forzadas', 'levantar peso',
    'carga laboral', 'accidente laboral', 'sedentario',
    'túnel carpiano', 'tunel carpiano', 'vibración', 'vibracion',
    'sobreuso', 'sobreexigencia', 'teletrabajo',
  ],
  psicosocial: [
    'ansiedad', 'depresión', 'depresion', 'estrés', 'estres',
    'emocional', 'psicológico', 'psicologico', 'abstinencia',
    'duelo', 'insomnio', 'catastrofismo', 'miedo al movimiento',
    'kinesiofobia', 'apoyo social', 'aislamiento',
    'burnout', 'burn out', 'sobrecarga emocional',
  ],
};

/**
 * Detecta plantillas sugeridas a partir de un texto
 * @param {string} texto - Texto a analizar (motivo + mecanismo)
 * @returns {string[]} - Array de keys de plantillas detectadas
 */
export function detectarPlantillas(texto) {
  if (!texto || texto.trim().length < 3) return [];
  const textoLower = texto.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const detectadas = new Set();
  for (const [tipo, keywords] of Object.entries(MAPA_KEYWORDS)) {
    for (const kw of keywords) {
      const kwNormalizado = kw.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      if (textoLower.includes(kwNormalizado)) {
        detectadas.add(tipo);
        break;
      }
    }
  }
  return Array.from(detectadas);
}