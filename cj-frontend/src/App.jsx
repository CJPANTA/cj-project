import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import AreaDeEstudio from './pages/AreaDeEstudio';
import BaseConocimiento from './pages/BaseConocimiento';
import Biblioteca from './pages/Biblioteca';
import Multimedia from './pages/Multimedia';
import Login from './pages/Login';
import { GlobalMusicPlayer } from './components/GlobalMusicPlayer';
import { NotebookCJ } from './components/NotebookCJ';
import { AuraProvider } from './context/AuraContext'; // <-- IMPORTAMOS AURA
import ConfiguracionAura from './pages/ConfiguracionAura';

function LayoutConSidebar({ children, temaOscuro, setTemaOscuro }) {
  const location = useLocation();
  const esRutaLogin = location.pathname === '/login';

  const [menuAbierto, setMenuAbierto] = useState(false);
  const [panelNotasAbierto, setPanelNotasAbierto] = useState(false);
  const [touchStart, setTouchStart] = useState(null);

  const handleTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchMove = (e) => {
    if (!touchStart) return;
    const touchEnd = e.targetTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (diff < -50) {
      if (panelNotasAbierto) setPanelNotasAbierto(false);
      else setMenuAbierto(true);
    }
    if (diff > 50) {
      if (menuAbierto) setMenuAbierto(false);
      else setPanelNotasAbierto(true);
    }
  };

  const bgPrincipal = temaOscuro ? 'bg-[#020813]' : 'bg-[#e2e8f0]';
  const textoPrincipal = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const bgCaja = temaOscuro ? 'bg-[#0a141d]' : 'bg-white';
  const bordeColor = temaOscuro ? 'border-gray-800' : 'border-gray-300';

  if (esRutaLogin) return <div className={`min-h-screen ${bgPrincipal}`}>{children}</div>;

  return (
    <div className={`min-h-screen ${bgPrincipal} flex flex-col md:flex-row relative overflow-hidden transition-colors duration-500`} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove}>
      <div className="md:hidden fixed inset-y-0 left-0 w-4 z-[100]" />
      <div className="md:hidden fixed inset-y-0 right-0 w-4 z-[100]" />

      {(menuAbierto || panelNotasAbierto) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] md:hidden" onClick={() => { setMenuAbierto(false); setPanelNotasAbierto(false); }} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-[100] w-72 transform transition-transform duration-300 md:relative md:translate-x-0 md:flex md:shrink-0 ${menuAbierto ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar temaOscuro={temaOscuro} alClickLink={() => setMenuAbierto(false)} />
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden p-4 md:p-6 relative z-20">
        <header className="flex justify-between items-center mb-4 shrink-0">
          <div className="md:hidden text-[10px] font-bold text-[#22d3ee] animate-pulse">→ Desliza Menú | Notas ←</div>
          
          <div className="flex items-center gap-3">
            <button onClick={() => setPanelNotasAbierto(true)} className={`md:hidden flex items-center gap-2 px-3 py-2 rounded-xl border ${bordeColor} ${bgCaja} shadow-sm transition-all z-[80] text-[#22d3ee]`}>
              <span className="text-sm">📝</span>
            </button>
            <button onClick={() => setTemaOscuro(!temaOscuro)} className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${bordeColor} ${bgCaja} shadow-sm transition-all z-[80]`}>
              <span className="text-xl">{temaOscuro ? '☀️' : '🌙'}</span>
              <span className={`hidden sm:inline text-[10px] font-black uppercase tracking-widest ${textoPrincipal}`}>Modo {temaOscuro ? 'Día' : 'Noche'}</span>
            </button>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-10">
          {children}
        </div>
      </div>

      <aside className={`fixed inset-y-0 right-0 z-[100] w-80 transform transition-transform duration-300 ${panelNotasAbierto ? 'translate-x-0' : 'translate-x-full'} ${bgCaja} border-l ${bordeColor} shadow-2xl flex flex-col`}>
        <NotebookCJ temaOscuro={temaOscuro} cerrarPanel={() => setPanelNotasAbierto(false)} />
      </aside>
    </div>
  );
}

function App() {
  const [temaOscuro, setTemaOscuro] = useState(true);
  return (
    <AuraProvider> {/* <-- ENVOLVEMOS TODA LA APP AQUÍ */}
      <BrowserRouter>
        <LayoutConSidebar temaOscuro={temaOscuro} setTemaOscuro={setTemaOscuro}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Dashboard temaOscuro={temaOscuro} setTemaOscuro={setTemaOscuro} />} />
            <Route path="/area-estudio" element={<AreaDeEstudio temaOscuro={temaOscuro} />} />
            <Route path="/ciclo-01" element={<AreaDeEstudio temaOscuro={temaOscuro} />} />
            <Route path="/ciclo-02" element={<AreaDeEstudio temaOscuro={temaOscuro} />} />
            <Route path="/ciclo-03" element={<AreaDeEstudio temaOscuro={temaOscuro} />} />
            <Route path="/ciclo-04" element={<AreaDeEstudio temaOscuro={temaOscuro} />} />
            <Route path="/ciclo-05" element={<AreaDeEstudio temaOscuro={temaOscuro} />} />
            <Route path="/ciclo-06" element={<AreaDeEstudio temaOscuro={temaOscuro} />} />
            <Route path="/base-conocimiento" element={<BaseConocimiento temaOscuro={temaOscuro} />} />
            <Route path="/biblioteca" element={<Biblioteca temaOscuro={temaOscuro} />} />
            <Route path="/multimedia" element={<Multimedia temaOscuro={temaOscuro} />} />
            <Route path="/configuracion-ia" element={<ConfiguracionAura temaOscuro={temaOscuro} />} />
          </Routes>
        </LayoutConSidebar>
      </BrowserRouter>
    </AuraProvider>
  );
}

export default App;