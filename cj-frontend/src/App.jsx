import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import AreaDeEstudio from './pages/AreaDeEstudio';
import BaseConocimiento from './pages/BaseConocimiento';
import Biblioteca from './pages/Biblioteca';
import Multimedia from './pages/Multimedia';
import Login from './pages/Login';
import PanelDirector from './pages/PanelDirector';
import SimuladorExamen from './pages/SimuladorExamen';
import HistorialExamenes from './pages/HistorialExamenes';
import { GlobalMusicPlayer } from './components/GlobalMusicPlayer';
import { NotebookCJ } from './components/NotebookCJ';
import { AuraProvider } from './context/AuraContext';
import ConfiguracionAura from './pages/ConfiguracionAura';

const RutaProtegida = ({ children }) => {
  const estaLogueado = localStorage.getItem('usuario_cj');
  if (!estaLogueado) return <Navigate to="/login" replace />;
  return children;
};

function LayoutConSidebar({ children, temaOscuro, setTemaOscuro }) {
  const location = useLocation();
  const esRutaLogin = location.pathname === '/login';
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [panelNotasAbierto, setPanelNotasAbierto] = useState(false);

  const bgPrincipal = temaOscuro ? 'bg-[#020813]' : 'bg-[#e2e8f0]';
  const textoPrincipal = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const bgCaja = temaOscuro ? 'bg-[#0a141d]' : 'bg-white';
  const bordeColor = temaOscuro ? 'border-gray-800' : 'border-gray-300';

  if (esRutaLogin) return <div className={`min-h-screen ${bgPrincipal}`}>{children}</div>;

  return (
    <div className={`min-h-screen ${bgPrincipal} flex flex-col md:flex-row relative overflow-hidden transition-colors duration-500`}>
      {(menuAbierto || panelNotasAbierto) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] md:hidden" onClick={() => { setMenuAbierto(false); setPanelNotasAbierto(false); }} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-[100] w-72 transform transition-transform duration-300 md:relative md:translate-x-0 md:flex md:shrink-0 ${menuAbierto ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar temaOscuro={temaOscuro} alClickLink={() => setMenuAbierto(false)} setTemaOscuro={setTemaOscuro} />
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden p-4 md:p-6 relative z-20">
        <header className="flex justify-between items-center mb-4 shrink-0">
          <button onClick={() => setMenuAbierto(!menuAbierto)} className={`md:hidden flex items-center justify-center p-2 rounded-xl border ${bordeColor} ${bgCaja} shadow-sm text-[#22d3ee] z-[80] transition-colors hover:bg-[#22d3ee]/10`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          </button>

          <div className="flex items-center gap-3 ml-auto">
            <button onClick={() => setPanelNotasAbierto(!panelNotasAbierto)} className={`flex items-center gap-2 p-2 rounded-xl border ${bordeColor} ${bgCaja} shadow-sm transition-all z-[80] text-[#22d3ee] hover:bg-[#22d3ee]/10 hover:scale-105`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="6" y2="6"/><line x1="10" x2="20" y1="12" y2="12"/><line x1="6" x2="20" y1="18" y2="18"/></svg>
            </button>
            <button onClick={() => setTemaOscuro(!temaOscuro)} className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${bordeColor} ${bgCaja} shadow-sm transition-all z-[80] hover:bg-black/5`}>
              <span className="text-xl">{temaOscuro ? '☀️' : '🌙'}</span>
              <span className={`hidden sm:inline text-[10px] font-black uppercase tracking-widest ${textoPrincipal}`}>Modo {temaOscuro ? 'Día' : 'Noche'}</span>
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-10">{children}</div>
      </div>

      <aside className={`fixed inset-y-0 right-0 z-[100] w-[85%] md:w-[400px] transform transition-transform duration-300 ${panelNotasAbierto ? 'translate-x-0' : 'translate-x-full'} ${bgCaja} border-l ${bordeColor} shadow-2xl flex flex-col`}>
        <NotebookCJ temaOscuro={temaOscuro} cerrarPanel={() => setPanelNotasAbierto(false)} />
      </aside>
    </div>
  );
}

function App() {
  const [temaOscuro, setTemaOscuro] = useState(true);
  return (
    <AuraProvider>
      <BrowserRouter>
        <LayoutConSidebar temaOscuro={temaOscuro} setTemaOscuro={setTemaOscuro}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<RutaProtegida><Dashboard temaOscuro={temaOscuro} /></RutaProtegida>} />
            <Route path="/area-estudio" element={<RutaProtegida><AreaDeEstudio temaOscuro={temaOscuro} /></RutaProtegida>} />
            <Route path="/biblioteca" element={<RutaProtegida><Biblioteca temaOscuro={temaOscuro} /></RutaProtegida>} />
            <Route path="/multimedia" element={<RutaProtegida><Multimedia temaOscuro={temaOscuro} /></RutaProtegida>} />
            <Route path="/base-conocimiento" element={<RutaProtegida><BaseConocimiento temaOscuro={temaOscuro} /></RutaProtegida>} />
            <Route path="/configuracion-ia" element={<RutaProtegida><ConfiguracionAura temaOscuro={temaOscuro} /></RutaProtegida>} />
            <Route path="/simulador" element={<RutaProtegida><SimuladorExamen temaOscuro={temaOscuro} /></RutaProtegida>} />
            <Route path="/historial-examenes" element={<RutaProtegida><HistorialExamenes temaOscuro={temaOscuro} /></RutaProtegida>} />
            <Route path="/panel-director" element={<RutaProtegida><PanelDirector temaOscuro={temaOscuro} /></RutaProtegida>} />
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
  );
}

export default App;