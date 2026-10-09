// ============================================================
// src/utils/vozService.js
// Servicio unificado de síntesis de voz (TTS)
// - Detecta la mejor voz en español latino (es-MX / es-US / es-419)
// - Limpia markdown antes de hablar (adiós "asterisco asterisco")
// - Divide en chunks (bug Chrome: utterances largas se atascan)
// - Pausa / Reanudar robustos (con delay para evitar bug de Chrome)
// ============================================================

// ------------------------------------------------------------
// CACHÉ DE VOCES
// ------------------------------------------------------------
let vocesCacheadas = [];

function refrescarVoces() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const voces = window.speechSynthesis.getVoices();
  if (voces.length > 0) vocesCacheadas = voces;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  refrescarVoces();
  window.speechSynthesis.onvoiceschanged = refrescarVoces;
}

// ------------------------------------------------------------
// NOMBRES TÍPICOS DE VOCES LATINAS
// ------------------------------------------------------------
const NOMBRES_LATINOS = [
  'paulina', 'jorge', 'diego', 'carlos', 'monica', 'mónica',
  'helena', 'sabina', 'lucia', 'lucía', 'juan', 'maria', 'maría',
  'andrea', 'sofia', 'sofía', 'isabela', 'camila', 'mateo',
  'estados unidos',
];

// ------------------------------------------------------------
// OBTENER MEJOR VOZ EN ESPAÑOL LATINO
// ------------------------------------------------------------
export function obtenerMejorVozEspanol() {
  if (vocesCacheadas.length === 0) refrescarVoces();
  const voces = vocesCacheadas;
  if (!voces.length) return null;

  const esLatino = /^es-(MX|US|419)/i;
  const esAlguno = /^es-/i;
  const esEspana = /^es-ES/i;

  const tieneNombreLatino = (v) =>
    NOMBRES_LATINOS.some((n) => v.name.toLowerCase().includes(n));

  let mejor = voces.find((v) => esLatino.test(v.lang) && tieneNombreLatino(v));
  if (mejor) return mejor;

  mejor = voces.find((v) => esLatino.test(v.lang));
  if (mejor) return mejor;

  mejor = voces.find((v) => esAlguno.test(v.lang) && tieneNombreLatino(v));
  if (mejor) return mejor;

  mejor = voces.find((v) => esAlguno.test(v.lang) && !esEspana.test(v.lang));
  if (mejor) return mejor;

  return voces.find((v) => esAlguno.test(v.lang)) || null;
}

