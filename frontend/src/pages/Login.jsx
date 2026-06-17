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

  const mostrarError = (texto) => {
    setError(texto);
    setTimeout(() => setError(''), 4000);
  };

  const mostrarMensaje = (texto) => {
    setMensaje(texto);
    setTimeout(() => setMensaje(''), 4000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
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

  const handleRegister = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      mostrarError(signUpError.message);
      setCargando(false);
      return;
    }

    const { error: profileError } = await supabase.from('profiles').insert([
      {
        id: data.user.id,
        email: email,
        nombre_completo: nombreCompleto,
        telefono: telefono || null,
        rol: rolDeseado,
        estado: 'pendiente',
      },
    ]);

    if (profileError) {
      console.error(profileError);
      mostrarError('Error al crear perfil. Contacta al administrador.');
    } else {
      mostrarMensaje('Registro exitoso. Espera la aprobación del Director.');
      setEsRegistro(false);
      setEmail('');
      setPassword('');
      setNombreCompleto('');
      setTelefono('');
    }
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
        {/* Logo circular */}
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
                <input
                  type="email"
                  placeholder="tu@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className={labelClass}>Nombre Completo</label>
                <input
                  type="text"
                  placeholder="Ej: Jorge Luis Chiroque"
                  value={nombreCompleto}
                  onChange={(e) => setNombreCompleto(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Correo Electrónico</label>
                <input
                  type="email"
                  placeholder="tu@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Crea una contraseña segura"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
              <div>
                <label className={labelClass}>Teléfono (Opcional)</label>
                <input
                  type="tel"
                  placeholder="Ej: 987654321"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className={inputClass}
                />
                <p className="text-[9px] text-gray-500 mt-1">Para recibir notificaciones y recordatorios.</p>
              </div>
              <div>
                <label className={labelClass}>Perfil Deseado</label>
                <select
                  value={rolDeseado}
                  onChange={(e) => setRolDeseado(Number(e.target.value))}
                  className={`${inputClass} cursor-pointer`}
                >
                  <option value={2}>📘 Estudiante (Academia)</option>
                  <option value={3}>🩺 Licenciado / Técnico (Clínica)</option>
                  <option value={4}>🤝 Híbrido (Academia + Clínica)</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={cargando}
                className="w-full mt-2 bg-[#10b981] text-white font-black uppercase py-3 rounded-xl hover:bg-[#0c9a6b] transition-all active:scale-95 text-xs tracking-widest disabled:opacity-50"
              >
                {cargando ? 'Solicitando...' : 'Solicitar Acceso'}
              </button>
              <p className="text-[9px] text-center text-gray-500 mt-4">
                Tu solicitud será revisada por el Director. Recibirás una notificación cuando sea aprobada.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}