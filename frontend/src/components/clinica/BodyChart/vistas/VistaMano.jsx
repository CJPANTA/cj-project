// src/components/clinica/BodyChart/vistas/VistaMano.jsx
import React from 'react';

export default function VistaMano({ cara, lado, regionesSeleccionadas, onRegionToggle }) {
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
  const titulo = `Mano ${lado === 'izquierdo' ? 'Izquierda' : 'Derecha'}`;

  return (
    <div className="flex flex-col items-center w-full">
      <h4 className="text-sm font-bold text-cyan-400 mb-2">{titulo} ({cara})</h4>
      <svg viewBox="0 0 200 220" className="w-full max-w-sm drop-shadow-xl touch-manipulation">
        <style>{`
          .region-mano { fill: #1e293b; stroke: #64748b; stroke-width: 1.5; cursor: pointer; transition: all 0.2s; }
          .region-mano:hover { fill: #0ea5e9; stroke: #bae6fd; }
          .linea-anat { stroke: #334155; stroke-width: 1.2; fill: none; pointer-events: none; opacity: 0.8; }
        `}</style>

        <g>
          {/* SILUETA ANATÓMICA BASADA EN REFERENCIA REAL DE MANO */}
          <path className="region-mano" onClick={() => onRegionToggle('mano_completa')}
                d={`M ${reflejar(80)},195 
                   L ${reflejar(120)},195 
                   {/* Lado cubital y meñique */}
                   C ${reflejar(124)},175 ${reflejar(128)},135 ${reflejar(131)},120
                   L ${reflejar(139)},122 L ${reflejar(143)},72 L ${reflejar(133)},70 L ${reflejar(128)},110
                   {/* Dedo anular */}
                   L ${reflejar(117)},110 L ${reflejar(116)},55 L ${reflejar(106)},55 L ${reflejar(107)},110
                   {/* Dedo medio */}
                   L ${reflejar(96)},110 L ${reflejar(95)},48 L ${reflejar(85)},48 L ${reflejar(87)},110
                   {/* Dedo índice */}
                   L ${reflejar(76)},110 L ${reflejar(73)},62 L ${reflejar(63)},66 L ${reflejar(69)},116
                   {/* Espacio interdigital y pulgar con eminencia tenar */}
                   C ${reflejar(58)},122 ${reflejar(48)},132 ${reflejar(52)},148
                   C ${reflejar(56)},162 ${reflejar(70)},168 ${reflejar(76)},152
                   L ${reflejar(80)},195 Z`} />

          {/* GUÍAS ESQUELÉTICAS INTERNAS */}
          <path className="linea-anat" d={`M ${reflejar(100)},180 C ${reflejar(100)},150 ${reflejar(100)},125 ${reflejar(100)},95`} />

          {/* HOTSPOTS ANATÓMICOS */}
          <Hotspot x={reflejar(100)} y={178} regionId="carpo" label="Carpo (Muñeca)" />
          <Hotspot x={reflejar(100)} y={135} regionId="metacarpo" label="Metacarpos" />
          <Hotspot x={reflejar(100)} y={92} regionId="falanges_prox" label="F. Proximales" />
          <Hotspot x={reflejar(100)} y={62} regionId="falanges_dist" label="F. Distales / Dedos" />
          <Hotspot x={reflejar(62)} y={138} regionId="pulgar" label="Primer Dedal (Pulgar)" />

          {cara === 'palmar' && (
            <Hotspot x={reflejar(82)} y={155} regionId="eminencia_tenar" label="Eminencia Tenar" />
          )}
        </g>
      </svg>
    </div>
  );
}