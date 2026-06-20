// src/components/NotificacionesActivador.jsx
import { useState, useEffect } from 'react';
import { verificarNotificacion, mostrarNotificacion } from '../utils/notificaciones';

const NOTIFICACIONES_KEY = 'cj_notificaciones_activadas';

export default function NotificacionesActivador({ temaOscuro }) {
  const [activado, setActivado] = useState(false);
  const [permiso, setPermiso] = useState(null);

  useEffect(() => {
    // Cargar preferencia desde localStorage
    const guardado = localStorage.getItem(NOTIFICACIONES_KEY);
    if (guardado === 'true') {
      setActivado(true);
    }

    // Verificar permiso de notificaciones
    if ('Notification' in window) {
      setPermiso(Notification.permission);
    } else {
      setPermiso('denied');
    }
  }, []);

  // Efecto para iniciar/detener el intervalo
  useEffect(() => {
    if (!activado || permiso !== 'granted') {
      // Si no está activado o no hay permiso, no hacer nada
      return;
    }

    // Función que revisa y muestra notificación si corresponde
    const revisar = () => {
      const clase = verificarNotificacion();
      if (clase) {
        mostrarNotificacion(clase);
      }
    };

    // Revisar inmediatamente al activar
    revisar();

    // Revisar cada 5 minutos
    const intervalo = setInterval(revisar, 5 * 60 * 1000);

    return () => clearInterval(intervalo);
  }, [activado, permiso]);

  const toggleNotificaciones = () => {
    if (!('Notification' in window)) {
      alert('Tu navegador no soporta notificaciones.');
      return;
    }

    if (Notification.permission === 'denied') {
      alert('Las notificaciones están bloqueadas en este navegador. Por favor, permite las notificaciones desde la configuración de tu navegador.');
      return;
    }

    // Si no está activado, pedir permiso
    if (!activado) {
      Notification.requestPermission().then((result) => {
        if (result === 'granted') {
          setPermiso('granted');
          setActivado(true);
          localStorage.setItem(NOTIFICACIONES_KEY, 'true');
        } else {
          alert('No se concedió permiso para notificaciones.');
        }
      });
    } else {
      // Desactivar
      setActivado(false);
      localStorage.setItem(NOTIFICACIONES_KEY, 'false');
    }
  };

  const bgCard = temaOscuro ? 'bg-black/20 border-gray-800' : 'bg-white border-gray-200 shadow-sm';
  const textoColor = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const subTexto = temaOscuro ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className={`${bgCard} p-4 rounded-2xl border flex items-center justify-between`}>
      <div>
        <h3 className={`text-sm font-black uppercase tracking-wider ${textoColor}`}>
          🔔 Notificaciones
        </h3>
        <p className={`text-[10px] ${subTexto}`}>
          {activado && permiso === 'granted'
            ? '✅ Activado: recibirás avisos de clases próximas'
            : '❌ Desactivado: no recibirás avisos'}
        </p>
      </div>
      <button
        onClick={toggleNotificaciones}
        className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${
          activado && permiso === 'granted'
            ? 'bg-green-600 text-white hover:bg-green-700'
            : 'bg-gray-600 text-white hover:bg-gray-700'
        }`}
      >
        {activado && permiso === 'granted' ? 'Desactivar' : 'Activar'}
      </button>
    </div>
  );
}