// ============================================================
// src/pages/Privacidad.jsx
// Política de Privacidad — Ley N° 29733 (Perú)
// ============================================================
import { Link } from 'react-router-dom';

export default function Privacidad() {
  return (
    <div className="min-h-screen bg-[#020813] text-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#020813]/80 border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/logos_cj_circular.png"
              alt="CJ"
              className="w-9 h-9 rounded-full border-2 border-[#22d3ee]/30"
            />
            <span className="font-black text-sm tracking-wider">CJ Fisioterapia</span>
          </Link>
          <Link
            to="/"
            className="text-xs font-bold text-[#22d3ee] hover:underline"
          >
            ← Volver
          </Link>
        </div>
      </nav>

      {/* Contenido */}
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-black mb-2">
          Política de Privacidad
        </h1>
        <p className="text-xs text-gray-500 mb-10">
          Conforme a la Ley N° 29733 — Ley de Protección de Datos Personales
          (Perú)
        </p>

        <div className="space-y-8 text-sm text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-lg font-black text-white mb-2">
              1. Responsable del tratamiento
            </h2>
            <p>
              CJ Fisioterapia, con contacto en{' '}
              <a
                href="mailto:cjpanta1@gmail.com"
                className="text-[#22d3ee] hover:underline"
              >
                cjpanta1@gmail.com
              </a>
              , es el responsable del tratamiento de los datos personales
              recopilados a través de la plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black text-white mb-2">
              2. Datos que recopilamos
            </h2>
            <p>Recopilamos las siguientes categorías de datos:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-400">
              <li>
                <strong className="text-white">Datos de identificación:</strong>{' '}
                nombre, apellidos, DNI, fecha de nacimiento, dirección, teléfono,
                correo electrónico.
              </li>
              <li>
                <strong className="text-white">Datos clínicos:</strong>{' '}
                diagnósticos, antecedentes médicos, evaluaciones posturales,
                sesiones de tratamiento, evolución del dolor (EVA).
              </li>
              <li>
                <strong className="text-white">Datos de uso:</strong> registros
                de acceso, actividad dentro de la plataforma, dispositivo y
                navegador.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-black text-white mb-2">
              3. Finalidad del tratamiento
            </h2>
            <p>Los datos se utilizan exclusivamente para:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-400">
              <li>Prestación del servicio clínico y académico.</li>
              <li>Generación de informes y documentos profesionales.</li>
              <li>Comunicación con el usuario sobre su tratamiento o cuenta.</li>
              <li>Mejora continua del sistema y estadísticas anónimas.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-black text-white mb-2">
              4. Confidencialidad clínica
            </h2>
            <p>
              Los datos clínicos de los pacientes están protegidos por el
              secreto profesional establecido en la Ley del Trabajo del
              Tecnólogo Médico y el Código de Ética del Colegio Tecnólogo Médico
              del Perú. Solo el personal autorizado del centro tratante puede
              acceder a ellos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black text-white mb-2">
              5. Almacenamiento y seguridad
            </h2>
            <p>
              Los datos se almacenan en servidores seguros con cifrado en
              tránsito (HTTPS) y en reposo. Aplicamos políticas de seguridad a
              nivel de fila (Row Level Security) que garantizan el aislamiento
              de la información entre distintos centros y profesionales.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black text-white mb-2">
              6. Compartición con terceros
            </h2>
            <p>
              No compartimos datos personales con terceros sin consentimiento
              expreso, salvo obligación legal o requerimiento de autoridad
              competente.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black text-white mb-2">
              7. Derechos del usuario (ARCO)
            </h2>
            <p>
              Puedes ejercer tus derechos de <strong>Acceso</strong>,{' '}
              <strong>Rectificación</strong>, <strong>Cancelación</strong> y{' '}
              <strong>Oposición</strong> al tratamiento de tus datos
              escribiendo a{' '}
              <a
                href="mailto:cjpanta1@gmail.com"
                className="text-[#22d3ee] hover:underline"
              >
                cjpanta1@gmail.com
              </a>
              . Atenderemos tu solicitud dentro de los plazos establecidos por
              la Autoridad Nacional de Protección de Datos Personales.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black text-white mb-2">
              8. Cookies
            </h2>
            <p>
              Utilizamos cookies técnicas estrictamente necesarias para mantener
              la sesión activa y garantizar el funcionamiento de la plataforma.
              No usamos cookies publicitarias ni de seguimiento de terceros.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black text-white mb-2">
              9. Conservación de datos
            </h2>
            <p>
              Los datos clínicos se conservan mientras exista la relación
              profesional-paciente y por el plazo mínimo requerido por la
              normativa peruana aplicable. Posteriormente pueden ser anonimizados
              o eliminados.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black text-white mb-2">
              10. Cambios en esta política
            </h2>
            <p>
              Nos reservamos el derecho de actualizar esta Política de
              Privacidad. Notificaremos los cambios importantes por correo
              electrónico o mediante un aviso en la plataforma.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4 mt-10">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[10px] text-gray-500">
            © {new Date().getFullYear()} CJ Fisioterapia · Todos los derechos
            reservados
          </p>
        </div>
      </footer>
    </div>
  );
}