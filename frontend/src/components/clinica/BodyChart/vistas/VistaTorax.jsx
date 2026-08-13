import React from 'react';

export default function VistaTorax({ cara, regionesSeleccionadas, onRegionToggle }) {
  const Hotspot = ({ x, y, regionId, label }) => {
    const selected = regionesSeleccionadas?.includes(regionId) || false;
    return (
      <g onClick={() => onRegionToggle(regionId)} className="cursor-pointer group">
        {/* Área de clic ampliada */}
        <circle cx={x} cy={y} r="16" fill="transparent" />
        <circle cx={x} cy={y} r="6" fill="transparent" stroke={selected ? '#22d3ee' : '#475569'} strokeWidth="1.5" />
        <circle cx={x} cy={y} r="3" fill={selected ? '#22d3ee' : '#94a3b8'} />
        <text x={x} y={y + (selected ? 16 : 14)} textAnchor="middle" fontSize="6.5" fill={selected ? '#22d3ee' : '#cbd5e1'} className="font-bold tracking-wider">
          {label}
        </text>
      </g>
    );
  };

  return (
    <div className="flex flex-col items-center w-full">
      <h4 className="text-sm font-bold text-cyan-400 mb-2">Tórax y Abdomen ({cara})</h4>
      <svg viewBox="0 0 400 450" className="w-full max-w-md drop-shadow-xl touch-manipulation">
        <style>{`
          .region { fill: #1e293b; stroke: #64748b; stroke-width: 1.5; cursor: pointer; transition: all 0.2s; }
          .region:hover { fill: #0ea5e9; stroke: #bae6fd; }
          .linea-anat { stroke: #334155; stroke-width: 1; fill: none; pointer-events: none; }
        `}</style>

        {cara === 'anterior' ? (
          <g>
            {/* SILUETA BASE ANTERIOR (Torso humano real) */}
            <path className="region" onClick={() => onRegionToggle('torax')} 
                  d="M 160,30 C 160,60 130,70 80,80 C 60,84 60,120 75,160 C 95,210 120,270 130,340 C 135,370 160,380 200,380 C 240,380 265,370 270,340 C 280,270 305,210 325,160 C 340,120 340,84 320,80 C 270,70 240,60 240,30 Z" />

            {/* CLAVÍCULAS (Más realistas siguiendo el contorno del hombro) */}
            <path className="region" onClick={() => onRegionToggle('clavicula_izq')} 
                  d="M 190,75 C 160,70 110,70 90,80 C 110,75 160,75 190,82 Z" />
            <path className="region" onClick={() => onRegionToggle('clavicula_der')} 
                  d="M 210,75 C 240,70 290,70 310,80 C 290,75 240,75 210,82 Z" />

            {/* PECTORALES (Forma muscular redondeada inferior) */}
            <path className="region" onClick={() => onRegionToggle('pectoral_izq')} 
                  d="M 195,90 C 160,90 120,95 95,120 C 105,150 145,170 195,155 Z" />
            <path className="region" onClick={() => onRegionToggle('pectoral_der')} 
                  d="M 205,90 C 240,90 280,95 305,120 C 295,150 255,170 205,155 Z" />

            {/* ESTERNÓN (Hueso central) */}
            <path className="region" onClick={() => onRegionToggle('esternon')} 
                  d="M 195,90 L 205,90 L 203,180 L 197,180 Z" />

            {/* ABDOMEN (Bloque central que simula el recto abdominal) */}
            <path className="region" onClick={() => onRegionToggle('abdomen')} 
                  d="M 145,180 C 165,170 235,170 255,180 C 265,240 255,310 245,350 C 220,370 180,370 155,350 C 145,310 135,240 145,180 Z" />
            
            {/* Líneas estéticas del abdomen (Six-pack) */}
            <path className="linea-anat" d="M 200,180 L 200,350" />
            <path className="linea-anat" d="M 145,230 Q 200,240 255,230" />
            <path className="linea-anat" d="M 140,290 Q 200,300 260,290" />

            {/* COSTILLAS / OBLICUOS */}
            <path className="region" onClick={() => onRegionToggle('costillas_izq')} 
                  d="M 90,165 C 110,180 130,220 140,290 C 130,250 100,210 90,165 Z" />
            <path className="region" onClick={() => onRegionToggle('costillas_der')} 
                  d="M 310,165 C 290,180 270,220 260,290 C 270,250 300,210 310,165 Z" />

            {/* HOTSPOTS ANTERIORES */}
            <Hotspot x={140} y={72} regionId="clavicula_izq" label="Clavícula I" />
            <Hotspot x={260} y={72} regionId="clavicula_der" label="Clavícula D" />
            <Hotspot x={145} y={130} regionId="pectoral_izq" label="Pectoral I" />
            <Hotspot x={255} y={130} regionId="pectoral_der" label="Pectoral D" />
            <Hotspot x={200} y={130} regionId="esternon" label="Esternón" />
            <Hotspot x={115} y={220} regionId="costillas_izq" label="Costillas I" />
            <Hotspot x={285} y={220} regionId="costillas_der" label="Costillas D" />
            <Hotspot x={200} y={260} regionId="abdomen" label="Abdomen" />
          </g>
        ) : (
          <g>
            {/* SILUETA BASE POSTERIOR */}
            <path className="region" onClick={() => onRegionToggle('torax')} 
                  d="M 160,30 C 160,60 130,70 80,80 C 60,84 60,120 75,160 C 95,210 120,270 130,340 C 135,370 160,380 200,380 C 240,380 265,370 270,340 C 280,270 305,210 325,160 C 340,120 340,84 320,80 C 270,70 240,60 240,30 Z" />

            {/* TRAPECIOS (Forma de diamante superior) */}
            <path className="region" onClick={() => onRegionToggle('trapecio_izq')} 
                  d="M 200,40 L 160,40 C 130,60 100,70 80,80 C 110,95 150,110 200,160 Z" />
            <path className="region" onClick={() => onRegionToggle('trapecio_der')} 
                  d="M 200,40 L 240,40 C 270,60 300,70 320,80 C 290,95 250,110 200,160 Z" />

            {/* ESCÁPULAS (Triángulo anatómico) */}
            <path className="region" onClick={() => onRegionToggle('escapula_izq')} 
                  d="M 95,110 C 120,105 160,115 170,125 C 160,160 145,185 130,200 C 110,160 95,130 95,110 Z" />
            <path className="region" onClick={() => onRegionToggle('escapula_der')} 
                  d="M 305,110 C 280,105 240,115 230,125 C 240,160 255,185 270,200 C 290,160 305,130 305,110 Z" />

            {/* COLUMNA DORSAL / VERTEBRAL */}
            <path className="region" onClick={() => onRegionToggle('columna_dorsal')} 
                  d="M 195,160 L 205,160 L 205,375 L 195,375 Z" />

            {/* DORSAL ANCHO (Forma en "V" de la espalda baja) */}
            <path className="region" onClick={() => onRegionToggle('dorsal_ancho_izq')} 
                  d="M 125,200 C 110,240 120,290 135,340 C 150,355 175,365 195,370 L 195,200 Z" />
            <path className="region" onClick={() => onRegionToggle('dorsal_ancho_der')} 
                  d="M 275,200 C 290,240 280,290 265,340 C 250,355 225,365 205,370 L 205,200 Z" />

            {/* HOTSPOTS POSTERIORES */}
            <Hotspot x={140} y={90} regionId="trapecio_izq" label="Trapecio I" />
            <Hotspot x={260} y={90} regionId="trapecio_der" label="Trapecio D" />
            <Hotspot x={135} y={150} regionId="escapula_izq" label="Escápula I" />
            <Hotspot x={265} y={150} regionId="escapula_der" label="Escápula D" />
            <Hotspot x={200} y={260} regionId="columna_dorsal" label="Columna" />
            <Hotspot x={160} y={280} regionId="dorsal_ancho_izq" label="Dorsal I" />
            <Hotspot x={240} y={280} regionId="dorsal_ancho_der" label="Dorsal D" />
          </g>
        )}
      </svg>
    </div>
  );
}