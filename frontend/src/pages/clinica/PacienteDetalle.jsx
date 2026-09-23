import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { generarInformeDesdeEvaluacion } from '../../utils/generarInforme';
import { generarInformePaciente } from '../../utils/generarInformePaciente';
import { generarAcuerdoServicio } from '../../utils/generarAcuerdoServicio';

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
      const { data, error } = await supabase
        .from('evaluaciones')
        .select('*')
        .eq('paciente_id', pacienteId)
        .order('created_at', { ascending: false });
      if (!error) setEvaluaciones(data || []);
    } catch (e) { console.error(e); } finally { setCargandoEval(false); }
  };

  const calcularEdad = (fechaNac) => {
    if (!fechaNac) return '—';
    const hoy = new Date();
    const nac = new Date(fechaNac);
    let edad = hoy.getFullYear() - nac.getFullYear();
    const mes = hoy.getMonth() - nac.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nac.getDate())) edad--;
    return edad;
  };

  const cambiarEstadoEvaluacion = async (evalId, nuevoEstado) => {
    try {
      const { error } = await supabase
        .from('evaluaciones')
        .update({ estado: nuevoEstado })
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

  const bgPrincipal = temaOscuro ? 'bg-[#0a141d]' : 'bg-[#e2e8f0]';
  const textoPrincipal = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const bgTarjeta = temaOscuro ? 'bg-[#0a141d] border-gray-800' : 'bg-white border-gray-200';
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

  return (
    <div className={`min-h-screen ${bgPrincipal} p-4 md:p-8 transition-colors duration-500`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className={`text-3xl font-black tracking-tight ${textoPrincipal}`}>{paciente.nombre} {paciente.apellidos}</h1>
            <p className="text-gray-400 text-sm">{calcularEdad(paciente.fecha_nacimiento)} años · {paciente.telefono || 'Sin teléfono'} · {paciente.email || 'Sin email'}</p>
            <p className="text-xs text-gray-500">Diagnóstico: <span className="font-bold text-[#22d3ee]">{paciente.diagnostico || 'Pendiente'}</span></p>
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
            <button className="px-4 py-2 bg-purple-600/20 text-purple-400 font-bold rounded-xl text-xs hover:bg-purple-600 hover:text-white transition-all">+ Nueva Sesión</button>
            <button className="px-4 py-2 bg-yellow-600/20 text-yellow-400 font-bold rounded-xl text-xs hover:bg-yellow-600 hover:text-white transition-all">Editar Ficha</button>
          </div>
        </div>

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
                <div><h4 className={`text-[10px] font-black uppercase tracking-wider text-gray-400`}>Medicamentos</h4><p className={`text-sm ${textoPrincipal}`}>{paciente.antecedentes_medicos || 'No registrados'}</p></div>
                <div><h4 className={`text-[10px] font-black uppercase tracking-wider text-gray-400`}>Alergias</h4><p className={`text-sm ${textoPrincipal}`}>{paciente.alergias || 'No registradas'}</p></div>
              </div>
              <div className={`${bgTarjeta} p-5 rounded-2xl border col-span-full`}>
                <h3 className={`text-xs font-black uppercase tracking-wider text-[#22d3ee] mb-4`}>Línea de tiempo</h3>
                <div className="relative pl-6 border-l-2 border-[#22d3ee] space-y-4">
                  <div className="relative"><div className="absolute -left-8 top-1 w-4 h-4 rounded-full bg-[#22d3ee] border-2 border-[#0a141d]"></div><div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4"><span className="text-xs font-mono text-gray-400">{new Date(paciente.created_at).toLocaleDateString()}</span><span className={`text-sm font-medium ${textoPrincipal}`}>Fecha de apertura</span></div></div>
                  {evaluaciones.slice(0, 3).map((ev) => (
                    <div key={ev.id} className="relative"><div className="absolute -left-8 top-1 w-4 h-4 rounded-full bg-purple-400 border-2 border-[#0a141d]"></div><div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4"><span className="text-xs font-mono text-gray-400">{new Date(ev.created_at).toLocaleDateString()}</span><span className={`text-sm font-medium ${textoPrincipal}`}>Evaluación postural</span><span className="text-[10px] text-purple-400">Regiones: {(ev.regiones || []).join(', ')}</span></div></div>
                  ))}
                  <div className="relative opacity-50"><div className="absolute -left-8 top-1 w-4 h-4 rounded-full bg-gray-500 border-2 border-[#0a141d]"></div><div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4"><span className="text-xs font-mono text-gray-400">—</span><span className={`text-sm font-medium ${textoPrincipal} text-gray-500`}>Próximas evaluaciones...</span></div></div>
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
                <div className="text-center py-8"><p className="text-gray-400">No hay evaluaciones registradas.</p><Link to={`/clinica/evaluacion/${paciente.id}`} className="mt-4 inline-block px-4 py-2 bg-[#22d3ee]/20 text-[#22d3ee] font-bold rounded-xl text-xs hover:bg-[#22d3ee] hover:text-black transition-all">+ Crear primera evaluación</Link></div>
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
                            <div className="flex items-center gap-3">
                              <p className={`text-sm font-bold ${textoPrincipal}`}>{new Date(ev.created_at).toLocaleDateString()} - {new Date(ev.created_at).toLocaleTimeString()}</p>
                              <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${estadoColor}`}>{estadoTexto}</span>
                            </div>
                            <p className="text-xs text-gray-400">Regiones: {(ev.regiones || []).join(', ') || 'No especificadas'}</p>
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
                              <button onClick={() => { if (confirm('¿Eliminar esta evaluación?')) { supabase.from('evaluaciones').delete().eq('id', ev.id).then(() => { setToast({ tipo: 'info', mensaje: 'Evaluación eliminada.' }); setTimeout(() => setToast(null), 3000); cargarEvaluaciones(id); }); } }} className="px-3 py-1 bg-red-500/20 text-red-400 font-bold rounded-lg text-xs hover:bg-red-500 hover:text-white transition-all">Eliminar</button>
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