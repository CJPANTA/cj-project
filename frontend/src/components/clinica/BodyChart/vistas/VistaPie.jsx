// src/components/clinica/BodyChart/vistas/VistaPie.jsx
import React from 'react';

const ZonaAnatomica = ({ id, selected, onRegionToggle, children, label }) => (
  <g
    role="button"
    tabIndex={0}
    aria-label={label || id}
    aria-pressed={selected}
    onClick={() => onRegionToggle(id)}
    className="group cursor-pointer outline-none"
  >
    {React.Children.map(children, (child) => {
      if (!child) return null;
      return React.cloneElement(child, {
        className: `hueso-pie ${selected ? 'selected' : ''} ${child.props.className || ''}`,
      });
    })}
  </g>
);

const Label = ({ x, y, children, active, align = 'middle', esDerecho = false }) => (
  <text
    x={x}
    y={y}
    textAnchor={align}
    className={`etiqueta-pie ${active ? 'etiqueta-activa' : ''}`}
    pointerEvents="none"
    transform={esDerecho ? `translate(${2 * x}, 0) scale(-1, 1)` : undefined}
  >
    {children}
  </text>
);

export default function VistaPie({ cara, lado, regionesSeleccionadas = [], onRegionToggle }) {
  const esDerecho = lado === 'derecho';
  const isSelected = (id) => regionesSeleccionadas.includes(id);

  return (
    <div className="flex w-full flex-col items-center">
      {/* Ocultamos el título interno si estamos en el juego, o lo dejamos si es para la clínica */}
      <h4 className="mb-2 text-sm font-black tracking-wider text-[#22d3ee] font-mono uppercase text-center">
        Pie {lado === 'izquierdo' ? 'Izquierdo' : 'Derecho'}
      </h4>

      <svg viewBox="0 0 340 380" width="100%" height="100%" className="h-full w-full max-w-xl touch-manipulation select-none">
        <style>{`
          .hueso-base { fill: #09131f; stroke: #334155; stroke-width: 1.2; stroke-linejoin: round; }
          .hueso-pie { fill: #1e293b; stroke: #475569; stroke-width: 1.2; stroke-linejoin: round; transition: all 150ms; cursor: pointer; }
          .hueso-pie:hover { fill: #085a75; stroke: #38bdf8; stroke-width: 1.8; filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.5)); }
          .hueso-pie.selected { fill: #22d3ee; stroke: #ffffff; stroke-width: 1.8; filter: drop-shadow(0 0 8px #22d3ee); }
          .linea-referencia { stroke: #334155; stroke-width: 1; stroke-dasharray: 2 2; }
          .etiqueta-pie { fill: #94a3b8; font-size: 8px; font-family: monospace; font-weight: 700; transition: fill 200ms; }
          .etiqueta-activa { fill: #22d3ee; font-size: 9px; filter: drop-shadow(0 0 4px rgba(34, 211, 238, 0.6)); }
        `}</style>

        {cara === 'lateral' ? (
          <g transform={esDerecho ? 'translate(340 0) scale(-1 1)' : undefined}>
            <path className="hueso-base" d="M 90 35 L 115 35 C 112 70, 115 95, 120 125 C 130 135, 145 150, 165 160 C 185 170, 215 175, 235 175 C 265 175, 290 185, 305 200 C 310 205, 305 212, 290 215 C 270 218, 230 220, 190 225 C 140 230, 90 235, 50 230 C 30 225, 20 210, 25 190 C 30 170, 50 150, 70 145 C 75 125, 78 80, 90 35 Z" />
            <path className="hueso-base" d="M 75 35 L 85 35 L 82 120 L 70 120 Z" />
            <path className="hueso-base" d="M 92 35 L 112 35 L 108 118 L 88 120 Z" />

            <ZonaAnatomica id="retropie_completo" selected={isSelected('retropie_completo')} onRegionToggle={onRegionToggle}>
              <path d="M 30 195 C 22 205, 24 220, 38 228 C 52 235, 82 232, 105 224 L 118 208 C 102 198, 85 198, 72 202 L 58 185 C 42 182, 34 186, 30 195 Z" />
              <path d="M 72 130 C 68 150, 75 170, 90 180 C 108 190, 126 186, 138 172 C 142 160, 136 148, 122 142 C 110 136, 95 130, 72 130 Z" />
            </ZonaAnatomica>

            <ZonaAnatomica id="mediopie_tarsos" selected={isSelected('mediopie_tarsos')} onRegionToggle={onRegionToggle}>
              <path d="M 128 145 C 138 152, 140 165, 135 178 L 152 184 C 160 170, 154 154, 144 147 Z" />
              <path d="M 108 205 C 118 202, 128 203, 140 208 L 158 198 L 148 178 L 122 186 Z" />
              <path d="M 148 149 L 160 186 L 176 182 L 166 151 Z" />
            </ZonaAnatomica>

            <ZonaAnatomica id="antepie_metatarsos" selected={isSelected('antepie_metatarsos')} onRegionToggle={onRegionToggle}>
              <path d="M 170 154 L 180 177 L 230 170 C 235 162, 233 152, 225 152 Z" />
              <path d="M 166 180 L 180 192 L 234 184 L 228 172 Z" />
              <path d="M 160 195 L 175 204 L 236 195 L 230 186 Z" />
              <path d="M 152 206 L 168 214 L 234 204 L 228 196 Z" />
              <path d="M 142 216 L 158 222 L 226 213 L 220 205 Z" />
            </ZonaAnatomica>

            <ZonaAnatomica id="falanges_proximales" selected={isSelected('falanges_proximales')} onRegionToggle={onRegionToggle}>
              <path d="M 230 154 L 250 156 L 248 168 L 232 166 Z" />
              <path d="M 232 173 L 252 174 L 250 183 L 234 182 Z" />
              <path d="M 234 187 L 252 188 L 250 196 L 234 195 Z" />
              <path d="M 232 197 L 248 198 L 246 205 L 232 204 Z" />
              <path d="M 226 206 L 240 207 L 238 213 L 226 212 Z" />
            </ZonaAnatomica>

            <ZonaAnatomica id="falanges_medias" selected={isSelected('falanges_medias')} onRegionToggle={onRegionToggle}>
              <path d="M 254 175 L 268 176 L 266 183 L 252 182 Z" />
              <path d="M 254 189 L 266 190 L 264 196 L 252 195 Z" />
              <path d="M 250 199 L 260 200 L 258 205 L 248 204 Z" />
              <path d="M 242 208 L 250 209 L 248 213 L 240 212 Z" />
            </ZonaAnatomica>

            <ZonaAnatomica id="falanges_distales" selected={isSelected('falanges_distales')} onRegionToggle={onRegionToggle}>
              <path d="M 252 157 L 272 159 C 278 162, 276 168, 270 169 L 250 167 Z" />
              <path d="M 270 176 L 284 177 C 288 179, 287 183, 282 183 L 268 182 Z" />
              <path d="M 268 190 L 280 191 C 284 192, 283 196, 278 196 L 266 195 Z" />
              <path d="M 262 200 L 272 201 C 275 202, 274 205, 270 205 L 260 204 Z" />
              <path d="M 252 209 L 260 210 C 263 210, 262 213, 258 213 L 250 212 Z" />
            </ZonaAnatomica>
          </g>
        ) : (
          <g transform={esDerecho ? 'translate(340 0) scale(-1 1)' : undefined}>
            <path className="hueso-base" d="M 125 35 C 105 32, 95 48, 90 70 C 85 92, 90 115, 98 140 C 105 165, 98 195, 92 225 C 85 255, 90 288, 115 322 C 140 345, 178 342, 198 315 C 218 288, 215 250, 208 210 C 202 170, 218 128, 212 90 C 208 60, 190 35, 160 38 Z" />
            
            <ZonaAnatomica id="talon_plantar" selected={isSelected('talon_plantar')} onRegionToggle={onRegionToggle}>
              <path d="M 108 245 C 92 265, 95 295, 118 322 C 142 342, 175 338, 192 312 C 205 288, 200 262, 185 245 C 160 238, 130 238, 108 245 Z" />
            </ZonaAnatomica>

            <ZonaAnatomica id="mediopie_plantar" selected={isSelected('mediopie_plantar')} onRegionToggle={onRegionToggle}>
              <path d="M 98 165 C 108 175, 132 180, 175 175 C 202 170, 208 192, 205 220 C 188 236, 135 236, 102 230 C 88 208, 88 185, 98 165 Z" />
            </ZonaAnatomica>

            <ZonaAnatomica id="metatarsianos_plantar" selected={isSelected('metatarsianos_plantar')} onRegionToggle={onRegionToggle}>
              <path d="M 88 100 C 102 106, 145 112, 212 98 C 220 128, 214 156, 202 170 C 150 175, 108 170, 95 160 C 85 142, 84 120, 88 100 Z" />
            </ZonaAnatomica>

            <ZonaAnatomica id="hallux_plantar" selected={isSelected('hallux_plantar')} onRegionToggle={onRegionToggle}>
              <path d="M 92 48 C 84 62, 86 82, 104 92 C 120 95, 128 80, 124 60 C 118 42, 104 38, 92 48 Z" />
            </ZonaAnatomica>

            <ZonaAnatomica id="dedos_menores_plantar" selected={isSelected('dedos_menores_plantar')} onRegionToggle={onRegionToggle}>
              <path d="M 128 46 C 124 58, 126 74, 140 78 C 148 78, 154 68, 150 54 C 146 44, 134 40, 128 46 Z" />
              <path d="M 154 52 C 150 63, 152 75, 164 78 C 172 78, 178 68, 174 56 C 170 46, 160 44, 154 52 Z" />
              <path d="M 178 60 C 175 70, 177 80, 188 82 C 196 82, 200 72, 196 63 C 191 54, 183 52, 178 60 Z" />
              <path d="M 200 72 C 197 80, 199 88, 208 89 C 215 89, 218 81, 215 74 C 211 67, 204 65, 200 72 Z" />
            </ZonaAnatomica>
          </g>
        )}
      </svg>
    </div>
  );
}