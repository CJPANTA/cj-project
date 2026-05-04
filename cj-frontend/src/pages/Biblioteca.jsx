import { useState, useEffect } from 'react';

export default function Biblioteca({ temaOscuro }) {
  const [libros, setLibros] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [catActiva, setCatActiva] = useState('Todas');
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);

  const GITHUB_USER = "CJPANTA"; 
  const GITHUB_REPO = "cj-project"; 
  const URL_CSV = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/main/BASE_DATOS/03_CONFIG/libros_maestro.csv`;

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const res = await fetch(URL_CSV);
        if (!res.ok) throw new Error("No se encontró libros_maestro.csv");
        
        const texto = await res.text();
        const lineas = texto.split(/\r?\n/).filter(l => l.trim() !== '');
        
        if (lineas.length > 1) {
          const cabeceras = lineas[0].split(';');
          const parseados = lineas.slice(1).map(linea => {
            const valores = linea.split(';');
            let obj = {};
            cabeceras.forEach((h, i) => {
              obj[h.trim()] = valores[i] ? valores[i].trim() : '';
            });
            return obj;
          });

          setLibros(parseados);
          const cats = [...new Set(parseados.map(l => l.CATEGORIA || l.CURSO_RELACIONADO).filter(Boolean))].sort();
          setCategorias(cats);
        }
        setCargando(false);
      } catch (e) {
        console.error("Error en Biblioteca:", e);
        setCargando(false);
      }
    };
    cargarDatos();
  }, []);

  // EL CORAZÓN DE LA BIBLIOTECA (El visor de PDF)
  const prepararLector = (item) => {
    let nombreArchivo = item.TITULO_LIBRO || 'documento_desconocido';
    
    if (!nombreArchivo.toLowerCase().endsWith('.pdf')) {
      nombreArchivo = `${nombreArchivo.replace(/\s+/g, '_')}.pdf`;
    }
    
    const rawUrl = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/main/BASE_DATOS/02_SISTEMAS/${encodeURIComponent(nombreArchivo)}`;
    const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(rawUrl)}&embedded=true`;
    
    setArchivoSeleccionado({
      titulo: (item.TITULO_LIBRO || 'Documento').replace(/_/g, ' '),
      autor: item.AUTOR || 'Institucional',
      viewer: viewerUrl,
      download: rawUrl
    });
  };

  const normalizar = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const filtrados = libros.filter(l => {
    const coincideCat = catActiva === 'Todas' || l.CATEGORIA === catActiva || l.CURSO_RELACIONADO === catActiva;
    const textoBusqueda = (l.TITULO_LIBRO || '').toLowerCase();
    const coincideBusq = !busqueda || normalizar(textoBusqueda).includes(normalizar(busqueda));
    return coincideCat && coincideBusq;
  });

  // PALETA GLOBAL (Día/Noche)
  const bgPanel = temaOscuro ? 'bg-[#0a141d]' : 'bg-white shadow-xl';
  const bgTarjeta = temaOscuro ? 'bg-black/40' : 'bg-white';
  const textoColor = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const subTexto = temaOscuro ? 'text-[#94a3b8]' : 'text-gray-500';
  const bordeColor = temaOscuro ? 'border-gray-800' : 'border-gray-200';

  return (
    <main className={`${bgPanel} border ${bordeColor} rounded-3xl p-6 h-full flex flex-col overflow-hidden animate-fade-in shadow-inner relative transition-colors duration-500`}>
      <header className={`mb-6 border-b ${bordeColor} pb-4 flex justify-between items-end shrink-0`}>
        <div>
          <h1 className={`text-3xl font-black uppercase tracking-tighter ${textoColor}`}>BIBLIOTECA <span className="text-[#22d3ee]">SISTEMAS</span></h1>
          <p className={`${subTexto} text-[10px] font-bold uppercase tracking-[0.2em]`}>Fuente: libros_maestro.csv | Carpeta: 02_SISTEMAS</p>
        </div>
        <div className={`px-4 py-2 rounded-lg border text-[10px] font-black uppercase tracking-widest ${temaOscuro ? 'bg-[#10b981]/10 border-[#10b981]/30 text-[#10b981]' : 'bg-emerald-50 border-emerald-200 text-emerald-600'}`}>
          {cargando ? '🔄 Sincronizando...' : `${libros.length} TÍTULOS`}
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0 overflow-hidden">
        
        {/* FILTROS LATERALES */}
        <section className={`${temaOscuro ? 'bg-black/20' : 'bg-gray-50'} border ${bordeColor} rounded-2xl p-4 flex flex-col gap-4 overflow-hidden shadow-sm`}>
          <input 
            type="text" 
            value={busqueda} 
            onChange={(e) => setBusqueda(e.target.value)} 
            placeholder="Buscar en biblioteca..." 
            className={`w-full ${temaOscuro ? 'bg-[#0a141d]' : 'bg-white'} border ${bordeColor} rounded-xl px-4 py-3 text-xs focus:border-[#22d3ee] outline-none ${textoColor} transition-colors`} 
          />
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
            <button onClick={() => setCatActiva('Todas')} className={`w-full text-left p-3 rounded-xl text-[10px] font-bold uppercase border transition-all ${catActiva === 'Todas' ? 'bg-[#22d3ee]/10 border-[#22d3ee]/30 text-[#22d3ee] shadow-sm' : `border-transparent ${subTexto} hover:bg-black/5`}`}>📚 Todo el Acervo</button>
            {categorias.map((c, i) => (
              <button key={i} onClick={() => setCatActiva(c)} className={`w-full text-left p-3 rounded-xl text-[10px] font-bold uppercase border transition-all ${catActiva === c ? 'bg-[#22d3ee]/10 border-[#22d3ee]/30 text-[#22d3ee] shadow-sm' : `border-transparent ${subTexto} hover:bg-black/5`}`}>📁 {c}</button>
            ))}
          </div>
        </section>

        {/* VISOR O LISTADO DE LIBROS */}
        <section className={`lg:col-span-3 ${temaOscuro ? 'bg-[#0a141d]' : 'bg-white'} border ${bordeColor} rounded-2xl p-6 overflow-hidden flex flex-col shadow-sm`}>
          <div className={`flex justify-between items-center mb-6 border-b ${bordeColor} pb-3 shrink-0`}>
            <h2 className="text-[#22d3ee] text-xs font-black uppercase tracking-widest truncate">
              {archivoSeleccionado ? `LECTOR: ${archivoSeleccionado.titulo}` : `CATÁLOGO: ${catActiva}`}
            </h2>
            {archivoSeleccionado && (
              <button onClick={() => setArchivoSeleccionado(null)} className={`text-[10px] font-black ${subTexto} hover:${textoColor} uppercase border ${bordeColor} px-3 py-1.5 rounded-lg transition-colors`}>
                ← Salir del Lector
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4">
            {archivoSeleccionado ? (
              
              /* MODO VISOR COMPLETO */
              <div className="h-full flex flex-col gap-4 animate-fade-in">
                <iframe src={archivoSeleccionado.viewer} className={`w-full h-full rounded-xl border ${bordeColor} bg-[#1e1e1e]`} title="Lector PDF" />
                <a href={archivoSeleccionado.download} target="_blank" rel="noreferrer" className="w-full py-3 bg-[#10b981]/10 text-[#10b981] text-center text-[10px] font-black rounded-xl border border-[#10b981]/30 uppercase hover:bg-[#10b981]/20 transition-all">
                  Descargar Original PDF
                </a>
              </div>
              
            ) : (
              
              /* MODO GALERÍA DE TARJETAS */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 content-start">
                {filtrados.length > 0 ? filtrados.map((l, i) => (
                  <div key={i} className={`${bgTarjeta} border ${bordeColor} p-6 rounded-2xl flex flex-col justify-between hover:border-[#22d3ee]/50 transition-all group shadow-sm hover:shadow-md`}>
                    
                    <div className="mb-5">
                      <p className="text-[#22d3ee] text-[9px] font-black uppercase tracking-widest mb-2 bg-[#22d3ee]/10 inline-block px-2 py-1 rounded">
                        {l.CATEGORIA || 'General'}
                      </p>
                      <h3 className={`${textoColor} text-sm font-bold leading-tight mb-2 group-hover:text-[#22d3ee] transition-colors`}>
                        {(l.TITULO_LIBRO || 'Desconocido').replace(/_/g, ' ').replace('.pdf', '')}
                      </h3>
                      <p className={`${subTexto} text-[10px] italic font-medium truncate`}>
                        Por: {l.AUTOR || 'Institucional'}
                      </p>
                    </div>
                    
                    <button 
                      onClick={() => prepararLector(l)} 
                      className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${temaOscuro ? 'bg-[#22d3ee]/10 text-[#22d3ee] border-[#22d3ee]/30 hover:bg-[#22d3ee] hover:text-[#020813]' : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-[#22d3ee] hover:text-white hover:border-[#22d3ee]'}`}
                    >
                      Abrir en el Ecosistema
                    </button>
                    
                  </div>
                )) : (
                  <div className={`col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed ${bordeColor} rounded-3xl`}>
                    <p className={`${subTexto} text-xs font-black uppercase tracking-widest`}>No se encontraron libros</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}