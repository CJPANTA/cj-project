import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { consultarAuraIA } from '../services/iaService';
import { NotebookCJ } from '../components/NotebookCJ';
import { useAura } from '../context/AuraContext';
import HistorialWidget from '../components/HistorialWidget';
import RecordatoriosWidget from '../components/RecordatoriosWidget';
import { supabase } from '../lib/supabaseClient';

// Componentes personalizados para tablas
function Table({ children }) {
  return (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600 text-sm">
        {children}
      </table>
    </div>
  );
}

function TableHead({ children }) {
  return <thead className="bg-gray-100 dark:bg-gray-800">{children}</thead>;
}

function TableBody({ children }) {
  return <tbody>{children}</tbody>;
}

function TableRow({ children }) {
  return <tr className="border-b border-gray-200 dark:border-gray-700">{children}</tr>;
}

function TableCell({ isHeader, children }) {
  if (isHeader) {
    return (
      <th className="px-4 py-2 text-left font-semibold border-r border-gray-200 dark:border-gray-600 last:border-r-0">
        {children}
      </th>
    );
  }
  return (
    <td className="px-4 py-2 border-r border-gray-200 dark:border-gray-600 last:border-r-0">
      {children}
    </td>
  );
}

const markdownComponents = {
  table: Table,
  thead: TableHead,
  tbody: TableBody,
  tr: TableRow,
  th: ({ children }) => <TableCell isHeader={true}>{children}</TableCell>,
  td: ({ children }) => <TableCell>{children}</TableCell>,
};

