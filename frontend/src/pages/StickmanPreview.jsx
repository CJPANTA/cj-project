// src/pages/StickmanPreview.jsx
import { useState, useEffect } from 'react';

// ============================================================
// FUNCIONES SVG (idénticas a generarInformePaciente.js)
// ============================================================
const NEGRO = '#334155';
const GRIS = '#94a3b8';

const svgBipedo = (variante) => {
  const brazos = variante === 'fin'
    ? `<line x1="50" y1="35" x2="28" y2="18" stroke="${NEGRO}" stroke-width="3.5" stroke-linecap="round"/>
       <line x1="50" y1="35" x2="72" y2="18" stroke="${NEGRO}" stroke-width="3.5" stroke-linecap="round"/>`
    : `<line x1="50" y1="35" x2="38" y2="52" stroke="${NEGRO}" stroke-width="3.5" stroke-linecap="round"/>
       <line x1="50" y1="35" x2="62" y2="52" stroke="${NEGRO}" stroke-width="3.5" stroke-linecap="round"/>`;
  return `
    <line x1="5" y1="92" x2="95" y2="92" stroke="${GRIS}" stroke-width="1.2" stroke-dasharray="3,3"/>
    <circle cx="50" cy="20" r="7" fill="${NEGRO}"/>
    <line x1="50" y1="27" x2="50" y2="60" stroke="${NEGRO}" stroke-width="4" stroke-linecap="round"/>
    ${brazos}
    <line x1="50" y1="60" x2="38" y2="90" stroke="${NEGRO}" stroke-width="4" stroke-linecap="round"/>
    <line x1="50" y1="60" x2="62" y2="90" stroke="${NEGRO}" stroke-width="4" stroke-linecap="round"/>
  `;
};

const svgSupino = (variante) => {
  const brazos = variante === 'fin'
    ? `<line x1="38" y1="78" x2="20" y2="65" stroke="${NEGRO}" stroke-width="3.5" stroke-linecap="round"/>
       <line x1="38" y1="80" x2="20" y2="80" stroke="${NEGRO}" stroke-width="3.5" stroke-linecap="round"/>`
    : `<line x1="38" y1="78" x2="20" y2="80" stroke="${NEGRO}" stroke-width="3.5" stroke-linecap="round"/>
       <line x1="38" y1="80" x2="20" y2="82" stroke="${NEGRO}" stroke-width="3.5" stroke-linecap="round"/>`;
  const piernas = variante === 'fin'
    ? `<line x1="60" y1="78" x2="88" y2="62" stroke="${NEGRO}" stroke-width="4" stroke-linecap="round"/>
       <line x1="62" y1="78" x2="88" y2="78" stroke="${NEGRO}" stroke-width="4" stroke-linecap="round"/>`
    : `<line x1="60" y1="78" x2="88" y2="78" stroke="${NEGRO}" stroke-width="4" stroke-linecap="round"/>
       <line x1="60" y1="78" x2="88" y2="80" stroke="${NEGRO}" stroke-width="4" stroke-linecap="round"/>`;
  return `
    <line x1="5" y1="88" x2="95" y2="88" stroke="${GRIS}" stroke-width="1.2" stroke-dasharray="3,3"/>
    <circle cx="18" cy="76" r="7" fill="${NEGRO}"/>
    <line x1="25" y1="78" x2="60" y2="78" stroke="${NEGRO}" stroke-width="4" stroke-linecap="round"/>
    ${brazos}
    ${piernas}
  `;
};

const svgProno = (variante) => {
  const brazos = variante === 'fin'
    ? `<line x1="40" y1="78" x2="15" y2="60" stroke="${NEGRO}" stroke-width="3.5" stroke-linecap="round"/>
       <line x1="40" y1="82" x2="15" y2="70" stroke="${NEGRO}" stroke-width="3.5" stroke-linecap="round"/>`
    : `<line x1="40" y1="78" x2="18" y2="80" stroke="${NEGRO}" stroke-width="3.5" stroke-linecap="round"/>
       <line x1="40" y1="82" x2="18" y2="84" stroke="${NEGRO}" stroke-width="3.5" stroke-linecap="round"/>`;
  const piernas = variante === 'fin'
    ? `<line x1="65" y1="78" x2="88" y2="60" stroke="${NEGRO}" stroke-width="4" stroke-linecap="round"/>
       <line x1="65" y1="82" x2="88" y2="70" stroke="${NEGRO}" stroke-width="4" stroke-linecap="round"/>`
    : `<line x1="65" y1="78" x2="88" y2="78" stroke="${NEGRO}" stroke-width="4" stroke-linecap="round"/>
       <line x1="65" y1="82" x2="88" y2="82" stroke="${NEGRO}" stroke-width="4" stroke-linecap="round"/>`;
  return `
    <line x1="5" y1="90" x2="95" y2="90" stroke="${GRIS}" stroke-width="1.2" stroke-dasharray="3,3"/>
    <circle cx="22" cy="80" r="7" fill="${NEGRO}"/>
    <line x1="29" y1="80" x2="65" y2="80" stroke="${NEGRO}" stroke-width="4" stroke-linecap="round"/>
    ${brazos}
    ${piernas}
  `;
};

