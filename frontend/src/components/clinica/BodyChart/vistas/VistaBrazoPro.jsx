// src/components/clinica/BodyChart/vistas/VistaBrazoPro.jsx
import React from 'react';

// ==========================================
// ESTRUCTURA ANATÓMICA DEL BRAZO Y ANTEBRAZO
// ==========================================
export const ESTRUCTURA_BRAZO = {
  huesos: [
    { id: 'humero', nombre: 'Húmero (Diáfisis y Cóndilos)', zona: 'Huesos' },
    { id: 'radio', nombre: 'Radio (Cabeza, Cuello y Tuberosidad)', zona: 'Antebrazo Óseo' },
    { id: 'cubito', nombre: 'Cúbito / Ulna (Olécranon)', zona: 'Antebrazo Óseo' },
    { id: 'epicondilo_lateral', nombre: 'Epicóndilo Lateral', zona: 'Codo' },
    { id: 'epitroclea_medial', nombre: 'Epitróclea / Epicóndilo Medial', zona: 'Codo' },
  ],
  musculos_anterior: [
    { id: 'biceps_cabeza_larga', nombre: 'Bíceps Braquial (Cabeza Larga)', zona: 'Compartimento Anterior' },
    { id: 'biceps_cabeza_corta', nombre: 'Bíceps Braquial (Cabeza Corta)', zona: 'Compartimento Anterior' },
    { id: 'coracobraquial', nombre: 'Músculo Coracobraquial', zona: 'Compartimento Anterior Superior' },
    { id: 'braquial', nombre: 'Músculo Braquial Anterior', zona: 'Compartimento Anterior Profundo' },
    { id: 'braquiorradial', nombre: 'Braquiorradial / Supinador Largo', zona: 'Compartimento Antebrazo Lateral' },
    { id: 'pronador_redondo', nombre: 'Pronador Redondo', zona: 'Compartimento Antebrazo Medial' },
  ],
  musculos_posterior: [
    { id: 'triceps_cabeza_larga', nombre: 'Tríceps Braquial (Cabeza Larga)', zona: 'Compartimento Posterior' },
    { id: 'triceps_cabeza_lateral', nombre: 'Tríceps Braquial (Cabeza Lateral)', zona: 'Compartimento Posterior' },
    { id: 'triceps_cabeza_medial', nombre: 'Tríceps Braquial (Cabeza Medial / Profunda)', zona: 'Compartimento Posterior' },
    { id: 'anconeo', nombre: 'Músculo Ancóneo', zona: 'Posterior Codo' },
  ],
  vasos_nervios_puntos: [
    { id: 'nervio_mediano', nombre: 'Nervio Mediano (Canal Braquial)', zona: 'Inervación Anterior' },
    { id: 'nervio_cubital', nombre: 'Nervio Cubital (Surco Epitrocleolecraniano)', zona: 'Inervación Medial' },
    { id: 'nervio_radial', nombre: 'Nervio Radial (Surco del N. Radial)', zona: 'Inervación Posterior' },
    { id: 'nervio_musculocutaneo', nombre: 'Nervio Musculocutáneo', zona: 'Inervación Anterior' },
    { id: 'arteria_braquial', nombre: 'Arteria Braquial / Humeral', zona: 'Vascular Anterior' },
    { id: 'tendon_biceps_distal', nombre: 'Tendón Distal del Bíceps', zona: 'Tejido Tendinoso' },
    { id: 'tendon_triceps', nombre: 'Tendón del Tríceps', zona: 'Tejido Tendinoso' },
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
            'hueso-brazo',
            afectacion ? 'selected' : '',
            child.props.className || '',
          ].filter(Boolean).join(' '),
        });
      })}
    </g>
  );
};

