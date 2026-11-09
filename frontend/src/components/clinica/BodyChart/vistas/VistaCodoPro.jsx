// src/components/clinica/BodyChart/vistas/VistaCodoPro.jsx
import React from 'react';

export const ESTRUCTURA_CODO = {
  huesos: [
    { id: 'humero_distal', nombre: 'Húmero Distal', zona: 'Huesos' },
    { id: 'epicondilo_med', nombre: 'Epicóndilo Medial', zona: 'Huesos' },
    { id: 'epicondilo_lat', nombre: 'Epicóndilo Lateral', zona: 'Huesos' },
    { id: 'radio', nombre: 'Cabeza del Radio', zona: 'Huesos' },
    { id: 'cubito', nombre: 'Olécranon / Cúbito', zona: 'Huesos' },
  ],
  ligamentos: [
    { id: 'lcl_codo', nombre: 'Ligamento Colateral Lateral', zona: 'Ligamentos' },
    { id: 'lcm_codo', nombre: 'Ligamento Colateral Medial', zona: 'Ligamentos' },
    { id: 'lig_anular', nombre: 'Ligamento Anular', zona: 'Ligamentos' },
  ],
  tendones: [
    { id: 'tendon_biceps_codo', nombre: 'Tendón Distal del Bíceps', zona: 'Tendones' },
    { id: 'tendon_triceps', nombre: 'Tendón del Tríceps', zona: 'Tendones' },
    { id: 'tendon_extensores', nombre: 'Tendones Extensores (Codo de Tenista)', zona: 'Tendones' },
    { id: 'tendon_flexores', nombre: 'Tendones Flexores (Codo de Golfista)', zona: 'Tendones' },
  ],
  nervios: [
    { id: 'nervio_cubital', nombre: 'Nervio Cubital', zona: 'Inervación' },
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
            'hueso-codo',
            afectacion ? 'selected' : '',
            child.props.className || '',
          ].filter(Boolean).join(' '),
        });
      })}
    </g>
  );
};

