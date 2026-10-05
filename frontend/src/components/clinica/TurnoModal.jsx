// ============================================================
// src/components/clinica/TurnoModal.jsx
// Crear/editar turnos (recurrente o excepción puntual)
// ============================================================
import { useState, useEffect } from 'react';
import { crearTurno, actualizarTurno, eliminarTurno } from '../../utils/horarios';
import { labelProfesion, emojiProfesion } from '../../utils/profesiones';

const DIAS = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' },
];

export default function TurnoModal({
  abierto,
  onCerrar,
  onGuardado,
  centroId,
  terapeuta,
  fechaInicial,
  turnoExistente,
  temaOscuro = true,
}) {
  const editando = !!turnoExistente;

  const [modo, setModo] = useState('recurrente'); // 'recurrente' | 'excepcion'
  const [form, setForm] = useState({
    dia_semana: 1,
    fecha: '',
    hora_inicio: '08:00',
    hora_fin: '14:00',
    tipo_turno: 'mañana',
    tipo_excepcion: 'extra',
    notas: '',
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!abierto) return;
    setError(null);

    if (turnoExistente) {
      setModo(turnoExistente.es_excepcion ? 'excepcion' : 'recurrente');
      setForm({
        dia_semana: turnoExistente.dia_semana ?? 1,
        fecha: turnoExistente.fecha || '',
        hora_inicio: (turnoExistente.hora_inicio || '08:00').substring(0, 5),
        hora_fin: (turnoExistente.hora_fin || '14:00').substring(0, 5),
        tipo_turno: turnoExistente.tipo_turno || 'personalizado',
        tipo_excepcion: turnoExistente.tipo_excepcion || 'extra',
        notas: turnoExistente.notas || '',
      });
    } else {
      // Nuevo
      const hoy = fechaInicial ? new Date(fechaInicial) : new Date();
      const yyyy = hoy.getFullYear();
      const mm = String(hoy.getMonth() + 1).padStart(2, '0');
      const dd = String(hoy.getDate()).padStart(2, '0');
      const diaSem = hoy.getDay();
      setModo('recurrente');
      setForm({
        dia_semana: diaSem,
        fecha: `${yyyy}-${mm}-${dd}`,
        hora_inicio: '08:00',
        hora_fin: '14:00',
        tipo_turno: 'mañana',
        tipo_excepcion: 'extra',
        notas: '',
      });
    }
  }, [abierto, turnoExistente, fechaInicial]);

  const handleGuardar = async () => {
    setError(null);
    if (!form.hora_inicio || !form.hora_fin) {
      return setError('Indica hora de inicio y fin.');
    }
    if (form.hora_fin <= form.hora_inicio) {
      return setError('La hora de fin debe ser mayor que la hora de inicio.');
    }

    setGuardando(true);
    try {
      if (editando) {
        await actualizarTurno(turnoExistente.id, {
          hora_inicio: form.hora_inicio,
          hora_fin: form.hora_fin,
          tipo_turno: form.tipo_turno,
          tipo_excepcion: modo === 'excepcion' ? form.tipo_excepcion : null,
          notas: form.notas || null,
        });
      } else {
        const payload = {
          terapeuta_id: terapeuta.id,
          centro_id: centroId,
          hora_inicio: form.hora_inicio,
          hora_fin: form.hora_fin,
          tipo_turno: form.tipo_turno,
          es_excepcion: modo === 'excepcion',
          tipo_excepcion: modo === 'excepcion' ? form.tipo_excepcion : null,
          notas: form.notas || null,
        };
        if (modo === 'recurrente') {
          payload.dia_semana = form.dia_semana;
        } else {
          payload.fecha = form.fecha;
        }
        await crearTurno(payload);
      }
      onGuardado?.();
      onCerrar?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async () => {
    if (!editando) return;
    if (!confirm('¿Eliminar este turno?')) return;
    setGuardando(true);
    try {
      await eliminarTurno(turnoExistente.id);
      onGuardado?.();
      onCerrar?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  if (!abierto) return null;

  const bgModal = temaOscuro ? 'bg-[#0a141d] border-gray-800' : 'bg-white border-gray-300';
  const textoPri = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const textoSec = temaOscuro ? 'text-gray-400' : 'text-gray-600';
  const bgInput = temaOscuro
    ? 'bg-black/20 border-white/10 text-white'
    : 'bg-gray-100 border-gray-300 text-[#0f172a]';

  // Bloqueo: turnos recurrentes editables solo en horas/tipo
  const bloquearEstructural = editando;

  return (
    <div className="fixed inset-0 z-[250] flex items-start justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className={`relative w-full max-w-lg rounded-3xl border ${bgModal} p-6 shadow-2xl my-8`}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className={`text-xl font-black ${textoPri}`}>
              {editando ? '✏️ Editar turno' : '➕ Nuevo turno'}
            </h2>
            <p className={`text-xs ${textoSec} mt-1`}>
              {emojiProfesion(terapeuta?.profesion)} {terapeuta?.nombre_completo} · {labelProfesion(terapeuta?.profesion)}
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

        {/* MODO: Recurrente vs Excepción */}
        {!editando && (
          <div className="flex gap-1 p-1 bg-black/10 rounded-xl mb-4 border border-[#22d3ee]/10">
            <button
              onClick={() => setModo('recurrente')}
              className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${modo === 'recurrente' ? 'bg-[#22d3ee] text-black' : textoSec}`}
            >
              🔁 Recurrente semanal
            </button>
            <button
              onClick={() => setModo('excepcion')}
              className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${modo === 'excepcion' ? 'bg-purple-500 text-white' : textoSec}`}
            >
              ⚡ Excepción puntual
            </button>
          </div>
        )}

        {editando && (
          <div className="mb-4 p-3 rounded-xl border border-[#22d3ee]/30 bg-[#22d3ee]/5">
            <p className={`text-[10px] font-bold uppercase ${textoPri}`}>
              {turnoExistente.es_excepcion
                ? `⚡ Excepción: ${turnoExistente.fecha}`
                : `🔁 Recurrente: ${DIAS.find((d) => d.value === turnoExistente.dia_semana)?.label}`}
            </p>
          </div>
        )}

        {/* CONTROLES DE MODO */}
        {!editando && modo === 'recurrente' && (
          <div className="mb-4">
            <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPri} mb-1`}>
              Día de la semana
            </label>
            <select
              value={form.dia_semana}
              onChange={(e) => setForm({ ...form, dia_semana: parseInt(e.target.value) })}
              className={`w-full px-4 py-2 rounded-xl border ${bgInput} outline-none focus:border-[#22d3ee] text-sm`}
            >
              {DIAS.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
        )}

        {!editando && modo === 'excepcion' && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPri} mb-1`}>
                Fecha
              </label>
              <input
                type="date"
                value={form.fecha}
                onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                className={`w-full px-4 py-2 rounded-xl border ${bgInput} outline-none focus:border-[#22d3ee] text-sm`}
              />
            </div>
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPri} mb-1`}>
                Tipo de excepción
              </label>
              <select
                value={form.tipo_excepcion}
                onChange={(e) => setForm({ ...form, tipo_excepcion: e.target.value })}
                className={`w-full px-4 py-2 rounded-xl border ${bgInput} outline-none focus:border-[#22d3ee] text-sm`}
              >
                <option value="extra">➕ Turno extra</option>
                <option value="cambio">🔄 Cambio de turno</option>
                <option value="libre">🛌 Día libre</option>
              </select>
            </div>
          </div>
        )}

        {/* HORAS (ocultas si es libre) */}
        {!(modo === 'excepcion' && form.tipo_excepcion === 'libre' && !editando) && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPri} mb-1`}>
                Hora inicio
              </label>
              <input
                type="time"
                value={form.hora_inicio}
                onChange={(e) => setForm({ ...form, hora_inicio: e.target.value })}
                className={`w-full px-4 py-2 rounded-xl border ${bgInput} outline-none focus:border-[#22d3ee] text-sm`}
              />
            </div>
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPri} mb-1`}>
                Hora fin
              </label>
              <input
                type="time"
                value={form.hora_fin}
                onChange={(e) => setForm({ ...form, hora_fin: e.target.value })}
                className={`w-full px-4 py-2 rounded-xl border ${bgInput} outline-none focus:border-[#22d3ee] text-sm`}
              />
            </div>
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPri} mb-1`}>
                Tipo turno
              </label>
              <select
                value={form.tipo_turno}
                onChange={(e) => setForm({ ...form, tipo_turno: e.target.value })}
                className={`w-full px-4 py-2 rounded-xl border ${bgInput} outline-none focus:border-[#22d3ee] text-sm`}
              >
                <option value="mañana">🌅 Mañana</option>
                <option value="tarde">☀️ Tarde</option>
                <option value="noche">🌙 Noche</option>
                <option value="partido">🔄 Partido</option>
                <option value="personalizado">📅 Personalizado</option>
              </select>
            </div>
          </div>
        )}

        {/* NOTAS */}
        <div className="mb-6">
          <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPri} mb-1`}>
            Notas (opcional)
          </label>
          <input
            type="text"
            value={form.notas}
            onChange={(e) => setForm({ ...form, notas: e.target.value })}
            placeholder="Ej: cubre vacaciones de Ana"
            className={`w-full px-4 py-2 rounded-xl border ${bgInput} outline-none focus:border-[#22d3ee] text-sm`}
          />
        </div>

        {/* FOOTER */}
        <div className="flex justify-between gap-3 pt-4 border-t border-gray-700/30">
          <div>
            {editando && (
              <button
                onClick={handleEliminar}
                disabled={guardando}
                className="px-4 py-2 rounded-xl border border-red-500/40 text-red-400 font-bold text-xs hover:bg-red-500/10 transition-all disabled:opacity-50"
              >
                🗑️ Eliminar
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onCerrar}
              disabled={guardando}
              className={`px-5 py-2 rounded-xl border text-sm font-bold ${temaOscuro ? 'border-gray-600 hover:bg-gray-700/30 text-white' : 'border-gray-300 hover:bg-gray-100 text-[#0f172a]'} disabled:opacity-50`}
            >
              Cancelar
            </button>
            <button
              onClick={handleGuardar}
              disabled={guardando}
              className="px-6 py-2 bg-[#22d3ee] text-black font-black rounded-xl text-sm hover:scale-105 transition-all disabled:opacity-50"
            >
              {guardando ? '⏳' : '💾 Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}