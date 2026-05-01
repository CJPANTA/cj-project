import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <main className="bg-cj-glass backdrop-blur-md border border-white/10 rounded-3xl p-8 relative overflow-y-auto h-full shadow-2xl animate-fade-in">
      
      <div className="relative z-10">
        {/* ENCABEZADO CORREGIDO: LOGO RECTANGULAR A LA IZQUIERDA */}
        <header className="mb-10 border-b border-white/10 pb-6 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-shrink-0">
            <img src="/logo_rectangular.png" alt="Logo CJ" className="h-16 w-auto object-contain" />
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-black tracking-tighter text-white">ECOSISTEMA <span className="text-cj-cyan">CJ</span></h1>
            <p className="text-gray-400 text-xs tracking-widest uppercase font-bold">Panel de Control Administrativo y Clínico</p>
          </div>
        </header>

        {/* ESTADO DEL SISTEMA (Basado en tu lógica de Streamlit) */}
        <section className="mb-10">
          <h2 className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-4">Estado de la Base de Datos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="bg-[#06101c]/60 border border-cj-cyan/20 p-6 rounded-2xl relative overflow-hidden group">
               <img src="/logos_cj_circular.png" className="absolute top-2 right-2 w-8 h-8 opacity-10 group-hover:opacity-40 transition-opacity" alt="sello" />
               <p className="text-gray-400 text-[10px] uppercase font-bold mb-1">Repositorio GitHub</p>
               <p className="text-2xl font-bold text-white">Conectado ✅</p>
            </div>
            {/* Espacio reservado para el Oráculo que mencionas */}
            <div className="bg-[#06101c]/60 border border-cj-emerald/20 p-6 rounded-2xl relative overflow-hidden group">
               <img src="/logos_cj_circular.png" className="absolute top-2 right-2 w-8 h-8 opacity-10 group-hover:opacity-40 transition-opacity" alt="sello" />
               <p className="text-gray-400 text-[10px] uppercase font-bold mb-1">Modo Aura / Oráculo</p>
               <p className="text-2xl font-bold text-white">Stand-by 🤖</p>
            </div>
          </div>
        </section>

        {/* ACCESOS RÁPIDOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <Link to="/ciclo-05" className="p-8 rounded-3xl bg-gradient-to-br from-cj-cyan/10 to-transparent border border-cj-cyan/30 hover:border-cj-cyan transition-all">
              <h3 className="text-2xl font-bold text-white">Área de Estudio Activa</h3>
              <p className="text-gray-400 text-sm">Ciclo 05 - Ingresar a materiales y apuntes de hoy.</p>
           </Link>
           <Link to="/biblioteca" className="p-8 rounded-3xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/30 hover:border-purple-400 transition-all">
              <h3 className="text-2xl font-bold text-white">Repositorio Carrión</h3>
              <p className="text-gray-400 text-sm">Explora ciclos previos y documentos PDF.</p>
           </Link>
        </div>
      </div>
    </main>
  );
}