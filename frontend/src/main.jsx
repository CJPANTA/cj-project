import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'

// Registrar el Service Worker solo en producción (o si no estamos en localhost)
const isProduction = import.meta.env.PROD;

if ('serviceWorker' in navigator && isProduction) {
  const registerSW = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      console.log('✅ Service Worker registrado con éxito:', registration);

      // Detectar nueva versión sin recarga forzosa (solo aviso)
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        console.log('🔄 Nuevo Service Worker encontrado:', newWorker);
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('📢 Nueva versión disponible. La próxima recarga aplicará los cambios.');
              // Podrías mostrar una notificación no intrusiva aquí (opcional)
            }
          });
        }
      });

      // Verificar actualizaciones cada hora (solo si hay conexión)
      setInterval(() => {
        registration.update().catch(err => console.warn('⚠️ Error al actualizar SW:', err));
      }, 60 * 60 * 1000);

    } catch (error) {
      console.warn('⚠️ El Service Worker no se pudo registrar (la app sigue funcionando):', error);
    }
  };

  registerSW();
} else {
  console.log('ℹ️ Service Worker no registrado en desarrollo (o navegador no soportado).');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);