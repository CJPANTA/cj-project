// src/services/iaService.js
export const consultarAuraIA = async (pregunta, contexto = {}, historial = [], systemPromptOverride = null) => {
  // 1. Obtener API Key de Groq desde variables de entorno
  const API_KEY = (import.meta.env.VITE_GROQ_API_KEY || "").trim();
  if (!API_KEY) {
    return "❌ Error: No se encuentra la API Key de Groq. Configúrala en .env.local (VITE_GROQ_API_KEY).";
  }

  const MODELO = "llama-3.3-70b-versatile"; // Modelo rápido y gratuito
  const URL = "https://api.groq.com/openai/v1/chat/completions";

  // 2. Definir system prompt por defecto (usado por el Oráculo y otros componentes)
  let systemPrompt = systemPromptOverride || `Eres Aura, una experta en fisioterapia y rehabilitación. 
  - Si te piden un cuadro comparativo, responde con una tabla en formato Markdown estándar.
  - Usa **negritas** para destacar conceptos clave.
  - Usa listas con - o 1., 2., 3. cuando sea apropiado.
  - NO uses caracteres ***, ---, ===.
  - Responde en español, de forma clara y profesional.`;

  // 3. Añadir información de contexto (ciclo, materia, último PDF, etc.)
  if (contexto.ciclo) systemPrompt += `\nEl usuario está en ${contexto.ciclo}.`;
  if (contexto.materia) systemPrompt += `\nEstudiando: ${contexto.materia}.`;
  if (contexto.archivo) systemPrompt += `\nArchivo abierto: ${contexto.archivo}.`;
  if (contexto.ultimoPDF) {
    systemPrompt += `\nHa leído recientemente el PDF: "${contexto.ultimoPDF.nombre}" (${contexto.ultimoPDF.ciclo} - ${contexto.ultimoPDF.materia}).`;
  }

  // 4. Construir el array de mensajes (historial + nueva pregunta)
  const messages = [
    { role: "system", content: systemPrompt },
    ...historial.slice(-12), // mantiene solo los últimos 12 mensajes (para no exceder tokens)
    { role: "user", content: pregunta },
  ];

  // 5. Reintentos automáticos (hasta 2 veces) si la API está saturada
  const maxRetries = 2;
  let delay = 1000; // 1 segundo

  for (let intento = 0; intento <= maxRetries; intento++) {
    try {
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: MODELO,
          messages: messages,
          temperature: 0.5,
          max_tokens: 2000,
        }),
      });

      // Si es error 429 (cuota excedida), esperar y reintentar
      if (response.status === 429) {
        if (intento === maxRetries) {
          return "⚠️ El servicio de IA está muy solicitado. Por favor, espera unos segundos y vuelve a intentarlo.";
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // backoff exponencial
        continue;
      }

      if (!response.ok) {
        const errorData = await response.json();
        return `⚠️ Error (Groq ${response.status}): ${errorData.error?.message || "Error desconocido."}`;
      }

      const data = await response.json();
      let respuesta = data.choices[0].message.content;

      // 6. Limpiar caracteres no deseados (***, ---, ===)
      respuesta = respuesta.replace(/[\*\-=]{3,}/g, "");
      return respuesta.trim();
    } catch (error) {
      if (intento === maxRetries) {
        return `⚠️ Error de conexión con Groq: ${error.message}. Intenta de nuevo.`;
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2;
    }
  }

  return "⚠️ Error inesperado. Intenta de nuevo más tarde.";
};