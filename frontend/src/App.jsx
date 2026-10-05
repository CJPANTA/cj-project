// ============================================================
// DIAGNÓSTICO: Verificar URL de Supabase en producción
// ============================================================
console.log('🔍 [App.jsx] VITE_SUPABASE_URL (desde env):', import.meta.env.VITE_SUPABASE_URL);

import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useState, useEffect, lazy, Suspense } from 'react';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Landing from './pages/Landing';
import { AuraProvider } from './context/AuraContext';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingFallback from './components/LoadingFallback';

// ============================================================
// LAZY IMPORTS — el resto se carga bajo demanda
// Esto baja el bundle inicial de 2.25 MB → ~600 KB
// ============================================================
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AreaDeEstudio = lazy(() => import('./pages/AreaDeEstudio'));
const BaseConocimiento = lazy(() => import('./pages/BaseConocimiento'));
const Biblioteca = lazy(() => import('./pages/Biblioteca'));
const Horario = lazy(() => import('./pages/Horario'));
const PanelDirector = lazy(() => import('./pages/PanelDirector'));
const SimuladorExamen = lazy(() => import('./pages/SimuladorExamen'));
const HistorialExamenes = lazy(() => import('./pages/HistorialExamenes'));
const ConfiguracionAura = lazy(() => import('./pages/ConfiguracionAura'));
const Patologias = lazy(() => import('./pages/Patologias'));
const Masoterapia = lazy(() => import('./pages/Masoterapia'));
const PacientesLista = lazy(() => import('./pages/clinica/PacientesLista'));
const PacienteDetalle = lazy(() => import('./pages/clinica/PacienteDetalle'));
const EvaluacionPostural = lazy(() => import('./pages/clinica/EvaluacionPostural'));
const Agenda = lazy(() => import('./pages/clinica/Agenda'));
const ProgramacionPersonal = lazy(() => import('./pages/clinica/ProgramacionPersonal'));
const StickmanPreview = lazy(() => import('./pages/StickmanPreview'));
const MiEquipamiento = lazy(() => import('./pages/MiEquipamiento'));
const Terminos = lazy(() => import('./pages/Terminos'));
const Privacidad = lazy(() => import('./pages/Privacidad'));

const RutaProtegida = ({ children }) => {
  const estaLogueado = localStorage.getItem('usuario_cj');
  if (!estaLogueado) return <Navigate to="/login" replace />;
  return children;
};

