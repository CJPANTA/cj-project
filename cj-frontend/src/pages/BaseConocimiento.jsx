import { useState, useEffect } from 'react';

export default function BaseConocimiento({ temaOscuro }) {
  const [terminos, setTerminos] = useState([]);
  const [terminoSeleccionado, setTerminoSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const limpiarTexto = (t) => {
      try { return decodeURIComponent(escape(t)); } 
      catch { return t.replace(/Ã¡/g, 'á').replace(/Ã©/g, 'é').replace(/Ã­/g, 'í').replace(/Ã³/g, 'ó').replace(/Ãº/g, 'ú').replace(/Ã±/g, 'ñ'); }
    };

    fetch(`https://raw.githubusercontent.com/CJPANTA/cj-project/main/BASE_DATOS/03_CONFIG/diccionario_maestro.csv`)
      .then(res => res.text())
      .then(texto => {
        const textoLimpio = limpiarTexto(texto);
        const lineas = textoLimpio.split(/\r?\n/).filter(l => l.trim() !== '');
        const cabeceras = lineas[0].split(';');
        const datos = lineas.slice(1).map(l => {
          const v = l.split(';');
          let obj = {};
          cabeceras.forEach((h, i) => obj[h.trim()] = v[i] || '');
          return obj;
        });

        // ORDEN ALFABÉTICO (A-Z)
        const datosOrdenados = datos.sort((a, b) => 
          (a.Termino_Clave || '').localeCompare(b.Termino_Clave || '')
        );

        setTerminos(datosOrdenados);
        if (datosOrdenados.length > 0) setTerminoSeleccionado(datosOrdenados[0]);
        setCargando(false);
      });
  }, []);

  const normalizar = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const filtrados = terminos.filter(t => normalizar(t.Termino_Clave || '').includes(normalizar(busqueda)));

  const bgPanel = temaOscuro ? 'bg-[#0a141d]' : 'bg-white shadow-lg';
  const textoColor = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const bordeColor = temaOscuro ? 'border-gray-800' : 'border-gray-200';

  return (
    <main className="h-full flex flex-col lg:flex-row gap-6 animate-fade-in overflow-hidden">
      <section className={`w-full lg:w-80 flex flex-col gap-4 border ${bordeColor} rounded-3xl p-4 ${bgPanel} shadow-md`}>
        <input 
          type="text" 
          value={busqueda} 
          onChange={(e) => setBusqueda(e.target.value)} 
          placeholder="Buscar término..." 
          className={`w-full bg-black/5 border ${bordeColor} rounded-xl px-4 py-3 text-xs outline-none focus:border-[#facc15] ${textoColor}`} 
        />
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
          {filtrados.map((t, i) => (
            <button 
              key={i} 
              onClick={() => setTerminoSeleccionado(t)} 
              className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-bold uppercase transition-all ${terminoSeleccionado?.ID_Termino === t.ID_Termino ? 'bg-[#facc15]/10 text-[#facc15] border border-[#facc15]/30 shadow-sm' : `text-gray-500 hover:bg-black/5`}`}
            >
              {t.Termino_Clave}
            </button>
          ))}
        </div>
      </section>

      <section className={`flex-1 border ${bordeColor} rounded-3xl p-8 ${bgPanel} overflow-y-auto custom-scrollbar shadow-md`}>
        {terminoSeleccionado ? (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <header className="mb-8 border-b border-gray-500/20 pb-4">
              <span className="text-[#facc15] text-[10px] font-black uppercase tracking-widest">{terminoSeleccionado.Relacion_Anatomica}</span>
              <h2 className={`text-4xl font-black uppercase tracking-tighter ${textoColor}`}>{terminoSeleccionado.Termino_Clave}</h2>
            </header>
            <div className="space-y-8">
              <div>
                <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-3">Definición Técnica</h3>
                <p className={`text-lg leading-relaxed ${temaOscuro ? 'text-gray-300' : 'text-gray-600'}`}>{terminoSeleccionado.Definicion_Tecnica}</p>
              </div>
              <div className="bg-[#10b981]/5 border-l-4 border-[#10b981] p-6 rounded-r-2xl">
                <h3 className="text-[#10b981] text-[10px] font-black uppercase tracking-widest mb-2">Importancia Clínica</h3>
                <p className={`text-sm italic ${textoColor}`}>{terminoSeleccionado.Importancia_Clinica}</p>
              </div>
              {terminoSeleccionado.Terminos_Relacionados && (
                <div>
                  <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-3">Términos Relacionados</h3>
                  <div className="flex flex-wrap gap-2">
                    {terminoSeleccionado.Terminos_Relacionados.split(',').map((rel, j) => (
                      <span key={j} className="px-3 py-1 bg-black/10 rounded-lg text-[9px] font-bold text-gray-500 border border-gray-500/20 uppercase">{rel.trim()}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500 text-xs font-bold uppercase">Selecciona un término clínico</div>
        )}
      </section>
    </main>
  );
}