import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import mapaDatos from '../data/mapa_carrion.json';

export default function AreaDeEstudio({ temaOscuro }) {
  const location = useLocation();
  const navigate = useNavigate();

  const cicloEnUrl = location.pathname.split('-')[1];
  const mostrarIndice = !cicloEnUrl || isNaN(cicloEnUrl) || !mapaDatos[cicloEnUrl];
  const cicloActual = mostrarIndice ? '05' : cicloEnUrl; // Por defecto al 05 que empiezas mañana

  const [cursos, setCursos] = useState([]);
  const [cursoActivo, setCursoActivo] = useState('');
  const [archivosCurso, setArchivosCurso] = useState([]);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);

  const GITHUB_USER = "CJPANTA"; 
  const GITHUB_REPO = "cj-project";

  useEffect(() => {
    if (mapaDatos[cicloActual]) {
      const listaCursos = Object.keys(mapaDatos[cicloActual]);
      setCursos(listaCursos);
      if (listaCursos.length > 0) setCursoActivo(listaCursos[0]);
    }
  }, [cicloActual]);

  useEffect(() => {
    if (cursoActivo && mapaDatos[cicloActual][cursoActivo]) {
      setArchivosCurso(mapaDatos[cicloActual][cursoActivo]);
    }
  }, [cursoActivo, cicloActual]);

  const bgTarjeta = temaOscuro ? 'bg-black/40 border-gray-800' : 'bg-white border-gray-200 shadow-sm';
  const textoColor = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const bordeColor = temaOscuro ? 'border-gray-800' : 'border-gray-200';

  const prepararLector = (nombreArchivo) => {
    const rawUrl = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/main/CICLO%2005/${encodeURIComponent(cursoActivo)}/${encodeURIComponent(nombreArchivo)}`;
    setArchivoSeleccionado({
      nombre: nombreArchivo,
      viewer: `https://docs.google.com/viewer?url=${encodeURIComponent(rawUrl)}&embedded=true`
    });
  };

  return (
    <main className="p-4 md:p-8 max-w-full overflow-hidden">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className={`text-3xl font-black tracking-tighter ${textoColor}`}>Repositorio <span className="text-[#22d3ee]">Ciclo {cicloActual}</span></h1>
          <p className="text-gray-500 text-[10px] font-black uppercase">Recursos Académicos e Institucionales</p>
        </div>
        <button onClick={() => navigate('/')} className="text-[#22d3ee] text-[10px] font-black uppercase border border-[#22d3ee]/30 px-4 py-2 rounded-xl">Volver</button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1 flex flex-col gap-2">
          {cursos.map((c, i) => (
            <button 
              key={i} 
              onClick={() => {setCursoActivo(c); setArchivoSeleccionado(null);}}
              className={`w-full p-4 rounded-xl text-left text-[11px] font-bold transition-all border ${cursoActivo === c ? 'bg-[#22d3ee] text-black border-[#22d3ee]' : `${bgTarjeta} ${textoColor} hover:border-[#22d3ee]/50`}`}
            >
              {c}
            </button>
          ))}
        </aside>

        <section className="lg:col-span-3">
          <div className={`${bgTarjeta} border ${bordeColor} rounded-3xl p-4 md:p-6 min-h-[400px]`}>
            {archivoSeleccionado ? (
              <div className="flex flex-col gap-4 h-full">
                <div className="flex justify-between items-center bg-black/20 p-3 rounded-xl">
                  <p className="text-[#22d3ee] text-[10px] font-black truncate max-w-[70%]">{archivoSeleccionado.nombre}</p>
                  <button onClick={() => setArchivoSeleccionado(null)} className="text-white text-[10px] font-black uppercase bg-red-500/20 px-3 py-1 rounded-lg">Cerrar</button>
                </div>
                <iframe src={archivoSeleccionado.viewer} className="w-full h-[600px] rounded-xl bg-white border-none" title="PDF" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {archivosCurso.map((f, i) => (
                  <div key={i} className={`${bgTarjeta} p-4 rounded-2xl flex justify-between items-center border ${bordeColor} hover:border-[#22d3ee]/30 transition-all`}>
                    <p className={`${textoColor} text-[11px] font-bold truncate pr-4`}>{f.replace('.pdf', '')}</p>
                    <button onClick={() => prepararLector(f)} className="bg-[#22d3ee] text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase">Ver</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}