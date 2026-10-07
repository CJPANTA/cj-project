// src/components/clinica/BodyChart/vistas/VistaPie.jsx
import React from 'react';

// Componente de un hueso: dos cabezas + cuerpo delgado
const Bone = ({ cx, cy1, cy2, width = 6, selected, onClick }) => {
  const knobW = width + 4;
  const knobH = 7;
  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      <rect x={cx - knobW / 2} y={cy1} width={knobW} height={knobH} rx={knobH / 2}
        className={`hueso-pie ${selected ? 'selected' : ''}`} />
      <rect x={cx - width / 2} y={cy1 + 4} width={width} height={cy2 - cy1 - 8} rx={width / 2}
        className={`hueso-pie ${selected ? 'selected' : ''}`} />
      <rect x={cx - knobW / 2} y={cy2 - knobH} width={knobW} height={knobH} rx={knobH / 2}
        className={`hueso-pie ${selected ? 'selected' : ''}`} />
    </g>
  );
};

export default function VistaPie({ cara, lado, regionesSeleccionadas, onRegionToggle }) {
  const esDerecho = lado === 'derecho';
  const reflejar = (x) => (esDerecho ? 240 - x : x);
  const titulo = `Pie ${lado === 'izquierdo' ? 'Izquierdo' : 'Derecho'}`;
  const isSelected = (id) => regionesSeleccionadas?.includes(id) || false;

  // Label simple — las coordenadas ya vienen reflejadas
  const Label = ({ x, y, children, active }) => (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      fontSize="10"
      fill={active ? '#22d3ee' : '#94a3b8'}
      fontWeight="600"
      pointerEvents="none"
    >
      {children}
    </text>
  );

  return (
    <div className="flex flex-col items-center w-full">
      <h4 className="text-sm font-bold text-cyan-400 mb-2">{titulo}</h4>
      <svg viewBox="0 0 240 340" className="w-full max-w-lg drop-shadow-xl touch-manipulation">
        <style>{`
          .hueso-pie { fill: #334155; stroke: #64748b; stroke-width: 1; cursor: pointer; transition: all 0.2s; }
          .hueso-pie:hover { fill: #0ea5e9; stroke: #bae6fd; stroke-width: 1.5; }
          .hueso-pie.selected { fill: #22d3ee; stroke: #67e8f9; stroke-width: 1.5; }
        `}</style>

        {cara === 'lateral' ? (
          <>
            <g onClick={() => onRegionToggle('retropie_calcaneo')} style={{ cursor: 'pointer' }}>
              <path d={`M ${reflejar(50)},180 Q ${reflejar(60)},130 ${reflejar(95)},150 Q ${reflejar(100)},190 ${reflejar(50)},210 Z`}
                className={`hueso-pie ${isSelected('retropie_calcaneo') ? 'selected' : ''}`} />
            </g>
            <Label x={reflejar(72)} y={235} active={isSelected('retropie_calcaneo')}>Retropié</Label>

            <g onClick={() => onRegionToggle('mediopie_tarso')} style={{ cursor: 'pointer' }}>
              <path d={`M ${reflejar(95)},150 Q ${reflejar(130)},135 ${reflejar(165)},150 Q ${reflejar(170)},175 ${reflejar(150)},185 Q ${reflejar(115)},190 ${reflejar(95)},185 Z`}
                className={`hueso-pie ${isSelected('mediopie_tarso') ? 'selected' : ''}`} />
            </g>
            <Label x={reflejar(135)} y={128} active={isSelected('mediopie_tarso')}>Mediopié</Label>

            <g onClick={() => onRegionToggle('antepie_metatarso')} style={{ cursor: 'pointer' }}>
              <path d={`M ${reflejar(165)},150 L ${reflejar(215)},148 L ${reflejar(220)},172 L ${reflejar(170)},178 Z`}
                className={`hueso-pie ${isSelected('antepie_metatarso') ? 'selected' : ''}`} />
            </g>
            <Label x={reflejar(192)} y={140} active={isSelected('antepie_metatarso')}>Metatarso</Label>

            <g onClick={() => onRegionToggle('falanges_lateral')} style={{ cursor: 'pointer' }}>
              <path d={`M ${reflejar(215)},152 Q ${reflejar(232)},150 ${reflejar(238)},158 Q ${reflejar(232)},166 ${reflejar(215)},168 Z`}
                className={`hueso-pie ${isSelected('falanges_lateral') ? 'selected' : ''}`} />
            </g>
            <Label x={reflejar(232)} y={140} active={isSelected('falanges_lateral')}>Dedos</Label>
          </>
        ) : (
          <>
            {/* Talón */}
            <g onClick={() => onRegionToggle('talon_plantar')} style={{ cursor: 'pointer' }}>
              <path
                d={`M ${reflejar(85)},250 Q ${reflejar(80)},215 ${reflejar(120)},210 Q ${reflejar(160)},215 ${reflejar(155)},250 Q ${reflejar(160)},285 ${reflejar(120)},290 Q ${reflejar(80)},285 ${reflejar(85)},250 Z`}
                className={`hueso-pie ${isSelected('talon_plantar') ? 'selected' : ''}`}
              />
            </g>
            <Label x={reflejar(120)} y={305} active={isSelected('talon_plantar')}>Talón</Label>

            {/* Mediopié */}
            <g onClick={() => onRegionToggle('mediopie_plantar')} style={{ cursor: 'pointer' }}>
              <ellipse cx={reflejar(120)} cy={185} rx={32} ry={26}
                className={`hueso-pie ${isSelected('mediopie_plantar') ? 'selected' : ''}`} />
            </g>
            <Label x={reflejar(68)} y={190} active={isSelected('mediopie_plantar')}>Arco</Label>

            {/* Metatarsianos */}
            <g onClick={() => onRegionToggle('metatarsianos_plantar')} style={{ cursor: 'pointer' }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <Bone
                  key={`met-${i}`}
                  cx={reflejar(78 + i * 21)}
                  cy1={110}
                  cy2={155}
                  width={8}
                  selected={isSelected('metatarsianos_plantar')}
                />
              ))}
            </g>
            <Label x={reflejar(120)} y={98} active={isSelected('metatarsianos_plantar')}>Metatarsianos</Label>

            {/* Falanges */}
            <g onClick={() => onRegionToggle('falanges_plantar')} style={{ cursor: 'pointer' }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <Bone
                  key={`fal-p-${i}`}
                  cx={reflejar(78 + i * 21)}
                  cy1={62}
                  cy2={100}
                  width={6}
                  selected={isSelected('falanges_plantar')}
                />
              ))}
            </g>
            <Label x={reflejar(120)} y={50} active={isSelected('falanges_plantar')}>Falanges (Dedos)</Label>
          </>
        )}
      </svg>
    </div>
  );
}