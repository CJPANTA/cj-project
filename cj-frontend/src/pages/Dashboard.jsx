import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <main className="bg-cj-glass backdrop-blur-md border border-white/10 rounded-3xl p-8 relative overflow-y-auto h-full shadow-2xl custom-scrollbar animate-fade-in">
      
      {/* DECORACIÓN DE FONDO */}
      <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
        <div className="w-64 h-64 bg-cj-cyan rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10">
        
        {/* ENCABEZADO: LOGO CIRCULAR IZQUIERDA - LOGO RECTANGULAR DERECHA */}
        <header className="mb-10 border-b border-white/10 pb-6 flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* LOGO CIRCULAR PRINCIPAL */}
            <div className="flex-shrink-0">
              <img 
                src="/logos_cj_circular.png" 
                alt="Logo Circular CJ" 
                className="w-24 h-24 object-contain drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]"
              />
            </div>

            <div className="text-center md:text-left">
              <h1 className="text-4xl font-black tracking-tighter text-white mb-1">
                ECOSISTEMA <span className="text-transparent bg-clip-text bg-gradient-to-r from-cj-cyan to-cj-emerald">CJ</span>
              </h1>
              <p className="text-cj-cyan text-[10px] tracking-[0.2em] uppercase font-bold">
                Gestión Administrativa y Clínica
              </p>
            </div>
          </div>

          {/* REEMPLAZO DEL ÁTOMO POR LOGO RECTANGULAR (Lado Derecho) */}
          <div className="flex-shrink-0">
            <img 
              src="/logo_rectangular.png" 
              alt="Logo Corporativo" 
              className="h-14 w-auto object-contain drop-shadow-md"
            />
          </div>
        </header>

        {/* MÉTRICAS: TODAS CON TU LOGO CIRCULAR (Adiós al rayo) */}
        <section className="mb-10">
          <h2 className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-4">Métricas del Sistema</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Tarjeta 1 */}
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl group relative overflow-hidden transition-all hover:border-cj-cyan/40">
              <div className="absolute top-2 right-2 opacity-10 group-hover:opacity-30 transition-opacity">
                 <img src="/logos_cj_circular.png" className="w-12 h-12" alt="icon" />
              </div>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Huesos Mapeados</p>
              <p className="text-5xl font-black text-white group-hover:text-cj-cyan transition-colors">206</p>
            </div>

            {/* Tarjeta 2 */}
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl group relative overflow-hidden transition-all hover:border-cj-emerald/40">
              <div className="absolute top-2 right-2 opacity-10 group-hover:opacity-30 transition-opacity">
                 <img src="/logos_cj_circular.png" className="w-12 h-12" alt="icon" />
              </div>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Músculos</p>
              <p className="text-5xl font-black text-white group-hover:text-cj-emerald transition-colors">650<span className="text-xl text-gray-500">+</span></p>
            </div>

            {/* Tarjeta 3 */}
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl group relative overflow-hidden transition-all hover:border-purple-500/40 lg:col-span-1 sm:col-span-2">
              <div className="absolute top-2 right-2 opacity-10 group-hover:opacity-30 transition-opacity">
                 <img src="/logos_cj_circular.png" className="w-12 h-12" alt="icon" />
              </div>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Patologías</p>
              <p className="text-5xl font-black text-white group-hover:text-purple-400 transition-colors">124</p>
            </div>
          </div>
        </section>

        {/* ACCESOS DIRECTOS (Zona Roja/Colorida Recuperada) */}
        <section>
          <h2 className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-4">Módulos Principales</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <Link to="/ciclo-05" className="group bg-gradient-to-br from-cj-cyan/20 to-transparent border border-cj-cyan/30 p-6 rounded-2xl hover:border-cj-cyan transition-all flex flex-col justify-between h-40">
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-cj-cyan transition-colors">Ciclo 05</h3>
                <p className="text-gray-400 text-xs mt-1">Acceso a material académico actual.</p>
              </div>
              <span className="text-cj-cyan font-bold text-sm">Entrar →</span>
            </Link>

            <Link to="/fichas" className="group bg-gradient-to-br from-cj-emerald/20 to-transparent border border-cj-emerald/30 p-6 rounded-2xl hover:border-cj-emerald transition-all flex flex-col justify-between h-40">
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-cj-emerald transition-colors">Fichas Clínicas</h3>
                <p className="text-gray-400 text-xs mt-1">Gestión de pacientes y evolución.</p>
              </div>
              <span className="text-cj-emerald font-bold text-sm">Gestionar →</span>
            </Link>

            <Link to="/biblioteca" className="group bg-gradient-to-br from-purple-500/20 to-transparent border border-purple-500/30 p-6 rounded-2xl hover:border-purple-400 transition-all flex flex-col justify-between h-40">
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">Biblioteca</h3>
                <p className="text-gray-400 text-xs mt-1">Repositorio de documentos y guías.</p>
              </div>
              <span className="text-purple-400 font-bold text-sm">Explorar →</span>
            </Link>

          </div>
        </section>

      </div>
    </main>
  );
}