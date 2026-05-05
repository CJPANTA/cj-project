import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import mapaDatos from '../data/mapa_carrion.json';

export default function AreaDeEstudio({ temaOscuro }) {
  const navigate = useNavigate();
  const [cicloSeleccionado, setCicloSeleccionado] = useState(null);
  const [cursos, setCursos] = useState([]);
  const [cursoActivo, setCursoActivo] = useState('');
  const [archivosCurso, setArchivosCurso] = useState([]);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);

  const GITHUB_USER = "CJPANTA"; 
  const GITHUB_REPO = "cj-project";
  const ciclosDisponibles = ['01', '02', '03', '04', '05', '06'];

  useEffect(() => {
    if (cicloSeleccionado && mapaDatos[cicloSeleccionado]) {
      const listaCursos = Object.keys(mapaDatos[cicloSeleccionado]);
      setCursos(listaCursos);
      if (listaCursos.length > 0) setCursoActivo(listaCursos[0]);
    }
  }, [cicloSeleccionado]);

  useEffect(() => {
    if (cursoActivo && mapaDatos[cicloSeleccionado]?.[cursoActivo]) {
      setArchivosCurso(mapaDatos[cicloSeleccionado][cursoActivo]);
    }
  }, [cursoActivo, cicloSeleccionado]);

  const bgTarjeta = temaOscuro ? 'bg-black/40 border-gray-800' : 'bg-white border-gray-200 shadow-sm';
  const textoColor = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const bordeColor = temaOscuro ? 'border-gray-800' : 'border-gray-200';

  // =========================================================================
  // EL CORAZÓN DEL VISOR REPARADO CON LA RUTA EXACTA DE TU REPOSITORIO
  // =========================================================================
  const prepararLector = (nombreArchivo) => {
    // RUTA EXACTA CONECTADA A GITHUB: BASE_DATOS/01_CARRION/CICLO_XX/MATERIA/ARCHIVO
    const rawUrl = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/main/BASE_DATOS/01_CARRION/CICLO_${cicloSeleccionado}/${encodeURIComponent(cursoActivo)}/${encodeURIComponent(nombreArchivo)}`;
    
    // TRUCO ANTI-CACHÉ: Evita que Google Docs te muestre la pantalla gris de error guardada
    const antiCache = new Date().getTime();
    
    setArchivoSeleccionado({
      nombre: nombreArchivo,
      viewer: `https://docs.google.com/viewer?url=${encodeURIComponent(rawUrl)}&embedded=true&ignore=${antiCache}`,
      descarga: rawUrl
    });
  };

  const cerrarLector = () => setArchivoSeleccionado(null);

  // VISTA 1: ÍNDICE DE CICLOS
  if (!cicloSeleccionado) {
    return (
      <main className="p-4 md:p-8 max-w-7xl mx-auto w-full animate-fade-in font-sans">
        <header className="mb-8 text-center md:text-left">
          <h1 className={`text-4xl font-black tracking-tighter ${textoColor}`}>
            Repositorio <span className="text-[#22d3ee]">Clínico</span>
          </h1>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-2">SELECCIONA EL CICLO ACADÉMICO</p>
        </header>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {ciclosDisponibles.map((ciclo) => (
            <button 
              key={ciclo} 
              onClick={() => setCicloSeleccionado(ciclo)}
              className={`p-8 rounded-3xl border ${bgTarjeta} flex flex-col items-center justify-center gap-4 hover:border-[#22d3ee]/50 hover:bg-[#22d3ee]/5 transition-all group`}
            >
              <div className="w-16 h-16 rounded-2xl bg-[#22d3ee]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#22d3ee]">
                  <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
                </svg>
              </div>
              <span className={`text-xl font-black ${textoColor}`}>Ciclo {ciclo}</span>
            </button>
          ))}
        </div>
      </main>
    );
  }

  // VISTA 2: VISOR DE PDF A PANTALLA COMPLETA
  if (archivoSeleccionado) {
    return (
      <main className="h-screen w-full flex flex-col bg-black overflow-hidden animate-fade-in">
        <header className="flex items-center justify-between p-3 bg-[#020813] border-b border-gray-800 z-50 shrink-0">
          <button onClick={cerrarLector} className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-800 rounded-xl text-white text-[11px] font-black uppercase transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            <span className="hidden sm:inline">Regresar</span>
          </button>
          
          <div className="flex-1 px-4 overflow-hidden text-center">
            <p className="text-[#22d3ee] text-[10px] font-bold truncate">
              {archivoSeleccionado.nombre}
            </p>
          </div>

          <a href={archivoSeleccionado.descarga} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-[#22d3ee] hover:bg-[#1bc1da] text-black rounded-xl text-[11px] font-black uppercase transition-colors shadow-[0_0_15px_rgba(34,211,238,0.3)] shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            <span className="hidden sm:inline">Descargar</span>
          </a>
        </header>
        <iframe src={archivoSeleccionado.viewer} className="flex-1 w-full border-none bg-white" title="Lector PDF" />
      </main>
    );
  }

  // VISTA 3: NAVEGADOR DEL CICLO (Cursos y Archivos)
  return (
    <main className="p-4 md:p-8 max-w-full overflow-hidden animate-fade-in font-sans">
      
      {/* ESTILOS DEL TEXTO DESLIZANTE */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(10%); }
          100% { transform: translateX(-100%); }
        }
        .marquee-container {
          overflow: hidden;
          white-space: nowrap;
          mask-image: linear-gradient(to right, transparent, black 5%, black 90%, transparent);
        }
        .marquee-text {
          display: inline-block;
          animation: marquee 15s linear infinite;
          padding-left: 10px;
        }
      `}</style>

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className={`text-3xl font-black tracking-tighter ${textoColor}`}>
            Ciclo <span className="text-[#22d3ee]">{cicloSeleccionado}</span>
          </h1>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1">Material de Estudio</p>
        </div>
        <button onClick={() => setCicloSeleccionado(null)} className="text-[#22d3ee] flex items-center gap-2 text-[10px] font-black uppercase border border-[#22d3ee]/30 hover:bg-[#22d3ee]/10 px-6 py-2.5 rounded-2xl transition-all font-black self-start md:self-auto">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Cambiar Ciclo
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1 flex flex-col gap-2">
          {cursos.map((c, i) => (
            <button 
              key={i} 
              onClick={() => setCursoActivo(c)}
              className={`w-full p-4 rounded-2xl text-left text-[11px] font-black uppercase tracking-wider transition-all border ${cursoActivo === c ? 'bg-[#22d3ee] text-black border-[#22d3ee] shadow-lg scale-[1.02]' : `${bgTarjeta} ${textoColor} hover:border-[#22d3ee]/50`}`}
            >
              {c.replace(/_/g, ' ')}
            </button>
          ))}
        </aside>

        <section className="lg:col-span-3">
          <div className={`${bgTarjeta} border ${bordeColor} rounded-[2rem] p-5 min-h-[500px]`}>
            <div className="grid grid-cols-1 gap-4">
              {archivosCurso.length > 0 ? archivosCurso.map((f, i) => (
                <div key={i} className={`${temaOscuro ? 'bg-[#020813]/60' : 'bg-gray-50'} p-4 rounded-2xl flex justify-between items-center border ${bordeColor} hover:border-[#22d3ee]/40 transition-all group overflow-hidden`}>
                  
                  {/* TEXTO DESLIZANTE */}
                  <div className="flex-1 marquee-container pr-4">
                    <p className={`marquee-text ${textoColor} text-[13px] font-bold`}>
                      {f.replace('.pdf', '').replace(/_/g, ' ')}
                    </p>
                  </div>

                  <button onClick={() => prepararLector(f)} className="flex items-center gap-2 bg-[#22d3ee] hover:bg-[#1bc1da] text-black px-6 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg shrink-0 transition-transform active:scale-95 z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                    <span className="hidden sm:inline">Ver</span>
                  </button>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center py-24 opacity-40">
                  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={`${textoColor} mb-4`}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                  <p className="text-base font-bold uppercase tracking-widest">Sin documentos</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}