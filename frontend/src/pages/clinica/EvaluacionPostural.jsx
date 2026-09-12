import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import BodyChartContainer from '../../components/clinica/BodyChart/BodyChartContainer';
import { RANGOS_ROM, TESTS_POR_REGION } from '../../components/clinica/BodyChart/regionesConfig';
import AnamnesisForm from '../../components/clinica/Formularios/AnamnesisForm';
import { consultarAuraIA } from '../../services/iaService';

export default function EvaluacionPostural({ temaOscuro }) {
  const { pacienteId } = useParams();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paso, setPaso] = useState(1);
  const [guardando, setGuardando] = useState(false);
  const [microfonoActivo, setMicrofonoActivo] = useState(false);
  const [vistaDetalle, setVistaDetalle] = useState(null);
  const [generandoInforme, setGenerandoInforme] = useState(false);
  const [tipoFormulario, setTipoFormulario] = useState(['general']);
  const [evaluacionId, setEvaluacionId] = useState(null);
  const [estadoActual, setEstadoActual] = useState('borrador');

  // ===== CATÁLOGOS =====
  const [catalogos, setCatalogos] = useState({
    ejercicios: [],
    agentes: [],
    masoterapia: [],
  });

  // ===== ESTADO DEL PLAN =====
  const [plan, setPlan] = useState(null);
  const [mostrarPlan, setMostrarPlan] = useState(false);
  const [generandoPlan, setGenerandoPlan] = useState(false);

  // ===== ESTADO PARA LA EDICIÓN DEL PLAN =====
  const [planEditado, setPlanEditado] = useState({
    diagnostico_sugerido: '',
    justificacion: '',
    agentes_fisicos: [],
    masoterapia: [],
    ejercicios: [],
    recomendaciones_naturales: [],
    recomendaciones_generales: [],
    alertas_seguridad: [],
  });
  const [parametrosEjercicios, setParametrosEjercicios] = useState({});

  // Estado principal de la evaluación
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
    recomendaciones: '',
    alertas: '',
    plan_tratamiento: '',
  });

  // ========== CARGAR CATÁLOGOS ==========
  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        const [ejercicios, agentes, masoterapia] = await Promise.all([
          fetch('/src/data/catalogo_ejercicios.json').then(res => {
            if (!res.ok) throw new Error('No se pudo cargar ejercicios');
            return res.json();
          }),
          fetch('/src/data/catalogo_agentes_fisicos.json').then(res => {
            if (!res.ok) throw new Error('No se pudo cargar agentes');
            return res.json();
          }),
          fetch('/src/data/catalogo_masoterapia.json').then(res => {
            if (!res.ok) throw new Error('No se pudo cargar masoterapia');
            return res.json();
          }),
        ]);
        setCatalogos({ ejercicios, agentes, masoterapia });
        console.log('✅ Catálogos cargados correctamente');
      } catch (err) {
        console.warn('⚠️ Error cargando catálogos:', err);
        setCatalogos({ ejercicios: [], agentes: [], masoterapia: [] });
      }
    };
    cargarCatalogos();
  }, []);

  // ========== Dictado de voz ==========
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
        if (campoActivo) {
          if (campoActivo.startsWith('especial_')) {
            handleInputChange(campoActivo, transcript);
          } else if (campoActivo.startsWith('obs_') || campoActivo.startsWith('notas_')) {
            const partes = campoActivo.split('_');
            const tipo = partes[0];
            const region = partes.slice(1).join('_');
            const campoReal = tipo === 'obs' ? 'observaciones' : 'notas';
            handleRegionDataChange(region, campoReal, transcript);
          } else {
            handleInputChange(campoActivo, transcript);
          }
          setEscuchando(false);
          setCampoActivo(null);
        }
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

  // ========== Carga de paciente y evaluación ==========
  useEffect(() => {
    const cargarPaciente = async () => {
      if (!pacienteId) { setLoading(false); return; }
      const { data, error } = await supabase.from('pacientes').select('*').eq('id', pacienteId).single();
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

    const query = new URLSearchParams(window.location.search);
    const evalId = query.get('evaluacion_id');
    if (evalId) cargarEvaluacion(evalId);
  }, [pacienteId]);

  const cargarEvaluacion = async (evalId) => {
    try {
      const { data, error } = await supabase.from('evaluaciones').select('*').eq('id', evalId).single();
      if (error) throw error;
      if (data) {
        setEvaluacionId(evalId);
        setEstadoActual(data.estado || 'borrador');
        const evalData = {
          paciente_id: data.paciente_id,
          edad: data.edad ? data.edad.toString() : '',
          ocupacion: data.ocupacion || '',
          sexo: data.sexo || '',
          estado_civil: data.estado_civil || '',
          telefono: data.telefono || '',
          direccion: data.direccion || '',
          motivo_consulta: data.motivo_consulta || '',
          tiempo_evolucion: data.tiempo_evolucion || '',
          mecanismo_lesion: data.mecanismo_lesion || '',
          antecedentes_medicos: data.antecedentes_medicos || '',
          alergias: data.alergias || '',
          medicamentos: data.medicamentos || '',
          cirugias_previas: data.cirugias_previas || '',
          tipo_dolor: data.tipo_dolor || [],
          intensidad_reposo: data.intensidad_reposo || 0,
          intensidad_actividad: data.intensidad_actividad || 0,
          factores_agravantes: data.factores_agravantes || '',
          factores_atenuantes: data.factores_atenuantes || '',
          sintomas_asociados: data.sintomas_asociados || '',
          regiones: data.regiones || [],
          datos_regiones: data.datos_regiones || {},
          analisis_ia: data.analisis_ia || '',
          recomendaciones: data.datos_regiones?._recomendaciones || '',
          alertas: data.datos_regiones?._alertas || '',
          plan_tratamiento: data.datos_regiones?._plan_tratamiento || '',
        };
        const camposExtra = data.datos_regiones?._campos_extra || {};
        Object.keys(camposExtra).forEach(key => { evalData[key] = camposExtra[key]; });
        setEvaluacion(evalData);
        if (data.tipo_formulario) setTipoFormulario(data.tipo_formulario.split(','));
        else setTipoFormulario(['general']);
        if (data.regiones && data.regiones.length > 0) setPaso(3);
        else setPaso(1);
      }
    } catch (error) {
      console.error(error);
      alert('No se pudo cargar la evaluación para edición.');
    }
  };

  // ========== Manejadores ==========
  const handleInputChange = (campo, valor) => {
    setEvaluacion(prev => ({ ...prev, [campo]: valor }));
  };

  const handleRegionDataChange = (region, campo, valor) => {
    setEvaluacion(prev => ({
      ...prev,
      datos_regiones: {
        ...prev.datos_regiones,
        [region]: { ...prev.datos_regiones[region], [campo]: valor },
      },
    }));
  };

  const toggleRegion = (regionId) => {
    setEvaluacion(prev => {
      const nuevasRegiones = prev.regiones.includes(regionId)
        ? prev.regiones.filter(r => r !== regionId)
        : [...prev.regiones, regionId];
      const nuevosDatos = { ...prev.datos_regiones };
      if (!nuevasRegiones.includes(regionId)) delete nuevosDatos[regionId];
      return { ...prev, regiones: nuevasRegiones, datos_regiones: nuevosDatos };
    });
  };

  // ============================================================
  // FUNCIÓN PARA COMPILAR EL PLAN DE TRATAMIENTO (TEXTO CON DOBLE SALTO)
  // ============================================================
  const compilarPlanTexto = () => {
    const agentesSeleccionados = planEditado.agentes_fisicos.map(nombre => {
      const encontrado = catalogos.agentes.find(a => a.nombre === nombre);
      return encontrado || { nombre, descripcion: 'Descripción no disponible' };
    });
    const masoterapiaSeleccionada = planEditado.masoterapia.map(nombre => {
      const encontrado = catalogos.masoterapia.find(m => m.nombre === nombre);
      return encontrado || { nombre, descripcion: 'Descripción no disponible' };
    });
    const ejerciciosSeleccionados = planEditado.ejercicios.map(nombre => {
      const encontrado = catalogos.ejercicios.find(e => e.nombre === nombre);
      const params = parametrosEjercicios[nombre] || {};
      return {
        ...(encontrado || { nombre, descripcion_terapeuta: 'Descripción no disponible' }),
        parametros: params,
      };
    });

    const estiramientos = ejerciciosSeleccionados.filter(e => 
      e.nombre.toLowerCase().includes('estiramiento') || 
      e.nombre.toLowerCase().includes('movilización')
    );
    const fortalecimiento = ejerciciosSeleccionados.filter(e => 
      !e.nombre.toLowerCase().includes('estiramiento') && 
      !e.nombre.toLowerCase().includes('movilización')
    );

    // 🔥 DOBLE SALTO DE LÍNEA (\n\n) entre cada número para forzar separación
    let texto = `1. Diagnóstico sugerido: ${planEditado.diagnostico_sugerido || 'No especificado'}\n\n`;
    texto += `2. Justificación: ${planEditado.justificacion || 'No especificada'}\n\n`;
    
    texto += `3. Agentes Físicos:\n`;
    if (agentesSeleccionados.length > 0) {
      agentesSeleccionados.forEach(a => {
        texto += `   - ${a.nombre}: ${a.descripcion || ''}\n`;
      });
    } else {
      texto += `   - Ninguno\n`;
    }
    texto += `\n`;

    texto += `4. Masoterapia (Técnicas manuales):\n`;
    if (masoterapiaSeleccionada.length > 0) {
      masoterapiaSeleccionada.forEach(m => {
        texto += `   - ${m.nombre}\n`;
      });
    } else {
      texto += `   - Ninguna\n`;
    }
    texto += `\n`;

    texto += `5. Kinesiología (Ejercicios):\n`;
    if (ejerciciosSeleccionados.length > 0) {
      if (estiramientos.length > 0) {
        texto += `   Estiramientos:\n`;
        estiramientos.forEach(e => {
          texto += `      - ${e.nombre}: ${e.descripcion_terapeuta || ''} (Series: ${e.parametros.series || 3}, Repeticiones: ${e.parametros.repeticiones || 10}, Frecuencia: ${e.parametros.frecuencia || 'diaria'})\n`;
        });
      }
      if (fortalecimiento.length > 0) {
        texto += `   Fortalecimiento:\n`;
        fortalecimiento.forEach(e => {
          texto += `      - ${e.nombre}: ${e.descripcion_terapeuta || ''} (Series: ${e.parametros.series || 3}, Repeticiones: ${e.parametros.repeticiones || 10}, Frecuencia: ${e.parametros.frecuencia || 'diaria'})\n`;
        });
      }
      if (estiramientos.length === 0 && fortalecimiento.length === 0) {
        texto += `      - Ninguno\n`;
      }
    } else {
      texto += `   - Ninguno\n`;
    }
    texto += `\n`;

    texto += `6. Recomendaciones para el paciente en casa:\n`;
    texto += `   Atención natural:\n`;
    if (planEditado.recomendaciones_naturales && planEditado.recomendaciones_naturales.length > 0) {
      planEditado.recomendaciones_naturales.forEach(r => {
        texto += `      - ${r}\n`;
      });
    } else {
      texto += `      - Ninguna\n`;
    }

    return texto;
  };

  // ============================================================
  // GUARDAR EVALUACIÓN (CON COMPILACIÓN AUTOMÁTICA DEL PLAN)
  // ============================================================
  const guardarEvaluacion = async (nuevoEstado) => {
    if (evaluacion.regiones.length === 0) {
      alert('Selecciona al menos una región afectada.');
      return;
    }
    setGuardando(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');
      const { data: perfil } = await supabase.from('profiles').select('centro_id').eq('id', user.id).single();

      // 🔥 MAGIA: Si el plan está visible, compilamos todo automáticamente
      let planFinal = evaluacion.plan_tratamiento;
      let recomendacionesFinal = evaluacion.recomendaciones;
      let alertasFinal = evaluacion.alertas;

      if (mostrarPlan && planEditado) {
        planFinal = compilarPlanTexto();
        recomendacionesFinal = planEditado.recomendaciones_generales.join('\n');
        alertasFinal = planEditado.alertas_seguridad.join('\n');
        
        // Actualizar el estado local para que coincida
        setEvaluacion(prev => ({
          ...prev,
          plan_tratamiento: planFinal,
          recomendaciones: recomendacionesFinal,
          alertas: alertasFinal,
        }));
      }

      const camposEspeciales = {};
      Object.keys(evaluacion).forEach(key => {
        if (key.startsWith('especial_')) camposEspeciales[key] = evaluacion[key];
      });

      const datosRegionesConExtra = {
        ...evaluacion.datos_regiones,
        _campos_extra: camposEspeciales,
        _recomendaciones: recomendacionesFinal,
        _alertas: alertasFinal,
        _plan_tratamiento: planFinal,
      };

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
        datos_regiones: datosRegionesConExtra,
        analisis_ia: evaluacion.analisis_ia || null,
        tipo_formulario: tipoFormulario.join(','),
        estado: nuevoEstado,
      };

      let error;
      if (evaluacionId) {
        const { error: updateError } = await supabase
          .from('evaluaciones')
          .update(datos)
          .eq('id', evaluacionId)
          .in('estado', ['borrador', 'rechazado']);
        error = updateError;
        if (error && error.code === 'PGRST116') {
          alert('No puedes editar una evaluación que ya está en aprobación o aprobada.');
          setGuardando(false);
          return;
        }
      } else {
        const { error: insertError } = await supabase.from('evaluaciones').insert([datos]);
        error = insertError;
        if (!error) {
          const { data: newData } = await supabase
            .from('evaluaciones')
            .select('id')
            .eq('paciente_id', pacienteId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
          if (newData) setEvaluacionId(newData.id);
        }
      }
      if (error) throw error;
      
      alert(`✅ Evaluación guardada como "${nuevoEstado === 'borrador' ? 'borrador' : 'enviada a aprobación'}" correctamente.`);
      navigate(`/clinica/pacientes/${pacienteId}`);
    } catch (error) {
      console.error(error);
      alert('Error al guardar: ' + error.message);
    } finally {
      setGuardando(false);
    }
  };

  // ============================================================
  // FORMATEAR NOMBRES DE REGIONES
  // ============================================================
  const formatearNombreRegion = (nombre) => {
    const map = {
      'cabeza': 'Cabeza', 'cuello': 'Cuello', 'nuca': 'Nuca',
      'torax': 'Tórax', 'pecho': 'Pecho', 'espalda': 'Espalda',
      'hombro': 'Hombro', 'brazo': 'Brazo', 'antebrazo': 'Antebrazo',
      'mano': 'Mano', 'muneca': 'Muñeca', 'codo': 'Codo',
      'pelvis': 'Pelvis', 'cadera': 'Cadera', 'sacro': 'Sacro', 'pubis': 'Pubis',
      'pierna': 'Pierna', 'muslo': 'Muslo', 'rodilla': 'Rodilla',
      'rotula': 'Rótula', 'gemelo': 'Gemelo', 'tobillo': 'Tobillo',
      'pie': 'Pie', 'talon': 'Talón',
      'acromion': 'Acromion', 'deltoides': 'Deltoides', 'manguito': 'Manguito Rotador',
      'clavicula': 'Clavícula', 'trapecio': 'Trapecio', 'escapula': 'Escápula',
      'lumbar': 'Lumbar', 'cervical': 'Cervical', 'dorsal': 'Dorsal',
      'poplitea': 'Fosa Poplítea', 'lca': 'LCA', 'lcp': 'LCP',
      'lcm': 'LCM', 'lcl': 'LCL', 'menisco': 'Menisco',
      'cuadriceps': 'Cuádriceps', 'isquiotibial': 'Isquiotibial',
      'soleo': 'Sóleo', 'tendon_aquiles': 'Tendón de Aquiles',
      'biceps': 'Bíceps', 'triceps': 'Tríceps', 'olecranon': 'Olécranon',
      'tibial': 'Tibial',
      'izq': 'Izquierdo', 'der': 'Derecho',
      'ant': 'Anterior', 'post': 'Posterior',
      'med': 'Medial', 'lat': 'Lateral',
      'inf': 'Inferior', 'sup': 'Superior',
      'prox': 'Proximal', 'dist': 'Distal',
      'ilion': 'Ilion', 'isquion': 'Isquion', 'gluteo': 'Glúteo',
    };

    let resultado = nombre;
    Object.keys(map).forEach(key => {
      resultado = resultado.replace(new RegExp(`_${key}(_|$)`, 'g'), ` ${map[key]}$1`);
    });
    resultado = resultado.split('_').map(p => {
      if (map[p]) return map[p];
      return p.charAt(0).toUpperCase() + p.slice(1);
    }).join(' ').trim();

    resultado = resultado.replace(/\bLCA\b/g, 'Ligamento Cruzado Anterior');
    resultado = resultado.replace(/\bLCP\b/g, 'Ligamento Cruzado Posterior');
    resultado = resultado.replace(/\bLCM\b/g, 'Ligamento Colateral Medial');
    resultado = resultado.replace(/\bLCL\b/g, 'Ligamento Colateral Lateral');

    return resultado;
  };

  // ============================================================
  // GENERAR PLAN DE TRATAMIENTO (con IA)
  // ============================================================
  const generarPlan = async () => {
    if (evaluacion.regiones.length === 0) {
      alert('Debes seleccionar al menos una región afectada (Paso 2) antes de generar el plan.');
      return;
    }

    setGenerandoPlan(true);
    try {
      const datosParaIA = {
        edad: evaluacion.edad || 'No especificada',
        sexo: evaluacion.sexo || 'No especificado',
        ocupacion: evaluacion.ocupacion || 'No especificada',
        motivo: evaluacion.motivo_consulta || 'No especificado',
        tiempo_evolucion: evaluacion.tiempo_evolucion || 'No especificado',
        mecanismo: evaluacion.mecanismo_lesion || 'No especificado',
        tipo_dolor: evaluacion.tipo_dolor.join(', ') || 'No especificado',
        eva_reposo: evaluacion.intensidad_reposo || 0,
        eva_actividad: evaluacion.intensidad_actividad || 0,
        factores_agravantes: evaluacion.factores_agravantes || 'No especificados',
        factores_atenuantes: evaluacion.factores_atenuantes || 'No especificados',
        sintomas_asociados: evaluacion.sintomas_asociados || 'No especificados',
        regiones_afectadas: evaluacion.regiones.map(r => formatearNombreRegion(r)).join(', '),
        datos_por_region: evaluacion.regiones.map(r => {
          const data = evaluacion.datos_regiones[r] || {};
          return `${formatearNombreRegion(r)}: EVA ${data.eva || 'N/A'}/10, ROM ${data.rom || 'N/A'}°, Tests: ${(data.tests || []).join(', ') || 'Ninguno'}`;
        }).join('; '),
      };

      let fase = 'subaguda';
      const tiempo = evaluacion.tiempo_evolucion || '';
      if (tiempo.includes('día') || tiempo.includes('horas') || tiempo.includes('48') || tiempo.includes('72')) fase = 'aguda';
      else if (tiempo.includes('semana') && !tiempo.includes('mes')) fase = 'subaguda';
      else if (tiempo.includes('mes')) fase = 'cronica';

      const systemPrompt = `Eres un fisioterapeuta experto. Genera un plan de tratamiento en formato JSON con esta estructura exacta:
{
  "diagnostico_sugerido": "Texto breve (máx 100 caracteres)",
  "justificacion": "Explicación clínica (máx 200 caracteres)",
  "agentes_fisicos": ["Lista de nombres del catálogo"],
  "masoterapia": ["Lista de técnicas del catálogo"],
  "ejercicios": ["Lista de nombres del catálogo"],
  "recomendaciones_naturales": ["Consejos caseros"],
  "recomendaciones_generales": ["Recomendaciones sobre frecuencia de sesiones, ergonomía, hábitos, etc."],
  "alertas_seguridad": ["Alertas específicas para este paciente (contraindicaciones, signos de alarma, etc.)"]
}
Reglas: Solo usa agentes, técnicas y ejercicios del catálogo. Sé conservador con el diagnóstico. NO uses la palabra "IA". Fase detectada: ${fase}. Datos: ${JSON.stringify(datosParaIA, null, 2)}`;

      const respuestaIA = await consultarAuraIA(
        `Genera un plan de tratamiento para este paciente.`,
        { fase: fase },
        [],
        systemPrompt
      );

      let planGenerado;
      try {
        const jsonMatch = respuestaIA.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          planGenerado = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No se encontró JSON');
        }
      } catch (e) {
        console.error('Error parseando JSON:', e);
        planGenerado = {
          diagnostico_sugerido: 'Diagnóstico diferencial pendiente',
          justificacion: 'No se pudo generar análisis detallado. Revisa los datos manualmente.',
          agentes_fisicos: ['Ultrasonido', 'TENS'],
          masoterapia: ['Masaje de tejido profundo'],
          ejercicios: ['Estiramientos suaves'],
          recomendaciones_naturales: ['Compresas frías', 'Baños de contraste'],
          recomendaciones_generales: ['Realizar sesiones 2 veces por semana', 'Mantener una postura adecuada'],
          alertas_seguridad: ['Evitar ejercicios con carga si el dolor supera 5/10'],
        };
      }

      const { ejercicios, agentes, masoterapia } = catalogos;
      const planEnriquecido = {
        ...planGenerado,
        agentes_detalle: planGenerado.agentes_fisicos?.map(nombre => {
          const encontrado = agentes.find(a => a.nombre.toLowerCase() === nombre.toLowerCase());
          return encontrado || { nombre, descripcion: 'Descripción no disponible' };
        }) || [],
        masoterapia_detalle: planGenerado.masoterapia?.map(nombre => {
          const encontrado = masoterapia.find(m => m.nombre.toLowerCase() === nombre.toLowerCase());
          return encontrado || { nombre, descripcion: 'Descripción no disponible' };
        }) || [],
        ejercicios_detalle: planGenerado.ejercicios?.map(nombre => {
          const encontrado = ejercicios.find(e => e.nombre.toLowerCase() === nombre.toLowerCase());
          return encontrado || { nombre, descripcion_terapeuta: 'Descripción no disponible' };
        }) || [],
        fase: fase,
        fecha_generacion: new Date().toISOString(),
      };

      setPlan(planEnriquecido);
      
      setPlanEditado({
        diagnostico_sugerido: planEnriquecido.diagnostico_sugerido || '',
        justificacion: planEnriquecido.justificacion || '',
        agentes_fisicos: planEnriquecido.agentes_detalle.map(a => a.nombre) || [],
        masoterapia: planEnriquecido.masoterapia_detalle.map(m => m.nombre) || [],
        ejercicios: planEnriquecido.ejercicios_detalle.map(e => e.nombre) || [],
        recomendaciones_naturales: planEnriquecido.recomendaciones_naturales || [],
        recomendaciones_generales: planGenerado.recomendaciones_generales || ['Realizar sesiones 2 veces por semana', 'Mantener una postura adecuada'],
        alertas_seguridad: planGenerado.alertas_seguridad || ['Evitar ejercicios con carga si el dolor supera 5/10'],
      });

      setEvaluacion(prev => ({
        ...prev,
        recomendaciones: (planGenerado.recomendaciones_generales || ['Realizar sesiones 2 veces por semana', 'Mantener una postura adecuada']).join('\n'),
        alertas: (planGenerado.alertas_seguridad || ['Evitar ejercicios con carga si el dolor supera 5/10']).join('\n'),
      }));

      const paramsIniciales = {};
      planEnriquecido.ejercicios_detalle.forEach(ej => {
        const encontrado = catalogos.ejercicios.find(ce => ce.nombre === ej.nombre);
        if (encontrado && encontrado.parametros_por_defecto) {
          paramsIniciales[ej.nombre] = { ...encontrado.parametros_por_defecto };
        } else {
          paramsIniciales[ej.nombre] = { series: 3, repeticiones: 10, frecuencia: 'diaria' };
        }
      });
      setParametrosEjercicios(paramsIniciales);
      
      setMostrarPlan(true);
    } catch (error) {
      console.error('Error al generar plan:', error);
      alert('Error al generar plan. Intenta de nuevo.');
    } finally {
      setGenerandoPlan(false);
    }
  };

  // ============================================================
  // MANEJADORES PARA LA EDICIÓN DEL PLAN
  // ============================================================
  const handlePlanChange = (campo, valor) => {
    setPlanEditado(prev => ({ ...prev, [campo]: valor }));
  };

  const toggleItemPlan = (tipo, itemNombre) => {
    setPlanEditado(prev => {
      const lista = prev[tipo] || [];
      if (lista.includes(itemNombre)) {
        return { ...prev, [tipo]: lista.filter(i => i !== itemNombre) };
      } else {
        return { ...prev, [tipo]: [...lista, itemNombre] };
      }
    });
  };

  const handleParametroEjercicio = (ejercicioNombre, param, valor) => {
    setParametrosEjercicios(prev => ({
      ...prev,
      [ejercicioNombre]: { ...prev[ejercicioNombre], [param]: valor },
    }));
  };

  // ============================================================
  // GENERAR INFORME (CORREGIDO: PUNTO 5 EN TABLA, 7 Y 8 CON LISTAS, 9 CON ALERTAS)
  // ============================================================
  const generarInforme = async () => {
    if (evaluacion.regiones.length === 0) {
      alert('No hay regiones seleccionadas para generar el informe.');
      return;
    }

    setGenerandoInforme(true);
    try {
      const { data: pacienteData } = await supabase
        .from('pacientes')
        .select('*')
        .eq('id', pacienteId)
        .single();

      const { data: { user } } = await supabase.auth.getUser();
      const { data: perfil } = await supabase
        .from('profiles')
        .select('nombre_completo, centro_id, titulo_profesional, numero_colegiatura')
        .eq('id', user.id)
        .single();

      let centroNombre = 'Centro CJ';
      let logoUrl = '';
      if (perfil?.centro_id) {
        const { data: centro } = await supabase
          .from('centros')
          .select('nombre, logo_url')
          .eq('id', perfil.centro_id)
          .single();
        if (centro) {
          centroNombre = centro.nombre || 'Centro CJ';
          logoUrl = centro.logo_url || '';
        }
        if (!logoUrl) {
          const publicLogo = `/logo_centros/${perfil.centro_id}.png`;
          try {
            const response = await fetch(publicLogo);
            if (response.ok) logoUrl = publicLogo;
          } catch (e) {}
        }
      }

      const nombrePaciente = pacienteData ? `${pacienteData.nombre} ${pacienteData.apellidos}` : 'Paciente';
      const fecha = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const hora = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      const usuario = perfil?.nombre_completo || 'Usuario';
      const titulo = perfil?.titulo_profesional || '';
      const colegiatura = perfil?.numero_colegiatura || '';
      
      let credenciales = '';
      if (titulo && colegiatura) {
        credenciales = `${titulo} - Nº Colegiatura: ${colegiatura}`;
      } else if (titulo) {
        credenciales = titulo;
      } else if (colegiatura) {
        credenciales = `Nº Colegiatura: ${colegiatura}`;
      }

      const regiones = evaluacion.regiones || [];
      const datosRegiones = evaluacion.datos_regiones || {};
      const recomendaciones = evaluacion.recomendaciones || '';
      const alertas = evaluacion.alertas || '';
      const planTratamiento = evaluacion.plan_tratamiento || '';

      // ============================================================
      // 🔥 PUNTO 5: REGIONES AFECTADAS - TABLA EN COLUMNAS (EXCEL)
      // ============================================================
      const zonas = {
        'Cabeza y Cuello': ['cabeza', 'cuello', 'nuca', 'cervical'],
        'Tronco': ['torax', 'pecho', 'espalda', 'abdomen', 'lumbar', 'dorsal', 'clavicula', 'trapecio', 'escapula'],
        'Miembro Superior': ['hombro', 'brazo', 'antebrazo', 'mano', 'muneca', 'codo', 'biceps', 'triceps', 'olecranon', 'deltoides', 'manguito', 'acromion'],
        'Miembro Inferior': ['pierna', 'muslo', 'rodilla', 'rotula', 'gemelo', 'tobillo', 'pie', 'talon', 'cuadriceps', 'isquiotibial', 'soleo', 'tendon_aquiles', 'tibial', 'poplitea', 'lca', 'lcp', 'lcm', 'lcl', 'menisco'],
        'Pelvis': ['pelvis', 'cadera', 'sacro', 'pubis', 'gluteo', 'ilion', 'isquion'],
        'Otras': [],
      };
      const zonasKeys = Object.keys(zonas);
      const regionesPorZona = {};
      zonasKeys.forEach(z => regionesPorZona[z] = []);
      
      regiones.forEach(r => {
        let asignada = false;
        for (const [zona, keywords] of Object.entries(zonas)) {
          if (zona === 'Otras') continue;
          if (keywords.some(k => r.includes(k))) {
            regionesPorZona[zona].push(r);
            asignada = true;
            break;
          }
        }
        if (!asignada) {
          regionesPorZona['Otras'].push(r);
        }
      });

      const maxItems = Math.max(...Object.values(regionesPorZona).map(arr => arr.length), 1);
      let regionesColumnasHTML = '<table border="1" cellpadding="4" cellspacing="0" style="width:100%; border-collapse:collapse; font-size:9pt; margin: 4px 0;">';
      regionesColumnasHTML += '<tr>';
      zonasKeys.forEach(zona => {
        regionesColumnasHTML += `<th style="background:#f1f5f9; font-weight:700; text-align:center; padding:4px;">${zona}</th>`;
      });
      regionesColumnasHTML += '</tr>';
      for (let i = 0; i < maxItems; i++) {
        regionesColumnasHTML += '<tr>';
        zonasKeys.forEach(zona => {
          const items = regionesPorZona[zona] || [];
          const nombre = items[i] ? formatearNombreRegion(items[i]) : '';
          regionesColumnasHTML += `<td style="text-align:center; padding:4px; vertical-align:top;">${nombre}</td>`;
        });
        regionesColumnasHTML += '</tr>';
      }
      regionesColumnasHTML += '</table>';

      // ============================================================
      // STICKMAN (Anterior / Posterior)
      // ============================================================
      const esPosterior = (r) => {
        const postRegions = ['nuca', 'espalda', 'sacro', 'gluteo', 'poplitea', 'lumbar', 'dorsal', 'escapula', 'trapecio', 'post'];
        if (postRegions.some(p => r.includes(p))) return true;
        return false;
      };
      const esAnterior = (r) => !esPosterior(r);
      const regionesAnteriores = regiones.filter(esAnterior);
      const regionesPosteriores = regiones.filter(esPosterior);

      const generarStickman = (regionesVista, titulo) => {
        if (regionesVista.length === 0) return '';
        const centroides = {
          cabeza: { cx: 100, cy: 30 }, cuello: { cx: 100, cy: 50 }, nuca: { cx: 100, cy: 50 },
          torax: { cx: 100, cy: 85 }, pecho: { cx: 100, cy: 85 }, espalda: { cx: 100, cy: 85 },
          hombro_izq: { cx: 75, cy: 45 }, hombro_der: { cx: 125, cy: 45 },
          brazo_izq: { cx: 60, cy: 80 }, brazo_der: { cx: 140, cy: 80 },
          biceps: { cx: 60, cy: 80 }, biceps_izq: { cx: 60, cy: 80 }, biceps_der: { cx: 140, cy: 80 },
          codo: { cx: 60, cy: 105 }, codo_izq: { cx: 60, cy: 105 }, codo_der: { cx: 140, cy: 105 },
          antebrazo: { cx: 60, cy: 125 }, antebrazo_izq: { cx: 60, cy: 125 }, antebrazo_der: { cx: 140, cy: 125 },
          muneca: { cx: 60, cy: 145 }, muneca_izq: { cx: 60, cy: 145 }, muneca_der: { cx: 140, cy: 145 },
          mano: { cx: 60, cy: 155 }, mano_izq: { cx: 60, cy: 155 }, mano_der: { cx: 140, cy: 155 },
          pelvis: { cx: 100, cy: 145 }, cadera: { cx: 100, cy: 145 },
          sacro: { cx: 100, cy: 145 }, pubis: { cx: 100, cy: 155 },
          pierna_izq: { cx: 80, cy: 200 }, pierna_der: { cx: 120, cy: 200 },
          cuadriceps: { cx: 80, cy: 200 }, cuadriceps_izq: { cx: 80, cy: 200 }, cuadriceps_der: { cx: 120, cy: 200 },
          isquiotibial: { cx: 80, cy: 200 }, isquiotibiales: { cx: 80, cy: 200 },
          rodilla_izq: { cx: 80, cy: 235 }, rodilla_der: { cx: 120, cy: 235 },
          rotula: { cx: 80, cy: 235 }, rotula_izq: { cx: 80, cy: 235 }, rotula_der: { cx: 120, cy: 235 },
          gemelo: { cx: 80, cy: 260 }, gemelo_izq: { cx: 80, cy: 260 }, gemelo_der: { cx: 120, cy: 260 },
          tobillo: { cx: 80, cy: 280 }, tobillo_izq: { cx: 80, cy: 280 }, tobillo_der: { cx: 120, cy: 280 },
          pie_izq: { cx: 75, cy: 295 }, pie_der: { cx: 125, cy: 295 },
          acromion: { cx: 75, cy: 45 }, acromion_izq: { cx: 75, cy: 45 }, acromion_der: { cx: 125, cy: 45 },
          deltoides: { cx: 75, cy: 55 }, deltoides_ant: { cx: 75, cy: 55 }, deltoides_post: { cx: 75, cy: 55 },
          manguito: { cx: 75, cy: 60 }, manguito_ant: { cx: 75, cy: 60 }, manguito_post: { cx: 75, cy: 60 },
          clavicula_izq: { cx: 90, cy: 40 }, clavicula_der: { cx: 110, cy: 40 },
          trapecio_izq: { cx: 90, cy: 45 }, trapecio_der: { cx: 110, cy: 45 },
          escapula_izq: { cx: 90, cy: 55 }, escapula_der: { cx: 110, cy: 55 },
          lumbar: { cx: 100, cy: 100 }, cervical: { cx: 100, cy: 30 }, dorsal: { cx: 100, cy: 50 },
          poplitea_izq: { cx: 80, cy: 195 }, poplitea_der: { cx: 120, cy: 195 },
          lca: { cx: 80, cy: 195 }, lcp: { cx: 80, cy: 195 },
          menisco_med: { cx: 80, cy: 195 }, menisco_lat: { cx: 120, cy: 195 },
        };
        const puntosHTML = regionesVista.map(r => {
          let coords = centroides[r];
          if (!coords) {
            const baseKey = r.split('_')[0];
            coords = centroides[baseKey];
          }
          if (!coords) coords = { cx: 100, cy: 100 };
          return `<circle cx="${coords.cx}" cy="${coords.cy}" r="5" fill="#ef4444" stroke="#fff" stroke-width="1.5"/>`;
        }).join('');
        const siluetaPaths = `
          <path d="M 87,22 C 87,7 113,7 113,22 C 113,34 107,42 105,46 C 106,50 112,52 115,55 L 85,55 C 88,52 94,50 95,46 C 93,42 87,34 87,22 Z"/>
          <path d="M 85,55 C 98,58 115,55 115,55 C 122,68 118,98 112,120 L 88,120 C 82,98 78,68 85,55 Z"/>
          <path d="M 115,55 C 126,55 132,60 129,71 C 123,73 117,67 115,55 Z"/>
          <path d="M 85,55 C 74,55 68,60 71,71 C 77,73 83,67 85,55 Z"/>
          <path d="M 129,71 C 138,83 134,112 130,142 C 128,154 123,154 120,142 C 118,112 121,88 116,73 C 119,69 125,69 129,71 Z"/>
          <path d="M 71,71 C 62,83 66,112 70,142 C 72,154 77,154 80,142 C 82,112 79,88 84,73 C 81,69 75,69 71,71 Z"/>
          <path d="M 120,142 L 130,142 C 131,148 133,156 131,163 C 129,167 124,167 121,160 C 119,152 119,146 120,142 Z"/>
          <path d="M 80,142 L 70,142 C 69,148 67,156 69,163 C 71,167 76,167 79,160 C 81,152 81,146 80,142 Z"/>
          <path d="M 88,120 L 112,120 C 116,136 114,154 106,168 L 100,172 L 94,168 C 86,154 84,136 88,120 Z"/>
          <path d="M 103,172 L 108,168 C 120,185 121,210 114,235 C 111,245 113,268 111,288 L 103,288 C 104,268 107,245 105,235 C 107,210 105,185 103,172 Z"/>
          <path d="M 97,172 L 92,168 C 80,185 79,210 86,235 C 89,245 87,268 89,288 L 97,288 C 96,268 93,245 95,235 C 93,210 95,185 97,172 Z"/>
          <path d="M 103,288 L 111,288 C 115,294 119,303 113,308 C 107,311 101,304 103,288 Z"/>
          <path d="M 97,288 L 89,288 C 85,294 81,303 87,308 C 93,311 99,304 97,288 Z"/>
        `;
        return `
          <div style="text-align:center; margin: 5px 0;">
            <h3 style="font-size:11pt; margin: 3px 0;">${titulo}</h3>
            <svg viewBox="0 0 200 320" width="140" height="224" xmlns="http://www.w3.org/2000/svg" style="max-width:160px; height:auto;">
              <defs><linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#f8fafc"/><stop offset="100%" stopColor="#e2e8f0"/></linearGradient></defs>
              <g fill="url(#bodyGrad)" stroke="#94a3b8" stroke-width="1.2" opacity="0.8">${siluetaPaths}</g>
              ${puntosHTML}
            </svg>
          </div>
        `;
      };

      const stickmanAnterior = generarStickman(regionesAnteriores, 'Vista Anterior');
      const stickmanPosterior = generarStickman(regionesPosteriores, 'Vista Posterior');

      // ============================================================
      // 🔥 PUNTO 6: EVALUACIÓN POR REGIÓN (Muestra el test real)
      // ============================================================
      const tablaRegiones = regiones.map(region => {
        const data = datosRegiones[region] || {};
        const nombreFormateado = formatearNombreRegion(region);
        const eva = data.eva !== undefined ? `${data.eva}/10` : '—';
        const rom = data.rom || '—';
        const tests = (data.tests && data.tests.length > 0) ? data.tests.join(', ') : '—';
        const obs = data.observaciones || '—';
        const notas = data.notas || '—';
        return { region: nombreFormateado, eva, rom, tests, obs, notas };
      });

      const tablaHTML = tablaRegiones.map(row => `
        <tr>
          <td style="font-weight:600;">${row.region}</td>
          <td>${row.eva}</td>
          <td>${row.rom}</td>
          <td>${row.tests}</td>
          <td>${row.obs}</td>
          <td>${row.notas}</td>
        </tr>
      `).join('');

      // ============================================================
      // 🔥 PUNTO 7: RECOMENDACIONES (Lista numerada 1., 2., 3.)
      // ============================================================
      const recomLines = recomendaciones.split('\n').filter(line => line.trim() !== '');
      let recomendacionesHTML = '<div style="font-size:9pt; line-height:1.5;">';
      if (recomLines.length > 0) {
        recomLines.forEach((line, idx) => {
          recomendacionesHTML += `<div style="margin-bottom: 2px;">${idx+1}. ${line}</div>`;
        });
      } else {
        recomendacionesHTML += '<span class="campo-vacio">No se han registrado recomendaciones.</span>';
      }
      recomendacionesHTML += '</div>';

      // ============================================================
      // 🔥 PUNTO 8: PLAN DE TRATAMIENTO (Forzar saltos de línea con white-space: pre-wrap)
      // ============================================================
      let planHTML = '<div style="font-size:9pt; line-height:1.6; font-family: \'Calibri\', \'Roboto\', Arial, sans-serif; white-space: pre-wrap;">';
      if (planTratamiento) {
        // Reemplazar \n por saltos de línea reales (el white-space: pre-wrap los respeta)
        planHTML += planTratamiento;
      } else {
        planHTML += '<span class="campo-vacio">No se ha registrado un plan de tratamiento.</span>';
      }
      planHTML += '</div>';

      // ============================================================
      // 🔥 PUNTO 9: ALERTAS DE SEGURIDAD (ESPECÍFICAS + GENERAL)
      // ============================================================
      const alertLines = alertas.split('\n').filter(line => line.trim() !== '');
      let alertasHTML = '<div style="font-size:9pt; margin-bottom: 8px;">';
      alertasHTML += '<strong>9.1 Alertas Clínicas Específicas:</strong>';
      alertasHTML += '<div style="white-space:pre-wrap; margin-top: 4px; padding: 6px; background: #fef2f2; border-radius: 4px;">';
      if (alertLines.length > 0) {
        alertLines.forEach(line => {
          alertasHTML += `<div>• ${line}</div>`;
        });
      } else {
        alertasHTML += '<span class="campo-vacio">No se han registrado alertas específicas.</span>';
      }
      alertasHTML += '</div></div>';
      alertasHTML += `<div class="alerta">⚠️ Este informe contiene información confidencial del paciente. Solo debe ser utilizado por personal autorizado.</div>`;

      // ===== CONTENIDO HTML DEL INFORME (ESTRUCTURA COMPLETA) =====
      const contenidoHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Informe Clínico - ${nombrePaciente}</title>
          <style>
            @page { size: A4; margin: 1.5cm 1.5cm 1cm 1.5cm; }
            * { box-sizing: border-box; }
            body {
              font-family: 'Calibri', 'Roboto', Arial, sans-serif;
              font-size: 10pt;
              line-height: 1.4;
              color: #1e293b;
              background: white;
              margin: 0;
              padding: 0;
            }
            .pagina { display: flex; flex-direction: column; height: 100vh; padding: 0; page-break-after: always; position: relative; }
            .pagina:last-child { page-break-after: avoid; }
            .contenido { flex: 1; padding-bottom: 15px; }
            .encabezado {
              text-align: center;
              border-bottom: 2px solid #22d3ee;
              padding-bottom: 8px;
              margin-bottom: 15px;
              position: relative;
              min-height: 70px;
            }
            .encabezado .logo { max-width: 60px; max-height: 60px; float: left; margin-right: 12px; }
            .encabezado .logo-derecho { max-width: 50px; max-height: 50px; float: right; margin-left: 12px; }
            .encabezado .titulo { font-size: 16pt; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 1px; }
            .encabezado .subtitulo { font-size: 9pt; color: #64748b; }
            .encabezado .datos { font-size: 8pt; color: #475569; margin-top: 3px; }
            .pie {
              text-align: center;
              font-size: 8pt;
              color: #94a3b8;
              border-top: 1px solid #e2e8f0;
              padding-top: 6px;
              margin-top: auto;
              width: 100%;
            }
            .marca-agua {
              position: fixed;
              top: 0; left: 0; right: 0; bottom: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              pointer-events: none;
              z-index: 1000;
              opacity: 0.04;
              font-size: 80pt;
              font-weight: 900;
              color: #22d3ee;
              transform: rotate(-30deg);
              text-transform: uppercase;
              letter-spacing: 20px;
              user-select: none;
            }
            h1 { font-size: 13pt; font-weight: 700; color: #0f172a; border-left: 4px solid #22d3ee; padding-left: 10px; margin-top: 14px; margin-bottom: 6px; text-transform: uppercase; page-break-after: avoid; }
            table { width: 100%; border-collapse: collapse; margin: 4px 0; font-size: 9pt; page-break-inside: avoid; }
            th, td { border: 1px solid #cbd5e1; padding: 3px 5px; text-align: left; vertical-align: top; }
            th { background-color: #f1f5f9; font-weight: 700; }
            .alerta { background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 5px 10px; margin: 6px 0; border-radius: 3px; font-weight: 600; font-size: 9pt; }
            .stickman-container { display: flex; flex-wrap: wrap; justify-content: center; gap: 15px; margin: 8px 0; }
            .stickman-container > div { flex: 0 1 auto; text-align: center; }
            .firma { margin-top: 25px; border-top: 1px solid #94a3b8; padding-top: 8px; text-align: right; font-size: 10pt; }
            .campo-vacio { color: #94a3b8; font-style: italic; }
            @media print { .marca-agua { opacity: 0.03; } .pagina { height: auto; min-height: 100vh; } }
          </style>
        </head>
        <body>
          <div class="marca-agua">CONFIDENCIAL</div>

          <!-- PÁGINA 1 -->
          <div class="pagina">
            <div class="contenido">
              <div class="encabezado clearfix">
                ${logoUrl ? `<img src="${logoUrl}" class="logo" alt="Logo Centro" onerror="this.style.display='none'" />` : ''}
                <img src="/logos_cj_circular.png" class="logo-derecho" alt="CJ Fisioterapia" onerror="this.style.display='none'" />
                <div>
                  <div class="titulo">Informe de Evaluación Clínica</div>
                  <div class="subtitulo">${centroNombre}</div>
                  <div class="datos">Paciente: ${nombrePaciente} &nbsp;|&nbsp; Fecha: ${fecha} &nbsp;|&nbsp; ID: ${evaluacion.paciente_id}</div>
                </div>
              </div>
              <h1>1. Datos Generales</h1>
              <table>
                <tr><th>Campo</th><th>Valor</th></tr>
                ${evaluacion.edad ? `<tr><td>Edad</td><td>${evaluacion.edad}</td></tr>` : ''}
                ${evaluacion.sexo ? `<tr><td>Sexo</td><td>${evaluacion.sexo}</td></tr>` : ''}
                ${evaluacion.ocupacion ? `<tr><td>Ocupación</td><td>${evaluacion.ocupacion}</td></tr>` : ''}
                ${evaluacion.telefono ? `<tr><td>Teléfono</td><td>${evaluacion.telefono}</td></tr>` : ''}
                ${evaluacion.direccion ? `<tr><td>Dirección</td><td>${evaluacion.direccion}</td></tr>` : ''}
              </table>
              <h1>2. Motivo de Consulta</h1>
              ${evaluacion.motivo_consulta ? `<p><strong>Motivo principal:</strong> ${evaluacion.motivo_consulta}</p>` : ''}
              ${evaluacion.tiempo_evolucion ? `<p><strong>Tiempo de evolución:</strong> ${evaluacion.tiempo_evolucion}</p>` : ''}
              ${evaluacion.mecanismo_lesion ? `<p><strong>Mecanismo de lesión:</strong> ${evaluacion.mecanismo_lesion}</p>` : ''}
              <h1>3. Antecedentes</h1>
              <table>
                ${evaluacion.antecedentes_medicos ? `<tr><th>Antecedentes médicos</th><td>${evaluacion.antecedentes_medicos}</td></tr>` : ''}
                ${evaluacion.alergias ? `<tr><th>Alergias</th><td>${evaluacion.alergias}</td></tr>` : ''}
                ${evaluacion.medicamentos ? `<tr><th>Medicamentos actuales</th><td>${evaluacion.medicamentos}</td></tr>` : ''}
                ${evaluacion.cirugias_previas ? `<tr><th>Cirugías previas</th><td>${evaluacion.cirugias_previas}</td></tr>` : ''}
              </table>
            </div>
            <div class="pie">Documento Clínico Confidencial - ${centroNombre} - Pág. 1</div>
          </div>

          <!-- PÁGINA 2 -->
          <div class="pagina">
            <div class="contenido">
              <h1>4. Evaluación del Dolor</h1>
              ${evaluacion.tipo_dolor && evaluacion.tipo_dolor.length > 0 ? `<p><strong>Tipo de dolor:</strong> ${evaluacion.tipo_dolor.join(', ')}</p>` : ''}
              <table>
                <tr><th>Intensidad en reposo (EVA)</th><td>${evaluacion.intensidad_reposo || 0} / 10</td></tr>
                <tr><th>Intensidad en actividad (EVA)</th><td>${evaluacion.intensidad_actividad || 0} / 10</td></tr>
                ${evaluacion.factores_agravantes ? `<tr><th>Factores agravantes</th><td>${evaluacion.factores_agravantes}</td></tr>` : ''}
                ${evaluacion.factores_atenuantes ? `<tr><th>Factores atenuantes</th><td>${evaluacion.factores_atenuantes}</td></tr>` : ''}
                ${evaluacion.sintomas_asociados ? `<tr><th>Síntomas asociados</th><td>${evaluacion.sintomas_asociados}</td></tr>` : ''}
              </table>

              <h1>5. Regiones Afectadas</h1>
              ${regionesColumnasHTML}
              
              <div class="stickman-container">
                ${stickmanAnterior}
                ${stickmanPosterior}
                <p style="width:100%; text-align:center; font-size:8pt; color:#64748b; margin:0;">Los puntos rojos indican las regiones afectadas</p>
              </div>

              <h1>6. Evaluación por Región</h1>
              <table>
                <thead>
                  <tr><th style="width:22%;">Región</th><th style="width:8%;">EVA</th><th style="width:10%;">ROM</th><th style="width:18%;">Tests</th><th style="width:22%;">Observaciones</th><th style="width:20%;">Notas</th></tr>
                </thead>
                <tbody>${tablaHTML}</tbody>
              </table>
            </div>
            <div class="pie">Documento Clínico Confidencial - ${centroNombre} - Pág. 2</div>
          </div>

          <!-- PÁGINA 3 -->
          <div class="pagina">
            <div class="contenido">
              <h1>7. Recomendaciones Generales</h1>
              ${recomendacionesHTML}

              <h1>8. Plan de Tratamiento</h1>
              ${planHTML}

              <h1>9. Alertas de Seguridad</h1>
              ${alertasHTML}

              <h1>10. Datos de Generación</h1>
              <table>
                <tr><th>Informe generado por</th><td>${usuario}</td></tr>
                <tr><th>Fecha de generación</th><td>${fecha}</td></tr>
                <tr><th>Hora de generación</th><td>${hora}</td></tr>
                <tr><th>Centro</th><td>${centroNombre}</td></tr>
              </table>

              <div class="firma">
                <p>Firma del terapeuta: ________________________</p>
                <p style="font-size:8pt; color:#94a3b8;">${usuario}</p>
                ${credenciales ? `<p style="font-size:8pt; color:#64748b;">${credenciales}</p>` : ''}
              </div>
              <div style="text-align: center; margin-top: 15px; font-size: 9pt; color: #64748b;">--- Fin del informe ---</div>
            </div>
            <div class="pie">Documento Clínico Confidencial - ${centroNombre} - Pág. 3</div>
          </div>
        </body>
        </html>
      `;

      const ventana = window.open('', '_blank', 'width=800,height=600,scrollbars=yes');
      if (ventana) {
        ventana.document.title = `Informe Clínico - ${nombrePaciente}`;
        ventana.document.write(contenidoHTML);
        ventana.document.close();
        setTimeout(() => ventana.print(), 1000);
      } else {
        alert('Por favor, permite las ventanas emergentes para generar el informe.');
      }
    } catch (error) {
      console.error('Error al generar informe:', error);
      alert('Error al generar el informe: ' + error.message);
    } finally {
      setGenerandoInforme(false);
    }
  };

  // ========== ESTILOS ==========
  const bgPrincipal = temaOscuro ? 'bg-[#0a141d]' : 'bg-[#e2e8f0]';
  const textoPrincipal = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const bgTarjeta = temaOscuro ? 'bg-[#0a141d] border-gray-800' : 'bg-white border-gray-200';
  const bgInput = temaOscuro ? 'bg-black/20 border-white/10 text-white' : 'bg-gray-100 border-gray-300 text-[#0f172a]';

  if (loading) {
    return <div className={`min-h-screen ${bgPrincipal} flex items-center justify-center`}><div className="animate-spin rounded-full h-10 w-10 border-4 border-[#22d3ee] border-t-transparent"></div></div>;
  }

  return (
    <div className={`min-h-screen ${bgPrincipal} p-4 md:p-8 transition-colors duration-500`}>
      <div className="max-w-5xl mx-auto">
        <h1 className={`text-3xl font-black tracking-tight ${textoPrincipal} mb-2`}>
          {paciente ? `Evaluación - ${paciente.nombre} ${paciente.apellidos}` : 'Nueva Evaluación'}
        </h1>
        {evaluacionId && (
          <div className="mb-4 inline-block px-3 py-1 rounded-full text-xs font-bold uppercase bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
            Estado: {estadoActual}
          </div>
        )}
        <div className="flex justify-between items-center mb-4">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Paso {paso} de 3</p>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold uppercase ${microfonoActivo ? 'text-green-400' : 'text-yellow-400'}`}>
              {microfonoActivo ? '🎤 Micrófono activo' : '🔇 Micrófono inactivo'}
            </span>
          </div>
        </div>
        <div className="w-full h-1.5 bg-gray-700 rounded-full mb-3">
          <div className="h-full bg-[#22d3ee] rounded-full transition-all duration-500" style={{ width: `${(paso / 3) * 100}%` }} />
        </div>
        <div className="flex justify-between text-[8px] text-gray-500 uppercase tracking-wider mb-4">
          <span className={paso >= 1 ? 'text-[#22d3ee]' : ''}>1. Anamnesis</span>
          <span className={paso >= 2 ? 'text-[#22d3ee]' : ''}>2. BodyChart</span>
          <span className={paso >= 3 ? 'text-[#22d3ee]' : ''}>3. Evaluación</span>
        </div>

        {paso === 1 && (
          <div className={`${bgTarjeta} p-6 rounded-3xl border`}>
            <h2 className={`text-2xl font-black ${textoPrincipal} mb-4`}>📋 Anamnesis</h2>
            <AnamnesisForm
              evaluacion={evaluacion}
              handleInputChange={handleInputChange}
              iniciarDictado={iniciarDictado}
              escuchando={escuchando}
              campoActivo={campoActivo}
              temaOscuro={temaOscuro}
              tipoFormulario={tipoFormulario}
              setTipoFormulario={setTipoFormulario}
              setPaso={setPaso}
            />
          </div>
        )}

        {paso === 2 && (
          <div className={`${bgTarjeta} p-6 rounded-3xl border`}>
            <h2 className={`text-xl font-black ${textoPrincipal} mb-4`}>📍 Selecciona las regiones afectadas</h2>
            <p className={`text-sm ${textoPrincipal} opacity-70 mb-4`}>Haz clic en una zona general (🔍) para ampliarla, o directamente en los puntos para seleccionar.</p>
            <BodyChartContainer
              regionesSeleccionadas={evaluacion.regiones}
              onRegionToggle={toggleRegion}
              temaOscuro={temaOscuro}
              vistaDetalle={vistaDetalle}
              setVistaDetalle={setVistaDetalle}
            />
            <div className="flex justify-between mt-6">
              <button onClick={() => setPaso(1)} className="px-6 py-3 bg-gray-600 text-white font-black rounded-xl text-sm hover:opacity-80 transition-all">← Anterior</button>
              <button onClick={() => { if (evaluacion.regiones.length === 0) { alert('Selecciona al menos una región afectada.'); return; } setPaso(3); }} className="px-6 py-3 bg-[#22d3ee] text-black font-black rounded-xl text-sm hover:scale-105 transition-all">Siguiente →</button>
            </div>
          </div>
        )}

        {paso === 3 && (
          <div className={`${bgTarjeta} p-6 rounded-3xl border`}>
            <h2 className={`text-xl font-black ${textoPrincipal} mb-4`}>📊 Evaluación por región</h2>

            {evaluacion.regiones.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No hay regiones seleccionadas.</p>
            ) : (
              <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {evaluacion.regiones.map((region) => {
                  const data = evaluacion.datos_regiones[region] || {};
                  const tests = TESTS_POR_REGION[region] || ['Test no específico'];
                  const rangos = RANGOS_ROM[region] || {};
                  return (
                    <div key={region} className={`p-5 rounded-2xl border ${temaOscuro ? 'border-gray-700' : 'border-gray-200'} shadow-sm`}>
                      <h3 className={`text-lg font-bold ${textoPrincipal} capitalize mb-3`}>{region.replace('_', ' ')}</h3>
                      <div className="mb-4">
                        <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Dolor (EVA 0-10)</label>
                        <div className="flex flex-wrap gap-1 mb-1">
                          {[0,1,2,3,4,5,6,7,8,9,10].map((num) => (
                            <button key={num} onClick={() => handleRegionDataChange(region, 'eva', num)} className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${data.eva === num ? 'bg-[#22d3ee] text-black scale-110 shadow-lg shadow-[#22d3ee]/30' : `${temaOscuro ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'} hover:scale-110`}`}>{num}</button>
                          ))}
                        </div>
                        <div className="flex justify-between text-xs text-gray-400"><span>Sin dolor</span><span>Máximo dolor</span></div>
                      </div>
                      <div className="mb-4">
                        <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>ROM (grados)</label>
                        <input type="number" value={data.rom || ''} onChange={(e) => handleRegionDataChange(region, 'rom', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`} placeholder="Ej: 120°" />
                        {Object.keys(rangos).length > 0 && (
                          <div className="mt-1 text-xs text-gray-400 flex flex-wrap gap-2">
                            <span className="font-bold">Rango normal:</span>
                            {Object.entries(rangos).map(([mov, rango]) => (
                              <span key={mov} className="bg-black/10 px-2 py-0.5 rounded-full">{mov.replace('_', ' ')}: {rango}</span>
                            ))}
                          </div>
                        )}
                      </div>
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
                      <div className="relative">
                        <input type="text" placeholder="Notas adicionales..." value={data.notas || ''} onChange={(e) => handleRegionDataChange(region, 'notas', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm pr-10`} ref={(el) => { if (el) inputRefs.current[`notas_${region}`] = el; }} />
                        <button onClick={() => iniciarDictado(`notas_${region}`)} className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${escuchando && campoActivo === `notas_${region}` ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all text-xs`}>🎙️</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ===== SECCIÓN DE GENERACIÓN DEL PLAN (SIN BOTÓN DE MEMORIA) ===== */}
            <div className="mt-6 border-t border-gray-700 pt-6">
              <button
                onClick={generarPlan}
                disabled={generandoPlan}
                className="px-6 py-3 bg-purple-600 text-white font-black rounded-xl text-sm hover:scale-105 transition-all disabled:opacity-50"
              >
                {generandoPlan ? '⏳ Generando plan...' : '🧠 Generar Plan'}
              </button>

              {mostrarPlan && plan && (
                <div className="mt-4 p-4 rounded-2xl border border-purple-500/30 bg-purple-900/10">
                  <h3 className="text-lg font-bold text-purple-400 mb-3">📋 Plan de Tratamiento Generado (Editable)</h3>
                  
                  {/* Punto 7 */}
                  <div className="mb-4">
                    <label className="block text-sm font-bold text-purple-300">7. Recomendaciones Generales</label>
                    <textarea
                      value={planEditado.recomendaciones_generales.join('\n')}
                      onChange={(e) => {
                        const lines = e.target.value.split('\n').filter(line => line.trim() !== '');
                        handlePlanChange('recomendaciones_generales', lines);
                      }}
                      rows="4"
                      className="w-full p-2 rounded-xl border border-purple-500/30 bg-black/20 text-white text-sm"
                      placeholder="Escribe las recomendaciones para el paciente..."
                    />
                  </div>

                  {/* Punto 8 */}
                  <div className="mb-4">
                    <label className="block text-sm font-bold text-purple-300">8. Plan de Tratamiento</label>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-gray-400">Diagnóstico sugerido</label>
                        <input
                          type="text"
                          value={planEditado.diagnostico_sugerido || ''}
                          onChange={(e) => handlePlanChange('diagnostico_sugerido', e.target.value)}
                          className="w-full p-2 rounded-xl border border-purple-500/30 bg-black/20 text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400">Justificación</label>
                        <textarea
                          value={planEditado.justificacion || ''}
                          onChange={(e) => handlePlanChange('justificacion', e.target.value)}
                          rows="2"
                          className="w-full p-2 rounded-xl border border-purple-500/30 bg-black/20 text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400">Agentes Físicos</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {catalogos.agentes.map((agente) => (
                            <label key={agente.id} className="flex items-center gap-1 text-sm text-white">
                              <input
                                type="checkbox"
                                checked={planEditado.agentes_fisicos?.includes(agente.nombre) || false}
                                onChange={() => toggleItemPlan('agentes_fisicos', agente.nombre)}
                                className="accent-purple-500"
                              />
                              {agente.nombre}
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-400">Masoterapia</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {catalogos.masoterapia.map((tec) => (
                            <label key={tec.id} className="flex items-center gap-1 text-sm text-white">
                              <input
                                type="checkbox"
                                checked={planEditado.masoterapia?.includes(tec.nombre) || false}
                                onChange={() => toggleItemPlan('masoterapia', tec.nombre)}
                                className="accent-purple-500"
                              />
                              {tec.nombre}
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-400">Ejercicios</label>
                        {catalogos.ejercicios.map((ej) => (
                          <div key={ej.id} className="mt-2 border border-purple-500/20 rounded-xl p-2 bg-black/10">
                            <label className="flex items-center gap-1 text-sm text-white">
                              <input
                                type="checkbox"
                                checked={planEditado.ejercicios?.includes(ej.nombre) || false}
                                onChange={() => toggleItemPlan('ejercicios', ej.nombre)}
                                className="accent-purple-500"
                              />
                              <span className="font-semibold">{ej.nombre}</span>
                            </label>
                            {planEditado.ejercicios?.includes(ej.nombre) && (
                              <div className="ml-6 mt-1 grid grid-cols-3 gap-2 text-xs">
                                <div>
                                  <label className="text-gray-400">Series</label>
                                  <input
                                    type="number"
                                    value={parametrosEjercicios[ej.nombre]?.series || 3}
                                    onChange={(e) => handleParametroEjercicio(ej.nombre, 'series', parseInt(e.target.value) || 0)}
                                    className="w-full p-1 rounded border border-purple-500/30 bg-black/20 text-white"
                                  />
                                </div>
                                <div>
                                  <label className="text-gray-400">Repeticiones</label>
                                  <input
                                    type="number"
                                    value={parametrosEjercicios[ej.nombre]?.repeticiones || 10}
                                    onChange={(e) => handleParametroEjercicio(ej.nombre, 'repeticiones', parseInt(e.target.value) || 0)}
                                    className="w-full p-1 rounded border border-purple-500/30 bg-black/20 text-white"
                                  />
                                </div>
                                <div>
                                  <label className="text-gray-400">Frecuencia</label>
                                  <input
                                    type="text"
                                    value={parametrosEjercicios[ej.nombre]?.frecuencia || 'diaria'}
                                    onChange={(e) => handleParametroEjercicio(ej.nombre, 'frecuencia', e.target.value)}
                                    className="w-full p-1 rounded border border-purple-500/30 bg-black/20 text-white"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <div>
                        <label className="text-xs text-gray-400">Recomendaciones naturales (atención en casa)</label>
                        {planEditado.recomendaciones_naturales?.map((rec, idx) => (
                          <div key={idx} className="flex items-center gap-2 mt-1">
                            <input
                              type="text"
                              value={rec}
                              onChange={(e) => {
                                const nuevas = [...planEditado.recomendaciones_naturales];
                                nuevas[idx] = e.target.value;
                                handlePlanChange('recomendaciones_naturales', nuevas);
                              }}
                              className="flex-1 p-2 rounded-xl border border-purple-500/30 bg-black/20 text-white text-sm"
                            />
                            <button
                              onClick={() => {
                                const nuevas = planEditado.recomendaciones_naturales.filter((_, i) => i !== idx);
                                handlePlanChange('recomendaciones_naturales', nuevas);
                              }}
                              className="text-red-400 hover:text-red-300 text-sm"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            const nuevas = [...(planEditado.recomendaciones_naturales || []), ''];
                            handlePlanChange('recomendaciones_naturales', nuevas);
                          }}
                          className="mt-2 text-purple-400 text-sm hover:underline"
                        >
                          + Agregar recomendación natural
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Punto 9 */}
                  <div className="mb-4">
                    <label className="block text-sm font-bold text-purple-300">9. Alertas de Seguridad</label>
                    <textarea
                      value={planEditado.alertas_seguridad.join('\n')}
                      onChange={(e) => {
                        const lines = e.target.value.split('\n').filter(line => line.trim() !== '');
                        handlePlanChange('alertas_seguridad', lines);
                      }}
                      rows="3"
                      className="w-full p-2 rounded-xl border border-purple-500/30 bg-black/20 text-white text-sm"
                      placeholder="Escribe las alertas de seguridad para este paciente..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ===== BOTONES FINALES ===== */}
            <div className="flex justify-between mt-6 border-t border-gray-700 pt-6">
              <button onClick={() => setPaso(2)} className="px-6 py-3 bg-gray-600 text-white font-black rounded-xl text-sm hover:opacity-80 transition-all">← Anterior</button>
              <div className="flex gap-3">
                <button
                  onClick={() => guardarEvaluacion('borrador')}
                  disabled={guardando || (estadoActual !== 'borrador' && estadoActual !== 'rechazado' && evaluacionId)}
                  className="px-6 py-3 bg-gray-500 text-white font-black rounded-xl text-sm hover:scale-105 transition-all disabled:opacity-50"
                  title={estadoActual !== 'borrador' && estadoActual !== 'rechazado' ? 'Solo editable en borrador o rechazado' : ''}
                >
                  💾 Guardar Borrador
                </button>
                <button
                  onClick={() => guardarEvaluacion('pendiente')}
                  disabled={guardando || (estadoActual !== 'borrador' && estadoActual !== 'rechazado' && evaluacionId)}
                  className="px-6 py-3 bg-[#22d3ee] text-black font-black rounded-xl text-sm hover:scale-105 transition-all disabled:opacity-50"
                  title={estadoActual !== 'borrador' && estadoActual !== 'rechazado' ? 'Solo editable en borrador o rechazado' : ''}
                >
                  📤 Enviar a Aprobación
                </button>
                {estadoActual === 'aprobado' && (
                  <button className="px-6 py-3 bg-green-600 text-white font-black rounded-xl text-sm cursor-default">✅ Aprobado</button>
                )}
                {estadoActual === 'pendiente' && (
                  <button className="px-6 py-3 bg-yellow-600 text-white font-black rounded-xl text-sm cursor-default">⏳ En revisión</button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}