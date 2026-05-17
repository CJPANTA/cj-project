// src/services/iaService.js - VERSIÓN DEFINITIVA CON GROQ
export const consultarAuraIA = async (pregunta, contexto = {}) => {
  // Usar la API Key de Groq (la que me diste)
  const API_KEY = "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";
  
  const MODELO = "llama-3.3-70b-versatile"; // rápido, gratuito y potente
  const URL = "https://api.groq.com/openai/v1/chat/completions";

  // Detectar si el usuario pide resumen del último PDF
  const esResumenPDF = /resum(e|en|ir).*(último|ultimo).*pdf/i.test(pregunta) ||
    /puntos clave.*último pdf/i.test(pregunta) ||
    /ideas principales.*último pdf/i.test(pregunta);

  let systemPrompt = "";
  let userPrompt = "";

  // Construir el prompt según el contexto
  if (esResumenPDF && contexto.ultimoPDF) {
    const pdf = contexto.ultimoPDF;
    systemPrompt = `Actúa como un tutor experto en fisioterapia. El usuario leyó: ${pdf.nombre} (${pdf.ciclo}, ${pdf.materia}).`;
    userPrompt = `Genera un resumen claro y 3 preguntas de comprensión sobre este tema. Usa el formato:
    ## 📄 Resumen
    (resumen aquí)
    ## ❓ Preguntas
    1. ...
    2. ...
    3. ...`;
  } else if (contexto.paciente || contexto.patologia || contexto.sintomas) {
    systemPrompt = "Actúa como Aura, una especialista en fisioterapia clínica. Responde profesionalmente.";
    userPrompt = pregunta;
  } else if (contexto.ciclo || contexto.materia || contexto.archivo) {
    systemPrompt = `Actúa como Aura, una tutora experta en fisioterapia. Contexto: ciclo ${contexto.ciclo || ''}, materia ${contexto.materia || ''}.`;
    userPrompt = pregunta;
  } else {
    systemPrompt = "Actúa como Aura, la asistente virtual del Ecosistema CJ. Responde de manera clara y útil.";
    userPrompt = pregunta;
  }

  try {
    const response = await fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODELO,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return `⚠️ Error (Groq ${response.status}): ${errorData.error?.message || 'Error desconocido.'}`;
    }

    const data = await response.json();
    let respuesta = data.choices[0].message.content;
    respuesta = respuesta.replace(/[\*\-=]{3,}/g, '');
    return respuesta.trim();

  } catch (error) {
    return `⚠️ Error de conexión con Groq: ${error.message}. Intenta de nuevo.`;
  }
};