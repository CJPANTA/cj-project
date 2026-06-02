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

  // Estados para el repaso rápido (interactivo)
  const [repasoRapido, setRepasoRapido] = useState(null);
  const [mostrarRepaso, setMostrarRepaso] = useState(false);
  const [generandoRepaso, setGenerandoRepaso] = useState(false);
  const [respuestasRepaso, setRespuestasRepaso] = useState({});
  const [feedbacksRepaso, setFeedbacksRepaso] = useState({});
  const [verificandoRepaso, setVerificandoRepaso] = useState(false);

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

  // Generar examen completo (sin cambios)
  const generarExamen = async () => {
    if (!cicloSeleccionado || !materiaSeleccionada) {
      setError('Selecciona ciclo y materia');
      return;
    }
    setCargando(true);
    setError('');
    const prompt = `Actúa como un profesor de fisioterapia. Genera un examen de ${numPreguntas} preguntas tipo test (opción múltiple) sobre la materia "${materiaSeleccionada.replace(/_/g, ' ')}" del ciclo ${cicloSeleccionado}. Nivel de dificultad: ${nivel}. 
    Devuelve SOLO un objeto JSON con esta estructura exacta:
    {
      "preguntas": [
        {
          "texto": "¿Cuál es la función del ...?",
          "opciones": ["Opción A", "Opción B", "Opción C", "Opción D"],
          "respuesta_correcta": "Opción A",
          "feedback": "Explicación breve de por qué esa es la respuesta correcta."
        }
      ]
    }
    No incluyas texto adicional, solo el JSON.`;

    let respuesta = await consultarAuraIA(prompt, { ciclo: `Ciclo ${cicloSeleccionado}`, materia: materiaSeleccionada });
    respuesta = respuesta.replace(/```json/g, '').replace(/```/g, '').trim();
    try {
      const data = JSON.parse(respuesta);
      if (data.preguntas && data.preguntas.length > 0) {
        setPreguntas(data.preguntas);
        setExamenGenerado(true);
        setRespuestasUsuario({});
        setResultado(null);
      } else {
        throw new Error('No se generaron preguntas');
      }
    } catch (e) {
      console.error('Error parsing examen:', respuesta);
      setError('Error al generar el examen. Reintenta.');
    }
    setCargando(false);
  };

  // Corregir examen (sin cambios)
  const corregirExamen = async () => {
    const todasRespondidas = preguntas.every((_, idx) => respuestasUsuario[idx] !== undefined);
    if (!todasRespondidas) {
      setError('Responde todas las preguntas antes de corregir.');
      return;
    }
    setCargando(true);
    setError('');
    const examenData = preguntas.map((p, idx) => ({
      pregunta: p.texto,
      respuesta_usuario: respuestasUsuario[idx],
      respuesta_correcta: p.respuesta_correcta,
      opciones: p.opciones
    }));
    const promptCorrecion = `Corrige el siguiente examen. Calcula el porcentaje de respuestas correctas (sobre 100). Devuelve SOLO un objeto JSON con esta estructura exacta:
{
  "puntuacion": número (0-100),
  "feedback": "comentario general",
  "detalle": [
    {"pregunta": "texto de la pregunta", "correcta": true/false, "explicacion": "texto explicativo"}
  ]
}
Examen: ${JSON.stringify(examenData)}`;

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
      console.error('Error parsing corrección:', correccion);
      setError('Error al corregir. Reintenta.');
    }
    setCargando(false);
  };

  // Generar repaso rápido (preguntas y flashcards sin respuestas)
  const generarRepasoRapido = async () => {
    if (!cicloSeleccionado || !materiaSeleccionada) {
      setError('Selecciona ciclo y materia para generar repaso.');
      return;
    }
    setGenerandoRepaso(true);
    setError('');
    const prompt = `Actúa como un tutor de fisioterapia. Basándote en la materia "${materiaSeleccionada.replace(/_/g, ' ')}" del ciclo ${cicloSeleccionado}, genera:
    1) 3 preguntas tipo test. Para cada pregunta, devuelve: {"texto": "pregunta", "opciones": ["A","B","C","D"]}.
    **No incluyas la respuesta correcta ni el feedback todavía.**
    2) 3 flashcards. Para cada flashcard, devuelve: {"anverso": "¿Qué es...?", "reverso": "Definición de..."}.
    Devuelve SOLO un objeto JSON válido con esta estructura:
    {
      "preguntas": [
        {"texto": "pregunta", "opciones": ["A","B","C","D"]}
      ],
      "flashcards": [
        {"anverso": "...", "reverso": "..."}
      ]
    }
    No incluyas texto adicional, solo el JSON.`;

    let respuesta = await consultarAuraIA(prompt, { ciclo: `Ciclo ${cicloSeleccionado}`, materia: materiaSeleccionada });
    respuesta = respuesta.replace(/```json/g, '').replace(/```/g, '').trim();
    try {
      const data = JSON.parse(respuesta);
      if (data.preguntas && data.flashcards && data.preguntas.length === 3 && data.flashcards.length === 3) {
        setRepasoRapido(data);
        setMostrarRepaso(true);
        setRespuestasRepaso({});
        setFeedbacksRepaso({});
      } else {
        throw new Error('Formato incorrecto');
      }
    } catch (e) {
      console.error('Error parsing repaso:', respuesta);
      setError('Error al generar repaso. Reintenta.');
    }
    setGenerandoRepaso(false);
  };

  // Verificar una pregunta del repaso rápido (obtener respuesta correcta y feedback)
  const verificarPreguntaRepaso = async (idx, respuestaSeleccionada) => {
    if (!respuestaSeleccionada) return;
    setVerificandoRepaso(true);
    const preguntaTexto = repasoRapido.preguntas[idx].texto;
    const opciones = repasoRapido.preguntas[idx].opciones;
    const prompt = `Actúa como un tutor. La siguiente pregunta es: "${preguntaTexto}" con opciones: ${JSON.stringify(opciones)}. El usuario ha respondido: "${respuestaSeleccionada}". Indica cuál es la respuesta correcta y proporciona una breve retroalimentación. Devuelve SOLO un objeto JSON con: {"correcta": "opción correcta", "feedback": "explicación"}`;
    let respuesta = await consultarAuraIA(prompt, { ciclo: `Ciclo ${cicloSeleccionado}`, materia: materiaSeleccionada });
    respuesta = respuesta.replace(/```json/g, '').replace(/```/g, '').trim();
    try {
      const data = JSON.parse(respuesta);
      setFeedbacksRepaso(prev => ({ ...prev, [idx]: { respuestaSeleccionada, correcta: data.correcta, feedback: data.feedback } }));
    } catch (e) {
      console.error(e);
      setFeedbacksRepaso(prev => ({ ...prev, [idx]: { respuestaSeleccionada, correcta: "Error", feedback: "No se pudo verificar la respuesta." } }));
    }
    setVerificandoRepaso(false);
  };

  const reiniciar = () => {
    setExamenGenerado(false);
    setPreguntas([]);
    setResultado(null);
    setRespuestasUsuario({});
    setMostrarRepaso(false);
    setRepasoRapido(null);
    setRespuestasRepaso({});
    setFeedbacksRepaso({});
    setError('');
  };

  const bgCard = temaOscuro ? 'bg-[#0a141d] border-gray-800' : 'bg-white border-gray-200 shadow-sm';
  const textoColor = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const inputBg = temaOscuro ? 'bg-[#020813] border-gray-800' : 'bg-gray-100 border-gray-300';

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
          <div className="flex gap-3 mt-2">
            <button onClick={generarExamen} disabled={cargando} className="flex-1 bg-[#22d3ee] text-black font-bold py-3 rounded-xl hover:bg-[#1bc1da] transition-all">
              {cargando ? 'Generando...' : 'Generar Examen'}
            </button>
            <button onClick={generarRepasoRapido} disabled={generandoRepaso} className="flex-1 bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-all">
              {generandoRepaso ? 'Generando...' : '📚 Repaso rápido'}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
      </div>

      {/* Repaso rápido interactivo */}
      {mostrarRepaso && repasoRapido && (
        <div className={`${bgCard} p-5 rounded-2xl border mb-8`}>
          <div className="flex justify-between items-center mb-3">
            <h3 className={`text-lg font-bold ${textoColor}`}>📖 Repaso rápido (interactivo)</h3>
            <button onClick={() => setMostrarRepaso(false)} className="text-gray-400 hover:text-red-400">✕</button>
          </div>
          <div className="space-y-6">
            {/* Preguntas interactivas */}
            <div>
              <h4 className={`text-sm font-bold text-[#22d3ee] mb-3`}>🎯 Preguntas tipo test</h4>
              <div className="space-y-5">
                {repasoRapido.preguntas.map((p, idx) => (
                  <div key={idx} className="p-4 bg-black/5 rounded-lg">
                    <p className={`font-bold mb-3 ${textoColor}`}>{idx+1}. {p.texto}</p>
                    <div className="space-y-2 mb-3">
                      {p.opciones.map((opt, optIdx) => (
                        <label key={optIdx} className="flex items-center gap-3 cursor-pointer">
                          <input type="radio" name={`repaso_${idx}`} value={opt} onChange={(e) => setRespuestasRepaso({...respuestasRepaso, [idx]: e.target.value})} className="w-4 h-4" />
                          <span className={`text-sm ${textoColor}`}>{opt}</span>
                        </label>
                      ))}
                    </div>
                    <button onClick={() => verificarPreguntaRepaso(idx, respuestasRepaso[idx])} disabled={verificandoRepaso} className="text-xs bg-[#22d3ee]/20 text-[#22d3ee] px-3 py-1 rounded-full hover:bg-[#22d3ee]/30">
                      {verificandoRepaso ? 'Verificando...' : 'Verificar respuesta'}
                    </button>
                    {feedbacksRepaso[idx] && (
                      <div className="mt-3 p-2 bg-black/20 rounded-md">
                        <p className={`text-xs font-bold ${feedbacksRepaso[idx].correcta !== "Error" ? 'text-green-400' : 'text-red-400'}`}>
                          Respuesta correcta: {feedbacksRepaso[idx].correcta}
                        </p>
                        <p className="text-xs text-gray-300 mt-1">{feedbacksRepaso[idx].feedback}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {/* Flashcards (sin cambios) */}
            <div>
              <h4 className={`text-sm font-bold text-[#22d3ee] mb-3`}>🃏 Flashcards</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {repasoRapido.flashcards.map((f, idx) => (
                  <div key={idx} className="p-4 bg-black/5 rounded-lg border-l-4 border-[#22d3ee]">
                    <p className="font-bold text-sm">{f.anverso}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{f.reverso}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Examen generado (sin cambios) */}
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
              {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
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
    </main>
  );
}