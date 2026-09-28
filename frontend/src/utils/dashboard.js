// ============================================================
// src/utils/dashboard.js
// Queries agregadas para el Dashboard gerencial
// ============================================================
import { supabase } from '../lib/supabaseClient';

// ============================================================
// 1. KPIs PRINCIPALES
// ============================================================
export async function cargarKPIs(filtros = {}) {
  const { centroId = null } = filtros;

  // Pacientes totales
  let qPac = supabase.from('pacientes').select('*', { count: 'exact', head: true });
  if (centroId) qPac = qPac.eq('centro_id', centroId);
  const { count: totalPacientes } = await qPac;

  // Sesiones este mes
  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);
  let qSesMes = supabase
    .from('sesiones')
    .select('*', { count: 'exact', head: true })
    .gte('fecha_sesion', inicioMes.toISOString());
  if (centroId) qSesMes = qSesMes.eq('centro_id', centroId);
  const { count: sesionesMes } = await qSesMes;

  // EVA promedio (últimas 100 sesiones con datos)
  let qEVA = supabase
    .from('sesiones')
    .select('eva_inicial, eva_final')
    .not('eva_inicial', 'is', null)
    .not('eva_final', 'is', null)
    .order('fecha_sesion', { ascending: false })
    .limit(100);
  if (centroId) qEVA = qEVA.eq('centro_id', centroId);
  const { data: sesionesEVA } = await qEVA;

  const evaPromedioInicial = sesionesEVA?.length
    ? Math.round((sesionesEVA.reduce((a, s) => a + s.eva_inicial, 0) / sesionesEVA.length) * 10) / 10
    : null;
  const evaPromedioFinal = sesionesEVA?.length
    ? Math.round((sesionesEVA.reduce((a, s) => a + s.eva_final, 0) / sesionesEVA.length) * 10) / 10
    : null;
  const mejoraPromedio = (evaPromedioInicial != null && evaPromedioFinal != null)
    ? Math.round((evaPromedioInicial - evaPromedioFinal) * 10) / 10
    : null;

  // Pacientes activos (últimos 30 días)
  const hace30 = new Date();
  hace30.setDate(hace30.getDate() - 30);
  let qAct = supabase
    .from('sesiones')
    .select('paciente_id')
    .gte('fecha_sesion', hace30.toISOString());
  if (centroId) qAct = qAct.eq('centro_id', centroId);
  const { data: sesRec } = await qAct;
  const pacientesActivos = new Set((sesRec || []).map((s) => s.paciente_id)).size;

  return {
    totalPacientes: totalPacientes || 0,
    sesionesMes: sesionesMes || 0,
    evaPromedioInicial,
    evaPromedioFinal,
    mejoraPromedio,
    pacientesActivos,
  };
}

// ============================================================
// 2. SESIONES POR MES (últimos N meses)
// ============================================================
export async function cargarSesionesPorMes(filtros = {}) {
  const { centroId = null, meses = 6 } = filtros;
  const inicio = new Date();
  inicio.setMonth(inicio.getMonth() - (meses - 1));
  inicio.setDate(1);
  inicio.setHours(0, 0, 0, 0);

  let q = supabase
    .from('sesiones')
    .select('fecha_sesion')
    .gte('fecha_sesion', inicio.toISOString());
  if (centroId) q = q.eq('centro_id', centroId);
  const { data, error } = await q;
  if (error) throw error;

  const meses_es = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const buckets = {};
  const labels = [];
  for (let i = 0; i < meses; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - (meses - 1 - i));
    d.setDate(1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    buckets[key] = 0;
    labels.push({ key, label: `${meses_es[d.getMonth()]} ${String(d.getFullYear()).slice(2)}` });
  }

  (data || []).forEach((s) => {
    const d = new Date(s.fecha_sesion);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (buckets[key] != null) buckets[key]++;
  });

  return labels.map((l) => ({ mes: l.label, sesiones: buckets[l.key] }));
}

