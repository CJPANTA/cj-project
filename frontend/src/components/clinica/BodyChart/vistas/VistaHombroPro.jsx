// src/components/clinica/BodyChart/vistas/VistaHombroPro.jsx
import React from 'react';

// ==========================================
// ESTRUCTURA ANATÓMICA DEL HOMBRO
// ==========================================
export const ESTRUCTURA_HOMBRO = {
  cintura_escapular: [
    { id: 'clavicula',        nombre: 'Clavícula',                       zona: 'Cintura Escapular' },
    { id: 'acromion',         nombre: 'Acromion',                        zona: 'Cintura Escapular' },
    { id: 'coracoides',       nombre: 'Apófisis Coracoides',             zona: 'Cintura Escapular' },
    { id: 'espina_escapular', nombre: 'Espina de la Escápula',           zona: 'Cintura Escapular' },
    { id: 'glenoides',        nombre: 'Cavidad Glenoides',               zona: 'Cintura Escapular' },
    { id: 'escapula',         nombre: 'Cuerpo Escapular',                zona: 'Cintura Escapular' },
    { id: 'acromion_post',    nombre: 'Acromion (Posterior)',            zona: 'Cintura Escapular' },
  ],
  humero: [
    { id: 'cabeza_humeral',      nombre: 'Cabeza Humeral',                   zona: 'Húmero Proximal' },
    { id: 'cabeza_humeral_post', nombre: 'Cabeza Humeral (Posterior)',       zona: 'Húmero Proximal' },
    { id: 'troquiter',           nombre: 'Troquíter (Tuberosidad Mayor)',    zona: 'Húmero Proximal' },
    { id: 'troquin',             nombre: 'Troquín (Tuberosidad Menor)',      zona: 'Húmero Proximal' },
    { id: 'diafisis_humeral',    nombre: 'Diáfisis Humeral',                 zona: 'Húmero' },
  ],
  manguito_rotador: [
    { id: 'supraespinoso', nombre: 'Supraespinoso', zona: 'Manguito Rotador' },
    { id: 'infraespinoso', nombre: 'Infraespinoso', zona: 'Manguito Rotador' },
    { id: 'subescapular',  nombre: 'Subescapular',  zona: 'Manguito Rotador' },
    { id: 'redondo_menor', nombre: 'Redondo Menor', zona: 'Manguito Rotador' },
  ],
  musculos_accesorios: [
    { id: 'deltoides_ant',  nombre: 'Deltoides Anterior',              zona: 'Deltoides' },
    { id: 'deltoides_post', nombre: 'Deltoides Posterior',             zona: 'Deltoides' },
    { id: 'pectoral_mayor', nombre: 'Pectoral Mayor',                  zona: 'Pectoral' },
    { id: 'redondo_mayor',  nombre: 'Redondo Mayor',                   zona: 'Dorsal' },
    { id: 'tendon_biceps',  nombre: 'Tendón Bíceps (Porción Larga)',   zona: 'Tendones' },
    { id: 'triceps',        nombre: 'Tríceps Braquial',                zona: 'Tríceps' },
  ],
  nervios: [
    { id: 'nervio_axilar',         nombre: 'Nervio Axilar (Circunflejo)', zona: 'Inervación' },
    { id: 'nervio_supraescapular', nombre: 'Nervio Supraescapular',       zona: 'Inervación' },
    { id: 'plexo_braquial',        nombre: 'Plexo Braquial',              zona: 'Inervación' },
  ],
  articulaciones: [
    { id: 'art_acromioclavicular', nombre: 'Art. Acromioclavicular', zona: 'Articulaciones' },
    { id: 'art_glenohumeral',      nombre: 'Art. Glenohumeral',      zona: 'Articulaciones' },
  ],
};

