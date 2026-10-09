import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

// ============================================================
// HELPERS
// ============================================================
const normalizar = (texto) =>
  (texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');

const generarEmailCorporativo = (nombre, apellidos, dominio) => {
  if (!nombre || !apellidos || !dominio) return '';
  const primerNombre = normalizar(nombre.trim().split(/\s+/)[0]);
  const primerApellido = normalizar(apellidos.trim().split(/\s+/)[0]);
  return `${primerNombre}.${primerApellido}@${dominio}.com`;
};

const generarIdCentroSugerido = (nombreCentro) => {
  if (!nombreCentro) return '';
  const palabras = nombreCentro.trim().split(/\s+/).filter((w) => w.length > 2);
  if (palabras.length === 0) return 'CJ';
  const iniciales = palabras
    .slice(0, 4)
    .map((w) => normalizar(w)[0])
    .join('')
    .toUpperCase();
  return iniciales || 'CJ';
};

// ============================================================
// COMPONENTE
// ============================================================
export default function Login() {
  const navigate = useNavigate();
  const [esRegistro, setEsRegistro] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // ===== LOGIN =====
  const [emailLogin, setEmailLogin] = useState('');
  const [passwordLogin, setPasswordLogin] = useState('');

  // ===== REGISTRO — datos personales =====
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [telefono, setTelefono] = useState('');
  const [nickname, setNickname] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState('DNI');
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [ctmp, setCtmp] = useState('');
  const [registroInterno, setRegistroInterno] = useState('');
  const [password, setPassword] = useState('');

  // ===== REGISTRO — perfil =====
  const [rolDeseado, setRolDeseado] = useState(2);
  const [tipoProfesionalAdmin, setTipoProfesionalAdmin] = useState('licenciado');

  // ===== REGISTRO — centro =====
  const [centrosDisponibles, setCentrosDisponibles] = useState([]);
  const [centroSeleccionado, setCentroSeleccionado] = useState('');
  const [modoAdminCentro, setModoAdminCentro] = useState('afiliarme'); // 'afiliarme' | 'crear_nuevo'
  const [datosNuevoCentro, setDatosNuevoCentro] = useState({
    nombre: '',
    id_propuesto: '',
    dominio: '',
    ruc: '',
    direccion: '',
    telefono: '',
    email_empresa: '',
  });

  // ===== CARGAR CENTROS DISPONIBLES =====
  useEffect(() => {
    const cargarCentros = async () => {
      const { data } = await supabase
        .from('centros')
        .select('id, nombre, dominio, tipo_centro')
        .neq('tipo_centro', 'independiente')
        .order('nombre');
      setCentrosDisponibles(data || []);
    };
    cargarCentros();
  }, []);

  // ===== LÓGICA DE PERFIL =====
  const esEstudiante = rolDeseado === 2;
  const esLicenciado = rolDeseado === 3;
  const esHibrido = rolDeseado === 4;
  const esAdminCentro = rolDeseado === 7;
  const esIndependiente = rolDeseado === 8;

  const requiereCTMP = esLicenciado || ((esHibrido || esAdminCentro || esIndependiente) && tipoProfesionalAdmin === 'licenciado');
  const requiereRegistroInterno = (esAdminCentro || esHibrido) && tipoProfesionalAdmin === 'tecnico';
  const requiereSelectorCentro = esLicenciado || esHibrido || (esAdminCentro && modoAdminCentro === 'afiliarme');

  // ===== DOMINIO Y EMAIL CORPORATIVO =====
  let dominioFinal = '';
  if (esEstudiante) dominioFinal = 'cjfisio';
  else if (esIndependiente) dominioFinal = 'ind';
  else if (esAdminCentro && modoAdminCentro === 'crear_nuevo') {
    dominioFinal = normalizar(datosNuevoCentro.dominio || generarIdCentroSugerido(datosNuevoCentro.nombre));
  } else if (requiereSelectorCentro && centroSeleccionado) {
    const c = centrosDisponibles.find((x) => x.id === centroSeleccionado);
    dominioFinal = c?.dominio || normalizar(c?.id || '');
  }

  const emailCorporativo = generarEmailCorporativo(nombre, apellidos, dominioFinal);

  // ===== UTILIDADES =====
  const mostrarError = (texto) => {
    setError(texto);
    setTimeout(() => setError(''), 5000);
  };

  const mostrarMensaje = (texto) => {
    setMensaje(texto);
    setTimeout(() => setMensaje(''), 6000);
  };

  const derivarTipoProfesional = () => {
    if (esEstudiante) return 'estudiante';
    if (esLicenciado) return 'licenciado';
    if (esHibrido) return tipoProfesionalAdmin;
    if (esAdminCentro) return tipoProfesionalAdmin;
    if (esIndependiente) return tipoProfesionalAdmin;
    return null;
  };

  // ===== LOGIN =====
  const handleLogin = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: emailLogin,
      password: passwordLogin,
    });

    if (authError) {
      mostrarError('Credenciales incorrectas');
      setCargando(false);
      return;
    }

    const { data: perfil, error: perfilError } = await supabase
      .from('profiles')
      .select('estado, rol')
      .eq('id', data.user.id)
      .single();

    if (perfilError || perfil.estado !== 'aprobado') {
      await supabase.auth.signOut();
      mostrarError('Cuenta pendiente de aprobación');
      setCargando(false);
      return;
    }

    localStorage.setItem('usuario_cj', 'logueado');
    localStorage.setItem('cj_user_rol', perfil.rol);
    localStorage.setItem('cj_user_id', data.user.id);
    navigate('/');
  };

  // ===== REGISTRO =====
  const handleRegister = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');

    // === Validaciones ===
    if (!nombre.trim()) { mostrarError('Ingresa tus nombres'); setCargando(false); return; }
    if (!apellidos.trim()) { mostrarError('Ingresa tus apellidos'); setCargando(false); return; }
    if (password.length < 6) { mostrarError('La contraseña debe tener al menos 6 caracteres'); setCargando(false); return; }

    if (esEstudiante || esLicenciado || esHibrido || esAdminCentro || esIndependiente) {
      if (!numeroDocumento.trim()) { mostrarError('Ingresa tu número de documento'); setCargando(false); return; }
    }
    if (requiereCTMP && !ctmp.trim()) { mostrarError('Ingresa tu número de CTMP'); setCargando(false); return; }
    if (requiereRegistroInterno && !registroInterno.trim()) { mostrarError('Ingresa tu registro interno'); setCargando(false); return; }

    if (requiereSelectorCentro && !centroSeleccionado) {
      mostrarError('Selecciona un centro');
      setCargando(false);
      return;
    }

    // Validaciones si crea centro nuevo
    if (esAdminCentro && modoAdminCentro === 'crear_nuevo') {
      if (!datosNuevoCentro.nombre.trim()) { mostrarError('Ingresa el nombre del centro'); setCargando(false); return; }
      if (!datosNuevoCentro.dominio.trim()) { mostrarError('Elige el dominio del centro'); setCargando(false); return; }
      if (!datosNuevoCentro.ruc.trim()) { mostrarError('Ingresa el RUC del centro'); setCargando(false); return; }
      if (!datosNuevoCentro.direccion.trim()) { mostrarError('Ingresa la dirección del centro'); setCargando(false); return; }
    }

    if (!emailCorporativo) { mostrarError('No se pudo generar el correo corporativo'); setCargando(false); return; }

    // Verificar que el email no exista
    const { data: existente } = await supabase
      .from('profiles')
      .select('id')
      .eq('email_corporativo', emailCorporativo)
      .maybeSingle();

    if (existente) {
      mostrarError('Ese correo ya está registrado. Usa otro nombre o dominio.');
      setCargando(false);
      return;
    }

    // Preparamos datos del centro nuevo (si aplica)
    const solicitudCentro = esAdminCentro && modoAdminCentro === 'crear_nuevo' ? {
      nombre: datosNuevoCentro.nombre.trim(),
      id_propuesto: (datosNuevoCentro.id_propuesto || generarIdCentroSugerido(datosNuevoCentro.nombre)).toUpperCase().trim(),
      dominio: normalizar(datosNuevoCentro.dominio),
      ruc: datosNuevoCentro.ruc.trim(),
      direccion: datosNuevoCentro.direccion.trim(),
      telefono: datosNuevoCentro.telefono?.trim() || null,
      email_empresa: datosNuevoCentro.email_empresa?.trim() || null,
    } : null;

    try {
      // 1) Crear usuario en Auth con el correo corporativo
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: emailCorporativo,
        password,
        options: {
          data: {
            name: `${nombre.trim()} ${apellidos.trim()}`,
            telefono: telefono || '',
            rol: Number(rolDeseado),
            estado: 'pendiente',
            tipo_profesional: derivarTipoProfesional(),
            tipo_documento: tipoDocumento,
            dni: numeroDocumento,
            numero_colegiatura: ctmp || null,
            registro_interno: registroInterno || null,
          },
        },
      });

      if (signUpError) {
        mostrarError(signUpError.message);
        setCargando(false);
        return;
      }

      // 2) Actualizar profile con campos nuevos
      if (data?.user?.id) {
        const updateData = {
          nombre_completo: `${nombre.trim()} ${apellidos.trim()}`,
          tipo_profesional: derivarTipoProfesional(),
          tipo_documento: tipoDocumento,
          dni: numeroDocumento,
          numero_colegiatura: ctmp || null,
          registro_interno: registroInterno || null,
          telefono: telefono || null,
          nickname: nickname.trim() || null,
          email_corporativo: emailCorporativo,
          centro_id: requiereSelectorCentro ? centroSeleccionado : null,
        };
        if (solicitudCentro) {
          updateData.solicita_centro_nuevo = solicitudCentro;
        }
        await supabase.from('profiles').update(updateData).eq('id', data.user.id);
      }

      // Mensaje final
      if (esAdminCentro && modoAdminCentro === 'crear_nuevo') {
        mostrarMensaje('✅ Solicitud enviada. El Director Global revisará tu centro y te notificará.');
      } else if (esIndependiente) {
        mostrarMensaje('✅ Solicitud enviada. Al ser aprobado se creará tu consultorio personal automáticamente.');
      } else if (esAdminCentro) {
        mostrarMensaje('✅ Solicitud enviada. El administrador del centro la revisará.');
      } else if (requiereSelectorCentro) {
        mostrarMensaje('✅ Solicitud enviada. El administrador del centro la revisará.');
      } else {
        mostrarMensaje('✅ Registro exitoso. Espera la aprobación.');
      }

      // Limpiar formulario
      setEsRegistro(false);
      setNombre(''); setApellidos(''); setTelefono(''); setNickname('');
      setTipoDocumento('DNI'); setNumeroDocumento('');
      setCtmp(''); setRegistroInterno(''); setPassword('');
      setRolDeseado(2); setTipoProfesionalAdmin('licenciado');
      setCentroSeleccionado(''); setModoAdminCentro('afiliarme');
      setDatosNuevoCentro({ nombre: '', id_propuesto: '', dominio: '', ruc: '', direccion: '', telefono: '', email_empresa: '' });
    } catch (err) {
      console.error(err);
      mostrarError('Error inesperado: ' + err.message);
    } finally {
      setCargando(false);
    }
  };

  // ===== ESTILOS =====
  const bgCard = 'bg-[#0a141d] border border-gray-800/60 rounded-2xl p-8 shadow-2xl';
  const inputClass = 'w-full bg-[#020813] border border-gray-800 text-white p-3 rounded-xl outline-none focus:border-[#22d3ee]/50 transition-colors text-sm';
  const labelClass = 'block text-[10px] text-gray-400 uppercase font-bold mb-2 pl-1';
  const helpClass = 'text-[9px] text-gray-500 mt-1 pl-1';

  const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
    </svg>
  );

  const EyeSlashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020813] to-[#0a141d] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logos_cj_circular.png" alt="CJ Fisioterapia" className="w-24 h-24 mx-auto mb-4 rounded-full border-2 border-[#22d3ee]/30 shadow-lg" />
          <h1 className="text-3xl font-black text-white tracking-tighter">
            CJ <span className="text-[#22d3ee]">Fisioterapia</span>
          </h1>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Ecosistema de Salud</p>
        </div>

        <div className={bgCard}>
          <div className="flex gap-4 mb-8 border-b border-gray-800 pb-2">
            <button
              type="button"
              onClick={() => { setEsRegistro(false); setError(''); }}
              className={`pb-2 text-sm font-bold uppercase tracking-wider transition-all ${
                !esRegistro ? 'text-[#22d3ee] border-b-2 border-[#22d3ee]' : 'text-gray-500 hover:text-white'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => { setEsRegistro(true); setError(''); }}
              className={`pb-2 text-sm font-bold uppercase tracking-wider transition-all ${
                esRegistro ? 'text-[#22d3ee] border-b-2 border-[#22d3ee]' : 'text-gray-500 hover:text-white'
              }`}
            >
              Registrarse
            </button>
          </div>

          {error && (
            <div className="mb-6 bg-red-900/30 border border-red-500/20 text-red-400 text-xs font-black uppercase p-3 rounded-xl text-center">
              {error}
            </div>
          )}
          {mensaje && (
            <div className="mb-6 bg-green-900/30 border border-green-500/20 text-green-400 text-xs font-black uppercase p-3 rounded-xl text-center">
              {mensaje}
            </div>
          )}

          {/* ========== LOGIN ========== */}
          {!esRegistro ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className={labelClass}>Correo Electrónico</label>
                <input
                  type="email"
                  placeholder="tu@ejemplo.com"
                  value={emailLogin}
                  onChange={(e) => setEmailLogin(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Tu contraseña"
                    value={passwordLogin}
                    onChange={(e) => setPasswordLogin(e.target.value)}
                    className={`${inputClass} pr-10`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={cargando}
                className="w-full mt-2 bg-[#22d3ee] text-black font-black uppercase py-3 rounded-xl hover:bg-[#1bc1da] transition-all active:scale-95 text-xs tracking-widest shadow-[0_0_15px_rgba(34,211,238,0.3)] disabled:opacity-50"
              >
                {cargando ? 'Accediendo...' : 'Entrar al Sistema'}
              </button>

              <button
                type="button"
                onClick={() => navigate('/solicitar-reset')}
                className="w-full text-center text-[10px] text-gray-500 hover:text-[#22d3ee] transition-colors uppercase font-bold tracking-wider"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </form>
          ) : (
            /* ========== REGISTRO ========== */
            <form onSubmit={handleRegister} className="space-y-4">
              {/* NOMBRES Y APELLIDOS */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelClass}>Nombres *</label>
                  <input
                    type="text"
                    placeholder="Nombres"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Apellidos *</label>
                  <input
                    type="text"
                    placeholder="Apellidos"
                    value={apellidos}
                    onChange={(e) => setApellidos(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              {/* PERFIL DESEADO */}
              <div>
                <label className={labelClass}>Perfil Deseado *</label>
                <select
                  value={rolDeseado}
                  onChange={(e) => setRolDeseado(Number(e.target.value))}
                  className={`${inputClass} cursor-pointer`}
                >
                  <option value={2}>📘 Estudiante (Academia)</option>
                  <option value={3}>🦴 Licenciado (Clínica - dependiente)</option>
                  <option value={4}>🤝 Híbrido (Academia + Clínica)</option>
                  <option value={7}>🏢 Admin Centro (Dueño o gestor)</option>
                  <option value={8}>👤 Independiente (Consultorio propio)</option>
                </select>
              </div>

              {/* TIPO PROFESIONAL */}
              {(esAdminCentro || esHibrido || esIndependiente) && (
                <div>
                  <label className={labelClass}>Tipo de Profesional *</label>
                  <select
                    value={tipoProfesionalAdmin}
                    onChange={(e) => setTipoProfesionalAdmin(e.target.value)}
                    className={`${inputClass} cursor-pointer`}
                  >
                    <option value="licenciado">Licenciado en Fisioterapia (con CTMP)</option>
                    <option value="tecnico">Técnico en Fisioterapia (con DNI)</option>
                  </select>
                </div>
              )}

              {/* DOCUMENTO */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className={labelClass}>Tipo *</label>
                  <select
                    value={tipoDocumento}
                    onChange={(e) => setTipoDocumento(e.target.value)}
                    className={`${inputClass} cursor-pointer`}
                  >
                    <option value="DNI">DNI</option>
                    <option value="CE">CE</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>Número *</label>
                  <input
                    type="text"
                    placeholder="Ej: 00000000"
                    value={numeroDocumento}
                    onChange={(e) => setNumeroDocumento(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              {/* CTMP */}
              {requiereCTMP && (
                <div>
                  <label className={labelClass}>CTMP *</label>
                  <input
                    type="text"
                    placeholder="Ej: 00000"
                    value={ctmp}
                    onChange={(e) => setCtmp(e.target.value)}
                    className={inputClass}
                    required
                  />
                  <p className={helpClass}>Colegio Tecnólogo Médico del Perú</p>
                </div>
              )}

              {/* REGISTRO INTERNO */}
              {requiereRegistroInterno && (
                <div>
                  <label className={labelClass}>Registro Interno *</label>
                  <input
                    type="text"
                    placeholder="Ej: CJ-TEC-001"
                    value={registroInterno}
                    onChange={(e) => setRegistroInterno(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
              )}

              {/* ====== ADMIN CENTRO: AFILIARSE vs CREAR NUEVO ====== */}
              {esAdminCentro && (
                <div className="p-3 rounded-xl border border-[#22d3ee]/30 bg-[#22d3ee]/5 space-y-3">
                  <label className={labelClass}>¿Qué quieres hacer? *</label>

                  {/* Opción A: Afiliarme */}
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="modo-admin"
                      value="afiliarme"
                      checked={modoAdminCentro === 'afiliarme'}
                      onChange={() => setModoAdminCentro('afiliarme')}
                      className="mt-1 accent-[#22d3ee]"
                    />
                    <div>
                      <span className="text-sm text-white font-bold">Afiliarme a un centro existente</span>
                      <p className="text-[10px] text-gray-400">Trabajo como Admin en un centro ya creado</p>
                    </div>
                  </label>

                  {modoAdminCentro === 'afiliarme' && (
                    <select
                      value={centroSeleccionado}
                      onChange={(e) => setCentroSeleccionado(e.target.value)}
                      className={`${inputClass} cursor-pointer ml-6`}
                      style={{ width: 'calc(100% - 1.5rem)' }}
                      required
                    >
                      <option value="">— Selecciona un centro —</option>
                      {centrosDisponibles.map((c) => (
                        <option key={c.id} value={c.id}>{c.id} — {c.nombre}</option>
                      ))}
                    </select>
                  )}

                  {/* Opción B: Crear nuevo */}
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="modo-admin"
                      value="crear_nuevo"
                      checked={modoAdminCentro === 'crear_nuevo'}
                      onChange={() => setModoAdminCentro('crear_nuevo')}
                      className="mt-1 accent-[#22d3ee]"
                    />
                    <div>
                      <span className="text-sm text-white font-bold">Crear un centro nuevo</span>
                      <p className="text-[10px] text-gray-400">Soy dueño/gestor de un nuevo centro. El Director lo aprobará.</p>
                    </div>
                  </label>
                </div>
              )}

              {/* ====== MINI-FORMULARIO DE CENTRO NUEVO ====== */}
              {esAdminCentro && modoAdminCentro === 'crear_nuevo' && (
                <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-3">
                  <p className="text-[10px] text-emerald-400 font-black uppercase tracking-wider">Datos del centro</p>

                  <div>
                    <label className={labelClass}>Nombre del centro *</label>
                    <input
                      type="text"
                      placeholder="Ej: Clínica San Juan"
                      value={datosNuevoCentro.nombre}
                      onChange={(e) => {
                        const nuevoNombre = e.target.value;
                        setDatosNuevoCentro({
                          ...datosNuevoCentro,
                          nombre: nuevoNombre,
                          id_propuesto: generarIdCentroSugerido(nuevoNombre),
                        });
                      }}
                      className={inputClass}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={labelClass}>ID sugerido *</label>
                      <input
                        type="text"
                        placeholder="Ej: CSJ"
                        value={datosNuevoCentro.id_propuesto}
                        onChange={(e) => setDatosNuevoCentro({ ...datosNuevoCentro, id_propuesto: e.target.value.toUpperCase() })}
                        className={inputClass}
                        required
                      />
                      <p className={helpClass}>Editable. El Director lo confirma.</p>
                    </div>
                    <div>
                      <label className={labelClass}>Dominio *</label>
                      <input
                        type="text"
                        placeholder="Ej: sanjuan"
                        value={datosNuevoCentro.dominio}
                        onChange={(e) => setDatosNuevoCentro({ ...datosNuevoCentro, dominio: e.target.value.toLowerCase() })}
                        className={inputClass}
                        required
                      />
                      <p className={helpClass}>Para correos: nombre@dominio.com</p>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>RUC *</label>
                    <input
                      type="text"
                      placeholder="Ej: 20123456789"
                      value={datosNuevoCentro.ruc}
                      onChange={(e) => setDatosNuevoCentro({ ...datosNuevoCentro, ruc: e.target.value })}
                      className={inputClass}
                      required
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Dirección *</label>
                    <input
                      type="text"
                      placeholder="Ej: Av. Los Álamos 123, Lima"
                      value={datosNuevoCentro.direccion}
                      onChange={(e) => setDatosNuevoCentro({ ...datosNuevoCentro, direccion: e.target.value })}
                      className={inputClass}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={labelClass}>Teléfono</label>
                      <input
                        type="tel"
                        placeholder="Ej: 987654321"
                        value={datosNuevoCentro.telefono}
                        onChange={(e) => setDatosNuevoCentro({ ...datosNuevoCentro, telefono: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Email empresa</label>
                      <input
                        type="email"
                        placeholder="contacto@clinica.com"
                        value={datosNuevoCentro.email_empresa}
                        onChange={(e) => setDatosNuevoCentro({ ...datosNuevoCentro, email_empresa: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SELECTOR DE CENTRO (Licenciados / Híbridos) */}
              {requiereSelectorCentro && !esAdminCentro && (
                <div>
                  <label className={labelClass}>Centro donde trabajas *</label>
                  <select
                    value={centroSeleccionado}
                    onChange={(e) => setCentroSeleccionado(e.target.value)}
                    className={`${inputClass} cursor-pointer`}
                    required
                  >
                    <option value="">— Selecciona un centro —</option>
                    {centrosDisponibles.map((c) => (
                      <option key={c.id} value={c.id}>{c.id} — {c.nombre}</option>
                    ))}
                  </select>
                  <p className={helpClass}>El admin de ese centro aprobará tu solicitud.</p>
                </div>
              )}

              {/* INDEPENDIENTE — Mensaje */}
              {esIndependiente && (
                <div className="p-3 rounded-xl border border-purple-500/30 bg-purple-500/5">
                  <p className="text-[10px] text-purple-400 font-bold">
                    ✨ Al ser aprobado, el sistema creará automáticamente tu consultorio personal.
                  </p>
                </div>
              )}

                            {/* NICKNAME */}
              <div>
                <label className={labelClass}>Nickname (opcional)</label>
                <input
                  type="text"
                  placeholder="Ej: Chino"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value.replace(/\s+/g, '').slice(0, 15))}
                  className={inputClass}
                  maxLength={15}
                />
                <p className={helpClass}>
                  Cómo quieres que te saludemos. Si lo dejas vacío usaremos tu primer nombre.
                </p>
              </div>

              {/* TELÉFONO */}
              <div>
                <label className={labelClass}>Teléfono</label>
                <input
                  type="tel"
                  placeholder="Ej: 987654321"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className={inputClass}
                />
              </div>

              {/* PASSWORD */}
              <div>
                <label className={labelClass}>Contraseña *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputClass} pr-10`}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              {/* PREVIEW DEL CORREO CORPORATIVO */}
              {emailCorporativo && (
                <div className="p-3 rounded-xl border border-[#22d3ee]/40 bg-[#22d3ee]/10">
                  <p className="text-[9px] text-[#22d3ee] font-black uppercase tracking-wider mb-1">
                    📧 Tu correo de acceso
                  </p>
                  <p className="text-sm text-white font-mono break-all">
                    {emailCorporativo}
                  </p>
                  <p className="text-[9px] text-gray-400 mt-1">
                    Con este correo entrarás. Guárdalo.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={cargando || !emailCorporativo}
                className="w-full mt-2 bg-[#10b981] text-white font-black uppercase py-3 rounded-xl hover:bg-[#0c9a6b] transition-all active:scale-95 text-xs tracking-widest disabled:opacity-50"
              >
                {cargando ? 'Solicitando...' : 'Solicitar Acceso'}
              </button>

              <p className="text-[9px] text-center text-gray-500 mt-4">
                Tu solicitud será revisada por el administrador correspondiente.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}