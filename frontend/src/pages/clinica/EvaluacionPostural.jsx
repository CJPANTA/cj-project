import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

// ============================================================
// RANGOS NORMALES POR REGIÓN (ROM)
// ============================================================
const RANGOS_ROM = {
  hombro: { flexión: '0-180°', abducción: '0-180°', rot_ext: '0-90°', rot_int: '0-90°' },
  hombro_izq: { flexión: '0-180°', abducción: '0-180°', rot_ext: '0-90°', rot_int: '0-90°' },
  hombro_der: { flexión: '0-180°', abducción: '0-180°', rot_ext: '0-90°', rot_int: '0-90°' },
  cuello: { flexión: '0-45°', extensión: '0-45°', rotación: '0-80°', lateral: '0-40°' },
  columna: { flexión: '0-90°', extensión: '0-30°', lateral: '0-40°' },
  cadera: { flexión: '0-120°', extensión: '0-30°', abducción: '0-45°' },
  rodilla: { flexión: '0-135°', extensión: '0-10°' },
  rodilla_izq: { flexión: '0-135°', extensión: '0-10°' },
  rodilla_der: { flexión: '0-135°', extensión: '0-10°' },
  tobillo: { dorsiflexión: '0-20°', flexión_plantar: '0-50°' },
  tobillo_izq: { dorsiflexión: '0-20°', flexión_plantar: '0-50°' },
  tobillo_der: { dorsiflexión: '0-20°', flexión_plantar: '0-50°' },
  codo: { flexión: '0-145°', extensión: '0-10°' },
  codo_izq: { flexión: '0-145°', extensión: '0-10°' },
  codo_der: { flexión: '0-145°', extensión: '0-10°' },
  muneca: { flexión: '0-85°', extensión: '0-70°', desv_radial: '0-20°', desv_cubital: '0-30°' },
  muneca_izq: { flexión: '0-85°', extensión: '0-70°', desv_radial: '0-20°', desv_cubital: '0-30°' },
  muneca_der: { flexión: '0-85°', extensión: '0-70°', desv_radial: '0-20°', desv_cubital: '0-30°' },
  muslo: { flexión_cadera: '0-120°', extension_cadera: '0-30°' },
  muslo_izq: { flexión_cadera: '0-120°', extension_cadera: '0-30°' },
  muslo_der: { flexión_cadera: '0-120°', extension_cadera: '0-30°' },
  espalda: { flexión: '0-90°', extensión: '0-30°', lateral: '0-40°' },
  cabeza: { flexión: '0-45°', extensión: '0-45°', rotación: '0-80°', lateral: '0-40°' },
  cara: { flexión: '0-45°', extensión: '0-45°', rotación: '0-80°', lateral: '0-40°' },
  gluteo: { flexión_cadera: '0-120°', extension_cadera: '0-30°' },
  gluteo_izq: { flexión_cadera: '0-120°', extension_cadera: '0-30°' },
  gluteo_der: { flexión_cadera: '0-120°', extension_cadera: '0-30°' },
};

// ============================================================
// TESTS ESPECÍFICOS POR REGIÓN
// ============================================================
const TESTS_POR_REGION = {
  hombro: ['Test de Neer', 'Hawkins-Kennedy', 'Jobe', 'Aprehensión Anterior', 'Sulcus'],
  hombro_izq: ['Test de Neer', 'Hawkins-Kennedy', 'Jobe', 'Aprehensión Anterior'],
  hombro_der: ['Test de Neer', 'Hawkins-Kennedy', 'Jobe', 'Aprehensión Anterior'],
  cuello: ['Spurling', 'Distracción', 'Valsalva', 'Test de Adams'],
  columna: ['Schober', 'Lasegue', 'Bragard', 'Compresión', 'Milgram'],
  cadera: ['Thomas', 'Ober', 'Trendelenburg', 'FABER', 'Patrick'],
  rodilla: ['Lachman', 'Drawer Anterior', 'Drawer Posterior', 'Apley', 'McMurray'],
  rodilla_izq: ['Lachman', 'Drawer Anterior', 'Drawer Posterior', 'Apley'],
  rodilla_der: ['Lachman', 'Drawer Anterior', 'Drawer Posterior', 'Apley'],
  tobillo: ['Thompson', 'Drawer Anterior', 'Inversión', 'Eversión'],
  tobillo_izq: ['Thompson', 'Drawer Anterior', 'Inversión', 'Eversión'],
  tobillo_der: ['Thompson', 'Drawer Anterior', 'Inversión', 'Eversión'],
  codo: ['Test de Cozen', 'Test de Mills', 'Tinel Codo', 'Prueba de resistencia'],
  codo_izq: ['Test de Cozen', 'Test de Mills', 'Tinel Codo'],
  codo_der: ['Test de Cozen', 'Test de Mills', 'Tinel Codo'],
  muneca: ['Tinel Muñeca', 'Phalen', 'Test de Finkelstein', 'Prueba de cajón'],
  muneca_izq: ['Tinel Muñeca', 'Phalen', 'Test de Finkelstein'],
  muneca_der: ['Tinel Muñeca', 'Phalen', 'Test de Finkelstein'],
  muslo: ['Test de Thomas', 'Test de Ober', 'Prueba de fuerza cuádriceps'],
  muslo_izq: ['Test de Thomas', 'Test de Ober', 'Prueba de fuerza cuádriceps'],
  muslo_der: ['Test de Thomas', 'Test de Ober', 'Prueba de fuerza cuádriceps'],
  espalda: ['Schober', 'Lasegue', 'Bragard', 'Compresión'],
  cabeza: ['Test de Adams', 'Spurling', 'Distracción'],
  cara: ['Test de Adams', 'Spurling', 'Distracción'],
  gluteo: ['Thomas', 'Ober', 'Trendelenburg'],
  gluteo_izq: ['Thomas', 'Ober', 'Trendelenburg'],
  gluteo_der: ['Thomas', 'Ober', 'Trendelenburg'],
};

