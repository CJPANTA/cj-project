import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAura } from '../context/AuraContext';

export const NotebookCJ = ({ temaOscuro, cerrarPanel }) => {
  const { contexto } = useAura(); // Aura lee dónde estás
  const [isRecording, setIsRecording] = useState(false);
  const [nota, setNota] = useState("");
  const [estado, setEstado] = useState("Listo.");
  
  const recognitionRef = useRef(null);

  const guardarEnSupabase = async () => {
    if (!nota.trim()) return;
    setEstado("⏳ Guardando...");
    
    const { error } = await supabase.from('notas_estudio').insert([{
      user_id: localStorage.getItem('cj_user_id'),
      ciclo: contexto.ciclo,
      curso: contexto.curso,
      titulo: contexto.materia || "Apunte Rápido",
      contenido: nota,
      nivel_comprension: 'por_evaluar'
    }]);

    if (!error) {
      setEstado("✅ Guardado en " + (contexto.curso || "General"));
      setNota("");
    } else {
      setEstado("❌ Error al guardar.");
    }
  };

  return (
    <div className="flex flex-col h-full p-6 animate-fade-in font-sans">
      <header className="mb-6">
        <h3 className={`text-[10px] font-black uppercase tracking-[0.3em] ${temaOscuro ? 'text-[#22d3ee]' : 'text-[#10b981]'}`}>
          Aura Intelligence
        </h3>
        {/* EL MENSAJE FANTASMA DINÁMICO */}
        <div className="mt-4 p-4 rounded-2xl bg-[#22d3ee]/5 border border-[#22d3ee]/20">
          <p className={`text-[11px] leading-relaxed ${temaOscuro ? 'text-gray-300' : 'text-slate-600'}`}>
            Hola <span className="font-black text-[#22d3ee]">{contexto.usuario}</span>, 
            {contexto.ciclo ? (
              <> estás en el <span className="font-bold">Ciclo {contexto.ciclo}</span> 
                 {contexto.curso && <> / <span className="text-[#10b981]">{contexto.curso.replace(/_/g, ' ')}</span></>}.
                 ¿Quieres dictarme alguna nota para tus estudios?</>
            ) : (
              " estoy lista para tus ideas. ¿Qué vamos a registrar hoy?"
            )}
          </p>
        </div>
      </header>

      <textarea 
        className={`flex-1 w-full p-4 rounded-2xl border text-sm resize-none outline-none ${temaOscuro ? 'bg-black/40 text-white border-gray-800' : 'bg-gray-100 text-slate-800 border-gray-300'}`}
        value={nota}
        onChange={(e) => setNota(e.target.value)}
        placeholder="Te escucho..."
      />

      <div className="mt-6 flex gap-3">
        <button onClick={isRecording ? () => recognitionRef.current.stop() : () => {/* lógica inicio */}} className="flex-1 py-3 border border-[#22d3ee] text-[#22d3ee] rounded-xl font-black text-[10px] uppercase">
          {isRecording ? 'Pausar' : '🎙️ Dictar'}
        </button>
        <button onClick={guardarEnSupabase} className="flex-1 py-3 bg-[#22d3ee] text-black rounded-xl font-black text-[10px] uppercase">
          Guardar
        </button>
      </div>
      <p className="text-[9px] mt-4 text-center text-gray-500 font-bold uppercase">{estado}</p>
    </div>
  );
};