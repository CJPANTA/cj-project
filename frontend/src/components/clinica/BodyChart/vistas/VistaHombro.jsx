import React from 'react';

export default function VistaHombro({ cara, lado, regionesSeleccionadas, onRegionToggle }) {
  const Hotspot = ({ x, y, regionId, label }) => {
    const selected = regionesSeleccionadas?.includes(regionId) || false;
    return (
      <g onClick={() => onRegionToggle(regionId)} className="cursor-pointer group">
        <circle cx={x} cy={y} r="16" fill="transparent" />
        <circle cx={x} cy={y} r="6" fill="transparent" stroke={selected ? '#22d3ee' : '#475569'} strokeWidth="1.5" />
        <circle cx={x} cy={y} r="3" fill={selected ? '#22d3ee' : '#94a3b8'} />
        <text x={x} y={y + (selected ? 16 : 14)} textAnchor="middle" fontSize="6.5" fill={selected ? '#22d3ee' : '#cbd5e1'} className="font-bold tracking-wider">
          {label}
        </text>
      </g>
    );
  };

  const titulo = `Hombro ${lado === 'izquierdo' ? 'Izquierdo' : 'Derecho'}`;
  // Si es derecho, reflejamos las coordenadas x (centro en 100)
  const reflejar = (x) => (lado === 'derecho' ? 200 - x : x);

  return (
    <div className="flex flex-col items-center w-full">
      <h4 className="text-sm font-bold text-cyan-400 mb-2">{titulo} ({cara})</h4>
      <svg viewBox="0 0 200 200" className="w-full max-w-sm drop-shadow-xl touch-manipulation">
        <style>{`
          .region { fill: #1e293b; stroke: #64748b; stroke-width: 1.5; cursor: pointer; transition: all 0.2s; }
          .region:hover { fill: #0ea5e9; stroke: #bae6fd; }
          .linea-anat { stroke: #334155; stroke-width: 1.5; fill: none; pointer-events: none; opacity: 0.7; }
        `}</style>

        {cara === 'anterior' ? (
          <g>
            {/* DELTOIDES ANTERIOR */}
            <path className="region" onClick={() => onRegionToggle('deltoides_ant')}
                  d={`M ${reflejar(100)},30 C ${reflejar(150)},30 ${reflejar(160)},80 ${reflejar(140)},130 C ${reflejar(125)},160 ${reflejar(100)},165 ${reflejar(95)},130 C ${reflejar(90)},80 ${reflejar(70)},40 ${reflejar(100)},30 Z`} />
            <path className="linea-anat" d={`M ${reflejar(100)},30 C ${reflejar(115)},70 ${reflejar(120)},110 ${reflejar(105)},145`} />

            {/* CLAVÍCULA Y ACROMION */}
            <path className="region" onClick={() => onRegionToggle('acromion')}
                  d={`M ${reflejar(50)},25 C ${reflejar(80)},30 ${reflejar(110)},25 ${reflejar(125)},35 C ${reflejar(135)},42 ${reflejar(120)},50 ${reflejar(105)},45 C ${reflejar(75)},35 ${reflejar(50)},40 ${reflejar(50)},25 Z`} />

            {/* MANGUITO ROTADOR (Subescapular) */}
            <path className="region" onClick={() => onRegionToggle('manguito_ant')}
                  d={`M ${reflejar(85)},110 C ${reflejar(105)},90 ${reflejar(125)},90 ${reflejar(135)},110 C ${reflejar(140)},125 ${reflejar(120)},135 ${reflejar(100)},135 C ${reflejar(85)},135 ${reflejar(80)},125 ${reflejar(85)},110 Z`} opacity="0.6"/>

            <Hotspot x={reflejar(125)} y={80} regionId="deltoides_ant" label="Deltoides" />
            <Hotspot x={reflejar(90)} y={20} regionId="acromion" label="Acromion" />
            <Hotspot x={reflejar(110)} y={120} regionId="manguito_ant" label="Manguito Rot." />
          </g>
        ) : (
          <g>
            {/* DELTOIDES POSTERIOR */}
            <path className="region" onClick={() => onRegionToggle('deltoides_post')}
                  d={`M ${reflejar(100)},30 C ${reflejar(150)},30 ${reflejar(160)},80 ${reflejar(140)},130 C ${reflejar(125)},160 ${reflejar(100)},165 ${reflejar(95)},130 C ${reflejar(90)},80 ${reflejar(70)},40 ${reflejar(100)},30 Z`} />

            {/* ESPINA DE LA ESCÁPULA */}
            <path className="region" onClick={() => onRegionToggle('acromion_post')}
                  d={`M ${reflejar(125)},35 C ${reflejar(100)},45 ${reflejar(70)},50 ${reflejar(40)},40 C ${reflejar(60)},30 ${reflejar(90)},30 ${reflejar(125)},35 Z`} />

            {/* MANGUITO ROTADOR POSTERIOR (Infraespinoso) */}
            <path className="region" onClick={() => onRegionToggle('manguito_post')}
                  d={`M ${reflejar(85)},110 C ${reflejar(105)},90 ${reflejar(125)},90 ${reflejar(135)},110 C ${reflejar(140)},125 ${reflejar(120)},135 ${reflejar(100)},135 C ${reflejar(85)},135 ${reflejar(80)},125 ${reflejar(85)},110 Z`} opacity="0.6"/>

            <Hotspot x={reflejar(125)} y={80} regionId="deltoides_post" label="Deltoides" />
            <Hotspot x={reflejar(80)} y={25} regionId="acromion_post" label="Acromion" />
            <Hotspot x={reflejar(110)} y={120} regionId="manguito_post" label="Manguito Rot." />
          </g>
        )}
      </svg>
    </div>
  );
}