// ============================================================
// src/components/clinica/KpiCard.jsx
// Tarjeta KPI reutilizable
// ============================================================

// ============================================================
// PALETA FIJA (JIT-safe)
// ============================================================
const PALETA = {
  cyan: {
    iconoBg: 'bg-[#22d3ee]/20',
    valor: 'text-[#22d3ee]',
    hover: 'hover:border-[#22d3ee]/40',
  },
  emerald: {
    iconoBg: 'bg-emerald-500/20',
    valor: 'text-emerald-400',
    hover: 'hover:border-emerald-500/40',
  },
  purple: {
    iconoBg: 'bg-purple-500/20',
    valor: 'text-purple-400',
    hover: 'hover:border-purple-500/40',
  },
  amber: {
    iconoBg: 'bg-amber-500/20',
    valor: 'text-amber-400',
    hover: 'hover:border-amber-500/40',
  },
  red: {
    iconoBg: 'bg-red-500/20',
    valor: 'text-red-400',
    hover: 'hover:border-red-500/40',
  },
  blue: {
    iconoBg: 'bg-blue-500/20',
    valor: 'text-blue-400',
    hover: 'hover:border-blue-500/40',
  },
  gray: {
    iconoBg: 'bg-gray-500/20',
    valor: 'text-gray-400',
    hover: 'hover:border-gray-500/40',
  },
};

export default function KpiCard({
  icono = '📊',
  label = 'Métrica',
  valor = '—',
  sublabel = null,
  color = 'cyan',
  temaOscuro = true,
  tendencia = null, // { valor: 12, mejorEsMayor: true }
}) {
  const c = PALETA[color] || PALETA.cyan;

  const bgTarjeta = temaOscuro
    ? 'bg-[#0a141d] border-gray-800'
    : 'bg-white border-gray-200 shadow-sm';
  const textoPrincipal = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const textoSecundario = temaOscuro ? 'text-gray-500' : 'text-gray-600';

  return (
    <div
      className={`${bgTarjeta} ${c.hover} border rounded-2xl p-4 transition-all flex items-center gap-4`}
    >
      {/* Icono */}
      <div
        className={`w-12 h-12 ${c.iconoBg} rounded-xl flex items-center justify-center text-2xl flex-shrink-0`}
      >
        {icono}
      </div>

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        <p className={`text-[9px] font-black uppercase tracking-wider ${textoSecundario} leading-none mb-1`}>
          {label}
        </p>
        <p className={`text-2xl font-black ${c.valor} leading-none`}>{valor}</p>
        {sublabel && (
          <p className={`text-[10px] ${textoSecundario} mt-1 truncate`}>{sublabel}</p>
        )}
        {tendencia && (
          <p
            className={`text-[10px] font-bold mt-1 ${
              (tendencia.mejorEsMayor ? tendencia.valor > 0 : tendencia.valor < 0)
                ? 'text-emerald-400'
                : tendencia.valor === 0
                ? textoSecundario
                : 'text-red-400'
            }`}
          >
            {tendencia.valor > 0 ? '↑' : tendencia.valor < 0 ? '↓' : '='}{' '}
            {Math.abs(tendencia.valor)}% vs mes anterior
          </p>
        )}
      </div>
    </div>
  );
}