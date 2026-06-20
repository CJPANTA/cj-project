import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt', 'logos_cj_circular.png'],
      manifest: {
        name: 'CJ Fisioterapia',
        short_name: 'CJ',
        description: 'Ecosistema de Salud - Academia y Clínica',
        theme_color: '#0a141d',
        background_color: '#0a141d',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        icons: [
          {
            src: '/icon-144x144.png',
            sizes: '144x144',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icon-144x144.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icon-144x144.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,json,woff2}'],
        runtimeCaching: [
          // Cache para el mapa de datos (estructura del repositorio)
          {
            urlPattern: /^https:\/\/raw\.githubusercontent\.com\/CJPANTA\/cj-project\/main\/BASE_DATOS\/03_CONFIG\/mapa_carrion\.json/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'data-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 días
              }
            }
          },
          // Cache para imágenes y logos
          {
            urlPattern: /^https:\/\/raw\.githubusercontent\.com\/CJPANTA\/cj-project\/main\/.*\.(png|jpg|jpeg|svg)/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 días
              }
            }
          }
        ]
      }
    })
  ]
});