// src/components/clinica/BodyChart/vistas/VistaCabezaPro.jsx
import React from 'react';

// ==========================================
// ESTRUCTURA ANATÓMICA DE LA CABEZA Y CUELLO
// ==========================================
export const ESTRUCTURA_CABEZA = {
  craneo_cara: [
    { id: 'frontal', nombre: 'Hueso Frontal', zona: 'Cráneo' },
    { id: 'parietal', nombre: 'Huesos Parietales', zona: 'Cráneo' },
    { id: 'temporal', nombre: 'Hueso Temporal / Mastoidea', zona: 'Cráneo' },
    { id: 'occipital', nombre: 'Hueso Occipital', zona: 'Cráneo' },
    { id: 'zigomatico', nombre: 'Pómulos (Cigomático)', zona: 'Cara' },
    { id: 'maxilar', nombre: 'Maxilar Superior y Hueso Nasal', zona: 'Cara' },
    { id: 'mandibula', nombre: 'Mandíbula', zona: 'Cara' },
    { id: 'atm', nombre: 'ATM', zona: 'Articulación' },
    { id: 'clavicula', nombre: 'Clavículas', zona: 'Cintura Escapular' },
  ],
  musculos: [
    { id: 'masetero', nombre: 'Músculo Masetero (Bruxismo)', zona: 'Cara' },
    { id: 'temporal_musc', nombre: 'Músculo Temporal (Cefalea)', zona: 'Cara' },
    { id: 'ecom', nombre: 'ECOM (Esternocleidomastoideo)', zona: 'Cuello' },
    { id: 'escalenos', nombre: 'Músculos Escalenos (Desfiladero)', zona: 'Cuello Lateral' },
    { id: 'elevador_escapula', nombre: 'Elevador de la Escápula', zona: 'Cuello Posterior' },
    { id: 'suboccipitales', nombre: 'Músculos Suboccipitales', zona: 'Nuca' },
    { id: 'trapecio_sup', nombre: 'Trapecio Superior', zona: 'Cuello/Hombro' },
  ],
  nervios: [
    { id: 'trigemino', nombre: 'Nervio Trigémino (V Par)', zona: 'Inervación' },
    { id: 'occipital_mayor', nombre: 'Nervio Occipital Mayor (Arnold)', zona: 'Inervación' },
    { id: 'plexo_braquial', nombre: 'Plexo Braquial (C5-T1)', zona: 'Inervación' },
  ]
};

// ==========================================
// COMPONENTE WRAPPER INTERACTIVO
// ==========================================
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
            'hueso-cabeza',
            afectacion ? 'selected' : '',
            child.props.className || '',
          ].filter(Boolean).join(' '),
        });
      })}
    </g>
  );
};

