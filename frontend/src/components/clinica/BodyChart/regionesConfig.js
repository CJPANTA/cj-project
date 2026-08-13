// ============================================================
// CONFIGURACIÓN DE REGIONES Y SUBREGIONES (DRILL-DOWN)
// ============================================================
export const VISTAS = {
  // ============================================================
  // VISTA DEL CUERPO ENTERO (MACRO-REGIONES)
  // ============================================================
  cuerpo_entero: {
    nombre: 'Cuerpo entero',
    regiones: [
      { id: 'cabeza', x: 50, y: 12, label: 'Cabeza' },
      { id: 'cuello', x: 50, y: 20, label: 'Cuello' },
      { id: 'hombro_izq', x: 25, y: 28, label: 'Hombro I' },
      { id: 'hombro_der', x: 75, y: 28, label: 'Hombro D' },
      { id: 'brazo_izq', x: 18, y: 42, label: 'Brazo I' },
      { id: 'brazo_der', x: 82, y: 42, label: 'Brazo D' },
      { id: 'mano_izq', x: 15, y: 55, label: 'Mano I' },
      { id: 'mano_der', x: 85, y: 55, label: 'Mano D' },
      { id: 'torax', x: 50, y: 40, label: 'Tórax' },
      { id: 'columna', x: 50, y: 52, label: 'Columna' },
      { id: 'cadera', x: 50, y: 60, label: 'Cadera' },
      { id: 'pierna_izq', x: 30, y: 74, label: 'Pierna I' },
      { id: 'pierna_der', x: 70, y: 74, label: 'Pierna D' },
      { id: 'rodilla_izq', x: 28, y: 82, label: 'Rodilla I' },
      { id: 'rodilla_der', x: 72, y: 82, label: 'Rodilla D' },
      { id: 'pie_izq', x: 22, y: 92, label: 'Pie I' },
      { id: 'pie_der', x: 78, y: 92, label: 'Pie D' },
    ],
    detalle: {
      cabeza: 'cabeza',
      cuello: 'cabeza',
      hombro_izq: 'hombro_izq',
      hombro_der: 'hombro_der',
      brazo_izq: 'brazo_izq',
      brazo_der: 'brazo_der',
      mano_izq: 'mano_izq',
      mano_der: 'mano_der',
      torax: 'torax',
      columna: 'columna',
      cadera: 'cadera',
      pierna_izq: 'pierna_izq',
      pierna_der: 'pierna_der',
      rodilla_izq: 'rodilla_izq',
      rodilla_der: 'rodilla_der',
      pie_izq: 'pie_izq',
      pie_der: 'pie_der',
    }
  },

  // ============================================================
  // VISTAS REGIONALES (DRILL-DOWN)
  // ============================================================

  // --- CABEZA ---
  cabeza: {
    nombre: 'Cabeza',
    regiones: [
      { id: 'frente', x: 150, y: 45, label: 'Frente' },
      { id: 'ojo_izq', x: 118, y: 70, label: 'Ojo I' },
      { id: 'ojo_der', x: 182, y: 70, label: 'Ojo D' },
      { id: 'nariz', x: 150, y: 88, label: 'Nariz' },
      { id: 'boca', x: 150, y: 125, label: 'Boca' },
      { id: 'atm_izq', x: 105, y: 110, label: 'ATM I' },
      { id: 'atm_der', x: 195, y: 110, label: 'ATM D' },
      { id: 'oreja_izq', x: 78, y: 85, label: 'Oreja I' },
      { id: 'oreja_der', x: 222, y: 85, label: 'Oreja D' },
      { id: 'ceja_izq', x: 108, y: 50, label: 'Ceja I' },
      { id: 'ceja_der', x: 192, y: 50, label: 'Ceja D' },
      { id: 'cuello', x: 150, y: 190, label: 'Cuello Ant.' },
    ],
  },

  // --- HOMBRO IZQUIERDO ---
  hombro_izq: {
    nombre: 'Hombro Izquierdo',
    regiones: [
      { id: 'deltoides_izq', x: 100, y: 80, label: 'Deltoides' },
      { id: 'acromion_izq', x: 100, y: 40, label: 'Acromion' },
      { id: 'manguito_izq', x: 100, y: 120, label: 'Manguito Rotador' },
      { id: 'capsula_izq', x: 100, y: 160, label: 'Cápsula' },
    ],
  },

  // --- HOMBRO DERECHO ---
  hombro_der: {
    nombre: 'Hombro Derecho',
    regiones: [
      { id: 'deltoides_der', x: 100, y: 80, label: 'Deltoides' },
      { id: 'acromion_der', x: 100, y: 40, label: 'Acromion' },
      { id: 'manguito_der', x: 100, y: 120, label: 'Manguito Rotador' },
      { id: 'capsula_der', x: 100, y: 160, label: 'Cápsula' },
    ],
  },

  // --- BRAZO IZQUIERDO ---
  brazo_izq: {
    nombre: 'Brazo Izquierdo',
    regiones: [
      { id: 'biceps_izq', x: 110, y: 200, label: 'Bíceps' },
      { id: 'codo_izq', x: 110, y: 275, label: 'Codo' },
      { id: 'antebrazo_flex_izq', x: 110, y: 320, label: 'Antebrazo Flex.' },
      { id: 'muneca_izq', x: 110, y: 375, label: 'Muñeca' },
      { id: 'triceps_izq', x: 110, y: 200, label: 'Tríceps' },
      { id: 'olecranon_izq', x: 110, y: 275, label: 'Olécranon' },
      { id: 'antebrazo_ext_izq', x: 110, y: 320, label: 'Antebrazo Ext.' },
      { id: 'muneca_post_izq', x: 110, y: 375, label: 'Muñeca' },
    ],
  },

  // --- BRAZO DERECHO ---
  brazo_der: {
    nombre: 'Brazo Derecho',
    regiones: [
      { id: 'biceps_der', x: 110, y: 200, label: 'Bíceps' },
      { id: 'codo_der', x: 110, y: 275, label: 'Codo' },
      { id: 'antebrazo_flex_der', x: 110, y: 320, label: 'Antebrazo Flex.' },
      { id: 'muneca_der', x: 110, y: 375, label: 'Muñeca' },
      { id: 'triceps_der', x: 110, y: 200, label: 'Tríceps' },
      { id: 'olecranon_der', x: 110, y: 275, label: 'Olécranon' },
      { id: 'antebrazo_ext_der', x: 110, y: 320, label: 'Antebrazo Ext.' },
      { id: 'muneca_post_der', x: 110, y: 375, label: 'Muñeca' },
    ],
  },

  // --- MANO IZQUIERDA ---
  mano_izq: {
    nombre: 'Mano Izquierda',
    regiones: [
      { id: 'carpo_izq', x: 100, y: 175, label: 'Carpo' },
      { id: 'metacarpo_izq', x: 100, y: 130, label: 'Metacarpos' },
      { id: 'falanges_prox_izq', x: 100, y: 90, label: 'F. Proximales' },
      { id: 'falanges_dist_izq', x: 105, y: 60, label: 'F. Distales' },
      { id: 'pulgar_izq', x: 72, y: 105, label: 'Pulgar' },
      { id: 'eminencia_tenar_izq', x: 120, y: 145, label: 'Tenar' },
    ],
  },

  // --- MANO DERECHA ---
  mano_der: {
    nombre: 'Mano Derecha',
    regiones: [
      { id: 'carpo_der', x: 100, y: 175, label: 'Carpo' },
      { id: 'metacarpo_der', x: 100, y: 130, label: 'Metacarpos' },
      { id: 'falanges_prox_der', x: 100, y: 90, label: 'F. Proximales' },
      { id: 'falanges_dist_der', x: 105, y: 60, label: 'F. Distales' },
      { id: 'pulgar_der', x: 72, y: 105, label: 'Pulgar' },
      { id: 'eminencia_tenar_der', x: 120, y: 145, label: 'Tenar' },
    ],
  },

  // --- TÓRAX ---
  torax: {
    nombre: 'Tórax y Abdomen',
    regiones: [
      { id: 'clavicula_izq', x: 140, y: 72, label: 'Clavícula I' },
      { id: 'clavicula_der', x: 260, y: 72, label: 'Clavícula D' },
      { id: 'pectoral_izq', x: 145, y: 130, label: 'Pectoral I' },
      { id: 'pectoral_der', x: 255, y: 130, label: 'Pectoral D' },
      { id: 'esternon', x: 200, y: 130, label: 'Esternón' },
      { id: 'costillas_izq', x: 115, y: 220, label: 'Costillas I' },
      { id: 'costillas_der', x: 285, y: 220, label: 'Costillas D' },
      { id: 'abdomen', x: 200, y: 260, label: 'Abdomen' },
      { id: 'trapecio_izq', x: 140, y: 90, label: 'Trapecio I' },
      { id: 'trapecio_der', x: 260, y: 90, label: 'Trapecio D' },
      { id: 'escapula_izq', x: 135, y: 150, label: 'Escápula I' },
      { id: 'escapula_der', x: 265, y: 150, label: 'Escápula D' },
      { id: 'columna_dorsal', x: 200, y: 260, label: 'Columna' },
      { id: 'dorsal_ancho_izq', x: 160, y: 280, label: 'Dorsal I' },
      { id: 'dorsal_ancho_der', x: 240, y: 280, label: 'Dorsal D' },
    ],
  },

  // --- COLUMNA ---
  columna: {
    nombre: 'Columna',
    regiones: [
      { id: 'cervical', x: 50, y: 20, label: 'Cervical' },
      { id: 'dorsal', x: 50, y: 45, label: 'Dorsal' },
      { id: 'lumbar', x: 50, y: 70, label: 'Lumbar' },
    ],
  },

  // --- CADERA ---
  cadera: {
    nombre: 'Cadera',
    regiones: [
      { id: 'cadera_izq', x: 30, y: 30, label: 'Cadera I' },
      { id: 'cadera_der', x: 70, y: 30, label: 'Cadera D' },
      { id: 'sacro', x: 50, y: 55, label: 'Sacro' },
      { id: 'pubis', x: 50, y: 75, label: 'Pubis' },
    ],
  },

  // --- PIERNA IZQUIERDA ---
  pierna_izq: {
    nombre: 'Pierna Izquierda',
    regiones: [
      { id: 'cuadriceps_izq', x: 100, y: 100, label: 'Cuádriceps' },
      { id: 'rotula_izq', x: 100, y: 220, label: 'Rótula' },
      { id: 'tibial_ant_izq', x: 100, y: 290, label: 'Tibial Ant.' },
      { id: 'isquiotibiales_izq', x: 100, y: 100, label: 'Isquiotibiales' },
      { id: 'poplitea_izq', x: 100, y: 205, label: 'Fosa Poplítea' },
      { id: 'gemelos_izq', x: 100, y: 280, label: 'Gemelos' },
      { id: 'tendon_aquiles_izq', x: 100, y: 350, label: 'T. Aquiles' },
    ],
  },

  // --- PIERNA DERECHA ---
  pierna_der: {
    nombre: 'Pierna Derecha',
    regiones: [
      { id: 'cuadriceps_der', x: 100, y: 100, label: 'Cuádriceps' },
      { id: 'rotula_der', x: 100, y: 220, label: 'Rótula' },
      { id: 'tibial_ant_der', x: 100, y: 290, label: 'Tibial Ant.' },
      { id: 'isquiotibiales_der', x: 100, y: 100, label: 'Isquiotibiales' },
      { id: 'poplitea_der', x: 100, y: 205, label: 'Fosa Poplítea' },
      { id: 'gemelos_der', x: 100, y: 280, label: 'Gemelos' },
      { id: 'tendon_aquiles_der', x: 100, y: 350, label: 'T. Aquiles' },
    ],
  },

  // --- RODILLA IZQUIERDA ---
  rodilla_izq: {
    nombre: 'Rodilla Izquierda',
    regiones: [
      { id: 'lig_cruzado_ant_izq', x: 100, y: 80, label: 'LCA' },
      { id: 'lig_cruzado_post_izq', x: 100, y: 120, label: 'LCP' },
      { id: 'lig_colateral_med_izq', x: 60, y: 100, label: 'LCM' },
      { id: 'lig_colateral_lat_izq', x: 140, y: 100, label: 'LCL' },
      { id: 'menisco_med_izq', x: 70, y: 80, label: 'Menisco Med.' },
      { id: 'menisco_lat_izq', x: 130, y: 80, label: 'Menisco Lat.' },
      { id: 'rotula_izq', x: 100, y: 140, label: 'Rótula' },
    ],
  },

  // --- RODILLA DERECHA ---
  rodilla_der: {
    nombre: 'Rodilla Derecha',
    regiones: [
      { id: 'lig_cruzado_ant_der', x: 100, y: 80, label: 'LCA' },
      { id: 'lig_cruzado_post_der', x: 100, y: 120, label: 'LCP' },
      { id: 'lig_colateral_med_der', x: 60, y: 100, label: 'LCM' },
      { id: 'lig_colateral_lat_der', x: 140, y: 100, label: 'LCL' },
      { id: 'menisco_med_der', x: 70, y: 80, label: 'Menisco Med.' },
      { id: 'menisco_lat_der', x: 130, y: 80, label: 'Menisco Lat.' },
      { id: 'rotula_der', x: 100, y: 140, label: 'Rótula' },
    ],
  },

  // --- PIE ---
  pie: {
    nombre: 'Pie',
    regiones: [
      { id: 'talon', x: 120, y: 85, label: 'Talón' },
      { id: 'empeine', x: 95, y: 115, label: 'Empeine' },
      { id: 'metatarsos', x: 75, y: 145, label: 'Metatarsos' },
      { id: 'falanges_pie', x: 65, y: 170, label: 'Dedos' },
    ],
  },
};

// ============================================================
// RANGOS NORMALES POR REGIÓN (ROM)
// ============================================================
export const RANGOS_ROM = {
  // Configura tus rangos aquí según necesites
};

// ============================================================
// TESTS ESPECÍFICOS POR REGIÓN
// ============================================================
export const TESTS_POR_REGION = {
  // Configura tus tests aquí según necesites
};