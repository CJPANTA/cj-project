import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { consultarAuraIA } from '../services/iaService';
import { NotebookCJ } from '../components/NotebookCJ';
import TutorChat from '../components/TutorChat';
import { useAura } from '../context/AuraContext';
import HistorialWidget from '../components/HistorialWidget';
import CalendarioWidget from '../components/CalendarioWidget';
import { supabase } from '../lib/supabaseClient';
import FavoritosWidget from '../components/FavoritosWidget';
import NotificacionesActivador from '../components/NotificacionesActivador';
import DashboardGerencial from '../components/clinica/DashboardGerencial';
import { mdAHtml } from '../utils/printService';
import PrintButton from '../components/PrintButton';
import { hablar, consultaMencionaVideo } from '../utils/vozService';

export default function Dashboard({ temaOscuro }) {
  const [saludo, setSaludo] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [respuestaIA, setRespuestaIA] = useState('');
  const [cargandoIA, setCargandoIA] = useState(false);
  const [fraseMotivacional, setFraseMotivacional] = useState('');
  const [ultimoPDF, setUltimoPDF] = useState(null);
  const [progresoExamenes, setProgresoExamenes] = useState({ promedio: 0, total: 0 });
  const [historialConversacion, setHistorialConversacion] = useState(() => {
    try {
      const saved = sessionStorage.getItem('cj_aura_chat');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [puedeYouTube, setPuedeYouTube] = useState(false);
  const [generandoFrase, setGenerandoFrase] = useState(false);
  const [resumiendoPDF, setResumiendoPDF] = useState(false);
  const [escuchandoVoz, setEscuchandoVoz] = useState(false);
  const [reproduciendoAudio, setReproduciendoAudio] = useState(false);
  const [audioPausado, setAudioPausado] = useState(false);
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [nickname, setNickname] = useState('');
  const [rolUsuario, setRolUsuario] = useState(null);
  const [centroId, setCentroId] = useState(null);
  const [kpisClinicos, setKpisClinicos] = useState({ pacientesActivos: 0, evaluacionesPendientes: 0, citasHoy: 0 });
  const [proximaCita, setProximaCita] = useState(null);
  const [progresoDolor, setProgresoDolor] = useState({ porcentaje: 0, mensaje: '' });
  const [ejerciciosCasa, setEjerciciosCasa] = useState([]);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();
  const { contexto } = useAura();

  const [panelTutorAbierto, setPanelTutorAbierto] = useState(false);
  const [panelNotasAbierto, setPanelNotasAbierto] = useState(false);

  const [modoNavegacion, setModoNavegacion] = useState(() => {
    return localStorage.getItem('cj_modo_navegacion') || 'academia';
  });

  useEffect(() => {
    const handleChange = (e) => setModoNavegacion(e.detail);
    window.addEventListener('cj-modo-change', handleChange);
    return () => window.removeEventListener('cj-modo-change', handleChange);
  }, []);

  useEffect(() => {
    try {
      const ultimos6 = historialConversacion.slice(-6);
      sessionStorage.setItem('cj_aura_chat', JSON.stringify(ultimos6));
    } catch (e) {
      console.warn('No se pudo guardar la conversación:', e);
    }
  }, [historialConversacion]);

  const cargarKPIsClinicos = async (centro) => {
    try {
      const { count: pacientesActivos, error: errPac } = await supabase
        .from('pacientes')
        .select('*', { count: 'exact', head: true })
        .eq('centro_id', centro)
        .eq('estado', 'Activo');

      if (!errPac) {
        setKpisClinicos(prev => ({ ...prev, pacientesActivos: pacientesActivos || 0 }));
      }
      setKpisClinicos(prev => ({ ...prev, evaluacionesPendientes: 0 }));
      setKpisClinicos(prev => ({ ...prev, citasHoy: 0 }));
    } catch (error) {
      console.error('Error cargando KPIs:', error);
    }
  };

  const cargarPerfil = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: perfil } = await supabase
      .from('profiles')
      .select('nombre_completo, rol, centro_id, nickname')
      .eq('id', user.id)
      .single();
    if (perfil) {
      setNombreUsuario(perfil.nombre_completo || 'Usuario');
      setNickname(perfil.nickname || '');
      setRolUsuario(perfil.rol);
      setCentroId(perfil.centro_id || null);
      
      if (perfil.centro_id) {
        cargarKPIsClinicos(perfil.centro_id);
      }
      
      if (perfil.rol === 5) {
        cargarDatosPaciente(user.id);
      }
    }
  };

  const cargarDatosPaciente = async (userId) => {
    try {
      const { data: pac } = await supabase
        .from('pacientes')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (!pac) return;

      const { data: cita } = await supabase
        .from('citas')
        .select('*, terapeuta_id')
        .eq('paciente_id', pac.id)
        .gte('fecha_hora', new Date().toISOString())
        .order('fecha_hora', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (cita) {
        let nombreTerapeuta = 'Terapeuta asignado';
        if (cita.terapeuta_id) {
          const { data: terapeutas } = await supabase.rpc('obtener_terapeutas', { ids: [cita.terapeuta_id] });
          if (terapeutas && terapeutas.length > 0) {
            nombreTerapeuta = terapeutas[0].nombre_completo;
          }
        }
        setProximaCita({ ...cita, nombreTerapeuta });
      }

      const { data: sesiones } = await supabase
        .from('sesiones')
        .select('eva_inicial, eva_final, fecha_sesion')
        .eq('paciente_id', pac.id)
        .order('fecha_sesion', { ascending: true });

      if (sesiones && sesiones.length > 0) {
        const primeraSesion = sesiones[0];
        const ultimaSesion = sesiones[sesiones.length - 1];
        
        if (primeraSesion.eva_inicial > 0) {
          const mejora = Math.round(((primeraSesion.eva_inicial - ultimaSesion.eva_final) / primeraSesion.eva_inicial) * 100);
          setProgresoDolor({
            porcentaje: Math.max(0, mejora),
            mensaje: mejora > 0 ? `Tu dolor ha bajado un ${mejora}% desde que comenzaste. ¡Sigue así!` : 'Estamos trabajando en tu recuperación.'
          });
        }
      }

      const { data: evaluacion } = await supabase
        .from('evaluaciones')
        .select('datos_regiones')
        .eq('paciente_id', pac.id)
        .eq('estado', 'aprobado')
        .order('fecha', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (evaluacion?.datos_regiones) {
        let datos = evaluacion.datos_regiones;
        if (typeof datos === 'string') {
          try { datos = JSON.parse(datos); } catch(e){}
        }
        if (datos._plan_ejercicios && Array.isArray(datos._plan_ejercicios)) {
          setEjerciciosCasa(datos._plan_ejercicios);
        }
      }
    } catch (error) {
      console.error('Error cargando datos del paciente:', error);
    }
  };

  const limpiarRespuesta = (texto) => {
    let limpio = texto.replace(/[\*\-=]{3,}/g, '');
    return limpio.trim();
  };

  const cargarFraseInicial = async () => {
    const prompt = "Actúa como un motivador experto en fisioterapia. Genera una frase corta, original y poderosa para inspirar a un estudiante de fisioterapia a seguir estudiando. Responde solo con la frase, sin comillas ni texto adicional.";
    const respuesta = await consultarAuraIA(prompt, {});
    setFraseMotivacional(respuesta || "🌟 Hoy es un excelente día para aprender algo nuevo.");
  };

  useEffect(() => {
    const usuarioLogueado = localStorage.getItem('usuario_cj');
    if (!usuarioLogueado) navigate('/login');
    const hora = new Date().getHours();
    setSaludo(hora < 12 ? 'Buenos días' : hora < 18 ? 'Buenas tardes' : 'Buenas noches');
    cargarFraseInicial();
    const pdf = localStorage.getItem('ultimo_pdf_visto');
    if (pdf) setUltimoPDF(JSON.parse(pdf));
    cargarProgresoExamenes();
    cargarPerfil();
    return () => { window.speechSynthesis.cancel(); };
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

  const iniciarDictado = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Tu navegador no soporta reconocimiento de voz.");
      return;
    }
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setEscuchandoVoz(true);
    recognition.onend = () => setEscuchandoVoz(false);
    recognition.onerror = (event) => {
      console.error(event.error);
      setEscuchandoVoz(false);
      alert("Error al escuchar: " + event.error);
    };
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setBusqueda(transcript);
      ejecutarConsultaIA(transcript);
    };
    recognition.start();
  };

  const ejecutarConsultaIA = async (texto = null) => {
    const consulta = texto !== null ? texto : busqueda;
    if (!consulta.trim()) return;
    setCargandoIA(true);
    setRespuestaIA('');

    const ultimoPDFAlmacenado = localStorage.getItem('ultimo_pdf_visto');
    let contextoCompleto = { ...contexto };
    if (ultimoPDFAlmacenado) contextoCompleto.ultimoPDF = JSON.parse(ultimoPDFAlmacenado);

    const historialLimitado = historialConversacion.slice(-6);

    let respuestaRaw = await consultarAuraIA(consulta, contextoCompleto, historialLimitado);
    respuestaRaw = limpiarRespuesta(respuestaRaw);

    setHistorialConversacion(prev =>
      [...prev, { role: 'user', content: consulta }, { role: 'assistant', content: respuestaRaw }].slice(-6)
    );

    const mencionaVideo = consultaMencionaVideo(consulta) || consultaMencionaVideo(respuestaRaw);
    setPuedeYouTube(mencionaVideo);

    setRespuestaIA(respuestaRaw);
    setBusqueda('');
    setCargandoIA(false);
  };

  const nuevaConversacion = () => {
    setHistorialConversacion([]);
    setRespuestaIA('');
    setPuedeYouTube(false);
    try {
      sessionStorage.removeItem('cj_aura_chat');
    } catch (_) { /* noop */ }
  };

  const buscarReferencias = () => {
    if (!busqueda && !respuestaIA) return;
    const query = encodeURIComponent(busqueda || respuestaIA.slice(0, 50));
    window.open(`https://www.youtube.com/results?search_query=${query}+fisioterapia`, '_blank');
  };

  const handleTextareaChange = (e) => {
    const textarea = e.target;
    setBusqueda(textarea.value);
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      ejecutarConsultaIA();
    }
  };

  const bgTarjeta = temaOscuro ? 'bg-black/20 border-gray-800' : 'bg-white border-gray-200 shadow-sm';
  const textoColor = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const bgInput = temaOscuro ? 'bg-black/20 border-white/10' : 'bg-gray-100 border-gray-300';
  const bgContexto = temaOscuro ? 'bg-[#22d3ee]/10 border-[#22d3ee]/30 text-[#22d3ee]' : 'bg-blue-50 border-blue-200 text-blue-700';
  const porcentaje = progresoExamenes.promedio;

  const nombreMostrado = rolUsuario === 5 
    ? (nombreUsuario || 'Paciente') 
    : (nickname?.trim() || (nombreUsuario || '').split(/\s+/)[0] || 'Usuario');

  const IconRefresh = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>);
  const IconSummarize = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-5.25 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0z" /></svg>);
  const IconChat = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.136-.848-2.1-1.98-2.193a48.572 48.572 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286m0 0c.078.057.158.112.24.166" /></svg>);

  // ==========================================
  // CASO 1: PACIENTE (rol 5)
  // ==========================================
  if (rolUsuario === 5) {
    return (
      <main className="flex flex-col gap-8 p-4 md:p-8 max-w-5xl mx-auto w-full">
        <header className="flex flex-col gap-2 mb-2">
          <div>
            <h1 className={`text-4xl font-black tracking-tighter ${textoColor}`}>
              Hola, <span className="text-[#22d3ee]">{nombreMostrado}</span> 👋
            </h1>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">
              Mi Espacio Personal
            </p>
          </div>
        </header>

        <div className={`${bgTarjeta} p-6 rounded-3xl border flex flex-col md:flex-row justify-between items-center gap-4`}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#22d3ee]/20 text-[#22d3ee] flex items-center justify-center text-2xl">📅</div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-[#22d3ee]">Mi Próxima Cita</h2>
              {proximaCita ? (
                <>
                  <p className={`text-lg font-bold capitalize ${textoColor}`}>
                    {new Date(proximaCita.fecha_hora).toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}, {new Date(proximaCita.fecha_hora).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-xs text-gray-500">Centro: {proximaCita.centro_id} · Terapeuta: {proximaCita.nombreTerapeuta}</p>
                </>
              ) : (
                <p className={`text-sm mt-1 ${textoColor} opacity-70`}>No tienes citas programadas por ahora.</p>
              )}
            </div>
          </div>
          <Link to="/mis-citas" className="px-6 py-3 bg-[#22d3ee] text-black font-black rounded-xl text-xs uppercase hover:scale-105 transition-all">
            Ver todas mis citas →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`${bgTarjeta} p-6 rounded-3xl border flex flex-col justify-between h-48`}>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">📋</span>
                <h2 className={`text-sm font-black uppercase tracking-tighter ${textoColor}`}>Mi Ficha</h2>
              </div>
              <p className="text-xs text-gray-500 mt-2">Revisa tus datos personales, tu diagnóstico actual y el historial de tus sesiones.</p>
            </div>
            <Link to="/mi-ficha" className="mt-4 text-[#22d3ee] text-xs font-bold hover:underline">Abrir mi ficha →</Link>
          </div>

          <div className={`${bgTarjeta} p-6 rounded-3xl border flex flex-col justify-between h-48`}>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">📈</span>
                <h2 className={`text-sm font-black uppercase tracking-tighter ${textoColor}`}>Mi Progreso</h2>
              </div>
              <p className="text-xs text-gray-500 mt-2">{progresoDolor.mensaje || 'Aún no hay suficientes sesiones para calcular tu progreso.'}</p>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 mt-4">
              <div className="bg-emerald-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${progresoDolor.porcentaje}%` }}></div>
            </div>
          </div>
        </div>

        <div className={`${bgTarjeta} p-6 rounded-3xl border`}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🏋️‍♂️</span>
            <h2 className={`text-sm font-black uppercase tracking-tighter ${textoColor}`}>Ejercicios para Casa</h2>
          </div>
          <p className="text-xs text-gray-500 mb-4">Estos son los ejercicios que tu fisioterapeuta te asignó.</p>
          <div className="flex flex-wrap gap-2">
            {ejerciciosCasa.length > 0 ? (
              ejerciciosCasa.map((ej, index) => (
                <span key={index} className="px-3 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg text-xs font-bold">
                  {ej.nombre} {ej.series ? `(${ej.series}x${ej.repeticiones || ''}${ej.duracion_segundos ? 's' : ' reps'})` : ''}
                </span>
              ))
            ) : (
              <p className={`text-sm ${textoColor} opacity-70`}>No tienes ejercicios asignados por ahora.</p>
            )}
          </div>
        </div>

        <div className="flex justify-center mt-4">
          <button onClick={() => navigate('/login')} className="text-red-500 hover:text-red-400 text-sm font-bold">Cerrar sesión</button>
        </div>
      </main>
    );
  }

  // ==========================================
  // CASO 2: LICENCIADO (3), DEMO (6), ADMIN CENTRO (7), INDEPENDIENTE (8)
  // ==========================================
  if (rolUsuario === 3 || rolUsuario === 6 || rolUsuario === 7 || rolUsuario === 8) {
    return (
      <main className="flex flex-col gap-8 p-4 md:p-8 max-w-7xl mx-auto w-full">
        <header className="flex flex-col gap-2">
          <div className="flex justify-between items-start flex-wrap gap-2">
            <div>
              <h1 className={`text-4xl font-black tracking-tighter ${textoColor}`}>{saludo}, <span className="text-[#22d3ee]">{nombreMostrado}</span></h1>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Dashboard Clínico</p>
              {centroId && <p className="text-[10px] text-emerald-400 font-mono font-bold">Centro: {centroId}</p>}
            </div>
            
                      {/* LOGO DINÁMICO AQUÍ */}
          <div className="flex items-center gap-3 bg-white dark:bg-black/20 px-4 py-2 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm min-h-[48px]">
            <img 
              src={`https://raw.githubusercontent.com/CJPANTA/cj-project/main/frontend/public/logo_centros/${centroId?.toUpperCase() || 'CJ'}.png`} 
              alt="Logo Centro" 
              className="h-8 w-auto max-w-[120px] object-contain" 
              onError={(e) => { 
                e.target.onerror = null; // Evita un bucle infinito si el fallback también falla
                e.target.src = "/logos_cj_circular.png"; // Mismo fallback que usaste en el Sidebar
              }}
            />
          </div>
          </div>
        </header>

        <DashboardGerencial centroId={centroId} temaOscuro={temaOscuro} esDirectorGlobal={false} />

        <section className={`${bgTarjeta} p-6 rounded-3xl border transition-all`}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#22d3ee] flex items-center justify-center animate-pulse"><span className="text-white text-xl">✨</span></div>
            <div className="flex-1">
              <h2 className={`text-sm font-black uppercase tracking-tighter ${textoColor}`}>Oráculo Aura IA</h2>
              <p className="text-[10px] text-gray-500 font-bold">CONSULTA CLÍNICA INSTANTÁNEA</p>
            </div>
            {historialConversacion.length > 0 && (
              <button onClick={nuevaConversacion} className="px-3 py-1.5 rounded-full bg-purple-600/20 border border-purple-500/40 text-purple-400 text-[10px] font-black uppercase tracking-wider hover:bg-purple-600/30 transition-all" title="Borrar memoria del chat">
                🔄 Nueva conversación
              </button>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <textarea value={busqueda} onChange={handleTextareaChange} onKeyDown={handleKeyDown} placeholder="¿Qué patología o protocolo revisamos hoy?" className={`w-full ${bgInput} border p-4 rounded-2xl outline-none focus:border-[#22d3ee] transition-all text-sm ${textoColor} resize-none overflow-hidden min-h-[60px]`} rows={1} style={{ height: 'auto' }} />
              <button onClick={iniciarDictado} className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full ${escuchandoVoz ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all`}>🎙️</button>
            </div>
            <button onClick={() => ejecutarConsultaIA()} disabled={cargandoIA} className="px-6 py-4 bg-[#22d3ee] text-black font-black rounded-xl text-[10px] uppercase hover:scale-105 active:scale-95 transition-all disabled:opacity-50 w-full sm:w-auto">{cargandoIA ? '...' : 'Consultar'}</button>
          </div>
          {respuestaIA && (
            <div className="mt-6 p-5 rounded-2xl bg-[#22d3ee]/5 border border-[#22d3ee]/20 backdrop-blur-sm relative">
              <div className="flex gap-2 absolute top-2 right-2">
                <button
                  onClick={() => hablar(respuestaIA, {
                    onStart: () => { setReproduciendoAudio(true); setAudioPausado(false); },
                    onEnd: () => { setReproduciendoAudio(false); setAudioPausado(false); },
                    onError: () => { setReproduciendoAudio(false); setAudioPausado(false); },
                    onPause: () => { setAudioPausado(true); setReproduciendoAudio(true); },
                    onResume: () => { setAudioPausado(false); setReproduciendoAudio(true); },
                  })}
                  className={`p-2 rounded-full ${reproduciendoAudio ? (audioPausado ? 'bg-yellow-600' : 'bg-green-800') : 'bg-green-600'} text-white hover:bg-opacity-80 transition-all`}
                >
                  {reproduciendoAudio ? (audioPausado ? '▶️' : '⏸️') : '🔊'}
                </button>
                {puedeYouTube && (
                  <button onClick={buscarReferencias} className="p-2 rounded-full bg-yellow-600 text-white hover:bg-yellow-700 transition-all">📺</button>
                )}
                <PrintButton
                  titulo="Aura, tu asistente clínico"
                  subtitulo={busqueda ? `Consulta: ${busqueda.slice(0, 80)}` : ''}
                  contenido={mdAHtml(respuestaIA)}
                  metadata={{ fecha: new Date().toLocaleDateString('es-PE'), autor: 'Aura IA', centro: 'CJ Fisioterapia' }}
                  className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition-all"
                />
              </div>
              <div className={`prose prose-sm max-w-none ${temaOscuro ? 'prose-invert' : ''} mt-6`} dangerouslySetInnerHTML={{ __html: mdAHtml(respuestaIA) }} />
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/clinica/pacientes" className={`p-8 rounded-3xl border ${bgTarjeta} flex flex-col items-center group hover:border-emerald-400 transition-all`}>
            <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">👥</span>
            <span className="text-emerald-400 text-[11px] font-black uppercase">Pacientes</span>
          </Link>
          <Link to="/clinica/agenda" className={`p-8 rounded-3xl border ${bgTarjeta} flex flex-col items-center group hover:border-emerald-400 transition-all`}>
            <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">📅</span>
            <span className="text-emerald-400 text-[11px] font-black uppercase">Agenda</span>
          </Link>
          <Link to="/clinica/programacion" className={`p-8 rounded-3xl border ${bgTarjeta} flex flex-col items-center group hover:border-emerald-400 transition-all`}>
            <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">🗓️</span>
            <span className="text-emerald-400 text-[11px] font-black uppercase">Programación</span>
          </Link>
        </div>

        <div className="fixed bottom-6 right-6 flex gap-3 z-40">
          <button onClick={() => setPanelNotasAbierto(true)} className="p-3 rounded-full bg-[#22d3ee] text-black shadow-lg hover:scale-105 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
          </button>
          <button onClick={() => setPanelTutorAbierto(true)} className="p-3 rounded-full bg-purple-600 text-white shadow-lg hover:scale-105 transition-all"><IconChat /></button>
        </div>
        {panelNotasAbierto && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setPanelNotasAbierto(false)} />
            <div className="relative w-full max-w-md h-full bg-white dark:bg-[#0a141d] shadow-2xl animate-slide-in-right"><NotebookCJ temaOscuro={temaOscuro} cerrarPanel={() => setPanelNotasAbierto(false)} /></div>
          </div>
        )}
        {panelTutorAbierto && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setPanelTutorAbierto(false)} />
            <div className="relative w-full max-w-[90%] sm:max-w-md h-full bg-white dark:bg-[#0a141d] shadow-2xl animate-slide-in-right overflow-y-auto"><TutorChat temaOscuro={temaOscuro} onCerrar={() => setPanelTutorAbierto(false)} /></div>
          </div>
        )}
      </main>
    );
  }

  // ==========================================
  // CASO 3: DIRECTOR (1), ESTUDIANTE (2), HÍBRIDO (4)
  // ==========================================
  const esAdmin = rolUsuario === 1;

  return (
    <main className="flex flex-col gap-8 p-4 md:p-8 max-w-7xl mx-auto w-full">
      <header className="flex flex-col gap-2">
        <div className="flex justify-between items-start flex-wrap gap-2">
          <div>
            <h1 className={`text-4xl font-black tracking-tighter ${textoColor}`}>{saludo}, <span className="text-[#22d3ee]">{nombreMostrado}</span></h1>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">{modoNavegacion === 'clinica' ? 'Modo Clínica' : 'Modo Academia'}</p>
            {centroId && <p className="text-[10px] text-emerald-400 font-mono font-bold">Centro: {centroId}</p>}
          </div>
          
                    {/* LOGO DINÁMICO AQUÍ */}
          <div className="flex items-center gap-3 bg-white dark:bg-black/20 px-4 py-2 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm min-h-[48px]">
            <img 
              src={`https://raw.githubusercontent.com/CJPANTA/cj-project/main/frontend/public/logo_centros/${centroId?.toUpperCase() || 'CJ'}.png`} 
              alt="Logo Centro" 
              className="h-8 w-auto max-w-[120px] object-contain" 
              onError={(e) => { 
                e.target.onerror = null; // Evita un bucle infinito si el fallback también falla
                e.target.src = "/logos_cj_circular.png"; // Mismo fallback que usaste en el Sidebar
              }}
            />
          </div>
        </div>
      </header>
      
      <section className={`${bgTarjeta} p-6 rounded-3xl border transition-all`}>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 rounded-full bg-[#22d3ee] flex items-center justify-center animate-pulse"><span className="text-white text-xl">✨</span></div>
          <div className="flex-1">
            <h2 className={`text-sm font-black uppercase tracking-tighter ${textoColor}`}>Oráculo Aura IA</h2>
            <p className="text-[10px] text-gray-500 font-bold">CONSULTA CLÍNICA INSTANTÁNEA</p>
          </div>
          {historialConversacion.length > 0 && (
            <button onClick={nuevaConversacion} className="px-3 py-1.5 rounded-full bg-purple-600/20 border border-purple-500/40 text-purple-400 text-[10px] font-black uppercase tracking-wider hover:bg-purple-600/30 transition-all" title="Borrar memoria del chat">
              🔄 Nueva conversación
            </button>
          )}
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
          <div className="relative flex-1">
            <textarea
              value={busqueda}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="¿Qué patología o protocolo revisamos hoy?"
              className={`w-full ${bgInput} border p-4 rounded-2xl outline-none focus:border-[#22d3ee] transition-all text-sm ${textoColor} resize-none overflow-hidden min-h-[60px]`}
              rows={1}
              style={{ height: 'auto' }}
            />
            <button onClick={iniciarDictado} className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full ${escuchandoVoz ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all`}>🎙️</button>
          </div>
          <button onClick={() => ejecutarConsultaIA()} disabled={cargandoIA} className="px-6 py-4 bg-[#22d3ee] text-black font-black rounded-xl text-[10px] uppercase hover:scale-105 active:scale-95 transition-all disabled:opacity-50 w-full sm:w-auto">{cargandoIA ? '...' : 'Consultar'}</button>
        </div>

        {respuestaIA && (
          <div className="mt-6 p-5 rounded-2xl bg-[#22d3ee]/5 border border-[#22d3ee]/20 backdrop-blur-sm relative">
            <div className="flex gap-2 absolute top-2 right-2">
              <button
                onClick={() => hablar(respuestaIA, {
                  onStart: () => { setReproduciendoAudio(true); setAudioPausado(false); },
                  onEnd: () => { setReproduciendoAudio(false); setAudioPausado(false); },
                  onError: () => { setReproduciendoAudio(false); setAudioPausado(false); },
                  onPause: () => { setAudioPausado(true); setReproduciendoAudio(true); },
                  onResume: () => { setAudioPausado(false); setReproduciendoAudio(true); },
                })}
                className={`p-2 rounded-full ${reproduciendoAudio ? (audioPausado ? 'bg-yellow-600' : 'bg-green-800') : 'bg-green-600'} text-white hover:bg-opacity-80 transition-all`}
              >
                {reproduciendoAudio ? (audioPausado ? '▶️' : '⏸️') : '🔊'}
              </button>
              {puedeYouTube && (
                <button onClick={buscarReferencias} className="p-2 rounded-full bg-yellow-600 text-white hover:bg-yellow-700 transition-all">📺</button>
              )}
              <PrintButton
                titulo="Aura, tu asistente clínico"
                subtitulo={busqueda ? `Consulta: ${busqueda.slice(0, 80)}` : ''}
                contenido={mdAHtml(respuestaIA)}
                metadata={{ fecha: new Date().toLocaleDateString('es-PE'), autor: 'Aura IA', centro: 'CJ Fisioterapia' }}
                className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition-all"
              />
            </div>
            <div className={`prose prose-sm max-w-none ${temaOscuro ? 'prose-invert' : ''} mt-6`} dangerouslySetInnerHTML={{ __html: mdAHtml(respuestaIA) }} />
          </div>
        )}
      </section>

      {modoNavegacion === 'academia' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <button onClick={resumirUltimoPDF} disabled={resumiendoPDF} className="mt-2 text-[#22d3ee] text-xs font-bold flex items-center gap-1 hover:underline"><IconSummarize /> {resumiendoPDF ? 'Resumiendo...' : 'Resumir PDF'}</button>
                </>
              ) : <p className="text-sm text-gray-500">Aún no has abierto ningún PDF</p>}
            </div>
          </div>

          <HistorialWidget temaOscuro={temaOscuro} />
          <CalendarioWidget temaOscuro={temaOscuro} />
          <NotificacionesActivador temaOscuro={temaOscuro} />
          <FavoritosWidget temaOscuro={temaOscuro} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/area-estudio" className={`p-8 rounded-3xl border ${bgTarjeta} flex flex-col items-center group hover:border-[#22d3ee] transition-all`}>
              <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">🎓</span>
              <span className="text-[#22d3ee] text-[11px] font-black uppercase">Repositorio</span>
            </Link>
            <Link to="/biblioteca" className={`p-8 rounded-3xl border ${bgTarjeta} flex flex-col items-center group hover:border-[#22d3ee] transition-all`}>
              <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">📚</span>
              <span className="text-[#22d3ee] text-[11px] font-black uppercase">Biblioteca</span>
            </Link>
            <Link to="/simulador" className={`p-8 rounded-3xl border ${bgTarjeta} flex flex-col items-center group hover:border-[#22d3ee] transition-all`}>
              <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">🎯</span>
              <span className="text-[#22d3ee] text-[11px] font-black uppercase">Simulador</span>
            </Link>
          </div>
        </>
      )}

      {modoNavegacion === 'clinica' && (
        <>
          {(rolUsuario === 1 || rolUsuario === 4) && (
            <DashboardGerencial centroId={centroId} temaOscuro={temaOscuro} esDirectorGlobal={esAdmin} />
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/clinica/pacientes" className={`p-8 rounded-3xl border ${bgTarjeta} flex flex-col items-center group hover:border-emerald-400 transition-all`}>
              <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">👥</span>
              <span className="text-emerald-400 text-[11px] font-black uppercase">Pacientes</span>
            </Link>
            <Link to="/clinica/agenda" className={`p-8 rounded-3xl border ${bgTarjeta} flex flex-col items-center group hover:border-emerald-400 transition-all`}>
              <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">📅</span>
              <span className="text-emerald-400 text-[11px] font-black uppercase">Agenda</span>
            </Link>
            <Link to="/clinica/programacion" className={`p-8 rounded-3xl border ${bgTarjeta} flex flex-col items-center group hover:border-emerald-400 transition-all`}>
              <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">🗓️</span>
              <span className="text-emerald-400 text-[11px] font-black uppercase">Programación</span>
            </Link>
            {esAdmin && (
              <Link to="/panel-director" className={`p-8 rounded-3xl border ${bgTarjeta} flex flex-col items-center group hover:border-yellow-400 transition-all`}>
                <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">⚙️</span>
                <span className="text-yellow-400 text-[11px] font-black uppercase">Panel Director</span>
              </Link>
            )}
          </div>
        </>
      )}

      <div className="fixed bottom-6 right-6 flex gap-3 z-40">
        <button onClick={() => setPanelNotasAbierto(true)} className="p-3 rounded-full bg-[#22d3ee] text-black shadow-lg hover:scale-105 transition-all" title="Notas y grabaciones">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
        </button>
        <button onClick={() => setPanelTutorAbierto(true)} className="p-3 rounded-full bg-purple-600 text-white shadow-lg hover:scale-105 transition-all" title="Tutor personal Aura"><IconChat /></button>
      </div>

      {panelNotasAbierto && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setPanelNotasAbierto(false)} />
          <div className="relative w-full max-w-md h-full bg-white dark:bg-[#0a141d] shadow-2xl animate-slide-in-right"><NotebookCJ temaOscuro={temaOscuro} cerrarPanel={() => setPanelNotasAbierto(false)} /></div>
        </div>
      )}
      {panelTutorAbierto && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setPanelTutorAbierto(false)} />
          <div className="relative w-full max-w-[90%] sm:max-w-md h-full bg-white dark:bg-[#0a141d] shadow-2xl animate-slide-in-right overflow-y-auto"><TutorChat temaOscuro={temaOscuro} onCerrar={() => setPanelTutorAbierto(false)} /></div>
        </div>
      )}
    </main>
  );
}