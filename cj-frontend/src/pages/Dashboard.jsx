import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { consultarAuraIA } from '../services/iaService';
import { NotebookCJ } from '../components/NotebookCJ';

export default function Dashboard({ temaOscuro }) {
  const [saludo, setSaludo] = useState('');
  const [modo, setModo] = useState('academico');
  const [busqueda, setBusqueda] = useState('');
  const [respuestaIA, setRespuestaIA] = useState('');
  const [cargandoIA, setCargandoIA] = useState(false);

  useEffect(() => {
    const hora = new Date().getHours();
    setSaludo(hora < 12 ? 'Buenos días' : hora < 18 ? 'Buenas tardes' : 'Buenas noches');
  }, []);

  const ejecutarConsultaIA = async () => {
    if (!busqueda.trim()) return;
    setCargandoIA(true);
    setRespuestaIA(''); 
    const respuesta = await consultarAuraIA(busqueda);
    setRespuestaIA(respuesta);
    setCargandoIA(false);
  };

  const bgTarjeta = temaOscuro ? 'bg-black/20 border-gray-800' : 'bg-white border-gray-200 shadow-sm';
  const textoColor = temaOscuro ? 'text-white' : 'text-[#0f172a]';

  return (
    <main className="flex flex-col gap-6 animate-fade-in relative transition-colors duration-500">
      {/* HEADER PERSONALIZADO */}
      <header className={`flex flex-col md:flex-row justify-between items-center p-6 rounded-3xl border ${bgTarjeta}`}>
        <div className="flex items-center gap-4">
          <img src="/logos_cj_circular.png" className={`w-16 h-16 rounded-full border-2 border-[#22d3ee]/20 ${temaOscuro ? 'invert opacity-80' : ''}`} alt="Logo CJ" />
          <div>
            <h1 className={`text-2xl font-black uppercase ${textoColor}`}>{saludo}, Jorge Luis</h1>
            <p className="text-[#94a3b8] text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
              {modo === 'academico' ? '🎯 Modo: Aprendizaje Activo' : '🏥 Modo: Gestión Clínica'}
            </p>
          </div>
        </div>
        
        {/* BOTONES DE MODO LIMPIOS (Sin el reproductor falso) */}
        <div className="flex bg-black/10 p-1 rounded-xl mt-4 md:mt-0 gap-2">
          <button onClick={() => setModo('academico')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase ${modo === 'academico' ? 'bg-[#22d3ee]/20 text-[#22d3ee]' : 'text-gray-500 hover:text-white transition-colors'}`}>Estudiante</button>
          <button onClick={() => setModo('clinico')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase ${modo === 'clinico' ? 'bg-[#10b981]/20 text-[#10b981]' : 'text-gray-500 hover:text-white transition-colors'}`}>Licenciado</button>
        </div>
      </header>

      {/* EL ORÁCULO IA */}
      <section className={`p-6 rounded-3xl border ${bgTarjeta} relative shadow-lg`}>
        <div className="flex items-center gap-4">
          <span className="text-2xl">{cargandoIA ? '🌀' : '🔮'}</span>
          <input 
            type="text" 
            value={busqueda} 
            onChange={(e) => setBusqueda(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && ejecutarConsultaIA()}
            placeholder="Pregúntale a Aura IA sobre anatomía o protocolos..." 
            className={`w-full bg-transparent outline-none font-bold ${textoColor}`} 
          />
          <button 
            onClick={ejecutarConsultaIA}
            disabled={cargandoIA}
            className={`px-6 py-2 rounded-xl font-black text-[10px] uppercase transition-all ${cargandoIA ? 'bg-gray-500 text-white' : 'bg-[#22d3ee] text-black hover:scale-105'}`}
          >
            {cargandoIA ? 'Pensando...' : 'Consultar'}
          </button>
        </div>

        {respuestaIA && (
          <div className={`mt-6 p-6 rounded-2xl border animate-in fade-in zoom-in duration-300 ${temaOscuro ? 'bg-black/40 border-[#22d3ee]/30' : 'bg-blue-50 border-blue-200'}`}>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-[#22d3ee] font-black uppercase text-[10px] tracking-widest">Respuesta del Oráculo Aura</h4>
              <button onClick={() => setRespuestaIA('')} className="text-gray-500 hover:text-red-500 text-[10px] font-bold uppercase">Limpiar</button>
            </div>
            <div className={`text-xs leading-relaxed whitespace-pre-wrap ${textoColor}`}>
              {respuestaIA}
            </div>
          </div>
        )}
      </section>

      {/* NOTEBOOK CJ (Solo en el Dashboard principal) */}
      <NotebookCJ />

      {/* ACCESOS RÁPIDOS ACADÉMICOS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/area-estudio" className={`p-8 rounded-3xl border ${bgTarjeta} flex flex-col items-center group hover:border-[#22d3ee] transition-all shadow-md`}>
          <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">🎓</span>
          <span className="text-[#22d3ee] text-[11px] font-black uppercase tracking-widest">Repositorio</span>
        </Link>
        <Link to="/biblioteca" className={`p-8 rounded-3xl border ${bgTarjeta} flex flex-col items-center group hover:border-[#22d3ee] transition-all shadow-md`}>
          <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">📚</span>
          <span className="text-[#22d3ee] text-[11px] font-black uppercase tracking-widest">Biblioteca</span>
        </Link>
        <Link to="/multimedia" className={`p-8 rounded-3xl border ${bgTarjeta} flex flex-col items-center group hover:border-[#22d3ee] transition-all shadow-md`}>
          <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">🖼️</span>
          <span className="text-[#22d3ee] text-[11px] font-black uppercase tracking-widest">Multimedia</span>
        </Link>
      </div>
    </main>
  );
}