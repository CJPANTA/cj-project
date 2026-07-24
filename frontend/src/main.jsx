import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// ============================================================
// REGISTRO DEL SERVICE WORKER (PWA)
// ============================================================
// El Service Worker se registra solo en producción para que
// la app sea instalable y funcione offline.
// ============================================================

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  const registerSW = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      console.log('✅ Service Worker registrado con éxito:', registration);
    } catch (error) {
      console.warn('⚠️ Service Worker no registrado (la app sigue funcionando):', error);
    }
  };
  // Esperar a que la página cargue completamente antes de registrar
  window.addEventListener('load', registerSW);
} else {
  console.log('ℹ️ Service Worker activo solo en producción.');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);