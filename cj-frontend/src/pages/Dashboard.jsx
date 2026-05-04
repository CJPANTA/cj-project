import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { consultarAuraIA } from '../services/iaService';
import { NotebookCJ } from '../components/NotebookCJ';

export default function Dashboard({ temaOscuro }) {
  const [saludo, setSaludo] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [respuestaIA, setRespuestaIA] = useState('');
  const [cargandoIA, setCargandoIA] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Protección de ruta simple: si no hay "user" en el localstorage, manda al login
    const usuarioLogueado = localStorage.getItem('usuario_cj');
    if (!usuarioLogueado) {
      navigate('/login');
    }

    const hora = new Date().getHours();
    setSaludo(hora < 12 ? 'Buenos días' : hora < 18 ? 'Buenas tardes' : 'Buenas noches');
  }, [navigate]);

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
    <main className="flex flex-col gap-8 p-4 md:p-8 max-w-7xl mx-auto w-full">
      <header className="flex flex-col gap-2">
        <h1 className={`text-4xl font-black tracking-tighter ${textoColor}`}>
          {saludo}, <span className="text-[#22d3ee]">Jorge Luis</span>
        </h1>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Ecosistema CJ 2.0 • Ciclo 05</p>
      </header>

      {/* AURA INTELIGENTE RE-DISEÑADA */}
      <section className={`${bgTarjeta} p-6 rounded-3xl border transition-all`}>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 rounded-full bg-[#22d3ee] flex items-center justify-center animate-pulse">
            <span className="text-white text-xl">✨</span>
          </div>
          <div>
            <h2 className={`text-sm font-black uppercase tracking-tighter ${textoColor}`}>Oráculo Aura IA</h2>
            <p className="text-[10px] text-gray-500 font-bold">CONSULTA CLÍNICA INSTANTÁNEA</p>
          </div>
        </div>

        <div className="relative group">
          <input 
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && ejecutarConsultaIA()}
            placeholder="¿Qué patología o protocolo revisamos hoy?"
            className={`w-full bg-black/5 dark:bg-white/5 border border-white/10 p-4 pr-16 rounded-2xl outline-none focus:border-[#22d3ee] transition-all text-sm ${textoColor}`}
          />
          <button 
            onClick={ejecutarConsultaIA}
            disabled={cargandoIA}
            className="absolute right-2 top-2 bottom-2 px-4 bg-[#22d3ee] text-black font-black rounded-xl text-[10px] uppercase hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {cargandoIA ? '...' : 'Consultar'}
          </button>
        </div>

        {respuestaIA && (
          <div className="mt-6 p-5 rounded-2xl bg-[#22d3ee]/5 border border-[#22d3ee]/20 backdrop-blur-sm">
            <div className={`text-[13px] leading-relaxed whitespace-pre-wrap font-medium ${textoColor}`}>
              {respuestaIA}
            </div>
          </div>
        )}
      </section>

      <NotebookCJ />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/area-estudio" className={`p-8 rounded-3xl border ${bgTarjeta} flex flex-col items-center group hover:border-[#22d3ee] transition-all`}>
          <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">🎓</span>
          <span className="text-[#22d3ee] text-[11px] font-black uppercase">Repositorio</span>
        </Link>
        <Link to="/biblioteca" className={`p-8 rounded-3xl border ${bgTarjeta} flex flex-col items-center group hover:border-[#22d3ee] transition-all`}>
          <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">📚</span>
          <span className="text-[#22d3ee] text-[11px] font-black uppercase">Biblioteca</span>
        </Link>
        <Link to="/multimedia" className={`p-8 rounded-3xl border ${bgTarjeta} flex flex-col items-center group hover:border-[#22d3ee] transition-all`}>
          <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">📽️</span>
          <span className="text-[#22d3ee] text-[11px] font-black uppercase">Multimedia</span>
        </Link>
      </div>
    </main>
  );
}