import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function PanelDirector({ temaOscuro }) {
  const [usuarios, setUsuarios] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [evaluacionesPendientes, setEvaluacionesPendientes] = useState([]);
  const [centros, setCentros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [estadisticas, setEstadisticas] = useState({ total: 0, pendientes: 0, estudiantes: 0, licenciados: 0 });
  const [mostrarCentros, setMostrarCentros] = useState(false);
  const [nuevoCentro, setNuevoCentro] = useState({ id: '', nombre: '', direccion: '', telefono: '', tipo_centro: 'gimnasio_terapeutico' });
  const [guardandoCentro, setGuardandoCentro] = useState(false);
  const [esDirectorGlobal, setEsDirectorGlobal] = useState(false);
  const [centroDirector, setCentroDirector] = useState(null);
  const [pestana, setPestana] = useState('usuarios');

  const [modalEditar, setModalEditar] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [formEditar, setFormEditar] = useState({
    nombre_completo: '', email: '', telefono: '', rol: 2, tipo_profesional: '',
    tipo_documento: 'DNI', dni: '', numero_colegiatura: '', registro_interno: '',
    direccion_centro: '', centro_id: '', estado: 'aprobado',
  });
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);

  // ===== ESTILOS DINÁMICOS (CORREGIDOS) =====
  const bgPrincipal = temaOscuro ? 'bg-[#0a141d]' : 'bg-[#e2e8f0]';
  const textoPrincipal = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const textoSecundario = temaOscuro ? 'text-gray-400' : 'text-gray-600';
  const textoSuave = temaOscuro ? 'text-gray-500' : 'text-gray-500';
  const bgTarjeta = temaOscuro ? 'bg-[#0a141d] border-gray-800' : 'bg-white border-gray-300';
  const bgInput = temaOscuro ? 'bg-black/20 border-gray-700 text-white' : 'bg-white border-gray-300 text-[#0f172a]';
  const bgTablaHead = temaOscuro ? 'bg-[#0f1a24]' : 'bg-gray-100';
  const bordeFila = temaOscuro ? 'border-gray-700' : 'border-gray-200';
  const hoverFila = temaOscuro ? 'hover:bg-[#22d3ee]/5' : 'hover:bg-[#22d3ee]/10';
  const bgModal = temaOscuro ? 'bg-[#0a141d] border-gray-800' : 'bg-white border-gray-300';
  const bordeTab = temaOscuro ? 'border-gray-700' : 'border-gray-300';

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No hay usuario logueado');

      const { data: perfil, error: errPerfil } = await supabase
        .from('profiles').select('rol, centro_id').eq('id', user.id).single();
      if (errPerfil) throw errPerfil;

      const esGlobal = perfil.rol === 1;
      setEsDirectorGlobal(esGlobal);
      setCentroDirector(perfil.centro_id);

      if (esGlobal) {
        const { data: centrosData } = await supabase
          .from('centros').select('*').order('created_at', { ascending: false });
        setCentros(centrosData || []);
      }

      let query = supabase.from('profiles').select('*');
      if (!esGlobal && perfil.centro_id) query = query.eq('centro_id', perfil.centro_id);
      const { data: perfiles, error: errPerfiles } = await query.order('created_at', { ascending: false });
      if (errPerfiles) throw errPerfiles;

      const pendientes = perfiles.filter(p => p.estado === 'pendiente');
      const activos = perfiles.filter(p => p.estado === 'aprobado');
      setSolicitudes(pendientes);
      setUsuarios(activos);

      setEstadisticas({
        total: perfiles.length,
        pendientes: pendientes.length,
        estudiantes: activos.filter(p => p.rol === 2).length,
        licenciados: activos.filter(p => p.rol === 3 || p.rol === 4 || p.rol === 7).length,
      });

      let evalQuery = supabase
        .from('evaluaciones')
        .select('*, pacientes(nombre, apellidos), profiles(nombre_completo)')
        .eq('estado', 'pendiente');
      if (!esGlobal && perfil.centro_id) evalQuery = evalQuery.eq('centro_id', perfil.centro_id);
      const { data: evaluaciones } = await evalQuery.order('created_at', { ascending: false });
      setEvaluacionesPendientes(evaluaciones || []);
    } catch (error) {
      console.error(error);
      alert('Error al cargar datos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const crearCentro = async () => {
    if (!nuevoCentro.id || !nuevoCentro.nombre) { alert('Código y nombre son obligatorios.'); return; }
    setGuardandoCentro(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const logoUrl = `https://raw.githubusercontent.com/CJPANTA/cj-project/main/frontend/public/logo_centros/${nuevoCentro.id.toUpperCase()}.png`;
      const { error } = await supabase.from('centros').insert([{
        id: nuevoCentro.id.toUpperCase().trim(),
        nombre: nuevoCentro.nombre.trim(),
        direccion: nuevoCentro.direccion || null,
        telefono: nuevoCentro.telefono || null,
        tipo_centro: nuevoCentro.tipo_centro || 'gimnasio_terapeutico',
        logo_url: logoUrl,
        created_by: user?.id || null
      }]);
      if (error) throw error;
      alert('✅ Centro creado correctamente.');
      setNuevoCentro({ id: '', nombre: '', direccion: '', telefono: '', tipo_centro: 'gimnasio_terapeutico' });
      cargarDatos();
    } catch (error) {
      alert('Error al crear centro: ' + error.message);
    } finally {
      setGuardandoCentro(false);
    }
  };

  const eliminarCentro = async (centroId) => {
    if (!confirm('¿Seguro que quieres eliminar este centro?')) return;
    try {
      await supabase.from('profiles').update({ centro_id: null }).eq('centro_id', centroId);
      await supabase.from('pacientes').update({ centro_id: null }).eq('centro_id', centroId);
      const { error } = await supabase.from('centros').delete().eq('id', centroId);
      if (error) throw error;
      alert('✅ Centro eliminado.');
      cargarDatos();
    } catch (error) {
      alert('Error al eliminar centro: ' + error.message);
    }
  };

  const cambiarTipoCentro = async (centroId, nuevoTipo) => {
    try {
      const { error } = await supabase.from('centros').update({ tipo_centro: nuevoTipo }).eq('id', centroId);
      if (error) throw error;
      cargarDatos();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const aprobarUsuario = async (userId, nuevoRol, centroId) => {
    if (!nuevoRol) { alert('Selecciona un rol.'); return; }
    try {
      const updateData = { estado: 'aprobado', rol: parseInt(nuevoRol) };
      if (centroId) updateData.centro_id = centroId;
      const tipoMap = { 1: 'director', 2: 'estudiante', 3: 'licenciado', 4: 'licenciado', 5: 'paciente', 6: 'demo', 7: 'licenciado' };
      updateData.tipo_profesional = tipoMap[parseInt(nuevoRol)] || null;
      const { error } = await supabase.from('profiles').update(updateData).eq('id', userId);
      if (error) throw error;
      alert('✅ Usuario aprobado.');
      cargarDatos();
    } catch (error) {
      alert('Error al aprobar: ' + error.message);
    }
  };

  const eliminarUsuario = async (userId) => {
    if (!confirm('¿Eliminar usuario?')) return;
    try {
      await supabase.from('profiles').delete().eq('id', userId);
      alert('✅ Usuario eliminado.');
      cargarDatos();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const abrirModalEditar = (usuario) => {
    setUsuarioEditando(usuario);
    setFormEditar({
      nombre_completo: usuario.nombre_completo || '',
      email: usuario.email || '',
      telefono: usuario.telefono || '',
      rol: usuario.rol || 2,
      tipo_profesional: usuario.tipo_profesional || '',
      tipo_documento: usuario.tipo_documento || 'DNI',
      dni: usuario.dni || '',
      numero_colegiatura: usuario.numero_colegiatura || '',
      registro_interno: usuario.registro_interno || '',
      direccion_centro: usuario.direccion_centro || '',
      centro_id: usuario.centro_id || '',
      estado: usuario.estado || 'aprobado',
    });
    setModalEditar(true);
  };

  const guardarEdicion = async () => {
    if (!usuarioEditando) return;
    setGuardandoEdicion(true);
    try {
      const { error } = await supabase.from('profiles').update({
        nombre_completo: formEditar.nombre_completo,
        telefono: formEditar.telefono || null,
        rol: parseInt(formEditar.rol),
        tipo_profesional: formEditar.tipo_profesional || null,
        tipo_documento: formEditar.tipo_documento,
        dni: formEditar.dni || null,
        numero_colegiatura: formEditar.numero_colegiatura || null,
        registro_interno: formEditar.registro_interno || null,
        direccion_centro: formEditar.direccion_centro || null,
        centro_id: formEditar.centro_id || null,
        estado: formEditar.estado,
      }).eq('id', usuarioEditando.id);
      if (error) throw error;
      alert('✅ Datos actualizados.');
      setModalEditar(false);
      setUsuarioEditando(null);
      cargarDatos();
    } catch (error) {
      alert('Error al guardar: ' + error.message);
    } finally {
      setGuardandoEdicion(false);
    }
  };

  const aprobarEvaluacion = async (evalId) => {
    try {
      const { error } = await supabase.from('evaluaciones')
        .update({ estado: 'aprobado', comentario_rechazo: null }).eq('id', evalId);
      if (error) throw error;
      alert('✅ Evaluación aprobada.');
      cargarDatos();
    } catch (error) { alert('Error: ' + error.message); }
  };

  const rechazarEvaluacion = async (evalId) => {
    const motivo = prompt('Motivo del rechazo (opcional):');
    try {
      const { error } = await supabase.from('evaluaciones')
        .update({ estado: 'rechazado', comentario_rechazo: motivo || '' }).eq('id', evalId);
      if (error) throw error;
      alert('✅ Evaluación rechazada.');
      cargarDatos();
    } catch (error) { alert('Error: ' + error.message); }
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

  const TIPOS_PROFESIONALES = [
    { valor: 'director', label: 'Director', color: 'text-yellow-400 bg-yellow-500/20' },
    { valor: 'estudiante', label: 'Estudiante', color: 'text-blue-400 bg-blue-500/20' },
    { valor: 'licenciado', label: 'Licenciado', color: 'text-emerald-400 bg-emerald-500/20' },
    { valor: 'tecnico', label: 'Técnico', color: 'text-purple-400 bg-purple-500/20' },
    { valor: 'paciente', label: 'Paciente', color: 'text-gray-500 bg-gray-500/20' },
    { valor: 'demo', label: 'Demo', color: 'text-gray-500 bg-gray-500/20' },
  ];

  const getRolLabel = (rol) => ROLES.find(r => r.valor === rol)?.label || 'Desconocido';

  const getTipoProfesionalBadge = (tipo) => {
    const found = TIPOS_PROFESIONALES.find(t => t.valor === tipo);
    if (!found) return <span className={`text-[10px] ${textoSuave} italic`}>Sin definir</span>;
    return (
      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${found.color}`}>
        {found.label}
      </span>
    );
  };

  return (
    <div className={`min-h-screen ${bgPrincipal} p-4 md:p-8 transition-colors duration-500`}>
      <div className="max-w-7xl mx-auto">
        <h1 className={`text-3xl font-black tracking-tight ${textoPrincipal} mb-6`}>
          {esDirectorGlobal ? 'Panel del Director Global' : 'Panel de Administración del Centro'}
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className={`${bgTarjeta} p-4 rounded-2xl border text-center`}>
            <p className="text-3xl font-black text-[#22d3ee]">{estadisticas.total}</p>
            <p className={`text-xs font-bold uppercase ${textoSecundario}`}>Total Usuarios</p>
          </div>
          <div className={`${bgTarjeta} p-4 rounded-2xl border text-center`}>
            <p className="text-3xl font-black text-yellow-500">{estadisticas.pendientes}</p>
            <p className={`text-xs font-bold uppercase ${textoSecundario}`}>Pendientes</p>
          </div>
          <div className={`${bgTarjeta} p-4 rounded-2xl border text-center`}>
            <p className="text-3xl font-black text-blue-500">{estadisticas.estudiantes}</p>
            <p className={`text-xs font-bold uppercase ${textoSecundario}`}>Estudiantes</p>
          </div>
          <div className={`${bgTarjeta} p-4 rounded-2xl border text-center`}>
            <p className="text-3xl font-black text-emerald-500">{estadisticas.licenciados}</p>
            <p className={`text-xs font-bold uppercase ${textoSecundario}`}>Licenciados</p>
          </div>
          {esDirectorGlobal && (
            <div className={`${bgTarjeta} p-4 rounded-2xl border text-center cursor-pointer hover:border-[#22d3ee] transition-all`} onClick={() => setMostrarCentros(!mostrarCentros)}>
              <p className="text-3xl font-black text-purple-500">{centros.length}</p>
              <p className={`text-xs font-bold uppercase ${textoSecundario}`}>Centros</p>
            </div>
          )}
        </div>

        <div className={`flex border-b ${bordeTab} mb-6`}>
          <button onClick={() => setPestana('usuarios')} className={`px-4 py-2 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${pestana === 'usuarios' ? 'border-[#22d3ee] text-[#22d3ee]' : `border-transparent ${textoSecundario} hover:text-[#22d3ee]`}`}>👥 Usuarios</button>
          <button onClick={() => setPestana('evaluaciones')} className={`px-4 py-2 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${pestana === 'evaluaciones' ? 'border-[#22d3ee] text-[#22d3ee]' : `border-transparent ${textoSecundario} hover:text-[#22d3ee]`}`}>📋 Evaluaciones Pendientes ({evaluacionesPendientes.length})</button>
        </div>

        {esDirectorGlobal && mostrarCentros && (
          <div className={`${bgTarjeta} p-6 rounded-2xl border mb-8`}>
            <h2 className={`text-xl font-bold ${textoPrincipal} mb-4`}>📋 Gestión de Centros</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <input type="text" placeholder="Código (ej. CAKJ)" value={nuevoCentro.id} onChange={(e) => setNuevoCentro({...nuevoCentro, id: e.target.value.toUpperCase()})} className={`px-4 py-2 rounded-xl border ${bgInput} text-sm outline-none focus:border-[#22d3ee]`} />
              <input type="text" placeholder="Nombre del centro" value={nuevoCentro.nombre} onChange={(e) => setNuevoCentro({...nuevoCentro, nombre: e.target.value})} className={`px-4 py-2 rounded-xl border ${bgInput} text-sm`} />
              <input type="text" placeholder="Dirección" value={nuevoCentro.direccion} onChange={(e) => setNuevoCentro({...nuevoCentro, direccion: e.target.value})} className={`px-4 py-2 rounded-xl border ${bgInput} text-sm`} />
              <input type="text" placeholder="Teléfono" value={nuevoCentro.telefono} onChange={(e) => setNuevoCentro({...nuevoCentro, telefono: e.target.value})} className={`px-4 py-2 rounded-xl border ${bgInput} text-sm`} />
              <select value={nuevoCentro.tipo_centro} onChange={(e) => setNuevoCentro({...nuevoCentro, tipo_centro: e.target.value})} className={`px-4 py-2 rounded-xl border ${bgInput} text-sm cursor-pointer`}>
                <option value="gimnasio_terapeutico">🏋️ Gimnasio Terapéutico</option>
                <option value="centro_fisioterapeutico">🏥 Centro Fisioterapéutico</option>
              </select>
              <button onClick={crearCentro} disabled={guardandoCentro} className="md:col-span-5 px-6 py-2 bg-[#22d3ee] text-black font-bold rounded-xl text-sm hover:scale-105 disabled:opacity-50">{guardandoCentro ? 'Creando...' : '➕ Crear Centro'}</button>
            </div>
            {centros.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className={`${bgTablaHead} border-b ${bordeFila}`}>
                    <tr>
                      <th className={`px-4 py-2 text-left font-bold text-xs uppercase ${textoSecundario}`}>Código</th>
                      <th className={`px-4 py-2 text-left font-bold text-xs uppercase ${textoSecundario}`}>Nombre</th>
                      <th className={`px-4 py-2 text-left font-bold text-xs uppercase ${textoSecundario}`}>Tipo de Centro</th>
                      <th className={`px-4 py-2 text-center font-bold text-xs uppercase ${textoSecundario}`}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {centros.map(c => (
                      <tr key={c.id} className={`border-b ${bordeFila} ${hoverFila}`}>
                        <td className={`px-4 py-2 font-mono font-bold ${textoPrincipal}`}>{c.id}</td>
                        <td className={`px-4 py-2 ${textoPrincipal}`}>{c.nombre}</td>
                        <td className="px-4 py-2">
                          <select value={c.tipo_centro || 'gimnasio_terapeutico'} onChange={(e) => cambiarTipoCentro(c.id, e.target.value)} className={`px-2 py-1 rounded-lg border ${bgInput} text-xs`}>
                            <option value="gimnasio_terapeutico">🏋️ Gimnasio Terapéutico</option>
                            <option value="centro_fisioterapeutico">🏥 Centro Fisioterapéutico</option>
                          </select>
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button onClick={() => eliminarCentro(c.id)} className="px-3 py-1 bg-red-500/20 text-red-500 font-bold rounded-lg text-xs hover:bg-red-500 hover:text-white">Eliminar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-4 border-[#22d3ee] border-t-transparent"></div></div>
        ) : (
          <>
            {pestana === 'usuarios' && (
              <>
                <h2 className={`text-xl font-bold ${textoPrincipal} mb-4`}>Solicitudes pendientes ({solicitudes.length})</h2>
                {solicitudes.length === 0 ? (
                  <p className={`${textoSecundario} mb-6`}>No hay solicitudes pendientes.</p>
                ) : (
                  <div className={`overflow-x-auto rounded-2xl border ${bordeFila} shadow-sm mb-8`}>
                    <table className="w-full text-sm">
                      <thead className={`${bgTablaHead} border-b ${bordeFila}`}>
                        <tr>
                          <th className={`px-4 py-3 text-left font-bold text-xs uppercase ${textoSecundario}`}>Nombre</th>
                          <th className={`px-4 py-3 text-left font-bold text-xs uppercase ${textoSecundario}`}>Email</th>
                          <th className={`px-4 py-3 text-left font-bold text-xs uppercase ${textoSecundario}`}>Rol deseado</th>
                          <th className={`px-4 py-3 text-left font-bold text-xs uppercase ${textoSecundario}`}>Tipo profesional</th>
                          <th className={`px-4 py-3 text-left font-bold text-xs uppercase ${textoSecundario}`}>Centro</th>
                          <th className={`px-4 py-3 text-center font-bold text-xs uppercase ${textoSecundario}`}>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {solicitudes.map((u) => (
                          <tr key={u.id} className={`border-b ${bordeFila} ${hoverFila}`}>
                            <td className={`px-4 py-3 font-medium ${textoPrincipal}`}>{u.nombre_completo || 'Sin nombre'}</td>
                            <td className={`px-4 py-3 ${textoPrincipal}`}>{u.email}</td>
                            <td className={`px-4 py-3 text-xs ${textoPrincipal}`}>{getRolLabel(u.rol)}</td>
                            <td className="px-4 py-3">{getTipoProfesionalBadge(u.tipo_profesional)}</td>
                            <td className="px-4 py-3">
                              <select className={`px-2 py-1 rounded-lg border ${bgInput} text-xs w-full max-w-[150px]`} defaultValue={u.centro_id || ''} id={`centro-${u.id}`}>
                                <option value="">Sin centro</option>
                                {centros.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
                              </select>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <select className={`px-2 py-1 rounded-lg border ${bgInput} text-xs`} defaultValue={u.rol || 2} id={`rol-${u.id}`}>
                                {ROLES.map(r => <option key={r.valor} value={r.valor}>{r.label}</option>)}
                              </select>
                              <button onClick={() => { const rolSelect = document.getElementById(`rol-${u.id}`); const centroSelect = document.getElementById(`centro-${u.id}`); aprobarUsuario(u.id, rolSelect?.value || 2, centroSelect?.value || null); }} className="ml-2 px-3 py-1 bg-[#22d3ee] text-black font-bold rounded-lg text-xs hover:scale-105">Aprobar</button>
                              <button onClick={() => eliminarUsuario(u.id)} className="ml-2 px-3 py-1 bg-red-500/20 text-red-500 font-bold rounded-lg text-xs hover:bg-red-500 hover:text-white">Eliminar</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <h2 className={`text-xl font-bold ${textoPrincipal} mb-4`}>Usuarios activos ({usuarios.length})</h2>
                {usuarios.length === 0 ? (
                  <p className={textoSecundario}>No hay usuarios activos.</p>
                ) : (
                  <div className={`overflow-x-auto rounded-2xl border ${bordeFila} shadow-sm`}>
                    <table className="w-full text-sm">
                      <thead className={`${bgTablaHead} border-b ${bordeFila}`}>
                        <tr>
                          <th className={`px-4 py-3 text-left font-bold text-xs uppercase ${textoSecundario}`}>Nombre</th>
                          <th className={`px-4 py-3 text-left font-bold text-xs uppercase ${textoSecundario}`}>Email</th>
                          <th className={`px-4 py-3 text-left font-bold text-xs uppercase ${textoSecundario}`}>Tipo Profesional</th>
                          <th className={`px-4 py-3 text-left font-bold text-xs uppercase ${textoSecundario}`}>Centro</th>
                          <th className={`px-4 py-3 text-left font-bold text-xs uppercase ${textoSecundario}`}>Rol</th>
                          <th className={`px-4 py-3 text-center font-bold text-xs uppercase ${textoSecundario}`}>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usuarios.map((u) => (
                          <tr key={u.id} className={`border-b ${bordeFila} ${hoverFila}`}>
                            <td className={`px-4 py-3 font-medium ${textoPrincipal}`}>{u.nombre_completo || 'Sin nombre'}</td>
                            <td className={`px-4 py-3 ${textoPrincipal}`}>{u.email}</td>
                            <td className="px-4 py-3">{getTipoProfesionalBadge(u.tipo_profesional)}</td>
                            <td className={`px-4 py-3 text-xs font-mono ${textoPrincipal}`}>{u.centro_id || '—'}</td>
                            <td className={`px-4 py-3 text-xs ${textoPrincipal}`}>{getRolLabel(u.rol)}</td>
                            <td className="px-4 py-3 text-center">
                              <button onClick={() => abrirModalEditar(u)} className="px-3 py-1 bg-[#22d3ee]/20 text-[#22d3ee] font-bold rounded-lg text-xs hover:bg-[#22d3ee] hover:text-black transition-all">✏️ Editar</button>
                              <button onClick={() => eliminarUsuario(u.id)} className="ml-2 px-3 py-1 bg-red-500/20 text-red-500 font-bold rounded-lg text-xs hover:bg-red-500 hover:text-white">Eliminar</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {pestana === 'evaluaciones' && (
              <div className={`${bgTarjeta} p-6 rounded-2xl border`}>
                <h2 className={`text-xl font-bold ${textoPrincipal} mb-4`}>📋 Evaluaciones pendientes de aprobación</h2>
                {evaluacionesPendientes.length === 0 ? (
                  <p className={`${textoSecundario} text-center py-8`}>No hay evaluaciones pendientes.</p>
                ) : (
                  <div className="space-y-4">
                    {evaluacionesPendientes.map((ev) => (
                      <div key={ev.id} className={`p-4 rounded-xl border ${bordeFila} hover:border-[#22d3ee]/40 transition-all`}>
                        <div className="flex flex-wrap justify-between items-start gap-2">
                          <div>
                            <p className={`text-sm font-bold ${textoPrincipal}`}>Paciente: {ev.pacientes?.nombre || 'N/A'} {ev.pacientes?.apellidos || ''}</p>
                            <p className={`text-xs ${textoSecundario}`}>Terapeuta: {ev.profiles?.nombre_completo || 'Desconocido'} | Fecha: {new Date(ev.created_at).toLocaleDateString()}</p>
                            <p className={`text-xs ${textoSecundario}`}>Regiones: {(ev.regiones || []).join(', ') || 'No especificadas'}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button onClick={() => aprobarEvaluacion(ev.id)} className="px-3 py-1 bg-green-500/20 text-green-500 font-bold rounded-lg text-xs hover:bg-green-500 hover:text-white">✅ Aprobar</button>
                            <button onClick={() => rechazarEvaluacion(ev.id)} className="px-3 py-1 bg-red-500/20 text-red-500 font-bold rounded-lg text-xs hover:bg-red-500 hover:text-white">❌ Rechazar</button>
                            <button onClick={() => window.open(`/clinica/evaluacion/${ev.paciente_id}?evaluacion_id=${ev.id}`, '_blank')} className="px-3 py-1 bg-blue-500/20 text-blue-500 font-bold rounded-lg text-xs hover:bg-blue-500 hover:text-white">👁️ Ver</button>
                          </div>
                        </div>
                        {ev.comentario_rechazo && (
                          <div className="mt-2 p-2 bg-red-500/10 border-l-4 border-red-500 rounded-r text-xs text-red-500">
                            Motivo de rechazo: {ev.comentario_rechazo}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {modalEditar && usuarioEditando && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className={`relative w-full max-w-2xl rounded-3xl border ${bgModal} p-6 shadow-2xl my-8`}>
            <button onClick={() => setModalEditar(false)} className={`absolute top-4 right-4 ${textoSecundario} hover:text-[#22d3ee] text-xl`}>✕</button>
            <h2 className={`text-2xl font-black ${textoPrincipal} mb-1`}>✏️ Editar Datos Profesionales</h2>
            <p className={`text-xs ${textoSecundario} mb-6`}>{usuarioEditando.email}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoSecundario} mb-1`}>Nombre completo</label>
                <input type="text" value={formEditar.nombre_completo} onChange={(e) => setFormEditar({...formEditar, nombre_completo: e.target.value})} className={`w-full px-4 py-2 rounded-xl border ${bgInput} text-sm outline-none focus:border-[#22d3ee]`} />
              </div>

              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoSecundario} mb-1`}>Teléfono</label>
                <input type="tel" value={formEditar.telefono} onChange={(e) => setFormEditar({...formEditar, telefono: e.target.value})} className={`w-full px-4 py-2 rounded-xl border ${bgInput} text-sm outline-none focus:border-[#22d3ee]`} />
              </div>

              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoSecundario} mb-1`}>Estado</label>
                <select value={formEditar.estado} onChange={(e) => setFormEditar({...formEditar, estado: e.target.value})} className={`w-full px-4 py-2 rounded-xl border ${bgInput} text-sm cursor-pointer`}>
                  <option value="aprobado">Aprobado</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="rechazado">Rechazado</option>
                </select>
              </div>

              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoSecundario} mb-1`}>Rol</label>
                <select value={formEditar.rol} onChange={(e) => setFormEditar({...formEditar, rol: Number(e.target.value)})} className={`w-full px-4 py-2 rounded-xl border ${bgInput} text-sm cursor-pointer`}>
                  {ROLES.map(r => <option key={r.valor} value={r.valor}>{r.label}</option>)}
                </select>
              </div>

              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoSecundario} mb-1`}>Tipo Profesional</label>
                <select value={formEditar.tipo_profesional} onChange={(e) => setFormEditar({...formEditar, tipo_profesional: e.target.value})} className={`w-full px-4 py-2 rounded-xl border ${bgInput} text-sm cursor-pointer`}>
                  <option value="">Sin definir</option>
                  <option value="director">Director</option>
                  <option value="estudiante">Estudiante</option>
                  <option value="licenciado">Licenciado</option>
                  <option value="tecnico">Técnico</option>
                  <option value="paciente">Paciente</option>
                  <option value="demo">Demo</option>
                </select>
              </div>

              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoSecundario} mb-1`}>Tipo de documento</label>
                <select value={formEditar.tipo_documento} onChange={(e) => setFormEditar({...formEditar, tipo_documento: e.target.value})} className={`w-full px-4 py-2 rounded-xl border ${bgInput} text-sm cursor-pointer`}>
                  <option value="DNI">DNI</option>
                  <option value="CE">CE</option>
                </select>
              </div>

              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoSecundario} mb-1`}>Número de documento</label>
                <input type="text" value={formEditar.dni} onChange={(e) => setFormEditar({...formEditar, dni: e.target.value})} className={`w-full px-4 py-2 rounded-xl border ${bgInput} text-sm outline-none focus:border-[#22d3ee]`} />
              </div>

              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoSecundario} mb-1`}>CTMP (Colegio Tecnólogo Médico)</label>
                <input type="text" value={formEditar.numero_colegiatura} onChange={(e) => setFormEditar({...formEditar, numero_colegiatura: e.target.value})} className={`w-full px-4 py-2 rounded-xl border ${bgInput} text-sm outline-none focus:border-[#22d3ee]`} placeholder="Solo licenciados" />
              </div>

              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoSecundario} mb-1`}>Registro interno del centro</label>
                <input type="text" value={formEditar.registro_interno} onChange={(e) => setFormEditar({...formEditar, registro_interno: e.target.value})} className={`w-full px-4 py-2 rounded-xl border ${bgInput} text-sm outline-none focus:border-[#22d3ee]`} placeholder="Solo técnicos" />
              </div>

              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoSecundario} mb-1`}>Centro asignado</label>
                <select value={formEditar.centro_id} onChange={(e) => setFormEditar({...formEditar, centro_id: e.target.value})} className={`w-full px-4 py-2 rounded-xl border ${bgInput} text-sm cursor-pointer`}>
                  <option value="">Sin centro</option>
                  {centros.map(c => <option key={c.id} value={c.id}>{c.id} - {c.nombre}</option>)}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoSecundario} mb-1`}>Dirección del centro (para Admin Centro)</label>
                <input type="text" value={formEditar.direccion_centro} onChange={(e) => setFormEditar({...formEditar, direccion_centro: e.target.value})} className={`w-full px-4 py-2 rounded-xl border ${bgInput} text-sm outline-none focus:border-[#22d3ee]`} />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setModalEditar(false)} className={`px-5 py-2 rounded-xl border ${temaOscuro ? 'border-gray-600 hover:bg-gray-700/30' : 'border-gray-300 hover:bg-gray-100'} text-sm font-bold ${textoPrincipal}`}>Cancelar</button>
              <button onClick={guardarEdicion} disabled={guardandoEdicion} className="px-6 py-2 bg-[#22d3ee] text-black font-black rounded-xl text-sm hover:scale-105 transition-all disabled:opacity-50">
                {guardandoEdicion ? 'Guardando...' : '💾 Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}