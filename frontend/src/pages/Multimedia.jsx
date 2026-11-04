// src/pages/Multimedia.jsx
import { useState, useMemo } from 'react';
import { useGitHubScanner } from '../hooks/useGitHubScanner';
import { createPortal } from 'react-dom';

export default function Multimedia({ temaOscuro }) {
  const { estructura, cargando, error, recargar } = useGitHubScanner('multimedia');
  const [busqueda, setBusqueda] = useState('');
  const [indiceActivo, setIndiceActivo] = useState(null);

  const textoColor = temaOscuro ? 'text-white' : 'text-[#1e293b]';
  const textoSecundario = temaOscuro ? 'text-gray-400' : 'text-gray-600';
  const bgInput = temaOscuro ? 'bg-black/40 border-white/10' : 'bg-gray-100 border-gray-300';
  const bgSticky = temaOscuro ? 'bg-[#020813]/90' : 'bg-[#e2e8f0]/90';

  const imagenesFiltradas = useMemo(() => {
    if (!estructura?.imagenes) return [];
    if (!busqueda.trim()) return estructura.imagenes;
    const terminos = busqueda.toLowerCase().split(' ').filter(Boolean);
    return estructura.imagenes.filter(img => {
      const nombreLower = img.nombreMostrar.toLowerCase();
      return terminos.some(term => nombreLower.includes(term));
    });
  }, [estructura, busqueda]);

  const imagenActiva = indiceActivo !== null ? imagenesFiltradas[indiceActivo] : null;

  const cerrarVisor = () => setIndiceActivo(null);
  const irSiguiente = (e) => {
    e.stopPropagation();
    if (indiceActivo < imagenesFiltradas.length - 1) setIndiceActivo(indiceActivo + 1);
  };
  const irAnterior = (e) => {
    e.stopPropagation();
    if (indiceActivo > 0) setIndiceActivo(indiceActivo - 1);
  };

  if (cargando) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <p className="text-[#10b981] font-black text-xl animate-pulse">🔄 Cargando galería...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-10">
        <p className="text-red-500 font-bold">Error al cargar las imágenes: {error}</p>
        <button onClick={recargar} className="mt-4 bg-[#10b981] text-black px-4 py-2 rounded-xl font-bold">Reintentar</button>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto w-full font-sans animate-fade-in relative pb-10">
      
      {/* HEADER STICKY */}
      <div className={`sticky top-0 z-40 ${bgSticky} backdrop-blur-md px-4 md:px-8 py-4 mb-6 border-b ${temaOscuro ? 'border-gray-800' : 'border-gray-200'} transition-colors duration-300`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 max-w-7xl mx-auto">
          <div>
            <h1 className={`text-3xl md:text-4xl font-black tracking-tighter ${textoColor}`}>
              Galería <span className="text-[#10b981]">Médica</span>
            </h1>
            <p className={`${textoSecundario} text-[10px] font-bold uppercase tracking-widest mt-1`}>
              Láminas anatómicas y material visual de estudio
            </p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <input 
                type="text" 
                placeholder="Buscar (ej. edema, pelvis...)" 
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className={`w-full ${bgInput} border p-3 pl-10 rounded-xl outline-none focus:border-[#10b981] transition-all text-sm ${textoColor}`}
              />
              <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <button 
              onClick={recargar} 
              className="p-3 rounded-xl bg-[#10b981]/10 text-[#10b981] hover:bg-[#10b981] hover:text-black transition-all border border-[#10b981]/20 shadow-sm" 
              title="Sincronizar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
            </button>
          </div>
        </div>
      </div>

      {/* GALERÍA EN CUADRÍCULA */}
      <div className="px-4 md:px-8">
        {imagenesFiltradas.length === 0 ? (
          <div className={`p-12 text-center rounded-3xl border ${temaOscuro ? 'bg-[#0f172a] border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
            <p className="text-gray-400">No se encontraron imágenes con esa búsqueda o la carpeta está vacía.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {imagenesFiltradas.map((img, index) => (
              <div 
                key={index}
                onClick={() => setIndiceActivo(index)}
                className={`group relative overflow-hidden rounded-2xl cursor-pointer border flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
                  temaOscuro ? 'bg-[#0f172a] border-gray-800 hover:border-[#10b981]/50' : 'bg-white border-gray-200 hover:border-[#10b981]'
                }`}
              >
                <div className={`aspect-video w-full relative overflow-hidden ${temaOscuro ? 'bg-black/30' : 'bg-gray-100'}`}>
                  <img 
                    src={img.url} 
                    alt={img.nombreMostrar} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
                
                <div className={`p-3 border-t text-center flex items-center justify-center min-h-[50px] ${temaOscuro ? 'border-gray-800 bg-[#0a141d]' : 'border-gray-100 bg-white'}`}>
                  <p className={`text-xs font-bold capitalize line-clamp-2 ${textoColor}`} title={img.nombreMostrar}>
                    {img.nombreMostrar}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =========================================
          VISOR FULLSCREEN CON PORTAL (A PRUEBA DE FALLOS)
          ========================================= */}
      {imagenActiva && createPortal(
        <div 
          className="fixed inset-0 z-[99999] bg-[#020813] flex items-center justify-center overflow-hidden"
          onClick={cerrarVisor}
        >
          {/* FONDO DESENFOCADO (Solo visible si la imagen es vertical en PC) */}
          <div 
            className="absolute inset-0 opacity-30 blur-3xl scale-110 pointer-events-none"
            style={{ backgroundImage: `url(${imagenActiva.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          />

          {/* BOTÓN CERRAR */}
          <button 
            className="absolute top-4 right-4 z-[100000] text-white bg-black/50 hover:bg-red-500 rounded-full p-3 transition-all border border-white/20 backdrop-blur-md"
            onClick={cerrarVisor}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>

          {/* FLECHA IZQUIERDA */}
          <button 
            onClick={(e) => { e.stopPropagation(); irAnterior(e); }}
            className={`absolute left-2 sm:left-4 z-[100000] p-3 rounded-full text-white bg-black/50 hover:bg-[#10b981] hover:text-black backdrop-blur-md transition-all ${indiceActivo === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
          </button>

          {/* IMAGEN: Ahora está fuera de tu app, ocupa el 100% del alto de la pantalla */}
          <img 
            src={imagenActiva.url} 
            alt={imagenActiva.nombreMostrar} 
            className="w-full h-[100dvh] object-contain relative z-[99999]"
            onClick={(e) => e.stopPropagation()} 
          />

          {/* FLECHA DERECHA */}
          <button 
            onClick={(e) => { e.stopPropagation(); irSiguiente(e); }}
            className={`absolute right-2 sm:right-4 z-[100000] p-3 rounded-full text-white bg-black/50 hover:bg-[#10b981] hover:text-black backdrop-blur-md transition-all ${indiceActivo === imagenesFiltradas.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
          </button>

          {/* TÍTULO INFERIOR */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[100000] pointer-events-none">
             <div className="bg-black/70 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 shadow-lg">
                <h3 className="text-white font-black text-sm tracking-wide capitalize text-center">
                  {imagenActiva.nombreMostrar} <span className="text-[#10b981] ml-2 text-xs">({indiceActivo + 1}/{imagenesFiltradas.length})</span>
                </h3>
             </div>
          </div>
        </div>,
        document.body // <--- ESTA ES LA MAGIA
      )}
    </main>
  );
}