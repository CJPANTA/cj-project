import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Sidebar() {
  // Memoria central para todos los acordeones
  const [menus, setMenus] = useState({
    carrion: false,
    conocimiento: false,
    practica: false,
    sistema: false
  });

  const toggleMenu = (menu) => {
    setMenus({ ...menus, [menu]: !menus[menu] });
  };

  // AQUÍ ESTÁ EL LOGO: Puse uno de prueba directamente de los servidores de GitHub.
  // Solo tienes que borrar este link entre las comillas y pegar el tuyo (raw.github...).
  const logoGitHubUrl = "https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/react/react.png"; 

  return (
    <aside className="bg-cj-glass backdrop-blur-md border border-white/10 rounded-3xl p-6 flex flex-col h-full shadow-xl overflow-y-auto custom-scrollbar">
      
      {/* SECCIÓN 1: Identidad y Logo */}
      <div className="mb-8 border-b border-white/10 pb-6 text-center">
        {logoGitHubUrl ? (
          <img src={logoGitHubUrl} alt="Logo Ecosistema" className="w-20 h-20 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)] object-contain" />
        ) : (
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-cj-cyan/20 to-cj-dark rounded-full border-2 border-cj-cyan/50 flex items-center justify-center mb-4">
            <span className="text-cj-cyan font-black text-3xl font-mono">CJ</span>
          </div>
        )}
        <h2 className="text-xl font-bold text-white tracking-tight">Ecosistema Clínico</h2>
        <p className="text-[10px] text-cj-emerald tracking-widest uppercase mt-1 font-bold">Admin: J. Chiroque</p>
      </div>
      
      <div className="space-y-4 flex-1">
        
        {/* Principal (Fijo) */}
        <Link to="/" className="w-full text-left p-3 rounded-xl hover:bg-white/5 transition-all text-sm flex items-center gap-3 text-gray-300 hover:text-cj-cyan">
          <span>🏠</span> INICIO (Dashboard)
        </Link>

        {/* 1. Repositorio Carrión (Acordeón) */}
        <div>
          <button onClick={() => toggleMenu('carrion')} className="w-full text-left p-3 rounded-xl hover:bg-white/5 transition-all text-sm flex items-center justify-between text-gray-300 hover:text-cj-cyan">
            <div className="flex items-center gap-3"><span>🎓</span> Repositorio Carrión</div>
            <span className={`text-xs transition-transform duration-300 ${menus.carrion ? 'rotate-180' : ''}`}>▼</span>
          </button>
          {menus.carrion && (
            <div className="grid grid-cols-2 gap-2 mt-2 px-2 animate-fade-in">
              {[1, 2, 3, 4, 5, 6].map((c) => (
                <Link key={c} to={`/ciclo-0${c}`} className="p-2 rounded-lg bg-white/5 hover:bg-cj-cyan/10 border border-white/5 hover:border-cj-cyan/30 text-xs text-gray-400 hover:text-cj-cyan text-center">
                  Ciclo 0{c}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* 2. Conocimiento (Acordeón) */}
        <div>
          <button onClick={() => toggleMenu('conocimiento')} className="w-full text-left p-3 rounded-xl hover:bg-white/5 transition-all text-sm flex items-center justify-between text-gray-300 hover:text-cj-cyan">
            <div className="flex items-center gap-3"><span>🧠</span> Base de Conocimiento</div>
            <span className={`text-xs transition-transform duration-300 ${menus.conocimiento ? 'rotate-180' : ''}`}>▼</span>
          </button>
          {menus.conocimiento && (
            <div className="space-y-1 mt-2 px-2 animate-fade-in">
              <Link to="/biblioteca" className="block w-full p-2 rounded-lg hover:bg-white/5 text-sm text-gray-400 hover:text-white">📚 Biblioteca</Link>
              <Link to="/diccionario" className="block w-full p-2 rounded-lg hover:bg-white/5 text-sm text-gray-400 hover:text-white">📖 Diccionario</Link>
              <Link to="/multimedia" className="block w-full p-2 rounded-lg hover:bg-white/5 text-sm text-gray-400 hover:text-white">🎬 Multimedia</Link>
              <Link to="/examen" className="block w-full p-2 rounded-lg hover:bg-cj-cyan/10 text-sm text-cj-cyan font-bold">🎯 Modo Examen</Link>
            </div>
          )}
        </div>

        {/* 3. Práctica Clínica (Acordeón) */}
        <div>
          <button onClick={() => toggleMenu('practica')} className="w-full text-left p-3 rounded-xl hover:bg-white/5 transition-all text-sm flex items-center justify-between text-gray-300 hover:text-cj-cyan">
            <div className="flex items-center gap-3"><span>⚕️</span> Práctica Clínica</div>
            <span className={`text-xs transition-transform duration-300 ${menus.practica ? 'rotate-180' : ''}`}>▼</span>
          </button>
          {menus.practica && (
            <div className="space-y-1 mt-2 px-2 animate-fade-in">
              <Link to="/patologias" className="block w-full p-2 rounded-lg hover:bg-white/5 text-sm text-gray-400 hover:text-white">🦠 Patologías</Link>
              <Link to="/masoterapia" className="block w-full p-2 rounded-lg hover:bg-white/5 text-sm text-gray-400 hover:text-white">🤲 Masoterapia</Link>
              <Link to="/fichas" className="block w-full p-2 rounded-lg hover:bg-white/5 text-sm text-gray-400 hover:text-white">📋 Ficha Clínica</Link>
              <Link to="/expedientes" className="block w-full p-2 rounded-lg hover:bg-white/5 text-sm text-gray-400 hover:text-white">🗂️ Expedientes</Link>
            </div>
          )}
        </div>

        {/* 4. Sistema (Acordeón) */}
        <div>
          <button onClick={() => toggleMenu('sistema')} className="w-full text-left p-3 rounded-xl hover:bg-red-500/10 transition-all text-sm flex items-center justify-between text-red-400 hover:text-red-300">
            <div className="flex items-center gap-3"><span>⚙️</span> Sistema</div>
            <span className={`text-xs transition-transform duration-300 ${menus.sistema ? 'rotate-180' : ''}`}>▼</span>
          </button>
          {menus.sistema && (
            <div className="space-y-1 mt-2 px-2 animate-fade-in">
              <Link to="/admin" className="block w-full p-2 rounded-lg hover:bg-red-500/10 text-sm text-red-400">Gestión de Usuarios</Link>
            </div>
          )}
        </div>

      </div>
    </aside>
  );
}