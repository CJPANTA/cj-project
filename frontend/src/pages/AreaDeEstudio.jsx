import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useGitHubScanner } from '../hooks/useGitHubScanner';
import { useAura } from '../context/AuraContext';

const STORAGE_KEY = 'cj_favoritos';

// ============================================================
// INSTITUCIONES DISPONIBLES
// ============================================================
const INSTITUCIONES = {
  carrion: {
    id: 'carrion',
    nombre: 'Instituto Carrión',
    nombreCorto: 'Carrión',
    descripcion: 'Instituto de Educación Superior Daniel Alcides Carrión',
    logo: 'https://raw.githubusercontent.com/CJPANTA/cj-project/main/logo_carrion.png',
    colorPrimario: '#22d3ee',
    colorSecundario: 'rgba(34, 211, 238, 0.15)',
    tipo: 'ciclos',
  },
  esan: {
    id: 'esan',
    nombre: 'Universidad ESAN',
    nombreCorto: 'ESAN',
    descripcion: 'Programa de Especialización en Gestión Estratégica y Operativa',
    logo: 'https://raw.githubusercontent.com/CJPANTA/cj-project/main/logo_esan.jpg',
    colorPrimario: '#facc15',
    colorSecundario: 'rgba(250, 204, 21, 0.15)',
    tipo: 'cursos',
  },
};

// ============================================================
// NOMBRES BONITOS DE LOS CURSOS DE ESAN
// ============================================================
const NOMBRES_CURSOS_ESAN = {
  '00-MATERIAL_GENERAL': { num: '00', titulo: 'Material General del Programa' },
  '01-PLANIFICACION_ESTRATEGICA': { num: '01', titulo: 'Planificación Estratégica' },
  '02-GESTION-DE_CLIENTES_Y_UNIDAD_DE_NEGOCIO': { num: '02', titulo: 'Gestión de Clientes y Unidad de Negocio' },
  '03-CONTROL_INTERNO': { num: '03', titulo: 'Control Interno' },
  '04-GESTION_DE_PROCESO-OPERACIONES-LOGISTICA': { num: '04', titulo: 'Gestión de Procesos, Operaciones y Logística' },
  '05-GESTION_DE_PERSONAS': { num: '05', titulo: 'Gestión de Personas' },
  '06-GESTION-FINANCIERA': { num: '06', titulo: 'Gestión Financiera' },
};

const LOGO_CJ_CIRCULAR = "https://raw.githubusercontent.com/CJPANTA/cj-project/main/logos_cj_circular.png";

