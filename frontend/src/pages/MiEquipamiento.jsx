// ============================================================
// src/pages/MiEquipamiento.jsx
// Bloque 3.1 — Aparatología del centro
// Solo accesible para Director (rol 1) y Admin Centro (rol 7)
// ============================================================
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import {
  listarEquipamiento,
  agregarEquipo,
  actualizarEquipo,
  eliminarEquipo,
  agregarVarios,
  agentesFaltantes,
  listarPersonalizados,
  actualizarEquipoCustom,
} from '../utils/aparatologia';
import EquipoCustomModal from '../components/clinica/EquipoCustomModal';
import { useSearchParams } from 'react-router-dom';
import VistaGlobalEquipamiento from './VistaGlobalEquipamiento';

// ============================================================
// COLORES POR TIPO DE AGENTE
// ============================================================
const COLORES_TIPO = {
  electroterapia: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  termoterapia: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  mecanoterapia: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  hidroterapia: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
};

const getColorTipo = (tipo) =>
  COLORES_TIPO[tipo] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';

export default function MiEquipamiento({ temaOscuro }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [sincronizando, setSincronizando] = useState(false);
  const [perfil, setPerfil] = useState(null);
  const [centro, setCentro] = useState(null);
  const [catalogo, setCatalogo] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [filtro, setFiltro] = useState('todos'); // todos | activos | inactivos | sin_registrar
  const [toast, setToast] = useState(null);
  // ===== EQUIPOS PERSONALIZADOS =====
const [personalizados, setPersonalizados] = useState([]);
const [modalCustomAbierto, setModalCustomAbierto] = useState(false);
const [customEditando, setCustomEditando] = useState(null);

  // ===== ESTILOS DINÁMICOS =====
  const bgPrincipal = temaOscuro ? 'bg-[#0a141d]' : 'bg-[#e2e8f0]';
  const textoPrincipal = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const textoSecundario = temaOscuro ? 'text-gray-400' : 'text-gray-600';
  const bgTarjeta = temaOscuro ? 'bg-[#0a141d] border-gray-800' : 'bg-white border-gray-200';
  const bgInput = temaOscuro
    ? 'bg-black/20 border-white/10 text-white'
    : 'bg-gray-100 border-gray-300 text-[#0f172a]';
  const hoverFila = temaOscuro ? 'hover:border-[#22d3ee]/40' : 'hover:border-[#22d3ee]';

  // ============================================================
  // CARGA INICIAL
  // ============================================================
  useEffect(() => {
    cargarTodo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarTodo = async () => {
    setLoading(true);
    try {
      // 1. Verificar usuario y rol
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data: perfilData, error: perfilError } = await supabase
        .from('profiles')
        .select('rol, centro_id, nombre_completo')
        .eq('id', user.id)
        .single();

      if (perfilError) throw perfilError;

      if (!perfilData || (perfilData.rol !== 1 && perfilData.rol !== 7 && perfilData.rol !== 8)) {
  alert('⛔ Solo el Director, Admin Centro o Independiente pueden gestionar el equipamiento.');
  navigate('/inicio');
  return;
}

      setPerfil(perfilData);

      // 2. Cargar catálogo JSON
      const resCatalogo = await fetch('/data/catalogo_agentes_fisicos.json');
      if (!resCatalogo.ok) throw new Error('No se pudo cargar el catálogo de agentes');
      const catalogoData = await resCatalogo.json();
      setCatalogo(catalogoData);

      // 3. Cargar centro (nombre)
      if (perfilData.centro_id) {
        const { data: centroData } = await supabase
          .from('centros')
          .select('id, nombre, direccion')
          .eq('id', perfilData.centro_id)
          .single();
        setCentro(centroData);
      }

      // 4. Cargar equipamiento del centro
if (perfilData.centro_id) {
  const equiposData = await listarEquipamiento(perfilData.centro_id);
  setEquipos(equiposData);
  setPersonalizados(equiposData.filter((e) => e.es_custom === true));
}
    } catch (err) {
      console.error('❌ Error cargando equipamiento:', err);
      alert('Error al cargar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const recargarEquipos = async () => {
  if (!perfil?.centro_id) return;
  const equiposData = await listarEquipamiento(perfil.centro_id);
  setEquipos(equiposData);
  setPersonalizados(equiposData.filter((e) => e.es_custom === true));
};

  // ============================================================
  // HELPERS DE ESTADO
  // ============================================================
  const equipoDeAgente = (agenteId) =>
    equipos.find((e) => e.agente_id === agenteId) || null;

  const mostrarToast = (tipo, mensaje) => {
    setToast({ tipo, mensaje });
    setTimeout(() => setToast(null), 3500);
  };

  // ============================================================
  // AGREGAR EQUIPO
  // ============================================================
  const handleAgregar = async (agente) => {
    if (!perfil?.centro_id) {
      mostrarToast('error', 'No tienes un centro asignado.');
      return;
    }
    setGuardando(true);
    try {
      await agregarEquipo(perfil.centro_id, agente);
      await recargarEquipos();
      mostrarToast('exito', `✅ ${agente.nombre} agregado al equipamiento.`);
    } catch (err) {
      mostrarToast('error', 'Error: ' + err.message);
    } finally {
      setGuardando(false);
    }
  };

  // ============================================================
  // TOGGLE DISPONIBLE / NO DISPONIBLE
  // ============================================================
  const handleToggle = async (equipo) => {
    setGuardando(true);
    try {
      await actualizarEquipo(equipo.id, { disponible: !equipo.disponible });
      await recargarEquipos();
      mostrarToast(
        'info',
        !equipo.disponible
          ? `✅ ${equipo.agente_nombre} marcado como disponible.`
          : `⏸️ ${equipo.agente_nombre} marcado como no disponible.`
      );
    } catch (err) {
      mostrarToast('error', 'Error: ' + err.message);
    } finally {
      setGuardando(false);
    }
  };

  // ============================================================
  // ACTUALIZAR CAMPO (marca, modelo, cantidad, notas)
  // ============================================================
  const handleCampo = async (equipo, campo, valor) => {
    try {
      await actualizarEquipo(equipo.id, { [campo]: valor });
      await recargarEquipos();
    } catch (err) {
      mostrarToast('error', 'Error al guardar: ' + err.message);
    }
  };

  // ============================================================
  // ELIMINAR EQUIPO
  // ============================================================
  const handleEliminar = async (equipo) => {
    if (!confirm(`¿Eliminar "${equipo.agente_nombre}" del inventario del centro?`)) return;
    setGuardando(true);
    try {
      await eliminarEquipo(equipo.id);
      await recargarEquipos();
      mostrarToast('info', `🗑️ ${equipo.agente_nombre} eliminado.`);
    } catch (err) {
      mostrarToast('error', 'Error: ' + err.message);
    } finally {
      setGuardando(false);
    }
  };

  // ============================================================
  // SINCRONIZAR CATÁLOGO (agrega todos los que falten)
  // ============================================================
  const handleSincronizar = async () => {
    if (!perfil?.centro_id) return;
    const faltantes = await agentesFaltantes(perfil.centro_id, catalogo);
    if (faltantes.length === 0) {
      mostrarToast('info', 'El catálogo ya está completo.');
      return;
    }
    if (!confirm(`Se agregarán ${faltantes.length} agentes al centro. ¿Continuar?`)) return;

    setSincronizando(true);
    try {
      await agregarVarios(perfil.centro_id, faltantes);
      await recargarEquipos();
      mostrarToast('exito', `✅ ${faltantes.length} agentes agregados.`);
    } catch (err) {
      mostrarToast('error', 'Error: ' + err.message);
    } finally {
      setSincronizando(false);
    }
  };

  // ============================================================
// EQUIPOS PERSONALIZADOS
// ============================================================
const handleAbrirModalCustom = (equipo = null) => {
  setCustomEditando(equipo);
  setModalCustomAbierto(true);
};

const handleCerrarModalCustom = () => {
  setCustomEditando(null);
  setModalCustomAbierto(false);
};

const handleEliminarCustom = async (equipo) => {
  if (!confirm(`¿Eliminar "${equipo.agente_nombre}" del inventario?`)) return;
  setGuardando(true);
  try {
    await eliminarEquipo(equipo.id);
    await recargarEquipos();
    mostrarToast('info', `🗑️ ${equipo.agente_nombre} eliminado.`);
  } catch (err) {
    mostrarToast('error', 'Error: ' + err.message);
  } finally {
    setGuardando(false);
  }
};

const handleToggleCustom = async (equipo) => {
  setGuardando(true);
  try {
    await actualizarEquipoCustom(equipo.id, { disponible: !equipo.disponible });
    await recargarEquipos();
    mostrarToast(
      'info',
      !equipo.disponible
        ? `✅ ${equipo.agente_nombre} activado.`
        : `⏸️ ${equipo.agente_nombre} desactivado.`
    );
  } catch (err) {
    mostrarToast('error', 'Error: ' + err.message);
  } finally {
    setGuardando(false);
  }
};

  // ============================================================
  // FILTRADO
  // ============================================================
  const agentesFiltrados = catalogo.filter((ag) => {
    const eq = equipoDeAgente(ag.id);
    if (filtro === 'activos') return eq && eq.disponible;
    if (filtro === 'inactivos') return eq && !eq.disponible;
    if (filtro === 'sin_registrar') return !eq;
    return true;
  });

  // ============================================================
  // MÉTRICAS
  // ============================================================
  const totalRegistrados = equipos.length;
  const totalActivos = equipos.filter((e) => e.disponible).length;
  const totalCatalogo = catalogo.length;
  const totalFaltantes = Math.max(0, totalCatalogo - totalRegistrados);

  // ===== DIRECTOR GLOBAL: mostrar vista matriz si no hay centro seleccionado =====
const [searchParams] = useSearchParams();
const centroQuery = searchParams.get('centro');
const esDirectorGlobal = perfil?.rol === 1;

// Si es Director Global y NO hay ?centro= → mostrar vista global
if (esDirectorGlobal && !centroQuery) {
  return <VistaGlobalEquipamiento temaOscuro={temaOscuro} />;
}

// El centro objetivo para edición:
// - Director Global con ?centro=CJ000 → ese centro
// - Admin Centro (rol 7) → su propio centro
const centroObjetivo = centroQuery || perfil?.centro_id;

  // ============================================================
  // LOADING
  // ============================================================
  if (loading) {
    return (
      <div className={`min-h-screen ${bgPrincipal} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#22d3ee] border-t-transparent"></div>
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className={`min-h-screen ${bgPrincipal} p-4 md:p-8 transition-colors duration-500`}>
      <div className="max-w-7xl mx-auto">

        {/* ===== CABECERA ===== */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className={`text-3xl font-black tracking-tight ${textoPrincipal}`}>
              🔧 Mi Equipamiento
            </h1>
            <p className={`${textoSecundario} text-sm mt-1`}>
              {centroObjetivo ? `${centro?.nombre || ''} (${centroObjetivo})` : 'Sin centro asignado'}
              {perfil && (
                <span className="ml-2 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#22d3ee]/20 text-[#22d3ee]">
                  {perfil.rol === 1 ? 'Director' : perfil.rol === 8 ? 'Independiente' : 'Admin Centro'}
                </span>
              )}
            </p>
          </div>

          <button
            onClick={handleSincronizar}
            disabled={sincronizando || totalFaltantes === 0}
            className="px-5 py-3 bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/40 font-black rounded-xl text-sm hover:bg-purple-500 hover:text-white hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
            title={
              totalFaltantes === 0
                ? 'Todos los agentes del catálogo ya están registrados'
                : `Agregar ${totalFaltantes} agentes faltantes`
            }
          >
            {sincronizando ? '⏳ Sincronizando...' : `🔄 Sincronizar catálogo (${totalFaltantes})`}
          </button>
        </div>

        {/* ===== AVISO SIN CENTRO ===== */}
        {!perfil?.centro_id && (
          <div className="mb-6 p-4 rounded-2xl border border-red-500/40 bg-red-500/10">
            <p className="text-red-400 text-sm font-bold">
              ⚠️ No tienes un centro asignado. Pide al Director Global que te asigne uno antes de gestionar equipamiento.
            </p>
          </div>
        )}

        {/* ===== MÉTRICAS ===== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className={`${bgTarjeta} p-4 rounded-2xl border text-center`}>
            <p className="text-3xl font-black text-[#22d3ee]">{totalRegistrados}</p>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${textoSecundario}`}>
              Registrados
            </p>
          </div>
          <div className={`${bgTarjeta} p-4 rounded-2xl border text-center`}>
            <p className="text-3xl font-black text-emerald-500">{totalActivos}</p>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${textoSecundario}`}>
              Activos
            </p>
          </div>
          <div className={`${bgTarjeta} p-4 rounded-2xl border text-center`}>
            <p className="text-3xl font-black text-yellow-500">{totalRegistrados - totalActivos}</p>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${textoSecundario}`}>
              No disponibles
            </p>
          </div>
          <div className={`${bgTarjeta} p-4 rounded-2xl border text-center`}>
            <p className="text-3xl font-black text-purple-500">{totalFaltantes}</p>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${textoSecundario}`}>
              Sin registrar
            </p>
          </div>
        </div>

        {/* ===== FILTROS ===== */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'todos', label: '📋 Todos' },
            { key: 'activos', label: '✅ Activos' },
            { key: 'inactivos', label: '⏸️ No disponibles' },
            { key: 'sin_registrar', label: '➕ Sin registrar' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFiltro(f.key)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                filtro === f.key
                  ? 'bg-[#22d3ee] text-black border-[#22d3ee]'
                  : `${textoSecundario} ${temaOscuro ? 'border-gray-700 hover:border-[#22d3ee]' : 'border-gray-300 hover:border-[#22d3ee]'}`
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* ===== GRID DE AGENTES ===== */}
        {agentesFiltrados.length === 0 ? (
          <div className={`${bgTarjeta} p-10 rounded-2xl border text-center`}>
            <p className={`${textoSecundario} text-sm`}>
              No hay agentes que coincidan con el filtro "{filtro}".
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agentesFiltrados.map((agente) => {
              const equipo = equipoDeAgente(agente.id);
              const registrado = !!equipo;
              const activo = equipo?.disponible;

              return (
                <div
                  key={agente.id}
                  className={`${bgTarjeta} rounded-2xl border-2 p-5 transition-all ${hoverFila} ${
                    !registrado
                      ? 'border-dashed opacity-90'
                      : activo
                      ? 'border-emerald-500/30'
                      : 'border-gray-500/20'
                  }`}
                >
                  {/* Cabecera de tarjeta */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-sm font-black ${textoPrincipal} leading-tight`}>
                        {agente.nombre}
                      </h3>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {agente.tipo && (
                          <span
                            className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${getColorTipo(agente.tipo)}`}
                          >
                            {agente.tipo}
                          </span>
                        )}
                        {registrado && (
                          <span
                            className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              activo
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-gray-500/20 text-gray-400'
                            }`}
                          >
                            {activo ? '✅ Disponible' : '⏸️ No disponible'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Toggle disponible (solo si registrado) */}
                    {registrado && (
                      <button
                        onClick={() => handleToggle(equipo)}
                        disabled={guardando}
                        className={`relative w-12 h-6 rounded-full transition-all flex-shrink-0 ${
                          activo ? 'bg-emerald-500' : 'bg-gray-600'
                        } disabled:opacity-50`}
                        title={activo ? 'Marcar como no disponible' : 'Marcar como disponible'}
                      >
                        <span
                          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                            activo ? 'left-6' : 'left-0.5'
                          }`}
                        />
                      </button>
                    )}
                  </div>

                  {/* Descripción */}
                  <p className={`text-[11px] ${textoSecundario} leading-snug mb-4 min-h-[40px]`}>
                    {agente.descripcion || 'Sin descripción.'}
                  </p>

                  {/* ===== SI NO ESTÁ REGISTRADO: BOTÓN AGREGAR ===== */}
                  {!registrado ? (
                    <button
                      onClick={() => handleAgregar(agente)}
                      disabled={guardando || !perfil?.centro_id}
                      className="w-full py-2.5 bg-[#22d3ee]/20 text-[#22d3ee] font-black rounded-xl text-xs uppercase tracking-wider hover:bg-[#22d3ee] hover:text-black transition-all disabled:opacity-50"
                    >
                      ➕ Agregar al centro
                    </button>
                  ) : (
                    <>
                      {/* ===== CAMPOS EDITABLES ===== */}
                      <div className="space-y-2 mb-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className={`block text-[9px] font-bold uppercase tracking-wider ${textoSecundario} mb-0.5`}>
                              Cantidad
                            </label>
                            <input
                              type="number"
                              min="1"
                              defaultValue={equipo.cantidad}
                              onBlur={(e) => {
                                const val = parseInt(e.target.value) || 1;
                                if (val !== equipo.cantidad) {
                                  handleCampo(equipo, 'cantidad', val);
                                }
                              }}
                              className={`w-full px-2 py-1.5 rounded-lg border ${bgInput} text-xs outline-none focus:border-[#22d3ee]`}
                            />
                          </div>
                          <div>
                            <label className={`block text-[9px] font-bold uppercase tracking-wider ${textoSecundario} mb-0.5`}>
                              Marca
                            </label>
                            <input
                              type="text"
                              defaultValue={equipo.marca || ''}
                              placeholder="Ej: Chattanooga"
                              onBlur={(e) => {
                                if (e.target.value !== (equipo.marca || '')) {
                                  handleCampo(equipo, 'marca', e.target.value || null);
                                }
                              }}
                              className={`w-full px-2 py-1.5 rounded-lg border ${bgInput} text-xs outline-none focus:border-[#22d3ee]`}
                            />
                          </div>
                        </div>
                        <div>
                          <label className={`block text-[9px] font-bold uppercase tracking-wider ${textoSecundario} mb-0.5`}>
                            Modelo
                          </label>
                          <input
                            type="text"
                            defaultValue={equipo.modelo || ''}
                            placeholder="Ej: Intelect Mobile 2"
                            onBlur={(e) => {
                              if (e.target.value !== (equipo.modelo || '')) {
                                handleCampo(equipo, 'modelo', e.target.value || null);
                              }
                            }}
                            className={`w-full px-2 py-1.5 rounded-lg border ${bgInput} text-xs outline-none focus:border-[#22d3ee]`}
                          />
                        </div>
                        <div>
                          <label className={`block text-[9px] font-bold uppercase tracking-wider ${textoSecundario} mb-0.5`}>
                            Notas
                          </label>
                          <textarea
                            rows="2"
                            defaultValue={equipo.notas || ''}
                            placeholder="Ubicación física, estado, observaciones..."
                            onBlur={(e) => {
                              if (e.target.value !== (equipo.notas || '')) {
                                handleCampo(equipo, 'notas', e.target.value || null);
                              }
                            }}
                            className={`w-full px-2 py-1.5 rounded-lg border ${bgInput} text-xs outline-none focus:border-[#22d3ee] resize-none`}
                          />
                        </div>
                      </div>

                      {/* Botón eliminar */}
                      <button
                        onClick={() => handleEliminar(equipo)}
                        disabled={guardando}
                                                className="w-full py-1.5 bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 font-bold rounded-lg text-[10px] uppercase tracking-wider hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                      >
                        🗑️ Quitar del inventario
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ============================================================ */}
{/* ✨ EQUIPOS PERSONALIZADOS DEL CENTRO                        */}
{/* ============================================================ */}
<div className="mt-10">
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
    <div>
      <h2 className={`text-lg font-black ${textoPrincipal} flex items-center gap-2`}>
        ✨ Equipos personalizados
        {personalizados.length > 0 && (
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
            {personalizados.length}
          </span>
        )}
      </h2>
      <p className={`text-[11px] ${textoSecundario} mt-1`}>
        Equipos que no están en el catálogo oficial (ventosas, espirómetro, bandas, etc.)
      </p>
    </div>
    <button
      onClick={() => handleAbrirModalCustom(null)}
      disabled={guardando || !perfil?.centro_id}
            className="px-4 py-2 bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/40 font-black rounded-xl text-xs uppercase tracking-wider hover:bg-purple-500 hover:text-white hover:scale-105 transition-all disabled:opacity-50"
    >
      ➕ Agregar equipo personalizado
    </button>
  </div>

  {personalizados.length === 0 ? (
    <div
      className={`${bgTarjeta} p-8 rounded-2xl border-2 border-dashed ${
        temaOscuro ? 'border-purple-500/30' : 'border-purple-300'
      } text-center`}
    >
      <p className={`text-3xl mb-2`}>📦</p>
      <p className={`text-sm font-bold ${textoPrincipal} mb-1`}>
        Sin equipos personalizados
      </p>
      <p className={`text-xs ${textoSecundario} mb-4`}>
        Agrega equipos que tu centro tenga y no estén en el catálogo oficial.
      </p>
      <button
        onClick={() => handleAbrirModalCustom(null)}
        disabled={!perfil?.centro_id}
        className="px-4 py-2 bg-purple-600/20 text-purple-400 font-bold rounded-xl text-xs hover:bg-purple-600 hover:text-white transition-all disabled:opacity-50"
      >
        ➕ Crear el primero
      </button>
    </div>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {personalizados.map((eq) => (
        <div
          key={eq.id}
          className={`${bgTarjeta} rounded-2xl border-2 p-5 transition-all ${hoverFila} ${
            eq.disponible ? 'border-purple-500/30' : 'border-gray-500/20'
          }`}
        >
          {/* Cabecera */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className={`text-sm font-black ${textoPrincipal} leading-tight`}>
                {eq.agente_nombre}
              </h3>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border bg-purple-500/20 text-purple-400 border-purple-500/30">
                  ✨ Personalizado
                </span>
                {eq.tipo && (
                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${getColorTipo(eq.tipo)}`}>
                    {eq.tipo.replace('_', ' ')}
                  </span>
                )}
                <span
                  className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    eq.disponible
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}
                >
                  {eq.disponible ? '✅ Disponible' : '⏸️ No disponible'}
                </span>
              </div>
            </div>
            <button
              onClick={() => handleToggleCustom(eq)}
              disabled={guardando}
              className={`relative w-12 h-6 rounded-full transition-all flex-shrink-0 ${
                eq.disponible ? 'bg-emerald-500' : 'bg-gray-600'
              } disabled:opacity-50`}
              title={eq.disponible ? 'Desactivar' : 'Activar'}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                  eq.disponible ? 'left-6' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Descripción */}
          {eq.descripcion && (
            <p className={`text-[11px] ${textoSecundario} leading-snug mb-3 min-h-[40px]`}>
              {eq.descripcion}
            </p>
          )}

          {/* Info técnica compacta */}
          <div className="flex flex-wrap gap-2 mb-3 text-[10px]">
            {eq.cantidad && (
              <span className={`px-2 py-0.5 rounded-lg ${temaOscuro ? 'bg-black/30' : 'bg-gray-100'} ${textoSecundario}`}>
                📦 x{eq.cantidad}
              </span>
            )}
            {eq.marca && (
              <span className={`px-2 py-0.5 rounded-lg ${temaOscuro ? 'bg-black/30' : 'bg-gray-100'} ${textoSecundario}`}>
                🏷️ {eq.marca}
              </span>
            )}
            {eq.modelo && (
              <span className={`px-2 py-0.5 rounded-lg ${temaOscuro ? 'bg-black/30' : 'bg-gray-100'} ${textoSecundario}`}>
                🔖 {eq.modelo}
              </span>
            )}
          </div>

          {/* Indicaciones / Contraindicaciones */}
          {eq.indicaciones && (
            <div className={`mb-2 p-2 rounded-lg ${temaOscuro ? 'bg-emerald-500/5 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-200'}`}>
              <p className="text-[9px] font-bold uppercase text-emerald-400 mb-0.5">Indicaciones</p>
              <p className={`text-[10px] ${textoSecundario} leading-snug`}>{eq.indicaciones}</p>
            </div>
          )}
          {eq.contraindicaciones && (
            <div className={`mb-3 p-2 rounded-lg ${temaOscuro ? 'bg-red-500/5 border border-red-500/20' : 'bg-red-50 border border-red-200'}`}>
              <p className="text-[9px] font-bold uppercase text-red-400 mb-0.5">Contraindicaciones</p>
              <p className={`text-[10px] ${textoSecundario} leading-snug`}>{eq.contraindicaciones}</p>
            </div>
          )}

          {/* Notas */}
          {eq.notas && (
            <p className={`text-[10px] italic ${textoSecundario} mb-3`}>
              📝 {eq.notas}
            </p>
          )}

          {/* Acciones */}
          <div className="flex gap-2">
            <button
              onClick={() => handleAbrirModalCustom(eq)}
              disabled={guardando}
                            className="flex-1 py-1.5 bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border border-yellow-500/30 font-bold rounded-lg text-[10px] uppercase tracking-wider hover:bg-yellow-500 hover:text-white transition-all disabled:opacity-50"
            >
              ✏️ Editar
            </button>
            <button
              onClick={() => handleEliminarCustom(eq)}
              disabled={guardando}
                            className="flex-1 py-1.5 bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 font-bold rounded-lg text-[10px] uppercase tracking-wider hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
            >
              🗑️ Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  )}
</div>

        {/* ===== INFO EXTRA ===== */}
        <div className={`mt-8 p-4 rounded-2xl border ${temaOscuro ? 'border-purple-500/30 bg-purple-900/10' : 'border-purple-300 bg-purple-50'}`}>
          <p className={`text-xs ${textoPrincipal}`}>
            <strong>ℹ️ ¿Cómo afecta esto al plan de tratamiento?</strong>
          </p>
          <p className={`text-[11px] ${textoSecundario} mt-1`}>
            Los agentes que marques como <strong className="text-emerald-400">disponibles</strong> serán
            los únicos que la IA podrá sugerir al generar un plan de tratamiento para un paciente
            de este centro. Los que estén marcados como <strong className="text-gray-400">no disponibles</strong>{' '}
            o <strong className="text-purple-400">sin registrar</strong> serán ignorados automáticamente.
          </p>
        </div>

        {/* ===== BOTÓN VOLVER ===== */}
        <div className="mt-8">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-gray-600 text-white font-bold rounded-xl text-sm hover:bg-gray-700 transition-all"
          >
            ← Volver
          </button>
        </div>
      </div>

{/* ============================================================ */}
{/* MODAL: Equipo personalizado                                   */}
{/* ============================================================ */}
<EquipoCustomModal
  abierto={modalCustomAbierto}
  onCerrar={handleCerrarModalCustom}
  centroId={perfil?.centro_id || null}
  equipoEditando={customEditando}
  onGuardado={() => {
    recargarEquipos();
    mostrarToast(
      'exito',
      customEditando
        ? '✅ Equipo personalizado actualizado.'
        : '✨ Equipo personalizado agregado.'
    );
  }}
  temaOscuro={temaOscuro}
/>

      {/* ===== TOAST ===== */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-xl shadow-2xl text-sm font-bold border animate-fade-in max-w-[90vw] text-center ${
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