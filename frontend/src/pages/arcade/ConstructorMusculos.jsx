// src/pages/arcade/ConstructorMusculos.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

// IMPORTAMOS TODAS LAS VISTAS
import VistaBrazo from '../../components/clinica/BodyChart/vistas/VistaBrazo';
import VistaPierna from '../../components/clinica/BodyChart/vistas/VistaPierna';
import VistaTorax from '../../components/clinica/BodyChart/vistas/VistaTorax';
import VistaCabeza from '../../components/clinica/BodyChart/vistas/VistaCabeza';
import VistaMano from '../../components/clinica/BodyChart/vistas/VistaMano';
import VistaPie from '../../components/clinica/BodyChart/vistas/VistaPie';

const NIVELES = {
  brazo: {
    titulo: 'Brazo Completo',
    vista: 'brazo',
    etiquetas: [
      { id: 'biceps', label: 'Bíceps', cara: 'anterior' },
      { id: 'codo', label: 'Codo', cara: 'anterior' },
      { id: 'muneca', label: 'Muñeca', cara: 'anterior' },
      { id: 'triceps', label: 'Tríceps', cara: 'posterior' }
    ]
  },
  pierna: {
    titulo: 'Pierna Completa',
    vista: 'pierna',
    etiquetas: [
      { id: 'cuadriceps', label: 'Cuádriceps', cara: 'anterior' },
      { id: 'tibial_ant', label: 'Tibial Anterior', cara: 'anterior' },
      { id: 'isquiotibiales', label: 'Isquiotibiales', cara: 'posterior' },
      { id: 'gemelos_post', label: 'Gemelos', cara: 'posterior' }
    ]
  },
  torax: {
    titulo: 'Tórax y Espalda',
    vista: 'torax',
    etiquetas: [
      { id: 'pectoral_izq', label: 'Pectoral Izq', cara: 'anterior' },
      { id: 'abdomen', label: 'Abdomen', cara: 'anterior' },
      { id: 'trapecio_der', label: 'Trapecio Der', cara: 'posterior' },
      { id: 'escapula_izq', label: 'Escápula Izq', cara: 'posterior' }
    ]
  },
  cabeza: {
    titulo: 'Cabeza y Cuello',
    vista: 'cabeza',
    etiquetas: [
      { id: 'frente', label: 'Frente', cara: 'anterior' },
      { id: 'atm_izq', label: 'ATM Izq', cara: 'anterior' },
      { id: 'occipital', label: 'Occipital', cara: 'posterior' },
      { id: 'nuca', label: 'Nuca', cara: 'posterior' }
    ]
  },
  mano: {
    titulo: 'Mano Completa',
    vista: 'mano',
    etiquetas: [
      { id: 'carpo', label: 'Carpo', cara: 'anterior' },
      { id: 'metacarpo', label: 'Metacarpo', cara: 'anterior' },
      { id: 'falanges_prox', label: 'Falanges Prox', cara: 'anterior' },
      { id: 'pulgar', label: 'Pulgar', cara: 'anterior' }
    ]
  },
  pie: {
    titulo: 'Pie Completo',
    vista: 'pie',
    etiquetas: [
      { id: 'retropie_completo', label: 'Retropié', cara: 'lateral' },
      { id: 'mediopie_tarsos', label: 'Mediopié', cara: 'lateral' },
      { id: 'antepie_metatarsos', label: 'Metatarsianos', cara: 'lateral' },
      { id: 'talon_plantar', label: 'Talón', cara: 'plantar' }
    ]
  }
};

