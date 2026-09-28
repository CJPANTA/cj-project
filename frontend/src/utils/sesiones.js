// ============================================================
// src/utils/sesiones.js
// CRUD de sesiones SOAP + helpers de evolución clínica
// ============================================================
import { supabase } from '../lib/supabaseClient';

// ============================================================
// 1. CREAR SESIÓN
//    Estructura esperada del payload:
//    {
//      paciente_id, evaluacion_id, centro_id,
//      duracion_min, subjetivo, objetivo, analisis, plan,
//      eva_inicial, eva_final,
//      agentes_aplicados: [], masoterapia_aplicada: [],
//      ejercicios_realizados: [],
//      notas_adicionales, proxima_sesion_sugerida
//    }
//    El trigger de BD asigna numero_sesion automáticamente.
// ============================================================
export async function crearSesion(payload) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuario no autenticado');

  const {
  paciente_id, evaluacion_id, centro_id,
  duracion_min, subjetivo, objetivo, analisis, plan,
  eva_inicial, eva_final,
  agentes_aplicados = [], masoterapia_aplicada = [],
  ejercicios_realizados = [],
  notas_adicionales, proxima_sesion_sugerida,
  adherencia_plan_casero,
} = payload;

  if (!paciente_id) throw new Error('paciente_id es obligatorio');
  if (!centro_id) throw new Error('centro_id es obligatorio');

  const datos = {
    paciente_id: Number(paciente_id),
    evaluacion_id: evaluacion_id ? Number(evaluacion_id) : null,
    centro_id,
    terapeuta_id: user.id,
    duracion_min: duracion_min ? parseInt(duracion_min) : null,
    subjetivo: subjetivo || null,
    objetivo: objetivo || null,
    analisis: analisis || null,
    plan: plan || null,
    eva_inicial: eva_inicial !== '' && eva_inicial != null ? parseInt(eva_inicial) : null,
    eva_final: eva_final !== '' && eva_final != null ? parseInt(eva_final) : null,
    agentes_aplicados,
    masoterapia_aplicada,
    ejercicios_realizados,
    notas_adicionales: notas_adicionales || null,
proxima_sesion_sugerida: proxima_sesion_sugerida || null,
adherencia_plan_casero:
  adherencia_plan_casero !== '' && adherencia_plan_casero != null
    ? parseInt(adherencia_plan_casero)
    : null,
    // numero_sesion en 0 → trigger lo calcula
    numero_sesion: 0,
  };

  const { data, error } = await supabase
    .from('sesiones')
    .insert([datos])
    .select()
    .single();

  if (error) {
    console.error('❌ [sesiones] Error creando:', error.message);
    throw error;
  }
  console.log('✅ [sesiones] Sesión creada #' + data.numero_sesion);
  return data;
}

// ============================================================
// 2. LISTAR SESIONES DE UN PACIENTE (ordenadas por fecha desc)
//    Hidrata con nombre del terapeuta
// ============================================================
export async function listarSesionesPorPaciente(pacienteId) {
  if (!pacienteId) return [];

  const { data, error } = await supabase
    .from('sesiones')
    .select('*')
    .eq('paciente_id', pacienteId)
    .order('fecha_sesion', { ascending: false });

  if (error) {
    console.error('❌ [sesiones] Error listando:', error.message);
    throw error;
  }

  if (!data || data.length === 0) return [];

  // Hidratar con nombre del terapeuta
  const ids = [...new Set(data.map((s) => s.terapeuta_id).filter(Boolean))];
  let perfilMap = {};
  if (ids.length > 0) {
    const { data: perfiles } = await supabase
      .from('profiles')
      .select('id, nombre_completo, tipo_profesional, numero_colegiatura, dni')
      .in('id', ids);
    (perfiles || []).forEach((p) => { perfilMap[p.id] = p; });
  }

  return data.map((s) => ({
    ...s,
    terapeuta: perfilMap[s.terapeuta_id] || null,
  }));
}

// ============================================================
// 3. OBTENER UNA SESIÓN POR ID
// ============================================================
export async function obtenerSesion(sesionId) {
  if (!sesionId) throw new Error('sesionId es obligatorio');
  const { data, error } = await supabase
    .from('sesiones')
    .select('*')
    .eq('id', sesionId)
    .single();

  if (error) {
    console.error('❌ [sesiones] Error obteniendo:', error.message);
    throw error;
  }
  return data;
}

// ============================================================
// 4. ACTUALIZAR SESIÓN
//    Solo permite editar campos clínicos (no terapeuta_id ni numero)
// ============================================================
export async function actualizarSesion(sesionId, cambios) {
  if (!sesionId) throw new Error('sesionId es obligatorio');

  const permitidos = [
  'duracion_min', 'subjetivo', 'objetivo', 'analisis', 'plan',
  'eva_inicial', 'eva_final',
  'agentes_aplicados', 'masoterapia_aplicada', 'ejercicios_realizados',
  'notas_adicionales', 'proxima_sesion_sugerida',
  'adherencia_plan_casero',
];

  const limpios = {};
  Object.keys(cambios).forEach((k) => {
    if (permitidos.includes(k)) limpios[k] = cambios[k];
  });

  if (Object.keys(limpios).length === 0) {
    console.warn('⚠️ [sesiones] Nada que actualizar');
    return null;
  }

  const { data, error } = await supabase
    .from('sesiones')
    .update(limpios)
    .eq('id', sesionId)
    .select()
    .single();

  if (error) {
    console.error('❌ [sesiones] Error actualizando:', error.message);
    throw error;
  }
  return data;
}

