import { useState, useEffect, useMemo, useCallback } from 'react';
import { buscarReglaClinica } from './reglasClinicas';
import VistaGeneral from './vistas/VistaGeneral';
import VistaCabezaPro, { ESTRUCTURA_CABEZA } from './vistas/VistaCabezaPro';
import VistaToraxPro, { ESTRUCTURA_TORAX } from './vistas/VistaToraxPro';
import VistaColumnaPro, { ESTRUCTURA_COLUMNA } from './vistas/VistaColumnaPro';
import VistaLumbarPro, { ESTRUCTURA_LUMBAR } from './vistas/VistaLumbarPro';
import VistaPelvisPro, { ESTRUCTURA_PELVIS } from './vistas/VistaPelvisPro';
import VistaHombroPro, { ESTRUCTURA_HOMBRO } from './vistas/VistaHombroPro';
import VistaBrazoPro, { ESTRUCTURA_BRAZO } from './vistas/VistaBrazoPro';
import VistaCodoPro, { ESTRUCTURA_CODO } from './vistas/VistaCodoPro';
import VistaManoPro from './vistas/VistaManoPro';
import VistaPiernaPro, { ESTRUCTURA_PIERNA } from './vistas/VistaPiernaPro';
import VistaRodillaPro, { ESTRUCTURA_RODILLA } from './vistas/VistaRodillaPro';
import VistaTobilloPro, { ESTRUCTURA_TOBILLO } from './vistas/VistaTobilloPro';
import VistaPiePro from './vistas/VistaPiePro';

export const SINTOMAS_MAP = {
  dolor:       { nombre: 'Dolor',       color: '#ef4444', border: '#f87171' },
  inflamacion: { nombre: 'Inflamación', color: '#f59e0b', border: '#fbbf24' },
  neuropatia:  { nombre: 'Neuropatía',  color: '#a855f7', border: '#c084fc' },
  rigidez:     { nombre: 'Rigidez',     color: '#22d3ee', border: '#a5f3fc' },
};

const VISTAS_PRO = {
  cabeza:  { componente: VistaCabezaPro,  caras: ['anterior','posterior'], caraDefault: 'anterior',  estructura: ESTRUCTURA_CABEZA,  macro: () => 'cabeza'  },
  torax:   { componente: VistaToraxPro,   caras: ['anterior','posterior'], caraDefault: 'anterior',  estructura: ESTRUCTURA_TORAX,   macro: () => 'torax'   },
  columna: { componente: VistaColumnaPro, caras: ['posterior','anterior'], caraDefault: 'posterior', estructura: ESTRUCTURA_COLUMNA, macro: () => 'columna' },
  lumbar:  { componente: VistaLumbarPro,  caras: ['posterior','anterior'], caraDefault: 'posterior', estructura: ESTRUCTURA_LUMBAR,  macro: () => 'lumbar'  },
  pelvis:  { componente: VistaPelvisPro,  caras: ['anterior','posterior'], caraDefault: 'anterior',  estructura: ESTRUCTURA_PELVIS,  macro: () => 'pelvis'  },
  hombro:  { componente: VistaHombroPro,  caras: ['anterior','posterior'], caraDefault: 'anterior',  estructura: ESTRUCTURA_HOMBRO,  macro: (l) => `hombro_${l === 'izquierdo' ? 'izq' : 'der'}` },
  brazo:   { componente: VistaBrazoPro,   caras: ['anterior','posterior'], caraDefault: 'anterior',  estructura: ESTRUCTURA_BRAZO,   macro: (l) => `brazo_${l === 'izquierdo' ? 'izq' : 'der'}`  },
  codo:    { componente: VistaCodoPro,    caras: ['anterior','posterior'], caraDefault: 'anterior',  estructura: ESTRUCTURA_CODO,    macro: (l) => `codo_${l === 'izquierdo' ? 'izq' : 'der'}`    },
  mano:    { componente: VistaManoPro,    caras: ['dorsal','palmar'],      caraDefault: 'dorsal',    estructura: null,               macro: (l) => `mano_${l === 'izquierdo' ? 'izq' : 'der'}`    },
  pierna:  { componente: VistaPiernaPro,  caras: ['anterior','posterior'], caraDefault: 'anterior',  estructura: ESTRUCTURA_PIERNA,  macro: (l) => `pierna_${l === 'izquierdo' ? 'izq' : 'der'}`  },
  rodilla: { componente: VistaRodillaPro, caras: ['anterior','posterior'], caraDefault: 'anterior',  estructura: ESTRUCTURA_RODILLA, macro: (l) => `rodilla_${l === 'izquierdo' ? 'izq' : 'der'}` },
  tobillo: { componente: VistaTobilloPro, caras: ['lateral','medial'],     caraDefault: 'lateral',   estructura: ESTRUCTURA_TOBILLO, macro: (l) => `tobillo_${l === 'izquierdo' ? 'izq' : 'der'}` },
  pie:     { componente: VistaPiePro,     caras: ['lateral','plantar'],    caraDefault: 'lateral',   estructura: null,               macro: (l) => `pie_${l === 'izquierdo' ? 'izq' : 'der'}`     },
};

