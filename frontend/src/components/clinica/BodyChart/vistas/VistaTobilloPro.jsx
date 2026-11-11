// src/components/clinica/BodyChart/vistas/VistaTobilloPro.jsx
import React from 'react';

export const ESTRUCTURA_TOBILLO = {
  huesos: [
    { id: 'tibia_distal', nombre: 'Tibia (Pilón y Maléolo Medial)', zona: 'Pierna Distal' },
    { id: 'perone_distal', nombre: 'Peroné / Fíbula (Maléolo Lateral)', zona: 'Pierna Distal' },
    { id: 'astragalo', nombre: 'Astrágalo (Talus / Cúpula Astragalina)', zona: 'Tarso' },
    { id: 'calcaneo', nombre: 'Calcáneo (Hueso del Talón)', zona: 'Tarso' },
    { id: 'navicular', nombre: 'Navicular / Escafoides', zona: 'Tarso Medial' },
    { id: 'cuboides', nombre: 'Cuboides', zona: 'Tarso Lateral' },
    { id: 'base_5to_metatarsiano', nombre: 'Base del 5º Metatarsiano (Estiloides)', zona: 'Antepié Lateral' }
  ],
  ligamentos: [
    { id: 'lpaa', nombre: 'Ligamento Peroneoastragalino Anterior (LPAA / ATFL)', zona: 'Estabilidad Lateral' },
    { id: 'lcp', nombre: 'Ligamento Calcaneoperoneo (LCP / CFL)', zona: 'Estabilidad Lateral' },
    { id: 'lpap', nombre: 'Ligamento Peroneoastragalino Posterior (LPAP / PTFL)', zona: 'Estabilidad Lateral' },
    { id: 'ligamento_deltoideo', nombre: 'Ligamento Deltoideo (Complejo Medial)', zona: 'Estabilidad Medial' },
    { id: 'sindesmosis', nombre: 'Sindesmosis Tibioperonea Distal', zona: 'Articulación' },
    { id: 'retinaculo_inferior', nombre: 'Retináculo Extensor Inferior', zona: 'Contención Tendinosa' }
  ],
  tendones: [
    { id: 'tendon_aquiles', nombre: 'Tendón de Aquiles (Insertivo / Miotendinoso)', zona: 'Tejido Posterior' },
    { id: 'tendones_peroneos', nombre: 'Tendones Peroneos (Corto y Largo)', zona: 'Retromaleolar Lateral' },
    { id: 'tendon_tibial_anterior', nombre: 'Tendón Tibial Anterior', zona: 'Compartimento Anterior' },
    { id: 'extensor_largo_dedos', nombre: 'Tendones Extensores (EDL / EHL)', zona: 'Dorso del Pie' },
    { id: 'tendon_tibial_posterior', nombre: 'Tendón Tibial Posterior', zona: 'Retromaleolar Medial' },
    { id: 'seno_tarso', nombre: 'Seno del Tarso (Canal Tarsiano)', zona: 'Fosa Lateral' }
  ],
  musculos_y_nervios: [
    { id: 'vientre_gastrocnemio_soleo', nombre: 'Sóleo y Gemelos (Miotendinoso)', zona: 'Pierna Posterior' },
    { id: 'nervio_peroneo_superficial', nombre: 'Nervio Peroneo Superficial (Rama Dorsal)', zona: 'Inervación Lateral' },
    { id: 'nervio_sural', nombre: 'Nervio Sural', zona: 'Inervación Retromaleolar' },
    { id: 'nervio_tibial_medial', nombre: 'Nervio Tibial y Ramas Plantares', zona: 'Inervación Medial' }
  ]
};