// ------------------------------------------------------------
// LIMPIAR MARKDOWN PARA TTS
// ------------------------------------------------------------
export function limpiarParaVoz(texto) {
  if (!texto) return '';
  let limpio = String(texto);

  // Tablas markdown → "Fila: a, b, c."
  limpio = limpio
    .split('\n')
    .map((linea) => {
      const t = linea.trim();
      if (t.startsWith('|') && t.endsWith('|')) {
        const celdas = t.split('|').slice(1, -1).map((c) => c.trim());
        if (celdas.length && celdas.every((c) => /^[-:]+$/.test(c))) return '';
        return `Fila: ${celdas.join(', ')}.`;
      }
      return linea;
    })
    .join('\n');

  limpio = limpio.replace(/```[\s\S]*?```/g, '');
  limpio = limpio.replace(/`([^`]+)`/g, '$1');
  limpio = limpio.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  limpio = limpio.replace(/\*\*([^*]+)\*\*/g, '$1');
  limpio = limpio.replace(/__([^_]+)__/g, '$1');
  limpio = limpio.replace(/\*([^*\n]+)\*/g, '$1');
  limpio = limpio.replace(/_([^_\n]+)_/g, '$1');
  limpio = limpio.replace(/^#{1,6}\s+/gm, '');
  limpio = limpio.replace(/^>\s?/gm, '');
  limpio = limpio.replace(/^\s*[-*_]{3,}\s*$/gm, '');
  limpio = limpio.replace(/^\s*[-*+]\s+/gm, '');
  limpio = limpio.replace(/^\s*\d+\.\s+/gm, '');
  limpio = limpio.replace(/<[^>]+>/g, '');
  limpio = limpio.replace(/\|/g, ' ');
  limpio = limpio.replace(/[ \t]+/g, ' ');
  limpio = limpio.replace(/\n{3,}/g, '\n\n');

  return limpio.trim();
}

// ------------------------------------------------------------
// DIVIDIR TEXTO EN FRASES PEQUEÑAS
// ------------------------------------------------------------
function dividirEnFrases(texto, maxLen = 200) {
  if (!texto) return [];
  const partes = texto.split(/(?<=[.!?;])\s+/);
  const chunks = [];
  let actual = '';

  for (const parte of partes) {
    if ((actual + ' ' + parte).trim().length <= maxLen) {
      actual = actual ? actual + ' ' + parte : parte;
    } else {
      if (actual) chunks.push(actual.trim());
      if (parte.length > maxLen) {
        const subs = parte.split(/,\s*/);
        let subActual = '';
        for (const s of subs) {
          if ((subActual + ', ' + s).length <= maxLen) {
            subActual = subActual ? subActual + ', ' + s : s;
          } else {
            if (subActual) chunks.push(subActual.trim());
            subActual = s;
          }
        }
        if (subActual) chunks.push(subActual.trim());
        actual = '';
      } else {
        actual = parte;
      }
    }
  }
  if (actual) chunks.push(actual.trim());
  return chunks.filter((c) => c.length > 0);
}

// ------------------------------------------------------------
// ESTADO INTERNO DEL TTS
// ------------------------------------------------------------
let estadoTTS = {
  chunks: [],
  idx: 0,
  voz: null,
  pausado: false,
  activo: false,
  callbacks: {},
};

// ------------------------------------------------------------
// VELOCIDAD DE LECTURA (ajústala aquí si la quieres más rápida/lenta)
// Rango típico: 0.8 (lento) — 1.0 (normal) — 1.5 (rápido)
// ------------------------------------------------------------
const RATE = 1.2;

// ------------------------------------------------------------
// HABLAR (con play/pause/resume)
// ------------------------------------------------------------
export function hablar(texto, opciones = {}) {
  const { onStart, onEnd, onError, onPause, onResume } = opciones;

  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    alert('Tu navegador no soporta síntesis de voz.');
    return false;
  }

  const synth = window.speechSynthesis;

  // ─────── CASO 1: REANUDAR (había algo pausado) ───────
  if (estadoTTS.activo && estadoTTS.pausado) {
    console.log('🎙️ REANUDAR desde chunk', estadoTTS.idx);
    estadoTTS.pausado = false;
    estadoTTS.activo = true;
    onResume?.();
    // Chrome bug: speak() tras cancel() inmediato = drop. Delay.
    synth.cancel();
    setTimeout(() => hablarChunkActual(), 200);
    return true;
  }

  // ─────── CASO 2: PAUSAR (hay algo sonando) ───────
  if (estadoTTS.activo && !estadoTTS.pausado) {
    console.log('🎙️ PAUSA en chunk', estadoTTS.idx);
    synth.cancel();
    estadoTTS.pausado = true;
    onPause?.();
    return true;
  }

  // ─────── CASO 3: NUEVA LECTURA ───────
  if (!texto) return false;

  const limpio = limpiarParaVoz(texto);
  if (!limpio) return false;

  const chunks = dividirEnFrases(limpio, 200);
  const voz = obtenerMejorVozEspanol();
  console.log('🎙️ NUEVA LECTURA: chunks =', chunks.length, '| voz →', voz?.name);

  estadoTTS = {
    chunks,
    idx: 0,
    voz,
    pausado: false,
    activo: true,
    callbacks: { onStart, onEnd, onError },
  };

  // Desbloquear audio (Chrome exige user gesture)
  if (!window.audioContextKeepAlive) {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      window.audioContextKeepAlive = new Ctx();
      if (window.audioContextKeepAlive.state === 'suspended') {
        window.audioContextKeepAlive.resume();
      }
      const silent = window.audioContextKeepAlive.createOscillator();
      const gain = window.audioContextKeepAlive.createGain();
      gain.gain.value = 0;
      silent.connect(gain);
      gain.connect(window.audioContextKeepAlive.destination);
      silent.start();
      window.silentOscillator = silent;
    } catch (e) {
      console.warn('🎙️ AudioContext falló:', e);
    }
  }

  synth.cancel();
  setTimeout(() => hablarChunkActual(), 200);

  return true;
}

// ------------------------------------------------------------
// Reproduce el chunk actual y encadena el siguiente
// ------------------------------------------------------------
function hablarChunkActual() {
  const synth = window.speechSynthesis;
  const { chunks, idx, voz, callbacks } = estadoTTS;

  // Si estamos pausados o ya terminamos, salir
  if (estadoTTS.pausado) return;
  if (idx >= chunks.length) {
    console.log('🎙️ TTS onend ✅');
    estadoTTS.activo = false;
    estadoTTS.pausado = false;
    callbacks.onEnd?.();
    return;
  }

  const u = new SpeechSynthesisUtterance(chunks[idx]);
  if (voz) {
    u.voice = voz;
    u.lang = voz.lang;
  } else {
    u.lang = 'es-MX';
  }
  u.rate = RATE;
  u.pitch = 1;

  if (idx === 0) {
    u.onstart = () => {
      console.log('🎙️ TTS onstart ✅');
      callbacks.onStart?.();
    };
  }

  u.onend = () => {
    if (estadoTTS.pausado) return;
    estadoTTS.idx++;
    setTimeout(() => hablarChunkActual(), 30);
  };

  u.onerror = (e) => {
    if (estadoTTS.pausado) return;
    console.error(`🎙️ TTS onerror chunk ${idx}:`, e);
    if (idx === 0) callbacks.onError?.(e);
    estadoTTS.idx++;
    setTimeout(() => hablarChunkActual(), 30);
  };

  synth.speak(u);
}

// ------------------------------------------------------------
// DETENER completamente
// ------------------------------------------------------------
export function detenerVoz() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  estadoTTS = {
    chunks: [],
    idx: 0,
    voz: null,
    pausado: false,
    activo: false,
    callbacks: {},
  };
}

// ------------------------------------------------------------
// DETECCIÓN DE CONTEXTO PARA YOUTUBE
// ------------------------------------------------------------
const PALABRAS_VIDEO = [
  'ejercicio', 'ejercicios',
  'estiramiento', 'estiramientos',
  'movilidad',
  'técnica', 'tecnica', 'técnicas', 'tecnicas',
  'cómo se hace', 'como se hace',
  'rutina', 'rutinas',
  'rehabilitación', 'rehabilitacion',
];

export function consultaMencionaVideo(texto) {
  if (!texto) return false;
  const t = String(texto).toLowerCase();
  return PALABRAS_VIDEO.some((p) => t.includes(p));
}