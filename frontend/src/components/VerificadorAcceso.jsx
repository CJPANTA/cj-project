import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import MuroBloqueo from './MuroBloqueo';

export default function VerificadorAcceso({ children }) {
  const location = useLocation();
  const [verificando, setVerificando] = useState(true);
  const [bloqueado, setBloqueado] = useState(null);
  const [datosCentro, setDatosCentro] = useState(null);

  // Rutas donde NO queremos que salte el bloqueo (Login, Landing, etc.)
  const rutasPublicas = ['/login', '/', '/solicitar-reset', '/terminos', '/privacidad'];
  const esRutaPublica = rutasPublicas.includes(location.pathname);

  useEffect(() => {
    const verificarAcceso = async () => {
      // Si estamos en el login o landing, no verificamos nada y dejamos pasar
      if (esRutaPublica) {
        setVerificando(false);
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setVerificando(false); return; }

        // 1. Obtener perfil
        const { data: perfil } = await supabase
          .from('profiles')
          .select('rol, centro_id')
          .eq('id', user.id)
          .single();

        // 2. Director Global (Rol 1) pasa siempre
        if (perfil?.rol === 1) {
          setVerificando(false);
          return;
        }

        // 3. Si no tiene centro (ej. pacientes sueltos), pasa
        if (!perfil?.centro_id) {
          setVerificando(false);
          return;
        }

        // 4. Verificar estado del centro
        const { data: centro } = await supabase
          .from('centros')
          .select('nombre, estado_pago, fecha_vencimiento')
          .eq('id', perfil.centro_id)
          .single();

        if (centro) {
          setDatosCentro(centro);
          
          const hoy = new Date();
          hoy.setHours(0,0,0,0);
          const fechaVence = centro.fecha_vencimiento ? new Date(centro.fecha_vencimiento + 'T00:00:00') : null;
          
          const estaVencido = fechaVence && fechaVence < hoy;
          const estaSuspendido = centro.estado_pago === 'suspendido';

          if (estaSuspendido || (estaVencido && centro.estado_pago !== 'prueba')) {
             setBloqueado(estaSuspendido ? 'suspendido' : 'vencido');
          } else if (centro.estado_pago === 'prueba' && estaVencido) {
             setBloqueado('vencido');
          }
        }
      } catch (error) {
        console.error('Error verificando acceso:', error);
      } finally {
        setVerificando(false);
      }
    };

    verificarAcceso();
  }, [location.pathname, esRutaPublica]);

  if (verificando) {
    return (
      <div className="min-h-screen bg-[#020813] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#22d3ee] border-t-transparent"></div>
      </div>
    );
  }

  if (bloqueado && datosCentro) {
    return (
      <MuroBloqueo 
        estado={bloqueado} 
        centro={datosCentro.nombre} 
        fechaVencimiento={datosCentro.fecha_vencimiento} 
      />
    );
  }

  return children;
}