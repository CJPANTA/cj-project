import { useState, useRef, useEffect } from 'react';

export const GlobalMusicPlayer = ({ temaOscuro }) => {
  const [canciones, setCanciones] = useState([]);
  const [indiceActual, setIndiceActual] = useState(0);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [volumen, setVolumen] = useState(0.5);
  const [mostrarLista, setMostrarLista] = useState(false);
  
  const audioRef = useRef(null);

  const cargarCarpeta = (e) => {
    const archivos = Array.from(e.target.files).filter(file => file.type.startsWith('audio/'));
    if (archivos.length > 0) {
      setCanciones(archivos);
      setIndiceActual(0);
      setReproduciendo(true);
    }
  };

  useEffect(() => {
    if (canciones.length > 0 && audioRef.current) {
      const url = URL.createObjectURL(canciones[indiceActual]);
      audioRef.current.src = url;
      audioRef.current.volume = volumen;
      if (reproduciendo) {
        audioRef.current.play().catch(err => console.error("Error al reproducir", err));
      }
    }
  }, [indiceActual, canciones]);

  const alternarReproduccion = () => {
    if (audioRef.current) {
      reproduciendo ? audioRef.current.pause() : audioRef.current.play();
      setReproduciendo(!reproduciendo);
    }
  };

  const siguienteCancion = () => setIndiceActual((prev) => (prev + 1) % canciones.length);
  const anteriorCancion = () => setIndiceActual((prev) => (prev - 1 + canciones.length) % canciones.length);
  
  const cambiarVolumen = (e) => {
    const nuevoVol = parseFloat(e.target.value);
    setVolumen(nuevoVol);
    if (audioRef.current) audioRef.current.volume = nuevoVol;
  };

  const acento = temaOscuro ? 'text-[#22d3ee]' : 'text-[#10b981]';
  const textoPrincipal = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const colorIconos = temaOscuro ? 'text-gray-200' : 'text-slate-700'; 
  const hoverBtn = temaOscuro ? 'hover:bg-white/10' : 'hover:bg-slate-200';

  // Lógica de la canción actual
  const tituloCancion = canciones[indiceActual]?.name || "";
  const esLargo = tituloCancion.length > 25; // Si pasa de 25 caracteres, activamos tu idea

  if (canciones.length === 0) {
    return (
      <div className={`p-4 mt-auto border-t w-full max-w-full overflow-hidden ${temaOscuro ? 'border-gray-800' : 'border-gray-300'}`}>
        <label className={`flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${temaOscuro ? 'border-gray-700 hover:border-[#22d3ee] bg-gray-900/50' : 'border-gray-300 hover:border-[#10b981] bg-white'}`}>
          <svg className={`w-8 h-8 mb-2 ${acento}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13"></path>
            <circle cx="6" cy="18" r="3"></circle>
            <circle cx="18" cy="16" r="3"></circle>
          </svg>
          <span className={`text-[10px] font-black uppercase tracking-widest text-center truncate block w-full ${textoPrincipal}`}>Cargar Playlist</span>
          <input type="file" webkitdirectory="true" directory="true" multiple accept="audio/*" onChange={cargarCarpeta} className="hidden" />
        </label>
      </div>
    );
  }

  return (
    <div className={`relative mt-auto border-t p-4 flex flex-col gap-3 w-full max-w-full ${temaOscuro ? 'border-gray-800' : 'border-gray-300'}`}>
      
      {/* 🚀 INYECCIÓN DE ESTILOS PARA TU MARQUESINA */}
      <style>{`
        @keyframes scrollText {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animar-scroll {
          display: inline-block;
          white-space: nowrap;
          animation: scrollText 12s linear infinite;
        }
      `}</style>

      {/* TÍTULO Y BOTÓN DE LISTA */}
      <div className="flex justify-between items-center w-full gap-2">
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <span className={`text-[8px] font-black uppercase tracking-widest truncate block w-full ${acento}`}>
            Sonando ahora
          </span>
          
          {/* EL CONTENEDOR INTELIGENTE PARA EL TEXTO */}
          <div className="w-full overflow-hidden relative h-4 mt-0.5">
            {esLargo ? (
              <span className={`text-xs font-medium absolute animar-scroll ${textoPrincipal}`}>
                {tituloCancion}
              </span>
            ) : (
              <span className={`text-xs font-medium truncate block w-full ${textoPrincipal}`}>
                {tituloCancion}
              </span>
            )}
          </div>
        </div>

        <button onClick={() => setMostrarLista(!mostrarLista)} className={`p-2 rounded-lg shrink-0 transition-colors ${hoverBtn} ${colorIconos}`}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="18" x2="20" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* Controles Principales */}
      <div className="flex items-center justify-between mt-1 w-full">
        <button onClick={anteriorCancion} className={`p-2 rounded-full shrink-0 transition-colors ${hoverBtn} ${colorIconos}`}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19 20L9 12l10-8v16zM5 19h2V5H5v14z"></path></svg>
        </button>
        
        <button onClick={alternarReproduccion} className={`p-3 rounded-full shrink-0 transition-transform hover:scale-110 shadow-lg ${temaOscuro ? 'bg-[#22d3ee] text-black shadow-cyan-500/20' : 'bg-[#10b981] text-white shadow-emerald-500/20'}`}>
          {reproduciendo ? (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg>
          ) : (
            <svg className="w-5 h-5 pl-1" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"></path></svg>
          )}
        </button>

        <button onClick={siguienteCancion} className={`p-2 rounded-full shrink-0 transition-colors ${hoverBtn} ${colorIconos}`}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M5 4l10 8-10 8V4zm14 1h-2v14h2V5z"></path></svg>
        </button>
      </div>

      {/* Control de Volumen */}
      <div className="flex items-center gap-2 mt-2 w-full">
        <svg className={`w-3 h-3 shrink-0 opacity-60 ${colorIconos}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
        <input 
          type="range" min="0" max="1" step="0.01" 
          value={volumen} onChange={cambiarVolumen}
          className={`w-full h-1 flex-1 rounded-lg appearance-none cursor-pointer ${temaOscuro ? 'bg-gray-700 accent-[#22d3ee]' : 'bg-gray-300 accent-[#10b981]'}`}
        />
      </div>

      {/* Lista Desplegable */}
      {mostrarLista && (
        <div className={`absolute bottom-[100%] left-0 right-0 mb-4 max-h-48 overflow-y-auto rounded-xl border p-2 text-xs custom-scrollbar shadow-2xl z-[150] animate-fade-in ${temaOscuro ? 'bg-[#0f172a] border-gray-700 shadow-black/50 text-white' : 'bg-white border-gray-200 shadow-gray-400/50 text-slate-800'}`}>
          <div className="font-bold text-[9px] uppercase mb-2 border-b border-gray-500/30 pb-1 px-2 flex justify-between items-center">
            <span>Tu Playlist ({canciones.length})</span>
            <button onClick={() => setMostrarLista(false)} className="text-red-400 font-black px-2 hover:scale-110">✖</button>
          </div>
          {canciones.map((cancion, idx) => (
            <div 
              key={idx} 
              onClick={() => { setIndiceActual(idx); setReproduciendo(true); setMostrarLista(false); }}
              className={`truncate p-2 mt-1 cursor-pointer rounded-lg transition-colors ${
                idx === indiceActual 
                  ? (temaOscuro ? 'bg-[#22d3ee]/20 text-[#22d3ee] font-bold' : 'bg-[#10b981]/20 text-[#10b981] font-bold') 
                  : `${hoverBtn} ${textoPrincipal}`
              }`}
            >
              {idx + 1}. {cancion.name}
            </div>
          ))}
        </div>
      )}

      <audio ref={audioRef} onEnded={siguienteCancion} className="hidden" />
    </div>
  );
};