import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import mapaDatos from '../data/mapa_carrion.json';

export default function Ciclo05() {
  const { num } = useParams(); // Esto detecta si es 01, 02, 04, etc.
  const [nota, setNota] = useState('');
  const [archivos, setArchivos] = useState([]);

  useEffect(() => {
    // Busca en el JSON solo los archivos del ciclo correspondiente
    const cicloId = num || "05";
    const dataFiltrada = mapaDatos.filter(item => item.ciclo === cicloId);
    setArchivos(dataFiltrada);
  }, [num]);

  return (
    <main className="bg-cj-glass backdrop-blur-md border border-white/10 rounded-3xl p-6 h-full flex flex-col overflow-hidden">
      <header className="mb-6">
        <h1 className="text-2xl font-black text-white">ESTUDIO ACTIVO | CICLO {num || "05"}</h1>
        <p className="text-cj-cyan text-[10px] uppercase tracking-widest font-bold">Material de Repositorio GitHub</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
        {/* VISOR Y ARCHIVOS (Recuperamos la conexión) */}
        <div className="lg:col-span-2 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
          {archivos.length > 0 ? (
            archivos.map((file, i) => (
              <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-xl flex justify-between items-center">
                <span className="text-white text-sm font-medium">{file.nombre_archivo}</span>
                <a href={file.url_raw} target="_blank" className="text-cj-cyan text-xs font-bold">VER PDF →</a>
              </div>
            ))
          ) : (
            <div className="text-center p-10 border border-dashed border-white/10 rounded-2xl">
              <p className="text-gray-500 italic">No hay archivos PDF detectados para este ciclo en GitHub.</p>
            </div>
          )}
        </div>

        {/* BLOC DE NOTAS */}
        <aside className="bg-[#06101c]/60 border border-white/10 p-4 rounded-2xl flex flex-col">
          <h2 className="text-white font-bold mb-3">Apuntes Rápidos</h2>
          <textarea 
            value={nota} 
            onChange={(e) => setNota(e.target.value)}
            className="flex-1 bg-transparent border border-white/5 rounded-xl p-3 text-sm text-gray-300 focus:outline-none focus:border-cj-cyan/50"
            placeholder="Escribe aquí..."
          ></textarea>
        </aside>
      </div>
    </main>
  );
}