// Tu ZonaAnatomica adaptada para evitar que los tendones pinten el fondo
const ZonaAnatomica = ({ id, afectacion, onRegionToggle, children, label }) => {
  const activarConTeclado = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onRegionToggle?.(id);
    }
  };

  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={label || id}
      aria-pressed={Boolean(afectacion)}
      onClick={() => onRegionToggle?.(id)}
      onKeyDown={activarConTeclado}
      className={`zona-interactiva focus:outline-none cursor-pointer ${afectacion ? 'is-selected' : ''}`}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;

        const esAreaDeClic = child.props.className?.includes('trazo-hit');
        const estiloOriginal = child.props.style || {};

        return React.cloneElement(child, {
          style: {
            ...estiloOriginal,
            ...(afectacion && !esAreaDeClic
              ? {
                  stroke: afectacion.border || '#22d3ee',
                  fill: estiloOriginal.fill === 'none'
                    ? 'none'
                    : (afectacion.color || '#22d3ee'),
                  filter: `drop-shadow(0 0 6px ${afectacion.color || '#22d3ee'})`,
                }
              : {}),
          },
          className: [
            esAreaDeClic ? '' : 'hueso-tobillo',
            afectacion ? 'selected' : '',
            child.props.className || '',
          ].filter(Boolean).join(' '),
        });
      })}
    </g>
  );
};

