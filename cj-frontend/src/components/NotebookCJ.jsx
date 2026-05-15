import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAura } from '../context/AuraContext';
import { consultarAuraIA } from '../services/iaService';

export const NotebookCJ = ({ temaOscuro, cerrarPanel }) => {
  const { contexto } = useAura();
  const [nota, setNota] = useState("");
  const [estado, setEstado] = useState("Listo.");
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const wakeLockRef = useRef(null);
  const [audioFile, setAudioFile] = useState(null);

  // Colores según tema
  const bgPanel = temaOscuro ? 'bg-[#0a141d]' : 'bg-white';
  const textoColor = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const textoSecundario = temaOscuro ? 'text-gray-400' : 'text-gray-600';
  const bordeColor = temaOscuro ? 'border-gray-800' : 'border-gray-200';
  const bgInput = temaOscuro ? 'bg-black/40 border-gray-700' : 'bg-gray-100 border-gray-300';
  const bgMensaje = temaOscuro ? 'bg-[#22d3ee]/5 border-[#22d3ee]/20' : 'bg-blue-50 border-blue-200';

  // Web Speech API: reconocimiento de voz en tiempo real
  const iniciarDictado = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setEstado("❌ Tu navegador no soporta reconocimiento de voz.");
      return;
    }
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = true;  // Graba continuamente hasta que se detenga
    recognition.interimResults = true;  // Resultados provisionales

    recognition.onstart = () => {
      setIsRecording(true);
      setEstado("🎙️ Grabando clase... (habla claro)");
      // Activar Wake Lock (mantener pantalla activa)
      if ('wakeLock' in navigator) {
        navigator.wakeLock.request('screen').then(lock => {
          wakeLockRef.current = lock;
        });
      }
    };
    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setNota(transcript);
    };
    recognition.onerror = (event) => {
      console.error(event.error);
      setEstado("❌ Error en el reconocimiento. Reintenta.");
      setIsRecording(false);
      if (wakeLockRef.current) wakeLockRef.current.release();
    };
    recognition.onend = () => {
      setIsRecording(false);
      setEstado("Grabación finalizada. Puedes editar la transcripción.");
      if (wakeLockRef.current) wakeLockRef.current.release();
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const detenerDictado = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  // Subir archivo de audio (grabado con app nativa)
  const manejarSubirAudio = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);
      setEstado(`Audio cargado: ${file.name}. Haz clic en "Generar resumen" para transcribir.`);
    } else {
      setEstado("Por favor selecciona un archivo de audio (mp3, wav, etc.)");
    }
  };

  // Función para enviar audio a Gemini y obtener transcripción + resumen
  const generarResumenDesdeAudio = async () => {
    if (!audioFile) {
      setEstado("No hay audio cargado. Sube un archivo primero.");
      return;
    }
    setIsTranscribing(true);
    setEstado("🔄 Enviando audio a IA... (puede tardar varios segundos)");

    // Convertir archivo a Base64 para enviar a Gemini (requiere API con soporte multimodal)
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Audio = reader.result.split(',')[1];
      // Gemini 1.5 Flash soporta audio en base64 (limitado a 10 MB aproximadamente)
      const prompt = `Transcribe este audio de una clase de fisioterapia y luego genera un resumen claro y estructurado de los puntos principales. Si hay términos médicos, asegúrate de escribirlos correctamente. Audio: data:audio/mp3;base64,${base64Audio}`;
      const respuesta = await consultarAuraIA(prompt, { ...contexto, archivo: audioFile.name });
      setNota(respuesta);
      setEstado("✅ Transcripción y resumen generados. Puedes guardar la nota.");
      setAudioFile(null);
      setIsTranscribing(false);
    };
    reader.readAsDataURL(audioFile);
  };

  const guardarNota = async () => {
    if (!nota.trim()) {
      setEstado("No hay contenido para guardar.");
      return;
    }
    setEstado("⏳ Guardando...");
    const { error } = await supabase.from('notas_estudio').insert([{
      user_id: localStorage.getItem('cj_user_id'),
      ciclo: contexto.ciclo,
      curso: contexto.materia,
      titulo: contexto.materia || "Nota de clase",
      contenido: nota,
      nivel_comprension: 'por_evaluar'
    }]);
    if (!error) {
      setEstado("✅ Guardado en " + (contexto.materia || "General"));
      setNota("");
    } else {
      setEstado("❌ Error al guardar: " + error.message);
    }
  };

  const exportarPDF = () => {
    if (!nota.trim()) {
      setEstado("No hay contenido para exportar.");
      return;
    }
    import('jspdf').then(({ default: jsPDF }) => {
      const doc = new jsPDF();
      const titulo = contexto.materia ? `Nota: ${contexto.materia.replace(/_/g, ' ')}` : 'Mi nota';
      doc.setFontSize(16);
      doc.text(titulo, 20, 20);
      doc.setFontSize(12);
      const lineas = doc.splitTextToSize(nota, 170);
      doc.text(lineas, 20, 35);
      doc.save(`nota_${new Date().toISOString().slice(0,19)}.pdf`);
      setEstado("📄 PDF exportado");
      setTimeout(() => setEstado("Listo."), 2000);
    });
  };

  return (
    <div className={`flex flex-col h-full p-6 ${bgPanel} border-l ${bordeColor} transition-colors duration-300 overflow-y-auto`}>
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
            <> estás en <span className="font-bold">{contexto.ciclo}</span>
              {contexto.materia && <> / <span className="text-[#10b981]">{contexto.materia.replace(/_/g, ' ')}</span></>}.
              Puedes grabar esta clase o subir un audio para obtener un resumen inteligente.</>
          ) : (
            " puedes grabar tus clases o subir un archivo de audio para generar resúmenes."
          )}
        </p>
      </div>

      <textarea 
        className={`flex-1 w-full p-4 rounded-2xl border text-sm resize-none outline-none ${bgInput} ${textoColor} ${bordeColor}`}
        value={nota}
        onChange={(e) => setNota(e.target.value)}
        placeholder="Aquí aparecerá la transcripción o tu resumen..."
        rows="6"
      />

      <div className="mt-4 flex flex-wrap gap-2">
        {!isRecording ? (
          <button onClick={iniciarDictado} className="flex-1 py-2 border rounded-xl font-black text-[10px] uppercase transition-colors bg-[#22d3ee]/20 text-[#22d3ee] border-[#22d3ee]/40">
            🎙️ Grabar clase
          </button>
        ) : (
          <button onClick={detenerDictado} className="flex-1 py-2 border rounded-xl font-black text-[10px] uppercase transition-colors bg-red-500/20 text-red-400 border-red-500/40">
            ⏹️ Detener grabación
          </button>
        )}
        <label className="flex-1 py-2 text-center border rounded-xl font-black text-[10px] uppercase cursor-pointer bg-gray-500/20 border-gray-500/40">
          📁 Subir audio
          <input type="file" accept="audio/*" className="hidden" onChange={manejarSubirAudio} />
        </label>
        <button onClick={generarResumenDesdeAudio} disabled={isTranscribing} className="flex-1 py-2 border rounded-xl font-black text-[10px] uppercase bg-purple-500/20 text-purple-400 border-purple-500/40">
          {isTranscribing ? 'Procesando...' : '✨ Generar resumen'}
        </button>
      </div>

      <div className="mt-4 flex gap-2">
        <button onClick={guardarNota} className="flex-1 py-2 bg-[#22d3ee] text-black rounded-xl font-black text-[10px] uppercase hover:bg-[#1bc1da]">Guardar nota</button>
        <button onClick={exportarPDF} className="flex-1 py-2 bg-gray-600 text-white rounded-xl font-black text-[10px] uppercase hover:bg-gray-700">Exportar PDF</button>
      </div>

      <p className={`text-[9px] mt-3 text-center font-bold uppercase ${textoSecundario}`}>{estado}</p>
    </div>
  );
};