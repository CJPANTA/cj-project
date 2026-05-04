export default function FichaClinica() {
  return (
    <main className="bg-cj-glass backdrop-blur-md border border-white/10 rounded-3xl p-8 relative overflow-y-auto h-full shadow-2xl custom-scrollbar">
      
      <header className="mb-8 border-b border-white/10 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-white">FICHA CLÍNICA <span className="text-orange-400 font-light">| DIGITAL</span></h1>
          <p className="text-gray-400 text-sm mt-1 tracking-widest uppercase font-bold">Registro de Anamnesis y Evolución</p>
        </div>
        <button className="bg-orange-500/20 text-orange-400 px-4 py-2 rounded-xl text-sm font-bold border border-orange-500/30 hover:bg-orange-500/30 transition-colors">
          + Nuevo Paciente
        </button>
      </header>

      {/* Grid del Formulario de Historia Clínica */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Panel Izquierdo: Anamnesis */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-orange-400 text-sm font-bold uppercase tracking-widest mb-4 border-b border-orange-400/20 pb-2">1. Filiación y Anamnesis</h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Nombre del Paciente</label>
              <input type="text" className="w-full bg-[#06101c] border border-white/10 rounded-lg px-3 py-2 text-white text-sm mt-1 focus:outline-none focus:border-orange-400/50" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Edad</label>
                <input type="number" className="w-full bg-[#06101c] border border-white/10 rounded-lg px-3 py-2 text-white text-sm mt-1 focus:outline-none focus:border-orange-400/50" />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Ocupación</label>
                <input type="text" className="w-full bg-[#06101c] border border-white/10 rounded-lg px-3 py-2 text-white text-sm mt-1 focus:outline-none focus:border-orange-400/50" />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Motivo de Consulta (Enfermedad Actual)</label>
              <textarea rows="3" className="w-full bg-[#06101c] border border-white/10 rounded-lg px-3 py-2 text-white text-sm mt-1 focus:outline-none focus:border-orange-400/50 resize-none"></textarea>
            </div>
          </div>
        </div>

        {/* Panel Derecho: Mapa de Dolor / Evaluación */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Human_body_silhouette.svg/512px-Human_body_silhouette.svg.png')] bg-no-repeat bg-center bg-contain opacity-10"></div>
          
          <div className="z-10 text-center">
            <p className="text-gray-400 text-sm mb-4">El BodyChart interactivo se conectará en la Fase 3.</p>
            <div className="inline-block bg-orange-500/10 border border-orange-500/30 text-orange-400 rounded-lg px-4 py-2 text-xs font-mono">
              Esperando integración de Base de Datos...
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}