import { supabase } from '../lib/supabaseClient';

export default function MuroBloqueo({ estado, centro, fechaVencimiento }) {
  const esSuspendido = estado === 'suspendido';
  
  const handleWhatsApp = () => {
    // Aquí puedes poner tu número de celular real para que te contacten
    const tel = '51999999999'; // CAMBIA ESTO POR TU NÚMERO
    const texto = encodeURIComponent(`Hola Director, soy del centro ${centro || ''}. Mi cuenta figura como ${estado}. ¿Me puedes ayudar a reactivar mi acceso?`);
    window.open(`https://wa.me/${tel}?text=${texto}`, '_blank');
  };

  const handleCerrarSesion = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-[#020813] flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-[#0a141d] border border-red-500/30 rounded-3xl p-8 shadow-2xl text-center">
        
        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-red-500/20">
          <span className="text-5xl">🔒</span>
        </div>

        <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
          Acceso <span className="text-red-500">Bloqueado</span>
        </h1>
        
        <p className="text-gray-400 text-sm mb-6">
          {esSuspendido 
            ? 'Tu centro ha sido suspendido temporalmente por el Director General.' 
            : 'El periodo de prueba o plan de tu centro ha vencido.'}
        </p>

        <div className="bg-[#020813] border border-gray-800 rounded-xl p-4 mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-500 font-bold uppercase">Centro</span>
            <span className="text-sm text-white font-bold">{centro || 'Desconocido'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 font-bold uppercase">Estado</span>
            <span className={`text-xs font-black uppercase px-2 py-0.5 rounded ${esSuspendido ? 'bg-gray-500/20 text-gray-400' : 'bg-red-500/20 text-red-400'}`}>
              {estado}
            </span>
          </div>
        </div>

        <p className="text-xs text-gray-400 mb-6">
          Para restaurar el acceso a tus pacientes y herramientas, por favor comunícate con el Director General para regularizar tu pago.
        </p>

        <div className="space-y-3">
          <button 
            onClick={handleWhatsApp}
            className="w-full py-3 bg-emerald-500 text-white font-black rounded-xl text-sm hover:scale-105 transition-all shadow-lg shadow-emerald-500/20"
          >
            💬 Contactar al Director por WhatsApp
          </button>
          
          <button 
            onClick={handleCerrarSesion}
            className="w-full py-3 bg-transparent border border-gray-700 text-gray-400 font-bold rounded-xl text-sm hover:bg-gray-800 transition-all"
          >
            Cerrar Sesión
          </button>
        </div>

      </div>
    </div>
  );
}