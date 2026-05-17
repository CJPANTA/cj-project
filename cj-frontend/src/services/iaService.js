// src/services/iaService.js
export const consultarAuraIA = async (pregunta, contexto = {}) => {
  const API_KEY = (import.meta.env.VITE_GEMINI_API_KEY || "").trim();
  if (!API_KEY) {
    return "❌ Error: No se encuentra la API Key de Gemini. Configúrala en Vercel (Environment Variables).";
  }

  // Lista de modelos en orden de prioridad (el primero que funcione se queda)
  const modelos = [
    "gemini-2.0-flash-exp",
    "gemini-2.0-flash-lite",
    "gemini-1.5-pro",
    "gemini-1.5-flash"
  ];

  let ultimoError = null;

  // Intentar con cada modelo hasta que uno funcione
  for (const modelo of modelos) {
    try {
      const URL = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${API_KEY}`;

      // Detectar si el usuario pide un resumen del último PDF
      const esResumenPDF = /resum(e|en|ir).*(último|ultimo).*pdf/i.test(pregunta) ||
        /puntos clave.*último pdf/i.test(pregunta) ||
        /ideas principales.*último pdf/i.test(pregunta);

      let promptBase = "";
      let modo = "general";

      // Si hay un último PDF en el contexto y el usuario pide resumen
      if (esResumenPDF && contexto.ultimoPDF) {
        modo = "resumen_pdf";
        const pdf = contexto.ultimoPDF;
        promptBase = `Actúa como un tutor experto en fisioterapia. El usuario ha estado leyendo el siguiente documento:
        - Título: ${pdf.nombre}
        - Ciclo: ${pdf.ciclo}
        - Materia: ${pdf.materia}
        
        Basándote en el conocimiento general de fisioterapia sobre este tema (sin tener el contenido real del PDF), genera un resumen claro, estructurado y útil de los puntos clave que probablemente contiene este documento. Incluye conceptos principales, terminología importante y aplicaciones prácticas. Si el título o la materia indican un tema específico, enfócate en eso.
        
        Además, extrae 3 preguntas de comprensión que el usuario podría responder para autoevaluarse.
        
        Formato de respuesta:
        ## 📄 Resumen del documento
        
        (aquí el resumen)
        
        ## ❓ Preguntas de comprensión
        
        1. Pregunta 1
        2. Pregunta 2
        3. Pregunta 3
        `;
      } else if (contexto.paciente || contexto.patologia || contexto.sintomas) {
        modo = "clinica";
        promptBase = `Actúa como Aura, una especialista en fisioterapia clínica con amplia experiencia en diagnóstico y tratamiento.
        Eres parte del Ecosistema CJ, una plataforma de salud.
        El usuario es un profesional (Jorge Luis) que necesita ayuda clínica.
        Responde de manera profesional, basada en evidencia y con un enfoque práctico para el tratamiento.`;
        if (contexto.paciente) promptBase += `\nPaciente: ${contexto.paciente}.`;
        if (contexto.patologia) promptBase += `\nPatología sospechada: ${contexto.patologia}.`;
        if (contexto.sintomas) promptBase += `\nSíntomas referidos: ${contexto.sintomas}.`;
      } else if (contexto.ciclo || contexto.materia || contexto.archivo) {
        modo = "academia";
        promptBase = `Actúa como Aura, una tutora experta en fisioterapia y ciencias de la salud.
        Formas parte del Ecosistema CJ, una plataforma educativa.
        Responde de forma didáctica, con ejemplos claros y referencias a los materiales de estudio disponibles.`;
        if (contexto.ciclo) promptBase += `\nEl usuario está en: ${contexto.ciclo}.`;
        if (contexto.materia) promptBase += `\nMateria actual: ${contexto.materia.replace(/_/g, ' ')}.`;
        if (contexto.archivo) promptBase += `\nArchivo abierto: ${contexto.archivo.replace('.pdf', '').replace(/_/g, ' ')}.`;
      } else {
        modo = "general";
        promptBase = `Actúa como Aura, la asistente virtual del Ecosistema CJ (Gimnasio Terapéutico y Academia).
        Responde de manera clara, útil y profesional.`;
      }

      // Añadir la pregunta al prompt si no es el caso especial de resumen
      if (!esResumenPDF || !contexto.ultimoPDF) {
        promptBase += `\n\nPregunta del usuario: ${pregunta}`;
      }

      // Añadir instrucciones de formato al prompt
      promptBase += `\n\nREGLAS DE FORMATO:
      - Usa Markdown para estructurar la respuesta (títulos con ##, listas, tablas si es necesario).
      - Sé conciso pero completo.
      - Si es un cuadro comparativo, usa tablas.
      - No uses caracteres como ***, ---, ===.
      - Responde en español.
      - Si no sabes algo, dilo abiertamente.`;

      const response = await fetch(URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptBase }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2000 }
        })
      });

      // Si el modelo no existe (404), probar con el siguiente
      if (response.status === 404) {
        ultimoError = `Modelo ${modelo} no encontrado, probando siguiente...`;
        continue;
      }

      // Si es error 429 (cuota excedida), reintentar hasta 2 veces con espera
      if (response.status === 429) {
        let reintentos = 0;
        let delay = 1000;
        while (reintentos < 2) {
          await new Promise(resolve => setTimeout(resolve, delay));
          const retryResponse = await fetch(URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: promptBase }] }],
              generationConfig: { temperature: 0.7, maxOutputTokens: 2000 }
            })
          });
          if (retryResponse.ok) {
            const data = await retryResponse.json();
            return data.candidates[0].content.parts[0].text;
          }
          reintentos++;
          delay *= 2;
        }
        return "⚠️ El servicio de IA está muy solicitado. Por favor, espera unos segundos y vuelve a intentarlo.";
      }

      if (!response.ok) {
        const errorData = await response.json();
        ultimoError = `Error ${response.status}: ${errorData.error?.message || 'Error desconocido.'}`;
        continue;
      }

      const data = await response.json();
      if (data.candidates && data.candidates[0].content) {
        let respuesta = data.candidates[0].content.parts[0].text;
        respuesta = respuesta.replace(/[\*\-=]{3,}/g, '');
        return respuesta.trim();
      } else {
        ultimoError = "La respuesta de la IA no tiene el formato esperado.";
        continue;
      }

    } catch (error) {
      ultimoError = error.message;
      continue;
    }
  }

  return `⚠️ No se pudo conectar con Gemini. Último error: ${ultimoError}. Verifica tu API Key o intenta más tarde.`;
};