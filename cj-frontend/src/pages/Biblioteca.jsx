export default function Biblioteca() {
  return (
    <main className="bg-cj-glass backdrop-blur-md border border-white/10 rounded-3xl p-8 relative overflow-y-auto h-full shadow-2xl custom-scrollbar">
      
      <header className="mb-8 border-b border-white/10 pb-4">
        <h1 className="text-3xl font-black tracking-tighter text-white">BIBLIOTECA <span className="text-cj-emerald font-light">| INTELIGENTE</span></h1>
        <p className="text-gray-400 text-sm mt-1 tracking-widest uppercase font-bold">Repositorio de Libros y Artículos (SciELO / PubMed)</p>
      </header>

      {/* Buscador de la Biblioteca */}
      <div className="mb-8 flex gap-4">
        <input 
          type="text" 
          placeholder="Buscar libro, autor o patología..." 
          className="w-full bg-[#06101c] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cj-emerald/50 transition-colors"
        />
        <button className="bg-cj-emerald/20 text-cj-emerald px-6 rounded-xl font-bold border border-cj-emerald/30 hover:bg-cj-emerald/30 transition-all">
          Buscar
        </button>
      </div>

      {/* Grid de Libros/Carpetas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Carpeta 1 */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-cj-emerald/40 hover:-translate-y-1 transition-all cursor-pointer group">
          <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📘</div>
          <h3 className="text-white font-bold text-lg mb-1">Fisioterapia en Ortopedia</h3>
          <p className="text-gray-400 text-xs">Magee • 6ta Edición</p>
          <div className="mt-4 w-full bg-cj-dark rounded-full h-1.5">
            <div className="bg-cj-emerald h-1.5 rounded-full w-[45%]"></div>
          </div>
          <p className="text-[10px] text-right text-cj-emerald mt-1">45% Leído</p>
        </div>

        {/* Carpeta 2 */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-cj-emerald/40 hover:-translate-y-1 transition-all cursor-pointer group">
          <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📗</div>
          <h3 className="text-white font-bold text-lg mb-1">Agentes Físicos Clínicos</h3>
          <p className="text-gray-400 text-xs">Cameron • 4ta Edición</p>
          <div className="mt-4 w-full bg-cj-dark rounded-full h-1.5">
            <div className="bg-cj-emerald h-1.5 rounded-full w-[80%]"></div>
          </div>
          <p className="text-[10px] text-right text-cj-emerald mt-1">80% Leído</p>
        </div>

        {/* Carpeta 3 (Artículos) */}
        <div className="bg-cj-emerald/5 border border-cj-emerald/20 rounded-2xl p-6 hover:bg-cj-emerald/10 transition-all cursor-pointer group">
          <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📄</div>
          <h3 className="text-cj-emerald font-bold text-lg mb-1">Artículos SciELO</h3>
          <p className="text-gray-400 text-xs">Evidencia científica y papers.</p>
          <p className="text-xs font-bold text-cj-emerald mt-4 border-t border-cj-emerald/20 pt-2">Ver 12 guardados ↗</p>
        </div>
      </div>
    </main>
  );
}