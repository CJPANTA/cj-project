// ============================================================
// src/components/landing/Footer.jsx
// ============================================================
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-10 px-4 mt-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Marca */}
          <div className="flex items-center gap-3">
            <img
              src="/logos_cj_circular.png"
              alt="CJ Fisioterapia"
              className="w-9 h-9 rounded-full border-2 border-[#22d3ee]/30"
            />
            <div>
              <p className="text-sm font-black">CJ Fisioterapia</p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500">
                Ecosistema de Salud
              </p>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs">
            <a
              href="mailto:cjpanta1@gmail.com"
              className="text-gray-400 hover:text-[#22d3ee] transition-colors"
            >
              📧 Contacto
            </a>
            <a
              href="https://wa.me/51970781868"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-[#22d3ee] transition-colors"
            >
              💬 WhatsApp
            </a>
            <Link
              to="/terminos"
              className="text-gray-400 hover:text-[#22d3ee] transition-colors"
            >
              Términos
            </Link>
            <Link
              to="/privacidad"
              className="text-gray-400 hover:text-[#22d3ee] transition-colors"
            >
              Privacidad
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-3 text-[10px] text-gray-500">
          <p>© {new Date().getFullYear()} CJ Fisioterapia. Todos los derechos reservados.</p>
          <p>Hecho con 💙 en Perú</p>
        </div>
      </div>
    </footer>
  );
}