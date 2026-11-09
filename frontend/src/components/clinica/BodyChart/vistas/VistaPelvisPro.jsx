// src/components/clinica/BodyChart/vistas/VistaPelvisPro.jsx
import React from 'react';

// ==========================================
// ESTRUCTURA ANATÓMICA DE LA PELVIS Y CADERA
// ==========================================
export const ESTRUCTURA_PELVIS = {
  huesos: [
    { id: 'cresta_iliaca', nombre: 'Cresta Ilíaca / Fosa Ilíaca', zona: 'Huesos' },
    { id: 'sacro', nombre: 'Sacro (Base y Forámenes)', zona: 'Huesos' },
    { id: 'coxis', nombre: 'Cóccix', zona: 'Huesos' },
    { id: 'pubis', nombre: 'Pubis / Sínfisis del Pubis', zona: 'Huesos' },
    { id: 'isquion', nombre: 'Isquion (Tuberosidad Isquiática)', zona: 'Huesos' },
    { id: 'acetabulo', nombre: 'Articulación Coxofemoral (Cadera / Acetábulo)', zona: 'Articulación' },
    { id: 'trocanter_mayor', nombre: 'Trocánter Mayor del Fémur', zona: 'Huesos' },
  ],
  musculos: [
    { id: 'gluteo_mayor', nombre: 'Glúteo Mayor', zona: 'Glúteos' },
    { id: 'gluteo_medio', nombre: 'Glúteo Medio', zona: 'Glúteos' },
    { id: 'aductor', nombre: 'Músculos Aductores (Muslo Interno)', zona: 'Muslo Interno' },
    { id: 'psoas', nombre: 'Psoas Ilíaco', zona: 'Fosa Ilíaca' },
    { id: 'recto_femoral', nombre: 'Recto Femoral (Cuádriceps)', zona: 'Muslo Frontal' },
    { id: 'piriforme', nombre: 'Músculo Piriforme (Piramidal)', zona: 'Profundo Posterior' },
  ],
  nervios: [
    { id: 'nervio_ciatico', nombre: 'Nervio Ciático (Recorrido Glúteo)', zona: 'Inervación' },
    { id: 'nervio_femoral', nombre: 'Nervio Femoral', zona: 'Inervación' },
  ]
};

// ==========================================
// COMPONENTE WRAPPER INTERACTIVO ACCESIBLE
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
            'hueso-pelvis',
            afectacion ? 'selected' : '',
            child.props.className || '',
          ].filter(Boolean).join(' '),
        });
      })}
    </g>
  );
};

