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
  const { contexto } = useAura();
  const mensajesEndRef = useRef(null);

  // Obtener el último PDF desde localStorage para contexto
  const obtenerUltimoPDF = () => {
    const pdf = localStorage.getItem('ultimo_pdf_visto');
    return pdf ? JSON.parse(pdf) : null;
  };

  // Auto-scroll al final
  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const enviarMensaje = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input, timestamp: new Date().toISOString() };
    setMensajes(prev => [...prev, userMsg]);
    setInput('');
    setCargando(true);

    // Construir contexto completo
    const ultimoPDF = obtenerUltimoPDF();
    let contextoCompleto = { ...contexto };
    if (ultimoPDF) {
      contextoCompleto.ultimoPDF = ultimoPDF;
    }
    // Añadir al historial del chat (para que la IA recuerde la conversación)
    const historial = [...historialChat, { role: 'user', content: input }];

    // System prompt que define al tutor
    const systemPrompt = `Eres "Aura", la tutora personal de fisioterapia dentro del ecosistema CJ. 
    Tu objetivo es ayudar al estudiante a comprender los conceptos de fisioterapia.
    Explica los temas con claridad, usando ejemplos prácticos y analogías cuando sea útil.
    Si el estudiante no entiende algo, intenta explicarlo de otra manera.
    Mantén un tono motivador y profesional, siempre enfocado en el aprendizaje.
    Usa formato Markdown para estructurar tus respuestas (negritas, listas, títulos si es necesario).
    NO uses caracteres ***, ---, ===.`;

    let respuesta = await consultarAuraIA(input, contextoCompleto, historial, systemPrompt);
    // Limpiar ***, ---, ===
    respuesta = respuesta.replace(/[\*\-=]{3,}/g, '');
    
    const assistantMsg = { role: 'assistant', content: respuesta, timestamp: new Date().toISOString() };
    setMensajes(prev => [...prev, assistantMsg]);
    setHistorialChat(prev => [...prev, { role: 'user', content: input }, { role: 'assistant', content: respuesta }]);
    setCargando(false);
  };

  const limpiarHistorial = () => {
    setMensajes([]);
    setHistorialChat([]);
  };

  // Estilos según tema
  const bgFondo = temaOscuro ? 'bg-[#0a141d]' : 'bg-gray-100';
  const bgBurbujaUsuario = temaOscuro ? 'bg-[#22d3ee]/20 text-white' : 'bg-[#22d3ee] text-black';
  const bgBurbujaTutor = temaOscuro ? 'bg-gray-800 text-white' : 'bg-white text-gray-800';
  const textoColor = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const textoSecundario = temaOscuro ? 'text-gray-400' : 'text-gray-500';
  const bordeColor = temaOscuro ? 'border-gray-800' : 'border-gray-200';

  return (
    <div className={`flex flex-col h-full ${bgFondo} border-l ${bordeColor} transition-colors duration-300`}>
      {/* Cabecera */}
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <div>
          <h3 className={`text-sm font-black uppercase tracking-wider ${textoColor}`}>🎓 Tutor Aura</h3>
          <p className={`text-[9px] ${textoSecundario}`}>
            {contexto.ciclo && `${contexto.ciclo} · `}
            {contexto.materia ? contexto.materia.replace(/_/g, ' ') : 'Experta en fisioterapia'}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={limpiarHistorial} className="text-xs text-gray-500 hover:text-red-400" title="Limpiar conversación">🗑️</button>
          {onCerrar && (
            <button onClick={onCerrar} className="text-gray-500 hover:text-white">✕</button>
          )}
        </div>
      </div>

      {/* Área de mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {mensajes.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            <p className="text-sm">👋 ¡Hola! Soy Aura, tu tutora personal de fisioterapia.</p>
            <p className="text-xs mt-2">Puedes preguntarme sobre anatomía, patologías, tratamientos, ejercicios... ¡lo que necesites!</p>
            <p className="text-xs mt-4 text-[#22d3ee]">💡 Ejemplo: "Explícame la biomecánica del hombro como si fuera una polea"</p>
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

      {/* Input */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && enviarMensaje()}
            placeholder="Pregúntale a tu tutor personal..."
            className={`flex-1 bg-black/20 border ${bordeColor} rounded-xl px-4 py-3 text-sm outline-none focus:border-[#22d3ee] ${textoColor}`}
          />
          <button
            onClick={enviarMensaje}
            disabled={cargando}
            className="px-4 bg-[#22d3ee] text-black font-black rounded-xl text-xs uppercase hover:scale-105 transition-all disabled:opacity-50"
          >
            Enviar
          </button>
        </div>
        <p className={`text-[9px] mt-2 text-center ${textoSecundario}`}>
          El tutor recuerda la conversación actual y puede usar el contexto del último PDF que abriste.
        </p>
      </div>
    </div>
  );
}