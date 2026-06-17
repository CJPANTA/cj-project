import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function RecordatoriosWidget({ temaOscuro }) {
  const [recordatorios, setRecordatorios] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [ciclo, setCiclo] = useState('');
  const [materia, setMateria] = useState('');
  const [cargando, setCargando] = useState(false);
  const [permisoNotificaciones, setPermisoNotificaciones] = useState(false);

  // Pedir permiso para notificaciones al cargar el componente
  useEffect(() => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        setPermisoNotificaciones(true);
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') setPermisoNotificaciones(true);
        });
      }
    }
    cargarRecordatorios();
    // Revisar recordatorios cada 30 segundos
    const interval = setInterval(verificarRecordatorios, 30000);
    return () => clearInterval(interval);
  }, []);

  const cargarRecordatorios = async () => {
    const { data, error } = await supabase
      .from('recordatorios')
      .select('*')
      .order('fecha_hora', { ascending: true });
    if (!error) setRecordatorios(data || []);
  };

  const verificarRecordatorios = () => {
    if (!permisoNotificaciones) return;
    const ahora = new Date();
    recordatorios.forEach(rec => {
      const fechaHora = new Date(rec.fecha_hora);
      const diffMs = fechaHora - ahora;
      const diffMin = diffMs / 1000 / 60;
      // Si está entre 0 y 5 minutos en el futuro Y no se ha notificado
      if (diffMin > 0 && diffMin <= 5 && !rec.notificado) {
        new Notification('📅 Recordatorio CJ', {
          body: `${rec.titulo} - ${fechaHora.toLocaleTimeString()}`,
          icon: '/logos_cj_circular.png'
        });
        // Marcar como notificado en la base de datos (para no repetir)
        supabase.from('recordatorios').update({ notificado: true }).eq('id', rec.id);
      }
    });
  };

  const guardarRecordatorio = async (e) => {
    e.preventDefault();
    if (!titulo || !fecha || !hora) return;
    setCargando(true);
    const fechaHora = new Date(`${fecha}T${hora}`).toISOString();
    const { error } = await supabase.from('recordatorios').insert({
      titulo,
      descripcion,
      fecha_hora: fechaHora,
      ciclo,
      materia,
      user_id: (await supabase.auth.getUser()).data.user?.id,
      notificado: false
    });
    if (!error) {
      setMostrarForm(false);
      setTitulo('');
      setDescripcion('');
      setFecha('');
      setHora('');
      setCiclo('');
      setMateria('');
      cargarRecordatorios();
    }
    setCargando(false);
  };

  const eliminarRecordatorio = async (id) => {
    await supabase.from('recordatorios').delete().eq('id', id);
    cargarRecordatorios();
  };

  const bgCard = temaOscuro ? 'bg-black/20 border-gray-800' : 'bg-white border-gray-200 shadow-sm';
  const textoColor = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const inputBg = temaOscuro ? 'bg-black/20 border-white/10' : 'bg-gray-100 border-gray-300';

  return (
    <div className={`${bgCard} p-5 rounded-2xl border`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-sm font-black uppercase tracking-wider ${textoColor}`}>📅 Recordatorios {permisoNotificaciones && '🔔'}</h3>
        <button onClick={() => setMostrarForm(!mostrarForm)} className="text-[#22d3ee] text-xs font-black uppercase hover:underline">+ Nuevo</button>
      </div>

      {mostrarForm && (
        <form onSubmit={guardarRecordatorio} className="mb-4 p-3 rounded-xl bg-black/10 space-y-3">
          <input type="text" placeholder="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} className={`w-full p-2 rounded-xl border text-sm ${inputBg} ${textoColor}`} required />
          <textarea placeholder="Descripción (opcional)" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className={`w-full p-2 rounded-xl border text-sm ${inputBg} ${textoColor}`} rows="2" />
          <div className="grid grid-cols-2 gap-2">
            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className={`p-2 rounded-xl border text-sm ${inputBg} ${textoColor}`} required />
            <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} className={`p-2 rounded-xl border text-sm ${inputBg} ${textoColor}`} required />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input type="text" placeholder="Ciclo (opcional)" value={ciclo} onChange={(e) => setCiclo(e.target.value)} className={`p-2 rounded-xl border text-sm ${inputBg} ${textoColor}`} />
            <input type="text" placeholder="Materia (opcional)" value={materia} onChange={(e) => setMateria(e.target.value)} className={`p-2 rounded-xl border text-sm ${inputBg} ${textoColor}`} />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={cargando} className="bg-[#22d3ee] text-black px-4 py-2 rounded-xl text-xs font-black uppercase">Guardar</button>
            <button type="button" onClick={() => setMostrarForm(false)} className="text-gray-500 text-xs uppercase">Cancelar</button>
          </div>
        </form>
      )}

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {recordatorios.length === 0 ? (
          <p className={`text-xs ${textoColor} opacity-70 text-center py-4`}>No hay recordatorios</p>
        ) : (
          recordatorios.map(rec => {
            const fechaHora = new Date(rec.fecha_hora);
            const estaProximo = fechaHora - new Date() < 5 * 60 * 1000 && fechaHora > new Date();
            return (
              <div key={rec.id} className={`p-3 rounded-xl border ${temaOscuro ? 'border-gray-800' : 'border-gray-200'} flex justify-between items-start gap-2 ${estaProximo ? 'border-yellow-500 bg-yellow-500/10' : ''}`}>
                <div className="flex-1">
                  <h4 className={`text-sm font-bold ${textoColor}`}>{rec.titulo}</h4>
                  <p className="text-xs text-gray-400">{fechaHora.toLocaleString()}</p>
                  {rec.descripcion && <p className="text-xs mt-1 text-gray-500">{rec.descripcion}</p>}
                  {rec.ciclo && <span className="text-[9px] bg-[#22d3ee]/20 px-2 py-0.5 rounded-full inline-block mt-1">Ciclo {rec.ciclo}</span>}
                  {rec.materia && <span className="text-[9px] bg-[#10b981]/20 px-2 py-0.5 rounded-full inline-block mt-1 ml-1">{rec.materia}</span>}
                  {estaProximo && <span className="text-[9px] bg-yellow-500/30 px-2 py-0.5 rounded-full inline-block mt-1 ml-1">🔔 Próximo</span>}
                </div>
                <button onClick={() => eliminarRecordatorio(rec.id)} className="text-red-400 text-xs hover:text-red-600">✕</button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}