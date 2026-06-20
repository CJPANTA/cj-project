// src/utils/notificaciones.js
import { DIAS, CURSOS, getFechaInicioSemana, formatearFecha } from '../data/horario';

// Obtener la semana actual del ciclo (1-21)
export const getSemanaActual = () => {
  const hoy = new Date();
  const inicioCiclo = new Date(2026, 4, 4);
  const diffDias = Math.floor((hoy - inicioCiclo) / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.min(21, Math.floor(diffDias / 7) + 1));
};

// Obtener el día de la semana (0 = Domingo, 1 = Lunes, ...)
export const getDiaSemana = () => {
  const hoy = new Date();
  return hoy.getDay();
};

// Obtener la próxima clase del día
export const getProximaClase = () => {
  const semana = getSemanaActual();
  const diaIdx = getDiaSemana(); // 0=Domingo, 1=Lunes, ..., 6=Sábado
  const diaNombre = DIAS[diaIdx - 1]; // DIAS empieza en Lunes (índice 0)
  if (!diaNombre) return null; // Si es domingo (diaIdx=0), no hay clase

  const curso = CURSOS[diaNombre];
  if (!curso) return null;

  // Obtener modalidad para esta semana
  const modalidad = curso.modalidades[semana - 1] || 'No definido';

  // Obtener hora actual
  const ahora = new Date();
  const horaActual = ahora.getHours();
  const minActual = ahora.getMinutes();
  const horaActualStr = `${String(horaActual).padStart(2, '0')}:${String(minActual).padStart(2, '0')}`;

  // Buscar la próxima franja horaria
  const HORARIOS = ['19:15 - 20:00', '20:00 - 20:45', '20:45 - 21:30', '21:30 - 22:15'];
  let proximaHora = null;
  for (let rango of HORARIOS) {
    const [inicio, fin] = rango.split(' - ');
    const [hInicio, mInicio] = inicio.split(':').map(Number);
    const horaInicio = new Date();
    horaInicio.setHours(hInicio, mInicio, 0, 0);
    if (horaInicio > ahora) {
      proximaHora = rango;
      break;
    }
  }
  if (!proximaHora) return null; // Ya pasaron todas las clases de hoy

  return {
    curso: curso.nombre,
    docente: curso.docente,
    modalidad,
    hora: proximaHora,
    dia: diaNombre,
  };
};

// Verificar si hay que mostrar notificación
export const verificarNotificacion = () => {
  const clase = getProximaClase();
  if (!clase) return null;

  const ahora = new Date();
  const [horaInicio, horaFin] = clase.hora.split(' - ');
  const [hInicio, mInicio] = horaInicio.split(':').map(Number);
  const horaInicioObj = new Date();
  horaInicioObj.setHours(hInicio, mInicio, 0, 0);

  // Si la clase empieza en menos de 2 horas y más de 5 minutos
  const diffMs = horaInicioObj - ahora;
  const diffMin = diffMs / 1000 / 60;
  if (diffMin > 5 && diffMin <= 120) {
    return clase;
  }
  return null;
};

// Mostrar notificación
export const mostrarNotificacion = (clase) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const titulo = `📚 Próxima clase: ${clase.curso}`;
  const cuerpo = `Con ${clase.docente} - ${clase.hora} (${clase.modalidad})`;
  new Notification(titulo, {
    body: cuerpo,
    icon: '/logos_cj_circular.png',
  });
};