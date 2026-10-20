// src/services/iaProviders/index.js
// Orquestador de proveedores IA con fallback y registro de consumo (Fase 3.1 + 3.2)
import { consultarGroq } from "./groqProvider";
import { consultarGemini } from "./geminiProvider";
import { supabase } from "../../lib/supabaseClient";

/**
 * Ejecuta la consulta con fallback:
 *  1. Groq (principal)
 *  2. Gemini (respaldo si Groq falla)
 *  3. Mensaje de error si ambos fallan
 *
 * Registra consumo en Supabase (fire-and-forget: no bloquea la respuesta).
 *
 * @returns {Promise<string>} texto de la IA o mensaje de error amable
 */
export async function consultarConFallback({
  systemPrompt,
  historial = [],
  pregunta,
  user_id = null,
  centro_id = null,
  tipoConsulta = "chat",
  maxTokens = 4000,
}) {
  // ── 1) Intento principal: Groq ──
  const resGroq = await consultarGroq({
    systemPrompt,
    historial,
    pregunta,
    maxTokens,
  });
  void registrarConsumo(resGroq, user_id, centro_id, tipoConsulta);

  if (resGroq.ok) return resGroq.texto;

  // ── 2) Fallback: Gemini ──
  console.warn("[IA] Groq falló, cayendo a Gemini:", resGroq.error);
  const resGemini = await consultarGemini({
    systemPrompt,
    historial,
    pregunta,
    maxTokens,
  });
  void registrarConsumo(resGemini, user_id, centro_id, tipoConsulta);

  if (resGemini.ok) return resGemini.texto;

  // ── 3) Ambos fallaron ──
  console.error("[IA] Ambos proveedores fallaron:", {
    groq: resGroq.error,
    gemini: resGemini.error,
  });
  return "⚠️ El asistente de IA está saturado en este momento. Intenta de nuevo en un minuto.";
}

/**
 * Registra el consumo en Supabase.
 * Reglas:
 *  - Fire-and-forget: NO bloquea la respuesta al usuario.
 *  - Nunca lanza excepciones hacia arriba.
 *  - Ley 29733: SOLO metadatos. Nunca el prompt ni la respuesta.
 */
async function registrarConsumo(resultado, user_id, centro_id, tipoConsulta) {
  try {
    if (!user_id) return; // Sin user_id, RLS rechazaría el insert

    const { error } = await supabase.from("consumo_ia").insert([
      {
        user_id,
        centro_id: centro_id || null,
        modelo_usado: resultado.modelo,
        tokens_input: resultado.tokensInput || 0,
        tokens_output: resultado.tokensOutput || 0,
        tokens_total: resultado.tokensTotal || 0,
        exito: resultado.ok,
        tipo_consulta: tipoConsulta,
        codigo_error: resultado.ok ? null : resultado.error?.code || "UNKNOWN",
        latencia_ms: resultado.latenciaMs || 0,
      },
    ]);

    if (error) {
      console.warn("[IA] No se pudo registrar consumo:", error.message);
    }
  } catch (err) {
    console.warn("[IA] Error inesperado registrando consumo:", err);
  }
}