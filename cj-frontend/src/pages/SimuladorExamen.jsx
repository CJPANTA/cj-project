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

  const generarExamen = async () => {
    if (!cicloSeleccionado) { setError('Selecciona un ciclo'); return; }
    if (!materiaSeleccionada) { setError('Selecciona una materia'); return; }
    setCargando(true);
    setError('');
    const prompt = `Actúa como profesor de fisioterapia. Genera un examen de ${numPreguntas} preguntas tipo test sobre "${materiaSeleccionada.replace(/_/g, ' ')}" del ciclo ${cicloSeleccionado}. Nivel: ${nivel}. 
    Devuelve SOLO un JSON: {"preguntas":[{"texto":"pregunta","opciones":["A","B","C","D"],"respuesta_correcta":"A"}]}`;
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

  const handleRespuestaChange = (index, valor) => {
    setRespuestasUsuario({ ...respuestasUsuario, [index]: valor });
  };

  const corregirExamen = async () => {
    const todasRespondidas = preguntas.every((_, idx) => respuestasUsuario[idx] !== undefined);
    if (!todasRespondidas) { setError('Responde todas las preguntas.'); return; }
    setCargando(true);
    setError('');
    const examenData = preguntas.map((p, idx) => ({
      pregunta: p.texto,
      respuesta_usuario: respuestasUsuario[idx],
      respuesta_correcta: p.respuesta_correcta,
      opciones: p.opciones
    }));
    const promptCorrecion = `Corrige el siguiente examen. Calcula el porcentaje de respuestas correctas (sobre 100). Devuelve SOLO JSON: {"puntuacion": número (0-100), "feedback": "comentario", "detalle": [{"pregunta": "texto", "correcta": true/false, "explicacion": "texto"}]}. Examen: ${JSON.stringify(examenData)}`;
    let correccion = await consultarAuraIA(promptCorrecion);
    correccion = correccion.replace(/```json/g, '').replace(/```/g, '').trim();
    try {
      const jsonCorr = JSON.parse(correccion);
      // Asegurar que puntuacion sea un número válido
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
      console.error('Error parseando corrección:', correccion);
      setError('Error al corregir. Reintenta.');
    }
    setCargando(false);
  };

  const reiniciar = () => {
    setExamenGenerado(false);
    setPreguntas([]);
    setResultado(null);
    setRespuestasUsuario({});
    setError('');
  };

  const bgCard = temaOscuro ? 'bg-[#0a141d] border-gray-800' : 'bg-white border-gray-200 shadow-sm';
  const textoColor = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const inputBg = temaOscuro ? 'bg-[#020813] border-gray-800' : 'bg-gray-100 border-gray-300';

  return (
    <main className="p-4 md:p-8 max-w-4xl mx-auto w-full">
      <h1 className={`text-3xl font-black mb-6 ${textoColor}`}>📝 Simulador de Examen</h1>
      {!examenGenerado ? (
        <div className={`${bgCard} p-6 rounded-2xl border`}>
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
            <div>
              <label className={`block text-sm font-bold mb-2 ${textoColor}`}>Nivel</label>
              <select value={nivel} onChange={(e) => setNivel(e.target.value)} className={`w-full p-3 rounded-xl border ${inputBg} ${textoColor}`}>
                <option value="facil">Fácil</option><option value="medio">Medio</option><option value="dificil">Difícil</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-bold mb-2 ${textoColor}`}>Nº preguntas</label>
              <select value={numPreguntas} onChange={(e) => setNumPreguntas(Number(e.target.value))} className={`w-full p-3 rounded-xl border ${inputBg} ${textoColor}`}>
                <option value={3}>3</option><option value={5}>5</option><option value={10}>10</option>
              </select>
            </div>
            <button onClick={generarExamen} disabled={cargando} className="mt-4 bg-[#22d3ee] text-black font-bold py-3 rounded-xl hover:bg-[#1bc1da] transition-all">
              {cargando ? 'Generando...' : 'Generar Examen'}
            </button>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-xl font-bold ${textoColor}`}>Examen - {materiaSeleccionada.replace(/_/g, ' ')}</h2>
            <button onClick={reiniciar} className="text-sm text-gray-500 underline">← Nuevo examen</button>
          </div>
          {!resultado ? (
            <>
              <div className="space-y-6">
                {preguntas.map((p, idx) => (
                  <div key={idx} className={`${bgCard} p-5 rounded-2xl border`}>
                    <p className={`font-bold mb-3 ${textoColor}`}>{idx+1}. {p.texto}</p>
                    <div className="space-y-2">
                      {p.opciones.map((opt, optIdx) => (
                        <label key={optIdx} className="flex items-center gap-3 cursor-pointer">
                          <input type="radio" name={`q_${idx}`} value={opt} onChange={() => handleRespuestaChange(idx, opt)} className="w-4 h-4" />
                          <span className={`text-sm ${textoColor}`}>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={corregirExamen} disabled={cargando} className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-all mt-6">
                {cargando ? 'Corrigiendo...' : 'Corregir Examen'}
              </button>
              {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
            </>
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