// ============================================================
// src/components/landing/Publico.jsx
// ============================================================
const PUBLICOS = [
  {
    icono: '🏥',
    titulo: 'Centros y Clínicas',
    descripcion:
      'Gestiona varios terapeutas, pacientes y equipamiento desde un solo panel central.',
    puntos: [
      'Multi-sede con inventario por centro',
      'Aprobación de evaluaciones',
      'Panel del director con métricas',
    ],
  },
  {
    icono: '🩺',
    titulo: 'Fisios Independientes',
    descripcion:
      'Tu consultorio personal, con todas las herramientas de una clínica grande.',
    puntos: [
      'Tu propio espacio digital',
      'Pacientes e historial completo',
      'IA que acorta tus tratamientos',
    ],
  },
  {
    icono: '🎓',
    titulo: 'Estudiantes',
    descripcion:
      'Aprende con casos reales, simuladores y todo el material de estudio centralizado.',
    puntos: [
      'Simulador de exámenes',
      'Biblioteca y repositorio',
      'Evaluaciones guiadas paso a paso',
    ],
  },
];

export default function Publico() {
  return (
    <section className="py-20 px-4 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
            👥 ¿Para quién es?
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base">
            Un ecosistema pensado para cada perfil del mundo de la fisioterapia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PUBLICOS.map((p) => (
            <div
              key={p.titulo}
              className="p-8 rounded-3xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-[#22d3ee]/40 transition-all"
            >
              <div className="text-5xl mb-4">{p.icono}</div>
              <h3 className="text-xl font-black mb-3">{p.titulo}</h3>
              <p className="text-sm text-gray-400 mb-5 leading-relaxed">
                {p.descripcion}
              </p>
              <ul className="space-y-2">
                {p.puntos.map((pt) => (
                  <li key={pt} className="flex items-start gap-2 text-xs text-gray-300">
                    <span className="text-[#22d3ee] font-black mt-0.5">✓</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}