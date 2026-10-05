// ============================================================
// src/utils/horarios.js
// CRUD de horarios + cuadrante semanal + personal en turno
// ============================================================
import { supabase } from '../lib/supabaseClient';

// ============================================================
// 1. CREAR TURNO
// ============================================================
export async function crearTurno(payload) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuario no autenticado');

  const {
    terapeuta_id,
    centro_id,
    fecha = null,
    dia_semana = null,
    hora_inicio,
    hora_fin,
    tipo_turno = 'personalizado',
    es_excepcion = false,
    tipo_excepcion = null,
    notas = null,
  } = payload;

  if (!terapeuta_id) throw new Error('terapeuta_id es obligatorio');
  if (!centro_id) throw new Error('centro_id es obligatorio');
  if (!hora_inicio || !hora_fin) throw new Error('hora_inicio y hora_fin son obligatorios');

  const esExc = !!es_excepcion;
  if (!esExc && (dia_semana === null || dia_semana === undefined)) {
    throw new Error('Para turnos recurrentes, dia_semana es obligatorio');
  }
  if (esExc && !fecha) {
    throw new Error('Para excepciones, fecha es obligatoria');
  }

  const { data, error } = await supabase
    .from('horarios_personal')
    .insert([{
      terapeuta_id,
      centro_id,
      fecha: esExc ? fecha : null,
      dia_semana: esExc ? null : parseInt(dia_semana),
      hora_inicio,
      hora_fin,
      tipo_turno,
      es_excepcion: esExc,
      tipo_excepcion: esExc ? tipo_excepcion : null,
      notas,
      created_by: user.id,
      activo: true,
    }])
    .select()
    .single();

  if (error) {
    console.error('❌ [horarios] Error creando:', error.message);
    throw error;
  }
  return data;
}

// ============================================================
// 2. ACTUALIZAR TURNO
// ============================================================
export async function actualizarTurno(turnoId, cambios) {
  const permitidos = [
    'hora_inicio', 'hora_fin', 'tipo_turno',
    'tipo_excepcion', 'notas', 'activo',
  ];
  const limpios = {};
  Object.keys(cambios).forEach((k) => {
    if (permitidos.includes(k)) limpios[k] = cambios[k];
  });
  if (Object.keys(limpios).length === 0) return null;

  const { data, error } = await supabase
    .from('horarios_personal')
    .update(limpios)
    .eq('id', turnoId)
    .select()
    .single();

  if (error) {
    console.error('❌ [horarios] Error actualizando:', error.message);
    throw error;
  }
  return data;
}

// ============================================================
// 3. ELIMINAR TURNO
// ============================================================
export async function eliminarTurno(turnoId) {
  const { error } = await supabase.from('horarios_personal').delete().eq('id', turnoId);
  if (error) {
    console.error('❌ [horarios] Error eliminando:', error.message);
    throw error;
  }
  return true;
}

// ============================================================
// 4. OBTENER TODOS LOS TURNOS DE UN CENTRO
// ============================================================
export async function listarTurnosDelCentro(centroId) {
  if (!centroId) return [];
  const { data, error } = await supabase
    .from('horarios_personal')
    .select('*')
    .eq('centro_id', centroId)
    .eq('activo', true)
    .order('hora_inicio');
  if (error) {
    console.error('❌ [horarios] Error listando:', error.message);
    return [];
  }
  return data || [];
}

// ============================================================
// 5. HELPERS DE FECHA
// ============================================================
export function inicioDeSemana(fecha) {
  const d = new Date(fecha);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const lunes = new Date(d);
  lunes.setDate(diff);
  lunes.setHours(0, 0, 0, 0);
  return lunes;
}

