import { useState, useEffect, useRef } from 'react';
import { consultarAuraIA } from '../../services/iaService';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

// BANCO DE EMERGENCIA
const FALLBACK_DB = [
  {
    patologia: "Epicondilitis (Codo de Tenista)",
    sistema: "Musculoesquelético",
    sintomas: [
      { texto: "Dolor en cara lateral del codo", correcto: true },
      { texto: "Dolor al extender la muñeca", correcto: true },
      { texto: "Debilidad en el agarre", correcto: true },
      { texto: "Parestesia en dedos medio y anular", correcto: false },
      { texto: "Dolor en cara medial del codo", correcto: false }
    ]
  },
  {
    patologia: "Fascitis Plantar",
    sistema: "Miembro Inferior",
    sintomas: [
      { texto: "Dolor punzante en el talón", correcto: true },
      { texto: "Dolor al dar los primeros pasos de la mañana", correcto: true },
      { texto: "Dolor en el arco del pie", correcto: true },
      { texto: "Entumecimiento en los dedos", correcto: false },
      { texto: "Dolor en la parte anterior de la rodilla", correcto: false }
    ]
  },
  {
    patologia: "Síndrome del Túnel Carpiano",
    sistema: "Miembro Superior",
    sintomas: [
      { texto: "Parestesia en pulgar, índice y medio", correcto: true },
      { texto: "Dolor nocturno en la mano", correcto: true },
      { texto: "Debilidad al oponer el pulgar", correcto: true },
      { texto: "Dolor en la cara lateral del codo", correcto: false },
      { texto: "Rigidez cervical al girar la cabeza", correcto: false }
    ]
  },
  {
    patologia: "Tendinitis Aquílea",
    sistema: "Miembro Inferior",
    sintomas: [
      { texto: "Dolor en la parte posterior del tobillo", correcto: true },
      { texto: "Rigidez matutina en el tendón", correcto: true },
      { texto: "Dolor al ponerse de puntillas", correcto: true },
      { texto: "Dolor en la planta del pie", correcto: false },
      { texto: "Pérdida de fuerza en el cuádriceps", correcto: false }
    ]
  },
  {
    patologia: "Cervicalgia Mecánica",
    sistema: "Columna Cervical",
    sintomas: [
      { texto: "Dolor en la nuca", correcto: true },
      { texto: "Limitación de la rotación cervical", correcto: true },
      { texto: "Cefalea occipital", correcto: true },
      { texto: "Dolor irradiado a la pierna", correcto: false },
      { texto: "Pérdida de equilibrio", correcto: false }
    ]
  }
];

