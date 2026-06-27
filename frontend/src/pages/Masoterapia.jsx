import { useState } from 'react';

// Datos base (ampliados con más técnicas)
const tecnicasBase = [
  {
    id: 'drenaje_linfatico',
    nombre: 'Drenaje Linfático Manual',
    zona: ['cuerpo_completo', 'miembros_inferiores'],
    objetivo: 'circulatorio',
    descripcion: 'Técnica suave y rítmica que estimula el sistema linfático para eliminar toxinas y reducir edemas.',
    indicaciones: ['Edemas', 'Postcirugía', 'Fibromialgia'],
    contraindicaciones: ['Infecciones agudas', 'Insuficiencia cardíaca', 'Trombosis'],
    videoId: 'qD8B8nQ8m9w'
  },
  {
    id: 'masaje_descontracturante',
    nombre: 'Masaje Descontracturante',
    zona: ['espalda', 'cuello', 'hombros'],
    objetivo: 'descontracturante',
    descripcion: 'Técnica profunda que libera tensiones musculares y puntos gatillo.',
    indicaciones: ['Contracturas', 'Estrés', 'Dolor cervical'],
    contraindicaciones: ['Fracturas', 'Hematomas', 'Procesos inflamatorios agudos'],
    videoId: 'g6qWkH1g7Tk'
  },
  {
    id: 'masaje_deportivo',
    nombre: 'Masaje Deportivo',
    zona: ['miembros_superiores', 'miembros_inferiores'],
    objetivo: 'deportivo',
    descripcion: 'Técnica combinada de estiramientos y amasamiento para preparar y recuperar al deportista.',
    indicaciones: ['Pre-competición', 'Post-competición', 'Prevención de lesiones'],
    contraindicaciones: ['Fracturas', 'Lesiones agudas', 'Fiebre'],
    videoId: '8l1qJkD2m_w'
  },
  {
    id: 'shiatsu',
    nombre: 'Shiatsu',
    zona: ['cuerpo_completo'],
    objetivo: 'relajatorio',
    descripcion: 'Técnica japonesa que utiliza presión con los dedos y palmas para equilibrar la energía.',
    indicaciones: ['Estrés', 'Dolor crónico', 'Insomnio'],
    contraindicaciones: ['Embarazo', 'Fracturas', 'Enfermedades contagiosas'],
    videoId: '5VxqL8hL_WU'
  },
  {
    id: 'masaje_sueco',
    nombre: 'Masaje Sueco',
    zona: ['cuerpo_completo'],
    objetivo: 'relajatorio',
    descripcion: 'Técnica clásica que combina amasamientos, fricciones y percusiones para mejorar la circulación y relajar.',
    indicaciones: ['Estrés', 'Dolor muscular', 'Mejora de la circulación'],
    contraindicaciones: ['Fiebre', 'Infecciones cutáneas', 'Trombosis'],
    videoId: 'HPWXmnaszWo'
  },
  {
    id: 'piedras_calientes',
    nombre: 'Masaje con Piedras Calientes',
    zona: ['espalda', 'cuello'],
    objetivo: 'relajatorio',
    descripcion: 'Técnica que usa piedras volcánicas calientes para relajar profundamente la musculatura.',
    indicaciones: ['Estrés', 'Dolor crónico', 'Contracturas'],
    contraindicaciones: ['Hipertensión', 'Diabetes', 'Embarazo'],
    videoId: 'd_b3dKXoz1U'
  }
];

