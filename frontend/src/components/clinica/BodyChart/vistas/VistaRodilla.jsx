import React from 'react';

export default function VistaRodilla({ cara, lado, regionesSeleccionadas, onRegionToggle }) {
  const esDerecho = lado === 'derecho';
  const reflejar = (x) => (esDerecho ? 200 - x : x);

  const Hotspot = ({ x, y, regionId, label, fontSize }) => {
    const selected = regionesSeleccionadas?.includes(regionId) || false;
    return (
      <g onClick={() => onRegionToggle(regionId)} className="cursor-pointer group">
        <circle cx={x} cy={y} r="14" fill="transparent" />
        <circle cx={x} cy={y} r="5" fill="transparent" stroke={selected ? '#22d3ee' : '#475569'} strokeWidth="1.5" />
        <circle cx={x} cy={y} r="2" fill={selected ? '#22d3ee' : '#94a3b8'} />
        <text
          x={x}
          y={y + (selected ? 20 : 16)}
          textAnchor="middle"
          fontSize={fontSize || 6}
          fill={selected ? '#22d3ee' : '#cbd5e1'}
          className="font-bold tracking-wider"
        >
          {label}
        </text>
      </g>
    );
  };

  const titulo = `Rodilla ${lado === 'izquierdo' ? 'Izquierda' : 'Derecha'}`;

  return (
    <div className="flex flex-col items-center w-full">
      <h4 className="text-sm font-bold text-cyan-400 mb-2">{titulo} ({cara})</h4>
       <svg viewBox="0 0 200 220" className="w-full max-w-lg drop-shadow-xl touch-manipulation">
        <style>{`
          .region { fill: #1e293b; stroke: #64748b; stroke-width: 1.5; cursor: pointer; transition: all 0.2s; }
          .region:hover { fill: #0ea5e9; stroke: #bae6fd; }
          .hueso { stroke: #334155; stroke-width: 2; fill: none; opacity: 0.5; }
        `}</style>

        {cara === 'anterior' ? (
          <g>
            {/* Fémur */}
            <path className="hueso" d={`M ${reflejar(60)},10 C ${reflejar(60)},50 ${reflejar(80)},60 ${reflejar(100)},60 C ${reflejar(120)},60 ${reflejar(140)},50 ${reflejar(140)},10`} />
            {/* Tibia y peroné */}
            <path className="hueso" d={`M ${reflejar(70)},140 L ${reflejar(70)},200 L ${reflejar(130)},200 L ${reflejar(130)},140 Z`} />
            <path className="hueso" d={`M ${reflejar(60)},95 L ${reflejar(140)},95`} opacity="0.3" />

            {/* Meniscos */}
            <path
              className="region"
              onClick={() => onRegionToggle('menisco_med')}
              d={`M ${reflejar(45)},90 C ${reflejar(60)},80 ${reflejar(75)},85 ${reflejar(78)},100 C ${reflejar(70)},108 ${reflejar(55)},108 ${reflejar(45)},90 Z`}
            />
            <path
              className="region"
              onClick={() => onRegionToggle('menisco_lat')}
              d={`M ${reflejar(155)},90 C ${reflejar(140)},80 ${reflejar(125)},85 ${reflejar(122)},100 C ${reflejar(130)},108 ${reflejar(145)},108 ${reflejar(155)},90 Z`}
            />

            {/* LCA y LCP */}
            <path
              className="region"
              onClick={() => onRegionToggle('lca')}
              d={`M ${reflejar(88)},70 L ${reflejar(96)},100 L ${reflejar(90)},105 L ${reflejar(84)},70 Z`}
              opacity="0.85"
            />
            <path
              className="region"
              onClick={() => onRegionToggle('lcp')}
              d={`M ${reflejar(116)},70 L ${reflejar(108)},100 L ${reflejar(114)},105 L ${reflejar(120)},70 Z`}
              opacity="0.6"
            />

            {/* Rótula */}
            <path
              className="region"
              onClick={() => onRegionToggle('rotula')}
              d={`M ${reflejar(82)},45 C ${reflejar(100)},38 ${reflejar(118)},45 ${reflejar(118)},65 C ${reflejar(118)},82 ${reflejar(105)},92 ${reflejar(100)},92 C ${reflejar(95)},92 ${reflejar(82)},82 ${reflejar(82)},65 Z`}
              opacity="0.9"
            />

            <Hotspot x={reflejar(100)} y={65} regionId="rotula" label="Rótula" fontSize={6.5} />
            <Hotspot x={reflejar(92)} y={100} regionId="lca" label="LCA" fontSize={5.5} />
            <Hotspot x={reflejar(112)} y={100} regionId="lcp" label="LCP" fontSize={5.5} />
            <Hotspot x={reflejar(58)} y={100} regionId="menisco_med" label="Menisco Med." fontSize={5.5} />
            <Hotspot x={reflejar(142)} y={100} regionId="menisco_lat" label="Menisco Lat." fontSize={5.5} />
          </g>
        ) : (
          <g>
            {/* Fosa poplítea */}
            <path
              className="region"
              onClick={() => onRegionToggle('poplitea')}
              d={`M ${reflejar(100)},40 C ${reflejar(135)},70 ${reflejar(135)},95 ${reflejar(100)},130 C ${reflejar(65)},95 ${reflejar(65)},70 ${reflejar(100)},40 Z`}
            />
            {/* LCM y LCL */}
            <path
              className="region"
              onClick={() => onRegionToggle('lcm_post')}
              d={`M ${reflejar(50)},70 L ${reflejar(62)},70 L ${reflejar(62)},120 L ${reflejar(50)},120 Z`}
            />
            <path
              className="region"
              onClick={() => onRegionToggle('lcl_post')}
              d={`M ${reflejar(150)},70 L ${reflejar(138)},70 L ${reflejar(138)},120 L ${reflejar(150)},120 Z`}
            />

            <Hotspot x={reflejar(100)} y={85} regionId="poplitea" label="Fosa Poplítea" fontSize={6} />
            <Hotspot x={reflejar(56)} y={95} regionId="lcm_post" label="LCM" fontSize={6} />
            <Hotspot x={reflejar(144)} y={95} regionId="lcl_post" label="LCL" fontSize={6} />
          </g>
        )}
      </svg>
    </div>
  );
}