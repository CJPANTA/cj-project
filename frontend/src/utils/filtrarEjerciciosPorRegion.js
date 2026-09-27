// src/utils/filtrarEjerciciosPorRegion.js
// ============================================================
// FILTRO DE EJERCICIOS POR REGIÓN ANATÓMICA
// Valida que un ejercicio sugerido por la IA sea compatible con
// las regiones afectadas del paciente.
// ============================================================

const SUPER_GRUPOS = {
  cabeza: [
    'cabeza', 'frente', 'ojo_izq', 'ojo_der', 'nariz', 'boca',
    'atm_izq', 'atm_der', 'oreja_izq', 'oreja_der', 'ceja_izq', 'ceja_der',
  ],
  cuello: [
    'cuello', 'cervical', 'nuca', 'trapecio_izq', 'trapecio_der',
  ],
  hombro: [
    'hombro_izq', 'hombro_der', 'deltoides_izq', 'deltoides_der',
    'deltoides_ant', 'deltoides_post', 'acromion_izq', 'acromion_der',
    'manguito_izq', 'manguito_der', 'manguito_ant', 'manguito_post',
    'capsula_izq', 'capsula_der', 'escapula_izq', 'escapula_der',
    'clavicula_izq', 'clavicula_der',
  ],
  brazo: [
    'brazo_izq', 'brazo_der', 'biceps_izq', 'biceps_der', 'biceps',
    'triceps_izq', 'triceps_der', 'triceps', 'codo_izq', 'codo_der', 'codo',
    'olecranon_izq', 'olecranon_der', 'olecranon',
    'antebrazo_flex_izq', 'antebrazo_flex_der',
    'antebrazo_ext_izq', 'antebrazo_ext_der', 'antebrazo',
  ],
  mano: [
    'mano_izq', 'mano_der', 'muneca_izq', 'muneca_der',
    'muneca_post_izq', 'muneca_post_der', 'muneca',
    'carpo_izq', 'carpo_der', 'carpo',
    'metacarpo_izq', 'metacarpo_der', 'metacarpo',
    'falanges_prox_izq', 'falanges_prox_der',
    'falanges_dist_izq', 'falanges_dist_der',
    'pulgar_izq', 'pulgar_der',
    'eminencia_tenar_izq', 'eminencia_tenar_der',
  ],
  torax: [
    'torax', 'pecho', 'pectoral_izq', 'pectoral_der', 'esternon',
    'costillas_izq', 'costillas_der',
    'dorsal_ancho_izq', 'dorsal_ancho_der',
  ],
  columna: [
    'columna', 'cervical', 'dorsal', 'columna_dorsal', 'lumbar',
    'espalda', 'sacro', 'coxis',
  ],
  cadera: [
    'cadera', 'cadera_izq', 'cadera_der', 'pelvis', 'pubis', 'sacro',
    'gluteo_izq', 'gluteo_der', 'gluteo',
    'ilion_izq', 'ilion_der', 'isquion_izq', 'isquion_der',
  ],
  pierna: [
    'pierna_izq', 'pierna_der', 'muslo',
    'cuadriceps_izq', 'cuadriceps_der', 'cuadriceps',
    'isquiotibiales_izq', 'isquiotibiales_der', 'isquiotibial',
    'poplitea_izq', 'poplitea_der',
    'gemelos_izq', 'gemelos_der', 'gemelos_post',
    'gemelo_izq', 'gemelo_der', 'gemelo',
    'tibial_ant_izq', 'tibial_ant_der', 'tibial',
    'tendon_aquiles_izq', 'tendon_aquiles_der', 'tendon_aquiles',
  ],
  rodilla: [
    'rodilla_izq', 'rodilla_der',
    'rotula_izq', 'rotula_der', 'rotula',
    'lig_cruzado_ant_izq', 'lig_cruzado_ant_der',
    'lig_cruzado_post_izq', 'lig_cruzado_post_der',
    'lig_colateral_med_izq', 'lig_colateral_med_der',
    'lig_colateral_lat_izq', 'lig_colateral_lat_der',
    'menisco_med_izq', 'menisco_med_der',
    'menisco_lat_izq', 'menisco_lat_der',
    'poplitea_izq', 'poplitea_der',
  ],
  pie: [
    'pie_izq', 'pie_der', 'talon', 'talon_plantar',
    'talon_plantar_izq', 'talon_plantar_der', 'empeine', 'metatarsos',
    'falanges_pie', 'tobillo_izq', 'tobillo_der', 'tobillo',
    'retropie_calcaneo', 'retropie_calcaneo_izq', 'retropie_calcaneo_der',
    'mediopie_tarso', 'mediopie_tarso_izq', 'mediopie_tarso_der',
    'antepie_metatarso', 'antepie_metatarso_izq', 'antepie_metatarso_der',
    'falanges_lateral', 'falanges_lateral_izq', 'falanges_lateral_der',
  ],
};

