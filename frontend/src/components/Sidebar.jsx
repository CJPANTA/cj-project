import { Link } from 'react-router-dom';

export default function Sidebar({ temaOscuro, alClickLink }) {
  const bg = temaOscuro ? 'bg-[#0a141d]' : 'bg-white';
  const text = temaOscuro ? 'text-white' : 'text-black';

  return (
    <aside className={`${bg} border-r border-gray-800 rounded-3xl p-5 h-full flex flex-col shadow-2xl overflow-y-auto`}>
      <div className="mb-6">
        <h2 className={`${text} font-black text-xl`}>CJ Fisio</h2>
        <span className="text-[#22d3ee] text-[8px] font-black uppercase tracking-[0.4em]">Ecosistema de Salud</span>
      </div>

      <nav className="flex-1 space-y-2">
        <Link to="/" onClick={alClickLink} className={`block px-4 py-3 rounded-xl ${text} hover:bg-white/10`}>
          📊 Centro de Mando
        </Link>
        <Link to="/area-estudio" onClick={alClickLink} className={`block px-4 py-3 rounded-xl ${text} hover:bg-white/10`}>
          📁 Repositorio
        </Link>
        <button className="block w-full text-left px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10">
          🔒 Cerrar sesión
        </button>
      </nav>
    </aside>
  );
}