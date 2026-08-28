// src/components/clinica/BodyChart/vistas/VistaPie.jsx
import React from 'react';

export default function VistaPie({ cara, lado, regionesSeleccionadas, onRegionToggle }) {
  const Hotspot = ({ x, y, regionId, label }) => {
    const selected = regionesSeleccionadas?.includes(regionId) || false;
    return (
      <g onClick={() => onRegionToggle(regionId)} className="cursor-pointer group">
        <circle cx={x} cy={y} r="14" fill="transparent" />
        <circle cx={x} cy={y} r="5" fill="transparent" stroke={selected ? '#22d3ee' : '#475569'} strokeWidth="1.5" />
        <circle cx={x} cy={y} r="2" fill={selected ? '#22d3ee' : '#94a3b8'} />
        <text x={x} y={y + (selected ? 18 : 15)} textAnchor="middle" fontSize="4.2" fill={selected ? '#22d3ee' : '#cbd5e1'} className="font-bold tracking-wider">
          {label}
        </text>
      </g>
    );
  };

  const reflejar = (x) => (lado === 'derecho' ? 240 - x : x);
  const titulo = `Pie ${lado === 'izquierdo' ? 'Izquierdo' : 'Derecho'} (${cara === 'lateral' ? 'Vista Lateral Anatómica' : 'Vista Plantar'})`;

  return (
    <div className="flex flex-col items-center w-full">
      <h4 className="text-sm font-bold text-cyan-400 mb-2">{titulo}</h4>
      <svg viewBox="0 0 240 190" className="w-full max-w-md drop-shadow-xl touch-manipulation">
        <style>{`
          .seccion-pie { stroke: #64748b; stroke-width: 1.5; cursor: pointer; transition: all 0.2s; }
          .seccion-pie:hover { fill: #0ea5e9 !important; stroke: #bae6fd; }
          .seccion-retropie { fill: #1e293b; }
          .seccion-mediopie { fill: #2d3748; }
          .seccion-antepie { fill: #1a202c; }
          .seccion-falanges { fill: #334155; }
          .contorno-oseo { stroke: #64748b; stroke-width: 1; fill: none; pointer-events: none; opacity: 0.8; }
        `}</style>

        <g>
          {cara === 'lateral' ? (
            /* VISTA LATERAL - Proporción anatómica continua y fluida */
            <>
              {/* 1. Retropié (Calcáneo y Talón) */}
              <path className="seccion-pie seccion-retropie" onClick={() => onRegionToggle('retropie_calcaneo')}
                    d={`M ${reflejar(130)},70 
                       C ${reflejar(140)},50 ${reflejar(175)},45 ${reflejar(195)},70 
                       C ${reflejar(215)},95 ${reflejar(205)},140 ${reflejar(155)},140 
                       C ${reflejar(130)},140 ${reflejar(120)},110 ${reflejar(130)},70 Z`} />

              {/* 2. Mediopié (Tarso y Arco Longitudinal) */}
              <path className="seccion-pie seccion-mediopie" onClick={() => onRegionToggle('mediopie_tarso')}
                    d={`M ${reflejar(130)},70 
                       C ${reflejar(120)},110 ${reflejar(130)},140 ${reflejar(155)},140 
                       C ${reflejar(130)},140 ${reflejar(100)},135 ${reflejar(85)},115 
                       C ${reflejar(75)},100 ${reflejar(80)},80 ${reflejar(95)},70 
                       Z`} />

              {/* 3. Antepié (Metatarsianos con la pendiente del empeine correcta) */}
              <path className="seccion-pie seccion-antepie" onClick={() => onRegionToggle('antepie_metatarso')}
                    d={`M ${reflejar(95)},70 
                       C ${reflejar(105)},65 ${reflejar(120)},60 ${reflejar(130)},70 
                       C ${reflejar(90)},80 ${reflejar(85)},105 ${reflejar(85)},115 
                       C ${reflejar(80)},112 ${reflejar(75)},105 ${reflejar(75)},95 
                       Z`} />

              {/* 4. Falanges (Dedos alargados y aplanados en perfil) */}
              <path className="seccion-pie seccion-falanges" onClick={() => onRegionToggle('falanges_lateral')}
                    d={`M ${reflejar(75)},95 
                       C ${reflejar(65)},93 ${reflejar(40)},90 ${reflejar(20)},93 
                       C ${reflejar(12)},95 ${reflejar(10)},100 ${reflejar(15)},104 
                       C ${reflejar(25)},108 ${reflejar(60)},112 ${reflejar(85)},115 
                       Z`} />

              {/* Elementos internos óseos de referencia */}
              <path className="contorno-oseo" d={`M ${reflejar(165)},75 Q ${reflejar(140)},100 ${reflejar(110)},90`} />

              {/* Hotspots posicionados lógicamente */}
              <Hotspot x={reflejar(175)} y={105} regionId="retropie_calcaneo" label="Retropié" />
              <Hotspot x={reflejar(115)} y={115} regionId="mediopie_tarso" label="Mediopié" />
              <Hotspot x={reflejar(95)} y={85} regionId="antepie_metatarso" label="Metatarso" />
              <Hotspot x={reflejar(45)} y={102} regionId="falanges_lateral" label="Dedos" />
            </>
          ) : (
            /* VISTA PLANTAR - Planta de pie anatómicamente proporcionada y conectada */
            <>
              {/* 1. Talón */}
              <path className="seccion-pie seccion-retropie" onClick={() => onRegionToggle('talon_plantar')}
                    d={`M ${reflejar(75)},75 
                       C ${reflejar(55)},78 ${reflejar(55)},122 ${reflejar(75)},125 
                       C ${reflejar(95)},128 ${reflejar(100)},115 ${reflejar(105)},100 
                       C ${reflejar(100)},85 ${reflejar(90)},72 ${reflejar(75)},75 Z`} />

              {/* 2. Mediopié (Arco interno cóncavo) */}
              <path className="seccion-pie seccion-mediopie" onClick={() => onRegionToggle('mediopie_plantar')}
                    d={`M ${reflejar(105)},100 
                       C ${reflejar(110)},120 ${reflejar(125)},130 ${reflejar(145)},125 
                       C ${reflejar(135)},100 ${reflejar(130)},80 ${reflejar(105)},75 
                       C ${reflejar(100)},85 ${reflejar(100)},95 ${reflejar(105)},100 Z`} />

              {/* 3. Metatarsianos */}
              <path className="seccion-pie seccion-antepie" onClick={() => onRegionToggle('metatarsianos_plantar')}
                    d={`M ${reflejar(145)},125 
                       C ${reflejar(165)},120 ${reflejar(185)},115 ${reflejar(195)},100 
                       C ${reflejar(185)},85 ${reflejar(165)},80 ${reflejar(145)},80 
                       C ${reflejar(130)},80 ${reflejar(135)},100 ${reflejar(145)},125 Z`} />

              {/* 4. Dedos (Anatómicamente en abanico) */}
              <path className="seccion-pie seccion-falanges" onClick={() => onRegionToggle('falanges_plantar')}
                    d={`M ${reflejar(195)},100 
                       C ${reflejar(205)},103 ${reflejar(215)},98 ${reflejar(220)},92 
                       C ${reflejar(222)},82 ${reflejar(205)},80 ${reflejar(195)},82 
                       L ${reflejar(190)},90 L ${reflejar(195)},100 Z`} />

              {/* Hotspots Plantares */}
              <Hotspot x={reflejar(78)} y={100} regionId="talon_plantar" label="Talón" />
              <Hotspot x={reflejar(125)} y={100} regionId="mediopie_plantar" label="Arco" />
              <Hotspot x={reflejar(165)} y={100} regionId="metatarsianos_plantar" label="Metatarso" />
              <Hotspot x={reflejar(205)} y={90} regionId="falanges_plantar" label="Dedos" />
            </>
          )}
        </g>
      </svg>
    </div>
  );
}