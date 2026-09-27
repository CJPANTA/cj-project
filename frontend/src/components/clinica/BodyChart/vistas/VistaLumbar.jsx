// src/components/clinica/BodyChart/vistas/VistaLumbar.jsx
import React from 'react';

export default function VistaLumbar({ cara, onRegionToggle, regionesSeleccionadas = [] }) {
  const isSelected = (id) => regionesSeleccionadas.includes(id);

  // Subregiones lumbares + musculares
  const subregiones = [
    { id: 'l1', label: 'L1', x: 120, y: 60 },
    { id: 'l2', label: 'L2', x: 120, y: 85 },
    { id: 'l3', label: 'L3', x: 120, y: 110 },
    { id: 'l4', label: 'L4', x: 120, y: 135 },
    { id: 'l5', label: 'L5', x: 120, y: 160 },
    { id: 'sacro', label: 'Sacro', x: 120, y: 190 },
  ];

  // Zonas musculares laterales (clickeables)
  const zonasMusculares = [
    { id: 'lumbar_izq', label: 'Músculo Lumbar I', x: 95, y: 120 },
    { id: 'lumbar_der', label: 'Músculo Lumbar D', x: 145, y: 120 },
  ];

  const getPuntoStyle = (seleccionado) => ({
    fill: seleccionado ? '#22d3ee' : '#334155',
    stroke: seleccionado ? '#22d3ee' : '#64748b',
    strokeWidth: 1.5,
    cursor: 'pointer',
    transition: 'all 0.2s',
  });

  const getTextoStyle = (seleccionado) => ({
    fill: seleccionado ? '#22d3ee' : '#94a3b8',
    fontSize: '9px',
    fontWeight: 'bold',
    textAnchor: 'middle',
    pointerEvents: 'none',
  });

  return (
    <div className="flex flex-col items-center w-full">
      <h4 className="text-sm font-bold text-cyan-400 mb-2">Zona Lumbar ({cara})</h4>
      <svg viewBox="0 0 240 250" className="w-full max-w-sm drop-shadow-xl touch-manipulation">
        <defs>
          <radialGradient id="lumbarGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </radialGradient>
        </defs>

        {/* Silueta de la espalda baja + glúteos */}
        <path
          d="M 60,20 C 40,25 30,50 35,90 C 40,130 45,160 55,190 C 65,215 85,235 120,240 C 155,235 175,215 185,190 C 195,160 200,130 205,90 C 210,50 200,25 180,20 Z"
          fill="url(#lumbarGrad)"
          stroke="#334155"
          strokeWidth="1.5"
        />

        {/* Columna vertebral (línea guía) */}
        <line x1="120" y1="45" x2="120" y2="200" stroke="#334155" strokeWidth="2" strokeDasharray="4,4" opacity="0.6" />

        {/* Músculos paravertebrales (rectángulos redondeados) */}
        <g>
          <rect
            x="80" y="35" width="22" height="160" rx="11"
            fill={isSelected('lumbar_izq') ? '#22d3ee' : '#334155'}
            stroke="#64748b"
            strokeWidth="1"
            opacity={isSelected('lumbar_izq') ? 1 : 0.5}
            style={{ cursor: 'pointer', transition: 'all 0.2s' }}
            onClick={() => onRegionToggle('lumbar_izq')}
          />
          <rect
            x="138" y="35" width="22" height="160" rx="11"
            fill={isSelected('lumbar_der') ? '#22d3ee' : '#334155'}
            stroke="#64748b"
            strokeWidth="1"
            opacity={isSelected('lumbar_der') ? 1 : 0.5}
            style={{ cursor: 'pointer', transition: 'all 0.2s' }}
            onClick={() => onRegionToggle('lumbar_der')}
          />
        </g>

        {/* Vértebras lumbares (L1-L5) — cuerpos vertebrales apilados */}
        <g>
          {subregiones.slice(0, 5).map(({ id, x, y }) => (
            <rect
              key={id}
              x={x - 12}
              y={y - 8}
              width={24}
              height={14}
              rx={4}
              fill={isSelected(id) ? '#22d3ee' : '#475569'}
              stroke="#0f172a"
              strokeWidth="1.2"
              style={{ cursor: 'pointer', transition: 'all 0.2s' }}
              onClick={() => onRegionToggle(id)}
            />
          ))}
        </g>

        {/* Sacro (triángulo invertido) */}
        <g>
          <path
            d="M 100,175 L 140,175 L 128,215 L 112,215 Z"
            fill={isSelected('sacro') ? '#22d3ee' : '#475569'}
            stroke="#0f172a"
            strokeWidth="1.2"
            style={{ cursor: 'pointer', transition: 'all 0.2s' }}
            onClick={() => onRegionToggle('sacro')}
          />
        </g>

        {/* Etiquetas de las vértebras (a la izquierda) */}
        {subregiones.map(({ id, label, x, y }) => (
          <text key={`label-${id}`} x={x - 30} y={y + 2} fontSize="8" fill={isSelected(id) ? '#22d3ee' : '#94a3b8'} fontWeight="700" pointerEvents="none">
            {label}
          </text>
        ))}

        {/* Etiquetas musculares */}
        <text x="91" y="210" fontSize="8" fill={isSelected('lumbar_izq') ? '#22d3ee' : '#94a3b8'} textAnchor="middle" fontWeight="700" pointerEvents="none">
          Paravertebral I
        </text>
        <text x="149" y="210" fontSize="8" fill={isSelected('lumbar_der') ? '#22d3ee' : '#94a3b8'} textAnchor="middle" fontWeight="700" pointerEvents="none">
          Paravertebral D
        </text>

        {/* Etiqueta Sacro */}
        <text x="120" y="235" fontSize="9" fill={isSelected('sacro') ? '#22d3ee' : '#94a3b8'} textAnchor="middle" fontWeight="700" pointerEvents="none">
          Sacro
        </text>
      </svg>
    </div>
  );
}