// src/components/clinica/BodyChart/vistas/VistaColumnaPro.jsx
import React from 'react';

// ==========================================
// PALETA BASE PARA MÚSCULOS
// ==========================================
const COLORES_MUSCULARES = {
  trapecio: '#2d4355',
  romboides: '#3b5064',
  dorsal_ancho: '#1e3a4d',
  redondo_mayor: '#465a6b',
  erector_espinal: '#2a475a',
  cuadrado_lumbar: '#354f63',
  gluteo_mayor: '#2d3f4e',
  gluteo_medio: '#41556a',
  ecom: '#384f63',
  pectoral: '#263f54',
  recto_abdominal: '#33495d',
};

const IDS_MUSCULARES = new Set(Object.keys(COLORES_MUSCULARES));
const IDS_NERVIOS = new Set(['nervio_ciatico']);

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
    { id: 'ecom', nombre: 'ECOM (Esternocleidomastoideo)', zona: 'Cuello' },
    { id: 'pectoral', nombre: 'Pectoral Mayor', zona: 'Tórax' },
    { id: 'recto_abdominal', nombre: 'Recto Abdominal', zona: 'Abdomen' },
  ],
  nervios: [
    { id: 'nervio_ciatico', nombre: 'Nervio Ciático', zona: 'Inervación' },
  ]
};

