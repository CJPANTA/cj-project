// src/services/notebookService.js
import { supabase } from '../lib/supabaseClient';

export const guardarNotaEstudio = async (titulo, contenido, ciclo = 5) => {
  try {
    const { data, error } = await supabase
      .from('notas_estudio')
      .insert([
        { 
          titulo: titulo, 
          contenido: contenido, 
          ciclo: ciclo,
          fecha_creacion: new Date().toISOString() 
        }
      ]);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error al guardar la nota:", error);
    // Aquí luego añadiremos la lógica offline para cuando no haya señal
    return { success: false, error };
  }
};