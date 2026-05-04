import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient'; 

export default function Login() {
  const navigate = useNavigate();
  const [credencial, setCredencial] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [errorLogin, setErrorLogin] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorLogin('');
    setCargando(true);

    try {
      const { data: usuario, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('username', credencial)
        .eq('password_hash', password)
        .single();

      if (error || !usuario) {
        setErrorLogin('Credenciales incorrectas o error de base de datos.');
        setCargando(false);
        return;
      }

      localStorage.setItem('cj_user_id', usuario.id);
      localStorage.setItem('cj_user_rol', usuario.rol);
      localStorage.setItem('cj_user_nombre', usuario.nombre);
      navigate('/');
    } catch (err) {
      setErrorLogin('Error de conexión con Supabase.');
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#020813] relative overflow-hidden">
      <div className="w-full max-w-md p-8 relative z-10">
        <div className="flex flex-col items-center mb-10">
          <img src="/logos_cj_circular.png" className="w-24 h-24 rounded-full border-2 border-[#22d3ee]/30 shadow-2xl" alt="Logo" />
          <h1 className="text-3xl font-black text-white uppercase mt-6">Ecosistema <span className="text-[#22d3ee]">CJ 2.0</span></h1>
        </div>
        <form onSubmit={handleLogin} className="space-y-5 bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl">
          {errorLogin && <div className="text-red-400 text-[10px] font-black p-3 bg-red-500/10 rounded-xl uppercase text-center">{errorLogin}</div>}
          <input type="text" value={credencial} onChange={(e) => setCredencial(e.target.value)} className="w-full bg-black/40 border border-gray-700 text-white rounded-xl px-4 py-3 outline-none focus:border-[#22d3ee]" placeholder="Usuario (jorge)" required />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black/40 border border-gray-700 text-white rounded-xl px-4 py-3 outline-none focus:border-[#22d3ee]" placeholder="Contraseña" required />
          <button type="submit" className="w-full py-4 bg-gradient-to-r from-[#22d3ee] to-[#10b981] text-[#020813] rounded-xl font-black uppercase text-[11px] hover:scale-[1.02] transition-all">
            {cargando ? 'Verificando...' : 'Entrar al Sistema'}
          </button>
        </form>
      </div>
    </div>
  );
}