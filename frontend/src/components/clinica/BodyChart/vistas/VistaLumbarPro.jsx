// src/components/clinica/BodyChart/vistas/VistaLumbarPro.jsx
import React from 'react';

// ==========================================
// PALETA BASE PARA MÚSCULOS
// ==========================================
const COLORES_MUSCULARES = {
  erector_espinal_izq: '#2d4355',
  erector_espinal_der: '#2d4355',
  cuadrado_lumbar_izq: '#3b5064',
  cuadrado_lumbar_der: '#3b5064',
  multifidos: '#1e3a4d',
  gluteo_mayor_izq: '#2a475a',
  gluteo_mayor_der: '#2a475a',
  gluteo_medio_izq: '#354f63',
  gluteo_medio_der: '#354f63',
  psoas_izq: '#384f63',
  psoas_der: '#384f63',
  iliaco_izq: '#263f54',
  iliaco_der: '#263f54',
};

const IDS_MUSCULARES = new Set(Object.keys(COLORES_MUSCULARES));

export const ESTRUCTURA_LUMBAR = {
  vertebras: [
    { id: 'l1', nombre: 'Vértebra L1', zona: 'Columna Lumbar' },
    { id: 'l2', nombre: 'Vértebra L2', zona: 'Columna Lumbar' },
    { id: 'l3', nombre: 'Vértebra L3', zona: 'Columna Lumbar' },
    { id: 'l4', nombre: 'Vértebra L4', zona: 'Columna Lumbar' },
    { id: 'l5', nombre: 'Vértebra L5', zona: 'Columna Lumbar' },
    { id: 'sacro', nombre: 'Sacro', zona: 'Complejo Pélvico' },
    { id: 'coccix', nombre: 'Cóccix', zona: 'Complejo Pélvico' },
  ],
  articulaciones: [
    { id: 'disco_l1_l2', nombre: 'Disco L1-L2', zona: 'Discos Intervertebrales' },
    { id: 'disco_l2_l3', nombre: 'Disco L2-L3', zona: 'Discos Intervertebrales' },
    { id: 'disco_l3_l4', nombre: 'Disco L3-L4', zona: 'Discos Intervertebrales' },
    { id: 'disco_l4_l5', nombre: 'Disco L4-L5', zona: 'Discos Intervertebrales' },
    { id: 'disco_l5_s1', nombre: 'Disco L5-S1', zona: 'Discos Intervertebrales' },
    { id: 'faceta_l4_l5', nombre: 'Articulación Facetaria L4-L5', zona: 'Facetarias' },
    { id: 'faceta_l5_s1', nombre: 'Articulación Facetaria L5-S1', zona: 'Facetarias' },
    { id: 'si_izq', nombre: 'Articulación Sacroilíaca Izquierda', zona: 'Cintura Pélvica' },
    { id: 'si_der', nombre: 'Articulación Sacroilíaca Derecha', zona: 'Cintura Pélvica' },
  ],
  musculos_posteriores: [
    { id: 'erector_espinal_izq', nombre: 'Erector Espinal Izquierdo', zona: 'Espalda Baja' },
    { id: 'erector_espinal_der', nombre: 'Erector Espinal Derecho', zona: 'Espalda Baja' },
    { id: 'cuadrado_lumbar_izq', nombre: 'Cuadrado Lumbar Izquierdo', zona: 'Pared Posterior' },
    { id: 'cuadrado_lumbar_der', nombre: 'Cuadrado Lumbar Derecho', zona: 'Pared Posterior' },
    { id: 'multifidos', nombre: 'Músculos Multífidos', zona: 'Profundos' },
    { id: 'gluteo_mayor_izq', nombre: 'Glúteo Mayor Izquierdo', zona: 'Región Glútea' },
    { id: 'gluteo_mayor_der', nombre: 'Glúteo Mayor Derecho', zona: 'Región Glútea' },
    { id: 'gluteo_medio_izq', nombre: 'Glúteo Medio Izquierdo', zona: 'Región Glútea' },
    { id: 'gluteo_medio_der', nombre: 'Glúteo Medio Derecho', zona: 'Región Glútea' },
  ],
  musculos_anteriores: [
    { id: 'psoas_izq', nombre: 'Psoas Mayor Izquierdo', zona: 'Compartimento Anterior' },
    { id: 'psoas_der', nombre: 'Psoas Mayor Derecho', zona: 'Compartimento Anterior' },
    { id: 'iliaco_izq', nombre: 'Músculo Ilíaco Izquierdo', zona: 'Fosa Ilíaca' },
    { id: 'iliaco_der', nombre: 'Músculo Ilíaco Derecho', zona: 'Fosa Ilíaca' },
  ],
  nervios: [
    { id: 'raiz_l1', nombre: 'Raíz Nerviosa L1', zona: 'Inervación' },
    { id: 'raiz_l2', nombre: 'Raíz Nerviosa L2', zona: 'Inervación' },
    { id: 'raiz_l3', nombre: 'Raíz Nerviosa L3', zona: 'Inervación' },
    { id: 'raiz_l4', nombre: 'Raíz Nerviosa L4', zona: 'Inervación' },
    { id: 'raiz_l5', nombre: 'Raíz Nerviosa L5', zona: 'Inervación' },
    { id: 'raiz_s1', nombre: 'Raíz Nerviosa S1', zona: 'Inervación' },
    { id: 'nervios_cluneos', nombre: 'Nervios Clúneos Superiores', zona: 'Inervación' },
    { id: 'nervio_ciatico_izq', nombre: 'Nervio Ciático Izquierdo', zona: 'Inervación' },
    { id: 'nervio_ciatico_der', nombre: 'Nervio Ciático Derecho', zona: 'Inervación' },
    { id: 'aorta', nombre: 'Aorta Abdominal', zona: 'Vascular' },
    { id: 'vena_cava', nombre: 'Vena Cava Inferior', zona: 'Vascular' },
  ]
};

