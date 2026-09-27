import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { generarInformeDesdeEvaluacion } from '../../utils/generarInforme';
import { generarInformePaciente } from '../../utils/generarInformePaciente';
import { generarAcuerdoServicio } from '../../utils/generarAcuerdoServicio';

// Helper para edad
const calcularEdad = (fechaNac) => {
  if (!fechaNac) return '—';
  const hoy = new Date();
  const nac = new Date(fechaNac);
  if (isNaN(nac)) return '—';
  let edad = hoy.getFullYear() - nac.getFullYear();
  const mes = hoy.getMonth() - nac.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
};

export default function PacienteDetalle({ temaOscuro }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pestanaActiva, setPestanaActiva] = useState('resumen');
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [cargandoEval, setCargandoEval] = useState(false);
  const [generandoInforme, setGenerandoInforme] = useState(null);
  const [usuarioRol, setUsuarioRol] = useState(null);
  const [toast, setToast] = useState(null);

  // ===== MODAL EDITAR FICHA =====
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [formEditar, setFormEditar] = useState({
    nombre: '',
    apellidos: '',
    fecha_nacimiento: '',
    motivo_de_visita: '',
    telefono: '',
    email: '',
    dni: '',
    direccion: '',
    diagnostico: '',
  });
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);

  useEffect(() => {
    const cargarPaciente = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase.from('pacientes').select('*').eq('id', id).single();
        if (error) throw error;
        if (!data) { setError('Paciente no encontrado'); return; }
        setPaciente(data);
        cargarEvaluaciones(id);

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: perfil } = await supabase.from('profiles').select('rol').eq('id', user.id).single();
          if (perfil) setUsuarioRol(perfil.rol);
        }
      } catch (err) {
        console.error(err);
        setError('Error al cargar los datos del paciente.');
      } finally {
        setLoading(false);
      }
    };
    if (id) cargarPaciente();
  }, [id]);

      const cargarEvaluaciones = async (pacienteId) => {
    setCargandoEval(true);
    try {
      // ============================================================
      // PASO 1: Traer evaluaciones del paciente
      // ============================================================
      const { data: evaluacionesData, error: evalError } = await supabase
        .from('evaluaciones')
        .select('*')
        .eq('paciente_id', pacienteId)
        .order('created_at', { ascending: false });

      if (evalError) throw evalError;

      if (!evaluacionesData || evaluacionesData.length === 0) {
        setEvaluaciones([]);
        return;
      }

      // ============================================================
      // PASO 2: Traer los perfiles de TODOS los evaluadores
      // ============================================================
      const userIds = [...new Set(evaluacionesData.map((e) => e.user_id).filter(Boolean))];
      const aprobadoresIds = [...new Set(evaluacionesData.map((e) => e.aprobado_por).filter(Boolean))];
      const todosIds = [...new Set([...userIds, ...aprobadoresIds])];

      let perfilMap = {};
      if (todosIds.length > 0) {
        const { data: perfilesData, error: perfilesError } = await supabase
          .from('profiles')
          .select('id, nombre_completo, tipo_profesional, numero_colegiatura, dni')
          .in('id', todosIds);

        if (perfilesError) {
          console.warn('⚠️ No se pudieron cargar los perfiles:', perfilesError.message);
        }

        (perfilesData || []).forEach((p) => {
          perfilMap[p.id] = p;
        });
      }

      // ============================================================
      // PASO 3: Hidratar cada evaluación con su evaluador y aprobador
      // ============================================================
      const hidratadas = evaluacionesData.map((ev) => ({
        ...ev,
        profesional: perfilMap[ev.user_id] || null,
        aprobador: perfilMap[ev.aprobado_por] || null,
      }));

      console.log('📋 [Evaluaciones] Hidratadas:', hidratadas.length, 'evaluaciones');
      if (hidratadas[0]) {
        console.log('📋 [Evaluaciones] Ejemplo evaluador:', hidratadas[0].profesional);
      }

      setEvaluaciones(hidratadas);
    } catch (error) {
      console.error('❌ Error cargando evaluaciones:', error);
      setEvaluaciones([]);
    } finally {
      setCargandoEval(false);
    }
  };

    const cambiarEstadoEvaluacion = async (evalId, nuevoEstado) => {
    try {
      // Preparar datos de actualización
      const updateData = { estado: nuevoEstado };

      // Si se está aprobando, registrar quién aprobó
      if (nuevoEstado === 'aprobado') {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          updateData.aprobado_por = user.id;
          updateData.fecha_aprobacion = new Date().toISOString();
        }
      }

      const { error } = await supabase
        .from('evaluaciones')
        .update(updateData)
        .eq('id', evalId);
      if (error) throw error;

      if (nuevoEstado === 'aprobado') {
        const { data: evalData, error: evalError } = await supabase
          .from('evaluaciones')
          .select('datos_regiones, paciente_id')
          .eq('id', evalId)
          .single();
        if (evalError) throw evalError;

        const diagnosticoSugerido = evalData?.datos_regiones?._diagnostico_sugerido || '';

        if (diagnosticoSugerido) {
          const { data: pacienteActual, error: pacError } = await supabase
            .from('pacientes')
            .select('diagnostico, diagnosticos_previos')
            .eq('id', evalData.paciente_id)
            .single();
          if (pacError) throw pacError;

          const historial = pacienteActual?.diagnosticos_previos || [];
          const diagnosticoAnterior = pacienteActual?.diagnostico || '';

          const historialActualizado = (diagnosticoAnterior && diagnosticoAnterior !== 'Pendiente')
            ? [...historial, { fecha: new Date().toISOString(), diagnostico: diagnosticoAnterior }]
            : historial;

          const { error: updError } = await supabase
            .from('pacientes')
            .update({
              diagnostico: diagnosticoSugerido,
              diagnosticos_previos: historialActualizado,
            })
            .eq('id', evalData.paciente_id);
          if (updError) throw updError;

          const { data: pacienteRefrescado } = await supabase
            .from('pacientes')
            .select('*')
            .eq('id', evalData.paciente_id)
            .single();
          if (pacienteRefrescado) setPaciente(pacienteRefrescado);

          setToast({
            tipo: 'exito',
            mensaje: `Diagnóstico del paciente actualizado: "${diagnosticoSugerido}"`,
          });
          setTimeout(() => setToast(null), 5000);
        } else {
          setToast({ tipo: 'exito', mensaje: 'Evaluación aprobada.' });
          setTimeout(() => setToast(null), 4000);
        }
      } else {
        setToast({
          tipo: 'info',
          mensaje: `Evaluación ${nuevoEstado === 'rechazado' ? 'rechazada' : 'actualizada'}.`,
        });
        setTimeout(() => setToast(null), 4000);
      }

      cargarEvaluaciones(id);
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      setToast({ tipo: 'error', mensaje: 'Error al cambiar estado: ' + error.message });
      setTimeout(() => setToast(null), 5000);
    }
  };

  const handleGenerarInforme = async (evalId) => {
    setGenerandoInforme(evalId);
    try {
      await generarInformeDesdeEvaluacion(evalId);
    } catch (error) {
      console.error('Error al generar informe:', error);
      alert('Error al generar el informe: ' + error.message);
    } finally {
      setGenerandoInforme(null);
    }
  };

  // ===== ABRIR MODAL DE EDICIÓN =====
  const abrirModalEditar = () => {
    setFormEditar({
      nombre: paciente.nombre || '',
      apellidos: paciente.apellidos || '',
      fecha_nacimiento: paciente.fecha_nacimiento || '',
      motivo_de_visita: paciente.motivo_de_visita || '',
      telefono: paciente.telefono || '',
      email: paciente.email || '',
      dni: paciente.dni || '',
      direccion: paciente.direccion || '',
      diagnostico: paciente.diagnostico || '',
    });
    setModalEditarAbierto(true);
  };

  // ===== GUARDAR EDICIÓN =====
  const guardarEdicion = async () => {
    if (!formEditar.nombre.trim() || !formEditar.apellidos.trim()) {
      return alert('Nombre y apellidos son obligatorios.');
    }
    if (!formEditar.fecha_nacimiento) {
      return alert('La fecha de nacimiento es obligatoria.');
    }
    if (!formEditar.motivo_de_visita.trim()) {
      return alert('El motivo de visita es obligatorio.');
    }

    setGuardandoEdicion(true);
    try {
      const { error } = await supabase
        .from('pacientes')
        .update({
          nombre: formEditar.nombre.trim(),
          apellidos: formEditar.apellidos.trim(),
          fecha_nacimiento: formEditar.fecha_nacimiento,
          motivo_de_visita: formEditar.motivo_de_visita.trim(),
          telefono: formEditar.telefono?.trim() || null,
          email: formEditar.email?.trim() || null,
          dni: formEditar.dni?.trim() || null,
          direccion: formEditar.direccion?.trim() || null,
          diagnostico: formEditar.diagnostico?.trim() || null,
        })
        .eq('id', id);
      if (error) throw error;

      const { data: pacienteRefrescado } = await supabase
        .from('pacientes')
        .select('*')
        .eq('id', id)
        .single();
      if (pacienteRefrescado) setPaciente(pacienteRefrescado);

      setModalEditarAbierto(false);
      setToast({ tipo: 'exito', mensaje: '✅ Ficha actualizada correctamente.' });
      setTimeout(() => setToast(null), 4000);
    } catch (err) {
      console.error(err);
      alert('Error al guardar: ' + err.message);
    } finally {
      setGuardandoEdicion(false);
    }
  };

  const bgPrincipal = temaOscuro ? 'bg-[#0a141d]' : 'bg-[#e2e8f0]';
  const textoPrincipal = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const textoSecundario = temaOscuro ? 'text-gray-400' : 'text-gray-600';
  const bgTarjeta = temaOscuro ? 'bg-[#0a141d] border-gray-800' : 'bg-white border-gray-200';
  const bgInput = temaOscuro ? 'bg-black/20 border-white/10 text-white' : 'bg-gray-100 border-gray-300 text-[#0f172a]';
  const bgPestanaActiva = temaOscuro ? 'bg-[#22d3ee]/20 text-[#22d3ee] border-[#22d3ee]' : 'bg-[#22d3ee] text-black border-[#22d3ee]';
  const bgPestanaInactiva = temaOscuro ? 'text-gray-400 hover:text-white border-transparent' : 'text-gray-600 hover:text-black border-transparent';

  if (loading) {
    return <div className={`min-h-screen ${bgPrincipal} flex items-center justify-center`}><div className="animate-spin rounded-full h-10 w-10 border-4 border-[#22d3ee] border-t-transparent"></div></div>;
  }

  if (error || !paciente) {
    return (
      <div className={`min-h-screen ${bgPrincipal} flex flex-col items-center justify-center p-4`}>
        <p className="text-red-500 text-lg font-bold">{error || 'Paciente no encontrado'}</p>
        <button onClick={() => navigate('/clinica/pacientes')} className="mt-4 px-6 py-2 bg-[#22d3ee] text-black font-bold rounded-xl text-sm hover:scale-105 transition-all">Volver</button>
      </div>
    );
  }

  // Detección de datos incompletos
  const faltantes = [];
  if (!paciente.fecha_nacimiento) faltantes.push('fecha de nacimiento');
  if (!paciente.motivo_de_visita) faltantes.push('motivo de visita');
  if (!paciente.dni) faltantes.push('DNI');
  if (!paciente.direccion) faltantes.push('dirección');

  return (
    <div className={`min-h-screen ${bgPrincipal} p-4 md:p-8 transition-colors duration-500`}>
      <div className="max-w-7xl mx-auto">
        {/* Cabecera */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className={`text-3xl font-black tracking-tight ${textoPrincipal}`}>{paciente.nombre} {paciente.apellidos}</h1>
            <p className={`${textoSecundario} text-sm`}>
              {calcularEdad(paciente.fecha_nacimiento)} años
              {paciente.telefono && ` · ${paciente.telefono}`}
              {paciente.email && ` · ${paciente.email}`}
              {paciente.dni && ` · DNI: ${paciente.dni}`}
            </p>
            <p className={`text-xs ${textoSecundario} mt-1`}>
              Motivo: <span className="font-semibold text-[#22d3ee]">{paciente.motivo_de_visita || 'No registrado'}</span>
            </p>
            <p className={`text-xs ${textoSecundario}`}>
              Diagnóstico: <span className="font-bold text-[#22d3ee]">{paciente.diagnostico || 'Pendiente'}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to={`/clinica/evaluacion/${paciente.id}`} className="px-4 py-2 bg-[#22d3ee]/20 text-[#22d3ee] font-bold rounded-xl text-xs hover:bg-[#22d3ee] hover:text-black transition-all">+ Agregar Evaluación</Link>
            <button
              onClick={async () => {
                try {
                  await generarAcuerdoServicio(paciente.id);
                } catch (err) {
                  alert('Error al generar el acuerdo: ' + err.message);
                }
              }}
              className="px-4 py-2 bg-emerald-500/20 text-emerald-400 font-bold rounded-xl text-xs hover:bg-emerald-500 hover:text-white transition-all"
              title="Genera el documento legal de acuerdo de servicio o consentimiento informado"
            >
              📄 Acuerdo de Servicio
            </button>
            <button className="px-4 py-2 bg-purple-600/20 text-purple-400 font-bold rounded-xl text-xs hover:bg-purple-600 hover:text-white transition-all opacity-60 cursor-not-allowed" title="Próximamente (Fase 4)">+ Nueva Sesión</button>
            <button
              onClick={abrirModalEditar}
              className="px-4 py-2 bg-yellow-600/20 text-yellow-400 font-bold rounded-xl text-xs hover:bg-yellow-600 hover:text-white transition-all"
            >
              ✏️ Editar Ficha
            </button>
          </div>
        </div>

        {/* ⚠️ Alerta de datos incompletos */}
        {faltantes.length > 0 && (
          <div className="mb-6 p-3 rounded-xl border border-yellow-500/40 bg-yellow-500/10 flex items-start gap-3">
            <span className="text-yellow-400 text-lg">⚠️</span>
            <div className="flex-1">
              <p className="text-yellow-300 text-xs font-bold uppercase tracking-wider">
                Datos incompletos ({faltantes.length})
              </p>
              <p className="text-yellow-200/80 text-xs mt-1">
                Falta registrar: {faltantes.join(', ')}.
              </p>
            </div>
            <button
              onClick={abrirModalEditar}
              className="px-3 py-1 bg-yellow-500/20 text-yellow-300 text-xs font-bold rounded-lg hover:bg-yellow-500/30 transition-all"
            >
              Completar
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-700 mb-6 overflow-x-auto">
          {[
            { key: 'resumen', label: 'Resumen' },
            { key: 'evaluaciones', label: `Evaluaciones (${evaluaciones.length})` },
            { key: 'planes', label: 'Planes' },
            { key: 'sesiones', label: 'Sesiones' },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setPestanaActiva(tab.key)} className={`px-6 py-3 text-sm font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${pestanaActiva === tab.key ? bgPestanaActiva : bgPestanaInactiva}`}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {pestanaActiva === 'resumen' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`${bgTarjeta} p-5 rounded-2xl border col-span-2`}>
                <h3 className={`text-xs font-black uppercase tracking-wider text-[#22d3ee] mb-2`}>Motivo de consulta</h3>
                <p className={`text-sm ${textoPrincipal}`}>{paciente.motivo_de_visita || 'No registrado'}</p>
              </div>
              <div className={`${bgTarjeta} p-5 rounded-2xl border space-y-4`}>
                <div>
                  <h4 className={`text-[10px] font-black uppercase tracking-wider text-gray-400`}>Antecedentes médicos</h4>
                  <p className={`text-sm ${textoPrincipal}`}>{paciente.antecedentes_medicos || 'No registrados'}</p>
                </div>
                <div>
                  <h4 className={`text-[10px] font-black uppercase tracking-wider text-gray-400`}>Alergias</h4>
                  <p className={`text-sm ${textoPrincipal}`}>{paciente.alergias || 'No registradas'}</p>
                </div>
              </div>

              {/* Datos personales */}
              <div className={`${bgTarjeta} p-5 rounded-2xl border col-span-full`}>
                <h3 className={`text-xs font-black uppercase tracking-wider text-[#22d3ee] mb-4`}>Datos personales</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">DNI / Documento</p>
                    <p className={textoPrincipal}>{paciente.dni || <span className="text-yellow-500 italic text-xs">No registrado</span>}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Fecha de nacimiento</p>
                    <p className={textoPrincipal}>
                      {paciente.fecha_nacimiento
                        ? new Date(paciente.fecha_nacimiento).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
                        : <span className="text-yellow-500 italic text-xs">No registrada</span>}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Teléfono</p>
                    <p className={textoPrincipal}>{paciente.telefono || '—'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Dirección</p>
                    <p className={textoPrincipal}>{paciente.direccion || <span className="text-yellow-500 italic text-xs">No registrada</span>}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Email</p>
                    <p className={textoPrincipal}>{paciente.email || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Línea de tiempo */}
              <div className={`${bgTarjeta} p-5 rounded-2xl border col-span-full`}>
                <h3 className={`text-xs font-black uppercase tracking-wider text-[#22d3ee] mb-4`}>Línea de tiempo</h3>
                <div className="relative pl-6 border-l-2 border-[#22d3ee] space-y-4">
                  <div className="relative">
                    <div className="absolute -left-8 top-1 w-4 h-4 rounded-full bg-[#22d3ee] border-2 border-[#0a141d]"></div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                      <span className="text-xs font-mono text-gray-400">{new Date(paciente.created_at).toLocaleDateString()}</span>
                      <span className={`text-sm font-medium ${textoPrincipal}`}>Fecha de apertura</span>
                    </div>
                  </div>
                  {evaluaciones.slice(0, 3).map((ev) => (
                    <div key={ev.id} className="relative">
                      <div className="absolute -left-8 top-1 w-4 h-4 rounded-full bg-purple-400 border-2 border-[#0a141d]"></div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                        <span className="text-xs font-mono text-gray-400">{new Date(ev.created_at).toLocaleDateString()}</span>
                        <span className={`text-sm font-medium ${textoPrincipal}`}>Evaluación postural</span>
                        <span className="text-[10px] text-purple-400">Regiones: {(ev.regiones || []).join(', ')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {pestanaActiva === 'evaluaciones' && (
            <div className={`${bgTarjeta} p-5 rounded-2xl border`}>
              <h3 className={`text-sm font-black uppercase tracking-wider text-[#22d3ee] mb-4`}>Lista de Evaluaciones</h3>
              {cargandoEval ? (
                <p className="text-gray-400 text-center py-4">Cargando evaluaciones...</p>
              ) : evaluaciones.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No hay evaluaciones registradas.</p>
                  <Link to={`/clinica/evaluacion/${paciente.id}`} className="mt-4 inline-block px-4 py-2 bg-[#22d3ee]/20 text-[#22d3ee] font-bold rounded-xl text-xs hover:bg-[#22d3ee] hover:text-black transition-all">+ Crear primera evaluación</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {evaluaciones.map((ev) => {
                    const estado = ev.estado || 'borrador';
                    let estadoColor = 'bg-gray-500/20 text-gray-400', estadoTexto = 'Borrador';
                    if (estado === 'pendiente') { estadoColor = 'bg-yellow-500/20 text-yellow-400'; estadoTexto = 'Pendiente'; }
                    if (estado === 'aprobado') { estadoColor = 'bg-green-500/20 text-green-400'; estadoTexto = 'Aprobado'; }
                    if (estado === 'rechazado') { estadoColor = 'bg-red-500/20 text-red-400'; estadoTexto = 'Rechazado'; }
                    const puedeEditar = estado === 'borrador' || estado === 'rechazado';
                    const esDirector = usuarioRol === 1 || usuarioRol === 7;

                    return (
                      <div key={ev.id} className={`p-4 rounded-xl border ${temaOscuro ? 'border-gray-700' : 'border-gray-200'} hover:border-[#22d3ee]/40 transition-all`}>
                        <div className="flex flex-wrap justify-between items-start gap-2">
                          <div>
                            <div className="flex items-center gap-3 flex-wrap">
  <p className={`text-sm font-bold ${textoPrincipal}`}>{new Date(ev.created_at).toLocaleDateString()} - {new Date(ev.created_at).toLocaleTimeString()}</p>
  <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${estadoColor}`}>{estadoTexto}</span>
  {/* NUEVO: Nombre del profesional evaluador */}
  {ev.profesional?.nombre_completo ? (
    <span
      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
        ev.profesional.tipo_profesional === 'licenciado'
          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
          : ev.profesional.tipo_profesional === 'tecnico'
          ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
          : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
      }`}
      title={
        ev.profesional.tipo_profesional === 'licenciado'
          ? `Licenciado ${ev.profesional.numero_colegiatura ? `— CTMP: ${ev.profesional.numero_colegiatura}` : ''}`
          : ev.profesional.tipo_profesional === 'tecnico'
          ? `Técnico — DNI: ${ev.profesional.dni || 'N/A'}`
          : 'Profesional'
      }
    >
      {ev.profesional.tipo_profesional === 'licenciado' ? '🩺' : ev.profesional.tipo_profesional === 'tecnico' ? '🔧' : '👤'}{' '}
      {ev.profesional.nombre_completo}
    </span>
  ) : (
    <span className="text-[10px] text-gray-500 italic">Evaluador no identificado</span>
  )}
  {/* Badge del aprobador (si aplica) */}
{ev.aprobador?.nombre_completo && (
  <span
    className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-green-500/10 text-green-400 border-green-500/30"
    title={`Aprobado por: ${ev.aprobador.nombre_completo}${ev.fecha_aprobacion ? ` el ${new Date(ev.fecha_aprobacion).toLocaleDateString()}` : ''}`}
  >
    ✅ Aprobado por {ev.aprobador.nombre_completo}
  </span>
)}
</div>
<p className="text-xs text-gray-400">Regiones: {(ev.regiones || []).join(', ') || 'No especificadas'}</p>
{ev.analisis_ia && <p className="text-xs text-purple-400 mt-1 truncate max-w-md">Diagnóstico IA: {ev.analisis_ia.substring(0, 100)}...</p>}
                            {ev.analisis_ia && <p className="text-xs text-purple-400 mt-1 truncate max-w-md">Diagnóstico IA: {ev.analisis_ia.substring(0, 100)}...</p>}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {puedeEditar && (
                              <button onClick={() => navigate(`/clinica/evaluacion/${ev.paciente_id}?evaluacion_id=${ev.id}`)} className="px-3 py-1 bg-[#22d3ee]/20 text-[#22d3ee] font-bold rounded-lg text-xs hover:bg-[#22d3ee] hover:text-black transition-all">Continuar</button>
                            )}
                            <button
                              onClick={async () => {
                                try {
                                  await generarInformePaciente(ev.id, estado);
                                } catch (err) {
                                  alert('Error: ' + err.message);
                                }
                              }}
                              className="px-3 py-1 bg-emerald-500/20 text-emerald-400 font-bold rounded-lg text-xs hover:bg-emerald-500 hover:text-white transition-all"
                              title="Genera el plan de ejercicios y cuidados para el paciente"
                            >
                              Informe Paciente
                            </button>
                            <button onClick={() => handleGenerarInforme(ev.id)} disabled={generandoInforme === ev.id} className="px-3 py-1 bg-blue-500/20 text-blue-400 font-bold rounded-lg text-xs hover:bg-blue-500 hover:text-white transition-all disabled:opacity-50">{generandoInforme === ev.id ? 'Generando...' : 'Informe'}</button>
                            {esDirector && estado === 'pendiente' && (
                              <>
                                <button onClick={() => cambiarEstadoEvaluacion(ev.id, 'aprobado')} className="px-3 py-1 bg-green-500/20 text-green-400 font-bold rounded-lg text-xs hover:bg-green-500 hover:text-white transition-all">Aprobar</button>
                                <button onClick={() => cambiarEstadoEvaluacion(ev.id, 'rechazado')} className="px-3 py-1 bg-red-500/20 text-red-400 font-bold rounded-lg text-xs hover:bg-red-500 hover:text-white transition-all">Rechazar</button>
                              </>
                            )}
                            {estado === 'pendiente' && !esDirector && (
                              <button className="px-3 py-1 bg-yellow-500/20 text-yellow-400 font-bold rounded-lg text-xs cursor-default">En revisión</button>
                            )}
                            {estado === 'aprobado' && (
                              <button className="px-3 py-1 bg-green-500/20 text-green-400 font-bold rounded-lg text-xs cursor-default">Aprobado</button>
                            )}
                            {puedeEditar && (
                              <button
                                onClick={() => {
                                  if (confirm('¿Eliminar esta evaluación?')) {
                                    supabase.from('evaluaciones').delete().eq('id', ev.id).then(() => {
                                      setToast({ tipo: 'info', mensaje: 'Evaluación eliminada.' });
                                      setTimeout(() => setToast(null), 3000);
                                      cargarEvaluaciones(id);
                                    });
                                  }
                                }}
                                className="px-3 py-1 bg-red-500/20 text-red-400 font-bold rounded-lg text-xs hover:bg-red-500 hover:text-white transition-all"
                              >
                                Eliminar
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {pestanaActiva === 'planes' && (
            <div className={`${bgTarjeta} p-10 rounded-2xl border text-center`}>
              <p className="text-gray-400">Planes de tratamiento se mostrarán aquí.</p>
              <p className="text-sm text-gray-500 mt-2">(Módulo en construcción – Fase 4)</p>
            </div>
          )}

          {pestanaActiva === 'sesiones' && (
            <div className={`${bgTarjeta} p-10 rounded-2xl border text-center`}>
              <p className="text-gray-400">Historial de sesiones del paciente.</p>
              <p className="text-sm text-gray-500 mt-2">(Módulo en construcción – Fase 4)</p>
            </div>
          )}
        </div>

        <div className="mt-8">
          <button onClick={() => navigate('/clinica/pacientes')} className="px-6 py-2 bg-gray-600 text-white font-bold rounded-xl text-sm hover:bg-gray-700 transition-all">Volver a la lista</button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL: Editar Ficha                                          */}
      {/* ============================================================ */}
      {modalEditarAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className={`relative w-full max-w-2xl rounded-3xl border ${bgTarjeta} p-6 shadow-2xl my-8`}>
            <button
              onClick={() => setModalEditarAbierto(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl"
            >
              ✕
            </button>
            <h2 className={`text-xl font-black ${textoPrincipal} mb-1`}>✏️ Editar Ficha del Paciente</h2>
            <p className={`text-xs ${textoSecundario} mb-6`}>
              Los campos marcados con <span className="text-red-400">*</span> son obligatorios
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>
                  Nombre <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formEditar.nombre}
                  onChange={(e) => setFormEditar({ ...formEditar, nombre: e.target.value })}
                  className={`w-full px-4 py-2 rounded-xl border ${bgInput} outline-none focus:border-[#22d3ee] text-sm`}
                />
              </div>

              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>
                  Apellidos <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formEditar.apellidos}
                  onChange={(e) => setFormEditar({ ...formEditar, apellidos: e.target.value })}
                  className={`w-full px-4 py-2 rounded-xl border ${bgInput} outline-none focus:border-[#22d3ee] text-sm`}
                />
              </div>

              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>
                  Fecha de nacimiento <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={formEditar.fecha_nacimiento}
                  onChange={(e) => setFormEditar({ ...formEditar, fecha_nacimiento: e.target.value })}
                  className={`w-full px-4 py-2 rounded-xl border ${bgInput} outline-none focus:border-[#22d3ee] text-sm`}
                />
                {formEditar.fecha_nacimiento && (
                  <p className="text-[10px] text-[#22d3ee] mt-1">
                    Edad: {calcularEdad(formEditar.fecha_nacimiento)} años
                  </p>
                )}
              </div>

              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>
                  DNI / Documento
                </label>
                <input
                  type="text"
                  value={formEditar.dni}
                  onChange={(e) => setFormEditar({ ...formEditar, dni: e.target.value })}
                  className={`w-full px-4 py-2 rounded-xl border ${bgInput} outline-none focus:border-[#22d3ee] text-sm`}
                />
              </div>

              <div className="md:col-span-2">
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>
                  Motivo de visita <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formEditar.motivo_de_visita}
                  onChange={(e) => setFormEditar({ ...formEditar, motivo_de_visita: e.target.value })}
                  className={`w-full px-4 py-2 rounded-xl border ${bgInput} outline-none focus:border-[#22d3ee] text-sm`}
                />
              </div>

              <div className="md:col-span-2">
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>
                  Dirección
                </label>
                <input
                  type="text"
                  value={formEditar.direccion}
                  onChange={(e) => setFormEditar({ ...formEditar, direccion: e.target.value })}
                  className={`w-full px-4 py-2 rounded-xl border ${bgInput} outline-none focus:border-[#22d3ee] text-sm`}
                />
              </div>

              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formEditar.telefono}
                  onChange={(e) => setFormEditar({ ...formEditar, telefono: e.target.value })}
                  className={`w-full px-4 py-2 rounded-xl border ${bgInput} outline-none focus:border-[#22d3ee] text-sm`}
                />
              </div>

              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>
                  Email
                </label>
                <input
                  type="email"
                  value={formEditar.email}
                  onChange={(e) => setFormEditar({ ...formEditar, email: e.target.value })}
                  className={`w-full px-4 py-2 rounded-xl border ${bgInput} outline-none focus:border-[#22d3ee] text-sm`}
                />
              </div>

              <div className="md:col-span-2">
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>
                  Diagnóstico actual
                </label>
                <input
                  type="text"
                  value={formEditar.diagnostico}
                  onChange={(e) => setFormEditar({ ...formEditar, diagnostico: e.target.value })}
                  className={`w-full px-4 py-2 rounded-xl border ${bgInput} outline-none focus:border-[#22d3ee] text-sm`}
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  Este campo se actualiza automáticamente al aprobar evaluaciones.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-gray-700/30">
              <button
                onClick={() => setModalEditarAbierto(false)}
                className={`px-5 py-2 rounded-xl border text-sm font-bold ${temaOscuro ? 'border-gray-600 hover:bg-gray-700/30' : 'border-gray-300 hover:bg-gray-100'} ${textoPrincipal}`}
              >
                Cancelar
              </button>
              <button
                onClick={guardarEdicion}
                disabled={guardandoEdicion}
                className="px-6 py-2 bg-[#22d3ee] text-black font-black rounded-xl text-sm hover:scale-105 transition-all disabled:opacity-50"
              >
                {guardandoEdicion ? 'Guardando...' : '💾 Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-xl shadow-2xl text-sm font-bold border animate-fade-in max-w-[90vw] text-center ${
            toast.tipo === 'exito'
              ? 'bg-green-500/20 text-green-300 border-green-500/40 backdrop-blur-md'
              : toast.tipo === 'error'
              ? 'bg-red-500/20 text-red-300 border-red-500/40 backdrop-blur-md'
              : 'bg-blue-500/20 text-blue-300 border-blue-500/40 backdrop-blur-md'
          }`}
        >
          {toast.mensaje}
        </div>
      )}
    </div>
  );
}