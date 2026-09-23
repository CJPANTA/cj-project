// src/utils/generarAcuerdoServicio.js
import { supabase } from '../lib/supabaseClient';

export async function generarAcuerdoServicio(pacienteId) {
  // ===== DATOS DEL PACIENTE =====
  const { data: paciente, error: pacError } = await supabase
    .from('pacientes')
    .select('*')
    .eq('id', pacienteId)
    .single();
  if (pacError) throw pacError;
  if (!paciente) throw new Error('Paciente no encontrado.');

  // ===== DATOS DEL PROFESIONAL =====
  const { data: { user } } = await supabase.auth.getUser();
  const { data: perfil } = await supabase
    .from('profiles')
    .select('nombre_completo, centro_id, titulo_profesional, numero_colegiatura, dni, tipo_profesional, tipo_documento, registro_interno')
    .eq('id', user.id)
    .single();

  // ===== DATOS DEL CENTRO =====
  let centroNombre = 'Centro CJ';
  let centroTelefono = '';
  let centroDireccion = '';
  let logoUrl = '';
  let tipoCentro = 'gimnasio_terapeutico';

  if (perfil?.centro_id) {
    const { data: centro } = await supabase
      .from('centros')
      .select('nombre, logo_url, telefono, direccion, tipo_centro')
      .eq('id', perfil.centro_id)
      .single();
    if (centro) {
      centroNombre = centro.nombre || 'Centro CJ';
      centroTelefono = centro.telefono || '';
      centroDireccion = centro.direccion || '';
      logoUrl = centro.logo_url || '';
      tipoCentro = centro.tipo_centro || 'gimnasio_terapeutico';
    }
  }

  const esGimnasioTerapeutico = tipoCentro === 'gimnasio_terapeutico';
  const subtituloTipoCentro = esGimnasioTerapeutico ? 'Gimnasio Terapéutico' : 'Centro Fisioterapéutico';

  // ===== DATOS DEL PROFESIONAL =====
  const tipoProfesional = perfil?.tipo_profesional || 'tecnico';
  const esLicenciado = tipoProfesional === 'licenciado';
  const nombreProfesional = perfil?.nombre_completo || 'Profesional';
  const titulo = perfil?.titulo_profesional || '';
  const colegiatura = perfil?.numero_colegiatura || '';
  const dni = perfil?.dni || '';
  const registroInterno = perfil?.registro_interno || '';

  let credencialesProfesional = '';
  if (esLicenciado) {
    if (colegiatura) credencialesProfesional = `Lic. T.M. Fisioterapia — C.T.M.P. N° ${colegiatura}`;
    else credencialesProfesional = titulo || 'Licenciado en Tecnología Médica - Fisioterapia';
  } else {
    if (dni) credencialesProfesional = `Técnico en Fisioterapia y Rehabilitación — DNI: ${dni}`;
    else if (registroInterno) credencialesProfesional = `Técnico en Fisioterapia — Registro Interno: ${registroInterno}`;
    else credencialesProfesional = titulo || 'Técnico en Fisioterapia';
  }

  // ===== DATOS DEL PACIENTE =====
  const nombrePaciente = `${paciente.nombre || ''} ${paciente.apellidos || ''}`.trim() || 'Paciente';
  const dniPaciente = paciente.dni || paciente.documento || '—';
  const telefonoPaciente = paciente.telefono || '—';
  const direccionPaciente = paciente.direccion || '—';

  const fecha = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const añoActual = new Date().getFullYear();

  // ===== CONTENIDO LEGAL DIFERENCIADO =====
  // El aviso legal cambia según tipo de profesional y tipo de centro
  const tituloDocumento = esLicenciado
    ? 'Consentimiento Informado de Atención Fisioterapéutica'
    : 'Acuerdo de Servicio de Rehabilitación Funcional';

  const subtituloDocumento = esLicenciado
    ? 'Documento clínico de consentimiento para tratamiento fisioterapéutico'
    : 'Documento de acuerdo para servicios de rehabilitación funcional';

  const descripcionServicio = esLicenciado
    ? `El(la) profesional <strong>${nombreProfesional}</strong>, ${credencialesProfesional}, brindará al paciente un servicio de <strong>evaluación clínica fisioterapéutica y tratamiento fisioterapéutico</strong> que incluye: valoración funcional, diagnóstico fisioterapéutico, prescripción de agentes físicos, terapia manual, kinesiología y educación en salud, según los protocolos de la profesión y las normas legales vigentes en el Perú.`
    : `El(la) profesional <strong>${nombreProfesional}</strong>, ${credencialesProfesional}, brindará al paciente un servicio de <strong>evaluación funcional y rehabilitación física</strong> que incluye: valoración funcional, aplicación de técnicas manuales, supervisión de ejercicios terapéuticos y educación postural, basados en protocolos estándar de rehabilitación funcional.`;

  const alcanceServicio = esLicenciado
    ? `
      <li><strong>Incluye:</strong> evaluación clínica, diagnóstico fisioterapéutico, prescripción y aplicación de agentes físicos (ultrasonido, TENS, termoterapia, etc.), terapia manual, kinesiología, educación en salud y seguimiento.</li>
      <li><strong>No incluye:</strong> diagnóstico médico, prescripción de medicamentos, procedimientos quirúrgicos ni tratamientos de otras especialidades médicas.</li>
    `
    : `
      <li><strong>Incluye:</strong> evaluación funcional, aplicación de técnicas manuales de rehabilitación, supervisión de ejercicios terapéuticos, educación postural y recomendaciones de cuidados en casa.</li>
      <li><strong>No incluye:</strong> diagnóstico clínico, prescripción de medicamentos, prescripción de agentes físicos ni tratamientos invasivos. El presente documento es de <strong>carácter funcional</strong> y no constituye diagnóstico clínico ni prescripción médica.</li>
      <li><strong>Sobre agentes físicos:</strong> cualquier sugerencia de aplicación de agentes físicos (ultrasonido, TENS, termoterapia, etc.) está sujeta a validación por un <strong>Licenciado en Tecnología Médica en Fisioterapia</strong>.</li>
    `;

  const declaracionPaciente = esLicenciado
    ? `Declaro haber sido informado(a) de manera clara y comprensible sobre mi diagnóstico fisioterapéutico, el plan de tratamiento propuesto, los objetivos, los beneficios esperados, los riesgos potenciales y las alternativas de tratamiento. Autorizo al profesional mencionado a realizar las evaluaciones y aplicar los tratamientos fisioterapéuticos necesarios.`
    : `Declaro haber sido informado(a) de manera clara y comprensible sobre la naturaleza <strong>funcional</strong> del servicio, los objetivos del programa de rehabilitación, los beneficios esperados y las limitaciones del mismo. Entiendo que este servicio <strong>NO constituye diagnóstico clínico ni prescripción médica</strong> y que, de requerir diagnóstico o tratamiento médico, seré derivado(a) al profesional competente.`;

  const contenidoHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${tituloDocumento} - ${nombrePaciente}</title>
      <style>
        @page { size: A4; margin: 1.5cm 1.5cm 1cm 1.5cm; }
        * { box-sizing: border-box; }
        body {
          font-family: 'Calibri', 'Roboto', Arial, sans-serif;
          font-size: 10pt;
          line-height: 1.5;
          color: #1e293b;
          background: white;
          margin: 0;
          padding: 0;
        }
        .pagina { display: flex; flex-direction: column; min-height: 100vh; padding: 0; position: relative; }
        .contenido { flex: 1; padding-bottom: 15px; }
        .pie { text-align: center; font-size: 8pt; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 6px; margin-top: auto; width: 100%; }
        .encabezado { text-align: center; border-bottom: 3px solid #22d3ee; padding-bottom: 10px; margin-bottom: 15px; position: relative; min-height: 70px; }
        .encabezado .logo { max-width: 60px; max-height: 60px; float: left; margin-right: 12px; }
        .encabezado .logo-derecho { max-width: 50px; max-height: 50px; float: right; margin-left: 12px; }
        .encabezado .titulo { font-size: 14pt; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 1px; }
        .encabezado .subtitulo { font-size: 9pt; color: #64748b; }
        .encabezado .datos { font-size: 8pt; color: #475569; margin-top: 3px; }
        .clearfix::after { content: ""; clear: both; display: table; }
        h1 { font-size: 12pt; font-weight: 700; color: #0f172a; border-left: 4px solid #22d3ee; padding-left: 10px; margin-top: 14px; margin-bottom: 6px; text-transform: uppercase; page-break-after: avoid; }
        p { margin: 4px 0; text-align: justify; }
        ul { margin: 6px 0 6px 18px; padding: 0; }
        li { margin-bottom: 4px; }
        table { width: 100%; border-collapse: collapse; margin: 4px 0; font-size: 9pt; page-break-inside: avoid; }
        th, td { border: 1px solid #cbd5e1; padding: 4px 6px; text-align: left; vertical-align: top; }
        th { background-color: #f1f5f9; font-weight: 700; }
        .declaracion-box { background: #f0f9ff; border-left: 4px solid #22d3ee; padding: 10px 14px; border-radius: 6px; margin: 8px 0; text-align: justify; }
        .aviso-tipo { text-align: center; padding: 6px 10px; font-size: 8pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; border-radius: 4px; margin-bottom: 10px; }
        .aviso-tipo.licenciado { background: #dbeafe; color: #1e40af; border: 1px solid #93c5fd; }
        .aviso-tipo.tecnico { background: #fef3c7; color: #78350f; border: 1px solid #fcd34d; }
        .firmas-container { display: flex; justify-content: space-around; gap: 40px; margin-top: 50px; page-break-inside: avoid; }
        .firma-item { flex: 1; text-align: center; }
        .firma-item .linea { border-top: 1.5px solid #475569; margin-bottom: 4px; padding-top: 4px; }
        .firma-item .nombre { font-size: 10pt; font-weight: 700; color: #0f172a; margin: 0; }
        .firma-item .credenciales { font-size: 8pt; color: #64748b; margin: 2px 0 0 0; }
        .firma-item .rol { font-size: 9pt; color: #475569; font-weight: 600; margin: 6px 0 0 0; }
        .contacto-centro { margin-top: 20px; padding: 8px; background: #f8fafc; border-radius: 6px; font-size: 8.5pt; color: #475569; text-align: center; }
        .fecha-lugar { text-align: right; font-size: 9pt; color: #475569; margin-top: 10px; }
        .nota-legal { font-size: 8pt; color: #64748b; font-style: italic; margin-top: 8px; padding: 6px 10px; background: #f8fafc; border-radius: 4px; }
        @media print { .pagina { min-height: auto; } }
      </style>
    </head>
    <body>
      <div class="pagina">
        <div class="contenido">
          <div class="encabezado clearfix">
            ${logoUrl ? `<img src="${logoUrl}" class="logo" alt="Logo Centro" onerror="this.style.display='none'" />` : ''}
            <img src="/logos_cj_circular.png" class="logo-derecho" alt="CJ Fisioterapia" onerror="this.style.display='none'" />
            <div>
              <div class="titulo">${tituloDocumento}</div>
              <div class="subtitulo">${subtituloDocumento}</div>
              <div class="datos">${centroNombre} &nbsp;|&nbsp; Fecha: ${fecha}</div>
            </div>
          </div>

          <div class="aviso-tipo ${esLicenciado ? 'licenciado' : 'tecnico'}">
            ${esLicenciado
              ? 'Documento Clínico · Licenciado en Fisioterapia'
              : 'Documento Funcional · Técnico en Fisioterapia'}
          </div>

          <h1>1. Datos del Paciente</h1>
          <table>
            <tr><th style="width: 35%;">Nombre completo</th><td>${nombrePaciente}</td></tr>
            <tr><th>DNI / Documento</th><td>${dniPaciente}</td></tr>
            <tr><th>Teléfono</th><td>${telefonoPaciente}</td></tr>
            <tr><th>Dirección</th><td>${direccionPaciente}</td></tr>
          </table>

          <h1>2. Datos del Profesional</h1>
          <table>
            <tr><th style="width: 35%;">Nombre completo</th><td>${nombreProfesional}</td></tr>
            <tr><th>Condición profesional</th><td>${esLicenciado ? 'Licenciado en Tecnología Médica - Fisioterapia' : 'Técnico en Fisioterapia y Rehabilitación'}</td></tr>
            <tr><th>Credenciales</th><td>${credencialesProfesional}</td></tr>
            <tr><th>Centro</th><td>${centroNombre} — ${subtituloTipoCentro}</td></tr>
          </table>

          <h1>3. Descripción del Servicio</h1>
          <p>${descripcionServicio}</p>

          <h1>4. Alcance del Servicio</h1>
          <ul>
            ${alcanceServicio}
          </ul>

          <h1>5. Consentimiento y Declaración del Paciente</h1>
          <div class="declaracion-box">
            ${declaracionPaciente}
          </div>
          <p>He leído y comprendido el presente documento. Se me ha brindado la oportunidad de formular preguntas y todas ellas han sido respondidas satisfactoriamente.</p>

          <div class="nota-legal">
            <strong>Nota:</strong> El paciente puede revocar el presente consentimiento en cualquier momento mediante comunicación escrita al centro, sin necesidad de expresar causa, salvo cuando su revocación ponga en riesgo su salud.
          </div>

          <div class="fecha-lugar">
            ${centroNombre}, ${fecha}
          </div>

          <div class="firmas-container">
            <div class="firma-item">
              <div class="linea"></div>
              <p class="nombre">${nombrePaciente}</p>
              <p class="credenciales">DNI / Documento: ${dniPaciente}</p>
              <p class="rol">Paciente (o tutor/apoderado)</p>
            </div>
            <div class="firma-item">
              <div class="linea"></div>
              <p class="nombre">${nombreProfesional}</p>
              <p class="credenciales">${credencialesProfesional}</p>
              <p class="rol">${esLicenciado ? 'Profesional Licenciado' : 'Profesional Técnico'}</p>
            </div>
          </div>

          <div class="contacto-centro">
            <strong>${centroNombre}</strong>${centroNombre.toLowerCase().includes(subtituloTipoCentro.toLowerCase()) ? '' : ` — ${subtituloTipoCentro}`}
            ${centroTelefono ? `<br/>Teléfono: ${centroTelefono}` : ''}
            ${centroDireccion ? `<br/>Dirección: ${centroDireccion}` : ''}
          </div>

          <div style="text-align: center; margin-top: 15px; font-size: 9pt; color: #64748b;">
            --- Fin del documento ---
          </div>
        </div>
        <div class="pie">${tituloDocumento} - ${centroNombre} - ${añoActual}</div>
      </div>
    </body>
    </html>
  `;

  const ventana = window.open('', '_blank', 'width=800,height=600,scrollbars=yes');
  if (ventana) {
    ventana.document.title = `${tituloDocumento} - ${nombrePaciente}`;
    ventana.document.write(contenidoHTML);
    ventana.document.close();
    setTimeout(() => ventana.print(), 1000);
  } else {
    alert('Por favor, permite las ventanas emergentes para generar el documento.');
  }
}