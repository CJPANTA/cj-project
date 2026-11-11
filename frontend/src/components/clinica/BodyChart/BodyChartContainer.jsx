import { useState } from 'react';

import VistaGeneral from './vistas/VistaGeneral';

import VistaCabezaPro from './vistas/VistaCabezaPro';
import VistaToraxPro from './vistas/VistaToraxPro';
import VistaColumnaPro from './vistas/VistaColumnaPro';
import VistaLumbarPro from './vistas/VistaLumbarPro';
import VistaPelvisPro from './vistas/VistaPelvisPro';
import VistaHombroPro from './vistas/VistaHombroPro';
import VistaBrazoPro from './vistas/VistaBrazoPro';
import VistaCodoPro from './vistas/VistaCodoPro';
import VistaManoPro from './vistas/VistaManoPro';
import VistaPiernaPro from './vistas/VistaPiernaPro';
import VistaRodillaPro from './vistas/VistaRodillaPro';
import VistaTobilloPro from './vistas/VistaTobilloPro';
import VistaPiePro from './vistas/VistaPiePro';

export default function BodyChartContainer({
  regionesSeleccionadas = [],
  onRegionToggle,
  temaOscuro,
  vistaDetalle,
  setVistaDetalle
}) {
  const [cara, setCara] = useState('anterior');

  const MAPA_VISTAS = {
    cabeza: 'cabeza', cuello: 'cabeza', nuca: 'cabeza', torax: 'torax', columna: 'columna', lumbar: 'lumbar',
    pelvis: 'pelvis', cadera: 'pelvis', brazo_izq: 'brazo_izq', brazo_der: 'brazo_der', mano_izq: 'mano_izq',
    mano_der: 'mano_der', pierna_izq: 'pierna_izq', pierna_der: 'pierna_der', pie_izq: 'pie_izq', pie_der: 'pie_der',
    hombro_izq: 'hombro_izq', hombro_der: 'hombro_der', rodilla_izq: 'rodilla_izq', rodilla_der: 'rodilla_der',
    codo_izq: 'codo_izq', codo_der: 'codo_der', tobillo_izq: 'tobillo_izq', tobillo_der: 'tobillo_der',
  };

  const seleccionarRegion = (regionId) => {
    const vista = MAPA_VISTAS[regionId];
    if (vista) setVistaDetalle(vista);
    else onRegionToggle(regionId);
  };

  const volverCuerpoEntero = () => setVistaDetalle(null);

  const renderVista = () => {
    if (!vistaDetalle) {
      return (
        <VistaGeneral
          cara={cara}
          onSeleccionarRegion={seleccionarRegion}
          regionesSeleccionadas={regionesSeleccionadas}
          onRegionToggle={onRegionToggle}
          temaOscuro={temaOscuro}
        />
      );
    }

    let lado = 'derecho';
    let vistaBase = vistaDetalle;
    
    if (vistaDetalle.endsWith('_izq')) {
      lado = 'izquierdo';
      vistaBase = vistaDetalle.slice(0, -4);
    } else if (vistaDetalle.endsWith('_der')) {
      lado = 'derecho';
      vistaBase = vistaDetalle.slice(0, -4);
    }

    const afectacionesPro = regionesSeleccionadas.reduce((acc, id) => ({ ...acc, [id]: { color: '#ef4444', border: '#f87171' } }), {});

    switch (vistaBase) {
      case 'cabeza': return <VistaCabezaPro cara={cara} lado={lado} onRegionToggle={onRegionToggle} afectaciones={afectacionesPro} />;
      case 'torax': return <VistaToraxPro cara={cara} lado={lado} onRegionToggle={onRegionToggle} afectaciones={afectacionesPro} />;
      case 'columna': return <VistaColumnaPro cara={cara} lado={lado} onRegionToggle={onRegionToggle} afectaciones={afectacionesPro} />;
      case 'lumbar': return <VistaLumbarPro cara={cara} lado={lado} onRegionToggle={onRegionToggle} afectaciones={afectacionesPro} />;
      case 'pelvis': return <VistaPelvisPro cara={cara} lado={lado} onRegionToggle={onRegionToggle} afectaciones={afectacionesPro} />;
      case 'hombro': return <VistaHombroPro cara={cara} lado={lado} onRegionToggle={onRegionToggle} afectaciones={afectacionesPro} />;
      case 'brazo': return <VistaBrazoPro cara={cara} lado={lado} onRegionToggle={onRegionToggle} afectaciones={afectacionesPro} />;
      case 'codo': return <VistaCodoPro cara={cara} lado={lado} onRegionToggle={onRegionToggle} afectaciones={afectacionesPro} />;
      case 'mano': return <VistaManoPro cara={cara} lado={lado} onRegionToggle={onRegionToggle} afectaciones={afectacionesPro} />;
      case 'pierna': return <VistaPiernaPro cara={cara} lado={lado} onRegionToggle={onRegionToggle} afectaciones={afectacionesPro} />;
      case 'rodilla': return <VistaRodillaPro cara={cara} lado={lado} onRegionToggle={onRegionToggle} afectaciones={afectacionesPro} />;
      case 'tobillo': return <VistaTobilloPro cara={cara} lado={lado} onRegionToggle={onRegionToggle} afectaciones={afectacionesPro} />;
      case 'pie': return <VistaPiePro cara={cara} lado={lado} onRegionToggle={onRegionToggle} afectaciones={afectacionesPro} />;
      default: return <div className="text-gray-400 text-center p-4">Vista no disponible</div>;
    }
  };

  const bgContainer = temaOscuro ? 'bg-slate-900/50' : 'bg-gray-100/50';

  return (
    <div className={`w-full max-w-2xl mx-auto p-4 md:p-6 rounded-2xl ${bgContainer} border border-gray-700`}>
      <div className="flex justify-center gap-4 mb-4">
        <button onClick={() => setCara('anterior')} className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${cara === 'anterior' ? 'bg-[#22d3ee] text-black shadow-lg shadow-[#22d3ee]/30' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}>Anterior</button>
        <button onClick={() => setCara('posterior')} className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${cara === 'posterior' ? 'bg-[#22d3ee] text-black shadow-lg shadow-[#22d3ee]/30' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}>Posterior</button>
      </div>

      {vistaDetalle && (
        <button onClick={volverCuerpoEntero} className="mb-4 text-[#22d3ee] text-xs font-bold flex items-center gap-1 hover:underline transition-all">
          ← Volver al cuerpo completo
        </button>
      )}

      {/* EL MISMO TRUCO PARA EL CONTENEDOR DE LA CLÍNICA */}
      <div className="w-full h-[450px] md:h-[550px] relative flex items-center justify-center overflow-hidden p-4">
        <div className="w-full h-full max-w-[550px] max-h-[500px] flex items-center justify-center [&_svg]:!w-auto [&_svg]:!h-auto [&_svg]:!max-w-full [&_svg]:!max-h-full [&_svg]:object-contain">
          {renderVista()}
        </div>
      </div>
    </div>
  );
}