// src/pages/Arcade.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { IconNovato, IconInterno, IconTerapeuta, IconEspecialista } from '../components/icons/IconosRango';

const RANGOS = [
  { minXP: 0, maxXP: 500, nombre: 'Estudiante Novato', Icono: IconNovato, color: '#94a3b8' },
  { minXP: 501, maxXP: 1500, nombre: 'Interno de Clínica', Icono: IconInterno, color: '#22d3ee' },
  { minXP: 1501, maxXP: 3000, nombre: 'Terapeuta en Práctica', Icono: IconTerapeuta, color: '#10b981' },
  { minXP: 3001, maxXP: Infinity, nombre: 'Especialista CJ', Icono: IconEspecialista, color: '#facc15' },
];

export default function Arcade({ temaOscuro }) {
  const [progreso, setProgreso] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarProgreso = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Buscar progreso
        let { data, error } = await supabase
          .from('progreso_arcade')
          .select('*')
          .eq('user_id', user.id)
          .single();

        // Si no existe, lo creamos
        if (error && error.code === 'PGRST116') {
          const { data: nuevo, error: errorInsert } = await supabase
            .from('progreso_arcade')
            .insert([{ user_id: user.id, xp_total: 0 }])
            .select()
            .single();
          
          if (errorInsert) throw errorInsert;
          data = nuevo;
        } else if (error) {
          throw error;
        }

        setProgreso(data);
      } catch (err) {
        console.error('Error cargando progreso arcade:', err);
      } finally {
        setCargando(false);
      }
    };
    cargarProgreso();
  }, []);

  if (cargando) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <p className="text-[#22d3ee] font-black text-xl animate-pulse">🔄 Cargando Arcade...</p>
      </div>
    );
  }

  const xp = progreso?.xp_total || 0;
  const rangoActual = RANGOS.find(r => xp >= r.minXP && xp <= r.maxXP) || RANGOS[0];
  const { Icono: IconoActual } = rangoActual;

  // Calcular porcentaje para la barra de progreso del rango
  const siguienteRango = RANGOS.find(r => r.minXP > xp);
  const xpSiguiente = siguienteRango ? siguienteRango.minXP : xp;
  const xpBaseRango = rangoActual.minXP;
  const porcentajeProgreso = siguienteRango 
    ? Math.min(100, Math.max(0, ((xp - xpBaseRango) / (xpSiguiente - xpBaseRango)) * 100))
    : 100;

  const textoColor = temaOscuro ? 'text-white' : 'text-[#1e293b]';
  const bgTarjeta = temaOscuro ? 'bg-[#0a141d] border-gray-800' : 'bg-white border-gray-200';

  return (
    <main className="p-4 md:p-8 max-w-6xl mx-auto w-full font-sans animate-fade-in">
      
      {/* HEADER DEL ARCADE */}
      <div className="text-center mb-10">
        <h1 className={`text-4xl md:text-5xl font-black tracking-tighter ${textoColor} mb-3`}>
          Arcade <span className="text-[#22d3ee]">CJ</span>
        </h1>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">
          Aprende, compite y sube de rango
        </p>
      </div>

      {/* TARJETA DE RANGO (PERFIL GAMER) */}
      <div className={`${bgTarjeta} border rounded-3xl p-6 md:p-8 mb-10 flex flex-col md:flex-row items-center gap-8 shadow-lg relative overflow-hidden`}>
        <div 
          className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: rangoActual.color, transform: 'translate(30%, -30%)' }}
        />
        
        <div 
          className="w-24 h-24 rounded-2xl flex items-center justify-center border-2 bg-black/20 shadow-inner shrink-0"
          style={{ borderColor: rangoActual.color, color: rangoActual.color }}
        >
          <IconoActual className="w-14 h-14" />
        </div>

        <div className="flex-1 text-center md:text-left z-10 w-full">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Tu Rango Actual</p>
          <h2 className={`text-2xl md:text-3xl font-black mb-4 ${textoColor}`} style={{ color: rangoActual.color }}>
            {rangoActual.nombre}
          </h2>
          
          <div className="w-full">
            <div className="flex justify-between text-xs font-bold text-gray-500 mb-2">
              <span>{xp} XP</span>
              {siguienteRango && <span>Siguiente: {siguienteRango.nombre} ({siguienteRango.minXP} XP)</span>}
            </div>
            <div className="w-full bg-gray-700/50 rounded-full h-3">
              <div 
                className="h-3 rounded-full transition-all duration-1000" 
                style={{ width: `${porcentajeProgreso}%`, background: rangoActual.color }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* TARJETAS DE JUEGOS */}
      <h3 className={`text-xl font-black mb-6 ${textoColor}`}>Minijuegos Disponibles</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* JUEGO 1: ANATOMÍA MATCH */}
        <Link 
          to="/arcade/anatomia-match"
          className={`${bgTarjeta} border rounded-3xl p-6 group hover:-translate-y-2 transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[250px]`}
        >
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
             <IconNovato className="w-32 h-32" />
          </div>
          <div>
            <div className="w-12 h-12 rounded-xl bg-[#22d3ee]/20 text-[#22d3ee] flex items-center justify-center mb-4">
               <IconNovato className="w-6 h-6" />
            </div>
            <h4 className={`text-lg font-black mb-2 ${textoColor}`}>Anatomía Match</h4>
            <p className="text-xs text-gray-400 font-medium leading-relaxed mb-4">
              Sincroniza conceptos anatómicos con sus funciones. Pon a prueba tu memoria visual y clínica contra el reloj.
            </p>
          </div>
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-700/50">
            <span className="text-[10px] font-bold text-gray-500 uppercase">Mejor tiempo: {progreso?.mejor_tiempo_match === 999 ? '--:--' : `${progreso?.mejor_tiempo_match}s`}</span>
            <span className="text-[#22d3ee] font-black text-sm group-hover:translate-x-1 transition-transform">Jugar →</span>
          </div>
        </Link>

        {/* JUEGO 2: EL RETO DEL STICKMAN */}
        <Link 
          to="/arcade/stickman"
          className={`${bgTarjeta} border rounded-3xl p-6 group hover:-translate-y-2 transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[250px]`}
        >
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
             <IconTerapeuta className="w-32 h-32" />
          </div>
          <div>
            <div className="w-12 h-12 rounded-xl bg-[#10b981]/20 text-[#10b981] flex items-center justify-center mb-4">
               <IconTerapeuta className="w-6 h-6" />
            </div>
            <h4 className={`text-lg font-black mb-2 ${textoColor}`}>El Reto del Stickman</h4>
            <p className="text-xs text-gray-400 font-medium leading-relaxed mb-4">
              Identifica las regiones anatómicas correctas en el cuerpo humano. Aprende con las "pastillas de conocimiento".
            </p>
          </div>
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-700/50">
            <span className="text-[10px] font-bold text-gray-500 uppercase">Aciertos Totales: {progreso?.aciertos_stickman || 0}</span>
            <span className="text-[#10b981] font-black text-sm group-hover:translate-x-1 transition-transform">Jugar →</span>
          </div>
        </Link>

      </div>

    </main>
  );
}