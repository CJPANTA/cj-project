// src/components/clinica/BodyChart/vistas/VistaToraxPro.jsx
import React from 'react';

// ==========================================
// ESTRUCTURA ANATÓMICA DETALLADA TÓRAX Y ABDOMEN
// ==========================================
export const ESTRUCTURA_TORAX = {
  anterior: [
    { id: 'clavicula_izq', nombre: 'Clavícula Izquierda', zona: 'Cintura Escapular Anterior' },
    { id: 'clavicula_der', nombre: 'Clavícula Derecha', zona: 'Cintura Escapular Anterior' },
    { id: 'deltoides_izq', nombre: 'Deltoides Anterior/Lateral Izquierdo', zona: 'Hombro' },
    { id: 'deltoides_der', nombre: 'Deltoides Anterior/Lateral Derecho', zona: 'Hombro' },
    { id: 'esternon', nombre: 'Esternón (Manubrio / Cuerpo / Xifoides)', zona: 'Tórax Central' },
    { id: 'pectoral_izq', nombre: 'Pectoral Mayor Izquierdo', zona: 'Tórax Anterolateral' },
    { id: 'pectoral_der', nombre: 'Pectoral Mayor Derecho', zona: 'Tórax Anterolateral' },
    { id: 'serrato_izq', nombre: 'Serrato Anterior Izquierdo', zona: 'Tórax Lateral' },
    { id: 'serrato_der', nombre: 'Serrato Anterior Derecho', zona: 'Tórax Lateral' },
    { id: 'costillas_izq', nombre: 'Oblicuo Externo / Costillas Izq', zona: 'Tórax Lateral' },
    { id: 'costillas_der', nombre: 'Oblicuo Externo / Costillas Der', zona: 'Tórax Lateral' },
    { id: 'abdomen', nombre: 'Recto Abdominal & Línea Alba', zona: 'Abdomen' },
  ],
  posterior: [
    { id: 'trapecio_izq', nombre: 'Trapecio Superior Izquierdo', zona: 'Espalda Alta' },
    { id: 'trapecio_der', nombre: 'Trapecio Superior Derecho', zona: 'Espalda Alta' },
    { id: 'deltoides_post_izq', nombre: 'Deltoides Posterior Izquierdo', zona: 'Hombro Posterior' },
    { id: 'deltoides_post_der', nombre: 'Deltoides Posterior Derecho', zona: 'Hombro Posterior' },
    { id: 'escapula_izq', nombre: 'Escápula / Omóplato Izquierdo', zona: 'Espalda Alta' },
    { id: 'escapula_der', nombre: 'Escápula / Omóplato Derecho', zona: 'Espalda Alta' },
    { id: 'dorsal', nombre: 'Columna Torácica / Dorsal', zona: 'Eje Axial Posterior' },
    { id: 'dorsal_ancho_izq', nombre: 'Dorsal Ancho Izquierdo', zona: 'Espalda Media / Baja' },
    { id: 'dorsal_ancho_der', nombre: 'Dorsal Ancho Derecho', zona: 'Espalda Media / Baja' },
    { id: 'torax_post_base', nombre: 'Región Torácica Posterior General', zona: 'Tórax Posterior' }
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
            'hueso-torax',
            afectacion ? 'selected' : '',
            child.props.className || '',
          ].filter(Boolean).join(' '),
        });
      })}
    </g>
  );
};

