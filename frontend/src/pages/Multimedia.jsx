import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Multimedia({ temaOscuro }) {
  const [archivos, setArchivos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState('Todos');
  const [seleccionado, setSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [mostrarNota, setMostrarNota] = useState(false);
  const [notaActual, setNotaActual] = useState('');
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState(null);

  const GITHUB_USER = "CJPANTA";
  const GITHUB_REPO = "cj-project";
  const BASE_URL = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/main/BASE_DATOS/05_MULTIMEDIA`;
  const JSON_URL = `${BASE_URL}/links_multimedia.json`;

  // Categorías ampliadas (puedes añadir más)
  const CATEGORIAS_BASE = {
    'Músculos': ['musculo', 'músculo', 'muscular', 'tendón', 'tendon'],
    'Huesos': ['hueso', 'óseo', 'fémur', 'tibia', 'peroné', 'radiografía', 'esqueleto'],
    'Articulaciones': ['articulación', 'ligamento', 'cartílago', 'menisco'],
    'Posturas': ['postura', 'posición', 'columna', 'espalda'],
    'Ejercicios': ['ejercicio', 'estiramiento', 'fortalecimiento', 'rehabilitación', 'kinesiología'],
    'Patologías': ['patología', 'lesión', 'fractura', 'esguince', 'tendinitis', 'epicondilitis'],
    'Anatomía': ['anatomía', 'órgano', 'sistema', 'corporal', 'cuerpo humano'],
    'Equipamiento': ['equipo', 'aparato', 'material', 'balón', 'banda', 'pesa']
  };

  // Función para asignar categoría según el nombre del archivo
  const detectarCategoria = (nombre) => {
    const nombreLower = nombre.toLowerCase();
    for (const [cat, keywords] of Object.entries(CATEGORIAS_BASE)) {
      if (keywords.some(kw => nombreLower.includes(kw))) {
        return cat;
      }
    }
    return 'General';
  };

  useEffect(() => {
    cargarUsuario();
    cargarMultimedia();
  }, []);

  const cargarUsuario = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id || null);
    if (user) cargarFavoritos(user.id);
  };

  const cargarFavoritos = async (uid) => {
    const { data } = await supabase.from('favoritos_multimedia').select('elemento_id').eq('user_id', uid);
    if (data) setFavoritos(data.map(f => f.elemento_id));
  };

  const cargarMultimedia = async () => {
    setCargando(true);
    let elementos = [];

    // Archivos locales
    try {
      const res = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/BASE_DATOS/05_MULTIMEDIA`);
      if (res.ok) {
        const data = await res.json();
        const archivosLocales = data
          .filter(f => f.name.match(/\.(mp4|webm|png|jpg|jpeg|gif)$/i))
          .map(f => ({
            id: f.sha,
            titulo: f.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
            url: f.download_url,
            tipo: f.name.match(/\.(mp4|webm)$/i) ? 'video' : 'imagen',
            categoria: detectarCategoria(f.name),
            esFavorito: favoritos.includes(f.sha)
          }));
        elementos.push(...archivosLocales);
      }
    } catch (e) { console.warn(e); }

    // Enlaces externos (si existe JSON)
    try {
      const res = await fetch(JSON_URL);
      if (res.ok) {
        const enlaces = await res.json();
        if (Array.isArray(enlaces)) {
          enlaces.forEach((item, idx) => {
            let tipo = 'externo';
            let embedUrl = null;
            if (item.url.includes('youtube.com/watch') || item.url.includes('youtu.be')) {
              tipo = 'youtube';
              const videoId = item.url.includes('youtu.be/') ? item.url.split('youtu.be/')[1]?.split('?')[0] : new URLSearchParams(item.url.split('?')[1]).get('v');
              if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
            } else if (item.url.includes('instagram.com/p/')) {
              tipo = 'instagram';
              const match = item.url.match(/instagram\.com\/p\/([^\/?]+)/);
              if (match) embedUrl = `https://www.instagram.com/p/${match[1]}/embed`;
            } else if (item.url.includes('facebook.com/watch')) {
              tipo = 'facebook';
              embedUrl = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(item.url)}&show_text=0`;
            } else if (item.url.includes('tiktok.com')) {
              tipo = 'tiktok';
            }
            elementos.push({
              id: `ext_${idx}`,
              titulo: item.titulo,
              url: item.url,
              embedUrl,
              tipo,
              categoria: item.categoria || detectarCategoria(item.titulo),
              esFavorito: favoritos.includes(`ext_${idx}`)
            });
          });
        }
      }
    } catch (e) { console.log('No se encontró links_multimedia.json'); }

    setArchivos(elementos);
    const cats = ['Todos', ...new Set(elementos.map(a => a.categoria))];
    setCategorias(cats);
    setCargando(false);
  };

  const toggleFavorito = async (elemento) => {
    if (!userId) return alert('Inicia sesión');
    if (elemento.esFavorito) {
      await supabase.from('favoritos_multimedia').delete().eq('user_id', userId).eq('elemento_id', elemento.id);
      setFavoritos(prev => prev.filter(id => id !== elemento.id));
      setArchivos(prev => prev.map(a => a.id === elemento.id ? { ...a, esFavorito: false } : a));
    } else {
      await supabase.from('favoritos_multimedia').insert({ user_id: userId, elemento_id: elemento.id, titulo: elemento.titulo, tipo: elemento.tipo });
      setFavoritos(prev => [...prev, elemento.id]);
      setArchivos(prev => prev.map(a => a.id === elemento.id ? { ...a, esFavorito: true } : a));
    }
  };

  const guardarNota = async () => {
    if (!userId || !seleccionado) return;
    await supabase.from('notas_multimedia').upsert({ user_id: userId, elemento_id: seleccionado.id, nota: notaActual, updated_at: new Date() });
    setMostrarNota(false);
  };

  const cargarNota = async (id) => {
    if (!userId) return;
    const { data } = await supabase.from('notas_multimedia').select('nota').eq('user_id', userId).eq('elemento_id', id).maybeSingle();
    setNotaActual(data?.nota || '');
  };

  const mediosFiltrados = archivos.filter(m =>
    (categoriaActiva === 'Todos' || m.categoria === categoriaActiva) &&
    (!busqueda || m.titulo.toLowerCase().includes(busqueda.toLowerCase()))
  );

  const bgPanel = temaOscuro ? 'bg-[#0a141d]' : 'bg-white';
  const bgTarjeta = temaOscuro ? 'bg-black/40' : 'bg-gray-100';
  const textoColor = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const subTexto = temaOscuro ? 'text-gray-400' : 'text-gray-600';
  const bordeColor = temaOscuro ? 'border-gray-800' : 'border-gray-200';

  if (cargando) return <div className="p-8 text-center">Cargando...</div>;

  return (
    <main className={`${bgPanel} border ${bordeColor} rounded-3xl p-4 md:p-6 h-full flex flex-col`}>
      <header className="mb-4">
        <h1 className={`text-2xl md:text-3xl font-black ${textoColor}`}>📁 MULTIMEDIA</h1>
        <p className={`text-[10px] ${subTexto}`}>Imágenes, videos y recursos educativos</p>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">
        {/* Filtros */}
        <div className={`${bgTarjeta} border ${bordeColor} rounded-2xl p-3 flex flex-col gap-3 overflow-y-auto`}>
          <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar..." className={`w-full p-2 rounded-xl border ${bordeColor} bg-transparent text-sm ${textoColor}`} />
          <div className="space-y-1">
            <h4 className="text-[10px] font-bold text-gray-500">Categorías</h4>
            {categorias.map(cat => (
              <button key={cat} onClick={() => setCategoriaActiva(cat)} className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all ${categoriaActiva === cat ? 'bg-[#22d3ee]/30 text-[#22d3ee] border-l-2 border-[#22d3ee]' : subTexto}`}>{cat}</button>
            ))}
          </div>
        </div>

        {/* Contenido principal */}
        <div className={`lg:col-span-3 ${bgTarjeta} border ${bordeColor} rounded-2xl p-4 flex flex-col overflow-hidden`}>
          {!seleccionado ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 overflow-y-auto p-1">
              {mediosFiltrados.map(item => (
                <div key={item.id} className="group relative cursor-pointer rounded-xl overflow-hidden border border-gray-600/30 hover:scale-[1.02] transition-transform bg-black/5" onClick={() => { setSeleccionado(item); cargarNota(item.id); }}>
                  <div className="aspect-square flex items-center justify-center bg-black/10">
                    {item.tipo === 'imagen' ? (
                      <img src={item.url} alt={item.titulo} className="w-full h-full object-cover" />
                    ) : item.tipo === 'video' ? (
                      <video src={item.url} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl">🔗</span>
                    )}
                  </div>
                  <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={(e) => { e.stopPropagation(); toggleFavorito(item); }} className="text-xl drop-shadow">{item.esFavorito ? '★' : '☆'}</button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <p className="text-white text-[11px] font-bold truncate">{item.titulo}</p>
                    <p className="text-[9px] text-gray-300">{item.categoria}</p>
                  </div>
                </div>
              ))}
              {mediosFiltrados.length === 0 && <div className="col-span-full text-center py-20 text-gray-500">No hay elementos</div>}
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex justify-between mb-3"><h3 className="font-bold">REPRODUCTOR</h3><button onClick={() => setSeleccionado(null)} className="text-xs text-red-400">← Cerrar</button></div>
              <div className="flex-1 flex flex-col items-center">
                {seleccionado.tipo === 'imagen' && <img src={seleccionado.url} className="max-h-[60vh] w-auto rounded-xl border border-gray-600" alt={seleccionado.titulo} />}
                {(seleccionado.tipo === 'video' || seleccionado.tipo === 'youtube') && (
                  <div className="aspect-video w-full max-w-3xl">{seleccionado.embedUrl ? <iframe src={seleccionado.embedUrl} className="w-full h-full rounded-xl" allowFullScreen /> : <video src={seleccionado.url} controls className="w-full h-full rounded-xl" />}</div>
                )}
                {seleccionado.tipo === 'instagram' && seleccionado.embedUrl && <iframe src={seleccionado.embedUrl} className="w-full max-w-lg mx-auto h-[600px]" allowTransparency />}
                {seleccionado.tipo === 'tiktok' && <a href={seleccionado.url} target="_blank" className="bg-[#22d3ee] text-black px-4 py-2 rounded">Abrir en TikTok</a>}
                {seleccionado.tipo === 'facebook' && seleccionado.embedUrl && <iframe src={seleccionado.embedUrl} className="w-full max-w-2xl h-[400px]" allowFullScreen />}
                <div className="w-full mt-4 flex justify-between items-center">
                  <h4 className="font-bold truncate">{seleccionado.titulo}</h4>
                  <button onClick={() => toggleFavorito(seleccionado)} className="text-xl">{seleccionado.esFavorito ? '★' : '☆'}</button>
                </div>
                <button onClick={() => setMostrarNota(!mostrarNota)} className="text-xs bg-[#22d3ee]/20 px-3 py-1 rounded-full mt-2">📝 Nota</button>
                {mostrarNota && (
                  <div className="mt-2 w-full"><textarea value={notaActual} onChange={(e) => setNotaActual(e.target.value)} className="w-full p-2 rounded border" rows="3" /><button onClick={guardarNota} className="mt-1 bg-[#22d3ee] px-3 py-1 rounded text-xs">Guardar</button></div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}