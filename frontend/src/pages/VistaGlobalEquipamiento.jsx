// ============================================================
// src/pages/VistaGlobalEquipamiento.jsx
// Vista matriz para el Director Global (rol 1)
// Muestra todos los centros × todos los agentes del catálogo
// ============================================================
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { listarEquipamiento, agregarEquipo, actualizarEquipo } from '../utils/aparatologia';

const getColorTipoCustom = (tipo) => {
  const map = {
    terapia_manual: 'bg-blue-500/20 text-blue-400',
    mecanoterapia: 'bg-purple-500/20 text-purple-400',
    electroterapia: 'bg-yellow-500/20 text-yellow-400',
    termoterapia: 'bg-orange-500/20 text-orange-400',
    hidroterapia: 'bg-cyan-500/20 text-cyan-400',
    diagnostico: 'bg-emerald-500/20 text-emerald-400',
    otro: 'bg-gray-500/20 text-gray-400',
  };
  return map[tipo] || 'bg-gray-500/20 text-gray-400';
};

export default function VistaGlobalEquipamiento({ temaOscuro }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [catalogo, setCatalogo] = useState([]);
  const [centros, setCentros] = useState([]);
  const [equiposPorCentro, setEquiposPorCentro] = useState({});
  const [customPorCentro, setCustomPorCentro] = useState({});
  const [toast, setToast] = useState(null);
  const [guardando, setGuardando] = useState(false);

  // ===== ESTILOS =====
  const bgPrincipal = temaOscuro ? 'bg-[#0a141d]' : 'bg-[#e2e8f0]';
  const textoPrincipal = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const textoSecundario = temaOscuro ? 'text-gray-400' : 'text-gray-600';
  const bgTarjeta = temaOscuro ? 'bg-[#0a141d] border-gray-800' : 'bg-white border-gray-200';
  const bordeTabla = temaOscuro ? 'border-gray-700' : 'border-gray-200';
  const bgTablaHead = temaOscuro ? 'bg-[#0f1a24]' : 'bg-gray-100';
  const hoverFila = temaOscuro ? 'hover:bg-[#22d3ee]/5' : 'hover:bg-[#22d3ee]/10';

  useEffect(() => {
    cargarTodo();
  }, []);

  const cargarTodo = async () => {
    try {
      const res = await fetch('/src/data/catalogo_agentes_fisicos.json');
      const cat = await res.json();
      setCatalogo(cat);

      const { data: centrosData } = await supabase
        .from('centros')
        .select('id, nombre, tipo_centro')
        .order('id');
      setCentros(centrosData || []);

      const agrupados = {};
const agrupadosCustom = {};
(centrosData || []).forEach((c) => {
  agrupados[c.id] = [];
  agrupadosCustom[c.id] = [];
});

for (const c of centrosData || []) {
  try {
    const eqs = await listarEquipamiento(c.id);
    agrupados[c.id] = eqs;
    agrupadosCustom[c.id] = eqs.filter((e) => e.es_custom === true);
  } catch (e) {
    agrupados[c.id] = [];
    agrupadosCustom[c.id] = [];
  }
}
setEquiposPorCentro(agrupados);
setCustomPorCentro(agrupadosCustom);
    } catch (err) {
      console.error('❌ Error cargando vista global:', err);
    } finally {
      setLoading(false);
    }
  };

  const mostrarToast = (tipo, mensaje) => {
    setToast({ tipo, mensaje });
    setTimeout(() => setToast(null), 3000);
  };

  const equipoDe = (centroId, agenteId) =>
    (equiposPorCentro[centroId] || []).find((e) => e.agente_id === agenteId) || null;

  const handleToggleCelda = async (centroId, agente, equipoExistente) => {
    setGuardando(true);
    try {
      if (equipoExistente) {
        await actualizarEquipo(equipoExistente.id, {
          disponible: !equipoExistente.disponible,
        });
        mostrarToast('info', '✅ Estado actualizado');
      } else {
        await agregarEquipo(centroId, agente);
        mostrarToast('exito', `✅ ${agente.nombre} agregado a ${centroId}`);
      }
      await cargarTodo();
    } catch (err) {
      mostrarToast('error', 'Error: ' + err.message);
    } finally {
      setGuardando(false);
    }
  };

  // ===== MÉTRICAS GLOBALES =====
  const todosEquipos = Object.values(equiposPorCentro).flat();
  const totalRegistrados = todosEquipos.length;
  const totalActivos = todosEquipos.filter((e) => e.disponible).length;
  const totalInactivos = todosEquipos.filter((e) => !e.disponible).length;

  if (loading) {
    return (
      <div className={`min-h-screen ${bgPrincipal} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#22d3ee] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgPrincipal} p-4 md:p-8 transition-colors duration-500`}>
      <div className="max-w-7xl mx-auto">

        {/* CABECERA */}
        <div className="mb-6">
          <h1 className={`text-3xl font-black tracking-tight ${textoPrincipal}`}>
            🌍 Equipamiento Global
          </h1>
          <p className={`${textoSecundario} text-sm mt-1`}>
            Vista consolidada de todos los centros del ecosistema
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className={`${bgTarjeta} p-4 rounded-2xl border text-center`}>
            <p className="text-3xl font-black text-[#22d3ee]">{centros.length}</p>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${textoSecundario}`}>Centros</p>
          </div>
          <div className={`${bgTarjeta} p-4 rounded-2xl border text-center`}>
            <p className="text-3xl font-black text-purple-500">{totalRegistrados}</p>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${textoSecundario}`}>Registrados</p>
          </div>
          <div className={`${bgTarjeta} p-4 rounded-2xl border text-center`}>
            <p className="text-3xl font-black text-emerald-500">{totalActivos}</p>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${textoSecundario}`}>Activos</p>
          </div>
          <div className={`${bgTarjeta} p-4 rounded-2xl border text-center`}>
            <p className="text-3xl font-black text-yellow-500">{totalInactivos}</p>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${textoSecundario}`}>No disponibles</p>
          </div>
        </div>

        {/* MATRIZ */}
        <div className={`${bgTarjeta} rounded-2xl border overflow-hidden mb-6`}>
          <div className="p-4 border-b border-gray-700/50">
            <h2 className={`text-sm font-black uppercase tracking-wider text-[#22d3ee]`}>
              📊 Matriz: Equipos × Centros
            </h2>
            <p className={`text-[11px] ${textoSecundario} mt-1`}>
              Click en cualquier celda: <strong className="text-emerald-400">✅ activo</strong> ↔ <strong className="text-gray-400">⏸️ inactivo</strong> / <strong className="text-purple-400">— sin registrar → agregar</strong>
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className={`${bgTablaHead} border-b ${bordeTabla}`}>
                <tr>
                  <th className={`px-4 py-3 text-left font-bold uppercase ${textoSecundario}`}>
                    Equipo
                  </th>
                  {centros.map((c) => (
                    <th key={c.id} className={`px-3 py-3 text-center font-bold uppercase ${textoSecundario} whitespace-nowrap`}>
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-[#22d3ee]">{c.id}</span>
                        <span className="text-[8px] opacity-70 max-w-[100px] truncate">{c.nombre}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {catalogo.map((ag) => (
                  <tr key={ag.id} className={`border-b ${bordeTabla} ${hoverFila}`}>
                    <td className={`px-4 py-2.5 font-medium ${textoPrincipal}`}>
                      {ag.nombre}
                    </td>
                    {centros.map((c) => {
                      const eq = equipoDe(c.id, ag.id);
                      const disponible = eq?.disponible;
                      let contenido, colorBtn, tooltip;
                      if (!eq) {
                        contenido = '—';
                        colorBtn = temaOscuro
                          ? 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/30'
                          : 'bg-purple-50 text-purple-600 hover:bg-purple-200';
                        tooltip = 'Click para agregar a este centro';
                      } else if (disponible) {
                        contenido = '✅';
                        colorBtn = temaOscuro
                          ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/30'
                          : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-200';
                        tooltip = 'Activo. Click para desactivar.';
                      } else {
                        contenido = '⏸️';
                        colorBtn = temaOscuro
                          ? 'bg-gray-500/10 text-gray-400 hover:bg-gray-500/30'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-300';
                        tooltip = 'No disponible. Click para activar.';
                      }
                      return (
                        <td key={c.id} className="px-3 py-2 text-center">
                          <button
                            onClick={() => handleToggleCelda(c.id, ag, eq)}
                            disabled={guardando}
                            className={`w-10 h-10 rounded-xl text-base transition-all ${colorBtn} disabled:opacity-50`}
                            title={tooltip}
                          >
                            {contenido}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CARDS POR CENTRO */}
        <div className="mb-6">
          <h2 className={`text-sm font-black uppercase tracking-wider text-[#22d3ee] mb-3`}>
            🏥 Detalle por centro
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {centros.map((c) => {
  const equiposTodos = equiposPorCentro[c.id] || [];
  const oficiales = equiposTodos.filter((e) => e.es_custom !== true);
  const customs = equiposTodos.filter((e) => e.es_custom === true);

  // Stats oficiales
  const oficialesRegistrados = oficiales.length;
  const oficialesActivos = oficiales.filter((e) => e.disponible).length;
  const oficialesFaltantes = Math.max(0, catalogo.length - oficialesRegistrados);
  const coberturaOficialPct = catalogo.length > 0
    ? Math.min(100, Math.round((oficialesRegistrados / catalogo.length) * 100))
    : 0;

  // Stats customs
  const customsActivos = customs.filter((e) => e.disponible).length;
  const customsInactivos = customs.length - customsActivos;
  const totalActivosGlobal = oficialesActivos + customsActivos;

  return (
    <div key={c.id} className={`${bgTarjeta} p-5 rounded-2xl border`}>
      {/* Cabecera */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className={`text-sm font-black ${textoPrincipal}`}>{c.id}</p>
          <p className={`text-[11px] ${textoSecundario} truncate`}>{c.nombre}</p>
        </div>
        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
          c.tipo_centro === 'independiente'
            ? 'bg-blue-500/20 text-blue-400'
            : 'bg-purple-500/20 text-purple-400'
        }`}>
          {c.tipo_centro || 'centro'}
        </span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center">
          <p className="text-xl font-black text-[#22d3ee]">
            {oficialesRegistrados}/{catalogo.length}
          </p>
          <p className={`text-[8px] uppercase ${textoSecundario}`}>Oficiales</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-black text-emerald-500">{totalActivosGlobal}</p>
          <p className={`text-[8px] uppercase ${textoSecundario}`}>Activos</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-black text-yellow-500">{oficialesFaltantes}</p>
          <p className={`text-[8px] uppercase ${textoSecundario}`}>Faltantes</p>
        </div>
      </div>

      {/* Barra oficial — activos vs inactivos */}
<div className="mb-2">
  <div className={`flex justify-between text-[9px] mb-0.5 ${textoSecundario}`}>
    <span>Catálogo oficial</span>
    <span className="font-bold">
      {oficialesActivos}/{catalogo.length} activos
    </span>
  </div>
  <div className={`h-1.5 rounded-full overflow-hidden flex ${temaOscuro ? 'bg-gray-800' : 'bg-gray-200'}`}>
    {oficialesActivos > 0 && (
      <div
        className="h-full bg-emerald-500 transition-all"
        style={{ width: `${(oficialesActivos / catalogo.length) * 100}%` }}
      />
    )}
    {oficiales.length - oficialesActivos > 0 && (
      <div
        className="h-full bg-gray-500 transition-all"
        style={{ width: `${((oficiales.length - oficialesActivos) / catalogo.length) * 100}%` }}
      />
    )}
  </div>
  <div className="flex gap-3 text-[9px] mt-0.5 flex-wrap">
    <span className="text-emerald-400">● {oficialesActivos} activos</span>
    {oficiales.length - oficialesActivos > 0 && (
      <span className={textoSecundario}>● {oficiales.length - oficialesActivos} inactivos</span>
    )}
    {oficialesFaltantes > 0 && (
      <span className="text-yellow-500">● {oficialesFaltantes} sin registrar</span>
    )}
  </div>
</div>

      {/* Línea de personalizados */}
      {customs.length > 0 && (
        <div className="mb-3">
          <div className={`flex justify-between text-[9px] mb-0.5 ${textoSecundario}`}>
            <span className="text-purple-400 font-bold">✨ Personalizados</span>
            <span className="font-bold">{customs.length} total</span>
          </div>
          <div className={`h-1.5 rounded-full overflow-hidden flex ${temaOscuro ? 'bg-gray-800' : 'bg-gray-200'}`}>
            {customsActivos > 0 && (
              <div
                className="h-full bg-emerald-500 transition-all"
                style={{ width: `${(customsActivos / customs.length) * 100}%` }}
              />
            )}
            {customsInactivos > 0 && (
              <div
                className="h-full bg-gray-500 transition-all"
                style={{ width: `${(customsInactivos / customs.length) * 100}%` }}
              />
            )}
          </div>
          <div className="flex gap-3 text-[9px] mt-0.5">
            <span className="text-emerald-400">● {customsActivos} activos</span>
            {customsInactivos > 0 && (
              <span className={`${textoSecundario}`}>● {customsInactivos} inactivos</span>
            )}
          </div>
        </div>
      )}

      {/* Si NO hay customs → mensaje discreto */}
      {customs.length === 0 && (
        <p className={`text-[9px] ${textoSecundario} italic mb-3`}>
          Sin equipos personalizados
        </p>
      )}

      {/* Botón */}
      <button
        onClick={() => navigate(`/mi-equipamiento?centro=${c.id}`)}
        className="w-full py-2 bg-[#22d3ee]/20 text-[#22d3ee] font-black rounded-xl text-[10px] uppercase tracking-wider hover:bg-[#22d3ee] hover:text-black transition-all"
      >
        Gestionar este centro →
      </button>
    </div>
  );
})}
          </div>
        </div>

        {/* ============================================================ */}
{/* ✨ EQUIPOS PERSONALIZADOS POR CENTRO                         */}
{/* ============================================================ */}
<div className="mb-6">
  <div className="mb-4">
    <h2 className={`text-sm font-black uppercase tracking-wider text-purple-400 flex items-center gap-2`}>
      ✨ Equipos personalizados por centro
    </h2>
    <p className={`text-[11px] ${textoSecundario} mt-1`}>
      Equipos específicos de cada centro que no están en el catálogo oficial
    </p>
  </div>

  {(() => {
    // Solo mostrar centros que tengan al menos 1 custom
    const centrosConCustom = centros.filter(
      (c) => (customPorCentro[c.id] || []).length > 0
    );

    if (centrosConCustom.length === 0) {
      return (
        <div
          className={`${bgTarjeta} p-8 rounded-2xl border-2 border-dashed ${
            temaOscuro ? 'border-purple-500/20' : 'border-purple-300'
          } text-center`}
        >
          <p className="text-3xl mb-2">📦</p>
          <p className={`text-sm font-bold ${textoPrincipal} mb-1`}>
            Ningún centro tiene equipos personalizados
          </p>
          <p className={`text-xs ${textoSecundario}`}>
            Los Admin Centro pueden crearlos desde "Mi Equipamiento"
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-5">
        {centrosConCustom.map((c) => {
          const customs = customPorCentro[c.id] || [];
          const activos = customs.filter((e) => e.disponible).length;

          return (
            <div key={c.id} className={`${bgTarjeta} rounded-2xl border overflow-hidden`}>
              {/* Cabecera del centro */}
              <div
                className={`px-4 py-3 border-b ${
                  temaOscuro
                    ? 'bg-purple-900/10 border-purple-500/20'
                    : 'bg-purple-50 border-purple-200'
                } flex justify-between items-center flex-wrap gap-2`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black text-purple-400">{c.id}</span>
                  <span className={`text-xs ${textoSecundario} truncate max-w-[200px]`}>
                    {c.nombre}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                    {customs.length} {customs.length === 1 ? 'equipo' : 'equipos'}
                  </span>
                  <span className="font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                    {activos} activos
                  </span>
                  {customs.length - activos > 0 && (
                    <span className="font-bold px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400">
                      {customs.length - activos} inactivos
                    </span>
                  )}
                </div>
              </div>

              {/* Grid de customs */}
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {customs.map((eq) => (
                  <div
                    key={eq.id}
                    className={`p-3 rounded-xl border ${
                      eq.disponible
                        ? temaOscuro
                          ? 'border-emerald-500/30 bg-emerald-500/5'
                          : 'border-emerald-300 bg-emerald-50'
                        : temaOscuro
                        ? 'border-gray-700 bg-black/20'
                        : 'border-gray-300 bg-gray-50'
                    }`}
                  >
                    {/* Cabecera del equipo */}
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-xs font-black ${textoPrincipal} leading-tight`}>
                          {eq.agente_nombre}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          {eq.tipo && (
                            <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full ${getColorTipoCustom(eq.tipo)}`}>
                              {eq.tipo.replace('_', ' ')}
                            </span>
                          )}
                          <span
                            className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full ${
                              eq.disponible
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-gray-500/20 text-gray-400'
                            }`}
                          >
                            {eq.disponible ? '✅' : '⏸️'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Descripción */}
                    {eq.descripcion && (
                      <p className={`text-[10px] ${textoSecundario} leading-snug mb-2 line-clamp-2`}>
                        {eq.descripcion}
                      </p>
                    )}

                    {/* Info técnica */}
                    <div className="flex flex-wrap gap-1.5 text-[9px]">
                      {eq.cantidad && (
                        <span className={`px-1.5 py-0.5 rounded ${temaOscuro ? 'bg-black/30' : 'bg-white'} ${textoSecundario}`}>
                          📦 x{eq.cantidad}
                        </span>
                      )}
                      {eq.marca && (
                        <span className={`px-1.5 py-0.5 rounded ${temaOscuro ? 'bg-black/30' : 'bg-white'} ${textoSecundario}`}>
                          🏷️ {eq.marca}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  })()}
</div>

        {/* BOTÓN VOLVER */}
        <div>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-gray-600 text-white font-bold rounded-xl text-sm hover:bg-gray-700 transition-all"
          >
            ← Volver
          </button>
        </div>
      </div>

      {/* TOAST */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-xl shadow-2xl text-sm font-bold border max-w-[90vw] text-center ${
            toast.tipo === 'exito'
              ? 'bg-green-500/20 text-green-300 border-green-500/40 backdrop-blur-md'
              : toast.tipo === 'error'
              ? 'bg-red-500/20 text-red-300 border-red-500/40 backdrop-blur-md'
              : 'bg-blue-500/20 text-blue-300 border-blue-500/40 backdrop-blur-md'
          }`}
        >
          {toast.mensaje}
        </div>
      )}
    </div>
  );
}