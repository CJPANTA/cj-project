// src/data/horario.js
export const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
export const HORARIOS = ['19:15 - 20:00', '20:00 - 20:45', '20:45 - 21:30', '21:30 - 22:15'];

export const CURSOS = {
  Lunes: {
    nombre: 'Rehabilitación en Traumatología y Deporte',
    docente: 'TEJADA CUADROS Kevin Robinson',
    modalidades: Array(21).fill('PRESENCIAL'),
  },
  Martes: {
    nombre: 'Rehabilitación en Actividades Ocupacionales',
    docente: 'BASILIO BALTAZAR Gloria Alexandra',
    modalidades: Array(21).fill('PRESENCIAL / VIRTUAL'),
  },
  Miércoles: {
    nombre: 'Rehabilitación en Neurología',
    docente: 'BRUNO PHOWELL Yasmin Del Rosario',
    modalidades: Array(21).fill('PRESENCIAL / VIRTUAL'),
  },
  Jueves: {
    nombre: 'Rehabilitación en Reumatología',
    docente: 'BORJA ARENAS Cesar Alfredo',
    modalidades: Array(21).fill('PRESENCIAL'),
  },
  Viernes: {
    nombre: 'Fundamento de la Investigación',
    docente: 'ALDAS JIMENEZ Delis Anita',
    modalidades: Array(21).fill('VIRTUAL'),
  },
  Sábado: {
    nombre: 'Pensamiento Creativo para la Investigación',
    docente: 'BECERRA LUCANO Luis Alexander',
    modalidades: Array(21).fill('VIRTUAL'),
  },
};

export const FECHAS_ESPECIALES = {
  'Rehabilitación en Reumatología': [
    '28/05/2026', '04/06/2026', '02/07/2026', '09/07/2026',
    '16/07/2026', '06/08/2026', '13/08/2026', '20/08/2026',
    '03/09/2026', '10/09/2026'
  ],
  'Rehabilitación en Neurología': [
    '03/06/2026', '24/06/2026', '01/07/2026', '15/07/2026',
    '22/07/2026', '05/08/2026', '12/08/2026', '02/09/2026'
  ],
  'Rehabilitación en Traumatología y Deporte': [
    '25/05/2026', '22/06/2026', '06/07/2026', '13/07/2026',
    '20/07/2026', '03/08/2026', '10/08/2026', '31/08/2026'
  ],
  'Rehabilitación en Actividades Ocupacionales': [
    '02/06/2026', '23/06/2026', '30/06/2026', '14/07/2026',
    '21/07/2026', '04/08/2026', '11/08/2026', '18/08/2026',
    '01/09/2026', '08/09/2026'
  ],
};

export const getFechaInicioSemana = (semanaIdx) => {
  const inicioCiclo = new Date(2026, 4, 4); // 04/05/2026
  const dias = (semanaIdx - 1) * 7;
  const fecha = new Date(inicioCiclo);
  fecha.setDate(fecha.getDate() + dias);
  return fecha;
};

export const formatearFecha = (fecha) => {
  const dd = String(fecha.getDate()).padStart(2, '0');
  const mm = String(fecha.getMonth() + 1).padStart(2, '0');
  const yyyy = fecha.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};