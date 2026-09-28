// ============================================================
// src/components/clinica/SesionModal.jsx
// Modal de Nueva Sesión (SOAP)
// ============================================================
import { useState, useEffect, useRef } from 'react';
import { crearSesion, proximoNumeroSesion } from '../../utils/sesiones';
import { listarDisponibles } from '../../utils/aparatologia';
import { supabase } from '../../lib/supabaseClient';

// ============================================================
// BOTÓN DE DICTADO (reutilizable)
// ============================================================
function BotonDictado({ campo, campoActivo, escuchando, onClick, posicion = 'bottom-2 right-2' }) {
  const activo = escuchando && campoActivo === campo;
  return (
    <button
      type="button"
      onClick={() => onClick(campo)}
      className={`absolute ${posicion} p-1.5 rounded-full text-white text-xs transition-all ${
        activo ? 'bg-red-500 animate-pulse' : 'bg-purple-600 hover:opacity-80'
      }`}
      title={activo ? 'Detener dictado' : 'Dictar por voz'}
    >
      🎙️
    </button>
  );
}

export default function SesionModal({
  abierto,
  onCerrar,
  paciente,
  centroId,
  evaluacionAprobada,
  onGuardada,
  temaOscuro,
}) {
  // ===== ESTADO DEL FORMULARIO =====
  const [form, setForm] = useState({
  duracion_min: 45,
  subjetivo: '',
  objetivo: '',
  analisis: '',
  plan: '',
  eva_inicial: null,
  eva_final: null,
  agentes_aplicados: [],
  masoterapia_aplicada: [],
  ejercicios_realizados: [],
  notas_adicionales: '',
  proxima_sesion_sugerida: '',
  adherencia_plan_casero: null,
});

  // ===== CATÁLOGOS =====
  const [catalogos, setCatalogos] = useState({
    agentes: [],
    masoterapia: [],
    ejercicios: [],
  });
  const [agentesDisponiblesCentro, setAgentesDisponiblesCentro] = useState([]);

  // ===== ESTADOS UI =====
  const [numeroSesion, setNumeroSesion] = useState(null);
  const [centroResuelto, setCentroResuelto] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const [campoActivo, setCampoActivo] = useState(null);
  const [escuchando, setEscuchando] = useState(false);
  const recognitionRef = useRef(null);

// ============================================================
// RESOLVER CENTRO: prop → evaluación → perfil → primer centro
// ============================================================
useEffect(() => {
  console.log('🚀 [SesionModal] useEffect resolver centro. abierto:', abierto, '| centroId prop:', centroId);
  if (!abierto) return;

  const resolver = async () => {
    // 1. Centro por prop
    if (centroId) {
      console.log('🏥 [SesionModal] Centro desde prop:', centroId);
      setCentroResuelto(centroId);
      return;
    }

    // 2. Centro desde evaluación aprobada
    if (evaluacionAprobada?.centro_id) {
      console.log('🏥 [SesionModal] Centro desde evaluación:', evaluacionAprobada.centro_id);
      setCentroResuelto(evaluacionAprobada.centro_id);
      return;
    }

    // 3. Centro desde perfil del terapeuta logueado
    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('👤 [SesionModal] User actual:', user?.id, user?.email);
      if (!user) {
        console.warn('⚠️ [SesionModal] Sin user logueado');
        return;
      }
      const { data: perfil } = await supabase
        .from('profiles')
        .select('rol, centro_id, email')
        .eq('id', user.id)
        .single();
      console.log('📋 [SesionModal] Perfil del user:', perfil);

      if (perfil?.centro_id) {
        console.log('🏥 [SesionModal] Centro desde perfil:', perfil.centro_id);
        setCentroResuelto(perfil.centro_id);
        return;
      }

      // 4. FALLBACK FINAL: primer centro de la BD
      console.warn('⚠️ [SesionModal] User sin centro. Buscando primer centro...');
      const { data: centros } = await supabase
        .from('centros')
        .select('id')
        .limit(1);
      if (centros && centros.length > 0) {
        console.log('🏥 [SesionModal] Usando primer centro como fallback:', centros[0].id);
        setCentroResuelto(centros[0].id);
      } else {
        console.error('❌ [SesionModal] No hay centros en el sistema');
      }
    } catch (err) {
      console.error('❌ [SesionModal] Error resolviendo centro:', err);
    }
  };

  resolver();
}, [abierto, centroId, evaluacionAprobada]);

  // ============================================================
  // DICTADO POR VOZ
  // ============================================================
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      return;
    }
    const SR = window.webkitSpeechRecognition || window.SpeechRecognition;
    const rec = new SR();
    rec.lang = 'es-ES';
    rec.continuous = false;
    rec.interimResults = false;

    rec.onstart = () => setEscuchando(true);
    rec.onend = () => setEscuchando(false);
    rec.onerror = () => setEscuchando(false);
    rec.onresult = (e) => {
      const texto = e.results[0][0].transcript;
      if (campoActivo) {
        setForm((prev) => ({
          ...prev,
          [campoActivo]: (prev[campoActivo] ? prev[campoActivo] + ' ' : '') + texto,
        }));
        setEscuchando(false);
        setCampoActivo(null);
      }
    };
    recognitionRef.current = rec;

    return () => {
      try { rec.stop(); } catch (_) { /* noop */ }
    };
  }, [campoActivo]);

  const iniciarDictado = (campo) => {
    if (!recognitionRef.current) {
      alert('Reconocimiento de voz no disponible. Usa Chrome o Edge.');
      return;
    }
    if (escuchando && campoActivo === campo) {
      recognitionRef.current.stop();
      setEscuchando(false);
      setCampoActivo(null);
      return;
    }
    setCampoActivo(campo);
    try { recognitionRef.current.start(); } catch (_) { /* noop */ }
  };

  // ============================================================
  // HANDLERS
  // ============================================================
  const handleInputChange = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const toggleItem = (campo, valor) => {
    setForm((prev) => {
      const lista = prev[campo] || [];
      return {
        ...prev,
        [campo]: lista.includes(valor)
          ? lista.filter((i) => i !== valor)
          : [...lista, valor],
      };
    });
  };

  const handleGuardar = async () => {
    if (!form.subjetivo && !form.objetivo && !form.analisis && !form.plan) {
      setError('Registra al menos un campo SOAP antes de guardar.');
      return;
    }
    if (!centroResuelto) {
  setError('No se pudo determinar el centro. Verifica que tu usuario tenga un centro asignado.');
  return;
}

    setGuardando(true);
    setError(null);
    try {
      // Snapshots con detalle completo
      const agentesSnapshot = form.agentes_aplicados.map((nombre) => {
        const c = catalogos.agentes.find((a) => a.nombre === nombre);
        return { nombre, tipo: c?.tipo || null, descripcion: c?.descripcion || '' };
      });
      const masoSnapshot = form.masoterapia_aplicada.map((nombre) => {
        const c = catalogos.masoterapia.find((m) => m.nombre === nombre);
        return { nombre, descripcion: c?.descripcion || '' };
      });
      const ejSnapshot = form.ejercicios_realizados.map((nombre) => {
        const c = catalogos.ejercicios.find((e) => e.nombre === nombre);
        return {
          nombre,
          tipo: c?.tipo || null,
          posicion: c?.posicion || null,
        };
      });

      await crearSesion({
  paciente_id: paciente.id,
  evaluacion_id: evaluacionAprobada?.id || null,
  centro_id: centroResuelto,
  duracion_min: form.duracion_min,
  subjetivo: form.subjetivo,
  objetivo: form.objetivo,
  analisis: form.analisis,
  plan: form.plan,
  eva_inicial: form.eva_inicial,
  eva_final: form.eva_final,
  agentes_aplicados: agentesSnapshot,
  masoterapia_aplicada: masoSnapshot,
  ejercicios_realizados: ejSnapshot,
  notas_adicionales: form.notas_adicionales,
  proxima_sesion_sugerida: form.proxima_sesion_sugerida || null,
  adherencia_plan_casero: form.adherencia_plan_casero,
});

      onGuardada?.();
      onCerrar?.();
    } catch (err) {
      console.error('❌ Error guardando sesión:', err);
      setError('Error al guardar: ' + err.message);
    } finally {
      setGuardando(false);
    }
  };

  // ============================================================
  // ESTILOS DINÁMICOS
  // ============================================================
  const bgModal = temaOscuro ? 'bg-[#0a141d] border-gray-800' : 'bg-white border-gray-300';
  const textoPrincipal = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const textoSecundario = temaOscuro ? 'text-gray-400' : 'text-gray-600';
  const bgInput = temaOscuro
    ? 'bg-black/20 border-white/10 text-white'
    : 'bg-gray-100 border-gray-300 text-[#0f172a]';
  const bgSeccion = temaOscuro ? 'bg-black/20 border-gray-800' : 'bg-gray-50 border-gray-200';

  // ============================================================
  // SI NO ESTÁ ABIERTO, NO RENDERIZAR
  // ============================================================
  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className={`relative w-full max-w-4xl rounded-3xl border ${bgModal} p-6 shadow-2xl my-8`}>

        {/* ===== HEADER ===== */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className={`text-2xl font-black ${textoPrincipal}`}>
              🩺 Nueva Sesión {numeroSesion ? `#${numeroSesion}` : ''}
            </h2>
            <p className={`text-xs ${textoSecundario} mt-1`}>
              {paciente?.nombre} {paciente?.apellidos}
              {evaluacionAprobada && (
                <span className="ml-2 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                  📋 Plan cargado
                </span>
              )}
            </p>
          </div>
          <button
            onClick={onCerrar}
            className={`${textoSecundario} hover:text-red-400 text-2xl leading-none`}
            title="Cerrar"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold">
            {error}
          </div>
        )}

        {/* ===== BARRA SUPERIOR: DURACIÓN + EVA ===== */}
        <div className={`${bgSeccion} rounded-2xl border p-4 mb-4 grid grid-cols-1 md:grid-cols-3 gap-4`}>
          <div>
            <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoSecundario} mb-1`}>
              ⏱️ Duración (min)
            </label>
            <input
              type="number"
              min="5"
              max="180"
              value={form.duracion_min}
              onChange={(e) => handleInputChange('duracion_min', parseInt(e.target.value) || 0)}
              className={`w-full px-3 py-2 rounded-xl border ${bgInput} text-sm outline-none focus:border-[#22d3ee]`}
            />
          </div>

          <div>
            <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoSecundario} mb-1`}>
              😣 EVA inicial (antes)
            </label>
            <div className="flex flex-wrap gap-1">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => handleInputChange('eva_inicial', n)}
                  className={`w-7 h-7 rounded-full text-xs font-bold transition-all ${
                    form.eva_inicial === n
                      ? 'bg-red-500 text-white scale-110'
                      : `${temaOscuro ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'} hover:scale-110`
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoSecundario} mb-1`}>
              😌 EVA final (después)
            </label>
            <div className="flex flex-wrap gap-1">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => handleInputChange('eva_final', n)}
                  className={`w-7 h-7 rounded-full text-xs font-bold transition-all ${
                    form.eva_final === n
                      ? 'bg-emerald-500 text-white scale-110'
                      : `${temaOscuro ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'} hover:scale-110`
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ===== SOAP ===== */}
        <div className="mb-4">
          <h3 className={`text-xs font-black uppercase tracking-wider text-[#22d3ee] mb-3`}>
            📝 SOAP
          </h3>

          <div className="space-y-3">
            {/* S — Subjetivo */}
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>
                <span className="text-[#22d3ee] font-black">S</span> — Subjetivo (lo que refiere el paciente)
              </label>
              <div className="relative">
                <textarea
                  rows="2"
                  value={form.subjetivo}
                  onChange={(e) => handleInputChange('subjetivo', e.target.value)}
                  placeholder="Ej: Paciente refiere dolor lumbar 5/10 al despertar, mejora con movimiento..."
                  className={`w-full px-3 py-2 rounded-xl border ${bgInput} text-sm outline-none focus:border-[#22d3ee] resize-none pr-10`}
                />
                <BotonDictado
                  campo="subjetivo"
                  campoActivo={campoActivo}
                  escuchando={escuchando}
                  onClick={iniciarDictado}
                />
              </div>
            </div>

            {/* O — Objetivo */}
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>
                <span className="text-[#22d3ee] font-black">O</span> — Objetivo (hallazgos, pruebas, mediciones)
              </label>
              <div className="relative">
                <textarea
                  rows="2"
                  value={form.objetivo}
                  onChange={(e) => handleInputChange('objetivo', e.target.value)}
                  placeholder="Ej: ROM lumbar flexión 60°, Lasègue negativo, tono paravertebral aumentado L4-L5..."
                  className={`w-full px-3 py-2 rounded-xl border ${bgInput} text-sm outline-none focus:border-[#22d3ee] resize-none pr-10`}
                />
                <BotonDictado
                  campo="objetivo"
                  campoActivo={campoActivo}
                  escuchando={escuchando}
                  onClick={iniciarDictado}
                />
              </div>
            </div>

            {/* A — Análisis */}
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>
                <span className="text-[#22d3ee] font-black">A</span> — Análisis (interpretación clínica)
              </label>
              <div className="relative">
                <textarea
                  rows="2"
                  value={form.analisis}
                  onChange={(e) => handleInputChange('analisis', e.target.value)}
                  placeholder="Ej: Lumbalgia mecánica en fase subaguda, buena respuesta al tratamiento..."
                  className={`w-full px-3 py-2 rounded-xl border ${bgInput} text-sm outline-none focus:border-[#22d3ee] resize-none pr-10`}
                />
                <BotonDictado
                  campo="analisis"
                  campoActivo={campoActivo}
                  escuchando={escuchando}
                  onClick={iniciarDictado}
                />
              </div>
            </div>

            {/* P — Plan */}
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>
                <span className="text-[#22d3ee] font-black">P</span> — Plan (qué se hará/hizo y próximos pasos)
              </label>
              <div className="relative">
                <textarea
                  rows="2"
                  value={form.plan}
                  onChange={(e) => handleInputChange('plan', e.target.value)}
                  placeholder="Ej: Continuar con agentes 2x/semana, aumentar carga en ejercicios de fortalecimiento..."
                  className={`w-full px-3 py-2 rounded-xl border ${bgInput} text-sm outline-none focus:border-[#22d3ee] resize-none pr-10`}
                />
                <BotonDictado
                  campo="plan"
                  campoActivo={campoActivo}
                  escuchando={escuchando}
                  onClick={iniciarDictado}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ===== TRATAMIENTO APLICADO ===== */}
        <div className={`${bgSeccion} rounded-2xl border p-4 mb-4`}>
          <h3 className={`text-xs font-black uppercase tracking-wider text-[#22d3ee] mb-3`}>
            🔧 Tratamiento aplicado
          </h3>

          {/* Agentes físicos */}
          <div className="mb-4">
            <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoSecundario} mb-2`}>
              Agentes físicos
              {agentesDisponiblesCentro.length === 0 && (
                <span className="ml-2 text-yellow-400 normal-case font-normal">
                  ⚠️ El centro no tiene equipamiento activo
                </span>
              )}
            </label>
            {agentesDisponiblesCentro.length === 0 ? (
              <p className={`text-xs ${textoSecundario} italic`}>
                (Sin agentes activos. Actívalos en Mi Equipamiento.)
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {agentesDisponiblesCentro.map((nombre) => {
                  const checked = form.agentes_aplicados.includes(nombre);
                  return (
                    <label
                      key={nombre}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border cursor-pointer transition-all text-xs ${
                        checked
                          ? 'bg-[#22d3ee]/20 border-[#22d3ee]/50 text-[#22d3ee]'
                          : `${temaOscuro ? 'border-gray-700 text-gray-300' : 'border-gray-300 text-gray-700'} hover:border-[#22d3ee]/50`
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleItem('agentes_aplicados', nombre)}
                        className="accent-[#22d3ee]"
                      />
                      {nombre}
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Masoterapia */}
          <div className="mb-4">
            <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoSecundario} mb-2`}>
              Masoterapia
            </label>
            <div className="flex flex-wrap gap-2">
              {catalogos.masoterapia.map((tec) => {
                const checked = form.masoterapia_aplicada.includes(tec.nombre);
                return (
                  <label
                    key={tec.id}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border cursor-pointer transition-all text-xs ${
                      checked
                        ? 'bg-orange-500/20 border-orange-500/50 text-orange-400'
                        : `${temaOscuro ? 'border-gray-700 text-gray-300' : 'border-gray-300 text-gray-700'} hover:border-orange-500/50`
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleItem('masoterapia_aplicada', tec.nombre)}
                      className="accent-orange-500"
                    />
                    {tec.nombre}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Ejercicios */}
          <div>
            <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoSecundario} mb-2`}>
              Ejercicios realizados
            </label>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
              {catalogos.ejercicios.map((ej) => {
                const checked = form.ejercicios_realizados.includes(ej.nombre);
                return (
                  <label
                    key={ej.id}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border cursor-pointer transition-all text-xs ${
                      checked
                        ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                        : `${temaOscuro ? 'border-gray-700 text-gray-300' : 'border-gray-300 text-gray-700'} hover:border-purple-500/50`
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleItem('ejercicios_realizados', ej.nombre)}
                      className="accent-purple-500"
                    />
                    {ej.nombre}
                  </label>
                );
              })}
            </div>
          </div>
        </div>

