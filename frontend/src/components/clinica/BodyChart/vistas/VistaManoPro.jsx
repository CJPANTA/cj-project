// src/components/clinica/BodyChart/vistas/VistaManoPro.jsx
import React from 'react';

// ==========================================
// ESTRUCTURA ANATÓMICA DETALLADA DE LA MANO
// ==========================================
const ESTRUCTURA_MANO = {
  radio_cubito: [
    { id: 'radio', nombre: 'Radio (Extremo Distal y Apófisis Estiloides)', zona: 'Antebrazo Distal' },
    { id: 'cubito', nombre: 'Cúbito / Ulna (Apófisis Estiloides)', zona: 'Antebrazo Distal' }
  ],
  carpo_proximal: [
    { id: 'escafoides', nombre: 'Escafoides (Scaphoid)', zona: 'Carpo Fila Proximal' },
    { id: 'semilunar', nombre: 'Semilunar (Lunate)', zona: 'Carpo Fila Proximal' },
    { id: 'piramidal', nombre: 'Piramidal (Triquetrum)', zona: 'Carpo Fila Proximal' },
    { id: 'pisiforme', nombre: 'Pisiforme (Pisiform)', zona: 'Carpo Fila Proximal' }
  ],
  carpo_distal: [
    { id: 'trapecio', nombre: 'Trapecio (Trapezium)', zona: 'Carpo Fila Distal' },
    { id: 'trapezoide', nombre: 'Trapezoide (Trapezoid)', zona: 'Carpo Fila Distal' },
    { id: 'grande', nombre: 'Hueso Grande (Capitate)', zona: 'Carpo Fila Distal' },
    { id: 'ganchoso', nombre: 'Hueso Ganchoso (Hamate)', zona: 'Carpo Fila Distal' }
  ],
  metacarpo: [
    { id: 'metacarpiano_1', nombre: '1er Metacarpiano (Pulgar)', zona: 'Metacarpo' },
    { id: 'metacarpiano_2', nombre: '2º Metacarpiano (Índice)', zona: 'Metacarpo' },
    { id: 'metacarpiano_3', nombre: '3er Metacarpiano (Medio)', zona: 'Metacarpo' },
    { id: 'metacarpiano_4', nombre: '4º Metacarpiano (Anular)', zona: 'Metacarpo' },
    { id: 'metacarpiano_5', nombre: '5º Metacarpiano (Meñique)', zona: 'Metacarpo' }
  ],
  falanges_pulgar: [
    { id: 'pulgar_falange_prox', nombre: 'Pulgar: Falange Proximal', zona: 'Dedos' },
    { id: 'pulgar_falange_dist', nombre: 'Pulgar: Falange Distal', zona: 'Dedos' }
  ],
  falanges_dedos: [
    { id: 'dedo_2_falanges', nombre: '2º Dedo (Índice): Proximal, Media, Distal', zona: 'Dedos' },
    { id: 'dedo_3_falanges', nombre: '3er Dedo (Medio): Proximal, Media, Distal', zona: 'Dedos' },
    { id: 'dedo_4_falanges', nombre: '4º Dedo (Anular): Proximal, Media, Distal', zona: 'Dedos' },
    { id: 'dedo_5_falanges', nombre: '5º Dedo (Meñique): Proximal, Media, Distal', zona: 'Dedos' }
  ],
  palmar: [
    { id: 'eminencia_tenar', nombre: 'Eminencia Tenar', zona: 'Superficie Palmar' },
    { id: 'eminencia_hipotenar', nombre: 'Eminencia Hipotenar', zona: 'Superficie Palmar' },
    { id: 'tunel_carpo', nombre: 'Túnel del Carpo / Retináculo Flexor', zona: 'Superficie Palmar' },
    { id: 'almohadillas_palmares', nombre: 'Almohadillas Metacarpofalángicas Palmares', zona: 'Superficie Palmar' },
    { id: 'pulpejos_digitales', nombre: 'Pulpejos Digitales (1º al 5º Dedo)', zona: 'Superficie Palmar' },
    { id: 'nervio_mediano', nombre: 'Nervio Mediano', zona: 'Estructuras Nerviosas Palmares' },
    { id: 'nervio_cubital', nombre: 'Nervio Cubital / Canal de Guyon', zona: 'Estructuras Nerviosas Palmares' },
    { id: 'tendones_flexores', nombre: 'Tendones Flexores (FDS / FDP)', zona: 'Tendones Palmares' },
    { id: 'lcc_pulgar', nombre: 'Ligamento Colateral Cubital (LCC Pulgar)', zona: 'Ligamentos Palmares' }
  ],
  dorsal_estructuras: [
    { id: 'retinaculo_extensor', nombre: 'Retináculo Extensor de la Muñeca', zona: 'Estructuras Dorsales' },
    { id: 'tendones_extensores', nombre: 'Tendones Extensores (EDC / EIP / EDM)', zona: 'Estructuras Dorsales' }
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
            filter: afectacion ? `drop-shadow(0 0 6px ${afectacion.color})` : undefined
          },
          className: [
            'hueso-mano',
            afectacion ? 'selected' : '',
            child.props.className || '',
          ].filter(Boolean).join(' '),
        });
      })}
    </g>
  );
};

