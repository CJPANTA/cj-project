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
    hijos: [],
        nivel_educativo: '',
    como_llego: '',
    contactos_emergencia: [
      { nombre: '', telefono: '', parentesco: '' },
      { nombre: '', telefono: '', parentesco: '' },
    ],
    signos_vitales: {
      ta_sistolica: '',
      ta_diastolica: '',
      fc: '',
      fr: '',
      temperatura: '',
      spo2: '',
      peso: '',
      talla: '',
      glucemia: '',
      fecha_toma: '',
          antecedentes_familiares: [],
    antecedentes_familiares_otros: '',
    habitos: {
      tabaquismo: false,
      cigarrillos_dia: '',
      anios_tabaquismo: '',
      alcohol: false,
      alcohol_frecuencia: '',
      drogas: false,
      dependencia_medicamentos: false,
    },
    actividad_fisica: '',
    nivel_deportivo: '',
    deporte_practicado: '',
    calidad_suenio: null,
    estres_percibido: '',
        gineco_obstetricos: {
      embarazo: '',
      lactancia: '',
      fum: '',
      metodo_anticonceptivo: '',
      menopausia: '',
      edad_menopausia: '',
      num_embarazos: '',
      num_partos: '',
      num_abortos: '',
    },
    urologicos: {
      visita_urologo: '',
      hiperplasia_prostata: '',
      medicacion_prostata: '',
      banderas_rojas: [],
    },
    },
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
          } else if (campoActivo.startsWith('test_')) {
            // 🔥 NUEVO: dictado en los tests individuales
            const partes = campoActivo.split('_');
            // formato: test_<region>_<nombreTest>
            const region = partes[1];
            const testNombre = partes.slice(2).join('_');
            handleTestDetalleChange(region, testNombre, transcript);
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
          hijos: data.datos_regiones?._hijos || [],
                    nivel_educativo: data.datos_regiones?._nivel_educativo || '',
          como_llego: data.datos_regiones?._como_llego || '',
          contactos_emergencia: data.datos_regiones?._contactos_emergencia || [
            { nombre: '', telefono: '', parentesco: '' },
            { nombre: '', telefono: '', parentesco: '' },
          ],
          signos_vitales: data.datos_regiones?._signos_vitales || {
            ta_sistolica: '',
            ta_diastolica: '',
            fc: '',
            fr: '',
            temperatura: '',
            spo2: '',
            peso: '',
            talla: '',
            glucemia: '',
            fecha_toma: '',
          },
          antecedentes_familiares: data.datos_regiones?._antecedentes_familiares || [],
          antecedentes_familiares_otros: data.datos_regiones?._antecedentes_familiares_otros || '',
          habitos: data.datos_regiones?._habitos || {
            tabaquismo: false, cigarrillos_dia: '', anios_tabaquismo: '',
            alcohol: false, alcohol_frecuencia: '', drogas: false, dependencia_medicamentos: false,
          },
          actividad_fisica: data.datos_regiones?._actividad_fisica || '',
          nivel_deportivo: data.datos_regiones?._nivel_deportivo || '',
          deporte_practicado: data.datos_regiones?._deporte_practicado || '',
          calidad_suenio: data.datos_regiones?._calidad_suenio ?? null,
          estres_percibido: data.datos_regiones?._estres_percibido || '',
          gineco_obstetricos: data.datos_regiones?._gineco_obstetricos || {
            embarazo: '', lactancia: '', fum: '', metodo_anticonceptivo: '',
            menopausia: '', edad_menopausia: '', num_embarazos: '', num_partos: '', num_abortos: '',
          },
          urologicos: data.datos_regiones?._urologicos || {
            visita_urologo: '', hiperplasia_prostata: '', medicacion_prostata: '',
            banderas_rojas: data.datos_regiones?._banderas_rojas || [],
          },
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

  // 🔥 NUEVO HANDLER: Guardar detalle individual de cada test
  const handleTestDetalleChange = (region, testNombre, valor) => {
    setEvaluacion(prev => ({
      ...prev,
      datos_regiones: {
        ...prev.datos_regiones,
        [region]: {
          ...prev.datos_regiones[region],
          tests_detalle: {
            ...(prev.datos_regiones[region]?.tests_detalle || {}),
            [testNombre]: valor,
          },
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

      let planFinal = evaluacion.plan_tratamiento;
      let recomendacionesFinal = evaluacion.recomendaciones;
      let alertasFinal = evaluacion.alertas;

      if (mostrarPlan && planEditado) {
        planFinal = compilarPlanTexto();
        recomendacionesFinal = planEditado.recomendaciones_generales.join('\n');
        alertasFinal = planEditado.alertas_seguridad.join('\n');
        
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
        _diagnostico_sugerido: planEditado?.diagnostico_sugerido || '',
        _plan_ejercicios: (planEditado?.ejercicios || []).map(nombre => {
          const ej = catalogos.ejercicios.find(e => e.nombre === nombre);
          const params = parametrosEjercicios[nombre] || {};
          
          // Inferir tipo por nombre si no está en catálogo
          let tipoFinal = ej?.tipo;
          if (!tipoFinal) {
            const nombreLower = nombre.toLowerCase();
            if (nombreLower.includes('estiramiento') || nombreLower.includes('stretching')) {
              tipoFinal = 'estiramiento';
            } else if (nombreLower.includes('fortalecimiento') || nombreLower.includes('puente') || 
                       nombreLower.includes('plancha') || nombreLower.includes('isométrico') ||
                       nombreLower.includes('activación') || nombreLower.includes('bird-dog') ||
                       nombreLower.includes('superman') || nombreLower.includes('dead bug')) {
              tipoFinal = 'fortalecimiento';
            } else if (nombreLower.includes('movilidad') || nombreLower.includes('rotación') ||
                       nombreLower.includes('alfabeto')) {
              tipoFinal = 'movilidad';
            } else {
              tipoFinal = 'general';
            }
          }
          
          // Inferir posición por nombre
          let posicionFinal = ej?.posicion;
          if (!posicionFinal) {
            const nombreLower = nombre.toLowerCase();
            if (nombreLower.includes('decúbito prono') || nombreLower.includes('prono') || 
                nombreLower.includes('superman') || nombreLower.includes('plancha')) {
              posicionFinal = 'prono';
            } else if (nombreLower.includes('decúbito supino') || nombreLower.includes('supino') ||
                       nombreLower.includes('boca arriba') || nombreLower.includes('puente') ||
                       nombreLower.includes('dead bug')) {
              posicionFinal = 'supino';
            } else if (nombreLower.includes('cuadrupedia') || nombreLower.includes('bird-dog') ||
                       nombreLower.includes('cuadrúpede')) {
              posicionFinal = 'cuadrupedia';
            } else if (nombreLower.includes('sentado') || nombreLower.includes('sedente') ||
                       nombreLower.includes('cervical')) {
              posicionFinal = 'sedente';
            } else {
              posicionFinal = 'bipedo';
            }
          }
          
          return {
            id: ej?.id || '',
            nombre: nombre,
            tipo: tipoFinal,
            posicion: posicionFinal,
            zonas_aplicables: ej?.zonas_aplicables || [],
            descripcion_paciente: ej?.descripcion_paciente || '',
            series: params.series || 3,
            repeticiones: params.repeticiones || 10,
            frecuencia: params.frecuencia || 'diaria',
            duracion_segundos: params.duracion_segundos || null,
          };
        }),
        _hijos: evaluacion.hijos || [],
        _nivel_educativo: evaluacion.nivel_educativo || '',
        _como_llego: evaluacion.como_llego || '',
        _contactos_emergencia: evaluacion.contactos_emergencia || [],
        _signos_vitales: evaluacion.signos_vitales || {},
        _antecedentes_familiares: evaluacion.antecedentes_familiares || [],
        _antecedentes_familiares_otros: evaluacion.antecedentes_familiares_otros || '',
        _habitos: evaluacion.habitos || {},
        _actividad_fisica: evaluacion.actividad_fisica || '',
        _nivel_deportivo: evaluacion.nivel_deportivo || '',
        _deporte_practicado: evaluacion.deporte_practicado || '',
        _calidad_suenio: evaluacion.calidad_suenio,
        _estres_percibido: evaluacion.estres_percibido || '',
        _gineco_obstetricos: evaluacion.gineco_obstetricos || {},
        _urologicos: evaluacion.urologicos || {},
        _banderas_rojas: evaluacion.banderas_rojas || [],
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
      'coxis': 'Coxis', 'carpo': 'Carpo', 'metacarpo': 'Metacarpo',
      'falanges_prox': 'Falanges Proximales', 'falanges_dist': 'Falanges Distales',
      'pulgar': 'Pulgar', 'eminencia_tenar': 'Eminencia Tenar',
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
          const testsConDetalle = (data.tests || []).map(t => {
            const detalle = data.tests_detalle?.[t];
            return detalle ? `${t} (${detalle})` : t;
          }).join(', ');
          return `${formatearNombreRegion(r)}: EVA ${data.eva || 'N/A'}/10, ROM ${data.rom || 'N/A'}°, Tests: ${testsConDetalle || 'Ninguno'}`;
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
                  const tests = TESTS_POR_REGION[region] || ['Test realizado (escribir cuál)'];
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

                      {/* 🔥 BLOQUE ACTUALIZADO: Tests con detalle individual */}
                      <div className="mb-4">
                        <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Tests especiales</label>
                        <div className="space-y-2">
                          {tests.map((test) => {
                            const checked = (data.tests || []).includes(test);
                            const testDetalle = data.tests_detalle?.[test] || '';
                            return (
                              <div key={test} className={`p-2 rounded-xl border ${temaOscuro ? 'border-white/10 bg-black/10' : 'border-gray-200 bg-gray-50'}`}>
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={(e) => {
                                      const current = data.tests || [];
                                      const nuevos = e.target.checked ? [...current, test] : current.filter(t => t !== test);
                                      handleRegionDataChange(region, 'tests', nuevos);
                                      if (!e.target.checked) {
                                        const nuevosDetalles = { ...(data.tests_detalle || {}) };
                                        delete nuevosDetalles[test];
                                        setEvaluacion(prev => ({
                                          ...prev,
                                          datos_regiones: {
                                            ...prev.datos_regiones,
                                            [region]: { ...prev.datos_regiones[region], tests_detalle: nuevosDetalles },
                                          },
                                        }));
                                      }
                                    }}
                                    className="accent-[#22d3ee] w-4 h-4"
                                  />
                                  <span className={`${textoPrincipal} text-xs font-medium`}>{test}</span>
                                </label>
                                {checked && (
                                  <div className="relative mt-2">
                                    <input
                                      type="text"
                                      placeholder="Resultado / detalle del test (ej: positivo, dolor irradiado...)"
                                      value={testDetalle}
                                      onChange={(e) => handleTestDetalleChange(region, test, e.target.value)}
                                      className={`w-full ${bgInput} border p-2 rounded-lg outline-none focus:border-[#22d3ee] transition-all text-xs pr-10`}
                                    />
                                    <button
                                      onClick={() => iniciarDictado(`test_${region}_${test}`)}
                                      className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full ${escuchando && campoActivo === `test_${region}_${test}` ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all text-xs`}
                                      title="Dictar por voz"
                                    >
                                      🎙️
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        
                        {/* Observaciones generales de la región (separadas) */}
                        <div className="relative mt-3">
                          <label className={`block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1`}>Observaciones adicionales de la región</label>
                          <input
                            type="text"
                            placeholder="Observaciones generales..."
                            value={data.observaciones || ''}
                            onChange={(e) => handleRegionDataChange(region, 'observaciones', e.target.value)}
                            className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm pr-10`}
                            ref={(el) => { if (el) inputRefs.current[`obs_${region}`] = el; }}
                          />
                          <button
                            onClick={() => iniciarDictado(`obs_${region}`)}
                            className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${escuchando && campoActivo === `obs_${region}` ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all text-xs`}
                          >
                            🎙️
                          </button>
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

            {/* ===== SECCIÓN DE GENERACIÓN DEL PLAN ===== */}
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