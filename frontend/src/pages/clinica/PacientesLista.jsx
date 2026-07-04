import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

export default function PacientesLista({ temaOscuro }) {
  const navigate = useNavigate();
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [nuevoPaciente, setNuevoPaciente] = useState({ nombre: '', apellidos: '', telefono: '', email: '', diagnostico: '' });
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(null);
  const LIMITE = 10;

  const [centroId, setCentroId] = useState(null);
  const [userId, setUserId] = useState(null);

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
  }, [pagina, searchTerm, centroId, userId]);

  const cargarPacientes = async () => {
    setLoading(true);
    try {
      let query = supabase.from('pacientes').select('*', { count: 'exact' });

      if (centroId) {
        query = query.eq('centro_id', centroId);
      } else {
        query = query.eq('user_id', userId);
      }

      // Búsqueda simple (case-insensitive, sin acentos por ahora)
      if (searchTerm.trim()) {
        const term = searchTerm.trim().toLowerCase();
        query = query.or(
          `nombre.ilike.%${term}%,apellidos.ilike.%${term}%,diagnostico.ilike.%${term}%`
        );
      }

      const desde = pagina * LIMITE;
      query = query.range(desde, desde + LIMITE - 1).order('apellidos', { ascending: true });

      const { data, count, error } = await query;
      if (error) throw error;

      setPacientes(data || []);
      setTotalPaginas(Math.ceil((count || 0) / LIMITE));
    } catch (error) {
      console.error(error);
      alert('Error al cargar pacientes: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Generar pacientes de ejemplo
  const generarPacientesEjemplo = async () => {
    if (!userId) return alert('Usuario no autenticado');
    setLoading(true);

    const nombres = ['María', 'José', 'Ana', 'Carlos', 'Laura', 'Pedro', 'Sofía', 'Diego', 'Valentina', 'Andrés', 'Isabel', 'Javier', 'Carmen', 'Luis', 'Elena'];
    const apellidos = ['García', 'Rodríguez', 'Fernández', 'López', 'Martínez', 'González', 'Pérez', 'Sánchez', 'Ramírez', 'Torres', 'Rivera', 'Morales', 'Ortiz', 'Cruz', 'Reyes'];
    const diagnosticos = ['Lumbalgia Crónica', 'Recuperación ACL', 'Esguince de Tobillo', 'Tendinitis de Hombro', 'Síndrome del Túnel Carpiano', 'Artrosis de Rodilla', 'Cervicalgia', 'Fascitis Plantar', 'Epicondilitis', 'Hernia Discal Lumbar'];
    const telefonos = ['987654321', '912345678', '965432187', '987123456', '965432100', '985674123', '912345600', '967891234', '956781234', '945678912'];
    const estados = ['Activo', 'Activo', 'Activo', 'Pendiente', 'Inactivo', 'Activo'];

    const pacientesEjemplo = [];
    for (let i = 0; i < 15; i++) {
      const nombre = nombres[Math.floor(Math.random() * nombres.length)];
      const apellido = apellidos[Math.floor(Math.random() * apellidos.length)];
      pacientesEjemplo.push({
        nombre: nombre,
        apellidos: apellido,
        telefono: telefonos[Math.floor(Math.random() * telefonos.length)],
        email: `${nombre.toLowerCase()}.${apellido.toLowerCase()}@gmail.com`,
        diagnostico: diagnosticos[Math.floor(Math.random() * diagnosticos.length)],
        estado: estados[Math.floor(Math.random() * estados.length)],
        user_id: userId,
        centro_id: centroId,
        created_at: new Date().toISOString()
      });
    }

    try {
      const { error } = await supabase.from('pacientes').insert(pacientesEjemplo);
      if (error) throw error;
      alert('✅ 15 pacientes de ejemplo agregados correctamente.');
      await cargarPacientes();
    } catch (error) {
      alert('Error al agregar pacientes de ejemplo: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const guardarPaciente = async () => {
    if (!nuevoPaciente.nombre || !nuevoPaciente.apellidos) {
      return alert('Nombre y apellidos son obligatorios.');
    }
    setGuardando(true);
    try {
      const { error } = await supabase.from('pacientes').insert([{
        ...nuevoPaciente,
        user_id: userId,
        centro_id: centroId,
        created_at: new Date().toISOString()
      }]);
      if (error) throw error;
      setModalAbierto(false);
      setNuevoPaciente({ nombre: '', apellidos: '', telefono: '', email: '', diagnostico: '' });
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

  // Estilos
  const bgPrincipal = temaOscuro ? 'bg-[#0a141d]' : 'bg-[#e2e8f0]';
  const textoPrincipal = temaOscuro ? 'text-white' : 'text-[#0f172a]';
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
            >
              🎲 Agregar Ejemplos
            </button>
            <button
              onClick={() => setModalAbierto(true)}
              className="px-5 py-2 bg-[#22d3ee] text-black font-bold rounded-xl text-xs uppercase hover:scale-105 transition-all shadow-lg"
            >
              + Agregar Paciente
            </button>
          </div>
        </div>

        {/* Buscador */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar por nombre, apellido o diagnóstico..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full max-w-md px-4 py-3 rounded-xl border ${bgInput} outline-none focus:border-[#22d3ee] transition-all text-sm`}
          />
        </div>

        {/* Lista */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#22d3ee] border-t-transparent"></div>
          </div>
        ) : pacientes.length === 0 ? (
          <div className={`${bgTarjeta} p-12 rounded-3xl border text-center`}>
            <p className="text-gray-400 text-lg">No hay pacientes registrados.</p>
            <p className="text-sm text-gray-500 mt-2">Usa el botón "Agregar Ejemplos" para ver una vista previa.</p>
          </div>
        ) : (
          <>
            {/* --- TABLA (PC) --- */}
            <div className="hidden md:block overflow-x-auto rounded-2xl border shadow-sm">
              <table className="w-full text-sm">
                <thead className={`${temaOscuro ? 'bg-[#0f1a24]' : 'bg-gray-100'} border-b border-gray-700`}>
                  <tr>
                    <th className="px-4 py-3 text-left font-bold text-xs uppercase tracking-wider text-gray-400">Nombre</th>
                    <th className="px-4 py-3 text-left font-bold text-xs uppercase tracking-wider text-gray-400">Apellidos</th>
                    <th className="px-4 py-3 text-left font-bold text-xs uppercase tracking-wider text-gray-400">Teléfono</th>
                    <th className="px-4 py-3 text-left font-bold text-xs uppercase tracking-wider text-gray-400">Diagnóstico</th>
                    <th className="px-4 py-3 text-center font-bold text-xs uppercase tracking-wider text-gray-400">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pacientes.map((p) => (
                    <tr key={p.id} className={`border-b border-gray-700 hover:bg-[#22d3ee]/5 transition-colors`}>
                      <td className="px-4 py-3 font-medium">{p.nombre}</td>
                      <td className="px-4 py-3">{p.apellidos}</td>
                      <td className="px-4 py-3">{p.telefono || '—'}</td>
                      <td className="px-4 py-3 text-xs">{p.diagnostico || 'Pendiente'}</td>
                      <td className="px-4 py-3 text-center">
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
                  ))}
                </tbody>
              </table>
            </div>

            {/* --- TARJETAS (tablet/móvil) --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
              {pacientes.map((p) => (
                <div key={p.id} className={`${bgCard} p-4 rounded-2xl border shadow-sm hover:shadow-md transition-all`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className={`${textoPrincipal} font-bold text-base`}>{p.nombre} {p.apellidos}</h3>
                      <p className="text-sm text-gray-400">{p.diagnostico || 'Sin diagnóstico'}</p>
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
              ))}
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

      {/* Modal */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`relative w-full max-w-md rounded-3xl border ${bgTarjeta} p-6 shadow-2xl animate-fade-in`}>
            <button onClick={() => setModalAbierto(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
            <h2 className={`text-xl font-black ${textoPrincipal} mb-6`}>Nuevo Paciente</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Nombre *" value={nuevoPaciente.nombre} onChange={(e) => setNuevoPaciente({...nuevoPaciente, nombre: e.target.value})} className={`w-full px-4 py-2 rounded-xl border ${bgInput} outline-none focus:border-[#22d3ee]`} />
              <input type="text" placeholder="Apellidos *" value={nuevoPaciente.apellidos} onChange={(e) => setNuevoPaciente({...nuevoPaciente, apellidos: e.target.value})} className={`w-full px-4 py-2 rounded-xl border ${bgInput} outline-none focus:border-[#22d3ee]`} />
              <input type="text" placeholder="Teléfono" value={nuevoPaciente.telefono} onChange={(e) => setNuevoPaciente({...nuevoPaciente, telefono: e.target.value})} className={`w-full px-4 py-2 rounded-xl border ${bgInput} outline-none focus:border-[#22d3ee]`} />
              <input type="email" placeholder="Email" value={nuevoPaciente.email} onChange={(e) => setNuevoPaciente({...nuevoPaciente, email: e.target.value})} className={`w-full px-4 py-2 rounded-xl border ${bgInput} outline-none focus:border-[#22d3ee]`} />
              <input type="text" placeholder="Diagnóstico" value={nuevoPaciente.diagnostico} onChange={(e) => setNuevoPaciente({...nuevoPaciente, diagnostico: e.target.value})} className={`w-full px-4 py-2 rounded-xl border ${bgInput} outline-none focus:border-[#22d3ee]`} />
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setModalAbierto(false)} className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-bold hover:bg-gray-100">Cancelar</button>
                <button onClick={guardarPaciente} disabled={guardando} className="px-5 py-2 bg-[#22d3ee] text-black font-bold rounded-xl text-sm hover:scale-105 transition-all disabled:opacity-50">{guardando ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}