// src/pages/arcade/StickmanReto.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { consultarAuraIA } from '../../services/iaService';

// Importamos TODOS los SVGs detallados
import VistaPierna from '../../components/clinica/BodyChart/vistas/VistaPierna';
import VistaBrazo from '../../components/clinica/BodyChart/vistas/VistaBrazo';
import VistaTorax from '../../components/clinica/BodyChart/vistas/VistaTorax';
import VistaCabeza from '../../components/clinica/BodyChart/vistas/VistaCabeza';
import VistaMano from '../../components/clinica/BodyChart/vistas/VistaMano';
import VistaPie from '../../components/clinica/BodyChart/vistas/VistaPie';

const PREGUNTAS_NIVELES = {
  pierna: [
    { id: 1, zona: 'cuadriceps', instruccion: 'Toca el Cuádriceps', dato: 'El cuádriceps está formado por 4 músculos y es el principal extensor de la rodilla.', vista: 'pierna', cara: 'anterior', lado: 'derecho' },
    { id: 2, zona: 'tibial_ant', instruccion: 'Toca el Tibial Anterior', dato: 'El tibial anterior es el principal dorsiflexor del pie.', vista: 'pierna', cara: 'anterior', lado: 'derecho' },
    { id: 3, zona: 'isquiotibiales', instruccion: 'Toca los Isquiotibiales', dato: 'Los isquiotibiales son los principales flexores de la rodilla.', vista: 'pierna', cara: 'posterior', lado: 'derecho' },
    { id: 4, zona: 'gemelos_post', instruccion: 'Toca los Gemelos', dato: 'El gastrocnemio y el sóleo forman el tríceps sural.', vista: 'pierna', cara: 'posterior', lado: 'derecho' }
  ],
  brazo: [
    { id: 1, zona: 'biceps', instruccion: 'Toca el Bíceps', dato: 'El bíceps braquial es un potente flexor y supinador.', vista: 'brazo', cara: 'anterior', lado: 'derecho' },
    { id: 2, zona: 'codo', instruccion: 'Toca el Codo', dato: 'La articulación del codo permite la flexo-extensión.', vista: 'brazo', cara: 'anterior', lado: 'derecho' },
    { id: 3, zona: 'muneca', instruccion: 'Toca la Muñeca', dato: 'El complejo articular de la muñeca permite variedad de movimientos.', vista: 'brazo', cara: 'anterior', lado: 'derecho' },
    { id: 4, zona: 'triceps', instruccion: 'Toca el Tríceps', dato: 'El tríceps es el principal extensor del codo.', vista: 'brazo', cara: 'posterior', lado: 'derecho' }
  ],
  torax: [
    { id: 1, zona: 'pectoral_izq', instruccion: 'Toca el Pectoral Izquierdo', dato: 'El pectoral mayor es el principal aductor del hombro.', vista: 'torax', cara: 'anterior', lado: 'derecho' },
    { id: 2, zona: 'abdomen', instruccion: 'Toca el Abdomen', dato: 'El recto abdominal es clave para la flexión del tronco.', vista: 'torax', cara: 'anterior', lado: 'derecho' },
    { id: 3, zona: 'trapecio_der', instruccion: 'Toca el Trapecio Derecho', dato: 'El trapecio superior eleva la escápula.', vista: 'torax', cara: 'posterior', lado: 'derecho' },
    { id: 4, zona: 'escapula_izq', instruccion: 'Toca la Escápula Izquierda', dato: 'La escápula conecta el húmero con la clavícula.', vista: 'torax', cara: 'posterior', lado: 'derecho' }
  ],
  cabeza: [
    { id: 1, zona: 'frente', instruccion: 'Toca la Frente', dato: 'El hueso frontal protege el lóbulo frontal del cerebro.', vista: 'cabeza', cara: 'anterior', lado: 'derecho' },
    { id: 2, zona: 'atm_izq', instruccion: 'Toca la ATM Izquierda', dato: 'La Articulación Temporomandibular conecta el maxilar con el cráneo.', vista: 'cabeza', cara: 'anterior', lado: 'derecho' },
    { id: 3, zona: 'occipital', instruccion: 'Toca el Occipital', dato: 'El hueso occipital se encuentra en la parte posterior del cráneo.', vista: 'cabeza', cara: 'posterior', lado: 'derecho' },
    { id: 4, zona: 'nuca', instruccion: 'Toca la Nuca (Cervical)', dato: 'La región cervical soporta el peso de la cabeza.', vista: 'cabeza', cara: 'posterior', lado: 'derecho' }
  ],
  mano: [
    { id: 1, zona: 'carpo', instruccion: 'Toca el Carpo', dato: 'El carpo está formado por 8 huesos.', vista: 'mano', cara: 'anterior', lado: 'derecho' },
    { id: 2, zona: 'metacarpo', instruccion: 'Toca el Metacarpo', dato: 'Los 5 metacarpianos forman la palma de la mano.', vista: 'mano', cara: 'anterior', lado: 'derecho' },
    { id: 3, zona: 'falanges_prox', instruccion: 'Toca las Falanges Proximales', dato: 'Son las primeras falanges después de los metacarpianos.', vista: 'mano', cara: 'anterior', lado: 'derecho' },
    { id: 4, zona: 'pulgar', instruccion: 'Toca el Pulgar', dato: 'El pulgar tiene 2 falanges.', vista: 'mano', cara: 'anterior', lado: 'derecho' }
  ],
  pie: [
    { id: 1, zona: 'retropie_calcaneo', instruccion: 'Toca el Retropié / Calcáneo', dato: 'El calcáneo es el hueso más grande del pie.', vista: 'pie', cara: 'lateral', lado: 'derecho' },
    { id: 2, zona: 'mediopie_tarso', instruccion: 'Toca el Mediopié', dato: 'El mediopié incluye los huesos navicular, cuboides y cuneiformes.', vista: 'pie', cara: 'lateral', lado: 'derecho' },
    { id: 3, zona: 'antepie_metatarso', instruccion: 'Toca el Antepié', dato: 'El antepié está formado por metatarsianos y falanges.', vista: 'pie', cara: 'lateral', lado: 'derecho' },
    { id: 4, zona: 'talon_plantar', instruccion: 'Toca el Talón (Vista Plantar)', dato: 'El talón soporta grandes cargas de impacto.', vista: 'pie', cara: 'plantar', lado: 'derecho' }
  ],
  leyenda: []
};