export default function VistaBrazoPro({
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
        Brazo & Antebrazo ({lado === 'izquierdo' || lado === 'izquierda' ? 'Izquierdo' : 'Derecho'}) —{' '}
        {cara === 'anterior'
          ? 'Vista Anterior (Bíceps L/C · Braquial · N. Mediano · Art. Braquial)'
          : 'Vista Posterior (Tríceps Larga/Lateral/Medial · N. Radial · Surco Epitroclear)'}
      </h4>

      <svg viewBox="0 0 330 400" width="100%" height="100%" className="h-full w-full max-w-xl scale-110 touch-manipulation select-none">
        <style>{`
          .hueso-base   { fill: #09131f; stroke: #334155; stroke-width: 1.2; stroke-linejoin: round; }
          .hueso-brazo { fill: #1e293b; stroke: #475569; stroke-width: 1.2; stroke-linejoin: round; transition: all 150ms ease; cursor: pointer; }
          .hueso-brazo:hover { fill: #085a75; stroke: #38bdf8; stroke-width: 1.8; filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.5)); }
          .zona-interactiva:focus-visible .hueso-brazo { stroke: #ffffff !important; stroke-width: 2.5 !important; }
        `}</style>

        {cara === 'anterior' ? (
          <g transform={esDerecho ? 'translate(340 0) scale(-1 1)' : undefined}>
            {/* SILUETA BASE */}
            <path
              className="hueso-base"
              d="M 112 15 C 145 10, 195 10, 228 15 C 248 60, 256 120, 244 195 C 238 220, 230 235, 238 275 C 248 315, 240 360, 222 415 L 118 415 C 100 360, 92 315, 102 275 C 110 235, 102 220, 96 195 C 84 120, 92 60, 112 15 Z"
            />

            {/* HÚMERO */}
            <ZonaAnatomica id="humero" afectacion={getAfect('humero')} onRegionToggle={onRegionToggle} label="Húmero (Diáfisis)">
              <path d="M 154 20 L 186 20 L 182 220 L 158 220 Z" opacity="0.35" />
            </ZonaAnatomica>

            {/* EPICÓNDILOS */}
            <ZonaAnatomica id="epicondilo_lateral" afectacion={getAfect('epicondilo_lateral')} onRegionToggle={onRegionToggle} label="Epicóndilo Lateral">
              <ellipse cx="120" cy="235" rx="8" ry="10" fill="#334155" opacity="0.9" />
            </ZonaAnatomica>
            <ZonaAnatomica id="epitroclea_medial" afectacion={getAfect('epitroclea_medial')} onRegionToggle={onRegionToggle} label="Epitróclea / Epicóndilo Medial">
              <ellipse cx="220" cy="235" rx="8" ry="10" fill="#334155" opacity="0.9" />
            </ZonaAnatomica>

            {/* CORACOBRAQUIAL */}
            <ZonaAnatomica id="coracobraquial" afectacion={getAfect('coracobraquial')} onRegionToggle={onRegionToggle} label="Músculo Coracobraquial">
              <path d="M 175 22 C 185 22, 205 40, 202 110 L 186 115 C 182 60, 172 40, 175 22 Z" fill="#2d3748" opacity="0.8" />
            </ZonaAnatomica>

            {/* BRAQUIAL ANTERIOR */}
            <ZonaAnatomica id="braquial" afectacion={getAfect('braquial')} onRegionToggle={onRegionToggle} label="Músculo Braquial Anterior">
              <path d="M 124 130 C 120 180, 126 230, 138 245 L 202 245 C 214 230, 220 180, 216 130 C 200 145, 140 145, 124 130 Z" opacity="0.75" />
            </ZonaAnatomica>

            {/* BÍCEPS (CABEZAS) */}
            <ZonaAnatomica id="biceps_cabeza_larga" afectacion={getAfect('biceps_cabeza_larga')} onRegionToggle={onRegionToggle} label="Bíceps Braquial (Cabeza Larga)">
              <path d="M 126 25 C 122 70, 120 130, 134 200 C 148 215, 166 210, 168 190 C 158 130, 150 70, 142 25 Z" />
            </ZonaAnatomica>
            <ZonaAnatomica id="biceps_cabeza_corta" afectacion={getAfect('biceps_cabeza_corta')} onRegionToggle={onRegionToggle} label="Bíceps Braquial (Cabeza Corta)">
              <path d="M 146 25 C 154 70, 162 130, 170 190 C 172 210, 190 215, 204 200 C 218 130, 214 70, 208 25 Z" />
            </ZonaAnatomica>

            {/* TENDÓN DISTAL DEL BÍCEPS */}
            <ZonaAnatomica id="tendon_biceps_distal" afectacion={getAfect('tendon_biceps_distal')} onRegionToggle={onRegionToggle} label="Tendón Distal del Bíceps">
              <path d="M 166 200 L 174 200 L 168 260 L 158 260 Z" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1.5" />
              <path d="M 172 205 L 198 235 L 190 240 L 168 210 Z" fill="#cbd5e1" opacity="0.6" />
            </ZonaAnatomica>

            {/* BRAQUIORRADIAL */}
            <ZonaAnatomica id="braquiorradial" afectacion={getAfect('braquiorradial')} onRegionToggle={onRegionToggle} label="Músculo Braquiorradial">
              <path d="M 112 210 C 104 250, 110 320, 134 415 L 152 415 C 132 330, 128 260, 136 240 Z" />
            </ZonaAnatomica>

            {/* PRONADOR REDONDO */}
            <ZonaAnatomica id="pronador_redondo" afectacion={getAfect('pronador_redondo')} onRegionToggle={onRegionToggle} label="Músculo Pronador Redondo">
              <path d="M 216 235 C 205 255, 175 285, 155 300 L 145 290 C 170 270, 200 245, 208 230 Z" fill="#334155" opacity="0.85" />
            </ZonaAnatomica>

            {/* RADIO Y CÚBITO */}
            <ZonaAnatomica id="radio" afectacion={getAfect('radio')} onRegionToggle={onRegionToggle} label="Radio">
              <path d="M 140 265 L 162 265 L 150 415 L 126 415 Z" opacity="0.4" />
            </ZonaAnatomica>
            <ZonaAnatomica id="cubito" afectacion={getAfect('cubito')} onRegionToggle={onRegionToggle} label="Cúbito / Ulna">
              <path d="M 178 265 L 200 265 L 214 415 L 190 415 Z" opacity="0.4" />
            </ZonaAnatomica>

            {/* NERVIOS Y ARTERIA (Adelgazados y con opacidad) */}
            <ZonaAnatomica id="nervio_musculocutaneo" afectacion={getAfect('nervio_musculocutaneo')} onRegionToggle={onRegionToggle} label="Nervio Musculocutáneo">
              <path d="M 176 20 C 160 80, 145 130, 126 210" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="3 2" fill="none" opacity="0.8" style={{ pointerEvents: 'all' }} />
            </ZonaAnatomica>
            <ZonaAnatomica id="nervio_mediano" afectacion={getAfect('nervio_mediano')} onRegionToggle={onRegionToggle} label="Nervio Mediano">
              <path d="M 188 20 C 182 80, 180 160, 175 235 C 170 280, 168 350, 170 415" stroke="#eab308" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.85" style={{ pointerEvents: 'all' }} />
            </ZonaAnatomica>
            <ZonaAnatomica id="arteria_braquial" afectacion={getAfect('arteria_braquial')} onRegionToggle={onRegionToggle} label="Arteria Braquial / Humeral">
              <path d="M 194 20 C 188 80, 186 160, 180 235 C 176 270, 162 310, 156 415" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.8" style={{ pointerEvents: 'all' }} />
            </ZonaAnatomica>
            <ZonaAnatomica id="nervio_cubital" afectacion={getAfect('nervio_cubital')} onRegionToggle={onRegionToggle} label="Nervio Cubital">
              <path d="M 205 20 C 212 80, 218 160, 222 230 C 220 280, 200 350, 198 415" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.85" style={{ pointerEvents: 'all' }} />
            </ZonaAnatomica>
          </g>
        ) : (
          <g transform={esDerecho ? 'translate(340 0) scale(-1 1)' : undefined}>
            {/* SILUETA BASE POSTERIOR */}
            <path
              className="hueso-base"
              d="M 112 15 C 145 10, 195 10, 228 15 C 248 60, 256 120, 244 195 C 238 220, 230 235, 238 275 C 248 315, 240 360, 222 415 L 118 415 C 100 360, 92 315, 102 275 C 110 235, 102 220, 96 195 C 84 120, 92 60, 112 15 Z"
            />

            {/* HÚMERO POSTERIOR */}
            <ZonaAnatomica id="humero" afectacion={getAfect('humero')} onRegionToggle={onRegionToggle} label="Húmero (Cara Posterior)">
              <path d="M 154 20 L 186 20 L 182 230 L 158 230 Z" opacity="0.3" />
            </ZonaAnatomica>

            {/* TRÍCEPS */}
            <ZonaAnatomica id="triceps_cabeza_larga" afectacion={getAfect('triceps_cabeza_larga')} onRegionToggle={onRegionToggle} label="Tríceps Braquial (Cabeza Larga)">
              <path d="M 180 22 C 185 60, 190 120, 185 175 C 168 180, 155 175, 152 160 C 158 110, 165 60, 168 22 Z" />
            </ZonaAnatomica>
            <ZonaAnatomica id="triceps_cabeza_lateral" afectacion={getAfect('triceps_cabeza_lateral')} onRegionToggle={onRegionToggle} label="Tríceps Braquial (Cabeza Lateral)">
              <path d="M 125 25 C 120 70, 115 120, 130 170 C 145 175, 158 170, 152 150 C 140 100, 136 60, 138 25 Z" />
            </ZonaAnatomica>
            <ZonaAnatomica id="triceps_cabeza_medial" afectacion={getAfect('triceps_cabeza_medial')} onRegionToggle={onRegionToggle} label="Tríceps Braquial (Cabeza Medial / Profunda)">
              <path d="M 132 165 C 150 160, 185 160, 202 165 L 210 225 C 190 235, 145 235, 124 225 Z" opacity="0.85" fill="#2d3748" />
            </ZonaAnatomica>

            {/* TENDÓN DEL TRÍCEPS */}
            <ZonaAnatomica id="tendon_triceps" afectacion={getAfect('tendon_triceps')} onRegionToggle={onRegionToggle} label="Tendón del Tríceps & Aponeurosis">
              <path d="M 148 170 L 188 170 L 182 240 L 154 240 Z" fill="#334155" stroke="#94a3b8" strokeWidth="1" opacity="0.85" />
            </ZonaAnatomica>

            {/* HUESOS DEL ANTEBRAZO */}
            <ZonaAnatomica id="cubito" afectacion={getAfect('cubito')} onRegionToggle={onRegionToggle} label="Olécranon del Cúbito">
              <path d="M 158 235 L 178 235 L 188 415 L 168 415 Z" />
            </ZonaAnatomica>
            <ZonaAnatomica id="radio" afectacion={getAfect('radio')} onRegionToggle={onRegionToggle} label="Radio Posterior">
              <path d="M 124 250 L 146 250 L 140 415 L 118 415 Z" opacity="0.5" />
            </ZonaAnatomica>

            {/* ANCÓNEO */}
            <ZonaAnatomica id="anconeo" afectacion={getAfect('anconeo')} onRegionToggle={onRegionToggle} label="Músculo Ancóneo">
              <path d="M 122 238 L 152 238 L 138 285 L 115 260 Z" fill="#334155" />
            </ZonaAnatomica>

            {/* NERVIOS (Adelgazados y con opacidad) */}
            <ZonaAnatomica id="nervio_radial" afectacion={getAfect('nervio_radial')} onRegionToggle={onRegionToggle} label="Nervio Radial (Canal de Torsión)">
              <path d="M 195 20 C 180 70, 140 120, 122 195 C 114 235, 120 300, 128 415" stroke="#eab308" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.85" style={{ pointerEvents: 'all' }} />
            </ZonaAnatomica>
            <ZonaAnatomica id="nervio_cubital" afectacion={getAfect('nervio_cubital')} onRegionToggle={onRegionToggle} label="Nervio Cubital (Surco Epitrocleolecraniano)">
              <path d="M 212 20 C 215 90, 222 170, 218 235 C 210 270, 198 340, 190 415" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.85" style={{ pointerEvents: 'all' }} />
            </ZonaAnatomica>
          </g>
        )}
      </svg>
    </div>
  );
}