export default function Dashboard({ temaOscuro }) {
  const [saludo, setSaludo] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [respuestaIA, setRespuestaIA] = useState('');
  const [cargandoIA, setCargandoIA] = useState(false);
  const [fraseMotivacional, setFraseMotivacional] = useState('');
  const [ultimoPDF, setUltimoPDF] = useState(null);
  const [progresoExamenes, setProgresoExamenes] = useState({ promedio: 0, total: 0 });
  const [proximosRecordatorios, setProximosRecordatorios] = useState([]);
  const navigate = useNavigate();
  const { contexto } = useAura();

  const frases = [
    "💪 El éxito es la suma de pequeños esfuerzos repetidos día tras día.",
    "🧠 La fisioterapia no es solo tratar, es educar y prevenir.",
    "📚 Cada PDF leído es un paso más hacia tu especialización.",
    "🎯 La constancia vence al talento cuando el talento no es constante.",
    "🩺 Un buen fisioterapeuta nunca deja de aprender.",
    "🌟 Hoy es un buen día para repasar tu ciclo actual."
  ];

  useEffect(() => {
    const usuarioLogueado = localStorage.getItem('usuario_cj');
    if (!usuarioLogueado) navigate('/login');
    const hora = new Date().getHours();
    setSaludo(hora < 12 ? 'Buenos días' : hora < 18 ? 'Buenas tardes' : 'Buenas noches');

    const randomIndex = Math.floor(Math.random() * frases.length);
    setFraseMotivacional(frases[randomIndex]);

    const pdf = localStorage.getItem('ultimo_pdf_visto');
    if (pdf) setUltimoPDF(JSON.parse(pdf));

    cargarProgresoExamenes();
    cargarProximosRecordatorios();
  }, [navigate]);

  const cargarProgresoExamenes = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from('examenes')
      .select('puntuacion_total')
      .eq('user_id', user.id);
    if (!error && data && data.length > 0) {
      const total = data.length;
      const suma = data.reduce((acc, ex) => acc + ex.puntuacion_total, 0);
      const promedio = (suma / total).toFixed(1);
      setProgresoExamenes({ promedio, total });
    }
  };

  const cargarProximosRecordatorios = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const ahora = new Date().toISOString();
    const { data, error } = await supabase
      .from('recordatorios')
      .select('*')
      .eq('user_id', user.id)
      .gte('fecha_hora', ahora)
      .order('fecha_hora', { ascending: true })
      .limit(3);
    if (!error) setProximosRecordatorios(data || []);
  };

  const ejecutarConsultaIA = async () => {
    if (!busqueda.trim()) return;
    setCargandoIA(true);
    setRespuestaIA('');

    const ultimoPDFAlmacenado = localStorage.getItem('ultimo_pdf_visto');
    let contextoCompleto = { ...contexto };
    if (ultimoPDFAlmacenado) {
      contextoCompleto.ultimoPDF = JSON.parse(ultimoPDFAlmacenado);
    }

    const respuestaRaw = await consultarAuraIA(busqueda, contextoCompleto);
    setRespuestaIA(respuestaRaw);
    setCargandoIA(false);
  };

  const bgTarjeta = temaOscuro ? 'bg-black/20 border-gray-800' : 'bg-white border-gray-200 shadow-sm';
  const textoColor = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const bgInput = temaOscuro ? 'bg-black/20 border-white/10' : 'bg-gray-100 border-gray-300';
  const bgContexto = temaOscuro ? 'bg-[#22d3ee]/10 border-[#22d3ee]/30 text-[#22d3ee]' : 'bg-blue-50 border-blue-200 text-blue-700';
  const porcentaje = progresoExamenes.promedio;

  return (
    <main className="flex flex-col gap-8 p-4 md:p-8 max-w-7xl mx-auto w-full">
      <header className="flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <div>
            <h1 className={`text-4xl font-black tracking-tighter ${textoColor}`}>
              {saludo}, <span className="text-[#22d3ee]">Jorge Luis</span>
            </h1>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Proyecto CJ</p>
          </div>
          <div className="max-w-xs text-right">
            <p className="text-[11px] italic text-[#22d3ee]/80">{fraseMotivacional}</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${bgTarjeta} p-4 rounded-2xl border flex items-center gap-4`}>
          <div className="w-16 h-16 relative">
            <svg className="w-full h-full" viewBox="0 0 36 36">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#2d3748" strokeWidth="3" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#22d3ee" strokeWidth="3" strokeDasharray={`${porcentaje}, 100`} />
              <text x="18" y="22" textAnchor="middle" fill={temaOscuro ? "white" : "black"} fontSize="8" fontWeight="bold">{porcentaje || 0}%</text>
            </svg>
          </div>
          <div>
            <h3 className={`text-xs font-bold ${textoColor}`}>Promedio exámenes</h3>
            <p className="text-2xl font-black text-[#22d3ee]">{progresoExamenes.promedio || 0}%</p>
            <p className={`text-[10px] ${textoColor} opacity-70`}>{progresoExamenes.total} exámenes realizados</p>
          </div>
        </div>

        <div className={`${bgTarjeta} p-4 rounded-2xl border`}>
          <h3 className={`text-xs font-bold mb-1 ${textoColor}`}>📄 Último PDF visto</h3>
          {ultimoPDF ? (
            <>
              <p className="text-sm font-medium truncate">{ultimoPDF.nombre}</p>
              <p className="text-[10px] text-gray-500">{ultimoPDF.ciclo} • {ultimoPDF.materia}</p>
            </>
          ) : (
            <p className="text-sm text-gray-500">Aún no has abierto ningún PDF</p>
          )}
        </div>

        <div className={`${bgTarjeta} p-4 rounded-2xl border`}>
          <h3 className={`text-xs font-bold mb-2 ${textoColor}`}>📅 Próximos recordatorios</h3>
          {proximosRecordatorios.length === 0 ? (
            <p className="text-sm text-gray-500">No hay recordatorios próximos</p>
          ) : (
            <ul className="space-y-1">
              {proximosRecordatorios.map(rec => (
                <li key={rec.id} className="text-xs flex justify-between">
                  <span className="truncate">{rec.titulo}</span>
                  <span className="text-[10px] text-gray-400">{new Date(rec.fecha_hora).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

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

        {(contexto.ciclo || contexto.materia || contexto.archivo) && (
          <div className={`mb-4 p-3 rounded-xl border ${bgContexto} text-xs font-mono flex flex-wrap gap-2 items-center`}>
            <span className="font-bold">📌 Contexto activo:</span>
            {contexto.ciclo && <span className="bg-black/20 px-2 py-0.5 rounded-full">{contexto.ciclo}</span>}
            {contexto.materia && <span className="bg-black/20 px-2 py-0.5 rounded-full">{contexto.materia.replace(/_/g, ' ')}</span>}
            {contexto.archivo && <span className="bg-black/20 px-2 py-0.5 rounded-full truncate max-w-[200px]">{contexto.archivo.replace('.pdf', '')}</span>}
            <span className="text-[10px] opacity-70 ml-auto">(la IA usará este contexto)</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <input 
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && ejecutarConsultaIA()}
            placeholder="¿Qué patología o protocolo revisamos hoy?"
            className={`flex-1 ${bgInput} border p-4 rounded-2xl outline-none focus:border-[#22d3ee] transition-all text-sm ${textoColor}`}
          />
          <button 
            onClick={ejecutarConsultaIA}
            disabled={cargandoIA}
            className="px-6 py-4 bg-[#22d3ee] text-black font-black rounded-xl text-[10px] uppercase hover:scale-105 active:scale-95 transition-all disabled:opacity-50 w-full sm:w-auto"
          >
            {cargandoIA ? '...' : 'Consultar'}
          </button>
        </div>

        {respuestaIA && (
          <div className="mt-6 p-5 rounded-2xl bg-[#22d3ee]/5 border border-[#22d3ee]/20 backdrop-blur-sm overflow-x-auto">
            <div className={`prose prose-sm max-w-none ${temaOscuro ? 'prose-invert' : ''}`}>
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {respuestaIA}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </section>

      <RecordatoriosWidget temaOscuro={temaOscuro} />
      <HistorialWidget temaOscuro={temaOscuro} />
      <NotebookCJ temaOscuro={temaOscuro} />

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