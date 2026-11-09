// src/components/clinica/BodyChart/vistas/VistaColumnaPro.jsx
import React from 'react';

export const ESTRUCTURA_COLUMNA = {
  regiones_oseas: [
    { id: 'cervical', nombre: 'Región Cervical (C1-C7)', zona: 'Columna' },
    { id: 'dorsal', nombre: 'Región Dorsal/Torácica (D1-D12)', zona: 'Columna' },
    { id: 'lumbar', nombre: 'Región Lumbar (L1-L5)', zona: 'Columna' },
    { id: 'sacro', nombre: 'Sacro y Cóccix', zona: 'Columna' },
  ],
  musculos_posteriores: [
    { id: 'trapecio', nombre: 'Trapecio', zona: 'Espalda Alta' },
    { id: 'romboides', nombre: 'Romboides', zona: 'Espalda Alta' },
    { id: 'dorsal_ancho', nombre: 'Dorsal Ancho', zona: 'Espalda Media' },
    { id: 'redondo_mayor', nombre: 'Redondo Mayor', zona: 'Espalda Media' },
    { id: 'erector_espinal', nombre: 'Erectores Espinales', zona: 'Espalda Baja' },
    { id: 'cuadrado_lumbar', nombre: 'Cuadrado Lumbar', zona: 'Espalda Baja' },
    { id: 'gluteo_mayor', nombre: 'Glúteo Mayor', zona: 'Pelvis' },
    { id: 'gluteo_medio', nombre: 'Glúteo Medio', zona: 'Pelvis' },
  ],
  musculos_anteriores: [
    { id: 'escm', nombre: 'Esternocleidomastoideo (ECM)', zona: 'Cuello' },
    { id: 'pectoral', nombre: 'Pectoral Mayor', zona: 'Tórax' },
    { id: 'recto_abdominal', nombre: 'Recto Abdominal', zona: 'Abdomen' },
  ],
  nervios: [
    { id: 'nervio_ciatico', nombre: 'Nervio Ciático', zona: 'Inervación' },
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
            'hueso-columna',
            afectacion ? 'selected' : '',
            child.props.className || '',
          ].filter(Boolean).join(' '),
        });
      })}
    </g>
  );
};

