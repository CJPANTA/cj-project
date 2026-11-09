// src/components/clinica/BodyChart/vistas/VistaPiePro.jsx
import React from 'react';

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
      className="zona-interactiva focus:outline-none cursor-pointer"
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
            'hueso-pie',
            afectacion ? 'selected' : '',
            child.props.className || '',
          ].filter(Boolean).join(' '),
        });
      })}
    </g>
  );
};

export default function VistaPiePro({ cara = 'lateral', lado = 'derecho', afectaciones = {}, onRegionToggle }) {
  const esDerecho = lado === 'derecho' || lado === 'derecha';
  const getAfectacion = (id) => afectaciones[id];

  return (
    <div className="flex w-full flex-col items-center">
      <h4 className="mb-2 text-sm font-black tracking-wider text-[#22d3ee] font-mono uppercase text-center">
        Pie {lado === 'izquierdo' || lado === 'izquierda' ? 'Izquierdo' : 'Derecho'} — {cara === 'lateral' ? 'Vista Ósea Anatómica' : 'Vista Plantar (Tejidos y Fascia)'}
      </h4>

      <svg viewBox="0 0 340 380" width="100%" height="100%" className="h-full w-full max-w-xl touch-manipulation select-none">
        <style>{`
          .hueso-base { fill: #09131f; stroke: #334155; stroke-width: 1.2; stroke-linejoin: round; }
          .hueso-pie { fill: #1e293b; stroke: #475569; stroke-width: 1.2; stroke-linejoin: round; transition: all 150ms; cursor: pointer; }
          .hueso-pie:hover { fill: #085a75; stroke: #38bdf8; stroke-width: 1.8; filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.5)); }
          .zona-interactiva:focus-visible .hueso-pie { stroke: #ffffff !important; stroke-width: 2.5 !important; }
          .linea-referencia { fill: none; stroke: #64748b; stroke-width: 1; stroke-dasharray: 2 2; pointer-events: none; }
          .etiqueta-pie { fill: #94a3b8; font-size: 8px; font-family: monospace; font-weight: 700; transition: fill 200ms; }
          .etiqueta-activa { fill: #22d3ee; font-size: 9px; filter: drop-shadow(0 0 4px rgba(34, 211, 238, 0.6)); }
        `}</style>

        {cara === 'lateral' ? (
          <g transform={esDerecho ? 'translate(340 0) scale(-1 1)' : undefined}>
            <path className="hueso-base" d="M 90 35 L 115 35 C 112 70, 115 95, 120 125 C 130 135, 145 150, 165 160 C 185 170, 215 175, 235 175 C 265 175, 290 185, 305 200 C 310 205, 305 212, 290 215 C 270 218, 230 220, 190 225 C 140 230, 90 235, 50 230 C 30 225, 20 210, 25 190 C 30 170, 50 150, 70 145 C 75 125, 78 80, 90 35 Z" />
            <path className="hueso-base" d="M 75 35 L 85 35 L 82 120 L 70 120 Z" />
            <path className="hueso-base" d="M 92 35 L 112 35 L 108 118 L 88 120 Z" />

            <ZonaAnatomica id="tendon_aquiles" afectacion={getAfectacion('tendon_aquiles')} onRegionToggle={onRegionToggle} label="Tendón de Aquiles">
              <path d="M 50 35 L 62 35 L 56 182 L 40 185 Z" stroke="#e2e8f0" strokeWidth="2.5" fill="#e2e8f0" style={{ opacity: 0.9, pointerEvents: 'all' }} />
            </ZonaAnatomica>

            <ZonaAnatomica id="fascia_plantar_lateral" afectacion={getAfectacion('fascia_plantar_lateral')} onRegionToggle={onRegionToggle} label="Fascia Plantar Lateral">
              <path d="M 38 226 C 80 232, 140 230, 224 213" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" fill="none" style={{ pointerEvents: 'all' }} />
            </ZonaAnatomica>

            <ZonaAnatomica id="nervio_tibial_posterior" afectacion={getAfectacion('nervio_tibial_posterior')} onRegionToggle={onRegionToggle} label="Nervio Tibial Posterior">
              <path d="M 82 35 C 78 80, 72 135, 68 165 C 64 190, 75 210, 115 215" stroke="#eab308" strokeWidth="3" strokeLinecap="round" fill="none" style={{ pointerEvents: 'all' }} />
            </ZonaAnatomica>

            <ZonaAnatomica id="calcaneo" afectacion={getAfectacion('calcaneo')} onRegionToggle={onRegionToggle} label="Calcáneo">
              <path d="M 30 195 C 22 205, 24 220, 38 228 C 52 235, 82 232, 105 224 L 118 208 C 102 198, 85 198, 72 202 L 58 185 C 42 182, 34 186, 30 195 Z" />
            </ZonaAnatomica>

            <ZonaAnatomica id="astragalo" afectacion={getAfectacion('astragalo')} onRegionToggle={onRegionToggle} label="Astrágalo">
              <path d="M 72 130 C 68 150, 75 170, 90 180 C 108 190, 126 186, 138 172 C 142 160, 136 148, 122 142 C 110 136, 95 130, 72 130 Z" />
            </ZonaAnatomica>

            <ZonaAnatomica id="navicular" afectacion={getAfectacion('navicular')} onRegionToggle={onRegionToggle} label="Navicular">
              <path d="M 128 145 C 138 152, 140 165, 135 178 L 152 184 C 160 170, 154 154, 144 147 Z" />
            </ZonaAnatomica>

            <ZonaAnatomica id="cuboides" afectacion={getAfectacion('cuboides')} onRegionToggle={onRegionToggle} label="Cuboides">
              <path d="M 108 205 C 118 202, 128 203, 140 208 L 158 198 L 148 178 L 122 186 Z" />
            </ZonaAnatomica>

            <ZonaAnatomica id="cuneiforme_medial" afectacion={getAfectacion('cuneiforme_medial')} onRegionToggle={onRegionToggle} label="Cuneiformes">
              <path d="M 148 149 L 160 186 L 176 182 L 166 151 Z" />
            </ZonaAnatomica>

            <ZonaAnatomica id="metatarsiano_I" afectacion={getAfectacion('metatarsiano_I')} onRegionToggle={onRegionToggle} label="1er Metatarsiano">
              <path d="M 170 154 L 180 177 L 230 170 C 235 162, 233 152, 225 152 Z" />
            </ZonaAnatomica>
            <ZonaAnatomica id="metatarsiano_II" afectacion={getAfectacion('metatarsiano_II')} onRegionToggle={onRegionToggle} label="2º Metatarsiano">
              <path d="M 166 180 L 180 192 L 234 184 L 228 172 Z" />
            </ZonaAnatomica>
            <ZonaAnatomica id="metatarsiano_III" afectacion={getAfectacion('metatarsiano_III')} onRegionToggle={onRegionToggle} label="3er Metatarsiano">
              <path d="M 160 195 L 175 204 L 236 195 L 230 186 Z" />
            </ZonaAnatomica>
            <ZonaAnatomica id="metatarsiano_IV" afectacion={getAfectacion('metatarsiano_IV')} onRegionToggle={onRegionToggle} label="4º Metatarsiano">
              <path d="M 152 206 L 168 214 L 234 204 L 228 196 Z" />
            </ZonaAnatomica>
            <ZonaAnatomica id="metatarsiano_V" afectacion={getAfectacion('metatarsiano_V')} onRegionToggle={onRegionToggle} label="5º Metatarsiano">
              <path d="M 142 216 L 158 222 L 226 213 L 220 205 Z" />
            </ZonaAnatomica>

            <ZonaAnatomica id="hallux_falanges" afectacion={getAfectacion('hallux_falanges')} onRegionToggle={onRegionToggle} label="1er Dedo">
              <path d="M 230 154 L 250 156 L 248 168 L 232 166 Z" />
              <path d="M 252 157 L 272 159 C 278 162, 276 168, 270 169 L 250 167 Z" />
            </ZonaAnatomica>

            <ZonaAnatomica id="dedo_II_falanges" afectacion={getAfectacion('dedo_II_falanges')} onRegionToggle={onRegionToggle} label="2º Dedo">
              <path d="M 234 172 L 252 173 L 250 181 L 234 180 Z" />
              <path d="M 254 174 L 268 175 L 266 181 L 252 180 Z" />
              <path d="M 270 175 L 284 176 C 288 178, 287 182, 282 182 L 268 181 Z" />
            </ZonaAnatomica>

            <ZonaAnatomica id="dedo_III_falanges" afectacion={getAfectacion('dedo_III_falanges')} onRegionToggle={onRegionToggle} label="3er Dedo">
              <path d="M 236 183 L 252 184 L 250 191 L 236 190 Z" />
              <path d="M 254 185 L 266 186 L 264 191 L 252 190 Z" />
              <path d="M 268 186 L 280 187 C 284 188, 283 192, 278 192 L 266 191 Z" />
            </ZonaAnatomica>

            <ZonaAnatomica id="dedo_IV_falanges" afectacion={getAfectacion('dedo_IV_falanges')} onRegionToggle={onRegionToggle} label="4º Dedo">
              <path d="M 232 193 L 246 194 L 244 200 L 232 199 Z" />
              <path d="M 248 195 L 258 196 L 256 200 L 246 199 Z" />
              <path d="M 260 196 L 270 197 C 273 198, 272 201, 268 201 L 258 200 Z" />
            </ZonaAnatomica>

            <ZonaAnatomica id="dedo_V_falanges" afectacion={getAfectacion('dedo_V_falanges')} onRegionToggle={onRegionToggle} label="5º Dedo">
              <path d="M 226 202 L 238 203 L 236 208 L 226 207 Z" />
              <path d="M 240 204 L 248 205 L 246 208 L 238 207 Z" />
              <path d="M 250 205 L 258 206 C 261 206, 260 209, 256 209 L 248 208 Z" />
            </ZonaAnatomica>
          </g>
        ) : (
          <g transform={esDerecho ? 'translate(340 0) scale(-1 1)' : undefined}>
            <path className="hueso-base" d="M 125 35 C 105 32, 95 48, 90 70 C 85 92, 90 115, 98 140 C 105 165, 98 195, 92 225 C 85 255, 90 288, 115 322 C 140 345, 178 342, 198 315 C 218 288, 215 250, 208 210 C 202 170, 218 128, 212 90 C 208 60, 190 35, 160 38 Z" />

            <ZonaAnatomica id="talon_plantar" afectacion={getAfectacion('talon_plantar')} onRegionToggle={onRegionToggle} label="Talón">
              <path d="M 108 245 C 92 265, 95 295, 118 322 C 142 342, 175 338, 192 312 C 205 288, 200 262, 185 245 C 160 238, 130 238, 108 245 Z" />
            </ZonaAnatomica>

            <ZonaAnatomica id="fascia_plantar" afectacion={getAfectacion('fascia_plantar')} onRegionToggle={onRegionToggle} label="Fascia Plantar Central">
              <path d="M 120 230 C 135 200, 140 180, 150 170 L 165 170 C 150 190, 145 210, 135 240 Z" style={{ fill: '#334155', stroke: '#38bdf8' }} />
            </ZonaAnatomica>

            <ZonaAnatomica id="nervio_tibial_plantar" afectacion={getAfectacion('nervio_tibial_plantar')} onRegionToggle={onRegionToggle} label="Nervio Tibial / Ramas Plantares">
              <path d="M 142 275 C 142 210, 105 150, 108 68 M 142 190 C 135 150, 138 68, 138 68 M 142 190 C 152 145, 162 70, 162 70 M 142 200 C 172 150, 186 75, 186 75 M 142 200 C 185 160, 206 82, 206 82" stroke="#eab308" strokeWidth="2.5" strokeLinecap="round" fill="none" style={{ pointerEvents: 'all' }} />
            </ZonaAnatomica>

            <ZonaAnatomica id="mediopie_plantar" afectacion={getAfectacion('mediopie_plantar')} onRegionToggle={onRegionToggle} label="Arco Plantar (Mediopié)">
              <path d="M 98 165 C 108 175, 132 180, 175 175 C 202 170, 208 192, 205 220 C 188 236, 135 236, 102 230 C 88 208, 88 185, 98 165 Z" />
            </ZonaAnatomica>

            <ZonaAnatomica id="almohadilla_metatarsal" afectacion={getAfectacion('almohadilla_metatarsal')} onRegionToggle={onRegionToggle} label="Almohadilla Metatarsiana">
              <path d="M 88 100 C 102 106, 145 112, 212 98 C 220 128, 214 156, 202 170 C 150 175, 108 170, 95 160 C 85 142, 84 120, 88 100 Z" />
            </ZonaAnatomica>

            <ZonaAnatomica id="pulpejo_hallux" afectacion={getAfectacion('pulpejo_hallux')} onRegionToggle={onRegionToggle} label="Pulpejo 1er Dedo">
              <path d="M 92 48 C 84 62, 86 82, 104 92 C 120 95, 128 80, 124 60 C 118 42, 104 38, 92 48 Z" />
            </ZonaAnatomica>

            <ZonaAnatomica id="pulpejo_dedo_2" afectacion={getAfectacion('pulpejo_dedo_2')} onRegionToggle={onRegionToggle} label="Pulpejo 2º Dedo">
              <path d="M 128 46 C 124 58, 126 74, 140 78 C 148 78, 154 68, 150 54 Z" />
            </ZonaAnatomica>

            <ZonaAnatomica id="pulpejo_dedo_3" afectacion={getAfectacion('pulpejo_dedo_3')} onRegionToggle={onRegionToggle} label="Pulpejo 3er Dedo">
              <path d="M 154 52 C 150 63, 152 75, 164 78 C 172 78, 178 68, 174 56 Z" />
            </ZonaAnatomica>

            <ZonaAnatomica id="pulpejo_dedo_4" afectacion={getAfectacion('pulpejo_dedo_4')} onRegionToggle={onRegionToggle} label="Pulpejo 4º Dedo">
              <path d="M 178 60 C 175 70, 177 80, 188 82 C 196 82, 200 72, 196 63 Z" />
            </ZonaAnatomica>

            <ZonaAnatomica id="pulpejo_dedo_5" afectacion={getAfectacion('pulpejo_dedo_5')} onRegionToggle={onRegionToggle} label="Pulpejo 5º Dedo">
              <path d="M 200 72 C 197 80, 199 88, 208 89 C 215 89, 218 81, 215 74 Z" />
            </ZonaAnatomica>
          </g>
        )}
      </svg>
    </div>
  );
}