export function formatearFechaISO(fecha) {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, '0');
  const d = String(fecha.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatearHora(horaStr) {
  if (!horaStr) return '';
  return horaStr.substring(0, 5);
}

// ============================================================
// 6. CONSTRUIR EL CUADRANTE SEMANAL
//    Devuelve: { 'YYYY-MM-DD': { terapeuta_id: [turnos] } }
// ============================================================
export async function obtenerCuadranteSemanal({ centroId, fechaReferencia }) {
  const lunes = inicioDeSemana(fechaReferencia);
  const dias = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(lunes);
    d.setDate(lunes.getDate() + i);
    return d;
  });

  const todos = await listarTurnosDelCentro(centroId);

  const recurrentes = todos.filter((t) => !t.es_excepcion);
  const excepciones = todos.filter((t) => t.es_excepcion);

  const resultado = {};
  dias.forEach((d) => {
    const fechaStr = formatearFechaISO(d);
    resultado[fechaStr] = {};
  });

  // 1) Aplicar recurrentes
  dias.forEach((d) => {
    const fechaStr = formatearFechaISO(d);
    const diaSem = d.getDay(); // 0=Dom ... 6=Sáb
    recurrentes.forEach((r) => {
      if (r.dia_semana !== diaSem) return;
      if (!resultado[fechaStr][r.terapeuta_id]) {
        resultado[fechaStr][r.terapeuta_id] = [];
      }
      resultado[fechaStr][r.terapeuta_id].push({ ...r, es_recurrente: true });
    });
  });

  // 2) Aplicar excepciones de la semana
  dias.forEach((d) => {
    const fechaStr = formatearFechaISO(d);
    const exs = excepciones.filter((e) => e.fecha === fechaStr);
    exs.forEach((e) => {
      const tid = e.terapeuta_id;
      if (!resultado[fechaStr][tid]) resultado[fechaStr][tid] = [];

      if (e.tipo_excepcion === 'libre') {
        resultado[fechaStr][tid] = [{ ...e, es_recurrente: false }];
      } else if (e.tipo_excepcion === 'extra') {
        resultado[fechaStr][tid].push({ ...e, es_recurrente: false });
      } else if (e.tipo_excepcion === 'cambio') {
        resultado[fechaStr][tid] = [{ ...e, es_recurrente: false }];
      }
    });
  });

  // Ordenar turnos por hora_inicio
  Object.keys(resultado).forEach((f) => {
    Object.keys(resultado[f]).forEach((t) => {
      resultado[f][t].sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
    });
  });

  return resultado;
}

// ============================================================
// 7. PERSONAL EN TURNO EN UN MOMENTO DADO
//    Devuelve array de terapeuta_id que están trabajando
//    a esa fecha-hora específica.
// ============================================================
export async function personalDeTurno({ centroId, fechaHora }) {
  if (!centroId || !fechaHora) return [];
  const fecha = new Date(fechaHora);
  const fechaStr = formatearFechaISO(fecha);
  const horaStr = `${String(fecha.getHours()).padStart(2, '0')}:${String(fecha.getMinutes()).padStart(2, '0')}:00`;
  const diaSem = fecha.getDay();

  const { data, error } = await supabase
    .from('horarios_personal')
    .select('*')
    .eq('centro_id', centroId)
    .eq('activo', true);

  if (error) {
    console.error('❌ [horarios] Error personalDeTurno:', error.message);
    return [];
  }

  const recurrentes = data.filter((h) => !h.es_excepcion && h.dia_semana === diaSem);
  const excepciones = data.filter((h) => h.es_excepcion && h.fecha === fechaStr);

  const enTurno = new Set();

  // Base: recurrentes que cubren la hora
  recurrentes.forEach((r) => {
    if (r.hora_inicio <= horaStr && horaStr < r.hora_fin) {
      enTurno.add(r.terapeuta_id);
    }
  });

  // Excepciones ganan
  excepciones.forEach((e) => {
    if (e.tipo_excepcion === 'libre') {
      enTurno.delete(e.terapeuta_id);
    } else if (e.tipo_excepcion === 'extra') {
      if (e.hora_inicio <= horaStr && horaStr < e.hora_fin) {
        enTurno.add(e.terapeuta_id);
      }
    } else if (e.tipo_excepcion === 'cambio') {
      if (e.hora_inicio <= horaStr && horaStr < e.hora_fin) {
        enTurno.add(e.terapeuta_id);
      } else {
        enTurno.delete(e.terapeuta_id);
      }
    }
  });

  return Array.from(enTurno);
}

// ============================================================
// 8. ETIQUETAS Y COLORES POR TIPO DE TURNO
// ============================================================
export function colorTurno(tipo) {
  const map = {
    mañana:        'bg-amber-500/25 border-amber-400 text-amber-100',
    tarde:         'bg-orange-500/25 border-orange-400 text-orange-100',
    noche:         'bg-indigo-500/25 border-indigo-400 text-indigo-100',
    partido:       'bg-emerald-500/25 border-emerald-400 text-emerald-100',
    personalizado: 'bg-cyan-500/25 border-cyan-400 text-cyan-100',
  };
  return map[tipo] || map.personalizado;
}

export function emojiTurno(tipo) {
  const map = {
    mañana: '🌅',
    tarde: '☀️',
    noche: '🌙',
    partido: '🔄',
    personalizado: '📅',
  };
  return map[tipo] || '📅';
}

export function etiquetaTipoExcepcion(tipo) {
  const map = {
    libre: 'Día libre',
    extra: 'Turno extra',
    cambio: 'Cambio de turno',
  };
  return map[tipo] || tipo;
}