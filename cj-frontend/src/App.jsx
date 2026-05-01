import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Biblioteca from './pages/Biblioteca';
import FichaClinica from './pages/FichaClinica';
import Ciclo05 from './pages/Ciclo05';

// Este componente ayuda a mostrar los módulos que aún estamos construyendo
const ModuloEnConstruccion = ({ nombre, icono }) => (
  <main className="bg-cj-glass backdrop-blur-md border border-white/10 rounded-3xl p-8 relative h-full shadow-2xl flex flex-col items-center justify-center text-center">
    <div className="text-7xl mb-6 animate-pulse">{icono}</div>
    <h2 className="text-3xl font-bold text-white mb-2">
      Módulo: <span className="text-cj-cyan">{nombre}</span>
    </h2>
    <p className="text-gray-400 max-w-md">Esta sección está en cola de desarrollo.</p>
  </main>
);

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-cj-dark text-white font-sans p-6 overflow-hidden">
        {/* Estructura Principal: Sidebar a la izquierda, Contenido a la derecha */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 h-[90vh]">
          
          <div className="md:col-span-1">
            <Sidebar />
          </div>

          <div className="md:col-span-3 h-full overflow-hidden">
            <Routes>
              {/* Pantalla de Inicio */}
              <Route path="/" element={<Dashboard />} />
              
              {/* Módulos de Gestión */}
              <Route path="/biblioteca" element={<Biblioteca />} />
              <Route path="/fichas" element={<FichaClinica />} />
              
              <Route path="/ciclo-:num" element={<Ciclo05 />} />
              
              {/* Módulos Adicionales (Próximamente) */}
              <Route path="/diccionario" element={<ModuloEnConstruccion nombre="Diccionario Técnico" icono="📖" />} />
              <Route path="/multimedia" element={<ModuloEnConstruccion nombre="Multimedia y Redes" icono="🎬" />} />
              <Route path="/examen" element={<ModuloEnConstruccion nombre="Modo Examen" icono="🎯" />} />
              <Route path="/patologias" element={<ModuloEnConstruccion nombre="Patologías" icono="🦠" />} />
              <Route path="/masoterapia" element={<ModuloEnConstruccion nombre="Masoterapia" icono="🤲" />} />
              <Route path="/expedientes" element={<ModuloEnConstruccion nombre="Expedientes" icono="🗂️" />} />
              <Route path="/admin" element={<ModuloEnConstruccion nombre="Gestión de Usuarios" icono="⚙️" />} />
              
              {/* Captura de errores 404 */}
              <Route path="*" element={<ModuloEnConstruccion nombre="Ruta Desconocida" icono="❓" />} />
            </Routes>
          </div>

        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;