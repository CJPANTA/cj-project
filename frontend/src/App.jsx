import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ErrorBoundary from './components/ErrorBoundary';

// Importamos el Sidebar simplificado
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import AreaDeEstudio from './pages/AreaDeEstudio';

const RutaProtegida = ({ children }) => {
  const estaLogueado = localStorage.getItem('usuario_cj');
  if (!estaLogueado) return <Navigate to="/login" replace />;
  return children;
};

function LayoutConSidebar({ children, temaOscuro, setTemaOscuro }) {
  const location = useLocation();
  const esRutaLogin = location.pathname === '/login';
  const [menuAbierto, setMenuAbierto] = useState(false);

  if (esRutaLogin) return <div className="min-h-screen bg-[#020813]">{children}</div>;

  return (
    <div className="min-h-screen bg-[#020813] flex flex-col md:flex-row">
      {/* Sidebar simplificado */}
      <div className={`
        fixed inset-y-0 left-0 z-[100] w-72 transform transition-transform duration-300
        md:relative md:translate-x-0 md:flex md:shrink-0
        ${menuAbierto ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar temaOscuro={temaOscuro} alClickLink={() => setMenuAbierto(false)} />
      </div>

      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        <header className="flex justify-between items-center mb-4">
          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="md:hidden p-2 rounded-xl bg-[#0a141d] border border-gray-800 text-[#22d3ee]"
          >
            ☰
          </button>
          <button
            onClick={() => setTemaOscuro(!temaOscuro)}
            className="px-4 py-2 bg-[#0a141d] border border-gray-800 rounded-xl text-white"
          >
            {temaOscuro ? '☀️' : '🌙'}
          </button>
        </header>
        <div className="h-full">{children}</div>
      </div>
    </div>
  );
}

function App() {
  const [temaOscuro, setTemaOscuro] = useState(true);
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <LayoutConSidebar temaOscuro={temaOscuro} setTemaOscuro={setTemaOscuro}>
          <Routes>
            <Route path="/login" element={<div>Login</div>} />
            <Route path="/" element={<RutaProtegida><Dashboard temaOscuro={temaOscuro} /></RutaProtegida>} />
            <Route path="/area-estudio" element={<RutaProtegida><AreaDeEstudio temaOscuro={temaOscuro} /></RutaProtegida>} />
          </Routes>
        </LayoutConSidebar>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;