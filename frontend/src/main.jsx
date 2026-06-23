import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'

// ========================================
// SERVICE WORKER DESACTIVADO PARA DIAGNÓSTICO
// ========================================
// if ('serviceWorker' in navigator && import.meta.env.PROD) {
//   const registerSW = async () => {
//     try {
//       const registration = await navigator.serviceWorker.register('/sw.js', {
//         scope: '/'
//       });
//       console.log('✅ Service Worker registrado con éxito:', registration);
//     } catch (error) {
//       console.warn('⚠️ Service Worker no registrado (la app sigue funcionando):', error);
//     }
//   };
//   registerSW();
// } else {
//   console.log('ℹ️ Service Worker desactivado para diagnóstico.');
// }

console.log('🔧 [main.jsx] Service Worker desactivado - Modo diagnóstico');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);