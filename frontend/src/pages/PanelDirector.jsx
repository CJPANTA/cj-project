import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { registrarCambiosMultiples } from '../utils/auditoria';
import { generarMensajeHumano, formatearFecha, iconoCampo, traducirValor } from '../utils/auditoriaTraducciones';
import WizardCentro from '../components/clinica/WizardCentro';
import ConsumoIA from './ConsumoIA';
import GestionCentros from '../components/GestionCentros';
import WizardOnboarding from '../components/WizardOnboarding';

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
  const [wizardAbierto, setWizardAbierto] = useState(false);
  const [wizardOnboardingAbierto, setWizardOnboardingAbierto] = useState(false);
  const [esDirectorGlobal, setEsDirectorGlobal] = useState(false);
  const [centroDirector, setCentroDirector] = useState(null);
  const [pestana, setPestana] = useState('usuarios');
  const [filtroRol, setFiltroRol] = useState(null); // null = todos
  const [historial, setHistorial] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [filtroHistorial, setFiltroHistorial] = useState('');
  const [solicitudesReset, setSolicitudesReset] = useState([]);

  const [modalEditar, setModalEditar] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [formEditar, setFormEditar] = useState({
    nombre_completo: '', email: '', telefono: '', rol: 2, tipo_profesional: '',
    tipo_documento: 'DNI', dni: '', numero_colegiatura: '', registro_interno: '',
    direccion_centro: '', centro_id: '', estado: 'aprobado',
  });
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);

  // ===== ESTILOS DINÁMICOS =====
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

  useEffect(() => {
    if (pestana === 'historial') {
      cargarHistorial();
    }
    if (pestana === 'resets') {
      cargarSolicitudesReset();
    }
  }, [pestana]);

  const cargarSolicitudesReset = async () => {
    try {
      let query = supabase
        .from('solicitudes_reset')
        .select('*')
        .eq('estado', 'pendiente')
        .order('created_at', { ascending: false });

      if (!esDirectorGlobal && centroDirector) {
        query = query.eq('centro_id', centroDirector);
      }

      const { data, error } = await query;
      if (error) throw error;

      const ids = [...new Set((data || []).map((s) => s.usuario_id).filter(Boolean))];
      let perfilMap = {};
      if (ids.length > 0) {
        const { data: perfiles } = await supabase
          .from('profiles')
          .select('id, nombre_completo, email')
          .in('id', ids);
        (perfiles || []).forEach((p) => { perfilMap[p.id] = p; });
      }

      setSolicitudesReset((data || []).map((s) => ({
        ...s,
        perfil: perfilMap[s.usuario_id] || null,
      })));
    } catch (err) {
      console.error('Error cargando solicitudes:', err);
    }
  };

  const resetearPassword = async (solicitud) => {
    if (!confirm(`¿Resetear la contraseña de "${solicitud.perfil?.nombre_completo || 'este usuario'}" a 12345678?`)) {
      return;
    }
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const SUPABASE_URL = 'https://xjxsuxtehkdtphvgkvbd.supabase.co';
      const res = await fetch(`${SUPABASE_URL}/functions/v1/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({
          usuario_id: solicitud.usuario_id,
          password_nuevo: '12345678',
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Error al resetear la contraseña');
      }

      await supabase.rpc('marcar_solicitud_resuelta', { solicitud_id: solicitud.id });

      alert('✅ Contraseña reseteada a 12345678. Avisa al usuario por WhatsApp.');
      cargarSolicitudesReset();
    } catch (err) {
      console.error(err);
      alert('Error: ' + err.message);
    }
  };

  const denegarSolicitud = async (solicitud) => {
    if (!confirm('¿Denegar esta solicitud de reset?')) return;
    try {
      await supabase.rpc('marcar_solicitud_denegada', { solicitud_id: solicitud.id });
      alert('✅ Solicitud denegada.');
      cargarSolicitudesReset();
    } catch (err) {
      console.error(err);
      alert('Error: ' + err.message);
    }
  };

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
      } else if (perfil.centro_id) {
        const { data: centroData } = await supabase
          .from('centros')
          .select('*')
          .eq('id', perfil.centro_id)
          .single();
        setCentros(centroData ? [centroData] : []);
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
        licenciados: activos.filter(p => p.rol === 3 || p.rol === 4 || p.rol === 7 || p.rol === 8).length,
      });

      let evalQuery = supabase
        .from('evaluaciones')
        .select(`
          *,
          pacientes (nombre, apellidos),
          profiles!evaluaciones_user_id_fkey (nombre_completo)
        `)
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

  const cargarHistorial = async () => {
    setCargandoHistorial(true);
    try {
      const { data: auditoriaData, error } = await supabase
        .from('auditoria_perfiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      if (!auditoriaData || auditoriaData.length === 0) {
        setHistorial([]);
        return;
      }

      const ids = [...new Set(auditoriaData.map((a) => a.perfil_id).filter(Boolean))];
      let perfilMap = {};
      if (ids.length > 0) {
        const { data: perfiles } = await supabase
          .from('profiles')
          .select('id, nombre_completo, email')
          .in('id', ids);
        (perfiles || []).forEach((p) => {
          perfilMap[p.id] = p;
        });
      }

      const hidratadas = auditoriaData.map((a) => ({
        ...a,
        perfil: perfilMap[a.perfil_id] || null,
      }));

      setHistorial(hidratadas);
    } catch (err) {
      console.error('Error cargando historial:', err);
      alert('Error al cargar el historial: ' + err.message);
    } finally {
      setCargandoHistorial(false);
    }
  };

  const aprobarUsuario = async (userId, nuevoRol, centroId) => {
    if (!nuevoRol) { alert('Selecciona un rol.'); return; }
    try {
      const { data: perfilPrevio } = await supabase
        .from('profiles')
        .select('tipo_profesional, rol, estado, centro_id, nombre_completo')
        .eq('id', userId)
        .single();

      const rolNum = parseInt(nuevoRol);
      const updateData = { estado: 'aprobado', rol: rolNum };
      if (centroId) updateData.centro_id = centroId;

      const tipoMap = {
        1: 'director', 2: 'estudiante', 3: 'licenciado',
        4: 'licenciado', 5: 'paciente', 6: 'demo',
        7: 'licenciado', 8: perfilPrevio?.tipo_profesional || 'licenciado',
      };
      updateData.tipo_profesional = tipoMap[rolNum] || null;

      const esTecnico = updateData.tipo_profesional === 'tecnico' || perfilPrevio?.tipo_profesional === 'tecnico';
      const centroParaRegistro = updateData.centro_id || perfilPrevio?.centro_id;

      if (esTecnico && centroParaRegistro) {
        const { data: perfilCheck } = await supabase
          .from('profiles').select('registro_interno').eq('id', userId).single();

        if (!perfilCheck?.registro_interno) {
          const nuevoRegistro = await generarRegistroInterno(centroParaRegistro);
          if (nuevoRegistro) updateData.registro_interno = nuevoRegistro;
        }
      }

      if (rolNum === 8 && !centroId && !perfilPrevio?.centro_id) {
        const nombreCompleto = perfilPrevio?.nombre_completo || 'Independiente';
        const tipo = perfilPrevio?.tipo_profesional || 'licenciado';

        const { data: perfilExtra } = await supabase
          .from('profiles').select('dni, numero_colegiatura, registro_interno').eq('id', userId).single();

        const palabras = nombreCompleto.trim().split(/\s+/).filter((w) => w.length > 0);
        const iniciales = palabras.slice(0, 3).map((w) => w[0]).join('').toUpperCase() || 'XX';

        let identificador = '';
        if (tipo === 'licenciado') identificador = (perfilExtra?.numero_colegiatura || '').replace(/\D/g, '');
        else if (tipo === 'tecnico') identificador = (perfilExtra?.dni || '').replace(/\D/g, '');

        if (!identificador || identificador.length < 3) {
          identificador = String(Date.now()).slice(-6);
        }

        const centroPersonalId = `IND-${iniciales}${identificador}`;

        const { data: existente } = await supabase.from('centros').select('id').eq('id', centroPersonalId).maybeSingle();

        if (existente) {
          updateData.centro_id = centroPersonalId;
        } else {
          const { data: { user: currentUser } } = await supabase.auth.getUser();
          const { error: errCentro } = await supabase.from('centros').insert([{
            id: centroPersonalId,
            nombre: `Consultorio ${nombreCompleto}`,
            tipo_centro: 'independiente',
            created_by: currentUser?.id || null,
          }]);

          if (errCentro) throw errCentro;
          updateData.centro_id = centroPersonalId;
        }
      }

      const { error } = await supabase.from('profiles').update(updateData).eq('id', userId);
      if (error) throw error;

      await registrarCambiosMultiples({
        perfilId: userId,
        datosAnteriores: perfilPrevio || {},
        datosNuevos: updateData,
        motivo: rolNum === 8 ? `Aprobación de Independiente — Centro Personal: ${updateData.centro_id}` : 'Aprobación de usuario por Director',
      });

      if (rolNum === 8) {
        alert(`✅ Independiente aprobado.\n\n🏥 Se creó su Centro Personal: ${updateData.centro_id}\n\nPídele que ingrese a "Mi Equipamiento" para configurar su inventario.`);
      } else {
        alert('✅ Usuario aprobado.');
      }
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
      const datosNuevos = {
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
      };

      const datosAnteriores = {
        tipo_profesional: usuarioEditando.tipo_profesional,
        rol: usuarioEditando.rol,
        estado: usuarioEditando.estado,
        centro_id: usuarioEditando.centro_id,
        dni: usuarioEditando.dni,
        numero_colegiatura: usuarioEditando.numero_colegiatura,
        registro_interno: usuarioEditando.registro_interno,
        tipo_documento: usuarioEditando.tipo_documento,
      };

      const { error } = await supabase.from('profiles').update(datosNuevos).eq('id', usuarioEditando.id);
      if (error) throw error;

      const audit = await registrarCambiosMultiples({
        perfilId: usuarioEditando.id,
        datosAnteriores,
        datosNuevos,
        motivo: 'Edición manual por Director',
      });

      if (audit.cantidad > 0) {
        alert(`✅ Datos actualizados. Se registraron ${audit.cantidad} cambio(s) en auditoría.`);
      } else {
        alert('✅ Datos actualizados (sin cambios relevantes).');
      }

      setModalEditar(false);
      setUsuarioEditando(null);
      cargarDatos();
    } catch (error) {
      alert('Error al guardar: ' + error.message);
    } finally {
      setGuardandoEdicion(false);
    }
  };

  const generarRegistroInterno = async (centroId) => {
    if (!centroId) return null;
    const { data: tecnicos } = await supabase
      .from('profiles')
      .select('registro_interno')
      .eq('centro_id', centroId)
      .eq('tipo_profesional', 'tecnico')
      .not('registro_interno', 'is', null);

    const prefijo = `${centroId}-TEC-`;
    let maxNumero = 0;

    (tecnicos || []).forEach((t) => {
      if (t.registro_interno && t.registro_interno.startsWith(prefijo)) {
        const num = parseInt(t.registro_interno.replace(prefijo, ''), 10);
        if (!isNaN(num) && num > maxNumero) {
          maxNumero = num;
        }
      }
    });

    const siguiente = maxNumero + 1;
    const numeroFormateado = String(siguiente).padStart(3, '0');
    return `${prefijo}${numeroFormateado}`;
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

  // ============================================================
  // LÓGICA DE FILTRADO (Paso D)
  // ============================================================
  const usuariosFiltrados = usuarios.filter(u => {
    if (filtroRol === null || filtroRol === 'pendiente') return true;
    if (filtroRol === 3) return [3, 4, 7, 8].includes(u.rol);
    return u.rol === filtroRol;
  });

  const solicitudesFiltradas = solicitudes.filter(s => {
    if (filtroRol === null || filtroRol === 'pendiente') return true;
    if (filtroRol === 3) return [3, 4, 7, 8].includes(s.rol);
    return s.rol === filtroRol;
  });

  const ROLES = [
    { valor: 1, label: 'Director' },
    { valor: 2, label: 'Estudiante' },
    { valor: 3, label: 'Licenciado' },
    { valor: 4, label: 'Híbrido' },
    { valor: 5, label: 'Paciente' },
    { valor: 6, label: 'Demo' },
    { valor: 7, label: 'Admin Centro' },
    { valor: 8, label: 'Independiente' },
  ];

  const rolesAprobables = esDirectorGlobal
    ? ROLES
    : ROLES.filter((r) => [2, 3, 4].includes(r.valor));

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

        {/* BANNER DE ALERTAS DE COBRO */}
        {esDirectorGlobal && (() => {
          const hoy = new Date();
          hoy.setHours(0, 0, 0, 0);

          const vencidos = centros.filter(c => {
            if (c.estado_pago === 'suspendido' || !c.fecha_vencimiento) return false;
            const vence = new Date(c.fecha_vencimiento + 'T00:00:00');
            return vence < hoy;
          });

          const porVencer = centros.filter(c => {
            if (c.estado_pago === 'suspendido' || !c.fecha_vencimiento) return false;
            const vence = new Date(c.fecha_vencimiento + 'T00:00:00');
            const en7Dias = new Date();
            en7Dias.setDate(en7Dias.getDate() + 7);
            en7Dias.setHours(0, 0, 0, 0);
            return vence >= hoy && vence <= en7Dias;
          });

          if (vencidos.length === 0 && porVencer.length === 0) return null;

          return (
            <div className="mb-6 space-y-3">
              {vencidos.length > 0 && (
                <div className="bg-red-500/10 border-l-4 border-red-500 p-4 rounded-r-xl flex flex-wrap justify-between items-center gap-3">
                  <div>
                    <p className="text-red-400 font-black text-sm uppercase tracking-wider">
                      🚨 Alerta: {vencidos.length} centro{vencidos.length > 1 ? 's' : ''} vencido{vencidos.length > 1 ? 's' : ''}
                    </p>
                    <p className={`text-xs ${textoSecundario} mt-1`}>
                      {vencidos.map(c => c.nombre).join(', ')} — Suspende el acceso o registra su pago.
                    </p>
                  </div>
                  <button onClick={() => setMostrarCentros(true)} className="px-4 py-2 bg-red-500 text-white font-bold rounded-lg text-xs hover:bg-red-600 transition-all">
                    Ir a Gestión de Centros ↓
                  </button>
                </div>
              )}

              {porVencer.length > 0 && (
                <div className="bg-yellow-500/10 border-l-4 border-yellow-500 p-4 rounded-r-xl flex flex-wrap justify-between items-center gap-3">
                  <div>
                    <p className="text-yellow-500 font-black text-sm uppercase tracking-wider">
                      ⚠️ Aviso: {porVencer.length} centro{porVencer.length > 1 ? 's' : ''} vence en 7 días
                    </p>
                    <p className={`text-xs ${textoSecundario} mt-1`}>
                      {porVencer.map(c => c.nombre).join(', ')} — Contáctalos para renovar su plan.
                    </p>
                  </div>
                  <button onClick={() => setMostrarCentros(true)} className="px-4 py-2 bg-yellow-500 text-black font-bold rounded-lg text-xs hover:bg-yellow-600 transition-all">
                    Ver Centros ↓
                  </button>
                </div>
              )}
            </div>
          );
        })()}

        {/* TARJETAS KPI (INTERACTIVAS) */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <button 
            onClick={() => setFiltroRol(null)} 
            className={`${bgTarjeta} p-4 rounded-2xl border text-center transition-all ${filtroRol === null ? 'border-[#22d3ee] ring-1 ring-[#22d3ee]' : 'hover:border-[#22d3ee]/50'}`}
          >
            <p className="text-3xl font-black text-[#22d3ee]">{estadisticas.total}</p>
            <p className={`text-xs font-bold uppercase ${textoSecundario}`}>Total Usuarios</p>
          </button>

          <button 
            onClick={() => setFiltroRol('pendiente')} 
            className={`${bgTarjeta} p-4 rounded-2xl border text-center transition-all ${filtroRol === 'pendiente' ? 'border-yellow-500 ring-1 ring-yellow-500' : 'hover:border-yellow-500/50'}`}
          >
            <p className="text-3xl font-black text-yellow-500">{estadisticas.pendientes}</p>
            <p className={`text-xs font-bold uppercase ${textoSecundario}`}>Pendientes</p>
          </button>

          <button 
            onClick={() => setFiltroRol(2)} 
            className={`${bgTarjeta} p-4 rounded-2xl border text-center transition-all ${filtroRol === 2 ? 'border-blue-500 ring-1 ring-blue-500' : 'hover:border-blue-500/50'}`}
          >
            <p className="text-3xl font-black text-blue-500">{estadisticas.estudiantes}</p>
            <p className={`text-xs font-bold uppercase ${textoSecundario}`}>Estudiantes</p>
          </button>

          <button 
            onClick={() => setFiltroRol(3)} 
            className={`${bgTarjeta} p-4 rounded-2xl border text-center transition-all ${filtroRol === 3 ? 'border-emerald-500 ring-1 ring-emerald-500' : 'hover:border-emerald-500/50'}`}
          >
            <p className="text-3xl font-black text-emerald-500">{estadisticas.licenciados}</p>
            <p className={`text-xs font-bold uppercase ${textoSecundario}`}>Licenciados</p>
          </button>

          {esDirectorGlobal && (
            <button 
              onClick={() => { setMostrarCentros(!mostrarCentros); setFiltroRol(null); }} 
              className={`${bgTarjeta} p-4 rounded-2xl border text-center transition-all ${mostrarCentros ? 'border-purple-500 ring-1 ring-purple-500' : 'hover:border-purple-500/50'}`}
            >
              <p className="text-3xl font-black text-purple-500">{centros.length}</p>
              <p className={`text-xs font-bold uppercase ${textoSecundario}`}>Centros</p>
            </button>
          )}
        </div>

        {/* BARRA DE PESTAÑAS */}
        <div className={`flex flex-wrap border-b ${bordeTab} mb-6 gap-2`}>
          <button onClick={() => setPestana('usuarios')} className={`px-4 py-2 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${pestana === 'usuarios' ? 'border-[#22d3ee] text-[#22d3ee]' : `border-transparent ${textoSecundario} hover:text-[#22d3ee]`}`}>👥 Usuarios</button>
          <button onClick={() => setPestana('evaluaciones')} className={`px-4 py-2 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${pestana === 'evaluaciones' ? 'border-[#22d3ee] text-[#22d3ee]' : `border-transparent ${textoSecundario} hover:text-[#22d3ee]`}`}>📋 Evaluaciones ({evaluacionesPendientes.length})</button>
          <button onClick={() => setPestana('historial')} className={`px-4 py-2 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${pestana === 'historial' ? 'border-[#22d3ee] text-[#22d3ee]' : `border-transparent ${textoSecundario} hover:text-[#22d3ee]`}`}>📜 Historial</button>
          <button onClick={() => setPestana('resets')} className={`px-4 py-2 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${pestana === 'resets' ? 'border-[#22d3ee] text-[#22d3ee]' : `border-transparent ${textoSecundario} hover:text-[#22d3ee]`}`}>🔑 Resets ({solicitudesReset.length})</button>
          
          {/* ÚNICO BOTÓN DE CONSUMO IA */}
          {esDirectorGlobal && (
            <button onClick={() => setPestana('consumo')} className={`px-4 py-2 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${pestana === 'consumo' ? 'border-[#22d3ee] text-[#22d3ee]' : `border-transparent ${textoSecundario} hover:text-[#22d3ee]`}`}>📊 Consumo IA</button>
          )}
        </div>

        {/* GESTIÓN DE CENTROS (SOLO DIRECTOR Y SI ESTÁ ACTIVO) */}
        {esDirectorGlobal && mostrarCentros && (
          <div className="mb-8">
            <GestionCentros
              temaOscuro={temaOscuro}
              onNuevoCentro={() => setWizardOnboardingAbierto(true)}
            />
          </div>
        )}

        {/* CONTENIDO DE LAS PESTAÑAS */}
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-4 border-[#22d3ee] border-t-transparent"></div></div>
        ) : (
          <>
            {pestana === 'usuarios' && (
              <>
                <h2 className={`text-xl font-bold ${textoPrincipal} mb-4`}>Solicitudes pendientes ({solicitudesFiltradas.length})</h2>
                {solicitudesFiltradas.length === 0 ? (
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
                        {solicitudesFiltradas.map((u) => (
                          <tr key={u.id} className={`border-b ${bordeFila} ${hoverFila}`}>
                            <td className={`px-4 py-3 font-medium ${textoPrincipal}`}>{u.nombre_completo || 'Sin nombre'}</td>
                            <td className={`px-4 py-3 ${textoPrincipal}`}>{u.email}</td>
                            <td className={`px-4 py-3 text-xs ${textoPrincipal}`}>{getRolLabel(u.rol)}</td>
                            <td className="px-4 py-3">{getTipoProfesionalBadge(u.tipo_profesional)}</td>
                            <td className="px-4 py-3">
                              <select className={`px-2 py-1 rounded-lg border ${bgInput} text-xs w-full max-w-[150px]`} defaultValue={u.centro_id || (esDirectorGlobal ? '' : centroDirector || '')} id={`centro-${u.id}`}>
                                {esDirectorGlobal && <option value="">Sin centro</option>}
                                {centros.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
                              </select>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <select className={`px-2 py-1 rounded-lg border ${bgInput} text-xs`} defaultValue={u.rol || 3} id={`rol-${u.id}`}>
                                {rolesAprobables.map(r => <option key={r.valor} value={r.valor}>{r.label}</option>)}
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

                <h2 className={`text-xl font-bold ${textoPrincipal} mb-4`}>Usuarios activos ({usuariosFiltrados.length})</h2>
                {usuariosFiltrados.length === 0 ? (
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
                        {usuariosFiltrados.map((u) => (
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
            
            {pestana === 'historial' && (
              <div className={`${bgTarjeta} p-6 rounded-2xl border`}>
                <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
                  <div>
                    <h2 className={`text-xl font-bold ${textoPrincipal}`}>📜 Historial de Cambios</h2>
                    <p className={`text-xs ${textoSecundario} mt-1`}>
                      Últimos 100 movimientos registrados en el sistema
                    </p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Buscar por nombre o editor..."
                      value={filtroHistorial}
                      onChange={(e) => setFiltroHistorial(e.target.value)}
                      className={`px-3 py-2 rounded-xl border ${bgInput} text-xs outline-none focus:border-[#22d3ee] min-w-[220px]`}
                    />
                    <button
                      onClick={cargarHistorial}
                      disabled={cargandoHistorial}
                      className="px-4 py-2 bg-[#22d3ee]/20 text-[#22d3ee] font-bold rounded-xl text-xs hover:bg-[#22d3ee] hover:text-black transition-all disabled:opacity-50"
                    >
                      {cargandoHistorial ? '⏳' : '🔄 Recargar'}
                    </button>
                  </div>
                </div>

                {cargandoHistorial ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#22d3ee] border-t-transparent"></div>
                  </div>
                ) : historial.length === 0 ? (
                  <div className="text-center py-12">
                    <p className={`text-sm ${textoSecundario}`}>No hay movimientos registrados aún.</p>
                    <p className={`text-xs ${textoSecundario} mt-1`}>
                      Los cambios aparecerán aquí cuando se edite algún usuario.
                    </p>
                  </div>
                ) : (() => {
                  const filtro = filtroHistorial.trim().toLowerCase();
                  const filtrados = filtro
                    ? historial.filter((h) =>
                        (h.perfil?.nombre_completo || '').toLowerCase().includes(filtro) ||
                        (h.editor_nombre || '').toLowerCase().includes(filtro) ||
                        (h.campo_modificado || '').toLowerCase().includes(filtro)
                      )
                    : historial;

                  if (filtrados.length === 0) {
                    return (
                      <div className="text-center py-12">
                        <p className={`text-sm ${textoSecundario}`}>No se encontraron resultados para "{filtroHistorial}".</p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                      {filtrados.map((h) => (
                        <div
                          key={h.id}
                          className={`p-4 rounded-xl border-l-4 ${temaOscuro ? 'bg-[#0f1a24] border-[#22d3ee]/40' : 'bg-gray-50 border-[#22d3ee]'} ${bordeFila} border`}
                        >
                          <div className="flex justify-between items-start gap-3 flex-wrap">
                            <div className="flex-1 min-w-[280px]">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className={`text-xs font-mono ${textoSecundario}`}>
                                  🕐 {formatearFecha(h.created_at)}
                                </span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#22d3ee]/20 text-[#22d3ee]`}>
                                  {iconoCampo(h.campo_modificado)} {h.campo_modificado}
                                </span>
                              </div>

                              <p className={`text-sm ${textoPrincipal} mb-1`}>
                                <strong className={textoPrincipal}>👤 {h.editor_nombre || 'Usuario desconocido'}</strong>
                                {' '}modificó el perfil de{' '}
                                <strong className="text-[#22d3ee]">
                                  {h.perfil?.nombre_completo || 'Usuario desconocido'}
                                </strong>
                              </p>

                              <p className={`text-xs ${textoSecundario} mb-2`}>
                                {generarMensajeHumano(h)}
                              </p>

                              <div className="flex items-center gap-2 flex-wrap text-xs">
                                <span className={`px-2 py-1 rounded-lg ${temaOscuro ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-700'} border border-red-500/20`}>
                                  <span className="font-bold">Antes:</span>{' '}
                                  {traducirValor(h.campo_modificado, h.valor_anterior)}
                                </span>
                                <span className={textoSecundario}>→</span>
                                <span className={`px-2 py-1 rounded-lg ${temaOscuro ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-700'} border border-green-500/20`}>
                                  <span className="font-bold">Después:</span>{' '}
                                  {traducirValor(h.campo_modificado, h.valor_nuevo)}
                                </span>
                              </div>

                              {h.motivo && (
                                <p className={`text-[10px] mt-2 italic ${textoSecundario}`}>
                                  💬 Motivo: {h.motivo}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}

            {pestana === 'resets' && (
              <div className={`${bgTarjeta} p-6 rounded-2xl border`}>
                <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
                  <div>
                    <h2 className={`text-xl font-bold ${textoPrincipal}`}>🔑 Solicitudes de Reset</h2>
                    <p className={`text-xs ${textoSecundario} mt-1`}>
                      Usuarios que olvidaron su contraseña y necesitan reactivación
                    </p>
                  </div>
                  <button
                    onClick={cargarSolicitudesReset}
                    className="px-4 py-2 bg-[#22d3ee]/20 text-[#22d3ee] font-bold rounded-xl text-xs hover:bg-[#22d3ee] hover:text-black transition-all"
                  >
                    🔄 Recargar
                  </button>
                </div>

                {solicitudesReset.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-4xl mb-2">✨</p>
                    <p className={`text-sm ${textoSecundario}`}>No hay solicitudes pendientes</p>
                    <p className={`text-xs ${textoSecundario} mt-1`}>
                      Los usuarios que olviden su contraseña aparecerán aquí
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {solicitudesReset.map((s) => (
                      <div
                        key={s.id}
                        className={`p-4 rounded-xl border ${bordeFila} ${temaOscuro ? 'bg-[#0f1a24]' : 'bg-gray-50'}`}
                      >
                        <div className="flex flex-wrap justify-between items-start gap-3">
                          <div className="flex-1 min-w-[250px]">
                            <p className={`text-sm font-bold ${textoPrincipal} mb-1`}>
                              👤 {s.perfil?.nombre_completo || 'Usuario desconocido'}
                            </p>
                            <p className={`text-xs ${textoSecundario} mb-1`}>
                              📧 {s.email_solicitado}
                            </p>
                            <p className={`text-xs ${textoSecundario} mb-1`}>
                              🏥 Centro: <span className="font-mono font-bold text-[#22d3ee]">{s.centro_id || 'Sin centro'}</span>
                            </p>
                            <p className={`text-[10px] ${textoSecundario} italic`}>
                              🕐 Solicitado: {new Date(s.created_at).toLocaleString('es-PE', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            <button
                              onClick={() => resetearPassword(s)}
                              className="px-4 py-2 bg-emerald-500/20 text-emerald-400 font-bold rounded-xl text-xs hover:bg-emerald-500 hover:text-white transition-all"
                            >
                              🔑 Resetear a 12345678
                            </button>
                            <button
                              onClick={() => denegarSolicitud(s)}
                              className="px-4 py-2 bg-red-500/20 text-red-400 font-bold rounded-xl text-xs hover:bg-red-500 hover:text-white transition-all"
                            >
                              ❌ Denegar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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

            {/* RENDERIZADO LIMPIO DE CONSUMO IA (AHORA SÍ, DENTRO DE LAS PESTAÑAS) */}
            {pestana === 'consumo' && (
              <ConsumoIA temaOscuro={temaOscuro} />
            )}
          </>
        )}
      </div>

      {/* WIZARDS (FUERA DEL FLUJO DE PESTAÑAS) */}
      <WizardCentro
        abierto={wizardAbierto}
        onCerrar={() => setWizardAbierto(false)}
        onCreado={() => {
          cargarDatos();
          alert('✅ Centro creado correctamente.');
        }}
        temaOscuro={temaOscuro}
      />

      <WizardOnboarding
        abierto={wizardOnboardingAbierto}
        onCerrar={() => setWizardOnboardingAbierto(false)}
        onCreado={() => cargarDatos()}
        temaOscuro={temaOscuro}
      />

      {/* MODAL EDITAR (FUERA DEL FLUJO) */}
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
                  {rolesAprobables.map(r => <option key={r.valor} value={r.valor}>{r.label}</option>)}
                </select>
              </div>

              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoSecundario} mb-1`}>Tipo Profesional</label>
                <select
                  value={formEditar.tipo_profesional}
                  onChange={(e) => setFormEditar({...formEditar, tipo_profesional: e.target.value})}
                  disabled={!esDirectorGlobal}
                  className={`w-full px-4 py-2 rounded-xl border ${bgInput} text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                  title={!esDirectorGlobal ? 'Solo el Director Global puede cambiar el tipo profesional' : ''}
                >
                  <option value="">Sin definir</option>
                  <option value="director">Director</option>
                  <option value="estudiante">Estudiante</option>
                  <option value="licenciado">Licenciado</option>
                  <option value="tecnico">Técnico</option>
                  <option value="paciente">Paciente</option>
                  <option value="demo">Demo</option>
                </select>
                {!esDirectorGlobal && (
                  <p className="text-[9px] text-gray-500 mt-1 italic">
                    Solo el Director Global puede modificar este campo.
                  </p>
                )}
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