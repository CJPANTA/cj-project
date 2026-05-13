import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function Login() {
  const [esRegistro, setEsRegistro] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [telefono, setTelefono] = useState('');
  const [sobrenombre, setSobrenombre] = useState('');
  const [rolDeseado, setRolDeseado] = useState(2);
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

  // BYPASS TOTAL PARA EL DIRECTOR (usted)
  const handleAdminBypass = async () => {
    setCargando(true);
    const emailAdmin = 'cjpanta1@gmail.com';
    const passwordAdmin = 'admin123';

    // Intentar iniciar sesión con Supabase
    let { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: emailAdmin,
      password: passwordAdmin,
    });

    // Si falla porque no existe o no está confirmado, creamos el usuario forzadamente
    if (signInError) {
      // Intentar registrar (supabase maneja duplicados)
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: emailAdmin,
        password: passwordAdmin,
      });
      if (signUpError && !signUpError.message.includes('already registered')) {
        mostrarError('Error al crear usuario: ' + signUpError.message);
        setCargando(false);
        return;
      }
      // Obtener el usuario (puede que ya existiera)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Asegurar perfil como director
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: user.id,
          email: emailAdmin,
          nombre_completo: 'Jorge Luis Director',
          telefono: '999999999',
          sobrenombre: 'Jorge',
          rol: 1,
          estado: 'aprobado',
        }, { onConflict: 'id' });
        if (profileError) console.error(profileError);
      }
      // Iniciar sesión nuevamente (puede que requiera confirmación, pero forzamos)
      const { error: retryError } = await supabase.auth.signInWithPassword({
        email: emailAdmin,
        password: passwordAdmin,
      });
      if (retryError) {
        mostrarError('No se pudo iniciar sesión automáticamente. Intente de nuevo.');
        setCargando(false);
        return;
      }
    } else if (data?.user) {
      // Si la sesión fue exitosa, asegurar perfil
      const { error: upsertError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        email: emailAdmin,
        nombre_completo: 'Jorge Luis Director',
        telefono: '999999999',
        sobrenombre: 'Jorge',
        rol: 1,
        estado: 'aprobado',
      }, { onConflict: 'id' });
      if (upsertError) console.error(upsertError);
    }

    // Guardar en localStorage para que las rutas protegidas funcionen
    localStorage.setItem('usuario_cj', 'jorge_admin');
    localStorage.setItem('cj_user_rol', '1');
    navigate('/');
    setCargando(false);
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
      mostrarError('Credenciales incorrectas o cuenta no verificada');
      setCargando(false);
      return;
    }

    // Verificar perfil
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

    localStorage.setItem('usuario_cj', data.user.id);
    localStorage.setItem('cj_user_rol', perfil.rol);
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
        telefono: telefono,
        sobrenombre: sobrenombre || nombreCompleto.split(' ')[0],
        rol: rolDeseado,
        estado: 'pendiente',
      },
    ]);

    if (profileError) {
      console.error(profileError);
      mostrarError('Error al crear perfil');
    } else {
      mostrarMensaje('Registro exitoso. Espera aprobación.');
      setEsRegistro(false);
      setEmail('');
      setPassword('');
      setNombreCompleto('');
      setTelefono('');
      setSobrenombre('');
    }
    setCargando(false);
  };

  const bgCard = 'bg-[#0a141d] border border-gray-800/60 rounded-[2rem] p-6 shadow-2xl';
  const inputClass = 'bg-[#020813] border border-gray-800 text-white p-4 rounded-xl outline-none focus:border-[#22d3ee]/50 text-sm';

  return (
    <div className="min-h-screen bg-[#020813] flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        <div className="w-28 h-28 rounded-full bg-black/50 flex items-center justify-center overflow-hidden border-2 border-gray-800 shadow-xl">
          <img src="/logos_cj_circular.png" alt="Logo CJ" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter text-center">
          Proyecto <span className="text-[#22d3ee]">CJ Fisioterapia</span>
        </h1>

        <div className={bgCard}>
          <div className="flex gap-2 mb-6 border-b border-gray-800 pb-2">
            <button onClick={() => setEsRegistro(false)} className={`flex-1 py-2 text-center text-xs font-black uppercase tracking-wider transition-all ${!esRegistro ? 'text-[#22d3ee] border-b-2 border-[#22d3ee]' : 'text-gray-500'}`}>Iniciar Sesión</button>
            <button onClick={() => setEsRegistro(true)} className={`flex-1 py-2 text-center text-xs font-black uppercase tracking-wider transition-all ${esRegistro ? 'text-[#22d3ee] border-b-2 border-[#22d3ee]' : 'text-gray-500'}`}>Registrarse</button>
          </div>

          {error && <div className="mb-4 bg-red-900/30 border border-red-500/20 text-red-400 text-[10px] font-black uppercase p-3 rounded-xl text-center">{error}</div>}
          {mensaje && <div className="mb-4 bg-green-900/30 border border-green-500/20 text-green-400 text-[10px] font-black uppercase p-3 rounded-xl text-center">{mensaje}</div>}

          {!esRegistro ? (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <input type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} required />
              <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} required />
              <button type="submit" disabled={cargando} className="w-full bg-[#22d3ee] text-black font-black uppercase py-4 rounded-xl hover:bg-[#1bc1da] transition-all active:scale-95 text-[11px] tracking-widest disabled:opacity-50">
                {cargando ? 'Cargando...' : 'Entrar al Sistema'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <input type="text" placeholder="Nombre completo" value={nombreCompleto} onChange={(e) => setNombreCompleto(e.target.value)} className={inputClass} required />
              <input type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} required />
              <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} required />
              <input type="tel" placeholder="Teléfono (opcional)" value={telefono} onChange={(e) => setTelefono(e.target.value)} className={inputClass} />
              <input type="text" placeholder="¿Cómo quieres que te llame la app?" value={sobrenombre} onChange={(e) => setSobrenombre(e.target.value)} className={inputClass} />
              <div>
                <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Perfil deseado</label>
                <select value={rolDeseado} onChange={(e) => setRolDeseado(Number(e.target.value))} className={inputClass + ' w-full'}>
                  <option value={2}>📘 Estudiante</option>
                  <option value={3}>🩺 Licenciado / Técnico</option>
                  <option value={4}>🤝 Híbrido (academia + clínica)</option>
                </select>
              </div>
              <button type="submit" disabled={cargando} className="w-full bg-[#10b981] text-white font-black uppercase py-4 rounded-xl hover:bg-[#0c9a6b] transition-all text-[11px] tracking-widest">
                {cargando ? 'Registrando...' : 'Solicitar Acceso'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}