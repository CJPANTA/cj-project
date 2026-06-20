import { useState, useEffect } from 'react';
import { useAura } from '../context/AuraContext';
import { useGitHubScanner } from '../hooks/useGitHubScanner';
import { supabase } from '../lib/supabaseClient';
import { consultarAuraIA } from '../services/iaService';

export default function SimuladorExamen({ temaOscuro }) {
  const { contexto } = useAura();
  const { estructura } = useGitHubScanner();
  const [ciclos] = useState(['01', '02', '03', '04', '05', '06']);
  const [cicloSeleccionado, setCicloSeleccionado] = useState(contexto.ciclo?.replace('Ciclo ', '') || '');
  const [materias, setMaterias] = useState([]);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState('');
  const [nivel, setNivel] = useState('medio');
  const [numPreguntas, setNumPreguntas] = useState(5);
  const [preguntas, setPreguntas] = useState([]);
  const [respuestasUsuario, setRespuestasUsuario] = useState({});
  const [examenGenerado, setExamenGenerado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState('');

  // Estados para repaso rápido interactivo
  const [repasoPreguntas, setRepasoPreguntas] = useState([]);
  const [repasoActual, setRepasoActual] = useState(0);
  const [repasoRespuestas, setRepasoRespuestas] = useState({});
  const [repasoFeedback, setRepasoFeedback] = useState({});
  const [mostrarRepaso, setMostrarRepaso] = useState(false);
  const [generandoRepaso, setGenerandoRepaso] = useState(false);
  const [repasoTerminado, setRepasoTerminado] = useState(false);
  const [repasoAciertos, setRepasoAciertos] = useState(0);

  // Flashcards (interactivas)
  const [flashcards, setFlashcards] = useState([]);
  const [mostrarFlashcards, setMostrarFlashcards] = useState(false);
  const [generandoFlashcards, setGenerandoFlashcards] = useState(false);
  const [guardandoMaterial, setGuardandoMaterial] = useState(false);
  const [tarjetaActiva, setTarjetaActiva] = useState(null);

  useEffect(() => {
    if (cicloSeleccionado && estructura && estructura[cicloSeleccionado]) {
      const materiasList = Object.keys(estructura[cicloSeleccionado]);
      setMaterias(materiasList);
      setMateriaSeleccionada(materiasList[0] || '');
    } else {
      setMaterias([]);
      setMateriaSeleccionada('');
    }
  }, [cicloSeleccionado, estructura]);

  // Generar examen completo
  const generarExamen = async () => {
    if (!cicloSeleccionado || !materiaSeleccionada) {
      setError('Selecciona ciclo y materia');
      return;
    }
    setCargando(true);
    setError('');
    const prompt = `Actúa como un profesor de fisioterapia. Genera un examen de ${numPreguntas} preguntas tipo test sobre "${materiaSeleccionada.replace(/_/g, ' ')}" del ciclo ${cicloSeleccionado}. Nivel: ${nivel}. 
    Devuelve SOLO un JSON: {"preguntas":[{"texto":"pregunta","opciones":["A","B","C","D"],"respuesta_correcta":"A","feedback":"explicación"}]}`;
    let respuesta = await consultarAuraIA(prompt, { ciclo: `Ciclo ${cicloSeleccionado}`, materia: materiaSeleccionada });
    respuesta = respuesta.replace(/```json/g, '').replace(/```/g, '').trim();
    try {
      const data = JSON.parse(respuesta);
      if (data.preguntas && data.preguntas.length) {
        setPreguntas(data.preguntas);
        setExamenGenerado(true);
        setRespuestasUsuario({});
        setResultado(null);
      } else throw new Error();
    } catch (e) {
      setError('Error al generar el examen. Reintenta.');
    }
    setCargando(false);
  };

  const corregirExamen = async () => {
    const todasRespondidas = preguntas.every((_, idx) => respuestasUsuario[idx] !== undefined);
    if (!todasRespondidas) { setError('Responde todas las preguntas.'); return; }
    setCargando(true);
    const examenData = preguntas.map((p, idx) => ({
      pregunta: p.texto,
      respuesta_usuario: respuestasUsuario[idx],
      respuesta_correcta: p.respuesta_correcta,
      opciones: p.opciones
    }));
    const promptCorrecion = `Corrige el siguiente examen. Calcula el porcentaje de respuestas correctas. Devuelve JSON: {"puntuacion": número (0-100), "feedback": "comentario", "detalle": [{"pregunta": "texto", "correcta": true/false, "explicacion": "texto"}]}. Examen: ${JSON.stringify(examenData)}`;
    let correccion = await consultarAuraIA(promptCorrecion);
    correccion = correccion.replace(/```json/g, '').replace(/```/g, '').trim();
    try {
      const jsonCorr = JSON.parse(correccion);
      let puntuacion = Number(jsonCorr.puntuacion);
      if (isNaN(puntuacion)) puntuacion = 0;
      setResultado({ ...jsonCorr, puntuacion });
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('examenes').insert({
          user_id: user.id,
          ciclo: `Ciclo ${cicloSeleccionado}`,
          materia: materiaSeleccionada.replace(/_/g, ' '),
          nivel,
          num_preguntas: numPreguntas,
          puntuacion_total: puntuacion,
          respuestas: { preguntas, respuestas_usuario: respuestasUsuario, correccion: jsonCorr },
          feedback: jsonCorr.feedback
        });
      }
    } catch (e) {
      console.error(e);
      setError('Error al corregir. Reintenta.');
    }
    setCargando(false);
  };

  // Generar repaso rápido interactivo (píldoras)
  const generarRepasoRapido = async () => {
    if (!cicloSeleccionado || !materiaSeleccionada) {
      setError('Selecciona ciclo y materia para generar repaso.');
      return;
    }
    setGenerandoRepaso(true);
    setError('');
    const prompt = `Actúa como un tutor de fisioterapia. Basándote en la materia "${materiaSeleccionada.replace(/_/g, ' ')}" del ciclo ${cicloSeleccionado}, genera 5 preguntas tipo test (cada una con 4 opciones, respuesta correcta y feedback). Devuelve SOLO un objeto JSON con esta estructura:
    {
      "preguntas": [
        {"texto": "pregunta", "opciones": ["A","B","C","D"], "respuesta_correcta": "A", "feedback": "explicación"}
      ]
    }`;
    let respuesta = await consultarAuraIA(prompt, { ciclo: `Ciclo ${cicloSeleccionado}`, materia: materiaSeleccionada });
    respuesta = respuesta.replace(/```json/g, '').replace(/```/g, '').trim();
    try {
      const data = JSON.parse(respuesta);
      if (data.preguntas && data.preguntas.length > 0) {
        setRepasoPreguntas(data.preguntas);
        setRepasoActual(0);
        setRepasoRespuestas({});
        setRepasoFeedback({});
        setRepasoTerminado(false);
        setRepasoAciertos(0);
        setMostrarRepaso(true);
      } else throw new Error();
    } catch (e) {
      setError('Error al generar repaso. Reintenta.');
    }
    setGenerandoRepaso(false);
  };

  const responderRepaso = (preguntaIdx, opcionSeleccionada) => {
    const pregunta = repasoPreguntas[preguntaIdx];
    const esCorrecta = opcionSeleccionada === pregunta.respuesta_correcta;
    setRepasoRespuestas(prev => ({ ...prev, [preguntaIdx]: opcionSeleccionada }));
    setRepasoFeedback(prev => ({ ...prev, [preguntaIdx]: { correcta: esCorrecta, feedback: pregunta.feedback, respuestaCorrecta: pregunta.respuesta_correcta } }));
    if (esCorrecta) {
      setRepasoAciertos(prev => prev + 1);
    }
  };

  const siguienteRepaso = () => {
    if (repasoActual + 1 < repasoPreguntas.length) {
      setRepasoActual(repasoActual + 1);
    } else {
      setRepasoTerminado(true);
    }
  };

  const reiniciarRepaso = () => {
    setMostrarRepaso(false);
    setRepasoPreguntas([]);
    setRepasoRespuestas({});
    setRepasoFeedback({});
    setRepasoTerminado(false);
    setRepasoAciertos(0);
  };

  // Generar flashcards
  const generarFlashcards = async () => {
    if (!cicloSeleccionado || !materiaSeleccionada) {
      setError('Selecciona ciclo y materia para generar flashcards.');
      return;
    }
    setGenerandoFlashcards(true);
    setError('');
    const prompt = `Actúa como un tutor de fisioterapia. Basándote en la materia "${materiaSeleccionada.replace(/_/g, ' ')}" del ciclo ${cicloSeleccionado}, genera 5 flashcards (tarjetas de estudio). Cada flashcard debe tener un anverso (pregunta o concepto clave) y un reverso (definición o respuesta). Devuelve SOLO un objeto JSON con esta estructura:
    {
      "flashcards": [
        {"anverso": "¿Qué es...?", "reverso": "Definición..."}
      ]
    }`;
    let respuesta = await consultarAuraIA(prompt, { ciclo: `Ciclo ${cicloSeleccionado}`, materia: materiaSeleccionada });
    respuesta = respuesta.replace(/```json/g, '').replace(/```/g, '').trim();
    try {
      const data = JSON.parse(respuesta);
      if (data.flashcards && data.flashcards.length > 0) {
        setFlashcards(data.flashcards);
        setMostrarFlashcards(true);
        setTarjetaActiva(null);
      } else throw new Error();
    } catch (e) {
      setError('Error al generar flashcards. Reintenta.');
    }
    setGenerandoFlashcards(false);
  };

  const guardarMaterial = async (tipo, contenido) => {
    setGuardandoMaterial(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('material_estudio').insert({
        user_id: user.id,
        titulo: `${tipo === 'preguntas' ? 'Repaso rápido' : 'Flashcards'}: ${materiaSeleccionada.replace(/_/g, ' ')} (Ciclo ${cicloSeleccionado})`,
        tipo: tipo,
        contenido: contenido
      });
      setError(`✅ Material guardado en tu historial.`);
      setTimeout(() => setError(''), 3000);
    }
    setGuardandoMaterial(false);
  };

  const reiniciar = () => {
    setExamenGenerado(false);
    setPreguntas([]);
    setResultado(null);
    setRespuestasUsuario({});
    setMostrarRepaso(false);
    setMostrarFlashcards(false);
    setRepasoPreguntas([]);
    setFlashcards([]);
    setError('');
  };

  const bgCard = temaOscuro ? 'bg-[#0a141d] border-gray-800' : 'bg-white border-gray-200 shadow-sm';
  const textoColor = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const inputBg = temaOscuro ? 'bg-[#020813] border-gray-800' : 'bg-gray-100 border-gray-300';

  const toggleTarjeta = (idx) => {
    setTarjetaActiva(tarjetaActiva === idx ? null : idx);
  };

  return (
    <main className="p-4 md:p-8 max-w-5xl mx-auto w-full">
      <h1 className={`text-3xl font-black mb-6 ${textoColor}`}>📝 Simulador de Examen</h1>

      {/* Panel de configuración */}
      <div className={`${bgCard} p-6 rounded-2xl border mb-8`}>
        <div className="grid gap-4">
          <div>
            <label className={`block text-sm font-bold mb-2 ${textoColor}`}>Ciclo</label>
            <select value={cicloSeleccionado} onChange={(e) => setCicloSeleccionado(e.target.value)} className={`w-full p-3 rounded-xl border ${inputBg} ${textoColor}`}>
              <option value="">Selecciona ciclo</option>
              {ciclos.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          {materias.length > 0 && (
            <div>
              <label className={`block text-sm font-bold mb-2 ${textoColor}`}>Materia</label>
              <select value={materiaSeleccionada} onChange={(e) => setMateriaSeleccionada(e.target.value)} className={`w-full p-3 rounded-xl border ${inputBg} ${textoColor}`}>
                {materias.map(m => <option key={m}>{m.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
          )}
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1">
              <label className={`block text-sm font-bold mb-2 ${textoColor}`}>Nivel</label>
              <select value={nivel} onChange={(e) => setNivel(e.target.value)} className={`w-full p-3 rounded-xl border ${inputBg} ${textoColor}`}>
                <option value="facil">Fácil</option>
                <option value="medio">Medio</option>
                <option value="dificil">Difícil</option>
              </select>
            </div>
            <div className="flex-1">
              <label className={`block text-sm font-bold mb-2 ${textoColor}`}>Nº preguntas</label>
              <select value={numPreguntas} onChange={(e) => setNumPreguntas(Number(e.target.value))} className={`w-full p-3 rounded-xl border ${inputBg} ${textoColor}`}>
                <option value={3}>3</option>
                <option value={5}>5</option>
                <option value={10}>10</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-2 flex-wrap">
            <button onClick={generarExamen} disabled={cargando} className="flex-1 bg-[#22d3ee] text-black font-bold py-3 rounded-xl hover:bg-[#1bc1da] transition-all">
              {cargando ? 'Generando...' : 'Generar Examen'}
            </button>
            <button onClick={generarRepasoRapido} disabled={generandoRepaso} className="flex-1 bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-all">
              {generandoRepaso ? 'Generando...' : '📝 Repaso rápido'}
            </button>
            <button onClick={generarFlashcards} disabled={generandoFlashcards} className="flex-1 bg-purple-600 text-white font-bold py-3 rounded-xl hover:bg-purple-700 transition-all">
              {generandoFlashcards ? 'Generando...' : '🃏 Flashcards'}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
      </div>

      {/* Repaso rápido interactivo (píldoras) */}
      {mostrarRepaso && !repasoTerminado && repasoPreguntas.length > 0 && (
        <div className={`${bgCard} p-5 rounded-2xl border mb-8`}>
          <div className="flex justify-between items-center mb-3">
            <h3 className={`text-lg font-bold ${textoColor}`}>📝 Repaso interactivo</h3>
            <button onClick={reiniciarRepaso} className="text-gray-400 hover:text-red-400 text-xs">✕ Cerrar</button>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-black/5 rounded-lg">
  <p className={`font-bold mb-2 ${textoColor}`}>{repasoActual+1}. {repasoPreguntas[repasoActual].texto}</p>
  <div className="space-y-2">
    {repasoPreguntas[repasoActual].opciones.map((opt, idx) => (
      <label key={idx} className="flex items-center gap-3 cursor-pointer">
        <input
          type="radio"
          name={`repaso_${repasoActual}`}  // nombre único por pregunta
          value={opt}
          checked={repasoRespuestas[repasoActual] === opt}
          onChange={() => responderRepaso(repasoActual, opt)}
          disabled={repasoFeedback[repasoActual] !== undefined}
          className="w-4 h-4"
        />
        <span className={`text-sm ${textoColor}`}>{opt}</span>
      </label>
    ))}
  </div>
  {repasoFeedback[repasoActual] && (
    <div className={`mt-3 p-2 rounded ${repasoFeedback[repasoActual].correcta ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'}`}>
      <p className="text-sm font-bold">{repasoFeedback[repasoActual].correcta ? '✔ Correcto' : '✗ Incorrecto'}</p>
      <p className="text-xs">{repasoFeedback[repasoActual].feedback}</p>
      {!repasoFeedback[repasoActual].correcta && <p className="text-xs mt-1">Respuesta correcta: {repasoFeedback[repasoActual].respuestaCorrecta}</p>}
    </div>
  )}
  {repasoFeedback[repasoActual] && (
    <button onClick={siguienteRepaso} className="mt-3 px-4 py-1 bg-[#22d3ee] text-black rounded-lg text-xs font-black uppercase">
      {repasoActual + 1 === repasoPreguntas.length ? 'Finalizar repaso' : 'Siguiente pregunta →'}
    </button>
  )}
</div>
          </div>
        </div>
      )}

      {repasoTerminado && (
        <div className={`${bgCard} p-5 rounded-2xl border mb-8`}>
          <h3 className={`text-lg font-bold mb-2 ${textoColor}`}>📊 Resultado del repaso</h3>
          <p className="text-sm">Acertaste {repasoAciertos} de {repasoPreguntas.length} preguntas.</p>
          <button onClick={reiniciarRepaso} className="mt-3 px-4 py-1 bg-[#22d3ee] text-black rounded-lg text-xs font-black uppercase">Cerrar</button>
          <button onClick={() => guardarMaterial('preguntas', repasoPreguntas)} disabled={guardandoMaterial} className="ml-2 mt-3 px-4 py-1 bg-green-600 text-white rounded-lg text-xs font-black uppercase">💾 Guardar repaso</button>
        </div>
      )}

      {/* Flashcards (igual que antes) */}
      {mostrarFlashcards && flashcards.length > 0 && (
        <div className={`${bgCard} p-5 rounded-2xl border mb-8`}>
          <div className="flex justify-between items-center mb-3">
            <h3 className={`text-lg font-bold ${textoColor}`}>🃏 Flashcards - Haz clic para voltear</h3>
            <button onClick={() => setMostrarFlashcards(false)} className="text-gray-400 hover:text-red-400">✕</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {flashcards.map((card, idx) => (
              <div key={idx} onClick={() => toggleTarjeta(idx)} className="relative cursor-pointer h-48 perspective-1000">
                <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${tarjetaActiva === idx ? 'rotate-y-180' : ''}`}>
                  <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-[#22d3ee]/20 to-[#10b981]/20 rounded-xl p-4 flex items-center justify-center shadow-lg border border-[#22d3ee]/30">
                    <p className="text-center font-bold text-sm">{card.anverso}</p>
                  </div>
                  <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-[#0a141d] to-[#1e293b] rounded-xl p-4 flex items-center justify-center shadow-lg border border-white/20">
                    <p className="text-center text-gray-200 text-sm">{card.reverso}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => guardarMaterial('flashcards', flashcards)} disabled={guardandoMaterial} className="mt-6 w-full py-2 bg-[#22d3ee]/20 text-[#22d3ee] rounded-lg text-xs font-black uppercase hover:bg-[#22d3ee]/30">
            {guardandoMaterial ? 'Guardando...' : '💾 Guardar estas flashcards'}
          </button>
        </div>
      )}

      {/* Examen completo (sin cambios) */}
      {examenGenerado && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-xl font-bold ${textoColor}`}>Examen - {materiaSeleccionada.replace(/_/g, ' ')}</h2>
            <button onClick={reiniciar} className="text-sm text-gray-500 underline">← Nuevo examen / repaso</button>
          </div>
          {!resultado ? (
            <div className="space-y-6">
              {preguntas.map((p, idx) => (
                <div key={idx} className={`${bgCard} p-5 rounded-2xl border`}>
                  <p className={`font-bold mb-3 ${textoColor}`}>{idx+1}. {p.texto}</p>
                  <div className="space-y-2">
                    {p.opciones.map((opt, optIdx) => (
                      <label key={optIdx} className="flex items-center gap-3 cursor-pointer">
                        <input type="radio" name={`q_${idx}`} value={opt} onChange={() => setRespuestasUsuario({...respuestasUsuario, [idx]: opt})} className="w-4 h-4" />
                        <span className={`text-sm ${textoColor}`}>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <button onClick={corregirExamen} disabled={cargando} className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-all">
                {cargando ? 'Corrigiendo...' : 'Corregir Examen'}
              </button>
            </div>
          ) : (
            <div className={`${bgCard} p-6 rounded-2xl border`}>
              <h3 className={`text-2xl font-black mb-4 ${resultado.puntuacion >= 70 ? 'text-green-500' : 'text-yellow-500'}`}>
                Puntuación: {resultado.puntuacion} / 100
              </h3>
              <p className={`mb-4 ${textoColor}`}>{resultado.feedback}</p>
              <div className="space-y-4">
                {resultado.detalle?.map((d, i) => (
                  <div key={i} className="border-l-4 pl-4 border-gray-500">
                    <p className={`font-bold ${d.correcta ? 'text-green-400' : 'text-red-400'}`}>
                      {d.correcta ? '✔ Correcto' : '✗ Incorrecto'}
                    </p>
                    <p className={`text-sm ${textoColor}`}>{d.explicacion}</p>
                  </div>
                ))}
              </div>
              <button onClick={reiniciar} className="mt-6 bg-[#22d3ee] text-black py-2 px-4 rounded-xl">Practicar otro examen</button>
            </div>
          )}
        </div>
      )}

      {/* Estilos CSS para el volteo 3D */}
      <style jsx>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </main>
  );
}