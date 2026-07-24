import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logos_cj_circular.png'],
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
            src: '/logos_cj_circular.png',
            sizes: '144x144',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        navigateFallback: 'index.html',
        cleanUrls: false,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,json,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/raw\.githubusercontent\.com\/CJPANTA\/cj-project\/main\/BASE_DATOS\/03_CONFIG\/mapa_carrion\.json/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'data-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 7
              }
            }
          }
        ]
      }
    })
  ]
});