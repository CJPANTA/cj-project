// src/services/iaProviders/geminiProvider.js
// Proveedor Google Gemini 2.0 Flash (respaldo automático)
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_MODEL = "gemini-2.0-flash";

/**
 * Consulta el modelo en Google Gemini.
 * Mismo contrato de retorno que groqProvider.consultarGroq.
 */
export async function consultarGemini({
  systemPrompt,
  historial = [],
  pregunta,
  maxTokens = 4000,
  temperatura = 0.4,
}) {
  const inicio = performance.now();
  const apiKey = (import.meta.env.VITE_GEMINI_API_KEY || "").trim();

  if (!apiKey) {
    return {
      ok: false,
      modelo: "gemini",
      error: { code: "NO_KEY", message: "VITE_GEMINI_API_KEY no configurada" },
      latenciaMs: 0,
      tokensInput: 0,
      tokensOutput: 0,
      tokensTotal: 0,
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      systemInstruction: systemPrompt,
    });

    // Convertir historial al formato de Gemini (alternado user/model)
    const contents = [];
    for (const msg of historial.slice(-12)) {
      if (!msg?.content) continue;
      if (msg.role === "user") {
        contents.push({ role: "user", parts: [{ text: msg.content }] });
      } else if (msg.role === "assistant" || msg.role === "model") {
        contents.push({ role: "model", parts: [{ text: msg.content }] });
      }
    }
    // Gemini exige que el primer contenido sea 'user'
    if (contents.length > 0 && contents[0].role === "model") {
      contents.shift();
    }
    contents.push({ role: "user", parts: [{ text: pregunta }] });

    const result = await model.generateContent({
      contents,
      generationConfig: {
        temperature: temperatura,
        maxOutputTokens: maxTokens,
      },
    });

    const response = result.response;
    let texto = response.text() || "";
    texto = texto.replace(/[\*\-=]{3,}/g, "").trim();

    const usage = response.usageMetadata || {};
    const tokensInput = usage.promptTokenCount || 0;
    const tokensOutput = usage.candidatesTokenCount || 0;
    const tokensTotal = usage.totalTokenCount || tokensInput + tokensOutput;

    return {
      ok: true,
      texto,
      modelo: "gemini",
      tokensInput,
      tokensOutput,
      tokensTotal,
      latenciaMs: Math.round(performance.now() - inicio),
      error: null,
    };
  } catch (err) {
    return {
      ok: false,
      modelo: "gemini",
      error: { code: "GEMINI_ERROR", message: err.message || "Error en Gemini" },
      latenciaMs: Math.round(performance.now() - inicio),
      tokensInput: 0,
      tokensOutput: 0,
      tokensTotal: 0,
    };
  }
}