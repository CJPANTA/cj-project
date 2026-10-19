import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function MisCitasPaciente({ temaOscuro }) {
  const [citas, setCitas] = useState([]);
  const [mapTerapeutas, setMapTerapeutas] = useState({});
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      setError(null);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setError('No se pudo obtener la sesión del usuario.');
        setCargando(false);
        return;
      }

      // 1. ID del paciente
      const { data: pac, error: pacError } = await supabase
        .from('pacientes')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (pacError || !pac) {
        setError('No se encontró tu ficha de paciente asociada a tu usuario.');
        setCargando(false);
        return;
      }

      // 2. Citas (RLS filtra por paciente_id → solo las tuyas)
      const { data: citasData, error: citasError } = await supabase
        .from('citas')
        .select('*')
        .eq('paciente_id', pac.id)
        .order('fecha_hora', { ascending: false });

      if (citasError) {
        setError('Error al cargar las citas: ' + citasError.message);
        setCargando(false);
        return;
      }

      setCitas(citasData || []);

              // 3. Lookup de nombres de terapeutas usando la función segura
        const ids = [...new Set((citasData || []).map(c => c.terapeuta_id).filter(Boolean))];
        if (ids.length > 0) {
          const { data: perfiles } = await supabase
            .rpc('obtener_terapeutas', { ids: ids });
        const map = {};
        (perfiles || []).forEach(p => { map[p.id] = p.nombre_completo; });
        setMapTerapeutas(map);
      }

      setCargando(false);
    };
    cargar();
  }, []);

  const bgTarjeta = temaOscuro ? 'bg-black/20 border-gray-800' : 'bg-white border-gray-200 shadow-sm';
  const textoColor = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const textoSecundario = temaOscuro ? 'text-gray-400' : 'text-gray-600';

  const ahora = new Date();
  const futuras = citas.filter(c => new Date(c.fecha_hora) >= ahora);
  const pasadas = citas.filter(c => new Date(c.fecha_hora) < ahora);

  const nombreTerapeuta = (id) => mapTerapeutas[id] || 'Terapeuta asignado';

  const formatearFecha = (iso) => {
    if (!iso) return 'Sin fecha';
    return new Date(iso).toLocaleDateString('es-PE', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  };
  const formatearHora = (iso) => iso
    ? new Date(iso).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
    : '';

  if (cargando) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#22d3ee] border-t-transparent"></div>
    </div>
  );
  if (error) return (
    <div className={`${bgTarjeta} p-6 rounded-3xl border max-w-2xl mx-auto mt-8`}>
      <p className="text-red-500 font-bold">{error}</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      <header>
        <h1 className={`text-4xl font-black tracking-tighter ${textoColor}`}>Mis Citas</h1>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Historial y próximas sesiones</p>
      </header>

      <section className={`${bgTarjeta} p-6 rounded-3xl border`}>
        <h2 className="text-lg font-black uppercase tracking-tighter mb-4 text-[#22d3ee]">Próximas Citas</h2>
        {futuras.length === 0 ? (
          <p className={`text-sm ${textoSecundario}`}>No tienes citas programadas próximamente.</p>
        ) : (
          <div className="space-y-3">
            {futuras.map(c => (
              <div key={c.id} className={`p-4 rounded-2xl border ${temaOscuro ? 'border-[#22d3ee]/30 bg-[#22d3ee]/5' : 'border-blue-200 bg-blue-50'}`}>
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div>
                    <p className={`text-sm font-black capitalize ${textoColor}`}>{formatearFecha(c.fecha_hora)}</p>
                    <p className={`text-xs ${textoSecundario}`}>Hora: {formatearHora(c.fecha_hora)} · {c.duracion_min || 45} min</p>
                    <p className={`text-xs ${textoSecundario}`}>Terapeuta: {nombreTerapeuta(c.terapeuta_id)}</p>
                    {c.tipo && <p className={`text-[10px] uppercase font-bold mt-1 ${textoSecundario}`}>Tipo: {c.tipo}</p>}
                  </div>
                  <span className="px-3 py-1 bg-[#10b981]/20 text-[#10b981] rounded-full text-[10px] font-black uppercase">
                    {c.estado || 'Programada'}
                  </span>
                </div>
                {c.notas && <p className={`text-xs mt-2 ${textoSecundario}`}>{c.notas}</p>}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className={`${bgTarjeta} p-6 rounded-3xl border`}>
        <h2 className={`text-lg font-black uppercase tracking-tighter mb-4 ${textoColor}`}>Citas Anteriores</h2>
        {pasadas.length === 0 ? (
          <p className={`text-sm ${textoSecundario}`}>Aún no tienes citas pasadas.</p>
        ) : (
          <div className="space-y-3">
            {pasadas.map(c => (
              <div key={c.id} className={`p-4 rounded-2xl border ${temaOscuro ? 'border-gray-700 bg-black/10' : 'border-gray-200 bg-gray-50'}`}>
                <p className={`text-xs font-bold capitalize ${textoColor}`}>
                  {formatearFecha(c.fecha_hora)} · {formatearHora(c.fecha_hora)}
                </p>
                <p className={`text-[10px] ${textoSecundario}`}>
                  Estado: {c.estado || '—'} · {nombreTerapeuta(c.terapeuta_id)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}