// 🎲 FUNCIÓN PARA MEZCLAR ARRAYS (Algoritmo Fisher-Yates)
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export default function DiagnosticoRelampago() {
  const navigate = useNavigate();
  const [modo, setModo] = useState('normal'); 
  const [rondas, setRondas] = useState([]);
  const [indiceActual, setIndiceActual] = useState(0);
  const [seleccionados, setSeleccionados] = useState([]);
  const [estadoRonda, setEstadoRonda] = useState('jugando'); 
  const [cargando, setCargando] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState(null);
  const [aciertosTotales, setAciertosTotales] = useState(0);
  
  const timerRef = useRef(null);

  const generarRondasIA = async (modoSeleccionado) => {
    setCargando(true);
    
    let cantidad = 10;
    if (modoSeleccionado === 'normal') cantidad = 20;
    if (modoSeleccionado === 'intermedio') cantidad = 15;
    if (modoSeleccionado === 'avanzado' || modoSeleccionado === 'leyenda') cantidad = 10;

    const prompt = `Genera EXACTAMENTE ${cantidad} rondas de un juego clínico de fisioterapia.
    
REGLAS ESTRICTAS:
1. Cada ronda debe tener UNA patología REAL y 5 síntomas (3 correctos y 2 distractores plausibles).
2. VARIEDAD OBLIGATORIA: No repitas patologías ni sistemas. Abarca diferentes regiones.
3. MEZCLA ALEATORIAMENTE LOS SÍNTOMAS: No pongas los 3 correctos primero. Intercala los distractores (ej. [correcto, falso, correcto, falso, correcto]).
4. Devuelve SOLO JSON válido, sin markdown, sin texto extra, con este formato exacto:
{
  "rondas": [
    {
      "patologia": "Nombre",
      "sistema": "Región anatómica",
      "sintomas": [
        { "texto": "Síntoma 1", "correcto": true },
        { "texto": "Síntoma 2", "correcto": false },
        { "texto": "Síntoma 3", "correcto": true },
        { "texto": "Síntoma 4", "correcto": false },
        { "texto": "Síntoma 5", "correcto": true }
      ]
    }
  ]
}`;

    try {
      const respuesta = await consultarAuraIA(prompt, { ciclo: 'Clínica', materia: 'Patologías' });
      
      let jsonLimpio = respuesta.replace(/```json/g, '').replace(/```/g, '').trim();
      const primerLlave = jsonLimpio.indexOf('{');
      const ultimaLlave = jsonLimpio.lastIndexOf('}');
      jsonLimpio = jsonLimpio.substring(primerLlave, ultimaLlave + 1);

      const data = JSON.parse(jsonLimpio);
      
      let arrayRondas = [];
      if (Array.isArray(data)) {
        arrayRondas = data;
      } else if (data.rondas && Array.isArray(data.rondas)) {
        arrayRondas = data.rondas;
      }

      if (arrayRondas.length > 0) {
        // 🎲 MEZCLAMOS LAS RESPUESTAS AQUÍ (Por si la IA no obedeció)
        const rondasMezcladas = arrayRondas.map(ronda => ({
          ...ronda,
          sintomas: shuffleArray(ronda.sintomas)
        }));
        setRondas(rondasMezcladas.slice(0, cantidad));
      } else {
        throw new Error("La IA no devolvió el formato esperado");
      }
    } catch (error) {
      console.error("❌ IA falló. Usando banco de preguntas local:", error);
      
      const rondasEmergencia = [];
      for (let i = 0; i < cantidad; i++) {
        const fallbackElegido = FALLBACK_DB[i % FALLBACK_DB.length];
        rondasEmergencia.push({ 
          ...fallbackElegido, 
          sintomas: shuffleArray(fallbackElegido.sintomas), // 🎲 MEZCLAMOS EL FALLBACK TAMBIÉN
          id: i 
        });
      }
      setRondas(rondasEmergencia);
    } finally {
      setIndiceActual(0);
      setAciertosTotales(0);
      setEstadoRonda('jugando');
      setCargando(false);
    }
  };

  useEffect(() => {
    if ((modo === 'avanzado' || modo === 'leyenda') && estadoRonda === 'jugando') {
      const tiempo = modo === 'avanzado' ? 45 : 50;
      setTiempoRestante(tiempo);

      timerRef.current = setInterval(() => {
        setTiempoRestante((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            evaluarRonda(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [modo, estadoRonda, indiceActual]);

  const toggleSintoma = (index) => {
    if (estadoRonda !== 'jugando') return;
    if (seleccionados.includes(index)) {
      setSeleccionados(seleccionados.filter(i => i !== index));
    } else {
      setSeleccionados([...seleccionados, index]);
    }
  };

  const evaluarRonda = (tiempoAgotado = false) => {
    clearInterval(timerRef.current);
    setEstadoRonda('feedback');

    const ronda = rondas[indiceActual];
    if (!ronda) return;

    let aciertos = 0;
    let errores = 0;

    ronda.sintomas.forEach((sintoma, idx) => {
      const seleccionado = seleccionados.includes(idx);
      if (sintoma.correcto && seleccionado) aciertos++;
      if (!sintoma.correcto && seleccionado) errores++;
      if (sintoma.correcto && !seleccionado) errores++; 
    });

    if (aciertos === 3 && errores === 0 && !tiempoAgotado) {
      setAciertosTotales(prev => prev + 1);
    }
  };

  const siguienteRonda = async () => {
    setSeleccionados([]);
    if (indiceActual + 1 < rondas.length) {
      setIndiceActual(prev => prev + 1);
      setEstadoRonda('jugando');
    } else {
      setEstadoRonda('fin');
      await guardarProgreso();
    }
  };

  const guardarProgreso = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let xpGanada = aciertosTotales * 20; 
    if (modo === 'leyenda') xpGanada *= 2;
    
    const { data } = await supabase
      .from('progreso_arcade')
      .select('xp_total, plays_por_dificultad')
      .eq('user_id', user.id)
      .single();

    if (data) {
      const plays = data.plays_por_dificultad || {};
      plays['diagnostico_relampago_' + modo] = (plays['diagnostico_relampago_' + modo] || 0) + 1;

      await supabase
        .from('progreso_arcade')
        .update({
          xp_total: data.xp_total + xpGanada,
          plays_por_dificultad: plays
        })
        .eq('user_id', user.id);
    }
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-[#020813] flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#22d3ee] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-[#22d3ee] font-bold animate-pulse">Aura está generando los casos clínicos...</p>
      </div>
    );
  }

  if (rondas.length === 0) {
    return (
      <div className="min-h-screen bg-[#020813] flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-2 text-center">⚡ Diagnóstico Relámpago</h1>
        <p className="text-gray-400 mb-8 text-center max-w-md">Identifica los síntomas correctos de cada patología. Pon a prueba tu ojo clínico.</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
          <button onClick={() => { setModo('normal'); generarRondasIA('normal'); }} className="px-4 py-6 bg-[#0a141d] border border-gray-800 hover:border-[#22d3ee] text-white font-black rounded-xl hover:scale-105 transition-all flex flex-col items-center gap-2">
            <span className="text-3xl">🧘‍♂️</span> Normal <span className="text-[10px] text-gray-400 font-bold">(20 Rondas)</span>
          </button>
          
          <button onClick={() => { setModo('intermedio'); generarRondasIA('intermedio'); }} className="px-4 py-6 bg-[#0a141d] border border-gray-800 hover:border-[#22d3ee] text-white font-black rounded-xl hover:scale-105 transition-all flex flex-col items-center gap-2">
            <span className="text-3xl">🤸‍♂️</span> Intermedio <span className="text-[10px] text-gray-400 font-bold">(15 Rondas)</span>
          </button>
          
          <button onClick={() => { setModo('avanzado'); generarRondasIA('avanzado'); }} className="px-4 py-6 bg-purple-500/20 border border-purple-500/50 hover:border-purple-400 text-purple-400 font-black rounded-xl hover:scale-105 transition-all flex flex-col items-center gap-2">
            <span className="text-3xl">🏋️‍♂️</span> Avanzado <span className="text-[10px] text-purple-300/70 font-bold">(10 Rondas / 45s)</span>
          </button>
          
          <button onClick={() => { setModo('leyenda'); generarRondasIA('leyenda'); }} className="px-4 py-6 bg-[#10b981]/20 border border-[#10b981]/50 hover:border-[#10b981] text-[#10b981] font-black rounded-xl hover:scale-105 transition-all flex flex-col items-center gap-2">
            <span className="text-3xl">🦸‍♂️</span> Leyenda IA <span className="text-[10px] text-[#10b981]/70 font-bold">(10 Rondas / 50s)</span>
          </button>
        </div>
        
        <button onClick={() => navigate('/arcade')} className="mt-10 text-gray-500 hover:text-white underline transition-colors">Volver al Arcade</button>
      </div>
    );
  }

  if (estadoRonda === 'fin') {
    return (
      <div className="min-h-screen bg-[#020813] flex flex-col items-center justify-center p-4">
        <h1 className="text-5xl font-black text-[#10b981] mb-4">¡Sesión Completada!</h1>
        <p className="text-white text-xl mb-2">Rondas Perfectas: <span className="text-[#22d3ee] font-black">{aciertosTotales} / {rondas.length}</span></p>
        <p className="text-gray-400 mb-8">XP ganada: <span className="text-[#10b981] font-bold">+{aciertosTotales * (modo === 'leyenda' ? 40 : 20)} XP</span></p>
        
        <button 
          onClick={() => { setRondas([]); setTiempoRestante(null); }} 
          className="px-8 py-3 bg-[#22d3ee] text-black font-black rounded-xl hover:scale-105 transition mb-4"
        >
          Jugar de nuevo
        </button>
        <button 
          onClick={() => { setRondas([]); setTiempoRestante(null); }} 
          className="text-gray-500 hover:text-white underline"
        >
          Volver a Modos
        </button>
      </div>
    );
  }

  const rondaActual = rondas[indiceActual];
  if (!rondaActual) return null;

  return (
    <div className="min-h-screen bg-[#020813] p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-3xl flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-black text-white">⚡ Diagnóstico Relámpago</h2>
          <span className="text-[#22d3ee] text-xs font-bold uppercase">{modo}</span>
        </div>
        {tiempoRestante !== null && (
          <div className={`text-3xl font-black ${tiempoRestante < 10 ? 'text-red-500 animate-pulse' : 'text-[#10b981]'}`}>
            ⏱ {tiempoRestante}s
          </div>
        )}
        <div className="text-white font-bold bg-[#0a141d] px-4 py-2 rounded-xl border border-gray-800">
          Ronda {indiceActual + 1} / {rondas.length}
        </div>
      </div>

      <div className="w-full max-w-3xl bg-[#0a141d] border border-[#22d3ee]/30 rounded-t-3xl p-8 text-center mb-1">
        <p className="text-gray-400 text-sm uppercase tracking-widest mb-2">{rondaActual.sistema}</p>
        <h1 className="text-3xl md:text-4xl font-black text-white">{rondaActual.patologia}</h1>
      </div>

      <div className="w-full max-w-3xl bg-[#0a141d] border border-t-0 border-[#22d3ee]/30 rounded-b-3xl p-6 grid grid-cols-1 gap-3">
        <p className="text-gray-300 text-sm mb-2 text-center">Selecciona los <strong className="text-[#22d3ee]">3 síntomas</strong> que correspondan a esta patología:</p>
        
        {rondaActual.sintomas.map((sintoma, idx) => {
          const seleccionado = seleccionados.includes(idx);
          const esCorrecto = sintoma.correcto;
          
          let btnClass = "border-gray-700 bg-black/40 text-gray-300 hover:border-gray-500";
          
          if (estadoRonda === 'feedback') {
            if (esCorrecto && seleccionado) btnClass = "border-[#10b981] bg-[#10b981]/20 text-[#10b981]"; 
            else if (!esCorrecto && seleccionado) btnClass = "border-red-500 bg-red-500/20 text-red-500"; 
            else if (esCorrecto && !seleccionado) btnClass = "border-yellow-500 border-dashed text-yellow-500 opacity-70"; 
          } else if (seleccionado) {
            btnClass = "border-[#22d3ee] bg-[#22d3ee]/10 text-white";
          }

          return (
            <button
              key={idx}
              onClick={() => toggleSintoma(idx)}
              disabled={estadoRonda === 'feedback'}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all font-bold ${btnClass}`}
            >
              <div className="flex justify-between items-center">
                <span>{sintoma.texto}</span>
                {estadoRonda === 'feedback' && esCorrecto && <span>✅</span>}
                {estadoRonda === 'feedback' && !esCorrecto && seleccionado && <span>❌</span>}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {estadoRonda === 'jugando' ? (
          <button onClick={() => evaluarRonda(false)} className="px-10 py-4 bg-[#22d3ee] text-black font-black text-xl rounded-2xl hover:scale-105 transition-all">
            Confirmar Diagnóstico
          </button>
        ) : (
          <button onClick={siguienteRonda} className="px-10 py-4 bg-[#10b981] text-black font-black text-xl rounded-2xl hover:scale-105 transition-all">
            {indiceActual + 1 === rondas.length ? 'Finalizar Sesión' : 'Siguiente Ronda →'}
          </button>
        )}
      </div>
    </div>
  );
}