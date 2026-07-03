import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Sidebar({ temaOscuro, alClickLink }) {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const bgSidebar = temaOscuro ? 'bg-[#0a141d]' : 'bg-white';
  const textoPrincipal = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const textoSecundario = temaOscuro ? 'text-[#94a3b8]' : 'text-gray-600';
  const bordeColor = temaOscuro ? 'border-gray-800' : 'border-gray-200';
  const hoverBg = temaOscuro ? 'hover:bg-white/5' : 'hover:bg-gray-100';

  return (
    <aside className={`${bgSidebar} border ${bordeColor} rounded-3xl p-4 h-full flex flex-col shadow-2xl overflow-y-auto`}>
      <div className="mb-4 flex items-center gap-2 shrink-0">
        <div className="w-8 h-8 rounded-full bg-[#22d3ee] flex items-center justify-center text-black font-bold text-xs">CJ</div>
        <div>
          <h2 className={`${textoPrincipal} font-black text-sm tracking-widest leading-none`}>CJ Fisio</h2>
          <span className="text-[#22d3ee] text-[8px] font-bold uppercase tracking-[0.3em]">Academia</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        <Link to="/" onClick={alClickLink} className={`block px-3 py-2 rounded-lg text-xs font-bold uppercase transition-all ${path === '/' ? 'bg-[#22d3ee]/10 text-[#22d3ee]' : `${textoSecundario} ${hoverBg}`}`}>
          🏠 Inicio
        </Link>
        <Link to="/area-estudio" onClick={alClickLink} className={`block px-3 py-2 rounded-lg text-xs font-bold uppercase transition-all ${path.startsWith('/area-estudio') ? 'bg-[#22d3ee]/10 text-[#22d3ee]' : `${textoSecundario} ${hoverBg}`}`}>
          📚 Repositorio
        </Link>
        <Link to="/biblioteca" onClick={alClickLink} className={`block px-3 py-2 rounded-lg text-xs font-bold uppercase transition-all ${path.startsWith('/biblioteca') ? 'bg-[#22d3ee]/10 text-[#22d3ee]' : `${textoSecundario} ${hoverBg}`}`}>
          📖 Biblioteca
        </Link>
        <Link to="/horario" onClick={alClickLink} className={`block px-3 py-2 rounded-lg text-xs font-bold uppercase transition-all ${path.startsWith('/horario') ? 'bg-[#22d3ee]/10 text-[#22d3ee]' : `${textoSecundario} ${hoverBg}`}`}>
          📅 Horario
        </Link>
        <Link to="/simulador" onClick={alClickLink} className={`block px-3 py-2 rounded-lg text-xs font-bold uppercase transition-all ${path.startsWith('/simulador') ? 'bg-[#22d3ee]/10 text-[#22d3ee]' : `${textoSecundario} ${hoverBg}`}`}>
          📝 Simulador
        </Link>
        <Link to="/historial-examenes" onClick={alClickLink} className={`block px-3 py-2 rounded-lg text-xs font-bold uppercase transition-all ${path.startsWith('/historial-examenes') ? 'bg-[#22d3ee]/10 text-[#22d3ee]' : `${textoSecundario} ${hoverBg}`}`}>
          📊 Historial
        </Link>
        <Link to="/patologias" onClick={alClickLink} className={`block px-3 py-2 rounded-lg text-xs font-bold uppercase transition-all ${path.startsWith('/patologias') ? 'bg-purple-500/10 text-purple-500' : `${textoSecundario} ${hoverBg}`}`}>
          🩺 Patologías
        </Link>
        <Link to="/masoterapia" onClick={alClickLink} className={`block px-3 py-2 rounded-lg text-xs font-bold uppercase transition-all ${path.startsWith('/masoterapia') ? 'bg-orange-500/10 text-orange-500' : `${textoSecundario} ${hoverBg}`}`}>
          💆 Masoterapia
        </Link>
        <Link to="/configuracion-ia" onClick={alClickLink} className={`block px-3 py-2 rounded-lg text-xs font-bold uppercase transition-all ${path.startsWith('/configuracion-ia') ? 'bg-blue-500/10 text-blue-400' : `${textoSecundario} ${hoverBg}`}`}>
          ⚙️ Aura AI
        </Link>
      </nav>

      <div className={`mt-4 pt-3 border-t ${bordeColor}`}>
        <button onClick={handleLogout} className="w-full text-red-500 hover:text-red-400 transition-colors text-xs font-bold uppercase py-2">
          🚪 Salir
        </button>
      </div>
    </aside>
  );
}