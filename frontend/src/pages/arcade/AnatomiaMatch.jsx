// src/pages/arcade/AnatomiaMatch.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { consultarAuraIA } from '../../services/iaService'; // <-- Importamos a Aura

const PAREJAS_CLINICAS = [
  { id: 1, parId: 'biceps', contenido: 'Bíceps Braquial' },
  { id: 2, parId: 'biceps', contenido: 'Flexión de Codo' },
  { id: 3, parId: 'isquio', contenido: 'Tuberosidad Isquiática' },
  { id: 4, parId: 'isquio', contenido: 'Músculos Isquiotibiales' },
  { id: 5, parId: 'lca', contenido: 'Ligamento Cruzado Anterior' },
  { id: 6, parId: 'lca', contenido: 'Estabilidad de Rodilla' },
  { id: 7, parId: 'supra', contenido: 'Supraespinoso' },
  { id: 8, parId: 'supra', contenido: 'Manguito Rotador' },
  { id: 9, parId: 'aquiles', contenido: 'Tendón de Aquiles' },
  { id: 10, parId: 'aquiles', contenido: 'Flexión Plantar' },
  { id: 11, parId: 'fascia', contenido: 'Fascia Plantar' },
  { id: 12, parId: 'fascia', contenido: 'Arco Longitudinal' },
  { id: 13, parId: 'ciatico', contenido: 'Nervio Ciático' },
  { id: 14, parId: 'ciatico', contenido: 'Inervación Miembro Inf.' },
  { id: 15, parId: 'deltoides', contenido: 'Deltoides Anterior' },
  { id: 16, parId: 'deltoides', contenido: 'Flexión de Hombro' },
  { id: 17, parId: 'cuadriceps', contenido: 'Cuádriceps' },
  { id: 18, parId: 'cuadriceps', contenido: 'Extensión de Rodilla' },
  { id: 19, parId: 'trapecio', contenido: 'Trapecio Superior' },
  { id: 20, parId: 'trapecio', contenido: 'Elevación de Escápula' },
];

const mezclarCartas = (array) => {
  const copia = [...array];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
};