export default function ConstructorMusculos({ temaOscuro }) {
  const navigate = useNavigate();
  const [nivelActivo, setNivelActivo] = useState(null);
  
  const [etiquetasRestantes, setEtiquetasRestantes] = useState([]);
  const [etiquetaSeleccionada, setEtiquetaSeleccionada] = useState(null);
  const [colocadas, setColocadas] = useState([]);
  const [juegoCompletado, setJuegoCompletado] = useState(false);
  const [xpGanada, setXpGanada] = useState(0);

  const [caraActual, setCaraActual] = useState('anterior');

  const bgPrincipal = temaOscuro ? 'bg-[#020813] text-white' : 'bg-[#e2e8f0] text-[#0f172a]';
  const bgHUD = temaOscuro ? 'bg-[#0a141d] border-[#22d3ee]/20' : 'bg-white border-gray-300 shadow-md';
  const bgSVG = temaOscuro ? 'bg-[#0a141d] border-gray-800' : 'bg-white border-gray-300 shadow-sm';

  const iniciarJuego = (nivelKey) => {
    setNivelActivo(nivelKey);
    setEtiquetasRestantes([...NIVELES[nivelKey].etiquetas]);
    setEtiquetaSeleccionada(null);
    setColocadas([]);
    setJuegoCompletado(false);
    setXpGanada(0);
    // Si es pie, empezamos en vista lateral, si no, en anterior
    setCaraActual(nivelKey === 'pie' ? 'lateral' : 'anterior'); 
  };

  const handleDragStart = (e, etiqueta) => {
    setEtiquetaSeleccionada(etiqueta);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', etiqueta.id); 
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleLabelClick = (etiqueta) => {
    if (colocadas.includes(etiqueta.id)) return;
    setEtiquetaSeleccionada(etiqueta);
    if (etiqueta.cara !== caraActual) {
      setCaraActual(etiqueta.cara);
    }
  };

  const handleRegionClick = async (zonaId) => {
    if (!etiquetaSeleccionada) return;
    
    if (etiquetaSeleccionada.id === zonaId) {
      const nuevasColocadas = [...colocadas, zonaId];
      setColocadas(nuevasColocadas);
      setEtiquetasRestantes(prev => prev.filter(e => e.id !== zonaId));
      setEtiquetaSeleccionada(null);

      if (nuevasColocadas.length === NIVELES[nivelActivo].etiquetas.length) {
        setJuegoCompletado(true);
        guardarProgreso();
      }
    }
  };

  const guardarProgreso = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const xpFinal = 25; // <-- XP REDUCIDA
      setXpGanada(xpFinal);

      const { data: progreso } = await supabase
        .from('progreso_arcade')
        .select('xp_total')
        .eq('user_id', user.id)
        .single();

      await supabase
        .from('progreso_arcade')
        .update({ xp_total: (progreso?.xp_total || 0) + xpFinal })
        .eq('user_id', user.id);
    } catch (error) { console.error(error); }
  };

  if (!nivelActivo) {
    const ZONAS_MENU = [
      { id: 'brazo', name: 'Brazo', emoji: '💪', color: 'text-cyan-400' },
      { id: 'pierna', name: 'Pierna', emoji: '🦵', color: 'text-emerald-400' },
      { id: 'torax', name: 'Tórax', emoji: '🫀', color: 'text-purple-400' },
      { id: 'cabeza', name: 'Cabeza', emoji: '🧠', color: 'text-orange-400' },
      { id: 'mano', name: 'Mano', emoji: '🖐️', color: 'text-pink-400' },
      { id: 'pie', name: 'Pie', emoji: '🦶', color: 'text-blue-400' },
    ];

    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 font-sans select-none ${bgPrincipal}`}>
        <button onClick={() => navigate('/arcade')} className="absolute top-6 left-6 text-xs text-gray-500 hover:text-cyan-500 font-bold">← Volver al Arcade</button>
        
        <div className="text-center mb-8 mt-12">
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-2">CONSTRUCTOR DE <span className="text-[#22d3ee]">MÚSCULOS</span></h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Selecciona una región</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-4xl">
          {ZONAS_MENU.map((zona) => (
            <div 
              key={zona.id} 
              onClick={() => iniciarJuego(zona.id)} 
              className={`${bgHUD} border rounded-3xl p-6 flex flex-col items-center cursor-pointer hover:-translate-y-2 transition-all group`}
            >
              <span className={`text-6xl mb-4 group-hover:scale-110 transition-transform ${zona.color}`}>{zona.emoji}</span>
              <h2 className={`text-lg font-black ${temaOscuro ? 'text-white' : 'text-gray-800'}`}>{zona.name}</h2>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const renderSVG = () => {
    const propsSVG = {
      regionesSeleccionadas: colocadas,
      onRegionToggle: handleRegionClick,
      temaOscuro: temaOscuro,
      cara: caraActual,
      lado: 'derecho'
    };
    
    // AQUÍ ESTÁ LA CORRECCIÓN: Evaluamos todas las zonas
    if (nivelActivo === 'brazo') return <VistaBrazo {...propsSVG} />;
    if (nivelActivo === 'torax') return <VistaTorax {...propsSVG} />;
    if (nivelActivo === 'cabeza') return <VistaCabeza {...propsSVG} />;
    if (nivelActivo === 'mano') return <VistaMano {...propsSVG} />;
    if (nivelActivo === 'pie') return <VistaPie {...propsSVG} />;
    return <VistaPierna {...propsSVG} />;
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 font-sans select-none relative ${bgPrincipal}`}>
      <button onClick={() => setNivelActivo(null)} className="absolute top-6 left-6 text-xs text-gray-500 hover:text-cyan-500 font-bold">← Cambiar Zona</button>

      <style>{`
        .svg-box text, .svg-box h4 { display: none !important; }
        .svg-box > div {
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .svg-box svg {
          width: 100% !important;
          height: 100% !important;
          max-width: 100% !important;
          max-height: 100% !important;
        }
      `}</style>

      <div className={`w-full max-w-2xl flex justify-between items-center mb-4 p-4 rounded-2xl border ${bgHUD}`}>
        {/* TÍTULO DINÁMICO AQUÍ */}
        <div>
          <h1 className="text-xl font-black text-[#22d3ee] uppercase">
            {NIVELES[nivelActivo].titulo}
          </h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Constructor de Músculos</p>
        </div>
        <div className={`px-4 py-2 rounded-xl border font-mono text-sm ${temaOscuro ? 'bg-[#020813] border-gray-800' : 'bg-gray-100'}`}>
          🧩 {colocadas.length} / {NIVELES[nivelActivo].etiquetas.length}
        </div>
      </div>

      {!juegoCompletado ? (
        <div className="w-full max-w-2xl flex flex-col items-center">
          
          <div className={`w-full border rounded-2xl p-4 text-center mb-4 flex justify-between items-center ${bgHUD}`}>
            <div className="flex-1 text-left">
              <h2 className="text-sm font-black text-gray-500">
                {etiquetaSeleccionada ? `Toca la zona de: ${etiquetaSeleccionada.label}` : 'Selecciona una etiqueta'}
              </h2>
            </div>
            
            <button 
              onClick={() => {
                if (nivelActivo === 'pie') {
                  setCaraActual(caraActual === 'lateral' ? 'plantar' : 'lateral');
                } else {
                  setCaraActual(caraActual === 'anterior' ? 'posterior' : 'anterior');
                }
              }}
              className="ml-4 px-3 py-1 bg-[#22d3ee]/20 text-[#22d3ee] border border-[#22d3ee]/30 rounded-lg text-xs font-bold hover:bg-[#22d3ee] hover:text-black transition-all"
            >
              🔄 Girar
            </button>
          </div>

          <div 
            className={`svg-box relative w-full h-[45vh] md:h-[50vh] border rounded-3xl flex items-center justify-center p-2 mb-6 ${bgSVG} overflow-hidden`}
            onDragOver={handleDragOver}
            onDrop={(e) => { /* Soltamos el item sobre el SVG */ }}
          >
            {renderSVG()}
          </div>

          <div className="flex flex-wrap justify-center gap-3 w-full">
            {etiquetasRestantes.map(etq => (
              <button
                key={etq.id}
                draggable
                onDragStart={(e) => handleDragStart(e, etq)}
                onClick={() => handleLabelClick(etq)}
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all border-2 cursor-grab active:cursor-grabbing
                  ${etiquetaSeleccionada?.id === etq.id 
                    ? 'bg-[#22d3ee] border-[#22d3ee] text-black scale-105 shadow-lg shadow-[#22d3ee]/30' 
                    : temaOscuro 
                      ? 'bg-[#0a141d] border-gray-700 text-gray-300 hover:border-gray-500' 
                      : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                  }
                `}
              >
                {etq.label}
              </button>
            ))}
          </div>

        </div>
      ) : (
        <div className={`w-full max-w-xl border rounded-3xl p-6 text-center shadow-xl ${bgHUD}`}>
          <div className="text-5xl mb-4">🧩</div>
          <h2 className="text-2xl font-black mb-2">¡CONSTRUCCIÓN EXITOSA!</h2>
          <div className={`border rounded-2xl p-4 mb-6 ${temaOscuro ? 'bg-[#020813] border-gray-800' : 'bg-gray-100'}`}>
            <p className="text-4xl font-black text-[#22d3ee] font-mono">+{xpGanada} XP</p>
          </div>
          <button onClick={() => setNivelActivo(null)} className="w-full py-3 rounded-2xl font-black bg-[#22d3ee] text-black hover:bg-[#1bc1da] transition-all">Volver</button>
        </div>
      )}
    </div>
  );
}