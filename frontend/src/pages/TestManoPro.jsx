// src/pages/TestManoPro.jsx
import { useState } from 'react';
import VistaManoPro from '../components/clinica/BodyChart/vistas/VistaManoPro';

export default function TestManoPro({ temaOscuro }) {
  const [cara, setCara] = useState('dorsal');
  const [sintoma, setSintoma] = useState({ id: 'dolor', nombre: 'Dolor', color: '#ef4444', border: '#f87171' });
  const [afectaciones, setAfectaciones] = useState({});

  const TIPOS = [
    { id: 'dolor', nombre: 'Dolor', color: '#ef4444', border: '#f87171' },
    { id: 'inflamacion', nombre: 'Inflamación', color: '#f59e0b', border: '#fbbf24' },
    { id: 'neuropatia', nombre: 'Neuropatía', color: '#a855f7', border: '#c084fc' },
  ];

  const toggleRegion = (id) => {
    setAfectaciones(prev => {
      const copy = { ...prev };
      if (copy[id]) delete copy[id];
      else copy[id] = sintoma;
      return copy;
    });
  };

  return (
    <div className={`min-h-screen p-6 ${temaOscuro ? 'bg-[#020813] text-white' : 'bg-gray-100 text-black'}`}>
      <div className="max-w-3xl mx-auto">
        <div className="flex gap-4 mb-6">
          <button onClick={() => setCara(cara === 'dorsal' ? 'palmar' : 'dorsal')} className="bg-[#22d3ee] text-black px-4 py-2 rounded-xl font-bold">
            Cambiar a vista {cara === 'dorsal' ? 'Palmar' : 'Dorsal'}
          </button>
          {TIPOS.map(t => (
            <button key={t.id} onClick={() => setSintoma(t)} style={{ backgroundColor: t.color + '20', color: t.color }} className="px-4 py-2 rounded-xl font-bold border border-current">
              {t.nombre}
            </button>
          ))}
        </div>
        <div className="h-[600px] bg-[#0a141d] rounded-3xl border border-gray-700 p-4">
          <VistaManoPro cara={cara} lado="derecho" afectaciones={afectaciones} onRegionToggle={toggleRegion} />
        </div>
      </div>
    </div>
  );
}