{/* ===== ADHERENCIA AL PLAN DE CASA ===== */}
<div className={`${bgSeccion} rounded-2xl border p-4 mb-4`}>
  <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
    <div>
      <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal}`}>
        🏋️ Adherencia al plan de casa
      </label>
      <p className={`text-[10px] ${textoSecundario} mt-0.5`}>
        ¿Cuánto cumplió el paciente los ejercicios indicados para casa?
      </p>
    </div>
    {form.adherencia_plan_casero != null && (
      <span
        className={`text-xs font-black px-3 py-1 rounded-full ${
          form.adherencia_plan_casero >= 75
            ? 'bg-emerald-500/20 text-emerald-400'
            : form.adherencia_plan_casero >= 50
            ? 'bg-yellow-500/20 text-yellow-400'
            : 'bg-red-500/20 text-red-400'
        }`}
      >
        {form.adherencia_plan_casero}%
      </span>
    )}
  </div>

  <div className="flex flex-wrap gap-2">
    {[0, 25, 50, 75, 100].map((n) => {
      const activo = form.adherencia_plan_casero === n;
      let colorActivo = 'bg-red-500 text-white';
      if (n >= 75) colorActivo = 'bg-emerald-500 text-white';
      else if (n >= 50) colorActivo = 'bg-yellow-500 text-black';
      else if (n >= 25) colorActivo = 'bg-orange-500 text-white';

      return (
        <button
          key={n}
          type="button"
          onClick={() =>
            handleInputChange(
              'adherencia_plan_casero',
              activo ? null : n
            )
          }
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
            activo
              ? `${colorActivo} scale-105 shadow-lg`
              : `${temaOscuro ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`
          }`}
          title={activo ? 'Click para quitar' : `Marcar ${n}%`}
        >
          {n}%
        </button>
      );
    })}
    {form.adherencia_plan_casero != null && (
      <button
        type="button"
        onClick={() => handleInputChange('adherencia_plan_casero', null)}
        className={`px-3 py-2 rounded-xl text-[10px] font-bold ${
          temaOscuro
            ? 'bg-black/40 text-gray-400 hover:bg-black/60'
            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
        }`}
        title="No preguntado"
      >
        ✕ Limpiar
      </button>
    )}
  </div>
