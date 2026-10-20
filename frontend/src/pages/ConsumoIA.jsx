import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ConsumoIA({ temaOscuro }) {
  const [datosBrutos, setDatosBrutos] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // Filtros
  const [filtroCentro, setFiltroCentro] = useState('TODOS');
  const [filtroUsuario, setFiltroUsuario] = useState('TODOS');
  const [listaCentros, setListaCentros] = useState([]);
  const [listaUsuarios, setListaUsuarios] = useState([]);

  // Datos procesados
  const [stats, setStats] = useState({ tokensHoy: 0, tokensMes: 0, peticiones: 0, errores: 0 });
  const [topUsuarios, setTopUsuarios] = useState([]);
  const [graficoData, setGraficoData] = useState([]);

  // Estilos dinámicos
  const bgTarjeta = temaOscuro ? 'bg-[#0a141d] border-gray-800' : 'bg-white border-gray-300';
  const textoPrincipal = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const textoSecundario = temaOscuro ? 'text-gray-400' : 'text-gray-600';
  const bgInput = temaOscuro ? 'bg-[#0f1a24] border-gray-700 text-white' : 'bg-white border-gray-300 text-[#0f172a]';
  const bgTooltip = temaOscuro ? '#0f1a24' : '#ffffff';

  useEffect(() => {
    cargarDatosBase();
  }, []);

  useEffect(() => {
    // Cada vez que cambian los filtros o los datos base, recalculamos todo
    procesarDatos();
  }, [datosBrutos, filtroCentro, filtroUsuario]);

  const cargarDatosBase = async () => {
    setCargando(true);
    try {
      const { data: consumoData, error } = await supabase
        .from('consumo_ia')
        .select('*')
        .order('fecha', { ascending: false });
      if (error) throw error;

      const userIds = [...new Set(consumoData.map(c => c.user_id).filter(Boolean))];
      let perfilesMap = {};
      if (userIds.length > 0) {
        const { data: perfiles } = await supabase.from('profiles').select('id, nombre_completo, centro_id').in('id', userIds);
        (perfiles || []).forEach(p => { perfilesMap[p.id] = p; });
        
        // Extraer lista única de centros y usuarios para los selects
        const centrosUnicos = [...new Set(perfiles.map(p => p.centro_id).filter(Boolean))];
        setListaCentros(centrosUnicos);
        setListaUsuarios(perfiles.map(p => ({ id: p.id, nombre: p.nombre_completo })));
      }

      // Hidratar datos
      const dataHidratada = consumoData.map(c => ({
        ...c,
        nombre_usuario: perfilesMap[c.user_id]?.nombre_completo || 'Desconocido',
        centro_usuario: perfilesMap[c.user_id]?.centro_id || 'Sin Centro'
      }));

      setDatosBrutos(dataHidratada);
    } catch (error) {
      console.error('Error cargando consumo:', error);
    } finally {
      setCargando(false);
    }
  };

  const procesarDatos = () => {
    // 1. Aplicar filtros
    let filtrados = datosBrutos;
    if (filtroCentro !== 'TODOS') {
      filtrados = filtrados.filter(c => c.centro_usuario === filtroCentro);
    }
    if (filtroUsuario !== 'TODOS') {
      filtrados = filtrados.filter(c => c.user_id === filtroUsuario);
    }

    // 2. Calcular estadísticas
    const hoyStr = new Date().toISOString().split('T')[0];
    let tHoy = 0, tMes = 0, errores = 0;
    let agrupadoPorDia = {};
    let agrupadoPorUsuario = {};

    filtrados.forEach(c => {
      const fechaStr = c.fecha.split('T')[0];
      if (fechaStr === hoyStr) tHoy += c.tokens_total;
      tMes += c.tokens_total;
      if (!c.exito) errores++;

      if (!agrupadoPorDia[fechaStr]) agrupadoPorDia[fechaStr] = { dia: fechaStr, tokens: 0, consultas: 0 };
      agrupadoPorDia[fechaStr].tokens += c.tokens_total;
      agrupadoPorDia[fechaStr].consultas += 1;

      if (c.user_id) {
        if (!agrupadoPorUsuario[c.user_id]) agrupadoPorUsuario[c.user_id] = { nombre: c.nombre_usuario, tokens: 0 };
        agrupadoPorUsuario[c.user_id].tokens += c.tokens_total;
      }
    });

    const graficoArray = Object.values(agrupadoPorDia).sort((a, b) => new Date(a.dia) - new Date(b.dia)).slice(-30);
    const topArray = Object.values(agrupadoPorUsuario).sort((a, b) => b.tokens - a.tokens).slice(0, 5);

    setStats({ tokensHoy: tHoy, tokensMes: tMes, peticiones: filtrados.length, errores });
    setTopUsuarios(topArray);
    setGraficoData(graficoArray);
  };

  const limiteGroq = 100000;
  const porcentajeLimite = Math.min((stats.tokensHoy / limiteGroq) * 100, 100);

  if (cargando) return <div className="p-8 text-center animate-pulse text-[#22d3ee] font-bold">Cargando estadísticas de IA...</div>;

  return (
    <div className="space-y-6">
      {/* FILTROS */}
      <div className={`${bgTarjeta} p-4 rounded-2xl border flex flex-wrap gap-4 items-center`}>
        <span className={`text-xs font-bold uppercase ${textoSecundario}`}>Filtros:</span>
        <select value={filtroCentro} onChange={e => setFiltroCentro(e.target.value)} className={`px-3 py-2 rounded-xl border text-sm outline-none ${bgInput}`}>
          <option value="TODOS">Todos los Centros</option>
          {listaCentros.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filtroUsuario} onChange={e => setFiltroUsuario(e.target.value)} className={`px-3 py-2 rounded-xl border text-sm outline-none ${bgInput}`}>
          <option value="TODOS">Todos los Usuarios</option>
          {listaUsuarios.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
        </select>
      </div>

      {/* TARJETAS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${bgTarjeta} p-4 rounded-2xl border`}>
          <p className={`text-xs font-bold uppercase ${textoSecundario}`}>Tokens Hoy (Filtro)</p>
          <p className={`text-2xl font-black ${textoPrincipal}`}>{stats.tokensHoy.toLocaleString()}</p>
        </div>
        <div className={`${bgTarjeta} p-4 rounded-2xl border`}>
          <p className={`text-xs font-bold uppercase ${textoSecundario}`}>Tokens (Total)</p>
          <p className={`text-2xl font-black ${textoPrincipal}`}>{stats.tokensMes.toLocaleString()}</p>
        </div>
        <div className={`${bgTarjeta} p-4 rounded-2xl border`}>
          <p className={`text-xs font-bold uppercase ${textoSecundario}`}>Consultas</p>
          <p className={`text-2xl font-black text-[#22d3ee]`}>{stats.peticiones.toLocaleString()}</p>
        </div>
        <div className={`${bgTarjeta} p-4 rounded-2xl border`}>
          <p className={`text-xs font-bold uppercase ${textoSecundario}`}>Errores (Fallbacks)</p>
          <p className={`text-2xl font-black text-red-500`}>{stats.errores.toLocaleString()}</p>
        </div>
      </div>

      {/* BARRA LÍMITE */}
      <div className={`${bgTarjeta} p-6 rounded-2xl border`}>
        <div className="flex justify-between items-center mb-2">
          <h3 className={`text-sm font-bold ${textoPrincipal}`}>Consumo diario vs Límite (Groq)</h3>
          <span className={`text-xs font-bold ${porcentajeLimite > 80 ? 'text-red-500' : 'text-green-500'}`}>{porcentajeLimite.toFixed(1)}%</span>
        </div>
        <div className={`w-full h-4 rounded-full ${temaOscuro ? 'bg-gray-800' : 'bg-gray-200'} overflow-hidden`}>
          <div className={`h-full transition-all duration-1000 ${porcentajeLimite > 80 ? 'bg-red-500' : 'bg-[#22d3ee]'}`} style={{ width: `${porcentajeLimite}%` }}></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* GRÁFICO */}
        <div className={`md:col-span-2 ${bgTarjeta} p-6 rounded-2xl border h-80`}>
          <h3 className={`text-sm font-bold ${textoPrincipal} mb-4`}>Consumo (Últimos 30 días)</h3>
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
              <Tooltip contentStyle={{ backgroundColor: bgTooltip, borderColor: '#22d3ee', borderRadius: '8px', fontSize: '12px' }} />
              <Area type="monotone" dataKey="tokens" stroke="#22d3ee" fillOpacity={1} fill="url(#colorTokens)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* TOP USUARIOS */}
        <div className={`${bgTarjeta} p-6 rounded-2xl border h-80 overflow-y-auto`}>
          <h3 className={`text-sm font-bold ${textoPrincipal} mb-4`}>Top Usuarios</h3>
          {topUsuarios.length === 0 ? <p className={`text-xs ${textoSecundario}`}>No hay datos.</p> : (
            <div className="space-y-3">
              {topUsuarios.map((u, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className={`text-xs font-bold ${textoPrincipal} truncate max-w-[150px]`}>{idx + 1}. {u.nombre}</span>
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