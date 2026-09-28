// ============================================================
// src/components/landing/Features.jsx
// ============================================================
const FEATURES = [
  {
    icono: '📋',
    titulo: 'Historia clínica digital',
    descripcion:
      'Adiós al papel. Todo el historial del paciente — evaluaciones, sesiones, informes — accesible en segundos.',
  },
  {
    icono: '🧠',
    titulo: 'IA que sugiere tratamientos',
    descripcion:
      'Planes personalizados según diagnóstico, fase clínica y equipamiento real de tu centro. Ahorra tiempo, mejora resultados.',
  },
  {
    icono: '🩺',
    titulo: 'Sesiones SOAP con evolución EVA',
    descripcion:
      'Registra cada sesión en el estándar SOAP y ve gráficamente cómo evoluciona el dolor de tu paciente.',
  },
  {
    icono: '🏥',
    titulo: 'Múltiples centros en un panel',
    descripcion:
      'Ideal para cadenas de clínicas, gimnasios terapéuticos o consultorios con varias sedes.',
  },
  {
    icono: '📄',
    titulo: 'Informes legales automáticos',
    descripcion:
      'Acuerdo de servicio, informe al paciente, plan de ejercicios — generados al instante.',
  },
  {
    icono: '🎓',
    titulo: 'Academia integrada',
    descripcion:
      'Cursos, biblioteca, simulador de exámenes y herramientas de estudio para estudiantes de fisioterapia.',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 px-4 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
            ✨ ¿Qué hace CJ Fisioterapia por ti?
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base">
            Herramientas profesionales para modernizar tu consulta y multiplicar tu productividad.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.titulo}
              className="group p-6 rounded-3xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-[#22d3ee]/40 transition-all"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#22d3ee]/10 border border-[#22d3ee]/20 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                {f.icono}
              </div>
              <h3 className="text-lg font-black mb-2">{f.titulo}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                {f.descripcion}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}