// ============================================================
// src/components/clinica/EquipoCustomModal.jsx
// Modal para crear / editar equipos personalizados del centro
// ============================================================
import { useState, useEffect } from 'react';
import { agregarEquipoCustom, actualizarEquipoCustom } from '../../utils/aparatologia';

// ============================================================
// TIPOS DISPONIBLES
// ============================================================
const TIPOS = [
  { valor: 'terapia_manual', label: '✋ Terapia manual' },
  { valor: 'mecanoterapia', label: '⚙️ Mecanoterapia' },
  { valor: 'electroterapia', label: '⚡ Electroterapia' },
  { valor: 'termoterapia', label: '🔥 Termoterapia' },
  { valor: 'hidroterapia', label: '💧 Hidroterapia' },
  { valor: 'diagnostico', label: '🔍 Diagnóstico' },
  { valor: 'otro', label: '📦 Otro' },
];

export default function EquipoCustomModal({
  abierto,
  onCerrar,
  centroId,
  equipoEditando, // null = crear, objeto = editar
  onGuardado,
  temaOscuro,
}) {
  const esEdicion = !!equipoEditando;

  const [form, setForm] = useState({
    nombre: '',
    tipo: 'terapia_manual',
    descripcion: '',
    indicaciones: '',
    contraindicaciones: '',
    cantidad: 1,
    marca: '',
    modelo: '',
    notas: '',
    disponible: true,
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  // ============================================================
  // CARGAR DATOS SI ES EDICIÓN
  // ============================================================
  useEffect(() => {
    if (!abierto) return;
    if (equipoEditando) {
      setForm({
        nombre: equipoEditando.agente_nombre || '',
        tipo: equipoEditando.tipo || 'otro',
        descripcion: equipoEditando.descripcion || '',
        indicaciones: equipoEditando.indicaciones || '',
        contraindicaciones: equipoEditando.contraindicaciones || '',
        cantidad: equipoEditando.cantidad || 1,
        marca: equipoEditando.marca || '',
        modelo: equipoEditando.modelo || '',
        notas: equipoEditando.notas || '',
        disponible: equipoEditando.disponible ?? true,
      });
    } else {
      setForm({
        nombre: '',
        tipo: 'terapia_manual',
        descripcion: '',
        indicaciones: '',
        contraindicaciones: '',
        cantidad: 1,
        marca: '',
        modelo: '',
        notas: '',
        disponible: true,
      });
    }
    setError(null);
  }, [abierto, equipoEditando]);

  const handleChange = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  // ============================================================
  // GUARDAR (crear o actualizar)
  // ============================================================
  const handleGuardar = async () => {
    if (!form.nombre.trim()) {
      setError('El nombre del equipo es obligatorio.');
      return;
    }
    if (!form.descripcion.trim()) {
      setError('La descripción es obligatoria (la usará el sistema para contextualizar).');
      return;
    }
    if (!centroId) {
      setError('No se pudo determinar el centro. Recarga la página.');
      return;
    }

    setGuardando(true);
    setError(null);
    try {
      if (esEdicion) {
        await actualizarEquipoCustom(equipoEditando.id, {
          agente_nombre: form.nombre.trim(),
          tipo: form.tipo,
          descripcion: form.descripcion.trim(),
          indicaciones: form.indicaciones.trim() || null,
          contraindicaciones: form.contraindicaciones.trim() || null,
          cantidad: parseInt(form.cantidad) || 1,
          marca: form.marca.trim() || null,
          modelo: form.modelo.trim() || null,
          notas: form.notas.trim() || null,
          disponible: form.disponible,
        });
      } else {
        await agregarEquipoCustom(centroId, {
          nombre: form.nombre.trim(),
          tipo: form.tipo,
          descripcion: form.descripcion.trim(),
          indicaciones: form.indicaciones.trim(),
          contraindicaciones: form.contraindicaciones.trim(),
          cantidad: form.cantidad,
          marca: form.marca,
          modelo: form.modelo,
          notas: form.notas,
          disponible: form.disponible,
        });
      }
      onGuardado?.();
      onCerrar?.();
    } catch (err) {
      console.error('❌ Error guardando equipo custom:', err);
      setError('Error al guardar: ' + err.message);
    } finally {
      setGuardando(false);
    }
  };

  // ============================================================
  // ESTILOS
  // ============================================================
  const bgModal = temaOscuro ? 'bg-[#0a141d] border-gray-800' : 'bg-white border-gray-300';
  const textoPrincipal = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const textoSecundario = temaOscuro ? 'text-gray-400' : 'text-gray-600';
  const bgInput = temaOscuro
    ? 'bg-black/20 border-white/10 text-white'
    : 'bg-gray-100 border-gray-300 text-[#0f172a]';

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className={`relative w-full max-w-2xl rounded-3xl border ${bgModal} p-6 shadow-2xl my-8`}>

        {/* HEADER */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className={`text-2xl font-black ${textoPrincipal}`}>
              {esEdicion ? '✏️ Editar Equipo' : '✨ Nuevo Equipo Personalizado'}
            </h2>
            <p className={`text-xs ${textoSecundario} mt-1`}>
              {esEdicion
                ? 'Modifica los datos del equipo personalizado'
                : 'Agrega un equipo que no está en el catálogo oficial del sistema'}
            </p>
          </div>
          <button
            onClick={onCerrar}
            className={`${textoSecundario} hover:text-red-400 text-2xl leading-none`}
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold">
            {error}
          </div>
        )}

        {/* FORMULARIO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

          <div className="md:col-span-2">
            <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>
              Nombre del equipo <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              placeholder="Ej: Ventosas de silicona, Espirómetro, Bandas elásticas..."
              className={`w-full px-4 py-2 rounded-xl border ${bgInput} text-sm outline-none focus:border-[#22d3ee]`}
            />
          </div>

          <div>
            <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>
              Tipo
            </label>
            <select
              value={form.tipo}
              onChange={(e) => handleChange('tipo', e.target.value)}
              className={`w-full px-4 py-2 rounded-xl border ${bgInput} text-sm cursor-pointer outline-none focus:border-[#22d3ee]`}
            >
              {TIPOS.map((t) => (
                <option key={t.valor} value={t.valor}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>
              Cantidad disponible
            </label>
            <input
              type="number"
              min="1"
              value={form.cantidad}
              onChange={(e) => handleChange('cantidad', e.target.value)}
              className={`w-full px-4 py-2 rounded-xl border ${bgInput} text-sm outline-none focus:border-[#22d3ee]`}
            />
          </div>

          <div className="md:col-span-2">
            <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>
              Descripción <span className="text-red-400">*</span>
              <span className={`ml-2 ${textoSecundario} normal-case font-normal`}>
                (obligatoria, se usará para contextualizar las sugerencias)
              </span>
            </label>
            <textarea
              rows="2"
              value={form.descripcion}
              onChange={(e) => handleChange('descripcion', e.target.value)}
              placeholder="Ej: Ventosas de silicona para terapia de vacío, alivian tensión muscular y mejoran circulación local..."
              className={`w-full px-4 py-2 rounded-xl border ${bgInput} text-sm outline-none focus:border-[#22d3ee] resize-none`}
            />
          </div>

          <div className="md:col-span-2">
            <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>
              Indicaciones clínicas
              <span className={`ml-2 ${textoSecundario} normal-case font-normal`}>(opcional)</span>
            </label>
            <textarea
              rows="2"
              value={form.indicaciones}
              onChange={(e) => handleChange('indicaciones', e.target.value)}
              placeholder="Ej: contracturas musculares, dolor miofascial, recuperación post-ejercicio..."
              className={`w-full px-4 py-2 rounded-xl border ${bgInput} text-sm outline-none focus:border-[#22d3ee] resize-none`}
            />
          </div>

          <div className="md:col-span-2">
            <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>
              Contraindicaciones
              <span className={`ml-2 ${textoSecundario} normal-case font-normal`}>(opcional)</span>
            </label>
            <textarea
              rows="2"
              value={form.contraindicaciones}
              onChange={(e) => handleChange('contraindicaciones', e.target.value)}
              placeholder="Ej: heridas abiertas, trombosis, piel irritada..."
              className={`w-full px-4 py-2 rounded-xl border ${bgInput} text-sm outline-none focus:border-[#22d3ee] resize-none`}
            />
          </div>

          <div>
            <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>
              Marca <span className={`${textoSecundario} normal-case font-normal`}>(opcional)</span>
            </label>
            <input
              type="text"
              value={form.marca}
              onChange={(e) => handleChange('marca', e.target.value)}
              placeholder="Ej: Chattanooga"
              className={`w-full px-4 py-2 rounded-xl border ${bgInput} text-sm outline-none focus:border-[#22d3ee]`}
            />
          </div>

          <div>
            <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>
              Modelo <span className={`${textoSecundario} normal-case font-normal`}>(opcional)</span>
            </label>
            <input
              type="text"
              value={form.modelo}
              onChange={(e) => handleChange('modelo', e.target.value)}
              placeholder="Ej: Intelect Mobile 2"
              className={`w-full px-4 py-2 rounded-xl border ${bgInput} text-sm outline-none focus:border-[#22d3ee]`}
            />
          </div>

          <div className="md:col-span-2">
            <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>
              Notas internas
              <span className={`ml-2 ${textoSecundario} normal-case font-normal`}>(opcional)</span>
            </label>
            <textarea
              rows="2"
              value={form.notas}
              onChange={(e) => handleChange('notas', e.target.value)}
              placeholder="Ubicación física, estado, observaciones..."
              className={`w-full px-4 py-2 rounded-xl border ${bgInput} text-sm outline-none focus:border-[#22d3ee] resize-none`}
            />
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.disponible}
                onChange={(e) => handleChange('disponible', e.target.checked)}
                className="accent-[#22d3ee] w-4 h-4"
              />
              <span className={`text-xs font-bold uppercase tracking-wider ${textoPrincipal}`}>
                Disponible para usar
              </span>
            </label>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-700/30">
          <button
            type="button"
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
            type="button"
            onClick={handleGuardar}
            disabled={guardando}
            className="px-6 py-2 bg-[#22d3ee] text-black font-black rounded-xl text-sm hover:scale-105 transition-all disabled:opacity-50"
          >
            {guardando
              ? '⏳ Guardando...'
              : esEdicion
              ? '💾 Guardar cambios'
              : '✨ Crear equipo'}
          </button>
        </div>
      </div>
    </div>
  );
}