// src/services/iaProviders/groqProvider.js
// Proveedor Groq — modelo openai/gpt-oss-120b
// NO reintenta: si falla, el orquestador cae automáticamente a Gemini.

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "openai/gpt-oss-120b";

/**
 * Consulta el modelo en Groq.
 * @returns {Promise<{
 *   ok: boolean, texto?: string, modelo: "groq",
 *   tokensInput: number, tokensOutput: number, tokensTotal: number,
 *   latenciaMs: number, error: { code: string, message: string } | null
 * }>}
 */
export async function consultarGroq({
  systemPrompt,
  historial = [],
  pregunta,
  maxTokens = 4000,
  temperatura = 0.4,
}) {
  const inicio = performance.now();
  const apiKey = (import.meta.env.VITE_GROQ_API_KEY || "").trim();

  if (!apiKey) {
    return {
      ok: false,
      modelo: "groq",
      error: { code: "NO_KEY", message: "VITE_GROQ_API_KEY no configurada" },
      latenciaMs: 0,
      tokensInput: 0,
      tokensOutput: 0,
      tokensTotal: 0,
    };
  }

  const messages = [
    { role: "system", content: systemPrompt },
    ...historial.slice(-12),
    { role: "user", content: pregunta },
  ];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        temperature: temperatura,
        max_tokens: maxTokens,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latenciaMs = Math.round(performance.now() - inicio);

    if (!response.ok) {
      let errorMsg = `HTTP ${response.status}`;
      try {
        const errData = await response.json();
        errorMsg = errData.error?.message || errorMsg;
      } catch {
        /* respuesta sin JSON, ignorar */
      }
      return {
        ok: false,
        modelo: "groq",
        error: { code: String(response.status), message: errorMsg },
        latenciaMs,
        tokensInput: 0,
        tokensOutput: 0,
        tokensTotal: 0,
      };
    }

    const data = await response.json();
    let texto = data.choices?.[0]?.message?.content || "";
    // Limpieza de separadores markdown (el system prompt pide texto plano)
    texto = texto.replace(/[\*\-=]{3,}/g, "").trim();

    const usage = data.usage || {};
    return {
      ok: true,
      texto,
      modelo: "groq",
      tokensInput: usage.prompt_tokens || 0,
      tokensOutput: usage.completion_tokens || 0,
      tokensTotal: usage.total_tokens || 0,
      latenciaMs,
      error: null,
    };
  } catch (err) {
    const latenciaMs = Math.round(performance.now() - inicio);
    const code = err.name === "AbortError" ? "TIMEOUT" : "NETWORK";
    return {
      ok: false,
      modelo: "groq",
      error: { code, message: err.message || "Error de red" },
      latenciaMs,
      tokensInput: 0,
      tokensOutput: 0,
      tokensTotal: 0,
    };
  }
}