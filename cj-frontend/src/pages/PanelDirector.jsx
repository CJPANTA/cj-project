import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function PanelDirector({ temaOscuro }) {
  const [solicitudes, setSolicitudes] = useState([]);
  const [usuariosActivos, setUsuariosActivos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);
  const [estadisticas, setEstadisticas] = useState({});
  const ITEMS_POR_PAGINA = 10;

  const LOGO_URL = "https://raw.githubusercontent.com/CJPANTA/cj-project/main/logo_cj.jpeg";

  useEffect(() => {
    cargarDatos();
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    const { data, error } = await supabase.from('profiles').select('rol, estado');
    if (!error && data) {
      const total = data.length;
      const porRol = data.reduce((acc, p) => {
        acc[p.rol] = (acc[p.rol] || 0) + 1;
        return acc;
      }, {});
      const pendientes = data.filter(p => p.estado === 'pendiente').length;
      setEstadisticas({ total, porRol, pendientes });
    }
  };

  const cargarDatos = async () => {
    setCargando(true);
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      const pendientes = data.filter(p => p.estado === 'pendiente');
      const activos = data.filter(p => p.estado === 'aprobado');
      setSolicitudes(pendientes);
      setUsuariosActivos(activos);
    }
    setCargando(false);
  };

  const aprobarUsuario = async (id, rolAsignado) => {
    const { error } = await supabase.from('profiles').update({ estado: 'aprobado', rol: rolAsignado }).eq('id', id);
    if (!error) {
      cargarDatos();
      cargarEstadisticas();
    } else alert('Error al aprobar: ' + error.message);
  };

  const cambiarRol = async (id, nuevoRol) => {
    const { error } = await supabase.from('profiles').update({ rol: nuevoRol }).eq('id', id);
    if (!error) cargarDatos();
    else alert('Error al cambiar rol: ' + error.message);
  };

  const eliminarUsuario = async (id) => {
    if (confirm('¿Eliminar este usuario? No se podrá recuperar.')) {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (!error) cargarDatos();
      else alert('Error: ' + error.message);
    }
  };

  const filtrar = (lista) => {
    if (!busqueda) return lista;
    return lista.filter(u => u.nombre_completo?.toLowerCase().includes(busqueda.toLowerCase()) || u.email?.toLowerCase().includes(busqueda.toLowerCase()));
  };

  const paginar = (lista) => {
    const inicio = (pagina - 1) * ITEMS_POR_PAGINA;
    return lista.slice(inicio, inicio + ITEMS_POR_PAGINA);
  };

  const bgCard = temaOscuro ? 'bg-[#0a141d] border-gray-800' : 'bg-white border-gray-200 shadow-sm';
  const textoColor = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const subTexto = temaOscuro ? 'text-gray-400' : 'text-gray-600';
  const bordeColor = temaOscuro ? 'border-gray-800' : 'border-gray-200';

  const solicitudesFiltradas = filtrar(solicitudes);
  const activosFiltrados = filtrar(usuariosActivos);
  const totalPaginasSol = Math.ceil(solicitudesFiltradas.length / ITEMS_POR_PAGINA);
  const totalPaginasAct = Math.ceil(activosFiltrados.length / ITEMS_POR_PAGINA);

  if (cargando) return <div className="p-8 text-center text-gray-400">Cargando panel...</div>;

  return (
    <main className="p-4 md:p-8 max-w-7xl mx-auto w-full">
      <div className="flex items-center gap-4 mb-6">
        <img src={LOGO_URL} alt="Proyecto CJ" className="h-12 w-auto object-contain" />
        <h1 className={`text-3xl font-black ${textoColor}`}>Panel del Director</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className={`${bgCard} p-4 rounded-2xl text-center border`}>
          <div className="text-2xl font-black text-[#22d3ee]">{estadisticas.total || 0}</div>
          <div className={`text-xs uppercase ${subTexto}`}>Total usuarios</div>
        </div>
        <div className={`${bgCard} p-4 rounded-2xl text-center border`}>
          <div className="text-2xl font-black text-yellow-500">{estadisticas.pendientes || 0}</div>
          <div className={`text-xs uppercase ${subTexto}`}>Pendientes</div>
        </div>
        <div className={`${bgCard} p-4 rounded-2xl text-center border`}>
          <div className="text-2xl font-black text-green-500">{estadisticas.porRol?.[2] || 0}</div>
          <div className={`text-xs uppercase ${subTexto}`}>Estudiantes</div>
        </div>
        <div className={`${bgCard} p-4 rounded-2xl text-center border`}>
          <div className="text-2xl font-black text-blue-500">{estadisticas.porRol?.[3] || 0}</div>
          <div className={`text-xs uppercase ${subTexto}`}>Licenciados</div>
        </div>
      </div>

      <div className="mb-6">
        <input type="text" placeholder="Buscar por nombre o email..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className={`w-full p-3 rounded-xl border ${bgCard} ${textoColor} focus:outline-none focus:border-[#22d3ee]`} />
      </div>

      <section className={`${bgCard} p-5 rounded-2xl border mb-8`}>
        <h2 className={`text-xl font-bold mb-4 ${textoColor}`}>📋 Solicitudes pendientes ({solicitudesFiltradas.length})</h2>
        {solicitudesFiltradas.length === 0 ? <p className={subTexto}>No hay solicitudes pendientes.</p> : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className={`text-left border-b ${bordeColor}`}>
                  <tr><th>Nombre</th><th>Email</th><th>Teléfono</th><th>Rol deseado</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                  {paginar(solicitudesFiltradas).map(sol => (
                    <tr key={sol.id} className={`border-b ${bordeColor}`}>
                      <td className="py-2">{sol.nombre_completo}</td>
                      <td className="py-2">{sol.email}</td>
                      <td className="py-2">{sol.telefono || '—'}</td>
                      <td className="py-2">{sol.rol === 2 && 'Estudiante'}{sol.rol === 3 && 'Licenciado'}{sol.rol === 4 && 'Híbrido'}{sol.rol === 5 && 'Paciente'}</td>
                      <td className="py-2 flex gap-2 flex-wrap">
                        <button onClick={() => aprobarUsuario(sol.id, 2)} className="bg-green-600 text-white px-3 py-1 rounded-xl text-[10px] font-black">Estudiante</button>
                        <button onClick={() => aprobarUsuario(sol.id, 3)} className="bg-blue-600 text-white px-3 py-1 rounded-xl text-[10px] font-black">Licenciado</button>
                        <button onClick={() => aprobarUsuario(sol.id, 4)} className="bg-purple-600 text-white px-3 py-1 rounded-xl text-[10px] font-black">Híbrido</button>
                        <button onClick={() => aprobarUsuario(sol.id, 5)} className="bg-gray-600 text-white px-3 py-1 rounded-xl text-[10px] font-black">Paciente</button>
                        <button onClick={() => eliminarUsuario(sol.id)} className="bg-red-800 text-white px-3 py-1 rounded-xl text-[10px] font-black">Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPaginasSol > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <button onClick={() => setPagina(p => Math.max(1, p-1))} disabled={pagina===1} className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50">Anterior</button>
                <span className="px-3 py-1">Pág. {pagina} de {totalPaginasSol}</span>
                <button onClick={() => setPagina(p => Math.min(totalPaginasSol, p+1))} disabled={pagina===totalPaginasSol} className="px-3 py-1 bg-gray-700 rounded">Siguiente</button>
              </div>
            )}
          </>
        )}
      </section>

      <section className={`${bgCard} p-5 rounded-2xl border`}>
        <h2 className={`text-xl font-bold mb-4 ${textoColor}`}>✅ Usuarios activos ({activosFiltrados.length})</h2>
        {activosFiltrados.length === 0 ? <p className={subTexto}>No hay usuarios activos.</p> : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className={`text-left border-b ${bordeColor}`}>
                  <tr><th>Nombre</th><th>Email</th><th>Rol actual</th><th>Nuevo rol</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                  {paginar(activosFiltrados).map(user => (
                    <tr key={user.id} className={`border-b ${bordeColor}`}>
                      <td className="py-2">{user.nombre_completo}</td>
                      <td className="py-2">{user.email}</td>
                      <td className="py-2">{user.rol === 1 && 'Director'}{user.rol === 2 && 'Estudiante'}{user.rol === 3 && 'Licenciado'}{user.rol === 4 && 'Híbrido'}{user.rol === 5 && 'Paciente'}</td>
                      <td className="py-2">
                        <select
                          onChange={(e) => cambiarRol(user.id, Number(e.target.value))}
                          className={`border rounded-lg p-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#22d3ee] ${
                            temaOscuro 
                              ? 'bg-[#1e293b] text-white border-gray-600' 
                              : 'bg-white text-gray-900 border-gray-400'
                          }`}
                          style={{ color: temaOscuro ? 'white' : 'black' }}
                        >
                          <option value="" disabled>Cambiar a...</option>
                          <option value={2}>📘 Estudiante</option>
                          <option value={3}>🩺 Licenciado</option>
                          <option value={4}>🤝 Híbrido</option>
                          <option value={5}>❤️ Paciente</option>
                        </select>
                      </td>
                      <td className="py-2 flex gap-2">
                        <button onClick={() => cambiarRol(user.id, 1)} className="text-yellow-500 text-xs underline">👑 Hacer Director</button>
                        <button onClick={() => eliminarUsuario(user.id)} className="text-red-500 text-xs underline">Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPaginasAct > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <button onClick={() => setPagina(p => Math.max(1, p-1))} disabled={pagina===1} className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50">Anterior</button>
                <span className="px-3 py-1">Pág. {pagina} de {totalPaginasAct}</span>
                <button onClick={() => setPagina(p => Math.min(totalPaginasAct, p+1))} disabled={pagina===totalPaginasAct} className="px-3 py-1 bg-gray-700 rounded">Siguiente</button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}