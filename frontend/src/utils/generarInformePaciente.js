// src/utils/generarInformePaciente.js
import { supabase } from '../lib/supabaseClient';

// ============================================================
// STICKMAN POR POSICIÓN
// ============================================================
const NEGRO = '#334155';
const GRIS = '#94a3b8';

const svgBipedo = (variante) => {
  const brazos = variante === 'fin'
    ? `<line x1="50" y1="35" x2="25" y2="18" stroke="${NEGRO}" stroke-width="3.5" stroke-linecap="round"/>
       <line x1="50" y1="35" x2="75" y2="18" stroke="${NEGRO}" stroke-width="3.5" stroke-linecap="round"/>`
    : `<line x1="50" y1="35" x2="35" y2="52" stroke="${NEGRO}" stroke-width="3.5" stroke-linecap="round"/>
       <line x1="50" y1="35" x2="65" y2="52" stroke="${NEGRO}" stroke-width="3.5" stroke-linecap="round"/>`;
  return `
    <line x1="5" y1="92" x2="95" y2="92" stroke="${GRIS}" stroke-width="1.2" stroke-dasharray="3,3"/>
    <circle cx="50" cy="20" r="7" fill="${NEGRO}"/>
    <line x1="50" y1="27" x2="50" y2="60" stroke="${NEGRO}" stroke-width="4" stroke-linecap="round"/>
    ${brazos}
    <line x1="50" y1="60" x2="38" y2="90" stroke="${NEGRO}" stroke-width="4" stroke-linecap="round"/>
    <line x1="50" y1="60" x2="62" y2="90" stroke="${NEGRO}" stroke-width="4" stroke-linecap="round"/>
  `;
};

const svgSupino = (variante) => {
  const brazos = variante === 'fin'
    ? `<line x1="35" y1="78" x2="30" y2="55" stroke="${NEGRO}" stroke-width="3.5" stroke-linecap="round"/>
       <line x1="45" y1="78" x2="42" y2="55" stroke="${NEGRO}" stroke-width="3.5" stroke-linecap="round"/>`
    : `<line x1="35" y1="78" x2="28" y2="88" stroke="${NEGRO}" stroke-width="3.5" stroke-linecap="round"/>
       <line x1="45" y1="78" x2="38" y2="88" stroke="${NEGRO}" stroke-width="3.5" stroke-linecap="round"/>`;
  const piernas = variante === 'fin'
    ? `<line x1="70" y1="78" x2="55" y2="55" stroke="${NEGRO}" stroke-width="4" stroke-linecap="round"/>
       <line x1="72" y1="78" x2="62" y2="52" stroke="${NEGRO}" stroke-width="4" stroke-linecap="round"/>`
    : `<line x1="70" y1="78" x2="90" y2="78" stroke="${NEGRO}" stroke-width="4" stroke-linecap="round"/>
       <line x1="70" y1="78" x2="90" y2="82" stroke="${NEGRO}" stroke-width="4" stroke-linecap="round"/>`;
  return `
    <line x1="5" y1="88" x2="95" y2="88" stroke="${GRIS}" stroke-width="1.2" stroke-dasharray="3,3"/>
    <circle cx="18" cy="78" r="7" fill="${NEGRO}"/>
    <line x1="25" y1="78" x2="70" y2="78" stroke="${NEGRO}" stroke-width="4" stroke-linecap="round"/>
    ${brazos}
    ${piernas}
  `;
};

