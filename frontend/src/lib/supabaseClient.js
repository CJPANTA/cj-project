// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// ============================================================
// 🔥 VARIABLES FORZADAS (para producción) - NO USAN import.meta.env
// ============================================================
// Estas variables son las del NUEVO proyecto (cjproject)
// Si cambias de proyecto, actualiza estos valores.
// ============================================================
const SUPABASE_URL_FORZADO = 'https://xjxsuxtehkdtphvgkvbd.supabase.co';
const SUPABASE_ANON_KEY_FORZADO = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqeHN1eHRlaGtkdHBodmdrdmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1MzcyMjUsImV4cCI6MjA5OTExMzIyNX0.edTjIYg8HNlIzA8XPruUl1olk5vn6lvSjKPC8HUzVeA';

// ============================================================
// INTENTAR USAR VARIABLES DE ENTORNO (como fallback)
// ============================================================
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || SUPABASE_URL_FORZADO;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY_FORZADO;

// ============================================================
// DIAGNÓSTICO EN CONSOLA (MUY CLARO)
// ============================================================
console.log('🔍 ==========================================');
console.log('🔍 [supabaseClient] CONEXIÓN A SUPABASE');
console.log('🔍 URL usando:', supabaseUrl);
console.log('🔍 ¿Es la URL del nuevo proyecto?', supabaseUrl === SUPABASE_URL_FORZADO ? '✅ SÍ' : '❌ NO');
console.log('🔍 ==========================================');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ [supabaseClient] Faltan credenciales de Supabase');
}

// ============================================================
// CREACIÓN DEL CLIENTE
// ============================================================
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
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
    }
  } catch (err) {
    console.warn('⚠️ [supabaseClient] Error al verificar conexión:', err.message);
  }
})();

export default supabase;