const MAPA_VISTAS = {
  cabeza:'cabeza', cuello:'cabeza', nuca:'cabeza', torax:'torax', columna:'columna', lumbar:'lumbar',
  pelvis:'pelvis', cadera:'pelvis',
  hombro_izq:'hombro_izq', hombro_der:'hombro_der',
  brazo_izq:'brazo_izq',   brazo_der:'brazo_der',
  codo_izq:'codo_izq',     codo_der:'codo_der',
  mano_izq:'mano_izq',     mano_der:'mano_der',
  pierna_izq:'pierna_izq', pierna_der:'pierna_der',
  rodilla_izq:'rodilla_izq', rodilla_der:'rodilla_der',
  tobillo_izq:'tobillo_izq', tobillo_der:'tobillo_der',
  pie_izq:'pie_izq',       pie_der:'pie_der',
};

const ID_A_INFO = (() => {
  const map = {};
  for (const [vistaBase, cfg] of Object.entries(VISTAS_PRO)) {
    if (!cfg.estructura) continue;
    Object.values(cfg.estructura).forEach((grupo) => {
      if (!Array.isArray(grupo)) return;
      grupo.forEach((item) => {
        if (!map[item.id]) map[item.id] = [];
        map[item.id].push({ vistaBase, item });
      });
    });
  }
  return map;
})();

const ETIQUETAS_CARA = {
  anterior:'Anterior', posterior:'Posterior', dorsal:'Dorsal', palmar:'Palmar',
  lateral:'Lateral', medial:'Medial', plantar:'Plantar',
};

const parsearVista = (vistaDetalle) => {
  if (!vistaDetalle) return { vistaBase: null, lado: null };
  if (vistaDetalle.endsWith('_izq')) return { vistaBase: vistaDetalle.slice(0, -4), lado: 'izquierdo' };
  if (vistaDetalle.endsWith('_der')) return { vistaBase: vistaDetalle.slice(0, -4), lado: 'derecho' };
  return { vistaBase: vistaDetalle, lado: 'derecho' };
};