export default function AnatomiaMatch({ temaOscuro }) {
  const navigate = useNavigate();
  
  const [dificultad, setDificultad] = useState(null);
  const [cartas, setCartas] = useState([]);
  const [seleccionadas, setSeleccionadas] = useState([]);
  const [emparejadas, setEmparejadas] = useState([]);
  const [bloqueado, setBloqueado] = useState(false);
  const [tiempo, setTiempo] = useState(0);
  const [movimientos, setMovimientos] = useState(0);
  const [juegoActivo, setJuegoActivo] = useState(false);
  const [juegoCompletado, setJuegoCompletado] = useState(false);
  const [xpGanada, setXpGanada] = useState(0);

  // Estados para el Modo Leyenda (IA)
  const [cargandoIA, setCargandoIA] = useState(false);
  const [errorIA, setErrorIA] = useState(null);

  const bgPrincipal = temaOscuro ? 'bg-[#020813] text-white' : 'bg-[#e2e8f0] text-[#0f172a]';
  const bgHUD = temaOscuro ? 'bg-[#0a141d] border-[#22d3ee]/20' : 'bg-white border-gray-300 shadow-md';
  const bgCartaOculta = temaOscuro ? 'bg-[#0a141d] border-[#22d3ee]/30 hover:border-[#22d3ee]' : 'bg-white border-gray-300 hover:border-[#22d3ee] shadow-sm';
  const bgCartaRevelada = temaOscuro ? 'bg-[#0a141d] border-[#22d3ee]' : 'bg-cyan-50 border-[#22d3ee]';
  const bgCartaAcierto = temaOscuro ? 'bg-[#10b981]/15 border-[#10b981]' : 'bg-emerald-50 border-[#10b981] shadow-[0_0_15px_rgba(16,185,129,0.2)]';
  const textoCarta = temaOscuro ? 'text-cyan-200' : 'text-cyan-800';
  const textoAcierto = temaOscuro ? 'text-[#10b981]' : 'text-emerald-700';

  // ==========================================
  // INICIAR JUEGOS
  // ==========================================
  const iniciarJuegoLocal = (nivel) => {
    setDificultad(nivel);
    let numParejas = 3;
    if (nivel === 'intermedio') numParejas = 6;
    if (nivel === 'avanzado') numParejas = 10; // Ahora usa los 20 pares

    const parejasSeleccionadas = PAREJAS_CLINICAS.slice(0, numParejas * 2);
    
    setCartas(mezclarCartas(parejasSeleccionadas));
    resetearEstadoJuego();
  };

  const iniciarModoLeyenda = async () => {
    setCargandoIA(true);
    setErrorIA(null);
    try {
      const prompt = `Genera un arreglo JSON puro de 15 objetos (sin texto adicional, sin markdown, solo el JSON) para un juego de memoria clínica de fisioterapia. 
      Cada objeto debe tener la estructura: {"id": 1, "parId": "identificador_unico", "contenido": "texto"}.
      Debes emparejar conceptos con funciones o características. Por ejemplo: {"id": 1, "parId": "epicondilitis", "contenido": "Epicondilitis"}, {"id": 2, "parId": "epicondilitis", "contenido": "Codo de tenista"}.
      Genera 15 parejas (30 objetos en total). Sé creativo y usa términos anatómicos y patológicos avanzados.`;
      
      const respuestaRaw = await consultarAuraIA(prompt, {});
      
      // Limpiamos la respuesta de Aura por si devuelve formato markdown (```json)
      const jsonLimpio = respuestaRaw.replace(/```json/g, '').replace(/```/g, '').trim();
      const parejasIA = JSON.parse(jsonLimpio);

      if (!Array.isArray(parejasIA) || parejasIA.length < 20) {
        throw new Error("Aura no generó suficientes pares válidos.");
      }

      setDificultad('leyenda');
      setCartas(mezclarCartas(parejasIA));
      resetearEstadoJuego();

    } catch (error) {
      console.error("Error en Modo Leyenda:", error);
      setErrorIA("Aura está descansando. Intenta de nuevo en un momento.");
    } finally {
      setCargandoIA(false);
    }
  };

  const resetearEstadoJuego = () => {
    setSeleccionadas([]);
    setEmparejadas([]);
    setBloqueado(false);
    setTiempo(0);
    setMovimientos(0);
    setJuegoActivo(true);
    setJuegoCompletado(false);
    setXpGanada(0);
  };

  const volverAlMenu = () => {
    setDificultad(null);
    setJuegoActivo(false);
    setJuegoCompletado(false);
    setErrorIA(null);
  };

  useEffect(() => {
    let intervalo = null;
    if (juegoActivo && !juegoCompletado) {
      intervalo = setInterval(() => setTiempo((prev) => prev + 1), 1000);
    } else {
      clearInterval(intervalo);
    }
    return () => clearInterval(intervalo);
  }, [juegoActivo, juegoCompletado]);

  // ==========================================
  // GUARDAR PROGRESO
  // ==========================================
  const guardarProgreso = async (puntosBase) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Traer datos actuales
      const { data: progreso } = await supabase
        .from('progreso_arcade')
        .select('xp_total, mejor_tiempo_match, plays_por_dificultad')
        .eq('user_id', user.id)
        .single();

      const plays = progreso?.plays_por_dificultad || {};
      const vecesJugado = plays[dificultad] || 0;

      // 2. Lógica Anti-Farmeo
      let xpFinal = 0;
      if (dificultad === 'basico') {
        if (vecesJugado < 10) xpFinal = 10; // Solo da XP las primeras 10 veces
      } else if (dificultad === 'intermedio') {
        if (vecesJugado < 15) xpFinal = 25; // Solo da XP las primeras 15 veces
      } else if (dificultad === 'avanzado') {
        xpFinal = 50; // Sin límite
      } else if (dificultad === 'leyenda') {
        xpFinal = 100; // Sin límite
      }

      setXpGanada(xpFinal);

      // 3. Actualizar contadores
      plays[dificultad] = vecesJugado + 1;

      const nuevoXp = (progreso?.xp_total || 0) + xpFinal;
      const nuevoMejorTiempo = Math.min(progreso?.mejor_tiempo_match || 999, tiempo);

      await supabase
        .from('progreso_arcade')
        .update({ 
          xp_total: nuevoXp, 
          mejor_tiempo_match: nuevoMejorTiempo,
          plays_por_dificultad: plays,
          actualizado_en: new Date().toISOString()
        })
        .eq('user_id', user.id);
    } catch (error) {
      console.error("Error guardando progreso:", error);
    }
  };

  const handleCartaClick = (index) => {
    if (bloqueado || seleccionadas.includes(index) || emparejadas.includes(cartas[index].parId)) return;

    const nuevasSeleccionadas = [...seleccionadas, index];
    setSeleccionadas(nuevasSeleccionadas);

    if (nuevasSeleccionadas.length === 2) {
      setMovimientos((prev) => prev + 1);
      setBloqueado(true);
      const [idx1, idx2] = nuevasSeleccionadas;
      
      if (cartas[idx1].parId === cartas[idx2].parId) {
        setEmparejadas((prev) => {
          const nuevasEmparejadas = [...prev, cartas[idx1].parId];
          const totalParejas = cartas.length / 2;
          
          if (nuevasEmparejadas.length === totalParejas) {
            setJuegoCompletado(true);
            setJuegoActivo(false);
            
            const puntos = dificultad === 'basico' ? 50 : dificultad === 'intermedio' ? 200 : dificultad === 'avanzado' ? 400 : 600;
            guardarProgreso(puntos); 
          }
          return nuevasEmparejadas;
        });
        setSeleccionadas([]);
        setBloqueado(false);
      } else {
        setTimeout(() => {
          setSeleccionadas([]);
          setBloqueado(false);
        }, 1500);
      }
    }
  };

  // ==========================================
  // RENDER: MENÚ DE DIFICULTAD
  // ==========================================
  if (!dificultad) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 font-sans select-none ${bgPrincipal}`}>
        <button onClick={() => navigate('/arcade')} className="absolute top-6 left-6 text-xs text-gray-500 hover:text-cyan-500 font-bold flex items-center gap-1 transition-colors">
          ← Volver al Arcade
        </button>
        
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-2">ANATOMÍA <span className="text-[#22d3ee]">MATCH</span></h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Selecciona tu nivel de desafío</p>
        </div>

        {errorIA && (
          <div className="mb-6 p-3 bg-red-500/20 border border-red-500 text-red-500 text-xs font-bold rounded-xl">
            {errorIA}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
          {/* Básico */}
          <div className={`${bgHUD} border rounded-3xl p-6 text-center hover:-translate-y-2 transition-all cursor-pointer group`} onClick={() => iniciarJuegoLocal('basico')}>
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🌱</div>
            <h2 className={`text-lg font-black mb-2 ${temaOscuro ? 'text-emerald-400' : 'text-emerald-600'}`}>Nivel Básico</h2>
            <p className="text-xs text-gray-500 mb-4">3 parejas (6 cartas)<br/>Conceptos fundamentales</p>
            <button className="w-full py-2 bg-emerald-500/20 text-emerald-500 rounded-lg text-xs font-bold uppercase tracking-wider">Jugar</button>
          </div>

          {/* Intermedio */}
          <div className={`${bgHUD} border rounded-3xl p-6 text-center hover:-translate-y-2 transition-all cursor-pointer group border-[#22d3ee]/40`} onClick={() => iniciarJuegoLocal('intermedio')}>
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">⚡</div>
            <h2 className={`text-lg font-black mb-2 text-[#22d3ee]`}>Nivel Intermedio</h2>
            <p className="text-xs text-gray-500 mb-4">6 parejas (12 cartas)<br/>Anatomía y funciones</p>
            <button className="w-full py-2 bg-cyan-500/20 text-cyan-500 rounded-lg text-xs font-bold uppercase tracking-wider">Jugar</button>
          </div>

          {/* Avanzado */}
          <div className={`${bgHUD} border rounded-3xl p-6 text-center hover:-translate-y-2 transition-all cursor-pointer group border-purple-500/30`} onClick={() => iniciarJuegoLocal('avanzado')}>
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🔥</div>
            <h2 className={`text-lg font-black mb-2 text-purple-400`}>Nivel Avanzado</h2>
            <p className="text-xs text-gray-500 mb-4">10 parejas (20 cartas)<br/>Clínica avanzada</p>
            <button className="w-full py-2 bg-purple-500/20 text-purple-400 rounded-lg text-xs font-bold uppercase tracking-wider">Jugar</button>
          </div>

          {/* Modo Leyenda (IA) */}
          <div className={`${bgHUD} border-2 border-yellow-500/50 rounded-3xl p-6 text-center hover:-translate-y-2 transition-all cursor-pointer group relative overflow-hidden`} onClick={iniciarModoLeyenda}>
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 opacity-50"></div>
            <div className="relative z-10">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">👑</div>
              <h2 className={`text-lg font-black mb-2 text-yellow-500`}>Modo Leyenda</h2>
              <p className="text-[11px] text-gray-500 mb-4 leading-tight">15 parejas generadas<br/>por Aura IA</p>
              <button className="w-full py-2 bg-yellow-500/20 text-yellow-500 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                {cargandoIA ? (
                  <><span className="animate-spin">⏳</span> Pensando...</>
                ) : (
                  'Invocar IA'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: JUEGO ACTIVO
  // ==========================================
  // Ajustamos columnas según la cantidad de cartas
  let gridCols = 'grid-cols-3';
  if (cartas.length === 12) gridCols = 'grid-cols-3 sm:grid-cols-4';
  if (cartas.length >= 20) gridCols = 'grid-cols-4 sm:grid-cols-5'; // Para 20 y 30 cartas

  // Para el modo leyenda con 30 cartas, las hacemos un poco más pequeñas
  const alturaCarta = cartas.length >= 20 ? 'h-20 sm:h-24' : 'h-24 sm:h-32';

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 font-sans select-none relative ${bgPrincipal}`}>
      
      <button onClick={volverAlMenu} className="absolute top-6 left-6 text-xs text-gray-500 hover:text-cyan-500 font-bold flex items-center gap-1 transition-colors">
        ← Cambiar Nivel
      </button>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>

      <div className={`w-full max-w-4xl flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 p-4 rounded-2xl border ${bgHUD}`}>
        <div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-[#22d3ee] flex items-center gap-2">
            ANATOMÍA <span className={temaOscuro ? 'text-white' : 'text-gray-800'}>MATCH</span>
            <span className={`text-xs px-2 py-0.5 rounded border capitalize ${dificultad === 'leyenda' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' : 'bg-[#22d3ee]/10 text-[#22d3ee] border-[#22d3ee]/30'}`}>
              {dificultad}
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono ${temaOscuro ? 'bg-[#020813] border-gray-800' : 'bg-gray-100 border-gray-300'}`}>
            <span>🔄</span><span className="text-gray-500">Movs:</span><span className="font-bold">{movimientos}</span>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono ${temaOscuro ? 'bg-[#020813] border-gray-800' : 'bg-gray-100 border-gray-300'}`}>
            <span>⏱️</span><span className="text-[#22d3ee] font-bold">{String(Math.floor(tiempo / 60)).padStart(2, '0')}:{String(tiempo % 60).padStart(2, '0')}</span>
          </div>
        </div>
      </div>

      <div className={`w-full max-w-4xl grid ${gridCols} gap-2 md:gap-3 perspective-1000 mb-6`}>
        {cartas.map((carta, index) => {
          const estaVolteada = seleccionadas.includes(index) || emparejadas.includes(carta.parId);
          const esAcierto = emparejadas.includes(carta.parId);

          return (
            <div key={index} onClick={() => handleCartaClick(index)} className={`${alturaCarta} w-full cursor-pointer perspective-1000`}>
              <div className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${estaVolteada ? 'rotate-y-180' : ''}`}>
                
                <div className={`absolute inset-0 w-full h-full border rounded-2xl flex flex-col items-center justify-center backface-hidden transition-all group ${bgCartaOculta}`}>
                  <div className="w-8 h-8 rounded-xl bg-[#22d3ee]/10 border border-[#22d3ee]/20 flex items-center justify-center text-[#22d3ee] font-mono font-black text-xs group-hover:scale-110 transition-transform">CJ</div>
                </div>
                
                <div className={`absolute inset-0 w-full h-full rounded-2xl flex flex-col items-center justify-center p-1 sm:p-2 text-center backface-hidden rotate-y-180 transition-all border-2 ${esAcierto ? bgCartaAcierto : bgCartaRevelada}`}>
                  <span className={`font-mono font-bold text-[9px] sm:text-[11px] tracking-tight leading-tight ${esAcierto ? textoAcierto : textoCarta}`}>{carta.contenido}</span>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {juegoCompletado && (
        <div className={`w-full max-w-4xl border-2 rounded-2xl p-4 sm:p-5 text-center mb-6 animate-fade-in flex flex-col sm:flex-row items-center justify-between gap-4 ${temaOscuro ? 'bg-[#10b981]/10 border-[#10b981]' : 'bg-emerald-50 border-emerald-500'}`}>
          <div className="text-left">
            <h2 className={`text-lg sm:text-xl font-black ${temaOscuro ? 'text-[#10b981]' : 'text-emerald-600'}`}>
              {dificultad === 'leyenda' ? '¡HAS COMPLETADO LA LEYENDA! 👑' : '¡EVALUACIÓN SUPERADA! 🩺'}
            </h2>
            <p className={`text-xs font-medium mt-0.5 ${temaOscuro ? 'text-gray-300' : 'text-gray-600'}`}>Has ganado <span className="font-black text-emerald-500">{xpGanada} XP</span></p>
          </div>
          <div className={`flex gap-3 text-xs font-mono px-4 py-2 rounded-xl border ${temaOscuro ? 'bg-[#020813] border-[#10b981]/30' : 'bg-white border-emerald-200'}`}>
            <div>⏱️ <span className="font-bold">{tiempo}s</span></div>
            <div className="text-gray-400">|</div>
            <div>🔄 <span className="font-bold">{movimientos} movs</span></div>
          </div>
        </div>
      )}

      <button 
        onClick={() => dificultad === 'leyenda' ? iniciarModoLeyenda() : iniciarJuegoLocal(dificultad)} 
        className="w-full max-w-4xl py-3.5 px-6 rounded-2xl font-black text-xs uppercase tracking-widest bg-[#22d3ee] text-black hover:bg-[#1bc1da] transition-all shadow-lg flex items-center justify-center gap-2 font-mono"
      >
        {dificultad === 'leyenda' ? 'Invocar Nuevos Conceptos de Aura' : juegoCompletado ? 'Jugar de Nuevo' : 'Reiniciar Tablero'}
      </button>
    </div>
  );
}