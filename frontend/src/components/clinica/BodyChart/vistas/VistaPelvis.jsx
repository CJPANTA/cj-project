import React from 'react';

export default function VistaPelvis({ cara, regionesSeleccionadas, onRegionToggle }) {
  const Hotspot = ({ x, y, regionId, label }) => {
    const selected = regionesSeleccionadas?.includes(regionId) || false;
    return (
      <g onClick={() => onRegionToggle(regionId)} className="cursor-pointer group">
        <circle cx={x} cy={y} r="12" fill="transparent" />
        <circle cx={x} cy={y} r="5" fill="transparent" stroke={selected ? '#22d3ee' : '#475569'} strokeWidth="1.2" />
        <circle cx={x} cy={y} r="2" fill={selected ? '#22d3ee' : '#94a3b8'} />
        <text x={x} y={y + (selected ? 18 : 14)} textAnchor="middle" fontSize="3.5" fill={selected ? '#22d3ee' : '#94a3b8'} className="font-bold">{label}</text>
      </g>
    );
  };

  return (
    <div className="flex flex-col items-center w-full">
      <h4 className="text-sm font-bold text-cyan-400 mb-2">Pelvis y Cadera ({cara})</h4>
      <svg viewBox="0 0 200 160" className="w-full max-w-sm drop-shadow-xl touch-manipulation">
        <style>{`
          .region { fill: #1e293b; stroke: #64748b; stroke-width: 1.5; cursor: pointer; transition: all 0.2s; }
          .region:hover { fill: #0ea5e9; stroke: #bae6fd; }
          .linea-anat { stroke: #334155; stroke-width: 1.5; fill: none; pointer-events: none; opacity: 0.6;}
        `}</style>

        {cara === 'anterior' ? (
          <g>
            {/* ILION (Cresta ilíaca) */}
            <path className="region" onClick={() => onRegionToggle('ilion_izq')}
                  d="M 30,30 C 50,15 80,40 100,90 C 80,110 50,140 40,140 C 20,140 10,70 30,30 Z" />
            <path className="region" onClick={() => onRegionToggle('ilion_der')}
                  d="M 170,30 C 150,15 120,40 100,90 C 120,110 150,140 160,140 C 180,140 190,70 170,30 Z" />

            {/* ISQUION (Parte inferior, asiento) */}
            <path className="region" onClick={() => onRegionToggle('isquion_izq')}
                  d="M 40,140 C 50,140 80,110 100,90 C 90,120 70,150 55,155 C 45,155 40,150 40,140 Z" opacity="0.7" />
            <path className="region" onClick={() => onRegionToggle('isquion_der')}
                  d="M 160,140 C 150,140 120,110 100,90 C 110,120 130,150 145,155 C 155,155 160,150 160,140 Z" opacity="0.7" />

            {/* PUBIS (Sínfisis púbica) */}
            <path className="region" onClick={() => onRegionToggle('pubis')}
                  d="M 85,115 C 100,105 115,115 115,125 L 100,145 L 85,125 Z" />

            <path className="linea-anat" d="M 40,40 C 60,30 80,50 95,85" />
            <path className="linea-anat" d="M 160,40 C 140,30 120,50 105,85" />

            <Hotspot x={60} y={70} regionId="ilion_izq" label="Ilion I" />
            <Hotspot x={140} y={70} regionId="ilion_der" label="Ilion D" />
            <Hotspot x={70} y={130} regionId="isquion_izq" label="Isquion I" />
            <Hotspot x={130} y={130} regionId="isquion_der" label="Isquion D" />
            <Hotspot x={100} y={125} regionId="pubis" label="Pubis" />
          </g>
        ) : (
          <g>
            {/* SACRO */}
            <path className="region" onClick={() => onRegionToggle('sacro')}
                  d="M 75,30 C 100,20 125,30 120,70 L 100,110 L 80,70 C 75,30 75,30 75,30 Z" />
            <circle cx="95" cy="50" r="1" className="linea-anat" />
            <circle cx="105" cy="50" r="1" className="linea-anat" />
            <circle cx="95" cy="65" r="1" className="linea-anat" />
            <circle cx="105" cy="65" r="1" className="linea-anat" />

            {/* GLÚTEOS (con división ilion/isquion) */}
            <path className="region" onClick={() => onRegionToggle('gluteo_izq')}
                  d="M 30,40 C 10,80 30,140 80,140 C 95,140 100,120 100,110 L 80,70 C 60,50 40,40 30,40 Z" />
            <path className="region" onClick={() => onRegionToggle('gluteo_der')}
                  d="M 170,40 C 190,80 170,140 120,140 C 105,140 100,120 100,110 L 120,70 C 140,50 160,40 170,40 Z" />

            <path className="linea-anat" d="M 40,125 C 60,135 80,130 90,120" />
            <path className="linea-anat" d="M 160,125 C 140,135 120,130 110,120" />

            <Hotspot x={100} y={45} regionId="sacro" label="Sacro" />
            <Hotspot x={60} y={90} regionId="gluteo_izq" label="Glúteo I" />
            <Hotspot x={140} y={90} regionId="gluteo_der" label="Glúteo D" />
          </g>
        )}
      </svg>
    </div>
  );
}