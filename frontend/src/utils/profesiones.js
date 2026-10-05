// ============================================================
// src/utils/profesiones.js
// Catálogo de profesiones + helpers (área clínica / admin / soporte)
// ============================================================

export const PROFESIONES = [
  // ===== ÁREA CLÍNICA (atienden pacientes) =====
  { id: 'fisioterapeuta',        label: 'Fisioterapeuta',            emoji: '🦴', area: 'clinica', colegiatura: true  },
  { id: 'tecnico_fisioterapia',  label: 'Técnico en Fisioterapia',   emoji: '🔧', area: 'clinica', colegiatura: false },
  { id: 'psicologo',             label: 'Psicólogo/a',               emoji: '🧠', area: 'clinica', colegiatura: true  },
  { id: 'nutricionista',         label: 'Nutricionista',             emoji: '🥗', area: 'clinica', colegiatura: true  },
  { id: 'terapeuta_ocupacional', label: 'Terapeuta Ocupacional',     emoji: '🖐️', area: 'clinica', colegiatura: true  },
  { id: 'fonoaudiologo',         label: 'Fonoaudiólogo/a',           emoji: '🗣️', area: 'clinica', colegiatura: true  },
  { id: 'medico',                label: 'Médico',                    emoji: '⚕️', area: 'clinica', colegiatura: true  },
  { id: 'enfermero',             label: 'Enfermero/a',               emoji: '💉', area: 'clinica', colegiatura: true  },
  { id: 'podologo',              label: 'Podólogo/a',                emoji: '🦶', area: 'clinica', colegiatura: true  },
  { id: 'quiropractico',         label: 'Quiropráctico/a',           emoji: '🖐️', area: 'clinica', colegiatura: false },
  { id: 'masajista',             label: 'Masajista profesional',     emoji: '💆', area: 'clinica', colegiatura: false },

  // ===== ÁREA ADMINISTRATIVA =====
  { id: 'recepcionista',         label: 'Recepcionista',             emoji: '💼', area: 'admin',   colegiatura: false },
  { id: 'asistente_admin',       label: 'Asistente administrativo',  emoji: '📋', area: 'admin',   colegiatura: false },
  { id: 'cajero',                label: 'Cajero/a',                  emoji: '💰', area: 'admin',   colegiatura: false },

  // ===== ÁREA SOPORTE =====
  { id: 'limpieza',              label: 'Personal de limpieza',      emoji: '🧹', area: 'soporte', colegiatura: false },
  { id: 'mantenimiento',         label: 'Mantenimiento',             emoji: '🔨', area: 'soporte', colegiatura: false },

  // ===== OTRO =====
  { id: 'otro',                  label: 'Otro (especificar)',        emoji: '👤', area: 'otro',    colegiatura: false },
];

// ============================================================
// HELPERS
// ============================================================
export function obtenerProfesion(id) {
  return PROFESIONES.find((p) => p.id === id) || PROFESIONES.find((p) => p.id === 'otro');
}

export function labelProfesion(id) {
  return obtenerProfesion(id)?.label || 'Sin especificar';
}

export function emojiProfesion(id) {
  return obtenerProfesion(id)?.emoji || '👤';
}

export function esClinico(id) {
  return obtenerProfesion(id)?.area === 'clinica';
}

export function esAdmin(id) {
  return obtenerProfesion(id)?.area === 'admin';
}

export function esSoporte(id) {
  return obtenerProfesion(id)?.area === 'soporte';
}

export function colorArea(id) {
  const area = obtenerProfesion(id)?.area;
  const map = {
    clinica: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    admin:   'bg-amber-500/20 text-amber-300 border-amber-500/40',
    soporte: 'bg-gray-500/20 text-gray-300 border-gray-500/40',
    otro:    'bg-purple-500/20 text-purple-300 border-purple-500/40',
  };
  return map[area] || map.otro;
}