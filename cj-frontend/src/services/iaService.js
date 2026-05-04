export const consultarAuraIA = async (pregunta) => {
  // 1. Forzamos a que la llave pierda cualquier espacio en blanco invisible (.trim)
  // Buscamos ambos nombres por si en Vercel se guardó de una u otra forma
  const API_KEY = (import.meta.env.VITE_GEMINI_KEY || import.meta.env.VITE_GEMINI_API_KEY || "").trim();

  if (!API_KEY) {
    return "Error Local: La API Key no se está leyendo desde Vercel.";
  }

  // 2. URL LIMPIA: Completamente intacta para que jamás vuelva a dar 404
  const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`;

  try {
    const response = await fetch(URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        // 3. LA SOLUCIÓN: Mandamos la llave por el Header, tal cual dice tu documento
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