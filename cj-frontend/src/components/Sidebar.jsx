import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { GlobalMusicPlayer } from './GlobalMusicPlayer';

export default function Sidebar({ temaOscuro, alClickLink }) {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  // Estados para el acordeón
  const [openAcademia, setOpenAcademia] = useState(true);
  const [openClinica, setOpenClinica] = useState(false);
  const [openGimnasio, setOpenGimnasio] = useState(false);

  const isActive = (route) => path === route || path.startsWith(route + '-');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Variables de Modo Día/Noche
  const bgSidebar = temaOscuro ? 'bg-[#0a141d]' : 'bg-white';
  const textoPrincipal = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const textoSecundario = temaOscuro ? 'text-[#94a3b8]' : 'text-gray-600';
  const bordeColor = temaOscuro ? 'border-gray-800' : 'border-gray-200';
  const hoverBg = temaOscuro ? 'hover:bg-white/5' : 'hover:bg-gray-100';

  return (
    <aside className={`${bgSidebar} border ${bordeColor} rounded-3xl p-6 h-full flex flex-col shadow-2xl overflow-y-auto custom-scrollbar transition-colors duration-500`}>
      
      {/* LOGO OFICIAL CJ */}
      <div className="mb-8 flex items-center gap-3 shrink-0">
        <img 
          src="/logos_cj_circular.png" 
          alt="Logo CJ" 
          className="w-12 h-12 rounded-full border-2 border-[#22d3ee]/30 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
          onError={(e) => e.target.style.display='none'}
        />
        <div>
          <h2 className={`${textoPrincipal} font-black text-lg tracking-widest leading-none`}>ECOSISTEMA</h2>
          <span className="text-[#22d3ee] text-[9px] font-bold uppercase tracking-[0.3em]">Gimnasio & Academia</span>
        </div>
      </div>

      <nav className="flex-1 space-y-4">
        
        {/* DASHBOARD */}
        <Link to="/" onClick={alClickLink} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${path === '/' ? 'bg-[#22d3ee]/10 text-[#22d3ee] border border-[#22d3ee]/20' : `${textoSecundario} ${hoverBg}`}`}>
          <span className="text-lg">📊</span>
          <span className="text-xs font-bold uppercase tracking-wider">Centro de Mando</span>
        </Link>

        {/* ACORDEÓN 1: ZONA ACADÉMICA */}
        <div className="space-y-1">
          <button 
            onClick={() => setOpenAcademia(!openAcademia)}
            className={`w-full flex items-center justify-between px-4 py-2 ${textoSecundario} hover:${textoPrincipal} transition-colors`}
          >
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">📚 Zona Académica</span>
            <span className={`text-[10px] transition-transform ${openAcademia ? 'rotate-180' : ''}`}>▼</span>
          </button>
          
          {openAcademia && (
            <ul className="space-y-1 pl-2 animate-fade-in">
              <li><Link to="/area-estudio" onClick={alClickLink} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase transition-all ${isActive('/area-estudio') ? 'bg-[#22d3ee]/10 text-[#22d3ee]' : `${textoSecundario} ${hoverBg}`}`}><span>🎓</span> Repositorio</Link></li>
              <li><Link to="/biblioteca" onClick={alClickLink} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase transition-all ${isActive('/biblioteca') ? 'bg-[#22d3ee]/10 text-[#22d3ee]' : `${textoSecundario} ${hoverBg}`}`}><span>📖</span> Biblioteca</Link></li>
              <li><Link to="/multimedia" onClick={alClickLink} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase transition-all ${isActive('/multimedia') ? 'bg-[#22d3ee]/10 text-[#22d3ee]' : `${textoSecundario} ${hoverBg}`}`}><span>🖼️</span> Multimedia</Link></li>
              <li><Link to="/examen-ia" onClick={alClickLink} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase transition-all ${isActive('/examen-ia') ? 'bg-[#22d3ee]/10 text-[#22d3ee]' : `${textoSecundario} ${hoverBg}`}`}><span>🧠</span> Simulador IA</Link></li>
            </ul>
          )}
        </div>

        {/* ACORDEÓN 2: PRÁCTICA CLÍNICA */}
        <div className="space-y-1">
          <button 
            onClick={() => setOpenClinica(!openClinica)}
            className={`w-full flex items-center justify-between px-4 py-2 ${textoSecundario} hover:${textoPrincipal} transition-colors`}
          >
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">🩺 Práctica Clínica</span>
            <span className={`text-[10px] transition-transform ${openClinica ? 'rotate-180' : ''}`}>▼</span>
          </button>
          
          {openClinica && (
            <ul className="space-y-1 pl-2 animate-fade-in">
              <li><Link to="/base-conocimiento" onClick={alClickLink} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase transition-all ${isActive('/base-conocimiento') ? 'bg-[#facc15]/10 text-[#facc15]' : `${textoSecundario} ${hoverBg}`}`}><span>🔮</span> Oráculo Médico</Link></li>
              <li><Link to="/patologias" onClick={alClickLink} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase transition-all ${isActive('/patologias') ? 'bg-purple-500/10 text-purple-500' : `${textoSecundario} ${hoverBg}`}`}><span>🚑</span> Patologías</Link></li>
              <li><Link to="/masoterapia" onClick={alClickLink} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase transition-all ${isActive('/masoterapia') ? 'bg-orange-500/10 text-orange-500' : `${textoSecundario} ${hoverBg}`}`}><span>💆‍♂️</span> Masoterapia</Link></li>
            </ul>
          )}
        </div>

        {/* ACORDEÓN 3: GIMNASIO TERAPÉUTICO */}
        <div className="space-y-1">
          <button 
            onClick={() => setOpenGimnasio(!openGimnasio)}
            className={`w-full flex items-center justify-between px-4 py-2 text-[#10b981] hover:${textoPrincipal} transition-colors`}
          >
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">🏋️ Gimnasio Terapéutico</span>
            <span className={`text-[10px] transition-transform ${openGimnasio ? 'rotate-180' : ''}`}>▼</span>
          </button>
          
          {openGimnasio && (
            <ul className="space-y-1 pl-2 animate-fade-in">
              <li><Link to="/fichas" onClick={alClickLink} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase transition-all ${isActive('/fichas') ? 'bg-[#10b981]/10 text-[#10b981]' : `${textoSecundario} ${hoverBg}`}`}><span>📝</span> Fichas de Ingreso</Link></li>
              <li><Link to="/expedientes" onClick={alClickLink} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase transition-all ${isActive('/expedientes') ? 'bg-[#10b981]/10 text-[#10b981]' : `${textoSecundario} ${hoverBg}`}`}><span>📁</span> Expedientes</Link></li>
            </ul>
          )}
        </div>

        {/* CONFIG AURA AI */}
        <div className={`mt-4 pt-4 border-t ${bordeColor}`}>
          <Link to="/configuracion-ia" onClick={alClickLink} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/configuracion-ia') ? 'bg-blue-500/10 text-blue-400' : `${textoSecundario} ${hoverBg}`}`}>
            <span className="text-lg">⚙️</span>
            <span className="text-xs font-bold uppercase tracking-wider">Aura AI Config</span>
          </Link>
        </div>
      </nav>

      {/* FOOTER PERSONALIZADO CON MÚSICA Y SALIDA */}
      <div className={`mt-6 pt-4 border-t ${bordeColor} flex flex-col gap-4`}>
        <GlobalMusicPlayer temaOscuro={temaOscuro} />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#22d3ee] to-[#10b981] flex items-center justify-center font-black text-[10px] text-[#020813]">JL</div>
            <div>
              <p className={`text-[11px] font-bold ${textoPrincipal} uppercase`}>Jorge Luis</p>
              <p className="text-[9px] text-[#10b981] font-black uppercase tracking-widest">Director</p>
            </div>
          </div>
          <button onClick={handleLogout} className="text-red-500 hover:text-red-400 transition-colors p-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          </button>
        </div>
      </div>
    </aside>
  );
}