export default function VistaCodoPro({
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
        Codo {lado === 'izquierdo' || lado === 'izquierda' ? 'Izquierdo' : 'Derecho'} —{' '}
        {cara === 'anterior' ? 'Vista Anterior (Flexores · Bíceps)' : 'Vista Posterior (Extensores · Tríceps)'}
      </h4>

      <svg viewBox="0 0 340 400" width="100%" height="100%" className="h-full w-full max-w-xl touch-manipulation select-none">
        <style>{`
          .hueso-base   { fill: #09131f; stroke: #334155; stroke-width: 1.2; stroke-linejoin: round; }
          .hueso-codo { fill: #1e293b; stroke: #475569; stroke-width: 1.2; stroke-linejoin: round; transition: all 150ms ease; cursor: pointer; }
          .hueso-codo:hover { fill: #085a75; stroke: #38bdf8; stroke-width: 1.8; filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.5)); }
          .zona-interactiva:focus-visible .hueso-codo { stroke: #ffffff !important; stroke-width: 2.5 !important; }
        `}</style>

        {cara === 'anterior' ? (
          <g transform={esDerecho ? 'translate(340 0) scale(-1 1)' : undefined}>
            {/* Silueta base (Brazo y antebrazo) */}
            <path className="hueso-base" d="M 120 20 L 220 20 L 210 180 C 230 200, 240 260, 230 380 L 110 380 C 100 260, 110 200, 130 180 Z" />

            {/* HÚMERO DISTAL */}
            <ZonaAnatomica id="humero_distal" afectacion={getAfect('humero_distal')} onRegionToggle={onRegionToggle} label="Húmero Distal">
              <path d="M 130 20 L 210 20 L 205 160 L 135 160 Z" />
            </ZonaAnatomica>

            {/* EPICÓNDILOS */}
            <ZonaAnatomica id="epicondilo_med" afectacion={getAfect('epicondilo_med')} onRegionToggle={onRegionToggle} label="Epicóndilo Medial">
              <circle cx="120" cy="170" r="15" />
            </ZonaAnatomica>
            <ZonaAnatomica id="epicondilo_lat" afectacion={getAfect('epicondilo_lat')} onRegionToggle={onRegionToggle} label="Epicóndilo Lateral">
              <circle cx="220" cy="170" r="15" />
            </ZonaAnatomica>

            {/* RADIO Y CÚBITO (Antebrazo) */}
            <ZonaAnatomica id="radio" afectacion={getAfect('radio')} onRegionToggle={onRegionToggle} label="Radio">
              <path d="M 140 200 C 150 200, 160 210, 160 230 L 150 380 L 120 380 L 130 220 Z" />
            </ZonaAnatomica>
            <ZonaAnatomica id="cubito" afectacion={getAfect('cubito')} onRegionToggle={onRegionToggle} label="Cúbito">
              <path d="M 200 200 C 190 200, 180 210, 180 230 L 190 380 L 220 380 L 210 220 Z" />
            </ZonaAnatomica>

            {/* TENDÓN DEL BÍCEPS (Distal) */}
            <ZonaAnatomica id="tendon_biceps_codo" afectacion={getAfect('tendon_biceps_codo')} onRegionToggle={onRegionToggle} label="Tendón Distal Bíceps">
              <path d="M 155 160 L 165 160 L 160 210 Z" stroke="#fbbf24" strokeWidth="3" fill="none" style={{ pointerEvents: 'all' }} />
            </ZonaAnatomica>

            {/* TENDONES FLEXORES (Epicóndilo Medial) */}
            <ZonaAnatomica id="tendon_flexores" afectacion={getAfect('tendon_flexores')} onRegionToggle={onRegionToggle} label="Tendones Flexores">
              <path d="M 120 170 C 110 190, 115 210, 130 230" stroke="#94a3b8" strokeWidth="2.5" strokeDasharray="3 2" fill="none" style={{ pointerEvents: 'all' }} />
            </ZonaAnatomica>

            {/* LIGAMENTOS COLATERALES */}
            <ZonaAnatomica id="lcm_codo" afectacion={getAfect('lcm_codo')} onRegionToggle={onRegionToggle} label="LCM">
              <path d="M 115 185 L 125 185 L 135 220 L 125 220 Z" />
            </ZonaAnatomica>
            <ZonaAnatomica id="lcl_codo" afectacion={getAfect('lcl_codo')} onRegionToggle={onRegionToggle} label="LCL">
              <path d="M 225 185 L 215 185 L 205 220 L 215 220 Z" />
            </ZonaAnatomica>

            {/* LIGAMENTO ANULAR */}
            <ZonaAnatomica id="lig_anular" afectacion={getAfect('lig_anular')} onRegionToggle={onRegionToggle} label="Ligamento Anular">
              <path d="M 145 210 L 175 210 L 175 220 L 145 220 Z" opacity="0.6" />
            </ZonaAnatomica>

          </g>
        ) : (
          <g transform={esDerecho ? 'translate(340 0) scale(-1 1)' : undefined}>
            {/* Silueta base Posterior */}
            <path className="hueso-base" d="M 120 20 L 220 20 L 210 180 C 230 200, 240 260, 230 380 L 110 380 C 100 260, 110 200, 130 180 Z" />

            {/* HÚMERO POSTERIOR */}
            <ZonaAnatomica id="humero_distal" afectacion={getAfect('humero_distal')} onRegionToggle={onRegionToggle} label="Húmero Posterior">
              <path d="M 130 20 L 210 20 L 205 150 L 135 150 Z" />
            </ZonaAnatomica>

            {/* OLÉCRANON (El hueso que sobresale) */}
            <ZonaAnatomica id="cubito" afectacion={getAfect('cubito')} onRegionToggle={onRegionToggle} label="Olécranon (Cúbito)">
              <path d="M 140 160 C 140 130, 200 130, 200 160 L 210 380 L 130 380 Z" />
            </ZonaAnatomica>

            {/* TENDÓN DEL TRÍCEPS */}
            <ZonaAnatomica id="tendon_triceps" afectacion={getAfect('tendon_triceps')} onRegionToggle={onRegionToggle} label="Tendón del Tríceps">
              <path d="M 160 20 L 180 20 L 175 140 C 170 160, 165 160, 165 140 Z" />
            </ZonaAnatomica>

            {/* TENDONES EXTENSORES (Epicóndilo Lateral) */}
            <ZonaAnatomica id="tendon_extensores" afectacion={getAfect('tendon_extensores')} onRegionToggle={onRegionToggle} label="Tendones Extensores">
              <path d="M 220 170 C 230 190, 225 210, 210 230" stroke="#94a3b8" strokeWidth="2.5" strokeDasharray="3 2" fill="none" style={{ pointerEvents: 'all' }} />
            </ZonaAnatomica>

            {/* NERVIO CUBITAL (Canal epitroclear) */}
            <ZonaAnatomica id="nervio_cubital" afectacion={getAfect('nervio_cubital')} onRegionToggle={onRegionToggle} label="Nervio Cubital">
              <path d="M 120 170 C 115 200, 130 250, 140 300" stroke="#eab308" strokeWidth="3" strokeLinecap="round" fill="none" style={{ pointerEvents: 'all' }} />
            </ZonaAnatomica>

            {/* EPICÓNDILOS POSTERIORES (Resaltando el medial para el nervio cubital) */}
            <ZonaAnatomica id="epicondilo_med" afectacion={getAfect('epicondilo_med')} onRegionToggle={onRegionToggle} label="Epicóndilo Medial">
              <circle cx="120" cy="170" r="15" />
            </ZonaAnatomica>
            <ZonaAnatomica id="epicondilo_lat" afectacion={getAfect('epicondilo_lat')} onRegionToggle={onRegionToggle} label="Epicóndilo Lateral">
              <circle cx="220" cy="170" r="15" />
            </ZonaAnatomica>

          </g>
        )}
      </svg>
    </div>
  );
}