// ==========================================
// SUBCOMPONENTES
// ==========================================
const ZonaAnatomica = ({ id, afectacion, onRegionToggle, children, label }) => {
  const esMusculo = IDS_MUSCULARES.has(id);
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
      className={['zona-interactiva cursor-pointer focus:outline-none', esMusculo ? 'zona-musculo' : '', afectacion ? 'is-selected' : ''].filter(Boolean).join(' ')}
      style={colorBase ? { '--color-base': colorBase } : undefined}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;

        const clase = child.props.className || '';
        const esLineaNerviosa = clase.includes('trazo-nervio') || clase.includes('trazo-hit');
        const esAreaDeClic = clase.includes('trazo-hit');
        const estiloOriginal = child.props.style || {};

        return React.cloneElement(child, {
          style: {
            ...estiloOriginal,
            ...(afectacion && !esAreaDeClic
              ? {
                  stroke: afectacion.border || '#22d3ee',
                  fill: estiloOriginal.fill === 'none' ? 'none' : (afectacion.color || '#22d3ee'),
                  filter: 'drop-shadow(0 0 6px #22d3ee)',
                }
              : {}),
          },
          className: [esLineaNerviosa ? '' : 'hueso-lumbar', clase].filter(Boolean).join(' '),
        });
      })}
    </g>
  );
};

function VertebraLumbar({ id, numero, y, afectacion, onRegionToggle }) {
  return (
    <ZonaAnatomica id={id} afectacion={afectacion} onRegionToggle={onRegionToggle} label={`Vértebra lumbar L${numero}`}>
      <path className="detalle-vertebra" d={`M 151 ${y + 8} L 137 ${y + 4} L 132 ${y + 8} L 151 ${y + 17} Z`} />
      <path className="detalle-vertebra" d={`M 189 ${y + 8} L 203 ${y + 4} L 208 ${y + 8} L 189 ${y + 17} Z`} />
      <path className="cuerpo-vertebral" d={`M 153 ${y + 2} Q 170 ${y - 2} 187 ${y + 2} L 190 ${y + 21} Q 170 ${y + 26} 150 ${y + 21} Z`} />
      <path className="detalle-vertebra" d={`M 155 ${y + 18} L 160 ${y + 10} L 170 ${y + 8} L 180 ${y + 10} L 185 ${y + 18} L 178 ${y + 22} L 170 ${y + 20} L 162 ${y + 22} Z`} />
      <path className="detalle-vertebra" d={`M 166 ${y + 19} L 170 ${y + 29} L 174 ${y + 19} Z`} />
    </ZonaAnatomica>
  );
}

