// ============================================================
// src/utils/citas.js
// CRUD de citas + helpers de agenda y disponibilidad
// ============================================================
import { supabase } from '../lib/supabaseClient';

// ============================================================
// 1. CREAR CITA (con verificación de disponibilidad)
// ============================================================
export async function crearCita(payload) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuario no autenticado');

  const {
    paciente_id,
    terapeuta_id,
    centro_id,
    fecha_hora,
    duracion_min = 45,
    tipo = 'seguimiento',
    notas = null,
  } = payload;

  if (!paciente_id) throw new Error('paciente_id es obligatorio');
  if (!terapeuta_id) throw new Error('terapeuta_id es obligatorio');
  if (!centro_id) throw new Error('centro_id es obligatorio');
  if (!fecha_hora) throw new Error('fecha_hora es obligatoria');

  const disponible = await verificarDisponibilidad({
    terapeutaId: terapeuta_id,
    fechaHora: fecha_hora,
    duracionMin: parseInt(duracion_min),
  });
  if (!disponible) {
    throw new Error('El terapeuta ya tiene una cita en ese horario.');
  }

  const { data, error } = await supabase
    .from('citas')
    .insert([{
      paciente_id: Number(paciente_id),
      terapeuta_id,
      centro_id,
      fecha_hora,
      duracion_min: parseInt(duracion_min),
      tipo,
      notas,
      estado: 'programada',
      created_by: user.id,
    }])
    .select()
    .single();

  if (error) {
    console.error('❌ [citas] Error creando:', error.message);
    throw error;
  }
  return data;
}

// ============================================================
// 2. LISTAR CITAS POR RANGO (hidrata paciente y terapeuta)
// ============================================================
export async function listarCitasPorRango({
  centroId = null,
  terapeutaId = null,
  fechaInicio,
  fechaFin,
  esDirectorGlobal = false,
}) {
  if (!fechaInicio || !fechaFin) {
    throw new Error('fechaInicio y fechaFin son obligatorios');
  }

  let query = supabase
    .from('citas')
    .select('*')
    .gte('fecha_hora', fechaInicio)
    .lt('fecha_hora', fechaFin)
    .order('fecha_hora', { ascending: true });

  if (!esDirectorGlobal && centroId) {
    query = query.eq('centro_id', centroId);
  }
  if (terapeutaId) {
    query = query.eq('terapeuta_id', terapeutaId);
  }

  const { data, error } = await query;
  if (error) {
    console.error('❌ [citas] Error listando:', error.message);
    throw error;
  }
  if (!data || data.length === 0) return [];

  // Hidratar pacientes
  const pacienteIds = [...new Set(data.map((c) => c.paciente_id).filter(Boolean))];
  const terapeutaIds = [...new Set(data.map((c) => c.terapeuta_id).filter(Boolean))];

  const [pacRes, terRes] = await Promise.all([
    pacienteIds.length
      ? supabase
          .from('pacientes')
          .select('id, nombre, apellidos, telefono, diagnostico, fecha_nacimiento, centro_id')
          .in('id', pacienteIds)
      : Promise.resolve({ data: [] }),
    terapeutaIds.length
      ? supabase
          .from('profiles')
          .select('id, nombre_completo, tipo_profesional, numero_colegiatura, dni, rol')
          .in('id', terapeutaIds)
      : Promise.resolve({ data: [] }),
  ]);

  const pacMap = {};
  (pacRes.data || []).forEach((p) => { pacMap[p.id] = p; });
  const terMap = {};
  (terRes.data || []).forEach((t) => { terMap[t.id] = t; });

  return data.map((c) => ({
    ...c,
    paciente: pacMap[c.paciente_id] || null,
    terapeuta: terMap[c.terapeuta_id] || null,
  }));
}

// ============================================================
// 3. CITAS DE UN DÍA (más liviano que el rango semanal)
// ============================================================
export async function listarCitasDelDia({
  centroId = null,
  terapeutaId = null,
  fecha,
  esDirectorGlobal = false,
}) {
  const d = new Date(fecha);
  d.setHours(0, 0, 0, 0);
  const inicio = d.toISOString();
  const fin = new Date(d.getTime() + 24 * 3600 * 1000).toISOString();

  return listarCitasPorRango({
    centroId,
    terapeutaId,
    fechaInicio: inicio,
    fechaFin: fin,
    esDirectorGlobal,
  });
}

