import React from 'react';

export default function VistaPierna({ cara, lado, regionesSeleccionadas, onRegionToggle }) {
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

  const titulo = `Pierna ${lado === 'izquierdo' ? 'Izquierda' : 'Derecha'}`;
  const transformacion = lado === 'derecho' ? 'scale(-1, 1) translate(-220, 0)' : '';

  return (
    <div className="flex flex-col items-center w-full">
      <h4 className="text-sm font-bold text-cyan-400 mb-2">{titulo} ({cara})</h4>
      <svg viewBox="0 0 220 420" className="w-full max-w-sm drop-shadow-xl touch-manipulation">
        <style>{`
          .region { fill: #1e293b; stroke: #64748b; stroke-width: 1.5; cursor: pointer; transition: all 0.2s; }
          .region:hover { fill: #0ea5e9; stroke: #bae6fd; }
          .linea-anat { stroke: #334155; stroke-width: 1.5; fill: none; pointer-events: none; opacity: 0.7;}
        `}</style>

        <g transform={transformacion}>
          {cara === 'anterior' ? (
            <g>
              {/* SILUETA BASE */}
              <path className="region" onClick={() => onRegionToggle('pierna')} 
                    d="M 70,20 C 130,20 160,80 150,150 C 145,190 145,230 135,270 C 130,320 120,380 125,400 L 85,400 C 80,380 75,320 70,270 C 60,200 60,100 70,20 Z" />

              {/* CUÁDRICEPS */}
              <path className="region" onClick={() => onRegionToggle('cuadriceps')} 
                    d="M 75,30 C 120,25 145,80 140,150 C 135,180 120,230 105,250 C 90,230 80,180 75,150 C 70,80 75,30 75,30 Z" />
              <path className="linea-anat" d="M 105,50 L 105,210" />

              {/* TIBIAL ANTERIOR Y CRESTA TIBIAL */}
              <path className="region" onClick={() => onRegionToggle('tibial_ant')} 
                    d="M 80,260 C 105,255 130,255 135,270 C 130,310 120,360 125,390 L 85,390 C 80,360 75,310 80,260 Z" />
              <path className="linea-anat" d="M 105,270 L 105,370" />

              <path className="region" onClick={() => onRegionToggle('tobillo')} 
                    d="M 85,390 C 105,385 125,390 125,390 C 125,405 130,415 105,415 C 80,415 85,405 85,390 Z" />

              <Hotspot x={105} y={150} regionId="cuadriceps" label="Cuádriceps" />
              <Hotspot x={105} y={320} regionId="tibial_ant" label="Tibial Ant." />
              <Hotspot x={105} y={405} regionId="tobillo" label="Tobillo" />
            </g>
          ) : (
            <g>
              {/* SILUETA POSTERIOR */}
              <path className="region" onClick={() => onRegionToggle('pierna')} 
                    d="M 70,20 C 130,20 160,80 150,150 C 145,190 145,230 135,270 C 130,320 120,380 125,400 L 85,400 C 80,380 75,320 70,270 C 60,200 60,100 70,20 Z" />

              {/* ISQUIOTIBIALES */}
              <path className="region" onClick={() => onRegionToggle('isquiotibiales')} 
                    d="M 75,30 C 120,25 145,80 140,150 C 135,180 125,220 105,240 C 85,220 75,180 75,150 C 70,80 75,30 75,30 Z" />
              <path className="linea-anat" d="M 105,50 L 105,200" />
              <path className="linea-anat" d="M 105,200 C 95,220 85,230 85,230" />
              <path className="linea-anat" d="M 105,200 C 115,220 125,230 125,230" />

              {/* GEMELOS (Bifurcados) */}
              <path className="region" onClick={() => onRegionToggle('gemelos_post')} 
                    d="M 80,240 C 110,230 130,240 135,260 C 140,290 125,320 105,340 C 85,320 70,290 80,240 Z" />
              <path className="linea-anat" d="M 105,245 L 105,320" />

              {/* SÓLEO Y AQUILES */}
              <path className="region" onClick={() => onRegionToggle('soleo')} 
                    d="M 85,310 C 105,325 125,310 125,340 C 120,360 115,380 115,390 L 95,390 C 95,380 90,360 85,340 C 85,330 85,320 85,310 Z" opacity="0.8"/>
              
              <path className="region" onClick={() => onRegionToggle('tendon_aquiles')} 
                    d="M 95,390 C 105,385 115,390 115,390 C 115,405 120,415 105,415 C 90,415 95,405 95,390 Z" />

              <Hotspot x={105} y={150} regionId="isquiotibiales" label="Isquiotibiales" />
              <Hotspot x={105} y={280} regionId="gemelos_post" label="Gemelos" />
              <Hotspot x={105} y={350} regionId="soleo" label="Sóleo" />
              <Hotspot x={105} y={405} regionId="tendon_aquiles" label="T. Aquiles" />
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}