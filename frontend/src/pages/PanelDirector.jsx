import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function PanelDirector({ temaOscuro }) {
  const [usuarios, setUsuarios] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [centros, setCentros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [estadisticas, setEstadisticas] = useState({ total: 0, pendientes: 0, estudiantes: 0, licenciados: 0 });
  const [mostrarCentros, setMostrarCentros] = useState(false);
  const [nuevoCentro, setNuevoCentro] = useState({ id: '', nombre: '', direccion: '', telefono: '' });
  const [guardandoCentro, setGuardandoCentro] = useState(false);
  const [subiendoLogo, setSubiendoLogo] = useState(false);

  const bgPrincipal = temaOscuro ? 'bg-[#0a141d]' : 'bg-[#e2e8f0]';
  const textoPrincipal = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const bgTarjeta = temaOscuro ? 'bg-[#0a141d] border-gray-800' : 'bg-white border-gray-200';

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const { data: perfiles, error: errPerfiles } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (errPerfiles) throw errPerfiles;

      const { data: centrosData, error: errCentros } = await supabase
        .from('centros')
        .select('*')
        .order('created_at', { ascending: false });
      if (errCentros) throw errCentros;

      setCentros(centrosData || []);

      const pendientes = perfiles.filter(p => p.estado === 'pendiente');
      const activos = perfiles.filter(p => p.estado === 'aprobado');

      setSolicitudes(pendientes);
      setUsuarios(activos);

      const total = perfiles.length;
      const pendientesCount = pendientes.length;
      const estudiantes = activos.filter(p => p.rol === 2).length;
      const licenciados = activos.filter(p => p.rol === 3).length;

      setEstadisticas({ total, pendientes: pendientesCount, estudiantes, licenciados });
    } catch (error) {
      console.error(error);
      alert('Error al cargar datos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ========== GESTIÓN DE CENTROS ==========
  const crearCentro = async () => {
    if (!nuevoCentro.id || !nuevoCentro.nombre) {
      alert('Código y nombre del centro son obligatorios.');
      return;
    }
    setGuardandoCentro(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('centros')
        .insert([{
          id: nuevoCentro.id.toUpperCase().trim(),
          nombre: nuevoCentro.nombre.trim(),
          direccion: nuevoCentro.direccion || null,
          telefono: nuevoCentro.telefono || null,
          created_by: user?.id || null
        }]);
      if (error) throw error;
      alert('✅ Centro creado correctamente.');
      setNuevoCentro({ id: '', nombre: '', direccion: '', telefono: '' });
      cargarDatos();
    } catch (error) {
      alert('Error al crear centro: ' + error.message);
    } finally {
      setGuardandoCentro(false);
    }
  };

  const eliminarCentro = async (centroId) => {
    if (!confirm('¿Seguro que quieres eliminar este centro? Los usuarios asociados perderán su centro.')) return;
    try {
      await supabase.from('profiles').update({ centro_id: null }).eq('centro_id', centroId);
      await supabase.from('pacientes').update({ centro_id: null }).eq('centro_id', centroId);
      const { error } = await supabase.from('centros').delete().eq('id', centroId);
      if (error) throw error;
      alert('✅ Centro eliminado correctamente.');
      cargarDatos();
    } catch (error) {
      alert('Error al eliminar centro: ' + error.message);
    }
  };

  // ========== SUBIR LOGO DEL CENTRO ==========
  const subirLogo = async (centroId, file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecciona una imagen (PNG, JPG, etc.)');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('La imagen no debe superar los 2MB');
      return;
    }

    setSubiendoLogo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${centroId}_logo.${fileExt}`;
      const filePath = `logos_centros/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('logos_centros')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('logos_centros')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('centros')
        .update({ logo_url: publicUrl })
        .eq('id', centroId);

      if (updateError) throw updateError;

      alert('✅ Logo actualizado correctamente.');
      cargarDatos();
    } catch (err) {
      console.error(err);
      alert('Error al subir el logo: ' + err.message);
    } finally {
      setSubiendoLogo(false);
    }
  };

  const aprobarUsuario = async (userId, nuevoRol, centroId) => {
    if (!nuevoRol) {
      alert('Selecciona un rol para aprobar.');
      return;
    }
    try {
      const updateData = { estado: 'aprobado', rol: parseInt(nuevoRol) };
      if (centroId) {
        updateData.centro_id = centroId;
      }
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId);

      if (error) throw error;
      alert('✅ Usuario aprobado correctamente.');
      cargarDatos();
    } catch (error) {
      alert('Error al aprobar: ' + error.message);
    }
  };

  const cambiarRol = async (userId, nuevoRol, centroId) => {
    if (!nuevoRol) return;
    try {
      const updateData = { rol: parseInt(nuevoRol) };
      if (centroId) {
        updateData.centro_id = centroId;
      }
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
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
      const { error: errProf } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      if (errProf) throw errProf;
      alert('✅ Usuario eliminado correctamente.');
      cargarDatos();
    } catch (error) {
      alert('Error al eliminar: ' + error.message);
    }
  };

  const ROLES = [
    { valor: 1, label: 'Director' },
    { valor: 2, label: 'Estudiante' },
    { valor: 3, label: 'Licenciado' },
    { valor: 4, label: 'Híbrido' },
    { valor: 5, label: 'Paciente' },
    { valor: 6, label: 'Demo' },
    { valor: 7, label: 'Admin Centro' },
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
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
          <div className={`${bgTarjeta} p-4 rounded-2xl border text-center cursor-pointer hover:border-[#22d3ee] transition-all`} onClick={() => setMostrarCentros(!mostrarCentros)}>
            <p className="text-3xl font-black text-purple-400">{centros.length}</p>
            <p className="text-xs font-bold uppercase text-gray-400">Centros</p>
          </div>
        </div>

        {/* Sección de Gestión de Centros (toggle) */}
        {mostrarCentros && (
          <div className={`${bgTarjeta} p-6 rounded-2xl border mb-8`}>
            <h2 className={`text-xl font-bold ${textoPrincipal} mb-4`}>📋 Gestión de Centros</h2>

            {/* Formulario para crear centro */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <input
                type="text"
                placeholder="Código (ej. CAKJ)"
                value={nuevoCentro.id}
                onChange={(e) => setNuevoCentro({...nuevoCentro, id: e.target.value.toUpperCase()})}
                className={`px-4 py-2 rounded-xl border ${temaOscuro ? 'bg-black/20 border-gray-700 text-white' : 'bg-gray-100 border-gray-300'} text-sm outline-none focus:border-[#22d3ee]`}
              />
              <input
                type="text"
                placeholder="Nombre del centro"
                value={nuevoCentro.nombre}
                onChange={(e) => setNuevoCentro({...nuevoCentro, nombre: e.target.value})}
                className={`px-4 py-2 rounded-xl border ${temaOscuro ? 'bg-black/20 border-gray-700 text-white' : 'bg-gray-100 border-gray-300'} text-sm outline-none focus:border-[#22d3ee]`}
              />
              <input
                type="text"
                placeholder="Dirección (opcional)"
                value={nuevoCentro.direccion}
                onChange={(e) => setNuevoCentro({...nuevoCentro, direccion: e.target.value})}
                className={`px-4 py-2 rounded-xl border ${temaOscuro ? 'bg-black/20 border-gray-700 text-white' : 'bg-gray-100 border-gray-300'} text-sm outline-none focus:border-[#22d3ee]`}
              />
              <input
                type="text"
                placeholder="Teléfono (opcional)"
                value={nuevoCentro.telefono}
                onChange={(e) => setNuevoCentro({...nuevoCentro, telefono: e.target.value})}
                className={`px-4 py-2 rounded-xl border ${temaOscuro ? 'bg-black/20 border-gray-700 text-white' : 'bg-gray-100 border-gray-300'} text-sm outline-none focus:border-[#22d3ee]`}
              />
              <button
                onClick={crearCentro}
                disabled={guardandoCentro}
                className="md:col-span-4 px-6 py-2 bg-[#22d3ee] text-black font-bold rounded-xl text-sm hover:scale-105 transition-all disabled:opacity-50"
              >
                {guardandoCentro ? 'Creando...' : '➕ Crear Centro'}
              </button>
            </div>

            {/* Lista de centros con opción de subir logo */}
            {centros.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No hay centros creados.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className={`${temaOscuro ? 'bg-[#0f1a24]' : 'bg-gray-100'} border-b border-gray-700`}>
                    <tr>
                      <th className="px-4 py-2 text-left font-bold text-xs uppercase text-gray-400">Código</th>
                      <th className="px-4 py-2 text-left font-bold text-xs uppercase text-gray-400">Nombre</th>
                      <th className="px-4 py-2 text-left font-bold text-xs uppercase text-gray-400">Logo</th>
                      <th className="px-4 py-2 text-center font-bold text-xs uppercase text-gray-400">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {centros.map(c => (
                      <tr key={c.id} className={`border-b border-gray-700 hover:bg-[#22d3ee]/5 transition-colors`}>
                        <td className="px-4 py-2 font-mono font-bold">{c.id}</td>
                        <td className="px-4 py-2">{c.nombre}</td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            {c.logo_url ? (
                              <img src={c.logo_url} alt="Logo" className="h-8 w-auto object-contain" />
                            ) : (
                              <span className="text-xs text-gray-400">Sin logo</span>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) subirLogo(c.id, file);
                              }}
                              disabled={subiendoLogo}
                              className="text-xs text-gray-400 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#22d3ee] file:text-black hover:file:opacity-80"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button
                            onClick={() => eliminarCentro(c.id)}
                            className="px-3 py-1 bg-red-500/20 text-red-400 font-bold rounded-lg text-xs hover:bg-red-500 hover:text-white transition-all"
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
          </div>
        )}

        {/* Resto del panel (solicitudes y usuarios activos) */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#22d3ee] border-t-transparent"></div>
          </div>
        ) : (
          <>
            {/* Solicitudes pendientes con selección de centro */}
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
                      <th className="px-4 py-3 text-left font-bold text-xs uppercase text-gray-400">Rol deseado</th>
                      <th className="px-4 py-3 text-left font-bold text-xs uppercase text-gray-400">Asignar centro</th>
                      <th className="px-4 py-3 text-center font-bold text-xs uppercase text-gray-400">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {solicitudes.map((u) => (
                      <tr key={u.id} className={`border-b border-gray-700 hover:bg-[#22d3ee]/5 transition-colors`}>
                        <td className="px-4 py-3 font-medium">{u.nombre_completo || 'Sin nombre'}</td>
                        <td className="px-4 py-3">{u.email}</td>
                        <td className="px-4 py-3 text-xs">{getRolLabel(u.rol)}</td>
                        <td className="px-4 py-3">
                          <select
                            className={`px-2 py-1 rounded-lg border ${temaOscuro ? 'bg-black/20 border-gray-700 text-white' : 'bg-gray-100 border-gray-300'} text-xs w-full max-w-[150px]`}
                            defaultValue={u.centro_id || ''}
                            id={`centro-${u.id}`}
                          >
                            <option value="">Sin centro</option>
                            {centros.map(c => (
                              <option key={c.id} value={c.id}>{c.id} - {c.nombre}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <select
                            className={`px-2 py-1 rounded-lg border ${temaOscuro ? 'bg-black/20 border-gray-700 text-white' : 'bg-gray-100 border-gray-300'} text-xs`}
                            defaultValue={u.rol || 2}
                            id={`rol-${u.id}`}
                          >
                            {ROLES.map(r => (
                              <option key={r.valor} value={r.valor}>{r.label}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => {
                              const rolSelect = document.getElementById(`rol-${u.id}`);
                              const centroSelect = document.getElementById(`centro-${u.id}`);
                              const nuevoRol = rolSelect ? rolSelect.value : 2;
                              const centroId = centroSelect ? centroSelect.value : null;
                              aprobarUsuario(u.id, nuevoRol, centroId);
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

            {/* Usuarios activos con centro */}
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
                      <th className="px-4 py-3 text-left font-bold text-xs uppercase text-gray-400">Centro</th>
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
                        <td className="px-4 py-3 text-xs font-mono">{u.centro_id || '—'}</td>
                        <td className="px-4 py-3 text-xs">{getRolLabel(u.rol)}</td>
                        <td className="px-4 py-3">
                          <select
                            className={`px-2 py-1 rounded-lg border ${temaOscuro ? 'bg-black/20 border-gray-700 text-white' : 'bg-gray-100 border-gray-300'} text-xs`}
                            defaultValue={u.rol}
                            id={`change-rol-${u.id}`}
                          >
                            {ROLES.map(r => (
                              <option key={r.valor} value={r.valor}>{r.label}</option>
                            ))}
                          </select>
                          <select
                            className={`px-2 py-1 rounded-lg border ${temaOscuro ? 'bg-black/20 border-gray-700 text-white' : 'bg-gray-100 border-gray-300'} text-xs ml-1`}
                            defaultValue={u.centro_id || ''}
                            id={`change-centro-${u.id}`}
                          >
                            <option value="">Sin centro</option>
                            {centros.map(c => (
                              <option key={c.id} value={c.id}>{c.id}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => {
                              const rolSelect = document.getElementById(`change-rol-${u.id}`);
                              const centroSelect = document.getElementById(`change-centro-${u.id}`);
                              const nuevoRol = rolSelect ? rolSelect.value : u.rol;
                              const centroId = centroSelect ? centroSelect.value : null;
                              cambiarRol(u.id, nuevoRol, centroId);
                            }}
                            className="px-3 py-1 bg-blue-500/20 text-blue-400 font-bold rounded-lg text-xs hover:bg-blue-500 hover:text-white transition-all"
                          >
                            Cambiar
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