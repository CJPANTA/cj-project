// src/utils/auditoria.js
// ============================================================
// HELPER DE AUDITORÍA
// Registra cambios importantes en perfiles de usuario.
// Los registros son inmutables (solo INSERT, nunca UPDATE/DELETE).
// ============================================================
import { supabase } from '../lib/supabaseClient';

// Campos que se auditan (los demás se ignoran para no llenar la tabla)
const CAMPOS_AUDITABLES = [
  'tipo_profesional',
  'rol',
  'estado',
  'centro_id',
  'dni',
  'numero_colegiatura',
  'registro_interno',
  'tipo_documento',
];

/**
 * Registra un cambio individual en un campo del perfil.
 * @param {Object} params
 * @param {string} params.perfilId - UUID del perfil que se modificó
 * @param {string} params.campo - Nombre del campo modificado
 * @param {string|null} params.valorAnterior - Valor antes del cambio
 * @param {string|null} params.valorNuevo - Valor después del cambio
 * @param {string|null} params.motivo - Motivo del cambio (opcional)
 * @returns {Promise<{ok: boolean, error?: string, skipped?: boolean}>}
 */
export async function registrarCambio({
  perfilId,
  campo,
  valorAnterior,
  valorNuevo,
  motivo = null,
}) {
  if (!perfilId || !campo) return { ok: false, error: 'Faltan datos' };

  // No registrar si no hubo cambio real (comparación normalizada a string)
  const anterior = valorAnterior === null || valorAnterior === undefined
    ? null : String(valorAnterior);
  const nuevo = valorNuevo === null || valorNuevo === undefined
    ? null : String(valorNuevo);

  if (anterior === nuevo) return { ok: true, skipped: true };

  try {
    // Obtener el usuario actual (quien edita)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: 'Sin usuario autenticado' };

    // Obtener el nombre del editor
    const { data: perfilEditor } = await supabase
      .from('profiles')
      .select('nombre_completo')
      .eq('id', user.id)
      .single();

    const { error } = await supabase.from('auditoria_perfiles').insert([{
      perfil_id: perfilId,
      editor_id: user.id,
      editor_nombre: perfilEditor?.nombre_completo || 'Usuario desconocido',
      campo_modificado: campo,
      valor_anterior: anterior,
      valor_nuevo: nuevo,
      motivo,
    }]);

    if (error) throw error;
    return { ok: true };
  } catch (error) {
    console.error('❌ Error registrando auditoría:', error);
    return { ok: false, error: error.message };
  }
}

/**
 * Registra múltiples cambios comparando dos objetos de perfil.
 * Solo registra los campos que cambiaron realmente.
 * @param {Object} params
 * @param {string} params.perfilId - UUID del perfil
 * @param {Object} params.datosAnteriores - Estado previo del perfil
 * @param {Object} params.datosNuevos - Estado nuevo del perfil
 * @param {string|null} params.motivo - Motivo del cambio
 * @returns {Promise<{ok: boolean, cantidad: number, detalle?: Array}>}
 */
export async function registrarCambiosMultiples({
  perfilId,
  datosAnteriores = {},
  datosNuevos = {},
  motivo = null,
}) {
  const cambios = [];

  for (const campo of CAMPOS_AUDITABLES) {
    const anterior = datosAnteriores?.[campo];
    const nuevo = datosNuevos?.[campo];

    const aStr = anterior === null || anterior === undefined ? null : String(anterior);
    const nStr = nuevo === null || nuevo === undefined ? null : String(nuevo);

    if (aStr !== nStr) {
      cambios.push({ campo, anterior: aStr, nuevo: nStr });
    }
  }

  if (cambios.length === 0) {
    return { ok: true, cantidad: 0 };
  }

  const resultados = [];
  for (const { campo, anterior, nuevo } of cambios) {
    const r = await registrarCambio({
      perfilId,
      campo,
      valorAnterior: anterior,
      valorNuevo: nuevo,
      motivo,
    });
    resultados.push({ campo, ...r });
  }

  const exitosos = resultados.filter((r) => r.ok).length;
  return { ok: exitosos > 0, cantidad: exitosos, detalle: resultados };
}

/**
 * Obtiene el historial de auditoría de un usuario (últimos N registros).
 * @param {string} perfilId - UUID del perfil
 * @param {number} limite - Cantidad máxima de registros (default 50)
 */
export async function obtenerHistorialPerfil(perfilId, limite = 50) {
  const { data, error } = await supabase
    .from('auditoria_perfiles')
    .select('*')
    .eq('perfil_id', perfilId)
    .order('created_at', { ascending: false })
    .limit(limite);

  if (error) {
    console.error('Error obteniendo historial:', error);
    return { ok: false, error: error.message, datos: [] };
  }
  return { ok: true, datos: data || [] };
}