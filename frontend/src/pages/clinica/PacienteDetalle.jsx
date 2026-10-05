import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { generarInformeDesdeEvaluacion } from '../../utils/generarInforme';
import { generarInformePaciente } from '../../utils/generarInformePaciente';
import { generarAcuerdoServicio } from '../../utils/generarAcuerdoServicio';
import SesionModal from '../../components/clinica/SesionModal';
import { listarSesionesPorPaciente, eliminarSesion, resumenProgreso } from '../../utils/sesiones';
import GraficoEVA from '../../components/clinica/GraficoEVA';
import TimelinePaciente from '../../components/clinica/TimelinePaciente';

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

  // ===== SESIONES SOAP =====
const [sesiones, setSesiones] = useState([]);
const [cargandoSesiones, setCargandoSesiones] = useState(false);
const [resumenSesiones, setResumenSesiones] = useState(null);
const [modalSesionAbierto, setModalSesionAbierto] = useState(false);

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
        cargarSesiones(id);

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
      const { data, error } = await supabase
        .from('evaluaciones')
        .select(`
          *,
          profesional:profiles!evaluaciones_user_id_fkey (
            id,
            nombre_completo,
            tipo_profesional,
            numero_colegiatura,
            dni
          ),
          aprobador:profiles!evaluaciones_aprobado_por_fkey (
            id,
            nombre_completo,
            tipo_profesional
          )
        `)
        .eq('paciente_id', pacienteId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error cargando evaluaciones:', error);
        setEvaluaciones([]);
        return;
      }

      console.log('📋 [Evaluaciones] Cargadas:', data?.length || 0);
      setEvaluaciones(data || []);
    } catch (e) {
      console.error(e);
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

  // ============================================================
// CARGAR SESIONES SOAP
// ============================================================
const cargarSesiones = async (pacienteId) => {
  setCargandoSesiones(true);
  try {
    const lista = await listarSesionesPorPaciente(pacienteId);
    setSesiones(lista);
    const resumen = await resumenProgreso(pacienteId);
    setResumenSesiones(resumen);
  } catch (err) {
    console.error('❌ Error cargando sesiones:', err);
    setSesiones([]);
  } finally {
    setCargandoSesiones(false);
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
            <Link to={`/clinica/evaluacion/${paciente.id}`} className="px-4 py-2 bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border border-cyan-500/40 font-bold rounded-xl text-xs hover:bg-cyan-500 hover:text-white transition-all">+ Agregar Evaluación</Link>
            <button
              onClick={async () => {
                try {
                  await generarAcuerdoServicio(paciente.id);
                } catch (err) {
                  alert('Error al generar el acuerdo: ' + err.message);
                }
              }}
              className="px-4 py-2 bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/40 font-bold rounded-xl text-xs hover:bg-emerald-500 hover:text-white transition-all"
              title="Genera el documento legal de acuerdo de servicio o consentimiento informado"
            >
              📄 Acuerdo de Servicio
            </button>
            <button
  onClick={() => setModalSesionAbierto(true)}
  className="px-4 py-2 bg-purple-500/20 text-purple-700 dark:text-purple-400 border border-purple-500/40 font-bold rounded-xl text-xs hover:bg-purple-500 hover:text-white transition-all"
  title="Registrar una nueva sesión de tratamiento"
>
  + Nueva Sesión
</button>
            <button
              onClick={abrirModalEditar}
              className="px-4 py-2 bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border border-yellow-500/40 font-bold rounded-xl text-xs hover:bg-yellow-500 hover:text-white transition-all"
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
            { key: 'sesiones', label: 'Sesiones' },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setPestanaActiva(tab.key)} className={`px-6 py-3 text-sm font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${pestanaActiva === tab.key ? bgPestanaActiva : bgPestanaInactiva}`}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {pestanaActiva === 'resumen' && (
  <div className="space-y-4">

    {/* ===== FILA 1: KPIs rápidos ===== */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {/* Diagnóstico actual */}
      <div className={`${bgTarjeta} p-4 rounded-2xl border col-span-2 md:col-span-1`}>
        <p className={`text-[9px] font-bold uppercase tracking-wider ${textoSecundario} mb-1`}>
          🎯 Diagnóstico
        </p>
        <p className={`text-sm font-black ${textoPrincipal} leading-tight line-clamp-2`}>
          {paciente.diagnostico || 'Pendiente'}
        </p>
      </div>

      {/* Sesiones totales */}
      <div className={`${bgTarjeta} p-4 rounded-2xl border text-center`}>
        <p className="text-2xl font-black text-purple-400">
          {resumenSesiones?.total || 0}
        </p>
        <p className={`text-[9px] font-bold uppercase tracking-wider ${textoSecundario}`}>
          Sesiones
        </p>
      </div>

      {/* Mejora EVA */}
      <div className={`${bgTarjeta} p-4 rounded-2xl border text-center`}>
        <p className={`text-2xl font-black ${
          resumenSesiones?.mejora_promedio > 0
            ? 'text-emerald-400'
            : resumenSesiones?.mejora_promedio < 0
            ? 'text-red-400'
            : 'text-gray-400'
        }`}>
          {resumenSesiones?.mejora_promedio != null
            ? `${resumenSesiones.mejora_promedio > 0 ? '-' : ''}${resumenSesiones.mejora_promedio}`
            : '—'}
        </p>
        <p className={`text-[9px] font-bold uppercase tracking-wider ${textoSecundario}`}>
          Mejora EVA
        </p>
      </div>

      {/* Adherencia */}
      <div className={`${bgTarjeta} p-4 rounded-2xl border text-center`}>
        <p className={`text-2xl font-black ${
          resumenSesiones?.adherencia_promedio >= 75
            ? 'text-emerald-400'
            : resumenSesiones?.adherencia_promedio >= 50
            ? 'text-yellow-400'
            : resumenSesiones?.adherencia_promedio != null
            ? 'text-red-400'
            : 'text-gray-400'
        }`}>
          {resumenSesiones?.adherencia_promedio != null
            ? `${resumenSesiones.adherencia_promedio}%`
            : '—'}
        </p>
        <p className={`text-[9px] font-bold uppercase tracking-wider ${textoSecundario}`}>
          Adherencia casa
        </p>
      </div>
    </div>

    {/* ===== FILA 2: Gráfico EVA ===== */}
    <div className={`${bgTarjeta} p-5 rounded-2xl border`}>
      <GraficoEVA pacienteId={paciente.id} temaOscuro={temaOscuro} />
    </div>

    {/* ===== FILA 3: Motivo + Antecedentes ===== */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div className={`${bgTarjeta} p-5 rounded-2xl border md:col-span-2`}>
        <h3 className="text-xs font-black uppercase tracking-wider text-[#22d3ee] mb-2">
          📝 Motivo de consulta
        </h3>
        <p className={`text-sm ${textoPrincipal}`}>
          {paciente.motivo_de_visita || 'No registrado'}
        </p>
      </div>

      <div className={`${bgTarjeta} p-5 rounded-2xl border space-y-3`}>
        <div>
          <h4 className={`text-[10px] font-black uppercase tracking-wider text-gray-400`}>
            Antecedentes médicos
          </h4>
          <p className={`text-xs ${textoPrincipal}`}>
            {paciente.antecedentes_medicos || 'No registrados'}
          </p>
        </div>
        <div>
          <h4 className={`text-[10px] font-black uppercase tracking-wider text-gray-400`}>
            Alergias
          </h4>
          <p className={`text-xs ${textoPrincipal}`}>
            {paciente.alergias || 'No registradas'}
          </p>
        </div>
      </div>
    </div>

    {/* ===== FILA 4: Timeline ===== */}
    <div className={`${bgTarjeta} p-5 rounded-2xl border`}>
      <TimelinePaciente
        paciente={paciente}
        evaluaciones={evaluaciones}
        sesiones={sesiones}
        temaOscuro={temaOscuro}
        maxEventos={20}
      />
    </div>

    {/* ===== FILA 5: Datos personales ===== */}
    <div className={`${bgTarjeta} p-5 rounded-2xl border`}>
      <h3 className="text-xs font-black uppercase tracking-wider text-[#22d3ee] mb-4">
        👤 Datos personales
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            DNI / Documento
          </p>
          <p className={textoPrincipal}>
            {paciente.dni || <span className="text-yellow-500 italic text-xs">No registrado</span>}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Fecha de nacimiento
          </p>
          <p className={textoPrincipal}>
            {paciente.fecha_nacimiento
              ? new Date(paciente.fecha_nacimiento).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
              : <span className="text-yellow-500 italic text-xs">No registrada</span>}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Teléfono
          </p>
          <p className={textoPrincipal}>{paciente.telefono || '—'}</p>
        </div>
        <div className="md:col-span-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Dirección
          </p>
          <p className={textoPrincipal}>
            {paciente.direccion || <span className="text-yellow-500 italic text-xs">No registrada</span>}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Email
          </p>
          <p className={textoPrincipal}>{paciente.email || '—'}</p>
        </div>
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
                              className="px-3 py-1 bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/40 font-bold rounded-lg text-xs hover:bg-emerald-500 hover:text-white transition-all"
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

          {pestanaActiva === 'sesiones' && (
  <div className="space-y-4">
    {/* Resumen de progreso */}
    {resumenSesiones && resumenSesiones.total > 0 && (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className={`${bgTarjeta} p-4 rounded-2xl border text-center`}>
          <p className="text-2xl font-black text-purple-400">{resumenSesiones.total}</p>
          <p className={`text-[10px] font-bold uppercase tracking-wider ${textoSecundario}`}>Sesiones</p>
        </div>
        <div className={`${bgTarjeta} p-4 rounded-2xl border text-center`}>
          <p className="text-2xl font-black text-red-400">
            {resumenSesiones.eva_promedio_inicial ?? '—'}
          </p>
          <p className={`text-[10px] font-bold uppercase tracking-wider ${textoSecundario}`}>EVA inicial prom.</p>
        </div>
        <div className={`${bgTarjeta} p-4 rounded-2xl border text-center`}>
          <p className="text-2xl font-black text-emerald-400">
            {resumenSesiones.eva_promedio_final ?? '—'}
          </p>
          <p className={`text-[10px] font-bold uppercase tracking-wider ${textoSecundario}`}>EVA final prom.</p>
        </div>
        <div className={`${bgTarjeta} p-4 rounded-2xl border text-center`}>
          <p className="text-2xl font-black text-[#22d3ee]">
            {resumenSesiones.mejora_promedio != null ? `-${resumenSesiones.mejora_promedio}` : '—'}
          </p>
          <p className={`text-[10px] font-bold uppercase tracking-wider ${textoSecundario}`}>Mejora prom.</p>
        </div>
      </div>
    )}

    {/* Lista de sesiones */}
    <div className={`${bgTarjeta} p-5 rounded-2xl border`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-sm font-black uppercase tracking-wider text-[#22d3ee]`}>
          Historial de sesiones
        </h3>
        <button
          onClick={() => setModalSesionAbierto(true)}
          className="px-3 py-1 bg-purple-500/20 text-purple-700 dark:text-purple-400 border border-purple-500/40 font-bold rounded-lg text-xs hover:bg-purple-500 hover:text-white transition-all"
        >
          + Nueva
        </button>
      </div>

      {cargandoSesiones ? (
        <p className={`text-center py-8 ${textoSecundario}`}>Cargando sesiones...</p>
      ) : sesiones.length === 0 ? (
        <div className="text-center py-8">
          <p className={textoSecundario}>No hay sesiones registradas aún.</p>
          <button
            onClick={() => setModalSesionAbierto(true)}
            className="mt-4 inline-block px-4 py-2 bg-purple-600/20 text-purple-400 font-bold rounded-xl text-xs hover:bg-purple-600 hover:text-white transition-all"
          >
            + Registrar primera sesión
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sesiones.map((s) => {
            const fecha = new Date(s.fecha_sesion);
            const mejora = (s.eva_inicial != null && s.eva_final != null)
              ? s.eva_inicial - s.eva_final
              : null;
            return (
              <div
                key={s.id}
                className={`p-4 rounded-xl border ${temaOscuro ? 'border-gray-700' : 'border-gray-200'} hover:border-purple-500/40 transition-all`}
              >
                <div className="flex justify-between items-start gap-2 flex-wrap mb-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs font-black px-2 py-1 rounded-full bg-purple-500/20 text-purple-400">
                      #{s.numero_sesion}
                    </span>
                    <span className={`text-sm font-bold ${textoPrincipal}`}>
                      {fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                    {s.duracion_min && (
                      <span className={`text-xs ${textoSecundario}`}>⏱️ {s.duracion_min} min</span>
                    )}
                    {s.terapeuta?.nombre_completo && (
                      <span className="text-[10px] text-emerald-400 font-bold">
                        🩺 {s.terapeuta.nombre_completo}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {s.eva_inicial != null && s.eva_final != null && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          mejora > 0
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : mejora < 0
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        EVA {s.eva_inicial} → {s.eva_final}
                        {mejora > 0 && ` (-${mejora})`}
                        {mejora < 0 && ` (+${Math.abs(mejora)})`}
                      </span>
                    )}
                    <button
                      onClick={async () => {
                        if (!confirm(`¿Eliminar la sesión #${s.numero_sesion}?`)) return;
                        try {
                          await eliminarSesion(s.id);
                          setToast({ tipo: 'info', mensaje: 'Sesión eliminada.' });
                          setTimeout(() => setToast(null), 3000);
                          cargarSesiones(id);
                        } catch (err) {
                          alert('Error: ' + err.message);
                        }
                      }}
                      className="text-red-400 hover:text-red-300 text-xs"
                      title="Eliminar sesión"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* SOAP resumido */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  {s.subjetivo && (
                    <div className={`text-[11px] ${textoSecundario}`}>
                      <span className="text-[#22d3ee] font-black">S:</span> {s.subjetivo}
                    </div>
                  )}
                  {s.objetivo && (
                    <div className={`text-[11px] ${textoSecundario}`}>
                      <span className="text-[#22d3ee] font-black">O:</span> {s.objetivo}
                    </div>
                  )}
                  {s.analisis && (
                    <div className={`text-[11px] ${textoSecundario}`}>
                      <span className="text-[#22d3ee] font-black">A:</span> {s.analisis}
                    </div>
                  )}
                  {s.plan && (
                    <div className={`text-[11px] ${textoSecundario}`}>
                      <span className="text-[#22d3ee] font-black">P:</span> {s.plan}
                    </div>
                  )}
                </div>

                {/* Chips de tratamiento */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {(s.agentes_aplicados || []).map((a, i) => (
                    <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-[#22d3ee]/20 text-[#22d3ee]">
                      🔧 {a.nombre}
                    </span>
                  ))}
                  {(s.masoterapia_aplicada || []).map((m, i) => (
                    <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400">
                      💆 {m.nombre}
                    </span>
                  ))}
                  {(s.ejercicios_realizados || []).slice(0, 4).map((e, i) => (
                    <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                      🏋️ {e.nombre}
                    </span>
                  ))}
                  {(s.ejercicios_realizados || []).length > 4 && (
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                      +{s.ejercicios_realizados.length - 4} más
                    </span>
                  )}
                </div>

                {s.notas_adicionales && (
                  <p className={`text-[10px] italic mt-2 ${textoSecundario}`}>
                    📝 {s.notas_adicionales}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  </div>
)}

        </div>

        <div className="mt-8">
          <button onClick={() => navigate('/clinica/pacientes')} className="px-6 py-2 bg-gray-600 text-white font-bold rounded-xl text-sm hover:bg-gray-700 transition-all">Volver a la lista</button>
        </div>
      </div>

          {/* ============================================================ */}
{/* MODAL: Nueva Sesión SOAP                                     */}
{/* ============================================================ */}
<SesionModal
  abierto={modalSesionAbierto}
  onCerrar={() => setModalSesionAbierto(false)}
  paciente={paciente}
  centroId={paciente?.centro_id || null}
  evaluacionAprobada={evaluaciones.find((e) => e.estado === 'aprobado') || null}
  onGuardada={() => {
    cargarSesiones(id);
    setToast({ tipo: 'exito', mensaje: '✅ Sesión guardada correctamente.' });
    setTimeout(() => setToast(null), 4000);
  }}
  temaOscuro={temaOscuro}
/>

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