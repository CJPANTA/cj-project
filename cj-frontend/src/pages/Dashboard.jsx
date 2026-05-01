import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <main className="bg-cj-glass backdrop-blur-md border border-white/10 rounded-3xl p-8 relative overflow-y-auto h-full shadow-2xl animate-fade-in">
      <div className="relative z-10">
        {/* ENCABEZADO SEGÚN BOCETO */}
        <header className="mb-10 border-b border-white/10 pb-6 flex justify-between items-center">
          <img src="/logo_rectangular.png" alt="Logo CJ" className="h-14 w-auto" />
          <div className="text-right">
             <h1 className="text-2xl font-black text-white leading-none">ECOSISTEMA <span className="text-cj-cyan">CJ</span></h1>
             <p className="text-gray-500 text-[10px] uppercase tracking-widest">Oráculo Clínico</p>
          </div>
          <img src="/logos_cj_circular.png" alt="Sello CJ" className="h-16 w-auto" />
        </header>

        {/* CUERPO DEL DASHBOARD: 6 BLOQUES REALES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* GRUPO 1: ANATOMÍA Y CLÍNICA */}
          <section className="space-y-4">
            <h2 className="text-cj-cyan text-xs font-bold uppercase tracking-widest px-2">Anatomía y Patología</h2>
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-[#06101c]/80 border border-white/10 p-4 rounded-xl hover:border-cj-cyan/50 transition-all">
                <p className="text-white font-bold">Bases Óseas</p>
                <p className="text-gray-500 text-xs">Mapeo estructural completo.</p>
              </div>
              <div className="bg-[#06101c]/80 border border-white/10 p-4 rounded-xl hover:border-cj-emerald/50 transition-all">
                <p className="text-white font-bold">Atlas Muscular</p>
                <p className="text-gray-500 text-xs">Sistema muscular detallado.</p>
              </div>
              <div className="bg-[#06101c]/80 border border-white/10 p-4 rounded-xl hover:border-red-500/50 transition-all">
                <p className="text-white font-bold">Patologías</p>
                <p className="text-gray-400 text-xs">Base de conocimientos clínicos.</p>
              </div>
            </div>
          </section>

          {/* GRUPO 2: BIBLIOTECA Y CIENCIA */}
          <section className="space-y-4">
            <h2 className="text-purple-400 text-xs font-bold uppercase tracking-widest px-2">Investigación</h2>
            <div className="grid grid-cols-1 gap-3">
              <Link to="/biblioteca" className="bg-[#06101c]/80 border border-white/10 p-4 rounded-xl hover:border-purple-400 transition-all block">
                <p className="text-white font-bold">Biblioteca</p>
                <p className="text-gray-500 text-xs">Repositorio de archivos generales.</p>
              </Link>
              <div className="bg-[#06101c]/80 border border-white/10 p-4 rounded-xl hover:border-cj-cyan/50 transition-all">
                <p className="text-white font-bold">Conceptos Técnicos</p>
                <p className="text-gray-500 text-xs">Glosario y fundamentos.</p>
              </div>
              <div className="bg-[#06101c]/80 border border-white/10 p-4 rounded-xl hover:border-cj-emerald/50 transition-all">
                <p className="text-white font-bold">Evidencia Científica</p>
                <p className="text-gray-500 text-xs">Artículos y PubMed.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}