// ==========================================
// VISTA PELVIS PRO ANATÓMICA
// ==========================================
export default function VistaPelvisPro({
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
        Pelvis y Cadera —{' '}
        {cara === 'anterior'
          ? 'Vista Anterior Anatómica (Alas Ilíacas · Pubis · Psoas · Fémur)'
          : 'Vista Posterior Anatómicamente Fiel (Sacro · Isquion · Glúteos · Ciático)'}
      </h4>

      <svg
        viewBox="0 0 340 400"
        width="100%"
        height="100%"
        className="h-full w-full max-w-xl touch-manipulation select-none"
      >
        <style>{`
          .hueso-base   { fill: #070d18; stroke: #1e293b; stroke-width: 1.2; stroke-linejoin: round; }
          .hueso-pelvis { fill: #1e293b; stroke: #475569; stroke-width: 1.2; stroke-linejoin: round; transition: all 150ms ease; cursor: pointer; }
          .hueso-pelvis:hover { fill: #085a75; stroke: #38bdf8; stroke-width: 1.8; filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.5)); }
          .zona-interactiva:focus-visible .hueso-pelvis { stroke: #ffffff !important; stroke-width: 2.5 !important; }
        `}</style>

        {cara === 'anterior' ? (
          /* ==================================================== */
          /* VISTA ANTERIOR REALISTA DE ANATOMÍA DE PELVIS Y CADERA */
          /* ==================================================== */
          <g transform={esDerecho ? 'translate(340 0) scale(-1 1)' : undefined}>
            {/* Silueta corporal base */}
            <path
              className="hueso-base"
              d="M 60 20 C 110 25, 230 25, 280 20 C 310 70, 315 140, 305 180 C 290 230, 270 290, 250 390 L 205 390 C 190 310, 180 260, 170 240 C 160 260, 150 310, 135 390 L 90 390 C 70 290, 50 230, 35 180 C 25 140, 30 70, 60 20 Z"
            />

            {/* CRESTA ILÍACA Y FOSA ILÍACA ANTERIOR (Alas de la Pelvis) */}
            <ZonaAnatomica id="cresta_iliaca" afectacion={getAfect('cresta_iliaca')} onRegionToggle={onRegionToggle} label="Cresta e Ilion">
              <path d="M 75 40 C 100 25, 140 35, 150 60 C 150 95, 125 145, 95 150 C 75 145, 60 95, 75 40 Z" />
              <path d="M 265 40 C 240 25, 200 35, 190 60 C 190 95, 215 145, 245 150 C 265 145, 280 95, 265 40 Z" />
            </ZonaAnatomica>

            {/* SACRO ANTERIOR */}
            <ZonaAnatomica id="sacro" afectacion={getAfect('sacro')} onRegionToggle={onRegionToggle} label="Sacro (Vista Anterior)">
              <path d="M 148 55 L 192 55 L 180 145 C 174 165, 166 165, 160 145 Z" />
            </ZonaAnatomica>

            {/* PSOAS ILÍACO (Músculo anterior que desciende por la fosa ilíaca) */}
            <ZonaAnatomica id="psoas" afectacion={getAfect('psoas')} onRegionToggle={onRegionToggle} label="Psoas Ilíaco">
              <path d="M 152 50 C 145 90, 125 150, 115 195 L 132 198 C 142 160, 158 100, 162 50 Z" opacity="0.85" />
              <path d="M 188 50 C 195 90, 215 150, 225 195 L 208 198 C 198 160, 182 100, 178 50 Z" opacity="0.85" />
            </ZonaAnatomica>

            {/* PUBIS Y SÍNFISIS DEL PUBIS */}
            <ZonaAnatomica id="pubis" afectacion={getAfect('pubis')} onRegionToggle={onRegionToggle} label="Pubis y Sínfisis">
              <path d="M 140 160 C 160 152, 180 152, 200 160 L 195 205 C 180 215, 160 215, 145 205 Z" />
            </ZonaAnatomica>

            {/* ISQUION (Ramas inferiores) */}
            <ZonaAnatomica id="isquion" afectacion={getAfect('isquion')} onRegionToggle={onRegionToggle} label="Isquion">
              <path d="M 115 178 C 122 195, 138 215, 145 208 L 140 185 Z" />
              <path d="M 225 178 C 218 195, 202 215, 195 208 L 200 185 Z" />
            </ZonaAnatomica>

            {/* ACETÁBULO Y CABEZA FEMORAL (ARTICULACIÓN COXOFEMORAL) */}
            <ZonaAnatomica id="acetabulo" afectacion={getAfect('acetabulo')} onRegionToggle={onRegionToggle} label="Articulación de la Cadera">
              <ellipse cx="98" cy="165" rx="18" ry="20" />
              <ellipse cx="242" cy="165" rx="18" ry="20" />
            </ZonaAnatomica>

            {/* TROCÁNTER MAYOR (Prominencia lateral de la cadera) */}
            <ZonaAnatomica id="trocanter_mayor" afectacion={getAfect('trocanter_mayor')} onRegionToggle={onRegionToggle} label="Trocánter Mayor del Fémur">
              <path d="M 70 155 C 60 165, 62 190, 78 195 L 85 172 Z" />
              <path d="M 270 155 C 280 165, 278 190, 262 195 L 255 172 Z" />
            </ZonaAnatomica>

            {/* RECTO FEMORAL (Muslo Anterior) */}
            <ZonaAnatomica id="recto_femoral" afectacion={getAfect('recto_femoral')} onRegionToggle={onRegionToggle} label="Recto Femoral">
              <path d="M 85 195 C 105 210, 115 280, 110 390 L 85 390 C 72 310, 68 240, 85 195 Z" opacity="0.8" />
              <path d="M 255 195 C 235 210, 225 280, 230 390 L 255 390 C 268 310, 272 240, 255 195 Z" opacity="0.8" />
            </ZonaAnatomica>

            {/* ADUCTORES (Muslo Interno / Zona Inguinal) */}
            <ZonaAnatomica id="aductor" afectacion={getAfect('aductor')} onRegionToggle={onRegionToggle} label="Aductores del Muslo">
              <path d="M 145 208 C 152 230, 160 300, 135 390 L 110 390 C 122 300, 132 230, 140 208 Z" />
              <path d="M 195 208 C 188 230, 180 300, 205 390 L 230 390 C 218 300, 208 230, 200 208 Z" />
            </ZonaAnatomica>

            {/* NERVIO FEMORAL */}
            <ZonaAnatomica id="nervio_femoral" afectacion={getAfect('nervio_femoral')} onRegionToggle={onRegionToggle} label="Nervio Femoral">
              <path d="M 125 155 L 120 390" stroke="#eab308" strokeWidth="3" strokeLinecap="round" fill="none" style={{ pointerEvents: 'all' }} />
              <path d="M 215 155 L 220 390" stroke="#eab308" strokeWidth="3" strokeLinecap="round" fill="none" style={{ pointerEvents: 'all' }} />
            </ZonaAnatomica>
          </g>
        ) : (
          /* ========================================================= */
          /* VISTA POSTERIOR ANATÓMICA (GLÚTEOS, PIRIFORME Y CIÁTICO)  */
          /* ========================================================= */
          <g transform={esDerecho ? 'translate(340 0) scale(-1 1)' : undefined}>
            {/* Silueta corporal posterior */}
            <path
              className="hueso-base"
              d="M 60 20 C 110 25, 230 25, 280 20 C 310 70, 315 140, 305 180 C 290 230, 270 290, 250 390 L 205 390 C 190 310, 180 260, 170 240 C 160 260, 150 310, 135 390 L 90 390 C 70 290, 50 230, 35 180 C 25 140, 30 70, 60 20 Z"
            />

            {/* CRESTA ILÍACA POSTERIOR */}
            <ZonaAnatomica id="cresta_iliaca" afectacion={getAfect('cresta_iliaca')} onRegionToggle={onRegionToggle} label="Cresta Ilíaca Posterior">
              <path d="M 75 40 C 110 32, 142 45, 148 62 L 138 75 C 130 60, 105 48, 78 52 Z" />
              <path d="M 265 40 C 230 32, 198 45, 192 62 L 202 75 C 210 60, 235 48, 262 52 Z" />
            </ZonaAnatomica>

            {/* SACRO Y CÓCCIX */}
            <ZonaAnatomica id="sacro" afectacion={getAfect('sacro')} onRegionToggle={onRegionToggle} label="Sacro (Vista Posterior)">
              <path d="M 148 60 L 192 60 L 178 150 C 172 165, 168 165, 162 150 Z" />
            </ZonaAnatomica>
            <ZonaAnatomica id="coxis" afectacion={getAfect('coxis')} onRegionToggle={onRegionToggle} label="Cóccix">
              <path d="M 164 152 L 176 152 L 170 175 Z" />
            </ZonaAnatomica>

            {/* GLÚTEO MEDIO (Parte superior / lateral de la nalga) */}
            <ZonaAnatomica id="gluteo_medio" afectacion={getAfect('gluteo_medio')} onRegionToggle={onRegionToggle} label="Glúteo Medio">
              <path d="M 78 52 C 105 48, 138 70, 142 105 C 115 118, 80 100, 68 80 Z" />
              <path d="M 262 52 C 235 48, 202 70, 198 105 C 225 118, 260 100, 272 80 Z" />
            </ZonaAnatomica>

            {/* MÚSCULO PIRIFORME / PIRAMIDAL DE LA PELVIS */}
            <ZonaAnatomica id="piriforme" afectacion={getAfect('piriforme')} onRegionToggle={onRegionToggle} label="Músculo Piriforme">
              <path d="M 160 115 L 90 145 L 88 158 L 160 130 Z" style={{ fill: 'rgba(239, 68, 68, 0.4)', stroke: '#f87171' }} />
              <path d="M 180 115 L 250 145 L 252 158 L 180 130 Z" style={{ fill: 'rgba(239, 68, 68, 0.4)', stroke: '#f87171' }} />
            </ZonaAnatomica>

            {/* GLÚTEO MAYOR (Masa muscular principal de las nalgas) */}
            <ZonaAnatomica id="gluteo_mayor" afectacion={getAfect('gluteo_mayor')} onRegionToggle={onRegionToggle} label="Glúteo Mayor">
              <path d="M 68 80 C 115 95, 145 125, 140 220 C 100 240, 65 210, 55 160 C 50 120, 58 95, 68 80 Z" />
              <path d="M 272 80 C 225 95, 195 125, 200 220 C 240 240, 275 210, 285 160 C 290 120, 282 95, 272 80 Z" />
            </ZonaAnatomica>

            {/* TUBEROSIDAD ISQUIÁTICA (ISQUION POSTERIOR) */}
            <ZonaAnatomica id="isquion" afectacion={getAfect('isquion')} onRegionToggle={onRegionToggle} label="Tuberosidad Isquiática">
              <circle cx="125" cy="215" r="14" />
              <circle cx="215" cy="215" r="14" />
            </ZonaAnatomica>

            {/* TROCÁNTER MAYOR (POSTERIOR) */}
            <ZonaAnatomica id="trocanter_mayor" afectacion={getAfect('trocanter_mayor')} onRegionToggle={onRegionToggle} label="Trocánter Mayor Posterior">
              <path d="M 65 148 C 55 158, 58 180, 72 188 L 78 165 Z" />
              <path d="M 275 148 C 285 158, 282 180, 268 188 L 262 165 Z" />
            </ZonaAnatomica>

            {/* NERVIO CIÁTICO (Emergiendo por debajo del piriforme) */}
            <ZonaAnatomica id="nervio_ciatico" afectacion={getAfect('nervio_ciatico')} onRegionToggle={onRegionToggle} label="Nervio Ciático">
              <path d="M 148 120 C 135 150, 118 200, 115 390" stroke="#eab308" strokeWidth="4" strokeLinecap="round" fill="none" style={{ pointerEvents: 'all' }} />
              <path d="M 192 120 C 205 150, 222 200, 225 390" stroke="#eab308" strokeWidth="4" strokeLinecap="round" fill="none" style={{ pointerEvents: 'all' }} />
            </ZonaAnatomica>
          </g>
        )}
      </svg>
    </div>
  );
}