const svgProno = (variante) => {
  const brazos = variante === 'fin'
    ? `<line x1="30" y1="78" x2="10" y2="68" stroke="${NEGRO}" stroke-width="3.5" stroke-linecap="round"/>
       <line x1="30" y1="82" x2="10" y2="88" stroke="${NEGRO}" stroke-width="3.5" stroke-linecap="round"/>`
    : `<line x1="35" y1="78" x2="25" y2="88" stroke="${NEGRO}" stroke-width="3.5" stroke-linecap="round"/>
       <line x1="35" y1="82" x2="22" y2="92" stroke="${NEGRO}" stroke-width="3.5" stroke-linecap="round"/>`;
  return `
    <line x1="5" y1="90" x2="95" y2="90" stroke="${GRIS}" stroke-width="1.2" stroke-dasharray="3,3"/>
    <circle cx="18" cy="78" r="7" fill="${NEGRO}"/>
    <line x1="25" y1="78" x2="70" y2="80" stroke="${NEGRO}" stroke-width="4" stroke-linecap="round"/>
    ${brazos}
    <line x1="70" y1="80" x2="90" y2="78" stroke="${NEGRO}" stroke-width="4" stroke-linecap="round"/>
    <line x1="70" y1="80" x2="90" y2="84" stroke="${NEGRO}" stroke-width="4" stroke-linecap="round"/>
  `;
};

const svgCuadrupedia = (variante) => {
  const brazoDer = variante === 'fin'
    ? `<line x1="45" y1="45" x2="78" y2="18" stroke="${NEGRO}" stroke-width="3.5" stroke-linecap="round"/>`
    : `<line x1="45" y1="45" x2="48" y2="90" stroke="${NEGRO}" stroke-width="3.5" stroke-linecap="round"/>`;
  const piernaIzq = variante === 'fin'
    ? `<line x1="70" y1="55" x2="88" y2="90" stroke="${NEGRO}" stroke-width="4" stroke-linecap="round"/>`
    : `<line x1="70" y1="55" x2="70" y2="90" stroke="${NEGRO}" stroke-width="4" stroke-linecap="round"/>`;
  return `
    <line x1="5" y1="92" x2="95" y2="92" stroke="${GRIS}" stroke-width="1.2" stroke-dasharray="3,3"/>
    <circle cx="30" cy="35" r="7" fill="${NEGRO}"/>
    <line x1="37" y1="40" x2="70" y2="55" stroke="${NEGRO}" stroke-width="4" stroke-linecap="round"/>
    <line x1="42" y1="42" x2="38" y2="90" stroke="${NEGRO}" stroke-width="3.5" stroke-linecap="round"/>
    ${brazoDer}
    ${piernaIzq}
    <line x1="76" y1="55" x2="82" y2="90" stroke="${NEGRO}" stroke-width="4" stroke-linecap="round"/>
  `;
};

const svgSedente = (variante) => {
  const brazos = variante === 'fin'
    ? `<line x1="55" y1="35" x2="40" y2="25" stroke="${NEGRO}" stroke-width="3.5" stroke-linecap="round"/>
       <line x1="55" y1="35" x2="70" y2="25" stroke="${NEGRO}" stroke-width="3.5" stroke-linecap="round"/>`
    : `<line x1="55" y1="35" x2="42" y2="50" stroke="${NEGRO}" stroke-width="3.5" stroke-linecap="round"/>
       <line x1="55" y1="35" x2="68" y2="50" stroke="${NEGRO}" stroke-width="3.5" stroke-linecap="round"/>`;
  return `
    <line x1="5" y1="92" x2="95" y2="92" stroke="${GRIS}" stroke-width="1.2" stroke-dasharray="3,3"/>
    <line x1="70" y1="50" x2="70" y2="92" stroke="#cbd5e1" stroke-width="2"/>
    <line x1="70" y1="65" x2="95" y2="65" stroke="#cbd5e1" stroke-width="2"/>
    <line x1="95" y1="65" x2="95" y2="92" stroke="#cbd5e1" stroke-width="2"/>
    <circle cx="55" cy="20" r="7" fill="${NEGRO}"/>
    <line x1="55" y1="27" x2="60" y2="55" stroke="${NEGRO}" stroke-width="4" stroke-linecap="round"/>
    ${brazos}
    <line x1="60" y1="55" x2="85" y2="60" stroke="${NEGRO}" stroke-width="4" stroke-linecap="round"/>
    <line x1="85" y1="60" x2="85" y2="90" stroke="${NEGRO}" stroke-width="4" stroke-linecap="round"/>
  `;
};

