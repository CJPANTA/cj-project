// src/components/clinica/BodyChart/reglasClinicas.js
export const REGLAS_CLINICAS = {
  lumbar: {
    sugerencias: ['Psoas', 'Piriforme', 'Glúteo Medio', 'Isquiotibiales'],
    mensaje: 'La lumbalgia suele generar tensión en el Psoas y el Glúteo Medio. ¿Los has evaluado?'
  },
  sacro: {
    sugerencias: ['Piriforme', 'Sacroilíacas'],
    mensaje: 'El dolor sacro suele tener "yapa" en el Piriforme o en las articulaciones Sacroilíacas.'
  },
  rodilla: {
    sugerencias: ['Cuádriceps', 'Meniscos', 'Tibial Anterior'],
    mensaje: 'En la rodilla, revisa el Vasto Medial y la marcha (Tibial Anterior) por compensación.'
  },
  tobillo: {
    sugerencias: ['Tendón de Aquiles', 'Fascia Plantar'],
    mensaje: 'Un esguince de tobillo casi siempre inflama el Tendón de Aquiles o la Fascia Plantar.'
  },
  cuello: {
    sugerencias: ['Trapecio Sup.', 'Suboccipitales', 'ECOM'],
    mensaje: 'El dolor cervical casi siempre viene con contractura del Trapecio Superior. Revisa la ATM.'
  },
  hombro: {
    sugerencias: ['Supraespinoso', 'Deltoides', 'Escápula'],
    mensaje: 'El hombro doloroso suele comprometer el Manguito Rotador. ¿Has probado el arco doloroso?'
  },
  mano: {
    sugerencias: ['Túnel del Carpo', 'Tendones Flexores', 'Nervio Mediano'],
    mensaje: 'El dolor en nudillos o falanges suele venir de una compresión en el Túnel del Carpo o tensión en los tendones flexores del antebrazo.'
  },
  muneca: {
    sugerencias: ['Túnel Carpiano', 'Nervio Cubital', 'Pronador Redondo'],
    mensaje: '¡Ojo! Una muñeca dolorida suele tener "yapa" en el Túnel Carpiano o el canal de Guyon.'
  },
  codo: {
    sugerencias: ['Epicondilitis', 'Epitrocleitis', 'Nervio Radial'],
    mensaje: 'El dolor de codo suele irradiarse desde la muñeca o el hombro. Revisa los epicóndilos.'
  },
  brazo: {
    sugerencias: ['Bíceps', 'Tríceps', 'Nervio Radial'],
    mensaje: 'El dolor en el brazo puede deberse a tensión en el bíceps o a una compresión del nervio radial.'
  },
  pie: {
    sugerencias: ['Fascia Plantar', 'Tendón de Aquiles', 'Espolón'],
    mensaje: 'El dolor en el pie casi siempre compromete la Fascia Plantar o el Tendón de Aquiles.'
  }
};

// Función auxiliar para encontrar la regla correcta según lo que se marcó
export const buscarReglaClinica = (regionId) => {
  // 1. Si es una regla exacta (ej. 'lumbar', 'mano')
  if (REGLAS_CLINICAS[regionId]) return REGLAS_CLINICAS[regionId];
  
  const idLower = regionId.toLowerCase();

  // 2. Si es un sub-elemento de la vista Pro (ej. 'l4', 'menisco_lateral', 'metacarpiano_1')
  if (idLower.includes('l1') || idLower.includes('l2') || idLower.includes('l3') || idLower.includes('l4') || idLower.includes('l5') || idLower.includes('disco_l') || idLower.includes('faceta_l')) {
    return REGLAS_CLINICAS.lumbar;
  }
  if (idLower.includes('menisco') || idLower.includes('lca') || idLower.includes('lcp') || idLower.includes('rotula') || idLower.includes('tendon_patelar')) {
    return REGLAS_CLINICAS.rodilla;
  }
  if (idLower.includes('aquiles') || idLower.includes('peroneo') || idLower.includes('fascia_plantar')) {
    return REGLAS_CLINICAS.tobillo;
  }
  if (idLower.includes('supraespinoso') || idLower.includes('infraespinoso') || idLower.includes('manguito')) {
    return REGLAS_CLINICAS.hombro;
  }
  
  // 🟢 NUEVAS REGLAS PARA LA MANO Y BRAZO
  if (idLower.includes('metacarpiano') || idLower.includes('falange') || idLower.includes('dedo') || idLower.includes('pulgar') || idLower.includes('carpo') || idLower.includes('escafoides') || idLower.includes('ganchoso') || idLower.includes('grande') || idLower.includes('semilunar') || idLower.includes('piramidal') || idLower.includes('pisiforme') || idLower.includes('trapecio') || idLower.includes('trapezoide') || idLower.includes('tenar') || idLower.includes('hipotenar')) {
    return REGLAS_CLINICAS.mano;
  }
  if (idLower.includes('radio') || idLower.includes('cubito') || idLower.includes('ulna')) {
    return REGLAS_CLINICAS.muneca;
  }
  if (idLower.includes('epicondilo') || idLower.includes('epitroclea') || idLower.includes('olecranon') || idLower.includes('anular')) {
    return REGLAS_CLINICAS.codo;
  }
  if (idLower.includes('biceps') || idLower.includes('triceps') || idLower.includes('humero')) {
    return REGLAS_CLINICAS.brazo;
  }
  
  return null;
};