export default function AreaDeEstudio({ temaOscuro }) {
  const navigate = useNavigate();
  const { actualizarContexto } = useAura();

  // Estado de institución
  const [institucion, setInstitucion] = useState(null);
  const [institucionDefault, setInstitucionDefault] = useState(null);
  const [cargandoPerfil, setCargandoPerfil] = useState(true);

  // Hook dinámico según institución
  const { estructura, cargando, error, recargar } = useGitHubScanner(institucion);

  // Estado de navegación
  const [nivelIntermedio, setNivelIntermedio] = useState(null); // Solo Carrion (ciclo 01-06)
  const [cursoActivo, setCursoActivo] = useState('');
  const [archivosCurso, setArchivosCurso] = useState([]);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [favoritos, setFavoritos] = useState([]);

  const GITHUB_USER = "CJPANTA";
  const GITHUB_REPO = "cj-project";
  const ciclosDisponibles = ['01', '02', '03', '04', '05', '06'];

  // ===== Cargar institución del perfil =====
  useEffect(() => {
    const cargarInstitucion = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setCargandoPerfil(false); return; }
        const { data: perfil } = await supabase
          .from('profiles')
          .select('institucion')
          .eq('id', user.id)
          .single();
        if (perfil?.institucion && INSTITUCIONES[perfil.institucion]) {
          setInstitucionDefault(perfil.institucion);
          setInstitucion(perfil.institucion);
        }
      } catch (err) {
        console.error('Error cargando institución:', err);
      } finally {
        setCargandoPerfil(false);
      }
    };
    cargarInstitucion();
  }, []);

  // ===== Cargar favoritos =====
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try { setFavoritos(JSON.parse(stored)); } catch (e) { setFavoritos([]); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favoritos));
  }, [favoritos]);

  const toggleFavorito = (nombrePDF) => {
    setFavoritos(prev => prev.includes(nombrePDF)
      ? prev.filter(f => f !== nombrePDF)
      : [...prev, nombrePDF]);
  };

  const esFavorito = (nombrePDF) => favoritos.includes(nombrePDF);

  // ===== Reset al cambiar institución =====
  useEffect(() => {
    setNivelIntermedio(null);
    setCursoActivo('');
    setArchivosCurso([]);
    setArchivoSeleccionado(null);
  }, [institucion]);

  // ===== Auto-seleccionar primera materia al elegir ciclo (Carrion) =====
  useEffect(() => {
    if (institucion !== 'carrion') return;
    if (nivelIntermedio && estructura?.ciclos?.[nivelIntermedio]) {
      const materias = Object.keys(estructura.ciclos[nivelIntermedio]);
      if (materias.length > 0 && !materias.includes(cursoActivo)) {
        setCursoActivo(materias[0]);
      }
    }
  }, [nivelIntermedio, estructura, institucion, cursoActivo]);

  // ===== Cargar archivos al seleccionar curso =====
  useEffect(() => {
    if (!estructura) { setArchivosCurso([]); return; }

    if (institucion === 'carrion') {
      if (nivelIntermedio && cursoActivo && estructura?.ciclos?.[nivelIntermedio]?.[cursoActivo]) {
        setArchivosCurso(estructura.ciclos[nivelIntermedio][cursoActivo]);
      } else {
        setArchivosCurso([]);
      }
    } else if (institucion === 'esan') {
      if (cursoActivo && estructura?.cursos?.[cursoActivo]) {
        setArchivosCurso(estructura.cursos[cursoActivo]);
      } else {
        setArchivosCurso([]);
      }
    }
  }, [cursoActivo, nivelIntermedio, estructura, institucion]);

  // ===== Construir URL del archivo =====
  const construirRutaGitHub = (nombreArchivo) => {
    if (institucion === 'carrion') {
      return `BASE_DATOS/01_CARRION/CICLO_${nivelIntermedio}/${encodeURIComponent(cursoActivo)}/${encodeURIComponent(nombreArchivo)}`;
    } else if (institucion === 'esan') {
      return `BASE_DATOS/07_ESAN/${encodeURIComponent(cursoActivo)}/${encodeURIComponent(nombreArchivo)}`;
    }
    return '';
  };

  const prepararLector = (nombreArchivo) => {
    const ruta = construirRutaGitHub(nombreArchivo);
    const rawUrl = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/main/${ruta}`;
    const antiCache = new Date().getTime();

    localStorage.setItem('ultimo_pdf_visto', JSON.stringify({
      nombre: nombreArchivo,
      institucion: INSTITUCIONES[institucion]?.nombreCorto || institucion,
      ciclo: nivelIntermedio ? `Ciclo ${nivelIntermedio}` : null,
      materia: cursoActivo,
    }));

    setArchivoSeleccionado({
      nombre: nombreArchivo,
      viewer: `https://docs.google.com/viewer?url=${encodeURIComponent(rawUrl)}&embedded=true&ignore=${antiCache}`,
      descarga: rawUrl,
    });

    actualizarContexto({
      institucion: INSTITUCIONES[institucion]?.nombreCorto,
      ciclo: nivelIntermedio ? `Ciclo ${nivelIntermedio}` : null,
      materia: cursoActivo,
      archivo: nombreArchivo,
    });
  };

  const abrirOtroFormato = (nombreArchivo) => {
    const ruta = construirRutaGitHub(nombreArchivo);
    const rawUrl = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/main/${ruta}`;
    const viewerUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(rawUrl)}`;
    window.open(viewerUrl, '_blank');
  };

  const cerrarLector = () => setArchivoSeleccionado(null);

  const forzarSincronizacion = () => {
    recargar();
    window.location.reload();
  };

  const cambiarInstitucion = () => {
    setInstitucion(null);
    setNivelIntermedio(null);
    setCursoActivo('');
    setArchivoSeleccionado(null);
  };

  const esPDF = (nombre) => nombre.toLowerCase().endsWith('.pdf');
  const esFormatoOffice = (nombre) => {
    const ext = nombre.toLowerCase();
    return ext.endsWith('.pptx') || ext.endsWith('.ppt') ||
           ext.endsWith('.docx') || ext.endsWith('.doc') ||
           ext.endsWith('.xlsx') || ext.endsWith('.xls');
  };

  // ===== Estilos =====
  const textoColor = temaOscuro ? 'text-white' : 'text-[#1e293b]';
  const textoSecundario = temaOscuro ? 'text-gray-400' : 'text-gray-600';
  const bgCard = temaOscuro ? 'bg-[#0f172a] border-gray-700' : 'bg-white border-gray-200';

  // ============================================================
  // VISTA 0: SELECCIÓN DE INSTITUCIÓN
  // ============================================================
  if (!institucion && !cargandoPerfil) {
    return (
      <main className="p-4 md:p-8 max-w-7xl mx-auto w-full font-sans">
        <div className="text-center mb-12">
          <h1 className={`text-4xl md:text-5xl font-black tracking-tighter ${textoColor} mb-3`}>
            Repositorio <span className="text-[#22d3ee]">Académico</span>
          </h1>
          <p className={`${textoSecundario} text-xs font-bold uppercase tracking-widest`}>
            Selecciona una institución para comenzar
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {Object.values(INSTITUCIONES).map((inst) => (
            <div
              key={inst.id}
              onClick={() => setInstitucion(inst.id)}
              className={`group relative overflow-hidden rounded-3xl cursor-pointer border-2 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${
                temaOscuro ? 'bg-[#0f172a] border-gray-700 hover:border-white/30' : 'bg-white border-gray-200 hover:border-gray-400'
              }`}
              style={{
                boxShadow: temaOscuro ? `0 4px 20px ${inst.colorSecundario}` : '0 4px 12px rgba(0,0,0,0.05)',
              }}
            >
              <div
                className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-150"
                style={{ background: inst.colorSecundario }}
              />

              <div className="relative p-8 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-2xl flex items-center justify-center mb-6 bg-white p-3 shadow-lg">
                  <img src={inst.logo} alt={inst.nombre} className="w-full h-full object-contain" />
                </div>

                <h2
                  className="text-2xl font-black mb-2 tracking-tight"
                  style={{ color: inst.colorPrimario }}
                >
                  {inst.nombreCorto}
                </h2>

                <p className={`${textoSecundario} text-xs font-bold uppercase tracking-wider mb-1`}>
                  {inst.nombre}
                </p>

                <p className={`${textoSecundario} text-xs mt-3 leading-relaxed`}>
                  {inst.descripcion}
                </p>

                {institucionDefault === inst.id && (
                  <span className="absolute top-4 right-4 text-[9px] font-black uppercase px-2 py-1 rounded-full bg-green-500/20 text-green-500">
                    ✓ Predeterminada
                  </span>
                )}

                <div className="mt-6 w-full">
                  <button
                    className="w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all text-black"
                    style={{ background: inst.colorPrimario }}
                  >
                    Ingresar →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  // ============================================================
  // CARGANDO
  // ============================================================
  if (cargando || cargandoPerfil) {
    return (
      <main className="p-8 text-center">
        <div className="text-[#22d3ee] text-xl font-black">🔄 Escaneando repositorio...</div>
        <p className="text-gray-400 text-sm mt-2">Cargando materiales de estudio de {INSTITUCIONES[institucion]?.nombreCorto || 'la institución'}...</p>
      </main>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================
  if (error) {
    return (
      <main className="p-8 text-center">
        <div className="text-red-500 text-xl font-black">❌ Error al conectar con GitHub</div>
        <p className="text-gray-400 text-sm mt-2">{error}</p>
        <div className="flex gap-3 justify-center mt-4">
          <button onClick={forzarSincronizacion} className="bg-[#22d3ee] text-black px-4 py-2 rounded-xl font-bold">Reintentar</button>
          <button onClick={cambiarInstitucion} className="bg-gray-600 text-white px-4 py-2 rounded-xl font-bold">Cambiar Institución</button>
        </div>
      </main>
    );
  }

  // ============================================================
  // VISTA: VISOR DE PDF (común)
  // ============================================================
  if (archivoSeleccionado) {
    return (
      <main className="h-screen w-full flex flex-col bg-black overflow-hidden" key="visor-pdf">
        <header className="flex justify-between p-3 bg-[#020813] border-b border-gray-800">
          <button onClick={cerrarLector} className="px-4 py-2 bg-gray-800/50 rounded-xl text-white text-[11px] font-black hover:bg-gray-700 transition-all">
            ← Regresar
          </button>
          <p className="text-[#22d3ee] text-[10px] font-bold truncate max-w-[60%]">{archivoSeleccionado.nombre}</p>
          <a
            href={archivoSeleccionado.descarga}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-[#22d3ee] text-black rounded-xl text-[11px] font-black hover:bg-[#1bc1da] transition-all"
          >
            Descargar
          </a>
        </header>
        <iframe
          key={archivoSeleccionado.viewer}
          src={archivoSeleccionado.viewer}
          className="flex-1 w-full border-none bg-white"
          title="PDF Viewer"
          sandbox="allow-scripts allow-same-origin"
        />
      </main>
    );
  }

  const instActual = INSTITUCIONES[institucion];

  // ============================================================
  // VISTA 1: CARRION — SELECCIÓN DE CICLOS
  // ============================================================
  if (institucion === 'carrion' && !nivelIntermedio) {
    return (
      <main className="p-4 md:p-8 max-w-7xl mx-auto w-full font-sans">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <div className="flex items-center gap-4">
              <img src={instActual.logo} alt={instActual.nombre} className="h-12 w-auto object-contain" />
              <h1 className={`text-3xl md:text-4xl font-black tracking-tighter ${textoColor}`}>
                Repositorio <span style={{ color: instActual.colorPrimario }}>Carrión</span>
              </h1>
            </div>
            <p className={`${textoSecundario} text-[10px] font-bold uppercase tracking-widest mt-2`}>
              {instActual.descripcion}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={forzarSincronizacion} className="p-2 rounded-full hover:bg-white/10 transition-all" title="Refrescar">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 hover:text-[#22d3ee]">
                <path d="M21 2v6h-6" />
                <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                <path d="M3 22v-6h6" />
                <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
              </svg>
            </button>
            <button onClick={cambiarInstitucion} className={`text-[10px] font-black uppercase border px-4 py-2 rounded-xl transition-all ${temaOscuro ? 'border-gray-600 text-gray-300 hover:bg-white/10' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}>
              ⇄ Cambiar Institución
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {ciclosDisponibles.map((ciclo) => (
            <div
              key={ciclo}
              className={`group relative overflow-hidden rounded-2xl cursor-pointer border transition-all hover:-translate-y-1 hover:shadow-xl ${
                temaOscuro ? 'bg-[#0f172a] border-amber-600/30 hover:border-amber-400/60' : 'bg-white border-indigo-300/50 hover:border-indigo-500'
              }`}
              onClick={() => setNivelIntermedio(ciclo)}
            >
              <img
                src={LOGO_CJ_CIRCULAR}
                className={`absolute bottom-2 right-2 w-16 h-16 pointer-events-none transition-opacity ${temaOscuro ? 'opacity-15 group-hover:opacity-25' : 'opacity-10 group-hover:opacity-20'}`}
                alt="CJ"
              />
              <div className="p-6 flex flex-col items-center justify-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#22d3ee]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-[#22d3ee]">
                    <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
                  </svg>
                </div>
                <span className={`text-2xl font-black ${textoColor}`}>Ciclo {ciclo}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  // ============================================================
  // VISTA 2: ESAN — SELECCIÓN DE CURSOS
  // ============================================================
  if (institucion === 'esan' && !cursoActivo) {
    const cursos = Object.keys(estructura?.cursos || {});
    return (
      <main className="p-4 md:p-8 max-w-7xl mx-auto w-full font-sans">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <div className="flex items-center gap-4">
              <img src={instActual.logo} alt={instActual.nombre} className="h-12 w-auto object-contain" />
              <h1 className={`text-3xl md:text-4xl font-black tracking-tighter ${textoColor}`}>
                Programa <span style={{ color: instActual.colorPrimario }}>ESAN</span>
              </h1>
            </div>
            <p className={`${textoSecundario} text-[10px] font-bold uppercase tracking-widest mt-2`}>
              {instActual.descripcion}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={forzarSincronizacion} className="p-2 rounded-full hover:bg-white/10 transition-all" title="Refrescar">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 hover:text-[#facc15]">
                <path d="M21 2v6h-6" />
                <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                <path d="M3 22v-6h6" />
                <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
              </svg>
            </button>
            <button onClick={cambiarInstitucion} className={`text-[10px] font-black uppercase border px-4 py-2 rounded-xl transition-all ${temaOscuro ? 'border-gray-600 text-gray-300 hover:bg-white/10' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}>
              ⇄ Cambiar Institución
            </button>
          </div>
        </div>

        {cursos.length === 0 ? (
          <div className={`${bgCard} p-12 rounded-3xl border text-center`}>
            <p className="text-gray-400">No hay cursos disponibles aún. Sube los archivos a la carpeta <code className="text-[#facc15]">07_ESAN</code> en GitHub.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cursos.map((cursoKey) => {
              const info = NOMBRES_CURSOS_ESAN[cursoKey] || { num: '??', titulo: cursoKey.replace(/[-_]/g, ' ') };
              const cantidadArchivos = estructura?.cursos?.[cursoKey]?.length || 0;
              return (
                <div
                  key={cursoKey}
                  onClick={() => setCursoActivo(cursoKey)}
                  className={`group relative overflow-hidden rounded-2xl cursor-pointer border transition-all hover:-translate-y-1 hover:shadow-xl ${
                    temaOscuro ? 'bg-[#0f172a] border-yellow-600/30 hover:border-yellow-400/60' : 'bg-white border-yellow-300/50 hover:border-yellow-500'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg"
                        style={{
                          background: 'rgba(250, 204, 21, 0.15)',
                          color: instActual.colorPrimario,
                        }}
                      >
                        {info.num}
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-widest ${textoSecundario}`}>
                        Curso
                      </span>
                    </div>

                    <h3 className={`text-base font-black ${textoColor} leading-tight mb-2`}>
                      {info.titulo}
                    </h3>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700/50">
                      <span className={`text-[10px] font-bold uppercase ${textoSecundario}`}>
                        📄 {cantidadArchivos} {cantidadArchivos === 1 ? 'archivo' : 'archivos'}
                      </span>
                      <span className="text-lg transition-transform group-hover:translate-x-1" style={{ color: instActual.colorPrimario }}>
                        →
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    );
  }

  // ============================================================
  // VISTA 3: LISTA DE ARCHIVOS (común Carrion + ESAN)
  // ============================================================
  const esCarrion = institucion === 'carrion';
  const tituloNivel = esCarrion ? `Ciclo ${nivelIntermedio}` : 'Programa ESAN';
  const cursoMostrar = esCarrion
    ? cursoActivo.replace(/_/g, ' ')
    : (NOMBRES_CURSOS_ESAN[cursoActivo]?.titulo || cursoActivo.replace(/[-_]/g, ' '));

  return (
    <main className="p-4 md:p-8 max-w-full overflow-hidden">
      <header className="flex flex-col md:flex-row justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <img src={instActual.logo} alt={instActual.nombreCorto} className="h-10 w-auto object-contain" />
          <div>
            <h1 className={`text-2xl font-black ${textoColor}`}>
              {esCarrion ? <>Ciclo <span style={{ color: instActual.colorPrimario }}>{nivelIntermedio}</span></> : <span style={{ color: instActual.colorPrimario }}>ESAN</span>}
            </h1>
            <p className={`${textoSecundario} text-[10px] font-black uppercase`}>
              {cursoMostrar}
            </p>
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <button onClick={forzarSincronizacion} className="p-2 rounded-full hover:bg-white/10" title="Refrescar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
          </button>
          <button
            onClick={() => {
              if (esCarrion) {
                setNivelIntermedio(null);
              } else {
                setCursoActivo('');
              }
            }}
            className={`text-[10px] font-black uppercase border px-4 py-2 rounded-xl transition-all`}
            style={{
              borderColor: instActual.colorPrimario + '50',
              color: instActual.colorPrimario,
            }}
          >
            {esCarrion ? '← Cambiar Ciclo' : '← Cambiar Curso'}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar de materias (solo Carrion) */}
        {esCarrion && (
          <aside className="flex flex-col gap-2">
            {Object.keys(estructura?.ciclos?.[nivelIntermedio] || {}).map(c => (
              <button
                key={c}
                onClick={() => setCursoActivo(c)}
                className={`w-full p-4 rounded-2xl text-left text-[11px] font-black uppercase border transition-all ${
                  cursoActivo === c
                    ? 'text-black border-transparent'
                    : temaOscuro
                      ? 'bg-white/5 border-gray-700 text-gray-300 hover:bg-white/10'
                      : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
                }`}
                style={cursoActivo === c ? { background: instActual.colorPrimario } : {}}
              >
                {c.replace(/_/g, ' ')}
              </button>
            ))}
          </aside>
        )}

        <section className={esCarrion ? 'lg:col-span-3' : 'lg:col-span-4'}>
          <div className={`${temaOscuro ? 'bg-white/5 border-gray-800' : 'bg-gray-50 border-gray-200'} border rounded-[2rem] p-5 min-h-[500px]`}>
            <div className="grid grid-cols-1 gap-4">
              {archivosCurso.length > 0 ? archivosCurso.map(f => {
                const nombreMostrar = f.replace(/\.(pdf|pptx|ppt|docx|doc|xlsx|xls)$/, '').replace(/[_-]/g, ' ');
                return (
                  <div key={f} className={`p-4 rounded-2xl flex flex-wrap justify-between items-center border transition-all ${
                    temaOscuro ? 'border-gray-700 hover:border-white/30' : 'border-gray-200 hover:border-gray-400'
                  } group`}>
                    <div className="flex-1 min-w-0 pr-4">
                      <p className={`${temaOscuro ? 'text-gray-300' : 'text-gray-700'} text-[13px] font-bold truncate`}>
                        {nombreMostrar}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                      <button
                        onClick={() => toggleFavorito(f)}
                        className={`px-2 py-2 rounded-xl text-sm transition-all ${
                          esFavorito(f) ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-300'
                        }`}
                        title={esFavorito(f) ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                      >
                        {esFavorito(f) ? '⭐' : '☆'}
                      </button>

                      {esPDF(f) && (
                        <button
                          onClick={() => prepararLector(f)}
                          className="text-black px-4 py-2 rounded-xl text-[10px] font-black transition-all hover:opacity-90"
                          style={{ background: instActual.colorPrimario }}
                        >
                          LEER
                        </button>
                      )}

                      {!esPDF(f) && esFormatoOffice(f) && (
                        <button
                          onClick={() => abrirOtroFormato(f)}
                          className="bg-blue-500 text-white px-4 py-2 rounded-xl text-[10px] font-black hover:bg-blue-600 transition-all"
                        >
                          VER
                        </button>
                      )}

                      {!esPDF(f) && !esFormatoOffice(f) && (
                        <div className="flex items-center text-gray-500 text-[10px] font-black px-2">
                          Formato no soportado
                        </div>
                      )}
                    </div>
                  </div>
                );
              }) : (
                <div className="py-24 text-center text-gray-500">Sin documentos en esta materia</div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}