// ============================================================
// 5. ELIMINAR SESIÓN
// ============================================================
export async function eliminarSesion(sesionId) {
  if (!sesionId) throw new Error('sesionId es obligatorio');
  const { error } = await supabase
    .from('sesiones')
    .delete()
    .eq('id', sesionId);

  if (error) {
    console.error('❌ [sesiones] Error eliminando:', error.message);
    throw error;
  }
  return true;
}

// ============================================================
// 6. CONTAR SESIONES DE UN PACIENTE
// ============================================================
export async function contarSesiones(pacienteId) {
  if (!pacienteId) return 0;
  const { count, error } = await supabase
    .from('sesiones')
    .select('id', { count: 'exact', head: true })
    .eq('paciente_id', pacienteId);

  if (error) {
    console.error('❌ [sesiones] Error contando:', error.message);
    return 0;
  }
  return count || 0;
}

// ============================================================
// 7. EVOLUCIÓN EVA (para gráficos futuros)
//    Devuelve [{ fecha, eva_inicial, eva_final, numero_sesion }, ...]
//    ordenado del más antiguo al más reciente
// ============================================================
export async function evolucionEVA(pacienteId) {
  const sesiones = await listarSesionesPorPaciente(pacienteId);
  return sesiones
    .filter((s) => s.eva_inicial != null || s.eva_final != null)
    .map((s) => ({
      fecha: s.fecha_sesion,
      numero_sesion: s.numero_sesion,
      eva_inicial: s.eva_inicial,
      eva_final: s.eva_final,
      mejora: (s.eva_inicial != null && s.eva_final != null)
        ? s.eva_inicial - s.eva_final
        : null,
    }))
    .reverse(); // más antiguo → más reciente
}

// ============================================================
// 8. RESUMEN DE PROGRESO DEL PACIENTE
//    Útil para las tarjetas de stats en PacienteDetalle
// ============================================================
export async function resumenProgreso(pacienteId) {
  const sesiones = await listarSesionesPorPaciente(pacienteId);
  const total = sesiones.length;
  if (total === 0) {
  return {
    total: 0,
    primera_sesion: null,
    ultima_sesion: null,
    eva_promedio_inicial: null,
    eva_promedio_final: null,
    mejora_promedio: null,
    duracion_promedio_min: null,
    adherencia_promedio: null,
    sesiones_con_adherencia: 0,
  };
}

  const conEVA = sesiones.filter((s) => s.eva_inicial != null && s.eva_final != null);
  const promedio = (arr) => arr.length === 0
    ? null
    : Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10;

  const duraciones = sesiones.map((s) => s.duracion_min).filter((d) => d != null);
const adherencias = sesiones
  .map((s) => s.adherencia_plan_casero)
  .filter((a) => a != null);

return {
  total,
  primera_sesion: sesiones[sesiones.length - 1]?.fecha_sesion || null,
  ultima_sesion: sesiones[0]?.fecha_sesion || null,
  eva_promedio_inicial: promedio(conEVA.map((s) => s.eva_inicial)),
  eva_promedio_final: promedio(conEVA.map((s) => s.eva_final)),
  mejora_promedio: promedio(
    conEVA.map((s) => s.eva_inicial - s.eva_final)
  ),
  duracion_promedio_min: duracion_promedio_min_placeholder(duraciones),
  adherencia_promedio: promedio(adherencias),
  sesiones_con_adherencia: adherencias.length,
};
}

// Helper interno del resumen
function duracion_promedio_min_placeholder(arr) {
  if (arr.length === 0) return null;
  return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
}

// ============================================================
// 9. OBTENER EL NÚMERO DE LA PRÓXIMA SESIÓN
//    (aunque el trigger lo hace al insertar, útil para mostrar
//    "Vas a crear la sesión #8" en el modal antes de guardar)
// ============================================================
export async function proximoNumeroSesion(pacienteId) {
  const total = await contarSesiones(pacienteId);
  return total + 1;
}

// ============================================================
// 10. VERIFICAR SI EL USUARIO PUEDE EDITAR UNA SESIÓN
//     Regla: autor, o licenciado/híbrido/admin del centro, o director global
// ============================================================
export async function puedeEditarSesion(sesion) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  if (sesion.terapeuta_id === user.id) return true;

  const { data: perfil } = await supabase
    .from('profiles')
    .select('rol, centro_id')
    .eq('id', user.id)
    .single();

  if (!perfil) return false;
  if (perfil.rol === 1) return true; // Director Global
  if ([3, 4, 7].includes(perfil.rol) && perfil.centro_id === sesion.centro_id) return true;
  return false;
}