// ============================================================
// src/components/clinica/CuadranteSemanal.jsx
// Grid: filas = terapeutas, columnas = días.
// Cada celda puede contener varios turnos apilados.
// ============================================================
import { useMemo } from 'react';
import { colorTurno, emojiTurno, formatearHora, formatearFechaISO } from '../../utils/horarios';
import { emojiProfesion, labelProfesion } from '../../utils/profesiones';

const DIAS_CORTOS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export default function CuadranteSemanal({
  terapeutas = [],
  cuadrante = {},
  fechaReferencia,
  onTurnoClick,
  onHuecoClick,
  puedeEditar = false,
  temaOscuro = true,
}) {
  const lunes = useMemo(() => {
    const d = new Date(fechaReferencia);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const l = new Date(d);
    l.setDate(diff);
    l.setHours(0, 0, 0, 0);
    return l;
  }, [fechaReferencia]);

  const dias = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(lunes);
      d.setDate(lunes.getDate() + i);
      return d;
    });
  }, [lunes]);

  const bgFondo = temaOscuro ? 'bg-[#0a141d]' : 'bg-white';
  const borde = temaOscuro ? 'border-gray-800' : 'border-gray-200';
  const textoPri = temaOscuro ? 'text-gray-300' : 'text-gray-700';
  const textoSec = temaOscuro ? 'text-gray-500' : 'text-gray-500';

  const ahora = new Date();
  const hoyIdx = dias.findIndex((d) =>
    d.getFullYear() === ahora.getFullYear() &&
    d.getMonth() === ahora.getMonth() &&
    d.getDate() === ahora.getDate()
  );

  if (terapeutas.length === 0) {
    return (
      <div className={`${bgFondo} border ${borde} rounded-2xl p-12 text-center`}>
        <p className={`text-4xl mb-2`}>👥</p>
        <p className={`text-sm ${textoSec}`}>Sin personal registrado en este centro</p>
      </div>
    );
  }

  return (
    <div className={`w-full overflow-x-auto custom-scrollbar ${bgFondo} rounded-2xl border ${borde}`}>
      <div className="min-w-[900px]">

        {/* CABECERA DE DÍAS */}
        <div
          className="grid sticky top-0 z-10"
          style={{ gridTemplateColumns: `220px repeat(7, minmax(110px, 1fr))` }}
        >
          <div className={`h-14 border-b ${borde} ${bgFondo} flex items-center px-4`}>
            <span className={`text-[10px] font-black uppercase tracking-widest ${textoSec}`}>
              Personal ({terapeutas.length})
            </span>
          </div>
          {dias.map((d, i) => {
            const esHoy = i === hoyIdx;
            return (
              <div
                key={i}
                className={`h-14 border-b ${borde} ${esHoy ? (temaOscuro ? 'bg-[#22d3ee]/5' : 'bg-cyan-50') : bgFondo} flex flex-col items-center justify-center`}
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

        {/* FILAS POR TERAPEUTA */}
        {terapeutas.map((t) => (
          <div
            key={t.id}
            className={`grid border-b ${borde}`}
            style={{ gridTemplateColumns: `220px repeat(7, minmax(110px, 1fr))` }}
          >
            {/* Columna del terapeuta */}
            <div className={`flex items-center gap-2 px-4 py-3 border-r ${borde}`}>
              <span className="text-lg">{emojiProfesion(t.profesion)}</span>
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-bold ${textoPri} truncate`}>
                  {t.nombre_completo}
                </p>
                <p className={`text-[9px] ${textoSec} truncate`}>
                  {labelProfesion(t.profesion)}
                </p>
              </div>
            </div>

            {/* Celdas por día */}
            {dias.map((d, idx) => {
              const fechaStr = formatearFechaISO(d);
              const turnosDelDia = (cuadrante[fechaStr] && cuadrante[fechaStr][t.id]) || [];
              const esHoy = idx === hoyIdx;

              return (
                <div
                  key={idx}
                  className={`relative p-1.5 min-h-[80px] border-r ${borde} ${esHoy ? (temaOscuro ? 'bg-[#22d3ee]/5' : 'bg-cyan-50/40') : ''} group`}
                >
                  {/* Turnos apilados */}
                  <div className="space-y-1">
                    {turnosDelDia.map((turno) => (
                      <button
                        key={turno.id}
                        onClick={() => onTurnoClick?.(turno, t)}
                        className={`w-full text-left px-2 py-1.5 rounded-lg border-l-4 ${colorTurno(turno.tipo_turno)} hover:scale-[1.02] transition-all`}
                        title={`${formatearHora(turno.hora_inicio)} — ${formatearHora(turno.hora_fin)} ${turno.tipo_excepcion ? `(${turno.tipo_excepcion})` : ''}`}
                      >
                                                {turno.es_excepcion && turno.tipo_excepcion === 'libre' ? (
                          <p className="text-[10px] font-black leading-tight">
                            🛌 LIBRE
                          </p>
                        ) : (
                          <>
                            <p className="text-[10px] font-black leading-tight">
                              {emojiTurno(turno.tipo_turno)} {formatearHora(turno.hora_inicio)}–{formatearHora(turno.hora_fin)}
                            </p>
                            {turno.es_excepcion && turno.tipo_excepcion && (
                              <p className="text-[8px] uppercase opacity-70 leading-tight">
                                {turno.tipo_excepcion}
                              </p>
                            )}
                          </>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Hueco para crear turno */}
                  {puedeEditar && (
                    <button
                      onClick={() => onHuecoClick?.(t, d)}
                      className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center ${turnosDelDia.length > 0 ? 'pointer-events-none' : ''}`}
                      title="Añadir turno"
                    >
                      <span className="text-[#22d3ee] text-2xl font-bold bg-black/40 rounded-full w-7 h-7 flex items-center justify-center">
                        +
                      </span>
                    </button>
                  )}

                  {/* Botón "+" mini si ya hay turnos, para añadir más */}
                  {puedeEditar && turnosDelDia.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onHuecoClick?.(t, d);
                      }}
                      className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-[#22d3ee]/30 text-[#22d3ee] text-xs font-black hover:bg-[#22d3ee] hover:text-black transition-all opacity-0 group-hover:opacity-100"
                      title="Añadir otro turno"
                    >
                      +
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}