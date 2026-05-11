import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';

export default function HistorialWidget({ temaOscuro }) {
  const [examenes, setExamenes] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarUltimosExamenes();
  }, []);

  const cargarUltimosExamenes = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from('examenes')
      .select('*')
      .eq('user_id', user.id)
      .order('fecha_generado', { ascending: false })
      .limit(5);
    if (!error) setExamenes(data || []);
    setCargando(false);
  };

  const bgCard = temaOscuro ? 'bg-black/20 border-gray-800' : 'bg-white border-gray-200 shadow-sm';
  const textoColor = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const subTexto = temaOscuro ? 'text-gray-400' : 'text-gray-600';

  if (cargando) return <div className={`${bgCard} p-4 rounded-2xl text-center`}>Cargando historial...</div>;

  return (
    <div className={`${bgCard} p-5 rounded-2xl border`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-sm font-black uppercase tracking-wider ${textoColor}`}>📊 Últimos exámenes</h3>
        {examenes.length > 0 && (
          <Link to="/historial-examenes" className="text-[#22d3ee] text-xs font-black uppercase hover:underline">Ver todos</Link>
        )}
      </div>
      {examenes.length === 0 ? (
        <p className={`text-xs ${subTexto} text-center py-4`}>Aún no has realizado ningún examen. Ve al Simulador.</p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {examenes.map(ex => {
            const fecha = new Date(ex.fecha_generado).toLocaleDateString();
            let color = '';
            if (ex.puntuacion_total >= 70) color = 'text-green-500';
            else if (ex.puntuacion_total >= 40) color = 'text-yellow-500';
            else color = 'text-red-500';
            return (
              <div key={ex.id} className={`p-3 rounded-xl border ${temaOscuro ? 'border-gray-800' : 'border-gray-200'} flex justify-between items-center`}>
                <div>
                  <p className={`text-xs font-bold ${textoColor}`}>{ex.materia || 'Examen'}</p>
                  <p className={`text-[9px] ${subTexto}`}>{fecha} • {ex.ciclo} • {ex.nivel}</p>
                </div>
                <div className={`text-sm font-black ${color}`}>{ex.puntuacion_total}%</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}