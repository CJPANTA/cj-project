// ============================================================
// src/pages/clinica/Agenda.jsx
// Página principal de Agenda con vistas día / semana
// ============================================================
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import {
  listarCitasPorRango,
  listarTerapeutasDelCentro,
  inicioDeSemana,
  finDeSemana,
  formatearHora,
} from '../../utils/citas';
import CalendarioSemanal from '../../components/clinica/CalendarioSemanal';
import NuevaCitaModal from '../../components/clinica/NuevaCitaModal';
import CitaDetalleModal from '../../components/clinica/CitaDetalleModal';
import SesionModal from '../../components/clinica/SesionModal';

export default function Agenda({ temaOscuro = true }) {
  // ===== USUARIO / CONTEXTO =====
  const [perfil, setPerfil] = useState(null);
  const [cargandoPerfil, setCargandoPerfil] = useState(true);

  // ===== FILTROS DE VISTA =====
  const [fechaReferencia, setFechaReferencia] = useState(new Date());
  const [vista, setVista] = useState('semana'); // 'semana' | 'dia'
  const [filtroTerapeuta, setFiltroTerapeuta] = useState('');
  const [terapeutas, setTerapeutas] = useState([]);

  // ===== DATOS =====
  const [citas, setCitas] = useState([]);
  const [cargandoCitas, setCargandoCitas] = useState(false);

  // ===== MODALES =====
  const [modalNuevaAbierto, setModalNuevaAbierto] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [sesionPaciente, setSesionPaciente] = useState(null);
  const [toast, setToast] = useState(null);

  // ===== CARGAR PERFIL =====
  useEffect(() => {
    const cargar = async () => {
      setCargandoPerfil(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
          .from('profiles')
          .select('id, rol, centro_id, nombre_completo')
          .eq('id', user.id)
          .single();
        setPerfil(data);
        if (data?.centro_id) {
          const lista = await listarTerapeutasDelCentro(data.centro_id);
          setTerapeutas(lista);
        } else if (data?.rol === 1) {
          // Director Global: todos los terapeutas
          const lista = await listarTerapeutasDelCentro(null);
          setTerapeutas(lista);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setCargandoPerfil(false);
      }
    };
    cargar();
  }, []);

  // ===== CARGAR CITAS =====
  const cargarCitas = useCallback(async () => {
    if (!perfil) return;
    setCargandoCitas(true);
    try {
      const desde = vista === 'semana' ? inicioDeSemana(fechaReferencia) : (() => {
        const d = new Date(fechaReferencia); d.setHours(0, 0, 0, 0); return d;
      })();
      const hasta = vista === 'semana' ? finDeSemana(fechaReferencia) : (() => {
        const d = new Date(fechaReferencia); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + 1); return d;
      })();

      const esDirectorGlobal = perfil.rol === 1;
      const data = await listarCitasPorRango({
        centroId: perfil.centro_id || null,
        terapeutaId: filtroTerapeuta || null,
        fechaInicio: desde.toISOString(),
        fechaFin: hasta.toISOString(),
        esDirectorGlobal,
      });
      setCitas(data);
    } catch (e) {
      console.error(e);
      setToast({ tipo: 'error', mensaje: 'Error cargando citas: ' + e.message });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setCargandoCitas(false);
    }
  }, [perfil, fechaReferencia, vista, filtroTerapeuta]);

  useEffect(() => {
    if (perfil) cargarCitas();
  }, [perfil, cargarCitas]);

  // ===== NAVEGACIÓN DE FECHAS =====
  const moverSemana = (delta) => {
    const d = new Date(fechaReferencia);
    d.setDate(d.getDate() + delta * 7);
    setFechaReferencia(d);
  };
  const moverDia = (delta) => {
    const d = new Date(fechaReferencia);
    d.setDate(d.getDate() + delta);
    setFechaReferencia(d);
  };

  const irHoy = () => setFechaReferencia(new Date());

  // ===== HANDLERS =====
  const handleCitaCreada = () => {
    setToast({ tipo: 'exito', mensaje: '✅ Cita agendada' });
    setTimeout(() => setToast(null), 3000);
    cargarCitas();
  };
  const handleCitaCambiada = async () => {
    setToast({ tipo: 'exito', mensaje: '✅ Cita actualizada' });
    setTimeout(() => setToast(null), 3000);
    cargarCitas();
    // Refrescar el detalle con datos actualizados
    if (citaSeleccionada) {
      setCitaSeleccionada(null);
    }
  };
  const handleAbrirSesion = (cita) => {
    setSesionPaciente(cita.paciente);
    setCitaSeleccionada(null);
  };

  // ===== ESTILOS =====
  const bgPrincipal = temaOscuro ? 'bg-[#0a141d]' : 'bg-[#e2e8f0]';
  const textoPri = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const textoSec = temaOscuro ? 'text-gray-400' : 'text-gray-600';
  const bgBtn = temaOscuro ? 'bg-black/30 hover:bg-black/50' : 'bg-white hover:bg-gray-100';
  const bordeBtn = temaOscuro ? 'border-gray-700' : 'border-gray-300';

  if (cargandoPerfil) {
    return (
      <div className={`min-h-screen ${bgPrincipal} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#22d3ee] border-t-transparent" />
      </div>
    );
  }

  // Roles sin acceso: mensaje
  const rolesPermitidos = [1, 3, 4, 7, 8];
  if (!perfil || !rolesPermitidos.includes(perfil.rol)) {
    return (
      <div className={`min-h-screen ${bgPrincipal} flex items-center justify-center p-6`}>
        <p className={`text-center text-sm ${textoSec}`}>
          No tienes permisos para ver la Agenda.
        </p>
      </div>
    );
  }

  const tituloFecha = vista === 'semana'
    ? (() => {
        const l = inicioDeSemana(fechaReferencia);
        const f = new Date(l);
        f.setDate(l.getDate() + 6);
        return `${l.getDate()} ${l.toLocaleDateString('es-ES', { month: 'short' })} — ${f.getDate()} ${f.toLocaleDateString('es-ES', { month: 'short' })}`;
      })()
    : fechaReferencia.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className={`min-h-screen ${bgPrincipal} p-4 md:p-6 transition-colors duration-500`}>
      <div className="max-w-[1600px] mx-auto">

        {/* ===== CABECERA ===== */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className={`text-3xl md:text-4xl font-black tracking-tight ${textoPri}`}>
              📅 Agenda
            </h1>
            <p className={`text-xs font-bold uppercase tracking-widest mt-1 ${textoSec}`}>
              {perfil.nombre_completo} · {perfil.rol === 1 ? 'Director Global' : 'Centro ' + (perfil.centro_id || '—')}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setModalNuevaAbierto(true)}
              className="px-5 py-2 bg-[#22d3ee] text-black font-black rounded-xl text-xs uppercase hover:scale-105 transition-all shadow-lg"
            >
              + Nueva cita
            </button>
          </div>
        </div>

        {/* ===== BARRA DE CONTROLES ===== */}
        <div className={`flex flex-wrap items-center gap-3 mb-4 p-3 rounded-2xl border ${bordeBtn} ${temaOscuro ? 'bg-black/20' : 'bg-white'}`}>
          {/* Vista */}
          <div className="flex rounded-xl overflow-hidden border ${bordeBtn}">
            <button
              onClick={() => setVista('semana')}
              className={`px-4 py-1.5 text-[10px] font-black uppercase ${vista === 'semana' ? 'bg-[#22d3ee] text-black' : `${textoSec} hover:bg-white/5`}`}
            >
              Semana
            </button>
            <button
              onClick={() => setVista('dia')}
              className={`px-4 py-1.5 text-[10px] font-black uppercase ${vista === 'dia' ? 'bg-[#22d3ee] text-black' : `${textoSec} hover:bg-white/5`}`}
            >
              Día
            </button>
          </div>

          {/* Nav fecha */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => (vista === 'semana' ? moverSemana(-1) : moverDia(-1))}
              className={`px-3 py-1.5 rounded-lg ${bgBtn} border ${bordeBtn} font-bold text-sm ${textoPri}`}
            >
              ←
            </button>
            <button
              onClick={irHoy}
              className={`px-3 py-1.5 rounded-lg ${bgBtn} border ${bordeBtn} font-black text-[10px] uppercase ${textoPri}`}
            >
              Hoy
            </button>
            <button
              onClick={() => (vista === 'semana' ? moverSemana(1) : moverDia(1))}
              className={`px-3 py-1.5 rounded-lg ${bgBtn} border ${bordeBtn} font-bold text-sm ${textoPri}`}
            >
              →
            </button>
          </div>

          {/* Título fecha */}
          <div className={`flex-1 min-w-[200px] text-center ${textoPri} font-black text-sm uppercase tracking-wider`}>
            {tituloFecha}
          </div>

          {/* Filtro terapeuta */}
          <select
            value={filtroTerapeuta}
            onChange={(e) => setFiltroTerapeuta(e.target.value)}
            className={`px-3 py-1.5 rounded-xl border ${bordeBtn} ${temaOscuro ? 'bg-black/30 text-white' : 'bg-white text-[#0f172a]'} text-xs font-bold outline-none focus:border-[#22d3ee] min-w-[200px]`}
          >
            <option value="">👥 Todos los terapeutas</option>
            {terapeutas.map((t) => (
              <option key={t.id} value={t.id}>{t.nombre_completo}</option>
            ))}
          </select>

          {/* Contador citas */}
          <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg ${temaOscuro ? 'bg-[#22d3ee]/10 text-[#22d3ee]' : 'bg-cyan-100 text-cyan-800'}`}>
            {citas.length} cita{citas.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* ===== CONTENIDO ===== */}
        {cargandoCitas ? (
          <div className={`${temaOscuro ? 'bg-[#0a141d]' : 'bg-white'} rounded-2xl border ${bordeBtn} p-12 flex justify-center`}>
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#22d3ee] border-t-transparent" />
          </div>
        ) : vista === 'semana' ? (
          <CalendarioSemanal
            citas={citas}
            fechaReferencia={fechaReferencia}
            onCitaClick={setCitaSeleccionada}
            temaOscuro={temaOscuro}
          />
        ) : (
          // Vista día: reutilizamos el calendario semanal con solo 1 día
          <CalendarioSemanal
            citas={citas}
            fechaReferencia={fechaReferencia}
            onCitaClick={setCitaSeleccionada}
            temaOscuro={temaOscuro}
            soloDia
          />
        )}

        {/* ===== LISTA RESUMEN DE CITAS DEL DÍA/SEMANA ===== */}
        {!cargandoCitas && citas.length > 0 && (
          <div className={`mt-6 rounded-2xl border ${bordeBtn} ${temaOscuro ? 'bg-[#0a141d]' : 'bg-white'} p-4`}>
            <h3 className={`text-xs font-black uppercase tracking-wider ${textoPri} mb-3`}>
              🗂️ Próximas citas
            </h3>
            <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
              {citas
                .filter((c) => new Date(c.fecha_hora) >= new Date())
                .slice(0, 10)
                .map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCitaSeleccionada(c)}
                    className={`w-full text-left p-3 rounded-xl border ${bordeBtn} hover:border-[#22d3ee]/50 transition-all flex justify-between items-center gap-2 flex-wrap`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-bold ${textoPri} truncate`}>
                        {c.paciente ? `${c.paciente.nombre} ${c.paciente.apellidos}` : 'Paciente'}
                      </p>
                      <p className={`text-[10px] ${textoSec}`}>
                        {new Date(c.fecha_hora).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} · {formatearHora(c.fecha_hora)} · {c.terapeuta?.nombre_completo || '—'}
                      </p>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      c.estado === 'asistida' ? 'bg-emerald-500/20 text-emerald-400' :
                      c.estado === 'confirmada' ? 'bg-blue-500/20 text-blue-400' :
                      c.estado === 'cancelada' ? 'bg-gray-500/20 text-gray-400' :
                      c.estado === 'no_asistio' ? 'bg-red-500/20 text-red-400' :
                      'bg-cyan-500/20 text-cyan-400'
                    }`}>
                      {c.estado.replace('_', ' ')}
                    </span>
                  </button>
                ))}
            </div>
          </div>
        )}

      </div>

      {/* ===== MODALES ===== */}
      <NuevaCitaModal
        abierto={modalNuevaAbierto}
        onCerrar={() => setModalNuevaAbierto(false)}
        onCreada={handleCitaCreada}
        centroId={perfil?.centro_id || null}
        esDirectorGlobal={perfil?.rol === 1}
        fechaInicial={fechaReferencia}
        temaOscuro={temaOscuro}
      />

      {citaSeleccionada && (
        <CitaDetalleModal
          cita={citaSeleccionada}
          onCerrar={() => setCitaSeleccionada(null)}
          onCambio={handleCitaCambiada}
          onAbrirSesion={handleAbrirSesion}
          temaOscuro={temaOscuro}
        />
      )}

      {sesionPaciente && (
        <SesionModal
          abierto={!!sesionPaciente}
          onCerrar={() => setSesionPaciente(null)}
          paciente={sesionPaciente}
          centroId={perfil?.centro_id || sesionPaciente?.centro_id || null}
          evaluacionAprobada={null}
          onGuardada={() => {
            setToast({ tipo: 'exito', mensaje: '✅ Sesión guardada' });
            setTimeout(() => setToast(null), 3000);
            cargarCitas();
          }}
          temaOscuro={temaOscuro}
        />
      )}

      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] px-6 py-3 rounded-xl shadow-2xl text-sm font-bold border animate-fade-in max-w-[90vw] text-center ${
            toast.tipo === 'exito'
              ? 'bg-green-500/20 text-green-300 border-green-500/40 backdrop-blur-md'
              : 'bg-red-500/20 text-red-300 border-red-500/40 backdrop-blur-md'
          }`}
        >
          {toast.mensaje}
        </div>
      )}
    </div>
  );
}