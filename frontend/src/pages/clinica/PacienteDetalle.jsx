import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

export default function PacienteDetalle({ temaOscuro }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pestanaActiva, setPestanaActiva] = useState('resumen');
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [cargandoEval, setCargandoEval] = useState(false);
  const [generandoInforme, setGenerandoInforme] = useState(null); // id de evaluación

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
        cargarEvaluaciones(id);
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
    } catch (e) {
      console.error(e);
    } finally {
      setCargandoEval(false);
    }
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

  // ============================================================
  // FUNCIÓN PARA GENERAR INFORME DESDE LA FICHA DEL PACIENTE
  // ============================================================
  const generarInformeDesdeEvaluacion = async (evaluacionId) => {
    setGenerandoInforme(evaluacionId);
    try {
      // Obtener la evaluación completa
      const { data: evaluacion, error: evalError } = await supabase
        .from('evaluaciones')
        .select('*')
        .eq('id', evaluacionId)
        .single();

      if (evalError) throw evalError;
      if (!evaluacion) {
        alert('Evaluación no encontrada.');
        return;
      }

      // Obtener datos del paciente
      const { data: pacienteData } = await supabase
        .from('pacientes')
        .select('*')
        .eq('id', evaluacion.paciente_id)
        .single();

      // Obtener datos del centro
      const { data: { user } } = await supabase.auth.getUser();
      const { data: perfil } = await supabase
        .from('profiles')
        .select('nombre_completo, centro_id')
        .eq('id', user.id)
        .single();

      let centroNombre = 'Centro CJ';
let logoUrl = '';
if (perfil?.centro_id) {
  // Primero intentar con Supabase (por compatibilidad)
  const { data: centro } = await supabase
    .from('centros')
    .select('nombre, logo_url')
    .eq('id', perfil.centro_id)
    .single();
  if (centro) {
    centroNombre = centro.nombre || 'Centro CJ';
    logoUrl = centro.logo_url || '';
  }
  // Si no hay logo en Supabase, intentar con la carpeta pública
  if (!logoUrl) {
    const publicLogo = `/logo_centros/${perfil.centro_id}.png`;
    try {
      const response = await fetch(publicLogo);
      if (response.ok) {
        logoUrl = publicLogo;
      }
    } catch (e) {
      // Si falla, se queda sin logo
    }
  }
}
      const nombrePaciente = pacienteData ? `${pacienteData.nombre} ${pacienteData.apellidos}` : 'Paciente';
      const fecha = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const hora = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      const usuario = perfil?.nombre_completo || 'Usuario';
      const regiones = evaluacion.regiones || [];
      const datosRegiones = evaluacion.datos_regiones || {};

      // Generar HTML del informe (estructura similar a la de EvaluacionPostural)
      const contenidoHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Informe Clínico - ${nombrePaciente}</title>
          <style>
            @page { size: A4; margin: 2.54cm; }
            body {
              font-family: 'Calibri', 'Roboto', Arial, sans-serif;
              font-size: 11pt;
              line-height: 1.5;
              color: #1e293b;
              background: white;
              margin: 0;
              padding: 0;
            }
            .pagina {
              page-break-after: always;
              padding: 0;
              min-height: 100vh;
              position: relative;
            }
            .pagina:last-child { page-break-after: avoid; }
            .encabezado {
              text-align: center;
              border-bottom: 2px solid #22d3ee;
              padding-bottom: 10px;
              margin-bottom: 20px;
              position: relative;
            }
            .encabezado .logo { max-width: 80px; max-height: 80px; float: left; }
            .encabezado .titulo { font-size: 18pt; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 1px; }
            .encabezado .subtitulo { font-size: 10pt; color: #64748b; }
            .encabezado .datos { font-size: 9pt; color: #475569; margin-top: 5px; }
            .pie {
              position: absolute;
              bottom: 0;
              left: 0;
              right: 0;
              text-align: center;
              font-size: 8pt;
              color: #94a3b8;
              border-top: 1px solid #e2e8f0;
              padding-top: 8px;
              margin-top: 20px;
            }
            .marca-agua {
              position: fixed;
              top: 0; left: 0; right: 0; bottom: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              pointer-events: none;
              z-index: 1000;
              opacity: 0.08;
              font-size: 80pt;
              font-weight: 900;
              color: #22d3ee;
              transform: rotate(-30deg);
              text-transform: uppercase;
              letter-spacing: 20px;
              user-select: none;
            }
            .marca-agua img { max-width: 300px; opacity: 0.15; }
            h1 {
              font-size: 16pt;
              font-weight: 700;
              color: #0f172a;
              border-left: 6px solid #22d3ee;
              padding-left: 12px;
              margin-top: 24px;
              margin-bottom: 12px;
              text-transform: uppercase;
            }
            h2 {
              font-size: 13pt;
              font-weight: 700;
              color: #1e293b;
              margin-top: 16px;
              margin-bottom: 8px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 12px 0;
              font-size: 10pt;
            }
            th, td {
              border: 1px solid #cbd5e1;
              padding: 6px 8px;
              text-align: left;
              vertical-align: top;
            }
            th { background-color: #f1f5f9; font-weight: 700; }
            ul, ol { padding-left: 20px; margin: 6px 0; }
            li { margin-bottom: 2px; }
            .alerta {
              background-color: #fee2e2;
              border-left: 4px solid #ef4444;
              padding: 10px 14px;
              margin: 12px 0;
              border-radius: 4px;
              font-weight: 600;
            }
            .seccion { margin-bottom: 16px; }
            .clearfix::after { content: ""; clear: both; display: table; }
            @media print {
              .marca-agua { opacity: 0.06; }
              .pagina { min-height: auto; page-break-after: always; }
            }
          </style>
        </head>
        <body>
          <div class="marca-agua">
            ${logoUrl ? `<img src="${logoUrl}" alt="Logo" />` : 'CONFIDENCIAL'}
          </div>

          <div class="pagina">
            <div class="encabezado clearfix">
              ${logoUrl ? `<img src="${logoUrl}" class="logo" alt="Logo Centro" />` : ''}
              <div>
                <div class="titulo">Informe de Evaluación Clínica</div>
                <div class="subtitulo">${centroNombre}</div>
                <div class="datos">
                  Paciente: ${nombrePaciente} &nbsp;|&nbsp; Fecha: ${fecha} &nbsp;|&nbsp; ID: ${evaluacion.paciente_id}
                </div>
              </div>
            </div>

            <h1>1. Datos Generales</h1>
            <table>
              <tr><th>Campo</th><th>Valor</th></tr>
              <tr><td>Edad</td><td>${evaluacion.edad || 'No registrado'}</td></tr>
              <tr><td>Sexo</td><td>${evaluacion.sexo || 'No registrado'}</td></tr>
              <tr><td>Ocupación</td><td>${evaluacion.ocupacion || 'No registrado'}</td></tr>
              <tr><td>Teléfono</td><td>${evaluacion.telefono || 'No registrado'}</td></tr>
              <tr><td>Dirección</td><td>${evaluacion.direccion || 'No registrado'}</td></tr>
            </table>

            <h1>2. Motivo de Consulta</h1>
            <p><strong>Motivo principal:</strong> ${evaluacion.motivo_consulta || 'No registrado'}</p>
            <p><strong>Tiempo de evolución:</strong> ${evaluacion.tiempo_evolucion || 'No registrado'}</p>
            <p><strong>Mecanismo de lesión:</strong> ${evaluacion.mecanismo_lesion || 'No registrado'}</p>

            <h1>3. Antecedentes</h1>
            <table>
              <tr><th>Antecedentes médicos</th><td>${evaluacion.antecedentes_medicos || 'No registrado'}</td></tr>
              <tr><th>Alergias</th><td>${evaluacion.alergias || 'No registrado'}</td></tr>
              <tr><th>Medicamentos actuales</th><td>${evaluacion.medicamentos || 'No registrado'}</td></tr>
              <tr><th>Cirugías previas</th><td>${evaluacion.cirugias_previas || 'No registrado'}</td></tr>
            </table>

            <div class="pie">
              Documento Clínico Confidencial - ${centroNombre} - Pág. 1
            </div>
          </div>

          <div class="pagina">
            <h1>4. Evaluación del Dolor</h1>
            <p><strong>Tipo de dolor:</strong> ${(evaluacion.tipo_dolor || []).join(', ') || 'No registrado'}</p>
            <table>
              <tr><th>Intensidad en reposo (EVA)</th><td>${evaluacion.intensidad_reposo || 0} / 10</td></tr>
              <tr><th>Intensidad en actividad (EVA)</th><td>${evaluacion.intensidad_actividad || 0} / 10</td></tr>
              <tr><th>Factores agravantes</th><td>${evaluacion.factores_agravantes || 'No registrado'}</td></tr>
              <tr><th>Factores atenuantes</th><td>${evaluacion.factores_atenuantes || 'No registrado'}</td></tr>
              <tr><th>Síntomas asociados</th><td>${evaluacion.sintomas_asociados || 'No registrado'}</td></tr>
            </table>

            <h1>5. Regiones Afectadas</h1>
            <ul>
              ${regiones.map(r => `<li>${r.replace('_', ' ')}</li>`).join('')}
            </ul>

            <h1>6. Evaluación por Región</h1>
            ${regiones.map(region => {
              const data = datosRegiones[region] || {};
              return `
                <div class="seccion">
                  <h2>${region.replace('_', ' ')}</h2>
                  <table>
                    <tr><th>EVA</th><td>${data.eva !== undefined ? data.eva + '/10' : 'No registrado'}</td></tr>
                    <tr><th>ROM (grados)</th><td>${data.rom || 'No registrado'}</td></tr>
                    <tr><th>Tests realizados</th><td>${(data.tests || []).join(', ') || 'Ninguno'}</td></tr>
                    <tr><th>Observaciones</th><td>${data.observaciones || 'Ninguna'}</td></tr>
                    <tr><th>Notas adicionales</th><td>${data.notas || 'Ninguna'}</td></tr>
                  </table>
                </div>
              `;
            }).join('')}

            <div class="pie">
              Documento Clínico Confidencial - ${centroNombre} - Pág. 2
            </div>
          </div>

          <div class="pagina">
            <h1>7. Análisis Clínico (IA)</h1>
            ${evaluacion.analisis_ia ? `<p>${evaluacion.analisis_ia}</p>` : '<p>No se generó análisis con IA.</p>'}

            <h1>8. Alerta de Seguridad</h1>
            <div class="alerta">
              ⚠️ Este informe contiene información confidencial del paciente. Solo debe ser utilizado por personal autorizado.
            </div>

            <h1>9. Datos de Generación</h1>
            <table>
              <tr><th>Informe generado por</th><td>${usuario}</td></tr>
              <tr><th>Fecha de generación</th><td>${fecha}</td></tr>
              <tr><th>Hora de generación</th><td>${hora}</td></tr>
              <tr><th>Centro</th><td>${centroNombre}</td></tr>
            </table>

            <div style="text-align: center; margin-top: 40px; font-size: 10pt; color: #64748b;">
              --- Fin del informe ---
            </div>

            <div class="pie">
              Documento Clínico Confidencial - ${centroNombre} - Pág. 3
            </div>
          </div>
        </body>
        </html>
      `;

      const ventana = window.open('', '_blank', 'width=800,height=600,scrollbars=yes');
      if (ventana) {
        ventana.document.write(contenidoHTML);
        ventana.document.close();
        setTimeout(() => ventana.print(), 500);
      } else {
        alert('Por favor, permite las ventanas emergentes para generar el informe.');
      }
    } catch (error) {
      console.error('Error al generar informe:', error);
      alert('Error al generar el informe: ' + error.message);
    } finally {
      setGenerandoInforme(null);
    }
  };

  // ========== ESTILOS ==========
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
            <Link
              to={`/clinica/evaluacion/${paciente.id}`}
              className="px-4 py-2 bg-[#22d3ee]/20 text-[#22d3ee] font-bold rounded-xl text-xs hover:bg-[#22d3ee] hover:text-black transition-all"
            >
              + Agregar Evaluación
            </Link>
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
                pestanaActiva === tab ? bgPestanaActiva : bgPestanaInactiva
              }`}
            >
              {tab === 'resumen' && '📋 Resumen'}
              {tab === 'evaluaciones' && `📊 Evaluaciones (${evaluaciones.length})`}
              {tab === 'planes' && '📝 Planes'}
              {tab === 'sesiones' && '🔄 Sesiones'}
            </button>
          ))}
        </div>

        {/* Contenido de pestañas */}
        <div className="space-y-6">
          {pestanaActiva === 'resumen' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`${bgTarjeta} p-5 rounded-2xl border col-span-2`}>
                <h3 className={`text-xs font-black uppercase tracking-wider text-[#22d3ee] mb-2`}>Motivo de consulta</h3>
                <p className={`text-sm ${textoPrincipal}`}>
                  {paciente.motivo_de_visita || 'No registrado'}
                </p>
              </div>
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
            <div className={`${bgTarjeta} p-5 rounded-2xl border`}>
              <h3 className={`text-sm font-black uppercase tracking-wider text-[#22d3ee] mb-4`}>📋 Lista de Evaluaciones</h3>
              {cargandoEval ? (
                <p className="text-gray-400 text-center py-4">Cargando evaluaciones...</p>
              ) : evaluaciones.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No hay evaluaciones registradas.</p>
                  <Link
                    to={`/clinica/evaluacion/${paciente.id}`}
                    className="mt-4 inline-block px-4 py-2 bg-[#22d3ee]/20 text-[#22d3ee] font-bold rounded-xl text-xs hover:bg-[#22d3ee] hover:text-black transition-all"
                  >
                    + Crear primera evaluación
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {evaluaciones.map((ev) => (
                    <div key={ev.id} className={`p-4 rounded-xl border ${temaOscuro ? 'border-gray-700' : 'border-gray-200'} hover:border-[#22d3ee]/40 transition-all`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className={`text-sm font-bold ${textoPrincipal}`}>
                            {new Date(ev.created_at).toLocaleDateString()} - {new Date(ev.created_at).toLocaleTimeString()}
                          </p>
                          <p className="text-xs text-gray-400">
                            Regiones: {(ev.regiones || []).join(', ') || 'No especificadas'}
                          </p>
                          {ev.analisis_ia && (
                            <p className="text-xs text-purple-400 mt-1 truncate max-w-md">
                              🤖 {ev.analisis_ia.substring(0, 100)}...
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => generarInformeDesdeEvaluacion(ev.id)}
                            disabled={generandoInforme === ev.id}
                            className="px-3 py-1 bg-blue-500/20 text-blue-400 font-bold rounded-lg text-xs hover:bg-blue-500 hover:text-white transition-all disabled:opacity-50"
                          >
                            {generandoInforme === ev.id ? 'Generando...' : '📄 Informe'}
                          </button>
                          <button className="px-3 py-1 bg-red-500/10 text-red-400 rounded-lg text-xs hover:bg-red-500 hover:text-white transition-all">
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
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