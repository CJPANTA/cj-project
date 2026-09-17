// src/components/clinica/BodyChart/vistas/VistaColumna.jsx
import React from 'react';

export default function VistaColumna({ cara, regionesSeleccionadas = [], onRegionToggle }) {
  const isSelected = (id) => regionesSeleccionadas.includes(id);

  // Vértebras cervicales (C1-C7)
  const cervicales = [0,1,2,3,4,5,6];
  // Vértebras dorsales (D1-D12) - simplificadas a 8 visuales
  const dorsales = [0,1,2,3,4,5,6,7];
  // Vértebras lumbares (L1-L5)
  const lumbares = [0,1,2,3,4];

  const ColorZona = {
    cervical: isSelected('cervical') ? '#22d3ee' : '#475569',
    dorsal: isSelected('dorsal') ? '#22d3ee' : '#475569',
    lumbar: isSelected('lumbar') ? '#22d3ee' : '#475569',
  };

  return (
    <div className="flex flex-col items-center w-full">
      <h4 className="text-sm font-bold text-cyan-400 mb-2">
        Columna Vertebral {cara === 'posterior' ? '(Vista Posterior)' : '(Vista Anterior)'}
      </h4>
      <svg viewBox="0 0 200 480" className="w-full max-w-xs drop-shadow-xl touch-manipulation">
        <style>{`
          .vertebra { transition: fill 0.2s, stroke 0.2s; cursor: pointer; }
          .vertebra:hover { fill: #0ea5e9; }
          .musculo-para { transition: fill 0.2s; cursor: pointer; }
          .musculo-para:hover { fill: #0ea5e9; opacity: 0.5 !important; }
          .zona-label { font-size: 11px; font-weight: 700; text-anchor: middle; pointer-events: none; }
          .zona-label.activa { fill: #22d3ee; }
          .zona-label.inactiva { fill: #94a3b8; }
        `}</style>

        {/* ===== MÚSCULOS PARAVERTEBRALES (fondo) ===== */}
        <g opacity="0.35">
          <rect
            x="55" y="60" width="18" height="120" rx="9"
            className="musculo-para"
            fill={isSelected('cervical') ? '#22d3ee' : '#334155'}
            onClick={() => onRegionToggle('cervical')}
          />
          <rect
            x="127" y="60" width="18" height="120" rx="9"
            className="musculo-para"
            fill={isSelected('cervical') ? '#22d3ee' : '#334155'}
            onClick={() => onRegionToggle('cervical')}
          />
          <rect
            x="55" y="185" width="18" height="130" rx="9"
            className="musculo-para"
            fill={isSelected('dorsal') ? '#22d3ee' : '#334155'}
            onClick={() => onRegionToggle('dorsal')}
          />
          <rect
            x="127" y="185" width="18" height="130" rx="9"
            className="musculo-para"
            fill={isSelected('dorsal') ? '#22d3ee' : '#334155'}
            onClick={() => onRegionToggle('dorsal')}
          />
          <rect
            x="55" y="320" width="18" height="90" rx="9"
            className="musculo-para"
            fill={isSelected('lumbar') ? '#22d3ee' : '#334155'}
            onClick={() => onRegionToggle('lumbar')}
          />
          <rect
            x="127" y="320" width="18" height="90" rx="9"
            className="musculo-para"
            fill={isSelected('lumbar') ? '#22d3ee' : '#334155'}
            onClick={() => onRegionToggle('lumbar')}
          />
        </g>

        {/* ===== ZONA CERVICAL (C1-C7) ===== */}
        <g onClick={() => onRegionToggle('cervical')}>
          {cervicales.map(i => (
            <rect
              key={`c-${i}`}
              x={90 + (i % 2 === 0 ? -2 : 0)}
              y={60 + i * 16}
              width="22" height="12" rx="3"
              className="vertebra"
              fill={ColorZona.cervical}
              stroke="#0f172a"
              strokeWidth="1"
            />
          ))}
        </g>
        <text x="100" y="42" className={`zona-label ${isSelected('cervical') ? 'activa' : 'inactiva'}`}>
          CERVICAL
        </text>
        <text x="100" y="50" fontSize="8" fill="#64748b" textAnchor="middle">C1 - C7</text>

        {/* ===== ZONA DORSAL (D1-D12) ===== */}
        <g onClick={() => onRegionToggle('dorsal')}>
          {dorsales.map(i => (
            <rect
              key={`d-${i}`}
              x={90 + (i % 2 === 0 ? -2 : 0)}
              y={185 + i * 15}
              width="22" height="11" rx="3"
              className="vertebra"
              fill={ColorZona.dorsal}
              stroke="#0f172a"
              strokeWidth="1"
            />
          ))}
        </g>
        <text x="100" y="177" className={`zona-label ${isSelected('dorsal') ? 'activa' : 'inactiva'}`}>
          DORSAL
        </text>
        <text x="100" y="315" fontSize="8" fill="#64748b" textAnchor="middle">D1 - D12</text>

        {/* ===== ZONA LUMBAR (L1-L5) ===== */}
        <g onClick={() => onRegionToggle('lumbar')}>
          {lumbares.map(i => (
            <rect
              key={`l-${i}`}
              x={90 + (i % 2 === 0 ? -2 : 0)}
              y={325 + i * 16}
              width="22" height="13" rx="3"
              className="vertebra"
              fill={ColorZona.lumbar}
              stroke="#0f172a"
              strokeWidth="1"
            />
          ))}
        </g>
        <text x="100" y="317" className={`zona-label ${isSelected('lumbar') ? 'activa' : 'inactiva'}`}>
          LUMBAR
        </text>
        <text x="100" y="425" fontSize="8" fill="#64748b" textAnchor="middle">L1 - L5</text>

        {/* ===== SACRO ===== */}
        <g onClick={() => onRegionToggle('sacro')}>
          <path
            d="M 85,415 L 115,415 L 110,455 L 90,455 Z"
            className="vertebra"
            fill={isSelected('sacro') ? '#22d3ee' : '#334155'}
            stroke="#0f172a"
            strokeWidth="1"
          />
        </g>
        <text x="100" y="470" fontSize="9" fill={isSelected('sacro') ? '#22d3ee' : '#94a3b8'} textAnchor="middle" fontWeight="700">
          SACRO
        </text>
      </svg>
    </div>
  );
}