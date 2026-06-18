// src/services/iaService.js
export const consultarAuraIA = async (pregunta, contexto = {}, historial = [], systemPromptOverride = null) => {
  const API_KEY = (import.meta.env.VITE_GROQ_API_KEY || "").trim();
  if (!API_KEY) {
    return "❌ Error: No se encuentra la API Key de Groq. Configúrala en .env.local (VITE_GROQ_API_KEY).";
  }

  const MODELO = "llama-3.3-70b-versatile";
  const URL = "https://api.groq.com/openai/v1/chat/completions";

  // System prompt por defecto (solo si no se pasa override)
  let systemPrompt = systemPromptOverride || `Eres Aura, experta en fisioterapia y rehabilitación.
**Instrucciones estrictas para tablas comparativas:**
Cuando necesites mostrar una tabla, usa EXACTAMENTE este formato de texto plano con pipes (|) como separadores, sin usar markdown (no uses ---, ***, etc.):

Ejemplo:
| Característica | Epicondilitis | Epitrocleitis |
| Localización | Área externa del codo | Área interna del codo |
| Causa | Extensión repetitiva | Flexión repetitiva |
| Síntomas | Dolor al extender | Dolor al flexionar |

Reglas:
- Cada fila empieza y termina con pipe.
- Los pipes separan cada celda.
- No uses guiones para separar cabecera (no es necesario).
- Mantén el mismo número de columnas en todas las filas.
- Usa **negritas** alrededor de las cabeceras si quieres destacarlas.
- NO uses etiquetas HTML ni otro formato.

Para el resto de respuestas, usa texto claro, listas con guiones, y negritas con ** **.`;

  // Si se proporciona un systemPromptOverride, NO añadimos el contexto adicional
  // para no mezclar instrucciones contradictorias.
  if (!systemPromptOverride) {
    if (contexto.ciclo) systemPrompt += `\nEl usuario está en ${contexto.ciclo}.`;
    if (contexto.materia) systemPrompt += `\nEstudiando: ${contexto.materia}.`;
    if (contexto.archivo) systemPrompt += `\nArchivo abierto: ${contexto.archivo}.`;
    if (contexto.ultimoPDF) {
      systemPrompt += `\nHa leído recientemente el PDF: "${contexto.ultimoPDF.nombre}" (${contexto.ultimoPDF.ciclo} - ${contexto.ultimoPDF.materia}).`;
    }
  }

  const messages = [
    { role: "system", content: systemPrompt },
    ...historial.slice(-12),
    { role: "user", content: pregunta },
  ];

  const maxRetries = 2;
  let delay = 1000;

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

      if (response.status === 429) {
        if (intento === maxRetries) {
          return "⚠️ El servicio de IA está muy solicitado. Espera unos segundos y vuelve a intentarlo.";
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
        continue;
      }

      if (!response.ok) {
        const errorData = await response.json();
        return `⚠️ Error (Groq ${response.status}): ${errorData.error?.message || "Error desconocido."}`;
      }

      const data = await response.json();
      let respuesta = data.choices[0].message.content;
      respuesta = respuesta.replace(/[\*\-=]{3,}/g, "");
      return respuesta.trim();
    } catch (error) {
      if (intento === maxRetries) {
        return `⚠️ Error de conexión: ${error.message}. Intenta de nuevo.`;
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
  return "⚠️ Error inesperado. Intenta de nuevo más tarde.";
};