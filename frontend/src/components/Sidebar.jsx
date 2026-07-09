import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { GlobalMusicPlayer } from './GlobalMusicPlayer';

export default function Sidebar({ temaOscuro, alClickLink }) {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  const [rolUsuario, setRolUsuario] = useState(null);
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [centroId, setCentroId] = useState(null);
  const [modoNavegacion, setModoNavegacion] = useState('academia');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: perfil } = await supabase
            .from('profiles')
            .select('rol, nombre_completo, centro_id')
            .eq('id', user.id)
            .single();
          if (perfil) {
            setRolUsuario(perfil.rol);
            setNombreUsuario(perfil.nombre_completo || 'Usuario');
            setCentroId(perfil.centro_id || null);
            // Forzar modo clínica para ciertos roles, pero Director ve todo
            if (perfil.rol === 3 || perfil.rol === 5 || perfil.rol === 6 || perfil.rol === 7) {
              setModoNavegacion('clinica');
            } else if (perfil.rol === 2) {
              setModoNavegacion('academia');
            } else {
              setModoNavegacion('academia');
            }
          }
        } else {
          // Si no hay usuario, intentar leer del localStorage
          const rolGuardado = localStorage.getItem('cj_user_rol');
          if (rolGuardado) {
            setRolUsuario(parseInt(rolGuardado));
            setNombreUsuario(localStorage.getItem('cj_user_name') || 'Usuario');
          }
        }
      } catch (error) {
        console.error('Error cargando perfil:', error);
        // Fallback: intentar leer del localStorage
        const rolGuardado = localStorage.getItem('cj_user_rol');
        if (rolGuardado) {
          setRolUsuario(parseInt(rolGuardado));
          setNombreUsuario(localStorage.getItem('cj_user_name') || 'Usuario');
        }
      } finally {
        setCargando(false);
      }
    };
    cargarPerfil();
  }, []);

  const isActive = (route) => path === route || path.startsWith(route + '-');
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Director (rol 1) siempre puede cambiar de modo y ve todo
  const esDirector = rolUsuario === 1;
  const puedeCambiarModo = esDirector || rolUsuario === 4;
  const soloClinica = rolUsuario === 3 || rolUsuario === 5 || rolUsuario === 6 || rolUsuario === 7;
  const soloAcademia = rolUsuario === 2;

  const bgSidebar = temaOscuro ? 'bg-[#0a141d]/95 backdrop-blur-sm' : 'bg-white/95 backdrop-blur-sm';
  const textoPrincipal = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const textoSecundario = temaOscuro ? 'text-[#94a3b8]' : 'text-gray-600';
  const bordeColor = temaOscuro ? 'border-gray-800' : 'border-gray-200';
  const hoverBg = temaOscuro ? 'hover:bg-white/10' : 'hover:bg-gray-100/80';

  // Iconos (todos los necesarios)
  const IconDashboard = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>;
  const IconRepositorio = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"/></svg>;
  const IconBiblioteca = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/></svg>;
  const IconCalendario = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
  const IconSimulador = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>;
  const IconHistorial = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
  const IconPatologias = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>;
  const IconMasoterapia = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>;
  const IconConfig = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>;
  const IconDirector = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>;
  const IconPacientes = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/></svg>;

  const getRolLabel = (rol) => {
    if (rol === 1) return 'Director';
    if (rol === 2) return 'Estudiante';
    if (rol === 3) return 'Licenciado';
    if (rol === 4) return 'Híbrido';
    if (rol === 5) return 'Paciente';
    if (rol === 6) return 'Demo';
    if (rol === 7) return 'Admin Centro';
    return 'Usuario';
  };

  // Si aún está cargando, mostrar un placeholder
  if (cargando) {
    return (
      <aside className={`${bgSidebar} border-r ${bordeColor} rounded-3xl p-5 h-full flex flex-col shadow-2xl overflow-y-auto custom-scrollbar transition-colors duration-500`}>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#22d3ee] border-t-transparent"></div>
        </div>
      </aside>
    );
  }

  // Si el usuario es Paciente (5), mostramos vista muy limitada
  if (rolUsuario === 5) {
    return (
      <aside className={`${bgSidebar} border-r ${bordeColor} rounded-3xl p-5 h-full flex flex-col shadow-2xl overflow-y-auto custom-scrollbar transition-colors duration-500`}>
        <div className="mb-6 flex items-center gap-3 shrink-0">
          <img src="/logos_cj_circular.png" alt="Logo CJ" className="w-12 h-12 rounded-full border-2 border-[#22d3ee]/30" />
          <div>
            <h2 className={`${textoPrincipal} font-black text-xl tracking-wider leading-none`}>CJ Fisio</h2>
            <span className="text-[#22d3ee] text-[8px] font-black uppercase tracking-[0.4em]">Mi espacio</span>
          </div>
        </div>
        <nav className="flex-1 space-y-1">
          <Link to="/" onClick={alClickLink} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${path === '/' ? 'bg-[#22d3ee]/10 text-[#22d3ee]' : `${textoSecundario} ${hoverBg}`}`}>
            <IconDashboard /><span className="text-xs font-bold uppercase tracking-wider">Mi Ficha</span>
          </Link>
          <Link to="/clinica/pacientes" onClick={alClickLink} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${path.startsWith('/clinica/pacientes') ? 'bg-[#22d3ee]/10 text-[#22d3ee]' : `${textoSecundario} ${hoverBg}`}`}>
            <IconPacientes /><span className="text-xs font-bold uppercase tracking-wider">Mis Citas</span>
          </Link>
        </nav>
        <div className={`mt-4 pt-4 border-t ${bordeColor}`}>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-red-500 hover:text-red-400 transition-colors p-2 text-sm font-bold">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            Cerrar sesión
          </button>
        </div>
      </aside>
    );
  }

  // Sidebar normal para los demás roles
  return (
    <aside className={`${bgSidebar} border-r ${bordeColor} rounded-3xl p-5 h-full flex flex-col shadow-2xl overflow-y-auto custom-scrollbar transition-colors duration-500`}>
      <div className="mb-6 flex items-center gap-3 shrink-0">
        <img src="/logos_cj_circular.png" alt="Logo CJ" className="w-12 h-12 rounded-full border-2 border-[#22d3ee]/30" />
        <div>
          <h2 className={`${textoPrincipal} font-black text-xl tracking-wider leading-none`}>CJ Fisio</h2>
          <span className="text-[#22d3ee] text-[8px] font-black uppercase tracking-[0.4em]">Ecosistema de Salud</span>
        </div>
      </div>

      {/* Selector de Modo solo para Director o Híbrido */}
      {puedeCambiarModo && (
        <div className="flex gap-1 p-1 bg-black/10 dark:bg-white/5 rounded-xl mb-6 border border-[#22d3ee]/10">
          <button 
            onClick={() => setModoNavegacion('academia')} 
            className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${modoNavegacion === 'academia' ? 'bg-[#22d3ee] text-black shadow-md' : `${textoSecundario} hover:text-white`}`}
          >
            📚 Academia
          </button>
          <button 
            onClick={() => setModoNavegacion('clinica')} 
            className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${modoNavegacion === 'clinica' ? 'bg-[#10b981] text-black shadow-md' : `${textoSecundario} hover:text-white`}`}
          >
            🩺 Clínica
          </button>
        </div>
      )}

      <nav className="flex-1 space-y-1">
        <Link to="/" onClick={alClickLink} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${path === '/' ? 'bg-[#22d3ee]/10 text-[#22d3ee]' : `${textoSecundario} ${hoverBg}`}`}>
          <IconDashboard /><span className="text-xs font-bold uppercase tracking-wider">Centro de Mando</span>
        </Link>

        {/* Panel del Director: solo visible para Director (rol 1) */}
        {rolUsuario === 1 && (
          <Link to="/panel-director" onClick={alClickLink} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${path === '/panel-director' ? 'bg-[#facc15]/10 text-[#facc15]' : `${textoSecundario} ${hoverBg}`}`}>
            <IconDirector /><span className="text-xs font-bold uppercase tracking-wider">Panel del Director</span>
          </Link>
        )}

        {/* MODO ACADEMIA: visible para Director, Estudiante, Híbrido (si no está en soloClínica) */}
        {!soloClinica && (modoNavegacion === 'academia' || soloAcademia || esDirector) && (
          <div className="space-y-1 mt-2">
            <div className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-500 px-4 py-1">Academia</div>
            <Link to="/area-estudio" onClick={alClickLink} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase transition-all ${path.startsWith('/area-estudio') || path.startsWith('/ciclo') ? 'bg-[#22d3ee]/10 text-[#22d3ee]' : `${textoSecundario} ${hoverBg}`}`}><IconRepositorio /> Repositorio</Link>
            <Link to="/biblioteca" onClick={alClickLink} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase transition-all ${path.startsWith('/biblioteca') ? 'bg-[#22d3ee]/10 text-[#22d3ee]' : `${textoSecundario} ${hoverBg}`}`}><IconBiblioteca /> Biblioteca</Link>
            <Link to="/horario" onClick={alClickLink} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase transition-all ${path.startsWith('/horario') ? 'bg-[#22d3ee]/10 text-[#22d3ee]' : `${textoSecundario} ${hoverBg}`}`}><IconCalendario /> Horario</Link>
            <Link to="/simulador" onClick={alClickLink} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase transition-all ${path.startsWith('/simulador') ? 'bg-[#22d3ee]/10 text-[#22d3ee]' : `${textoSecundario} ${hoverBg}`}`}><IconSimulador /> Simulador</Link>
            <Link to="/historial-examenes" onClick={alClickLink} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase transition-all ${path.startsWith('/historial-examenes') ? 'bg-[#22d3ee]/10 text-[#22d3ee]' : `${textoSecundario} ${hoverBg}`}`}><IconHistorial /> Historial</Link>
            
            <div className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-500 px-4 py-1 mt-3">Herramientas Clínicas</div>
            <Link to="/patologias" onClick={alClickLink} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase transition-all ${path.startsWith('/patologias') ? 'bg-purple-500/10 text-purple-500' : `${textoSecundario} ${hoverBg}`}`}><IconPatologias /> Patologías</Link>
            <Link to="/masoterapia" onClick={alClickLink} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase transition-all ${path.startsWith('/masoterapia') ? 'bg-orange-500/10 text-orange-500' : `${textoSecundario} ${hoverBg}`}`}><IconMasoterapia /> Masoterapia</Link>
          </div>
        )}

        {/* MODO CLÍNICA: visible para Director, Licenciado, Híbrido, Demo, Admin Centro y pacientes (excepto si es soloAcademia) */}
        {((soloClinica) || (modoNavegacion === 'clinica' && !soloAcademia) || esDirector) && (
          <div className="space-y-1 mt-2">
            <div className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-400 px-4 py-1">Gestión Clínica</div>
            <Link to="/clinica/pacientes" onClick={alClickLink} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase transition-all ${path.startsWith('/clinica/pacientes') ? 'bg-emerald-500/10 text-emerald-400' : `${textoSecundario} ${hoverBg}`}`}><IconPacientes /> Pacientes</Link>
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase text-gray-500 opacity-60 cursor-not-allowed">
              <IconPacientes /> Evaluaciones <span className="text-[8px] text-gray-400">(próximamente)</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase text-gray-500 opacity-60 cursor-not-allowed">
              <IconPacientes /> Tratamientos <span className="text-[8px] text-gray-400">(próximamente)</span>
            </div>
          </div>
        )}

        <div className={`mt-4 pt-4 border-t ${bordeColor}`}>
          <Link to="/configuracion-ia" onClick={alClickLink} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${path.startsWith('/configuracion-ia') ? 'bg-blue-500/10 text-blue-400' : `${textoSecundario} ${hoverBg}`}`}>
            <IconConfig /><span className="text-xs font-bold uppercase tracking-wider">Aura AI Config</span>
          </Link>
        </div>
      </nav>

      <div className={`mt-4 pt-4 border-t ${bordeColor} flex flex-col gap-4`}>
        <GlobalMusicPlayer temaOscuro={temaOscuro} />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#22d3ee] to-[#10b981] flex items-center justify-center font-black text-sm text-[#020813] shadow-lg shadow-[#22d3ee]/20">
              {nombreUsuario.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className={`text-[11px] font-bold ${textoPrincipal} uppercase leading-none`}>{nombreUsuario || 'Usuario'}</p>
              <p className="text-[8px] text-[#10b981] font-black uppercase tracking-widest">{getRolLabel(rolUsuario)}</p>
              {/* Mostrar centro si existe */}
              {centroId && (
                <p className="text-[7px] text-gray-400 font-mono uppercase tracking-wider mt-0.5">Centro: {centroId}</p>
              )}
            </div>
          </div>
          <button onClick={handleLogout} className="text-red-500 hover:text-red-400 transition-colors p-2 rounded-full hover:bg-red-500/10">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
          </button>
        </div>
      </div>
    </aside>
  );
}