const capitalizar = (s) => s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export default function BodyChartContainer({
  regionesSeleccionadas = [],
  onRegionToggle,
  temaOscuro = true,
  vistaDetalle,
  setVistaDetalle,
  datosRegiones = {},
  onUpdateRegionData,
  nombrePaciente,
  dniPaciente,
  centroNombre,
  onLimpiar,
}) {
  const { vistaBase, lado } = parsearVista(vistaDetalle);
  const configVista = vistaBase ? VISTAS_PRO[vistaBase] : null;

  const [caraGeneral, setCaraGeneral] = useState('anterior');
  const [caraDetalle, setCaraDetalle] = useState('anterior');
  const [sintomaActivo, setSintomaActivo] = useState('dolor');
  const [alertaAura, setAlertaAura] = useState(null);

  useEffect(() => {
    if (configVista) setCaraDetalle(configVista.caraDefault);
  }, [vistaBase]);

  useEffect(() => {
    if (alertaAura) {
      const timer = setTimeout(() => setAlertaAura(null), 7000);
      return () => clearTimeout(timer);
    }
  }, [alertaAura]);

  const procesarToggle = useCallback((id, sintoma) => {
    onRegionToggle(id, sintoma);
    if (!regionesSeleccionadas.includes(id)) {
      const regla = buscarReglaClinica(id);
      if (regla) {
        setAlertaAura(regla);
      }
    }
  }, [onRegionToggle, regionesSeleccionadas]);

  const seleccionarRegion = useCallback((regionId) => {
    const vistaId = MAPA_VISTAS[regionId];
    if (vistaId) {
      setVistaDetalle(vistaId);
      const regla = buscarReglaClinica(regionId);
      if (regla) setAlertaAura(regla);
    } else {
      procesarToggle(regionId, sintomaActivo);
    }
  }, [setVistaDetalle, procesarToggle, sintomaActivo]);

  const afectacionesPro = useMemo(() => {
    return regionesSeleccionadas.reduce((acc, id) => {
      const sintomas = datosRegiones[id]?.sintomas || ['dolor'];
      const principal = SINTOMAS_MAP[sintomas[0]] || SINTOMAS_MAP.dolor;
      acc[id] = { color: principal.color, border: principal.border };
      return acc;
    }, {});
  }, [regionesSeleccionadas, datosRegiones]);

  const macroAfectadas = useMemo(() => {
    const set = new Set();
    regionesSeleccionadas.forEach((id) => {
      if (MAPA_VISTAS[id]) { set.add(id); return; }
      const infos = ID_A_INFO[id];
      if (!infos) return;
      infos.forEach(({ vistaBase: vb, item }) => {
        const cfg = VISTAS_PRO[vb];
        if (!cfg) return;
        let ladoItem = lado || 'derecho';
        if (item.id.endsWith('_izq')) ladoItem = 'izquierdo';
        else if (item.id.endsWith('_der')) ladoItem = 'derecho';
        set.add(cfg.macro(ladoItem));
      });
    });
    return [...set];
  }, [regionesSeleccionadas, lado]);

  const volverCuerpoEntero = () => setVistaDetalle(null);

  const carasDisponibles = configVista ? configVista.caras : ['anterior', 'posterior'];
  const caraActual = configVista ? caraDetalle : caraGeneral;
  const setCaraActual = configVista ? setCaraDetalle : setCaraGeneral;

  const bgContainer = temaOscuro ? 'bg-slate-900/50' : 'bg-gray-100/50';

  const sintomasActivos = useMemo(() => {
    const activos = new Set();
    regionesSeleccionadas.forEach(id => {
      (datosRegiones[id]?.sintomas || ['dolor']).forEach(s => activos.add(s));
    });
    return Array.from(activos);
  }, [regionesSeleccionadas, datosRegiones]);

  return (
    <div className={`w-full max-w-2xl mx-auto p-4 md:p-6 rounded-2xl ${bgContainer} border border-gray-700 relative`}>
      
      {/* 🟢 TOAST DE SUGERENCIAS DE AURA (Theme-aware) 🟢 */}
      {alertaAura && (
        <div className={`absolute top-2 right-2 z-[100] p-3 rounded-lg shadow-2xl flex items-start gap-3 w-72 animate-slide-in border-l-4 border-[#22d3ee] ${
          temaOscuro 
            ? 'bg-[#1e293b] text-white' 
            : 'bg-white text-slate-800 border-y border-r border-gray-200'
        }`}>
          <div className="text-2xl">🧠</div>
          <div className="flex-1">
            <p className={`text-[10px] font-black uppercase tracking-wider mb-1 ${
              temaOscuro ? 'text-[#22d3ee]' : 'text-cyan-700'
            }`}>
              Sugerencia de Aura
            </p>
            <p className={`text-xs leading-tight ${
              temaOscuro ? 'text-gray-200' : 'text-slate-600'
            }`}>
              {alertaAura.mensaje}
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {alertaAura.sugerencias.map(s => (
                <span 
                  key={s} 
                  className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                    temaOscuro 
                      ? 'bg-[#22d3ee]/20 text-[#22d3ee] border-[#22d3ee]/30' 
                      : 'bg-cyan-50 text-cyan-700 border-cyan-200'
                  }`}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
          <button 
            onClick={() => setAlertaAura(null)} 
            className={`ml-auto text-lg leading-none ${
              temaOscuro ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-800'
            }`}
          >
            ✕
          </button>
        </div>
      )}

      {nombrePaciente && (
        <div className="mb-4 pb-3 border-b border-gray-700/50 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-mono">Evaluación Clínica</p>
            <h3 className="text-sm font-black text-[#22d3ee]">
              {nombrePaciente} {dniPaciente && <span className="text-gray-400 font-normal">| DNI: {dniPaciente}</span>}
            </h3>
            {centroNombre && <p className="text-[10px] text-gray-400">{centroNombre}</p>}
          </div>
          {onLimpiar && regionesSeleccionadas.length > 0 && (
            <button onClick={onLimpiar} className="text-red-400 text-[10px] font-bold hover:underline">Limpiar todo</button>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-3 justify-center">
        {Object.entries(SINTOMAS_MAP).map(([key, s]) => (
          <button
            key={key}
            onClick={() => setSintomaActivo(key)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase border-2 transition-all ${
              sintomaActivo === key ? 'scale-105 shadow-md' : 'opacity-60 hover:opacity-100'
            }`}
            style={{
              backgroundColor: `${s.color}20`,
              color: s.color,
              borderColor: sintomaActivo === key ? s.color : 'transparent',
            }}
          >
            ● {s.nombre}
          </button>
        ))}
      </div>

      {vistaDetalle && (
        <button onClick={volverCuerpoEntero} className="mb-3 text-[#22d3ee] text-xs font-bold flex items-center gap-1 hover:underline transition-all">
          ← Volver al cuerpo completo
        </button>
      )}

      <div className="flex justify-center gap-3 mb-4">
        {carasDisponibles.map((opcion) => (
          <button
            key={opcion}
            onClick={() => setCaraActual(opcion)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
              caraActual === opcion ? 'bg-[#22d3ee] text-black shadow-lg shadow-[#22d3ee]/30' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            {ETIQUETAS_CARA[opcion] || opcion}
          </button>
        ))}
      </div>

      {/* 🟢 AQUÍ ESTÁ LA MAGIA DEL MODO CLARO 🟢 */}
      <div className="w-full h-[420px] relative flex items-center justify-center overflow-hidden my-4">
        <div className={`w-full h-full flex flex-col items-center justify-center ${!temaOscuro ? 'vista-tema-claro' : ''}
          [&>div]:!flex-col [&>div]:!h-full [&>div]:!max-h-full [&>div]:!w-full
          [&_h4]:!shrink-0 [&_h4]:!text-[11px] [&_h4]:!mb-1
          [&_svg]:!h-auto [&_svg]:!max-h-full [&_svg]:!w-auto [&_svg]:!max-w-full [&_svg]:!object-contain [&_svg]:!scale-95
        `}>
          {vistaDetalle && configVista ? (
            <configVista.componente
              cara={caraDetalle}
              lado={lado}
              onRegionToggle={(id) => procesarToggle(id, sintomaActivo)}
              afectaciones={afectacionesPro}
            />
          ) : (
            <VistaGeneral
              cara={caraGeneral}
              onSeleccionarRegion={seleccionarRegion}
              regionesSeleccionadas={macroAfectadas}
              onRegionToggle={(id) => procesarToggle(id, sintomaActivo)}
              temaOscuro={temaOscuro}
            />
          )}
        </div>
      </div>

      {sintomasActivos.length > 0 && (
        <div className="flex flex-wrap justify-center gap-3 mb-4 text-[10px] font-bold">
          {sintomasActivos.map(sid => {
            const s = SINTOMAS_MAP[sid];
            if (!s) return null;
            return (
              <div key={sid} className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span style={{ color: s.color }}>{s.nombre}</span>
              </div>
            );
          })}
        </div>
      )}

      {regionesSeleccionadas.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-700/50">
          <p className="text-[10px] uppercase tracking-widest text-[#22d3ee] font-bold mb-2">
            Hallazgos ({regionesSeleccionadas.length})
          </p>
          <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
            {regionesSeleccionadas.map((id) => {
              const info = datosRegiones[id] || {};
              const nombre = ID_A_INFO[id]?.[0]?.item?.nombre || capitalizar(id);
              const sintomas = info.sintomas || ['dolor'];
              const eva = info.eva ?? 0;

              return (
                <div key={id} className="bg-black/20 p-3 rounded-xl border border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-white truncate pr-2">{nombre}</span>
                    <div className="flex gap-1 items-center flex-shrink-0">
                      {sintomas.map(sid => {
                        const s = SINTOMAS_MAP[sid] || SINTOMAS_MAP.dolor;
                        return <span key={sid} className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} title={s.nombre} />;
                      })}
                      <button onClick={() => onRegionToggle(id, sintomaActivo)} className="text-red-400 ml-2 text-xs hover:text-red-300" title="Quitar región">✕</button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider flex-shrink-0 w-12">EVA</span>
                    <input
                      type="range"
                      min="0" max="10" step="1"
                      value={eva}
                      onChange={(e) => onUpdateRegionData && onUpdateRegionData(id, 'eva', parseInt(e.target.value))}
                      className="flex-1 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#22d3ee]"
                    />
                    <span className={`text-[12px] font-black w-7 text-center flex-shrink-0 rounded-md py-0.5 ${
                      eva >= 7 ? 'bg-red-500/20 text-red-400' : eva >= 4 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'
                    }`}>
                      {eva}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}