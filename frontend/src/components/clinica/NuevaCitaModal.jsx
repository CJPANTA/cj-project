// ============================================================
// src/components/clinica/NuevaCitaModal.jsx
// Modal para agendar una nueva cita.
// ============================================================
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import {
  crearCita,
  verificarDisponibilidad,
  listarTerapeutasDelCentro,
} from '../../utils/citas';
import { personalDeTurno } from '../../utils/horarios';
import { labelProfesion, emojiProfesion } from '../../utils/profesiones';

export default function NuevaCitaModal({
  abierto,
  onCerrar,
  onCreada,
  centroId,
  esDirectorGlobal = false,
  fechaInicial,
  temaOscuro = true,
}) {
  const [pacientes, setPacientes] = useState([]);
  const [terapeutas, setTerapeutas] = useState([]);
  const [busquedaPac, setBusquedaPac] = useState('');
  const [pacienteSel, setPacienteSel] = useState(null);
  const [form, setForm] = useState({
    terapeuta_id: '',
    fecha: '',
    hora: '09:00',
    duracion_min: 45,
    tipo: 'seguimiento',
    notas: '',
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const [disponible, setDisponible] = useState(null);
const [enTurnoIds, setEnTurnoIds] = useState([]);

  // Reset + carga al abrir
  useEffect(() => {
    if (!abierto) return;

    const ref = fechaInicial ? new Date(fechaInicial) : new Date();
    const yyyy = ref.getFullYear();
    const mm = String(ref.getMonth() + 1).padStart(2, '0');
    const dd = String(ref.getDate()).padStart(2, '0');
    setForm((f) => ({ ...f, fecha: `${yyyy}-${mm}-${dd}` }));
    setPacienteSel(null);
    setBusquedaPac('');
    setError(null);
    setDisponible(null);

    const cargarPacientes = async () => {
      let q = supabase
        .from('pacientes')
        .select('id, nombre, apellidos, telefono, diagnostico, centro_id')
        .order('apellidos', { ascending: true });
      if (centroId) q = q.eq('centro_id', centroId);
      const { data } = await q;
      setPacientes(data || []);
    };
    cargarPacientes();

    listarTerapeutasDelCentro(centroId)
      .then(setTerapeutas)
      .catch((err) => console.error(err));
  }, [abierto, centroId, fechaInicial]);

    // Chequeo de disponibilidad en vivo (debounced 400ms)
  useEffect(() => {
    if (!form.terapeuta_id || !form.fecha || !form.hora) {
      setDisponible(null);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const fechaHora = new Date(`${form.fecha}T${form.hora}:00`).toISOString();
        const ok = await verificarDisponibilidad({
          terapeutaId: form.terapeuta_id,
          fechaHora,
          duracionMin: form.duracion_min,
        });
        setDisponible(ok);
      } catch (e) {
        console.error(e);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [form.terapeuta_id, form.fecha, form.hora, form.duracion_min]);

  // 🎯 Cargar personal en turno a la hora elegida
  useEffect(() => {
    if (!form.fecha || !form.hora || !centroId) {
      setEnTurnoIds([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const fechaHora = new Date(`${form.fecha}T${form.hora}:00`).toISOString();
        const ids = await personalDeTurno({ centroId, fechaHora });
        setEnTurnoIds(ids);
      } catch (e) {
        console.error(e);
        setEnTurnoIds([]);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [form.fecha, form.hora, centroId]);

  const pacientesFiltrados = pacientes
    .filter((p) => {
      if (!busquedaPac.trim()) return true;
      const t = busquedaPac.toLowerCase();
      return (
        `${p.nombre} ${p.apellidos}`.toLowerCase().includes(t) ||
        (p.diagnostico || '').toLowerCase().includes(t)
      );
    })
    .slice(0, 8);

  const handleGuardar = async () => {
    setError(null);
    if (!pacienteSel) return setError('Selecciona un paciente.');
    if (!form.terapeuta_id) return setError('Selecciona un terapeuta.');
    if (!form.fecha || !form.hora) return setError('Indica fecha y hora.');
    if (disponible === false) return setError('El terapeuta ya tiene una cita en ese horario.');

    const centroFinal = centroId || pacienteSel.centro_id;
    if (!centroFinal) {
      return setError('No se pudo determinar el centro. Revisa que el paciente tenga centro asignado.');
    }

    setGuardando(true);
    try {
      const fechaHora = new Date(`${form.fecha}T${form.hora}:00`).toISOString();
      await crearCita({
        paciente_id: pacienteSel.id,
        terapeuta_id: form.terapeuta_id,
        centro_id: centroFinal,
        fecha_hora: fechaHora,
        duracion_min: form.duracion_min,
        tipo: form.tipo,
        notas: form.notas || null,
      });
      onCreada?.();
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

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className={`relative w-full max-w-2xl rounded-3xl border ${bgModal} p-6 shadow-2xl my-8`}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className={`text-2xl font-black ${textoPri}`}>📅 Nueva Cita</h2>
            <p className={`text-xs ${textoSec} mt-1`}>Agenda una sesión para un paciente</p>
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

        {/* ===== PACIENTE ===== */}
        <div className="mb-4">
          <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPri} mb-1`}>
            Paciente <span className="text-red-400">*</span>
          </label>
          {pacienteSel ? (
            <div className={`flex justify-between items-center p-3 rounded-xl border ${bgInput}`}>
              <div>
                <p className={`text-sm font-bold ${textoPri}`}>
                  {pacienteSel.nombre} {pacienteSel.apellidos}
                </p>
                <p className={`text-[10px] ${textoSec}`}>
                  {pacienteSel.diagnostico || 'Sin diagnóstico'}
                </p>
              </div>
              <button
                onClick={() => setPacienteSel(null)}
                className="text-xs text-red-400 hover:text-red-300 font-bold"
              >
                Cambiar
              </button>
            </div>
          ) : (
            <>
              <input
                type="text"
                value={busquedaPac}
                onChange={(e) => setBusquedaPac(e.target.value)}
                placeholder="Buscar por nombre o diagnóstico..."
                className={`w-full px-4 py-2 rounded-xl border ${bgInput} outline-none focus:border-[#22d3ee] text-sm`}
              />
              {busquedaPac.trim() && (
                <div className={`mt-2 max-h-56 overflow-y-auto custom-scrollbar rounded-xl border ${bgInput}`}>
                  {pacientesFiltrados.length === 0 ? (
                    <p className={`text-xs ${textoSec} p-3 text-center`}>Sin resultados</p>
                  ) : (
                    pacientesFiltrados.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setPacienteSel(p);
                          setBusquedaPac('');
                        }}
                        className={`w-full text-left px-3 py-2 hover:bg-[#22d3ee]/10 transition-all border-b ${temaOscuro ? 'border-gray-800' : 'border-gray-200'} last:border-b-0`}
                      >
                        <p className={`text-sm font-bold ${textoPri}`}>
                          {p.nombre} {p.apellidos}
                        </p>
                        <p className={`text-[10px] ${textoSec}`}>
                          {p.diagnostico || 'Sin diagnóstico'}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* ===== TERAPEUTA ===== */}
        <div className="mb-4">
          <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPri} mb-1`}>
            Terapeuta <span className="text-red-400">*</span>
          </label>
                    <select
            value={form.terapeuta_id}
            onChange={(e) => setForm({ ...form, terapeuta_id: e.target.value })}
            className={`w-full px-4 py-2 rounded-xl border ${bgInput} outline-none focus:border-[#22d3ee] text-sm`}
          >
            <option value="">— Selecciona un terapeuta —</option>
            {terapeutas.map((t) => {
              const estaEnTurno = enTurnoIds.includes(t.id);
              return (
                <option key={t.id} value={t.id}>
                  {estaEnTurno ? '✅ ' : '⏸️ '}
                  {t.nombre_completo} — {labelProfesion(t.profesion)}
                  {estaEnTurno ? ' (en turno)' : ' (fuera de turno)'}
                </option>
              );
            })}
          </select>
          {enTurnoIds.length > 0 && (
            <p className="mt-1 text-[10px] text-emerald-400 font-bold">
              ✅ {enTurnoIds.length} persona{enTurnoIds.length !== 1 ? 's' : ''} en turno a esa hora
            </p>
          )}
        </div>

        {/* ===== FECHA + HORA + DURACIÓN ===== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div>
            <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPri} mb-1`}>
              Fecha <span className="text-red-400">*</span>
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
              Hora <span className="text-red-400">*</span>
            </label>
            <input
              type="time"
              value={form.hora}
              onChange={(e) => setForm({ ...form, hora: e.target.value })}
              className={`w-full px-4 py-2 rounded-xl border ${bgInput} outline-none focus:border-[#22d3ee] text-sm`}
            />
          </div>
          <div>
            <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPri} mb-1`}>
              Duración (min)
            </label>
            <input
              type="number"
              min="15"
              max="180"
              step="15"
              value={form.duracion_min}
              onChange={(e) => setForm({ ...form, duracion_min: parseInt(e.target.value) || 45 })}
              className={`w-full px-4 py-2 rounded-xl border ${bgInput} outline-none focus:border-[#22d3ee] text-sm`}
            />
          </div>
        </div>

        {/* ===== DISPONIBILIDAD ===== */}
        {disponible === false && (
          <div className="mb-4 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-bold">
            ⚠️ El terapeuta ya tiene una cita en ese horario. Prueba otra hora o cambia de terapeuta.
          </div>
        )}
        {disponible === true && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            ✅ Horario disponible
          </div>
        )}

        {/* ===== TIPO + NOTAS ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          <div>
            <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPri} mb-1`}>
              Tipo de cita
            </label>
            <select
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              className={`w-full px-4 py-2 rounded-xl border ${bgInput} outline-none focus:border-[#22d3ee] text-sm`}
            >
              <option value="primera_vez">Primera vez</option>
              <option value="seguimiento">Seguimiento</option>
              <option value="reevaluacion">Reevaluación</option>
            </select>
          </div>
          <div>
            <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPri} mb-1`}>
              Notas (opcional)
            </label>
            <input
              type="text"
              value={form.notas}
              onChange={(e) => setForm({ ...form, notas: e.target.value })}
              placeholder="Ej: traer informe previo"
              className={`w-full px-4 py-2 rounded-xl border ${bgInput} outline-none focus:border-[#22d3ee] text-sm`}
            />
          </div>
        </div>

        {/* ===== FOOTER ===== */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-700/30">
          <button
            onClick={onCerrar}
            disabled={guardando}
            className={`px-5 py-2 rounded-xl border text-sm font-bold ${
              temaOscuro
                ? 'border-gray-600 hover:bg-gray-700/30 text-white'
                : 'border-gray-300 hover:bg-gray-100 text-[#0f172a]'
            } disabled:opacity-50`}
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={guardando || disponible === false}
            className="px-6 py-2 bg-[#22d3ee] text-black font-black rounded-xl text-sm hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {guardando ? '⏳ Guardando...' : '💾 Agendar cita'}
          </button>
        </div>
      </div>
    </div>
  );
}