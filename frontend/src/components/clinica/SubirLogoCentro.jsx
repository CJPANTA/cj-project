import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function SubirLogoCentro({ centroId, onLogoActualizado }) {
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState(null);
  const [logoUrl, setLogoUrl] = useState('');

  // Verificar si el logo existe en la carpeta pública
  const verificarLogo = async () => {
    const url = `/logo_centros/${centroId}.png`;
    try {
      const response = await fetch(url);
      if (response.ok) {
        setLogoUrl(url);
        if (onLogoActualizado) onLogoActualizado(url);
      } else {
        setLogoUrl('');
      }
    } catch (e) {
      setLogoUrl('');
    }
  };

  // Al montar, verificar si ya hay logo
  useState(() => {
    verificarLogo();
  }, [centroId]);

  const handleSubirLogo = async () => {
    alert(`📤 Para actualizar el logo del centro (${centroId}):
1. Guarda la imagen en formato PNG.
2. Nombra el archivo como ${centroId}.png.
3. Colócalo en la carpeta: frontend/public/logo_centros/
4. Haz commit y push a GitHub.
5. Vuelve a cargar esta página.`);
  };

  return (
    <div className="p-4 rounded-xl border border-gray-700">
      <h4 className="text-sm font-bold mb-2">Logo del Centro</h4>
      
      {logoUrl ? (
        <div className="mb-2">
          <img src={logoUrl} alt="Logo del centro" className="max-h-16 rounded-lg border border-gray-600" />
          <p className="text-xs text-green-400 mt-1">✅ Logo actual</p>
        </div>
      ) : (
        <p className="text-xs text-yellow-400 mb-2">⚠️ No hay logo configurado para este centro.</p>
      )}
      
      <button
        onClick={handleSubirLogo}
        className="px-4 py-2 bg-[#22d3ee] text-black font-bold rounded-xl text-sm hover:scale-105 transition-all"
      >
        📤 Subir/Actualizar logo
      </button>
      <p className="text-xs text-gray-400 mt-2">
        Sube el logo a la carpeta <code className="bg-gray-800 px-1 rounded">frontend/public/logo_centros/{centroId}.png</code>
      </p>
    </div>
  );
}