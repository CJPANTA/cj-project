import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAura } from '../context/AuraContext';
import jsPDF from 'jspdf';

export const NotebookCJ = ({ temaOscuro, cerrarPanel }) => {
  const { contexto } = useAura();
  const [isRecording, setIsRecording] = useState(false);
  const [nota, setNota] = useState("");
  const [estado, setEstado] = useState("Listo.");
  const recognitionRef = useRef(null);

  // Colores según tema
  const bgPanel = temaOscuro ? 'bg-[#0a141d]' : 'bg-white';
  const textoColor = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const textoSecundario = temaOscuro ? 'text-gray-400' : 'text-gray-600';
  const bordeColor = temaOscuro ? 'border-gray-800' : 'border-gray-200';
  const bgInput = temaOscuro ? 'bg-black/40 border-gray-700' : 'bg-gray-100 border-gray-300';
  const bgMensaje = temaOscuro ? 'bg-[#22d3ee]/5 border-[#22d3ee]/20' : 'bg-blue-50 border-blue-200';
  const btnExportar = temaOscuro ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800';

  const guardarEnSupabase = async () => {
    if (!nota.trim()) return;
    setEstado("⏳ Guardando...");
    const { error } = await supabase.from('notas_estudio').insert([{
      user_id: localStorage.getItem('cj_user_id'),
      ciclo: contexto.ciclo,
      curso: contexto.materia,
      titulo: contexto.materia || "Apunte Rápido",
      contenido: nota,
      nivel_comprension: 'por_evaluar'
    }]);
    if (!error) {
      setEstado("✅ Guardado en " + (contexto.materia || "General"));
      setNota("");
    } else {
      setEstado("❌ Error al guardar.");
    }
  };

  const exportarPDF = () => {
    if (!nota.trim()) {
      setEstado("📄 No hay contenido para exportar.");
      return;
    }
    const doc = new jsPDF();
    const titulo = contexto.materia ? `Apunte: ${contexto.materia.replace(/_/g, ' ')}` : 'Mi apunte';
    doc.setFontSize(16);
    doc.text(titulo, 20, 20);
    doc.setFontSize(12);
    const lineas = doc.splitTextToSize(nota, 170);
    doc.text(lineas, 20, 35);
    doc.save(`apunte_${new Date().toISOString().slice(0,19)}.pdf`);
    setEstado("📄 PDF exportado");
    setTimeout(() => setEstado("Listo."), 2000);
  };

  const iniciarDictado = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.lang = 'es-ES';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setNota(prev => prev + (prev ? ' ' : '') + transcript);
        setIsRecording(false);
      };
      recognition.onerror = () => setIsRecording(false);
      recognition.start();
      setIsRecording(true);
    } else {
      setEstado("❌ Tu navegador no soporta dictado por voz.");
    }
  };

  return (
    <div className={`flex flex-col h-full p-6 ${bgPanel} border-l ${bordeColor} transition-colors duration-300`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-[10px] font-black uppercase tracking-[0.3em] ${temaOscuro ? 'text-[#22d3ee]' : 'text-[#10b981]'}`}>
          Aura Intelligence
        </h3>
        {cerrarPanel && (
          <button onClick={cerrarPanel} className={`text-[18px] ${textoSecundario} hover:text-red-500`}>✕</button>
        )}
      </div>

      <div className={`p-4 rounded-2xl ${bgMensaje} border mb-4`}>
        <p className={`text-[11px] leading-relaxed ${textoColor}`}>
          Hola <span className="font-black text-[#22d3ee]">Jorge Luis</span>,
          {contexto.ciclo ? (
            <> estás en el <span className="font-bold">{contexto.ciclo}</span>
              {contexto.materia && <> / <span className="text-[#10b981]">{contexto.materia.replace(/_/g, ' ')}</span></>}.
              ¿Quieres dictarme alguna nota para tus estudios?</>
          ) : (
            " estoy lista para tus ideas. ¿Qué vamos a registrar hoy?"
          )}
        </p>
      </div>

      <textarea 
        className={`flex-1 w-full p-4 rounded-2xl border text-sm resize-none outline-none ${bgInput} ${textoColor} ${bordeColor}`}
        value={nota}
        onChange={(e) => setNota(e.target.value)}
        placeholder="Te escucho..."
      />

      <div className="mt-6 flex gap-3">
        <button onClick={iniciarDictado} className={`flex-1 py-3 border rounded-xl font-black text-[10px] uppercase transition-colors ${temaOscuro ? 'border-[#22d3ee] text-[#22d3ee] hover:bg-[#22d3ee]/10' : 'border-[#10b981] text-[#10b981] hover:bg-[#10b981]/10'}`}>
          {isRecording ? '🎙️ Grabando...' : '🎙️ Dictar'}
        </button>
        <button onClick={guardarEnSupabase} className="flex-1 py-3 bg-[#22d3ee] text-black rounded-xl font-black text-[10px] uppercase hover:bg-[#1bc1da] transition-all">
          Guardar
        </button>
        <button onClick={exportarPDF} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${btnExportar}`}>
          📄 Exportar PDF
        </button>
      </div>
      <p className={`text-[9px] mt-4 text-center font-bold uppercase ${textoSecundario}`}>{estado}</p>
    </div>
  );
};