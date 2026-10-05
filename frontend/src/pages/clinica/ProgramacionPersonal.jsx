// ============================================================
// src/pages/clinica/ProgramacionPersonal.jsx
// Página del Cuadrante de Personal (turnos semanales)
// ============================================================
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { obtenerCuadranteSemanal, inicioDeSemana } from '../../utils/horarios';
import { PROFESIONES } from '../../utils/profesiones';
import CuadranteSemanal from '../../components/clinica/CuadranteSemanal';
import TurnoModal from '../../components/clinica/TurnoModal';

export default function ProgramacionPersonal({ temaOscuro = true }) {
  const [perfil, setPerfil] = useState(null);
  const [cargandoPerfil, setCargandoPerfil] = useState(true);
  const [cargando, setCargando] = useState(false);

  const [fechaReferencia, setFechaReferencia] = useState(new Date());
  const [filtroProfesion, setFiltroProfesion] = useState('');
  const [filtroArea, setFiltroArea] = useState('todos');

  const [terapeutas, setTerapeutas] = useState([]);
  const [cuadrante, setCuadrante] = useState({});

  const [modalTurnoAbierto, setModalTurnoAbierto] = useState(false);
  const [terapeutaSeleccionado, setTerapeutaSeleccionado] = useState(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const [turnoEditar, setTurnoEditar] = useState(null);
  const [toast, setToast] = useState(null);

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
      } catch (e) {
        console.error(e);
      } finally {
        setCargandoPerfil(false);
      }
    };
    cargar();
  }, []);

  const cargarTerapeutas = useCallback(async () => {
    if (!perfil?.centro_id) return;
    let query = supabase
      .from('profiles')
      .select('id, nombre_completo, profesion, rol, centro_id')
      .order('nombre_completo');

    if (perfil.rol !== 1) {
      query = query.eq('centro_id', perfil.centro_id);
    }

    const { data, error } = await query;
    if (error) {
      console.error(error);
      return;
    }
    const filtrados = (data || []).filter((t) => ![5, 6].includes(t.rol));
    setTerapeutas(filtrados);
  }, [perfil]);

  useEffect(() => {
    if (perfil) cargarTerapeutas();
  }, [perfil, cargarTerapeutas]);

  const cargarCuadrante = useCallback(async () => {
    if (!perfil?.centro_id) return;
    setCargando(true);
    try {
      const data = await obtenerCuadranteSemanal({
        centroId: perfil.centro_id,
        fechaReferencia,
      });
      setCuadrante(data);
    } catch (e) {
      console.error(e);
    } finally {
      setCargando(false);
    }
  }, [perfil, fechaReferencia]);

  useEffect(() => {
    if (perfil) cargarCuadrante();
  }, [perfil, cargarCuadrante]);

  const terapeutasFiltrados = terapeutas.filter((t) => {
    if (filtroProfesion && t.profesion !== filtroProfesion) return false;
    if (filtroArea !== 'todos') {
      const prof = PROFESIONES.find((p) => p.id === t.profesion);
      if (prof?.area !== filtroArea) return false;
    }
    return true;
  });

  const moverSemana = (delta) => {
    const d = new Date(fechaReferencia);
    d.setDate(d.getDate() + delta * 7);
    setFechaReferencia(d);
  };

  const irHoy = () => setFechaReferencia(new Date());

  const handleHuecoClick = (terapeuta, fecha) => {
    setTerapeutaSeleccionado(terapeuta);
    setFechaSeleccionada(fecha);
    setTurnoEditar(null);
    setModalTurnoAbierto(true);
  };

  const handleTurnoClick = (turno, terapeuta) => {
    setTerapeutaSeleccionado(terapeuta);
    setFechaSeleccionada(new Date(turno.fecha || fechaReferencia));
    setTurnoEditar(turno);
    setModalTurnoAbierto(true);
  };

  const handleGuardado = () => {
    setToast({ tipo: 'exito', mensaje: 'Turno guardado' });
    setTimeout(() => setToast(null), 3000);
    cargarCuadrante();
  };

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

  const rolesPermitidos = [1, 3, 4, 7, 8];
  if (!perfil || !rolesPermitidos.includes(perfil.rol)) {
    return (
      <div className={`min-h-screen ${bgPrincipal} flex items-center justify-center p-6`}>
        <p className={`text-center text-sm ${textoSec}`}>
          No tienes permisos para ver la Programación de Personal.
        </p>
      </div>
    );
  }

  const puedeEditar = perfil.rol === 1 || perfil.rol === 7;

  const lunes = inicioDeSemana(fechaReferencia);
  const domingo = new Date(lunes);
  domingo.setDate(lunes.getDate() + 6);
  const tituloSemana = lunes.getDate() + ' ' + lunes.toLocaleDateString('es-ES', { month: 'short' }) + ' — ' + domingo.getDate() + ' ' + domingo.toLocaleDateString('es-ES', { month: 'short' });

  return (
    <div className={`min-h-screen ${bgPrincipal} p-4 md:p-6 transition-colors duration-500`}>
      <div className="max-w-[1600px] mx-auto">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className={`text-3xl md:text-4xl font-black tracking-tight ${textoPri}`}>
              Programación de Personal
            </h1>
            <p className={`text-xs font-bold uppercase tracking-widest mt-1 ${textoSec}`}>
              {perfil.nombre_completo} · Centro {perfil.centro_id || '—'}
              {!puedeEditar && ' · Solo lectura'}
            </p>
          </div>
        </div>

        <div className={`flex flex-wrap items-center gap-3 mb-4 p-3 rounded-2xl border ${bordeBtn} ${temaOscuro ? 'bg-black/20' : 'bg-white'}`}>
          <div className="flex items-center gap-1">
            <button onClick={() => moverSemana(-1)} className={`px-3 py-1.5 rounded-lg ${bgBtn} border ${bordeBtn} font-bold text-sm ${textoPri}`}>
              ←
            </button>
            <button onClick={irHoy} className={`px-3 py-1.5 rounded-lg ${bgBtn} border ${bordeBtn} font-black text-[10px] uppercase ${textoPri}`}>
              Hoy
            </button>
            <button onClick={() => moverSemana(1)} className={`px-3 py-1.5 rounded-lg ${bgBtn} border ${bordeBtn} font-bold text-sm ${textoPri}`}>
              →
            </button>
          </div>

          <div className={`flex-1 min-w-[200px] text-center ${textoPri} font-black text-sm uppercase tracking-wider`}>
            {tituloSemana}
          </div>

          <select
            value={filtroArea}
            onChange={(e) => setFiltroArea(e.target.value)}
            className={`px-3 py-1.5 rounded-xl border ${bordeBtn} ${temaOscuro ? 'bg-black/30 text-white' : 'bg-white text-[#0f172a]'} text-xs font-bold outline-none focus:border-[#22d3ee]`}
          >
            <option value="todos">Todas las áreas</option>
            <option value="clinica">Área clínica</option>
            <option value="admin">Administrativo</option>
            <option value="soporte">Soporte</option>
          </select>

          <select
            value={filtroProfesion}
            onChange={(e) => setFiltroProfesion(e.target.value)}
            className={`px-3 py-1.5 rounded-xl border ${bordeBtn} ${temaOscuro ? 'bg-black/30 text-white' : 'bg-white text-[#0f172a]'} text-xs font-bold outline-none focus:border-[#22d3ee] min-w-[180px]`}
          >
            <option value="">Todas las profesiones</option>
            {PROFESIONES.map((p) => (
              <option key={p.id} value={p.id}>{p.emoji} {p.label}</option>
            ))}
          </select>

          <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg ${temaOscuro ? 'bg-[#22d3ee]/10 text-[#22d3ee]' : 'bg-cyan-100 text-cyan-800'}`}>
            {terapeutasFiltrados.length} persona{terapeutasFiltrados.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className={`flex flex-wrap gap-2 mb-4 text-[10px] font-bold ${textoSec}`}>
          <span className="px-2 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">Mañana</span>
          <span className="px-2 py-1 rounded-lg bg-orange-500/20 text-orange-300 border border-orange-500/30">Tarde</span>
          <span className="px-2 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Noche</span>
          <span className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Partido</span>
          <span className="px-2 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">Personalizado</span>
        </div>

        {cargando ? (
          <div className={`${temaOscuro ? 'bg-[#0a141d]' : 'bg-white'} rounded-2xl border ${bordeBtn} p-12 flex justify-center`}>
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#22d3ee] border-t-transparent" />
          </div>
        ) : (
          <CuadranteSemanal
            terapeutas={terapeutasFiltrados}
            cuadrante={cuadrante}
            fechaReferencia={fechaReferencia}
            onTurnoClick={handleTurnoClick}
            onHuecoClick={handleHuecoClick}
            puedeEditar={puedeEditar}
            temaOscuro={temaOscuro}
          />
        )}

        {puedeEditar && (
          <p className={`mt-4 text-[10px] ${textoSec} text-center`}>
            Click en una celda vacía para añadir turno. Click en un turno para editarlo.
          </p>
        )}

      </div>

      {terapeutaSeleccionado && (
        <TurnoModal
          abierto={modalTurnoAbierto}
          onCerrar={() => {
            setModalTurnoAbierto(false);
            setTurnoEditar(null);
          }}
          onGuardado={handleGuardado}
          centroId={perfil?.centro_id || null}
          terapeuta={terapeutaSeleccionado}
          fechaInicial={fechaSeleccionada}
          turnoExistente={turnoEditar}
          temaOscuro={temaOscuro}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] px-6 py-3 rounded-xl shadow-2xl text-sm font-bold border bg-green-500/20 text-green-300 border-green-500/40 backdrop-blur-md">
          {toast.mensaje}
        </div>
      )}
    </div>
  );
}