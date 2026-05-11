// src/services/iaService.js
class AuraQueue {
    constructor() {
        this.queue = [];
        this.processing = false;
    }
    enqueue(fetchFn) {
        return new Promise((resolve, reject) => {
            this.queue.push({ fetchFn, resolve, reject });
            this.process();
        });
    }
    async process() {
        if (this.processing || this.queue.length === 0) return;
        this.processing = true;
        const { fetchFn, resolve, reject } = this.queue.shift();
        try {
            const result = await fetchFn();
            resolve(result);
        } catch (error) {
            reject(error);
        } finally {
            this.processing = false;
            this.process();
        }
    }
}
const auraQueue = new AuraQueue();

async function executeGeminiRequest(pregunta, contexto) {
    const API_KEY = (import.meta.env.VITE_GEMINI_KEY || import.meta.env.VITE_GEMINI_API_KEY || "").trim();
    if (!API_KEY) return "❌ Error: No se encontró la API Key. Configúrala en Aura AI Config.";

    // 🟢 ✅ CAMBIO IMPORTANTE: Usar el nuevo modelo estable
    const MODELO = "gemini-2.0-flash";
    const URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:generateContent?key=${API_KEY}`;

    let prompt = `Actúa como Aura, una experta en fisioterapia.`;
    if (contexto.ciclo) prompt += ` El usuario está en ${contexto.ciclo}.`;
    if (contexto.materia) prompt += ` Estudiando: ${contexto.materia.replace(/_/g, ' ')}.`;
    prompt += `\n\nResponde de manera clara y profesional a la siguiente pregunta:\n${pregunta}`;

    const maxRetries = 1;
    let delay = 3000; // 3 segundos
    for (let i = 0; i <= maxRetries; i++) {
        try {
            const response = await fetch(URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            if (response.status === 429) {
                if (i === maxRetries) {
                    return "⚠️ El servicio de IA está muy solicitado. Por favor, espera unos segundos y vuelve a intentarlo.";
                }
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            if (!response.ok) {
                const err = await response.json();
                return `⚠️ Error ${response.status}: ${err.error?.message || 'Intenta de nuevo más tarde.'}`;
            }
            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        } catch (err) {
            if (i === maxRetries) return `⚠️ Aura: Error de conexión (${err.message}).`;
        }
    }
}

export const consultarAuraIA = async (pregunta, contexto = {}) => {
    const wrapped = () => executeGeminiRequest(pregunta, contexto);
    return auraQueue.enqueue(wrapped);
};