function LayoutConSidebar({ children, temaOscuro, setTemaOscuro }) {
  const location = useLocation();
    const esRutaPublica =
    location.pathname === '/login' ||
    location.pathname === '/' ||
    location.pathname === '/terminos' ||
    location.pathname === '/privacidad';
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [esMovil, setEsMovil] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setEsMovil(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const bgPrincipal = temaOscuro ? 'bg-[#020813]' : 'bg-[#e2e8f0]';
  const textoPrincipal = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const bgCaja = temaOscuro ? 'bg-[#0a141d]' : 'bg-white';
  const bordeColor = temaOscuro ? 'border-gray-800' : 'border-gray-300';

        if (esRutaPublica) {
      return <div className="w-full h-screen overflow-y-auto">{children}</div>;
    }

  return (
    <div className={`h-screen ${bgPrincipal} flex flex-col md:flex-row relative overflow-hidden transition-colors duration-500`}>
      {/* Overlay para móvil */}
      {esMovil && menuAbierto && (
        <div className="fixed inset-0 bg-black/60 z-[90]" onClick={() => setMenuAbierto(false)} />
      )}

      {/* ========== SIDEBAR CORREGIDO ========== */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-[100] 
          w-72 min-w-[18rem] max-w-[18rem]   /* 👈 Fuerza ancho fijo en móvil */
          transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0 md:flex md:shrink-0 md:min-w-[18rem]  /* 👈 En desktop siempre visible */
          ${esMovil ? (menuAbierto ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
        `}
        style={{ transition: 'transform 0.3s ease' }}
      >
        <Sidebar temaOscuro={temaOscuro} alClickLink={() => esMovil && setMenuAbierto(false)} />
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden p-4 md:p-6 relative z-20">
        <header className="flex justify-between items-center mb-4 shrink-0">
          {/* Botón hamburguesa (solo en móvil) */}
          {esMovil && (
            <button 
              onClick={() => setMenuAbierto(!menuAbierto)} 
              className="flex items-center justify-center p-2 rounded-xl border border-gray-800 bg-[#0a141d] shadow-sm text-[#22d3ee] z-[80] transition-colors hover:bg-[#22d3ee]/10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" x2="20" y1="12" y2="12"/>
                <line x1="4" x2="20" y1="6" y2="6"/>
                <line x1="4" x2="20" y1="18" y2="18"/>
              </svg>
            </button>
          )}
          {!esMovil && <div className="w-10" />}

          {/* Botón de modo día/noche */}
          <div className="flex items-center gap-3 ml-auto">
                        <button 
              onClick={() => setTemaOscuro(!temaOscuro)} 
              className={`p-2.5 rounded-xl border ${bordeColor} ${bgCaja} shadow-sm transition-all z-[80] hover:scale-110 hover:border-[#22d3ee]/40`}
              title={temaOscuro ? 'Activar modo claro' : 'Activar modo oscuro'}
            >
              <span className="text-xl leading-none block">
                {temaOscuro ? '☀️' : '🌙'}
              </span>
            </button>
          </div>
        </header>

        {/* Área de contenido scrolleable */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-10">
          {children}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [temaOscuro, setTemaOscuro] = useState(true);
  
    // Aplicar tema al <html> para que el CSS responda
  useEffect(() => {
    document.documentElement.setAttribute(
      'data-tema',
      temaOscuro ? 'oscuro' : 'claro'
    );
  }, [temaOscuro]);

    return (
    <ErrorBoundary>
      <AuraProvider>
        <BrowserRouter>
          <LayoutConSidebar temaOscuro={temaOscuro} setTemaOscuro={setTemaOscuro}>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Landing />} />
                <Route path="/inicio" element={<RutaProtegida><Dashboard temaOscuro={temaOscuro} /></RutaProtegida>} />
                <Route path="/terminos" element={<Terminos />} />
                <Route path="/privacidad" element={<Privacidad />} />
                <Route path="/area-estudio" element={<RutaProtegida><AreaDeEstudio temaOscuro={temaOscuro} /></RutaProtegida>} />
                <Route path="/biblioteca" element={<RutaProtegida><Biblioteca temaOscuro={temaOscuro} /></RutaProtegida>} />
                <Route path="/horario" element={<RutaProtegida><Horario temaOscuro={temaOscuro} /></RutaProtegida>} />
                <Route path="/base-conocimiento" element={<RutaProtegida><BaseConocimiento temaOscuro={temaOscuro} /></RutaProtegida>} />
                <Route path="/configuracion-ia" element={<RutaProtegida><ConfiguracionAura temaOscuro={temaOscuro} /></RutaProtegida>} />
                <Route path="/simulador" element={<RutaProtegida><SimuladorExamen temaOscuro={temaOscuro} /></RutaProtegida>} />
                <Route path="/historial-examenes" element={<RutaProtegida><HistorialExamenes temaOscuro={temaOscuro} /></RutaProtegida>} />
                <Route path="/panel-director" element={<RutaProtegida><PanelDirector temaOscuro={temaOscuro} /></RutaProtegida>} />
                <Route path="/patologias" element={<RutaProtegida><Patologias temaOscuro={temaOscuro} /></RutaProtegida>} />
                <Route path="/masoterapia" element={<RutaProtegida><Masoterapia temaOscuro={temaOscuro} /></RutaProtegida>} />
                <Route path="/clinica/pacientes" element={<RutaProtegida><PacientesLista temaOscuro={temaOscuro} /></RutaProtegida>} />
                <Route path="/clinica/pacientes/:id" element={<RutaProtegida><PacienteDetalle temaOscuro={temaOscuro} /></RutaProtegida>} />
                <Route path="/clinica/agenda" element={<RutaProtegida><Agenda temaOscuro={temaOscuro} /></RutaProtegida>} />
                <Route path="/clinica/programacion" element={<RutaProtegida><ProgramacionPersonal temaOscuro={temaOscuro} /></RutaProtegida>} />
                <Route path="/ciclo-01" element={<RutaProtegida><AreaDeEstudio temaOscuro={temaOscuro} /></RutaProtegida>} />
                <Route path="/ciclo-02" element={<RutaProtegida><AreaDeEstudio temaOscuro={temaOscuro} /></RutaProtegida>} />
                <Route path="/ciclo-03" element={<RutaProtegida><AreaDeEstudio temaOscuro={temaOscuro} /></RutaProtegida>} />
                <Route path="/ciclo-04" element={<RutaProtegida><AreaDeEstudio temaOscuro={temaOscuro} /></RutaProtegida>} />
                <Route path="/ciclo-05" element={<RutaProtegida><AreaDeEstudio temaOscuro={temaOscuro} /></RutaProtegida>} />
                <Route path="/ciclo-06" element={<RutaProtegida><AreaDeEstudio temaOscuro={temaOscuro} /></RutaProtegida>} />
                <Route path="/clinica/evaluacion/:pacienteId" element={<RutaProtegida><EvaluacionPostural temaOscuro={temaOscuro} /></RutaProtegida>} />
                <Route path="/stickman-preview" element={<RutaProtegida><StickmanPreview temaOscuro={temaOscuro} /></RutaProtegida>} />
                <Route path="/mi-equipamiento" element={<MiEquipamiento temaOscuro={temaOscuro} />} />
              </Routes>
            </Suspense>
          </LayoutConSidebar>
        </BrowserRouter>
      </AuraProvider>
    </ErrorBoundary>
  );
}

export default App;