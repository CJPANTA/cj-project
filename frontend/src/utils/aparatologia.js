// ============================================================
// src/utils/aparatologia.js
// CRUD de equipamiento del centro + helpers para la IA
// ============================================================
import { supabase } from '../lib/supabaseClient';

// ============================================================
// 1. LISTAR EQUIPAMIENTO DE UN CENTRO
// ============================================================
export async function listarEquipamiento(centroId) {
  if (!centroId) return [];
  const { data, error } = await supabase
    .from('centros_equipamiento')
    .select('*')
    .eq('centro_id', centroId)
    .order('agente_nombre', { ascending: true });

  if (error) {
    console.error('❌ [aparatologia] Error listando:', error.message);
    throw error;
  }
  return data || [];
}

// ============================================================
// 2. LISTAR SOLO EQUIPOS DISPONIBLES (los que la IA puede usar)
// ============================================================
export async function listarDisponibles(centroId) {
  const todos = await listarEquipamiento(centroId);
  return todos.filter((e) => e.disponible === true);
}

// ============================================================
// 3. AGREGAR EQUIPO AL CENTRO
//    `agente` = objeto del catalogo_agentes_fisicos.json
//    { id, nombre, tipo, ... }
// ============================================================
export async function agregarEquipo(centroId, agente, opciones = {}) {
  if (!centroId) throw new Error('centroId es obligatorio');
  if (!agente?.id || !agente?.nombre) throw new Error('Agente inválido');

  const { data: { user } } = await supabase.auth.getUser();

  const payload = {
    centro_id: centroId,
    agente_id: agente.id,
    agente_nombre: agente.nombre,
    tipo: agente.tipo || null,
    disponible: opciones.disponible ?? true,
    cantidad: opciones.cantidad ?? 1,
    marca: opciones.marca || null,
    modelo: opciones.modelo || null,
    notas: opciones.notas || null,
    created_by: user?.id || null,
  };

  const { data, error } = await supabase
    .from('centros_equipamiento')
    .insert([payload])
    .select()
    .single();

  if (error) {
    // Código 23505 = unique violation (ya existe ese agente en ese centro)
    if (error.code === '23505') {
      throw new Error('Este equipo ya está registrado en el centro.');
    }
    console.error('❌ [aparatologia] Error agregando:', error.message);
    throw error;
  }
  return data;
}

// ============================================================
// 4. ACTUALIZAR EQUIPO
// ============================================================
export async function actualizarEquipo(equipoId, cambios) {
  if (!equipoId) throw new Error('equipoId es obligatorio');

  const permitidos = [
  'disponible', 'cantidad', 'marca', 'modelo', 'notas',
  'tipo', 'agente_nombre',
  'descripcion', 'indicaciones', 'contraindicaciones',
];
  const limpios = {};
  Object.keys(cambios).forEach((k) => {
    if (permitidos.includes(k)) limpios[k] = cambios[k];
  });

  const { data, error } = await supabase
    .from('centros_equipamiento')
    .update(limpios)
    .eq('id', equipoId)
    .select()
    .single();

  if (error) {
    console.error('❌ [aparatologia] Error actualizando:', error.message);
    throw error;
  }
  return data;
}

// ============================================================
// 5. ELIMINAR EQUIPO
// ============================================================
export async function eliminarEquipo(equipoId) {
  if (!equipoId) throw new Error('equipoId es obligatorio');
  const { error } = await supabase
    .from('centros_equipamiento')
    .delete()
    .eq('id', equipoId);

  if (error) {
    console.error('❌ [aparatologia] Error eliminando:', error.message);
    throw error;
  }
  return true;
}

// ============================================================
// 6. TOGGLE RÁPIDO DE DISPONIBILIDAD
// ============================================================
export async function toggleDisponible(equipoId, nuevoEstado) {
  return actualizarEquipo(equipoId, { disponible: nuevoEstado });
}

// ============================================================
// 7. ¿EL CENTRO TIENE ESTE AGENTE?
//    Se usa en el prompt de la IA (EvaluacionPostural.jsx)
// ============================================================
export async function tieneAgente(centroId, agenteId) {
  const lista = await listarEquipamiento(centroId);
  return lista.some((e) => e.agente_id === agenteId && e.disponible === true);
}

// ============================================================
// 8. OBTENER NOMBRES DE AGENTES DISPONIBLES (para el prompt IA)
//    Devuelve un array simple: ["Ultrasonido terapéutico", "TENS", ...]
// ============================================================
export async function nombresAgentesDisponibles(centroId) {
  const disponibles = await listarDisponibles(centroId);
  return disponibles.map((e) => e.agente_nombre);
}

// ============================================================
// 9. SINCRONIZAR CATÁLOGO
//    Compara el catálogo JSON con lo que el centro tiene registrado
//    y devuelve qué agentes faltan por agregar.
//    Útil para el botón "Sincronizar catálogo" en MiEquipamiento.jsx
// ============================================================
export async function agentesFaltantes(centroId, catalogoAgentes) {
  const actuales = await listarEquipamiento(centroId);
  const idsActuales = new Set(actuales.map((e) => e.agente_id));
  return catalogoAgentes.filter((a) => !idsActuales.has(a.id));
}

