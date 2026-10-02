// ============================================================
// src/components/clinica/CitaDetalleModal.jsx
// Detalle de una cita + acciones (confirmar, asistencia, cancelar...)
// ============================================================
import { useState } from 'react';
import {
  cambiarEstadoCita,
  eliminarCita,
  formatearHora,
  formatearFecha,
  etiquetaEstado,
  etiquetaTipo,
} from '../../utils/citas';

export default function CitaDetalleModal({
  cita,
  onCerrar,
  onCambio,
  onAbrirSesion,
  temaOscuro = true,
}) {
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState(null);

  if (!cita) return null;

  const cambiar = async (nuevoEstado) => {
    setProcesando(true);
    setError(null);
    try {
      await cambiarEstadoCita(cita.id, nuevoEstado);
      onCambio?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesando(false);
    }
  };

  const eliminar = async () => {
    if (!confirm('¿Eliminar esta cita de forma permanente?')) return;
    setProcesando(true);
    setError(null);
    try {
      await eliminarCita(cita.id);
      onCambio?.();
      onCerrar?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesando(false);
    }
  };

  const bgModal = temaOscuro ? 'bg-[#0a141d] border-gray-800' : 'bg-white border-gray-300';
  const textoPri = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const textoSec = temaOscuro ? 'text-gray-400' : 'text-gray-600';

  const estadoColor = {
    programada: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    confirmada: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    asistida: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    cancelada: 'bg-gray-500/20 text-gray-400 border-gray-500/40',
    no_asistio: 'bg-red-500/20 text-red-300 border-red-500/40',
  }[cita.estado] || 'bg-gray-500/20 text-gray-400 border-gray-500/40';

  const puedeMarcarAsistida = cita.estado !== 'asistida' && cita.estado !== 'cancelada';
  const puedeConfirmar = cita.estado === 'programada';

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className={`relative w-full max-w-lg rounded-3xl border ${bgModal} p-6 shadow-2xl my-8`}>
        <div className="flex justify-between items-start mb-4">
          <div className="min-w-0">
            <h2 className={`text-xl font-black ${textoPri} truncate`}>
              {cita.paciente ? `${cita.paciente.nombre} ${cita.paciente.apellidos}` : 'Paciente'}
            </h2>
            <p className={`text-xs ${textoSec} mt-1`}>
              {formatearFecha(cita.fecha_hora)} · {formatearHora(cita.fecha_hora)}
            </p>
          </div>
          <button onClick={onCerrar} className={`${textoSec} hover:text-red-400 text-2xl leading-none`}>
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold">
            {error}
          </div>
        )}

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className={textoSec}>Estado</span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border uppercase ${estadoColor}`}>
              {etiquetaEstado(cita.estado)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className={textoSec}>Tipo</span>
            <span className={`font-bold ${textoPri}`}>{etiquetaTipo(cita.tipo)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className={textoSec}>Duración</span>
            <span className={`font-bold ${textoPri}`}>{cita.duracion_min} min</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className={textoSec}>Terapeuta</span>
            <span className={`font-bold ${textoPri} truncate ml-2`}>
              {cita.terapeuta?.nombre_completo || '—'}
            </span>
          </div>
          {cita.paciente?.telefono && (
            <div className="flex justify-between text-sm">
              <span className={textoSec}>Teléfono</span>
              <span className={`font-bold ${textoPri}`}>{cita.paciente.telefono}</span>
            </div>
          )}
          {cita.notas && (
            <div className="pt-2 border-t border-gray-700/30">
              <p className={`text-[10px] uppercase tracking-wider ${textoSec} mb-1`}>Notas</p>
              <p className={`text-xs ${textoPri}`}>{cita.notas}</p>
            </div>
          )}
        </div>

        {/* ===== ACCIONES ===== */}
        <div className="space-y-2">
          {puedeConfirmar && (
            <button
              onClick={() => cambiar('confirmada')}
              disabled={procesando}
              className="w-full py-2 rounded-xl bg-blue-500/20 text-blue-300 font-bold text-sm hover:bg-blue-500 hover:text-white transition-all disabled:opacity-50"
            >
              ✅ Marcar como confirmada
            </button>
          )}

          {puedeMarcarAsistida && (
            <button
              onClick={() => cambiar('asistida')}
              disabled={procesando}
              className="w-full py-2 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold text-sm hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50"
            >
              🩺 Marcar como asistida
            </button>
          )}

          {cita.estado === 'asistida' && onAbrirSesion && (
            <button
              onClick={() => onAbrirSesion(cita)}
              className="w-full py-2 rounded-xl bg-purple-500/20 text-purple-300 font-bold text-sm hover:bg-purple-500 hover:text-white transition-all"
            >
              📝 Abrir sesión SOAP de esta cita
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => cambiar('cancelada')}
              disabled={procesando || cita.estado === 'cancelada'}
              className="py-2 rounded-xl bg-gray-500/20 text-gray-300 font-bold text-xs hover:bg-gray-500 hover:text-white transition-all disabled:opacity-40"
            >
              🚫 Cancelar
            </button>
            <button
              onClick={() => cambiar('no_asistio')}
              disabled={procesando || cita.estado === 'no_asistio'}
              className="py-2 rounded-xl bg-red-500/20 text-red-300 font-bold text-xs hover:bg-red-500 hover:text-white transition-all disabled:opacity-40"
            >
              ❌ No asistió
            </button>
          </div>

          <button
            onClick={eliminar}
            disabled={procesando}
            className="w-full py-2 rounded-xl border border-red-500/40 text-red-400 font-bold text-xs hover:bg-red-500/10 transition-all disabled:opacity-50"
          >
            🗑️ Eliminar cita
          </button>
        </div>
      </div>
    </div>
  );
}