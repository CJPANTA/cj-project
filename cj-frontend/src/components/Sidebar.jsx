import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { GlobalMusicPlayer } from './GlobalMusicPlayer';

export default function Sidebar({ temaOscuro, alClickLink, setTemaOscuro }) {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  const [rolUsuario, setRolUsuario] = useState(null);
  const [modoNavegacion, setModoNavegacion] = useState('academia');

  useEffect(() => {
    const rol = localStorage.getItem('cj_user_rol');
    setRolUsuario(rol ? parseInt(rol) : 2);
    if (rol === '2') setModoNavegacion('academia');
    if (rol === '3') setModoNavegacion('clinica');
  }, []);

  const isActive = (route) => path === route || path.startsWith(route + '-');
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const puedeCambiarModo = rolUsuario === 1 || rolUsuario === 4;

  const bgSidebar = temaOscuro ? 'bg-[#0a141d]' : 'bg-white';
  const textoPrincipal = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const textoSecundario = temaOscuro ? 'text-[#94a3b8]' : 'text-gray-600';
  const bordeColor = temaOscuro ? 'border-gray-800' : 'border-gray-200';
  const hoverBg = temaOscuro ? 'hover:bg-white/5' : 'hover:bg-gray-100';

  // Iconos
  const IconDashboard = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>;
  const IconRepositorio = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"/></svg>;
  const IconBiblioteca = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/></svg>;
  const IconMultimedia = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>;
  const IconSimulador = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>;
  const IconHistorial = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
  const IconOraculo = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>;
  const IconPatologias = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>;
  const IconMasoterapia = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>;
  const IconConfig = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>;
  const IconDirector = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>;

  return (
    <aside className={`${bgSidebar} border ${bordeColor} rounded-3xl p-6 h-full flex flex-col shadow-2xl overflow-y-auto custom-scrollbar transition-colors duration-500`}>
      <div className="mb-6 flex items-center gap-3 shrink-0">
        <img src="/logos_cj_circular.png" alt="Logo CJ" className="w-12 h-12 rounded-full border-2 border-[#22d3ee]/30 shadow-[0_0_15px_rgba(34,211,238,0.2)]" onError={(e) => e.target.style.display='none'} />
        <div>
          <h2 className={`${textoPrincipal} font-black text-lg tracking-widest leading-none`}>ECOSISTEMA</h2>
          <span className="text-[#22d3ee] text-[9px] font-bold uppercase tracking-[0.3em]">Gimnasio & Academia</span>
        </div>
      </div>

      {puedeCambiarModo && (
        <div className="flex gap-1 p-1 bg-black/10 rounded-xl mb-6">
          <button onClick={() => setModoNavegacion('academia')} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${modoNavegacion === 'academia' ? 'bg-[#22d3ee] text-black shadow-md' : `${textoSecundario} hover:text-white`}`}>📚 Academia</button>
          <button onClick={() => setModoNavegacion('clinica')} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${modoNavegacion === 'clinica' ? 'bg-[#10b981] text-black shadow-md' : `${textoSecundario} hover:text-white`}`}>🩺 Clínica</button>
        </div>
      )}

      <nav className="flex-1 space-y-4">
        <Link to="/" onClick={alClickLink} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${path === '/' ? 'bg-[#22d3ee]/10 text-[#22d3ee] border border-[#22d3ee]/20' : `${textoSecundario} ${hoverBg}`}`}>
          <IconDashboard /><span className="text-xs font-bold uppercase tracking-wider">Centro de Mando</span>
        </Link>

        {rolUsuario === 1 && (
          <Link to="/panel-director" onClick={alClickLink} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${path === '/panel-director' ? 'bg-[#facc15]/10 text-[#facc15] border border-[#facc15]/20' : `${textoSecundario} ${hoverBg}`}`}>
            <IconDirector /><span className="text-xs font-bold uppercase tracking-wider">Panel del Director</span>
          </Link>
        )}

        {modoNavegacion === 'academia' && (
          <div className="space-y-2">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 px-4 py-1">Zona Académica</div>
            <Link to="/area-estudio" onClick={alClickLink} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase transition-all ${isActive('/area-estudio') ? 'bg-[#22d3ee]/10 text-[#22d3ee]' : `${textoSecundario} ${hoverBg}`}`}><IconRepositorio /> Repositorio</Link>
            <Link to="/biblioteca" onClick={alClickLink} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase transition-all ${isActive('/biblioteca') ? 'bg-[#22d3ee]/10 text-[#22d3ee]' : `${textoSecundario} ${hoverBg}`}`}><IconBiblioteca /> Biblioteca</Link>
            <Link to="/multimedia" onClick={alClickLink} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase transition-all ${isActive('/multimedia') ? 'bg-[#22d3ee]/10 text-[#22d3ee]' : `${textoSecundario} ${hoverBg}`}`}><IconMultimedia /> Multimedia</Link>
            <Link to="/simulador" onClick={alClickLink} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase transition-all ${isActive('/simulador') ? 'bg-[#22d3ee]/10 text-[#22d3ee]' : `${textoSecundario} ${hoverBg}`}`}><IconSimulador /> Simulador de examen</Link>
            <Link to="/historial-examenes" onClick={alClickLink} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase transition-all ${isActive('/historial-examenes') ? 'bg-[#22d3ee]/10 text-[#22d3ee]' : `${textoSecundario} ${hoverBg}`}`}><IconHistorial /> Historial de exámenes</Link>
            <div className="border-t border-gray-700/30 my-2"></div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 px-4 py-1">Herramientas Clínicas</div>
            <Link to="/base-conocimiento" onClick={alClickLink} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase transition-all ${isActive('/base-conocimiento') ? 'bg-[#facc15]/10 text-[#facc15]' : `${textoSecundario} ${hoverBg}`}`}><IconOraculo /> Oráculo Médico</Link>
            <Link to="/patologias" onClick={alClickLink} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase transition-all ${isActive('/patologias') ? 'bg-purple-500/10 text-purple-500' : `${textoSecundario} ${hoverBg}`}`}><IconPatologias /> Patologías</Link>
            <Link to="/masoterapia" onClick={alClickLink} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase transition-all ${isActive('/masoterapia') ? 'bg-orange-500/10 text-orange-500' : `${textoSecundario} ${hoverBg}`}`}><IconMasoterapia /> Masoterapia</Link>
          </div>
        )}

        {modoNavegacion === 'clinica' && (
          <div className="space-y-2">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 px-4 py-1">Herramientas Clínicas</div>
            <Link to="/base-conocimiento" onClick={alClickLink} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase transition-all ${isActive('/base-conocimiento') ? 'bg-[#facc15]/10 text-[#facc15]' : `${textoSecundario} ${hoverBg}`}`}><IconOraculo /> Oráculo Médico</Link>
            <Link to="/patologias" onClick={alClickLink} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase transition-all ${isActive('/patologias') ? 'bg-purple-500/10 text-purple-500' : `${textoSecundario} ${hoverBg}`}`}><IconPatologias /> Patologías</Link>
            <Link to="/masoterapia" onClick={alClickLink} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase transition-all ${isActive('/masoterapia') ? 'bg-orange-500/10 text-orange-500' : `${textoSecundario} ${hoverBg}`}`}><IconMasoterapia /> Masoterapia</Link>
            <div className="border-t border-gray-700/30 my-2"></div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 px-4 py-1">Gimnasio Terapéutico</div>
            <Link to="/fichas" onClick={alClickLink} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase transition-all ${isActive('/fichas') ? 'bg-[#10b981]/10 text-[#10b981]' : `${textoSecundario} ${hoverBg}`}`}><IconPatologias /> Fichas de Ingreso</Link>
            <Link to="/expedientes" onClick={alClickLink} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase transition-all ${isActive('/expedientes') ? 'bg-[#10b981]/10 text-[#10b981]' : `${textoSecundario} ${hoverBg}`}`}><IconBiblioteca /> Expedientes</Link>
          </div>
        )}

        <div className={`mt-4 pt-4 border-t ${bordeColor}`}>
          <Link to="/configuracion-ia" onClick={alClickLink} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/configuracion-ia') ? 'bg-blue-500/10 text-blue-400' : `${textoSecundario} ${hoverBg}`}`}>
            <IconConfig /><span className="text-xs font-bold uppercase tracking-wider">Aura AI Config</span>
          </Link>
        </div>
      </nav>

      <div className={`mt-6 pt-4 border-t ${bordeColor} flex flex-col gap-4`}>
        <GlobalMusicPlayer temaOscuro={temaOscuro} />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#22d3ee] to-[#10b981] flex items-center justify-center font-black text-[10px] text-[#020813]">JL</div>
            <div>
              <p className={`text-[11px] font-bold ${textoPrincipal} uppercase`}>Jorge Luis</p>
              <p className="text-[9px] text-[#10b981] font-black uppercase tracking-widest">{rolUsuario === 1 ? 'Director' : rolUsuario === 2 ? 'Estudiante' : rolUsuario === 3 ? 'Licenciado' : rolUsuario === 4 ? 'Híbrido' : 'Paciente'}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="text-red-500 hover:text-red-400 transition-colors p-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
          </button>
        </div>
      </div>
    </aside>
  );
}