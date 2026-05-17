export const consultarAuraIA = async (pregunta, contexto = {}) => {
  const API_KEY = (import.meta.env.VITE_GEMINI_API_KEY || "").trim();
  if (!API_KEY) {
    return "❌ Error: No se encuentra la API Key de Gemini. Configúrala en Vercel (Environment Variables).";
  }
  
  const MODELO = "gemini-1.5-flash";
  const URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:generateContent?key=${API_KEY}`;
  
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
  } 
  else if (contexto.paciente || contexto.patologia || contexto.sintomas) {
    modo = "clinica";
    promptBase = `Actúa como Aura, una especialista en fisioterapia clínica...`; // (mantén tu prompt clínico)
  } 
  else if (contexto.ciclo || contexto.materia || contexto.archivo) {
    modo = "academia";
    promptBase = `Actúa como Aura, una tutora experta en fisioterapia...`; // (tu prompt académico)
  } 
  else {
    promptBase = `Actúa como Aura, la asistente virtual del Ecosistema CJ...`;
  }
  
  // Si no es resumen de PDF, usar el prompt por defecto según el modo
  if (!esResumenPDF || !contexto.ultimoPDF) {
    // (aquí iría tu lógica de construcción de prompt por modo, igual que antes)
    // Por brevedad, ponemos un prompt genérico, pero tú puedes copiar el que ya tienes.
    promptBase = `${promptBase}\n\nPregunta del usuario: ${pregunta}`;
  } else {
    promptBase = `${promptBase}`; // ya incluye la pregunta implícita
  }
  
  // Reintentos automáticos
  const maxRetries = 2;
  let delay = 1000;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const response = await fetch(URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptBase }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2000 }
        })
      });
      
      if (response.status === 429) {
        if (i === maxRetries) {
          return "⚠️ El servicio de IA está muy solicitado. Por favor, espera unos segundos y vuelve a intentarlo.";
        }
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
        continue;
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        return `⚠️ Error ${response.status}: ${errorData.error?.message || 'Error desconocido.'}`;
      }
      
      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
      
    } catch (error) {
      if (i === maxRetries) {
        return `⚠️ Error de conexión: ${error.message}. Inténtalo de nuevo.`;
      }
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
};