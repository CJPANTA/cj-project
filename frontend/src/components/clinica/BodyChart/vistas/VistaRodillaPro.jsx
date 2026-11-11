// src/components/clinica/BodyChart/vistas/VistaRodillaPro.jsx
import React from 'react';

export const ESTRUCTURA_RODILLA = {
  huesos: [
    { id: 'femur', nombre: 'Fémur distal (cóndilos)', zona: 'Huesos' },
    { id: 'rotula', nombre: 'Rótula', zona: 'Huesos' },
    { id: 'tibia', nombre: 'Tibia proximal (platillo tibial)', zona: 'Huesos' },
    { id: 'perone', nombre: 'Peroné proximal (cabeza)', zona: 'Huesos' },
  ],
  meniscos_ligamentos: [
    { id: 'menisco_med', nombre: 'Menisco medial', zona: 'Estructuras internas' },
    { id: 'menisco_lat', nombre: 'Menisco lateral', zona: 'Estructuras internas' },
    { id: 'lca', nombre: 'Ligamento cruzado anterior (LCA)', zona: 'Ligamentos' },
    { id: 'lcp', nombre: 'Ligamento cruzado posterior (LCP)', zona: 'Ligamentos' },
    { id: 'lcm', nombre: 'Ligamento colateral medial', zona: 'Ligamentos' },
    { id: 'lcl', nombre: 'Ligamento colateral lateral', zona: 'Ligamentos' },
  ],
  tendones_musculos: [
    { id: 'tendon_cuadriceps', nombre: 'Tendón del cuádriceps', zona: 'Tendones' },
    { id: 'tendon_patelar', nombre: 'Tendón patelar', zona: 'Tendones' },
    { id: 'cuadriceps', nombre: 'Cuádriceps distal', zona: 'Músculos' },
    { id: 'biceps_femoral', nombre: 'Bíceps femoral distal', zona: 'Isquiotibiales' },
    { id: 'semitendinoso', nombre: 'Semitendinoso distal', zona: 'Isquiotibiales' },
    { id: 'semi_membranoso', nombre: 'Semimembranoso distal', zona: 'Isquiotibiales' },
    { id: 'gemelo_med', nombre: 'Gastrocnemio medial', zona: 'Músculos' },
    { id: 'gemelo_lat', nombre: 'Gastrocnemio lateral', zona: 'Músculos' },
  ],
  nervios_vasos: [
    { id: 'nervio_ciatico', nombre: 'Nervio tibial (continuación del ciático)', zona: 'Inervación' },
    { id: 'nervio_peroneo', nombre: 'Nervio peroneo común', zona: 'Inervación' },
    { id: 'arteria_poplitea', nombre: 'Arteria poplítea', zona: 'Vascular' },
    { id: 'fosa_poplitea', nombre: 'Fosa poplítea', zona: 'Regiones' },
  ],
};

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
      className="zona-interactiva cursor-pointer focus:outline-none"
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;

        const estiloAfectacion = afectacion
          ? {
              fill: afectacion.color,
              stroke: afectacion.border,
              filter: afectacion.color ? `drop-shadow(0 0 6px ${afectacion.color})` : undefined,
            }
          : {};

        return React.cloneElement(child, {
          className: [
            'hueso-rodilla',
            afectacion ? 'selected' : '',
            child.props.className || '',
          ].filter(Boolean).join(' '),
          style: {
            ...child.props.style,
            ...estiloAfectacion,
          },
        });
      })}
    </g>
  );
};

