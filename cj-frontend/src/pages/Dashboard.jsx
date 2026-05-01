import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <main className="bg-cj-glass backdrop-blur-md border border-white/10 rounded-3xl p-8 relative overflow-y-auto h-full shadow-2xl custom-scrollbar animate-fade-in">
      
      {/* DECORACIÓN DE FONDO */}
      <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
        <div className="w-64 h-64 bg-cj-cyan rounded-full blur-[120px]"></div>
      </div>
      <div className="absolute bottom-0 left-0 p-8 opacity-10 pointer-events-none">
        <div className="w-64 h-64 bg-cj-emerald rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10">
        
        {/* ENCABEZADO Y BIENVENIDA CON LOGO */}
        <header className="mb-10 border-b border-white/10 pb-6 flex flex-col md:flex-row items-center md:items-start gap-6">
          
          {/* 👇 AQUÍ ESTÁ TU LOGO 👇 */}
          <div className="flex-shrink-0">
            <img 
              src="/logos_cj_circular.png" 
              alt="Logo Ecosistema CJ" 
              className="w-28 h-28 object-contain drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]"
            />
          </div>

          <div>
            <h1 className="text-4xl font-black tracking-tighter text-white mb-2 text-center md:text-left">
              ECOSISTEMA <span className="text-transparent bg-clip-text bg-gradient-to-r from-cj-cyan to-cj-emerald">CJ</span>
            </h1>
            <p className="text-gray-400 text-sm tracking-widest uppercase font-bold mb-4 text-center md:text-left">
              Panel de Control Administrativo
            </p>
            <div className="bg-[#06101c]/80 border border-cj-cyan/30 p-4 rounded-xl inline-block shadow-[0_0_15px_rgba(34,211,238,0.1)]">
              <p className="text-cj-cyan text-sm">
                👋 Bienvenido, <span className="font-bold text-white">Lic. Adm. Jorge Luis Chiroque Panta</span>. El sistema está 100% operativo.
              </p>
            </div>
          </div>
        </header>

        {/* TARJETAS DE ESTADÍSTICAS */}
        <section className="mb-10">
          <h2 className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-4">Métricas Globales</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:border-cj-cyan/50 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-cj-cyan/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150"></div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Total Huesos Mapeados</p>
              <p className="text-5xl font-black text-white group-hover:text-cj-cyan transition-colors">206</p>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:border-cj-emerald/50 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-cj-emerald/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150"></div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Músculos Registrados</p>
              <p className="text-5xl font-black text-white group-hover:text-cj-emerald transition-colors">650<span className="text-xl text-gray-500 font-light">+</span></p>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:border-purple-500/50 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150"></div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Patologías en Base</p>
              <p className="text-5xl font-black text-white group-hover:text-purple-400 transition-colors">124</p>
            </div>

          </div>
        </section>

        {/* ACCESOS DIRECTOS */}
        <section>
          <h2 className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-4">Accesos Rápidos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <Link to="/ciclo-05" className="bg-gradient-to-br from-cj-cyan/20 to-transparent border border-cj-cyan/30 p-6 rounded-2xl hover:border-cj-cyan group transition-all flex flex-col justify-between h-48">
              <div>
                <span className="text-3xl mb-3 block">🎯</span>
                <h3 className="text-lg font-bold text-white group-hover:text-cj-cyan transition-colors">Ciclo 05 (Actual)</h3>
                <p className="text-gray-400 text-xs mt-2">Área de trabajo activa. Evaluaciones y nuevos apuntes.</p>
              </div>
              <div className="text-right">
                <span className="text-cj-cyan text-sm font-bold group-hover:pr-2 transition-all">Ingresar →</span>
              </div>
            </Link>

            <Link to="/fichas" className="bg-gradient-to-br from-cj-emerald/20 to-transparent border border-cj-emerald/30 p-6 rounded-2xl hover:border-cj-emerald group transition-all flex flex-col justify-between h-48">
              <div>
                <span className="text-3xl mb-3 block">📋</span>
                <h3 className="text-lg font-bold text-white group-hover:text-cj-emerald transition-colors">Ficha Clínica Inteligente</h3>
                <p className="text-gray-400 text-xs mt-2">Modo Aura activado. Evolución dinámica del paciente y cálculo de EVA.</p>
              </div>
              <div className="text-right">
                <span className="text-cj-emerald text-sm font-bold group-hover:pr-2 transition-all">Nueva Ficha →</span>
              </div>
            </Link>

            <Link to="/ciclo-01" className="bg-gradient-to-br from-purple-500/20 to-transparent border border-purple-500/30 p-6 rounded-2xl hover:border-purple-400 group transition-all flex flex-col justify-between h-48">
              <div>
                <span className="text-3xl mb-3 block">📚</span>
                <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">Repositorio Carrión</h3>
                <p className="text-gray-400 text-xs mt-2">Explorador de archivos PDF y material de ciclos pasados.</p>
              </div>
              <div className="text-right">
                <span className="text-purple-400 text-sm font-bold group-hover:pr-2 transition-all">Explorar →</span>
              </div>
            </Link>

          </div>
        </section>

      </div>
    </main>
  );
}