import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function Login() {
  const [esRegistro, setEsRegistro] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [telefono, setTelefono] = useState('');
  const [rolDeseado, setRolDeseado] = useState(2);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  // ===== CAMPOS NUEVOS SEGÚN ROL =====
  const [tipoDocumento, setTipoDocumento] = useState('DNI');       // DNI | CE
  const [numeroDocumento, setNumeroDocumento] = useState('');      // Nº del DNI/CE
  const [ctmp, setCtmp] = useState('');                            // Colegio Tecnólogo Médico
  const [registroInterno, setRegistroInterno] = useState('');      // Registro interno (técnicos)
  const [direccionCentro, setDireccionCentro] = useState('');      // Para Admin Centro
  const [tipoProfesionalAdmin, setTipoProfesionalAdmin] = useState('licenciado'); // licenciado | tecnico

  const mostrarError = (texto) => {
    setError(texto);
    setTimeout(() => setError(''), 4000);
  };

  const mostrarMensaje = (texto) => {
    setMensaje(texto);
    setTimeout(() => setMensaje(''), 5000);
  };

  // ===== VALIDACIÓN DINÁMICA =====
  const esEstudiante = rolDeseado === 2;
  const esLicenciado = rolDeseado === 3;
  const esHibrido = rolDeseado === 4;
  const esAdminCentro = rolDeseado === 7;

    const requiereCTMP = esLicenciado || ((esHibrido || esAdminCentro) && tipoProfesionalAdmin === 'licenciado');
  const requiereRegistroInterno = esAdminCentro && tipoProfesionalAdmin === 'tecnico';
  const requiereDireccionCentro = esAdminCentro;

  const derivarTipoProfesional = () => {
    if (esEstudiante) return 'estudiante';
    if (esLicenciado) return 'licenciado';
    if (esHibrido) return tipoProfesionalAdmin; // ← Ahora respeta la elección
    if (esAdminCentro) return tipoProfesionalAdmin;
    return null;
  };

  // ===== LOGIN =====
  const handleLogin = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

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

    // Validaciones mínimas
    if (!nombreCompleto.trim()) { mostrarError('Ingresa tu nombre completo'); setCargando(false); return; }
    if (!email.trim()) { mostrarError('Ingresa tu correo'); setCargando(false); return; }
    if (password.length < 6) { mostrarError('La contraseña debe tener al menos 6 caracteres'); setCargando(false); return; }
    if (esEstudiante || esLicenciado || esHibrido || esAdminCentro) {
      if (!numeroDocumento.trim()) { mostrarError('Ingresa tu número de documento'); setCargando(false); return; }
    }
    if (requiereCTMP && !ctmp.trim()) { mostrarError('Ingresa tu número de CTMP'); setCargando(false); return; }
    if (requiereRegistroInterno && !registroInterno.trim()) { mostrarError('Ingresa tu registro interno del centro'); setCargando(false); return; }

    // 1) Crear usuario en Auth con metadata (para que el trigger cree el profile)
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: nombreCompleto,
          telefono: telefono || '',
          rol: Number(rolDeseado),
          estado: 'pendiente',
          tipo_profesional: derivarTipoProfesional(),
          tipo_documento: tipoDocumento,
          dni: numeroDocumento,
          numero_colegiatura: ctmp || null,
          registro_interno: registroInterno || null,
          direccion_centro: direccionCentro || null,
        },
      },
    });

    if (signUpError) {
      mostrarError(signUpError.message);
      setCargando(false);
      return;
    }

    // 2) Actualizar el profile por si el trigger no capturó los campos nuevos
    if (data?.user?.id) {
      await supabase
        .from('profiles')
        .update({
          tipo_profesional: derivarTipoProfesional(),
          tipo_documento: tipoDocumento,
          dni: numeroDocumento,
          numero_colegiatura: ctmp || null,
          registro_interno: registroInterno || null,
          direccion_centro: direccionCentro || null,
          telefono: telefono || null,
        })
        .eq('id', data.user.id);
    }

    mostrarMensaje('Registro solicitado con éxito. Espera la aprobación del Director.');

    // Limpiar
    setEsRegistro(false);
    setEmail(''); setPassword(''); setNombreCompleto(''); setTelefono('');
    setRolDeseado(2); setTipoDocumento('DNI'); setNumeroDocumento('');
    setCtmp(''); setRegistroInterno(''); setDireccionCentro('');
    setTipoProfesionalAdmin('licenciado');
    setCargando(false);
  };

  const bgCard = 'bg-[#0a141d] border border-gray-800/60 rounded-2xl p-8 shadow-2xl';
  const inputClass = 'w-full bg-[#020813] border border-gray-800 text-white p-3 rounded-xl outline-none focus:border-[#22d3ee]/50 transition-colors text-sm';
  const labelClass = 'block text-[10px] text-gray-400 uppercase font-bold mb-2 pl-1';

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
              onClick={() => setEsRegistro(false)}
              className={`pb-2 text-sm font-bold uppercase tracking-wider transition-all ${
                !esRegistro ? 'text-[#22d3ee] border-b-2 border-[#22d3ee]' : 'text-gray-500 hover:text-white'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => setEsRegistro(true)}
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

          {!esRegistro ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className={labelClass}>Correo Electrónico</label>
                <input type="email" placeholder="tu@ejemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>Contraseña</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} placeholder="Tu contraseña" value={password} onChange={(e) => setPassword(e.target.value)} className={`${inputClass} pr-10`} required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white transition-colors">
                    {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={cargando} className="w-full mt-2 bg-[#22d3ee] text-black font-black uppercase py-3 rounded-xl hover:bg-[#1bc1da] transition-all active:scale-95 text-xs tracking-widest shadow-[0_0_15px_rgba(34,211,238,0.3)] disabled:opacity-50">
                {cargando ? 'Accediendo...' : 'Entrar al Sistema'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              {/* NOMBRE */}
              <div>
                <label className={labelClass}>Nombre Completo *</label>
                <input type="text" placeholder="Ej: Jorge Luis Chiroque" value={nombreCompleto} onChange={(e) => setNombreCompleto(e.target.value)} className={inputClass} required />
              </div>

              {/* ROL DESEADO */}
              <div>
                <label className={labelClass}>Perfil Deseado *</label>
                <select value={rolDeseado} onChange={(e) => setRolDeseado(Number(e.target.value))} className={`${inputClass} cursor-pointer`}>
                  <option value={2}>📘 Estudiante (Academia)</option>
                  <option value={3}>🩺 Licenciado en Fisioterapia (Clínica)</option>
                  <option value={4}>🤝 Híbrido (Academia + Clínica)</option>
                  <option value={7}>🏢 Admin Centro (Gestión de centro)</option>
                </select>
              </div>

              {/* TIPO PROFESIONAL PARA HÍBRIDO Y ADMIN CENTRO */}
              {(esAdminCentro || esHibrido) && (
                <div>
                  <label className={labelClass}>Tipo de Profesional *</label>
                  <select value={tipoProfesionalAdmin} onChange={(e) => setTipoProfesionalAdmin(e.target.value)} className={`${inputClass} cursor-pointer`}>
                    <option value="licenciado">Licenciado en Fisioterapia (con CTMP)</option>
                    <option value="tecnico">Técnico en Fisioterapia (con DNI)</option>
                  </select>
                  <p className="text-[9px] text-gray-500 mt-1">
                    {tipoProfesionalAdmin === 'licenciado'
                      ? 'Firmará informes como Lic. T.M. Fisioterapia con su CTMP.'
                      : 'Firmará como Técnico en Fisioterapia con su DNI.'}
                  </p>
                </div>
              )}

              {/* DOCUMENTO */}
              {(esEstudiante || esLicenciado || esHibrido || esAdminCentro) && (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className={labelClass}>Tipo *</label>
                    <select value={tipoDocumento} onChange={(e) => setTipoDocumento(e.target.value)} className={`${inputClass} cursor-pointer`}>
                      <option value="DNI">DNI</option>
                      <option value="CE">CE</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className={labelClass}>Número *</label>
                    <input type="text" placeholder="Ej: 45063406" value={numeroDocumento} onChange={(e) => setNumeroDocumento(e.target.value)} className={inputClass} required />
                  </div>
                </div>
              )}

              {/* CTMP (Licenciados, Híbridos, Admin Centro licenciado) */}
              {requiereCTMP && (
                <div>
                  <label className={labelClass}>CTMP (Colegio Tecnólogo Médico) *</label>
                  <input type="text" placeholder="Ej: 12345" value={ctmp} onChange={(e) => setCtmp(e.target.value)} className={inputClass} required />
                  <p className="text-[9px] text-gray-500 mt-1">Número de colegiatura del Colegio Tecnólogo Médico del Perú.</p>
                </div>
              )}

              {/* REGISTRO INTERNO (Admin Centro técnico) */}
              {requiereRegistroInterno && (
                <div>
                  <label className={labelClass}>Registro Interno del Centro *</label>
                  <input type="text" placeholder="Ej: CJ-TEC-001" value={registroInterno} onChange={(e) => setRegistroInterno(e.target.value)} className={inputClass} required />
                  <p className="text-[9px] text-gray-500 mt-1">Número de registro interno otorgado por el centro.</p>
                </div>
              )}

              {/* DIRECCIÓN DEL CENTRO (Admin Centro) */}
              {requiereDireccionCentro && (
                <div>
                  <label className={labelClass}>Dirección del Centro *</label>
                  <input type="text" placeholder="Ej: Av. Los Álamos 123, Lima" value={direccionCentro} onChange={(e) => setDireccionCentro(e.target.value)} className={inputClass} required />
                </div>
              )}

              {/* EMAIL */}
              <div>
                <label className={labelClass}>Correo Electrónico *</label>
                <input type="email" placeholder="tu@ejemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} required />
              </div>

              {/* TELÉFONO */}
              <div>
                <label className={labelClass}>Teléfono *</label>
                <input type="tel" placeholder="Ej: 987654321" value={telefono} onChange={(e) => setTelefono(e.target.value)} className={inputClass} required />
              </div>

              {/* PASSWORD */}
              <div>
                <label className={labelClass}>Contraseña *</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} placeholder="Mínimo 6 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} className={`${inputClass} pr-10`} required minLength={6} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white transition-colors">
                    {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={cargando} className="w-full mt-2 bg-[#10b981] text-white font-black uppercase py-3 rounded-xl hover:bg-[#0c9a6b] transition-all active:scale-95 text-xs tracking-widest disabled:opacity-50">
                {cargando ? 'Solicitando...' : 'Solicitar Acceso'}
              </button>
              <p className="text-[9px] text-center text-gray-500 mt-4">
                Tu solicitud será revisada por el Director. Recibirás notificación cuando sea aprobada.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}