import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const HORARIOS = ['19:15 - 20:00', '20:00 - 20:45', '20:45 - 21:30', '21:30 - 22:15'];

// Cursos por día
const CURSOS = {
  Lunes: {
    nombre: 'Rehabilitación en Traumatología y Deporte',
    docente: 'TEJADA CUADROS Kevin Robinson',
    modalidadBase: 'PRESENCIAL', // siempre presencial
  },
  Martes: {
    nombre: 'Rehabilitación en Actividades Ocupacionales',
    docente: 'BASILIO BALTAZAR Gloria Alexandra',
    modalidadBase: 'PRESENCIAL / VIRTUAL',
  },
  Miércoles: {
    nombre: 'Rehabilitación en Neurología',
    docente: 'BRUNO PHOWELL Yasmin Del Rosario',
    modalidadBase: 'PRESENCIAL / VIRTUAL',
  },
  Jueves: {
    nombre: 'Rehabilitación en Reumatología',
    docente: 'BORJA ARENAS Cesar Alfredo',
    modalidadBase: 'PRESENCIAL',
  },
  Viernes: {
    nombre: 'Fundamento de la Investigación',
    docente: 'ALDAS JIMENEZ Delis Anita',
    modalidadBase: 'VIRTUAL',
  },
  Sábado: {
    nombre: 'Pensamiento Creativo para la Investigación',
    docente: 'BECERRA LUCANO Luis Alexander',
    modalidadBase: 'VIRTUAL',
  },
};

// Fechas especiales (presenciales) extraídas del PDF
const FECHAS_ESPECIALES = {
  'Rehabilitación en Reumatología': [
    '28/05/2026', '04/06/2026', '02/07/2026', '09/07/2026',
    '16/07/2026', '06/08/2026', '13/08/2026', '20/08/2026',
    '03/09/2026', '10/09/2026'
  ],
  'Rehabilitación en Neurología': [
    '03/06/2026', '24/06/2026', '01/07/2026', '15/07/2026',
    '22/07/2026', '05/08/2026', '12/08/2026', '02/09/2026'
  ],
  'Rehabilitación en Traumatología y Deporte': [
    '25/05/2026', '22/06/2026', '06/07/2026', '13/07/2026',
    '20/07/2026', '03/08/2026', '10/08/2026', '31/08/2026'
  ],
  'Rehabilitación en Actividades Ocupacionales': [
    '02/06/2026', '23/06/2026', '30/06/2026', '14/07/2026',
    '21/07/2026', '04/08/2026', '11/08/2026', '18/08/2026',
    '01/09/2026', '08/09/2026'
  ],
};

// Función para obtener la fecha de inicio de una semana (lunes)
const getFechaInicioSemana = (semana) => {
  // Fecha inicio: 04/05/2026
  const inicio = new Date(2026, 4, 4); // mes 4 = mayo (0-index)
  const dias = (semana - 1) * 7;
  return new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + dias);
};

// Formatear fecha como DD/MM/YYYY
const formatearFecha = (fecha) => {
  const d = fecha.getDate().toString().padStart(2, '0');
  const m = (fecha.getMonth() + 1).toString().padStart(2, '0');
  const y = fecha.getFullYear();
  return `${d}/${m}/${y}`;
};

