// src/components/clinica/BodyChart/vistas/VistaLumbar.jsx
import React from 'react';

export default function VistaLumbar({ 
  cara, 
  onRegionToggle, 
  regionesSeleccionadas = [] 
}) {
  // Lista de subregiones de la zona lumbar
  const subregiones = [
    { id: 'l1', label: 'L1', x: 100, y: 60 },
    { id: 'l2', label: 'L2', x: 100, y: 80 },
    { id: 'l3', label: 'L3', x: 100, y: 100 },
    { id: 'l4', label: 'L4', x: 100, y: 120 },
    { id: 'l5', label: 'L5', x: 100, y: 140 },
    { id: 'sacro', label: 'Sacro', x: 100, y: 165 },
    { id: 'lumbar_izq', label: 'Músculo Lumbar I', x: 80, y: 110 },
    { id: 'lumbar_der', label: 'Músculo Lumbar D', x: 120, y: 110 },
  ];

  // Función para manejar clic en subregión
  const handleClick = (id) => {
    onRegionToggle(id);
  };

  // Estilo para cada punto según esté seleccionado o no
  const getPuntoStyle = (seleccionado) => ({
    fill: seleccionado ? '#22d3ee' : '#4a5568',
    stroke: seleccionado ? '#22d3ee' : '#a0aec0',
    strokeWidth: 2,
    cursor: 'pointer',
    transition: 'all 0.2s',
  });

  const getTextoStyle = (seleccionado) => ({
    fill: seleccionado ? '#22d3ee' : '#cbd5e1',
    fontSize: '8px',
    fontWeight: 'bold',
    textAnchor: 'middle',
    pointerEvents: 'none',
  });

  // Transformación para vista posterior (espejo horizontal)
  const transform = cara === 'posterior' ? 'scale(-1, 1) translate(-200, 0)' : '';

  return (
    <svg viewBox="0 0 200 200" className="w-full h-auto drop-shadow-xl">
      <defs>
        <radialGradient id="lumbarGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#2d3748" />
          <stop offset="100%" stopColor="#1a202c" />
        </radialGradient>
      </defs>
      
      <g transform={transform}>
        {/* Fondo de la zona lumbar (forma ovalada) */}
        <ellipse
          cx="100"
          cy="110"
          rx="60"
          ry="70"
          fill="url(#lumbarGrad)"
          stroke="#4a5568"
          strokeWidth="1.5"
        />

        {/* Línea de la columna vertebral */}
        <line x1="100" y1="50" x2="100" y2="180" stroke="#4a5568" strokeWidth="2" strokeDasharray="4,4" opacity="0.5" />

        {/* Dibujar cada subregión como un círculo interactivo */}
        {subregiones.map(({ id, label, x, y }) => {
          const seleccionado = regionesSeleccionadas.includes(id);
          return (
            <g key={id} onClick={() => handleClick(id)} style={{ cursor: 'pointer' }}>
              <circle cx={x} cy={y} r="10" style={getPuntoStyle(seleccionado)} />
              <text x={x} y={y + 20} style={getTextoStyle(seleccionado)}>
                {label}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}