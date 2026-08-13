import React from 'react';

export default function VistaCabeza({ cara, regionesSeleccionadas, onRegionToggle }) {
  const Hotspot = ({ x, y, regionId, label }) => {
    const selected = regionesSeleccionadas?.includes(regionId) || false;
    return (
      <g onClick={() => onRegionToggle(regionId)} className="cursor-pointer group">
        {/* Área de clic ampliada */}
        <circle cx={x} cy={y} r="16" fill="transparent" />
        {/* Anillo exterior */}
        <circle cx={x} cy={y} r="6" fill="transparent" stroke={selected ? '#22d3ee' : '#475569'} strokeWidth="1.5" />
        {/* Punto central */}
        <circle cx={x} cy={y} r="3" fill={selected ? '#22d3ee' : '#94a3b8'} />
        {/* Etiqueta de texto */}
        <text x={x} y={y + (selected ? 16 : 14)} textAnchor="middle" fontSize="6" fill={selected ? '#22d3ee' : '#cbd5e1'} className="font-bold tracking-wider">
          {label}
        </text>
      </g>
    );
  };

  return (
    <div className="flex flex-col items-center w-full">
      <h4 className="text-sm font-bold text-cyan-400 mb-2">Cabeza y Cuello ({cara})</h4>
      <svg viewBox="0 0 300 280" className="w-full max-w-sm drop-shadow-xl touch-manipulation">
        <style>{`
          .region { fill: #1e293b; stroke: #64748b; stroke-width: 1.5; cursor: pointer; transition: all 0.2s; }
          .region:hover { fill: #0ea5e9; stroke: #bae6fd; }
        `}</style>
        
        {cara === 'anterior' ? (
          <g>
            {/* CUELLO Y TRAPECIOS (Fondo) - Forma anatómica ancha */}
            <path className="region" onClick={() => onRegionToggle('cuello')} 
                  d="M 110,150 C 110,190 90,210 50,230 L 250,230 C 210,210 190,190 190,150 Z" />

            {/* CABEZA - Forma ovalada anatómica (Centro X=150) */}
            <path className="region" onClick={() => onRegionToggle('cabeza')} 
                  d="M 150,20 C 210,20 230,60 230,100 C 230,150 180,170 150,170 C 120,170 70,150 70,100 C 70,60 90,20 150,20 Z" />
            
            {/* CEJAS */}
            <path className="region" onClick={() => onRegionToggle('ceja_izq')} d="M 105,65 Q 120,55 135,65" strokeWidth="2.5" fill="none" />
            <path className="region" onClick={() => onRegionToggle('ceja_der')} d="M 165,65 Q 180,55 195,65" strokeWidth="2.5" fill="none" />

            {/* OJOS */}
            <circle className="region" onClick={() => onRegionToggle('ojo_izq')} cx="120" cy="85" r="9" />
            <circle className="region" onClick={() => onRegionToggle('ojo_der')} cx="180" cy="85" r="9" />
            
            {/* NARIZ */}
            <path className="region" onClick={() => onRegionToggle('nariz')} d="M 150,85 L 162,115 L 138,115 Z" />
            
            {/* BOCA */}
            <path className="region" onClick={() => onRegionToggle('boca')} d="M 130,140 Q 150,150 170,140 Q 150,145 130,140 Z" />
            
            {/* ATM (Articulación Temporomandibular) */}
            <circle className="region" onClick={() => onRegionToggle('atm_izq')} cx="95" cy="125" r="10" />
            <circle className="region" onClick={() => onRegionToggle('atm_der')} cx="205" cy="125" r="10" />
            
            {/* OREJAS (Sobresaliendo ligeramente del óvalo) */}
            <path className="region" onClick={() => onRegionToggle('oreja_izq')} d="M 70,90 C 60,90 60,120 75,120 Z" />
            <path className="region" onClick={() => onRegionToggle('oreja_der')} d="M 230,90 C 240,90 240,120 225,120 Z" />
            
            {/* HOTSPOTS (Puntos interactivos ubicados exactamente sobre las formas) */}
            <Hotspot x={150} y={45} regionId="frente" label="Frente" />
            <Hotspot x={120} y={85} regionId="ojo_izq" label="Ojo I" />
            <Hotspot x={180} y={85} regionId="ojo_der" label="Ojo D" />
            <Hotspot x={150} y={105} regionId="nariz" label="Nariz" />
            <Hotspot x={150} y={140} regionId="boca" label="Boca" />
            <Hotspot x={95} y={125} regionId="atm_izq" label="ATM I" />
            <Hotspot x={205} y={125} regionId="atm_der" label="ATM D" />
            <Hotspot x={65} y={105} regionId="oreja_izq" label="Oreja I" />
            <Hotspot x={235} y={105} regionId="oreja_der" label="Oreja D" />
            <Hotspot x={120} y={60} regionId="ceja_izq" label="Ceja I" />
            <Hotspot x={180} y={60} regionId="ceja_der" label="Ceja D" />
            <Hotspot x={150} y={200} regionId="cuello" label="Cuello Ant." />
          </g>
        ) : (
          <g>
            {/* VISTA POSTERIOR */}
            {/* CUELLO Y TRAPECIOS */}
            <path className="region" onClick={() => onRegionToggle('nuca')} 
                  d="M 110,150 C 110,190 90,210 50,230 L 250,230 C 210,210 190,190 190,150 Z" />
            
            {/* CRÁNEO POSTERIOR */}
            <path className="region" onClick={() => onRegionToggle('occipital')} 
                  d="M 150,20 C 210,20 230,60 230,100 C 230,150 180,170 150,170 C 120,170 70,150 70,100 C 70,60 90,20 150,20 Z" />
            
            {/* OREJAS DESDE ATRÁS */}
            <path className="region" onClick={() => onRegionToggle('oreja_izq')} d="M 70,95 C 62,95 62,115 75,115 Z" />
            <path className="region" onClick={() => onRegionToggle('oreja_der')} d="M 230,95 C 238,95 238,115 225,115 Z" />

            <Hotspot x={150} y={90} regionId="occipital" label="Occipital" />
            <Hotspot x={150} y={190} regionId="nuca" label="Nuca (Cervical)" />
            <Hotspot x={65} y={105} regionId="oreja_izq" label="Oreja I" />
            <Hotspot x={235} y={105} regionId="oreja_der" label="Oreja D" />
          </g>
        )}
      </svg>
    </div>
  );
}