// ==========================================
// COMPONENTE WRAPPER INTERACTIVO
// ==========================================
const ZonaAnatomica = ({ id, afectacion, onRegionToggle, children, label }) => {
  const esMusculo = IDS_MUSCULARES.has(id);
  const esNervio = IDS_NERVIOS.has(id);
  const colorBase = COLORES_MUSCULARES[id];

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
      className={[
        'zona-interactiva cursor-pointer focus:outline-none',
        esMusculo ? 'zona-musculo' : '',
        esNervio ? 'zona-nervio' : '',
        afectacion ? 'is-selected' : '',
      ].filter(Boolean).join(' ')}
      style={colorBase ? { '--color-base': colorBase } : undefined}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;

        const classNameOriginal = child.props.className || '';
        const esHitArea = classNameOriginal.includes('trazo-hit');
        const esTrazoNervioso = classNameOriginal.includes('trazo-nervio');
        const esTrazo = esHitArea || esTrazoNervioso;
        const estiloOriginal = child.props.style || {};

        return React.cloneElement(child, {
          style: {
            ...estiloOriginal,
            ...(afectacion && !esHitArea
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
            !esTrazo ? 'hueso-columna' : '',
            classNameOriginal,
          ].filter(Boolean).join(' '),
        });
      })}
    </g>
  );
};

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
export default function VistaColumnaPro({
  cara = 'posterior',
  lado = 'derecho',
  afectaciones = {},
  onRegionToggle,
}) {
  const esDerecho = lado === 'derecho' || lado === 'derecha';
  const getAfect = (id) => afectaciones[id];

  const Vertebra = ({ cx, cy, ancho, alto }) => (
    <path d={`M ${cx - ancho/2} ${cy} L ${cx + ancho/2} ${cy} L ${cx + ancho/2 - 2} ${cy + alto} L ${cx - ancho/2 + 2} ${cy + alto} Z`} />
  );

  return (
    <div className="flex w-full flex-col items-center">
      <h4 className="mb-2 text-xs sm:text-sm font-black tracking-wider text-[#22d3ee] font-mono uppercase text-center">
        Columna Vertebral —{' '}
        {cara === 'posterior' ? 'Vista Posterior (Músculos de la Espalda)' : 'Vista Anterior (Tórax y Abdomen)'}
      </h4>

      <svg
        viewBox="0 0 340 480"
        width="100%"
        height="100%"
        className="h-full w-full max-w-full object-contain scale-110 touch-manipulation select-none drop-shadow-xl"
      >
        <style>{`
          .hueso-base   { fill: #09131f; stroke: #334155; stroke-width: 1.2; stroke-linejoin: round; }
          .hueso-columna { fill: #1e293b; stroke: #475569; stroke-width: 1.2; stroke-linejoin: round; transition: all 150ms ease; cursor: pointer; }
          
          .zona-musculo .hueso-columna { fill: var(--color-base, #334155); stroke: #52657c; }
          
          .zona-interactiva:hover .hueso-columna { fill: #0c4a6e; stroke: #38bdf8; stroke-width: 2; filter: drop-shadow(0 0 8px rgba(56, 189, 248, 0.6)); }
          .zona-interactiva:focus-visible .hueso-columna { stroke: #ffffff !important; stroke-width: 2.5 !important; }

          .trazo-nervio { stroke: #a855f7; stroke-width: 3; stroke-linecap: round; fill: none; pointer-events: stroke; transition: all 150ms ease; }
          .zona-nervio:hover .trazo-nervio { stroke: #d8b4fe; filter: drop-shadow(0 0 4px #a855f7); }
        `}</style>

        {cara === 'posterior' ? (
          <g transform={esDerecho ? undefined : 'translate(400 0) scale(-1 1)'}>
            <g transform="translate(-30, 0)">
              
              {/* SILUETA ANATÓMICA BASE (Misma que el tórax) */}
              <path
                className="hueso-base"
                d="M 160,30 C 160,55 135,62 105,72 C 60,86 42,125 58,168 C 72,192 92,208 105,250 C 118,290 128,340 135,380 C 145,395 170,405 200,405 C 230,405 255,395 265,380 C 272,340 282,290 295,250 C 308,208 328,192 342,168 C 358,125 340,86 295,72 C 265,62 240,55 240,30 Z"
              />

              {/* MÚSCULOS POSTERIORES */}
              <ZonaAnatomica id="trapecio" afectacion={getAfect('trapecio')} onRegionToggle={onRegionToggle} label="Trapecio">
                <path d="M 200,40 L 160,40 C 130,60 105,72 80,80 C 110,95 150,110 200,160 Z M 200,40 L 240,40 C 270,60 295,72 320,80 C 290,95 250,110 200,160 Z" />
              </ZonaAnatomica>

              <ZonaAnatomica id="romboides" afectacion={getAfect('romboides')} onRegionToggle={onRegionToggle} label="Romboides">
                <path d="M 180,140 L 195,130 L 195,180 L 180,170 Z M 220,140 L 205,130 L 205,180 L 220,170 Z" />
              </ZonaAnatomica>

              <ZonaAnatomica id="dorsal_ancho" afectacion={getAfect('dorsal_ancho')} onRegionToggle={onRegionToggle} label="Dorsal Ancho">
                <path d="M 110,180 C 120,220 130,280 135,340 L 195,340 L 195,180 C 160,200 140,200 110,180 Z M 290,180 C 280,220 270,280 265,340 L 205,340 L 205,180 C 240,200 260,200 290,180 Z" />
              </ZonaAnatomica>

              {/* REDONDO MAYOR (Área de clic ampliada) */}
              <ZonaAnatomica id="redondo_mayor" afectacion={getAfect('redondo_mayor')} onRegionToggle={onRegionToggle} label="Redondo Mayor">
                <path d="M 100,170 L 130,180 L 140,210 L 110,215 Z M 300,170 L 270,180 L 260,210 L 290,215 Z" />
              </ZonaAnatomica>

              {/* ERECTORES Y CUADRADO LUMBAR */}
              <ZonaAnatomica id="erector_espinal" afectacion={getAfect('erector_espinal')} onRegionToggle={onRegionToggle} label="Erectores Espinales">
                <path d="M 185,300 L 195,300 L 195,380 L 185,380 Z M 215,300 L 205,300 L 205,380 L 215,380 Z" />
              </ZonaAnatomica>

              <ZonaAnatomica id="cuadrado_lumbar" afectacion={getAfect('cuadrado_lumbar')} onRegionToggle={onRegionToggle} label="Cuadrado Lumbar">
                <path d="M 150,300 L 180,300 L 180,360 L 150,360 Z M 250,300 L 220,300 L 220,360 L 250,360 Z" />
              </ZonaAnatomica>

              {/* COLUMNA VERTEBRAL */}
              <ZonaAnatomica id="cervical" afectacion={getAfect('cervical')} onRegionToggle={onRegionToggle} label="Cervical">
                <g>{[0,1,2,3,4,5,6].map(i => <Vertebra key={`c-${i}`} cx={200} cy={50 + i * 12} ancho={20} alto={8} />)}</g>
              </ZonaAnatomica>

              <ZonaAnatomica id="dorsal" afectacion={getAfect('dorsal')} onRegionToggle={onRegionToggle} label="Dorsal">
                <g>{[0,1,2,3,4,5,6,7,8,9,10,11].map(i => <Vertebra key={`d-${i}`} cx={200} cy={145 + i * 14} ancho={26} alto={10} />)}</g>
              </ZonaAnatomica>

              <ZonaAnatomica id="lumbar" afectacion={getAfect('lumbar')} onRegionToggle={onRegionToggle} label="Lumbar (Vértebras)">
                <g>{[0,1,2,3,4].map(i => <Vertebra key={`l-${i}`} cx={200} cy={325 + i * 18} ancho={32} alto={12} />)}</g>
              </ZonaAnatomica>

              {/* SACRO Y GLÚTEOS (Dibujados DESPUÉS de la lumbar para que se vean bien) */}
              <ZonaAnatomica id="sacro" afectacion={getAfect('sacro')} onRegionToggle={onRegionToggle} label="Sacro">
                <path d="M 185,380 L 215,380 L 220,420 L 180,420 Z" />
              </ZonaAnatomica>

              <ZonaAnatomica id="gluteo_medio" afectacion={getAfect('gluteo_medio')} onRegionToggle={onRegionToggle} label="Glúteo Medio">
                <path d="M 150,360 C 170,360 180,370 180,390 L 150,390 Z M 250,360 C 230,360 220,370 220,390 L 250,390 Z" />
              </ZonaAnatomica>

              <ZonaAnatomica id="gluteo_mayor" afectacion={getAfect('gluteo_mayor')} onRegionToggle={onRegionToggle} label="Glúteo Mayor">
                <path d="M 150,390 C 130,420 150,460 195,460 L 195,390 Z M 250,390 C 270,420 250,460 205,460 L 205,390 Z" />
              </ZonaAnatomica>
              
              {/* NERVIO CIÁTICO */}
              <ZonaAnatomica id="nervio_ciatico" afectacion={getAfect('nervio_ciatico')} onRegionToggle={onRegionToggle} label="Nervio Ciático">
                <path d="M 200,420 C 190,440 170,460 170,480 M 200,420 C 210,440 230,460 230,480" className="trazo-nervio" />
              </ZonaAnatomica>
            </g>
          </g>
        ) : (
          <g transform={esDerecho ? 'translate(340 0) scale(-1 1)' : undefined}>
            <g transform="translate(-30, 0)">
              {/* SILUETA ANATÓMICA BASE */}
              <path
                className="hueso-base"
                d="M 160,30 C 160,55 135,62 105,72 C 60,86 42,125 58,168 C 72,192 92,208 105,250 C 118,290 128,340 135,380 C 145,395 170,405 200,405 C 230,405 255,395 265,380 C 272,340 282,290 295,250 C 308,208 328,192 342,168 C 358,125 340,86 295,72 C 265,62 240,55 240,30 Z"
              />

              {/* ECOM */}
              <ZonaAnatomica id="ecom" afectacion={getAfect('ecom')} onRegionToggle={onRegionToggle} label="ECOM">
                <path d="M 180,35 C 160,50 150,80 160,100 L 175,100 C 165,80 175,50 190,40 Z" />
                <path d="M 220,35 C 240,50 250,80 240,100 L 225,100 C 235,80 225,50 210,40 Z" />
              </ZonaAnatomica>

              {/* PECTORAL MAYOR */}
              <ZonaAnatomica id="pectoral" afectacion={getAfect('pectoral')} onRegionToggle={onRegionToggle} label="Pectoral Mayor">
                <path d="M 195,90 C 160,90 120,95 102,120 C 112,152 148,175 195,160 Z" />
                <path d="M 205,90 C 240,90 280,95 298,120 C 288,152 252,175 205,160 Z" />
              </ZonaAnatomica>

              {/* RECTO ABDOMINAL */}
              <ZonaAnatomica id="recto_abdominal" afectacion={getAfect('recto_abdominal')} onRegionToggle={onRegionToggle} label="Recto Abdominal">
                <path d="M 145,180 C 165,170 235,170 255,180 C 265,240 255,320 245,365 C 220,385 180,385 155,365 C 145,320 135,240 145,180 Z" />
                <path d="M 200,180 L 200,365" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="3 3" fill="none" pointerEvents="none" />
                <path d="M 145,230 Q 200,240 255,230" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="3 3" fill="none" pointerEvents="none" />
                <path d="M 140,290 Q 200,300 260,290" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="3 3" fill="none" pointerEvents="none" />
                <path d="M 148,340 Q 200,350 252,340" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="3 3" fill="none" pointerEvents="none" />
              </ZonaAnatomica>

              {/* COLUMNA ANTERIOR (Proyección) */}
              <ZonaAnatomica id="dorsal" afectacion={getAfect('dorsal')} onRegionToggle={onRegionToggle} label="Zona Dorsal">
                 <path d="M 195,160 L 205,160 L 205,375 L 195,375 Z" opacity="0.3" />
              </ZonaAnatomica>

            </g>
          </g>
        )}
      </svg>
    </div>
  );
}