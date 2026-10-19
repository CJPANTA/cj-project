// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Headers para permitir llamadas desde el navegador (CORS)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Manejo de la petición preflight (OPTIONS) que hace el navegador
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Verificamos que tengamos la clave secreta de administrador
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Faltan las variables de entorno (SUPABASE_URL o SERVICE_ROLE_KEY).");
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // 2. Leemos los datos del paciente
    const { email, password, nombre_completo, rol, centro_id } = await req.json();

    if (!email || !password || !nombre_completo) {
      return new Response(JSON.stringify({ error: 'Faltan campos obligatorios (email, password, nombre_completo).' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // 3. Creamos el usuario en Auth
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: { nombre_completo: nombre_completo, rol: rol, centro_id: centro_id }
    });

    if (userError) {
      if (userError.message.includes("already exists")) {
        throw new Error(`El correo ${email} ya está registrado. Intenta con otro nombre.`);
      }
      throw userError;
    }

    // 4. Creamos el perfil en la tabla 'profiles'
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userData.user.id,
        nombre_completo: nombre_completo,
        email: email,
        rol: rol,
        estado: 'aprobado',
        centro_id: centro_id,
      });

    // Si el perfil ya existe (porque el trigger lo creó), ignoramos el error
    if (profileError && !profileError.message.includes("duplicate key")) {
      throw profileError;
    }

    // 5. Devolvemos el ID del usuario
    return new Response(JSON.stringify({ user_id: userData.user.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error en la función:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});