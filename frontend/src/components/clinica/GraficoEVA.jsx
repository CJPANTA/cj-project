// ============================================================
// src/components/clinica/GraficoEVA.jsx
// Gráfico de evolución del dolor (EVA) por sesión
// ============================================================
import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { evolucionEVA } from '../../utils/sesiones';

// ============================================================
// TOOLTIP PERSONALIZADO
// ============================================================
function TooltipEVA({ active, payload, temaOscuro }) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload;
  const bg = temaOscuro ? '#0f1a24' : '#ffffff';
  const borde = temaOscuro ? '#22d3ee33' : '#22d3ee';
  const texto = temaOscuro ? '#fff' : '#0f172a';

  return (
    <div
      style={{
        backgroundColor: bg,
        border: `1px solid ${borde}`,
        borderRadius: '12px',
        padding: '10px 14px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
      }}
    >
      <p style={{ color: texto, fontSize: '11px', fontWeight: 900, marginBottom: '4px' }}>
        Sesión #{data.numero_sesion}
      </p>
      <p style={{ color: temaOscuro ? '#94a3b8' : '#64748b', fontSize: '9px', marginBottom: '8px' }}>
        {new Date(data.fecha).toLocaleDateString('es-ES', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })}
      </p>
      {data.eva_inicial != null && (
        <p style={{ color: '#f87171', fontSize: '11px', fontWeight: 700 }}>
          ● Antes: {data.eva_inicial}/10
        </p>
      )}
      {data.eva_final != null && (
        <p style={{ color: '#10b981', fontSize: '11px', fontWeight: 700 }}>
          ● Después: {data.eva_final}/10
        </p>
      )}
      {data.mejora != null && (
        <p style={{ color: data.mejora > 0 ? '#22d3ee' : '#94a3b8', fontSize: '10px', marginTop: '6px', fontWeight: 700 }}>
          {data.mejora > 0 ? `↓ Mejora: -${data.mejora} pts` : data.mejora < 0 ? `↑ Empeoró: +${Math.abs(data.mejora)} pts` : '= Sin cambio'}
        </p>
      )}
    </div>
  );
}

export default function GraficoEVA({ pacienteId, temaOscuro }) {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!pacienteId) return;
    const cargar = async () => {
      setLoading(true);
      try {
        const ev = await evolucionEVA(pacienteId);
        // Filtrar solo sesiones con al menos un EVA
        const conDatos = ev.filter((d) => d.eva_inicial != null || d.eva_final != null);
        setDatos(conDatos);
      } catch (err) {
        console.error('❌ Error cargando evolución EVA:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [pacienteId]);

  // ===== ESTILOS (colores por tema) =====
const colorGrid = temaOscuro ? '#1e293b' : '#e2e8f0';
const colorEje = temaOscuro ? '#64748b' : '#475569';
const colorRef = temaOscuro ? '#334155' : '#94a3b8';

// Colores de las líneas según tema
const colorInicial = temaOscuro ? '#f87171' : '#dc2626'; // red-400 vs red-600
const colorFinal = temaOscuro ? '#10b981' : '#059669';   // emerald-500 vs emerald-600
const colorDotBorde = temaOscuro ? '#0a141d' : '#ffffff'; // contorno del dot

  // ===== LOADING =====
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#22d3ee] border-t-transparent"></div>
      </div>
    );
  }

  // ===== SIN DATOS =====
  if (error) {
    return (
      <div className="text-center py-8 text-red-400 text-xs">
        Error al cargar el gráfico: {error}
      </div>
    );
  }

  if (datos.length === 0) {
    return (
      <div className="text-center py-10">
        <p className={`text-3xl mb-2`}>📈</p>
        <p className={`text-sm font-bold ${temaOscuro ? 'text-white' : 'text-[#0f172a]'}`}>
          Sin datos de evolución
        </p>
        <p className={`text-[11px] mt-1 ${temaOscuro ? 'text-gray-500' : 'text-gray-600'}`}>
          Registra sesiones con EVA inicial/final para ver la evolución
        </p>
      </div>
    );
  }

  // ===== GRÁFICO =====
  return (
    <div>
      <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
        <div>
          <h3 className={`text-xs font-black uppercase tracking-wider ${temaOscuro ? 'text-white' : 'text-[#0f172a]'}`}>
            📈 Evolución del dolor (EVA)
          </h3>
          <p className={`text-[10px] mt-0.5 ${temaOscuro ? 'text-gray-500' : 'text-gray-600'}`}>
            {datos.length} {datos.length === 1 ? 'sesión registrada' : 'sesiones registradas'}
          </p>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
  <span className={`flex items-center gap-1 font-bold ${temaOscuro ? 'text-red-400' : 'text-red-600'}`}>
    <span className={`w-3 h-0.5 ${temaOscuro ? 'bg-red-400' : 'bg-red-600'}`}></span> Antes
  </span>
  <span className={`flex items-center gap-1 font-bold ${temaOscuro ? 'text-emerald-400' : 'text-emerald-600'}`}>
    <span className={`w-3 h-0.5 ${temaOscuro ? 'bg-emerald-400' : 'bg-emerald-600'}`}></span> Después
  </span>
</div>
      </div>

      <div className="w-full" style={{ height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={datos}
            margin={{ top: 10, right: 20, left: -20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={colorGrid} />
            <XAxis
              dataKey="numero_sesion"
              stroke={colorEje}
              fontSize={10}
              tickFormatter={(v) => `#${v}`}
            />
            <YAxis
              domain={[0, 10]}
              stroke={colorEje}
              fontSize={10}
              ticks={[0, 2, 4, 6, 8, 10]}
            />
            <Tooltip content={<TooltipEVA temaOscuro={temaOscuro} />} />
            <ReferenceLine
  y={5}
  stroke={colorRef}
  strokeDasharray="3 3"
  label={{
    value: 'Dolor moderado',
    position: 'insideTopRight',
    fill: temaOscuro ? '#94a3b8' : '#64748b',
    fontSize: 9,
  }}
/>
            <Line
  type="monotone"
  dataKey="eva_inicial"
  stroke={colorInicial}
  strokeWidth={3}
  dot={{ r: 6, fill: colorInicial, strokeWidth: 2, stroke: colorDotBorde }}
  activeDot={{ r: 8, fill: colorInicial, stroke: colorDotBorde, strokeWidth: 2 }}
  name="Antes"
  connectNulls
/>
<Line
  type="monotone"
  dataKey="eva_final"
  stroke={colorFinal}
  strokeWidth={3}
  dot={{ r: 6, fill: colorFinal, strokeWidth: 2, stroke: colorDotBorde }}
  activeDot={{ r: 8, fill: colorFinal, stroke: colorDotBorde, strokeWidth: 2 }}
  name="Después"
  connectNulls
/>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}