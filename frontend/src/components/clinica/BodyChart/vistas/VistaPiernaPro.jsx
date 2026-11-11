// src/components/clinica/BodyChart/vistas/VistaPiernaPro.jsx
import React from 'react';

export const ESTRUCTURA_PIERNA = {
  huesos: [
    { id: 'femur', nombre: 'Fémur (Diáfisis y Cóndilos)', zona: 'Muslo Óseo' },
    { id: 'patela', nombre: 'Patela / Rótula', zona: 'Rodilla Ósea' },
    { id: 'tibia', nombre: 'Tibia (Pilón y Cresta Anterior)', zona: 'Pierna Ósea' },
    { id: 'perone', nombre: 'Peroné / Fíbula (Cabeza y Maléolo)', zona: 'Pierna Ósea' },
  ],
  musculos_anterior: [
    { id: 'recto_femoral', nombre: 'Recto Femoral (Cuádriceps Central)', zona: 'Muslo Anterior' },
    { id: 'vasto_lateral', nombre: 'Vasto Lateral (Cuádriceps Externo)', zona: 'Muslo Anterior' },
    { id: 'vasto_medial', nombre: 'Vasto Medial / Gota de Agua', zona: 'Muslo Anterior' },
    { id: 'sartorio', nombre: 'Músculo Sartorio', zona: 'Anterior Medial' },
    { id: 'tensor_fascia_lata', nombre: 'Tensor de la Fascia Lata & Cinta IT', zona: 'Lateral Muslo' },
    { id: 'tibial_anterior', nombre: 'Tibial Anterior', zona: 'Pierna Anterior' },
    { id: 'extensor_largo_dedos', nombre: 'Extensor Largo de los Dedos', zona: 'Pierna Anterior' },
  ],
  musculos_posterior: [
    { id: 'biceps_femoral', nombre: 'Bíceps Femoral (Isquiotibial Lateral)', zona: 'Muslo Posterior' },
    { id: 'semitendinoso_membranoso', nombre: 'Semitendinoso & Semimembranoso', zona: 'Muslo Posterior' },
    { id: 'gastrocnemio_lateral', nombre: 'Gemelo Lateral', zona: 'Pierna Posterior' },
    { id: 'gastrocnemio_medial', nombre: 'Gemelo Medial', zona: 'Pierna Posterior' },
    { id: 'soleo', nombre: 'Sóleo (Tríceps Sural)', zona: 'Pierna Posterior' },
    { id: 'tendon_aquiles', nombre: 'Tendón de Aquiles', zona: 'Posterior Distal' },
  ],
  nervios: [
    { id: 'nervio_ciatico', nombre: 'Nervio Ciático', zona: 'Inervación Posterior' },
    { id: 'nervio_tibial', nombre: 'Nervio Tibial', zona: 'Inervación Posterior' },
    { id: 'nervio_peroneo_comun', nombre: 'Nervio Peroneo Común', zona: 'Inervación Lateral' },
    { id: 'nervio_femoral', nombre: 'Nervio Femoral', zona: 'Inervación Anterior' },
  ]
};

const ZonaAnatomica = ({ id, afectacion, onRegionToggle, children, label }) => {
  const activarConTeclado = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onRegionToggle(id);
    }
  };

  const colorFill = afectacion ? afectacion.color : undefined;
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
            fill: colorFill || child.props.style?.fill,
            stroke: colorStroke || child.props.style?.stroke,
            filter: afectacion ? `drop-shadow(0 0 6px ${afectacion.color})` : undefined,
          },
          className: [
            'hueso-pierna',
            afectacion ? 'selected' : '',
            child.props.className || '',
          ].filter(Boolean).join(' '),
        });
      })}
    </g>
  );
};