export default function Horario({ temaOscuro }) {
  const [semana, setSemana] = useState(1);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [celdaSeleccionada, setCeldaSeleccionada] = useState(null);
  const [confirmaciones, setConfirmaciones] = useState({});

  // Obtener la semana actual basada en la fecha de hoy
  useEffect(() => {
    const hoy = new Date();
    const inicio = new Date(2026, 4, 4);
    const diffDias = Math.floor((hoy - inicio) / (1000 * 60 * 60 * 24));
    let semanaActual = Math.floor(diffDias / 7) + 1;
    if (semanaActual < 1) semanaActual = 1;
    if (semanaActual > 21) semanaActual = 21;
    setSemana(semanaActual);
  }, []);

  // Obtener la modalidad para un día y semana
  const getModalidad = (dia, semanaIdx) => {
    const curso = CURSOS[dia];
    if (!curso) return null;
    // Obtener la fecha del día en esa semana
    const fechaInicio = getFechaInicioSemana(semanaIdx);
    const idxDia = DIAS.indexOf(dia);
    const fechaDia = new Date(fechaInicio);
    fechaDia.setDate(fechaDia.getDate() + idxDia);
    const fechaStr = formatearFecha(fechaDia);
    // Verificar si esta fecha está en FECHAS_ESPECIALES para este curso
    const fechasCurso = FECHAS_ESPECIALES[curso.nombre] || [];
    if (fechasCurso.includes(fechaStr)) {
      return 'PRESENCIAL';
    }
    // Si no es especial, devolver la modalidad base
    return curso.modalidadBase;
  };

  const getFechaDia = (dia, semanaIdx) => {
    const fechaInicio = getFechaInicioSemana(semanaIdx);
    const idxDia = DIAS.indexOf(dia);
    const fechaDia = new Date(fechaInicio);
    fechaDia.setDate(fechaDia.getDate() + idxDia);
    return formatearFecha(fechaDia);
  };

  const handleCeldaClick = (dia, horaIdx) => {
    const curso = CURSOS[dia];
    if (!curso) return;
    const modalidad = getModalidad(dia, semana);
    const fecha = getFechaDia(dia, semana);
    const fechasEspeciales = FECHAS_ESPECIALES[curso.nombre] || [];
    setCeldaSeleccionada({
      dia,
      hora: HORARIOS[horaIdx],
      curso: curso.nombre,
      docente: curso.docente,
      modalidad,
      fecha,
      fechasEspeciales,
    });
    setModalAbierto(true);
  };

  const confirmarAsistencia = () => {
    if (!celdaSeleccionada) return;
    const key = `${celdaSeleccionada.dia}-${celdaSeleccionada.hora}-${semana}`;
    setConfirmaciones((prev) => ({
      ...prev,
      [key]: true,
    }));
    setModalAbierto(false);
  };

  const bgCard = temaOscuro ? 'bg-black/20 border-gray-800' : 'bg-white border-gray-200 shadow-sm';
  const textoColor = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const subTexto = temaOscuro ? 'text-gray-400' : 'text-gray-600';
  const bordeColor = temaOscuro ? 'border-gray-800' : 'border-gray-200';

  const getBadgeColor = (modalidad) => {
    if (modalidad === 'PRESENCIAL') return 'bg-green-600 text-white';
    if (modalidad === 'VIRTUAL') return 'bg-blue-600 text-white';
    if (modalidad === 'PRESENCIAL / VIRTUAL') return 'bg-yellow-600 text-white';
    return 'bg-gray-600 text-white';
  };

  const getModalidadIcon = (modalidad) => {
    if (modalidad === 'PRESENCIAL') return '🏫';
    if (modalidad === 'VIRTUAL') return '💻';
    if (modalidad === 'PRESENCIAL / VIRTUAL') return '🔄';
    return '❓';
  };

  // Ir a la semana actual
  const irAHoy = () => {
    const hoy = new Date();
    const inicio = new Date(2026, 4, 4);
    const diffDias = Math.floor((hoy - inicio) / (1000 * 60 * 60 * 24));
    let semanaActual = Math.floor(diffDias / 7) + 1;
    if (semanaActual < 1) semanaActual = 1;
    if (semanaActual > 21) semanaActual = 21;
    setSemana(semanaActual);
  };

  return (
    <main className="p-4 md:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className={`text-3xl font-black ${textoColor}`}>📅 Horario de Clases</h1>
          <p className={`text-xs ${subTexto} font-bold uppercase tracking-widest`}>
            Ciclo 2026-A • Instituto Carrión
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={irAHoy}
            className="px-4 py-2 bg-[#22d3ee] text-black font-bold rounded-xl hover:scale-105 transition-all text-sm"
          >
            📍 Hoy
          </button>
          <label className={`text-xs font-bold ${textoColor}`}>Semana:</label>
          <select
            value={semana}
            onChange={(e) => setSemana(Number(e.target.value))}
            className={`p-2 rounded-xl border ${bordeColor} bg-transparent ${textoColor} text-sm font-bold`}
          >
            {Array.from({ length: 21 }, (_, i) => i + 1).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={`${bgCard} rounded-3xl border overflow-hidden shadow-lg`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={`border-b ${bordeColor}`}>
                <th className={`p-3 text-left font-bold ${textoColor}`}>Hora</th>
                {DIAS.map((dia) => (
                  <th key={dia} className={`p-3 text-center font-bold ${textoColor}`}>
                    {dia}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HORARIOS.map((hora, idx) => (
                <tr key={idx} className={`border-b ${bordeColor}`}>
                  <td className={`p-3 font-bold ${textoColor} whitespace-nowrap`}>{hora}</td>
                  {DIAS.map((dia) => {
                    const curso = CURSOS[dia];
                    const modalidad = getModalidad(dia, semana);
                    const fecha = getFechaDia(dia, semana);
                    if (!curso) {
                      return (
                        <td key={dia} className="p-3 text-center text-gray-500">—</td>
                      );
                    }
                    const keyConfirm = `${dia}-${hora}-${semana}`;
                    const confirmado = confirmaciones[keyConfirm];
                    const esPresencial = modalidad === 'PRESENCIAL';
                    return (
                      <td
                        key={dia}
                        onClick={() => handleCeldaClick(dia, idx)}
                        className={`p-3 text-center cursor-pointer hover:bg-[#22d3ee]/10 transition-all relative group ${
                          esPresencial ? 'bg-green-500/20' : ''
                        }`}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span className={`text-xs font-bold ${textoColor}`}>
                            {curso.nombre.split(' en ')[1] || curso.nombre}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${getBadgeColor(modalidad)}`}>
                            {getModalidadIcon(modalidad)} {modalidad}
                          </span>
                          <span className={`text-[8px] ${subTexto}`}>{fecha}</span>
                          {confirmado && (
                            <span className="text-[8px] text-green-500 font-black">✔ Confirmado</span>
                          )}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/5 rounded-lg">
                            <span className="text-[10px] font-bold text-[#22d3ee]">👆 Ver detalle</span>
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalAbierto && celdaSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`relative w-full max-w-md rounded-2xl shadow-2xl p-6 ${temaOscuro ? 'bg-[#0a141d] border border-gray-800' : 'bg-white border border-gray-200'}`}>
            <button
              onClick={() => setModalAbierto(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors text-2xl"
            >
              &times;
            </button>
            <h3 className={`text-lg font-black ${textoColor} mb-2`}>
              {celdaSeleccionada.curso}
            </h3>
            <p className={`text-sm ${subTexto}`}>
              <span className="font-bold">Docente:</span> {celdaSeleccionada.docente}
            </p>
            <p className={`text-sm ${subTexto}`}>
              <span className="font-bold">Día:</span> {celdaSeleccionada.dia} • {celdaSeleccionada.hora}
            </p>
            <p className={`text-sm ${subTexto}`}>
              <span className="font-bold">Fecha:</span> {celdaSeleccionada.fecha}
            </p>
            <p className={`text-sm ${subTexto}`}>
              <span className="font-bold">Modalidad:</span>{' '}
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getBadgeColor(celdaSeleccionada.modalidad)}`}>
                {celdaSeleccionada.modalidad}
              </span>
            </p>
            {celdaSeleccionada.fechasEspeciales && celdaSeleccionada.fechasEspeciales.length > 0 && (
              <div className="mt-3">
                <p className={`text-xs font-bold ${textoColor}`}>📅 Fechas presenciales programadas:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {celdaSeleccionada.fechasEspeciales.map((fecha, idx) => (
                    <span
                      key={idx}
                      className={`text-[10px] px-2 py-0.5 rounded-full ${temaOscuro ? 'bg-gray-800' : 'bg-gray-100'} ${textoColor}`}
                    >
                      {fecha}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-6 flex gap-3">
              <button
                onClick={confirmarAsistencia}
                className="flex-1 py-2 bg-[#22d3ee] text-black font-bold rounded-xl hover:scale-105 transition-all"
              >
                ✅ Confirmar asistencia
              </button>
              <button
                onClick={() => setModalAbierto(false)}
                className="flex-1 py-2 bg-gray-600 text-white font-bold rounded-xl hover:bg-gray-700 transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}