// ============================================================
// 3. TOP PATOLOGÍAS
// ============================================================
export async function cargarTopPatologias(filtros = {}) {
  const { centroId = null, limit = 5 } = filtros;
  let q = supabase.from('pacientes').select('diagnostico');
  if (centroId) q = q.eq('centro_id', centroId);
  const { data, error } = await q;
  if (error) throw error;

  const conteo = {};
  (data || []).forEach((p) => {
    const d = (p.diagnostico || '').trim();
    if (!d || d.toLowerCase() === 'pendiente') return;
    conteo[d] = (conteo[d] || 0) + 1;
  });

  return Object.entries(conteo)
    .map(([nombre, cantidad]) => ({ nombre, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, limit);
}

// ============================================================
// 4. SESIONES RECIENTES (últimas N)
// ============================================================
export async function cargarSesionesRecientes(filtros = {}) {
  const { centroId = null, limit = 5 } = filtros;
  let q = supabase
    .from('sesiones')
    .select(`
      id,
      numero_sesion,
      fecha_sesion,
      eva_inicial,
      eva_final,
      paciente_id,
      paciente:pacientes(nombre, apellidos),
      terapeuta:profiles(nombre_completo)
    `)
    .order('fecha_sesion', { ascending: false })
    .limit(limit);
  if (centroId) q = q.eq('centro_id', centroId);
  const { data, error } = await q;
  if (error) {
    console.error('❌ Error cargando sesiones recientes:', error);
    return [];
  }
  return data || [];
}

// ============================================================
// 5. PACIENTES INACTIVOS (>N días sin sesión)
// ============================================================
export async function cargarPacientesInactivos(filtros = {}) {
  const { centroId = null, diasSinSesion = 30 } = filtros;
  const corte = new Date();
  corte.setDate(corte.getDate() - diasSinSesion);

  let qPac = supabase.from('pacientes').select('id, nombre, apellidos, diagnostico, created_at');
  if (centroId) qPac = qPac.eq('centro_id', centroId);
  const { data: pacientes } = await qPac;

  if (!pacientes || pacientes.length === 0) return [];

  const ids = pacientes.map((p) => p.id);
  let qSes = supabase
    .from('sesiones')
    .select('paciente_id, fecha_sesion')
    .in('paciente_id', ids)
    .order('fecha_sesion', { ascending: false });
  if (centroId) qSes = qSes.eq('centro_id', centroId);
  const { data: sesiones } = await qSes;

  const ultimaPorPaciente = {};
  (sesiones || []).forEach((s) => {
    if (!ultimaPorPaciente[s.paciente_id]) {
      ultimaPorPaciente[s.paciente_id] = s.fecha_sesion;
    }
  });

  const inactivos = pacientes.filter((p) => {
    const ult = ultimaPorPaciente[p.id];
    if (!ult) {
      return new Date(p.created_at) < corte;
    }
    return new Date(ult) < corte;
  });

  return inactivos
    .map((p) => ({
      ...p,
      ultima_sesion: ultimaPorPaciente[p.id] || null,
      dias_sin_sesion: ultimaPorPaciente[p.id]
        ? Math.floor((Date.now() - new Date(ultimaPorPaciente[p.id]).getTime()) / (1000 * 60 * 60 * 24))
        : null,
    }))
    .sort((a, b) => (b.dias_sin_sesion || 0) - (a.dias_sin_sesion || 0));
}

// ============================================================
// 6. COMPARATIVA ENTRE CENTROS (solo Director Global)
// ============================================================
export async function cargarComparativaCentros() {
  const { data: centros } = await supabase.from('centros').select('id, nombre');
  if (!centros || centros.length === 0) return [];

  const resultado = [];
  for (const c of centros) {
    const { count: pacs } = await supabase
      .from('pacientes')
      .select('*', { count: 'exact', head: true })
      .eq('centro_id', c.id);
    const { count: ses } = await supabase
      .from('sesiones')
      .select('*', { count: 'exact', head: true })
      .eq('centro_id', c.id);
    resultado.push({
      centro: c.id,
      nombre: c.nombre,
      pacientes: pacs || 0,
      sesiones: ses || 0,
    });
  }
  return resultado;
}