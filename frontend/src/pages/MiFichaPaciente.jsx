import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const parseDatos = (raw) => {
  if (!raw) return {};
  if (typeof raw === 'string') {
    try { return JSON.parse(raw); } catch { return {}; }
  }
  return raw;
};

export default function MiFichaPaciente({ temaOscuro }) {
  const [paciente, setPaciente] = useState(null);
  const [evaluacion, setEvaluacion] = useState(null);
  const [sesiones, setSesiones] = useState([]);
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

      // 1. Ficha del paciente (RLS filtra)
      const { data: pac, error: pacError } = await supabase
        .from('pacientes')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (pacError || !pac) {
        setError(pacError?.message || 'No se encontró tu ficha de paciente. Contacta a tu terapeuta.');
        setCargando(false);
        return;
      }
      setPaciente(pac);

      // 2. Última evaluación aprobada (de ahí sale el plan y los ejercicios)
      const { data: evalData } = await supabase
        .from('evaluaciones')
        .select('*')
        .eq('paciente_id', pac.id)
        .eq('estado', 'aprobado')
        .order('fecha', { ascending: false })
        .limit(1)
        .maybeSingle();

      setEvaluacion(evalData || null);

      // 3. Historial de sesiones
      const { data: sesData } = await supabase
        .from('sesiones')
        .select('*')
        .eq('paciente_id', pac.id)
        .order('fecha_sesion', { ascending: false });

      setSesiones(sesData || []);
      setCargando(false);
    };
    cargar();
  }, []);

  const bgTarjeta = temaOscuro ? 'bg-black/20 border-gray-800' : 'bg-white border-gray-200 shadow-sm';
  const textoColor = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const textoSecundario = temaOscuro ? 'text-gray-400' : 'text-gray-600';
  const bgInterno = temaOscuro ? 'bg-black/20 border-gray-700' : 'bg-gray-50 border-gray-200';

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

  const datos = parseDatos(evaluacion?.datos_regiones);
  const diagnosticoSugerido = datos._diagnostico_sugerido || '';
  const planTexto = datos._plan_tratamiento || '';
  const recomendaciones = datos._recomendaciones || '';
  const ejercicios = Array.isArray(datos._plan_ejercicios) ? datos._plan_ejercicios : [];

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      <header>
        <h1 className={`text-4xl font-black tracking-tighter ${textoColor}`}>Mi Ficha</h1>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Datos personales y clínicos</p>
      </header>

      {/* Datos personales */}
      <section className={`${bgTarjeta} p-6 rounded-3xl border`}>
        <h2 className={`text-lg font-black uppercase tracking-tighter mb-4 ${textoColor}`}>Datos Personales</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><p className="text-[10px] font-black uppercase text-gray-500">Nombre completo</p><p className={`text-sm font-bold ${textoColor}`}>{paciente.nombre} {paciente.apellidos}</p></div>
          <div><p className="text-[10px] font-black uppercase text-gray-500">DNI</p><p className={`text-sm ${textoColor}`}>{paciente.dni || 'No registrado'}</p></div>
          <div><p className="text-[10px] font-black uppercase text-gray-500">Fecha de nacimiento</p><p className={`text-sm ${textoColor}`}>{paciente.fecha_nacimiento || 'No registrada'}</p></div>
          <div><p className="text-[10px] font-black uppercase text-gray-500">Teléfono</p><p className={`text-sm ${textoColor}`}>{paciente.telefono || 'No registrado'}</p></div>
          <div><p className="text-[10px] font-black uppercase text-gray-500">Email</p><p className={`text-sm ${textoColor}`}>{paciente.email || 'No registrado'}</p></div>
          <div><p className="text-[10px] font-black uppercase text-gray-500">Dirección</p><p className={`text-sm ${textoColor}`}>{paciente.direccion || 'No registrada'}</p></div>
        </div>
      </section>

      {/* Diagnóstico y plan */}
      <section className={`${bgTarjeta} p-6 rounded-3xl border`}>
        <h2 className={`text-lg font-black uppercase tracking-tighter mb-4 ${textoColor}`}>Mi Diagnóstico y Plan</h2>
        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-black uppercase text-gray-500">Diagnóstico</p>
            <p className="text-sm font-bold text-[#22d3ee]">{paciente.diagnostico || 'Sin diagnóstico registrado'}</p>
            {diagnosticoSugerido && diagnosticoSugerido !== paciente.diagnostico && (
              <p className={`text-xs mt-1 ${textoSecundario}`}>{diagnosticoSugerido}</p>
            )}
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-gray-500">Motivo de visita</p>
            <p className={`text-sm ${textoColor}`}>{paciente.motivo_de_visita || 'No registrado'}</p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-gray-500">Alergias</p>
            <p className={`text-sm ${textoColor}`}>{paciente.alergias || 'Ninguna registrada'}</p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-gray-500">Antecedentes médicos</p>
            <p className={`text-sm ${textoColor}`}>{paciente.antecedentes_medicos || 'Ninguno registrado'}</p>
          </div>
          {planTexto && (
            <div>
              <p className="text-[10px] font-black uppercase text-gray-500 mb-1">Plan de tratamiento</p>
              <pre className={`text-xs whitespace-pre-wrap font-sans ${textoColor} p-3 rounded-xl border ${bgInterno}`}>{planTexto}</pre>
            </div>
          )}
        </div>
      </section>

      {/* Ejercicios para casa */}
      {ejercicios.length > 0 && (
        <section className={`${bgTarjeta} p-6 rounded-3xl border`}>
          <h2 className={`text-lg font-black uppercase tracking-tighter mb-4 text-[#10b981]`}>🏋️ Mis Ejercicios para Casa</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ejercicios.map((ej, i) => (
              <div key={ej.id || i} className={`p-4 rounded-2xl border ${bgInterno}`}>
                <div className="flex justify-between items-start gap-2">
                  <h3 className={`text-sm font-black ${textoColor}`}>{ej.nombre}</h3>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#10b981]/20 text-[#10b981] font-black uppercase whitespace-nowrap">{ej.tipo}</span>
                </div>
                {ej.descripcion_paciente && <p className={`text-xs mt-2 ${textoSecundario}`}>{ej.descripcion_paciente}</p>}
                <div className="flex flex-wrap gap-2 mt-3 text-[10px] font-bold">
                  {ej.series && <span className={`px-2 py-1 rounded ${temaOscuro ? 'bg-white/5' : 'bg-gray-200'}`}>{ej.series} series</span>}
                  {ej.repeticiones && <span className={`px-2 py-1 rounded ${temaOscuro ? 'bg-white/5' : 'bg-gray-200'}`}>{ej.repeticiones} reps</span>}
                  {ej.duracion_segundos && <span className={`px-2 py-1 rounded ${temaOscuro ? 'bg-white/5' : 'bg-gray-200'}`}>{ej.duracion_segundos}s</span>}
                  {ej.frecuencia && <span className={`px-2 py-1 rounded ${temaOscuro ? 'bg-white/5' : 'bg-gray-200'}`}>{ej.frecuencia}</span>}
                </div>
              </div>
            ))}
          </div>
          {recomendaciones && (
            <div className={`mt-4 p-3 rounded-xl border ${bgInterno}`}>
              <p className="text-[10px] font-black uppercase text-gray-500 mb-1">Recomendaciones</p>
              <p className={`text-xs whitespace-pre-wrap ${textoColor}`}>{recomendaciones}</p>
            </div>
          )}
        </section>
      )}

      {/* Historial de sesiones */}
      <section className={`${bgTarjeta} p-6 rounded-3xl border`}>
        <h2 className={`text-lg font-black uppercase tracking-tighter mb-4 ${textoColor}`}>Historial de Sesiones</h2>
        {sesiones.length === 0 ? (
          <p className={`text-sm ${textoSecundario}`}>Aún no tienes sesiones registradas.</p>
        ) : (
          <div className="space-y-3">
            {sesiones.map((s) => (
              <div key={s.id} className={`p-4 rounded-2xl border ${bgInterno}`}>
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <p className={`text-xs font-black uppercase ${textoColor}`}>
                    Sesión #{s.numero_sesion || '—'} · {s.fecha_sesion ? new Date(s.fecha_sesion).toLocaleDateString('es-PE') : 'Sin fecha'}
                  </p>
                  {s.eva_inicial != null && s.eva_final != null && (
                    <span className="text-[10px] font-black px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400">
                      Dolor: {s.eva_inicial} → {s.eva_final}
                    </span>
                  )}
                </div>
                {s.subjetivo && <p className={`text-xs mt-2 ${textoSecundario}`}><strong className={textoColor}>Refieres:</strong> {s.subjetivo}</p>}
                {s.objetivo && <p className={`text-xs mt-1 ${textoSecundario}`}><strong className={textoColor}>Hallazgo:</strong> {s.objetivo}</p>}
                {s.analisis && <p className={`text-xs mt-1 ${textoSecundario}`}><strong className={textoColor}>Análisis:</strong> {s.analisis}</p>}
                {s.plan && <p className={`text-xs mt-1 ${textoSecundario}`}><strong className={textoColor}>Plan:</strong> {s.plan}</p>}
                {s.adherencia_plan_casero != null && (
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-1">
                      <span>Adherencia a ejercicios en casa</span>
                      <span>{s.adherencia_plan_casero}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5">
                      <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${s.adherencia_plan_casero}%` }}></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}