const svgCuadrupedia = (variante) => {
  const brazoDer = variante === 'fin'
    ? `<line x1="45" y1="50" x2="78" y2="25" stroke="${NEGRO}" stroke-width="3.5" stroke-linecap="round"/>`
    : `<line x1="45" y1="50" x2="45" y2="88" stroke="${NEGRO}" stroke-width="3.5" stroke-linecap="round"/>`;
  const piernaIzq = variante === 'fin'
    ? `<line x1="65" y1="55" x2="88" y2="88" stroke="${NEGRO}" stroke-width="4" stroke-linecap="round"/>`
    : `<line x1="65" y1="55" x2="65" y2="88" stroke="${NEGRO}" stroke-width="4" stroke-linecap="round"/>`;
  return `
    <line x1="5" y1="90" x2="95" y2="90" stroke="${GRIS}" stroke-width="1.2" stroke-dasharray="3,3"/>
    <circle cx="35" cy="35" r="7" fill="${NEGRO}"/>
    <line x1="42" y1="42" x2="65" y2="55" stroke="${NEGRO}" stroke-width="4" stroke-linecap="round"/>
    <line x1="45" y1="46" x2="45" y2="88" stroke="${NEGRO}" stroke-width="3.5" stroke-linecap="round"/>
    ${brazoDer}
    ${piernaIzq}
    <line x1="72" y1="55" x2="78" y2="88" stroke="${NEGRO}" stroke-width="4" stroke-linecap="round"/>
  `;
};

const svgSedente = (variante) => {
  const brazos = variante === 'fin'
    ? `<line x1="55" y1="35" x2="38" y2="20" stroke="${NEGRO}" stroke-width="3.5" stroke-linecap="round"/>
       <line x1="55" y1="35" x2="72" y2="20" stroke="${NEGRO}" stroke-width="3.5" stroke-linecap="round"/>`
    : `<line x1="55" y1="35" x2="42" y2="48" stroke="${NEGRO}" stroke-width="3.5" stroke-linecap="round"/>
       <line x1="55" y1="35" x2="68" y2="48" stroke="${NEGRO}" stroke-width="3.5" stroke-linecap="round"/>`;
  return `
    <line x1="5" y1="92" x2="95" y2="92" stroke="${GRIS}" stroke-width="1.2" stroke-dasharray="3,3"/>
    <line x1="72" y1="52" x2="72" y2="92" stroke="#cbd5e1" stroke-width="2"/>
    <line x1="72" y1="68" x2="95" y2="68" stroke="#cbd5e1" stroke-width="2"/>
    <line x1="95" y1="68" x2="95" y2="92" stroke="#cbd5e1" stroke-width="2"/>
    <circle cx="55" cy="20" r="7" fill="${NEGRO}"/>
    <line x1="55" y1="27" x2="60" y2="52" stroke="${NEGRO}" stroke-width="4" stroke-linecap="round"/>
    ${brazos}
    <line x1="60" y1="52" x2="85" y2="60" stroke="${NEGRO}" stroke-width="4" stroke-linecap="round"/>
    <line x1="85" y1="60" x2="85" y2="90" stroke="${NEGRO}" stroke-width="4" stroke-linecap="round"/>
  `;
};

