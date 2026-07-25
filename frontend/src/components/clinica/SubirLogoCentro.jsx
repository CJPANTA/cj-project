import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function SubirLogoCentro({ centroId, onLogoActualizado }) {
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecciona una imagen (PNG, JPG, etc.)');
      return;
    }

    // Validar tamaño (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('La imagen no debe superar los 2MB');
      return;
    }

    setSubiendo(true);
    setError(null);

    try {
      // ✅ Usar el nombre original del archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${centroId}_logo.${fileExt}`; // CJ000_logo.png
      const filePath = `logos_centros/${fileName}`;

      console.log('📤 Subiendo archivo:', filePath);

      // Subir a Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('logos_centros')
        .upload(filePath, file, { 
          upsert: true,
          contentType: file.type 
        });

      if (uploadError) {
        console.error('❌ Error de subida:', uploadError);
        throw uploadError;
      }

      console.log('✅ Archivo subido:', data);

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('logos_centros')
        .getPublicUrl(filePath);

      console.log('🔗 URL pública:', publicUrl);

      // Actualizar la tabla centros con la URL del logo
      const { error: updateError } = await supabase
        .from('centros')
        .update({ logo_url: publicUrl })
        .eq('id', centroId);

      if (updateError) {
        console.error('❌ Error al actualizar centros:', updateError);
        throw updateError;
      }

      alert('✅ Logo actualizado correctamente.');
      if (onLogoActualizado) onLogoActualizado(publicUrl);
    } catch (err) {
      console.error('❌ Error completo:', err);
      setError('Error al subir el logo: ' + err.message);
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div className="p-4 rounded-xl border border-gray-700">
      <h4 className="text-sm font-bold mb-2">Logo del Centro</h4>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={subiendo}
        className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-[#22d3ee] file:text-black hover:file:opacity-80"
      />
      {subiendo && <p className="text-xs text-gray-400 mt-2">Subiendo logo...</p>}
      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
    </div>
  );
}