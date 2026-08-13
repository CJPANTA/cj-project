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

  const reflejar = (x) => (lado === 'derecho' ? 200 - x : x);
  const titulo = `Pie ${lado === 'izquierdo' ? 'Izquierdo' : 'Derecho'}`;

  return (
    <div className="flex flex-col items-center w-full">
      <h4 className="text-sm font-bold text-cyan-400 mb-2">{titulo} ({cara})</h4>
      <svg viewBox="0 0 200 220" className="w-full max-w-sm drop-shadow-xl touch-manipulation">
        <style>{`
          .region-pie { fill: #1e293b; stroke: #64748b; stroke-width: 1.5; cursor: pointer; transition: all 0.2s; }
          .region-pie:hover { fill: #0ea5e9; stroke: #bae6fd; }
          .linea-anat { stroke: #334155; stroke-width: 1.2; fill: none; pointer-events: none; opacity: 0.8; }
        `}</style>

        <g>
          {cara === 'plantar' ? (
            /* Vista Plantar / Planta del pie */
            <path className="region-pie" onClick={() => onRegionToggle('planta_pie')}
                  d={`M ${reflejar(75)},70 C ${reflejar(95)},60 ${reflejar(135)},60 ${reflejar(155)},75 C ${reflejar(165)},100 ${reflejar(160)},140 ${reflejar(140)},170 C ${reflejar(125)},190 ${reflejar(90)},190 ${reflejar(75)},170 C ${reflejar(60)},130 ${reflejar(60)},90 ${reflejar(75)},70 Z`} />
          ) : (
            /* Vista Dorsal / Empeine y contorno anatómico real con talón y antepié */
            <path className="region-pie" onClick={() => onRegionToggle('empeine')}
                  d={`M ${reflejar(70)},90 L ${reflejar(110)},65 C ${reflejar(130)},65 ${reflejar(150)},75 ${reflejar(165)},95 C ${reflejar(175)},115 ${reflejar(170)},135 ${reflejar(155)},145 L ${reflejar(145)},142 C ${reflejar(140)},155 ${reflejar(120)},165 ${reflejar(95)},162 C ${reflejar(75)},158 ${reflejar(62)},130 ${reflejar(65)},110 Z`} />
          )}

          {/* HOTSPOTS ANATÓMICOS */}
          <Hotspot x={reflejar(120)} y={85} regionId="talon" label="Talón (Calcáneo)" />
          <Hotspot x={reflejar(95)} y={115} regionId="empeine" label="Medio pie / Empeine" />
          <Hotspot x={reflejar(75)} y={145} regionId="metatarsos" label="Metatarsos" />
          <Hotspot x={reflejar(65)} y={170} regionId="falanges_pie" label="Antepié / Dedos" />
        </g>
      </svg>
    </div>
  );
}