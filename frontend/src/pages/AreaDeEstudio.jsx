import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGitHubScanner } from '../hooks/useGitHubScanner';
import { useAura } from '../context/AuraContext';

const STORAGE_KEY = 'cj_favoritos';

export default function AreaDeEstudio({ temaOscuro }) {
  const navigate = useNavigate();
  const { estructura, cargando, error, recargar } = useGitHubScanner();
  const { actualizarContexto } = useAura();

  const [cicloSeleccionado, setCicloSeleccionado] = useState(null);
  const [cursos, setCursos] = useState([]);
  const [cursoActivo, setCursoActivo] = useState('');
  const [archivosCurso, setArchivosCurso] = useState([]);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [favoritos, setFavoritos] = useState([]);
  const [renderReady, setRenderReady] = useState(false);

  const GITHUB_USER = "CJPANTA";
  const GITHUB_REPO = "cj-project";
  const ciclosDisponibles = ['01', '02', '03', '04', '05', '06'];

  const LOGO_CARRION = "https://raw.githubusercontent.com/CJPANTA/cj-project/main/logo_carrion.png";
  const LOGO_CJ_CIRCULAR = "https://raw.githubusercontent.com/CJPANTA/cj-project/main/logos_cj_circular.png";

  useEffect(() => {
    setRenderReady(true);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setFavoritos(JSON.parse(stored));
      } catch (e) {
        setFavoritos([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favoritos));
  }, [favoritos]);

  const toggleFavorito = (nombrePDF) => {
    setFavoritos(prev => {
      if (prev.includes(nombrePDF)) {
        return prev.filter(f => f !== nombrePDF);
      } else {
        return [...prev, nombrePDF];
      }
    });
  };

  const esFavorito = (nombrePDF) => favoritos.includes(nombrePDF);

  useEffect(() => {
    if (cicloSeleccionado && estructura && estructura[cicloSeleccionado]) {
      const materias = Object.keys(estructura[cicloSeleccionado]);
      setCursos(materias);
      if (materias.length > 0) setCursoActivo(materias[0]);
    }
  }, [cicloSeleccionado, estructura]);

  useEffect(() => {
    if (cicloSeleccionado && cursoActivo && estructura?.[cicloSeleccionado]?.[cursoActivo]) {
      setArchivosCurso(estructura[cicloSeleccionado][cursoActivo]);
    } else {
      setArchivosCurso([]);
    }
  }, [cursoActivo, cicloSeleccionado, estructura]);

  const prepararLector = (nombreArchivo) => {
    const rawUrl = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/main/BASE_DATOS/01_CARRION/CICLO_${cicloSeleccionado}/${encodeURIComponent(cursoActivo)}/${encodeURIComponent(nombreArchivo)}`;
    const antiCache = new Date().getTime();
    localStorage.setItem('ultimo_pdf_visto', JSON.stringify({
      nombre: nombreArchivo,
      ciclo: `Ciclo ${cicloSeleccionado}`,
      materia: cursoActivo
    }));
    setArchivoSeleccionado({
      nombre: nombreArchivo,
      viewer: `https://docs.google.com/viewer?url=${encodeURIComponent(rawUrl)}&embedded=true&ignore=${antiCache}`,
      descarga: rawUrl
    });
    actualizarContexto({ ciclo: `Ciclo ${cicloSeleccionado}`, materia: cursoActivo, archivo: nombreArchivo });
  };

  const abrirOtroFormato = (nombreArchivo) => {
    const rawUrl = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/main/BASE_DATOS/01_CARRION/CICLO_${cicloSeleccionado}/${encodeURIComponent(cursoActivo)}/${encodeURIComponent(nombreArchivo)}`;
    const viewerUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(rawUrl)}`;
    window.open(viewerUrl, '_blank');
  };

  const cerrarLector = () => setArchivoSeleccionado(null);
  const forzarSincronizacion = () => {
    recargar();
    window.location.reload();
  };

  const esPDF = (nombre) => nombre.toLowerCase().endsWith('.pdf');
  const esFormatoOffice = (nombre) => {
    const ext = nombre.toLowerCase();
    return ext.endsWith('.pptx') || ext.endsWith('.ppt') ||
           ext.endsWith('.docx') || ext.endsWith('.doc') ||
           ext.endsWith('.xlsx') || ext.endsWith('.xls');
  };

  const textoColor = temaOscuro ? 'text-white' : 'text-[#1e293b]';
  const textoSecundario = temaOscuro ? 'text-gray-400' : 'text-gray-600';
  const tarjetaClase = temaOscuro
    ? 'bg-[#0f172a] border border-amber-600/30 shadow-lg shadow-amber-900/10 hover:shadow-xl hover:shadow-amber-800/20 hover:border-amber-400/60 hover:-translate-y-1 active:scale-[0.98] transition-all duration-300'
    : 'bg-white border border-indigo-300/50 shadow-md shadow-indigo-100/50 hover:shadow-lg hover:shadow-indigo-200/50 hover:border-indigo-500 hover:-translate-y-1 active:scale-[0.98] transition-all duration-300';

  if (cargando) {
    return (
      <main className="p-8 text-center">
        <div className="text-[#22d3ee] text-xl font-black">🔄 Escaneando repositorio desde GitHub...</div>
        <p className="text-gray-400 text-sm mt-2">Cargando materiales de estudio...</p>
      </main>
    );
  }
  if (error) {
    return (
      <main className="p-8 text-center">
        <div className="text-red-500 text-xl font-black">❌ Error al conectar con GitHub</div>
        <p className="text-gray-400 text-sm mt-2">{error}</p>
        <button onClick={forzarSincronizacion} className="mt-4 bg-[#22d3ee] text-black px-4 py-2 rounded-xl">Reintentar</button>
      </main>
    );
  }

  if (!renderReady) {
    return (
      <main className="p-8 text-center">
        <div className="text-gray-400 text-sm">Cargando...</div>
      </main>
    );
  }

  if (!cicloSeleccionado) {
    return (
      <main className="p-4 md:p-8 max-w-7xl mx-auto w-full animate-fade-in font-sans">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <div className="flex items-center gap-4">
              <img src={LOGO_CARRION} alt="Instituto Carrión" className="h-12 w-auto object-contain" />
              <h1 className={`text-3xl md:text-4xl font-black tracking-tighter ${textoColor}`}>
                Repositorio <span className="text-[#22d3ee]">Clínico</span>
              </h1>
            </div>
            <p className={`${textoSecundario} text-[10px] font-bold uppercase tracking-widest mt-2`}>
              INSTITUTO DE EDUCACIÓN SUPERIOR DANIEL ALCIDES CARRIÓN
            </p>
          </div>
          <button onClick={forzarSincronizacion} className="p-2 rounded-full hover:bg-white/10 transition-all" title="Refrescar repositorio">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 hover:text-[#22d3ee]">
              <path d="M21 2v6h-6" />
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
              <path d="M3 22v-6h6" />
              <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {ciclosDisponibles.map((ciclo) => (
            <div 
              key={ciclo} 
              className={`group relative overflow-hidden rounded-2xl cursor-pointer ${tarjetaClase}`}
              onClick={() => setCicloSeleccionado(ciclo)}
            >
              <img 
                src={LOGO_CJ_CIRCULAR} 
                className="absolute bottom-2 right-2 w-16 h-16 pointer-events-none opacity-15"
                alt="CJ"
              />
              <div className="p-6 flex flex-col items-center justify-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#22d3ee]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
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

  if (archivoSeleccionado) {
    return (
      <main className="h-screen w-full flex flex-col bg-black overflow-hidden">
        <header className="flex justify-between p-3 bg-[#020813] border-b border-gray-800">
          <button onClick={cerrarLector} className="px-4 py-2 bg-gray-800/50 rounded-xl text-white text-[11px] font-black">← Regresar</button>
          <p className="text-[#22d3ee] text-[10px] font-bold truncate">{archivoSeleccionado.nombre}</p>
          <a href={archivoSeleccionado.descarga} target="_blank" rel="noreferrer" className="px-4 py-2 bg-[#22d3ee] text-black rounded-xl text-[11px] font-black">Descargar</a>
        </header>
        <iframe src={archivoSeleccionado.viewer} className="flex-1 w-full border-none bg-white" title="PDF Viewer" />
      </main>
    );
  }

  return (
    <main className="p-4 md:p-8 max-w-full overflow-hidden">
      <header className="flex flex-col md:flex-row justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <img src={LOGO_CARRION} alt="Carrión" className="h-8 w-auto" />
          <div>
            <h1 className={`text-3xl font-black ${textoColor}`}>Ciclo <span className="text-[#22d3ee]">{cicloSeleccionado}</span></h1>
            <p className={`${textoSecundario} text-[10px] font-black uppercase`}>Material de Estudio</p>
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <button onClick={forzarSincronizacion} className="p-2 rounded-full hover:bg-white/10" title="Refrescar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
          </button>
          <button onClick={() => setCicloSeleccionado(null)} className={`text-[#22d3ee] text-[10px] font-black uppercase border border-[#22d3ee]/30 px-6 py-2.5 rounded-2xl ${temaOscuro ? 'hover:bg-[#22d3ee]/10' : 'hover:bg-[#22d3ee]/5'}`}>
            Cambiar Ciclo
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="flex flex-col gap-2">
          {cursos.map(c => (
            <button 
              key={c} 
              onClick={() => setCursoActivo(c)} 
              className={`w-full p-4 rounded-2xl text-left text-[11px] font-black uppercase border transition-all ${
                cursoActivo === c 
                  ? 'bg-[#22d3ee] text-black border-[#22d3ee]' 
                  : temaOscuro 
                    ? 'bg-white/5 border-gray-700 text-gray-300 hover:bg-white/10' 
                    : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {c.replace(/_/g, ' ')}
            </button>
          ))}
        </aside>
        <section className="lg:col-span-3">
          <div className={`${temaOscuro ? 'bg-white/5 border-gray-800' : 'bg-gray-50 border-gray-200'} border rounded-[2rem] p-5 min-h-[500px]`}>
            <div className="grid grid-cols-1 gap-4">
              {archivosCurso.length > 0 ? archivosCurso.map(f => (
                <div key={f} className={`p-4 rounded-2xl flex flex-wrap justify-between items-center border transition-all ${
                  temaOscuro 
                    ? 'border-gray-700 hover:border-[#22d3ee]/40' 
                    : 'border-gray-200 hover:border-[#22d3ee]/60'
                } group`}>
                  <div className="flex-1 min-w-[100px] truncate pr-2">
                    <p className={`${temaOscuro ? 'text-gray-300' : 'text-gray-700'} text-[13px] font-bold truncate`}>
                      {f.replace('.pdf', '').replace(/_/g, ' ')}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2 sm:mt-0">
                    <button
                      onClick={() => toggleFavorito(f)}
                      className={`px-2 py-1 rounded-xl text-sm transition-all ${
                        esFavorito(f)
                          ? 'text-yellow-400 hover:text-yellow-300'
                          : 'text-gray-400 hover:text-yellow-300'
                      }`}
                      title={esFavorito(f) ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                    >
                      {esFavorito(f) ? '⭐' : '☆'}
                    </button>
                    
                    {esPDF(f) && (
                      <button 
                        onClick={() => prepararLector(f)} 
                        className="bg-[#22d3ee] text-black px-4 py-1.5 rounded-xl text-[10px] font-black"
                      >
                        LEER
                      </button>
                    )}
                    
                    {!esPDF(f) && esFormatoOffice(f) && (
                      <button 
                        onClick={() => abrirOtroFormato(f)} 
                        className="bg-blue-500 text-white px-4 py-1.5 rounded-xl text-[10px] font-black hover:bg-blue-600 transition-all"
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
              )) : (
                <div className="py-24 text-center text-gray-500">Sin documentos en esta materia</div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}