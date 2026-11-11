import { useState, useEffect } from 'react';

import VistaGeneral from '../components/clinica/BodyChart/vistas/VistaGeneral';
import VistaManoPro from '../components/clinica/BodyChart/vistas/VistaManoPro';
import VistaPiePro from '../components/clinica/BodyChart/vistas/VistaPiePro';
import VistaTobilloPro from '../components/clinica/BodyChart/vistas/VistaTobilloPro';
import VistaPiernaPro from '../components/clinica/BodyChart/vistas/VistaPiernaPro';
import VistaHombroPro from '../components/clinica/BodyChart/vistas/VistaHombroPro';
import VistaCodoPro from '../components/clinica/BodyChart/vistas/VistaCodoPro';
import VistaBrazoPro from '../components/clinica/BodyChart/vistas/VistaBrazoPro';
import VistaRodillaPro from '../components/clinica/BodyChart/vistas/VistaRodillaPro';
import VistaColumnaPro from '../components/clinica/BodyChart/vistas/VistaColumnaPro';
import VistaLumbarPro from '../components/clinica/BodyChart/vistas/VistaLumbarPro';
import VistaPelvisPro from '../components/clinica/BodyChart/vistas/VistaPelvisPro';
import VistaCabezaPro from '../components/clinica/BodyChart/vistas/VistaCabezaPro';
import VistaToraxPro from '../components/clinica/BodyChart/vistas/VistaToraxPro';

const SINTOMAS = [
  { id: 'dolor', nombre: 'Dolor', color: '#ef4444', border: '#f87171' },
  { id: 'inflamacion', nombre: 'Inflamación', color: '#f59e0b', border: '#fbbf24' },
  { id: 'neuropatia', nombre: 'Neuropatía', color: '#a855f7', border: '#c084fc' },
  { id: 'rigidez', nombre: 'Rigidez', color: '#22d3ee', border: '#a5f3fc' },
];

