import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <main className="bg-cj-glass backdrop-blur-md border border-white/10 rounded-3xl p-8 relative overflow-y-auto h-full shadow-2xl custom-scrollbar animate-fade-in">
      
      {/* DECORACIÓN DE FONDO - Quitamos el átomo y ponemos tu toque */}
      <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
        <div className="w-64 h-64 bg-cj-cyan rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10">
        
        {/* ENCABEZADO OPTIMIZADO PARA MÓVIL */}
        <header className="mb-10 border-b border-white/10 pb-6 flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* LOGO CIRCULAR (Principal) */}
            <div className="flex-shrink-0">
              <img 
                src="/logos_cj_circular.png" 
                alt="Logo Circular" 
                className="w-24 h-24 object-contain drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]"
              />
            </div>

            <div className="text-center md:text-left">
              <h1 className="text-4xl font-black tracking-tighter text-white mb-1">
                ECOSISTEMA <span className="text-transparent bg-clip-text bg-gradient-to-r from-cj-cyan to-cj-emerald">CJ</span>
              </h1>
              <p className="text-cj-cyan text-xs tracking-widest uppercase font-bold">
                Gestión Administrativa y Clínica
              </p>
            </div>
          </div>

          {/* LOGO RECTANGULAR (A la derecha en PC, debajo en Móvil) */}
          <div className="flex-shrink-0 bg-white/5 p-3 rounded-xl border border-white/10">
            <img 
              src="/logo_rectangular.png" 
              alt="Logo Corporativo" 
              className="h-12 w-auto object-contain"
            />
          </div>
        </header>

        {/* MÉTRICAS (Ajustadas para que no se amontonen en el celular) */}
        <section className="mb-10">
          <h2 className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-4">Estado del Sistema</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* TARJETA CON LOGO CIRCULAR EN LUGAR DE RAYO */}
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl group relative overflow-hidden">
              <div className="absolute top-2 right-2 opacity-20 group-hover:opacity-100 transition-opacity">
                 <img src="/logos_cj_circular.png" className="w-8 h-8" alt="icon" />
              </div>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Huesos Mapeados</p>
              <p className="text-4xl font-black text-white">206</p>
            </div>

            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl group relative overflow-hidden">
              <div className="absolute top-2 right-2 opacity-20 group-hover:opacity-100 transition-opacity">
                 <img src="/logos_cj_circular.png" className="w-8 h-8" alt="icon" />
              </div>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Músculos</p>
              <p className="text-4xl font-black text-white">650+</p>
            </div>

            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl group relative overflow-hidden sm:col-span-2 lg:col-span-1">
              <div className="absolute top-2 right-2 opacity-20 group-hover:opacity-100 transition-opacity">
                 <img src="/logos_cj_circular.png" className="w-8 h-8" alt="icon" />
              </div>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Patologías</p>
              <p className="text-4xl font-black text-white">124</p>
            </div>
          </div>
        </section>

        {/* ACCESOS DIRECTOS */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/ciclo-05" className="bg-gradient-to-br from-cj-cyan/20 to-transparent border border-cj-cyan/30 p-5 rounded-2xl hover:bg-cj-cyan/10 transition-all">
              <h3 className="font-bold text-white text-sm">Ciclo 05</h3>
              <p className="text-gray-400 text-[10px]">Entorno de estudio activo</p>
            </Link>
            {/* ... más botones si deseas ... */}
          </div>
        </section>
      </div>
    </main>
  );
}