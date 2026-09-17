// src/components/clinica/BodyChart/vistas/VistaMano.jsx
import React from 'react';

// Componente de un solo hueso: dos cabezas + cuerpo delgado
const Bone = ({ cx, cy1, cy2, width = 6, selected, onClick }) => {
  const knobW = width + 5;
  const knobH = 9;
  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      {/* Cabeza superior (más ancha) */}
      <rect
        x={cx - knobW / 2}
        y={cy1}
        width={knobW}
        height={knobH}
        rx={knobH / 2}
        className={`hueso ${selected ? 'selected' : ''}`}
      />
      {/* Cuerpo delgado */}
      <rect
        x={cx - width / 2}
        y={cy1 + 5}
        width={width}
        height={cy2 - cy1 - 10}
        rx={width / 2}
        className={`hueso ${selected ? 'selected' : ''}`}
      />
      {/* Cabeza inferior (más ancha) */}
      <rect
        x={cx - knobW / 2}
        y={cy2 - knobH}
        width={knobW}
        height={knobH}
        rx={knobH / 2}
        className={`hueso ${selected ? 'selected' : ''}`}
      />
    </g>
  );
};

export default function VistaMano({ cara, lado, regionesSeleccionadas, onRegionToggle }) {
  const reflejar = (x) => (lado === 'derecho' ? 200 - x : x);
  const titulo = `Mano ${lado === 'izquierdo' ? 'Izquierda' : 'Derecha'}`;
  const isSelected = (id) => regionesSeleccionadas?.includes(id) || false;

  return (
    <div className="flex flex-col items-center w-full">
      <h4 className="text-sm font-bold text-cyan-400 mb-2">{titulo}</h4>
      <svg viewBox="0 0 200 320" className="w-full max-w-sm drop-shadow-xl touch-manipulation">
        <style>{`
          .hueso { fill: #475569; transition: fill 0.2s; }
          .hueso:hover { fill: #0ea5e9; }
          .hueso.selected { fill: #22d3ee; }
          .zona-label { font-size: 9px; fill: #94a3b8; text-anchor: middle; pointer-events: none; font-weight: 600; }
          .zona-label.activa { fill: #22d3ee; }
        `}</style>

        {/* ===== CARPO: 8 huesos en 2 filas ===== */}
        <g>
          {[0,1,2,3].map(i => (
            <circle key={`carpo-p-${i}`} cx={reflejar(62 + i * 25)} cy={262} r={8}
              className={`hueso ${isSelected('carpo') ? 'selected' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => onRegionToggle('carpo')} />
          ))}
          {[0,1,2,3].map(i => (
            <circle key={`carpo-d-${i}`} cx={reflejar(62 + i * 25)} cy={238} r={8}
              className={`hueso ${isSelected('carpo') ? 'selected' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => onRegionToggle('carpo')} />
          ))}
        </g>
        <text x={reflejar(100)} y={288} className={`zona-label ${isSelected('carpo') ? 'activa' : ''}`}>Carpo (Muñeca)</text>

        {/* ===== METACARPIANOS: 5 huesos ===== */}
        <g>
          {[0,1,2,3,4].map(i => (
            <Bone
              key={`meta-${i}`}
              cx={reflejar(50 + i * 25)}
              cy1={165}
              cy2={228}
              width={7}
              selected={isSelected('metacarpo')}
              onClick={() => onRegionToggle('metacarpo')}
            />
          ))}
        </g>
        <text x={reflejar(100)} y={158} className={`zona-label ${isSelected('metacarpo') ? 'activa' : ''}`}>Metacarpianos</text>

        {/* ===== FALANGES PROXIMALES: 5 huesos ===== */}
        <g>
          {[0,1,2,3,4].map(i => (
            <Bone
              key={`fal-p-${i}`}
              cx={reflejar(50 + i * 25)}
              cy1={112}
              cy2={160}
              width={6}
              selected={isSelected('falanges_prox')}
              onClick={() => onRegionToggle('falanges_prox')}
            />
          ))}
        </g>
        <text x={reflejar(100)} y={105} className={`zona-label ${isSelected('falanges_prox') ? 'activa' : ''}`}>Falanges Proximales</text>

        {/* ===== FALANGES DISTALES: 5 huesos ===== */}
        <g>
          {[0,1,2,3,4].map(i => (
            <Bone
              key={`fal-d-${i}`}
              cx={reflejar(50 + i * 25)}
              cy1={65}
              cy2={107}
              width={5}
              selected={isSelected('falanges_dist')}
              onClick={() => onRegionToggle('falanges_dist')}
            />
          ))}
        </g>
        <text x={reflejar(100)} y={58} className={`zona-label ${isSelected('falanges_dist') ? 'activa' : ''}`}>Falanges Distales</text>

        {/* ===== PULGAR: 2 huesos en ángulo (metacarpiano + falanges) ===== */}
        <g onClick={() => onRegionToggle('pulgar')} style={{ cursor: 'pointer' }}>
          {/* Metacarpiano del pulgar */}
          <rect
            x={reflejar(22) - 5}
            y={170}
            width={10}
            height={60}
            rx={5}
            className={`hueso ${isSelected('pulgar') ? 'selected' : ''}`}
            transform={`rotate(20 ${reflejar(22)} 200)`}
          />
          {/* Falange del pulgar */}
          <rect
            x={reflejar(14) - 5}
            y={115}
            width={10}
            height={50}
            rx={5}
            className={`hueso ${isSelected('pulgar') ? 'selected' : ''}`}
            transform={`rotate(20 ${reflejar(14)} 140)`}
          />
        </g>
        <text x={reflejar(15)} y={105} className={`zona-label ${isSelected('pulgar') ? 'activa' : ''}`}>Pulgar</text>

        {/* ===== EMINENCIA TENAR (solo vista palmar) ===== */}
        {cara === 'palmar' && (
          <g onClick={() => onRegionToggle('eminencia_tenar')} style={{ cursor: 'pointer' }}>
            <ellipse
              cx={reflejar(38)}
              cy={210}
              rx={14}
              ry={28}
              className={`hueso ${isSelected('eminencia_tenar') ? 'selected' : ''}`}
            />
          </g>
        )}
        {cara === 'palmar' && (
          <text x={reflejar(38)} y={252} className={`zona-label ${isSelected('eminencia_tenar') ? 'activa' : ''}`}>Tenar</text>
        )}
      </svg>
    </div>
  );
}