// src/components/clinica/BodyChart/vistas/VistaPie.jsx
import React from 'react';

export default function VistaPie({ cara, lado, regionesSeleccionadas, onRegionToggle }) {
  const Hotspot = ({ x, y, regionId, label }) => {
    const selected = regionesSeleccionadas?.includes(regionId) || false;
    return (
      <g onClick={() => onRegionToggle(regionId)} className="cursor-pointer group">
        <circle cx={x} cy={y} r="12" fill="transparent" />
        <circle cx={x} cy={y} r="4.5" fill="transparent" stroke={selected ? '#22d3ee' : '#475569'} strokeWidth="1.2" />
        <circle cx={x} cy={y} r="1.8" fill={selected ? '#22d3ee' : '#94a3b8'} />
        <text x={x} y={y + (selected ? 16 : 13)} textAnchor="middle" fontSize="3.8" fill={selected ? '#22d3ee' : '#cbd5e1'} className="font-bold tracking-wider">
          {label}
        </text>
      </g>
    );
  };

  const reflejar = (x) => (lado === 'derecho' ? 220 - x : x);
  const titulo = `Pie ${lado === 'izquierdo' ? 'Izquierdo' : 'Derecho'} (${cara === 'lateral' ? 'Vista Lateral / Perfil' : 'Vista Plantar'})`;

  return (
    <div className="flex flex-col items-center w-full">
      <h4 className="text-sm font-bold text-cyan-400 mb-2">{titulo}</h4>
      <svg viewBox="0 0 220 180" className="w-full max-w-sm drop-shadow-xl touch-manipulation">
        <style>{`
          .region-pie { fill: #1e293b; stroke: #64748b; stroke-width: 1.5; cursor: pointer; transition: all 0.2s; }
          .region-pie:hover { fill: #0ea5e9; stroke: #bae6fd; }
          .linea-anat { stroke: #334155; stroke-width: 1.2; fill: none; pointer-events: none; opacity: 0.8; }
        `}</style>

        <g>
          {cara === 'lateral' ? (
            /* ZONAS PARA VISTA LATERAL (Perfil con Aquiles y Calcáneo) */
            <>
              <path className="region-pie" onClick={() => onRegionToggle('pie_lateral_completo')}
                    d="M 40,30 C 35,60 30,110 50,130 C 70,150 140,150 170,130 C 190,120 195,100 180,95 C 150,90 120,85 100,70 C 80,50 60,30 40,30 Z" />
              
              <Hotspot x={reflejar(65)} y={115} regionId="retropie_talon" label="Retropie (Calcáneo / Tobillo)" />
              <Hotspot x={reflejar(110)} y={100} regionId="mediopie_arco" label="Mediopie (Arco / Tarso)" />
              <Hotspot x={reflejar(155)} y={115} regionId="antepie_metatarso" label="Antepié" />
              <Hotspot x={reflejar(175)} y={90} regionId="falanges_pie" label="Dedos" />
            </>
          ) : (
            /* ZONAS PARA VISTA PLANTAR / SUPERIOR */
            <>
              <path className="region-pie" onClick={() => onRegionToggle('pie_plantar_completo')}
                    d="M 45,70 C 35,90 45,110 70,115 C 100,120 140,110 170,90 C 190,75 190,65 170,50 C 130,30 90,30 45,50 C 40,55 42,65 45,70 Z" />

              <Hotspot x={reflejar(60)} y={80} regionId="talon_plantar" label="Talón (Plantar)" />
              <Hotspot x={reflejar(110)} y={80} regionId="mediopie_plantar" label="Mediopie / Arco" />
              <Hotspot x={reflejar(155)} y={80} regionId="metatarsianos" label="Metatarsianos" />
              <Hotspot x={reflejar(185)} y={80} regionId="falanges_plantar" label="Falanges" />
            </>
          )}
        </g>
      </svg>
    </div>
  );
}