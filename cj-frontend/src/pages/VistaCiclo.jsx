import { useState, useEffect } from 'react';

// Importamos el mapa real generado por el script 'escaner.js'
import mapaCarrion from '../data/mapa_carrion.json';

export default function VistaCiclo({ numero }) {
  
  // Obtenemos los datos del ciclo específico desde el JSON
  const carpetasDelCiclo = mapaCarrion[numero] || {};
  const nombresMaterias = Object.keys(carpetasDelCiclo);

  // Estados para controlar la selección y el visor
  const [materiaSel, setMateriaSel] = useState("");
  const [urlVisor, setUrlVisor] = useState(null);
  const [nombreArchivoViendo, setNombreArchivoViendo] = useState("");

  // Efecto para resetear la vista cada vez que cambias de ciclo en el menú
  useEffect(() => {
    if (nombresMaterias.length > 0) {
      setMateriaSel(nombresMaterias[0]);
    } else {
      setMateriaSel("");
    }
    setUrlVisor(null);
    setNombreArchivoViendo("");
  }, [numero]);

  // Función para activar el visor de Google Docs
  const abrirPDF = (nombrePDF) => {
    const c_seguro = `CICLO_${numero}`;
    const m_segura = materiaSel.replace(/ /g, "%20");
    const a_seguro = nombrePDF.replace(/ /g, "%20");

    // Construcción de la URL Raw para el visor
    const urlCruda = `https://raw.githubusercontent.com/CJPANTA/cj-project/main/BASE_DATOS/01_CARRION/${c_seguro}/${m_segura}/${a_seguro}`;
    
    setNombreArchivoViendo(nombrePDF);
    setUrlVisor(urlCruda);
  };

  return (
    <main className="bg-cj-glass backdrop-blur-md border border-white/10 rounded-3xl p-8 relative overflow-y-auto h-full shadow-2xl custom-scrollbar">
      
      {/* ENCABEZADO DINÁMICO */}
      <header className="mb-8 border-b border-white/10 pb-4">
        <h1 className="text-3xl font-black tracking-tighter text-white">
          CICLO {numero} <span className="text-cj-cyan font-light">| CARRIÓN</span>
        </h1>
        <p className="text-gray-400 text-sm mt-1 tracking-widest uppercase font-bold">
          Explorador de Repositorio Estructurado
        </p>
      </header>

      {/* ÁREA DEL LECTOR (Solo se activa al pulsar "LEER") */}
      {urlVisor && (
        <div className="mb-8 animate-fade-in">
          <div className="flex justify-between items-center mb-4 bg-cj-dark/50 p-4 rounded-2xl border border-cj-cyan/20">
            <h2 className="text-cj-cyan font-bold truncate pr-4 text-sm flex items-center gap-2">
              <span className="text-xl">📄</span> {nombreArchivoViendo}
            </h2>
            <button 
              onClick={() => setUrlVisor(null)}
              className="bg-red-500/20 text-red-400 px-4 py-2 rounded-xl text-xs font-bold border border-red-500/30 hover:bg-red-500/40 transition-all whitespace-nowrap"
            >
              ❌ CERRAR LECTOR
            </button>
          </div>
          <div className="border-2 border-cj-cyan/50 rounded-2xl overflow-hidden bg-white shadow-[0_0_30px_rgba(34,211,238,0.1)]">
            <iframe 
              src={`https://docs.google.com/viewer?url=${encodeURIComponent(urlVisor)}&embedded=true`} 
              width="100%" 
              height="650px" 
              style={{ border: 'none' }}
            ></iframe>
          </div>
        </div>
      )}

      {/* EXPLORADOR DE ARCHIVOS (Grid de carpetas y documentos) */}
      {!urlVisor && (
        <div>
          {nombresMaterias.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              
              {/* PANEL IZQUIERDO: Materias (Directorios) */}
              <div className="md:col-span-1 bg-white/5 border border-white/10 rounded-2xl p-4 h-fit sticky top-0">
                <h3 className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-4 px-2">Asignaturas</h3>
                <div className="space-y-1.5">
                  {nombresMaterias.map(mat => (
                    <button
                      key={mat}
                      onClick={() => setMateriaSel(mat)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all flex items-center gap-2 ${
                        materiaSel === mat 
                        ? 'bg-cj-cyan/20 text-cj-cyan border border-cj-cyan/30 font-bold' 
                        : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
                      }`}
                    >
                      <span className="text-lg opacity-70">📁</span> {mat.replace(/_/g, ' ').toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* PANEL DERECHO: Archivos PDF */}
              <div className="md:col-span-3">
                <div className="flex items-center justify-between mb-4 px-2">
                  <h3 className="text-xs text-cj-emerald uppercase font-bold tracking-widest">
                    Archivos en: {materiaSel.replace(/_/g, ' ')}
                  </h3>
                  <span className="text-[10px] text-gray-500 font-mono">
                    {carpetasDelCiclo[materiaSel]?.length || 0} DOCUMENTOS
                  </span>
                </div>
                
                {carpetasDelCiclo[materiaSel]?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {carpetasDelCiclo[materiaSel].map(pdf => (
                      <div key={pdf} className="bg-[#06101c]/80 border border-white/10 rounded-2xl p-4 flex flex-col justify-between group hover:border-cj-cyan/40 transition-all shadow-lg">
                        <div className="flex items-start gap-3 mb-4 overflow-hidden">
                          <span className="text-2xl mt-0.5">📄</span>
                          <span className="text-xs text-gray-300 font-medium leading-relaxed" title={pdf}>{pdf}</span>
                        </div>
                        
                        <div className="flex gap-2">
                          {/* BOTÓN LEER (Acción Interna) */}
                          <button 
                            onClick={() => abrirPDF(pdf)}
                            className="flex-1 bg-cj-cyan/10 text-cj-cyan px-3 py-2 rounded-xl text-[10px] font-black border border-cj-cyan/20 hover:bg-cj-cyan/30 transition-all flex items-center justify-center gap-1.5"
                          >
                            👁️ LEER
                          </button>
                          
                          {/* BOTÓN DESCARGAR (Acción Externa Directa) */}
                          <a 
                            href={`https://raw.githubusercontent.com/CJPANTA/cj-project/main/BASE_DATOS/01_CARRION/CICLO_${numero}/${materiaSel.replace(/ /g, "%20")}/${pdf.replace(/ /g, "%20")}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex-1 bg-cj-emerald/10 text-cj-emerald px-3 py-2 rounded-xl text-[10px] font-black border border-cj-emerald/20 hover:bg-cj-emerald/30 transition-all flex items-center justify-center gap-1.5"
                          >
                            📥 DESCARGAR
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white/5 border border-dashed border-white/10 rounded-2xl p-8 text-center">
                    <p className="text-gray-500 text-xs italic">No se encontraron archivos PDF en esta carpeta.</p>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-cj-cyan/5 border border-cj-cyan/20 rounded-3xl p-12 text-center max-w-lg mx-auto">
              <span className="text-6xl opacity-30 mb-6 block">🚧</span>
              <h2 className="text-white font-bold text-xl mb-3">Ciclo en Mapeo</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                El mapa de datos para el <strong>Ciclo {numero}</strong> no registra archivos. Asegúrate de que las carpetas en GitHub sigan el patrón <code className="text-cj-cyan">CICLO_{numero}/Nombre_Materia</code>.
              </p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}