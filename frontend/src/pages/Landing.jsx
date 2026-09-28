// ============================================================
// src/pages/Landing.jsx
// Landing pública de CJ Fisioterapia
// ============================================================
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import Publico from '../components/landing/Publico';
import CTASection from '../components/landing/CTASection';
import Footer from '../components/landing/Footer';

export default function Landing() {
  const navigate = useNavigate();

  // Si ya está logueado → redirigir a /inicio
  useEffect(() => {
    const logueado = localStorage.getItem('usuario_cj');
    if (logueado) navigate('/inicio', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#020813] text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#020813]/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/logos_cj_circular.png"
              alt="CJ Fisioterapia"
              className="w-10 h-10 rounded-full border-2 border-[#22d3ee]/30"
            />
            <div className="leading-none">
              <h1 className="font-black text-lg tracking-wider">CJ Fisioterapia</h1>
              <span className="text-[#22d3ee] text-[8px] font-black uppercase tracking-[0.3em]">
                Ecosistema de Salud
              </span>
            </div>
          </Link>
          <Link
            to="/login"
            className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border border-[#22d3ee]/30 text-[#22d3ee] hover:bg-[#22d3ee] hover:text-black transition-all"
          >
            Iniciar sesión →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <Hero />

      {/* Features */}
      <Features />

      {/* Público objetivo */}
      <Publico />

      {/* CTA final */}
      <CTASection />

      {/* Footer */}
      <Footer />
    </div>
  );
}