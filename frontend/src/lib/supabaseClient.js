// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 🔍 DIAGNÓSTICO: Verificar que las variables existen
console.log('🔍 SUPABASE_URL:', supabaseUrl);
console.log('🔍 SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ OK (No se muestra por seguridad)' : '❌ FALTA');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Faltan credenciales de Supabase en el archivo .env");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);