export default function LaboratorioPro({ temaOscuro }) {
  const [vistaActiva, setVistaActiva] = useState('mano'); 
  const [cara, setCara] = useState('dorsal');
  const [sintomaActivo, setSintomaActivo] = useState(SINTOMAS[0]);
  const [afectaciones, setAfectaciones] = useState({});

  useEffect(() => {
    if (vistaActiva === 'general') setCara('anterior');
    else if (vistaActiva === 'mano') setCara('dorsal');
    else if (vistaActiva === 'pie') setCara('lateral');
    else if (vistaActiva === 'tobillo') setCara('lateral');
    else if (vistaActiva === 'pierna') setCara('anterior');
    else if (vistaActiva === 'hombro') setCara('anterior');
    else if (vistaActiva === 'codo') setCara('anterior');
    else if (vistaActiva === 'brazo') setCara('anterior');
    else if (vistaActiva === 'rodilla') setCara('anterior');
    else if (vistaActiva === 'columna') setCara('posterior');
    else if (vistaActiva === 'lumbar') setCara('posterior');
    else if (vistaActiva === 'pelvis') setCara('anterior');
    else if (vistaActiva === 'cabeza') setCara('anterior');
    else if (vistaActiva === 'torax') setCara('anterior');
    
    setAfectaciones({}); 
  }, [vistaActiva]);

  const toggleRegion = (id) => {
    setAfectaciones(prev => {
      const copy = { ...prev };
      if (copy[id]) delete copy[id];
      else copy[id] = sintomaActivo;
      return copy;
    });
  };

  const girarVista = () => {
    if (vistaActiva === 'general') setCara(prev => prev === 'anterior' ? 'posterior' : 'anterior');
    else if (vistaActiva === 'mano') setCara(prev => prev === 'dorsal' ? 'palmar' : 'dorsal');
    else if (vistaActiva === 'pie') setCara(prev => prev === 'lateral' ? 'plantar' : 'lateral');
    else if (vistaActiva === 'tobillo') setCara(prev => prev === 'lateral' ? 'medial' : 'lateral');
    else if (vistaActiva === 'pierna') setCara(prev => prev === 'anterior' ? 'posterior' : 'anterior');
    else if (vistaActiva === 'hombro') setCara(prev => prev === 'anterior' ? 'posterior' : 'anterior');
    else if (vistaActiva === 'codo') setCara(prev => prev === 'anterior' ? 'posterior' : 'anterior');
    else if (vistaActiva === 'brazo') setCara(prev => prev === 'anterior' ? 'posterior' : 'anterior');
    else if (vistaActiva === 'rodilla') setCara(prev => prev === 'anterior' ? 'posterior' : 'anterior');
    else if (vistaActiva === 'columna') setCara(prev => prev === 'posterior' ? 'anterior' : 'posterior');
    else if (vistaActiva === 'lumbar') setCara(prev => prev === 'posterior' ? 'anterior' : 'posterior');
    else if (vistaActiva === 'pelvis') setCara(prev => prev === 'anterior' ? 'posterior' : 'anterior');
    else if (vistaActiva === 'cabeza') setCara(prev => prev === 'anterior' ? 'posterior' : 'anterior');
    else if (vistaActiva === 'torax') setCara(prev => prev === 'anterior' ? 'posterior' : 'anterior');
  };

  const bgPrincipal = temaOscuro ? 'bg-[#020813] text-white' : 'bg-[#e2e8f0] text-[#0f172a]';
  const bgHUD = temaOscuro ? 'bg-[#0a141d] border-[#22d3ee]/20' : 'bg-white border-gray-300 shadow-md';

  return (
    <div className={`min-h-screen p-4 md:p-8 font-sans ${bgPrincipal}`}>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-black mb-2 text-[#22d3ee]">Laboratorio de Vistas Pro</h1>
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-8">Prueba de SVGs detallados para la Clínica</p>

        <div className="flex flex-wrap gap-3 mb-6">
          <button onClick={() => setVistaActiva('general')} className={`px-3 py-2 rounded-xl font-bold text-sm transition-all ${vistaActiva === 'general' ? 'bg-[#22d3ee] text-black shadow-lg' : bgHUD}`}>👤 General</button>
          <button onClick={() => setVistaActiva('cabeza')} className={`px-3 py-2 rounded-xl font-bold text-sm transition-all ${vistaActiva === 'cabeza' ? 'bg-[#22d3ee] text-black shadow-lg' : bgHUD}`}>Cabeza</button>
          <button onClick={() => setVistaActiva('torax')} className={`px-3 py-2 rounded-xl font-bold text-sm transition-all ${vistaActiva === 'torax' ? 'bg-[#22d3ee] text-black shadow-lg' : bgHUD}`}>Tórax</button>
          <button onClick={() => setVistaActiva('columna')} className={`px-3 py-2 rounded-xl font-bold text-sm transition-all ${vistaActiva === 'columna' ? 'bg-[#22d3ee] text-black shadow-lg' : bgHUD}`}>Columna</button>
          <button onClick={() => setVistaActiva('lumbar')} className={`px-3 py-2 rounded-xl font-bold text-sm transition-all ${vistaActiva === 'lumbar' ? 'bg-[#22d3ee] text-black shadow-lg' : bgHUD}`}>Lumbar</button>
          <button onClick={() => setVistaActiva('pelvis')} className={`px-3 py-2 rounded-xl font-bold text-sm transition-all ${vistaActiva === 'pelvis' ? 'bg-[#22d3ee] text-black shadow-lg' : bgHUD}`}>Pelvis</button>
          <button onClick={() => setVistaActiva('hombro')} className={`px-3 py-2 rounded-xl font-bold text-sm transition-all ${vistaActiva === 'hombro' ? 'bg-[#22d3ee] text-black shadow-lg' : bgHUD}`}>Hombro</button>
          <button onClick={() => setVistaActiva('brazo')} className={`px-3 py-2 rounded-xl font-bold text-sm transition-all ${vistaActiva === 'brazo' ? 'bg-[#22d3ee] text-black shadow-lg' : bgHUD}`}>Brazo</button>
          <button onClick={() => setVistaActiva('codo')} className={`px-3 py-2 rounded-xl font-bold text-sm transition-all ${vistaActiva === 'codo' ? 'bg-[#22d3ee] text-black shadow-lg' : bgHUD}`}>Codo</button>
          <button onClick={() => setVistaActiva('mano')} className={`px-3 py-2 rounded-xl font-bold text-sm transition-all ${vistaActiva === 'mano' ? 'bg-[#22d3ee] text-black shadow-lg' : bgHUD}`}>Mano</button>
          <button onClick={() => setVistaActiva('pierna')} className={`px-3 py-2 rounded-xl font-bold text-sm transition-all ${vistaActiva === 'pierna' ? 'bg-[#22d3ee] text-black shadow-lg' : bgHUD}`}>Pierna</button>
          <button onClick={() => setVistaActiva('rodilla')} className={`px-3 py-2 rounded-xl font-bold text-sm transition-all ${vistaActiva === 'rodilla' ? 'bg-[#22d3ee] text-black shadow-lg' : bgHUD}`}>Rodilla</button>
          <button onClick={() => setVistaActiva('tobillo')} className={`px-3 py-2 rounded-xl font-bold text-sm transition-all ${vistaActiva === 'tobillo' ? 'bg-[#22d3ee] text-black shadow-lg' : bgHUD}`}>Tobillo</button>
          <button onClick={() => setVistaActiva('pie')} className={`px-3 py-2 rounded-xl font-bold text-sm transition-all ${vistaActiva === 'pie' ? 'bg-[#22d3ee] text-black shadow-lg' : bgHUD}`}>Pie</button>
        </div>

        <div className={`p-4 md:p-6 rounded-3xl border ${bgHUD} mb-6`}>
          <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
            <button onClick={girarVista} className="px-4 py-2 bg-black/20 text-[#22d3ee] border border-[#22d3ee]/30 rounded-xl font-bold text-sm hover:bg-[#22d3ee] hover:text-black transition-all">
              🔄 Girar Vista
            </button>
            <div className="flex flex-wrap gap-2">
              {SINTOMAS.map(s => (
                <button key={s.id} onClick={() => setSintomaActivo(s)} className={`px-3 py-1.5 rounded-lg font-bold text-xs border-2 transition-all ${sintomaActivo.id === s.id ? 'scale-105 border-white shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`} style={{ backgroundColor: `${s.color}20`, color: s.color }}>
                  {s.nombre}
                </button>
              ))}
            </div>
          </div>

          {/* EL "MARCO" DEFINITIVO: max-w-[450px] y max-h-[450px] centran y limitan el SVG */}
          <div className="w-full h-[60vh] max-h-[600px] bg-black/10 rounded-2xl flex items-center justify-center relative overflow-hidden p-4">
            <div className="w-full h-full max-w-[395px] max-h-[500px] flex items-center justify-center [&_svg]:w-full [&_svg]:h-full [&_svg]:object-contain">
              
              {vistaActiva === 'general' && (
                <VistaGeneral 
                  cara={cara} 
                  temaOscuro={temaOscuro}
                  regionesSeleccionadas={Object.keys(afectaciones)}
                  onRegionToggle={toggleRegion} 
                  onSeleccionarRegion={(id) => console.log('Click en:', id)} 
                />
              )}
              
              {vistaActiva === 'cabeza' && <VistaCabezaPro cara={cara} lado="derecho" afectaciones={afectaciones} onRegionToggle={toggleRegion} />}
              {vistaActiva === 'torax' && <VistaToraxPro cara={cara} lado="derecho" afectaciones={afectaciones} onRegionToggle={toggleRegion} />}
              {vistaActiva === 'columna' && <VistaColumnaPro cara={cara} lado="derecho" afectaciones={afectaciones} onRegionToggle={toggleRegion} />}
              {vistaActiva === 'lumbar' && <VistaLumbarPro cara={cara} lado="derecho" afectaciones={afectaciones} onRegionToggle={toggleRegion} />}
              {vistaActiva === 'pelvis' && <VistaPelvisPro cara={cara} lado="derecho" afectaciones={afectaciones} onRegionToggle={toggleRegion} />}
              {vistaActiva === 'hombro' && <VistaHombroPro cara={cara} lado="derecho" afectaciones={afectaciones} onRegionToggle={toggleRegion} />}
              {vistaActiva === 'brazo' && <VistaBrazoPro cara={cara} lado="derecho" afectaciones={afectaciones} onRegionToggle={toggleRegion} />}
              {vistaActiva === 'codo' && <VistaCodoPro cara={cara} lado="derecho" afectaciones={afectaciones} onRegionToggle={toggleRegion} />}
              {vistaActiva === 'mano' && <VistaManoPro cara={cara} lado="derecho" afectaciones={afectaciones} onRegionToggle={toggleRegion} />}
              {vistaActiva === 'pierna' && <VistaPiernaPro cara={cara} lado="derecho" afectaciones={afectaciones} onRegionToggle={toggleRegion} />}
              {vistaActiva === 'rodilla' && <VistaRodillaPro cara={cara} lado="derecho" afectaciones={afectaciones} onRegionToggle={toggleRegion} />}
              {vistaActiva === 'tobillo' && <VistaTobilloPro cara={cara} lado="derecho" afectaciones={afectaciones} onRegionToggle={toggleRegion} />}
              {vistaActiva === 'pie' && <VistaPiePro cara={cara} lado="derecho" afectaciones={afectaciones} onRegionToggle={toggleRegion} />}
            </div>
          </div>
        </div>

        <div className={`border rounded-2xl p-4 ${bgHUD}`}>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-black uppercase tracking-wider text-[#22d3ee]">Reporte de Hallazgos</h2>
            {Object.keys(afectaciones).length > 0 && (
              <button onClick={() => setAfectaciones({})} className="text-red-500 font-bold text-xs hover:underline">Limpiar Todo</button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(afectaciones).length === 0 ? (
              <p className="text-xs text-gray-500 italic">Haz clic en los huesos o tejidos para registrar una afectación.</p>
            ) : (
              Object.entries(afectaciones).map(([id, sintoma]) => (
                <span key={id} className="px-3 py-1.5 rounded-xl text-xs font-bold font-mono border flex items-center gap-2 animate-fade-in" style={{ backgroundColor: `${sintoma.color}15`, borderColor: sintoma.border, color: sintoma.color }}>
                  <span className="capitalize">{id.replace(/_/g, ' ')}</span>
                  <span className="opacity-70">→</span>
                  <span>{sintoma.nombre}</span>
                  <button onClick={() => toggleRegion(id)} className="hover:text-white ml-1">✕</button>
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}