export default function VistaPiernaPro({
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
        Miembro Inferior ({lado === 'izquierdo' || lado === 'izquierda' ? 'Izquierdo' : 'Derecho'}) —{' '}
        {cara === 'anterior'
          ? 'Vista Anterior (Cuádriceps · Tibial · Patela · N. Peroneo)'
          : 'Vista Posterior (Isquios · Gemelos · Sóleo · N. Ciático)'}
      </h4>

      <svg
        viewBox="0 0 340 440"
        width="100%"
        height="100%"
        className="h-full w-full max-w-xl touch-manipulation select-none"
      >
        <style>{`
          .hueso-base   { fill: #09131f; stroke: #334155; stroke-width: 1.2; stroke-linejoin: round; }
          .hueso-pierna { fill: #1e293b; stroke: #475569; stroke-width: 1.2; stroke-linejoin: round; transition: all 150ms ease; cursor: pointer; }
          .hueso-pierna:hover { fill: #085a75; stroke: #38bdf8; stroke-width: 1.8; filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.5)); }
          .zona-interactiva:focus-visible .hueso-pierna { stroke: #ffffff !important; stroke-width: 2.5 !important; }
        `}</style>

        {cara === 'anterior' ? (
          <g transform={esDerecho ? 'translate(340 0) scale(-1 1)' : undefined}>
            {/* SILUETA EXTERNA */}
            <path
              className="hueso-base"
              d="M 105 10 C 135 15, 205 15, 235 10 C 248 70, 258 130, 246 195 C 236 220, 230 235, 238 275 C 248 315, 242 360, 222 410 L 118 410 C 98 360, 92 315, 102 275 C 110 235, 104 220, 94 195 C 82 130, 92 70, 105 10 Z"
            />

            {/* FÉMUR ANTERIOR */}
            <ZonaAnatomica id="femur" afectacion={getAfect('femur')} onRegionToggle={onRegionToggle} label="Fémur">
              <path d="M 156 15 L 184 15 L 180 170 C 188 180, 196 190, 192 205 L 148 205 C 144 190, 152 180, 160 170 Z" opacity="0.4" />
            </ZonaAnatomica>

            {/* TENSOR DE LA FASCIA LATA */}
            <ZonaAnatomica id="tensor_fascia_lata" afectacion={getAfect('tensor_fascia_lata')} onRegionToggle={onRegionToggle} label="Tensor de la Fascia Lata">
              <path d="M 107 15 C 100 60, 92 120, 100 190 C 102 210, 108 230, 114 245 L 126 240 C 118 220, 110 190, 105 130 C 106 70, 115 35, 120 15 Z" fill="#2d3748" opacity="0.8" />
            </ZonaAnatomica>

            {/* SARTORIO */}
            <ZonaAnatomica id="sartorio" afectacion={getAfect('sartorio')} onRegionToggle={onRegionToggle} label="Músculo Sartorio">
              <path d="M 122 15 C 140 70, 175 130, 225 210 L 215 220 C 165 140, 130 80, 112 15 Z" fill="#334155" opacity="0.75" />
            </ZonaAnatomica>

            {/* VASTO LATERAL */}
            <ZonaAnatomica id="vasto_lateral" afectacion={getAfect('vasto_lateral')} onRegionToggle={onRegionToggle} label="Vasto Lateral">
              <path d="M 122 18 C 112 70, 108 130, 120 185 C 132 205, 152 208, 162 195 C 145 130, 138 70, 136 18 Z" />
            </ZonaAnatomica>

            {/* RECTO FEMORAL */}
            <ZonaAnatomica id="recto_femoral" afectacion={getAfect('recto_femoral')} onRegionToggle={onRegionToggle} label="Recto Femoral">
              <path d="M 140 18 C 144 70, 150 120, 162 185 C 172 185, 178 175, 182 165 C 170 120, 164 70, 160 18 Z" />
            </ZonaAnatomica>

            {/* VASTO MEDIAL (GOTA DE AGUA) */}
            <ZonaAnatomica id="vasto_medial" afectacion={getAfect('vasto_medial')} onRegionToggle={onRegionToggle} label="Vasto Medial">
              <path d="M 185 110 C 195 135, 236 160, 232 205 C 208 220, 184 210, 178 190 C 175 160, 180 130, 185 110 Z" />
            </ZonaAnatomica>

            {/* RÓTULA */}
            <ZonaAnatomica id="patela" afectacion={getAfect('patela')} onRegionToggle={onRegionToggle} label="Rótula">
              <ellipse cx="170" cy="222" rx="14" ry="16" style={{ fill: '#334155', stroke: '#38bdf8', strokeWidth: 1.5 }} />
            </ZonaAnatomica>

            {/* TIBIA */}
            <ZonaAnatomica id="tibia" afectacion={getAfect('tibia')} onRegionToggle={onRegionToggle} label="Tibia (Cresta Anterior)">
              <path d="M 148 245 L 182 245 L 174 410 L 142 410 C 148 350, 154 300, 148 245 Z" opacity="0.6" />
            </ZonaAnatomica>

            {/* PERONÉ */}
            <ZonaAnatomica id="perone" afectacion={getAfect('perone')} onRegionToggle={onRegionToggle} label="Peroné">
              <path d="M 125 250 L 140 250 L 132 410 L 120 410 Z" opacity="0.5" />
            </ZonaAnatomica>

            {/* TIBIAL ANTERIOR */}
            <ZonaAnatomica id="tibial_anterior" afectacion={getAfect('tibial_anterior')} onRegionToggle={onRegionToggle} label="Tibial Anterior">
              <path d="M 152 250 C 168 250, 195 270, 198 330 C 190 370, 172 400, 162 410 L 150 410 C 158 350, 156 290, 152 250 Z" />
            </ZonaAnatomica>

            {/* EXTENSOR LARGO DE LOS DEDOS */}
            <ZonaAnatomica id="extensor_largo_dedos" afectacion={getAfect('extensor_largo_dedos')} onRegionToggle={onRegionToggle} label="Extensor Largo de los Dedos">
              <path d="M 140 255 C 146 290, 145 350, 138 410 L 128 410 C 132 350, 134 290, 130 255 Z" fill="#2d3748" opacity="0.85" />
            </ZonaAnatomica>

            {/* NERVIO FEMORAL */}
            <ZonaAnatomica id="nervio_femoral" afectacion={getAfect('nervio_femoral')} onRegionToggle={onRegionToggle} label="Nervio Femoral">
              <path d="M 190 15 C 185 60, 175 120, 170 215" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" fill="none" style={{ pointerEvents: 'all' }} />
            </ZonaAnatomica>

            {/* NERVIO PERONEO COMÚN */}
            <ZonaAnatomica id="nervio_peroneo_comun" afectacion={getAfect('nervio_peroneo_comun')} onRegionToggle={onRegionToggle} label="Nervio Peroneo Común">
              <path d="M 132 230 C 122 250, 118 290, 124 410" stroke="#eab308" strokeWidth="1.5" strokeDasharray="3 2" strokeLinecap="round" fill="none" style={{ pointerEvents: 'all' }} />
            </ZonaAnatomica>
          </g>
        ) : (
          <g transform={esDerecho ? 'translate(340 0) scale(-1 1)' : undefined}>
            {/* SILUETA POSTERIOR */}
            <path
              className="hueso-base"
              d="M 105 10 C 135 15, 205 15, 235 10 C 248 70, 258 130, 246 195 C 236 220, 230 235, 238 275 C 248 315, 242 360, 222 410 L 118 410 C 98 360, 92 315, 102 275 C 110 235, 104 220, 94 195 C 82 130, 92 70, 105 10 Z"
            />

            {/* BÍCEPS FEMORAL */}
            <ZonaAnatomica id="biceps_femoral" afectacion={getAfect('biceps_femoral')} onRegionToggle={onRegionToggle} label="Bíceps Femoral">
              <path d="M 115 15 C 110 60, 105 120, 122 195 C 135 210, 150 205, 155 190 C 145 120, 140 60, 142 15 Z" />
            </ZonaAnatomica>

            {/* SEMITENDINOSO Y SEMIMEMBRANOSO */}
            <ZonaAnatomica id="semitendinoso_membranoso" afectacion={getAfect('semitendinoso_membranoso')} onRegionToggle={onRegionToggle} label="Semitendinoso y Semimembranoso">
              <path d="M 198 15 C 200 60, 195 120, 185 190 C 180 205, 165 210, 155 190 C 160 120, 165 60, 172 15 Z" />
            </ZonaAnatomica>

            {/* FÉMUR POSTERIOR / FOSA POPLÍTEA */}
            <ZonaAnatomica id="femur" afectacion={getAfect('femur')} onRegionToggle={onRegionToggle} label="Fémur Posterior">
              <path d="M 156 15 L 184 15 L 178 190 L 162 190 Z" opacity="0.3" />
            </ZonaAnatomica>

            {/* GASTROCNEMIO MEDIAL */}
            <ZonaAnatomica id="gastrocnemio_medial" afectacion={getAfect('gastrocnemio_medial')} onRegionToggle={onRegionToggle} label="Gastrocnemio Medial">
              <path d="M 172 215 C 185 210, 235 240, 232 315 C 215 345, 178 340, 170 310 C 165 270, 168 230, 172 215 Z" />
            </ZonaAnatomica>

            {/* GASTROCNEMIO LATERAL */}
            <ZonaAnatomica id="gastrocnemio_lateral" afectacion={getAfect('gastrocnemio_lateral')} onRegionToggle={onRegionToggle} label="Gastrocnemio Lateral">
              <path d="M 168 215 C 155 210, 105 240, 108 315 C 125 345, 162 340, 170 310 C 175 270, 172 230, 168 215 Z" />
            </ZonaAnatomica>

            {/* SÓLEO */}
            <ZonaAnatomica id="soleo" afectacion={getAfect('soleo')} onRegionToggle={onRegionToggle} label="Sóleo">
              <path d="M 108 300 C 98 330, 108 365, 125 380 L 215 380 C 232 365, 242 330, 232 300 C 215 330, 125 330, 108 300 Z" opacity="0.85" />
            </ZonaAnatomica>

            {/* TENDÓN DE AQUILES */}
            <ZonaAnatomica id="tendon_aquiles" afectacion={getAfect('tendon_aquiles')} onRegionToggle={onRegionToggle} label="Tendón de Aquiles">
              <path d="M 154 330 L 186 330 L 178 410 L 162 410 Z" fill="#334155" stroke="#94a3b8" strokeWidth="1" opacity="0.8" />
            </ZonaAnatomica>

            {/* TIBIA Y PERONÉ POSTERIOR */}
            <ZonaAnatomica id="tibia" afectacion={getAfect('tibia')} onRegionToggle={onRegionToggle} label="Tibia Distal">
              <path d="M 182 340 L 215 340 L 212 410 L 180 410 Z" opacity="0.4" />
            </ZonaAnatomica>
            <ZonaAnatomica id="perone" afectacion={getAfect('perone')} onRegionToggle={onRegionToggle} label="Peroné Distal">
              <path d="M 125 340 L 158 340 L 160 410 L 128 410 Z" opacity="0.4" />
            </ZonaAnatomica>

            {/* NERVIO CIÁTICO Y TIBIAL */}
            <ZonaAnatomica id="nervio_ciatico" afectacion={getAfect('nervio_ciatico')} onRegionToggle={onRegionToggle} label="Nervio Ciático">
              <path d="M 160 15 C 165 80, 172 150, 170 210" stroke="#eab308" strokeWidth="2" strokeLinecap="round" fill="none" style={{ pointerEvents: 'all' }} />
            </ZonaAnatomica>

            <ZonaAnatomica id="nervio_tibial" afectacion={getAfect('nervio_tibial')} onRegionToggle={onRegionToggle} label="Nervio Tibial">
              <path d="M 170 210 C 168 260, 172 330, 170 410" stroke="#eab308" strokeWidth="1.5" strokeLinecap="round" fill="none" style={{ pointerEvents: 'all' }} />
            </ZonaAnatomica>
          </g>
        )}
      </svg>
    </div>
  );
}