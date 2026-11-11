// src/components/clinica/BodyChart/vistas/VistaCodoPro.jsx
import React from 'react';

export const ESTRUCTURA_CODO = {
  huesos: [
    { id: 'humero_distal', nombre: 'Húmero Distal', zona: 'Estructuras Óseas' },
    { id: 'epicondilo_med', nombre: 'Epicóndilo Medial / Epitróclea', zona: 'Estructuras Óseas' },
    { id: 'epicondilo_lat', nombre: 'Epicóndilo Lateral', zona: 'Estructuras Óseas' },
    { id: 'radio_cabeza', nombre: 'Cabeza & Cuello del Radio', zona: 'Estructuras Óseas' },
    { id: 'cubito_olecranon', nombre: 'Olécranon & Cúbito Proximal', zona: 'Estructuras Óseas' },
  ],
  musculos: [
    { id: 'biceps_braquial', nombre: 'Bíceps Braquial (Vientre Distal)', zona: 'Compartimento Anterior' },
    { id: 'braquial_anterior', nombre: 'Músculo Braquial Anterior', zona: 'Compartimento Anterior' },
    { id: 'braquiorradial', nombre: 'Braquiorradial / Supinador Largo', zona: 'Compartimento Anterolateral' },
    { id: 'pronador_redondo', nombre: 'Pronador Redondo', zona: 'Compartimento Anteromedial' },
    { id: 'triceps_distal', nombre: 'Tríceps Braquial (Vientre Distal)', zona: 'Compartimento Posterior' },
    { id: 'anconeo', nombre: 'Músculo Ancóneo', zona: 'Compartimento Posterolateral' },
  ],
  tendones_ligamentos: [
    { id: 'tendon_extensores', nombre: 'Tendón Común Extensor (Codo de Tenista)', zona: 'Tejidos Tendinosos' },
    { id: 'tendon_flexores', nombre: 'Tendón Común Flexor (Codo de Golfista)', zona: 'Tejidos Tendinosos' },
    { id: 'tendon_biceps_codo', nombre: 'Tendón Distal del Bíceps & Aponeurosis', zona: 'Tejidos Tendinosos' },
    { id: 'tendon_triceps', nombre: 'Tendón del Tríceps (Inserción Olecraniana)', zona: 'Tejidos Tendinosos' },
    { id: 'lcm_codo', nombre: 'Ligamento Colateral Medial (LCM)', zona: 'Ligamentos' },
    { id: 'lcl_codo', nombre: 'Ligamento Colateral Lateral (LCL)', zona: 'Ligamentos' },
    { id: 'lig_anular', nombre: 'Ligamento Anular de la Cabeza del Radio', zona: 'Ligamentos' },
  ],
  nervios: [
    { id: 'nervio_cubital', nombre: 'Nervio Cubital (Surco Epitrocleolecraniano)', zona: 'Inervación' },
    { id: 'nervio_radial', nombre: 'Nervio Radial (Túnel Radial)', zona: 'Inervación' },
    { id: 'nervio_mediano', nombre: 'Nervio Mediano (Fosa Cubital)', zona: 'Inervación' },
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
        Codo & Fosa Cubital ({lado === 'izquierdo' || lado === 'izquierda' ? 'Izquierdo' : 'Derecho'}) —{' '}
        {cara === 'anterior'
          ? 'Vista Anterior (Bíceps Distal · Braquiorradial · N. Mediano)'
          : 'Vista Posterior (Tríceps · Epicondilitis · N. Cubital)'}
      </h4>

      {/* 
        Aquí está la magia: se estandarizó con scale-115 (o 110/125 según prefieras)
        y max-w-full object-contain para que quepa perfecto en el marco.
      */}
      <svg viewBox="0 0 320 450" width="100%" height="100%" className="h-full w-full max-w-full object-contain scale-105 touch-manipulation select-none drop-shadow-xl">
        <style>{`
          .hueso-base   { fill: #09131f; stroke: #334155; stroke-width: 1.2; stroke-linejoin: round; }
          .hueso-codo   { fill: #1e293b; stroke: #475569; stroke-width: 1.2; stroke-linejoin: round; transition: all 150ms ease; cursor: pointer; }
          .hueso-codo:hover { fill: #085a75; stroke: #38bdf8; stroke-width: 1.8; filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.5)); }
          .zona-interactiva:focus-visible .hueso-codo { stroke: #ffffff !important; stroke-width: 2.5 !important; }
          .linea-fibra { stroke: #334155; stroke-width: 0.8; opacity: 0.45; pointer-events: none; }
          .hilo-nervio     { stroke: #eab308; stroke-width: 1.6; stroke-linecap: round; fill: none; pointer-events: all; transition: all 150ms ease; filter: drop-shadow(0 0 2px rgba(234, 179, 8, 0.4)); }
          .hilo-nervio-sec { stroke: #facc15; stroke-width: 1; stroke-dasharray: 2 1.5; stroke-linecap: round; fill: none; opacity: 0.9; pointer-events: all; }
        `}</style>

        {cara === 'anterior' ? (
          <g transform={esDerecho ? 'translate(340 0) scale(-1 1)' : undefined}>
            <path
              className="hueso-base"
              d="M 115 15 C 145 10, 195 10, 225 15 C 248 60, 258 120, 248 185 C 242 215, 236 245, 245 295 C 255 345, 242 385, 225 410 L 115 410 C 98 385, 85 345, 95 295 C 104 245, 98 215, 92 185 C 82 120, 92 60, 115 15 Z"
            />

            <ZonaAnatomica id="humero_distal" afectacion={getAfect('humero_distal')} onRegionToggle={onRegionToggle} label="Húmero Distal">
              <path d="M 130 15 L 210 15 L 202 150 C 185 160, 155 160, 138 150 Z" />
            </ZonaAnatomica>

            <ZonaAnatomica id="braquial_anterior" afectacion={getAfect('braquial_anterior')} onRegionToggle={onRegionToggle} label="Músculo Braquial Anterior">
              <path d="M 136 100 C 132 145, 138 175, 148 190 L 192 190 C 202 175, 208 145, 204 100 C 185 115, 155 115, 136 100 Z" opacity="0.8" />
            </ZonaAnatomica>

            <ZonaAnatomica id="biceps_braquial" afectacion={getAfect('biceps_braquial')} onRegionToggle={onRegionToggle} label="Bíceps Braquial">
              <path d="M 142 15 C 138 55, 140 110, 154 165 C 168 175, 172 175, 186 165 C 200 110, 202 55, 198 15 Z" />
              <path d="M 158 30 C 150 75, 150 120, 160 155" className="linea-fibra" />
              <path d="M 182 30 C 190 75, 190 120, 180 155" className="linea-fibra" />
            </ZonaAnatomica>

            <ZonaAnatomica id="epicondilo_med" afectacion={getAfect('epicondilo_med')} onRegionToggle={onRegionToggle} label="Epicóndilo Medial (Epitróclea)">
              <path d="M 205 145 C 228 148, 238 165, 230 185 L 210 180 Z" />
            </ZonaAnatomica>
            <ZonaAnatomica id="epicondilo_lat" afectacion={getAfect('epicondilo_lat')} onRegionToggle={onRegionToggle} label="Epicóndilo Lateral">
              <path d="M 135 145 C 112 148, 102 165, 110 185 L 130 180 Z" />
            </ZonaAnatomica>

            <ZonaAnatomica id="braquiorradial" afectacion={getAfect('braquiorradial')} onRegionToggle={onRegionToggle} label="Músculo Braquiorradial">
              <path d="M 110 160 C 98 200, 102 270, 128 410 L 148 410 C 128 320, 122 250, 130 200 Z" />
              <path d="M 118 190 C 110 240, 115 310, 138 395" className="linea-fibra" />
            </ZonaAnatomica>

            <ZonaAnatomica id="pronador_redondo" afectacion={getAfect('pronador_redondo')} onRegionToggle={onRegionToggle} label="Músculo Pronador Redondo">
              <path d="M 224 175 C 210 195, 178 225, 155 240 L 145 228 C 170 210, 202 185, 212 168 Z" fill="#334155" opacity="0.85" />
            </ZonaAnatomica>

            <ZonaAnatomica id="tendon_flexores" afectacion={getAfect('tendon_flexores')} onRegionToggle={onRegionToggle} label="Tendón Común Flexor (Codo de Golfista)">
              <path d="M 222 178 C 214 200, 198 225, 190 260" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="4 2" fill="none" style={{ pointerEvents: 'all' }} />
            </ZonaAnatomica>

            <ZonaAnatomica id="tendon_biceps_codo" afectacion={getAfect('tendon_biceps_codo')} onRegionToggle={onRegionToggle} label="Tendón Distal Bíceps & Aponeurosis">
              <path d="M 166 170 L 174 170 L 168 222 L 158 222 Z" stroke="#fbbf24" strokeWidth="2.5" fill="#fef08a" style={{ pointerEvents: 'all' }} />
              <path d="M 172 175 L 198 205 L 190 210 L 168 180 Z" stroke="#fbbf24" strokeWidth="1.5" fill="#fbbf24" opacity="0.6" style={{ pointerEvents: 'all' }} />
            </ZonaAnatomica>

            <ZonaAnatomica id="radio_cabeza" afectacion={getAfect('radio_cabeza')} onRegionToggle={onRegionToggle} label="Cabeza del Radio">
              <ellipse cx="140" cy="200" rx="12" ry="7" />
              <path d="M 132 207 L 148 207 L 146 225 L 134 225 Z" opacity="0.6" />
            </ZonaAnatomica>

            <ZonaAnatomica id="cubito_olecranon" afectacion={getAfect('cubito_olecranon')} onRegionToggle={onRegionToggle} label="Cúbito Proximal">
              <path d="M 175 195 C 165 195, 160 210, 160 230 L 175 410 L 205 410 L 195 210 Z" />
            </ZonaAnatomica>

            <ZonaAnatomica id="lig_anular" afectacion={getAfect('lig_anular')} onRegionToggle={onRegionToggle} label="Ligamento Anular">
              <rect x="126" y="195" width="28" height="12" rx="4" style={{ fill: 'rgba(34, 211, 238, 0.25)', stroke: '#22d3ee', strokeWidth: 1.5, pointerEvents: 'all' }} />
            </ZonaAnatomica>

            <ZonaAnatomica id="lcm_codo" afectacion={getAfect('lcm_codo')} onRegionToggle={onRegionToggle} label="Ligamento Colateral Medial">
              <path d="M 215 175 L 200 210 L 188 205 L 208 170 Z" fill="#38bdf8" opacity="0.5" />
            </ZonaAnatomica>

            <ZonaAnatomica id="nervio_mediano" afectacion={getAfect('nervio_mediano')} onRegionToggle={onRegionToggle} label="Nervio Mediano (Fosa Cubital)">
              <path d="M 188 15 C 182 80, 180 150, 175 210 C 170 250, 172 320, 175 410" className="hilo-nervio" />
              <path d="M 178 140 C 188 170, 195 190, 198 230" className="hilo-nervio-sec" />
            </ZonaAnatomica>

            <ZonaAnatomica id="nervio_radial" afectacion={getAfect('nervio_radial')} onRegionToggle={onRegionToggle} label="Nervio Radial (Túnel Radial)">
              <path d="M 132 15 C 130 60, 126 120, 134 180 C 140 220, 130 280, 124 410" className="hilo-nervio" />
              <path d="M 134 180 C 142 205, 148 235, 150 270" className="hilo-nervio-sec" />
            </ZonaAnatomica>
          </g>
        ) : (
          <g transform={esDerecho ? 'translate(340 0) scale(-1 1)' : undefined}>
            <path
              className="hueso-base"
              d="M 115 15 C 145 10, 195 10, 225 15 C 248 60, 258 120, 248 185 C 242 215, 236 245, 245 295 C 255 345, 242 385, 225 410 L 115 410 C 98 385, 85 345, 95 295 C 104 245, 98 215, 92 185 C 82 120, 92 60, 115 15 Z"
            />

            <ZonaAnatomica id="humero_distal" afectacion={getAfect('humero_distal')} onRegionToggle={onRegionToggle} label="Húmero Posterior (Fosa Olecraniana)">
              <path d="M 130 15 L 210 15 L 202 140 L 138 140 Z" />
              <ellipse cx="170" cy="125" rx="14" ry="10" fill="#09131f" stroke="#334155" />
            </ZonaAnatomica>

            <ZonaAnatomica id="triceps_distal" afectacion={getAfect('triceps_distal')} onRegionToggle={onRegionToggle} label="Tríceps Braquial">
              <path d="M 138 15 L 202 15 L 195 115 C 180 125, 160 125, 145 115 Z" />
              <path d="M 155 25 L 158 100" className="linea-fibra" />
              <path d="M 185 25 L 182 100" className="linea-fibra" />
            </ZonaAnatomica>

            <ZonaAnatomica id="tendon_triceps" afectacion={getAfect('tendon_triceps')} onRegionToggle={onRegionToggle} label="Tendón del Tríceps">
              <path d="M 152 110 L 188 110 L 182 170 L 158 170 Z" fill="#334155" stroke="#94a3b8" strokeWidth="1.2" />
            </ZonaAnatomica>

            <ZonaAnatomica id="epicondilo_med" afectacion={getAfect('epicondilo_med')} onRegionToggle={onRegionToggle} label="Epicóndilo Medial (Surco Cubital)">
              <path d="M 205 145 C 228 148, 238 165, 230 185 L 210 180 Z" />
            </ZonaAnatomica>
            <ZonaAnatomica id="epicondilo_lat" afectacion={getAfect('epicondilo_lat')} onRegionToggle={onRegionToggle} label="Epicóndilo Lateral">
              <path d="M 135 145 C 112 148, 102 165, 110 185 L 130 180 Z" />
            </ZonaAnatomica>

            <ZonaAnatomica id="tendon_extensores" afectacion={getAfect('tendon_extensores')} onRegionToggle={onRegionToggle} label="Tendón Común Extensor (Epicondilitis Lateral)">
              <path d="M 118 175 C 124 200, 135 230, 140 270" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="4 2" fill="none" style={{ pointerEvents: 'all' }} />
            </ZonaAnatomica>

            <ZonaAnatomica id="anconeo" afectacion={getAfect('anconeo')} onRegionToggle={onRegionToggle} label="Músculo Ancóneo">
              <path d="M 125 182 L 158 182 L 142 235 L 118 205 Z" fill="#334155" />
              <path d="M 128 190 L 148 215" className="linea-fibra" />
            </ZonaAnatomica>

            <ZonaAnatomica id="cubito_olecranon" afectacion={getAfect('cubito_olecranon')} onRegionToggle={onRegionToggle} label="Olécranon del Cúbito">
              <path d="M 154 165 C 154 150, 186 150, 186 165 L 195 410 L 165 410 Z" />
            </ZonaAnatomica>

            <ZonaAnatomica id="lcl_codo" afectacion={getAfect('lcl_codo')} onRegionToggle={onRegionToggle} label="Ligamento Colateral Lateral">
              <path d="M 125 175 L 140 210 L 148 205 L 132 170 Z" fill="#38bdf8" opacity="0.5" />
            </ZonaAnatomica>

            <ZonaAnatomica id="nervio_cubital" afectacion={getAfect('nervio_cubital')} onRegionToggle={onRegionToggle} label="Nervio Cubital (Canal Cubital)">
              <path d="M 212 15 C 218 80, 222 150, 216 182 C 206 215, 198 280, 192 410" className="hilo-nervio" />
              <path d="M 216 182 C 210 215, 204 250, 200 300" className="hilo-nervio-sec" />
            </ZonaAnatomica>
          </g>
        )}
      </svg>
    </div>
  );
}