export default function VistaManoPro({ cara = 'dorsal', lado = 'derecho', afectaciones = {}, onRegionToggle }) {
  const esDerecho = lado === 'derecho' || lado === 'derecha';
  const getAfectacion = (id) => afectaciones[id];

  return (
    <div className="flex w-full flex-col items-center">
      <h4 className="mb-2 text-xs sm:text-sm font-black tracking-wider text-[#22d3ee] font-mono uppercase text-center">
        Mano {lado === 'izquierdo' || lado === 'izquierda' ? 'Izquierda' : 'Derecha'} — {cara === 'dorsal' ? 'Vista Ósea Anatómica (Dorsal)' : 'Vista Palmar (Tejidos Blandos & Nervios)'}
      </h4>

      <svg viewBox="0 0 340 480" width="100%" height="100%" className="h-full w-full max-w-xl touch-manipulation select-none">
        <style>{`
          .hueso-base { fill: #09131f; stroke: #334155; stroke-width: 1.2; stroke-linejoin: round; }
          .hueso-mano { fill: #1e293b; stroke: #475569; stroke-width: 1.2; stroke-linejoin: round; transition: all 150ms ease; cursor: pointer; }
          .hueso-mano:hover { fill: #085a75; stroke: #38bdf8; stroke-width: 1.8; filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.5)); }
          .zona-interactiva:focus-visible .hueso-mano { stroke: #ffffff !important; stroke-width: 2.5 !important; }
          .linea-referencia { fill: none; stroke: #64748b; stroke-width: 1; stroke-dasharray: 2 2; pointer-events: none; }
          .etiqueta-mano { fill: #94a3b8; font-size: 8px; font-family: monospace; font-weight: 700; transition: fill 200ms; }
          .etiqueta-activa { fill: #22d3ee; font-size: 9px; filter: drop-shadow(0 0 4px rgba(34, 211, 238, 0.6)); }
        `}</style>

        {cara === 'dorsal' ? (
          <g transform={esDerecho ? 'translate(340 0) scale(-1 1)' : undefined}>
            <path className="hueso-base" d="M 125 450 L 125 350 C 105 340 78 300 52 245 C 38 215 50 195 72 205 C 85 212 98 238 108 268 L 108 92 C 108 68 138 68 138 92 L 138 165 L 142 42 C 142 18 174 18 174 42 L 174 165 L 178 62 C 178 38 208 38 208 62 L 208 172 L 212 110 C 212 88 238 88 238 110 L 238 245 C 238 310 215 340 215 350 L 215 450 Z" />
            <ZonaAnatomica id="radio" afectacion={getAfectacion('radio')} onRegionToggle={onRegionToggle} label="Radio"><path d="M 130 355 L 130 445 L 175 445 L 175 360 C 160 354 142 352 130 355 Z" /></ZonaAnatomica>
            <ZonaAnatomica id="cubito" afectacion={getAfectacion('cubito')} onRegionToggle={onRegionToggle} label="Cúbito"><path d="M 185 360 L 185 445 L 210 445 L 210 368 C 202 362 192 360 185 360 Z" /></ZonaAnatomica>
            <ZonaAnatomica id="escafoides" afectacion={getAfectacion('escafoides')} onRegionToggle={onRegionToggle} label="Escafoides"><path d="M 134 325 C 126 329 126 341 136 345 C 146 347 154 339 149 329 Z" /></ZonaAnatomica>
            <ZonaAnatomica id="semilunar" afectacion={getAfectacion('semilunar')} onRegionToggle={onRegionToggle} label="Semilunar"><path d="M 152 327 C 150 339 166 345 174 341 C 180 335 176 325 164 323 Z" /></ZonaAnatomica>
            <ZonaAnatomica id="piramidal" afectacion={getAfectacion('piramidal')} onRegionToggle={onRegionToggle} label="Piramidal"><path d="M 178 327 C 176 337 190 345 198 339 C 202 333 198 325 186 323 Z" /></ZonaAnatomica>
            <ZonaAnatomica id="pisiforme" afectacion={getAfectacion('pisiforme')} onRegionToggle={onRegionToggle} label="Pisiforme"><circle cx="200" cy="333" r="6.5" /></ZonaAnatomica>
            <ZonaAnatomica id="trapecio" afectacion={getAfectacion('trapecio')} onRegionToggle={onRegionToggle} label="Trapecio"><path d="M 120 303 C 114 313 124 325 132 323 C 140 319 136 305 128 301 Z" /></ZonaAnatomica>
            <ZonaAnatomica id="trapezoide" afectacion={getAfectacion('trapezoide')} onRegionToggle={onRegionToggle} label="Trapezoide"><path d="M 134 301 C 132 313 146 321 152 315 C 156 307 150 299 140 299 Z" /></ZonaAnatomica>
            <ZonaAnatomica id="grande" afectacion={getAfectacion('grande')} onRegionToggle={onRegionToggle} label="Hueso Grande"><path d="M 154 295 C 150 311 170 321 178 309 C 182 297 172 289 160 289 Z" /></ZonaAnatomica>
            <ZonaAnatomica id="ganchoso" afectacion={getAfectacion('ganchoso')} onRegionToggle={onRegionToggle} label="Hueso Ganchoso"><path d="M 180 297 C 176 311 196 319 202 307 C 206 295 196 291 184 291 Z" /></ZonaAnatomica>
            <ZonaAnatomica id="metacarpiano_1" afectacion={getAfectacion('metacarpiano_1')} onRegionToggle={onRegionToggle} label="1er Metacarpiano (Pulgar)"><path d="M 82 250 L 115 295 L 125 285 L 94 238 Z" /></ZonaAnatomica>
            <ZonaAnatomica id="metacarpiano_2" afectacion={getAfectacion('metacarpiano_2')} onRegionToggle={onRegionToggle} label="2º Metacarpiano (Índice)"><path d="M 118 190 L 130 293 L 140 293 L 131 190 Z" /></ZonaAnatomica>
            <ZonaAnatomica id="metacarpiano_3" afectacion={getAfectacion('metacarpiano_3')} onRegionToggle={onRegionToggle} label="3er Metacarpiano (Medio)"><path d="M 151 172 L 151 287 L 165 287 L 165 172 Z" /></ZonaAnatomica>
            <ZonaAnatomica id="metacarpiano_4" afectacion={getAfectacion('metacarpiano_4')} onRegionToggle={onRegionToggle} label="4º Metacarpiano (Anular)"><path d="M 186 182 L 171 291 L 182 291 L 199 182 Z" /></ZonaAnatomica>
            <ZonaAnatomica id="metacarpiano_5" afectacion={getAfectacion('metacarpiano_5')} onRegionToggle={onRegionToggle} label="5º Metacarpiano (Meñique)"><path d="M 218 208 L 186 293 L 198 293 L 230 208 Z" /></ZonaAnatomica>
            <ZonaAnatomica id="pulgar_falange_prox" afectacion={getAfectacion('pulgar_falange_prox')} onRegionToggle={onRegionToggle} label="Falange Prox. Pulgar"><path d="M 60 216 L 84 242 L 94 232 L 70 206 Z" /></ZonaAnatomica>
            <ZonaAnatomica id="pulgar_falange_dist" afectacion={getAfectacion('pulgar_falange_dist')} onRegionToggle={onRegionToggle} label="Falange Distal Pulgar"><path d="M 46 198 C 40 206 50 218 62 212 L 70 200 L 54 186 Z" /></ZonaAnatomica>
            <ZonaAnatomica id="dedo_2_falanges" afectacion={getAfectacion('dedo_2_falanges')} onRegionToggle={onRegionToggle} label="Falanges 2º Dedo"><path d="M 117 145 L 115 186 L 131 186 L 128 145 Z" /><path d="M 116 105 L 117 140 L 128 140 L 126 105 Z" /><path d="M 115 76 C 110 82 112 102 125 102 C 131 94 129 78 115 76 Z" /></ZonaAnatomica>
            <ZonaAnatomica id="dedo_3_falanges" afectacion={getAfectacion('dedo_3_falanges')} onRegionToggle={onRegionToggle} label="Falanges 3er Dedo"><path d="M 149 128 L 149 168 L 164 168 L 164 128 Z" /><path d="M 149 78 L 149 123 L 164 123 L 164 78 Z" /><path d="M 148 26 C 139 33 141 73 164 73 C 171 58 167 33 148 26 Z" /></ZonaAnatomica>
            <ZonaAnatomica id="dedo_4_falanges" afectacion={getAfectacion('dedo_4_falanges')} onRegionToggle={onRegionToggle} label="Falanges 4º Dedo"><path d="M 185 138 L 183 178 L 199 178 L 196 138 Z" /><path d="M 186 94 L 185 133 L 196 133 L 194 94 Z" /><path d="M 185 49 C 177 56 179 89 195 89 C 202 79 200 54 185 49 Z" /></ZonaAnatomica>
            <ZonaAnatomica id="dedo_5_falanges" afectacion={getAfectacion('dedo_5_falanges')} onRegionToggle={onRegionToggle} label="Falanges 5º Dedo"><path d="M 215 168 L 213 204 L 227 204 L 223 168 Z" /><path d="M 216 133 L 215 163 L 223 163 L 221 133 Z" /><path d="M 216 98 C 209 104 211 128 222 128 C 228 118 226 102 216 98 Z" /></ZonaAnatomica>
            <ZonaAnatomica id="tendones_extensores" afectacion={getAfectacion('tendones_extensores')} onRegionToggle={onRegionToggle} label="Tendones Extensores"><path d="M 122 285 L 60 216" stroke="#94a3b8" strokeWidth="2.5" strokeDasharray="3 2" fill="none" style={{ pointerEvents: 'all' }} /><path d="M 135 293 L 122 80" stroke="#94a3b8" strokeWidth="2.5" strokeDasharray="3 2" fill="none" style={{ pointerEvents: 'all' }} /><path d="M 158 287 L 156 35" stroke="#94a3b8" strokeWidth="2.5" strokeDasharray="3 2" fill="none" style={{ pointerEvents: 'all' }} /><path d="M 176 291 L 190 55" stroke="#94a3b8" strokeWidth="2.5" strokeDasharray="3 2" fill="none" style={{ pointerEvents: 'all' }} /><path d="M 192 293 L 219 105" stroke="#94a3b8" strokeWidth="2.5" strokeDasharray="3 2" fill="none" style={{ pointerEvents: 'all' }} /></ZonaAnatomica>
            <ZonaAnatomica id="retinaculo_extensor" afectacion={getAfectacion('retinaculo_extensor')} onRegionToggle={onRegionToggle} label="Retináculo Extensor"><rect x="125" y="340" width="90" height="20" rx="4" style={{ fill: 'rgba(34, 211, 238, 0.25)', stroke: '#22d3ee', strokeWidth: 1.5, pointerEvents: 'all' }} /></ZonaAnatomica>
          </g>
        ) : (
          <g transform={esDerecho ? 'translate(340 0) scale(-1 1)' : undefined}>
            <path className="hueso-base" d="M 125 450 L 125 350 C 105 340 78 300 52 245 C 38 215 50 195 72 205 C 85 212 98 238 108 268 L 108 92 C 108 68 138 68 138 92 L 138 165 L 142 42 C 142 18 174 18 174 42 L 174 165 L 178 62 C 178 38 208 38 208 62 L 208 172 L 212 110 C 212 88 238 88 238 110 L 238 245 C 238 310 215 340 215 350 L 215 450 Z" />
            <ZonaAnatomica id="eminencia_tenar" afectacion={getAfectacion('eminencia_tenar')} onRegionToggle={onRegionToggle} label="Eminencia Tenar"><path d="M 108 268 C 85 240, 88 320, 142 345 C 152 320, 138 280, 108 268 Z" /></ZonaAnatomica>
            <ZonaAnatomica id="eminencia_hipotenar" afectacion={getAfectacion('eminencia_hipotenar')} onRegionToggle={onRegionToggle} label="Eminencia Hipotenar"><path d="M 162 345 C 205 320, 222 250, 202 235 C 182 245, 162 290, 162 345 Z" /></ZonaAnatomica>
            <ZonaAnatomica id="tendones_flexores" afectacion={getAfectacion('tendones_flexores')} onRegionToggle={onRegionToggle} label="Tendones Flexores"><path d="M 148 440 L 148 212 L 62 205" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 2" fill="none" style={{ pointerEvents: 'all' }} /><path d="M 154 440 L 154 210 L 123 80" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 2" fill="none" style={{ pointerEvents: 'all' }} /><path d="M 160 440 L 160 210 L 158 35" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 2" fill="none" style={{ pointerEvents: 'all' }} /><path d="M 166 440 L 166 210 L 193 55" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 2" fill="none" style={{ pointerEvents: 'all' }} /><path d="M 172 440 L 172 210 L 225 105" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 2" fill="none" style={{ pointerEvents: 'all' }} /></ZonaAnatomica>
            <ZonaAnatomica id="tunel_carpo" afectacion={getAfectacion('tunel_carpo')} onRegionToggle={onRegionToggle} label="Túnel del Carpo / Retináculo Flexor"><rect x="137" y="335" width="45" height="28" rx="6" style={{ fill: '#334155', stroke: '#38bdf8' }} /></ZonaAnatomica>
            <ZonaAnatomica id="nervio_mediano" afectacion={getAfectacion('nervio_mediano')} onRegionToggle={onRegionToggle} label="Nervio Mediano"><path d="M 152 440 L 152 320 C 152 280, 135 240, 123 90 M 152 260 L 158 45 M 152 260 L 190 70 M 152 270 L 62 205" stroke="#eab308" strokeWidth="3" strokeLinecap="round" fill="none" style={{ pointerEvents: 'all' }} /></ZonaAnatomica>
            <ZonaAnatomica id="nervio_cubital" afectacion={getAfectacion('nervio_cubital')} onRegionToggle={onRegionToggle} label="Nervio Cubital"><path d="M 195 440 L 195 330 C 195 280, 205 240, 225 115 M 195 250 L 193 65" stroke="#eab308" strokeWidth="3" strokeLinecap="round" fill="none" style={{ pointerEvents: 'all' }} /></ZonaAnatomica>
            <ZonaAnatomica id="lcc_pulgar" afectacion={getAfectacion('lcc_pulgar')} onRegionToggle={onRegionToggle} label="Ligamento Colateral Cubital Pulgar"><path d="M 72 205 L 85 218 L 78 225 Z" style={{ fill: '#f87171', stroke: '#ef4444', strokeWidth: 1.2, pointerEvents: 'all' }} /></ZonaAnatomica>
            <ZonaAnatomica id="almohadillas_palmares" afectacion={getAfectacion('almohadillas_palmares')} onRegionToggle={onRegionToggle} label="Almohadillas Metacarpofalángicas"><path d="M 112 210 C 122 195, 218 195, 232 220 C 212 245, 127 245, 112 210 Z" /></ZonaAnatomica>
            <ZonaAnatomica id="pulpejos_digitales" afectacion={getAfectacion('pulpejos_digitales')} onRegionToggle={onRegionToggle} label="Pulpejos Digitales"><path d="M 46 198 C 40 206 50 218 62 212 L 70 200 L 54 186 Z" /><path d="M 115 76 C 110 82 112 102 125 102 C 131 94 129 78 115 76 Z" /><path d="M 148 26 C 139 33 141 73 164 73 C 171 58 167 33 148 26 Z" /><path d="M 185 49 C 177 56 179 89 195 89 C 202 79 200 54 185 49 Z" /><path d="M 216 98 C 209 104 211 128 222 128 C 228 118 226 102 216 98 Z" /></ZonaAnatomica>
          </g>
        )}
      </svg>
    </div>
  );
}