// ==========================================
// VISTA CABEZA PRO ANATÓMICA
// ==========================================
export default function VistaCabezaPro({
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
        Cabeza y Cuello —{' '}
        {cara === 'anterior'
          ? 'Vista Anterior (Cráneo · Cara · ECOM · Escalenos · Plexo)'
          : 'Vista Posterior (Occipital · Nuca · Trapecio · Elevador)'}
      </h4>

      <svg viewBox="0 0 340 460" width="100%" height="100%" className="h-full w-full max-w-xl touch-manipulation select-none">
        <style>{`
          .hueso-base   { fill: #070d18; stroke: #1e293b; stroke-width: 1.2; stroke-linejoin: round; }
          .hueso-cabeza { fill: #1e293b; stroke: #475569; stroke-width: 1.2; stroke-linejoin: round; transition: all 150ms ease; cursor: pointer; }
          .hueso-cabeza:hover { fill: #085a75; stroke: #38bdf8; stroke-width: 1.8; filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.5)); }
          .zona-interactiva:focus-visible .hueso-cabeza { stroke: #ffffff !important; stroke-width: 2.5 !important; }
        `}</style>

        {cara === 'anterior' ? (
          <g transform={esDerecho ? 'translate(340 0) scale(-1 1)' : undefined}>
            {/* SILUETA BASE: Tronco Superior, Hombros y Cuello */}
            <path className="hueso-base" d="M 110 230 C 90 250, 50 300, 20 440 L 320 440 C 290 300, 250 250, 230 230 L 210 200 L 130 200 Z" />

            {/* CLAVÍCULAS */}
            <ZonaAnatomica id="clavicula" afectacion={getAfect('clavicula')} onRegionToggle={onRegionToggle} label="Clavícula">
              <path d="M 160 340 C 120 330, 70 320, 20 340 L 20 355 C 70 340, 120 350, 160 360 Z" />
              <path d="M 180 340 C 220 330, 270 320, 320 340 L 320 355 C 270 340, 220 350, 180 360 Z" />
            </ZonaAnatomica>

            {/* TRAPECIO SUPERIOR (Fibras anteriores) */}
            <ZonaAnatomica id="trapecio_sup" afectacion={getAfect('trapecio_sup')} onRegionToggle={onRegionToggle} label="Trapecio Superior">
              <path d="M 120 220 C 100 240, 60 290, 30 400 L 60 400 C 90 300, 120 250, 140 230 Z" opacity="0.7" />
              <path d="M 220 220 C 240 240, 280 290, 310 400 L 280 400 C 250 300, 220 250, 200 230 Z" opacity="0.7" />
            </ZonaAnatomica>

            {/* ESCALENOS (Cuello lateral) */}
            <ZonaAnatomica id="escalenos" afectacion={getAfect('escalenos')} onRegionToggle={onRegionToggle} label="Escalenos">
              <path d="M 135 210 L 120 320 L 140 340 L 148 230 Z" opacity="0.85" />
              <path d="M 205 210 L 220 320 L 200 340 L 192 230 Z" opacity="0.85" />
            </ZonaAnatomica>

            {/* ECOM (Músculo delgado desde la mastoides al esternón) */}
            <ZonaAnatomica id="ecom" afectacion={getAfect('ecom')} onRegionToggle={onRegionToggle} label="ECOM (Esternocleidomastoideo)">
              <path d="M 120 180 Q 130 260 155 340 L 165 340 Q 145 260 135 180 Z" />
              <path d="M 220 180 Q 210 260 185 340 L 175 340 Q 195 260 205 180 Z" />
            </ZonaAnatomica>

            {/* PLEXO BRAQUIAL (Desde el cuello a los hombros) */}
            <ZonaAnatomica id="plexo_braquial" afectacion={getAfect('plexo_braquial')} onRegionToggle={onRegionToggle} label="Plexo Braquial">
              <path d="M 155 230 Q 120 300 70 380 M 155 250 Q 115 310 75 380 M 155 270 Q 110 320 80 380" stroke="#eab308" strokeWidth="2" strokeLinecap="round" fill="none" style={{ pointerEvents: 'all' }} />
              <path d="M 185 230 Q 220 300 270 380 M 185 250 Q 225 310 265 380 M 185 270 Q 230 320 260 380" stroke="#eab308" strokeWidth="2" strokeLinecap="round" fill="none" style={{ pointerEvents: 'all' }} />
            </ZonaAnatomica>

            {/* CRÁNEO (Frontal) */}
            <ZonaAnatomica id="frontal" afectacion={getAfect('frontal')} onRegionToggle={onRegionToggle} label="Hueso Frontal">
              <path d="M 170 20 C 115 20, 85 55, 82 105 C 100 115, 140 112, 170 112 C 200 112, 240 115, 258 105 C 255 55, 225 20, 170 20 Z" />
            </ZonaAnatomica>

            {/* PARIETALES (Laterales) */}
            <ZonaAnatomica id="parietal" afectacion={getAfect('parietal')} onRegionToggle={onRegionToggle} label="Parietales">
              <path d="M 98 35 C 80 60, 78 90, 82 105 C 85 55, 115 20, 170 20 C 130 20, 108 28, 98 35 Z" opacity="0.85" />
              <path d="M 242 35 C 260 60, 262 90, 258 105 C 255 55, 225 20, 170 20 C 210 20, 232 28, 242 35 Z" opacity="0.85" />
            </ZonaAnatomica>

            {/* TEMPORAL (Abanico) */}
            <ZonaAnatomica id="temporal_musc" afectacion={getAfect('temporal_musc')} onRegionToggle={onRegionToggle} label="Músculo Temporal">
              <path d="M 80 85 C 70 115, 74 150, 95 170 C 95 145, 90 120, 82 105 Z" opacity="0.9" />
              <path d="M 260 85 C 270 115, 266 150, 245 170 C 245 145, 250 120, 258 105 Z" opacity="0.9" />
            </ZonaAnatomica>

            {/* ÓRBITAS Y CIGOMÁTICO */}
            <ZonaAnatomica id="zigomatico" afectacion={getAfect('zigomatico')} onRegionToggle={onRegionToggle} label="Pómulos y Órbitas">
              <path d="M 108 118 C 96 118, 94 148, 112 152 C 128 152, 134 135, 130 118 Z" style={{ fill: '#050b14', stroke: '#475569' }} />
              <path d="M 232 118 C 244 118, 246 148, 228 152 C 212 152, 206 135, 210 118 Z" style={{ fill: '#050b14', stroke: '#475569' }} />
              <path d="M 88 145 C 80 155, 85 185, 108 185 C 120 185, 128 175, 126 156 Z" />
              <path d="M 252 145 C 260 155, 255 185, 232 185 C 220 185, 212 175, 214 156 Z" />
            </ZonaAnatomica>

            {/* HUESO NASAL Y MAXILAR (Separado correctamente) */}
            <ZonaAnatomica id="maxilar" afectacion={getAfect('maxilar')} onRegionToggle={onRegionToggle} label="Maxilar y Hueso Nasal">
              {/* Hueso Nasal */}
              <path d="M 165 115 L 175 115 L 175 140 L 165 140 Z" />
              {/* Maxilar (Solo base y alrededor de la nariz) */}
              <path d="M 145 150 C 145 175, 155 190, 170 190 C 185 190, 195 175, 195 150 Z" />
              {/* Cavidad Nasal */}
              <path d="M 162 140 C 158 155, 170 170, 170 170 C 170 170, 182 155, 178 140 Z" style={{ fill: '#050b14', stroke: '#475569' }} />
            </ZonaAnatomica>

            {/* MANDÍBULA */}
            <ZonaAnatomica id="mandibula" afectacion={getAfect('mandibula')} onRegionToggle={onRegionToggle} label="Mandíbula">
              <path d="M 105 185 C 100 215, 120 245, 170 255 C 220 245, 240 215, 235 185 L 215 195 C 200 225, 140 225, 125 195 Z" />
            </ZonaAnatomica>

            {/* MASETERO */}
            <ZonaAnatomica id="masetero" afectacion={getAfect('masetero')} onRegionToggle={onRegionToggle} label="Músculo Masetero">
              <path d="M 105 185 C 110 215, 125 240, 135 245 L 130 195 Z" opacity="0.85" />
              <path d="M 235 185 C 230 215, 215 240, 205 245 L 210 195 Z" opacity="0.85" />
            </ZonaAnatomica>

            {/* ATM */}
            <ZonaAnatomica id="atm" afectacion={getAfect('atm')} onRegionToggle={onRegionToggle} label="ATM">
              <ellipse cx="90" cy="175" rx="8" ry="10" style={{ fill: 'rgba(244, 114, 182, 0.5)', stroke: '#f472b6', strokeWidth: 1.5 }} />
              <ellipse cx="250" cy="175" rx="8" ry="10" style={{ fill: 'rgba(244, 114, 182, 0.5)', stroke: '#f472b6', strokeWidth: 1.5 }} />
            </ZonaAnatomica>

            {/* TRIGÉMINO */}
            <ZonaAnatomica id="trigemino" afectacion={getAfect('trigemino')} onRegionToggle={onRegionToggle} label="Nervio Trigémino">
              <path d="M 120 145 C 130 120, 140 100, 150 90" stroke="#eab308" strokeWidth="2" strokeLinecap="round" fill="none" style={{ pointerEvents: 'all' }} />
              <path d="M 120 145 C 140 155, 160 160, 175 160" stroke="#eab308" strokeWidth="2" strokeLinecap="round" fill="none" style={{ pointerEvents: 'all' }} />
              <path d="M 120 145 C 130 170, 145 195, 160 215" stroke="#eab308" strokeWidth="2" strokeLinecap="round" fill="none" style={{ pointerEvents: 'all' }} />
              <path d="M 220 145 C 210 120, 200 100, 190 90" stroke="#eab308" strokeWidth="2" strokeLinecap="round" fill="none" style={{ pointerEvents: 'all' }} />
              <path d="M 220 145 C 200 155, 180 160, 165 160" stroke="#eab308" strokeWidth="2" strokeLinecap="round" fill="none" style={{ pointerEvents: 'all' }} />
              <path d="M 220 145 C 210 170, 195 195, 180 215" stroke="#eab308" strokeWidth="2" strokeLinecap="round" fill="none" style={{ pointerEvents: 'all' }} />
            </ZonaAnatomica>
          </g>
        ) : (
          <g transform={esDerecho ? 'translate(340 0) scale(-1 1)' : undefined}>
            {/* SILUETA POSTERIOR */}
            <path className="hueso-base" d="M 110 230 C 90 250, 50 300, 20 440 L 320 440 C 290 300, 250 250, 230 230 L 210 200 L 130 200 Z" />

            {/* TRAPECIO POSTERIOR */}
            <ZonaAnatomica id="trapecio_sup" afectacion={getAfect('trapecio_sup')} onRegionToggle={onRegionToggle} label="Trapecio Superior">
              <path d="M 170 170 L 130 220 L 40 410 L 130 410 L 170 260 Z" opacity="0.85" />
              <path d="M 170 170 L 210 220 L 300 410 L 210 410 L 170 260 Z" opacity="0.85" />
            </ZonaAnatomica>

            {/* ELEVADOR DE LA ESCÁPULA */}
            <ZonaAnatomica id="elevador_escapula" afectacion={getAfect('elevador_escapula')} onRegionToggle={onRegionToggle} label="Elevador de la Escápula">
              <path d="M 150 200 L 120 300 L 140 310 L 160 220 Z" opacity="0.9" />
              <path d="M 190 200 L 220 300 L 200 310 L 180 220 Z" opacity="0.9" />
            </ZonaAnatomica>

            {/* PARIETALES */}
            <ZonaAnatomica id="parietal" afectacion={getAfect('parietal')} onRegionToggle={onRegionToggle} label="Parietales">
              <path d="M 170 20 C 115 20, 85 55, 82 120 L 258 120 C 255 55, 225 20, 170 20 Z" />
            </ZonaAnatomica>

            {/* OCCIPITAL */}
            <ZonaAnatomica id="occipital" afectacion={getAfect('occipital')} onRegionToggle={onRegionToggle} label="Hueso Occipital">
              <path d="M 82 120 C 80 170, 110 215, 170 225 C 230 215, 260 170, 258 120 Z" />
            </ZonaAnatomica>

            {/* SUBOCCIPITALES */}
            <ZonaAnatomica id="suboccipitales" afectacion={getAfect('suboccipitales')} onRegionToggle={onRegionToggle} label="Suboccipitales">
              <path d="M 130 205 C 150 195, 190 195, 210 205 L 200 240 C 180 250, 160 250, 140 240 Z" style={{ fill: 'rgba(239, 68, 68, 0.45)', stroke: '#f87171' }} />
            </ZonaAnatomica>

            {/* TEMPORAL MASTOIDEA */}
            <ZonaAnatomica id="temporal" afectacion={getAfect('temporal')} onRegionToggle={onRegionToggle} label="Temporal Mastoidea">
              <path d="M 82 120 C 72 145, 74 185, 95 205 L 105 185 C 95 160, 92 135, 88 120 Z" />
              <path d="M 258 120 C 268 145, 266 185, 245 205 L 235 185 C 245 160, 248 135, 252 120 Z" />
            </ZonaAnatomica>

            {/* NERVIO OCCIPITAL MAYOR (ARNOLD) */}
            <ZonaAnatomica id="occipital_mayor" afectacion={getAfect('occipital_mayor')} onRegionToggle={onRegionToggle} label="Nervio de Arnold">
              <path d="M 158 235 C 145 200, 130 150, 125 70" stroke="#eab308" strokeWidth="2.5" strokeLinecap="round" fill="none" style={{ pointerEvents: 'all' }} />
              <path d="M 182 235 C 195 200, 210 150, 215 70" stroke="#eab308" strokeWidth="2.5" strokeLinecap="round" fill="none" style={{ pointerEvents: 'all' }} />
            </ZonaAnatomica>
          </g>
        )}
      </svg>
    </div>
  );
}