export default function VistaColumnaPro({
  cara = 'posterior',
  lado = 'derecho',
  afectaciones = {},
  onRegionToggle,
}) {
  const esDerecho = lado === 'derecho' || lado === 'derecha';
  const getAfect = (id) => afectaciones[id];

  const Vértebra = ({ cx, cy, ancho, alto }) => (
    <path d={`M ${cx - ancho/2} ${cy} L ${cx + ancho/2} ${cy} L ${cx + ancho/2 - 2} ${cy + alto} L ${cx - ancho/2 + 2} ${cy + alto} Z`} />
  );

  return (
    <div className="flex w-full flex-col items-center">
      <h4 className="mb-2 text-xs sm:text-sm font-black tracking-wider text-[#22d3ee] font-mono uppercase text-center">
        Columna Vertebral —{' '}
        {cara === 'posterior' ? 'Vista Posterior (Músculos de la Espalda)' : 'Vista Anterior (Tórax y Abdomen)'}
      </h4>

      <svg viewBox="0 0 340 480" width="100%" height="100%" className="h-full w-full max-w-xl touch-manipulation select-none">
        <style>{`
          .hueso-base   { fill: #09131f; stroke: #334155; stroke-width: 1.2; stroke-linejoin: round; }
          .hueso-columna { fill: #1e293b; stroke: #475569; stroke-width: 1.2; stroke-linejoin: round; transition: all 150ms ease; cursor: pointer; }
          .hueso-columna:hover { fill: #085a75; stroke: #38bdf8; stroke-width: 1.8; filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.5)); }
          .zona-interactiva:focus-visible .hueso-columna { stroke: #ffffff !important; stroke-width: 2.5 !important; }
        `}</style>

        {cara === 'posterior' ? (
          <g transform={esDerecho ? 'translate(340 0) scale(-1 1)' : undefined}>
            {/* Silueta base de la espalda */}
            <path className="hueso-base" d="M 170 20 C 190 20, 210 40, 240 80 C 270 120, 280 200, 260 280 C 250 320, 230 400, 210 460 L 130 460 C 110 400, 90 320, 80 280 C 60 200, 70 120, 100 80 C 130 40, 150 20, 170 20 Z" />

            {/* --- CAPA MUSCULAR POSTERIOR --- */}

            {/* MÚSCULO TRAPECIO */}
            <ZonaAnatomica id="trapecio" afectacion={getAfect('trapecio')} onRegionToggle={onRegionToggle} label="Trapecio">
              <path d="M 170 40 L 100 80 L 140 160 L 170 200 L 200 160 L 240 80 Z" />
            </ZonaAnatomica>

            {/* ROMBOIDES */}
            <ZonaAnatomica id="romboides" afectacion={getAfect('romboides')} onRegionToggle={onRegionToggle} label="Romboides">
              <path d="M 140 160 L 155 150 L 155 210 L 140 220 Z" />
              <path d="M 200 160 L 185 150 L 185 210 L 200 220 Z" />
            </ZonaAnatomica>

            {/* DORSAL ANCHO */}
            <ZonaAnatomica id="dorsal_ancho" afectacion={getAfect('dorsal_ancho')} onRegionToggle={onRegionToggle} label="Dorsal Ancho">
              <path d="M 100 160 C 120 180, 130 250, 130 320 L 170 200 L 210 320 C 210 250, 220 180, 240 160 C 200 200, 140 200, 100 160 Z" />
            </ZonaAnatomica>

            {/* REDONDO MAYOR */}
            <ZonaAnatomica id="redondo_mayor" afectacion={getAfect('redondo_mayor')} onRegionToggle={onRegionToggle} label="Redondo Mayor">
              <path d="M 110 180 L 135 190 L 140 230 L 115 230 Z" />
              <path d="M 230 180 L 205 190 L 200 230 L 225 230 Z" />
            </ZonaAnatomica>

            {/* COLUMNA VERTEBRAL (Regiones) */}
            <ZonaAnatomica id="cervical" afectacion={getAfect('cervical')} onRegionToggle={onRegionToggle} label="Cervical">
              <g>
                {[0,1,2,3,4,5,6].map(i => <Vértebra key={`c-${i}`} cx={170} cy={50 + i * 12} ancho={20} alto={8} />)}
              </g>
            </ZonaAnatomica>

            <ZonaAnatomica id="dorsal" afectacion={getAfect('dorsal')} onRegionToggle={onRegionToggle} label="Dorsal">
              <g>
                {[0,1,2,3,4,5,6,7,8,9,10,11].map(i => <Vértebra key={`d-${i}`} cx={170} cy={145 + i * 14} ancho={26} alto={10} />)}
              </g>
            </ZonaAnatomica>

            {/* ERECTORES ESPINALES Y CUADRADO LUMBAR */}
            <ZonaAnatomica id="erector_espinal" afectacion={getAfect('erector_espinal')} onRegionToggle={onRegionToggle} label="Erectores Espinales">
              <path d="M 145 320 L 160 320 L 160 410 L 145 410 Z" />
              <path d="M 195 320 L 180 320 L 180 410 L 195 410 Z" />
            </ZonaAnatomica>

            <ZonaAnatomica id="cuadrado_lumbar" afectacion={getAfect('cuadrado_lumbar')} onRegionToggle={onRegionToggle} label="Cuadrado Lumbar">
              <path d="M 125 320 L 140 320 L 145 400 L 125 400 Z" />
              <path d="M 215 320 L 200 320 L 195 400 L 215 400 Z" />
            </ZonaAnatomica>

            <ZonaAnatomica id="lumbar" afectacion={getAfect('lumbar')} onRegionToggle={onRegionToggle} label="Lumbar (Vértebras)">
              <g>
                {[0,1,2,3,4].map(i => <Vértebra key={`l-${i}`} cx={170} cy={325 + i * 18} ancho={32} alto={12} />)}
              </g>
            </ZonaAnatomica>

            {/* SACRO Y GLÚTEOS */}
            <ZonaAnatomica id="sacro" afectacion={getAfect('sacro')} onRegionToggle={onRegionToggle} label="Sacro">
              <path d="M 150 415 L 190 415 L 180 455 L 160 455 Z" />
            </ZonaAnatomica>

            <ZonaAnatomica id="gluteo_medio" afectacion={getAfect('gluteo_medio')} onRegionToggle={onRegionToggle} label="Glúteo Medio">
              <path d="M 140 410 C 120 420, 115 440, 130 450 L 150 440 Z" />
              <path d="M 200 410 C 220 420, 225 440, 210 450 L 190 440 Z" />
            </ZonaAnatomica>

            <ZonaAnatomica id="gluteo_mayor" afectacion={getAfect('gluteo_mayor')} onRegionToggle={onRegionToggle} label="Glúteo Mayor">
              <path d="M 130 445 C 110 445, 100 470, 130 480 L 165 480 Z" />
              <path d="M 210 445 C 230 445, 240 470, 210 480 L 175 480 Z" />
            </ZonaAnatomica>
            
            {/* NERVIO CIÁTICO */}
            <ZonaAnatomica id="nervio_ciatico" afectacion={getAfect('nervio_ciatico')} onRegionToggle={onRegionToggle} label="Nervio Ciático">
              <path d="M 170 420 C 160 450, 140 460, 140 480" stroke="#eab308" strokeWidth="3" strokeLinecap="round" fill="none" style={{ pointerEvents: 'all' }} />
              <path d="M 170 420 C 180 450, 200 460, 200 480" stroke="#eab308" strokeWidth="3" strokeLinecap="round" fill="none" style={{ pointerEvents: 'all' }} />
            </ZonaAnatomica>
          </g>
        ) : (
          <g transform={esDerecho ? 'translate(340 0) scale(-1 1)' : undefined}>
            {/* Silueta base Frontal */}
            <path className="hueso-base" d="M 170 20 C 190 20, 210 40, 240 80 C 270 120, 280 200, 260 280 C 250 320, 230 400, 210 460 L 130 460 C 110 400, 90 320, 80 280 C 60 200, 70 120, 100 80 C 130 40, 150 20, 170 20 Z" />

            {/* ESTERNOCLEIDOMASTOIDEO (Cuello) */}
            <ZonaAnatomica id="escm" afectacion={getAfect('escm')} onRegionToggle={onRegionToggle} label="Esternocleidomastoideo">
              <path d="M 150 40 L 135 80 L 160 120 L 170 80 Z" />
              <path d="M 190 40 L 205 80 L 180 120 L 170 80 Z" />
            </ZonaAnatomica>

            {/* PECTORAL MAYOR (Tórax) */}
            <ZonaAnatomica id="pectoral" afectacion={getAfect('pectoral')} onRegionToggle={onRegionToggle} label="Pectoral Mayor">
              <path d="M 170 130 C 140 130, 110 150, 110 190 L 165 190 Z" />
              <path d="M 170 130 C 200 130, 230 150, 230 190 L 175 190 Z" />
            </ZonaAnatomica>

            {/* RECTO ABDOMINAL (Abdomen) */}
            <ZonaAnatomica id="recto_abdominal" afectacion={getAfect('recto_abdominal')} onRegionToggle={onRegionToggle} label="Recto Abdominal">
              <path d="M 140 200 C 155 195, 185 195, 200 200 L 195 350 C 180 360, 160 360, 145 350 Z" />
              {/* Líneas de los "cuadritos" del abdomen */}
              <path d="M 170 195 L 170 355" stroke="#334155" strokeWidth="1.5" strokeDasharray="3 3" fill="none" pointerEvents="none" />
              <path d="M 140 230 L 200 230" stroke="#334155" strokeWidth="1.5" strokeDasharray="3 3" fill="none" pointerEvents="none" />
              <path d="M 142 270 L 198 270" stroke="#334155" strokeWidth="1.5" strokeDasharray="3 3" fill="none" pointerEvents="none" />
              <path d="M 144 310 L 196 310" stroke="#334155" strokeWidth="1.5" strokeDasharray="3 3" fill="none" pointerEvents="none" />
            </ZonaAnatomica>

            {/* Columna anterior (Proyección ósea) */}
            <ZonaAnatomica id="dorsal" afectacion={getAfect('dorsal')} onRegionToggle={onRegionToggle} label="Zona Dorsal (Proyección)">
               <path d="M 160 150 L 180 150 L 180 195 L 160 195 Z" opacity="0.3" />
               <path d="M 160 200 L 180 200 L 180 350 L 160 350 Z" opacity="0.15" />
            </ZonaAnatomica>

          </g>
        )}
      </svg>
    </div>
  );
}