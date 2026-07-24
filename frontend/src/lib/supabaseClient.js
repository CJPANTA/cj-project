// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// ============================================================
// CONFIGURACIÓN FORZADA (HARDCODEADA) PARA PRODUCCIÓN
// ============================================================
// Esta configuración se usa para forzar la conexión al nuevo proyecto
// mientras se soluciona el problema de las variables de entorno en Vercel.
// ============================================================
const SUPABASE_URL = 'https://xjxsuxtehkdtphvgkvbd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqeHN1eHRlaGtkdHBodmdrdmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1MzcyMjUsImV4cCI6MjA5OTExMzIyNX0.edTjIYg8HNlIzA8XPruUl1olk5vn6lvSjKPC8HUzVeA';

// ============================================================
// DIAGNÓSTICO: Verificar configuración
// ============================================================
console.log('🔍 [supabaseClient] Configuración FORZADA:');
console.log('   URL:', SUPABASE_URL);
console.log('   ANON KEY:', SUPABASE_ANON_KEY ? '✅ OK (No se muestra por seguridad)' : '❌ FALTA');

// ============================================================
// CREACIÓN DEL CLIENTE DE SUPABASE
// ============================================================
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// ============================================================
// DIAGNÓSTICO: Verificar conexión
// ============================================================
(async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.warn('⚠️ [supabaseClient] Error al obtener sesión:', error.message);
    } else {
      console.log('✅ [supabaseClient] Conexión a Supabase establecida correctamente.');
      console.log('📌 [supabaseClient] Sesión actual:', data.session ? 'Usuario logueado' : 'Sin sesión');
    }
  } catch (err) {
    console.warn('⚠️ [supabaseClient] Error al verificar conexión:', err.message);
  }
})();

// ============================================================
// EXPORTAR SUPABASE CLIENT PARA USO EN TODA LA APP
// ============================================================
export default supabase;