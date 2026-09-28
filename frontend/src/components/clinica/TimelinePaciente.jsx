// ============================================================
// src/components/clinica/TimelinePaciente.jsx
// Timeline visual con hitos del paciente: apertura, evaluaciones, sesiones
// ============================================================
import { useMemo } from 'react';

// ============================================================
// MAPA DE COLORES (Tailwind JIT no acepta concatenación dinámica)
// ============================================================
const COLORES = {
  cyan: {
    dot: 'bg-[#22d3ee]',
    borde: 'border-[#22d3ee]/40',
    texto: 'text-[#22d3ee]',
    fondo: 'bg-[#22d3ee]/5',
    badge: 'bg-[#22d3ee]/20 text-[#22d3ee]',
  },
  purple: {
    dot: 'bg-purple-500',
    borde: 'border-purple-500/40',
    texto: 'text-purple-400',
    fondo: 'bg-purple-500/5',
    badge: 'bg-purple-500/20 text-purple-400',
  },
  emerald: {
    dot: 'bg-emerald-500',
    borde: 'border-emerald-500/40',
    texto: 'text-emerald-400',
    fondo: 'bg-emerald-500/5',
    badge: 'bg-emerald-500/20 text-emerald-400',
  },
  red: {
    dot: 'bg-red-500',
    borde: 'border-red-500/40',
    texto: 'text-red-400',
    fondo: 'bg-red-500/5',
    badge: 'bg-red-500/20 text-red-400',
  },
  yellow: {
    dot: 'bg-yellow-500',
    borde: 'border-yellow-500/40',
    texto: 'text-yellow-400',
    fondo: 'bg-yellow-500/5',
    badge: 'bg-yellow-500/20 text-yellow-400',
  },
  gray: {
    dot: 'bg-gray-500',
    borde: 'border-gray-500/30',
    texto: 'text-gray-400',
    fondo: 'bg-black/10',
    badge: 'bg-gray-500/20 text-gray-400',
  },
  blue: {
    dot: 'bg-blue-500',
    borde: 'border-blue-500/40',
    texto: 'text-blue-400',
    fondo: 'bg-blue-500/5',
    badge: 'bg-blue-500/20 text-blue-400',
  },
};

