// src/components/clinica/BodyChart/vistas/VistaPie.jsx
import React from 'react';

export default function VistaPie({ cara, lado, regionesSeleccionadas, onRegionToggle }) {
  const reflejar = (x) => (lado === 'derecho' ? 240 - x : x);
  const titulo = `Pie ${lado === 'izquierdo' ? 'Izquierdo' : 'Derecho'}`;
  const isSelected = (id) => regionesSeleccionadas?.includes(id) || false;

  return (
    <div className="flex flex-col items-center w-full">
      <h4 className="text-sm font-bold text-cyan-400 mb-2">{titulo}</h4>
      <svg viewBox="0 0 240 300" className="w-full max-w-md drop-shadow-xl touch-manipulation">
        <style>{`
          .hueso-pie { fill: #334155; stroke: #64748b; stroke-width: 1; cursor: pointer; transition: all 0.2s; }
          .hueso-pie:hover { fill: #0ea5e9; stroke: #bae6fd; stroke-width: 1.5; }
          .hueso-pie.selected { fill: #22d3ee; stroke: #67e8f9; stroke-width: 1.5; }
          .zona-label { font-size: 10px; fill: #94a3b8; text-anchor: middle; pointer-events: none; font-weight: 600; }
          .zona-label.activa { fill: #22d3ee; }
        `}</style>

        {cara === 'lateral' ? (
          /* ==================== VISTA LATERAL ==================== */
          <>
            {/* RETROPIÉ (Calcáneo) */}
            <g onClick={() => onRegionToggle('retropie_calcaneo')} style={{ cursor: 'pointer' }}>
              <path d={`M ${reflejar(50)},180 Q ${reflejar(60)},130 ${reflejar(95)},150 Q ${reflejar(100)},190 ${reflejar(50)},210 Z`}
                className={`hueso-pie ${isSelected('retropie_calcaneo') ? 'selected' : ''}`} />
            </g>
            <text x={reflejar(72)} y={225} className={`zona-label ${isSelected('retropie_calcaneo') ? 'activa' : ''}`}>Retropié</text>

            {/* MEDIOPIÉ (Tarso) */}
            <g onClick={() => onRegionToggle('mediopie_tarso')} style={{ cursor: 'pointer' }}>
              <path d={`M ${reflejar(95)},150 Q ${reflejar(130)},135 ${reflejar(165)},150 Q ${reflejar(170)},175 ${reflejar(150)},185 Q ${reflejar(115)},190 ${reflejar(95)},185 Z`}
                className={`hueso-pie ${isSelected('mediopie_tarso') ? 'selected' : ''}`} />
            </g>
            <text x={reflejar(135)} y={130} className={`zona-label ${isSelected('mediopie_tarso') ? 'activa' : ''}`}>Mediopié</text>

            {/* ANTEPIÉ (Metatarsianos) */}
            <g onClick={() => onRegionToggle('antepie_metatarso')} style={{ cursor: 'pointer' }}>
              <path d={`M ${reflejar(165)},150 L ${reflejar(215)},148 L ${reflejar(220)},172 L ${reflejar(170)},178 Z`}
                className={`hueso-pie ${isSelected('antepie_metatarso') ? 'selected' : ''}`} />
            </g>
            <text x={reflejar(192)} y={140} className={`zona-label ${isSelected('antepie_metatarso') ? 'activa' : ''}`}>Metatarso</text>

            {/* FALANGES */}
            <g onClick={() => onRegionToggle('falanges_lateral')} style={{ cursor: 'pointer' }}>
              <path d={`M ${reflejar(215)},152 Q ${reflejar(232)},150 ${reflejar(238)},158 Q ${reflejar(232)},166 ${reflejar(215)},168 Z`}
                className={`hueso-pie ${isSelected('falanges_lateral') ? 'selected' : ''}`} />
            </g>
            <text x={reflejar(228)} y={145} className={`zona-label ${isSelected('falanges_lateral') ? 'activa' : ''}`}>Dedos</text>
          </>
        ) : (
          /* ==================== VISTA PLANTAR ==================== */
          <>
            {/* TALÓN (Calcáneo) */}
            <g onClick={() => onRegionToggle('talon_plantar')} style={{ cursor: 'pointer' }}>
              <ellipse cx={reflejar(120)} cy={235} rx={38} ry={32}
                className={`hueso-pie ${isSelected('talon_plantar') ? 'selected' : ''}`} />
            </g>
            <text x={reflejar(120)} y={282} className={`zona-label ${isSelected('talon_plantar') ? 'activa' : ''}`}>Talón</text>

            {/* MEDIOPIÉ (Arco) */}
            <g onClick={() => onRegionToggle('mediopie_plantar')} style={{ cursor: 'pointer' }}>
              <ellipse cx={reflejar(120)} cy={180} rx={30} ry={28}
                className={`hueso-pie ${isSelected('mediopie_plantar') ? 'selected' : ''}`} />
            </g>
            <text x={reflejar(68)} y={185} className={`zona-label ${isSelected('mediopie_plantar') ? 'activa' : ''}`}>Arco</text>

            {/* METATARSIANOS (5 huesos) */}
            <g onClick={() => onRegionToggle('metatarsianos_plantar')} style={{ cursor: 'pointer' }}>
              {[0,1,2,3,4].map(i => (
                <circle key={`met-${i}`} cx={reflejar(82 + i * 19)} cy={128} r={9}
                  className={`hueso-pie ${isSelected('metatarsianos_plantar') ? 'selected' : ''}`} />
              ))}
            </g>
            <text x={reflejar(120)} y={110} className={`zona-label ${isSelected('metatarsianos_plantar') ? 'activa' : ''}`}>Metatarsianos</text>

            {/* FALANGES (5 dedos) */}
            <g onClick={() => onRegionToggle('falanges_plantar')} style={{ cursor: 'pointer' }}>
              {[0,1,2,3,4].map(i => (
                <circle key={`fal-${i}`} cx={reflejar(82 + i * 19)} cy={82} r={8}
                  className={`hueso-pie ${isSelected('falanges_plantar') ? 'selected' : ''}`} />
              ))}
            </g>
            <text x={reflejar(120)} y={62} className={`zona-label ${isSelected('falanges_plantar') ? 'activa' : ''}`}>Falanges (Dedos)</text>
          </>
        )}
      </svg>
    </div>
  );
}