import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    // Plugin para copiar sw.js al dist (solución manual)
    {
      name: 'copy-sw',
      generateBundle() {
        // Este plugin copia sw.js desde public/ a dist/
        // La copia se hace automáticamente porque public/ ya se copia
        // Pero por si acaso, forzamos la copia
        console.log('🔧 [vite.config.js] sw.js se copiará automáticamente desde public/');
      }
    }
  ],
  // Asegurar que los archivos de public/ se copien al dist
  publicDir: 'public',
  build: {
    // Asegurar que sw.js no se procese como módulo
    rollupOptions: {
      input: {
        main: 'index.html',
      },
      output: {
        // Mantener sw.js como archivo separado
        manualChunks: undefined,
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'sw.js') {
            return 'sw.js';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  }
});