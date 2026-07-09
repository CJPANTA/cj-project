import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

// =============================================
// TESTS ESPECÍFICOS POR REGIÓN
// =============================================
const TESTS_POR_REGION = {
  hombro: ['Test de Neer', 'Hawkins-Kennedy', 'Jobe', 'Aprehensión Anterior', 'Sulcus'],
  cuello: ['Spurling', 'Distracción', 'Valsalva', 'Test de Adams'],
  columna: ['Schober', 'Lasegue', 'Bragard', 'Compresión', 'Milgram'],
  cadera: ['Thomas', 'Ober', 'Trendelenburg', 'FABER', 'Patrick'],
  rodilla: ['Lachman', 'Drawer Anterior', 'Drawer Posterior', 'Apley', 'McMurray'],
  tobillo: ['Thompson', 'Drawer Anterior', 'Inversión', 'Eversión'],
  hombro_izq: ['Test de Neer', 'Hawkins-Kennedy', 'Jobe', 'Aprehensión Anterior'],
  hombro_der: ['Test de Neer', 'Hawkins-Kennedy', 'Jobe', 'Aprehensión Anterior'],
  rodilla_izq: ['Lachman', 'Drawer Anterior', 'Drawer Posterior', 'Apley'],
  rodilla_der: ['Lachman', 'Drawer Anterior', 'Drawer Posterior', 'Apley'],
  tobillo_izq: ['Thompson', 'Drawer Anterior', 'Inversión', 'Eversión'],
  tobillo_der: ['Thompson', 'Drawer Anterior', 'Inversión', 'Eversión'],
};

