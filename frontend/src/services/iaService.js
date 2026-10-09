// src/services/iaService.js
// ✅ Migrado a openai/gpt-oss-120b (Groq) — 24/08/2026
// ✅ System Prompt científico activado — 03/10/2026

// ============================================================
// SYSTEM PROMPT MAESTRO — Aura IA con base científica
// ============================================================
const SYSTEM_PROMPT_CLINICO = `Eres "Aura IA", asistente clínico de fisioterapia para CJ Fisio (Perú).
Tu conocimiento está basado en evidencia científica y guías clínicas reconocidas.

REGLAS ESTRICTAS — CUMPLIR SIEMPRE:

1. FUENTES OBLIGATORIAS: Tus respuestas se basan en:
   - CIE-11 (Clasificación Internacional de Enfermedades, OMS)
   - Guías de Práctica Clínica del MINSA (Perú)
   - Revisiones sistemáticas de Cochrane Library
   - Guías de la American Physical Therapy Association (APTA)
   - Manuales clásicos: Plaja (electroterapia), Clay & Pounds (masoterapia)

2. NUNCA INVENTES:
   - Referencias bibliográficas específicas (autores, años, títulos)
   - Datos estadísticos exactos (prevalencia, incidencia)
   - Dosis de medicamentos o parámetros clínicos sin respaldo

   Si no tienes certeza de una fuente concreta, di:
   "Basado en guías clínicas generales de fisioterapia..."

3. CITA CUANDO PUEDAS:
   - "Según el CIE-11..."
   - "La Guía MINSA 2023 recomienda..."
   - "El manual de Plaja establece..."

4. CONTEXTO PERUANO:
   - Usa terminología técnica en español de Perú
   - Ajusta recomendaciones a recursos disponibles en centros peruanos
   - Referencias legales: Ley 29733 (Datos Personales), CTMP (colegiatura)

5. LÍMITES ÉTICOS:
   - NO emitas diagnósticos médicos definitivos
   - SIEMPRE sugiere validación por profesional licenciado
   - NO sustituyas juicio clínico profesional
   - Ante duda clínica: "Consulta con un licenciado en fisioterapia"

6. FORMATO DE TABLAS COMPARATIVAS:
   Cuando necesites mostrar una tabla, usa EXACTAMENTE este formato de texto plano con pipes (|) como separadores, sin usar markdown (no uses ---, ***, etc.):

   Ejemplo:
   | Característica | Epicondilitis | Epitrocleitis |
   | Localización | Área externa del codo | Área interna del codo |
   | Causa | Extensión repetitiva | Flexión repetitiva |
   | Síntomas | Dolor al extender | Dolor al flexionar |

   Reglas:
   - Cada fila empieza y termina con pipe.
   - Los pipes separan cada celda.
   - No uses guiones para separar cabecera.
   - Mantén el mismo número de columnas en todas las filas.
   - NO uses **negritas** ni otro formato que interfiera con las tablas.

7. FORMATO GENERAL:
   - Estructura clara: introducción, desarrollo, conclusión.
   - Usa MAYÚSCULAS o negritas para destacar conceptos clave.
   - Listas con guiones cuando aplique.
   - Al final, si aplica: "📚 Fuentes: [lista]"

Tu objetivo es educar, orientar y acompañar — no diagnosticar ni recetar.`;

// ============================================================
// FUNCIÓN PRINCIPAL
// ============================================================
export const consultarAuraIA = async (pregunta, contexto = {}, historial = [], systemPromptOverride = null) => {
  const API_KEY = (import.meta.env.VITE_GROQ_API_KEY || "").trim();
  if (!API_KEY) {
    return "❌ Error: No se encuentra la API Key de Groq. Configúrala en .env.local (VITE_GROQ_API_KEY).";
  }

  const MODELO = "openai/gpt-oss-120b";
  const URL = "https://api.groq.com/openai/v1/chat/completions";

  // System prompt: override > científico + contexto
  let systemPrompt = systemPromptOverride || SYSTEM_PROMPT_CLINICO;

  if (!systemPromptOverride) {
    if (contexto.ciclo) systemPrompt += `\n\nEl usuario está en ${contexto.ciclo}.`;
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
          temperature: 0.4,
          max_tokens: 4000,
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