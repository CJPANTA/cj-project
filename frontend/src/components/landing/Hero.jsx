// ============================================================
// src/components/landing/Hero.jsx
// ============================================================
export default function Hero() {
  const whatsappUrl =
    'https://wa.me/51970781868?text=' +
    encodeURIComponent('Hola, quiero una demo de CJ Fisioterapia');

  return (
    <section className="relative py-20 md:py-32 px-4 overflow-hidden">
      {/* Glow decorativo */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#22d3ee]/10 blur-[120px] pointer-events-none" />

      <div className="relative max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#22d3ee]/10 border border-[#22d3ee]/30 mb-6">
          <span className="w-2 h-2 rounded-full bg-[#22d3ee] animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#22d3ee]">
            Ecosistema digital para fisioterapia
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight mb-6">
          Tu clínica de fisioterapia,{' '}
          <span className="bg-gradient-to-r from-[#22d3ee] to-emerald-400 bg-clip-text text-transparent">
            ahora digital y con IA
          </span>
        </h1>

        <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Simplifica tu trabajo. Acorta tus tratamientos. Gestiona pacientes,
          sesiones, evaluaciones y equipos — <strong className="text-white">todo en un solo lugar</strong>.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 bg-[#22d3ee] text-black font-black rounded-2xl text-sm uppercase tracking-wider hover:scale-105 transition-all shadow-lg shadow-[#22d3ee]/20 flex items-center gap-2"
          >
            💬 Solicitar demo gratis
          </a>
          <a
            href="#features"
            className="px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-wider border border-white/10 text-white hover:bg-white/5 transition-all"
          >
            Ver características ↓
          </a>
        </div>

        {/* Stats mini */}
        <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto text-center">
          {[
            { n: '10x', l: 'más rápido' },
            { n: '100%', l: 'digital' },
            { n: 'IA', l: 'integrada' },
          ].map((s) => (
            <div key={s.l}>
              <p className="text-2xl md:text-3xl font-black text-[#22d3ee]">{s.n}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                {s.l}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}