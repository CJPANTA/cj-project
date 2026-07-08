import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function PanelDirector({ temaOscuro }) {
  const [usuarios, setUsuarios] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [estadisticas, setEstadisticas] = useState({ total: 0, pendientes: 0, estudiantes: 0, licenciados: 0 });

  const bgPrincipal = temaOscuro ? 'bg-[#0a141d]' : 'bg-[#e2e8f0]';
  const textoPrincipal = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const bgTarjeta = temaOscuro ? 'bg-[#0a141d] border-gray-800' : 'bg-white border-gray-200';

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // Obtener todos los perfiles (excepto el propio admin)
      const { data: perfiles, error: errPerfiles } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (errPerfiles) throw errPerfiles;

      // Obtener usuarios de auth para email confirmado (opcional)
      // No podemos obtener directamente todos los auth.users, pero los perfiles ya tienen email.

      // Separar solicitadas (estado = 'pendiente') y activos (estado = 'aprobado')
      const pendientes = perfiles.filter(p => p.estado === 'pendiente');
      const activos = perfiles.filter(p => p.estado === 'aprobado');

      setSolicitudes(pendientes);
      setUsuarios(activos);

      // Estadísticas
      const total = perfiles.length;
      const pendientesCount = pendientes.length;
      const estudiantes = activos.filter(p => p.rol === 2).length;
      const licenciados = activos.filter(p => p.rol === 3).length;

      setEstadisticas({
        total,
        pendientes: pendientesCount,
        estudiantes,
        licenciados
      });
    } catch (error) {
      console.error(error);
      alert('Error al cargar datos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const aprobarUsuario = async (userId, nuevoRol) => {
    if (!nuevoRol) {
      alert('Selecciona un rol para aprobar.');
      return;
    }
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ estado: 'aprobado', rol: parseInt(nuevoRol) })
        .eq('id', userId);

      if (error) throw error;
      alert('✅ Usuario aprobado correctamente.');
      cargarDatos();
    } catch (error) {
      alert('Error al aprobar: ' + error.message);
    }
  };

  const cambiarRol = async (userId, nuevoRol) => {
    if (!nuevoRol) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ rol: parseInt(nuevoRol) })
        .eq('id', userId);

      if (error) throw error;
      alert('✅ Rol actualizado correctamente.');
      cargarDatos();
    } catch (error) {
      alert('Error al cambiar rol: ' + error.message);
    }
  };

  const eliminarUsuario = async (userId) => {
    if (!confirm('¿Seguro que quieres eliminar este usuario?')) return;
    try {
      // Primero eliminar de profiles
      const { error: errProf } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (errProf) throw errProf;

      // Luego de auth.users (solo si es necesario, a veces no se puede desde cliente)
      // En su lugar, recomendamos deshabilitar la cuenta desde el panel de Supabase.
      alert('✅ Usuario eliminado de profiles. Para eliminar completamente, hazlo desde el panel de Supabase.');
      cargarDatos();
    } catch (error) {
      alert('Error al eliminar: ' + error.message);
    }
  };

  // Lista de roles para el selector
  const ROLES = [
    { valor: 1, label: 'Director' },
    { valor: 2, label: 'Estudiante' },
    { valor: 3, label: 'Licenciado' },
    { valor: 4, label: 'Híbrido' },
    { valor: 5, label: 'Paciente' },
    { valor: 6, label: 'Demo' },
    { valor: 7, label: 'Admin Centro' },  // <--- ROL 7 AGREGADO
  ];

  const getRolLabel = (rol) => {
    const found = ROLES.find(r => r.valor === rol);
    return found ? found.label : 'Desconocido';
  };

  return (
    <div className={`min-h-screen ${bgPrincipal} p-4 md:p-8 transition-colors duration-500`}>
      <div className="max-w-7xl mx-auto">
        <h1 className={`text-3xl font-black tracking-tight ${textoPrincipal} mb-6`}>Panel del Director</h1>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className={`${bgTarjeta} p-4 rounded-2xl border text-center`}>
            <p className="text-3xl font-black text-[#22d3ee]">{estadisticas.total}</p>
            <p className="text-xs font-bold uppercase text-gray-400">Total Usuarios</p>
          </div>
          <div className={`${bgTarjeta} p-4 rounded-2xl border text-center`}>
            <p className="text-3xl font-black text-yellow-400">{estadisticas.pendientes}</p>
            <p className="text-xs font-bold uppercase text-gray-400">Pendientes</p>
          </div>
          <div className={`${bgTarjeta} p-4 rounded-2xl border text-center`}>
            <p className="text-3xl font-black text-blue-400">{estadisticas.estudiantes}</p>
            <p className="text-xs font-bold uppercase text-gray-400">Estudiantes</p>
          </div>
          <div className={`${bgTarjeta} p-4 rounded-2xl border text-center`}>
            <p className="text-3xl font-black text-emerald-400">{estadisticas.licenciados}</p>
            <p className="text-xs font-bold uppercase text-gray-400">Licenciados</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#22d3ee] border-t-transparent"></div>
          </div>
        ) : (
          <>
            {/* Solicitudes pendientes */}
            <h2 className={`text-xl font-bold ${textoPrincipal} mb-4`}>Solicitudes pendientes ({solicitudes.length})</h2>
            {solicitudes.length === 0 ? (
              <p className="text-gray-400 mb-6">No hay solicitudes pendientes.</p>
            ) : (
              <div className="overflow-x-auto rounded-2xl border ${bgTarjeta} shadow-sm mb-8">
                <table className="w-full text-sm">
                  <thead className={`${temaOscuro ? 'bg-[#0f1a24]' : 'bg-gray-100'} border-b border-gray-700`}>
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-xs uppercase text-gray-400">Nombre</th>
                      <th className="px-4 py-3 text-left font-bold text-xs uppercase text-gray-400">Email</th>
                      <th className="px-4 py-3 text-left font-bold text-xs uppercase text-gray-400">Teléfono</th>
                      <th className="px-4 py-3 text-left font-bold text-xs uppercase text-gray-400">Rol deseado</th>
                      <th className="px-4 py-3 text-center font-bold text-xs uppercase text-gray-400">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {solicitudes.map((u) => (
                      <tr key={u.id} className={`border-b border-gray-700 hover:bg-[#22d3ee]/5 transition-colors`}>
                        <td className="px-4 py-3 font-medium">{u.nombre_completo || 'Sin nombre'}</td>
                        <td className="px-4 py-3">{u.email}</td>
                        <td className="px-4 py-3">{u.telefono || '—'}</td>
                        <td className="px-4 py-3 text-xs">{getRolLabel(u.rol)}</td>
                        <td className="px-4 py-3 text-center">
                          <select
                            className={`px-2 py-1 rounded-lg border ${temaOscuro ? 'bg-black/20 border-gray-700 text-white' : 'bg-gray-100 border-gray-300'} text-xs`}
                            defaultValue={u.rol || 2}
                            onChange={(e) => {
                              // Guardar rol seleccionado en un atributo data
                              const select = e.target;
                              select.dataset.selectedRol = e.target.value;
                            }}
                          >
                            {ROLES.map(r => (
                              <option key={r.valor} value={r.valor}>{r.label}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => {
                              const select = document.querySelector(`#approve-${u.id}`);
                              const nuevoRol = select ? select.value : 2;
                              aprobarUsuario(u.id, nuevoRol);
                            }}
                            className="ml-2 px-3 py-1 bg-[#22d3ee] text-black font-bold rounded-lg text-xs hover:scale-105 transition-all"
                          >
                            Aprobar
                          </button>
                          <button
                            onClick={() => eliminarUsuario(u.id)}
                            className="ml-2 px-3 py-1 bg-red-500/20 text-red-400 font-bold rounded-lg text-xs hover:bg-red-500 hover:text-white transition-all"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Usuarios activos */}
            <h2 className={`text-xl font-bold ${textoPrincipal} mb-4`}>Usuarios activos ({usuarios.length})</h2>
            {usuarios.length === 0 ? (
              <p className="text-gray-400">No hay usuarios activos.</p>
            ) : (
              <div className="overflow-x-auto rounded-2xl border ${bgTarjeta} shadow-sm">
                <table className="w-full text-sm">
                  <thead className={`${temaOscuro ? 'bg-[#0f1a24]' : 'bg-gray-100'} border-b border-gray-700`}>
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-xs uppercase text-gray-400">Nombre</th>
                      <th className="px-4 py-3 text-left font-bold text-xs uppercase text-gray-400">Email</th>
                      <th className="px-4 py-3 text-left font-bold text-xs uppercase text-gray-400">Rol actual</th>
                      <th className="px-4 py-3 text-left font-bold text-xs uppercase text-gray-400">Nuevo rol</th>
                      <th className="px-4 py-3 text-center font-bold text-xs uppercase text-gray-400">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map((u) => (
                      <tr key={u.id} className={`border-b border-gray-700 hover:bg-[#22d3ee]/5 transition-colors`}>
                        <td className="px-4 py-3 font-medium">{u.nombre_completo || 'Sin nombre'}</td>
                        <td className="px-4 py-3">{u.email}</td>
                        <td className="px-4 py-3 text-xs">{getRolLabel(u.rol)}</td>
                        <td className="px-4 py-3">
                          <select
                            className={`px-2 py-1 rounded-lg border ${temaOscuro ? 'bg-black/20 border-gray-700 text-white' : 'bg-gray-100 border-gray-300'} text-xs`}
                            defaultValue={u.rol}
                          >
                            {ROLES.map(r => (
                              <option key={r.valor} value={r.valor}>{r.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => {
                              const select = document.querySelector(`#change-${u.id}`);
                              const nuevoRol = select ? select.value : u.rol;
                              cambiarRol(u.id, nuevoRol);
                            }}
                            className="px-3 py-1 bg-blue-500/20 text-blue-400 font-bold rounded-lg text-xs hover:bg-blue-500 hover:text-white transition-all"
                          >
                            Cambiar rol
                          </button>
                          <button
                            onClick={() => eliminarUsuario(u.id)}
                            className="ml-2 px-3 py-1 bg-red-500/20 text-red-400 font-bold rounded-lg text-xs hover:bg-red-500 hover:text-white transition-all"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}