// ============================================================
// src/components/clinica/DashboardGerencial.jsx
// Panel de gráficos y KPIs gerenciales
// ============================================================
import { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { supabase } from '../../lib/supabaseClient';
import KpiCard from './KpiCard';
import {
  cargarKPIs,
  cargarSesionesPorMes,
  cargarTopPatologias,
  cargarSesionesRecientes,
  cargarPacientesInactivos,
  cargarComparativaCentros,
} from '../../utils/dashboard';

// ============================================================
// COLORES POR POSICIÓN (JIT-safe)
// ============================================================
const COLORES_BARRAS = [
  '#22d3ee', // cyan
  '#a855f7', // purple
  '#10b981', // emerald
  '#fbbf24', // amber
  '#ef4444', // red
];

// ============================================================
// TOOLTIP PERSONALIZADO
// ============================================================
function TooltipCustom({ active, payload, label, temaOscuro }) {
  if (!active || !payload?.length) return null;
  const bg = temaOscuro ? '#0f1a24' : '#ffffff';
  const borde = temaOscuro ? '#22d3ee33' : '#22d3ee55';
  const texto = temaOscuro ? '#fff' : '#0f172a';

  return (
    <div
      style={{
        backgroundColor: bg,
        border: `1px solid ${borde}`,
        borderRadius: '12px',
        padding: '8px 12px',
      }}
    >
      <p style={{ color: texto, fontSize: '10px', fontWeight: 900, marginBottom: '4px' }}>
        {label}
      </p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || texto, fontSize: '11px', fontWeight: 700 }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function DashboardGerencial({ centroId, temaOscuro, esDirectorGlobal }) {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState(null);
  const [sesionesMes, setSesionesMes] = useState([]);
  const [topPatologias, setTopPatologias] = useState([]);
  const [sesionesRecientes, setSesionesRecientes] = useState([]);
  const [inactivos, setInactivos] = useState([]);
  const [comparativa, setComparativa] = useState([]);

  // ===== ESTILOS =====
  const bgTarjeta = temaOscuro
    ? 'bg-[#0a141d] border-gray-800'
    : 'bg-white border-gray-200 shadow-sm';
  const textoPrincipal = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const textoSecundario = temaOscuro ? 'text-gray-400' : 'text-gray-600';
  const textoTerciario = temaOscuro ? 'text-gray-500' : 'text-gray-500';
  const colorGrid = temaOscuro ? '#1e293b' : '#e2e8f0';
  const colorEje = temaOscuro ? '#64748b' : '#475569';

  useEffect(() => {
    cargarTodo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centroId, esDirectorGlobal]);

  const cargarTodo = async () => {
    setLoading(true);
    try {
      const filtros = { centroId: esDirectorGlobal ? null : centroId };

      const [k, ses, pat, rec, inact, comp] = await Promise.all([
        cargarKPIs(filtros),
        cargarSesionesPorMes({ ...filtros, meses: 6 }),
        cargarTopPatologias({ ...filtros, limit: 5 }),
        cargarSesionesRecientes({ ...filtros, limit: 5 }),
        cargarPacientesInactivos({ ...filtros, diasSinSesion: 30 }),
        esDirectorGlobal ? cargarComparativaCentros() : Promise.resolve([]),
      ]);

      setKpis(k);
      setSesionesMes(ses);
      setTopPatologias(pat);
      setSesionesRecientes(rec);
      setInactivos(inact.slice(0, 5));
      setComparativa(comp);
    } catch (err) {
      console.error('❌ Error cargando dashboard gerencial:', err);
    } finally {
      setLoading(false);
    }
  };

  // ===== LOADING =====
  if (loading) {
    return (
      <div className={`${bgTarjeta} border rounded-3xl p-8 flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#22d3ee] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ===== FILA 1: KPIs ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard
          icono="👥"
          label="Pacientes"
          valor={kpis?.totalPacientes ?? 0}
          sublabel="Total en el sistema"
          color="cyan"
          temaOscuro={temaOscuro}
        />
        <KpiCard
          icono="📅"
          label="Sesiones del mes"
          valor={kpis?.sesionesMes ?? 0}
          sublabel="Mes actual"
          color="purple"
          temaOscuro={temaOscuro}
        />
        <KpiCard
          icono="📈"
          label="Mejora EVA"
          valor={
            kpis?.mejoraPromedio != null
              ? `${kpis.mejoraPromedio > 0 ? '-' : '+'}${Math.abs(kpis.mejoraPromedio)}`
              : '—'
          }
          sublabel={
            kpis?.evaPromedioInicial != null
              ? `${kpis.evaPromedioInicial} → ${kpis.evaPromedioFinal}`
              : 'Sin datos'
          }
          color={
            kpis?.mejoraPromedio > 0
              ? 'emerald'
              : kpis?.mejoraPromedio < 0
              ? 'red'
              : 'gray'
          }
          temaOscuro={temaOscuro}
        />
        <KpiCard
          icono="🔥"
          label="Activos (30 días)"
          valor={kpis?.pacientesActivos ?? 0}
          sublabel="Con sesiones recientes"
          color="amber"
          temaOscuro={temaOscuro}
        />
      </div>

      {/* ===== FILA 2: Gráficos lado a lado ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Evolución mensual */}
        <div className={`${bgTarjeta} border rounded-2xl p-5`}>
          <h3 className={`text-xs font-black uppercase tracking-wider ${textoPrincipal} mb-1`}>
            📈 Sesiones por mes
          </h3>
          <p className={`text-[10px] ${textoTerciario} mb-3`}>Últimos 6 meses</p>
          {sesionesMes.some((s) => s.sesiones > 0) ? (
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sesionesMes} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colorGrid} />
                  <XAxis dataKey="mes" stroke={colorEje} fontSize={10} />
                  <YAxis stroke={colorEje} fontSize={10} allowDecimals={false} />
                  <Tooltip content={<TooltipCustom temaOscuro={temaOscuro} />} />
                  <Line
                    type="monotone"
                    dataKey="sesiones"
                    stroke="#22d3ee"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#22d3ee' }}
                    activeDot={{ r: 7 }}
                    name="Sesiones"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-2xl mb-1">📊</p>
              <p className={`text-xs ${textoSecundario}`}>Sin sesiones en este período</p>
            </div>
          )}
        </div>

        {/* Top patologías */}
        <div className={`${bgTarjeta} border rounded-2xl p-5`}>
          <h3 className={`text-xs font-black uppercase tracking-wider ${textoPrincipal} mb-1`}>
            🥇 Top patologías
          </h3>
          <p className={`text-[10px] ${textoTerciario} mb-3`}>Diagnósticos más frecuentes</p>
          {topPatologias.length > 0 ? (
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topPatologias}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={colorGrid} horizontal={false} />
                  <XAxis type="number" stroke={colorEje} fontSize={10} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="nombre"
                    stroke={colorEje}
                    fontSize={9}
                    width={110}
                    tickFormatter={(v) => (v?.length > 18 ? v.slice(0, 18) + '…' : v)}
                  />
                  <Tooltip content={<TooltipCustom temaOscuro={temaOscuro} />} />
                  <Bar dataKey="cantidad" name="Pacientes" radius={[0, 8, 8, 0]}>
                    {topPatologias.map((_, i) => (
                      <Cell key={i} fill={COLORES_BARRAS[i % COLORES_BARRAS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-2xl mb-1">🎯</p>
              <p className={`text-xs ${textoSecundario}`}>Sin diagnósticos registrados</p>
            </div>
          )}
        </div>

      </div>

      {/* ===== FILA 3: Comparativa centros (solo Director Global) ===== */}
      {esDirectorGlobal && comparativa.length > 0 && (
        <div className={`${bgTarjeta} border rounded-2xl p-5`}>
          <h3 className={`text-xs font-black uppercase tracking-wider ${textoPrincipal} mb-1`}>
            🏥 Comparativa entre centros
          </h3>
          <p className={`text-[10px] ${textoTerciario} mb-3`}>
            {comparativa.length} centros en el ecosistema
          </p>
          <div className="space-y-3">
            {comparativa.map((c) => {
              const maxPac = Math.max(...comparativa.map((x) => x.pacientes), 1);
              const pct = Math.round((c.pacientes / maxPac) * 100);
              return (
                <div key={c.centro}>
                  <div className="flex justify-between items-center mb-1 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-[#22d3ee] font-mono">
                        {c.centro}
                      </span>
                      <span className={`text-[10px] ${textoSecundario} truncate max-w-[200px]`}>
                        {c.nombre}
                      </span>
                    </div>
                    <div className="flex gap-3 text-[10px]">
                      <span className={`font-bold ${textoPrincipal}`}>
                        👥 {c.pacientes}
                      </span>
                      <span className={`font-bold ${textoPrincipal}`}>
                        📅 {c.sesiones}
                      </span>
                    </div>
                  </div>
                  <div className={`h-1.5 rounded-full ${temaOscuro ? 'bg-gray-800' : 'bg-gray-200'} overflow-hidden`}>
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#22d3ee] to-emerald-500 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== FILA 4: Sesiones recientes + Inactivos ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Sesiones recientes */}
        <div className={`${bgTarjeta} border rounded-2xl p-5`}>
          <h3 className={`text-xs font-black uppercase tracking-wider ${textoPrincipal} mb-3`}>
            🕐 Últimas sesiones
          </h3>
          {sesionesRecientes.length === 0 ? (
            <p className={`text-xs ${textoSecundario} text-center py-4`}>
              Sin sesiones registradas
            </p>
          ) : (
            <div className="space-y-2">
              {sesionesRecientes.map((s) => {
                const mejora =
                  s.eva_inicial != null && s.eva_final != null
                    ? s.eva_inicial - s.eva_final
                    : null;
                return (
                  <div
                    key={s.id}
                    className={`p-3 rounded-xl border ${temaOscuro ? 'border-gray-800 bg-black/20' : 'border-gray-200 bg-gray-50'} flex justify-between items-center gap-2 flex-wrap`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-bold ${textoPrincipal} truncate`}>
                        {s.paciente?.nombre} {s.paciente?.apellidos}
                      </p>
                      <p className={`text-[10px] ${textoTerciario}`}>
                        Sesión #{s.numero_sesion} ·{' '}
                        {new Date(s.fecha_sesion).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                        })}
                        {s.terapeuta?.nombre_completo && ` · ${s.terapeuta.nombre_completo}`}
                      </p>
                    </div>
                    {mejora != null && (
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full flex-shrink-0 ${
                          mejora > 0
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : mejora < 0
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        EVA {s.eva_inicial}→{s.eva_final}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pacientes inactivos */}
        <div className={`${bgTarjeta} border rounded-2xl p-5`}>
          <h3 className={`text-xs font-black uppercase tracking-wider ${textoPrincipal} mb-3`}>
            ⚠️ Pacientes sin sesión reciente
          </h3>
          {inactivos.length === 0 ? (
            <p className={`text-xs ${textoSecundario} text-center py-4`}>
              ✅ Todos los pacientes tienen actividad reciente
            </p>
          ) : (
            <div className="space-y-2">
              {inactivos.map((p) => (
                <div
                  key={p.id}
                  className={`p-3 rounded-xl border ${temaOscuro ? 'border-yellow-500/20 bg-yellow-500/5' : 'border-yellow-200 bg-yellow-50'} flex justify-between items-center gap-2 flex-wrap`}
                >
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-bold ${textoPrincipal} truncate`}>
                      {p.nombre} {p.apellidos}
                    </p>
                    <p className={`text-[10px] ${textoTerciario} truncate`}>
                      {p.diagnostico || 'Sin diagnóstico'}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-yellow-400 flex-shrink-0">
                    {p.dias_sin_sesion != null
                      ? `${p.dias_sin_sesion} días`
                      : 'Sin sesiones'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}