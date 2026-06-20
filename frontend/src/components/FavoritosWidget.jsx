import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'cj_favoritos';

export default function FavoritosWidget({ temaOscuro }) {
  const [favoritos, setFavoritos] = useState([]);

  // Cargar favoritos al montar y migrar formato antiguo
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Verificar si es un array y si los elementos son objetos o strings
        if (Array.isArray(parsed)) {
          const migrados = parsed.map(item => {
            // Si es string (formato antiguo), convertirlo a objeto con valores por defecto
            if (typeof item === 'string') {
              return {
                nombre: item,
                ciclo: 'CICLO_01',      // Valor por defecto
                materia: 'General',      // Valor por defecto
              };
            }
            // Si ya es objeto pero le falta ciclo o materia, asignar valores por defecto
            if (typeof item === 'object' && item !== null) {
              return {
                nombre: item.nombre || 'Sin nombre',
                ciclo: item.ciclo || 'CICLO_01',
                materia: item.materia || 'General',
              };
            }
            return item;
          });
          setFavoritos(migrados);
          // Guardar la versión migrada en localStorage
          localStorage.setItem(STORAGE_KEY, JSON.stringify(migrados));
        } else {
          setFavoritos([]);
        }
      } catch (e) {
        console.error('Error al cargar favoritos:', e);
        setFavoritos([]);
      }
    }
  }, []);

  // Escuchar cambios en localStorage (desde otras pestañas)
  useEffect(() => {
    const handleStorage = () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            const migrados = parsed.map(item => {
              if (typeof item === 'string') {
                return {
                  nombre: item,
                  ciclo: 'CICLO_01',
                  materia: 'General',
                };
              }
              if (typeof item === 'object' && item !== null) {
                return {
                  nombre: item.nombre || 'Sin nombre',
                  ciclo: item.ciclo || 'CICLO_01',
                  materia: item.materia || 'General',
                };
              }
              return item;
            });
            setFavoritos(migrados);
          }
        } catch (e) {
          console.error('Error al actualizar favoritos desde storage:', e);
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Abrir el PDF directamente
  const abrirPDF = (favorito) => {
    const { nombre, ciclo, materia } = favorito;
  // Si la materia es "General" (de los favoritos antiguos), la reemplazamos.
  // Esta es una lista de las carpetas reales que vi en tu repositorio.
  // Puedes ampliarla si faltan materias.
  const carpetasReales = {
    'general': 'anatomia_y_fisiologia', // Ajusta según tus carpetas
    // ... añade más mapeos si es necesario
  };
  let materiaReal = materia;
  // Si la materia guardada es "General" o no coincide con el formato de GitHub...
  if (materia.toLowerCase() === 'general' || !materia.includes('_')) {
    // Intentamos encontrar un mapeo, o usamos el nombre en minúsculas con guiones bajos.
    materiaReal = carpetasReales[materia.toLowerCase()] || materia.toLowerCase().replace(/ /g, '_');
  }

  const m_segura = encodeURIComponent(materiaReal);
  const a_seguro = encodeURIComponent(nombre);
  const urlCruda = `https://raw.githubusercontent.com/CJPANTA/cj-project/main/BASE_DATOS/01_CARRION/${ciclo}/${m_segura}/${a_seguro}`;
  window.open(urlCruda, '_blank');
};

  // Quitar de favoritos
  const toggleFavorito = (nombre) => {
    const nuevos = favoritos.filter(f => f.nombre !== nombre);
    setFavoritos(nuevos);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevos));
  };

  const bgCard = temaOscuro ? 'bg-black/20 border-gray-800' : 'bg-white border-gray-200 shadow-sm';
  const textoColor = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const subTexto = temaOscuro ? 'text-gray-400' : 'text-gray-600';

  if (favoritos.length === 0) {
    return (
      <div className={`${bgCard} p-5 rounded-2xl border`}>
        <h3 className={`text-sm font-black uppercase tracking-wider ${textoColor}`}>⭐ Favoritos</h3>
        <p className={`text-xs ${subTexto} text-center py-4`}>
          No tienes PDFs favoritos aún. Ve al Repositorio y marca ⭐ algunos.
        </p>
      </div>
    );
  }

  return (
    <div className={`${bgCard} p-5 rounded-2xl border`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-sm font-black uppercase tracking-wider ${textoColor}`}>⭐ Mis Favoritos</h3>
        <Link to="/area-estudio" className="text-[#22d3ee] text-xs font-black uppercase hover:underline">
          Ver todos
        </Link>
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {favoritos.map((fav, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-xl border ${temaOscuro ? 'border-gray-800' : 'border-gray-200'} flex justify-between items-center gap-2 group hover:bg-[#22d3ee]/5 transition-all`}
          >
            <button
              onClick={() => abrirPDF(fav)}
              className={`text-xs font-medium ${textoColor} hover:text-[#22d3ee] transition-colors text-left flex-1 truncate`}
              title="Abrir PDF"
            >
              📄 {fav.nombre}
            </button>
            <button
              onClick={() => toggleFavorito(fav.nombre)}
              className="text-yellow-400 hover:text-yellow-300 transition-colors text-sm"
              title="Quitar de favoritos"
            >
              ⭐
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}