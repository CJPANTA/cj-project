// ============================================================
// src/components/landing/CTASection.jsx
// ============================================================
export default function CTASection() {
  const whatsappUrl =
    'https://wa.me/51970781868?text=' +
    encodeURIComponent('Hola, quiero una demo de CJ Fisioterapia');

  return (
    <section className="py-20 px-4 relative">
      <div className="max-w-4xl mx-auto">
        <div className="relative rounded-3xl border border-[#22d3ee]/30 bg-gradient-to-br from-[#22d3ee]/10 via-transparent to-emerald-500/10 p-10 md:p-14 text-center overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#22d3ee]/20 blur-[100px] pointer-events-none" />

          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
              🚀 ¿Listo para modernizar tu consulta?
            </h2>
            <p className="text-gray-300 max-w-xl mx-auto mb-8 text-sm md:text-base">
              Agenda una demo gratuita. Te respondemos hoy mismo por WhatsApp
              y te mostramos el sistema en acción.
            </p>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#22d3ee] text-black font-black rounded-2xl text-sm uppercase tracking-wider hover:scale-105 transition-all shadow-lg shadow-[#22d3ee]/20"
            >
              💬 Solicitar demo gratis
            </a>

            <p className="text-[10px] text-gray-500 mt-6 uppercase tracking-widest">
              Sin tarjeta de crédito · Atención personalizada
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}