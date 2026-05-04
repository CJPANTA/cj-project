export const consultarAuraIA = async (pregunta) => {
  const API_KEY = import.meta.env.VITE_GEMINI_KEY; 
  // EL MODELO EXACTO Y ACTIVO (1.5, no 2.5)
  const MODELO = "gemini-1.5-flash"; 
  const URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:generateContent?key=${API_KEY}`;

  try {
    const response = await fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      console.error("Error API Gemini:", data);
      return `Error (${response.status}): ${data.error?.message || 'Revisa la conexión con Gemini.'}`;
    }

    if (data.candidates && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text;
    } else {
      return "Aura: No pude procesar la respuesta.";
    }
  } catch (error) {
    console.error("Error en servicio IA:", error);
    return "Aura: Error de red o conexión.";
  }
};