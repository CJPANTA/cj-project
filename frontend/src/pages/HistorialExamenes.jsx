import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';

export default function HistorialExamenes({ temaOscuro }) {
  const [examenes, setExamenes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [estadisticas, setEstadisticas] = useState({});

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from('examenes')
      .select('*')
      .eq('user_id', user.id)
      .order('fecha_generado', { ascending: false });
    if (!error) {
      setExamenes(data || []);
      const total = data.length;
      const promedio = total > 0 ? (data.reduce((acc, e) => acc + e.puntuacion_total, 0) / total).toFixed(1) : 0;
      const mejor = total > 0 ? Math.max(...data.map(e => e.puntuacion_total)) : 0;
      const porMateria = {};
      data.forEach(e => {
        const materia = e.materia || 'General';
        porMateria[materia] = porMateria[materia] || { suma: 0, count: 0 };
        porMateria[materia].suma += e.puntuacion_total;
        porMateria[materia].count += 1;
      });
      setEstadisticas({ total, promedio, mejor, porMateria });
    }
    setCargando(false);
  };

  const bgCard = temaOscuro ? 'bg-[#0a141d] border-gray-800' : 'bg-white border-gray-200 shadow-sm';
  const textoColor = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const subTexto = temaOscuro ? 'text-gray-400' : 'text-gray-600';
  const bordeColor = temaOscuro ? 'border-gray-800' : 'border-gray-200';

  if (cargando) return <div className="p-8 text-center">Cargando historial...</div>;

  return (
    <main className="p-4 md:p-8 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-3xl font-black ${textoColor}`}>📜 Historial de Exámenes</h1>
        <Link to="/simulador" className="bg-[#22d3ee] text-black px-4 py-2 rounded-xl text-xs font-black uppercase">Nuevo examen</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className={`${bgCard} p-4 rounded-2xl text-center border`}>
          <div className="text-2xl font-black text-[#22d3ee]">{estadisticas.total || 0}</div>
          <div className={`text-xs uppercase ${subTexto}`}>Exámenes realizados</div>
        </div>
        <div className={`${bgCard} p-4 rounded-2xl text-center border`}>
          <div className="text-2xl font-black text-yellow-500">{estadisticas.promedio}%</div>
          <div className={`text-xs uppercase ${subTexto}`}>Promedio general</div>
        </div>
        <div className={`${bgCard} p-4 rounded-2xl text-center border`}>
          <div className="text-2xl font-black text-green-500">{estadisticas.mejor}%</div>
          <div className={`text-xs uppercase ${subTexto}`}>Mejor puntuación</div>
        </div>
      </div>

      {Object.keys(estadisticas.porMateria || {}).length > 0 && (
        <div className={`${bgCard} p-5 rounded-2xl border mb-8`}>
          <h2 className={`text-lg font-bold mb-4 ${textoColor}`}>📚 Rendimiento por materia</h2>
          <div className="space-y-2">
            {Object.entries(estadisticas.porMateria).map(([materia, data]) => {
              const promedioMat = (data.suma / data.count).toFixed(1);
              return (
                <div key={materia} className="flex justify-between items-center border-b border-gray-700 pb-2">
                  <span className={`text-sm ${textoColor}`}>{materia}</span>
                  <span className={`text-sm font-bold ${promedioMat >= 70 ? 'text-green-500' : promedioMat >= 40 ? 'text-yellow-500' : 'text-red-500'}`}>{promedioMat}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className={`${bgCard} p-5 rounded-2xl border`}>
        <h2 className={`text-lg font-bold mb-4 ${textoColor}`}>📋 Todos los exámenes</h2>
        {examenes.length === 0 ? (
          <p className={subTexto}>No hay exámenes registrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className={`border-b ${bordeColor}`}>
                <tr><th>Fecha</th><th>Ciclo</th><th>Materia</th><th>Nivel</th><th>Puntuación</th><th>Nº preguntas</th></tr>
              </thead>
              <tbody>
                {examenes.map(ex => (
                  <tr key={ex.id} className={`border-b ${bordeColor}`}>
                    <td className="py-2">{new Date(ex.fecha_generado).toLocaleDateString()}</td>
                    <td className="py-2">{ex.ciclo}</td>
                    <td className="py-2">{ex.materia?.substring(0, 30)}</td>
                    <td className="py-2 capitalize">{ex.nivel}</td>
                    <td className={`py-2 font-bold ${ex.puntuacion_total >= 70 ? 'text-green-500' : ex.puntuacion_total >= 40 ? 'text-yellow-500' : 'text-red-500'}`}>{ex.puntuacion_total}%</td>
                    <td className="py-2">{ex.num_preguntas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}