const svgPorPosicion = (posicion, variante) => {
  switch (posicion) {
    case 'supino': return svgSupino(variante);
    case 'prono': return svgProno(variante);
    case 'cuadrupedia': return svgCuadrupedia(variante);
    case 'sedente': return svgSedente(variante);
    case 'bipedo':
    default: return svgBipedo(variante);
  }
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function StickmanPreview({ temaOscuro }) {
  const [ejercicios, setEjercicios] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [estados, setEstados] = useState({});
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch('/src/data/catalogo_ejercicios.json')
      .then(res => res.json())
      .then(data => {
        setEjercicios(data);
        setCargando(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setCargando(false);
      });

    const stored = localStorage.getItem('stickman_estados');
    if (stored) {
      try { setEstados(JSON.parse(stored)); } catch (e) {}
    }
  }, []);

  const cambiarEstado = (id, nuevoEstado) => {
    const nuevos = { ...estados, [id]: nuevoEstado };
    setEstados(nuevos);
    localStorage.setItem('stickman_estados', JSON.stringify(nuevos));
  };

  const ejerciciosFiltrados = filtro === 'todos'
    ? ejercicios
    : ejercicios.filter(e => e.tipo === filtro);

  const bgPrincipal = temaOscuro ? 'bg-[#0a141d]' : 'bg-[#e2e8f0]';
  const textoPrincipal = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const bgTarjeta = temaOscuro ? 'bg-[#0a141d] border-gray-800' : 'bg-white border-gray-200';

  const stats = {
    aprobados: Object.values(estados).filter(v => v === 'aprobado').length,
    mejorar: Object.values(estados).filter(v => v === 'mejorar').length,
    sinRevisar: ejercicios.length - Object.keys(estados).length,
  };

  if (cargando) {
    return (
      <div className={`min-h-screen ${bgPrincipal} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#22d3ee] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgPrincipal} p-4 md:p-8`}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className={`text-3xl font-black tracking-tight ${textoPrincipal} mb-2`}>
            Entrenamiento de Stickman
          </h1>
          <p className="text-gray-400 text-sm">
            Revisa cada ejercicio y marca si está correcto o necesita mejora. Los cambios se guardan automáticamente.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className={`${bgTarjeta} p-4 rounded-xl border text-center`}>
            <div className="text-2xl font-black text-green-400">{stats.aprobados}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Aprobados</div>
          </div>
          <div className={`${bgTarjeta} p-4 rounded-xl border text-center`}>
            <div className="text-2xl font-black text-red-400">{stats.mejorar}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Por mejorar</div>
          </div>
          <div className={`${bgTarjeta} p-4 rounded-xl border text-center`}>
            <div className="text-2xl font-black text-gray-400">{stats.sinRevisar}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Sin revisar</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'todos', label: 'Todos' },
            { key: 'estiramiento', label: 'Estiramientos' },
            { key: 'fortalecimiento', label: 'Fortalecimiento' },
            { key: 'movilidad', label: 'Movilidad' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFiltro(f.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                filtro === f.key
                  ? 'bg-[#22d3ee] text-black'
                  : `${bgTarjeta} ${textoPrincipal} hover:border-[#22d3ee]/40`
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ejerciciosFiltrados.map((ej) => {
            const estado = estados[ej.id];
            return (
              <div
                key={ej.id}
                className={`${bgTarjeta} rounded-2xl border overflow-hidden transition-all ${
                  estado === 'aprobado' ? 'border-green-500/40' :
                  estado === 'mejorar' ? 'border-red-500/40' : ''
                }`}
              >
                <div className="p-3 border-b border-gray-700 bg-black/10">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h3 className={`text-sm font-bold ${textoPrincipal} leading-tight`}>
                      {ej.nombre}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                      ej.tipo === 'estiramiento' ? 'bg-blue-500/20 text-blue-400' :
                      ej.tipo === 'fortalecimiento' ? 'bg-red-500/20 text-red-400' :
                      ej.tipo === 'movilidad' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>{ej.tipo || 'general'}</span>
                    <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                      {ej.posicion || 'bipedo'}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-slate-100">
                  <div className="flex items-center justify-center gap-3">
                    <div className="text-center">
                      <div className="text-[9px] font-black text-gray-600 uppercase mb-1">Inicio</div>
                      <svg
                        viewBox="0 0 100 100"
                        width="90"
                        height="90"
                        xmlns="http://www.w3.org/2000/svg"
                        dangerouslySetInnerHTML={{ __html: svgPorPosicion(ej.posicion || 'bipedo', 'inicio') }}
                      />
                    </div>
                    <div className="text-2xl text-[#22d3ee] font-black">→</div>
                    <div className="text-center">
                      <div className="text-[9px] font-black text-gray-600 uppercase mb-1">Fin</div>
                      <svg
                        viewBox="0 0 100 100"
                        width="90"
                        height="90"
                        xmlns="http://www.w3.org/2000/svg"
                        dangerouslySetInnerHTML={{ __html: svgPorPosicion(ej.posicion || 'bipedo', 'fin') }}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3 text-xs text-gray-400 leading-tight">
                  {ej.descripcion_paciente?.substring(0, 100)}
                  {ej.descripcion_paciente?.length > 100 ? '...' : ''}
                </div>

                <div className="p-3 border-t border-gray-700 flex gap-2">
                  <button
                    onClick={() => cambiarEstado(ej.id, 'aprobado')}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${
                      estado === 'aprobado'
                        ? 'bg-green-500 text-white'
                        : 'bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white'
                    }`}
                  >
                    {estado === 'aprobado' ? '✓ Aprobado' : 'Aprobar'}
                  </button>
                  <button
                    onClick={() => cambiarEstado(ej.id, 'mejorar')}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${
                      estado === 'mejorar'
                        ? 'bg-red-500 text-white'
                        : 'bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white'
                    }`}
                  >
                    {estado === 'mejorar' ? '✗ Mejorar' : 'Mejorar'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {Object.keys(estados).length > 0 && (
          <div className="mt-8 text-center">
            <button
              onClick={() => {
                if (confirm('¿Limpiar todos los estados guardados?')) {
                  setEstados({});
                  localStorage.removeItem('stickman_estados');
                }
              }}
              className="px-6 py-2 bg-gray-700 text-gray-300 rounded-xl text-xs font-bold hover:bg-gray-600 transition-all"
            >
              Limpiar estados
            </button>
          </div>
        )}
      </div>
    </div>
  );
}