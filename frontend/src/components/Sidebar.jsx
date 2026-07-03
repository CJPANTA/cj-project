import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

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

  // Iconos básicos (solo los necesarios)
  const IconDashboard = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>;
  const IconRepositorio = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"/></svg>;
  const IconBiblioteca = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/></svg>;
  const IconCalendario = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
  const IconSimulador = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>;
  const IconHistorial = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
  const IconConfig = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>;

  return (
    <aside className={`${bgSidebar} border ${bordeColor} rounded-3xl p-6 h-full flex flex-col shadow-2xl overflow-y-auto custom-scrollbar transition-colors duration-500`}>
      <div className="mb-6 flex items-center gap-3 shrink-0">
        <img src="/logos_cj_circular.png" alt="Logo CJ" className="w-10 h-10 rounded-full border-2 border-[#22d3ee]/30" onError={(e) => e.target.style.display='none'} />
        <div>
          <h2 className={`${textoPrincipal} font-black text-lg tracking-widest leading-none`}>ECOSISTEMA</h2>
          <span className="text-[#22d3ee] text-[9px] font-bold uppercase tracking-[0.3em]">Gimnasio & Academia</span>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        <Link to="/" onClick={alClickLink} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${path === '/' ? 'bg-[#22d3ee]/10 text-[#22d3ee] border border-[#22d3ee]/20' : `${textoSecundario} ${hoverBg}`}`}>
          <IconDashboard /><span className="text-xs font-bold uppercase tracking-wider">Centro de Mando</span>
        </Link>

        <div className="space-y-2">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 px-4 py-1">Zona Académica</div>
          <Link to="/area-estudio" onClick={alClickLink} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase transition-all ${path.startsWith('/area-estudio') ? 'bg-[#22d3ee]/10 text-[#22d3ee]' : `${textoSecundario} ${hoverBg}`}`}><IconRepositorio /> Repositorio</Link>
          <Link to="/biblioteca" onClick={alClickLink} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase transition-all ${path.startsWith('/biblioteca') ? 'bg-[#22d3ee]/10 text-[#22d3ee]' : `${textoSecundario} ${hoverBg}`}`}><IconBiblioteca /> Biblioteca</Link>
          <Link to="/horario" onClick={alClickLink} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase transition-all ${path.startsWith('/horario') ? 'bg-[#22d3ee]/10 text-[#22d3ee]' : `${textoSecundario} ${hoverBg}`}`}><IconCalendario /> Horario</Link>
          <Link to="/simulador" onClick={alClickLink} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase transition-all ${path.startsWith('/simulador') ? 'bg-[#22d3ee]/10 text-[#22d3ee]' : `${textoSecundario} ${hoverBg}`}`}><IconSimulador /> Simulador</Link>
          <Link to="/historial-examenes" onClick={alClickLink} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase transition-all ${path.startsWith('/historial-examenes') ? 'bg-[#22d3ee]/10 text-[#22d3ee]' : `${textoSecundario} ${hoverBg}`}`}><IconHistorial /> Historial</Link>
        </div>

        <div className={`mt-4 pt-4 border-t ${bordeColor}`}>
          <Link to="/configuracion-ia" onClick={alClickLink} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${path.startsWith('/configuracion-ia') ? 'bg-blue-500/10 text-blue-400' : `${textoSecundario} ${hoverBg}`}`}>
            <IconConfig /><span className="text-xs font-bold uppercase tracking-wider">Aura AI Config</span>
          </Link>
        </div>
      </nav>

      <div className={`mt-6 pt-4 border-t ${bordeColor}`}>
        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-red-500 hover:text-red-400 transition-colors p-2 text-sm font-bold">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}