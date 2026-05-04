import { useState, useEffect } from 'react';

export default function ConfiguracionAura({ temaOscuro }) {
  const [rol, setRol] = useState('');
  const [nombre, setNombre] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [estado, setEstado] = useState('');

  useEffect(() => {
    // Leemos quién está conectado
    setRol(localStorage.getItem('cj_user_rol') || 'estudiante');
    setNombre(localStorage.getItem('cj_user_nombre') || 'Usuario');
    
    // Buscamos si ya tiene una llave guardada en su navegador
    const keyGuardada = localStorage.getItem('cj_user_api_key');
    if (keyGuardada) setApiKey(keyGuardada);
  }, []);

  const guardarLlave = () => {
    if (!apiKey.trim()) {
      setEstado('⚠️ La llave no puede estar vacía.');
      return;
    }
    localStorage.setItem('cj_user_api_key', apiKey);
    setEstado('✅ Llave guardada y encriptada en tu dispositivo.');
    setTimeout(() => setEstado(''), 3000);
  };

  const bgPanel = temaOscuro ? 'bg-[#0a141d]' : 'bg-white shadow-xl';
  const bgTarjeta = temaOscuro ? 'bg-black/40' : 'bg-gray-50';
  const textoColor = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const bordeColor = temaOscuro ? 'border-gray-800' : 'border-gray-200';

  return (
    <main className={`${bgPanel} border ${bordeColor} rounded-3xl p-6 md:p-10 h-full overflow-y-auto animate-fade-in`}>
      <header className="mb-10 border-b border-gray-500/20 pb-6">
        <h1 className={`text-3xl md:text-4xl font-black uppercase tracking-tighter ${textoColor}`}>
          Configuración de <span className="text-[#22d3ee]">Aura AI</span>
        </h1>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-2">
          Gestor de Inteligencia Clínica
        </p>
      </header>

      <div className="max-w-2xl mx-auto">
        
        {/* VISTA 1: MODO ADMINISTRADOR (Tú) */}
        {rol === 'admin' ? (
          <div className={`${bgTarjeta} border border-[#22d3ee]/30 rounded-3xl p-8 text-center shadow-[0_0_30px_rgba(34,211,238,0.1)] relative overflow-hidden`}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#22d3ee] to-transparent"></div>
            <div className="w-20 h-20 bg-[#22d3ee]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">👑</span>
            </div>
            <h2 className={`text-xl font-black uppercase tracking-widest ${textoColor} mb-2`}>
              Acceso Máximo Concedido
            </h2>
            <p className="text-[#22d3ee] font-bold text-sm mb-4">Director: {nombre}</p>
            <p className="text-gray-400 text-xs leading-relaxed">
              Sistema Central Conectado. Tus credenciales de administrador están encriptadas en el servidor maestro (Variables de Entorno). Tienes tokens de inteligencia artificial ilimitados para todo el ecosistema.
            </p>
          </div>
        ) : (
          
          /* VISTA 2: MODO ESTUDIANTE / LICENCIADO (Los demás) */
          <div className={`${bgTarjeta} border ${bordeColor} rounded-3xl p-8`}>
             <div className="w-16 h-16 bg-[#10b981]/10 rounded-full flex items-center justify-center mb-6">
              <span className="text-3xl">🔑</span>
            </div>
            <h2 className={`text-xl font-black uppercase tracking-widest ${textoColor} mb-2`}>
              Tu Llave de Inteligencia
            </h2>
            <p className="text-gray-500 text-xs font-bold mb-6">
              Hola, {nombre}. Para que Aura pueda analizar tus casos clínicos y generarte exámenes personalizados, necesitas conectar tu propia llave (API Key) gratuita.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 pl-1">
                  Google AI Studio - API Key
                </label>
                <input 
                  type="password" 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className={`w-full p-4 rounded-xl border text-sm outline-none transition-all ${temaOscuro ? 'bg-black text-white border-gray-700 focus:border-[#10b981]' : 'bg-white text-gray-800 border-gray-300 focus:border-[#10b981]'}`}
                  placeholder="Pega tu llave aquí (ej. AIzaSyB...)"
                />
              </div>

              <button 
                onClick={guardarLlave}
                className="w-full py-4 bg-gradient-to-r from-[#10b981] to-[#059669] text-white rounded-xl font-black uppercase text-[11px] tracking-widest hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all"
              >
                Vincular Inteligencia
              </button>

              {estado && (
                <p className={`text-center text-[10px] font-black uppercase tracking-widest mt-4 ${estado.includes('✅') ? 'text-[#10b981]' : 'text-red-400'}`}>
                  {estado}
                </p>
              )}

              <div className="mt-8 pt-6 border-t border-gray-500/20">
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-[#22d3ee] text-[10px] font-bold uppercase tracking-widest hover:underline flex items-center gap-2">
                  <span>→</span> ¿No tienes una llave? Consíguela gratis aquí
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}