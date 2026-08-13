// src/components/clinica/BodyChart/BodyChartContainer.jsx
import { useState } from 'react';
import { VISTAS } from './regionesConfig';

import VistaGeneral from './vistas/VistaGeneral';
import VistaCabeza from './vistas/VistaCabeza';
import VistaTorax from './vistas/VistaTorax';
import VistaPelvis from './vistas/VistaPelvis';
import VistaBrazo from './vistas/VistaBrazo';
import VistaMano from './vistas/VistaMano'; // Asegúrate de tener este import
import VistaPierna from './vistas/VistaPierna';
import VistaPie from './vistas/VistaPie';
import VistaHombro from './vistas/VistaHombro';
import VistaRodilla from './vistas/VistaRodilla';
import VistaLumbar from './vistas/VistaLumbar';

export default function BodyChartContainer({
  regionesSeleccionadas = [],
  onRegionToggle,
  temaOscuro,
  vistaDetalle,
  setVistaDetalle
}) {
  const [cara, setCara] = useState('anterior');

  const MAPA_VISTAS = {
    cabeza: 'cabeza',
    torax: 'torax',
    pelvis: 'pelvis',
    cadera: 'pelvis',
    brazo_izq: 'brazo_izq',
    brazo_der: 'brazo_der',
    mano_izq: 'mano_izq',     // <-- Añadido
    mano_der: 'mano_der',     // <-- Añadido
    pierna_izq: 'pierna_izq',
    pierna_der: 'pierna_der',
    pie_izq: 'pie_izq',
    pie_der: 'pie_der',
    hombro_izq: 'hombro_izq',
    hombro_der: 'hombro_der',
    rodilla_izq: 'rodilla_izq',
    rodilla_der: 'rodilla_der',
    lumbar: 'lumbar',
  };

  const seleccionarRegion = (regionId) => {
    const vista = MAPA_VISTAS[regionId];
    if (vista) {
      setVistaDetalle(vista);
    } else {
      onRegionToggle(regionId);
    }
  };

  const volverCuerpoEntero = () => {
    setVistaDetalle(null);
  };

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

    let lado = null;
    let vistaBase = vistaDetalle;
    if (vistaDetalle.endsWith('_izq')) {
      lado = 'izquierdo';
      vistaBase = vistaDetalle.slice(0, -4);
    } else if (vistaDetalle.endsWith('_der')) {
      lado = 'derecho';
      vistaBase = vistaDetalle.slice(0, -4);
    }

    switch (vistaBase) {
      case 'cabeza':
        return <VistaCabeza cara={cara} onRegionToggle={onRegionToggle} regionesSeleccionadas={regionesSeleccionadas} />;
      case 'torax':
        return <VistaTorax cara={cara} onRegionToggle={onRegionToggle} regionesSeleccionadas={regionesSeleccionadas} />;
      case 'pelvis':
        return <VistaPelvis cara={cara} onRegionToggle={onRegionToggle} regionesSeleccionadas={regionesSeleccionadas} />;
      case 'brazo':
        return <VistaBrazo cara={cara} lado={lado} onRegionToggle={onRegionToggle} regionesSeleccionadas={regionesSeleccionadas} />;
      case 'mano':                                                                                                                      // <-- Añadido
        return <VistaMano cara={cara} lado={lado} onRegionToggle={onRegionToggle} regionesSeleccionadas={regionesSeleccionadas} />;       // <-- Añadido
      case 'pierna':
        return <VistaPierna cara={cara} lado={lado} onRegionToggle={onRegionToggle} regionesSeleccionadas={regionesSeleccionadas} />;
      case 'pie':
        return <VistaPie cara={cara} lado={lado} onRegionToggle={onRegionToggle} regionesSeleccionadas={regionesSeleccionadas} />;
      case 'hombro':
        return <VistaHombro cara={cara} lado={lado} onRegionToggle={onRegionToggle} regionesSeleccionadas={regionesSeleccionadas} />;
      case 'rodilla':
        return <VistaRodilla cara={cara} lado={lado} onRegionToggle={onRegionToggle} regionesSeleccionadas={regionesSeleccionadas} />;
      case 'lumbar':
        return <VistaLumbar cara={cara} lado={lafdo} onRegionToggle={onRegionToggle} regionesSeleccionadas={regionesSeleccionadas} />;
      default:
        return <div className="text-gray-400 text-center p-4">Vista no disponible para "{vistaDetalle}"</div>;
    }
  };

  const bgContainer = temaOscuro ? 'bg-slate-900/50' : 'bg-gray-100/50';

  return (
    <div className={`w-full max-w-md mx-auto p-4 rounded-2xl ${bgContainer} border border-gray-700`}>
      <div className="flex justify-center gap-4 mb-4">
        <button
          onClick={() => setCara('anterior')}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
            cara === 'anterior' ? 'bg-[#22d3ee] text-black shadow-lg shadow-[#22d3ee]/30' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
          }`}
        >
          👤 Anterior
        </button>
        <button
          onClick={() => setCara('posterior')}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
            cara === 'posterior' ? 'bg-[#22d3ee] text-black shadow-lg shadow-[#22d3ee]/30' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
          }`}
        >
          🔙 Posterior
        </button>
      </div>

      {vistaDetalle && (
        <button onClick={volverCuerpoEntero} className="mb-4 text-[#22d3ee] text-xs font-bold flex items-center gap-1 hover:underline transition-all">
          ← Volver al cuerpo completo
        </button>
      )}

      <div className="w-full relative">{renderVista()}</div>
    </div>
  );
}