export default function VistaRodillaPro({
  cara = 'anterior',
  lado = 'derecho',
  afectaciones = {},
  onRegionToggle,
}) {
  const esDerecho = lado === 'derecho' || lado === 'derecha';
  const ladoTexto = lado === 'izquierdo' || lado === 'izquierda' ? 'Izquierda' : 'Derecha';

  const reflejar = cara === 'anterior' ? esDerecho : !esDerecho;
  const getAfect = (id) => afectaciones?.[id];

  return (
    <div className="flex w-full flex-col items-center">
      <h4 className="mb-2 text-center font-mono text-xs font-black uppercase tracking-wider text-cyan-400 sm:text-sm">
        Rodilla {ladoTexto} — Vista {cara === 'anterior' ? 'anterior' : 'posterior'}
      </h4>

      {/* Se adaptó el className para que encaje perfecto en el contenedor */}
      <svg viewBox="0 0 340 400" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" className="h-full w-full max-w-full object-contain scale-115 touch-manipulation select-none drop-shadow-xl" role="img" aria-label={`Rodilla ${ladoTexto}, vista ${cara}`}>
        <style>{`
          .hueso-rodilla {
            fill: #1e293b;
            stroke: #64748b;
            stroke-width: 1.5;
            stroke-linejoin: round;
            transition: fill 150ms ease, stroke 150ms ease, filter 150ms ease;
          }

          .zona-interactiva:hover .hueso-rodilla {
            fill: #0c4a6e;
            stroke: #38bdf8;
            stroke-width: 2;
          }

          .zona-interactiva:focus-visible .hueso-rodilla {
            stroke: #ffffff;
            stroke-width: 2.5;
          }

          .detalle-anatomico {
            fill: none;
            stroke: #94a3b8;
            stroke-width: 1;
            stroke-linecap: round;
            stroke-linejoin: round;
            opacity: .55;
            pointer-events: none;
          }

          .linea-interna {
            fill: none;
            stroke: #c084fc;
            stroke-width: 5;
            stroke-linecap: round;
            stroke-linejoin: round;
            opacity: .45;
          }

          .tejido-blando {
            fill: #263449;
            stroke: #52657c;
            stroke-width: 1.4;
            stroke-linejoin: round;
          }
        `}</style>

        <g transform={reflejar ? 'translate(340 0) scale(-1 1)' : undefined}>
          {cara === 'anterior' ? (
            <>
              {/* Fémur distal */}
              <ZonaAnatomica id="femur" afectacion={getAfect('femur')} onRegionToggle={onRegionToggle} label="Fémur distal">
                <path d="M 128 20 C 132 66, 126 111, 112 146 C 105 163, 105 176, 117 185 C 130 194, 147 187, 158 175 C 164 169, 176 169, 182 175 C 193 188, 210 194, 223 185 C 235 176, 235 162, 228 146 C 214 111, 208 66, 212 20 Z" />
              </ZonaAnatomica>

              {/* Tibia proximal */}
              <ZonaAnatomica id="tibia" afectacion={getAfect('tibia')} onRegionToggle={onRegionToggle} label="Tibia proximal">
                <path d="M 108 207 C 124 198, 148 198, 164 202 L 170 207 L 176 202 C 192 198, 216 198, 232 207 L 221 235 L 211 380 L 129 380 L 119 235 Z" />
              </ZonaAnatomica>

              {/* Peroné proximal */}
              <ZonaAnatomica id="perone" afectacion={getAfect('perone')} onRegionToggle={onRegionToggle} label="Peroné proximal">
                <path d="M 241 218 C 249 213, 260 217, 264 226 C 267 235, 261 244, 252 246 L 247 281 L 235 321 L 227 318 L 235 274 L 235 245 C 229 237, 233 224, 241 218 Z" />
              </ZonaAnatomica>

              {/* Meniscos */}
              <ZonaAnatomica id="menisco_lat" afectacion={getAfect('menisco_lat')} onRegionToggle={onRegionToggle} label="Menisco lateral">
                <path d="M 112 190 C 125 184, 145 185, 160 194 L 155 204 C 139 199, 123 200, 112 196 Z" style={{ fill: '#713f8c', stroke: '#c084fc', opacity: 0.75 }} />
              </ZonaAnatomica>
              <ZonaAnatomica id="menisco_med" afectacion={getAfect('menisco_med')} onRegionToggle={onRegionToggle} label="Menisco medial">
                <path d="M 180 194 C 195 185, 215 184, 228 190 L 228 196 C 216 200, 200 199, 185 204 Z" style={{ fill: '#713f8c', stroke: '#c084fc', opacity: 0.75 }} />
              </ZonaAnatomica>

              {/* Ligamentos Cruzados */}
              <ZonaAnatomica id="lca" afectacion={getAfect('lca')} onRegionToggle={onRegionToggle} label="Ligamento cruzado anterior">
                <path d="M 151 181 L 174 202 L 169 209 L 145 187 Z" style={{ fill: '#6b3b82', stroke: '#c084fc', opacity: 0.75 }} />
              </ZonaAnatomica>
              <ZonaAnatomica id="lcp" afectacion={getAfect('lcp')} onRegionToggle={onRegionToggle} label="Ligamento cruzado posterior">
                <path d="M 188 181 L 165 203 L 170 210 L 194 187 Z" style={{ fill: '#6b3b82', stroke: '#c084fc', opacity: 0.75 }} />
              </ZonaAnatomica>

              {/* Ligamentos Colaterales */}
              <ZonaAnatomica id="lcl" afectacion={getAfect('lcl')} onRegionToggle={onRegionToggle} label="Ligamento colateral lateral">
                <path d="M 101 165 Q 91 185 105 222 L 113 219 Q 103 188 111 170 Z" />
              </ZonaAnatomica>
              <ZonaAnatomica id="lcm" afectacion={getAfect('lcm')} onRegionToggle={onRegionToggle} label="Ligamento colateral medial">
                <path d="M 229 165 Q 239 185 225 222 L 217 219 Q 227 188 219 170 Z" />
              </ZonaAnatomica>

              {/* Tendones y Músculos Anteriores */}
              <ZonaAnatomica id="tendon_cuadriceps" afectacion={getAfect('tendon_cuadriceps')} onRegionToggle={onRegionToggle} label="Tendón del cuádriceps">
                <path d="M 153 104 Q 170 99 187 104 L 181 145 Q 170 151 159 145 Z" />
              </ZonaAnatomica>
              <ZonaAnatomica id="cuadriceps" afectacion={getAfect('cuadriceps')} onRegionToggle={onRegionToggle} label="Cuádriceps distal">
                <path d="M 138 22 Q 170 15 202 22 L 194 91 Q 170 99 146 91 Z" />
              </ZonaAnatomica>
              <ZonaAnatomica id="tendon_patelar" afectacion={getAfect('tendon_patelar')} onRegionToggle={onRegionToggle} label="Tendón patelar">
                <path d="M 157 194 L 183 194 L 192 232 L 148 232 Z" />
              </ZonaAnatomica>

              {/* Rótula */}
              <ZonaAnatomica id="rotula" afectacion={getAfect('rotula')} onRegionToggle={onRegionToggle} label="Rótula">
                <path d="M 170 139 C 187 139 197 154 194 172 C 192 187 182 196 170 199 C 158 196 148 187 146 172 C 143 154 153 139 170 139 Z" />
              </ZonaAnatomica>

              <path className="detalle-anatomico" d="M 154 153 Q 170 146 186 153" />
              <path className="detalle-anatomico" d="M 155 177 Q 170 184 185 177" />
              <path className="detalle-anatomico" d="M 170 225 L 170 350" />
            </>
          ) : (
            <>
              {/* Fémur posterior */}
              <ZonaAnatomica id="femur" afectacion={getAfect('femur')} onRegionToggle={onRegionToggle} label="Fémur distal posterior">
                <path d="M 128 20 L 212 20 C 207 67 213 111 228 147 C 236 166 232 181 218 189 C 201 198 187 187 178 176 Q 170 168 162 176 C 151 188 136 198 120 189 C 106 181 102 166 112 147 C 127 111 133 67 128 20 Z" />
              </ZonaAnatomica>

              {/* Tibia y Peroné posterior */}
              <ZonaAnatomica id="tibia" afectacion={getAfect('tibia')} onRegionToggle={onRegionToggle} label="Tibia posterior">
                <path d="M 117 211 Q 145 201 170 209 Q 195 201 223 211 L 211 380 L 129 380 Z" />
              </ZonaAnatomica>
              <ZonaAnatomica id="perone" afectacion={getAfect('perone')} onRegionToggle={onRegionToggle} label="Peroné posterior">
                <path d="M 240 222 Q 254 214 261 226 L 251 284 L 235 326 L 229 322 L 240 274 Z" />
              </ZonaAnatomica>

              {/* Isquiotibiales */}
              <ZonaAnatomica id="biceps_femoral" afectacion={getAfect('biceps_femoral')} onRegionToggle={onRegionToggle} label="Bíceps femoral">
                <path d="M 232 25 C 227 68 218 111 211 145 Q 207 161 224 177 L 242 191 Q 253 169 246 145 C 240 111 252 67 261 28 Z" className="tejido-blando" />
              </ZonaAnatomica>
              <ZonaAnatomica id="semitendinoso" afectacion={getAfect('semitendinoso')} onRegionToggle={onRegionToggle} label="Semitendinoso">
                <path d="M 92 26 C 99 70 111 111 120 143 Q 127 161 146 174 L 157 183 Q 166 165 155 145 C 142 108 137 67 129 23 Z" className="tejido-blando" />
              </ZonaAnatomica>
              <ZonaAnatomica id="semi_membranoso" afectacion={getAfect('semi_membranoso')} onRegionToggle={onRegionToggle} label="Semimembranoso">
                <path d="M 130 25 C 134 66 143 107 151 138 Q 157 155 170 166 Q 183 155 189 138 C 197 107 206 66 210 25 Z" className="tejido-blando" />
              </ZonaAnatomica>

              {/* Fosa Poplítea */}
              <ZonaAnatomica id="fosa_poplitea" afectacion={getAfect('fosa_poplitea')} onRegionToggle={onRegionToggle} label="Fosa poplítea">
                <path d="M 137 157 Q 170 143 203 157 L 195 205 Q 170 219 145 205 Z" style={{ fill: '#0b1624', stroke: '#475569' }} />
              </ZonaAnatomica>

              {/* Gastrocnemios */}
              <ZonaAnatomica id="gemelo_med" afectacion={getAfect('gemelo_med')} onRegionToggle={onRegionToggle} label="Gastrocnemio medial">
                <path d="M 112 215 C 128 205 151 208 163 228 C 174 253 161 286 146 318 L 131 370 L 120 370 L 126 316 C 112 285 101 246 112 215 Z" className="tejido-blando" />
              </ZonaAnatomica>
              <ZonaAnatomica id="gemelo_lat" afectacion={getAfect('gemelo_lat')} onRegionToggle={onRegionToggle} label="Gastrocnemio lateral">
                <path d="M 228 215 C 212 205 189 208 177 228 C 166 253 179 286 194 318 L 209 370 L 220 370 L 214 316 C 228 285 239 246 228 215 Z" className="tejido-blando" />
              </ZonaAnatomica>

              {/* Nervios y Arteria */}
              <ZonaAnatomica id="nervio_ciatico" afectacion={getAfect('nervio_ciatico')} onRegionToggle={onRegionToggle} label="Nervio tibial">
                <path d="M 170 116 C 170 145 170 173 170 207 C 170 239 170 264 170 286" style={{ fill: 'none', stroke: '#eab308', strokeWidth: 4, strokeLinecap: 'round', pointerEvents: 'stroke' }} />
              </ZonaAnatomica>
              <ZonaAnatomica id="nervio_peroneo" afectacion={getAfect('nervio_peroneo')} onRegionToggle={onRegionToggle} label="Nervio peroneo común">
                <path d="M 184 145 C 205 160 227 177 241 202 C 246 214 244 230 239 246" style={{ fill: 'none', stroke: '#facc15', strokeWidth: 4, strokeLinecap: 'round', pointerEvents: 'stroke' }} />
              </ZonaAnatomica>
              <ZonaAnatomica id="arteria_poplitea" afectacion={getAfect('arteria_poplitea')} onRegionToggle={onRegionToggle} label="Arteria poplítea">
                <path d="M 170 128 C 169 157 171 183 170 211 C 169 230 170 244 170 258" style={{ fill: 'none', stroke: '#ef4444', strokeWidth: 4, strokeLinecap: 'round', pointerEvents: 'stroke' }} />
              </ZonaAnatomica>

              <path className="detalle-anatomico" d="M 131 215 Q 170 235 209 215" />
              <path className="detalle-anatomico" d="M 146 286 Q 170 300 194 286" />
            </>
          )}
        </g>
      </svg>
    </div>
  );
}