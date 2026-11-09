// src/components/clinica/BodyChart/vistas/VistaRodillaPro.jsx
import React from 'react';

export const ESTRUCTURA_RODILLA = {
  huesos: [
    { id: 'femur', nombre: 'Fémur (Cóndilos)', zona: 'Huesos' },
    { id: 'rotula', nombre: 'Rótula', zona: 'Huesos' },
    { id: 'tibia', nombre: 'Tibia (Platillo Tibial)', zona: 'Huesos' },
    { id: 'perone', nombre: 'Peroné (Cabeza)', zona: 'Huesos' },
  ],
  meniscos_ligamentos: [
    { id: 'menisco_med', nombre: 'Menisco Medial', zona: 'Estructuras Internas' },
    { id: 'menisco_lat', nombre: 'Menisco Lateral', zona: 'Estructuras Internas' },
    { id: 'lca', nombre: 'Ligamento Cruzado Anterior (LCA)', zona: 'Ligamentos' },
    { id: 'lcp', nombre: 'Ligamento Cruzado Posterior (LCP)', zona: 'Ligamentos' },
    { id: 'lcm', nombre: 'Ligamento Colateral Medial', zona: 'Ligamentos' },
    { id: 'lcl', nombre: 'Ligamento Colateral Lateral', zona: 'Ligamentos' },
  ],
  tendones_musculos: [
    { id: 'tendon_cuadriceps', nombre: 'Tendón del Cuádriceps', zona: 'Tendones' },
    { id: 'tendon_patelar', nombre: 'Tendón Patelar / Rotuliano', zona: 'Tendones' },
    { id: 'cuadriceps', nombre: 'Cuádriceps', zona: 'Músculos' },
    { id: 'biceps_femoral', nombre: 'Bíceps Femoral', zona: 'Isquiotibiales' },
    { id: 'semitendinoso', nombre: 'Semitendinoso', zona: 'Isquiotibiales' },
    { id: 'semi_membranoso', nombre: 'Semimembranoso', zona: 'Isquiotibiales' },
    { id: 'gemelo_med', nombre: 'Gastrocnemio Medial', zona: 'Músculos' },
    { id: 'gemelo_lat', nombre: 'Gastrocnemio Lateral', zona: 'Músculos' },
  ],
  nervios_vasos: [
    { id: 'nervio_ciatico', nombre: 'Nervio Ciático', zona: 'Inervación' },
    { id: 'nervio_peroneo', nombre: 'Nervio Peroneo Común', zona: 'Inervación' },
    { id: 'arteria_poplitea', nombre: 'Arteria Poplítea', zona: 'Vascular' },
  ]
};

const ZonaAnatomica = ({ id, afectacion, onRegionToggle, children, label }) => {
  const activarConTeclado = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onRegionToggle(id);
    }
  };

  const colorFill   = afectacion ? afectacion.color  : undefined;
  const colorStroke = afectacion ? afectacion.border : undefined;

  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={label || id}
      aria-pressed={!!afectacion}
      onClick={() => onRegionToggle(id)}
      onKeyDown={activarConTeclado}
      className="zona-interactiva focus:outline-none cursor-pointer group"
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child, {
          style: {
            fill:   colorFill   || child.props.style?.fill,
            stroke: colorStroke || child.props.style?.stroke,
            filter: afectacion ? `drop-shadow(0 0 6px ${afectacion.color})` : undefined,
          },
          className: [
            'hueso-rodilla',
            afectacion ? 'selected' : '',
            child.props.className || '',
          ].filter(Boolean).join(' '),
        });
      })}
    </g>
  );
};