export default function VistaToraxPro({
  cara = 'anterior',
  lado = 'derecho',
  afectaciones = {},
  onRegionToggle,
}) {
  const esDerecho = lado === 'derecho' || lado === 'derecha';
  const getAfect = (id) => afectaciones[id];

  const HotspotIndicator = ({ x, y, regionId, label }) => {
    const afectacion = getAfect(regionId);
    return (
      <g onClick={() => onRegionToggle(regionId)} className="cursor-pointer group">
        <circle cx={x} cy={y} r="16" fill="transparent" />
        <circle
          cx={x}
          cy={y}
          r="6"
          fill="transparent"
          stroke={afectacion ? afectacion.color : '#475569'}
          strokeWidth="1.5"
          className="group-hover:stroke-[#38bdf8] transition-colors"
        />
        <circle
          cx={x}
          cy={y}
          r="3"
          fill={afectacion ? afectacion.color : '#94a3b8'}
          className="group-hover:fill-[#38bdf8] transition-colors"
        />
        <text
          x={x}
          y={y + (afectacion ? 16 : 14)}
          textAnchor="middle"
          fontSize="7"
          fill={afectacion ? afectacion.color : '#cbd5e1'}
          className="font-bold font-mono tracking-wider transition-colors group-hover:fill-white"
        >
          {label}
        </text>
      </g>
    );
  };

  return (
    <div className="flex w-full flex-col items-center">
      <h4 className="mb-2 text-xs sm:text-sm font-black tracking-wider text-[#22d3ee] font-mono uppercase text-center">
        Tórax & Abdomen ({lado === 'izquierdo' || lado === 'izquierda' ? 'Vista Izquierda' : 'Vista Derecha'}) —{' '}
        {cara === 'anterior'
          ? 'Vista Anterior (Clavículas · Deltoides · Pectorales · Esternón · Serratos · Abdomen)'
          : 'Vista Posterior (Trapecios · Escápulas · Columna Dorsal · Dorsal Ancho)'}
      </h4>

      <svg viewBox="15 0 400 500" width="110%" height="110%" className="h-full w-full max-w-full object-contain scale-115 touch-manipulation select-none drop-shadow-xl">
        <style>{`
          .hueso-base   { fill: #09131f; stroke: #334155; stroke-width: 1.2; stroke-linejoin: round; }
          .hueso-torax  { fill: #1e293b; stroke: #475569; stroke-width: 1.2; stroke-linejoin: round; transition: all 150ms ease; cursor: pointer; }
          .hueso-torax:hover { fill: #085a75; stroke: #38bdf8; stroke-width: 1.8; filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.5)); }
          .zona-interactiva:focus-visible .hueso-torax { stroke: #ffffff !important; stroke-width: 2.5 !important; }
          .linea-anat { stroke: #334155; stroke-width: 1.2; fill: none; pointer-events: none; }
        `}</style>

        {cara === 'anterior' ? (
          <g transform={esDerecho ? undefined : 'translate(400 0) scale(-1 1)'}>
            <ZonaAnatomica id="torax" afectacion={getAfect('torax')} onRegionToggle={onRegionToggle} label="Base Torácica General">
              <path
                className="hueso-base"
                d="M 160,30 C 160,55 135,62 105,72 C 60,86 42,125 58,168 C 72,192 92,208 105,250 C 118,290 128,340 135,380 C 145,395 170,405 200,405 C 230,405 255,395 265,380 C 272,340 282,290 295,250 C 308,208 328,192 342,168 C 358,125 340,86 295,72 C 265,62 240,55 240,30 Z"
              />
            </ZonaAnatomica>

            <ZonaAnatomica id="deltoides_izq" afectacion={getAfect('deltoides_izq')} onRegionToggle={onRegionToggle} label="Deltoides Izquierdo">
              <path d="M 105,72 C 85,75 58,95 50,132 C 45,155 52,175 66,178 C 78,165 92,145 102,120 C 108,102 110,84 105,72 Z" />
            </ZonaAnatomica>
            <ZonaAnatomica id="deltoides_der" afectacion={getAfect('deltoides_der')} onRegionToggle={onRegionToggle} label="Deltoides Derecho">
              <path d="M 295,72 C 315,75 342,95 350,132 C 355,155 348,175 334,178 C 322,165 308,145 298,120 C 292,102 290,84 295,72 Z" />
            </ZonaAnatomica>

            <ZonaAnatomica id="clavicula_izq" afectacion={getAfect('clavicula_izq')} onRegionToggle={onRegionToggle} label="Clavícula Izquierda">
              <path d="M 190,75 C 160,70 115,70 95,80 C 115,75 160,75 190,82 Z" />
            </ZonaAnatomica>
            <ZonaAnatomica id="clavicula_der" afectacion={getAfect('clavicula_der')} onRegionToggle={onRegionToggle} label="Clavícula Derecha">
              <path d="M 210,75 C 240,70 285,70 305,80 C 285,75 240,75 210,82 Z" />
            </ZonaAnatomica>

            <ZonaAnatomica id="pectoral_izq" afectacion={getAfect('pectoral_izq')} onRegionToggle={onRegionToggle} label="Pectoral Izquierdo">
              <path d="M 195,90 C 160,90 120,95 102,120 C 112,152 148,175 195,160 Z" />
            </ZonaAnatomica>
            <ZonaAnatomica id="pectoral_der" afectacion={getAfect('pectoral_der')} onRegionToggle={onRegionToggle} label="Pectoral Derecho">
              <path d="M 205,90 C 240,90 280,95 298,120 C 288,152 252,175 205,160 Z" />
            </ZonaAnatomica>

            <ZonaAnatomica id="esternon" afectacion={getAfect('esternon')} onRegionToggle={onRegionToggle} label="Esternón">
              <path d="M 195,90 L 205,90 L 203,185 L 197,185 Z" />
            </ZonaAnatomica>

            <ZonaAnatomica id="serrato_izq" afectacion={getAfect('serrato_izq')} onRegionToggle={onRegionToggle} label="Serrato Anterior Izquierdo">
              <path d="M 98,170 C 110,185 125,198 135,225 C 122,220 105,200 95,182 Z M 104,228 C 116,238 128,248 138,270 C 125,262 110,248 102,238 Z" opacity="0.85" />
            </ZonaAnatomica>
            <ZonaAnatomica id="serrato_der" afectacion={getAfect('serrato_der')} onRegionToggle={onRegionToggle} label="Serrato Anterior Derecho">
              <path d="M 302,170 C 290,185 275,198 265,225 C 278,220 295,200 305,182 Z M 296,228 C 284,238 272,248 262,270 C 275,262 290,248 298,238 Z" opacity="0.85" />
            </ZonaAnatomica>

            <ZonaAnatomica id="costillas_izq" afectacion={getAfect('costillas_izq')} onRegionToggle={onRegionToggle} label="Oblicuo Externo / Costillas Izq">
              <path d="M 90,180 C 108,198 132,240 142,310 C 130,270 102,230 90,180 Z" />
            </ZonaAnatomica>
            <ZonaAnatomica id="costillas_der" afectacion={getAfect('costillas_der')} onRegionToggle={onRegionToggle} label="Oblicuo Externo / Costillas Der">
              <path d="M 310,180 C 292,198 268,240 258,310 C 270,270 298,230 310,180 Z" />
            </ZonaAnatomica>

            <ZonaAnatomica id="abdomen" afectacion={getAfect('abdomen')} onRegionToggle={onRegionToggle} label="Recto Abdominal">
              <path d="M 145,180 C 165,170 235,170 255,180 C 265,240 255,320 245,365 C 220,385 180,385 155,365 C 145,320 135,240 145,180 Z" />
            </ZonaAnatomica>

            <path className="linea-anat" d="M 200,180 L 200,365" />
            <path className="linea-anat" d="M 145,230 Q 200,240 255,230" />
            <path className="linea-anat" d="M 140,290 Q 200,300 260,290" />
            <path className="linea-anat" d="M 148,340 Q 200,350 252,340" />

            <HotspotIndicator x={68} y={125} regionId="deltoides_izq" label="Deltoides I" />
            <HotspotIndicator x={332} y={125} regionId="deltoides_der" label="Deltoides D" />
            <HotspotIndicator x={140} y={72} regionId="clavicula_izq" label="Clavícula I" />
            <HotspotIndicator x={260} y={72} regionId="clavicula_der" label="Clavícula D" />
            <HotspotIndicator x={145} y={130} regionId="pectoral_izq" label="Pectoral I" />
            <HotspotIndicator x={255} y={130} regionId="pectoral_der" label="Pectoral D" />
            <HotspotIndicator x={200} y={130} regionId="esternon" label="Esternón" />
            <HotspotIndicator x={110} y={202} regionId="serrato_izq" label="Serrato I" />
            <HotspotIndicator x={290} y={202} regionId="serrato_der" label="Serrato D" />
            <HotspotIndicator x={115} y={250} regionId="costillas_izq" label="Costillas I" />
            <HotspotIndicator x={285} y={250} regionId="costillas_der" label="Costillas D" />
            <HotspotIndicator x={200} y={260} regionId="abdomen" label="Abdomen" />
          </g>
        ) : (
          <g transform={esDerecho ? undefined : 'translate(400 0) scale(-1 1)'}>
            <ZonaAnatomica id="torax_post_base" afectacion={getAfect('torax_post_base')} onRegionToggle={onRegionToggle} label="Base Torácica Posterior">
              <path
                className="hueso-base"
                d="M 160,30 C 160,55 135,62 105,72 C 60,86 42,125 58,168 C 72,192 92,208 105,250 C 118,290 128,340 135,380 C 145,395 170,405 200,405 C 230,405 255,395 265,380 C 272,340 282,290 295,250 C 308,208 328,192 342,168 C 358,125 340,86 295,72 C 265,62 240,55 240,30 Z"
              />
            </ZonaAnatomica>

            <ZonaAnatomica id="deltoides_post_izq" afectacion={getAfect('deltoides_post_izq')} onRegionToggle={onRegionToggle} label="Deltoides Posterior Izquierdo">
              <path d="M 105,72 C 85,75 58,95 50,132 C 45,155 52,175 66,178 C 82,160 92,140 95,110 Z" />
            </ZonaAnatomica>
            <ZonaAnatomica id="deltoides_post_der" afectacion={getAfect('deltoides_post_der')} onRegionToggle={onRegionToggle} label="Deltoides Posterior Derecho">
              <path d="M 295,72 C 315,75 342,95 350,132 C 355,155 348,175 334,178 C 318,160 308,140 305,110 Z" />
            </ZonaAnatomica>

            <ZonaAnatomica id="trapecio_izq" afectacion={getAfect('trapecio_izq')} onRegionToggle={onRegionToggle} label="Trapecio Izquierdo">
              <path d="M 200,40 L 160,40 C 130,60 105,72 80,80 C 110,95 150,110 200,160 Z" />
            </ZonaAnatomica>
            <ZonaAnatomica id="trapecio_der" afectacion={getAfect('trapecio_der')} onRegionToggle={onRegionToggle} label="Trapecio Derecho">
              <path d="M 200,40 L 240,40 C 270,60 295,72 320,80 C 290,95 250,110 200,160 Z" />
            </ZonaAnatomica>

            <ZonaAnatomica id="escapula_izq" afectacion={getAfect('escapula_izq')} onRegionToggle={onRegionToggle} label="Escápula Izquierda">
              <path d="M 95,110 C 120,105 160,115 170,125 C 160,160 145,185 130,200 C 110,160 95,130 95,110 Z" />
            </ZonaAnatomica>
            <ZonaAnatomica id="escapula_der" afectacion={getAfect('escapula_der')} onRegionToggle={onRegionToggle} label="Escápula Derecha">
              <path d="M 305,110 C 280,105 240,115 230,125 C 240,160 255,185 270,200 C 290,160 305,130 305,110 Z" />
            </ZonaAnatomica>

            <ZonaAnatomica id="dorsal" afectacion={getAfect('dorsal')} onRegionToggle={onRegionToggle} label="Columna Dorsal">
              <path d="M 195,160 L 205,160 L 205,375 L 195,375 Z" />
            </ZonaAnatomica>

            <ZonaAnatomica id="dorsal_ancho_izq" afectacion={getAfect('dorsal_ancho_izq')} onRegionToggle={onRegionToggle} label="Dorsal Ancho Izquierdo">
              <path d="M 125,200 C 110,240 120,290 135,340 C 150,355 175,365 195,370 L 195,200 Z" />
            </ZonaAnatomica>
            <ZonaAnatomica id="dorsal_ancho_der" afectacion={getAfect('dorsal_ancho_der')} onRegionToggle={onRegionToggle} label="Dorsal Ancho Derecho">
              <path d="M 275,200 C 290,240 280,290 265,340 C 250,355 225,365 205,370 L 205,200 Z" />
            </ZonaAnatomica>

            <HotspotIndicator x={68} y={125} regionId="deltoides_post_izq" label="Deltoides P. I" />
            <HotspotIndicator x={332} y={125} regionId="deltoides_post_der" label="Deltoides P. D" />
            <HotspotIndicator x={140} y={90} regionId="trapecio_izq" label="Trapecio I" />
            <HotspotIndicator x={260} y={90} regionId="trapecio_der" label="Trapecio D" />
            <HotspotIndicator x={135} y={150} regionId="escapula_izq" label="Escápula I" />
            <HotspotIndicator x={265} y={150} regionId="escapula_der" label="Escápula D" />
            <HotspotIndicator x={200} y={260} regionId="dorsal" label="Columna Dorsal" />
            <HotspotIndicator x={160} y={280} regionId="dorsal_ancho_izq" label="Dorsal I" />
            <HotspotIndicator x={240} y={280} regionId="dorsal_ancho_der" label="Dorsal D" />
          </g>
        )}
      </svg>
    </div>
  );
}