// ============================================================
// 10. CARGA MASIVA
//     Agrega varios agentes de golpe (para "Sincronizar todo")
// ============================================================
export async function agregarVarios(centroId, agentes) {
  if (!centroId || !Array.isArray(agentes) || agentes.length === 0) return [];

  const { data: { user } } = await supabase.auth.getUser();

  const payload = agentes.map((a) => ({
    centro_id: centroId,
    agente_id: a.id,
    agente_nombre: a.nombre,
    tipo: a.tipo || null,
    disponible: true,
    cantidad: 1,
    created_by: user?.id || null,
  }));

  const { data, error } = await supabase
    .from('centros_equipamiento')
    .insert(payload)
    .select();

  if (error) {
    // Ignorar duplicados silenciosamente, pero reportar el resto
    if (error.code === '23505') {
      console.warn('⚠️ Algunos agentes ya existían, se ignoraron duplicados.');
      return [];
    }
    console.error('❌ [aparatologia] Error en carga masiva:', error.message);
    throw error;
  }
  return data || [];
}

// ============================================================
// BLOQUE 3.1.5 — EQUIPOS PERSONALIZADOS
// ============================================================

// ============================================================
// 11. LISTAR SOLO EQUIPOS DEL CATÁLOGO OFICIAL
// ============================================================
export async function listarCatalogo(centroId) {
  const todos = await listarEquipamiento(centroId);
  return todos.filter((e) => e.es_custom !== true);
}

// ============================================================
// 12. LISTAR SOLO EQUIPOS PERSONALIZADOS DEL CENTRO
// ============================================================
export async function listarPersonalizados(centroId) {
  const todos = await listarEquipamiento(centroId);
  return todos.filter((e) => e.es_custom === true);
}

// ============================================================
// 13. AGREGAR EQUIPO PERSONALIZADO
//     `datos` = {
//       nombre (obligatorio), descripcion (obligatoria),
//       tipo, indicaciones, contraindicaciones,
//       disponible, cantidad, marca, modelo, notas
//     }
// ============================================================
export async function agregarEquipoCustom(centroId, datos) {
  if (!centroId) throw new Error('centroId es obligatorio');
  if (!datos?.nombre?.trim()) throw new Error('El nombre es obligatorio');
  if (!datos?.descripcion?.trim()) throw new Error('La descripción es obligatoria');

  const { data: { user } } = await supabase.auth.getUser();

  // Generar un agente_id sintético único (prefijo "custom_")
  const agenteId = `custom_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const payload = {
    centro_id: centroId,
    agente_id: agenteId,
    agente_nombre: datos.nombre.trim(),
    tipo: datos.tipo || 'otro',
    descripcion: datos.descripcion.trim(),
    indicaciones: datos.indicaciones?.trim() || null,
    contraindicaciones: datos.contraindicaciones?.trim() || null,
    es_custom: true,
    disponible: datos.disponible ?? true,
    cantidad: parseInt(datos.cantidad) || 1,
    marca: datos.marca?.trim() || null,
    modelo: datos.modelo?.trim() || null,
    notas: datos.notas?.trim() || null,
    created_by: user?.id || null,
  };

  const { data, error } = await supabase
    .from('centros_equipamiento')
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error('❌ [aparatologia] Error agregando custom:', error.message);
    throw error;
  }
  console.log('✅ [aparatologia] Equipo personalizado creado:', data.agente_nombre);
  return data;
}

// ============================================================
// 14. ACTUALIZAR EQUIPO PERSONALIZADO
//     Extiende actualizarEquipo pero garantiza que solo aplica
//     a equipos con es_custom = true
// ============================================================
export async function actualizarEquipoCustom(equipoId, cambios) {
  if (!equipoId) throw new Error('equipoId es obligatorio');

  const permitidos = [
    'agente_nombre', 'tipo', 'descripcion', 'indicaciones', 'contraindicaciones',
    'disponible', 'cantidad', 'marca', 'modelo', 'notas',
  ];
  const limpios = {};
  Object.keys(cambios).forEach((k) => {
    if (permitidos.includes(k)) limpios[k] = cambios[k];
  });

  const { data, error } = await supabase
    .from('centros_equipamiento')
    .update(limpios)
    .eq('id', equipoId)
    .eq('es_custom', true) // Seguridad: solo customs
    .select()
    .single();

  if (error) {
    console.error('❌ [aparatologia] Error actualizando custom:', error.message);
    throw error;
  }
  return data;
}

// ============================================================
// 15. NOMBRES DE AGENTES DISPONIBLES (catálogo + personalizados)
//     Reemplaza la versión anterior de nombresAgentesDisponibles
//     para que la IA también considere los personalizados.
// ============================================================
export async function nombresAgentesDisponiblesCompletos(centroId) {
  const disponibles = await listarDisponibles(centroId);
  return disponibles.map((e) => e.agente_nombre);
}