// ==========================================
// WRAPPER INTERACTIVO
// ==========================================
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
            'hueso-hombro',
            afectacion ? 'selected' : '',
            child.props.className || '',
          ].filter(Boolean).join(' '),
        });
      })}
    </g>
  );
};

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
export default function VistaHombroPro({
  cara = 'anterior',
  lado = 'derecho',
  afectaciones = {},
  onRegionToggle,
}) {
  const esDerecho  = lado === 'derecho' || lado === 'derecha';
  const getAfect   = (id) => afectaciones[id];

  return (
    <div className="flex w-full flex-col items-center">
      <h4 className="mb-2 text-xs sm:text-sm font-black tracking-wider text-[#22d3ee] font-mono uppercase text-center">
        Hombro {lado === 'izquierdo' || lado === 'izquierda' ? 'Izquierdo' : 'Derecho'} —{' '}
        {cara === 'anterior'
          ? 'Vista Anterior (Clavícula · Húmero · Manguito Anterior)'
          : 'Vista Posterior (Escápula · Manguito Posterior)'}
      </h4>

      <svg
        viewBox="0 0 340 400"
        width="100%"
        height="100%"
        className="h-full w-full max-w-xl touch-manipulation select-none"
      >
        <style>{`
          .hueso-base   { fill: #09131f; stroke: #334155; stroke-width: 1.2; stroke-linejoin: round; }
          .hueso-hombro { fill: #1e293b; stroke: #475569; stroke-width: 1.2; stroke-linejoin: round; transition: all 150ms ease; cursor: pointer; }
          .hueso-hombro:hover { fill: #085a75; stroke: #38bdf8; stroke-width: 1.8; filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.5)); }
          .zona-interactiva:focus-visible .hueso-hombro { stroke: #ffffff !important; stroke-width: 2.5 !important; }
          .linea-referencia { fill: none; stroke: #64748b; stroke-width: 1; stroke-dasharray: 2 2; pointer-events: none; }
          .etiqueta-hombro { fill: #94a3b8; font-size: 8px; font-family: monospace; font-weight: 700; transition: fill 200ms; }
          .etiqueta-activa { fill: #22d3ee; font-size: 9px; filter: drop-shadow(0 0 4px rgba(34, 211, 238, 0.6)); }
        `}</style>

        {cara === 'anterior' ? (
          <g transform={esDerecho ? 'translate(340 0) scale(-1 1)' : undefined}>
            {/* Silueta base (hombro + hemitórax) */}
            <path
              className="hueso-base"
              d="M 20 60 C 80 40 180 40 230 55 C 280 75 310 130 305 200 C 300 260 270 320 220 340 L 180 340 L 175 400 L 130 400 L 130 340 L 30 300 C 10 250 10 120 20 60 Z"
            />

            {/* CLAVÍCULA */}
            <ZonaAnatomica id="clavicula" afectacion={getAfect('clavicula')} onRegionToggle={onRegionToggle} label="Clavícula">
              <path d="M 30 75 C 80 55, 150 50, 195 58 L 200 72 C 150 65, 85 70, 35 88 Z" />
            </ZonaAnatomica>

            {/* ACROMION */}
            <ZonaAnatomica id="acromion" afectacion={getAfect('acromion')} onRegionToggle={onRegionToggle} label="Acromion">
              <path d="M 195 60 C 220 55, 245 68, 250 88 C 240 78, 215 72, 195 74 Z" />
            </ZonaAnatomica>

            {/* CORACOIDES */}
            <ZonaAnatomica id="coracoides" afectacion={getAfect('coracoides')} onRegionToggle={onRegionToggle} label="Apófisis Coracoides">
              <path d="M 172 98 C 162 92, 155 102, 168 112 L 185 108 Z" />
            </ZonaAnatomica>

            {/* GLENOIDES */}
            <ZonaAnatomica id="glenoides" afectacion={getAfect('glenoides')} onRegionToggle={onRegionToggle} label="Cavidad Glenoides">
              <path d="M 155 115 C 145 130, 148 150, 160 158 L 170 148 C 162 138, 162 125, 168 115 Z" />
            </ZonaAnatomica>

            {/* CABEZA HUMERAL */}
            <ZonaAnatomica id="cabeza_humeral" afectacion={getAfect('cabeza_humeral')} onRegionToggle={onRegionToggle} label="Cabeza Humeral">
              <circle cx="185" cy="142" r="22" />
            </ZonaAnatomica>

            {/* TROQUÍTER */}
            <ZonaAnatomica id="troquiter" afectacion={getAfect('troquiter')} onRegionToggle={onRegionToggle} label="Troquíter">
              <path d="M 205 118 C 220 115, 230 130, 224 150 L 205 145 Z" />
            </ZonaAnatomica>

            {/* TROQUÍN */}
            <ZonaAnatomica id="troquin" afectacion={getAfect('troquin')} onRegionToggle={onRegionToggle} label="Troquín">
              <path d="M 160 135 C 152 142, 155 158, 170 158 L 172 145 Z" />
            </ZonaAnatomica>

            {/* DIÁFISIS HUMERAL */}
            <ZonaAnatomica id="diafisis_humeral" afectacion={getAfect('diafisis_humeral')} onRegionToggle={onRegionToggle} label="Diáfisis Humeral">
              <path d="M 170 165 L 200 165 L 205 385 L 175 385 Z" />
            </ZonaAnatomica>

            {/* SUBESCAPULAR */}
            <ZonaAnatomica id="subescapular" afectacion={getAfect('subescapular')} onRegionToggle={onRegionToggle} label="Subescapular">
              <path d="M 152 112 C 135 128, 132 160, 148 188 C 165 200, 182 190, 188 168 C 188 145, 175 118, 152 112 Z" />
            </ZonaAnatomica>

            {/* DELTOIDES ANTERIOR */}
            <ZonaAnatomica id="deltoides_ant" afectacion={getAfect('deltoides_ant')} onRegionToggle={onRegionToggle} label="Deltoides Anterior">
              <path d="M 200 88 C 240 82, 278 108, 288 148 C 292 178, 278 205, 250 215 C 225 220, 208 198, 202 172 C 196 145, 194 112, 200 88 Z" />
            </ZonaAnatomica>

            {/* PECTORAL MAYOR (borde visible del hombro) */}
            <ZonaAnatomica id="pectoral_mayor" afectacion={getAfect('pectoral_mayor')} onRegionToggle={onRegionToggle} label="Pectoral Mayor">
              <path d="M 25 95 C 55 85, 110 90, 145 118 C 155 145, 150 178, 128 198 C 100 215, 60 205, 38 175 C 22 148, 20 118, 25 95 Z" />
            </ZonaAnatomica>

            {/* TENDÓN DEL BÍCEPS (porción larga) */}
            <ZonaAnatomica id="tendon_biceps" afectacion={getAfect('tendon_biceps')} onRegionToggle={onRegionToggle} label="Tendón Bíceps (Porción Larga)">
              <path d="M 178 105 L 182 130 L 188 200" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" fill="none" style={{ pointerEvents: 'all' }} />
            </ZonaAnatomica>

            {/* NERVIO AXILAR */}
            <ZonaAnatomica id="nervio_axilar" afectacion={getAfect('nervio_axilar')} onRegionToggle={onRegionToggle} label="Nervio Axilar">
              <path d="M 200 138 C 195 158, 182 172, 170 182" stroke="#eab308" strokeWidth="3" strokeLinecap="round" fill="none" style={{ pointerEvents: 'all' }} />
            </ZonaAnatomica>

            {/* ART. ACROMIOCLAVICULAR */}
            <ZonaAnatomica id="art_acromioclavicular" afectacion={getAfect('art_acromioclavicular')} onRegionToggle={onRegionToggle} label="Art. Acromioclavicular">
              <circle cx="208" cy="68" r="7" style={{ fill: 'rgba(244, 114, 182, 0.5)', stroke: '#f472b6', strokeWidth: 1.5, pointerEvents: 'all' }} />
            </ZonaAnatomica>

            {/* ART. GLENOHUMERAL */}
            <ZonaAnatomica id="art_glenohumeral" afectacion={getAfect('art_glenohumeral')} onRegionToggle={onRegionToggle} label="Art. Glenohumeral">
              <circle cx="166" cy="145" r="6" style={{ fill: 'rgba(244, 114, 182, 0.5)', stroke: '#f472b6', strokeWidth: 1.5, pointerEvents: 'all' }} />
            </ZonaAnatomica>
          </g>
        ) : (
          <g transform={esDerecho ? 'translate(340 0) scale(-1 1)' : undefined}>
            {/* Silueta base */}
            <path
              className="hueso-base"
              d="M 20 60 C 80 40 180 40 230 55 C 280 75 310 130 305 200 C 300 260 270 320 220 340 L 180 340 L 175 400 L 130 400 L 130 340 L 30 300 C 10 250 10 120 20 60 Z"
            />

            {/* CUERPO ESCAPULAR */}
            <ZonaAnatomica id="escapula" afectacion={getAfect('escapula')} onRegionToggle={onRegionToggle} label="Cuerpo Escapular">
              <path d="M 130 70 L 125 235 L 148 252 L 208 222 L 218 152 L 195 105 Z" />
            </ZonaAnatomica>

            {/* ESPINA ESCAPULAR */}
            <ZonaAnatomica id="espina_escapular" afectacion={getAfect('espina_escapular')} onRegionToggle={onRegionToggle} label="Espina Escapular">
              <path d="M 130 102 L 242 88 L 248 100 L 135 118 Z" />
            </ZonaAnatomica>

            {/* ACROMION POSTERIOR */}
            <ZonaAnatomica id="acromion_post" afectacion={getAfect('acromion_post')} onRegionToggle={onRegionToggle} label="Acromion">
              <path d="M 240 82 L 278 80 L 282 108 L 245 108 Z" />
            </ZonaAnatomica>

            {/* SUPRAESPINOSO */}
            <ZonaAnatomica id="supraespinoso" afectacion={getAfect('supraespinoso')} onRegionToggle={onRegionToggle} label="Supraespinoso">
              <path d="M 142 88 L 200 94 C 212 108, 205 122, 192 124 L 148 118 Z" />
            </ZonaAnatomica>

            {/* INFRAESPINOSO */}
            <ZonaAnatomica id="infraespinoso" afectacion={getAfect('infraespinoso')} onRegionToggle={onRegionToggle} label="Infraespinoso">
              <path d="M 148 128 L 200 130 C 218 148, 212 180, 195 195 L 155 198 Z" />
            </ZonaAnatomica>

            {/* REDONDO MENOR */}
            <ZonaAnatomica id="redondo_menor" afectacion={getAfect('redondo_menor')} onRegionToggle={onRegionToggle} label="Redondo Menor">
              <path d="M 198 198 L 222 198 L 230 225 L 200 228 Z" />
            </ZonaAnatomica>

            {/* REDONDO MAYOR */}
            <ZonaAnatomica id="redondo_mayor" afectacion={getAfect('redondo_mayor')} onRegionToggle={onRegionToggle} label="Redondo Mayor">
              <path d="M 158 202 L 192 205 L 198 238 L 162 238 Z" />
            </ZonaAnatomica>

            {/* CABEZA HUMERAL POSTERIOR */}
            <ZonaAnatomica id="cabeza_humeral_post" afectacion={getAfect('cabeza_humeral_post')} onRegionToggle={onRegionToggle} label="Cabeza Humeral">
              <circle cx="228" cy="138" r="20" />
            </ZonaAnatomica>

            {/* DELTOIDES POSTERIOR */}
            <ZonaAnatomica id="deltoides_post" afectacion={getAfect('deltoides_post')} onRegionToggle={onRegionToggle} label="Deltoides Posterior">
              <path d="M 240 102 C 288 108, 302 152, 292 198 C 276 228, 245 232, 225 218 C 215 198, 218 165, 228 140 C 232 122, 236 108, 240 102 Z" />
            </ZonaAnatomica>

            {/* TRÍCEPS */}
            <ZonaAnatomica id="triceps" afectacion={getAfect('triceps')} onRegionToggle={onRegionToggle} label="Tríceps Braquial">
              <path d="M 205 245 L 238 238 L 248 355 L 218 358 Z" />
            </ZonaAnatomica>

            {/* NERVIO SUPRAESCAPULAR */}
            <ZonaAnatomica id="nervio_supraescapular" afectacion={getAfect('nervio_supraescapular')} onRegionToggle={onRegionToggle} label="Nervio Supraescapular">
              <path d="M 145 95 C 162 102, 178 118, 188 132" stroke="#eab308" strokeWidth="3" strokeLinecap="round" fill="none" style={{ pointerEvents: 'all' }} />
            </ZonaAnatomica>
          </g>
        )}
      </svg>
    </div>
  );
}