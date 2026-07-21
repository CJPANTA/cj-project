// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// ============================================================
// LECTURA DE VARIABLES DE ENTORNO
// ============================================================
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ============================================================
// DIAGNÓSTICO EN CONSOLA (para verificar en producción)
// ============================================================
console.log('🔍 [supabaseClient] VITE_SUPABASE_URL:', supabaseUrl);
console.log('🔍 [supabaseClient] VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ OK (oculto por seguridad)' : '❌ FALTA');

// ============================================================
// VALIDACIÓN DE CREDENCIALES
// ============================================================
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ [supabaseClient] Faltan credenciales de Supabase en el archivo .env');
  console.error('   → Revisa que el archivo .env tenga:');
  console.error('   - VITE_SUPABASE_URL');
  console.error('   - VITE_SUPABASE_ANON_KEY');
}

// ============================================================
// CREACIÓN DEL CLIENTE DE SUPABASE
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