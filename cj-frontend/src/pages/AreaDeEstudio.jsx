import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import mapaDatos from '../data/mapa_carrion.json';

export default function AreaDeEstudio({ temaOscuro }) {
  const location = useLocation();
  const navigate = useNavigate();

  const cicloEnUrl = location.pathname.split('-')[1];
  const mostrarIndice = !cicloEnUrl || isNaN(cicloEnUrl) || !mapaDatos[cicloEnUrl];
  const cicloActual = mostrarIndice ? '00' : cicloEnUrl;

  const [cursos, setCursos] = useState([]);
  const [cursoActivo, setCursoActivo] = useState('');
  const [archivosCurso, setArchivosCurso] = useState([]);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [nota, setNota] = useState('');

  const GITHUB_USER = "CJPANTA"; 
  const GITHUB_REPO = "cj-project";

  useEffect(() => {
    if (!mostrarIndice && mapaDatos[cicloActual]) {
      const listaCursos = Object.keys(mapaDatos[cicloActual]);
      setCursos(listaCursos);
      if (listaCursos.length > 0) setCursoActivo(listaCursos[0]);
    }
  }, [cicloActual, mostrarIndice]);

  useEffect(() => {
    if (!mostrarIndice && cursoActivo && mapaDatos[cicloActual]) {
      setArchivosCurso(mapaDatos[cicloActual][cursoActivo] || []);
      setArchivoSeleccionado(null);
    }
  }, [cursoActivo, cicloActual, mostrarIndice]);

  const prepararLector = (archivoPdf) => {
    const cicloStr = encodeURIComponent(`CICLO_${cicloActual}`);
    const cursoStr = encodeURIComponent(cursoActivo);
    const archivoStr = encodeURIComponent(archivoPdf);
    
    const rawUrl = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/main/BASE_DATOS/01_CARRION/${cicloStr}/${cursoStr}/${archivoStr}`;
    
    const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(rawUrl)}&embedded=true`;
    setArchivoSeleccionado({ nombre: archivoPdf, viewer: viewerUrl, download: rawUrl });
  };

  const bgPanel = temaOscuro ? 'bg-[#0a141d]' : 'bg-white shadow-xl';
  const bgTarjeta = temaOscuro ? 'bg-black/20' : 'bg-gray-50';
  const textoColor = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const bordeColor = temaOscuro ? 'border-gray-800' : 'border-gray-200';

  if (mostrarIndice) {
    return (
      <main className={`${bgPanel} border ${bordeColor} rounded-3xl p-6 h-full overflow-y-auto relative`}>
        <header className="mb-10 border-b border-gray-500/20 pb-6">
          <h1 className={`text-4xl font-black uppercase tracking-tighter ${textoColor}`}>REPOSITORIO <span className="text-[#22d3ee]">ACADÉMICO</span></h1>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {['01', '02', '03', '04', '05', '06'].map((ciclo) => (
            <button key={ciclo} onClick={() => navigate(`/ciclo-${ciclo}`)} className={`${bgTarjeta} border ${bordeColor} rounded-3xl p-10 flex flex-col items-center group relative overflow-hidden transition-all hover:border-[#22d3ee]`}>
              <img src="/logos_cj_circular.png" className={`absolute -bottom-4 -left-4 w-24 h-24 grayscale transition-all ${temaOscuro ? 'opacity-10 invert' : 'opacity-[0.05]'}`} alt="Sello" />
              <h2 className={`${textoColor} text-xl font-black uppercase group-hover:text-[#22d3ee]`}>Ciclo {ciclo}</h2>
            </button>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className={`${bgPanel} border ${bordeColor} rounded-3xl p-6 h-full flex flex-col overflow-hidden`}>
      <header className="mb-6 border-b border-gray-800/20 pb-4 flex justify-between items-center">
        <h1 className={`text-2xl font-black uppercase ${textoColor}`}>CICLO <span className="text-[#22d3ee]">{cicloActual}</span></h1>
        <button onClick={() => navigate('/area-estudio')} className="text-[10px] font-black uppercase px-4 py-2 bg-black/10 rounded-xl hover:text-[#22d3ee]">⬅ Volver</button>
      </header>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-6 min-h-0">
        <section className={`${bgTarjeta} border ${bordeColor} rounded-2xl p-4 overflow-y-auto`}>
          {cursos.map((c, i) => (
            <button key={i} onClick={() => setCursoActivo(c)} className={`w-full text-left p-3 mb-2 rounded-xl text-[10px] font-bold uppercase transition-all border ${cursoActivo === c ? 'bg-[#22d3ee]/20 text-[#22d3ee] border-[#22d3ee]/40' : 'border-transparent opacity-50'}`}>📁 {c.replace(/_/g, ' ')}</button>
          ))}
        </section>

        <section className="md:col-span-2 flex flex-col min-h-0">
          <div className={`${bgTarjeta} border ${bordeColor} rounded-2xl p-4 flex-1 overflow-y-auto`}>
            {archivoSeleccionado ? (
              <div className="h-full flex flex-col gap-4">
                <iframe src={archivoSeleccionado.viewer} className="w-full flex-1 rounded-xl border border-gray-800 bg-white" title="PDF" />
                <button onClick={() => setArchivoSeleccionado(null)} className="py-2 text-[10px] font-black uppercase text-[#22d3ee]">Cerrar Visor</button>
              </div>
            ) : (
              <div className="grid gap-3">
                {archivosCurso.map((f, i) => (
                  <div key={i} className={`${bgTarjeta} p-4 rounded-xl flex justify-between items-center border ${bordeColor}`}>
                    <p className={`${textoColor} text-[11px] font-bold truncate pr-4`}>{f.replace('.pdf', '')}</p>
                    <button onClick={() => prepararLector(f)} className="bg-[#22d3ee]/20 text-[#22d3ee] px-4 py-2 rounded-lg text-[10px] font-black uppercase">Ver</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className={`${bgTarjeta} border ${bordeColor} rounded-2xl p-4 flex flex-col`}>
          <textarea className="flex-1 bg-transparent border-none text-xs text-white outline-none resize-none" placeholder="Anotaciones..." />
          <button className="mt-4 w-full py-3 bg-[#22d3ee] text-black font-black text-[10px] rounded-xl uppercase">Guardar</button>
        </section>
      </div>
    </main>
  );
}