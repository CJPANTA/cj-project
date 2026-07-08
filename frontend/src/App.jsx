import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import AreaDeEstudio from './pages/AreaDeEstudio';
import BaseConocimiento from './pages/BaseConocimiento';
import Biblioteca from './pages/Biblioteca';
import Horario from './pages/Horario';
import Login from './pages/Login';
import PanelDirector from './pages/PanelDirector';
import SimuladorExamen from './pages/SimuladorExamen';
import HistorialExamenes from './pages/HistorialExamenes';
import { AuraProvider } from './context/AuraContext';
import ConfiguracionAura from './pages/ConfiguracionAura';
import Patologias from './pages/Patologias';
import Masoterapia from './pages/Masoterapia';
import ErrorBoundary from './components/ErrorBoundary';
import PacientesLista from './pages/clinica/PacientesLista';
import PacienteDetalle from './pages/clinica/PacienteDetalle';

const RutaProtegida = ({ children }) => {
  const estaLogueado = localStorage.getItem('usuario_cj');
  if (!estaLogueado) return <Navigate to="/login" replace />;
  return children;
};

function LayoutConSidebar({ children, temaOscuro, setTemaOscuro }) {
  const location = useLocation();
  const esRutaLogin = location.pathname === '/login';
  const [menuAbierto, setMenuAbierto] = useState(false);
  // Detectar si es móvil (menor a 768px) para controlar el sidebar
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

  if (esRutaLogin) return <div className={`min-h-screen ${bgPrincipal}`}>{children}</div>;

  // Determinar si el sidebar debe estar visible (siempre visible en tablet/desktop, oculto en móvil)
  const sidebarVisible = !esMovil || (esMovil && menuAbierto);

  return (
    <div className={`min-h-screen ${bgPrincipal} flex flex-col md:flex-row relative overflow-hidden transition-colors duration-500`}>
      {/* Overlay para móvil */}
      {esMovil && menuAbierto && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]" onClick={() => setMenuAbierto(false)} />
      )}

      {/* Sidebar: siempre en el DOM, se oculta/muestra con transform y opacidad */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-[100] w-72 transition-all duration-300 ease-in-out
          md:relative md:translate-x-0 md:opacity-100 md:flex md:shrink-0
          ${sidebarVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 pointer-events-none'}
        `}
        style={{ transition: 'transform 0.3s ease, opacity 0.3s ease' }}
      >
        <Sidebar temaOscuro={temaOscuro} alClickLink={() => esMovil && setMenuAbierto(false)} />
      </aside>

      {/* Contenido principal: siempre visible */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden p-4 md:p-6 relative z-20">
        <header className="flex justify-between items-center mb-4 shrink-0">
          {/* Botón hamburguesa: solo en móvil */}
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
          {/* Espaciador en tablet/desktop para mantener el header alineado */}
          {!esMovil && <div className="w-10" />}

          <div className="flex items-center gap-3 ml-auto">
            <button 
              onClick={() => setTemaOscuro(!temaOscuro)} 
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${bordeColor} ${bgCaja} shadow-sm transition-all z-[80] hover:bg-black/5`}
            >
              <span className="text-xl">{temaOscuro ? '☀️' : '🌙'}</span>
              <span className={`hidden sm:inline text-[10px] font-black uppercase tracking-widest ${textoPrincipal}`}>
                Modo {temaOscuro ? 'Día' : 'Noche'}
              </span>
            </button>
          </div>
        </header>
        {/* Contenedor del contenido con key para forzar estabilidad */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-10" key="main-content">
          {children}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [temaOscuro, setTemaOscuro] = useState(true);
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.update();
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload();
        });
      });
    }
  }, []);
  return (
    <ErrorBoundary>
      <AuraProvider>
        <BrowserRouter>
          <LayoutConSidebar temaOscuro={temaOscuro} setTemaOscuro={setTemaOscuro}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<RutaProtegida><Dashboard temaOscuro={temaOscuro} /></RutaProtegida>} />
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
              <Route path="/ciclo-01" element={<RutaProtegida><AreaDeEstudio temaOscuro={temaOscuro} /></RutaProtegida>} />
              <Route path="/ciclo-02" element={<RutaProtegida><AreaDeEstudio temaOscuro={temaOscuro} /></RutaProtegida>} />
              <Route path="/ciclo-03" element={<RutaProtegida><AreaDeEstudio temaOscuro={temaOscuro} /></RutaProtegida>} />
              <Route path="/ciclo-04" element={<RutaProtegida><AreaDeEstudio temaOscuro={temaOscuro} /></RutaProtegida>} />
              <Route path="/ciclo-05" element={<RutaProtegida><AreaDeEstudio temaOscuro={temaOscuro} /></RutaProtegida>} />
              <Route path="/ciclo-06" element={<RutaProtegida><AreaDeEstudio temaOscuro={temaOscuro} /></RutaProtegida>} />
            </Routes>
          </LayoutConSidebar>
        </BrowserRouter>
      </AuraProvider>
    </ErrorBoundary>
  );
}

export default App;