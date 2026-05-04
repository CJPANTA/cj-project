import { useState, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAura } from '../context/AuraContext';

export const NotebookCJ = ({ cerrarPanel }) => {
  const { contexto } = useAura();
  const [isRecording, setIsRecording] = useState(false);
  const [nota, setNota] = useState("");
  const [estado, setEstado] = useState("Listo.");
  
  const recognitionRef = useRef(null);

  const guardarEnSupabase = async () => {
    if (!nota.trim()) return;
    setEstado("⏳ Guardando...");
    
    const { error } = await supabase.from('notas_estudio').insert([{
      user_id: localStorage.getItem('cj_user_id'),
      ciclo: contexto?.ciclo || '05',
      curso: contexto?.curso || 'General',
      titulo: contexto?.materia || "Apunte Rápido",
      contenido: nota,
      nivel_comprension: 'por_evaluar'
    }]);

    if (!error) {
      setEstado("✅ Guardado en " + (contexto?.curso || "General"));
      setNota("");
    } else {
      setEstado("❌ Error al guardar.");
    }
  };

  return (
    <div className="flex flex-col h-full p-6 animate-fade-in font-sans bg-[#020813] border border-gray-800/50 rounded-3xl w-full">
      <header className="mb-6">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#22d3ee]">
          Aura Intelligence
        </h3>
        
        <div className="mt-4 p-4 rounded-2xl bg-[#22d3ee]/5 border border-[#22d3ee]/20">
          <p className="text-[11px] leading-relaxed text-gray-300">
            Hola <span className="font-black text-[#22d3ee]">{contexto?.usuario || 'Jorge Luis'}</span>, 
            {contexto?.ciclo ? (
              <> estás en el <span className="font-bold">Ciclo {contexto.ciclo}</span> 
                 {contexto.curso && <> / <span className="text-[#10b981]">{contexto.curso.replace(/_/g, ' ')}</span></>}.
                 ¿Quieres dictarme alguna nota para tus estudios?</>
            ) : (
              " estoy lista para tus ideas. ¿Qué vamos a registrar hoy?"
            )}
          </p>
        </div>
      </header>

      {/* TEXTAREA OSCURO CORREGIDO */}
      <textarea 
        className="flex-1 w-full p-4 rounded-2xl text-sm resize-none outline-none bg-[#0a141d] text-white border border-gray-800 focus:border-[#22d3ee]/50 placeholder-gray-600 shadow-inner transition-colors"
        value={nota}
        onChange={(e) => setNota(e.target.value)}
        placeholder="Te escucho..."
      />

      <div className="mt-6 flex gap-3">
        <button onClick={isRecording ? () => recognitionRef.current?.stop() : () => {}} className="flex-1 py-3 border border-[#22d3ee]/40 text-[#22d3ee] hover:border-[#22d3ee] rounded-xl font-black text-[10px] uppercase transition-all">
          {isRecording ? 'Pausar' : '🎙️ Dictar'}
        </button>
        <button onClick={guardarEnSupabase} className="flex-1 py-3 bg-[#22d3ee] text-black hover:bg-[#1bc1da] rounded-xl font-black text-[10px] uppercase shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all">
          Guardar
        </button>
      </div>
      <p className="text-[9px] mt-4 text-center text-gray-500 font-bold uppercase">{estado}</p>
    </div>
  );
};