// ============================================================
// REGIONES POR VISTA DEL BODY CHART
// ============================================================
const REGIONES_POR_VISTA = {
  frente: [
    { id: 'cara', x: 50, y: 10, label: 'Cara' },
    { id: 'cuello', x: 50, y: 18, label: 'Cuello' },
    { id: 'hombro_izq', x: 25, y: 26, label: 'Hombro I' },
    { id: 'hombro_der', x: 75, y: 26, label: 'Hombro D' },
    { id: 'codo_izq', x: 18, y: 38, label: 'Codo I' },
    { id: 'codo_der', x: 82, y: 38, label: 'Codo D' },
    { id: 'muneca_izq', x: 14, y: 50, label: 'Muñeca I' },
    { id: 'muneca_der', x: 86, y: 50, label: 'Muñeca D' },
    { id: 'columna', x: 50, y: 35, label: 'Tronco' },
    { id: 'cadera', x: 50, y: 55, label: 'Cadera' },
    { id: 'muslo_izq', x: 30, y: 65, label: 'Muslo I' },
    { id: 'muslo_der', x: 70, y: 65, label: 'Muslo D' },
    { id: 'rodilla_izq', x: 30, y: 78, label: 'Rodilla I' },
    { id: 'rodilla_der', x: 70, y: 78, label: 'Rodilla D' },
    { id: 'tobillo_izq', x: 30, y: 90, label: 'Tobillo I' },
    { id: 'tobillo_der', x: 70, y: 90, label: 'Tobillo D' },
  ],
  espalda: [
    { id: 'cabeza', x: 50, y: 10, label: 'Cabeza' },
    { id: 'cuello', x: 50, y: 18, label: 'Cuello' },
    { id: 'hombro_izq', x: 25, y: 26, label: 'Hombro I' },
    { id: 'hombro_der', x: 75, y: 26, label: 'Hombro D' },
    { id: 'espalda', x: 50, y: 35, label: 'Espalda' },
    { id: 'columna', x: 50, y: 45, label: 'Columna' },
    { id: 'gluteo_izq', x: 30, y: 60, label: 'Glúteo I' },
    { id: 'gluteo_der', x: 70, y: 60, label: 'Glúteo D' },
    { id: 'muslo_izq', x: 30, y: 72, label: 'Muslo I' },
    { id: 'muslo_der', x: 70, y: 72, label: 'Muslo D' },
    { id: 'rodilla_izq', x: 30, y: 85, label: 'Rodilla I' },
    { id: 'rodilla_der', x: 70, y: 85, label: 'Rodilla D' },
    { id: 'tobillo_izq', x: 30, y: 94, label: 'Tobillo I' },
    { id: 'tobillo_der', x: 70, y: 94, label: 'Tobillo D' },
  ],
  lateral: [
    { id: 'cabeza', x: 50, y: 10, label: 'Cabeza' },
    { id: 'cuello', x: 50, y: 18, label: 'Cuello' },
    { id: 'hombro', x: 50, y: 26, label: 'Hombro' },
    { id: 'espalda', x: 35, y: 38, label: 'Espalda' },
    { id: 'columna', x: 50, y: 45, label: 'Columna' },
    { id: 'cadera', x: 50, y: 58, label: 'Cadera' },
    { id: 'muslo', x: 50, y: 70, label: 'Muslo' },
    { id: 'rodilla', x: 50, y: 82, label: 'Rodilla' },
    { id: 'tobillo', x: 50, y: 93, label: 'Tobillo' },
  ],
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function EvaluacionPostural({ temaOscuro }) {
  const { pacienteId } = useParams();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paso, setPaso] = useState(1);
  const [guardando, setGuardando] = useState(false);
  const [microfonoActivo, setMicrofonoActivo] = useState(false);
  const [vistaActual, setVistaActual] = useState('frente'); // 'frente', 'espalda', 'lateral'

  // Estado de la evaluación
  const [evaluacion, setEvaluacion] = useState({
    paciente_id: pacienteId,
    edad: '',
    ocupacion: '',
    sexo: '',
    estado_civil: '',
    telefono: '',
    direccion: '',
    motivo_consulta: '',
    tiempo_evolucion: '',
    mecanismo_lesion: '',
    antecedentes_medicos: '',
    alergias: '',
    medicamentos: '',
    cirugias_previas: '',
    tipo_dolor: [],
    intensidad_reposo: 0,
    intensidad_actividad: 0,
    factores_agravantes: '',
    factores_atenuantes: '',
    sintomas_asociados: '',
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
    const pedirPermiso = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        setMicrofonoActivo(true);
      } catch (err) {
        console.warn('Permiso de micrófono denegado:', err);
        setMicrofonoActivo(false);
      }
    };
    pedirPermiso();

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
        if (event.error === 'not-allowed') {
          alert('Por favor, permite el acceso al micrófono en la configuración del navegador.');
        } else if (event.error !== 'no-speech') {
          alert('Error al escuchar: ' + event.error + '. Intenta de nuevo.');
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
    } else {
      alert('Reconocimiento de voz no disponible en este navegador. Usa Chrome o Edge.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const iniciarDictado = (campo) => {
    if (!microfonoActivo) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          stream.getTracks().forEach(track => track.stop());
          setMicrofonoActivo(true);
          iniciarDictado(campo);
        })
        .catch(() => {
          alert('No se pudo acceder al micrófono. Por favor, permite el acceso en la configuración del navegador.');
        });
      return;
    }

    if (!recognitionRef.current) {
      alert('Reconocimiento de voz no disponible.');
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
      if (!pacienteId) { setLoading(false); return; }
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

  const toggleRegion = (regionId) => {
    setEvaluacion(prev => {
      const nuevasRegiones = prev.regiones.includes(regionId)
        ? prev.regiones.filter(r => r !== regionId)
        : [...prev.regiones, regionId];
      const nuevosDatos = { ...prev.datos_regiones };
      if (!nuevasRegiones.includes(regionId)) {
        delete nuevosDatos[regionId];
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
      const { data: perfil } = await supabase
        .from('profiles')
        .select('centro_id')
        .eq('id', user.id)
        .single();

      const datos = {
        paciente_id: pacienteId,
        user_id: user.id,
        centro_id: perfil?.centro_id || null,
        edad: evaluacion.edad ? parseInt(evaluacion.edad) : null,
        ocupacion: evaluacion.ocupacion,
        sexo: evaluacion.sexo,
        estado_civil: evaluacion.estado_civil,
        telefono: evaluacion.telefono,
        direccion: evaluacion.direccion,
        motivo_consulta: evaluacion.motivo_consulta,
        tiempo_evolucion: evaluacion.tiempo_evolucion,
        mecanismo_lesion: evaluacion.mecanismo_lesion,
        antecedentes_medicos: evaluacion.antecedentes_medicos,
        alergias: evaluacion.alergias,
        medicamentos: evaluacion.medicamentos,
        cirugias_previas: evaluacion.cirugias_previas,
        tipo_dolor: evaluacion.tipo_dolor,
        intensidad_reposo: evaluacion.intensidad_reposo,
        intensidad_actividad: evaluacion.intensidad_actividad,
        factores_agravantes: evaluacion.factores_agravantes,
        factores_atenuantes: evaluacion.factores_atenuantes,
        sintomas_asociados: evaluacion.sintomas_asociados,
        regiones: evaluacion.regiones,
        datos_regiones: evaluacion.datos_regiones,
        analisis_ia: evaluacion.analisis_ia || null,
      };

      const { error } = await supabase
        .from('evaluaciones')
        .insert([datos]);

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
  const bgRegionBtn = (regionId) => {
    const selected = evaluacion.regiones.includes(regionId);
    if (selected) return 'bg-[#22d3ee] text-black border-[#22d3ee] shadow-lg shadow-[#22d3ee]/30';
    return temaOscuro ? 'bg-white/5 border-gray-700 text-gray-300 hover:bg-white/10 hover:border-[#22d3ee]/30' : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200';
  };

  // ========== BODY CHART CON 3 VISTAS (FRENTE, ESPALDA, LATERAL) ==========
  const BodyChartSVG = () => {
    const regiones = REGIONES_POR_VISTA[vistaActual] || REGIONES_POR_VISTA.frente;
    const labelVista = { frente: 'Vista Frontal', espalda: 'Vista Posterior', lateral: 'Vista Lateral' };

    // Construir la silueta según la vista
    const renderSilueta = () => {
      if (vistaActual === 'frente') {
        return (
          <>
            {/* Cabeza */}
            <circle cx="50" cy="10" r="7" fill="url(#bodyGrad)" stroke="#4a6a8a" strokeWidth="1.2" />
            {/* Cuello */}
            <rect x="46" y="16" width="8" height="5" rx="2" fill="url(#bodyGrad)" stroke="#4a6a8a" strokeWidth="1.2" />
            {/* Tronco */}
            <path d="M42 21 Q35 33 38 48 Q40 60 47 62 L53 62 Q60 60 62 48 Q65 33 58 21 Z" fill="url(#bodyGrad)" stroke="#4a6a8a" strokeWidth="1.2" />
            {/* Brazos */}
            <path d="M42 23 L22 20 L14 30 L18 36 L38 29" fill="url(#bodyGrad)" stroke="#4a6a8a" strokeWidth="1.2" />
            <path d="M58 23 L78 20 L86 30 L82 36 L62 29" fill="url(#bodyGrad)" stroke="#4a6a8a" strokeWidth="1.2" />
            <path d="M18 36 L10 48 L15 52 L22 42" fill="url(#bodyGrad)" stroke="#4a6a8a" strokeWidth="1.2" />
            <path d="M82 36 L90 48 L85 52 L78 42" fill="url(#bodyGrad)" stroke="#4a6a8a" strokeWidth="1.2" />
            {/* Piernas */}
            <path d="M43 62 L33 72 L28 84 L36 88 L40 76" fill="url(#bodyGrad)" stroke="#4a6a8a" strokeWidth="1.2" />
            <path d="M57 62 L67 72 L72 84 L64 88 L60 76" fill="url(#bodyGrad)" stroke="#4a6a8a" strokeWidth="1.2" />
            {/* Pies */}
            <rect x="24" y="88" width="12" height="5" rx="2" fill="url(#bodyGrad)" stroke="#4a6a8a" strokeWidth="1" />
            <rect x="64" y="88" width="12" height="5" rx="2" fill="url(#bodyGrad)" stroke="#4a6a8a" strokeWidth="1" />
          </>
        );
      } else if (vistaActual === 'espalda') {
        return (
          <>
            {/* Cabeza (vista posterior) */}
            <circle cx="50" cy="10" r="7" fill="url(#bodyGrad)" stroke="#4a6a8a" strokeWidth="1.2" />
            {/* Cuello */}
            <rect x="46" y="16" width="8" height="5" rx="2" fill="url(#bodyGrad)" stroke="#4a6a8a" strokeWidth="1.2" />
            {/* Tronco (más ancho en espalda) */}
            <path d="M40 21 Q32 35 36 50 Q38 62 46 64 L54 64 Q62 62 64 50 Q68 35 60 21 Z" fill="url(#bodyGrad)" stroke="#4a6a8a" strokeWidth="1.2" />
            {/* Brazos (similares) */}
            <path d="M40 23 L20 20 L12 32 L16 38 L36 29" fill="url(#bodyGrad)" stroke="#4a6a8a" strokeWidth="1.2" />
            <path d="M60 23 L80 20 L88 32 L84 38 L64 29" fill="url(#bodyGrad)" stroke="#4a6a8a" strokeWidth="1.2" />
            <path d="M16 38 L8 50 L13 54 L20 44" fill="url(#bodyGrad)" stroke="#4a6a8a" strokeWidth="1.2" />
            <path d="M84 38 L92 50 L87 54 L80 44" fill="url(#bodyGrad)" stroke="#4a6a8a" strokeWidth="1.2" />
            {/* Piernas */}
            <path d="M42 64 L32 74 L28 86 L36 90 L40 78" fill="url(#bodyGrad)" stroke="#4a6a8a" strokeWidth="1.2" />
            <path d="M58 64 L68 74 L72 86 L64 90 L60 78" fill="url(#bodyGrad)" stroke="#4a6a8a" strokeWidth="1.2" />
            <rect x="24" y="90" width="12" height="5" rx="2" fill="url(#bodyGrad)" stroke="#4a6a8a" strokeWidth="1" />
            <rect x="64" y="90" width="12" height="5" rx="2" fill="url(#bodyGrad)" stroke="#4a6a8a" strokeWidth="1" />
          </>
        );
      } else {
        // Vista lateral
        return (
          <>
            {/* Cabeza (perfil) */}
            <circle cx="50" cy="10" r="7" fill="url(#bodyGrad)" stroke="#4a6a8a" strokeWidth="1.2" />
            {/* Cuello */}
            <rect x="47" y="16" width="6" height="5" rx="2" fill="url(#bodyGrad)" stroke="#4a6a8a" strokeWidth="1.2" />
            {/* Tronco (perfil) */}
            <path d="M43 21 Q38 32 40 45 Q42 58 48 60 L55 60 Q58 58 60 45 Q62 32 55 21 Z" fill="url(#bodyGrad)" stroke="#4a6a8a" strokeWidth="1.2" />
            {/* Brazo (solo uno en perfil) */}
            <path d="M43 25 L30 22 L24 32 L28 36 L42 30" fill="url(#bodyGrad)" stroke="#4a6a8a" strokeWidth="1.2" />
            <path d="M28 36 L22 46 L26 50 L32 42" fill="url(#bodyGrad)" stroke="#4a6a8a" strokeWidth="1.2" />
            {/* Pierna (perfil) */}
            <path d="M46 60 L38 70 L34 82 L42 86 L46 74" fill="url(#bodyGrad)" stroke="#4a6a8a" strokeWidth="1.2" />
            <rect x="30" y="86" width="12" height="5" rx="2" fill="url(#bodyGrad)" stroke="#4a6a8a" strokeWidth="1" />
          </>
        );
      }
    };

    return (
      <div className="relative w-full max-w-md mx-auto">
        <div className="flex justify-center gap-2 mb-4">
          {['frente', 'espalda', 'lateral'].map((v) => (
            <button
              key={v}
              onClick={() => setVistaActual(v)}
              className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${
                vistaActual === v
                  ? 'bg-[#22d3ee] text-black shadow-lg shadow-[#22d3ee]/30'
                  : temaOscuro
                    ? 'bg-white/5 text-gray-400 hover:bg-white/10'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              {v === 'frente' ? '👤 Frente' : v === 'espalda' ? '🔙 Espalda' : '👤 Lateral'}
            </button>
          ))}
        </div>

        <svg viewBox="0 0 100 100" className="w-full aspect-square">
          <defs>
            <radialGradient id="bodyGrad" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#4a6a8a" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#2d3748" stopOpacity="0.4" />
            </radialGradient>
            <filter id="glow">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#22d3ee" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Silueta */}
          <g opacity="0.7">{renderSilueta()}</g>

          {/* Puntos cliqueables */}
          {regiones.map((r) => {
            const selected = evaluacion.regiones.includes(r.id);
            return (
              <g key={r.id} onClick={() => toggleRegion(r.id)} style={{ cursor: 'pointer' }}>
                <circle
                  cx={r.x}
                  cy={r.y}
                  r="5.5"
                  fill={selected ? '#22d3ee' : '#94a3b8'}
                  stroke={selected ? '#22d3ee' : '#64748b'}
                  strokeWidth="2.5"
                  className="transition-all duration-200 hover:scale-125"
                  style={{ filter: selected ? 'url(#glow)' : 'none' }}
                />
                <text
                  x={r.x}
                  y={r.y + 15}
                  textAnchor="middle"
                  fontSize="3.2"
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
        <div className="flex flex-wrap gap-1 justify-center mt-3">
          {regiones.map((r) => (
            <button
              key={r.id}
              onClick={() => toggleRegion(r.id)}
              className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase transition-all ${bgRegionBtn(r.id)}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // ========== RENDER ==========
  if (loading) {
    return <div className={`min-h-screen ${bgPrincipal} flex items-center justify-center`}><div className="animate-spin rounded-full h-10 w-10 border-4 border-[#22d3ee] border-t-transparent"></div></div>;
  }

  // ---------- ANAMNESIS (4 bloques) ----------
  const renderAnamnesis = () => (
    <div className={`${bgTarjeta} p-6 rounded-3xl border`}>
      <h2 className={`text-2xl font-black ${textoPrincipal} mb-4`}>📋 Anamnesis</h2>

      {/* Bloque 1: Datos Personales */}
      <div className="mb-6">
        <h3 className={`text-sm font-bold ${textoPrincipal} uppercase tracking-wider border-b border-gray-600 pb-2 mb-3`}>1. Datos Personales</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Edad</label>
            <div className="relative">
              <input type="number" value={evaluacion.edad} onChange={(e) => handleInputChange('edad', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`} placeholder="Ej: 45" ref={(el) => (inputRefs.current['edad'] = el)} />
              <button onClick={() => iniciarDictado('edad')} className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${escuchando && campoActivo === 'edad' ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all text-xs`}>🎙️</button>
            </div>
          </div>
          <div>
            <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Sexo</label>
            <select value={evaluacion.sexo} onChange={(e) => handleInputChange('sexo', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`}>
              <option value="">Seleccionar</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div>
            <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Estado Civil</label>
            <select value={evaluacion.estado_civil} onChange={(e) => handleInputChange('estado_civil', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`}>
              <option value="">Seleccionar</option>
              <option value="Soltero/a">Soltero/a</option>
              <option value="Casado/a">Casado/a</option>
              <option value="Divorciado/a">Divorciado/a</option>
              <option value="Viudo/a">Viudo/a</option>
            </select>
          </div>
          <div>
            <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Teléfono</label>
            <div className="relative">
              <input type="text" value={evaluacion.telefono} onChange={(e) => handleInputChange('telefono', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`} placeholder="Ej: 987654321" ref={(el) => (inputRefs.current['telefono'] = el)} />
              <button onClick={() => iniciarDictado('telefono')} className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${escuchando && campoActivo === 'telefono' ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all text-xs`}>🎙️</button>
            </div>
          </div>
          <div className="md:col-span-2">
            <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Dirección</label>
            <div className="relative">
              <input type="text" value={evaluacion.direccion} onChange={(e) => handleInputChange('direccion', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`} placeholder="Calle, número, ciudad..." ref={(el) => (inputRefs.current['direccion'] = el)} />
              <button onClick={() => iniciarDictado('direccion')} className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${escuchando && campoActivo === 'direccion' ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all text-xs`}>🎙️</button>
            </div>
          </div>
        </div>
      </div>

      {/* Bloque 2: Motivo de consulta */}
      <div className="mb-6">
        <h3 className={`text-sm font-bold ${textoPrincipal} uppercase tracking-wider border-b border-gray-600 pb-2 mb-3`}>2. Motivo de Consulta</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Motivo principal</label>
            <div className="relative">
              <textarea value={evaluacion.motivo_consulta} onChange={(e) => handleInputChange('motivo_consulta', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm resize-none min-h-[60px]`} placeholder="Describe el motivo de la consulta..." ref={(el) => (inputRefs.current['motivo_consulta'] = el)} />
              <button onClick={() => iniciarDictado('motivo_consulta')} className={`absolute right-2 top-2 p-1.5 rounded-full ${escuchando && campoActivo === 'motivo_consulta' ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all text-xs`}>🎙️</button>
            </div>
          </div>
          <div>
            <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Tiempo de evolución</label>
            <div className="relative">
              <input type="text" value={evaluacion.tiempo_evolucion} onChange={(e) => handleInputChange('tiempo_evolucion', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`} placeholder="Ej: 2 semanas" ref={(el) => (inputRefs.current['tiempo_evolucion'] = el)} />
              <button onClick={() => iniciarDictado('tiempo_evolucion')} className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${escuchando && campoActivo === 'tiempo_evolucion' ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all text-xs`}>🎙️</button>
            </div>
          </div>
          <div>
            <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Mecanismo de lesión</label>
            <div className="relative">
              <input type="text" value={evaluacion.mecanismo_lesion} onChange={(e) => handleInputChange('mecanismo_lesion', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`} placeholder="Caída, sobrecarga, etc." ref={(el) => (inputRefs.current['mecanismo_lesion'] = el)} />
              <button onClick={() => iniciarDictado('mecanismo_lesion')} className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${escuchando && campoActivo === 'mecanismo_lesion' ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all text-xs`}>🎙️</button>
            </div>
          </div>
        </div>
      </div>

      {/* Bloque 3: Antecedentes */}
      <div className="mb-6">
        <h3 className={`text-sm font-bold ${textoPrincipal} uppercase tracking-wider border-b border-gray-600 pb-2 mb-3`}>3. Antecedentes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Antecedentes médicos</label>
            <div className="relative">
              <input type="text" value={evaluacion.antecedentes_medicos} onChange={(e) => handleInputChange('antecedentes_medicos', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`} placeholder="Diabetes, hipertensión, etc." ref={(el) => (inputRefs.current['antecedentes_medicos'] = el)} />
              <button onClick={() => iniciarDictado('antecedentes_medicos')} className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${escuchando && campoActivo === 'antecedentes_medicos' ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all text-xs`}>🎙️</button>
            </div>
          </div>
          <div>
            <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Alergias</label>
            <div className="relative">
              <input type="text" value={evaluacion.alergias} onChange={(e) => handleInputChange('alergias', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`} placeholder="Medicamentos, alimentos, etc." ref={(el) => (inputRefs.current['alergias'] = el)} />
              <button onClick={() => iniciarDictado('alergias')} className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${escuchando && campoActivo === 'alergias' ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all text-xs`}>🎙️</button>
            </div>
          </div>
          <div>
            <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Medicamentos actuales</label>
            <div className="relative">
              <input type="text" value={evaluacion.medicamentos} onChange={(e) => handleInputChange('medicamentos', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`} placeholder="Ibuprofeno, etc." ref={(el) => (inputRefs.current['medicamentos'] = el)} />
              <button onClick={() => iniciarDictado('medicamentos')} className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${escuchando && campoActivo === 'medicamentos' ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all text-xs`}>🎙️</button>
            </div>
          </div>
          <div>
            <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Cirugías previas</label>
            <div className="relative">
              <input type="text" value={evaluacion.cirugias_previas} onChange={(e) => handleInputChange('cirugias_previas', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`} placeholder="Tipo y año" ref={(el) => (inputRefs.current['cirugias_previas'] = el)} />
              <button onClick={() => iniciarDictado('cirugias_previas')} className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${escuchando && campoActivo === 'cirugias_previas' ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all text-xs`}>🎙️</button>
            </div>
          </div>
        </div>
      </div>

      {/* Bloque 4: Evaluación del Dolor */}
      <div className="mb-6">
        <h3 className={`text-sm font-bold ${textoPrincipal} uppercase tracking-wider border-b border-gray-600 pb-2 mb-3`}>4. Evaluación del Dolor</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Tipo de dolor</label>
            <div className="flex flex-wrap gap-2">
              {['Latido', 'Destello', 'Lanciante', 'Cortante', 'Calambre', 'Quema', 'Hormigueo', 'Sordo', 'Pesado'].map((tipo) => (
                <label key={tipo} className="flex items-center gap-1 text-xs">
                  <input type="checkbox" checked={(evaluacion.tipo_dolor || []).includes(tipo)} onChange={(e) => {
                    const current = evaluacion.tipo_dolor || [];
                    const nuevos = e.target.checked ? [...current, tipo] : current.filter(t => t !== tipo);
                    handleInputChange('tipo_dolor', nuevos);
                  }} className="accent-[#22d3ee]" />
                  {tipo}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Intensidad (EVA) en reposo</label>
            <input type="number" min="0" max="10" value={evaluacion.intensidad_reposo} onChange={(e) => handleInputChange('intensidad_reposo', parseInt(e.target.value) || 0)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`} />
          </div>
          <div>
            <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Intensidad (EVA) en actividad</label>
            <input type="number" min="0" max="10" value={evaluacion.intensidad_actividad} onChange={(e) => handleInputChange('intensidad_actividad', parseInt(e.target.value) || 0)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`} />
          </div>
          <div className="md:col-span-2">
            <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Factores agravantes</label>
            <div className="relative">
              <input type="text" value={evaluacion.factores_agravantes} onChange={(e) => handleInputChange('factores_agravantes', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`} placeholder="¿Qué empeora el dolor?" ref={(el) => (inputRefs.current['factores_agravantes'] = el)} />
              <button onClick={() => iniciarDictado('factores_agravantes')} className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${escuchando && campoActivo === 'factores_agravantes' ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all text-xs`}>🎙️</button>
            </div>
          </div>
          <div className="md:col-span-2">
            <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Factores atenuantes</label>
            <div className="relative">
              <input type="text" value={evaluacion.factores_atenuantes} onChange={(e) => handleInputChange('factores_atenuantes', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`} placeholder="¿Qué alivia el dolor?" ref={(el) => (inputRefs.current['factores_atenuantes'] = el)} />
              <button onClick={() => iniciarDictado('factores_atenuantes')} className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${escuchando && campoActivo === 'factores_atenuantes' ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all text-xs`}>🎙️</button>
            </div>
          </div>
          <div className="md:col-span-2">
            <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Síntomas asociados</label>
            <div className="relative">
              <input type="text" value={evaluacion.sintomas_asociados} onChange={(e) => handleInputChange('sintomas_asociados', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`} placeholder="Hormigueo, debilidad, mareos..." ref={(el) => (inputRefs.current['sintomas_asociados'] = el)} />
              <button onClick={() => iniciarDictado('sintomas_asociados')} className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${escuchando && campoActivo === 'sintomas_asociados' ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all text-xs`}>🎙️</button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button onClick={() => setPaso(2)} className="px-6 py-3 bg-[#22d3ee] text-black font-black rounded-xl text-sm hover:scale-105 transition-all">Siguiente →</button>
      </div>
    </div>
  );

  // ---------- RENDER PRINCIPAL ----------
  return (
    <div className={`min-h-screen ${bgPrincipal} p-4 md:p-8 transition-colors duration-500`}>
      <div className="max-w-5xl mx-auto">
        <h1 className={`text-3xl font-black tracking-tight ${textoPrincipal} mb-2`}>
          {paciente ? `Evaluación - ${paciente.nombre} ${paciente.apellidos}` : 'Nueva Evaluación'}
        </h1>
        <div className="flex justify-between items-center mb-4">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Paso {paso} de 3</p>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold uppercase ${microfonoActivo ? 'text-green-400' : 'text-yellow-400'}`}>
              {microfonoActivo ? '🎤 Micrófono activo' : '🔇 Micrófono inactivo'}
            </span>
          </div>
        </div>
        <div className="w-full h-2 bg-gray-700 rounded-full mb-6">
          <div className="h-full bg-[#22d3ee] rounded-full transition-all duration-500" style={{ width: `${(paso / 3) * 100}%` }} />
        </div>

        {/* PASO 1: ANAMNESIS */}
        {paso === 1 && renderAnamnesis()}

        {/* PASO 2: BODY CHART CON 3 VISTAS */}
        {paso === 2 && (
          <div className={`${bgTarjeta} p-6 rounded-3xl border`}>
            <h2 className={`text-xl font-black ${textoPrincipal} mb-4`}>📍 Selecciona las regiones afectadas</h2>
            <p className={`text-sm ${textoPrincipal} opacity-70 mb-4`}>
              Cambia de vista (Frente / Espalda / Lateral) y haz clic en las zonas de dolor.
            </p>
            <BodyChartSVG />
            <div className="flex justify-between mt-6">
              <button onClick={() => setPaso(1)} className="px-6 py-3 bg-gray-600 text-white font-black rounded-xl text-sm hover:opacity-80 transition-all">← Anterior</button>
              <button onClick={() => { if (evaluacion.regiones.length === 0) { alert('Selecciona al menos una región afectada.'); return; } setPaso(3); }} className="px-6 py-3 bg-[#22d3ee] text-black font-black rounded-xl text-sm hover:scale-105 transition-all">Siguiente →</button>
            </div>
          </div>
        )}

        {/* PASO 3: EVALUACIÓN POR REGIÓN */}
        {paso === 3 && (
          <div className={`${bgTarjeta} p-6 rounded-3xl border`}>
            <h2 className={`text-xl font-black ${textoPrincipal} mb-4`}>📊 Evaluación por región</h2>
            {evaluacion.regiones.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No hay regiones seleccionadas.</p>
            ) : (
              <div className="space-y-8 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                {evaluacion.regiones.map((region) => {
                  const data = evaluacion.datos_regiones[region] || {};
                  const tests = TESTS_POR_REGION[region] || ['Test no específico'];
                  const rangos = RANGOS_ROM[region] || {};
                  return (
                    <div key={region} className={`p-5 rounded-2xl border ${temaOscuro ? 'border-gray-700' : 'border-gray-200'} shadow-sm`}>
                      <h3 className={`text-lg font-bold ${textoPrincipal} capitalize mb-3`}>{region.replace('_', ' ')}</h3>

                      {/* EVA con números cliqueables */}
                      <div className="mb-4">
                        <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Dolor (EVA 0-10)</label>
                        <div className="flex flex-wrap gap-1 mb-1">
                          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                            <button key={num} onClick={() => handleRegionDataChange(region, 'eva', num)} className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${data.eva === num ? 'bg-[#22d3ee] text-black scale-110 shadow-lg shadow-[#22d3ee]/30' : `${temaOscuro ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'} hover:scale-110`}`}>{num}</button>
                          ))}
                        </div>
                        <div className="flex justify-between text-xs text-gray-400"><span>Sin dolor</span><span>Máximo dolor</span></div>
                      </div>

                      {/* ROM con rangos de referencia */}
                      <div className="mb-4">
                        <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>ROM (grados)</label>
                        <div className="relative">
                          <input type="number" value={data.rom || ''} onChange={(e) => handleRegionDataChange(region, 'rom', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`} placeholder="Ej: 120°" />
                        </div>
                        {Object.keys(rangos).length > 0 && (
                          <div className="mt-1 text-xs text-gray-400 flex flex-wrap gap-2">
                            <span className="font-bold">Rango normal:</span>
                            {Object.entries(rangos).map(([mov, rango]) => (
                              <span key={mov} className="bg-black/10 px-2 py-0.5 rounded-full">{mov.replace('_', ' ')}: {rango}</span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Tests especiales */}
                      <div className="mb-4">
                        <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Tests especiales</label>
                        <div className="grid grid-cols-2 gap-2">
                          {tests.map((test) => (
                            <label key={test} className="flex items-center gap-2 text-sm">
                              <input type="checkbox" checked={(data.tests || []).includes(test)} onChange={(e) => {
                                const current = data.tests || [];
                                const nuevos = e.target.checked ? [...current, test] : current.filter(t => t !== test);
                                handleRegionDataChange(region, 'tests', nuevos);
                              }} className="accent-[#22d3ee] w-4 h-4" />
                              <span className={`${textoPrincipal} text-xs`}>{test}</span>
                            </label>
                          ))}
                        </div>
                        <div className="relative mt-2">
                          <input type="text" placeholder="Observaciones del test..." value={data.observaciones || ''} onChange={(e) => handleRegionDataChange(region, 'observaciones', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm pr-10`} ref={(el) => { if (el) inputRefs.current[`obs_${region}`] = el; }} />
                          <button onClick={() => iniciarDictado(`obs_${region}`)} className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${escuchando && campoActivo === `obs_${region}` ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all text-xs`}>🎙️</button>
                        </div>
                      </div>

                      {/* Notas adicionales */}
                      <div className="relative">
                        <input type="text" placeholder="Notas adicionales..." value={data.notas || ''} onChange={(e) => handleRegionDataChange(region, 'notas', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm pr-10`} ref={(el) => { if (el) inputRefs.current[`notas_${region}`] = el; }} />
                        <button onClick={() => iniciarDictado(`notas_${region}`)} className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${escuchando && campoActivo === `notas_${region}` ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all text-xs`}>🎙️</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="flex justify-between mt-6">
              <button onClick={() => setPaso(2)} className="px-6 py-3 bg-gray-600 text-white font-black rounded-xl text-sm hover:opacity-80 transition-all">← Anterior</button>
              <button onClick={guardarEvaluacion} disabled={guardando} className="px-6 py-3 bg-green-500 text-white font-black rounded-xl text-sm hover:scale-105 transition-all disabled:opacity-50">{guardando ? 'Guardando...' : '💾 Guardar Evaluación'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}