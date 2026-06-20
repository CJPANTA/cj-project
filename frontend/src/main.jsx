import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'

// Registrar el Service Worker para PWA con manejo de actualización
if ('serviceWorker' in navigator) {
  const registerSW = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('Service Worker registrado con éxito:', registration)

      // Escuchar actualizaciones del Service Worker
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        console.log('Nuevo Service Worker encontrado:', newWorker)
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('Nuevo Service Worker instalado. Recarga para actualizar.')
              // Mostrar notificación al usuario para que recargue
              if (confirm('Nueva versión disponible. ¿Recargar ahora?')) {
                window.location.reload()
              }
            }
          })
        }
      })

      // Verificar actualizaciones periódicamente (cada hora)
      setInterval(() => {
        registration.update()
        console.log('Verificando actualizaciones del Service Worker...')
      }, 60 * 60 * 1000) // 1 hora

    } catch (error) {
      console.error('Error al registrar el Service Worker:', error)
    }
  }

  registerSW()
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)