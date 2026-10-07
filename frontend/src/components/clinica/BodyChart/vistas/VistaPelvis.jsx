import React from 'react';

export default function VistaPelvis({ cara, regionesSeleccionadas, onRegionToggle }) {
  const Hotspot = ({ x, y, regionId, label }) => {
    const selected = regionesSeleccionadas?.includes(regionId) || false;
    return (
      <g onClick={() => onRegionToggle(regionId)} className="cursor-pointer group">
        <circle cx={x} cy={y} r="12" fill="transparent" />
        <circle cx={x} cy={y} r="5" fill="transparent" stroke={selected ? '#22d3ee' : '#475569'} strokeWidth="1.2" />
        <circle cx={x} cy={y} r="2" fill={selected ? '#22d3ee' : '#94a3b8'} />
        <text
          x={x}
          y={y + (selected ? 18 : 14)}
          textAnchor="middle"
          fontSize="5.5"
          fill={selected ? '#22d3ee' : '#94a3b8'}
          className="font-bold"
        >
          {label}
        </text>
      </g>
    );
  };

  return (
    <div className="flex flex-col items-center w-full">
      <h4 className="text-sm font-bold text-cyan-400 mb-2">Pelvis y Cadera ({cara})</h4>
            <svg viewBox="0 0 200 180" className="w-full max-w-md drop-shadow-xl touch-manipulation">
        <style>{`
          .region { fill: #1e293b; stroke: #64748b; stroke-width: 1.5; cursor: pointer; transition: all 0.2s; }
          .region:hover { fill: #0ea5e9; stroke: #bae6fd; }
          .linea-anat { stroke: #334155; stroke-width: 1.5; fill: none; pointer-events: none; opacity: 0.6;}
          .cavidad { fill: #0a141d; stroke: #334155; stroke-width: 1; }
        `}</style>

        {cara === 'anterior' ? (
          <g>
            {/* Ilion izquierdo — redondeado, no ala */}
            <path
              className="region"
              onClick={() => onRegionToggle('ilion_izq')}
              d="M 100,35 
                 C 90,25 75,22 60,30 
                 C 48,38 42,55 45,75 
                 C 48,92 58,108 72,118 
                 C 82,125 95,128 100,128 
                 Z"
            />
            {/* Ilion derecho — espejo */}
            <path
              className="region"
              onClick={() => onRegionToggle('ilion_der')}
              d="M 100,35 
                 C 110,25 125,22 140,30 
                 C 152,38 158,55 155,75 
                 C 152,92 142,108 128,118 
                 C 118,125 105,128 100,128 
                 Z"
            />

            {/* Isquion izquierdo — curvado hacia abajo */}
            <path
              className="region"
              onClick={() => onRegionToggle('isquion_izq')}
              d="M 72,118 C 78,128 88,140 95,148 C 98,152 100,152 100,150 L 100,128 Z"
              opacity="0.75"
            />
            {/* Isquion derecho */}
            <path
              className="region"
              onClick={() => onRegionToggle('isquion_der')}
              d="M 128,118 C 122,128 112,140 105,148 C 102,152 100,152 100,150 L 100,128 Z"
              opacity="0.75"
            />

            {/* Pubis — centro, forma de corazón */}
            <path
              className="region"
              onClick={() => onRegionToggle('pubis')}
              d="M 82,130 C 90,125 100,130 100,140 C 100,130 110,125 118,130 C 122,138 115,150 100,155 C 85,150 78,138 82,130 Z"
            />

            {/* Cavidad pélvica interna — agujero oscuro */}
            <ellipse cx="100" cy="90" rx="28" ry="22" className="cavidad" pointerEvents="none" />

            {/* Líneas anatómicas de la cresta ilíaca */}
            <path className="linea-anat" d="M 55,42 C 70,36 85,34 98,35" />
            <path className="linea-anat" d="M 145,42 C 130,36 115,34 102,35" />

            <Hotspot x={62} y={72} regionId="ilion_izq" label="Ilion I" />
            <Hotspot x={138} y={72} regionId="ilion_der" label="Ilion D" />
            <Hotspot x={82} y={135} regionId="isquion_izq" label="Isquion I" />
            <Hotspot x={118} y={135} regionId="isquion_der" label="Isquion D" />
            <Hotspot x={100} y={142} regionId="pubis" label="Pubis" />
          </g>
        ) : (
          <g>
            {/* SACRO en el centro */}
            <path
              className="region"
              onClick={() => onRegionToggle('sacro')}
              d="M 85,30 C 100,22 115,30 118,65 L 100,105 L 82,65 C 85,30 85,30 85,30 Z"
            />
            <circle cx="95" cy="50" r="1.2" className="linea-anat" />
            <circle cx="105" cy="50" r="1.2" className="linea-anat" />
            <circle cx="95" cy="65" r="1.2" className="linea-anat" />
            <circle cx="105" cy="65" r="1.2" className="linea-anat" />

            {/* Glúteo izquierdo — redondeado y con volumen */}
            <path
              className="region"
              onClick={() => onRegionToggle('gluteo_izq')}
              d="M 45,45 
                 C 30,60 25,90 38,120 
                 C 50,142 75,148 92,140 
                 C 98,138 100,132 100,125 
                 L 100,105 
                 C 85,90 65,60 55,48 
                 Z"
            />
            {/* Glúteo derecho */}
            <path
              className="region"
              onClick={() => onRegionToggle('gluteo_der')}
              d="M 155,45 
                 C 170,60 175,90 162,120 
                 C 150,142 125,148 108,140 
                 C 102,138 100,132 100,125 
                 L 100,105 
                 C 115,90 135,60 145,48 
                 Z"
            />

            {/* Línea interglútea */}
            <path className="linea-anat" d="M 100,105 L 100,148" />
            {/* Pliegues subglúteos */}
            <path className="linea-anat" d="M 42,125 C 60,140 80,140 95,128" />
            <path className="linea-anat" d="M 158,125 C 140,140 120,140 105,128" />

            <Hotspot x={100} y={55} regionId="sacro" label="Sacro" />
            <Hotspot x={55} y={95} regionId="gluteo_izq" label="Glúteo I" />
            <Hotspot x={145} y={95} regionId="gluteo_der" label="Glúteo D" />
          </g>
        )}
      </svg>
    </div>
  );
}