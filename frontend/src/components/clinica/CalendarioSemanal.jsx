// ============================================================
// src/components/clinica/CalendarioSemanal.jsx
// Vista semanal con rejilla hora × día. Citas posicionadas absolutas.
// ============================================================
import { useMemo } from 'react';
import { formatearHora } from '../../utils/citas';

const HORA_INICIO = 7;
const HORA_FIN = 21;
const PX_POR_HORA = 64;
const DIAS_CORTOS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

// Colores por estado de cita
const COLORES = {
  programada: { bg: 'bg-cyan-500/20', border: 'border-cyan-400', text: 'text-cyan-200' },
  confirmada: { bg: 'bg-blue-500/20', border: 'border-blue-400', text: 'text-blue-200' },
  asistida:   { bg: 'bg-emerald-500/20', border: 'border-emerald-400', text: 'text-emerald-200' },
  cancelada:  { bg: 'bg-gray-500/20', border: 'border-gray-500', text: 'text-gray-400 line-through' },
  no_asistio: { bg: 'bg-red-500/20', border: 'border-red-400', text: 'text-red-200' },
};

export default function CalendarioSemanal({
  citas = [],
  fechaReferencia,
  onCitaClick,
  temaOscuro = true,
}) {
  // Lunes de la semana de referencia
  const lunes = useMemo(() => {
    const d = new Date(fechaReferencia);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const l = new Date(d);
    l.setDate(diff);
    l.setHours(0, 0, 0, 0);
    return l;
  }, [fechaReferencia]);

  // 7 días desde el lunes
  const dias = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(lunes);
      d.setDate(lunes.getDate() + i);
      return d;
    });
  }, [lunes]);

  // Horas (7..21)
  const horas = useMemo(() => {
    const arr = [];
    for (let h = HORA_INICIO; h <= HORA_FIN; h++) arr.push(h);
    return arr;
  }, []);

  // Agrupar citas por índice de día (0..6)
  const citasPorDia = useMemo(() => {
    const map = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
    citas.forEach((c) => {
      const fecha = new Date(c.fecha_hora);
      const idx = dias.findIndex((d) =>
        d.getFullYear() === fecha.getFullYear() &&
        d.getMonth() === fecha.getMonth() &&
        d.getDate() === fecha.getDate()
      );
      if (idx >= 0) map[idx].push(c);
    });
    return map;
  }, [citas, dias]);

  // Posición vertical de una cita
  const posicionCita = (cita) => {
    const fecha = new Date(cita.fecha_hora);
    const h = fecha.getHours();
    const m = fecha.getMinutes();
    const minutosDesdeInicio = (h - HORA_INICIO) * 60 + m;
    const top = (minutosDesdeInicio / 60) * PX_POR_HORA;
    const dur = cita.duracion_min || 45;
    const height = Math.max((dur / 60) * PX_POR_HORA - 2, 22);
    return { top, height };
  };

  const ahora = new Date();
  const hoyIdx = dias.findIndex((d) =>
    d.getFullYear() === ahora.getFullYear() &&
    d.getMonth() === ahora.getMonth() &&
    d.getDate() === ahora.getDate()
  );
  const minutosAhora = (ahora.getHours() - HORA_INICIO) * 60 + ahora.getMinutes();
  const topAhora = (minutosAhora / 60) * PX_POR_HORA;
  const mostrarLineaAhora = minutosAhora >= 0 && ahora.getHours() <= HORA_FIN && hoyIdx >= 0;

  const alturaTotal = (HORA_FIN - HORA_INICIO + 1) * PX_POR_HORA;

  const bgFondo = temaOscuro ? 'bg-[#0a141d]' : 'bg-white';
  const borde = temaOscuro ? 'border-gray-800' : 'border-gray-200';
  const textoSec = temaOscuro ? 'text-gray-500' : 'text-gray-500';
  const textoPri = temaOscuro ? 'text-gray-300' : 'text-gray-700';
  const diaHoyBg = temaOscuro ? 'bg-[#22d3ee]/5' : 'bg-cyan-50';

  return (
    <div className={`w-full overflow-x-auto custom-scrollbar ${bgFondo} rounded-2xl border ${borde}`}>
      <div className="min-w-[900px]">

        {/* ===== CABECERA DE DÍAS ===== */}
        <div
          className="grid sticky top-0 z-10"
          style={{ gridTemplateColumns: `60px repeat(7, minmax(120px, 1fr))` }}
        >
          <div className={`h-14 border-b ${borde} ${bgFondo}`} />
          {dias.map((d, i) => {
            const esHoy = i === hoyIdx;
            return (
              <div
                key={i}
                className={`h-14 border-b ${borde} ${esHoy ? diaHoyBg : bgFondo} flex flex-col items-center justify-center`}
              >
                <span className={`text-[10px] font-black uppercase tracking-widest ${esHoy ? 'text-[#22d3ee]' : textoSec}`}>
                  {DIAS_CORTOS[i]}
                </span>
                <span className={`text-sm font-black ${esHoy ? 'text-[#22d3ee]' : textoPri}`}>
                  {d.getDate()}
                </span>
              </div>
            );
          })}
        </div>

        {/* ===== CUERPO DEL CALENDARIO ===== */}
        <div
          className="grid relative"
          style={{ gridTemplateColumns: `60px repeat(7, minmax(120px, 1fr))`, height: alturaTotal }}
        >
          {/* Columna de horas */}
          <div className={`relative border-r ${borde}`}>
            {horas.map((h) => (
              <div
                key={h}
                className={`text-[10px] font-bold ${textoSec} text-right pr-2 -translate-y-2`}
                style={{ height: PX_POR_HORA }}
              >
                {String(h).padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* 7 columnas de días */}
          {dias.map((_, diaIdx) => (
            <div
              key={diaIdx}
              className={`relative border-r ${borde} ${diaIdx === hoyIdx ? diaHoyBg : ''}`}
            >
              {/* Líneas de hora */}
              {horas.map((h) => (
                <div
                  key={h}
                  className={`border-b ${borde} ${temaOscuro ? 'border-opacity-40' : ''}`}
                  style={{ height: PX_POR_HORA }}
                />
              ))}

              {/* Línea de "ahora" */}
              {mostrarLineaAhora && diaIdx === hoyIdx && (
                <div
                  className="absolute left-0 right-0 pointer-events-none z-20"
                  style={{ top: topAhora }}
                >
                  <div className="h-0.5 bg-red-500/70 relative">
                    <div className="absolute -left-1 -top-1 w-2.5 h-2.5 rounded-full bg-red-500" />
                  </div>
                </div>
              )}

              {/* Citas del día */}
              {(citasPorDia[diaIdx] || []).map((cita) => {
                const { top, height } = posicionCita(cita);
                const color = COLORES[cita.estado] || COLORES.programada;
                const nombreCorto = cita.paciente
                  ? `${cita.paciente.nombre} ${(cita.paciente.apellidos || '').charAt(0)}.`
                  : 'Paciente';
                const terNombre = cita.terapeuta?.nombre_completo?.split(' ')[0] || '';
                return (
                  <button
                    key={cita.id}
                    onClick={() => onCitaClick?.(cita)}
                    className={`absolute left-1 right-1 ${color.bg} border-l-4 ${color.border} ${color.text} rounded-lg px-2 py-1 text-left hover:scale-[1.02] hover:z-30 transition-all shadow-sm`}
                    style={{ top, height }}
                    title={`${nombreCorto} — ${formatearHora(cita.fecha_hora)} (${cita.duracion_min} min)`}
                  >
                    <p className="text-[10px] font-black truncate leading-tight">
                      {formatearHora(cita.fecha_hora)} · {nombreCorto}
                    </p>
                    {height > 34 && (
                      <p className="text-[9px] font-bold truncate opacity-80 leading-tight">
                        {terNombre && `🩺 ${terNombre}`}
                      </p>
                    )}
                    {height > 50 && cita.tipo && (
                      <p className="text-[8px] uppercase tracking-wider opacity-70 truncate leading-tight">
                        {cita.tipo.replace('_', ' ')}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}