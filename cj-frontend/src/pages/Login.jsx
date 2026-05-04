import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // PASE VIP PARA EL ARQUITECTO DEL SISTEMA (Bypass)
    // Reconocerá 'jorge' o tu correo de gmail al instante
    const usuarioIngresado = email.toLowerCase().trim();
    
    if ((usuarioIngresado === 'jorge' || usuarioIngresado === 'cjpanta1@gmail.com') && password === 'admin123') {
      // Guardamos tu sesión localmente para que el Dashboard te deje pasar
      localStorage.setItem('usuario_cj', 'jorge_admin');
      navigate('/');
      return;
    }

    // Si las credenciales no coinciden con el Pase VIP
    setError('CREDENCIALES INCORRECTAS O ERROR DE BASE DE DATOS.');
  };

  return (
    <div className="min-h-screen bg-[#020813] flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-sm flex flex-col items-center gap-6">
        
        {/* Logo */}
        <div className="w-28 h-28 rounded-full bg-black/50 flex items-center justify-center overflow-hidden border-2 border-gray-800 shadow-xl">
          <img src="/logos_cj_circular.png" alt="Logo CJ" className="w-full h-full object-cover grayscale opacity-80" />
        </div>
        
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter">
          Ecosistema <span className="text-[#22d3ee]">CJ 2.0</span>
        </h1>

        <form onSubmit={handleLogin} className="w-full bg-[#0a141d] border border-gray-800/60 p-6 rounded-[2rem] flex flex-col gap-4 shadow-2xl relative overflow-hidden">
          
          {error && (
            <div className="bg-red-900/30 border border-red-500/20 text-red-400 text-[10px] font-black uppercase p-4 rounded-xl text-center tracking-wider">
              {error}
            </div>
          )}
          
          <input 
            type="text" 
            placeholder="Usuario o Correo" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-[#020813] border border-gray-800 text-white p-4 rounded-xl outline-none focus:border-[#22d3ee]/50 transition-colors text-sm"
          />
          
          <input 
            type="password" 
            placeholder="Contraseña" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-[#020813] border border-gray-800 text-white p-4 rounded-xl outline-none focus:border-[#22d3ee]/50 transition-colors text-sm"
          />

          <button type="submit" className="mt-2 w-full bg-[#22d3ee] text-black font-black uppercase py-4 rounded-xl hover:bg-[#1bc1da] transition-all active:scale-95 text-[11px] tracking-widest shadow-[0_0_20px_rgba(34,211,238,0.2)]">
            Entrar al Sistema
          </button>
        </form>
      </div>
    </div>
  );
}