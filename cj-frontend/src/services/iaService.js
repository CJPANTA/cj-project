export const consultarAuraIA = async (pregunta) => {
  const API_KEY = (import.meta.env.VITE_GEMINI_KEY || import.meta.env.VITE_GEMINI_API_KEY || "").trim();

  if (!API_KEY) {
    return "Error Local: La API Key no se está leyendo desde Vercel.";
  }

  // EL NOMBRE EXACTO QUE GOOGLE TE ASIGNÓ EN TU ARCHIVO TXT
  const MODELO = "gemini-flash-latest"; 
  const URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:generateContent`;

  try {
    const response = await fetch(URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-goog-api-key': API_KEY 
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Actúa como Aura, IA experta en fisioterapia. Responde a Jorge Luis de forma profesional y eficiente: ${pregunta}`
          }]
        }]
      })
    });

    const data = await response.json();

    // Si hay error, ahora imprimirá exactamente qué pasó
    if (!response.ok) {
      return `Error de Google (${response.status}): ${data.error?.message || 'Petición rechazada.'}`;
    }

    if (data.candidates && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text;
    } else {
      return "Aura: Respuesta no procesable.";
    }
  } catch (error) {
    return `Aura: Fallo de conexión o red (${error.message}).`;
  }
};