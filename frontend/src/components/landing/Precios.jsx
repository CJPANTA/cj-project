// src/components/landing/Precios.jsx
import React from 'react';

const PLANES = [
  {
    id: 'academia',
    nombre: 'Academia',
    descripcion: 'Para estudiantes en formación.',
    precio: 'Gratis',
    periodo: '',
    destacado: false,
    caracteristicas: [
      '✅ Acceso a Repositorio y Biblioteca',
      '✅ Contenido extra (casos clínicos, sugerencias)',
      '✅ Simulador de exámenes',
      '✅ Aura, tu asistente clínico (Límite 20 consultas/día)',
      '❌ Gestión de pacientes clínicos',
    ],
    boton: 'Crear cuenta gratis',
    link: '/login',
  },
  {
    id: 'independiente',
    nombre: 'Independiente',
    descripcion: 'Para licenciados autónomos.',
    precio: 'S/ 89',
    periodo: '/mes',
    destacado: true,
    caracteristicas: [
      '✅ Hasta 50 pacientes',
      '✅ Agenda y Sesiones SOAP',
      '✅ Informes con tu firma',
      '✅ Equipamiento propio',
      '✅ Aura, tu asistente clínico sin límites',
    ],
    boton: 'Solicitar Acceso',
    link: 'https://wa.me/51970781868?text=Hola,%20quiero%20el%20Plan%20Independiente%20de%20CJ%20Fisioterapia', // 👈 CAMBIA TU NÚMERO AQUÍ
  },
  {
    id: 'centro',
    nombre: 'Centro / Clínica',
    descripcion: 'Para equipos y clínicas.',
    precio: 'S/ 199 - 299',
    periodo: '/mes',
    destacado: false,
    caracteristicas: [
      '✅ Pacientes Ilimitados',
      '✅ Hasta 3 a 5 profesionales',
      '✅ Agenda, SOAP e Informes',
      '✅ Equipamiento de todo el centro',
      '✅ Dashboard Gerencial y Control de Personal',
      '✅ Aura, tu asistente clínico sin límites',
    ],
    boton: 'Contactar Ventas',
    link: 'https://wa.me/51987654321?text=Hola,%20quiero%20el%20Plan%20Cl%C3%ADnica%20para%20mi%20centro', // 👈 CAMBIA TU NÚMERO AQUÍ
  }
];

export default function Precios() {
  return (
    <section id="precios" className="py-24 px-4 max-w-7xl mx-auto relative z-10">
      <div className="text-center mb-16">
        <span className="text-[#22d3ee] text-xs font-black uppercase tracking-[0.2em] mb-2 block">
          Planes y Precios
        </span>
        <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
          Escala al ritmo de <span className="text-[#22d3ee]">tu clínica</span>
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Sin costos ocultos. Elige el plan que se adapte a tu etapa profesional.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {PLANES.map((plan) => (
          <div
            key={plan.id}
            className={`relative flex flex-col p-8 rounded-3xl border transition-all duration-300 ${
              plan.destacado
                ? 'bg-[#0a141d] border-[#22d3ee] shadow-2xl shadow-[#22d3ee]/20 transform md:-translate-y-4'
                : 'bg-[#0a141d]/50 border-white/10 hover:border-white/30'
            }`}
          >
            {plan.destacado && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#22d3ee] text-black px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                Recomendado
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-2">{plan.nombre}</h3>
              <p className="text-gray-400 text-sm h-10">{plan.descripcion}</p>
            </div>

            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-4xl font-black text-white">{plan.precio}</span>
              <span className="text-gray-400 text-sm font-bold">{plan.periodo}</span>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              {plan.caracteristicas.map((carac, idx) => (
                <li key={idx} className={`text-sm ${carac.startsWith('❌') ? 'text-gray-600' : 'text-gray-300'}`}>
                  {carac}
                </li>
              ))}
            </ul>

            <a
              href={plan.link}
              target={plan.link.startsWith('http') ? '_blank' : '_self'}
              rel="noreferrer"
              className={`w-full py-4 rounded-xl text-center font-black text-sm uppercase tracking-wider transition-all block ${
                plan.destacado
                  ? 'bg-[#22d3ee] text-black hover:scale-105'
                  : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
              }`}
            >
              {plan.boton}
            </a>
          </div>
        ))}
      </div>
      
      {/* Nota aclaratoria */}
      <div className="text-center mt-12">
        <p className="text-xs text-gray-500">
          * El Plan Academia está limitado a 20 consultas al Oráculo Aura al día. Los límites de pacientes y usuarios aplican por centro.
          <br />
          * ¿Necesitas un plan Enterprise con más de 10 profesionales? <a href="https://wa.me/51987654321" target="_blank" rel="noreferrer" className="text-[#22d3ee] hover:underline">Contáctanos aquí</a>.
        </p>
      </div>
    </section>
  );
}