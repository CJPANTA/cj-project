// src/components/clinica/BodyChart/vistas/VistaColumna.jsx
import React from 'react';

export default function VistaColumna({ cara, regionesSeleccionadas = [], onRegionToggle }) {
  const isSelected = (id) => regionesSeleccionadas.includes(id);

  const ColorZona = {
    cervical: isSelected('cervical') ? '#22d3ee' : '#475569',
    dorsal: isSelected('dorsal') ? '#22d3ee' : '#475569',
    lumbar: isSelected('lumbar') ? '#22d3ee' : '#475569',
    sacro: isSelected('sacro') ? '#22d3ee' : '#334155',
  };

  // Vértebra SIN onClick (se delega al grupo padre)
  const Vertebra = ({ cx, cy, width, height, fill }) => (
    <g style={{ cursor: 'pointer' }}>
      <path
        d={`M ${cx - width / 2},${cy - height / 2}
            Q ${cx},${cy - height / 2 - 1} ${cx + width / 2},${cy - height / 2}
            L ${cx + width / 2 - 2},${cy + height / 2}
            Q ${cx},${cy + height / 2 + 1} ${cx - width / 2 + 2},${cy + height / 2} Z`}
        fill={fill}
        stroke="#0f172a"
        strokeWidth="0.8"
        className="transition-all duration-200"
      />
      {cara === 'posterior' && (
        <circle cx={cx} cy={cy + height / 2 + 2} r="1.2" fill={fill} stroke="#0f172a" strokeWidth="0.5" />
      )}
    </g>
  );

  // Zona con área de click AMPLIADA (rectángulo transparente)
  const Zona = ({ id, x, y, width, height, children }) => (
    <g onClick={() => onRegionToggle(id)} style={{ cursor: 'pointer' }}>
      {/* Área invisible grande para facilitar el click */}
      <rect
        x={x} y={y} width={width} height={height}
        fill="transparent"
        style={{ pointerEvents: 'all' }}
      />
      {children}
    </g>
  );

  return (
    <div className="flex flex-col items-center w-full">
      <h4 className="text-sm font-bold text-cyan-400 mb-2">
        Columna Vertebral {cara === 'posterior' ? '(Vista Posterior)' : '(Vista Lateral)'}
      </h4>
       <svg viewBox="0 0 220 500" className="w-full max-w-sm drop-shadow-xl touch-manipulation">
        <style>{`
          .zona-label { font-size: 11px; font-weight: 700; text-anchor: middle; pointer-events: none; letter-spacing: 1px; }
          .zona-label.activa { fill: #22d3ee; }
          .zona-label.inactiva { fill: #94a3b8; }
          .sub-label { font-size: 8px; fill: #64748b; text-anchor: middle; pointer-events: none; }
          .tejido { fill: #1e293b; stroke: #334155; stroke-width: 1; opacity: 0.4; pointer-events: none; }
        `}</style>

        {/* Silueta de hombros/torso */}
        <path
          className="tejido"
          d="M 80,30 C 60,35 40,50 35,75 L 40,180 C 42,220 40,260 38,300 C 36,340 40,380 45,420 L 60,480 L 160,480 L 175,420 C 180,380 184,340 182,300 C 180,260 178,220 180,180 L 185,75 C 180,50 160,35 140,30 Z"
        />
        <ellipse cx="110" cy="20" rx="22" ry="25" className="tejido" opacity="0.6" />
        <rect x="95" y="42" width="30" height="18" rx="5" className="tejido" opacity="0.5" />

        {/* ===== CERVICAL (C1-C7) ===== */}
        <Zona id="cervical" x={70} y={50} width={80} height={115}>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <Vertebra
              key={`c-${i}`}
              cx={110}
              cy={60 + i * 15}
              width={20 - i * 0.5}
              height={10}
              fill={ColorZona.cervical}
            />
          ))}
        </Zona>
        <text x="160" y="100" className={`zona-label ${isSelected('cervical') ? 'activa' : 'inactiva'}`}>
          CERVICAL
        </text>
        <text x="160" y="112" className="sub-label">C1 - C7</text>

        {/* ===== DORSAL (D1-D12) ===== */}
        <Zona id="dorsal" x={70} y={165} width={80} height={175}>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
            <Vertebra
              key={`d-${i}`}
              cx={110}
              cy={175 + i * 14}
              width={26 + i * 0.4}
              height={10}
              fill={ColorZona.dorsal}
            />
          ))}
        </Zona>
        <text x="160" y="240" className={`zona-label ${isSelected('dorsal') ? 'activa' : 'inactiva'}`}>
          DORSAL
        </text>
        <text x="160" y="252" className="sub-label">D1 - D12</text>

        {/* ===== LUMBAR (L1-L5) ===== */}
        <Zona id="lumbar" x={70} y={345} width={80} height={105}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Vertebra
              key={`l-${i}`}
              cx={110}
              cy={355 + i * 18}
              width={30 + i * 0.8}
              height={14}
              fill={ColorZona.lumbar}
            />
          ))}
        </Zona>
        <text x="160" y="395" className={`zona-label ${isSelected('lumbar') ? 'activa' : 'inactiva'}`}>
          LUMBAR
        </text>
        <text x="160" y="407" className="sub-label">L1 - L5</text>

        {/* ===== SACRO ===== */}
        <Zona id="sacro" x={85} y={450} width={50} height={40}>
          <path
            d="M 95,455 L 125,455 L 120,485 L 100,485 Z"
            fill={ColorZona.sacro}
            stroke="#0f172a"
            strokeWidth="1"
            className="transition-all duration-200"
          />
        </Zona>
        <text x="160" y="475" fontSize="9" fill={isSelected('sacro') ? '#22d3ee' : '#94a3b8'} textAnchor="middle" fontWeight="700">
          SACRO
        </text>
      </svg>
    </div>
  );
}