</div>

        {/* ===== NOTAS + PRÓXIMA SESIÓN ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoSecundario} mb-1`}>
              Notas adicionales
            </label>
            <div className="relative">
              <textarea
                rows="2"
                value={form.notas_adicionales}
                onChange={(e) => handleInputChange('notas_adicionales', e.target.value)}
                placeholder="Observaciones, reacciones, indicaciones..."
                className={`w-full px-3 py-2 rounded-xl border ${bgInput} text-sm outline-none focus:border-[#22d3ee] resize-none pr-10`}
              />
              <BotonDictado
                campo="notas_adicionales"
                campoActivo={campoActivo}
                escuchando={escuchando}
                onClick={iniciarDictado}
              />
            </div>
          </div>
          <div>
            <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoSecundario} mb-1`}>
              📅 Próxima sesión sugerida
            </label>
            <input
              type="date"
              value={form.proxima_sesion_sugerida}
              onChange={(e) => handleInputChange('proxima_sesion_sugerida', e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border ${bgInput} text-sm outline-none focus:border-[#22d3ee]`}
            />
          </div>
        </div>

        {/* ===== FOOTER ===== */}
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
            {guardando ? '⏳ Guardando...' : '💾 Guardar Sesión'}
          </button>
        </div>
      </div>
    </div>
  );
}