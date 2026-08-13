// src/components/clinica/BodyChart/vistas/VistaGeneral.jsx
import React from 'react';

export default function VistaGeneral({
  cara,
  onSeleccionarRegion,
  regionesSeleccionadas,
  onRegionToggle,
  temaOscuro
}) {
  const transformacion = cara === 'posterior' ? 'scale(-1, 1) translate(-200, 0)' : '';

  const Hotspot = ({ x, y, regionId, label, isMacro }) => {
    const selected = regionesSeleccionadas?.includes(regionId) || false;
    const isMacroRegion = isMacro || false;

    return (
      <g
        onClick={() => {
          if (isMacroRegion) {
            onSeleccionarRegion(regionId);
          } else {
            onRegionToggle(regionId);
          }
        }}
        className="cursor-pointer group"
      >
        <circle cx={x} cy={y} r="12" fill="transparent" />
        <circle
          cx={x}
          cy={y}
          r="4.5"
          fill="transparent"
          stroke={selected ? '#22d3ee' : (isMacroRegion ? '#facc15' : '#475569')}
          strokeWidth="1.2"
          className="group-hover:stroke-[#38bdf8] transition-all duration-200"
          opacity={selected ? "1" : (isMacroRegion ? "0.7" : "0.4")}
        />
        <circle
          cx={x}
          cy={y}
          r="1.8"
          fill={selected ? '#22d3ee' : (isMacroRegion ? '#facc15' : '#94a3b8')}
        />
        <text
          x={x}
          y={y + (selected ? 15 : 12)}
          textAnchor="middle"
          fontSize="3.2"
          fill={selected ? '#22d3ee' : (isMacroRegion ? '#facc15' : '#94a3b8')}
          className="font-bold"
        >
          {label}
        </text>
        {isMacroRegion && (
          <text x={x} y={y + 7} textAnchor="middle" fontSize="2.8" fill="#facc15" className="font-bold">▼</text>
        )}
      </g>
    );
  };

  return (
    <svg viewBox="0 0 200 320" className="w-full h-auto drop-shadow-xl touch-manipulation">
      <defs>
        <linearGradient id="pielGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <style>
          {`
            .region-base { fill: url(#pielGrad); stroke: #38bdf8; stroke-width: 1.5; transition: all 0.2s ease; cursor: pointer; }
            .region-base:hover { fill: #0ea5e9; stroke: #bae6fd; stroke-width: 2.5; filter: drop-shadow(0px 0px 6px rgba(56,189,248,0.4)); }
          `}
        </style>
      </defs>

      <g transform={transformacion}>
        
        {/* CABEZA Y CUELLO */}
        <g>
          <path className="region-base" onClick={() => onSeleccionarRegion('cabeza')} 
                d="M 87,22 C 87,7 113,7 113,22 C 113,34 107,42 105,46 C 106,50 112,52 115,55 L 85,55 C 88,52 94,50 95,46 C 93,42 87,34 87,22 Z" />
          <Hotspot x={100} y={28} regionId="cabeza" label="Cabeza" isMacro={true} />
        </g>

        {/* TÓRAX */}
        <g>
          <path className="region-base" onClick={() => onSeleccionarRegion('torax')} 
                d="M 85,55 C 98,58 115,55 115,55 C 122,68 118,98 112,120 L 88,120 C 82,98 78,68 85,55 Z" />
          <Hotspot x={100} y={88} regionId="torax" label="Tórax" isMacro={true} />
        </g>

        {/* HOMBROS */}
        <g>
          <path className="region-base" onClick={() => onSeleccionarRegion('hombro_izq')} d="M 115,55 C 126,55 132,60 129,71 C 123,73 117,67 115,55 Z" />
          <path className="region-base" onClick={() => onSeleccionarRegion('hombro_der')} d="M 85,55 C 74,55 68,60 71,71 C 77,73 83,67 85,55 Z" />
          <Hotspot x={125} y={63} regionId="hombro_izq" label="Hombro I" isMacro={true} />
          <Hotspot x={75} y={63} regionId="hombro_der" label="Hombro D" isMacro={true} />
        </g>

        {/* BRAZOS */}
        <g>
          <path className="region-base" onClick={() => onSeleccionarRegion('brazo_izq')} 
                d="M 129,71 C 138,83 134,112 130,142 C 128,154 123,154 120,142 C 118,112 121,88 116,73 C 119,69 125,69 129,71 Z" />
          <path className="region-base" onClick={() => onSeleccionarRegion('brazo_der')} 
                d="M 71,71 C 62,83 66,112 70,142 C 72,154 77,154 80,142 C 82,112 79,88 84,73 C 81,69 75,69 71,71 Z" />
          <Hotspot x={126} y={110} regionId="brazo_izq" label="Brazo I" isMacro={true} />
          <Hotspot x={74} y={110} regionId="brazo_der" label="Brazo D" isMacro={true} />
        </g>

        {/* MANOS (Forma anatómica sin aspecto de guante de box) */}
        <g>
          <path className="region-base" onClick={() => onSeleccionarRegion('mano_izq')} 
                d="M 120,142 L 130,142 C 131,148 133,156 131,163 C 129,167 124,167 121,160 C 119,152 119,146 120,142 Z" />
          <path className="region-base" onClick={() => onSeleccionarRegion('mano_der')} 
                d="M 80,142 L 70,142 C 69,148 67,156 69,163 C 71,167 76,167 79,160 C 81,152 81,146 80,142 Z" />
          <Hotspot x={125} y={154} regionId="mano_izq" label="Mano I" isMacro={true} />
          <Hotspot x={75} y={154} regionId="mano_der" label="Mano D" isMacro={true} />
        </g>

        {/* PELVIS Y CADERA */}
        <g>
          <path className="region-base" onClick={() => onSeleccionarRegion('pelvis')} 
                d="M 88,120 L 112,120 C 116,136 114,154 106,168 L 100,172 L 94,168 C 86,154 84,136 88,120 Z" />
          <Hotspot x={100} y={145} regionId="pelvis" label="Pelvis" isMacro={true} />
        </g>

        {/* PIERNAS (Separadas, con volumen muscular natural y sin verse como fideos) */}
        <g>
          {/* Pierna Izquierda */}
          <path className="region-base" onClick={() => onSeleccionarRegion('pierna_izq')} 
                d="M 103,172 L 108,168 C 120,185 121,210 114,235 C 111,245 113,268 111,288 L 103,288 C 104,268 107,245 105,235 C 107,210 105,185 103,172 Z" />
          {/* Pierna Derecha */}
          <path className="region-base" onClick={() => onSeleccionarRegion('pierna_der')} 
                d="M 97,172 L 92,168 C 80,185 79,210 86,235 C 89,245 87,268 89,288 L 97,288 C 96,268 93,245 95,235 C 93,210 95,185 97,172 Z" />
          
          <Hotspot x={112} y={205} regionId="pierna_izq" label="Pierna I" isMacro={true} />
          <Hotspot x={88} y={205} regionId="pierna_der" label="Pierna D" isMacro={true} />
          <Hotspot x={108} y={248} regionId="rodilla_izq" label="Rodilla I" isMacro={true} />
          <Hotspot x={92} y={248} regionId="rodilla_der" label="Rodilla D" isMacro={true} />
        </g>

        {/* PIES (Separados y con forma anatómica orientada al frente/afuera) */}
        <g>
          <path className="region-base" onClick={() => onSeleccionarRegion('pie_izq')} 
                d="M 103,288 L 111,288 C 115,294 119,303 113,308 C 107,311 101,304 103,288 Z" />
          <path className="region-base" onClick={() => onSeleccionarRegion('pie_der')} 
                d="M 97,288 L 89,288 C 85,294 81,303 87,308 C 93,311 99,304 97,288 Z" />
          <Hotspot x={110} y={300} regionId="pie_izq" label="Pie I" isMacro={true} />
          <Hotspot x={90} y={300} regionId="pie_der" label="Pie D" isMacro={true} />
        </g>

      </g>
    </svg>
  );
}