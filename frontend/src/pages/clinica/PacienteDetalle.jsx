import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

export default function PacienteDetalle({ temaOscuro }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pestanaActiva, setPestanaActiva] = useState('resumen'); // 'resumen', 'evaluaciones', 'planes', 'sesiones'

  useEffect(() => {
    const cargarPaciente = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('pacientes')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (!data) {
          setError('Paciente no encontrado');
          return;
        }
        setPaciente(data);
      } catch (err) {
        console.error(err);
        setError('Error al cargar los datos del paciente.');
      } finally {
        setLoading(false);
      }
    };

    if (id) cargarPaciente();
  }, [id]);

  // Calcular edad a partir de fecha_nacimiento (si existe)
  const calcularEdad = (fechaNac) => {
    if (!fechaNac) return '—';
    const hoy = new Date();
    const nac = new Date(fechaNac);
    let edad = hoy.getFullYear() - nac.getFullYear();
    const mes = hoy.getMonth() - nac.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nac.getDate())) edad--;
    return edad;
  };

  // Estilos según tema
  const bgPrincipal = temaOscuro ? 'bg-[#0a141d]' : 'bg-[#e2e8f0]';
  const textoPrincipal = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const bgTarjeta = temaOscuro ? 'bg-[#0a141d] border-gray-800' : 'bg-white border-gray-200';
  const bgPestanaActiva = temaOscuro ? 'bg-[#22d3ee]/20 text-[#22d3ee] border-[#22d3ee]' : 'bg-[#22d3ee] text-black border-[#22d3ee]';
  const bgPestanaInactiva = temaOscuro ? 'text-gray-400 hover:text-white border-transparent' : 'text-gray-600 hover:text-black border-transparent';

  if (loading) {
    return (
      <div className={`min-h-screen ${bgPrincipal} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#22d3ee] border-t-transparent"></div>
      </div>
    );
  }

  if (error || !paciente) {
    return (
      <div className={`min-h-screen ${bgPrincipal} flex flex-col items-center justify-center p-4`}>
        <p className="text-red-500 text-lg font-bold">{error || 'Paciente no encontrado'}</p>
        <button
          onClick={() => navigate('/clinica/pacientes')}
          className="mt-4 px-6 py-2 bg-[#22d3ee] text-black font-bold rounded-xl text-sm hover:scale-105 transition-all"
        >
          Volver a la lista
        </button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgPrincipal} p-4 md:p-8 transition-colors duration-500`}>
      <div className="max-w-7xl mx-auto">
        {/* Cabecera */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className={`text-3xl font-black tracking-tight ${textoPrincipal}`}>
              {paciente.nombre} {paciente.apellidos}
            </h1>
            <p className="text-gray-400 text-sm font-medium">
              {calcularEdad(paciente.fecha_nacimiento)} años · {paciente.telefono || 'Sin teléfono'} · {paciente.email || 'Sin email'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Diagnóstico: <span className="font-bold text-[#22d3ee]">{paciente.diagnostico || 'Pendiente'}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 bg-[#22d3ee]/20 text-[#22d3ee] font-bold rounded-xl text-xs hover:bg-[#22d3ee] hover:text-black transition-all">
              + Agregar Evaluación
            </button>
            <button className="px-4 py-2 bg-purple-600/20 text-purple-400 font-bold rounded-xl text-xs hover:bg-purple-600 hover:text-white transition-all">
              + Nueva Sesión
            </button>
            <button className="px-4 py-2 bg-yellow-600/20 text-yellow-400 font-bold rounded-xl text-xs hover:bg-yellow-600 hover:text-white transition-all">
              ✎ Editar Ficha
            </button>
          </div>
        </div>

        {/* Pestañas */}
        <div className="flex border-b border-gray-700 mb-6 overflow-x-auto">
          {['resumen', 'evaluaciones', 'planes', 'sesiones'].map((tab) => (
            <button
              key={tab}
              onClick={() => setPestanaActiva(tab)}
              className={`px-6 py-3 text-sm font-bold uppercase tracking-wider transition-all border-b-2 ${
                pestanaActiva === tab
                  ? bgPestanaActiva
                  : bgPestanaInactiva
              }`}
            >
              {tab === 'resumen' && '📋 Resumen'}
              {tab === 'evaluaciones' && '📊 Evaluaciones'}
              {tab === 'planes' && '📝 Planes'}
              {tab === 'sesiones' && '🔄 Sesiones'}
            </button>
          ))}
        </div>

        {/* Contenido de pestañas */}
        <div className="space-y-6">
          {pestanaActiva === 'resumen' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Tarjeta de motivo de consulta */}
              <div className={`${bgTarjeta} p-5 rounded-2xl border col-span-2`}>
                <h3 className={`text-xs font-black uppercase tracking-wider text-[#22d3ee] mb-2`}>Motivo de consulta</h3>
                <p className={`text-sm ${textoPrincipal}`}>
                  {paciente.motivo_de_visita || 'No registrado'}
                </p>
              </div>

              {/* Tarjeta de medicamentos y alergias */}
              <div className={`${bgTarjeta} p-5 rounded-2xl border space-y-4`}>
                <div>
                  <h4 className={`text-[10px] font-black uppercase tracking-wider text-gray-400`}>Medicamentos</h4>
                  <p className={`text-sm ${textoPrincipal}`}>
                    {paciente.antecedentes_medicos || 'No registrados'}
                  </p>
                </div>
                <div>
                  <h4 className={`text-[10px] font-black uppercase tracking-wider text-gray-400`}>Alergias</h4>
                  <p className={`text-sm ${textoPrincipal}`}>
                    {paciente.alergias || 'No registradas'}
                  </p>
                </div>
              </div>

              {/* Línea de tiempo (simulada) */}
              <div className={`${bgTarjeta} p-5 rounded-2xl border col-span-full`}>
                <h3 className={`text-xs font-black uppercase tracking-wider text-[#22d3ee] mb-4`}>📅 Línea de tiempo visual</h3>
                <div className="relative pl-6 border-l-2 border-[#22d3ee] space-y-4">
                  <div className="relative">
                    <div className="absolute -left-8 top-1 w-4 h-4 rounded-full bg-[#22d3ee] border-2 border-[#0a141d]"></div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                      <span className="text-xs font-mono text-gray-400">{new Date(paciente.created_at).toLocaleDateString()}</span>
                      <span className={`text-sm font-medium ${textoPrincipal}`}>Fecha de apertura</span>
                    </div>
                  </div>
                  {/* Puedes agregar más elementos de línea de tiempo dinámicamente */}
                  <div className="relative opacity-50">
                    <div className="absolute -left-8 top-1 w-4 h-4 rounded-full bg-gray-500 border-2 border-[#0a141d]"></div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                      <span className="text-xs font-mono text-gray-400">—</span>
                      <span className={`text-sm font-medium ${textoPrincipal} text-gray-500`}>Próximas evaluaciones...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {pestanaActiva === 'evaluaciones' && (
            <div className={`${bgTarjeta} p-10 rounded-2xl border text-center`}>
              <p className="text-gray-400">Aquí se listarán las evaluaciones del paciente.</p>
              <p className="text-sm text-gray-500 mt-2">(Módulo en construcción – Fase 3)</p>
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

        {/* Botón volver */}
        <div className="mt-8">
          <button
            onClick={() => navigate('/clinica/pacientes')}
            className="px-6 py-2 bg-gray-600 text-white font-bold rounded-xl text-sm hover:bg-gray-700 transition-all"
          >
            ← Volver a la lista
          </button>
        </div>
      </div>
    </div>
  );
}