const svgPorPosicion = (posicion, variante) => {
  switch (posicion) {
    case 'supino': return svgSupino(variante);
    case 'prono': return svgProno(variante);
    case 'cuadrupedia': return svgCuadripedia(variante);
    case 'sedente': return svgSedente(variante);
    case 'bipedo':
    default: return svgBipedo(variante);
  }
};

const getIconoPosicion = (posicion) => {
  const map = {
    bipedo: 'De pie',
    supino: 'Boca arriba',
    prono: 'Boca abajo',
    cuadrupedia: 'En 4 apoyos',
    sedente: 'Sentado/a',
  };
  return map[posicion] || 'De pie';
};

const svgEjercicio = (posicion) => {
  const inicio = svgPorPosicion(posicion, 'inicio');
  const fin = svgPorPosicion(posicion, 'fin');
  return `
    <div class="poses-container">
      <div class="pose-item">
        <div class="pose-label">INICIO</div>
        <svg viewBox="0 0 100 100" width="90" height="90" xmlns="http://www.w3.org/2000/svg">
          ${inicio}
        </svg>
      </div>
      <div class="pose-arrow">→</div>
      <div class="pose-item">
        <div class="pose-label">FIN</div>
        <svg viewBox="0 0 100 100" width="90" height="90" xmlns="http://www.w3.org/2000/svg">
          ${fin}
        </svg>
      </div>
    </div>
  `;
};

// ============================================================
// CORRECCIÓN DE TYPOS DE LA IA
// ============================================================
const corregirTypos = (texto) => {
  if (!texto) return texto;
  return texto
    .replace(/Estimamientos/gi, 'Estiramientos')
    .replace(/estimamiento/gi, 'estiramiento')
    .replace(/Susponder/gi, 'Suspender')
    .replace(/susponder/gi, 'suspender')
    .replace(/Lumbalgia mecanica/gi, 'Lumbalgia mecánica')
    .replace(/Aplicaciòn/gi, 'Aplicación')
    .replace(/aplicaciòn/gi, 'aplicación');
};

