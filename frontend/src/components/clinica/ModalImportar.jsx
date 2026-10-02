// ============================================================
// src/components/clinica/ModalImportar.jsx
// Modal con 2 pestañas: Plantilla / Subir mi Excel
// ============================================================
import { useState } from 'react';
import {
  LISTA_CAMPOS,
  descargarPlantilla,
  parsearExcel,
  autoDetectarMapeo,
  validarFilas,
  detectarDuplicados,
  importarPacientes,
} from '../../utils/pacientesExcel';

export default function ModalImportar({ abierto, onCerrar, centroId, onImportado, temaOscuro }) {
  const [tab, setTab] = useState('plantilla'); // plantilla | subir
  const [paso, setPaso] = useState(1);         // 1: subir, 2: mapear, 3: preview, 4: resultado
  const [archivo, setArchivo] = useState(null);
  const [columnasExcel, setColumnasExcel] = useState([]);
  const [filasRaw, setFilasRaw] = useState([]);
  const [mapeo, setMapeo] = useState({});
  const [validacion, setValidacion] = useState({ ok: [], warnings: [], errores: [] });
  const [duplicados, setDuplicados] = useState([]);
  const [opcionDuplicados, setOpcionDuplicados] = useState('skip');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const [resultado, setResultado] = useState(null);

  // ===== ESTILOS =====
  const bgModal = temaOscuro ? 'bg-[#0a141d] border-gray-800' : 'bg-white border-gray-300';
  const textoPrincipal = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const textoSecundario = temaOscuro ? 'text-gray-400' : 'text-gray-600';
  const bgInput = temaOscuro ? 'bg-black/20 border-white/10 text-white' : 'bg-gray-100 border-gray-300 text-[#0f172a]';
  const bgSeccion = temaOscuro ? 'bg-black/20 border-gray-800' : 'bg-gray-50 border-gray-200';

  const reset = () => {
    setTab('plantilla');
    setPaso(1);
    setArchivo(null);
    setColumnasExcel([]);
    setFilasRaw([]);
    setMapeo({});
    setValidacion({ ok: [], warnings: [], errores: [] });
    setDuplicados([]);
    setOpcionDuplicados('skip');
    setError(null);
    setResultado(null);
  };

  const handleCerrar = () => {
    reset();
    onCerrar?.();
  };

  const handleArchivo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setArchivo(file);
    try {
      const { filas, columnas } = await parsearExcel(file);
      setFilasRaw(filas);
      setColumnasExcel(columnas);
      const mapeoAuto = autoDetectarMapeo(columnas);
      setMapeo(mapeoAuto);
      setPaso(2);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleValidar = async () => {
    const val = validarFilas(filasRaw, mapeo);
    setValidacion(val);

    const todasValidas = [...val.ok, ...val.warnings];
    if (todasValidas.length === 0) {
      setError('No hay filas válidas para importar.');
      return;
    }

    try {
      const dups = await detectarDuplicados(todasValidas, centroId);
      setDuplicados(dups);
      setPaso(3);
    } catch (err) {
      setError('Error detectando duplicados: ' + err.message);
    }
  };

  const handleImportar = async () => {
    setGuardando(true);
    setError(null);
    try {
      const todasValidas = [...validacion.ok, ...validacion.warnings];
      const res = await importarPacientes(todasValidas, centroId, opcionDuplicados);
      setResultado(res);
      setPaso(4);
      onImportado?.();
    } catch (err) {
      setError('Error importando: ' + err.message);
    } finally {
      setGuardando(false);
    }
  };

  if (!abierto) return null;

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className={`relative w-full max-w-4xl rounded-3xl border ${bgModal} p-6 shadow-2xl my-8`}>

        {/* HEADER */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className={`text-2xl font-black ${textoPrincipal}`}>📥 Importar Pacientes</h2>
            <p className={`text-xs ${textoSecundario} mt-1`}>
              Desde Excel (.xlsx) o CSV (.csv)
            </p>
          </div>
          <button onClick={handleCerrar} className={`${textoSecundario} hover:text-red-400 text-2xl leading-none`}>✕</button>
        </div>

        {/* TABS (solo paso 1) */}
        {paso === 1 && (
          <>
            <div className="flex gap-2 mb-5 border-b border-gray-700/50">
              <button
                onClick={() => setTab('plantilla')}
                className={`px-4 py-2 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
                  tab === 'plantilla'
                    ? 'border-[#22d3ee] text-[#22d3ee]'
                    : `border-transparent ${textoSecundario} hover:text-white`
                }`}
              >
                📋 Usar plantilla
              </button>
              <button
                onClick={() => setTab('subir')}
                className={`px-4 py-2 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
                  tab === 'subir'
                    ? 'border-[#22d3ee] text-[#22d3ee]'
                    : `border-transparent ${textoSecundario} hover:text-white`
                }`}
              >
                📂 Subir mi Excel
              </button>
            </div>

            {tab === 'plantilla' && (
              <div className={`${bgSeccion} rounded-2xl border p-5`}>
                <p className={`text-sm ${textoPrincipal} mb-3`}>
                  <strong>Opción recomendada para empezar rápido:</strong>
                </p>
                <ol className={`text-xs ${textoSecundario} space-y-1 mb-4 list-decimal list-inside`}>
                  <li>Descarga la plantilla</li>
                  <li>Llena tus pacientes en la hoja "Pacientes"</li>
                  <li>Súbela aquí abajo</li>
                </ol>
                <button
                  onClick={descargarPlantilla}
                  className="w-full py-3 bg-[#22d3ee]/20 text-[#22d3ee] font-black rounded-xl text-sm hover:bg-[#22d3ee] hover:text-black transition-all mb-4"
                >
                  📥 Descargar plantilla
                </button>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleArchivo}
                  className={`w-full text-xs ${textoPrincipal} file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-[#22d3ee] file:text-black hover:file:bg-[#22d3ee]/80 cursor-pointer`}
                />
              </div>
            )}

            {tab === 'subir' && (
              <div className={`${bgSeccion} rounded-2xl border p-5`}>
                <p className={`text-sm ${textoPrincipal} mb-3`}>
                  <strong>Sube tu Excel con cualquier formato.</strong> La app detectará automáticamente las columnas y te pedirá confirmar el mapeo.
                </p>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleArchivo}
                  className={`w-full text-xs ${textoPrincipal} file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer`}
                />
              </div>
            )}
          </>
        )}

        {/* PASO 2 — MAPEO */}
        {paso === 2 && (
          <div className={`${bgSeccion} rounded-2xl border p-5`}>
            <p className={`text-sm ${textoPrincipal} mb-3`}>
              <strong>Paso 2 — Confirmar mapeo de columnas</strong>
            </p>
            <p className={`text-xs ${textoSecundario} mb-4`}>
              Hemos detectado {filasRaw.length} filas con {columnasExcel.length} columnas en tu archivo.
              Confirma a qué campo del sistema corresponde cada uno.
            </p>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {LISTA_CAMPOS.map((campo) => (
                <div key={campo.key} className={`flex items-center gap-3 p-2 rounded-xl ${temaOscuro ? 'bg-black/20' : 'bg-white'}`}>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold ${textoPrincipal}`}>
                      {campo.label}
                      {campo.obligatorio && <span className="text-red-400 ml-1">*</span>}
                    </p>
                  </div>
                  <select
                    value={mapeo[campo.key] || ''}
                    onChange={(e) => setMapeo({ ...mapeo, [campo.key]: e.target.value })}
                    className={`px-2 py-1 rounded-lg border ${bgInput} text-xs cursor-pointer w-56`}
                  >
                    <option value="">— No mapear —</option>
                    {columnasExcel.map((col) => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                ⚠️ {error}
              </div>
            )}

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={reset}
                className={`px-5 py-2 rounded-xl border text-sm font-bold ${temaOscuro ? 'border-gray-600 text-white' : 'border-gray-300 text-[#0f172a]'}`}
              >
                ← Volver
              </button>
              <button
                onClick={handleValidar}
                className="px-6 py-2 bg-[#22d3ee] text-black font-black rounded-xl text-sm hover:scale-105 transition-all"
              >
                Validar y continuar →
              </button>
            </div>
          </div>
        )}

        {/* PASO 3 — PREVIEW */}
        {paso === 3 && (
          <div className={`${bgSeccion} rounded-2xl border p-5`}>
            <p className={`text-sm ${textoPrincipal} mb-3`}>
              <strong>Paso 3 — Vista previa y confirmación</strong>
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className={`p-3 rounded-xl text-center ${temaOscuro ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-emerald-50 border border-emerald-200'}`}>
                <p className="text-2xl font-black text-emerald-400">{validacion.ok.length}</p>
                <p className={`text-[10px] uppercase ${textoSecundario}`}>Listos</p>
              </div>
              <div className={`p-3 rounded-xl text-center ${temaOscuro ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-yellow-50 border border-yellow-200'}`}>
                <p className="text-2xl font-black text-yellow-400">{validacion.warnings.length}</p>
                <p className={`text-[10px] uppercase ${textoSecundario}`}>Con advertencias</p>
              </div>
              <div className={`p-3 rounded-xl text-center ${temaOscuro ? 'bg-red-500/10 border border-red-500/30' : 'bg-red-50 border border-red-200'}`}>
                <p className="text-2xl font-black text-red-400">{validacion.errores.length}</p>
                <p className={`text-[10px] uppercase ${textoSecundario}`}>Con errores</p>
              </div>
            </div>

            {/* Duplicados */}
            {duplicados.length > 0 && (
              <div className={`mb-4 p-4 rounded-xl border ${temaOscuro ? 'bg-yellow-500/10 border-yellow-500/40' : 'bg-yellow-50 border-yellow-300'}`}>
                <p className="text-xs font-black text-yellow-400 uppercase tracking-wider mb-2">
                  ⚠️ {duplicados.length} duplicados detectados por DNI
                </p>
                <p className={`text-[10px] ${textoSecundario} mb-3`}>
                  ¿Qué hacer con los pacientes que ya existen?
                </p>
                <div className="space-y-1">
                  {[
                    { v: 'skip', l: '🚫 Omitir (mantener los actuales)' },
                    { v: 'overwrite', l: '🔄 Sobrescribir con datos del Excel' },
                    { v: 'create', l: '➕ Crear de todas formas (duplicado)' },
                  ].map((o) => (
                    <label key={o.v} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="dup"
                        checked={opcionDuplicados === o.v}
                        onChange={() => setOpcionDuplicados(o.v)}
                        className="accent-[#22d3ee]"
                      />
                      <span className={`text-xs ${textoPrincipal}`}>{o.l}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Lista de filas */}
            <div className="space-y-1 max-h-64 overflow-y-auto pr-1 mb-4">
              {[...validacion.ok, ...validacion.warnings].slice(0, 30).map((f) => (
                <div key={f.fila} className={`p-2 rounded-lg text-xs flex justify-between gap-2 ${temaOscuro ? 'bg-black/20' : 'bg-white'}`}>
                  <span className={textoPrincipal}>#{f.fila} — {f.datos.nombre} {f.datos.apellidos}</span>
                  {f.motivo && <span className="text-yellow-400 text-[10px]">{f.motivo}</span>}
                </div>
              ))}
              {validacion.errores.slice(0, 5).map((f) => (
                <div key={f.fila} className="p-2 rounded-lg text-xs bg-red-500/10 flex justify-between gap-2">
                  <span className="text-red-300">#{f.fila} — {f.datos.nombre} {f.datos.apellidos}</span>
                  <span className="text-red-400 text-[10px]">🔴 {f.motivo}</span>
                </div>
              ))}
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                ⚠️ {error}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setPaso(2)}
                className={`px-5 py-2 rounded-xl border text-sm font-bold ${temaOscuro ? 'border-gray-600 text-white' : 'border-gray-300 text-[#0f172a]'}`}
              >
                ← Atrás
              </button>
              <button
                onClick={handleImportar}
                disabled={guardando || (validacion.ok.length + validacion.warnings.length) === 0}
                className="px-6 py-2 bg-emerald-500 text-white font-black rounded-xl text-sm hover:scale-105 transition-all disabled:opacity-50"
              >
                {guardando ? '⏳ Importando...' : `💾 Importar ${validacion.ok.length + validacion.warnings.length} pacientes`}
              </button>
            </div>
          </div>
        )}

        {/* PASO 4 — RESULTADO */}
        {paso === 4 && resultado && (
          <div className={`${bgSeccion} rounded-2xl border p-6 text-center`}>
            <p className="text-5xl mb-3">🎉</p>
            <p className={`text-lg font-black ${textoPrincipal} mb-4`}>¡Importación completada!</p>
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <p className="text-2xl font-black text-emerald-400">{resultado.insertados}</p>
                <p className={`text-[10px] uppercase ${textoSecundario}`}>Insertados</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30">
                <p className="text-2xl font-black text-blue-400">{resultado.actualizados}</p>
                <p className={`text-[10px] uppercase ${textoSecundario}`}>Actualizados</p>
              </div>
              <div className="p-3 rounded-xl bg-gray-500/10 border border-gray-500/30">
                <p className="text-2xl font-black text-gray-400">{resultado.omitidos}</p>
                <p className={`text-[10px] uppercase ${textoSecundario}`}>Omitidos</p>
              </div>
            </div>
            <button
              onClick={handleCerrar}
              className="px-6 py-2 bg-[#22d3ee] text-black font-black rounded-xl text-sm hover:scale-105 transition-all"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}