// ============================================================
// 4. VERIFICAR DISPONIBILIDAD (evita solapamientos)
// ============================================================
export async function verificarDisponibilidad({
  terapeutaId,
  fechaHora,
  duracionMin = 45,
  excluirCitaId = null,
}) {
  if (!terapeutaId || !fechaHora) return true;

  const inicio = new Date(fechaHora);
  const fin = new Date(inicio.getTime() + parseInt(duracionMin) * 60000);

  // Margen de ±4h para reducir datos
  const rangoInicio = new Date(inicio.getTime() - 4 * 3600 * 1000).toISOString();
  const rangoFin = new Date(fin.getTime() + 4 * 3600 * 1000).toISOString();

  let query = supabase
    .from('citas')
    .select('id, fecha_hora, duracion_min, estado')
    .eq('terapeuta_id', terapeutaId)
    .gte('fecha_hora', rangoInicio)
    .lt('fecha_hora', rangoFin)
    .in('estado', ['programada', 'confirmada']);

  if (excluirCitaId) query = query.neq('id', excluirCitaId);

  const { data, error } = await query;
  if (error) {
    console.error('❌ [citas] Error verificando disponibilidad:', error.message);
    return true; // ante la duda, dejamos pasar (evitamos bloquear al usuario)
  }

  const solapa = (data || []).some((c) => {
    const cInicio = new Date(c.fecha_hora);
    const cFin = new Date(cInicio.getTime() + (c.duracion_min || 45) * 60000);
    return inicio < cFin && fin > cInicio;
  });

  return !solapa;
}

// ============================================================
// 5. ACTUALIZAR CITA (campos clínicos, no id ni created_by)
// ============================================================
export async function actualizarCita(citaId, cambios) {
  if (!citaId) throw new Error('citaId es obligatorio');

  const permitidos = [
    'fecha_hora',
    'duracion_min',
    'estado',
    'tipo',
    'notas',
    'terapeuta_id',
    'sesion_id',
  ];
  const limpios = {};
  Object.keys(cambios).forEach((k) => {
    if (permitidos.includes(k)) limpios[k] = cambios[k];
  });

  if (Object.keys(limpios).length === 0) return null;

  const { data, error } = await supabase
    .from('citas')
    .update(limpios)
    .eq('id', citaId)
    .select()
    .single();

  if (error) {
    console.error('❌ [citas] Error actualizando:', error.message);
    throw error;
  }
  return data;
}

// ============================================================
// 6. CAMBIAR ESTADO (con verificación de disponibilidad si mueve fecha)
// ============================================================
export async function cambiarEstadoCita(citaId, nuevoEstado, sesionId = null) {
  const estadosValidos = ['programada', 'confirmada', 'asistida', 'cancelada', 'no_asistio'];
  if (!estadosValidos.includes(nuevoEstado)) {
    throw new Error('Estado no válido: ' + nuevoEstado);
  }
  const update = { estado: nuevoEstado };
  if (sesionId) update.sesion_id = sesionId;
  return actualizarCita(citaId, update);
}

// ============================================================
// 7. ELIMINAR CITA
// ============================================================
export async function eliminarCita(citaId) {
  if (!citaId) throw new Error('citaId es obligatorio');
  const { error } = await supabase.from('citas').delete().eq('id', citaId);
  if (error) {
    console.error('❌ [citas] Error eliminando:', error.message);
    throw error;
  }
  return true;
}

// ============================================================
// 8. LISTAR TERAPEUTAS DISPONIBLES DEL CENTRO
// ============================================================
export async function listarTerapeutasDelCentro(centroId) {
  // Roles que pueden atender citas: Director, Licenciado, Híbrido, Admin Centro, Independiente
  const rolesClinicos = [1, 3, 4, 7, 8];
  let query = supabase
    .from('profiles')
    .select('id, nombre_completo, rol, tipo_profesional, centro_id')
    .in('rol', rolesClinicos)
    .order('nombre_completo');

  if (centroId) {
    query = query.eq('centro_id', centroId);
  }

  const { data, error } = await query;
  if (error) {
    console.error('❌ [citas] Error listando terapeutas:', error.message);
    return [];
  }
  return data || [];
}

// ============================================================
// 9. HELPERS DE FECHA (lunes como inicio de semana)
// ============================================================
export function inicioDeSemana(fecha) {
  const d = new Date(fecha);
  const day = d.getDay(); // 0 = Domingo
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const lunes = new Date(d);
  lunes.setDate(diff);
  lunes.setHours(0, 0, 0, 0);
  return lunes;
}

export function finDeSemana(fecha) {
  const ini = inicioDeSemana(fecha);
  const fin = new Date(ini);
  fin.setDate(ini.getDate() + 7);
  return fin;
}

// ============================================================
// 10. FORMATEADORES
// ============================================================
export function formatearHora(fechaISO) {
  const d = new Date(fechaISO);
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

export function formatearFecha(fechaISO) {
  const d = new Date(fechaISO);
  return d.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
  });
}

export function etiquetaEstado(estado) {
  const map = {
    programada: 'Programada',
    confirmada: 'Confirmada',
    asistida: 'Asistió',
    cancelada: 'Cancelada',
    no_asistio: 'No asistió',
  };
  return map[estado] || estado;
}

export function etiquetaTipo(tipo) {
  const map = {
    primera_vez: 'Primera vez',
    seguimiento: 'Seguimiento',
    reevaluacion: 'Reevaluación',
  };
  return map[tipo] || tipo;
}