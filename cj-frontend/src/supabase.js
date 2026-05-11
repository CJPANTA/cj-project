import { createClient } from '@supabase/supabase-js';

// Extraemos las llaves de tu caja fuerte (.env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Creamos y exportamos la conexión oficial
export const supabase = createClient(supabaseUrl, supabaseAnonKey);