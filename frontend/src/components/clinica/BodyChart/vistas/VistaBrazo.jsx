import React from 'react';

export default function VistaBrazo({ cara, lado, regionesSeleccionadas, onRegionToggle }) {
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

  const titulo = `Brazo ${lado === 'izquierdo' ? 'Izquierdo' : 'Derecho'}`;

  return (
    <div className="flex flex-col items-center w-full">
      <h4 className="text-sm font-bold text-cyan-400 mb-2">{titulo} ({cara})</h4>
      <svg viewBox="0 0 220 420" className="w-full max-w-sm drop-shadow-xl touch-manipulation">
        <style>{`
          .region { fill: #1e293b; stroke: #64748b; stroke-width: 1.5; cursor: pointer; transition: all 0.2s; }
          .region:hover { fill: #0ea5e9; stroke: #bae6fd; }
          .linea-anat { stroke: #334155; stroke-width: 1.5; fill: none; pointer-events: none; }
        `}</style>

        {cara === 'anterior' ? (
          <g>
            {/* SILUETA BASE DEL BRAZO ANTERIOR (sin hombro) */}
            <path className="region" onClick={() => onRegionToggle('brazo')} 
                  d="M 110,20 C 160,20 170,70 160,120 C 150,180 155,230 145,280 C 140,320 135,360 135,390 L 85,390 C 85,360 80,320 75,280 C 65,230 70,180 60,120 C 50,70 60,20 110,20 Z" />

            {/* BÍCEPS */}
            <path className="region" onClick={() => onRegionToggle('biceps')} 
                  d="M 75,120 C 100,105 120,105 145,120 C 155,160 150,210 135,240 C 110,255 90,255 85,240 C 70,210 65,160 75,120 Z" />
            <path className="linea-anat" d="M 85,130 C 110,145 135,130 135,130" />
            <path className="linea-anat" d="M 110,245 L 110,265" />

            {/* CODO */}
            <path className="region" onClick={() => onRegionToggle('codo')} 
                  d="M 75,250 C 95,240 125,240 145,250 C 150,270 145,285 140,290 C 115,295 95,295 80,290 C 75,285 70,270 75,250 Z" />

            {/* ANTEBRAZO FLEXOR */}
            <path className="region" onClick={() => onRegionToggle('antebrazo_flex')} 
                  d="M 75,290 C 95,285 125,285 145,290 C 155,320 140,360 135,390 L 85,390 C 80,360 65,320 75,290 Z" />
            <path className="linea-anat" d="M 85,380 L 135,380" />

            {/* MUÑECA */}
            <path className="region" onClick={() => onRegionToggle('muneca')} 
                  d="M 85,390 L 135,390 C 135,400 130,410 110,410 C 90,410 85,400 85,390 Z" />

            <Hotspot x={110} y={180} regionId="biceps" label="Bíceps" />
            <Hotspot x={110} y={270} regionId="codo" label="Codo" />
            <Hotspot x={110} y={340} regionId="antebrazo_flex" label="Antebrazo" />
            <Hotspot x={110} y={400} regionId="muneca" label="Muñeca" />
          </g>
        ) : (
          <g>
            {/* SILUETA BASE DEL BRAZO POSTERIOR (sin hombro) */}
            <path className="region" onClick={() => onRegionToggle('brazo')} 
                  d="M 110,20 C 160,20 170,70 160,120 C 150,180 155,230 145,280 C 140,320 135,360 135,390 L 85,390 C 85,360 80,320 75,280 C 65,230 70,180 60,120 C 50,70 60,20 110,20 Z" />

            {/* TRÍCEPS */}
            <path className="region" onClick={() => onRegionToggle('triceps')} 
                  d="M 72,115 C 95,130 125,130 148,115 C 155,160 150,220 140,250 C 120,240 100,240 80,250 C 70,220 65,160 72,115 Z" />
            <path className="linea-anat" d="M 95,140 C 110,180 110,220 110,240" />
            <path className="linea-anat" d="M 125,140 C 110,180 110,220 110,240" />

            {/* OLÉCRANON */}
            <path className="region" onClick={() => onRegionToggle('olecranon')} 
                  d="M 80,250 C 100,240 120,240 140,250 C 145,265 140,285 135,290 C 110,300 90,300 85,290 C 80,285 75,265 80,250 Z" />

            {/* ANTEBRAZO EXTENSOR */}
            <path className="region" onClick={() => onRegionToggle('antebrazo_ext')} 
                  d="M 85,290 C 100,295 120,295 135,290 C 145,320 140,360 135,390 L 85,390 C 80,360 75,320 85,290 Z" />
            <path className="linea-anat" d="M 85,380 L 135,380" />

            {/* MUÑECA POSTERIOR */}
            <path className="region" onClick={() => onRegionToggle('muneca_post')} 
                  d="M 85,390 L 135,390 C 135,400 130,410 110,410 C 90,410 85,400 85,390 Z" />

            <Hotspot x={110} y={180} regionId="triceps" label="Tríceps" />
            <Hotspot x={110} y={270} regionId="olecranon" label="Olécranon" />
            <Hotspot x={110} y={340} regionId="antebrazo_ext" label="Antebrazo" />
            <Hotspot x={110} y={400} regionId="muneca_post" label="Muñeca" />
          </g>
        )}
      </svg>
    </div>
  );
}