export default function StickmanReto({ temaOscuro }) {
  const navigate = useNavigate();
  const [dificultad, setDificultad] = useState(null);
  const [preguntas, setPreguntas] = useState([]);
  const [indicePregunta, setIndicePregunta] = useState(0);
  const [puntaje, setPuntaje] = useState(0);
  const [estadoZona, setEstadoZona] = useState(null); 
  const [pastillaActiva, setPastillaActiva] = useState(null);
  const [juegoTerminado, setJuegoTerminado] = useState(false);
  const [bloqueado, setBloqueado] = useState(false);
  const [xpGanada, setXpGanada] = useState(0);
  const [cargandoIA, setCargandoIA] = useState(false);

  const bgPrincipal = temaOscuro ? 'bg-[#020813] text-white' : 'bg-[#e2e8f0] text-[#0f172a]';
  const bgHUD = temaOscuro ? 'bg-[#0a141d] border-[#22d3ee]/20' : 'bg-white border-gray-300 shadow-md';
  const bgSVG = temaOscuro ? 'bg-[#0a141d] border-gray-800' : 'bg-white border-gray-300 shadow-sm';

  const preguntaActual = preguntas[indicePregunta];

  const iniciarNivel = (nivel) => {
    setDificultad(nivel);
    if (nivel !== 'leyenda') {
      setPreguntas(PREGUNTAS_NIVELES[nivel]);
      resetearEstado();
    }
  };

  const iniciarLeyendaIA = async () => {
    setCargandoIA(true);
    try {
      const prompt = `Genera un JSON puro (sin markdown) de 5 preguntas clínicas.
      Debes elegir de esta lista EXACTA de opciones (vista, cara, zona, lado):
      - pierna, anterior: cuadriceps, tibial_ant, tobillo
      - pierna, posterior: isquiotibiales, gemelos_post, soleo, tendon_aquiles
      - brazo, anterior: biceps, codo, antebrazo_flex, muneca
      - brazo, posterior: triceps, olecranon
      - torax, anterior: clavicula_izq, pectoral_izq, esternon, costillas_der, abdomen
      - torax, posterior: trapecio_der, escapula_izq, dorsal
      - cabeza, anterior: frente, nariz, boca, atm_izq
      - cabeza, posterior: occipital, nuca
      - mano, anterior: carpo, metacarpo, falanges_prox, pulgar
      - pie, lateral: retropie_calcaneo, mediopie_tarso, antepie_metatarso
      
      Formato exacto: [{"id": 1, "zona": "biceps", "instruccion": "Toca el Bíceps", "dato": "Dato clínico...", "vista": "brazo", "cara": "anterior", "lado": "derecho"}, ...]
      NO INVENTES ZONAS Y ASEGÚRATE DE QUE LA VISTA COINCIDA CON LA ZONA.`;

      const respuestaRaw = await consultarAuraIA(prompt, {});
      const jsonLimpio = respuestaRaw.replace(/```json/g, '').replace(/```/g, '').trim();
      const preguntasIA = JSON.parse(jsonLimpio);

      if (!Array.isArray(preguntasIA) || preguntasIA.length < 3) throw new Error("IA falló");
      
      setDificultad('leyenda');
      setPreguntas(preguntasIA);
      resetearEstado();
    } catch (error) {
      console.error(error);
      alert("Aura está pensando. Intenta de nuevo.");
    } finally {
      setCargandoIA(false);
    }
  };

  const resetearEstado = () => {
    setIndicePregunta(0);
    setPuntaje(0);
    setEstadoZona(null);
    setPastillaActiva(null);
    setJuegoTerminado(false);
    setBloqueado(false);
    setXpGanada(0);
  };

  const guardarProgreso = async (puntajeFinal) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // PUNTOS REDUCIDOS POR ACIERTO
      const xpPorAcierto = dificultad === 'leyenda' ? 50 : 25; // Antes era 150 y 75
      const xpFinal = puntajeFinal * xpPorAcierto;
      setXpGanada(xpFinal);

      const { data: progreso } = await supabase
        .from('progreso_arcade')
        .select('xp_total, aciertos_stickman')
        .eq('user_id', user.id)
        .single();

      await supabase
        .from('progreso_arcade')
        .update({ 
          xp_total: (progreso?.xp_total || 0) + xpFinal,
          aciertos_stickman: (progreso?.aciertos_stickman || 0) + puntajeFinal,
          actualizado_en: new Date().toISOString()
        })
        .eq('user_id', user.id);
    } catch (error) {
      console.error("Error guardando:", error);
    }
  };

  const handleRegionClick = (zonaSeleccionada) => {
    if (bloqueado || juegoTerminado) return;
    const esCorrecto = zonaSeleccionada === preguntaActual.zona;

    if (esCorrecto) {
      setBloqueado(true);
      setEstadoZona('acierto');
      setPuntaje((prev) => prev + 1);
      setPastillaActiva(preguntaActual.dato);

      setTimeout(() => {
        if (indicePregunta + 1 < preguntas.length) {
          setIndicePregunta((prev) => prev + 1);
          setEstadoZona(null);
          setPastillaActiva(null);
          setBloqueado(false);
        } else {
          setJuegoTerminado(true);
          setBloqueado(false);
          guardarProgreso(puntaje + 1);
        }
      }, 4000);
    } else {
      setBloqueado(true);
      setEstadoZona('error');
      setTimeout(() => {
        setEstadoZona(null);
        setBloqueado(false);
      }, 1000);
    }
  };

  if (!dificultad) {
    const REGIONES = [
      { id: 'pierna', name: 'Pierna', emoji: '🦵', color: 'text-emerald-400' },
      { id: 'brazo', name: 'Brazo', emoji: '💪', color: 'text-cyan-400' },
      { id: 'torax', name: 'Tórax', emoji: '🫀', color: 'text-purple-400' },
      { id: 'cabeza', name: 'Cabeza', emoji: '🧠', color: 'text-orange-400' },
      { id: 'mano', name: 'Mano', emoji: '🖐️', color: 'text-pink-400' },
      { id: 'pie', name: 'Pie', emoji: '🦶', color: 'text-blue-400' },
    ];

    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 font-sans select-none ${bgPrincipal}`}>
        <button onClick={() => navigate('/arcade')} className="absolute top-6 left-6 text-xs text-gray-500 hover:text-cyan-500 font-bold">
          ← Volver al Arcade
        </button>
        
        <div className="text-center mb-8 mt-12">
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-2">RETOS <span className="text-[#22d3ee]">ANATÓMICOS</span></h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Evaluación Clínica</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full max-w-5xl">
          {REGIONES.map((region) => (
            <div key={region.id} onClick={() => iniciarNivel(region.id)} className={`${bgHUD} border rounded-2xl p-4 flex flex-col items-center text-center hover:-translate-y-1 transition-all cursor-pointer group`}>
              <div className={`text-4xl mb-2 group-hover:scale-110 transition-transform ${region.color}`}>{region.emoji}</div>
              <h2 className={`text-sm font-black mb-1 ${temaOscuro ? 'text-white' : 'text-gray-800'}`}>Reto {region.name}</h2>
              <p className="text-[9px] text-gray-500 uppercase tracking-widest">Evaluación</p>
            </div>
          ))}

          <div onClick={iniciarLeyendaIA} className={`${bgHUD} border-2 border-yellow-500/50 rounded-2xl p-4 flex flex-col items-center text-center hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden`}>
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 opacity-50"></div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="text-4xl mb-2 group-hover:scale-110 transition-transform text-yellow-500">👑</div>
              <h2 className={`text-sm font-black mb-1 text-yellow-500`}>Anatomía Total</h2>
              <p className="text-[9px] text-gray-500 uppercase tracking-widest flex items-center gap-1">
                {cargandoIA ? <><span className="animate-spin">⏳</span> Pensando...</> : 'Aura IA'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderSVG = () => {
    const vista = preguntaActual.vista || 'pierna';
    const cara = preguntaActual.cara || 'anterior';
    
    const propsSVG = {
      regionesSeleccionadas: estadoZona === 'acierto' ? [preguntaActual.zona] : [],
      onRegionToggle: handleRegionClick,
      temaOscuro: temaOscuro,
      cara: cara,
      lado: 'derecho'
    };

    if (vista === 'brazo') return <VistaBrazo {...propsSVG} />;
    if (vista === 'torax') return <VistaTorax {...propsSVG} />;
    if (vista === 'cabeza') return <VistaCabeza {...propsSVG} />;
    if (vista === 'mano') return <VistaMano {...propsSVG} />;
    if (vista === 'pie') return <VistaPie {...propsSVG} />;
    return <VistaPierna {...propsSVG} />;
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 font-sans select-none relative ${bgPrincipal}`}>
      <button onClick={() => setDificultad(null)} className="absolute top-6 left-6 text-xs text-gray-500 hover:text-cyan-500 font-bold">
        ← Cambiar Reto
      </button>

      <style>{`
        @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .anim-pastilla { animation: slide-up 0.4s ease-out forwards; }
        
        /* OCULTAR EL TÍTULO INTERNO DEL SVG (Brazo Derecho, etc) */
        .svg-juego-container h4 { display: none !important; }
        
        /* OCULTAR LOS TEXTOS DE LAS ETIQUETAS (Bíceps, etc) */
        .svg-juego-container text { display: none !important; }
        
        /* FORZAR AL SVG A ENCOGERSE Y CABER DENTRO DEL CONTENEDOR */
        .svg-juego-container > div {
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .svg-juego-container svg {
          width: 100% !important;
          height: 100% !important;
          max-width: 100% !important;
          max-height: 100% !important;
        }
      `}</style>

      <div className={`w-full max-w-2xl flex justify-between items-center mb-4 p-4 rounded-2xl border ${bgHUD}`}>
        <div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-[#22d3ee]">
            RETO <span className={temaOscuro ? 'text-white' : 'text-gray-800'}>ANATÓMICO</span>
            <span className={`text-xs ml-2 px-2 py-0.5 rounded capitalize ${dificultad === 'leyenda' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' : 'bg-[#22d3ee]/10 text-[#22d3ee] border-[#22d3ee]/30'}`}>{dificultad}</span>
          </h1>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono text-sm ${temaOscuro ? 'bg-[#020813] border-gray-800' : 'bg-gray-100 border-gray-300'}`}>
          <span>🎯</span>
          <span className="text-[#22d3ee] font-bold">{juegoTerminado ? `${puntaje}/${preguntas.length}` : `${indicePregunta + 1}/${preguntas.length}`}</span>
        </div>
      </div>

      {!juegoTerminado ? (
        <div className="w-full max-w-2xl flex flex-col items-center">
          <div className={`w-full border rounded-2xl p-4 text-center mb-4 ${bgHUD}`}>
            <p className="text-xs text-gray-500 uppercase tracking-widest font-mono mb-1">Instrucción Clínica</p>
            <h2 className="text-lg md:text-xl font-black text-[#22d3ee]">{preguntaActual.instruccion}</h2>
          </div>

          {/* 
            CONTENEDOR DEL SVG: 
            overflow-hidden encierra el SVG. 
            h-[45vh] limita el alto. 
          */}
          <div className={`svg-juego-container relative w-full h-[45vh] md:h-[55vh] border rounded-3xl flex items-center justify-center p-2 mb-4 ${bgSVG} overflow-hidden`}>
            {renderSVG()}
          </div>

          {pastillaActiva && (
            <div className={`w-full border-2 border-[#10b981] rounded-2xl p-3 shadow-lg shadow-[#10b981]/20 anim-pastilla flex items-start gap-3 ${temaOscuro ? 'bg-[#0a141d]' : 'bg-emerald-50'}`}>
              <span className="text-2xl">💡</span>
              <div>
                <h4 className="text-xs font-mono font-bold text-[#10b981] uppercase tracking-wider mb-1">Dato Clínico</h4>
                <p className={`text-xs leading-relaxed ${temaOscuro ? 'text-gray-200' : 'text-gray-700'}`}>{pastillaActiva}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className={`w-full max-w-xl border rounded-3xl p-6 text-center shadow-xl ${bgHUD}`}>
          <div className="w-16 h-16 bg-[#10b981]/20 border border-[#10b981] rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">🏆</div>
          <h2 className={`text-2xl font-black mb-1 ${temaOscuro ? 'text-white' : 'text-gray-800'}`}>¡RETO COMPLETADO!</h2>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-mono mb-6">Evaluación Anatómica Finalizada</p>

          <div className={`border rounded-2xl p-4 mb-6 ${temaOscuro ? 'bg-[#020813] border-gray-800' : 'bg-gray-100 border-gray-300'}`}>
            <p className="text-xs text-gray-500 font-bold mb-1">Puntaje Obtenido</p>
            <p className="text-4xl font-black text-[#22d3ee] font-mono">{puntaje} / {preguntas.length}</p>
            <p className="text-xs text-emerald-500 font-bold mt-2">Has ganado {xpGanada} XP</p>
          </div>

          <button onClick={() => setDificultad(null)} className="w-full py-3.5 px-6 rounded-2xl font-black text-xs uppercase tracking-widest bg-[#22d3ee] text-black hover:bg-[#1bc1da] transition-all shadow-lg font-mono">
            Volver al Menú
          </button>
        </div>
      )}
    </div>
  );
}