// ============================================================
// FUNCIÓN PRINCIPAL
// ============================================================
export async function generarInformePaciente(evaluacionId, estadoEvaluacion = 'borrador') {
  const { data: evaluacion, error: evalError } = await supabase
    .from('evaluaciones')
    .select('*')
    .eq('id', evaluacionId)
    .single();
  if (evalError) throw evalError;
  if (!evaluacion) throw new Error('Evaluación no encontrada.');

  const { data: pacienteData } = await supabase
    .from('pacientes')
    .select('*')
    .eq('id', evaluacion.paciente_id)
    .single();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: perfil } = await supabase
    .from('profiles')
    .select('nombre_completo, centro_id, titulo_profesional, numero_colegiatura, dni, tipo_profesional, tipo_documento, registro_interno')
    .eq('id', user.id)
    .single();

  // ============================================================
  // DETECTAR TIPO DE PROFESIONAL Y TIPO DE CENTRO
  // ============================================================
  const tipoProfesional = perfil?.tipo_profesional || 'licenciado';
  const esLicenciado = tipoProfesional === 'licenciado';
  const firmaComoTecnico = !esLicenciado;

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
  const subtituloTipoCentro = esGimnasioTerapeutico
    ? 'Gimnasio Terapéutico'
    : 'Centro Fisioterapéutico';

  const nombreCentroConTipo = centroNombre.toLowerCase().includes(subtituloTipoCentro.toLowerCase())
    ? centroNombre
    : `${centroNombre} (${subtituloTipoCentro})`;

  const nombrePaciente = pacienteData ? `${pacienteData.nombre} ${pacienteData.apellidos}` : 'Paciente';
  const fecha = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const usuario = perfil?.nombre_completo || 'Usuario';
  const titulo = perfil?.titulo_profesional || '';
  const colegiatura = perfil?.numero_colegiatura || '';
  const dni = perfil?.dni || '';
  const registroInterno = perfil?.registro_interno || '';

  let credenciales = '';
  if (firmaComoTecnico) {
    if (dni) credenciales = `Técnico en Fisioterapia y Rehabilitación — DNI: ${dni}`;
    else if (registroInterno) credenciales = `Técnico en Fisioterapia — Registro Interno: ${registroInterno}`;
    else credenciales = titulo || 'Técnico en Fisioterapia';
  } else {
    if (colegiatura) credenciales = `Lic. T.M. Fisioterapia — C.T.M.P. N° ${colegiatura}`;
    else if (titulo) credenciales = titulo;
  }

  const datosRegiones = evaluacion.datos_regiones || {};
  const diagnostico = corregirTypos(datosRegiones._diagnostico_sugerido || '');
  const recomendaciones = corregirTypos(datosRegiones._recomendaciones || '');
  const alertas = corregirTypos(datosRegiones._alertas || '');
  const planEjercicios = datosRegiones._plan_ejercicios || [];

  let badgeEstado = '';
  if (estadoEvaluacion === 'borrador') {
    badgeEstado = `<div class="badge badge-borrador">VISTA PREVIA — Evaluación no aprobada</div>`;
  } else if (estadoEvaluacion === 'pendiente') {
    badgeEstado = `<div class="badge badge-pendiente">VISTA PREVIA — Evaluación en revisión</div>`;
  } else if (estadoEvaluacion === 'rechazado') {
    badgeEstado = `<div class="badge badge-rechazado">VISTA PREVIA — Evaluación rechazada</div>`;
  }

  const badgeCentroHTML = esGimnasioTerapeutico
    ? `<div style="display:inline-block; padding:3px 10px; background:#fef3c7; color:#78350f; font-size:8pt; font-weight:700; border-radius:4px; letter-spacing:1px; text-transform:uppercase; margin:4px 0;">Gimnasio Terapéutico</div>`
    : `<div style="display:inline-block; padding:3px 10px; background:#dbeafe; color:#1e40af; font-size:8pt; font-weight:700; border-radius:4px; letter-spacing:1px; text-transform:uppercase; margin:4px 0;">Centro Fisioterapéutico</div>`;

  const TIPOS = [
    { key: 'estiramiento', titulo: 'Ejercicios de Estiramiento' },
    { key: 'fortalecimiento', titulo: 'Ejercicios de Fortalecimiento' },
    { key: 'movilidad', titulo: 'Ejercicios de Movilidad' },
    { key: 'general', titulo: 'Otros Ejercicios' },
  ];

  let ejerciciosHTML = '';
  if (planEjercicios.length > 0) {
    let contadorGlobal = 0;
    TIPOS.forEach(tipoGrupo => {
      const ejerciciosDelTipo = planEjercicios.filter(ej => (ej.tipo || 'general') === tipoGrupo.key);
      if (ejerciciosDelTipo.length === 0) return;

      ejerciciosHTML += `<h2 class="subtitulo-tipo">${tipoGrupo.titulo}</h2>`;
      ejerciciosDelTipo.forEach(ej => {
        contadorGlobal++;
        const posicion = ej.posicion || 'bipedo';
        const params = [];
        if (ej.series) params.push(`${ej.series} series`);
        if (ej.repeticiones) params.push(`${ej.repeticiones} repeticiones`);
        if (ej.duracion_segundos) params.push(`${ej.duracion_segundos} seg`);
        if (ej.frecuencia) params.push(ej.frecuencia);

        ejerciciosHTML += `
          <div class="ejercicio-card">
            <div class="ejercicio-numero">${contadorGlobal}</div>
            <div class="ejercicio-contenido">
              <div class="ejercicio-stickman">
                ${svgEjercicio(posicion)}
              </div>
              <div class="ejercicio-detalle">
                <div class="ejercicio-nombre">${corregirTypos(ej.nombre)}</div>
                <div class="ejercicio-posicion">Posición: ${getIconoPosicion(posicion)}</div>
                ${ej.descripcion_paciente ? `<div class="ejercicio-desc">${corregirTypos(ej.descripcion_paciente)}</div>` : ''}
                <div class="ejercicio-params">
                  ${params.map(p => `<span class="param-tag">${p}</span>`).join('')}
                </div>
              </div>
            </div>
          </div>
        `;
      });
    });
  } else {
    ejerciciosHTML = '<p class="campo-vacio">No se han asignado ejercicios.</p>';
  }

  const recomLines = recomendaciones.split('\n').map(l => l.trim()).filter(l => l !== '');
  let recomendacionesHTML = '';
  if (recomLines.length > 0) {
    recomendacionesHTML = `<ol class="recomendaciones-lista">${recomLines.map(l => `<li>${l}</li>`).join('')}</ol>`;
  } else {
    recomendacionesHTML = '<p class="campo-vacio">Sin recomendaciones registradas.</p>';
  }

  const alertLines = alertas.split('\n').map(l => l.trim()).filter(l => l !== '');
  let alertasHTML = '';
  if (alertLines.length > 0) {
    alertasHTML = `<ul class="alertas-lista">${alertLines.map(l => `<li>${l}</li>`).join('')}</ul>`;
  } else {
    alertasHTML = '<p class="campo-vacio">Sin alertas específicas.</p>';
  }

  const avisoLegalHTML = firmaComoTecnico
    ? `<div style="background:#fef3c7; border-left:4px solid #f59e0b; padding:10px 14px; border-radius:6px; margin-top:20px; font-size:9pt; color:#78350f;">
        <strong>AVISO:</strong> Documento funcional elaborado por un Técnico en Fisioterapia y Rehabilitación. NO constituye diagnóstico clínico ni prescripción médica. Para diagnóstico o prescripción, consulte con un <strong>Lic. T.M. Fisioterapia</strong>.
      </div>`
    : `<div style="background:#dbeafe; border-left:4px solid #3b82f6; padding:10px 14px; border-radius:6px; margin-top:20px; font-size:9pt; color:#1e40af;">
        <strong>Documento confidencial.</strong> Este plan de ejercicios forma parte del tratamiento fisioterapéutico. Consérvelo y tráigalo a su próxima cita.
      </div>`;

  const contenidoHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Plan de Ejercicios - ${nombrePaciente}</title>
      <style>
        @page { size: A4; margin: 1.5cm 1.5cm 1cm 1.5cm; }
        * { box-sizing: border-box; }
        body {
          font-family: 'Calibri', 'Roboto', Arial, sans-serif;
          font-size: 10.5pt;
          line-height: 1.5;
          color: #1e293b;
          background: white;
          margin: 0;
          padding: 0;
        }
        .pagina { display: flex; flex-direction: column; min-height: 100vh; padding: 0; page-break-after: always; position: relative; }
        .pagina:last-child { page-break-after: avoid; }
        .contenido { flex: 1; padding-bottom: 15px; }
        .pie { text-align: center; font-size: 8pt; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 6px; margin-top: auto; width: 100%; }
        .badge { text-align: center; padding: 6px 12px; font-size: 9pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; border-radius: 4px; }
        .badge-borrador { background: #dbeafe; color: #1e40af; border: 1px solid #93c5fd; }
        .badge-pendiente { background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; }
        .badge-rechazado { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
        .encabezado { text-align: center; border-bottom: 3px solid #22d3ee; padding-bottom: 12px; margin-bottom: 20px; position: relative; min-height: 80px; }
        .encabezado .logo { max-width: 70px; max-height: 70px; float: left; margin-right: 12px; }
        .encabezado .logo-derecho { max-width: 60px; max-height: 60px; float: right; margin-left: 12px; }
        .encabezado .titulo { font-size: 18pt; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 1px; }
        .encabezado .subtitulo { font-size: 10pt; color: #64748b; }
        .encabezado .datos { font-size: 9pt; color: #475569; margin-top: 4px; }
        .clearfix::after { content: ""; clear: both; display: table; }
        h1 { font-size: 14pt; font-weight: 700; color: #0f172a; border-left: 5px solid #22d3ee; padding-left: 12px; margin-top: 20px; margin-bottom: 10px; text-transform: uppercase; page-break-after: avoid; }
        h2.subtitulo-tipo {
          font-size: 12pt;
          font-weight: 700;
          color: #0891b2;
          background: #ecfeff;
          padding: 8px 14px;
          border-radius: 6px;
          margin-top: 16px;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          page-break-after: avoid;
          border-left: 4px solid #22d3ee;
        }
        .diagnostico-box { background: #f0f9ff; border-left: 4px solid #22d3ee; padding: 12px 16px; border-radius: 6px; font-size: 11pt; line-height: 1.6; }
        .ejercicio-card { display: flex; gap: 12px; padding: 12px; margin-bottom: 12px; border: 1px solid #e2e8f0; border-radius: 8px; page-break-inside: avoid; background: #fafafa; }
        .ejercicio-numero { flex: 0 0 40px; height: 40px; background: #22d3ee; color: white; font-weight: 900; font-size: 18pt; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
        .ejercicio-contenido { flex: 1; display: flex; flex-direction: column; gap: 8px; }
        .ejercicio-stickman { background: #f1f5f9; border-radius: 8px; padding: 8px; display: flex; justify-content: center; }
        .poses-container { display: flex; align-items: center; gap: 10px; }
        .pose-item { text-align: center; }
        .pose-label { font-size: 8pt; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2px; }
        .pose-arrow { font-size: 20pt; color: #22d3ee; font-weight: 900; }
        .ejercicio-detalle { flex: 1; }
        .ejercicio-nombre { font-size: 12pt; font-weight: 700; color: #0f172a; margin-bottom: 2px; }
        .ejercicio-posicion { font-size: 9pt; color: #0891b2; font-weight: 600; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
        .ejercicio-desc { font-size: 10pt; color: #475569; margin-bottom: 6px; line-height: 1.4; }
        .ejercicio-params { display: flex; flex-wrap: wrap; gap: 6px; }
        .param-tag { display: inline-block; background: #dbeafe; color: #1e40af; font-size: 8.5pt; font-weight: 700; padding: 2px 8px; border-radius: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
        .recomendaciones-lista { padding-left: 20px; font-size: 10pt; line-height: 1.6; }
        .recomendaciones-lista li { margin-bottom: 6px; }
        .alertas-lista { list-style: none; padding-left: 0; }
        .alertas-lista li { padding: 8px 12px; margin-bottom: 6px; background: #fef2f2; border-left: 3px solid #ef4444; border-radius: 4px; font-size: 10pt; }
        .alertas-lista li::before { content: "! "; color: #ef4444; font-weight: 700; }
        table.seguimiento { width: 100%; border-collapse: collapse; font-size: 9.5pt; margin: 10px 0; }
        table.seguimiento th, table.seguimiento td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
        table.seguimiento th { background: #f1f5f9; font-weight: 700; text-align: center; }
        table.seguimiento td { height: 36px; }
        .seguimiento-nota { font-size: 9pt; font-style: italic; color: #64748b; margin-top: 6px; }
        .notas-box { margin-top: 12px; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; page-break-inside: avoid; }
        .notas-box .label { font-size: 9pt; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
        .notas-box .linea { border-bottom: 1px dashed #cbd5e1; height: 22px; margin-bottom: 8px; }
        .proxima-cita { background: #ecfdf5; border: 2px dashed #10b981; padding: 16px; border-radius: 8px; text-align: center; margin: 12px 0; page-break-inside: avoid; }
        .proxima-cita .label { font-size: 9pt; font-weight: 700; color: #047857; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
        .proxima-cita .linea-fecha { font-size: 11pt; color: #064e3b; border-bottom: 1.5px solid #064e3b; padding-bottom: 4px; display: inline-block; min-width: 280px; }
        .h1-proxima-cita { page-break-after: avoid; }
        .seccion-final { page-break-inside: avoid; }
        .firma-box { margin-top: 30px; border-top: 1px solid #94a3b8; padding-top: 30px; padding-right: 60px; }
        .firma-box .firma-bloque { max-width: 320px; margin-left: auto; text-align: left; }
        .firma-box .firma-label { font-size: 9pt; color: #475569; font-weight: 600; margin: 0 0 50px 0; }
        .firma-box .firma-linea { border-top: 1.5px solid #475569; padding-top: 6px; margin: 0; }
        .firma-box .firma-nombre { font-size: 10pt; font-weight: 700; color: #0f172a; margin: 0; }
        .firma-box .firma-credenciales { font-size: 8.5pt; color: #64748b; margin: 2px 0 0 0; }
        .contacto-centro { margin-top: 20px; padding: 10px; background: #f8fafc; border-radius: 6px; font-size: 9pt; color: #475569; text-align: center; }
        .campo-vacio { color: #94a3b8; font-style: italic; }
        @media print { .pagina { min-height: auto; } }
      </style>
    </head>
    <body>
      <div class="pagina">
        <div class="contenido">
          ${badgeEstado}
          <div class="encabezado clearfix">
            ${logoUrl ? `<img src="${logoUrl}" class="logo" alt="Logo Centro" onerror="this.style.display='none'" />` : ''}
            <img src="/logos_cj_circular.png" class="logo-derecho" alt="CJ Fisioterapia" onerror="this.style.display='none'" />
            <div>
              <div class="titulo">Plan de Ejercicios y Cuidados en Casa</div>
              <div class="subtitulo">${centroNombre}</div>
              <div style="text-align:center;">${badgeCentroHTML}</div>
              <div class="datos">Paciente: ${nombrePaciente} &nbsp;|&nbsp; Fecha: ${fecha}</div>
            </div>
          </div>

          <h1>1. Tu Diagnóstico</h1>
          <div class="diagnostico-box">
            ${diagnostico || '<span class="campo-vacio">Diagnóstico pendiente de registro.</span>'}
          </div>

          <h1>2. Antes de Empezar</h1>
          <div style="background:#f0f9ff; border-left:4px solid #22d3ee; padding:10px 14px; border-radius:6px; margin-bottom:10px;">
            <ul style="margin:0; padding-left:20px; font-size:9.5pt; line-height:1.55; color:#1e293b;">
              <li>Realiza los ejercicios en un lugar tranquilo, sin prisa.</li>
              <li>Usa ropa cómoda y, si es necesario, una silla firme o colchoneta.</li>
              <li>Nunca fuerces el movimiento. Trabaja dentro de un rango cómodo.</li>
              <li><strong>Detente y consulta</strong> si sientes dolor intenso (más de 5/10).</li>
              <li>Calienta 2-3 minutos antes (caminando o moviendo las articulaciones suavemente).</li>
            </ul>
          </div>

          <h1>3. Tus Ejercicios</h1>
          <p style="font-size:10pt; color:#475569; margin-bottom:12px;">
            Realiza estos ejercicios en casa siguiendo las indicaciones. Si sientes dolor intenso, detente y consulta a tu terapeuta.
          </p>
          ${ejerciciosHTML}

          ${planEjercicios.length > 0 ? `
            <div style="margin-top:20px; padding:12px 14px; background:#fef3c7; border-left:4px solid #f59e0b; border-radius:6px; page-break-inside:avoid;">
              <div style="font-size:10pt; font-weight:700; color:#78350f; margin-bottom:6px;">💡 Cómo sé que lo hago bien:</div>
              <ul style="margin:0; padding-left:20px; font-size:9pt; line-height:1.55; color:#78350f;">
                <li>Sientes un estiramiento o esfuerzo leve, no dolor agudo.</li>
                <li>Puedes respirar con normalidad durante el ejercicio.</li>
                <li>Al terminar, la zona se siente "trabajada" pero no adolorida.</li>
                <li>Si sientes dolor que sube de 5/10, reduce el rango o detente.</li>
              </ul>
            </div>
          ` : ''}
        </div>
        <div class="pie">Plan de Ejercicios — ${centroNombre} — Página 1</div>

        <div style="margin-top:12px; padding:12px 14px; background:#fef2f2; border-left:4px solid #ef4444; border-radius:6px; page-break-inside:avoid;">
  <div style="font-size:10pt; font-weight:700; color:#991b1b; margin-bottom:6px;">⚠️ Evita estos errores:</div>
  <ul style="margin:0; padding-left:20px; font-size:9pt; line-height:1.55; color:#991b1b;">
    <li>No hagas los ejercicios rápido ni con rebotes.</li>
    <li>No aguantes la respiración durante el esfuerzo.</li>
    <li>No ignores el dolor "para terminar la serie".</li>
    <li>No hagas los ejercicios si tienes fiebre o inflamación aguda nueva.</li>
  </ul>
</div>

      <div class="pagina">
        <div class="contenido">
          <<h1>4. Cuidados en Casa</h1>
          <p style="font-size:10pt; color:#475569; margin-bottom:10px;">
            Estas recomendaciones complementan tu tratamiento y ayudan a una mejor recuperación.
          </p>
          ${recomendacionesHTML}

          <h1>4. Cuándo Consultar</h1>
          ${alertasHTML}

          <h1>5. Mi Seguimiento Semanal</h1>
          <table class="seguimiento">
            <thead>
              <tr>
                <th style="width: 15%;">Día</th>
                <th style="width: 15%;">¿Hice los ejercicios?</th>
                <th style="width: 45%;">¿Cómo me sentí?</th>
                <th style="width: 25%;">Nivel de dolor (0-10)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Lunes</td><td>[ ] Sí [ ] No</td><td></td><td></td></tr>
              <tr><td>Martes</td><td>[ ] Sí [ ] No</td><td></td><td></td></tr>
              <tr><td>Miércoles</td><td>[ ] Sí [ ] No</td><td></td><td></td></tr>
              <tr><td>Jueves</td><td>[ ] Sí [ ] No</td><td></td><td></td></tr>
              <tr><td>Viernes</td><td>[ ] Sí [ ] No</td><td></td><td></td></tr>
              <tr><td>Sábado</td><td>[ ] Sí [ ] No</td><td></td><td></td></tr>
              <tr><td>Domingo</td><td>[ ] Sí [ ] No</td><td></td><td></td></tr>
            </tbody>
          </table>
          <p class="seguimiento-nota">Trae este documento a tu próxima cita para revisar tu progreso juntos.</p>

          <div class="notas-box">
            <div class="label">Mis Notas</div>
            <div class="linea"></div>
            <div class="linea"></div>
            <div class="linea"></div>
          </div>

          <div class="seccion-final">
            <h1 class="h1-proxima-cita">6. Próxima Cita</h1>
            <div class="proxima-cita">
              <div class="label">Fecha sugerida</div>
              <div class="linea-fecha">&nbsp;</div>
            </div>

            <div class="firma-box">
              <div class="firma-bloque">
                <p class="firma-label">${firmaComoTecnico ? 'Firma del profesional técnico:' : 'Firma del profesional:'}</p>
                <div class="firma-linea">
                  <p class="firma-nombre">${usuario}</p>
                  ${credenciales ? `<p class="firma-credenciales">${credenciales}</p>` : ''}
                </div>
              </div>
            </div>
          </div>

          ${avisoLegalHTML}

          <div class="contacto-centro">
            <strong>${centroNombre}</strong>${centroNombre.toLowerCase().includes(subtituloTipoCentro.toLowerCase()) ? '' : ` — ${subtituloTipoCentro}`}
            ${centroTelefono ? `<br/>Teléfono: ${centroTelefono}` : ''}
            ${centroDireccion ? `<br/>Dirección: ${centroDireccion}` : ''}
          </div>

          <div style="text-align: center; margin-top: 15px; font-size: 9pt; color: #64748b;">
            --- Fin del plan ---
          </div>
        </div>
        <div class="pie">Plan de Ejercicios — ${centroNombre} — Página 2</div>
      </div>
    </body>
    </html>
  `;

  const ventana = window.open('', '_blank', 'width=800,height=600,scrollbars=yes');
  if (ventana) {
    ventana.document.title = `Plan de Ejercicios - ${nombrePaciente}`;
    ventana.document.write(contenidoHTML);
    ventana.document.close();
    setTimeout(() => ventana.print(), 1000);
  } else {
    alert('Por favor, permite las ventanas emergentes para generar el informe.');
  }
}