function NervioLumbar({ id, afectacion, onRegionToggle, label, paths, color = '#c084fc', dash }) {
  return (
    <ZonaAnatomica id={id} afectacion={afectacion} onRegionToggle={onRegionToggle} label={label}>
      {paths.flatMap((d, index) => [
        <path key={`hit-${index}`} className="trazo-hit" d={d} />,
        <path key={`nervio-${index}`} className="trazo-nervio" d={d} style={{ stroke: color, fill: 'none', strokeDasharray: dash }} />
      ])}
    </ZonaAnatomica>
  );
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
export default function VistaLumbarPro({
  cara = 'posterior',
  lado = 'derecho',
  afectaciones = {},
  onRegionToggle,
}) {
  const esDerecho = lado === 'derecho' || lado === 'derecha';
  const getAfect = (id) => afectaciones[id];

  return (
    <div className="flex w-full flex-col items-center">
      <h4 className="mb-2 text-xs sm:text-sm font-black tracking-wider text-[#22d3ee] font-mono uppercase text-center">
        Región Lumbar & Pélvica — {cara === 'posterior' ? 'Vista Posterior (Músculos y Raíces)' : 'Vista Anterior (Psoas y Vasos)'}
      </h4>

      <svg
        viewBox="0 0 340 440"
        width="100%"
        height="100%"
        className="h-full w-full max-w-full object-contain scale-110 touch-manipulation select-none drop-shadow-xl"
      >
        <style>{`
          .hueso-base { fill: #0b1622; stroke: #526174; stroke-width: 1.4; stroke-linejoin: round; }
          .hueso-lumbar { fill: #253447; stroke: #8292a6; stroke-width: 1.1; stroke-linejoin: round; transition: all 150ms ease; cursor: pointer; }
          .zona-musculo .hueso-lumbar { fill: var(--color-base, #354b60); fill-opacity: 0.82; stroke: #73869a; }
          .cuerpo-vertebral { fill: #35485d; stroke: #a3b2c2; stroke-width: 1.2; }
          .detalle-vertebra { fill: #26394d; stroke: #8fa0b3; stroke-width: 1.1; stroke-linejoin: round; }
          .disco-inter { fill: #0e7490; fill-opacity: 0.55; stroke: #22d3ee; stroke-width: 1; }
          .zona-interactiva:hover .hueso-lumbar { stroke: #38bdf8; filter: drop-shadow(0 0 3px rgba(56, 189, 248, 0.35)); }
          .trazo-nervio { fill: none; stroke-width: 0.9; stroke-linecap: round; stroke-linejoin: round; vector-effect: non-scaling-stroke; pointer-events: none; transition: all 150ms ease; }
          .trazo-hit { fill: none; stroke: transparent; stroke-width: 11; stroke-linecap: round; pointer-events: stroke; cursor: pointer; vector-effect: non-scaling-stroke; }
          .zona-interactiva:hover .trazo-nervio, .zona-interactiva.is-selected .trazo-nervio { stroke-width: 1.4; filter: drop-shadow(0 0 3px currentColor); }
          .faceta { fill: #a855f7; fill-opacity: 0.55; stroke: #d8b4fe; stroke-width: 1; }
          .zona-interactiva:focus-visible .hueso-lumbar, .zona-interactiva:focus-visible .trazo-nervio { stroke: #fff; stroke-width: 2; }
        `}</style>

        {cara === 'posterior' ? (
          <g transform={esDerecho ? 'translate(340 0) scale(-1 1)' : undefined}>
            {/* Silueta posterior: cintura y pelvis */}
            <path className="hueso-base" d="M 94 20 C 116 16 143 18 170 20 C 197 18 224 16 246 20 C 270 57 279 105 268 151 C 260 181 250 211 252 244 C 255 276 278 304 276 333 C 273 374 235 411 170 424 C 105 411 67 374 64 333 C 62 304 85 276 88 244 C 90 211 80 181 72 151 C 61 105 70 57 94 20 Z" />

            {/* Músculos Glúteos */}
            <ZonaAnatomica id="gluteo_medio_izq" afectacion={getAfect('gluteo_medio_izq')} onRegionToggle={onRegionToggle} label="Glúteo medio izquierdo">
              <path d="M 96 278 C 116 263 143 268 157 289 L 151 328 L 94 323 Z" />
            </ZonaAnatomica>
            <ZonaAnatomica id="gluteo_medio_der" afectacion={getAfect('gluteo_medio_der')} onRegionToggle={onRegionToggle} label="Glúteo medio derecho">
              <path d="M 244 278 C 224 263 197 268 183 289 L 189 328 L 246 323 Z" />
            </ZonaAnatomica>
            <ZonaAnatomica id="gluteo_mayor_izq" afectacion={getAfect('gluteo_mayor_izq')} onRegionToggle={onRegionToggle} label="Glúteo mayor izquierdo">
              <path d="M 91 322 C 112 315 143 326 163 350 L 160 405 C 124 405 91 384 76 354 Z" />
            </ZonaAnatomica>
            <ZonaAnatomica id="gluteo_mayor_der" afectacion={getAfect('gluteo_mayor_der')} onRegionToggle={onRegionToggle} label="Glúteo mayor derecho">
              <path d="M 249 322 C 228 315 197 326 177 350 L 180 405 C 216 405 249 384 264 354 Z" />
            </ZonaAnatomica>

            {/* Cuadrado Lumbar */}
            <ZonaAnatomica id="cuadrado_lumbar_izq" afectacion={getAfect('cuadrado_lumbar_izq')} onRegionToggle={onRegionToggle} label="Cuadrado lumbar izquierdo">
              <path d="M 104 117 C 120 111 137 115 145 125 L 145 241 C 128 249 111 245 99 235 Z" />
            </ZonaAnatomica>
            <ZonaAnatomica id="cuadrado_lumbar_der" afectacion={getAfect('cuadrado_lumbar_der')} onRegionToggle={onRegionToggle} label="Cuadrado lumbar derecho">
              <path d="M 236 117 C 220 111 203 115 195 125 L 195 241 C 212 249 229 245 241 235 Z" />
            </ZonaAnatomica>

            {/* Erectores Espinales */}
            <ZonaAnatomica id="erector_espinal_izq" afectacion={getAfect('erector_espinal_izq')} onRegionToggle={onRegionToggle} label="Erector espinal izquierdo">
              <path d="M 143 58 C 131 91 134 149 139 226 L 157 237 C 159 177 158 102 160 59 Z" />
            </ZonaAnatomica>
            <ZonaAnatomica id="erector_espinal_der" afectacion={getAfect('erector_espinal_der')} onRegionToggle={onRegionToggle} label="Erector espinal derecho">
              <path d="M 197 58 C 209 91 206 149 201 226 L 183 237 C 181 177 182 102 180 59 Z" />
            </ZonaAnatomica>

            {/* Multífidos */}
            <ZonaAnatomica id="multifidos" afectacion={getAfect('multifidos')} onRegionToggle={onRegionToggle} label="Músculos multífidos">
              <path d="M 158 75 C 151 111 153 181 160 237 L 170 247 L 180 237 C 187 181 189 111 182 75 Z" />
            </ZonaAnatomica>

            {/* Discos Intervertebrales */}
            {[{ id: 'disco_l1_l2', y: 99 }, { id: 'disco_l2_l3', y: 134 }, { id: 'disco_l3_l4', y: 169 }, { id: 'disco_l4_l5', y: 204 }, { id: 'disco_l5_s1', y: 239 }].map(({ id, y }) => (
              <ZonaAnatomica key={id} id={id} afectacion={getAfect(id)} onRegionToggle={onRegionToggle} label={id.replaceAll('_', ' ')}>
                <rect className="disco-inter" x="153" y={y} width="34" height="7" rx="3" />
              </ZonaAnatomica>
            ))}

            {/* Vértebras */}
            {[{ id: 'l1', numero: 1, y: 72 }, { id: 'l2', numero: 2, y: 107 }, { id: 'l3', numero: 3, y: 142 }, { id: 'l4', numero: 4, y: 177 }, { id: 'l5', numero: 5, y: 212 }].map(({ id, numero, y }) => (
              <VertebraLumbar key={id} id={id} numero={numero} y={y} afectacion={getAfect(id)} onRegionToggle={onRegionToggle} />
            ))}

            {/* Facetarias */}
            <ZonaAnatomica id="faceta_l4_l5" afectacion={getAfect('faceta_l4_l5')} onRegionToggle={onRegionToggle} label="Facetarias L4-L5">
              <circle className="faceta" cx="143" cy="209" r="4" />
              <circle className="faceta" cx="197" cy="209" r="4" />
            </ZonaAnatomica>
            <ZonaAnatomica id="faceta_l5_s1" afectacion={getAfect('faceta_l5_s1')} onRegionToggle={onRegionToggle} label="Facetarias L5-S1">
              <circle className="faceta" cx="143" cy="244" r="4" />
              <circle className="faceta" cx="197" cy="244" r="4" />
            </ZonaAnatomica>

            {/* Sacro y Cóccix */}
            <ZonaAnatomica id="sacro" afectacion={getAfect('sacro')} onRegionToggle={onRegionToggle} label="Sacro">
              <path d="M 145 253 Q 170 246 195 253 L 189 318 Q 170 337 151 318 Z" />
              <circle cx="160" cy="274" r="2" fill="#0b1622" />
              <circle cx="180" cy="274" r="2" fill="#0b1622" />
              <circle cx="158" cy="291" r="2" fill="#0b1622" />
              <circle cx="182" cy="291" r="2" fill="#0b1622" />
            </ZonaAnatomica>
            <ZonaAnatomica id="coccix" afectacion={getAfect('coccix')} onRegionToggle={onRegionToggle} label="Cóccix">
              <path d="M 165 329 L 175 329 L 177 348 L 170 357 L 163 348 Z" />
            </ZonaAnatomica>

            {/* Sacroilíacas */}
            <ZonaAnatomica id="si_izq" afectacion={getAfect('si_izq')} onRegionToggle={onRegionToggle} label="Sacroilíaca Izq">
              <path d="M 139 254 C 145 264 150 293 153 316" fill="none" stroke="#f472b6" strokeWidth="2" />
            </ZonaAnatomica>
            <ZonaAnatomica id="si_der" afectacion={getAfect('si_der')} onRegionToggle={onRegionToggle} label="Sacroilíaca Der">
              <path d="M 201 254 C 195 264 190 293 187 316" fill="none" stroke="#f472b6" strokeWidth="2" />
            </ZonaAnatomica>

            {/* Raíces Nerviosas */}
            {[{ id: 'raiz_l1', y: 83 }, { id: 'raiz_l2', y: 118 }, { id: 'raiz_l3', y: 153 }, { id: 'raiz_l4', y: 188 }, { id: 'raiz_l5', y: 223 }].map(({ id, y }) => (
              <NervioLumbar key={id} id={id} afectacion={getAfect(id)} onRegionToggle={onRegionToggle} label={`Raíz ${id.replace('raiz_', '').toUpperCase()}`} color="#c084fc" dash="2 2" paths={[`M 151 ${y} C 139 ${y + 1} 130 ${y + 8} 119 ${y + 15}`, `M 189 ${y} C 201 ${y + 1} 210 ${y + 8} 221 ${y + 15}`]} />
            ))}
            <NervioLumbar id="raiz_s1" afectacion={getAfect('raiz_s1')} onRegionToggle={onRegionToggle} label="Raíz S1" color="#c084fc" dash="2 2" paths={['M 151 258 C 137 266 128 277 119 291', 'M 189 258 C 203 266 212 277 221 291']} />
            <NervioLumbar id="nervios_cluneos" afectacion={getAfect('nervios_cluneos')} onRegionToggle={onRegionToggle} label="Nervios Clúneos" color="#a78bfa" dash="1 3" paths={['M 135 273 C 119 278 106 287 94 300', 'M 205 273 C 221 278 234 287 246 300']} />
            <NervioLumbar id="nervio_ciatico_izq" afectacion={getAfect('nervio_ciatico_izq')} onRegionToggle={onRegionToggle} label="Nervio Ciático Izq" color="#e9a8ff" paths={['M 145 307 C 132 326 124 350 116 380 C 111 397 108 411 105 423']} />
            <NervioLumbar id="nervio_ciatico_der" afectacion={getAfect('nervio_ciatico_der')} onRegionToggle={onRegionToggle} label="Nervio Ciático Der" color="#e9a8ff" paths={['M 195 307 C 208 326 216 350 224 380 C 229 397 232 411 235 423']} />
          </g>
        ) : (
          <g transform={esDerecho ? 'translate(340 0) scale(-1 1)' : undefined}>
            {/* Silueta Anterior */}
            <path className="hueso-base" d="M 94 20 C 116 16 143 18 170 20 C 197 18 224 16 246 20 C 270 57 279 105 268 151 C 260 181 250 211 252 244 C 255 276 278 304 276 333 C 273 374 235 411 170 424 C 105 411 67 374 64 333 C 62 304 85 276 88 244 C 90 211 80 181 72 151 C 61 105 70 57 94 20 Z" />

            {/* Psoas e Ilíaco */}
            <ZonaAnatomica id="psoas_izq" afectacion={getAfect('psoas_izq')} onRegionToggle={onRegionToggle} label="Psoas Mayor Izq">
              <path d="M 140 40 L 165 40 L 135 280 L 110 260 Z" />
            </ZonaAnatomica>
            <ZonaAnatomica id="psoas_der" afectacion={getAfect('psoas_der')} onRegionToggle={onRegionToggle} label="Psoas Mayor Der">
              <path d="M 200 40 L 175 40 L 205 280 L 230 260 Z" />
            </ZonaAnatomica>
            <ZonaAnatomica id="iliaco_izq" afectacion={getAfect('iliaco_izq')} onRegionToggle={onRegionToggle} label="Ilíaco Izq">
              <path d="M 100 150 C 80 180 80 220 110 260 L 135 280 L 130 200 Z" opacity="0.8" />
            </ZonaAnatomica>
            <ZonaAnatomica id="iliaco_der" afectacion={getAfect('iliaco_der')} onRegionToggle={onRegionToggle} label="Ilíaco Der">
              <path d="M 240 150 C 260 180 260 220 230 260 L 205 280 L 210 200 Z" opacity="0.8" />
            </ZonaAnatomica>

            {/* Vértebras Anteriores */}
            {[{ id: 'l1', numero: 1, y: 72 }, { id: 'l2', numero: 2, y: 107 }, { id: 'l3', numero: 3, y: 142 }, { id: 'l4', numero: 4, y: 177 }, { id: 'l5', numero: 5, y: 212 }].map(({ id, numero, y }) => (
              <VertebraLumbar key={`ant-${id}`} id={id} numero={numero} y={y} afectacion={getAfect(id)} onRegionToggle={onRegionToggle} />
            ))}

            {/* Sacro Anterior */}
            <ZonaAnatomica id="sacro" afectacion={getAfect('sacro')} onRegionToggle={onRegionToggle} label="Promontorio Sacro">
              <path d="M 150 245 L 190 245 L 180 330 L 160 330 Z" opacity="0.7" />
            </ZonaAnatomica>

            {/* Vasos Sanguíneos */}
            <ZonaAnatomica id="aorta" afectacion={getAfect('aorta')} onRegionToggle={onRegionToggle} label="Aorta Abdominal">
              <path d="M 185 20 C 185 100 175 180 170 240" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
              <path className="trazo-hit" d="M 185 20 C 185 100 175 180 170 240" />
            </ZonaAnatomica>
            <ZonaAnatomica id="vena_cava" afectacion={getAfect('vena_cava')} onRegionToggle={onRegionToggle} label="Vena Cava Inferior">
              <path d="M 155 20 C 155 100 165 180 170 240" fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
              <path className="trazo-hit" d="M 155 20 C 155 100 165 180 170 240" />
            </ZonaAnatomica>

          </g>
        )}
      </svg>
    </div>
  );
}