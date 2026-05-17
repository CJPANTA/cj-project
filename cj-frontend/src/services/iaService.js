// src/services/iaService.js - VERSIÓN CON VARIABLE DE ENTORNO
export const consultarAuraIA = async (pregunta, contexto = {}) => {
  // Leer la clave desde las variables de entorno de Vercel
  const API_KEY = (import.meta.env.VITE_GROQ_API_KEY || "").trim();
  if (!API_KEY) {
    return "❌ Error: No se encuentra la API Key de Groq en las variables de entorno de Vercel.";
  }

  const MODELO = "llama-3.3-70b-versatile";
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