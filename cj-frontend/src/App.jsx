import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Biblioteca from './pages/Biblioteca';
import FichaClinica from './pages/FichaClinica';
import VistaCiclo from './pages/VistaCiclo';
// 👇 AQUÍ IMPORTAMOS TU NUEVA PANTALLA
import Ciclo05 from './pages/Ciclo05';

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
      <div className="min-h-screen bg-cj-dark text-white font-sans p-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 h-[85vh]">
          
          <div className="md:col-span-1">
            <Sidebar />
          </div>

          <div className="md:col-span-3">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/biblioteca" element={<Biblioteca />} />
              <Route path="/fichas" element={<FichaClinica />} />
              
              {/* LAS RUTAS DE LOS CICLOS */}
              <Route path="/ciclo-01" element={<VistaCiclo numero="01" />} />
              <Route path="/ciclo-02" element={<VistaCiclo numero="02" />} />
              <Route path="/ciclo-03" element={<VistaCiclo numero="03" />} />
              <Route path="/ciclo-04" element={<VistaCiclo numero="04" />} />
              
              {/* 👇 AQUÍ CONECTAMOS TU NUEVO DISEÑO AL CICLO 05 */}
              <Route path="/ciclo-05" element={<Ciclo05 />} />
              
              <Route path="/ciclo-06" element={<VistaCiclo numero="06" />} />
              
              <Route path="/diccionario" element={<ModuloEnConstruccion nombre="Diccionario Técnico" icono="📖" />} />
              <Route path="/multimedia" element={<ModuloEnConstruccion nombre="Multimedia y Redes" icono="🎬" />} />
              <Route path="/examen" element={<ModuloEnConstruccion nombre="Modo Examen" icono="🎯" />} />
              <Route path="/patologias" element={<ModuloEnConstruccion nombre="Patologías" icono="🦠" />} />
              <Route path="/masoterapia" element={<ModuloEnConstruccion nombre="Masoterapia" icono="🤲" />} />
              <Route path="/expedientes" element={<ModuloEnConstruccion nombre="Expedientes" icono="🗂️" />} />
              <Route path="/admin" element={<ModuloEnConstruccion nombre="Gestión de Usuarios" icono="⚙️" />} />
              
              <Route path="*" element={<ModuloEnConstruccion nombre="Ruta Desconocida" icono="❓" />} />
            </Routes>
          </div>

        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;