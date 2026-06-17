import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function CalendarioWidget({ temaOscuro }) {
  const [horariosHoy, setHorariosHoy] = useState([]);
  const [tareasPendientes, setTareasPendientes] = useState([]);
  const [mostrarFormHorario, setMostrarFormHorario] = useState(false);
  const [mostrarFormTarea, setMostrarFormTarea] = useState(false);
  const [nuevoHorario, setNuevoHorario] = useState({
    dia_semana: new Date().getDay(),
    hora: '09:00',
    materia: '',
    modalidad: 'presencial',
    ubicacion: ''
  });
  const [nuevaTarea, setNuevaTarea] = useState({
    titulo: '',
    descripcion: '',
    fecha_entrega: new Date().toISOString().slice(0, 10),
    materia: ''
  });
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const hoy = new Date().getDay(); // 0=domingo, 1=lunes,...

  useEffect(() => {
    cargarHorariosHoy();
    cargarTareasPendientes();
  }, []);

  const cargarHorariosHoy = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from('horarios_usuario')
      .select('*')
      .eq('user_id', user.id)
      .eq('dia_semana', hoy)
      .order('hora');
    if (!error) setHorariosHoy(data || []);
  };

  const cargarTareasPendientes = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const hoyFecha = new Date().toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from('tareas_usuario')
      .select('*')
      .eq('user_id', user.id)
      .eq('completada', false)
      .gte('fecha_entrega', hoyFecha)
      .order('fecha_entrega');
    if (!error) setTareasPendientes(data || []);
  };

  const agregarHorario = async (e) => {
    e.preventDefault();
    setCargando(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from('horarios_usuario').insert({
      user_id: user.id,
      dia_semana: nuevoHorario.dia_semana,
      hora: nuevoHorario.hora,
      materia: nuevoHorario.materia,
      modalidad: nuevoHorario.modalidad,
      ubicacion: nuevoHorario.ubicacion
    });
    if (!error) {
      setMensaje('Horario agregado');
      setMostrarFormHorario(false);
      setNuevoHorario({ dia_semana: hoy, hora: '09:00', materia: '', modalidad: 'presencial', ubicacion: '' });
      cargarHorariosHoy();
      setTimeout(() => setMensaje(''), 3000);
    } else {
      setMensaje('Error: ' + error.message);
    }
    setCargando(false);
  };

  const agregarTarea = async (e) => {
    e.preventDefault();
    setCargando(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from('tareas_usuario').insert({
      user_id: user.id,
      titulo: nuevaTarea.titulo,
      descripcion: nuevaTarea.descripcion,
      fecha_entrega: nuevaTarea.fecha_entrega,
      materia: nuevaTarea.materia,
      completada: false
    });
    if (!error) {
      setMensaje('Tarea agregada');
      setMostrarFormTarea(false);
      setNuevaTarea({ titulo: '', descripcion: '', fecha_entrega: new Date().toISOString().slice(0, 10), materia: '' });
      cargarTareasPendientes();
      setTimeout(() => setMensaje(''), 3000);
    } else {
      setMensaje('Error: ' + error.message);
    }
    setCargando(false);
  };

  const completarTarea = async (id) => {
    const { error } = await supabase.from('tareas_usuario').update({ completada: true }).eq('id', id);
    if (!error) cargarTareasPendientes();
  };

  const eliminarHorario = async (id) => {
    if (confirm('¿Eliminar este horario?')) {
      await supabase.from('horarios_usuario').delete().eq('id', id);
      cargarHorariosHoy();
    }
  };

  const bgCard = temaOscuro ? 'bg-black/20 border-gray-800' : 'bg-white border-gray-200 shadow-sm';
  const textoColor = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const subTexto = temaOscuro ? 'text-gray-400' : 'text-gray-600';
  const bordeColor = temaOscuro ? 'border-gray-800' : 'border-gray-200';
  const inputBg = temaOscuro ? 'bg-black/20 border-gray-700' : 'bg-gray-100 border-gray-300';

  const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  return (
    <div className={`${bgCard} p-5 rounded-2xl border`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-sm font-black uppercase tracking-wider ${textoColor}`}>📅 Calendario de Clases</h3>
        <button onClick={() => setMostrarFormHorario(!mostrarFormHorario)} className="text-[#22d3ee] text-xs font-black uppercase hover:underline">
          + Agregar horario
        </button>
      </div>

      {mostrarFormHorario && (
        <form onSubmit={agregarHorario} className="mb-4 p-3 rounded-xl bg-black/10 space-y-3">
          <select value={nuevoHorario.dia_semana} onChange={(e) => setNuevoHorario({...nuevoHorario, dia_semana: parseInt(e.target.value)})} className={`w-full p-2 rounded-xl border text-sm ${inputBg} ${textoColor}`}>
            {diasSemana.map((dia, idx) => <option key={idx} value={idx}>{dia}</option>)}
          </select>
          <input type="time" value={nuevoHorario.hora} onChange={(e) => setNuevoHorario({...nuevoHorario, hora: e.target.value})} className={`w-full p-2 rounded-xl border text-sm ${inputBg} ${textoColor}`} required />
          <input type="text" placeholder="Materia" value={nuevoHorario.materia} onChange={(e) => setNuevoHorario({...nuevoHorario, materia: e.target.value})} className={`w-full p-2 rounded-xl border text-sm ${inputBg} ${textoColor}`} required />
          <select value={nuevoHorario.modalidad} onChange={(e) => setNuevoHorario({...nuevoHorario, modalidad: e.target.value})} className={`w-full p-2 rounded-xl border text-sm ${inputBg} ${textoColor}`}>
            <option value="presencial">Presencial</option>
            <option value="virtual">Virtual</option>
          </select>
          <input type="text" placeholder="Ubicación (aula o enlace)" value={nuevoHorario.ubicacion} onChange={(e) => setNuevoHorario({...nuevoHorario, ubicacion: e.target.value})} className={`w-full p-2 rounded-xl border text-sm ${inputBg} ${textoColor}`} />
          <button type="submit" disabled={cargando} className="bg-[#22d3ee] text-black px-4 py-2 rounded-xl text-xs font-black uppercase">Guardar</button>
          <button type="button" onClick={() => setMostrarFormHorario(false)} className="text-gray-500 text-xs uppercase ml-2">Cancelar</button>
        </form>
      )}

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {horariosHoy.length === 0 ? (
          <p className={`text-xs ${textoColor} opacity-70 text-center py-4`}>No hay clases programadas para hoy.</p>
        ) : (
          horariosHoy.map(hor => (
            <div key={hor.id} className={`p-3 rounded-xl border ${bordeColor} flex justify-between items-start gap-2`}>
              <div>
                <h4 className={`text-sm font-bold ${textoColor}`}>{hor.materia}</h4>
                <p className={`text-xs ${subTexto}`}>{hor.hora.slice(0,5)} - {hor.modalidad === 'presencial' ? '🏫 Presencial' : '💻 Virtual'} {hor.ubicacion && `(${hor.ubicacion})`}</p>
              </div>
              <button onClick={() => eliminarHorario(hor.id)} className="text-red-400 text-xs hover:text-red-600">✕</button>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 border-t border-gray-700 pt-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-sm font-black uppercase tracking-wider ${textoColor}`}>✅ Tareas Pendientes</h3>
          <button onClick={() => setMostrarFormTarea(!mostrarFormTarea)} className="text-[#22d3ee] text-xs font-black uppercase hover:underline">
            + Nueva tarea
          </button>
        </div>

        {mostrarFormTarea && (
          <form onSubmit={agregarTarea} className="mb-4 p-3 rounded-xl bg-black/10 space-y-3">
            <input type="text" placeholder="Título" value={nuevaTarea.titulo} onChange={(e) => setNuevaTarea({...nuevaTarea, titulo: e.target.value})} className={`w-full p-2 rounded-xl border text-sm ${inputBg} ${textoColor}`} required />
            <textarea placeholder="Descripción" value={nuevaTarea.descripcion} onChange={(e) => setNuevaTarea({...nuevaTarea, descripcion: e.target.value})} className={`w-full p-2 rounded-xl border text-sm ${inputBg} ${textoColor}`} rows="2" />
            <input type="date" value={nuevaTarea.fecha_entrega} onChange={(e) => setNuevaTarea({...nuevaTarea, fecha_entrega: e.target.value})} className={`w-full p-2 rounded-xl border text-sm ${inputBg} ${textoColor}`} required />
            <input type="text" placeholder="Materia (opcional)" value={nuevaTarea.materia} onChange={(e) => setNuevaTarea({...nuevaTarea, materia: e.target.value})} className={`w-full p-2 rounded-xl border text-sm ${inputBg} ${textoColor}`} />
            <button type="submit" disabled={cargando} className="bg-[#22d3ee] text-black px-4 py-2 rounded-xl text-xs font-black uppercase">Guardar tarea</button>
            <button type="button" onClick={() => setMostrarFormTarea(false)} className="text-gray-500 text-xs uppercase ml-2">Cancelar</button>
          </form>
        )}

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {tareasPendientes.length === 0 ? (
            <p className={`text-xs ${textoColor} opacity-70 text-center py-4`}>No hay tareas pendientes.</p>
          ) : (
            tareasPendientes.map(tarea => (
              <div key={tarea.id} className={`p-3 rounded-xl border ${bordeColor} flex justify-between items-start gap-2`}>
                <div className="flex-1">
                  <h4 className={`text-sm font-bold ${textoColor}`}>{tarea.titulo}</h4>
                  <p className={`text-xs ${subTexto}`}>📅 {new Date(tarea.fecha_entrega).toLocaleDateString()}</p>
                  {tarea.descripcion && <p className="text-xs mt-1 text-gray-500">{tarea.descripcion}</p>}
                  {tarea.materia && <span className="text-[9px] bg-[#22d3ee]/20 px-2 py-0.5 rounded-full inline-block mt-1">{tarea.materia}</span>}
                </div>
                <button onClick={() => completarTarea(tarea.id)} className="text-green-500 text-xs hover:text-green-600">✔️</button>
              </div>
            ))
          )}
        </div>
      </div>

      {mensaje && <p className="text-xs text-center text-green-500 mt-3">{mensaje}</p>}
    </div>
  );
}