import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { consultarAuraIA } from '../services/iaService';
import { useAura } from '../context/AuraContext';

export default function TutorChat({ temaOscuro, onCerrar }) {
  const [mensajes, setMensajes] = useState([]);
  const [input, setInput] = useState('');
  const [cargando, setCargando] = useState(false);
  const [historialChat, setHistorialChat] = useState([]);
  const [escuchando, setEscuchando] = useState(false);
  const { contexto } = useAura();
  const mensajesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const obtenerUltimoPDF = () => {
    const pdf = localStorage.getItem('ultimo_pdf_visto');
    return pdf ? JSON.parse(pdf) : null;
  };

  useEffect(() => {
    window.speechSynthesis.getVoices();
  }, []);

  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const enviarMensaje = async (texto) => {
    const pregunta = texto || input;
    if (!pregunta.trim()) return;
    const userMsg = { role: 'user', content: pregunta, timestamp: new Date().toISOString() };
    setMensajes(prev => [...prev, userMsg]);
    setInput('');
    setCargando(true);

    const ultimoPDF = obtenerUltimoPDF();
    let contextoCompleto = { ...contexto };
    if (ultimoPDF) contextoCompleto.ultimoPDF = ultimoPDF;
    const historial = [...historialChat, { role: 'user', content: pregunta }];

    const systemPrompt = `Eres "Aura", la tutora personal de fisioterapia dentro del ecosistema CJ. 
    Explica los temas con claridad, usando ejemplos prácticos y analogías cuando sea útil.
    Mantén un tono motivador y profesional. Usa formato Markdown para estructurar tus respuestas.
    NO uses caracteres ***, ---, ===.`;

    let respuesta = await consultarAuraIA(pregunta, contextoCompleto, historial, systemPrompt);
    respuesta = respuesta.replace(/[\*\-=]{3,}/g, '');
    
    const assistantMsg = { role: 'assistant', content: respuesta, timestamp: new Date().toISOString() };
    setMensajes(prev => [...prev, assistantMsg]);
    setHistorialChat(prev => [...prev, { role: 'user', content: pregunta }, { role: 'assistant', content: respuesta }]);
    setCargando(false);
  };

  const iniciarDictado = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Tu navegador no soporta reconocimiento de voz.');
      return;
    }
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setEscuchando(true);
    recognition.onend = () => setEscuchando(false);
    recognition.onerror = (event) => {
      console.error(event.error);
      setEscuchando(false);
      alert('Error al escuchar: ' + event.error);
    };
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      enviarMensaje(transcript);
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const leerRespuesta = () => {
    const ultimoMensaje = [...mensajes].reverse().find(m => m.role === 'assistant');
    if (!ultimoMensaje) {
      alert('No hay respuesta del tutor para leer.');
      return;
    }
    let textoLimpio = ultimoMensaje.content
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .replace(/[#\-*_>|]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    const utterance = new SpeechSynthesisUtterance(textoLimpio);
    utterance.lang = 'es-ES';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    const voces = window.speechSynthesis.getVoices();
    const vozEspanol = voces.find(v => v.lang === 'es-ES' && (v.name.includes('Google') || v.name.includes('Spanish')));
    if (vozEspanol) utterance.voice = vozEspanol;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const limpiarHistorial = () => {
    setMensajes([]);
    setHistorialChat([]);
    window.speechSynthesis.cancel();
  };

  const bgFondo = temaOscuro ? 'bg-[#0a141d]' : 'bg-gray-100';
  const bgBurbujaUsuario = temaOscuro ? 'bg-[#22d3ee]/20 text-white' : 'bg-[#22d3ee] text-black';
  const bgBurbujaTutor = temaOscuro ? 'bg-gray-800 text-white' : 'bg-white text-gray-800';
  const textoColor = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const textoSecundario = temaOscuro ? 'text-gray-400' : 'text-gray-500';
  const bordeColor = temaOscuro ? 'border-gray-800' : 'border-gray-200';

  return (
    <div className={`flex flex-col h-full ${bgFondo} border-l ${bordeColor} transition-colors duration-300 w-full`}>
      {/* Cabecera */}
      <div className="flex justify-between items-center p-4 border-b border-gray-700 shrink-0">
        <div>
          <h3 className={`text-sm font-black uppercase tracking-wider ${textoColor}`}>🎓 Tutor Aura</h3>
          <p className={`text-[9px] ${textoSecundario}`}>
            {contexto.ciclo && `${contexto.ciclo} · `}
            {contexto.materia ? contexto.materia.replace(/_/g, ' ') : 'Experta en fisioterapia'}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={limpiarHistorial} className="text-xs text-gray-500 hover:text-red-400" title="Limpiar conversación">🗑️</button>
          {onCerrar && <button onClick={onCerrar} className="text-gray-500 hover:text-white">✕</button>}
        </div>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {mensajes.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            <p className="text-sm">👋 ¡Hola! Soy Aura, tu tutora personal de fisioterapia.</p>
            <p className="text-xs mt-2">Puedes escribir tu pregunta o usar el botón de micrófono para hablar.</p>
          </div>
        ) : (
          mensajes.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.role === 'user' ? bgBurbujaUsuario : bgBurbujaTutor} ${msg.role === 'assistant' ? 'rounded-bl-none' : 'rounded-br-none'}`}>
                {msg.role === 'assistant' ? (
                  <div className={`prose prose-sm max-w-none ${temaOscuro ? 'prose-invert' : ''}`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm">{msg.content}</p>
                )}
                <p className={`text-[9px] mt-1 ${msg.role === 'user' ? 'text-black/50 dark:text-white/50' : textoSecundario}`}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        {cargando && (
          <div className="flex justify-start">
            <div className={`bg-gray-700 rounded-2xl rounded-bl-none px-4 py-2 ${bgBurbujaTutor}`}>
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={mensajesEndRef} />
      </div>

      {/* Input + Botones - Ajustado para móvil: flex-wrap y tamaño reducido */}
      <div className="p-4 border-t border-gray-700 shrink-0">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex gap-2 flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && enviarMensaje()}
              placeholder="Escribe tu pregunta..."
              className={`flex-1 bg-black/20 border ${bordeColor} rounded-xl px-4 py-3 text-sm outline-none focus:border-[#22d3ee] ${textoColor} min-w-0`}
            />
            <button
              onClick={() => enviarMensaje()}
              disabled={cargando}
              className="px-4 bg-[#22d3ee] text-black font-black rounded-xl text-xs uppercase hover:scale-105 transition-all disabled:opacity-50 whitespace-nowrap"
            >
              Enviar
            </button>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={iniciarDictado}
              disabled={cargando}
              className={`px-3 py-2 rounded-xl text-white font-black text-xs uppercase transition-all ${escuchando ? 'bg-red-500 animate-pulse' : 'bg-purple-600 hover:bg-purple-700'}`}
              title="Dictar por voz"
            >
              🎙️
            </button>
            <button
              onClick={leerRespuesta}
              disabled={cargando || mensajes.filter(m => m.role === 'assistant').length === 0}
              className="px-3 py-2 rounded-xl bg-green-600 text-white font-black text-xs uppercase hover:bg-green-700 transition-all disabled:opacity-50"
              title="Leer última respuesta"
            >
              🔊
            </button>
          </div>
        </div>
        <p className={`text-[9px] mt-2 text-center ${textoSecundario}`}>
          El tutor recuerda la conversación. Usa el micrófono 🎙️ para hablar o 🔊 para escuchar la respuesta.
        </p>
      </div>
    </div>
  );
}