// ============================================================
// HELPERS
// ============================================================
const formatearFecha = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatearHora = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function TimelinePaciente({
  paciente,
  evaluaciones = [],
  sesiones = [],
  temaOscuro = true,
  maxEventos = 20,
}) {
  const textoPrincipal = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const textoSecundario = temaOscuro ? 'text-gray-400' : 'text-gray-600';
  const textoTerciario = temaOscuro ? 'text-gray-500' : 'text-gray-500';
  const bgTarjeta = temaOscuro ? 'bg-[#0a141d]/60 border-gray-800' : 'bg-white/80 border-gray-200';
  const lineaColor = temaOscuro ? 'bg-gray-700' : 'bg-gray-300';

  // ============================================================
  // CONSTRUIR EVENTOS
  // ============================================================
  const eventos = useMemo(() => {
    const lista = [];

    // 1. Apertura de ficha
    if (paciente?.created_at) {
      lista.push({
        id: `apertura-${paciente.id}`,
        tipo: 'apertura',
        fecha: paciente.created_at,
        titulo: 'Apertura de ficha',
        subtitulo: 'Paciente registrado en el sistema',
        icono: '📋',
        color: 'cyan',
      });
    }

    // 2. Evaluaciones
    (evaluaciones || []).forEach((ev) => {
      let color = 'gray';
      if (ev.estado === 'aprobado') color = 'emerald';
      else if (ev.estado === 'pendiente') color = 'yellow';
      else if (ev.estado === 'rechazado') color = 'red';
      else if (ev.estado === 'borrador') color = 'gray';
      else color = 'purple';

      lista.push({
        id: `eval-${ev.id}`,
        tipo: 'evaluacion',
        fecha: ev.created_at,
        titulo: 'Evaluación postural',
        subtitulo: `Regiones: ${(ev.regiones || []).join(', ') || 'Sin especificar'}`,
        icono: '🔍',
        color,
        badge: ev.estado ? ev.estado.charAt(0).toUpperCase() + ev.estado.slice(1) : null,
      });
    });

    // 3. Sesiones
    (sesiones || []).forEach((s) => {
      const mejora =
        s.eva_inicial != null && s.eva_final != null
          ? s.eva_inicial - s.eva_final
          : null;

      let color = 'blue';
      let subExtra = '';

      if (mejora != null) {
        if (mejora > 0) {
          color = 'emerald';
          subExtra = `EVA ${s.eva_inicial} → ${s.eva_final} · ↓ ${mejora} pts`;
        } else if (mejora < 0) {
          color = 'red';
          subExtra = `EVA ${s.eva_inicial} → ${s.eva_final} · ↑ ${Math.abs(mejora)} pts`;
        } else {
          color = 'gray';
          subExtra = `EVA ${s.eva_inicial} → ${s.eva_final} · sin cambio`;
        }
      } else {
        subExtra = 'Sin EVA registrado';
      }

      const detalles = [];
      if (s.duracion_min) detalles.push(`${s.duracion_min} min`);
      if (s.adherencia_plan_casero != null) {
        detalles.push(`Adherencia: ${s.adherencia_plan_casero}%`);
      }
      if ((s.ejercicios_realizados || []).length > 0) {
        detalles.push(`${s.ejercicios_realizados.length} ejercicios`);
      }

      lista.push({
        id: `sesion-${s.id}`,
        tipo: 'sesion',
        fecha: s.fecha_sesion,
        titulo: `Sesión #${s.numero_sesion}`,
        subtitulo: subExtra,
        detalles: detalles.join(' · '),
        icono: '🩺',
        color,
        terapeuta: s.terapeuta?.nombre_completo || null,
      });
    });

    // Ordenar cronológicamente (más antiguo arriba)
    lista.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    return lista;
  }, [paciente, evaluaciones, sesiones]);

  // ============================================================
  // SIN EVENTOS
  // ============================================================
  if (eventos.length === 0) {
    return (
      <div className={`text-center py-10 ${bgTarjeta} rounded-2xl border`}>
        <p className="text-3xl mb-2">📅</p>
        <p className={`text-sm font-bold ${textoPrincipal}`}>Sin actividad registrada</p>
        <p className={`text-[11px] mt-1 ${textoSecundario}`}>
          Los eventos del paciente aparecerán aquí conforme se registren
        </p>
      </div>
    );
  }

  // ============================================================
  // LIMITAR EVENTOS
  // ============================================================
  const eventosMostrados = maxEventos && eventos.length > maxEventos
    ? eventos.slice(-maxEventos)
    : eventos;
  const eventosOcultos = eventos.length - eventosMostrados.length;

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div>
      {/* Cabecera */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div>
          <h3 className={`text-xs font-black uppercase tracking-wider ${textoPrincipal}`}>
            📅 Línea de tiempo
          </h3>
          <p className={`text-[10px] mt-0.5 ${textoTerciario}`}>
            {eventos.length} {eventos.length === 1 ? 'evento registrado' : 'eventos registrados'}
            {eventosOcultos > 0 && ` · mostrando últimos ${eventosMostrados.length}`}
          </p>
        </div>
        <div className="flex items-center gap-3 text-[9px] flex-wrap">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#22d3ee]"></span>
            <span className={textoSecundario}>Apertura</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            <span className={textoSecundario}>Evaluación</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span className={textoSecundario}>Sesión</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className={textoSecundario}>Mejora</span>
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative pl-8">
        {/* Línea vertical */}
        <div className={`absolute left-3 top-2 bottom-2 w-0.5 ${lineaColor}`}></div>

        {/* Eventos ocultos */}
        {eventosOcultos > 0 && (
          <div className="relative mb-3">
            <div className="absolute -left-8 top-1 w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center">
              <span className="text-[10px] font-black text-white">+</span>
            </div>
            <p className={`text-[10px] italic ${textoTerciario}`}>
              {eventosOcultos} evento{eventosOcultos > 1 ? 's' : ''} más antiguo{eventosOcultos > 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* Lista de eventos */}
        <div className="space-y-3">
          {eventosMostrados.map((ev) => {
            const c = COLORES[ev.color] || COLORES.gray;
            return (
              <div key={ev.id} className="relative">
                {/* Nodo */}
                <div
                  className={`absolute -left-8 top-2 w-6 h-6 rounded-full ${c.dot} border-4 ${
                    temaOscuro ? 'border-[#0a141d]' : 'border-white'
                  } shadow-lg flex items-center justify-center`}
                >
                  <span className="text-[9px]">{ev.icono}</span>
                </div>

                {/* Card */}
                <div className={`${bgTarjeta} rounded-xl border-l-4 ${c.borde} p-3 transition-all hover:scale-[1.01]`}>
                  {/* Cabecera */}
                  <div className="flex justify-between items-start gap-2 flex-wrap mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[11px] font-black ${textoPrincipal}`}>
                        {ev.titulo}
                      </span>
                      {ev.badge && (
                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full ${c.badge}`}>
                          {ev.badge}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[9px]">
                      <span className={`font-mono ${textoSecundario}`}>
                        {formatearFecha(ev.fecha)}
                      </span>
                      <span className={textoTerciario}>{formatearHora(ev.fecha)}</span>
                    </div>
                  </div>

                  {/* Subtítulo */}
                  <p className={`text-[10px] ${textoSecundario} leading-snug`}>
                    {ev.subtitulo}
                  </p>

                  {/* Detalles extra */}
                  {ev.detalles && (
                    <p className={`text-[9px] mt-1 ${textoTerciario} italic`}>
                      {ev.detalles}
                    </p>
                  )}

                  {/* Terapeuta */}
                  {ev.terapeuta && (
                    <p className="text-[9px] mt-1 text-emerald-400 font-bold">
                      🩺 {ev.terapeuta}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}