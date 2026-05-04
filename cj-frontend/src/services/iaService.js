// src/services/iaService.js
export const consultarAuraIA = async (pregunta) => {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  
  // URL EXACTA según el documento curl que me pasaste
  // Nota que no lleva el "1.5", es "gemini-flash-latest"
  const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`;

  try {
    const response = await fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Actúa como Aura, IA experta en fisioterapia. Responde a Jorge Luis: ${pregunta}`
          }]
        }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error detectado:", data);
      return `Error (${response.status}): Revisa si el modelo 'gemini-flash-latest' está activo en tu AI Studio.`;
    }

    if (data.candidates && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text;
    } else {
      return "Aura: Respuesta vacía del servidor.";
    }

  } catch (error) {
    console.error("Fallo de red:", error);
    return "Aura: Sin conexión a internet.";
  }
};