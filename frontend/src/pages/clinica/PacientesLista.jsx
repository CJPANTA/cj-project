import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { exportarPacientes } from '../../utils/pacientesExcel';
import ModalImportar from '../../components/clinica/ModalImportar';

// ============================================================
// HELPER: Calcular edad a partir de fecha de nacimiento
// ============================================================
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

// ============================================================
// HELPER: Detectar si faltan datos clave del paciente
// ============================================================
const datosIncompletos = (paciente) => {
  const faltantes = [];
  if (!paciente.fecha_nacimiento) faltantes.push('fecha nac.');
  if (!paciente.motivo_de_visita) faltantes.push('motivo');
  return faltantes;
};

export default function PacientesLista({ temaOscuro }) {
  const navigate = useNavigate();
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [orden, setOrden] = useState('recientes');
  const [mostrarDemo, setMostrarDemo] = useState(false);
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [nuevoPaciente, setNuevoPaciente] = useState({
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
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(null);
  const [limitePorPagina, setLimitePorPagina] = useState(10);

  const [centroId, setCentroId] = useState(null);
  const [userId, setUserId] = useState(null);
const [exportando, setExportando] = useState(false);
const [modalImportarAbierto, setModalImportarAbierto] = useState(false);

  // Opciones de ordenamiento
  const OPCIONES_ORDEN = [
    { value: 'apellidos_asc', label: 'Apellido (A → Z)' },
    { value: 'apellidos_desc', label: 'Apellido (Z → A)' },
    { value: 'nombre_asc', label: 'Nombre (A → Z)' },
    { value: 'nombre_desc', label: 'Nombre (Z → A)' },
    { value: 'recientes', label: 'Más recientes primero' },
    { value: 'antiguos', label: 'Más antiguos primero' },
    { value: 'diagnostico_asc', label: 'Diagnóstico (A → Z)' },
  ];

  // Obtener perfil del usuario
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data: perfil } = await supabase
          .from('profiles')
          .select('centro_id')
          .eq('id', user.id)
          .single();
        setCentroId(perfil?.centro_id || null);
      }
    };
    fetchUser();
  }, []);

  // Cargar pacientes
  useEffect(() => {
    if (userId === null) return;
    cargarPacientes();
      }, [pagina, searchTerm, centroId, userId, orden, mostrarDemo, limitePorPagina]);

  const cargarPacientes = async () => {
    setLoading(true);
    try {
      let query = supabase.from('pacientes').select('*', { count: 'exact' });

      if (centroId) {
        query = query.eq('centro_id', centroId);
      } else {
        query = query.eq('user_id', userId);
      }

      // 🎬 Filtro de pacientes demo
      if (!mostrarDemo) {
        query = query.or('es_demo.is.null,es_demo.eq.false');
      }

      // Búsqueda simple
      if (searchTerm.trim()) {
        const term = searchTerm.trim().toLowerCase();
        query = query.or(
          `nombre.ilike.%${term}%,apellidos.ilike.%${term}%,diagnostico.ilike.%${term}%,motivo_de_visita.ilike.%${term}%`
        );
      }

      // Ordenamiento dinámico
      const [campo, dir] = orden.split('_');
      let orderConfig = { column: 'apellidos', ascending: true };

      switch (campo) {
        case 'apellidos':
          orderConfig = { column: 'apellidos', ascending: dir === 'asc' };
          break;
        case 'nombre':
          orderConfig = { column: 'nombre', ascending: dir === 'asc' };
          break;
        case 'recientes':
          orderConfig = { column: 'created_at', ascending: false };
          break;
        case 'antiguos':
          orderConfig = { column: 'created_at', ascending: true };
          break;
        case 'diagnostico':
          orderConfig = { column: 'diagnostico', ascending: true };
          break;
        default:
          orderConfig = { column: 'apellidos', ascending: true };
      }

            const desde = pagina * limitePorPagina;
      query = query
        .range(desde, desde + limitePorPagina - 1)
        .order(orderConfig.column, { ascending: orderConfig.ascending, nullsFirst: false });

      const { data, count, error } = await query;
      if (error) throw error;

      setPacientes(data || []);
      setTotalPaginas(Math.ceil((count || 0) / limitePorPagina));
    } catch (error) {
      console.error(error);
      alert('Error al cargar pacientes: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

    // ============================================================
  // GENERAR 5 PACIENTES DEMO CON PATOLOGÍAS VARIADAS
  // ============================================================
  const generarPacientesEjemplo = async () => {
    if (!userId) return alert('Usuario no autenticado');
    if (!centroId) return alert('No se pudo determinar el centro');

    // Verificar si ya hay demos activos
    const { data: demosExistentes } = await supabase
      .from('pacientes')
      .select('id')
      .eq('centro_id', centroId)
      .eq('es_demo', true);

    if (demosExistentes && demosExistentes.length > 0) {
      const conf = confirm(
        `Ya tienes ${demosExistentes.length} paciente(s) demo.\n\n¿Quieres eliminarlos y crear 5 nuevos?\n\n(Sí = reemplazar | No = cancelar)`
      );
      if (!conf) return;
      // Borrar los viejos
      await supabase.from('pacientes').delete().eq('centro_id', centroId).eq('es_demo', true);
    }

    setLoading(true);

    const expira = new Date();
    expira.setDate(expira.getDate() + 30);

    // 5 casos clínicos variados y realistas
    const casosDemo = [
      {
        // 1. Adulto mayor - Artrosis de rodilla (el más común)
        nombre: 'Rosa Elena',
        apellidos: 'Quispe Mamani',
        fecha_nacimiento: '1958-03-14',
        dni: '00000001',
        telefono: '987654001',
        email: 'rosa.quispe@demo.cj',
        direccion: 'Av. Los Álamos 234, SJL',
        motivo_de_visita: 'Dolor en rodilla derecha al caminar desde hace 6 meses',
        antecedentes_medicos: 'Hipertensión controlada. Artrosis diagnosticada por traumatólogo.',
        alergias: 'Ninguna conocida',
        diagnostico: 'Gonartrosis grado II rodilla derecha',
      },
      {
        // 2. Deportista - Rotura de LCA post-quirúrgica
        nombre: 'Diego Alonso',
        apellidos: 'Ramos Cárdenas',
        fecha_nacimiento: '1998-07-22',
        dni: '00000002',
        telefono: '987654002',
        email: 'diego.ramos@demo.cj',
        direccion: 'Jr. Las Begonias 456, Miraflores',
        motivo_de_visita: 'Rehabilitación post-quirúrgica por rotura de ligamento cruzado anterior',
        antecedentes_medicos: 'Cirugía de reconstrucción de LCA hace 3 semanas. Deportista amateur de fútbol.',
        alergias: 'Penicilina',
        diagnostico: 'Post-operatorio reconstrucción LCA rodilla izquierda',
      },
      {
        // 3. Pediátrico - Tortícolis congénita
        nombre: 'Mateo',
        apellidos: 'Flores Sánchez',
        fecha_nacimiento: '2024-11-08',
        dni: '00000003',
        telefono: '987654003',
        email: 'familia.flores@demo.cj',
        direccion: 'Calle Los Nogales 789, Surco',
        motivo_de_visita: 'Inclinación persistente de la cabeza hacia el lado derecho',
        antecedentes_medicos: 'Parto por cesárea sin complicaciones. Control pediátrico al día.',
        alergias: 'Ninguna conocida',
        diagnostico: 'Tortícolis muscular congénita',
      },
      {
        // 4. Oncológica - Post-mastectomía
        nombre: 'Carmen Rosa',
        apellidos: 'Vargas Huamán',
        fecha_nacimiento: '1972-05-30',
        dni: '00000004',
        telefono: '987654004',
        email: 'carmen.vargas@demo.cj',
        direccion: 'Av. Arequipa 1234, Lince',
        motivo_de_visita: 'Rehabilitación de miembro superior derecho post-cirugía oncológica',
        antecedentes_medicos: 'Mastectomía radical derecha hace 2 meses. En tratamiento adyuvante.',
        alergias: 'Ninguna conocida',
        diagnostico: 'Linfedema post-mastectomía brazo derecho',
      },
      {
        // 5. Lumbalgia crónica - El caso clásico
        nombre: 'Jorge Luis',
        apellidos: 'Mendoza Ríos',
        fecha_nacimiento: '1985-12-03',
        dni: '00000005',
        telefono: '987654005',
        email: 'jorge.mendoza@demo.cj',
        direccion: 'Av. Universitaria 5678, Comas',
        motivo_de_visita: 'Dolor lumbar crónico que aumenta al final del día',
        antecedentes_medicos: 'Trabajo de oficina 8h sentado. Episodios recurrentes de lumbalgia.',
        alergias: 'Ninguna conocida',
        diagnostico: 'Lumbalgia mecánica crónica',
      },
    ];

    const pacientesDemo = casosDemo.map((c) => ({
      ...c,
      estado: 'Activo',
      user_id: userId,
      centro_id: centroId,
      es_demo: true,
      demo_expira_en: expira.toISOString(),
      created_at: new Date().toISOString(),
    }));

    try {
      const { error } = await supabase.from('pacientes').insert(pacientesDemo);
      if (error) throw error;

      alert(
        '✅ 5 casos clínicos demo creados:\n\n' +
        '🦴 Artrosis de rodilla (adulto mayor)\n' +
        '⚽ Rotura de LCA (deportista)\n' +
        '👶 Tortícolis congénita (pediátrico)\n' +
        '🎗️ Post-mastectomía (oncológico)\n' +
        '💼 Lumbalgia crónica (adulto)\n\n' +
        'Estarán disponibles 30 días. Puedes limpiarlos con el botón "🧹 Limpiar demos".'
      );
      setMostrarDemo(true);
      await cargarPacientes();
    } catch (error) {
      alert('Error al crear los casos demo: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // ELIMINAR TODOS LOS PACIENTES DEMO DEL CENTRO
  // ============================================================
  const limpiarDemos = async () => {
    if (!centroId) return;
    const { count } = await supabase
      .from('pacientes')
      .select('id', { count: 'exact', head: true })
      .eq('centro_id', centroId)
      .eq('es_demo', true);

    if (!count || count === 0) {
      return alert('No hay pacientes demo para eliminar.');
    }

    const conf = confirm(
      `¿Eliminar los ${count} pacientes demo?\n\n` +
      'Esta acción no se puede deshacer.\n' +
      'Tus pacientes reales NO se verán afectados.'
    );
    if (!conf) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('pacientes')
        .delete()
        .eq('centro_id', centroId)
        .eq('es_demo', true);
      if (error) throw error;
      alert(`✅ ${count} pacientes demo eliminados correctamente.`);
      await cargarPacientes();
    } catch (error) {
      alert('Error al limpiar demos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Guardar nuevo paciente
  const guardarPaciente = async () => {
    // Validaciones
    if (!nuevoPaciente.nombre.trim() || !nuevoPaciente.apellidos.trim()) {
      return alert('Nombre y apellidos son obligatorios.');
    }
    if (!nuevoPaciente.fecha_nacimiento) {
      return alert('La fecha de nacimiento es obligatoria.');
    }
    if (!nuevoPaciente.motivo_de_visita.trim()) {
      return alert('El motivo de visita es obligatorio.');
    }

    setGuardando(true);
    try {
      const { error } = await supabase.from('pacientes').insert([{
        nombre: nuevoPaciente.nombre.trim(),
        apellidos: nuevoPaciente.apellidos.trim(),
        fecha_nacimiento: nuevoPaciente.fecha_nacimiento,
        motivo_de_visita: nuevoPaciente.motivo_de_visita.trim(),
        telefono: nuevoPaciente.telefono?.trim() || null,
        email: nuevoPaciente.email?.trim() || null,
        dni: nuevoPaciente.dni?.trim() || null,
        direccion: nuevoPaciente.direccion?.trim() || null,
        diagnostico: nuevoPaciente.diagnostico?.trim() || null,
        user_id: userId,
        centro_id: centroId,
        created_at: new Date().toISOString(),
      }]);
      if (error) throw error;

      setModalAbierto(false);
      setNuevoPaciente({
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
      alert('✅ Paciente guardado correctamente.');
      await cargarPacientes();
    } catch (error) {
      alert('Error al guardar: ' + error.message);
    } finally {
      setGuardando(false);
    }
  };

  const eliminarPaciente = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este paciente? Esta acción no se puede deshacer.')) return;
    setEliminando(id);
    try {
      const { error } = await supabase.from('pacientes').delete().eq('id', id);
      if (error) throw error;
      alert('✅ Paciente eliminado correctamente.');
      await cargarPacientes();
    } catch (error) {
      alert('Error al eliminar: ' + error.message);
    } finally {
      setEliminando(null);
    }
  };

    // ============================================================
  // EXPORTAR PACIENTES A EXCEL
  // ============================================================
  const handleExportar = async () => {
    if (!centroId) {
      alert('No se pudo determinar tu centro. Recarga la página.');
      return;
    }
    setExportando(true);
    try {
      const res = await exportarPacientes(centroId);
      alert(`✅ Se exportaron ${res.total} pacientes.\n\nArchivo: ${res.archivo}`);
    } catch (err) {
      console.error(err);
      alert('Error al exportar: ' + err.message);
    } finally {
      setExportando(false);
    }
  };

  // Estilos
  const bgPrincipal = temaOscuro ? 'bg-[#0a141d]' : 'bg-[#e2e8f0]';
  const textoPrincipal = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const textoSecundario = temaOscuro ? 'text-gray-400' : 'text-gray-600';
  const bgTarjeta = temaOscuro ? 'bg-[#0a141d] border-gray-800' : 'bg-white border-gray-200';
  const bgInput = temaOscuro ? 'bg-black/20 border-white/10 text-white' : 'bg-gray-100 border-gray-300 text-[#0f172a]';
  const bgCard = temaOscuro ? 'bg-[#1a2533] border-gray-700' : 'bg-white border-gray-200';

  return (
    <div className={`min-h-screen ${bgPrincipal} p-4 md:p-8 transition-colors duration-500`}>
      <div className="max-w-7xl mx-auto">
        {/* Cabecera */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className={`text-3xl font-black tracking-tight ${textoPrincipal}`}>👥 Lista de Pacientes</h1>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Gestión de pacientes del centro</p>
          </div>
          <div className="flex flex-wrap gap-2">
    <button
    onClick={generarPacientesEjemplo}
    className="px-4 py-2 bg-purple-600 text-white font-bold rounded-xl text-xs uppercase hover:scale-105 transition-all shadow-lg"
    title="Crear 5 casos clínicos demo con patologías variadas"
  >
    ⚡ Cargar demo
  </button>
  <button
    onClick={limpiarDemos}
    className="px-4 py-2 bg-red-600/20 text-red-400 font-bold rounded-xl text-xs uppercase hover:bg-red-600 hover:text-white transition-all shadow-lg border border-red-500/30"
    title="Eliminar todos los pacientes demo del centro"
  >
    🧹 Limpiar demos
  </button>
  <button
    onClick={handleExportar}
    disabled={exportando}
    className="px-4 py-2 bg-emerald-600/20 text-emerald-400 font-bold rounded-xl text-xs uppercase hover:bg-emerald-600 hover:text-white transition-all shadow-lg border border-emerald-500/30 disabled:opacity-50"
    title="Descargar pacientes a Excel"
  >
    {exportando ? '⏳ Exportando...' : '📤 Exportar'}
  </button>
  <button
    onClick={() => setModalImportarAbierto(true)}
    className="px-4 py-2 bg-blue-600/20 text-blue-400 font-bold rounded-xl text-xs uppercase hover:bg-blue-600 hover:text-white transition-all shadow-lg border border-blue-500/30"
    title="Importar pacientes desde Excel"
  >
    📥 Importar
  </button>
  <button
    onClick={() => setModalAbierto(true)}
    className="px-5 py-2 bg-[#22d3ee] text-black font-bold rounded-xl text-xs uppercase hover:scale-105 transition-all shadow-lg"
  >
    + Agregar Paciente
  </button>
</div>
        </div>

        {/* Buscador + Ordenamiento */}
        <div className="mb-6 flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="Buscar por nombre, apellido, motivo o diagnóstico..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPagina(0); }}
            className={`flex-1 px-4 py-3 rounded-xl border ${bgInput} outline-none focus:border-[#22d3ee] transition-all text-sm`}
          />
                    <button
            onClick={() => setMostrarDemo(!mostrarDemo)}
            className={`px-3 py-3 rounded-xl border text-xs font-bold whitespace-nowrap transition-all ${
              mostrarDemo
                ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                : `${temaOscuro ? 'bg-black/20 border-white/10 text-gray-400' : 'bg-gray-100 border-gray-300 text-gray-600'}`
            }`}
            title={mostrarDemo ? 'Ocultar pacientes demo' : 'Mostrar pacientes demo'}
          >
            {mostrarDemo ? '🎬 Viendo demo' : '🎬 Ver demo'}
          </button>
          <div className="flex items-center gap-2">
            <label className={`text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} whitespace-nowrap`}>
              Ordenar por:
            </label>
            <select
              value={orden}
              onChange={(e) => { setOrden(e.target.value); setPagina(0); }}
              className={`px-3 py-3 rounded-xl border ${bgInput} outline-none focus:border-[#22d3ee] transition-all text-sm cursor-pointer min-w-[200px]`}
            >
              {OPCIONES_ORDEN.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Contador */}
                {!loading && (
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <p className={`text-xs ${temaOscuro ? 'text-gray-400' : 'text-gray-600'}`}>
              Mostrando <span className="font-black text-[#22d3ee]">{pacientes.length}</span> de <span className="font-black">{totalPaginas * limitePorPagina}</span> paciente{(totalPaginas * limitePorPagina) !== 1 ? 's' : ''}
              {searchTerm && ` para "${searchTerm}"`}
              {mostrarDemo && <span className="ml-2 text-purple-400 font-bold">(incluye demo)</span>}
            </p>

            <div className="flex items-center gap-2">
              <label className={`text-[10px] font-bold uppercase tracking-wider ${temaOscuro ? 'text-gray-400' : 'text-gray-600'}`}>
                Mostrar:
              </label>
              <select
                value={limitePorPagina}
                onChange={(e) => {
                  setLimitePorPagina(parseInt(e.target.value));
                  setPagina(0);
                }}
                className={`px-2 py-1 rounded-lg border text-xs font-bold cursor-pointer ${
                  temaOscuro
                    ? 'bg-black/30 border-gray-700 text-white'
                    : 'bg-white border-gray-300 text-[#0f172a]'
                } outline-none focus:border-[#22d3ee]`}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>

              <span className={`text-[10px] font-black px-3 py-1 rounded-lg ${temaOscuro ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-100 text-emerald-800'}`}>
                {orden === 'recientes' ? 'Recientes' : OPCIONES_ORDEN.find(o => o.value === orden)?.label}
              </span>
            </div>
          </div>
        )}

        {/* Lista */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#22d3ee] border-t-transparent"></div>
          </div>
        ) : pacientes.length === 0 ? (
          <div className={`${bgTarjeta} p-12 rounded-3xl border text-center`}>
            <p className={`text-lg ${temaOscuro ? 'text-gray-400' : 'text-gray-600'}`}>No hay pacientes registrados.</p>
            <p className={`text-sm mt-2 ${temaOscuro ? 'text-gray-500' : 'text-gray-500'}`}>Usa el botón "Agregar Ejemplos" para ver una vista previa.</p>
          </div>
        ) : (
          <>
            {/* --- TABLA (PC) --- */}
            <div className="hidden md:block overflow-x-auto rounded-2xl border shadow-sm">
              <table className="w-full text-sm">
                <thead className={`${temaOscuro ? 'bg-[#0f1a24] border-gray-700' : 'bg-gray-100 border-gray-300'} border-b`}>
                                    <tr>
                    <th className={`px-3 py-3 text-center font-bold text-xs uppercase tracking-wider ${temaOscuro ? 'text-gray-400' : 'text-gray-700'} w-12`}>#</th>
                    <th className={`px-3 py-3 text-left font-bold text-xs uppercase tracking-wider ${temaOscuro ? 'text-gray-400' : 'text-gray-700'}`}>Nombre</th>
                    <th className={`px-3 py-3 text-left font-bold text-xs uppercase tracking-wider ${temaOscuro ? 'text-gray-400' : 'text-gray-700'}`}>Apellidos</th>
                    <th className={`px-3 py-3 text-center font-bold text-xs uppercase tracking-wider ${temaOscuro ? 'text-gray-400' : 'text-gray-700'}`}>Edad</th>
                    <th className={`px-3 py-3 text-left font-bold text-xs uppercase tracking-wider ${temaOscuro ? 'text-gray-400' : 'text-gray-700'}`}>Teléfono</th>
                    <th className={`px-3 py-3 text-left font-bold text-xs uppercase tracking-wider ${temaOscuro ? 'text-gray-400' : 'text-gray-700'}`}>Motivo</th>
                    <th className={`px-3 py-3 text-left font-bold text-xs uppercase tracking-wider ${temaOscuro ? 'text-gray-400' : 'text-gray-700'}`}>Diagnóstico</th>
                    <th className={`px-3 py-3 text-center font-bold text-xs uppercase tracking-wider ${temaOscuro ? 'text-gray-400' : 'text-gray-700'}`}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                                    {pacientes.map((p, index) => {
                    const faltantes = datosIncompletos(p);
                    const numeroOrden = pagina * limitePorPagina + index + 1;
                    return (
                      <tr key={p.id} className={`border-b ${temaOscuro ? 'border-gray-700 hover:bg-[#22d3ee]/5' : 'border-gray-200 hover:bg-[#22d3ee]/10'} transition-colors`}>
                        <td className={`px-3 py-3 text-center font-mono text-xs ${textoSecundario}`}>
                          {numeroOrden}
                        </td>
                                                <td className={`px-3 py-3 font-medium ${textoPrincipal}`}>
                          <div className="flex items-center gap-2 flex-wrap">
                            {p.nombre}
                            {faltantes.length > 0 && (
                              <span
                                className="text-yellow-500 text-xs"
                                title={`Falta: ${faltantes.join(', ')}`}
                              >
                                ⚠️
                              </span>
                            )}
                            {p.es_demo && (
                              <span
                                className="text-[9px] font-black px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40"
                                title={`Demo - expira ${p.demo_expira_en ? new Date(p.demo_expira_en).toLocaleDateString('es-ES') : 'sin fecha'}`}
                              >
                                🎬 DEMO
                              </span>
                            )}
                          </div>
                        </td>
                        <td className={`px-3 py-3 ${textoPrincipal}`}>{p.apellidos}</td>
                        <td className={`px-3 py-3 text-center ${textoPrincipal}`}>
                          {calcularEdad(p.fecha_nacimiento)}
                        </td>
                        <td className={`px-3 py-3 ${textoPrincipal}`}>{p.telefono || '—'}</td>
                        <td className={`px-3 py-3 text-xs ${textoSecundario} max-w-[200px] truncate`} title={p.motivo_de_visita || ''}>
                          {p.motivo_de_visita || <span className="text-yellow-500">Sin registrar</span>}
                        </td>
                        <td className={`px-3 py-3 text-xs ${textoSecundario} max-w-[180px] truncate`} title={p.diagnostico || ''}>
                          {p.diagnostico || 'Pendiente'}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => navigate(`/clinica/pacientes/${p.id}`)}
                              className="px-3 py-1 bg-[#22d3ee]/20 text-[#22d3ee] font-bold rounded-lg text-xs hover:bg-[#22d3ee] hover:text-black transition-all"
                            >
                              Ver ficha
                            </button>
                            <button
                              onClick={() => eliminarPaciente(p.id)}
                              disabled={eliminando === p.id}
                              className="px-3 py-1 bg-red-500/20 text-red-400 font-bold rounded-lg text-xs hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                            >
                              {eliminando === p.id ? '...' : 'Eliminar'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* --- TARJETAS (tablet/móvil) --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
              {pacientes.map((p) => {
                const faltantes = datosIncompletos(p);
                return (
                  <div key={p.id} className={`${bgCard} p-4 rounded-2xl border shadow-sm hover:shadow-md transition-all`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className={`${textoPrincipal} font-bold text-base flex items-center gap-1`}>
                          {p.nombre} {p.apellidos}
                          {faltantes.length > 0 && <span className="text-yellow-500 text-xs" title={`Falta: ${faltantes.join(', ')}`}>⚠️</span>}
                        </h3>
                        <p className="text-xs text-gray-400">
                          {calcularEdad(p.fecha_nacimiento)} años · {p.diagnostico || 'Sin diagnóstico'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          📝 {p.motivo_de_visita || 'Sin motivo registrado'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">📞 {p.telefono || 'Sin teléfono'}</p>
                        <p className="text-xs text-gray-500 truncate">✉️ {p.email || 'Sin email'}</p>
                      </div>
                      <span className={`text-[10px] font-black px-2 py-1 rounded-full ${p.estado === 'Activo' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {p.estado || 'Activo'}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => navigate(`/clinica/pacientes/${p.id}`)}
                        className="flex-1 py-2 bg-[#22d3ee]/10 text-[#22d3ee] font-bold rounded-xl text-xs hover:bg-[#22d3ee] hover:text-black transition-all"
                      >
                        Ver ficha →
                      </button>
                      <button
                        onClick={() => eliminarPaciente(p.id)}
                        disabled={eliminando === p.id}
                        className="flex-1 py-2 bg-red-500/10 text-red-400 font-bold rounded-xl text-xs hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                      >
                        {eliminando === p.id ? '...' : 'Eliminar'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="flex justify-between items-center mt-6 px-2">
            <button
              onClick={() => setPagina(p => Math.max(0, p - 1))}
              disabled={pagina === 0}
              className={`px-4 py-2 rounded-xl text-sm font-bold ${pagina === 0 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-[#22d3ee]/20'} transition-all`}
            >
              Anterior
            </button>
            <span className={`text-sm ${textoPrincipal}`}>Página {pagina + 1} de {totalPaginas}</span>
            <button
              onClick={() => setPagina(p => Math.min(totalPaginas - 1, p + 1))}
              disabled={pagina === totalPaginas - 1}
              className={`px-4 py-2 rounded-xl text-sm font-bold ${pagina === totalPaginas - 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-[#22d3ee]/20'} transition-all`}
            >
              Siguiente
            </button>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* MODAL: Nuevo Paciente                                        */}
      {/* ============================================================ */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className={`relative w-full max-w-2xl rounded-3xl border ${bgTarjeta} p-6 shadow-2xl animate-fade-in my-8`}>
            <button
              onClick={() => setModalAbierto(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl"
            >
              ✕
            </button>
            <h2 className={`text-xl font-black ${textoPrincipal} mb-1`}>Nuevo Paciente</h2>
            <p className={`text-xs ${textoSecundario} mb-6`}>
              Los campos marcados con <span className="text-red-400">*</span> son obligatorios
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre */}
              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>
                  Nombre <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej: Rosa Elena"
                  value={nuevoPaciente.nombre}
                  onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, nombre: e.target.value })}
                  className={`w-full px-4 py-2 rounded-xl border ${bgInput} outline-none focus:border-[#22d3ee] text-sm`}
                />
              </div>

              {/* Apellidos */}
              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>
                  Apellidos <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej: Quispe Mamani"
                  value={nuevoPaciente.apellidos}
                  onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, apellidos: e.target.value })}
                  className={`w-full px-4 py-2 rounded-xl border ${bgInput} outline-none focus:border-[#22d3ee] text-sm`}
                />
              </div>

              {/* Fecha de nacimiento */}
              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>
                  Fecha de nacimiento <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={nuevoPaciente.fecha_nacimiento}
                  onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, fecha_nacimiento: e.target.value })}
                  className={`w-full px-4 py-2 rounded-xl border ${bgInput} outline-none focus:border-[#22d3ee] text-sm`}
                />
                {nuevoPaciente.fecha_nacimiento && (
                  <p className="text-[10px] text-[#22d3ee] mt-1">
                    Edad: {calcularEdad(nuevoPaciente.fecha_nacimiento)} años
                  </p>
                )}
              </div>

              {/* DNI */}
              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>
                  DNI / Documento
                </label>
                <input
                  type="text"
                  placeholder="Ej: 12345678"
                  value={nuevoPaciente.dni}
                  onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, dni: e.target.value })}
                  className={`w-full px-4 py-2 rounded-xl border ${bgInput} outline-none focus:border-[#22d3ee] text-sm`}
                />
              </div>

              {/* Motivo de visita */}
              <div className="md:col-span-2">
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>
                  Motivo de visita <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej: Dolor de rodilla derecha al caminar"
                  value={nuevoPaciente.motivo_de_visita}
                  onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, motivo_de_visita: e.target.value })}
                  className={`w-full px-4 py-2 rounded-xl border ${bgInput} outline-none focus:border-[#22d3ee] text-sm`}
                />
              </div>

              {/* Dirección */}
              <div className="md:col-span-2">
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>
                  Dirección
                </label>
                <input
                  type="text"
                  placeholder="Ej: Av. Los Álamos 234, San Juan de Lurigancho"
                  value={nuevoPaciente.direccion}
                  onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, direccion: e.target.value })}
                  className={`w-full px-4 py-2 rounded-xl border ${bgInput} outline-none focus:border-[#22d3ee] text-sm`}
                />
              </div>

              {/* Teléfono */}
              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>
                  Teléfono
                </label>
                <input
                  type="tel"
                  placeholder="Ej: 987654321"
                  value={nuevoPaciente.telefono}
                  onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, telefono: e.target.value })}
                  className={`w-full px-4 py-2 rounded-xl border ${bgInput} outline-none focus:border-[#22d3ee] text-sm`}
                />
              </div>

              {/* Email */}
              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Ej: paciente@correo.com"
                  value={nuevoPaciente.email}
                  onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, email: e.target.value })}
                  className={`w-full px-4 py-2 rounded-xl border ${bgInput} outline-none focus:border-[#22d3ee] text-sm`}
                />
              </div>

              {/* Diagnóstico inicial */}
              <div className="md:col-span-2">
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>
                  Diagnóstico inicial <span className="text-gray-500">(opcional, se actualiza al aprobar evaluaciones)</span>
                </label>
                <input
                  type="text"
                  placeholder="Dejar vacío si aún no se conoce"
                  value={nuevoPaciente.diagnostico}
                  onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, diagnostico: e.target.value })}
                  className={`w-full px-4 py-2 rounded-xl border ${bgInput} outline-none focus:border-[#22d3ee] text-sm`}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-gray-700/30">
              <button
                onClick={() => setModalAbierto(false)}
                className={`px-5 py-2 rounded-xl border text-sm font-bold ${temaOscuro ? 'border-gray-600 hover:bg-gray-700/30' : 'border-gray-300 hover:bg-gray-100'} ${textoPrincipal}`}
              >
                Cancelar
              </button>
              <button
                onClick={guardarPaciente}
                disabled={guardando}
                className="px-6 py-2 bg-[#22d3ee] text-black font-black rounded-xl text-sm hover:scale-105 transition-all disabled:opacity-50"
              >
                {guardando ? 'Guardando...' : '💾 Guardar Paciente'}
              </button>
            </div>
          </div>
                </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: Importar desde Excel                                   */}
      {/* ============================================================ */}
      <ModalImportar
        abierto={modalImportarAbierto}
        onCerrar={() => setModalImportarAbierto(false)}
        centroId={centroId}
        onImportado={() => {
          cargarPacientes();
        }}
        temaOscuro={temaOscuro}
      />
    </div>
  );
}