export default function VistaRodillaPro({
  cara = 'anterior',
  lado = 'derecho',
  afectaciones = {},
  onRegionToggle,
}) {
  const esDerecho = lado === 'derecho' || lado === 'derecha';
  const getAfect = (id) => afectaciones[id];

  return (
    <div className="flex w-full flex-col items-center">
      <h4 className="mb-2 text-xs sm:text-sm font-black tracking-wider text-[#22d3ee] font-mono uppercase text-center">
        Rodilla {lado === 'izquierdo' || lado === 'izquierda' ? 'Izquierda' : 'Derecha'} —{' '}
        {cara === 'anterior' ? 'Vista Anterior (Rótula · Meniscos · Ligamentos)' : 'Vista Posterior (Fosa Poplítea · Isquios)'}
      </h4>

      <svg viewBox="0 0 340 400" width="100%" height="100%" className="h-full w-full max-w-xl touch-manipulation select-none">
        <style>{`
          .hueso-base   { fill: #09131f; stroke: #334155; stroke-width: 1.2; stroke-linejoin: round; }
          .hueso-rodilla { fill: #1e293b; stroke: #475569; stroke-width: 1.2; stroke-linejoin: round; transition: all 150ms ease; cursor: pointer; }
          .hueso-rodilla:hover { fill: #085a75; stroke: #38bdf8; stroke-width: 1.8; filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.5)); }
          .zona-interactiva:focus-visible .hueso-rodilla { stroke: #ffffff !important; stroke-width: 2.5 !important; }
        `}</style>

        {cara === 'anterior' ? (
          <g transform={esDerecho ? 'translate(340 0) scale(-1 1)' : undefined}>
            {/* FÉMUR (Mitad inferior) */}
            <ZonaAnatomica id="femur" afectacion={getAfect('femur')} onRegionToggle={onRegionToggle} label="Fémur">
              <path d="M 120 20 C 130 100, 100 140, 90 160 C 130 180, 210 180, 250 160 C 240 140, 210 100, 220 20 Z" />
            </ZonaAnatomica>

            {/* TIBIA Y PERONÉ */}
            <ZonaAnatomica id="tibia" afectacion={getAfect('tibia')} onRegionToggle={onRegionToggle} label="Tibia">
              <path d="M 100 230 C 130 215, 210 215, 240 230 L 220 380 L 120 380 Z" />
            </ZonaAnatomica>
            <ZonaAnatomica id="perone" afectacion={getAfect('perone')} onRegionToggle={onRegionToggle} label="Peroné">
              <path d="M 240 235 C 255 240, 260 270, 250 320 L 225 320 Z" />
            </ZonaAnatomica>

            {/* MENISCOS */}
            <ZonaAnatomica id="menisco_med" afectacion={getAfect('menisco_med')} onRegionToggle={onRegionToggle} label="Menisco Medial">
              <path d="M 90 180 C 110 190, 150 200, 160 200 L 150 215 C 120 215, 95 195, 90 180 Z" />
            </ZonaAnatomica>
            <ZonaAnatomica id="menisco_lat" afectacion={getAfect('menisco_lat')} onRegionToggle={onRegionToggle} label="Menisco Lateral">
              <path d="M 250 180 C 230 190, 190 200, 180 200 L 190 215 C 220 215, 245 195, 250 180 Z" />
            </ZonaAnatomica>

            {/* LIGAMENTOS CRUZADOS */}
            <ZonaAnatomica id="lca" afectacion={getAfect('lca')} onRegionToggle={onRegionToggle} label="LCA">
              <path d="M 155 170 L 175 205 L 160 210 L 145 175 Z" style={{ fill: 'rgba(168, 85, 247, 0.4)', stroke: '#c084fc', strokeWidth: 1.5 }} />
            </ZonaAnatomica>
            <ZonaAnatomica id="lcp" afectacion={getAfect('lcp')} onRegionToggle={onRegionToggle} label="LCP">
              <path d="M 185 170 L 165 205 L 180 210 L 195 175 Z" style={{ fill: 'rgba(168, 85, 247, 0.4)', stroke: '#c084fc', strokeWidth: 1.5 }} />
            </ZonaAnatomica>

            {/* RÓTULA */}
            <ZonaAnatomica id="rotula" afectacion={getAfect('rotula')} onRegionToggle={onRegionToggle} label="Rótula">
              <ellipse cx="170" cy="155" rx="35" ry="40" />
            </ZonaAnatomica>

            {/* TENDONES */}
            <ZonaAnatomica id="tendon_cuadriceps" afectacion={getAfect('tendon_cuadriceps')} onRegionToggle={onRegionToggle} label="Tendón Cuádriceps">
              <path d="M 160 80 L 180 80 L 175 120 L 165 120 Z" stroke="#94a3b8" strokeWidth="2" strokeDasharray="3 2" fill="none" style={{ pointerEvents: 'all' }} />
            </ZonaAnatomica>
            <ZonaAnatomica id="tendon_patelar" afectacion={getAfect('tendon_patelar')} onRegionToggle={onRegionToggle} label="Tendón Patelar">
              <path d="M 165 195 L 175 195 L 180 230 L 160 230 Z" stroke="#94a3b8" strokeWidth="2" strokeDasharray="3 2" fill="none" style={{ pointerEvents: 'all' }} />
            </ZonaAnatomica>

            {/* LIGAMENTOS COLATERALES */}
            <ZonaAnatomica id="lcm" afectacion={getAfect('lcm')} onRegionToggle={onRegionToggle} label="LCM">
              <path d="M 85 170 L 95 170 L 100 230 L 90 230 Z" />
            </ZonaAnatomica>
            <ZonaAnatomica id="lcl" afectacion={getAfect('lcl')} onRegionToggle={onRegionToggle} label="LCL">
              <path d="M 255 170 L 245 170 L 240 230 L 250 230 Z" />
            </ZonaAnatomica>
          </g>
        ) : (
          <g transform={esDerecho ? 'translate(340 0) scale(-1 1)' : undefined}>
            {/* FÉMUR POSTERIOR Y FOSA POPLÍTEA */}
            <ZonaAnatomica id="femur" afectacion={getAfect('femur')} onRegionToggle={onRegionToggle} label="Fémur Posterior">
              <path d="M 80 20 C 100 80, 100 120, 90 160 C 130 180, 210 180, 250 160 C 240 120, 240 80, 260 20 Z" />
            </ZonaAnatomica>

            {/* ISQUIOTIBIALES */}
            <ZonaAnatomica id="biceps_femoral" afectacion={getAfect('biceps_femoral')} onRegionToggle={onRegionToggle} label="Bíceps Femoral">
              <path d="M 240 20 C 230 60, 220 100, 215 140 C 235 145, 245 120, 255 60 Z" />
            </ZonaAnatomica>
            <ZonaAnatomica id="semitendinoso" afectacion={getAfect('semitendinoso')} onRegionToggle={onRegionToggle} label="Semitendinoso">
              <path d="M 90 20 C 105 60, 115 100, 120 130 C 105 135, 95 115, 85 60 Z" />
            </ZonaAnatomica>
            <ZonaAnatomica id="semi_membranoso" afectacion={getAfect('semi_membranoso')} onRegionToggle={onRegionToggle} label="Semimembranoso">
              <path d="M 110 20 C 120 60, 130 100, 135 130 C 125 135, 115 115, 105 60 Z" />
            </ZonaAnatomica>

            {/* TIBIA POSTERIOR Y GEMELOS */}
            <ZonaAnatomica id="tibia" afectacion={getAfect('tibia')} onRegionToggle={onRegionToggle} label="Tibia Posterior">
              <path d="M 110 220 C 130 210, 210 210, 230 220 L 210 380 L 130 380 Z" />
            </ZonaAnatomica>

            {/* FOSA POPLÍTEA (Área central de la corva) */}
            <ZonaAnatomica id="fosa_poplitea" afectacion={getAfect('fosa_poplitea')} onRegionToggle={onRegionToggle} label="Fosa Poplítea">
              <ellipse cx="170" cy="185" rx="30" ry="25" style={{ fill: '#0a141d', stroke: '#334155', strokeWidth: 1.5 }} />
            </ZonaAnatomica>

            <ZonaAnatomica id="gemelo_med" afectacion={getAfect('gemelo_med')} onRegionToggle={onRegionToggle} label="Gastrocnemio Medial">
              <path d="M 100 230 C 140 210, 160 230, 160 290 L 130 380 Z" />
            </ZonaAnatomica>
            <ZonaAnatomica id="gemelo_lat" afectacion={getAfect('gemelo_lat')} onRegionToggle={onRegionToggle} label="Gastrocnemio Lateral">
              <path d="M 240 230 C 200 210, 180 230, 180 290 L 210 380 Z" />
            </ZonaAnatomica>

            {/* NERVIOS Y VASOS */}
            <ZonaAnatomica id="nervio_ciatico" afectacion={getAfect('nervio_ciatico')} onRegionToggle={onRegionToggle} label="Nervio Ciático">
              <path d="M 170 30 C 170 100, 170 140, 170 170" stroke="#eab308" strokeWidth="4" strokeLinecap="round" fill="none" style={{ pointerEvents: 'all' }} />
            </ZonaAnatomica>
            <ZonaAnatomica id="arteria_poplitea" afectacion={getAfect('arteria_poplitea')} onRegionToggle={onRegionToggle} label="Arteria Poplítea">
              <path d="M 175 170 C 175 200, 170 220, 170 240" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" fill="none" style={{ pointerEvents: 'all' }} />
            </ZonaAnatomica>
            <ZonaAnatomica id="nervio_peroneo" afectacion={getAfect('nervio_peroneo')} onRegionToggle={onRegionToggle} label="Nervio Peroneo">
              <path d="M 170 170 C 190 200, 220 230, 230 280" stroke="#eab308" strokeWidth="3" strokeLinecap="round" fill="none" style={{ pointerEvents: 'all' }} />
            </ZonaAnatomica>
          </g>
        )}
      </svg>
    </div>
  );
}