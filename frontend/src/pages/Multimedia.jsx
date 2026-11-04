// src/pages/Multimedia.jsx
import { useState } from 'react';
import { useGitHubScanner } from '../hooks/useGitHubScanner';

export default function Multimedia({ temaOscuro }) {
  // Usamos el hook apuntando a la carpeta 'multimedia'
  const { estructura, cargando, error, recargar } = useGitHubScanner('multimedia');
  const [imagenActiva, setImagenActiva] = useState(null);

  const textoColor = temaOscuro ? 'text-white' : 'text-[#1e293b]';
  const textoSecundario = temaOscuro ? 'text-gray-400' : 'text-gray-600';

  if (cargando) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <p className="text-[#22d3ee] font-black text-xl animate-pulse">🔄 Cargando galería...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-10">
        <p className="text-red-500 font-bold">Error al cargar las imágenes: {error}</p>
        <button onClick={recargar} className="mt-4 bg-[#22d3ee] text-black px-4 py-2 rounded-xl font-bold">Reintentar</button>
      </div>
    );
  }

  const imagenes = estructura?.imagenes || [];

  return (
    <main className="p-4 md:p-8 max-w-7xl mx-auto w-full font-sans animate-fade-in">
      
      {/* ENCABEZADO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className={`text-3xl md:text-4xl font-black tracking-tighter ${textoColor}`}>
            Galería <span className="text-[#10b981]">Multimedia</span>
          </h1>
          <p className={`${textoSecundario} text-[10px] font-bold uppercase tracking-widest mt-2`}>
            Láminas anatómicas y material visual de estudio
          </p>
        </div>
        <button 
          onClick={recargar} 
          className="p-2 rounded-full hover:bg-white/10 transition-all text-gray-400 hover:text-[#10b981]" 
          title="Sincronizar imágenes nuevas"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
        </button>
      </div>

      {/* GALERÍA */}
      {imagenes.length === 0 ? (
        <div className={`p-12 text-center rounded-3xl border ${temaOscuro ? 'bg-[#0f172a] border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
          <p className="text-gray-400">No hay imágenes en la carpeta <code className="text-[#10b981]">05_MULTIMEDIA</code>.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {imagenes.map((img, index) => (
            <div 
              key={index}
              onClick={() => setImagenActiva(img)}
              className={`group relative overflow-hidden rounded-2xl cursor-pointer border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
                temaOscuro ? 'bg-[#0f172a] border-gray-800 hover:border-[#10b981]/50' : 'bg-white border-gray-200 hover:border-[#10b981]'
              }`}
            >
              <div className="aspect-square overflow-hidden bg-gray-900 flex items-center justify-center">
                <img 
                  src={img.url} 
                  alt={img.nombreMostrar} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
              </div>
              <div className="p-4 bg-gradient-to-t from-black/80 to-transparent absolute bottom-0 left-0 w-full opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-xs font-bold truncate">{img.nombreMostrar}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LIGHTBOX (PANTALLA COMPLETA) */}
      {imagenActiva && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setImagenActiva(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-all"
            onClick={() => setImagenActiva(null)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
          
          <div className="max-w-6xl max-h-[90vh] flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <img 
              src={imagenActiva.url} 
              alt={imagenActiva.nombreMostrar} 
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-white/10"
            />
            <div className="mt-4 text-center">
              <h3 className="text-white font-black text-lg tracking-wide">{imagenActiva.nombreMostrar}</h3>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}