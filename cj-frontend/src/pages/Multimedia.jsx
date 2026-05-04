import { useState, useEffect } from 'react';

export default function Multimedia({ temaOscuro }) {
  const [archivos, setArchivos] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);

  const GITHUB_USER = "CJPANTA";
  const GITHUB_REPO = "cj-project"; 

  useEffect(() => {
    const escanearCarpeta = async () => {
      try {
        const res = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/BASE_DATOS/05_MULTIMEDIA`);
        if (!res.ok) throw new Error("No se pudo escanear 05_MULTIMEDIA");
        const data = await res.json();
        
        const detectados = data
          .filter(f => f.name.match(/\.(mp4|png|jpg|jpeg|gif)$/i))
          .map(f => ({
            titulo: f.name.replace(/\.[^/.]+$/, "").replace(/_/g, ' '),
            url: f.download_url,
            tipo: f.name.toLowerCase().endsWith('.mp4') ? 'video' : 'imagen'
          }));

        setArchivos(detectados);
        setCargando(false);
      } catch (e) {
        console.error("Error Multimedia:", e);
        setCargando(false);
      }
    };
    escanearCarpeta();
  }, []);

  const mediosFiltrados = archivos.filter(m => 
    !busqueda || m.titulo.toLowerCase().includes(busqueda.toLowerCase())
  );

  // VARIABLES DE MODO DÍA/NOCHE
  const bgPanel = temaOscuro ? 'bg-[#0a141d]' : 'bg-white shadow-xl';
  const bgTarjeta = temaOscuro ? 'bg-black/20' : 'bg-gray-50';
  const bgInput = temaOscuro ? 'bg-[#0a141d]' : 'bg-white';
  const bgVisor = temaOscuro ? 'bg-black/40' : 'bg-gray-100';
  const bgVisorBarra = temaOscuro ? 'bg-[#020813]' : 'bg-white';
  const bgVisorMedia = temaOscuro ? 'bg-black/60' : 'bg-gray-200';
  const textoColor = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const subTexto = temaOscuro ? 'text-[#94a3b8]' : 'text-gray-500';
  const bordeColor = temaOscuro ? 'border-gray-800' : 'border-gray-200';

  return (
    <main className={`${bgPanel} border ${bordeColor} rounded-3xl p-6 h-full flex flex-col overflow-hidden animate-fade-in shadow-inner relative transition-colors duration-500`}>
      
      {/* ESTILOS PARA LAS TARJETAS GIRATORIAS MULTIMEDIA ADAPTADOS A DÍA/NOCHE */}
      <style>{`
        .flip-card-media { background-color: transparent; width: 100%; height: 160px; perspective: 1000px; }
        .flip-card-media-inner { position: relative; width: 100%; height: 100%; text-align: center; transition: transform 0.6s; transform-style: preserve-3d; cursor: pointer; border-radius: 1rem; }
        .flip-card-media:hover .flip-card-media-inner { transform: rotateY(180deg); }
        .flip-card-media-front, .flip-card-media-back { position: absolute; width: 100%; height: 100%; -webkit-backface-visibility: hidden; backface-visibility: hidden; border-radius: 1rem; overflow: hidden; border: 1px solid ${temaOscuro ? '#1f2937' : '#cbd5e1'}; }
        .flip-card-media-front { background-color: ${temaOscuro ? '#020813' : '#f8fafc'}; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; }
        .flip-card-media-back { background-color: ${temaOscuro ? '#0a141d' : '#f1f5f9'}; color: ${temaOscuro ? '#22d3ee' : '#0284c7'}; transform: rotateY(180deg); border: 2px solid ${temaOscuro ? '#22d3ee' : '#0ea5e9'}; display: flex; flex-direction: column; justify-content: center; align-items: center; box-shadow: 0 0 15px rgba(34, 211, 238, 0.2); }
      `}</style>

      <header className={`mb-6 border-b ${bordeColor} pb-4 shrink-0 flex justify-between items-end`}>
        <div>
          <h1 className={`text-3xl font-black uppercase tracking-tighter ${textoColor}`}>BANCO <span className="text-[#22d3ee]">MULTIMEDIA</span></h1>
          <p className={`${subTexto} text-[10px] font-bold uppercase tracking-[0.2em]`}>Escaneando: BASE_DATOS/05_MULTIMEDIA</p>
        </div>
        <div className="bg-[#10b981]/10 px-4 py-2 rounded-lg border border-[#10b981]/30">
          <span className="text-[#10b981] text-xs font-bold uppercase tracking-widest">
            {cargando ? '🔄 RASTREANDO...' : `${archivos.length} ARCHIVOS DETECTADOS`}
          </span>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0 overflow-hidden">
        
        {/* COLUMNA BÚSQUEDA */}
        <section className={`${bgTarjeta} border ${bordeColor} rounded-2xl p-4 flex flex-col shadow-sm overflow-hidden h-fit`}>
          <h2 className="text-[#22d3ee] text-[10px] font-bold uppercase mb-4 tracking-widest shrink-0">Buscador Visual</h2>
          <input 
            type="text" 
            value={busqueda} 
            onChange={(e) => setBusqueda(e.target.value)} 
            placeholder="Buscar imagen o video..." 
            className={`w-full ${bgInput} border ${bordeColor} rounded-xl px-4 py-3 ${textoColor} text-xs mb-4 focus:outline-none focus:border-[#22d3ee] transition-colors`}
          />
          <div className={`mt-2 ${subTexto} text-[10px] uppercase text-center border-t ${bordeColor} pt-4`}>
            <p>Imágenes y videos se actualizan automáticamente desde GitHub.</p>
          </div>
        </section>

        {/* COLUMNA GALERÍA / VISOR */}
        <section className={`lg:col-span-3 ${bgPanel} border ${bordeColor} rounded-2xl p-6 overflow-hidden flex flex-col shadow-sm`}>
          <div className={`flex justify-between items-center mb-6 shrink-0 border-b ${bordeColor} pb-2`}>
            <h2 className="text-[#22d3ee] text-xs font-bold uppercase tracking-widest truncate max-w-[70%]">
              {seleccionado ? `VIENDO: ${seleccionado.titulo}` : `📂 Galería Visual Activa`}
            </h2>
            {seleccionado && (
              <p className={`${subTexto} text-[9px] uppercase hidden md:block`}>
                Contenido en Alta Resolución
              </p>
            )}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            {seleccionado ? (
              // MODO VISOR COMPLETO
              <div className={`h-full flex flex-col ${bgVisor} rounded-2xl overflow-hidden border ${bordeColor}`}>
                
                {/* BARRA DE HERRAMIENTAS DEL VISOR */}
                <div className={`p-4 ${bgVisorBarra} flex flex-col sm:flex-row justify-between items-center border-b ${bordeColor} gap-4 shrink-0`}>
                  <h2 className={`${textoColor} text-xs font-black uppercase tracking-widest truncate`}>{seleccionado.titulo}</h2>
                  <div className="flex gap-3">
                    <a 
                      href={seleccionado.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="px-4 py-2 bg-[#10b981]/10 text-[#10b981] text-[10px] font-black uppercase tracking-widest border border-[#10b981]/30 rounded hover:bg-[#10b981] hover:text-white transition-all flex items-center gap-2"
                    >
                      Descargar HD
                    </a>
                    <button 
                      onClick={() => setSeleccionado(null)} 
                      className="px-4 py-2 bg-[#22d3ee]/10 text-[#22d3ee] text-[10px] font-black uppercase tracking-widest border border-[#22d3ee]/30 rounded hover:bg-[#22d3ee] hover:text-white transition-all"
                    >
                      ← Cerrar
                    </button>
                  </div>
                </div>

                {/* ÁREA DE LA IMAGEN / VIDEO */}
                <div className={`flex-1 min-h-0 p-4 flex items-center justify-center ${bgVisorMedia} relative`}>
                  {seleccionado.tipo === 'video' ? (
                    <video src={seleccionado.url} controls autoPlay className="w-full h-full object-contain rounded-lg shadow-2xl" />
                  ) : (
                    <img src={seleccionado.url} alt="Vista Clínica" className="w-full h-full object-contain rounded-lg shadow-2xl" />
                  )}
                </div>
              </div>
            ) : (
              // MODO GALERÍA (TARJETAS GIRATORIAS)
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {mediosFiltrados.length > 0 ? mediosFiltrados.map((f, i) => (
                  <div key={i} className="flip-card-media" onClick={() => setSeleccionado(f)}>
                    <div className="flip-card-media-inner">
                      
                      {/* FRENTE DE LA TARJETA */}
                      <div className="flip-card-media-front relative p-2">
                        {f.tipo === 'imagen' ? (
                          <img src={f.url} alt={f.titulo} className="absolute inset-0 w-full h-full object-contain p-2 opacity-80" />
                        ) : (
                          <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-black/50">
                            <span className="text-4xl drop-shadow-lg">🎬</span>
                          </div>
                        )}
                        {/* Título siempre con fondo oscuro para garantizar contraste */}
                        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black via-black/80 to-transparent pt-8 pb-3 px-3">
                          <h3 className="text-white text-[9px] font-black uppercase text-center leading-tight truncate drop-shadow-md">{f.titulo}</h3>
                        </div>
                      </div>

                      {/* REVERSO DE LA TARJETA */}
                      <div className="flip-card-media-back p-2">
                        <span className="text-3xl mb-2">{f.tipo === 'video' ? '▶️' : '👁️'}</span>
                        <h4 className="font-black text-[10px] uppercase text-center mt-1">Visualizar</h4>
                        <p className={`text-[8px] text-center mt-1 uppercase ${temaOscuro ? 'text-[#94a3b8]' : 'text-gray-500'}`}>Abrir en HD</p>
                      </div>

                    </div>
                  </div>
                )) : (
                  <div className={`col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed ${bordeColor} rounded-3xl`}>
                    <p className={`${subTexto} text-xs font-black uppercase tracking-widest`}>{cargando ? 'Buscando Archivos...' : 'No se encontraron resultados'}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}