// =============================================
// COMPONENTE PRINCIPAL
// =============================================
export default function EvaluacionPostural({ temaOscuro }) {
  const { pacienteId } = useParams();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paso, setPaso] = useState(1);
  const [guardando, setGuardando] = useState(false);

  const [evaluacion, setEvaluacion] = useState({
    paciente_id: pacienteId,
    edad: '',
    ocupacion: '',
    motivo_consulta: '',
    tiempo_evolucion: '',
    mecanismo_lesion: '',
    regiones: [],
    datos_regiones: {},
    analisis_ia: '',
  });

  // ========== DICTADO DE VOZ ==========
  const [escuchando, setEscuchando] = useState(false);
  const [campoActivo, setCampoActivo] = useState(null);
  const recognitionRef = useRef(null);
  const inputRefs = useRef({});

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'es-ES';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setEscuchando(true);
      recognition.onend = () => setEscuchando(false);
      recognition.onerror = (event) => {
        console.error(event.error);
        setEscuchando(false);
        if (event.error !== 'not-allowed') {
          alert('Error al escuchar: ' + event.error);
        }
      };
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (campoActivo && inputRefs.current[campoActivo]) {
          const input = inputRefs.current[campoActivo];
          input.value = transcript;
          const changeEvent = new Event('input', { bubbles: true });
          input.dispatchEvent(changeEvent);
        }
        setEscuchando(false);
      };
      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const iniciarDictado = (campo) => {
    if (!recognitionRef.current) {
      alert('Reconocimiento de voz no disponible en este navegador. Usa Chrome.');
      return;
    }
    if (escuchando) {
      recognitionRef.current.stop();
      setEscuchando(false);
      return;
    }
    setCampoActivo(campo);
    recognitionRef.current.start();
  };

  // ========== CARGAR PACIENTE ==========
  useEffect(() => {
    const cargarPaciente = async () => {
      if (!pacienteId) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('pacientes')
        .select('*')
        .eq('id', pacienteId)
        .single();
      if (!error && data) {
        setPaciente(data);
        if (data.fecha_nacimiento) {
          const edad = new Date().getFullYear() - new Date(data.fecha_nacimiento).getFullYear();
          setEvaluacion(prev => ({ ...prev, edad: edad.toString() }));
        }
      }
      setLoading(false);
    };
    cargarPaciente();
  }, [pacienteId]);

  // ========== MANEJAR CAMBIOS ==========
  const handleInputChange = (campo, valor) => {
    setEvaluacion(prev => ({ ...prev, [campo]: valor }));
  };

  const handleRegionDataChange = (region, campo, valor) => {
    setEvaluacion(prev => ({
      ...prev,
      datos_regiones: {
        ...prev.datos_regiones,
        [region]: {
          ...prev.datos_regiones[region],
          [campo]: valor,
        },
      },
    }));
  };

  const toggleRegion = (region) => {
    setEvaluacion(prev => {
      const nuevasRegiones = prev.regiones.includes(region)
        ? prev.regiones.filter(r => r !== region)
        : [...prev.regiones, region];
      const nuevosDatos = { ...prev.datos_regiones };
      if (!nuevasRegiones.includes(region)) {
        delete nuevosDatos[region];
      }
      return { ...prev, regiones: nuevasRegiones, datos_regiones: nuevosDatos };
    });
  };

  // ========== GUARDAR EVALUACIÓN ==========
  const guardarEvaluacion = async () => {
    if (evaluacion.regiones.length === 0) {
      alert('Selecciona al menos una región afectada.');
      return;
    }

    setGuardando(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Obtener centro_id del usuario
      const { data: perfil } = await supabase
        .from('profiles')
        .select('centro_id')
        .eq('id', user.id)
        .single();

      const { error } = await supabase
        .from('evaluaciones')
        .insert([{
          paciente_id: pacienteId,
          user_id: user.id,
          centro_id: perfil?.centro_id || null,
          edad: evaluacion.edad ? parseInt(evaluacion.edad) : null,
          ocupacion: evaluacion.ocupacion,
          motivo_consulta: evaluacion.motivo_consulta,
          tiempo_evolucion: evaluacion.tiempo_evolucion,
          mecanismo_lesion: evaluacion.mecanismo_lesion,
          regiones: evaluacion.regiones,
          datos_regiones: evaluacion.datos_regiones,
          analisis_ia: evaluacion.analisis_ia || null,
        }]);

      if (error) throw error;

      alert('✅ Evaluación guardada correctamente.');
      navigate(`/clinica/pacientes/${pacienteId}`);
    } catch (error) {
      console.error(error);
      alert('Error al guardar: ' + error.message);
    } finally {
      setGuardando(false);
    }
  };

  // ========== ESTILOS ==========
  const bgPrincipal = temaOscuro ? 'bg-[#0a141d]' : 'bg-[#e2e8f0]';
  const textoPrincipal = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const bgTarjeta = temaOscuro ? 'bg-[#0a141d] border-gray-800' : 'bg-white border-gray-200';
  const bgInput = temaOscuro ? 'bg-black/20 border-white/10 text-white' : 'bg-gray-100 border-gray-300 text-[#0f172a]';
  const bgRegionBtn = (region) => {
    const selected = evaluacion.regiones.includes(region);
    if (selected) return 'bg-[#22d3ee] text-black border-[#22d3ee]';
    return temaOscuro ? 'bg-white/5 border-gray-700 text-gray-300 hover:bg-white/10' : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200';
  };

  // ========== SVG DEL CUERPO HUMANO (MEJORADO) ==========
  const BodyChartSVG = () => {
    const regiones = [
      { id: 'cuello', x: 50, y: 12, label: 'Cuello' },
      { id: 'hombro_izq', x: 22, y: 22, label: 'Hombro I' },
      { id: 'hombro_der', x: 78, y: 22, label: 'Hombro D' },
      { id: 'columna', x: 50, y: 40, label: 'Columna' },
      { id: 'cadera', x: 50, y: 60, label: 'Cadera' },
      { id: 'rodilla_izq', x: 28, y: 78, label: 'Rodilla I' },
      { id: 'rodilla_der', x: 72, y: 78, label: 'Rodilla D' },
      { id: 'tobillo_izq', x: 28, y: 92, label: 'Tobillo I' },
      { id: 'tobillo_der', x: 72, y: 92, label: 'Tobillo D' },
    ];

    return (
      <div className="relative w-full max-w-md mx-auto">
        <svg viewBox="0 0 100 100" className="w-full aspect-square">
          {/* Silueta humana mejorada */}
          <defs>
            <radialGradient id="bodyGrad" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#4a6a8a" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#2d3748" stopOpacity="0.6" />
            </radialGradient>
          </defs>

          {/* Cabeza */}
          <circle cx="50" cy="10" r="8" fill="url(#bodyGrad)" stroke="#4a6a8a" strokeWidth="1.5" />
          {/* Tronco */}
          <rect x="38" y="16" width="24" height="30" rx="4" fill="url(#bodyGrad)" stroke="#4a6a8a" strokeWidth="1.5" />
          {/* Brazo izquierdo */}
          <path d="M38 22 L20 16 L15 24 L35 28" fill="url(#bodyGrad)" stroke="#4a6a8a" strokeWidth="1.5" />
          {/* Brazo derecho */}
          <path d="M62 22 L80 16 L85 24 L65 28" fill="url(#bodyGrad)" stroke="#4a6a8a" strokeWidth="1.5" />
          {/* Pierna izquierda */}
          <path d="M42 46 L30 60 L25 72 L35 74 L42 60" fill="url(#bodyGrad)" stroke="#4a6a8a" strokeWidth="1.5" />
          {/* Pierna derecha */}
          <path d="M58 46 L70 60 L75 72 L65 74 L58 60" fill="url(#bodyGrad)" stroke="#4a6a8a" strokeWidth="1.5" />

          {/* Puntos cliqueables con efecto glow */}
          {regiones.map((r) => {
            const selected = evaluacion.regiones.includes(r.id);
            return (
              <g key={r.id} onClick={() => toggleRegion(r.id)} style={{ cursor: 'pointer' }}>
                <circle
                  cx={r.x}
                  cy={r.y}
                  r="6"
                  fill={selected ? '#22d3ee' : '#94a3b8'}
                  stroke={selected ? '#22d3ee' : '#64748b'}
                  strokeWidth="2.5"
                  className="transition-all duration-200 hover:scale-125 hover:shadow-lg"
                  style={{ filter: selected ? 'drop-shadow(0 0 8px #22d3ee)' : 'none' }}
                />
                <text
                  x={r.x}
                  y={r.y + 16}
                  textAnchor="middle"
                  fontSize="3.5"
                  fill={selected ? '#22d3ee' : '#94a3b8'}
                  className="font-bold"
                >
                  {r.label}
                </text>
              </g>
            );
          })}
        </svg>
        <p className="text-center text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-wider">
          Haz clic en las zonas de dolor
        </p>
      </div>
    );
  };

  // ========== RENDER ==========
  if (loading) {
    return (
      <div className={`min-h-screen ${bgPrincipal} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#22d3ee] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgPrincipal} p-4 md:p-8 transition-colors duration-500`}>
      <div className="max-w-4xl mx-auto">
        <h1 className={`text-3xl font-black tracking-tight ${textoPrincipal} mb-2`}>
          {paciente ? `Evaluación Postural - ${paciente.nombre} ${paciente.apellidos}` : 'Nueva Evaluación'}
        </h1>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-6">
          Paso {paso} de 3
        </p>

        <div className="w-full h-2 bg-gray-700 rounded-full mb-6">
          <div className="h-full bg-[#22d3ee] rounded-full transition-all duration-500" style={{ width: `${(paso / 3) * 100}%` }} />
        </div>

        {/* ============================================================ */}
        {/* PASO 1: DATOS GENERALES */}
        {/* ============================================================ */}
        {paso === 1 && (
          <div className={`${bgTarjeta} p-6 rounded-3xl border`}>
            <h2 className={`text-xl font-black ${textoPrincipal} mb-4`}>📋 Datos Generales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Edad</label>
                <div className="relative">
                  <input
                    type="number"
                    value={evaluacion.edad}
                    onChange={(e) => handleInputChange('edad', e.target.value)}
                    className={`w-full ${bgInput} border p-3 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`}
                    placeholder="Ej: 45"
                    ref={(el) => (inputRefs.current['edad'] = el)}
                  />
                  <button
                    onClick={() => iniciarDictado('edad')}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full ${escuchando && campoActivo === 'edad' ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all`}
                  >
                    🎙️
                  </button>
                </div>
              </div>
              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Ocupación</label>
                <div className="relative">
                  <input
                    type="text"
                    value={evaluacion.ocupacion}
                    onChange={(e) => handleInputChange('ocupacion', e.target.value)}
                    className={`w-full ${bgInput} border p-3 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`}
                    placeholder="Ej: Fisioterapeuta"
                    ref={(el) => (inputRefs.current['ocupacion'] = el)}
                  />
                  <button
                    onClick={() => iniciarDictado('ocupacion')}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full ${escuchando && campoActivo === 'ocupacion' ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all`}
                  >
                    🎙️
                  </button>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Motivo de consulta</label>
                <div className="relative">
                  <textarea
                    value={evaluacion.motivo_consulta}
                    onChange={(e) => handleInputChange('motivo_consulta', e.target.value)}
                    className={`w-full ${bgInput} border p-3 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm resize-none min-h-[80px]`}
                    placeholder="Describe el motivo de la consulta..."
                    ref={(el) => (inputRefs.current['motivo_consulta'] = el)}
                  />
                  <button
                    onClick={() => iniciarDictado('motivo_consulta')}
                    className={`absolute right-2 top-2 p-2 rounded-full ${escuchando && campoActivo === 'motivo_consulta' ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all`}
                  >
                    🎙️
                  </button>
                </div>
              </div>
              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Tiempo de evolución</label>
                <div className="relative">
                  <input
                    type="text"
                    value={evaluacion.tiempo_evolucion}
                    onChange={(e) => handleInputChange('tiempo_evolucion', e.target.value)}
                    className={`w-full ${bgInput} border p-3 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`}
                    placeholder="Ej: 2 semanas"
                    ref={(el) => (inputRefs.current['tiempo_evolucion'] = el)}
                  />
                  <button
                    onClick={() => iniciarDictado('tiempo_evolucion')}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full ${escuchando && campoActivo === 'tiempo_evolucion' ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all`}
                  >
                    🎙️
                  </button>
                </div>
              </div>
              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Mecanismo de lesión</label>
                <div className="relative">
                  <input
                    type="text"
                    value={evaluacion.mecanismo_lesion}
                    onChange={(e) => handleInputChange('mecanismo_lesion', e.target.value)}
                    className={`w-full ${bgInput} border p-3 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`}
                    placeholder="Ej: Caída, sobrecarga..."
                    ref={(el) => (inputRefs.current['mecanismo_lesion'] = el)}
                  />
                  <button
                    onClick={() => iniciarDictado('mecanismo_lesion')}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full ${escuchando && campoActivo === 'mecanismo_lesion' ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all`}
                  >
                    🎙️
                  </button>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setPaso(2)}
                className="px-6 py-3 bg-[#22d3ee] text-black font-black rounded-xl text-sm hover:scale-105 transition-all"
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* PASO 2: SELECCIÓN DE REGIONES (BODY CHART) */}
        {/* ============================================================ */}
        {paso === 2 && (
          <div className={`${bgTarjeta} p-6 rounded-3xl border`}>
            <h2 className={`text-xl font-black ${textoPrincipal} mb-4`}>📍 Selecciona las regiones afectadas</h2>
            <p className={`text-sm ${textoPrincipal} opacity-70 mb-6`}>
              Haz clic en el cuerpo para marcar las zonas donde el paciente refiere dolor.
            </p>
            <BodyChartSVG />
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {['cuello', 'hombro_izq', 'hombro_der', 'columna', 'cadera', 'rodilla_izq', 'rodilla_der', 'tobillo_izq', 'tobillo_der'].map((r) => (
                <button
                  key={r}
                  onClick={() => toggleRegion(r)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border transition-all ${bgRegionBtn(r)}`}
                >
                  {r.replace('_', ' ')}
                </button>
              ))}
            </div>
            <div className="flex justify-between mt-6">
              <button
                onClick={() => setPaso(1)}
                className="px-6 py-3 bg-gray-600 text-white font-black rounded-xl text-sm hover:opacity-80 transition-all"
              >
                ← Anterior
              </button>
              <button
                onClick={() => {
                  if (evaluacion.regiones.length === 0) {
                    alert('Selecciona al menos una región afectada.');
                    return;
                  }
                  setPaso(3);
                }}
                className="px-6 py-3 bg-[#22d3ee] text-black font-black rounded-xl text-sm hover:scale-105 transition-all"
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* PASO 3: EVALUACIÓN POR REGIÓN */}
        {/* ============================================================ */}
        {paso === 3 && (
          <div className={`${bgTarjeta} p-6 rounded-3xl border`}>
            <h2 className={`text-xl font-black ${textoPrincipal} mb-4`}>📊 Evaluación por región</h2>
            {evaluacion.regiones.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No hay regiones seleccionadas.</p>
            ) : (
              <div className="space-y-8">
                {evaluacion.regiones.map((region) => {
                  const data = evaluacion.datos_regiones[region] || {};
                  const tests = TESTS_POR_REGION[region] || ['Test no específico'];
                  return (
                    <div key={region} className={`p-4 rounded-2xl border ${temaOscuro ? 'border-gray-700' : 'border-gray-200'}`}>
                      <h3 className={`text-lg font-bold ${textoPrincipal} capitalize mb-3`}>
                        {region.replace('_', ' ')}
                      </h3>

                      {/* EVA */}
                      <div className="mb-4">
                        <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Dolor (EVA 0-10)</label>
                        <div className="flex items-center gap-4">
                          <input
                            type="range"
                            min="0"
                            max="10"
                            step="1"
                            value={data.eva || 0}
                            onChange={(e) => handleRegionDataChange(region, 'eva', parseInt(e.target.value))}
                            className="flex-1 h-2 rounded-lg appearance-none cursor-pointer bg-gray-300 dark:bg-gray-700 accent-[#22d3ee]"
                          />
                          <span className={`text-2xl font-black ${textoPrincipal} min-w-[2.5rem] text-center`}>
                            {data.eva || 0}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>Sin dolor</span>
                          <span>Máximo dolor</span>
                        </div>
                      </div>

                      {/* ROM */}
                      <div className="mb-4">
                        <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>ROM (grados)</label>
                        <input
                          type="number"
                          value={data.rom || ''}
                          onChange={(e) => handleRegionDataChange(region, 'rom', e.target.value)}
                          className={`w-full ${bgInput} border p-2 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`}
                          placeholder="Ej: 120°"
                        />
                      </div>

                      {/* TESTS ESPECÍFICOS POR REGIÓN */}
                      <div className="mb-4">
                        <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Tests especiales</label>
                        <div className="grid grid-cols-2 gap-2">
                          {tests.map((test) => (
                            <label key={test} className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={(data.tests || []).includes(test)}
                                onChange={(e) => {
                                  const current = data.tests || [];
                                  const nuevos = e.target.checked
                                    ? [...current, test]
                                    : current.filter(t => t !== test);
                                  handleRegionDataChange(region, 'tests', nuevos);
                                }}
                                className="accent-[#22d3ee] w-4 h-4"
                              />
                              <span className={`${textoPrincipal} text-xs`}>{test}</span>
                            </label>
                          ))}
                        </div>
                        <div className="relative mt-2">
                          <input
                            type="text"
                            placeholder="Observaciones del test"
                            value={data.observaciones || ''}
                            onChange={(e) => handleRegionDataChange(region, 'observaciones', e.target.value)}
                            className={`w-full ${bgInput} border p-2 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm pr-10`}
                            ref={(el) => {
                              if (el) inputRefs.current[`obs_${region}`] = el;
                            }}
                          />
                          <button
                            onClick={() => iniciarDictado(`obs_${region}`)}
                            className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${escuchando && campoActivo === `obs_${region}` ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all text-xs`}
                          >
                            🎙️
                          </button>
                        </div>
                      </div>

                      {/* Notas adicionales */}
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Notas adicionales..."
                          value={data.notas || ''}
                          onChange={(e) => handleRegionDataChange(region, 'notas', e.target.value)}
                          className={`w-full ${bgInput} border p-2 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm pr-10`}
                          ref={(el) => {
                            if (el) inputRefs.current[`notas_${region}`] = el;
                          }}
                        />
                        <button
                          onClick={() => iniciarDictado(`notas_${region}`)}
                          className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${escuchando && campoActivo === `notas_${region}` ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all text-xs`}
                        >
                          🎙️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="flex justify-between mt-6">
              <button
                onClick={() => setPaso(2)}
                className="px-6 py-3 bg-gray-600 text-white font-black rounded-xl text-sm hover:opacity-80 transition-all"
              >
                ← Anterior
              </button>
              <button
                onClick={guardarEvaluacion}
                disabled={guardando}
                className="px-6 py-3 bg-green-500 text-white font-black rounded-xl text-sm hover:scale-105 transition-all disabled:opacity-50"
              >
                {guardando ? 'Guardando...' : '💾 Guardar Evaluación'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}