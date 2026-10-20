import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ConsumoIA({ temaOscuro }) {
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [stats, setStats] = useState({ tokensHoy: 0, tokensMes: 0, peticiones: 0, errores: 0 });
  const [topUsuarios, setTopUsuarios] = useState([]);
  const [graficoData, setGraficoData] = useState([]);

  // Estilos dinámicos
  const bgTarjeta = temaOscuro ? 'bg-[#0a141d] border-gray-800' : 'bg-white border-gray-300';
  const textoPrincipal = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const textoSecundario = temaOscuro ? 'text-gray-400' : 'text-gray-600';
  const bgTooltip = temaOscuro ? '#0f1a24' : '#ffffff';

  useEffect(() => {
    cargarConsumo();
  }, []);

  const cargarConsumo = async () => {
    setCargando(true);
    try {
      // 1. Traer todo el consumo (en un futuro lejano, paginar si hay miles de filas)
      const { data: consumoData, error } = await supabase
        .from('consumo_ia')
        .select('*')
        .order('fecha', { ascending: false });
      
      if (error) throw error;

      // 2. Traer perfiles para hidratar nombres
      const userIds = [...new Set(consumoData.map(c => c.user_id).filter(Boolean))];
      let perfilesMap = {};
      if (userIds.length > 0) {
        const { data: perfiles } = await supabase.from('profiles').select('id, nombre_completo').in('id', userIds);
        (perfiles || []).forEach(p => { perfilesMap[p.id] = p.nombre_completo; });
      }

      // 3. Calcular estadísticas
      const hoyStr = new Date().toISOString().split('T')[0];
      let tHoy = 0, tMes = 0, errores = 0;
      let agrupadoPorDia = {};
      let agrupadoPorUsuario = {};

      consumoData.forEach(c => {
        const fechaStr = c.fecha.split('T')[0];
        
        // Totales generales
        if (fechaStr === hoyStr) tHoy += c.tokens_total;
        tMes += c.tokens_total;
        if (!c.exito) errores++;

        // Gráfico (últimos 30 días)
        if (!agrupadoPorDia[fechaStr]) agrupadoPorDia[fechaStr] = { dia: fechaStr, tokens: 0, consultas: 0 };
        agrupadoPorDia[fechaStr].tokens += c.tokens_total;
        agrupadoPorDia[fechaStr].consultas += 1;

        // Top Usuarios
        if (c.user_id) {
          if (!agrupadoPorUsuario[c.user_id]) agrupadoPorUsuario[c.user_id] = { nombre: perfilesMap[c.user_id] || 'Usuario Desconocido', tokens: 0 };
          agrupadoPorUsuario[c.user_id].tokens += c.tokens_total;
        }
      });

      // Formatear gráfico (últimos 30 días ordenados)
      const graficoArray = Object.values(agrupadoPorDia)
        .sort((a, b) => new Date(a.dia) - new Date(b.dia))
        .slice(-30); // Solo los últimos 30 días

      // Formatear Top Usuarios (top 5)
      const topArray = Object.values(agrupadoPorUsuario)
        .sort((a, b) => b.tokens - a.tokens)
        .slice(0, 5);

      setStats({ tokensHoy: tHoy, tokensMes: tMes, peticiones: consumoData.length, errores });
      setTopUsuarios(topArray);
      setGraficoData(graficoArray);
    } catch (error) {
      console.error('Error cargando consumo:', error);
    } finally {
      setCargando(false);
    }
  };

  // Límite aproximado de Groq (Gratis): 14400 peticiones / día. 
  // Usaremos 100,000 tokens diarios como umbral visual de alerta.
  const limiteGroq = 100000;
  const porcentajeLimite = Math.min((stats.tokensHoy / limiteGroq) * 100, 100);

  if (cargando) return <div className="p-8 text-center animate-pulse text-[#22d3ee] font-bold">Cargando estadísticas de IA...</div>;

  return (
    <div className="space-y-6">
      {/* TARJETAS DE RESUMEN */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${bgTarjeta} p-4 rounded-2xl border`}>
          <p className={`text-xs font-bold uppercase ${textoSecundario}`}>Tokens Hoy</p>
          <p className={`text-2xl font-black ${textoPrincipal}`}>{stats.tokensHoy.toLocaleString()}</p>
        </div>
        <div className={`${bgTarjeta} p-4 rounded-2xl border`}>
          <p className={`text-xs font-bold uppercase ${textoSecundario}`}>Tokens (Total)</p>
          <p className={`text-2xl font-black ${textoPrincipal}`}>{stats.tokensMes.toLocaleString()}</p>
        </div>
        <div className={`${bgTarjeta} p-4 rounded-2xl border`}>
          <p className={`text-xs font-bold uppercase ${textoSecundario}`}>Consultas Totales</p>
          <p className={`text-2xl font-black text-[#22d3ee]`}>{stats.peticiones.toLocaleString()}</p>
        </div>
        <div className={`${bgTarjeta} p-4 rounded-2xl border`}>
          <p className={`text-xs font-bold uppercase ${textoSecundario}`}>Errores (Fallbacks)</p>
          <p className={`text-2xl font-black text-red-500`}>{stats.errores.toLocaleString()}</p>
        </div>
      </div>

      {/* BARRA DE LÍMITE (Simulada) */}
      <div className={`${bgTarjeta} p-6 rounded-2xl border`}>
        <div className="flex justify-between items-center mb-2">
          <h3 className={`text-sm font-bold ${textoPrincipal}`}>Consumo diario vs Límite (Groq)</h3>
          <span className={`text-xs font-bold ${porcentajeLimite > 80 ? 'text-red-500' : 'text-green-500'}`}>
            {porcentajeLimite.toFixed(1)}%
          </span>
        </div>
        <div className={`w-full h-4 rounded-full ${temaOscuro ? 'bg-gray-800' : 'bg-gray-200'} overflow-hidden`}>
          <div 
            className={`h-full transition-all duration-1000 ${porcentajeLimite > 80 ? 'bg-red-500' : 'bg-[#22d3ee]'}`}
            style={{ width: `${porcentajeLimite}%` }}
          ></div>
        </div>
        <p className={`text-[10px] mt-2 ${textoSecundario}`}>Límite referencial: 100,000 tokens/día. (El límite real de Groq es por minuto, esto es una alerta temprana).</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* GRÁFICO DE ÁREA */}
        <div className={`md:col-span-2 ${bgTarjeta} p-6 rounded-2xl border h-80`}>
          <h3 className={`text-sm font-bold ${textoPrincipal} mb-4`}>Consumo últimos días (Tokens)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={graficoData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={temaOscuro ? '#374151' : '#e5e7eb'} />
              <XAxis dataKey="dia" stroke={textoSecundario} fontSize={10} />
              <YAxis stroke={textoSecundario} fontSize={10} />
              <Tooltip 
                contentStyle={{ backgroundColor: bgTooltip, borderColor: '#22d3ee', borderRadius: '8px', fontSize: '12px' }}
                itemStyle={{ color: '#22d3ee', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="tokens" stroke="#22d3ee" fillOpacity={1} fill="url(#colorTokens)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* TOP USUARIOS */}
        <div className={`${bgTarjeta} p-6 rounded-2xl border h-80 overflow-y-auto`}>
          <h3 className={`text-sm font-bold ${textoPrincipal} mb-4`}>Top Usuarios (Tokens)</h3>
          {topUsuarios.length === 0 ? (
            <p className={`text-xs ${textoSecundario}`}>No hay datos suficientes.</p>
          ) : (
            <div className="space-y-3">
              {topUsuarios.map((u, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-black w-5 h-5 flex items-center justify-center rounded-full ${idx === 0 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-gray-500/20 text-gray-400'}`}>{idx + 1}</span>
                    <span className={`text-xs font-bold ${textoPrincipal} truncate max-w-[120px]`}>{u.nombre}</span>
                  </div>
                  <span className={`text-xs font-mono font-bold text-[#22d3ee]`}>{u.tokens.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}