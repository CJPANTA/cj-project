import React from 'react';

export default function VistaRodilla({ cara, lado, regionesSeleccionadas, onRegionToggle }) {
  const Hotspot = ({ x, y, regionId, label }) => {
    const selected = regionesSeleccionadas?.includes(regionId) || false;
    return (
      <g onClick={() => onRegionToggle(regionId)} className="cursor-pointer group">
        <circle cx={x} cy={y} r="14" fill="transparent" />
        <circle cx={x} cy={y} r="5" fill="transparent" stroke={selected ? '#22d3ee' : '#475569'} strokeWidth="1.5" />
        <circle cx={x} cy={y} r="2" fill={selected ? '#22d3ee' : '#94a3b8'} />
        <text x={x} y={y + (selected ? 18 : 14)} textAnchor="middle" fontSize="4.5" fill={selected ? '#22d3ee' : '#cbd5e1'} className="font-bold tracking-wider">
          {label}
        </text>
      </g>
    );
  };

  const reflejar = (x) => (lado === 'derecho' ? 200 - x : x);
  const titulo = `Rodilla ${lado === 'izquierdo' ? 'Izquierda' : 'Derecha'}`;

  return (
    <div className="flex flex-col items-center w-full">
      <h4 className="text-sm font-bold text-cyan-400 mb-2">{titulo} ({cara})</h4>
      <svg viewBox="0 0 200 200" className="w-full max-w-sm drop-shadow-xl touch-manipulation">
        <style>{`
          .region { fill: #1e293b; stroke: #64748b; stroke-width: 1.5; cursor: pointer; transition: all 0.2s; }
          .region:hover { fill: #0ea5e9; stroke: #bae6fd; }
          .hueso { stroke: #334155; stroke-width: 2; fill: none; opacity: 0.5; }
        `}</style>

        {cara === 'anterior' ? (
          <g>
            <path className="hueso" d={`M ${reflejar(60)},30 C ${reflejar(60)},90 ${reflejar(90)},90 ${reflejar(100)},70 C ${reflejar(110)},90 ${reflejar(140)},90 ${reflejar(140)},30`} />
            <path className="hueso" d={`M ${reflejar(65)},110 C ${reflejar(65)},100 ${reflejar(135)},100 ${reflejar(135)},110 L ${reflejar(120)},170 L ${reflejar(80)},170 Z`} />

            <path className="region" onClick={() => onRegionToggle('menisco_med')}
                  d={`M ${reflejar(65)},95 C ${reflejar(80)},85 ${reflejar(95)},95 ${reflejar(95)},105 C ${reflejar(80)},105 ${reflejar(65)},105 ${reflejar(65)},95 Z`} />
            <path className="region" onClick={() => onRegionToggle('menisco_lat')}
                  d={`M ${reflejar(135)},95 C ${reflejar(120)},85 ${reflejar(105)},95 ${reflejar(105)},105 C ${reflejar(120)},105 ${reflejar(135)},105 ${reflejar(135)},95 Z`} />

            <path className="region" onClick={() => onRegionToggle('lcp')}
                  d={`M ${reflejar(105)},75 L ${reflejar(115)},105 L ${reflejar(105)},105 L ${reflejar(95)},75 Z`} opacity="0.5" />
            <path className="region" onClick={() => onRegionToggle('lca')}
                  d={`M ${reflejar(85)},105 L ${reflejar(105)},70 L ${reflejar(115)},70 L ${reflejar(95)},105 Z`} opacity="0.8" />

            <path className="region" onClick={() => onRegionToggle('rotula')}
                  d={`M ${reflejar(85)},55 C ${reflejar(115)},50 ${reflejar(115)},85 ${reflejar(100)},95 C ${reflejar(85)},85 ${reflejar(85)},50 ${reflejar(85)},55 Z`} opacity="0.9" />

            <Hotspot x={reflejar(100)} y={70} regionId="rotula" label="Rótula" />
            <Hotspot x={reflejar(95)} y={90} regionId="lca" label="LCA" />
            <Hotspot x={reflejar(105)} y={115} regionId="lcp" label="LCP" />
            <Hotspot x={reflejar(75)} y={100} regionId="menisco_med" label="Menisco Med." />
            <Hotspot x={reflejar(125)} y={100} regionId="menisco_lat" label="Menisco Lat." />
          </g>
        ) : (
          <g>
            <path className="region" onClick={() => onRegionToggle('poplitea')}
                  d={`M ${reflejar(100)},40 C ${reflejar(130)},70 ${reflejar(130)},90 ${reflejar(100)},120 C ${reflejar(70)},90 ${reflejar(70)},70 ${reflejar(100)},40 Z`} />
            <path className="region" onClick={() => onRegionToggle('lcm_post')}
                  d={`M ${reflejar(65)},70 L ${reflejar(75)},70 L ${reflejar(75)},110 L ${reflejar(65)},110 Z`} />
            <path className="region" onClick={() => onRegionToggle('lcl_post')}
                  d={`M ${reflejar(135)},70 L ${reflejar(125)},70 L ${reflejar(125)},110 L ${reflejar(135)},110 Z`} />

            <Hotspot x={reflejar(100)} y={80} regionId="poplitea" label="Fosa Poplítea" />
            <Hotspot x={reflejar(70)} y={90} regionId="lcm_post" label="LCM" />
            <Hotspot x={reflejar(130)} y={90} regionId="lcl_post" label="LCL" />
          </g>
        )}
      </svg>
    </div>
  );
}