export default function VistaTobilloPro({
  cara = 'lateral',
  lado = 'derecho',
  afectaciones = {},
  onRegionToggle,
}) {
  const esDerecho = lado === 'derecho' || lado === 'derecha';
  const getAfect = (id) => afectaciones[id];

  return (
    <div className="flex w-full flex-col items-center">
      <h4 className="mb-2 text-xs sm:text-sm font-black tracking-wider text-[#22d3ee] font-mono uppercase text-center">
        Tobillo y Retropié —{' '}
        {cara === 'lateral'
          ? 'Vista Lateral (Tendones Finos · LPAA/LCP · Nervio Sural)'
          : 'Vista Medial (Lig. Deltoideo · Tendón Tibial · Nervio Tibial)'}
      </h4>

      <svg viewBox="10 0 320 350" width="100%" height="100%" className="h-full w-full max-w-full object-contain scale-115 touch-manipulation select-none drop-shadow-xl">
        <style>{`
          .hueso-base   { fill: #09131f; stroke: #334155; stroke-width: 1.2; stroke-linejoin: round; }
          .hueso-tobillo { fill: #1e293b; stroke: #475569; stroke-width: 1.2; stroke-linejoin: round; transition: all 150ms ease; cursor: pointer; }
          .hueso-tobillo:hover { fill: #085a75; stroke: #38bdf8; stroke-width: 1.8; filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.5)); }
          .zona-interactiva:focus-visible .hueso-tobillo { stroke: #ffffff !important; stroke-width: 2.5 !important; }
        `}</style>

        {cara === 'lateral' ? (
          <g transform={esDerecho ? 'translate(340 0) scale(-1 1)' : undefined}>
            {/* Silueta Corporal Externa Realista */}
            <path
              className="hueso-base"
              d="M 95 15 L 180 15 C 178 75 186 135 198 180 C 218 208 252 242 308 268 C 318 274 312 296 295 298 C 240 305 170 308 110 308 C 62 308 32 290 30 245 C 28 190 62 155 82 135 Z"
            />

            {/* VIENTRE MUSCULAR DEL SÓLEO / GASTROCNEMIO */}
            <ZonaAnatomica id="vientre_gastrocnemio_soleo" afectacion={getAfect('vientre_gastrocnemio_soleo')} onRegionToggle={onRegionToggle} label="Músculo Sóleo / Gemelos">
              <path d="M 98 18 L 125 18 C 118 70 102 120 78 150 L 68 120 Z" fill="#2d3748" opacity="0.6" />
            </ZonaAnatomica>

            {/* TIBIA DISTAL (PILÓN TIBIAL) */}
            <ZonaAnatomica id="tibia_distal" afectacion={getAfect('tibia_distal')} onRegionToggle={onRegionToggle} label="Tibia (Pilón Distal)">
              <path d="M 105 20 L 148 20 L 145 145 L 115 150 L 102 115 Z" />
            </ZonaAnatomica>

            {/* PERONÉ / FÍBULA (MALÉOLO LATERAL) */}
            <ZonaAnatomica id="perone_distal" afectacion={getAfect('perone_distal')} onRegionToggle={onRegionToggle} label="Peroné (Maléolo Lateral)">
              <path d="M 152 20 L 172 20 L 168 135 L 175 178 C 172 192, 156 192, 150 176 L 148 135 Z" />
            </ZonaAnatomica>

            {/* SINDESMOSIS TIBIOPERONEA DISTAL */}
            <ZonaAnatomica id="sindesmosis" afectacion={getAfect('sindesmosis')} onRegionToggle={onRegionToggle} label="Sindesmosis Tibioperonea">
              <rect x="142" y="120" width="14" height="25" rx="3" style={{ fill: 'rgba(56, 189, 248, 0.15)', stroke: '#38bdf8', strokeWidth: 1 }} />
            </ZonaAnatomica>

            {/* ASTRÁGALO (TALUS) */}
            <ZonaAnatomica id="astragalo" afectacion={getAfect('astragalo')} onRegionToggle={onRegionToggle} label="Astrágalo (Talus)">
              <path d="M 112 155 C 112 140, 148 135, 168 153 C 175 163, 178 178, 162 188 C 145 194, 118 186, 112 170 Z" />
            </ZonaAnatomica>

            {/* CALCÁNEO (HUESO DEL TALÓN) */}
            <ZonaAnatomica id="calcaneo" afectacion={getAfect('calcaneo')} onRegionToggle={onRegionToggle} label="Calcáneo">
              <path d="M 45 215 C 35 230, 42 270, 75 280 C 115 285, 155 278, 175 254 C 182 240, 168 225, 150 225 C 125 225, 115 195, 85 195 C 60 195, 48 203, 45 215 Z" />
            </ZonaAnatomica>

            {/* SENO DEL TARSO */}
            <ZonaAnatomica id="seno_tarso" afectacion={getAfect('seno_tarso')} onRegionToggle={onRegionToggle} label="Seno del Tarso">
              <circle cx="152" cy="193" r="6" style={{ fill: 'rgba(34, 211, 238, 0.2)', stroke: '#22d3ee', strokeWidth: 1 }} />
            </ZonaAnatomica>

            {/* CUBOIDES */}
            <ZonaAnatomica id="cuboides" afectacion={getAfect('cuboides')} onRegionToggle={onRegionToggle} label="Cuboides">
              <path d="M 178 220 L 215 223 L 222 253 L 178 250 Z" />
            </ZonaAnatomica>

            {/* NAVICULAR */}
            <ZonaAnatomica id="navicular" afectacion={getAfect('navicular')} onRegionToggle={onRegionToggle} label="Navicular">
              <path d="M 170 185 L 198 187 L 202 215 L 175 213 Z" />
            </ZonaAnatomica>

            {/* BASE DEL 5º METATARSIANO */}
            <ZonaAnatomica id="base_5to_metatarsiano" afectacion={getAfect('base_5to_metatarsiano')} onRegionToggle={onRegionToggle} label="Base 5º Metatarsiano">
              <path d="M 224 245 L 275 250 C 285 253, 285 268, 270 270 L 220 268 Z" />
            </ZonaAnatomica>

            {/* LIGAMENTOS DE ESGUINCE LATERAL (Adelgazados) */}
            <ZonaAnatomica id="lpaa" afectacion={getAfect('lpaa')} onRegionToggle={onRegionToggle} label="Ligamento Peroneoastragalino Anterior (LPAA)">
              <path d="M 160 173 L 180 187" className="trazo-hit" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8" style={{ pointerEvents: 'stroke' }} />
            </ZonaAnatomica>

            <ZonaAnatomica id="lcp" afectacion={getAfect('lcp')} onRegionToggle={onRegionToggle} label="Ligamento Calcaneoperoneo (LCP)">
              <path d="M 158 180 L 140 223" className="trazo-hit" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8" style={{ pointerEvents: 'stroke' }} />
            </ZonaAnatomica>

            <ZonaAnatomica id="lpap" afectacion={getAfect('lpap')} onRegionToggle={onRegionToggle} label="Ligamento Peroneoastragalino Posterior (LPAP)">
              <path d="M 152 173 L 132 177" className="trazo-hit" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8" style={{ pointerEvents: 'stroke' }} />
            </ZonaAnatomica>

            {/* RETINÁCULO EXTENSOR INFERIOR */}
            <ZonaAnatomica id="retinaculo_inferior" afectacion={getAfect('retinaculo_inferior')} onRegionToggle={onRegionToggle} label="Retináculo Extensor Inferior">
              <path d="M 165 190 L 195 215 L 205 205 L 175 180 Z" fill="rgba(34, 211, 238, 0.15)" stroke="#22d3ee" strokeWidth="1" />
            </ZonaAnatomica>

            {/* TENDÓN DE AQUILES (Grisáceo y sutil) */}
            <ZonaAnatomica id="tendon_aquiles" afectacion={getAfect('tendon_aquiles')} onRegionToggle={onRegionToggle} label="Tendón de Aquiles">
              <path d="M 68 20 L 85 20 L 65 195 L 52 220 L 42 205 L 58 135 Z" fill="#334155" stroke="#94a3b8" strokeWidth="1" opacity="0.8" />
            </ZonaAnatomica>

            {/* TENDONES PERONEOS (Adelgazados) */}
            <ZonaAnatomica id="tendones_peroneos" afectacion={getAfect('tendones_peroneos')} onRegionToggle={onRegionToggle} label="Tendones Peroneos">
              <path d="M 160 20 L 164 170 C 166 190, 175 205, 222 245" className="trazo-hit" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 2" strokeLinecap="round" fill="none" opacity="0.9" style={{ pointerEvents: 'stroke' }} />
            </ZonaAnatomica>

            {/* TENDÓN TIBIAL ANTERIOR (Adelgazado) */}
            <ZonaAnatomica id="tendon_tibial_anterior" afectacion={getAfect('tendon_tibial_anterior')} onRegionToggle={onRegionToggle} label="Tendón Tibial Anterior">
              <path d="M 125 20 L 135 140 C 145 170, 170 200, 235 240" className="trazo-hit" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.9" style={{ pointerEvents: 'stroke' }} />
            </ZonaAnatomica>

            {/* TENDÓN EXTENSOR LARGO DE LOS DEDOS (Adelgazado) */}
            <ZonaAnatomica id="extensor_largo_dedos" afectacion={getAfect('extensor_largo_dedos')} onRegionToggle={onRegionToggle} label="Tendón Extensor Largo de los Dedos">
              <path d="M 140 20 L 148 135 C 160 175, 190 215, 265 255" className="trazo-hit" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="3 2" strokeLinecap="round" fill="none" opacity="0.9" style={{ pointerEvents: 'stroke' }} />
            </ZonaAnatomica>

            {/* NERVIOS PERONEO SUPERFICIAL Y SURAL (Adelgazados) */}
            <ZonaAnatomica id="nervio_peroneo_superficial" afectacion={getAfect('nervio_peroneo_superficial')} onRegionToggle={onRegionToggle} label="Nervio Peroneo Superficial">
              <path d="M 145 20 C 150 90, 175 160, 245 235" className="trazo-hit" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.9" style={{ pointerEvents: 'stroke' }} />
            </ZonaAnatomica>

            <ZonaAnatomica id="nervio_sural" afectacion={getAfect('nervio_sural')} onRegionToggle={onRegionToggle} label="Nervio Sural">
              <path d="M 80 20 C 85 110, 145 180, 240 260" className="trazo-hit" stroke="#c084fc" strokeWidth="1.2" strokeDasharray="2 2" strokeLinecap="round" fill="none" opacity="0.9" style={{ pointerEvents: 'stroke' }} />
            </ZonaAnatomica>
          </g>
        ) : (
          <g transform={esDerecho ? 'translate(340 0) scale(-1 1)' : undefined}>
            <path
              className="hueso-base"
              d="M 95 15 L 180 15 C 178 75 186 135 198 180 C 218 208 252 242 308 268 C 318 274 312 296 295 298 C 240 305 170 308 110 308 C 62 308 32 290 30 245 C 28 190 62 155 82 135 Z"
            />

            {/* TIBIA MEDIAL & MALÉOLO TIBIAL */}
            <ZonaAnatomica id="tibia_distal" afectacion={getAfect('tibia_distal')} onRegionToggle={onRegionToggle} label="Tibia Medial (Maléolo Tibial)">
              <path d="M 105 20 L 165 20 L 160 135 L 140 175 C 125 180, 118 170, 115 145 Z" />
            </ZonaAnatomica>

            {/* ASTRÁGALO MEDIAL */}
            <ZonaAnatomica id="astragalo" afectacion={getAfect('astragalo')} onRegionToggle={onRegionToggle} label="Astrágalo">
              <path d="M 135 155 C 145 145, 175 150, 182 170 C 175 190, 145 193, 132 177 Z" />
            </ZonaAnatomica>

            {/* CALCÁNEO MEDIAL */}
            <ZonaAnatomica id="calcaneo" afectacion={getAfect('calcaneo')} onRegionToggle={onRegionToggle} label="Calcáneo Medial">
              <path d="M 45 215 C 35 230, 42 270, 75 280 C 115 285, 155 278, 175 254 L 145 215 L 85 195 Z" />
            </ZonaAnatomica>

            {/* NAVICULAR MEDIAL */}
            <ZonaAnatomica id="navicular" afectacion={getAfect('navicular')} onRegionToggle={onRegionToggle} label="Tuberosidad Navicular">
              <path d="M 185 173 L 220 175 L 225 210 L 188 205 Z" />
            </ZonaAnatomica>

            {/* LIGAMENTO DELTOIDEO (Sutil) */}
            <ZonaAnatomica id="ligamento_deltoideo" afectacion={getAfect('ligamento_deltoideo')} onRegionToggle={onRegionToggle} label="Ligamento Deltoideo">
              <path d="M 132 163 L 115 210 L 155 220 L 185 180 Z" fill="rgba(239, 68, 68, 0.25)" stroke="#ef4444" strokeWidth="1.5" style={{ pointerEvents: 'all' }} />
            </ZonaAnatomica>

            {/* TENDÓN TIBIAL POSTERIOR (Adelgazado) */}
            <ZonaAnatomica id="tendon_tibial_posterior" afectacion={getAfect('tendon_tibial_posterior')} onRegionToggle={onRegionToggle} label="Tendón Tibial Posterior">
              <path d="M 120 20 L 122 145 C 122 170, 135 195, 218 203" className="trazo-hit" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.9" style={{ pointerEvents: 'stroke' }} />
            </ZonaAnatomica>

            {/* NERVIO TIBIAL Y CANAL TARSICO MEDIAL (Adelgazado) */}
            <ZonaAnatomica id="nervio_tibial_medial" afectacion={getAfect('nervio_tibial_medial')} onRegionToggle={onRegionToggle} label="Nervio Tibial / Canal Tarsiano">
              <path d="M 108 20 L 110 140 C 112 175, 130 210, 195 240" className="trazo-hit" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.9" style={{ pointerEvents: 'stroke' }} />
            </ZonaAnatomica>

            {/* TENDÓN DE AQUILES */}
            <ZonaAnatomica id="tendon_aquiles" afectacion={getAfect('tendon_aquiles')} onRegionToggle={onRegionToggle} label="Tendón de Aquiles">
              <path d="M 68 20 L 85 20 L 65 195 L 52 220 L 42 205 L 58 135 Z" fill="#334155" stroke="#94a3b8" strokeWidth="1" opacity="0.8" />
            </ZonaAnatomica>
          </g>
        )}
      </svg>
    </div>
  );
}