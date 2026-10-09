// ============================================================
// src/pages/SolicitarReset.jsx
// Página pública para pedir reset de contraseña
// El usuario escribe su correo corporativo
// El sistema crea una solicitud que el admin verá en su panel
// ============================================================
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function SolicitarReset() {
  const [email, setEmail] = useState('');
  const [cargando, setCargando] = useState(false);
  const [exito, setExito] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Ingresa tu correo de acceso');
      return;
    }

    setCargando(true);

    try {
      const emailLimpio = email.trim().toLowerCase();

      // 1) Verificar que el correo existe usando RPC con SECURITY DEFINER
      // (funciona sin login porque la función bypassa RLS)
      const { data: resultados, error: errPerfil } = await supabase
        .rpc('buscar_usuario_para_reset', { email_buscado: emailLimpio });

      if (errPerfil) throw errPerfil;

      const perfil = resultados && resultados.length > 0 ? resultados[0] : null;

      if (!perfil) {
        setError('Ese correo no está registrado en CJ Fisio. Verifica que esté bien escrito.');
        setCargando(false);
        return;
      }

      // 2) Verificar si ya hay una solicitud pendiente reciente (RPC)
      const { data: tieneReciente, error: errCheck } = await supabase
        .rpc('tiene_solicitud_pendiente_reciente', { usuario: perfil.id });

      if (errCheck) throw errCheck;

      if (tieneReciente) {
        // Ya existe una solicitud pendiente; no duplicamos, mostramos éxito
        setExito(true);
        setCargando(false);
        return;
      }

      // 3) Crear la solicitud
      const { error: errInsert } = await supabase
        .from('solicitudes_reset')
        .insert([{
          usuario_id: perfil.id,
          email_solicitado: emailLimpio,
          centro_id: perfil.centro_id || null,
          estado: 'pendiente',
        }]);

      if (errInsert) throw errInsert;

      setExito(true);
      setCargando(false);
    } catch (err) {
      console.error('Error al solicitar reset:', err);
      setError('Error inesperado: ' + err.message);
      setCargando(false);
    }
  };

  const inputClass = 'w-full bg-[#020813] border border-gray-800 text-white p-3 rounded-xl outline-none focus:border-[#22d3ee]/50 transition-colors text-sm';
  const labelClass = 'block text-[10px] text-gray-400 uppercase font-bold mb-2 pl-1';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020813] to-[#0a141d] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        {/* LOGO */}
        <div className="text-center mb-8">
          <img
            src="/logos_cj_circular.png"
            alt="CJ Fisioterapia"
            className="w-24 h-24 mx-auto mb-4 rounded-full border-2 border-[#22d3ee]/30 shadow-lg"
          />
          <h1 className="text-3xl font-black text-white tracking-tighter">
            CJ <span className="text-[#22d3ee]">Fisioterapia</span>
          </h1>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">
            Ecosistema de Salud
          </p>
        </div>

        <div className="bg-[#0a141d] border border-gray-800/60 rounded-2xl p-8 shadow-2xl">
          {!exito ? (
            <>
              <div className="text-center mb-6">
                <div className="inline-block p-3 rounded-full bg-[#22d3ee]/10 border border-[#22d3ee]/30 mb-3">
                  <span className="text-2xl">🔑</span>
                </div>
                <h2 className="text-xl font-black text-white mb-1">
                  Recuperar Contraseña
                </h2>
                <p className="text-xs text-gray-400">
                  Escribe tu correo de acceso y notificaremos a tu administrador
                </p>
              </div>

              {error && (
                <div className="mb-6 bg-red-900/30 border border-red-500/20 text-red-400 text-xs font-black uppercase p-3 rounded-xl text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className={labelClass}>Correo de acceso</label>
                  <input
                    type="email"
                    placeholder="tu.correo@centro.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    required
                    autoFocus
                  />
                  <p className="text-[9px] text-gray-500 mt-1 pl-1">
                    Es el correo con el que entras (ej: juan.perez@cj.com)
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={cargando}
                  className="w-full mt-2 bg-[#22d3ee] text-black font-black uppercase py-3 rounded-xl hover:bg-[#1bc1da] transition-all active:scale-95 text-xs tracking-widest shadow-[0_0_15px_rgba(34,211,238,0.3)] disabled:opacity-50"
                >
                  {cargando ? 'Enviando solicitud...' : 'Notificar al Administrador'}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-800/60 text-center">
                <Link
                  to="/login"
                  className="text-[11px] text-gray-500 hover:text-[#22d3ee] transition-colors uppercase font-bold tracking-wider"
                >
                  ← Volver al inicio de sesión
                </Link>
              </div>
            </>
          ) : (
            // ===== ESTADO DE ÉXITO =====
            <>
              <div className="text-center mb-6">
                <div className="inline-block p-4 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-4">
                  <span className="text-4xl">✅</span>
                </div>
                <h2 className="text-xl font-black text-white mb-2">
                  Solicitud Enviada
                </h2>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Tu administrador fue notificado. <br />
                  Contáctalo por <strong className="text-emerald-400">WhatsApp o llamada</strong> para que reactive tu cuenta.
                </p>
              </div>

              <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 mb-6">
                <p className="text-[10px] text-blue-300 font-bold uppercase tracking-wider mb-2">
                  💡 ¿Qué pasa ahora?
                </p>
                <ol className="text-xs text-blue-200 space-y-1.5 pl-4 list-decimal">
                  <li>Tu administrador recibirá la solicitud en su panel</li>
                  <li>Reseteará tu contraseña a una temporal (<code className="bg-black/30 px-1 rounded">12345678</code>)</li>
                  <li>Te avisará por WhatsApp</li>
                  <li>Entra con esa contraseña y cámbiala</li>
                </ol>
              </div>

              <Link
                to="/login"
                className="block w-full text-center bg-[#22d3ee] text-black font-black uppercase py-3 rounded-xl hover:bg-[#1bc1da] transition-all active:scale-95 text-xs tracking-widest"
              >
                Volver al Inicio de Sesión
              </Link>
            </>
          )}
        </div>

        <p className="text-center text-[9px] text-gray-600 mt-6">
          © {new Date().getFullYear()} CJ Proyectos · Ecosistema de Salud
        </p>
      </div>
    </div>
  );
}