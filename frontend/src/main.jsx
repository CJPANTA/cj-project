import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// ============================================================
// SERVICE WORKER DESACTIVADO TEMPORALMENTE (Modo diagnóstico)
// ============================================================
// El Service Worker se ha desactivado para descartar que cause
// el error de login en producción. Se reactivará cuando la app
// esté estable.
// ============================================================
console.log('🔧 [main.jsx] Service Worker desactivado - Modo diagnóstico');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);