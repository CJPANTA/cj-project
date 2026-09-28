// ============================================================
// src/pages/Terminos.jsx
// Términos y Condiciones del servicio
// ============================================================
import { Link } from 'react-router-dom';

export default function Terminos() {
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
          Términos y Condiciones
        </h1>
        <p className="text-xs text-gray-500 mb-10">
          Última actualización: {new Date().toLocaleDateString('es-ES')}
        </p>

        <div className="space-y-8 text-sm text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-lg font-black text-white mb-2">
              1. Aceptación de los términos
            </h2>
            <p>
              Al acceder o utilizar CJ Fisioterapia (en adelante, "el Servicio"),
              aceptas estos Términos y Condiciones en su totalidad. Si no estás
              de acuerdo con alguna parte, no debes usar el Servicio.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black text-white mb-2">
              2. Descripción del servicio
            </h2>
            <p>
              CJ Fisioterapia es un ecosistema digital diseñado para la gestión
              clínica, académica y administrativa de profesionales de la
              fisioterapia en Perú. Incluye herramientas como historia clínica
              digital, evaluaciones posturales, sesiones SOAP, gestión de
              equipamiento, generación de informes y módulos académicos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black text-white mb-2">
              3. Cuentas de usuario
            </h2>
            <p>
              El usuario es el único responsable de mantener la confidencialidad
              de sus credenciales de acceso (usuario y contraseña). Cualquier
              actividad realizada desde su cuenta será atribuida a su titular.
            </p>
            <p className="mt-2">
              Está prohibido compartir cuentas o permitir el acceso a terceros
              no autorizados. Las cuentas pueden ser suspendidas por uso
              indebido.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black text-white mb-2">
              4. Uso permitido
            </h2>
            <p>
              El Servicio debe usarse conforme a las leyes peruanas vigentes y
              bajo los principios de la ética profesional en salud. Queda
              expresamente prohibido:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-400">
              <li>Usar la plataforma para actividades ilícitas.</li>
              <li>Ingresar datos falsos o de terceros sin autorización.</li>
              <li>Suplantar la identidad de otro profesional.</li>
              <li>Intentar vulnerar la seguridad del sistema.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-black text-white mb-2">
              5. Responsabilidad profesional
            </h2>
            <p>
              Los diagnósticos, planes de tratamiento y decisiones clínicas
              emitidas a través de la plataforma son responsabilidad exclusiva
              del profesional de la salud que los registra. CJ Fisioterapia es
              una herramienta de apoyo y no sustituye el criterio clínico ni la
              relación profesional-paciente.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black text-white mb-2">
              6. Propiedad intelectual
            </h2>
            <p>
              Todo el contenido, diseño, código fuente, marcas y demás
              elementos del Servicio son propiedad de CJ Fisioterapia o sus
              licenciantes. No se permite su reproducción, distribución o uso
              comercial sin autorización expresa.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black text-white mb-2">
              7. Modificaciones
            </h2>
            <p>
              Nos reservamos el derecho de modificar estos Términos y
              Condiciones en cualquier momento. Los cambios serán notificados
              mediante el correo registrado o avisos dentro de la plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black text-white mb-2">
              8. Contacto
            </h2>
            <p>
              Para consultas sobre estos términos:{' '}
              <a
                href="mailto:cjpanta1@gmail.com"
                className="text-[#22d3ee] hover:underline"
              >
                cjpanta1@gmail.com
              </a>
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