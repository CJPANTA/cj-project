// ============================================================
// src/components/clinica/StickmanFrames.jsx
// Muestra los 3 frames (inicio/medio/fin) de un ejercicio
// Si no hay frames validados, hace fallback al stickman genérico
// ============================================================
import { useState, useEffect } from 'react';
import EjercicioPreview from './EjercicioPreview';

let CACHE_SVGS = null;
let PROMESA_CARGA = null;

const cargarSvgs = async () => {
  if (CACHE_SVGS) return CACHE_SVGS;
  if (PROMESA_CARGA) return PROMESA_CARGA;

  PROMESA_CARGA = fetch('/data/stickman_svgs.json')
    .then((res) => {
      if (!res.ok) throw new Error('No se pudo cargar stickman_svgs.json');
      return res.json();
    })
    .then((data) => {
      CACHE_SVGS = data;
      return data;
    })
    .catch((err) => {
      console.error('❌ Error cargando stickman:', err);
      CACHE_SVGS = {};
      return {};
    });

  return PROMESA_CARGA;
};

export default function StickmanFrames({
  ejercicioId,
  tamaño = 'small', // 'small' | 'medium' | 'large'
  mostrarLabels = true,
  temaOscuro = true,
  posicionFallback = 'bipedo',
}) {
  const [svgs, setSvgs] = useState(CACHE_SVGS);
  const [cargando, setCargando] = useState(!CACHE_SVGS);

  useEffect(() => {
    if (CACHE_SVGS) {
      setSvgs(CACHE_SVGS);
      setCargando(false);
      return;
    }
    let activo = true;
    cargarSvgs().then((data) => {
      if (activo) {
        setSvgs(data);
        setCargando(false);
      }
    });
    return () => { activo = false; };
  }, []);

  // Tamaños (por frame)
  const alturas = {
    small: 'w-14 h-14',
    medium: 'w-20 h-20',
    large: 'w-28 h-28',
  };
  const altura = alturas[tamaño] || alturas.small;

  // Loading
  if (cargando) {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`${altura} rounded-lg ${temaOscuro ? 'bg-black/20' : 'bg-gray-100'} animate-pulse`} />
        ))}
      </div>
    );
  }

  // No hay SVG para este ejercicio → FALLBACK al genérico
  const frames = svgs?.[ejercicioId];
  if (!frames || !frames.inicio) {
    return (
      <EjercicioPreview
        posicion={posicionFallback}
        tamaño={tamaño}
        temaOscuro={temaOscuro}
      />
    );
  }

  // Render 3 frames lado a lado
  const labels = { inicio: 'Inicio', medio: 'Medio', fin: 'Fin' };

  return (
    <div className="flex gap-1 items-end">
      {['inicio', 'medio', 'fin'].map((frameKey) => {
        const svg = frames[frameKey];
        if (!svg) return null;
        return (
          <div key={frameKey} className="flex flex-col items-center">
            <div
              className={`${altura} rounded-lg overflow-hidden ${temaOscuro ? 'bg-white/5' : 'bg-white'}`}
              dangerouslySetInnerHTML={{
                __html: svg.replace(
                  /<svg /,
                  '<svg width="100%" height="100%" preserveAspectRatio="xMidYMid meet" '
                ),
              }}
            />
            {mostrarLabels && (
              <span className={`text-[7px] font-black uppercase mt-0.5 ${temaOscuro ? 'text-gray-400' : 'text-gray-500'}`}>
                {labels[frameKey]}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}