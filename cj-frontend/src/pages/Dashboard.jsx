import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { consultarAuraIA } from '../services/iaService';
import { NotebookCJ } from '../components/NotebookCJ';
import TutorChat from '../components/TutorChat';
import { useAura } from '../context/AuraContext';
import HistorialWidget from '../components/HistorialWidget';
import RecordatoriosWidget from '../components/RecordatoriosWidget';
import { supabase } from '../lib/supabaseClient';

export default function Dashboard({ temaOscuro }) {
  const [saludo, setSaludo] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [respuestaIA, setRespuestaIA] = useState('');
  const [cargandoIA, setCargandoIA] = useState(false);
  const [fraseMotivacional, setFraseMotivacional] = useState('');
  const [ultimoPDF, setUltimoPDF] = useState(null);
  const [progresoExamenes, setProgresoExamenes] = useState({ promedio: 0, total: 0 });
  const [proximosRecordatorios, setProximosRecordatorios] = useState([]);
  const [historialConversacion, setHistorialConversacion] = useState([]);
  const [generandoFrase, setGenerandoFrase] = useState(false);
  const [resumiendoPDF, setResumiendoPDF] = useState(false);
  const navigate = useNavigate();
  const { contexto } = useAura();

  // Estados para paneles laterales
  const [panelNotasAbierto, setPanelNotasAbierto] = useState(false);
  const [panelTutorAbierto, setPanelTutorAbierto] = useState(false);

  const frasesEstaticas = [
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

    const randomIndex = Math.floor(Math.random() * frasesEstaticas.length);
    setFraseMotivacional(frasesEstaticas[randomIndex]);

    const pdf = localStorage.getItem('ultimo_pdf_visto');
    if (pdf) setUltimoPDF(JSON.parse(pdf));

    cargarProgresoExamenes();
    cargarProximosRecordatorios();
  }, [navigate]);

  const cargarProgresoExamenes = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase.from('examenes').select('puntuacion_total').eq('user_id', user.id);
    if (!error && data?.length) {
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
    const { data, error } = await supabase.from('recordatorios').select('*').eq('user_id', user.id).gte('fecha_hora', ahora).order('fecha_hora').limit(3);
    if (!error) setProximosRecordatorios(data || []);
  };

  const generarFraseIA = async () => {
    setGenerandoFrase(true);
    const prompt = "Actúa como un motivador experto en fisioterapia. Genera una frase corta, original y poderosa para inspirar a un estudiante de fisioterapia a seguir estudiando. Responde solo con la frase, sin comillas ni texto adicional.";
    const respuesta = await consultarAuraIA(prompt, {});
    setFraseMotivacional(respuesta || "🌟 Hoy es un excelente día para aprender algo nuevo.");
    setGenerandoFrase(false);
  };

  const resumirUltimoPDF = async () => {
    if (!ultimoPDF) {
      setRespuestaIA("📄 No has abierto ningún PDF aún. Ve al Repositorio y abre un documento para poder resumirlo.");
      return;
    }
    setResumiendoPDF(true);
    setRespuestaIA('');
    const prompt = `Actúa como un tutor experto en fisioterapia. El usuario ha estado leyendo el siguiente documento:
    Título: ${ultimoPDF.nombre}
    Ciclo: ${ultimoPDF.ciclo}
    Materia: ${ultimoPDF.materia}
    
    Genera un resumen claro y estructurado de los puntos clave. Incluye los conceptos más importantes y, si es posible, 3 preguntas de repaso.`;
    const respuesta = await consultarAuraIA(prompt, { ...contexto, ultimoPDF });
    setRespuestaIA(respuesta);
    setResumiendoPDF(false);
  };

  const ejecutarConsultaIA = async () => {
    if (!busqueda.trim()) return;
    setCargandoIA(true);
    setRespuestaIA('');
    const ultimoPDFAlmacenado = localStorage.getItem('ultimo_pdf_visto');
    let contextoCompleto = { ...contexto };
    if (ultimoPDFAlmacenado) contextoCompleto.ultimoPDF = JSON.parse(ultimoPDFAlmacenado);
    const historialLimitado = historialConversacion.slice(-4);
    let respuestaRaw = await consultarAuraIA(busqueda, contextoCompleto, historialLimitado);
    respuestaRaw = respuestaRaw.replace(/[\*\-=]{3,}/g, '');
    setHistorialConversacion(prev => [...prev.slice(-4), { role: 'user', content: busqueda }, { role: 'assistant', content: respuestaRaw }]);
    setRespuestaIA(respuestaRaw);
    setBusqueda('');
    setCargandoIA(false);
  };

  const bgTarjeta = temaOscuro ? 'bg-black/20 border-gray-800' : 'bg-white border-gray-200 shadow-sm';
  const textoColor = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const bgInput = temaOscuro ? 'bg-black/20 border-white/10' : 'bg-gray-100 border-gray-300';
  const bgContexto = temaOscuro ? 'bg-[#22d3ee]/10 border-[#22d3ee]/30 text-[#22d3ee]' : 'bg-blue-50 border-blue-200 text-blue-700';
  const porcentaje = progresoExamenes.promedio;

  const IconRefresh = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );

  const IconSummarize = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0z" />
    </svg>
  );

  const IconChat = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.136-.848-2.1-1.98-2.193a48.572 48.572 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286m0 0c.078.057.158.112.24.166" />
    </svg>
  );

  return (
    <main className="flex flex-col gap-8 p-4 md:p-8 max-w-7xl mx-auto w-full">
      <header className="flex flex-col gap-2">
        <div className="flex justify-between items-start flex-wrap gap-2">
          <div>
            <h1 className={`text-4xl font-black tracking-tighter ${textoColor}`}>{saludo}, <span className="text-[#22d3ee]">Jorge Luis</span></h1>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Proyecto CJ</p>
          </div>
          <div className="flex items-center gap-2 max-w-xs text-right bg-black/10 rounded-full px-3 py-1">
            <p className="text-[11px] italic text-[#22d3ee]/80 truncate">{fraseMotivacional}</p>
            <button onClick={generarFraseIA} disabled={generandoFrase} className="p-1 rounded-full hover:bg-white/10 transition-colors" title="Nueva frase">
              <IconRefresh />
            </button>
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
              <button onClick={resumirUltimoPDF} disabled={resumiendoPDF} className="mt-2 text-[#22d3ee] text-xs font-bold flex items-center gap-1 hover:underline">
                <IconSummarize /> {resumiendoPDF ? 'Resumiendo...' : 'Resumir PDF'}
              </button>
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
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {respuestaIA}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </section>

      <RecordatoriosWidget temaOscuro={temaOscuro} />
      <HistorialWidget temaOscuro={temaOscuro} />

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

      {/* Paneles laterales flotantes */}
      {/* Panel de notas */}
      {panelNotasAbierto && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setPanelNotasAbierto(false)} />
          <div className="relative w-full max-w-md h-full bg-white dark:bg-[#0a141d] shadow-2xl animate-slide-in-right">
            <NotebookCJ temaOscuro={temaOscuro} cerrarPanel={() => setPanelNotasAbierto(false)} />
          </div>
        </div>
      )}

      {/* Panel del tutor - AHORA CON EL COMPONENTE TutorChat */}
      {panelTutorAbierto && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setPanelTutorAbierto(false)} />
          <div className="relative w-full max-w-md h-full bg-white dark:bg-[#0a141d] shadow-2xl animate-slide-in-right">
            <TutorChat temaOscuro={temaOscuro} onCerrar={() => setPanelTutorAbierto(false)} />
          </div>
        </div>
      )}

      {/* Botones flotantes para abrir paneles (solo visibles en móvil o siempre) */}
      <div className="fixed bottom-6 right-6 flex gap-3 z-40">
        <button
          onClick={() => setPanelNotasAbierto(true)}
          className="p-3 rounded-full bg-[#22d3ee] text-black shadow-lg hover:scale-105 transition-all"
          title="Notas y grabaciones"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
        </button>
        <button
          onClick={() => setPanelTutorAbierto(true)}
          className="p-3 rounded-full bg-purple-600 text-white shadow-lg hover:scale-105 transition-all"
          title="Tutor personal Aura"
        >
          <IconChat />
        </button>
      </div>
    </main>
  );
}