// Devuelve los súper-grupos a los que pertenece un término
function getSuperGrupos(termino) {
  const terminoLower = (termino || '').toLowerCase().trim();
  const grupos = [];
  for (const [grupo, terminos] of Object.entries(SUPER_GRUPOS)) {
    if (terminos.includes(terminoLower)) grupos.push(grupo);
  }
  return grupos;
}

// ============================================================
// FUNCIÓN PRINCIPAL
// ============================================================
export function esEjercicioCompatible(zonasEjercicio, regionesPaciente) {
  // Ejercicio sin zonas definidas → se acepta (ejercicios generales)
  if (!zonasEjercicio || zonasEjercicio.length === 0) {
    return { compatible: true, razon: 'Ejercicio general (sin restricción de zona)' };
  }
  // Sin regiones del paciente → no podemos filtrar
  if (!regionesPaciente || regionesPaciente.length === 0) {
    return { compatible: true, razon: 'Sin regiones seleccionadas' };
  }

  // Súper-grupos del paciente
  const gruposPaciente = new Set();
  regionesPaciente.forEach((r) => {
    getSuperGrupos(r).forEach((g) => gruposPaciente.add(g));
  });

  // Buscar coincidencias
  const zonasCoincidentes = [];
  zonasEjercicio.forEach((z) => {
    const gruposZona = getSuperGrupos(z);
    if (gruposZona.some((g) => gruposPaciente.has(g))) {
      zonasCoincidentes.push(z);
    }
  });

  if (zonasCoincidentes.length > 0) {
    return {
      compatible: true,
      razon: `Coincide en: ${zonasCoincidentes.slice(0, 3).join(', ')}${zonasCoincidentes.length > 3 ? '...' : ''}`,
      coincidencias: zonasCoincidentes,
    };
  }

  return {
    compatible: false,
    razon: `Trabaja zonas que el paciente no tiene afectadas (${zonasEjercicio.slice(0, 3).join(', ')}${zonasEjercicio.length > 3 ? '...' : ''}).`,
  };
}

// ============================================================
// FILTRAR LISTA DE NOMBRES DE EJERCICIOS
// ============================================================
export function filtrarEjerciciosPorRegion(nombresEjercicios, catalogoEjercicios, regionesPaciente) {
  const compatibles = [];
  const incompatibles = [];

  nombresEjercicios.forEach((nombre) => {
    const ej = catalogoEjercicios.find((e) => e.nombre === nombre);
    if (!ej) {
      compatibles.push({ nombre, razon: 'No encontrado en catálogo' });
      return;
    }
    const resultado = esEjercicioCompatible(ej.zonas_aplicables, regionesPaciente);
    if (resultado.compatible) {
      compatibles.push({ nombre, razon: resultado.razon, coincidencias: resultado.coincidencias || [] });
    } else {
      incompatibles.push({ nombre, razon: resultado.razon, zonas_ejercicio: ej.zonas_aplicables });
    }
  });

  return { compatibles, incompatibles };
}