export default function Masoterapia({ temaOscuro }) {
  const [busqueda, setBusqueda] = useState('');
  const [filtroZona, setFiltroZona] = useState('todos');
  const [filtroObjetivo, setFiltroObjetivo] = useState('todos');
  const [videoVisible, setVideoVisible] = useState(null);

  const zonas = ['todos', ...new Set(tecnicasBase.flatMap(t => t.zona))];
  const objetivos = ['todos', ...new Set(tecnicasBase.map(t => t.objetivo))];

  const tecnicasFiltradas = tecnicasBase.filter(t => {
    const coincideBusqueda = t.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                            t.descripcion.toLowerCase().includes(busqueda.toLowerCase());
    const coincideZona = filtroZona === 'todos' || t.zona.includes(filtroZona);
    const coincideObjetivo = filtroObjetivo === 'todos' || t.objetivo === filtroObjetivo;
    return coincideBusqueda && coincideZona && coincideObjetivo;
  });

  const bgPrincipal = temaOscuro ? 'bg-[#020813]' : 'bg-[#f1f5f9]';
  const textoColor = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const textoSecundario = temaOscuro ? 'text-gray-400' : 'text-gray-600';
  const bgTarjeta = temaOscuro ? 'bg-[#0a141d] border-gray-800' : 'bg-white border-gray-200 shadow-sm';
  const bgInput = temaOscuro ? 'bg-black/20 border-white/10' : 'bg-gray-100 border-gray-300';

  const buscarEnYouTube = (tecnica) => {
    const query = encodeURIComponent(tecnica.nombre + ' masoterapia fisioterapia');
    window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
  };

  const toggleVideo = (id) => {
    setVideoVisible(prev => prev === id ? null : id);
  };

  return (
    <main className={`min-h-screen ${bgPrincipal} p-4 md:p-8`}>
      <h1 className={`text-3xl md:text-4xl font-black ${textoColor} mb-6`}>
        Masoterapia <span className="text-[#22d3ee]">Guía de técnicas</span>
      </h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar técnica (ej. drenaje, deportivo, shiatsu)..."
          className={`flex-1 ${bgInput} border p-3 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm ${textoColor}`}
        />
        <select
          value={filtroZona}
          onChange={(e) => setFiltroZona(e.target.value)}
          className={`${bgInput} border p-3 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm ${textoColor}`}
        >
          {zonas.map(zona => (
            <option key={zona} value={zona}>
              {zona === 'todos' ? 'Todas las zonas' : zona.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
        <select
          value={filtroObjetivo}
          onChange={(e) => setFiltroObjetivo(e.target.value)}
          className={`${bgInput} border p-3 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm ${textoColor}`}
        >
          {objetivos.map(obj => (
            <option key={obj} value={obj}>
              {obj === 'todos' ? 'Todos los objetivos' : obj}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tecnicasFiltradas.length === 0 ? (
          <div className={`${textoSecundario} col-span-full text-center py-10`}>
            <p>No se encontraron técnicas.</p>
            {busqueda && (
              <button
                onClick={() => {
                  const query = encodeURIComponent(busqueda + ' masoterapia');
                  window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
                }}
                className="mt-2 text-[#22d3ee] hover:underline text-sm"
              >
                Buscar en YouTube →
              </button>
            )}
          </div>
        ) : (
          tecnicasFiltradas.map((tecnica) => {
            const mostrarVideo = videoVisible === tecnica.id;
            return (
              <div key={tecnica.id} className={`${bgTarjeta} border rounded-2xl p-5 flex flex-col`}>
                <h3 className={`text-lg font-black ${textoColor}`}>{tecnica.nombre}</h3>
                <p className={`text-xs ${textoSecundario} uppercase`}>
                  Zona: {tecnica.zona.join(', ')}
                </p>
                <p className={`text-xs ${textoSecundario} uppercase`}>
                  Objetivo: {tecnica.objetivo}
                </p>
                <p className={`text-sm ${textoSecundario} mt-2 flex-1`}>{tecnica.descripcion}</p>
                <div className="mt-3">
                  <p className={`text-xs font-bold ${textoColor}`}>Indicaciones:</p>
                  <ul className="list-disc pl-5 text-xs text-gray-400">
                    {tecnica.indicaciones.map((ind, idx) => <li key={idx}>{ind}</li>)}
                  </ul>
                </div>
                <div className="mt-2">
                  <p className={`text-xs font-bold ${textoColor}`}>Contraindicaciones:</p>
                  <ul className="list-disc pl-5 text-xs text-red-400">
                    {tecnica.contraindicaciones.map((cont, idx) => <li key={idx}>{cont}</li>)}
                  </ul>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => buscarEnYouTube(tecnica)}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase hover:bg-red-700 transition-all"
                  >
                    ▶ Buscar en YouTube
                  </button>
                  <button
                    onClick={() => toggleVideo(tecnica.id)}
                    className="flex-1 bg-[#22d3ee] text-black px-4 py-2 rounded-xl text-xs font-bold uppercase hover:bg-[#22d3ee]/80 transition-all"
                  >
                    {mostrarVideo ? 'Ocultar video' : 'Ver video'}
                  </button>
                </div>
                {mostrarVideo && (
                  <div className="mt-4 aspect-video rounded-xl overflow-hidden border border-gray-700">
                    {tecnica.videoId ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${tecnica.videoId}?rel=0`}
                        title={tecnica.nombre}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      ></iframe>
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-800 text-gray-400 text-sm">
                        <p>Video no disponible. Busca en YouTube.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}