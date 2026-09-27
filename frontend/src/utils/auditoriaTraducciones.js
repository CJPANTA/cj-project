// src/utils/auditoriaTraducciones.js
// ============================================================
// Traducciones para hacer legible el log de auditoría
// ============================================================

const NOMBRES_CAMPOS = {
  rol: 'Rol',
  tipo_profesional: 'Tipo de profesional',
  estado: 'Estado',
  centro_id: 'Centro asignado',
  dni: 'Número de documento',
  numero_colegiatura: 'CTMP (Colegiatura)',
  registro_interno: 'Registro interno',
  tipo_documento: 'Tipo de documento',
};

const VALORES_ROL = {
  1: 'Director',
  2: 'Estudiante',
  3: 'Licenciado',
  4: 'Híbrido',
  5: 'Paciente',
  6: 'Demo',
  7: 'Admin Centro',
};

const VALORES_TIPO_PROFESIONAL = {
  director: 'Director',
  estudiante: 'Estudiante',
  licenciado: 'Licenciado en Fisioterapia',
  tecnico: 'Técnico en Fisioterapia',
  paciente: 'Paciente',
  demo: 'Demo',
};

const VALORES_ESTADO = {
  aprobado: 'Aprobado',
  pendiente: 'Pendiente',
  rechazado: 'Rechazado',
};

const VALORES_TIPO_DOC = {
  DNI: 'DNI',
  CE: 'Carné de Extranjería',
};

/**
 * Traduce el nombre de un campo a lenguaje humano
 */
export function traducirCampo(campo) {
  return NOMBRES_CAMPOS[campo] || campo;
}

/**
 * Traduce un valor según el campo al que pertenece
 */
export function traducirValor(campo, valor) {
  if (valor === null || valor === undefined || valor === '') {
    return '(vacío)';
  }
  const v = String(valor);
  switch (campo) {
    case 'rol':
      return VALORES_ROL[v] || v;
    case 'tipo_profesional':
      return VALORES_TIPO_PROFESIONAL[v] || v;
    case 'estado':
      return VALORES_ESTADO[v] || v;
    case 'tipo_documento':
      return VALORES_TIPO_DOC[v] || v;
    case 'centro_id':
      return v === '' ? 'Sin centro' : v;
    default:
      return v;
  }
}

/**
 * Genera un mensaje humano completo
 */
export function generarMensajeHumano(registro) {
  const campo = traducirCampo(registro.campo_modificado);
  const antes = traducirValor(registro.campo_modificado, registro.valor_anterior);
  const despues = traducirValor(registro.campo_modificado, registro.valor_nuevo);
  return `Cambió el ${campo} de "${antes}" a "${despues}"`;
}

/**
 * Formatea una fecha ISO a formato legible (ej: 27/09/2026 04:44)
 */
export function formatearFecha(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const anio = d.getFullYear();
  const hora = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dia}/${mes}/${anio} ${hora}:${min}`;
}

/**
 * Devuelve un icono según el campo modificado
 */
export function iconoCampo(campo) {
  switch (campo) {
    case 'rol': return '👔';
    case 'tipo_profesional': return '🩺';
    case 'estado': return '🚦';
    case 'centro_id': return '🏢';
    case 'dni': return '🆔';
    case 'numero_colegiatura': return '📋';
    case 'registro_interno': return '🔖';
    case 'tipo_documento': return '📄';
    default: return '📝';
  }
}