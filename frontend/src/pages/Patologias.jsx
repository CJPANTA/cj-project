import { useState, useEffect } from 'react';
import { consultarAuraIA } from '../services/iaService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import PrintButton from '../components/PrintButton';
import { mdAHtml } from '../utils/printService';
import { hablar } from '../utils/vozService';

const FAVORITOS_PATOLOGIAS_KEY = 'cj_favoritos_patologias';
const PATOLOGIAS_GENERADAS_KEY = 'cj_patologias_generadas';

export default function Patologias({ temaOscuro }) {
  // ========== ESTADOS ==========
  const [patologiasBase, setPatologiasBase] = useState([]);
  const [patologiasGeneradas, setPatologiasGeneradas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroSistema, setFiltroSistema] = useState('todos');
  const [patologiaSeleccionada, setPatologiaSeleccionada] = useState(null);
  const [protocoloGenerado, setProtocoloGenerado] = useState('');
  const [cargandoProtocolo, setCargandoProtocolo] = useState(false);
  const [ampliandoInfo, setAmpliandoInfo] = useState(false);
  const [favoritos, setFavoritos] = useState([]);
  const [reproduciendoAudio, setReproduciendoAudio] = useState(false);
  const [audioPausado, setAudioPausado] = useState(false);
  const [buscandoAutomatico, setBuscandoAutomatico] = useState(false);

  // ========== HELPER: procesar markdown inline ==========
  const escaparHtml = (s) =>
    String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

  const procesarInline = (texto) => {
    if (texto == null) return '';
    let t = escaparHtml(texto);
    t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    t = t.replace(/\*(.+?)\*/g, '<em>$1</em>');
    return t;
  };


  // ========== FUNCIÓN DE CONVERSIÓN DE TABLAS ==========
  const convertirTablasHTML = (texto) => {
    if (!texto) return [];
    const lineas = texto.split('\n');
    const resultado = [];
    let i = 0;

    while (i < lineas.length) {
      const linea = lineas[i];
      if (linea.trim().startsWith('|') && linea.trim().endsWith('|')) {
        const filasTabla = [];
        while (i < lineas.length && lineas[i].trim().startsWith('|') && lineas[i].trim().endsWith('|')) {
          filasTabla.push(lineas[i].trim());
          i++;
        }
        const celdasPorFila = filasTabla.map(fila =>
          fila.split('|').slice(1, -1).map(celda => celda.trim())
        );
        if (celdasPorFila.length > 0) {
          const encabezados = celdasPorFila[0];
          let datos = celdasPorFila.slice(1);
          if (datos.length > 0 && datos[0].every(celda => /^[-:]+$/.test(celda))) {
            datos = datos.slice(1);
          }
          resultado.push(
            <div key={`table-${i}`} className="overflow-x-auto my-4" style={{ maxWidth: '100%' }}>
              <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-700" style={{ 
                fontSize: '12px', 
                width: 'auto', 
                minWidth: '500px',
                tableLayout: 'fixed',
                color: '#000000'
              }}>
                <thead>
                  <tr>
                    {encabezados.map((th, idx) => (
                                            <th key={idx} className="border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 p-2 font-bold text-left" style={{ 
                        padding: '6px 10px', 
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                        maxWidth: '180px',
                        color: '#000000'
                      }} dangerouslySetInnerHTML={{ __html: procesarInline(th) }} />
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {datos.map((fila, idxFila) => (
                    <tr key={idxFila}>
                      {fila.map((celda, idxCelda) => (
                                                <td key={idxCelda} className="border border-gray-300 dark:border-gray-700 p-2" style={{ 
                          padding: '6px 10px', 
                          wordBreak: 'break-word', 
                          maxWidth: '180px',
                          whiteSpace: 'normal',
                          color: '#000000'
                        }} dangerouslySetInnerHTML={{ __html: procesarInline(celda) }} />
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
          continue;
        }
      } else {
        resultado.push(
          <div key={`text-${i}`} className="my-2">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {linea}
            </ReactMarkdown>
          </div>
        );
        i++;
      }
    }
    return resultado;
  };

  // ========== CARGAR PATOLOGÍAS ==========
  useEffect(() => {
    const cargarPatologias = async () => {
      try {
        const url = 'https://raw.githubusercontent.com/CJPANTA/cj-project/main/BASE_DATOS/03_CONFIG/patologias.json';
        const response = await fetch(url);
        if (!response.ok) throw new Error('Error al cargar patologías');
        const data = await response.json();
        setPatologiasBase(data.patologias || []);
        setCargando(false);
      } catch (err) {
        console.error('❌ Error cargando patologías:', err);
        setError('No se pudieron cargar las patologías. Verifica tu conexión.');
        setCargando(false);
      }
    };
    cargarPatologias();
  }, []);

  // ========== PATOLOGÍAS GENERADAS ==========
  useEffect(() => {
    const stored = localStorage.getItem(PATOLOGIAS_GENERADAS_KEY);
    if (stored) {
      try { setPatologiasGeneradas(JSON.parse(stored)); } catch (e) { setPatologiasGeneradas([]); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(PATOLOGIAS_GENERADAS_KEY, JSON.stringify(patologiasGeneradas));
  }, [patologiasGeneradas]);

  // ========== FAVORITOS ==========
  useEffect(() => {
    const stored = localStorage.getItem(FAVORITOS_PATOLOGIAS_KEY);
    if (stored) {
      try { setFavoritos(JSON.parse(stored)); } catch (e) { setFavoritos([]); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(FAVORITOS_PATOLOGIAS_KEY, JSON.stringify(favoritos));
  }, [favoritos]);

  const toggleFavorito = (id) => {
    setFavoritos(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const esFavorito = (id) => favoritos.includes(id);

  const todasLasPatologias = [...patologiasBase, ...patologiasGeneradas];
  const sistemas = ['todos', ...new Set(todasLasPatologias.map(p => p.sistema))];

  const patologiasFiltradas = todasLasPatologias.filter(p => {
    const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                             (p.palabras_clave || []).some(k => k.toLowerCase().includes(busqueda.toLowerCase()));
    const coincideSistema = filtroSistema === 'todos' || p.sistema === filtroSistema;
    return coincideBusqueda && coincideSistema;
  });

  // ========== GENERAR PROTOCOLO ==========
  const generarProtocolo = async (patologia, esNueva = false) => {
    setCargandoProtocolo(true);
    setProtocoloGenerado('');
    try {
      const prompt = `Actúa como un fisioterapeuta experto con amplia experiencia clínica, especializado en protocolos de rehabilitación basados en evidencia.

      El usuario es un estudiante/profesional de fisioterapia que necesita un protocolo de tratamiento detallado para:

      PATOLOGÍA: ${patologia.nombre}
      SISTEMA: ${patologia.sistema}
      DESCRIPCIÓN: ${patologia.descripcion_corta || 'Sin descripción'}

      ${patologia.protocolo_base ? `Datos base proporcionados (amplíalos y personalízalos):
      - Evaluación inicial: ${patologia.protocolo_base.evaluacion?.join(', ') || 'No especificada'}
      - Objetivos del tratamiento: ${patologia.protocolo_base.objetivos?.join(', ') || 'No especificados'}
      - Intervención sugerida: ${patologia.protocolo_base.intervencion?.join(', ') || 'No especificada'}
      - Aparatología recomendada: ${patologia.protocolo_base.aparatos?.join(', ') || 'No especificada'}
      - Contraindicaciones: ${patologia.protocolo_base.contraindicaciones?.join(', ') || 'No especificadas'}
      - Criterios de alta: ${patologia.protocolo_base.criterios_alta?.join(', ') || 'No especificados'}` : 'No hay datos base, genera el protocolo desde cero con tu experiencia clínica.'}

      Genera un protocolo de atención COMPLETO Y ESTRUCTURADO que incluya:

      1. **Introducción y descripción de la patología** (epidemiología, mecanismo de lesión).
      2. **Fases de tratamiento** con una tabla detallada que incluya:
         | Fase | Tiempo Estimado | Objetivo Clínico | Agentes Físicos (con parámetros: frecuencia, intensidad, tiempo) | Terapia Manual | Ejercicio Terapéutico |
         |------|----------------|------------------|---------------------------------------------------------------|----------------|------------------------|
      3. **Aparatología recomendada** con especificaciones.
      4. **Contraindicaciones y precauciones** claras.
      5. **Criterios de alta y seguimiento**.
      6. **Recomendaciones para el paciente**.

      El protocolo debe ser práctico, aplicable y usar **negritas** para destacar conceptos clave. Incluye viñetas y listas.`;

      const respuesta = await consultarAuraIA(prompt, {
        ciclo: 'Clínica',
        materia: 'Patologías'
      });

      setProtocoloGenerado(respuesta);

      if (esNueva) {
        const nuevaPatologia = {
          ...patologia,
          protocolo_generado: respuesta,
          fecha_generacion: new Date().toISOString()
        };
        setPatologiasGeneradas(prev => [...prev, nuevaPatologia]);
      }

    } catch (error) {
      console.error('❌ Error al generar protocolo:', error);
      setProtocoloGenerado('⚠️ Ocurrió un error al generar el protocolo. Intenta de nuevo.');
    } finally {
      setCargandoProtocolo(false);
    }
  };

  // ========== BUSCAR PATOLOGÍA ==========
  const buscarPatologia = async (termino) => {
    if (!termino.trim()) return;
    setBusqueda(termino);
    setBuscandoAutomatico(true);

    const encontrada = todasLasPatologias.find(p =>
      p.nombre.toLowerCase().includes(termino.toLowerCase()) ||
      (p.palabras_clave || []).some(k => k.toLowerCase().includes(termino.toLowerCase()))
    );

    if (encontrada) {
      setPatologiaSeleccionada(encontrada);
      setProtocoloGenerado('');
      setBuscandoAutomatico(false);
      return;
    }

    const nuevaPatologia = {
      id: termino.toLowerCase().replace(/\s/g, '_'),
      nombre: termino,
      sistema: 'no_clasificado',
      descripcion_corta: `Patología consultada: ${termino}`,
      palabras_clave: termino.split(' ')
    };

    setPatologiaSeleccionada(nuevaPatologia);
    await generarProtocolo(nuevaPatologia, true);
    setBuscandoAutomatico(false);
  };

  // ========== AMPLIAR INFORMACIÓN ==========
  const ampliarInformacion = async (patologia) => {
    setAmpliandoInfo(true);
    try {
      const prompt = `Actúa como un fisioterapeuta investigador.
      Amplía la siguiente información sobre la patología "${patologia.nombre}" para un estudiante de fisioterapia.

      Proporciona:
      - Etiología (causas) más detallada.
      - Fisiopatología (mecanismos) explicada de forma sencilla.
      - Factores de riesgo y pronóstico.
      - Referencias a estudios o guías clínicas actuales (sin links, solo menciones).
      - Consejos prácticos para el paciente y el terapeuta.

      La respuesta debe ser en formato markdown, con **negritas** para destacar, y viñetas.`;

      const respuesta = await consultarAuraIA(prompt, {
        ciclo: 'Clínica',
        materia: 'Investigación'
      });

      setProtocoloGenerado(prev => prev + '\n\n---\n\n## 🔬 Información ampliada\n\n' + respuesta);
    } catch (error) {
      console.error('❌ Error al ampliar información:', error);
      alert('Error al ampliar la información. Intenta de nuevo.');
    } finally {
      setAmpliandoInfo(false);
    }
  };


  // ========== RENDERIZADO ==========
  const bgPrincipal = temaOscuro ? 'bg-[#020813]' : 'bg-[#f1f5f9]';
  const textoColor = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const textoSecundario = temaOscuro ? 'text-gray-400' : 'text-gray-600';
  const bgTarjeta = temaOscuro ? 'bg-[#0a141d] border-gray-800' : 'bg-white border-gray-200 shadow-sm';
  const bgInput = temaOscuro ? 'bg-black/20 border-white/10' : 'bg-gray-100 border-gray-300';

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#22d3ee] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#22d3ee] text-sm font-bold">Cargando patologías...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 max-w-md text-center">
          <p className="text-red-400 font-bold text-lg">⚠️ Error</p>
          <p className="text-gray-300 text-sm mt-2">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-[#22d3ee] text-black font-bold rounded-xl hover:scale-105 transition-all">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className={`min-h-screen ${bgPrincipal} p-4 md:p-8`}>
      <h1 className={`text-3xl md:text-4xl font-black ${textoColor} mb-6`}>
        Patologías <span className="text-[#22d3ee]">Clínicas</span>
      </h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && buscarPatologia(busqueda)}
            placeholder="Buscar patología (ej. epicondilitis, epitrocleitis, lumbalgia)..."
            className={`w-full ${bgInput} border p-3 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm ${textoColor}`}
          />
          <button
            onClick={() => buscarPatologia(busqueda)}
            disabled={buscandoAutomatico}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-[#22d3ee] text-black text-xs font-black rounded-lg hover:scale-105 transition-all disabled:opacity-50"
          >
            {buscandoAutomatico ? '⏳' : '🔍'}
          </button>
        </div>
        <select
          value={filtroSistema}
          onChange={(e) => setFiltroSistema(e.target.value)}
          className={`${bgInput} border p-3 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm ${textoColor}`}
        >
          {sistemas.map(sistema => (
            <option key={sistema} value={sistema}>
              {sistema === 'todos' ? 'Todos los sistemas' : sistema}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {patologiasFiltradas.length === 0 ? (
          <div className={`${textoSecundario} col-span-full text-center py-10`}>
            <p>No se encontraron patologías.</p>
            {busqueda && (
              <button
                onClick={() => buscarPatologia(busqueda)}
                className="mt-2 text-[#22d3ee] hover:underline text-sm"
              >
                Buscar "{busqueda}" con IA →
              </button>
            )}
          </div>
        ) : (
          patologiasFiltradas.map((patologia) => (
            <div
              key={patologia.id}
              className={`${bgTarjeta} border rounded-2xl p-5 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1`}
              onClick={() => {
                setPatologiaSeleccionada(patologia);
                if (patologia.protocolo_generado) {
                  setProtocoloGenerado(patologia.protocolo_generado);
                } else {
                  setProtocoloGenerado('');
                }
              }}
            >
              <div className="flex justify-between items-start">
                <h3 className={`text-lg font-black ${textoColor}`}>{patologia.nombre}</h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorito(patologia.id);
                  }}
                  className="text-2xl"
                >
                  {esFavorito(patologia.id) ? '⭐' : '☆'}
                </button>
              </div>
              <p className={`text-xs ${textoSecundario} uppercase mt-1`}>{patologia.sistema}</p>
              <p className={`text-sm ${textoSecundario} mt-2 line-clamp-2`}>
                {patologia.descripcion_corta || 'Sin descripción'}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPatologiaSeleccionada(patologia);
                  if (patologia.protocolo_generado) {
                    setProtocoloGenerado(patologia.protocolo_generado);
                  } else {
                    setProtocoloGenerado('');
                  }
                }}
                className="mt-3 text-[#22d3ee] text-xs font-bold hover:underline"
              >
                Ver detalles →
              </button>
            </div>
          ))
        )}
      </div>

      {patologiaSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className={`${bgTarjeta} border rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 relative`}>
            <button
              onClick={() => {
                setPatologiaSeleccionada(null);
                setProtocoloGenerado('');
              }}
              className="absolute top-4 right-4 text-2xl hover:scale-110 transition-all"
            >
              ✕
            </button>
            <h2 className={`text-2xl font-black ${textoColor} mb-2`}>
              {patologiaSeleccionada.nombre}
              {patologiaSeleccionada.fecha_generacion && (
                <span className="text-xs text-gray-500 ml-2">(generada)</span>
              )}
            </h2>
            <p className={`text-xs ${textoSecundario} uppercase mb-4`}>{patologiaSeleccionada.sistema}</p>
            <p className={`text-sm ${textoSecundario} mb-4`}>
              {patologiaSeleccionada.descripcion_corta || 'Sin descripción'}
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {!patologiaSeleccionada.protocolo_generado && (
                <button
                  onClick={() => generarProtocolo(patologiaSeleccionada, false)}
                  disabled={cargandoProtocolo}
                  className="px-4 py-2 bg-[#22d3ee] text-black font-black rounded-xl text-sm uppercase hover:scale-105 transition-all disabled:opacity-50"
                >
                  {cargandoProtocolo ? '⏳ Generando...' : '🧠 Generar protocolo'}
                </button>
              )}
              <button
                onClick={() => ampliarInformacion(patologiaSeleccionada)}
                disabled={ampliandoInfo || !protocoloGenerado}
                className="px-4 py-2 bg-purple-500 text-white font-black rounded-xl text-sm uppercase hover:scale-105 transition-all disabled:opacity-50"
              >
                {ampliandoInfo ? '⏳ Ampliando...' : '🔬 Ampliar info'}
              </button>
              <button
                onClick={() => {
                  const query = encodeURIComponent(patologiaSeleccionada.nombre + ' fisioterapia');
                  window.open(`https://www.google.com/search?q=${query}`, '_blank');
                }}
                className="px-4 py-2 bg-blue-500 text-white font-black rounded-xl text-sm uppercase hover:scale-105 transition-all"
              >
                🌐 Google
              </button>
              <button
                onClick={() => {
                  const query = encodeURIComponent(patologiaSeleccionada.nombre + ' fisioterapia tratamiento');
                  window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
                }}
                className="px-4 py-2 bg-red-600 text-white font-black rounded-xl text-sm uppercase hover:scale-105 transition-all"
              >
                ▶️ YouTube
              </button>
            </div>

            {protocoloGenerado && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className={`text-sm font-bold ${textoColor}`}>Protocolo de atención</h3>
                  <div className="flex gap-2">
  <button
  onClick={() => {
    // Si ya está reproduciendo o pausado, delegar al service
    hablar(protocoloGenerado, {
      onStart: () => { setReproduciendoAudio(true); setAudioPausado(false); },
      onEnd: () => { setReproduciendoAudio(false); setAudioPausado(false); },
      onError: () => { setReproduciendoAudio(false); setAudioPausado(false); },
      onPause: () => { setAudioPausado(true); setReproduciendoAudio(true); },
      onResume: () => { setAudioPausado(false); setReproduciendoAudio(true); },
    });
  }}
  className={`p-2 rounded-full ${reproduciendoAudio ? (audioPausado ? 'bg-yellow-600' : 'bg-green-800') : 'bg-green-600'} text-white hover:bg-opacity-80 transition-all`}
  title={reproduciendoAudio ? (audioPausado ? 'Reanudar' : 'Pausar') : 'Leer'}
>
  {reproduciendoAudio ? (audioPausado ? '▶️' : '⏸️') : '🔊'}
</button>

  <PrintButton
    titulo={`Protocolo — ${patologiaSeleccionada?.nombre || 'Patología'}`}
    subtitulo={`Sistema: ${patologiaSeleccionada?.sistema || 'No clasificado'}`}
    contenido={mdAHtml(protocoloGenerado)}
    metadata={{
      fecha: new Date().toLocaleDateString('es-PE'),
      autor: 'Aura IA',
      centro: 'CJ Fisioterapia',
    }}
    className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition-all disabled:opacity-50"
    title="Imprimir / Guardar como PDF"
  />
</div>
                </div>
                <div
                  id="protocolo-contenido"
                  className={`prose prose-sm max-w-none ${temaOscuro ? 'prose-invert' : ''} p-4 rounded-xl bg-[#22d3ee]/5 border border-[#22d3ee]/20`}
                >
                  {convertirTablasHTML(protocoloGenerado)}
                </div>
              </div>
            )}

            {patologiaSeleccionada.archivos_relacionados && patologiaSeleccionada.archivos_relacionados.length > 0 && (
              <div className="mt-6">
                <h3 className={`text-sm font-bold ${textoColor} mb-2`}>📄 Archivos relacionados</h3>
                <ul className="list-disc pl-5">
                  {patologiaSeleccionada.archivos_relacionados.map((archivo, idx) => {
                    const nombreArchivo = archivo.split('/').pop();
                    const url = `https://raw.githubusercontent.com/CJPANTA/cj-project/main/BASE_DATOS/01_CARRION/${archivo}`;
                    return (
                      <li key={idx} className={`text-xs ${textoSecundario}`}>
                        <a href={url} target="_blank" rel="noreferrer" className="text-[#22d3ee] hover:underline" download>
                          📎 {nombreArchivo}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}