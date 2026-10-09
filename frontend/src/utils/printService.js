// ============================================================
// src/utils/printService.js
// Sistema unificado de impresión para toda la app.
//
// ENFOQUE: window.print() + @page (NO usa jsPDF / html2canvas).
// El navegador se encarga de:
//   - Paginar correctamente (texto seleccionable)
//   - Respetar márgenes A4 (1.5cm arriba / 1cm abajo)
//   - Evitar cortes en tablas/imágenes (page-break-inside: avoid)
//
// USO BÁSICO:
//   generarPDF({
//     titulo: 'Protocolo — Epicondilitis',
//     subtitulo: 'CJ Fisioterapia · Clínica',
//     contenido: mdAHtml(respuestaIA),
//     metadata: { fecha: '09/10/2026', autor: 'Aura IA' }
//   });
// ============================================================

// ============================================================
// CSS BASE — Se inyecta en la ventana de impresión
// ============================================================
export const estilosPrint = `
  @page {
    size: A4 portrait;
    margin: 1.5cm 1.5cm 1cm 1.5cm;
  }

  * { box-sizing: border-box; }

  html, body {
    margin: 0;
    padding: 0;
    background: #ffffff;
    color: #1e293b;
    font-family: 'Calibri', 'Roboto', 'Segoe UI', Arial, sans-serif;
    font-size: 10.5pt;
    line-height: 1.55;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* ---- Encabezado ---- */
  .encabezado {
    border-bottom: 3px solid #22d3ee;
    padding-bottom: 12px;
    margin-bottom: 18px;
    text-align: center;
  }
  .encabezado .titulo {
    font-size: 18pt;
    font-weight: 700;
    color: #0f172a;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin: 0;
  }
  .encabezado .subtitulo {
    font-size: 11pt;
    color: #0891b2;
    font-weight: 600;
    margin-top: 4px;
  }
  .encabezado .meta {
    font-size: 9pt;
    color: #64748b;
    margin-top: 6px;
  }

  /* ---- Títulos internos ---- */
  h1 {
    font-size: 14pt;
    font-weight: 700;
    color: #0f172a;
    border-left: 5px solid #22d3ee;
    padding-left: 12px;
    margin: 18px 0 10px 0;
    text-transform: uppercase;
    page-break-after: avoid;
    break-after: avoid;
  }
  h2 {
    font-size: 12pt;
    font-weight: 700;
    color: #0891b2;
    margin: 14px 0 8px 0;
    page-break-after: avoid;
    break-after: avoid;
  }
  h3 {
    font-size: 11pt;
    font-weight: 700;
    color: #0f172a;
    margin: 12px 0 6px 0;
    page-break-after: avoid;
    break-after: avoid;
  }
  h4, h5, h6 {
    font-size: 10.5pt;
    font-weight: 700;
    color: #0f172a;
    margin: 10px 0 4px 0;
  }

  p { margin: 6px 0; }

  /* ---- Tablas ---- */
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 9.5pt;
    margin: 12px 0;
    table-layout: fixed;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  th, td {
    border: 1px solid #cbd5e1;
    padding: 6px 10px;
    text-align: left;
    vertical-align: top;
    word-break: break-word;
    overflow-wrap: anywhere;
  }
  th {
    background: #f1f5f9;
    font-weight: 700;
    color: #0f172a;
  }
  tr {
    page-break-inside: avoid;
    break-inside: avoid;
  }

  /* ---- Listas ---- */
  ul, ol {
    margin: 6px 0;
    padding-left: 22px;
  }
  li {
    margin-bottom: 3px;
    page-break-inside: avoid;
  }

  /* ---- Imágenes ---- */
  img {
    max-width: 100%;
    height: auto;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  /* ---- Tarjetas (catálogos, fichas) ---- */
  .card {
    border: 1px solid #e2e8f0;
    border-left: 4px solid #22d3ee;
    border-radius: 6px;
    padding: 10px 12px;
    margin-bottom: 8px;
    background: #fafafa;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .card-titulo {
    font-size: 11pt;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 2px;
  }
  .card-sub {
    font-size: 9pt;
    color: #64748b;
    font-style: italic;
  }
  .card-meta {
    font-size: 9pt;
    color: #0891b2;
    margin-top: 4px;
    font-weight: 600;
  }
  .badge {
    display: inline-block;
    font-size: 8pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 2px 8px;
    border-radius: 10px;
    background: #e0f2fe;
    color: #0369a1;
    margin-top: 4px;
  }

  /* ---- Pie de página ---- */
  .pie {
    text-align: center;
    font-size: 8pt;
    color: #94a3b8;
    border-top: 1px solid #e2e8f0;
    padding-top: 6px;
    margin-top: 24px;
  }

  hr {
    border: none;
    border-top: 1px solid #e2e8f0;
    margin: 14px 0;
  }

  /* ---- Utilidades de salto ---- */
  .evitar-corte { page-break-inside: avoid; break-inside: avoid; }
  .salto-antes  { page-break-before: always; break-before: page; }
  .salto-despues { page-break-after: always; break-after: page; }

  @media print {
    .no-print { display: none !important; }
    a { color: #1e293b; text-decoration: none; }
  }
`;

// ============================================================
// SANITIZAR HTML — elimina scripts, iframes, on* handlers
// ============================================================
export function sanitizarContenido(html) {
  if (!html) return '';
  return String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/\son\w+\s*=\s*'[^']*'/gi, '')
    .replace(/javascript:/gi, '');
}

// ============================================================
// DETECTAR SALTOS DE PÁGINA
// - Por defecto: nada (el CSS global ya evita cortes feos).
// - Con { saltosPorH1: true }: fuerza salto antes de cada H1
//   (excepto el primero). Útil para informes largos.
// ============================================================
export function detectarSaltosPagina(html, { saltosPorH1 = false } = {}) {
  if (!html) return html;
  if (!saltosPorH1) return String(html);

  let primero = true;
  return String(html).replace(/<h1(\s[^>]*)?>/gi, (match) => {
    if (primero) {
      primero = false;
      return match;
    }
    if (/class\s*=\s*["']/.test(match)) {
      return match.replace(/class\s*=\s*["']([^"']*)["']/, 'class="$1 salto-antes"');
    }
    return match.replace(/>$/, ' class="salto-antes">');
  });
}

// ============================================================
// MARKDOWN → HTML  (string-based, para ventana de impresión)
// Soporta: # ## ###, **bold**, *italic*, listas, tablas, links,
//          `code`, > citas, --- separadores.
// ============================================================
function inlineMd(texto) {
  if (!texto) return '';
  let t = String(texto);
  t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/__(.+?)__/g, '<strong>$1</strong>');
  t = t.replace(/\*(.+?)\*/g, '<em>$1</em>');
  t = t.replace(/_(.+?)_/g, '<em>$1</em>');
  t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
  t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  return t;
}

export function mdAHtml(texto) {
  if (!texto) return '';
  const lineas = String(texto).split('\n');
  const out = [];
  let i = 0;

  while (i < lineas.length) {
    const linea = lineas[i];

    // --- Tabla markdown ---
    if (linea.trim().startsWith('|') && linea.trim().endsWith('|')) {
      const filas = [];
      while (
        i < lineas.length &&
        lineas[i].trim().startsWith('|') &&
        lineas[i].trim().endsWith('|')
      ) {
        filas.push(lineas[i].trim());
        i++;
      }
      const celdas = filas.map((f) =>
        f.split('|').slice(1, -1).map((c) => c.trim())
      );
      if (celdas.length) {
        const headers = celdas[0];
        let datos = celdas.slice(1);
        // Saltar línea separadora (|---|---|)
        if (datos.length && datos[0].every((c) => /^[-:]+$/.test(c))) {
          datos = datos.slice(1);
        }
        out.push('<table><thead><tr>');
        headers.forEach((h) => out.push(`<th>${inlineMd(h)}</th>`));
        out.push('</tr></thead><tbody>');
        datos.forEach((fila) => {
          out.push('<tr>');
          fila.forEach((c) => out.push(`<td>${inlineMd(c)}</td>`));
          out.push('</tr>');
        });
        out.push('</tbody></table>');
      }
      continue;
    }

    // --- Headers ---
    const h = linea.match(/^(#{1,6})\s+(.+)$/);
    if (h) {
      const nivel = h[1].length;
      out.push(`<h${nivel}>${inlineMd(h[2])}</h${nivel}>`);
      i++;
      continue;
    }

    // --- Separador horizontal ---
    if (/^\s*[-*_]{3,}\s*$/.test(linea)) {
      out.push('<hr>');
      i++;
      continue;
    }

    // --- Cita ---
    if (/^\s*>\s?/.test(linea)) {
      const citas = [];
      while (i < lineas.length && /^\s*>\s?/.test(lineas[i])) {
        citas.push(lineas[i].replace(/^\s*>\s?/, ''));
        i++;
      }
      out.push(`<blockquote>${inlineMd(citas.join(' '))}</blockquote>`);
      continue;
    }

    // --- Lista con viñetas ---
    if (/^\s*[-*+]\s+/.test(linea)) {
      out.push('<ul>');
      while (i < lineas.length && /^\s*[-*+]\s+/.test(lineas[i])) {
        out.push(`<li>${inlineMd(lineas[i].replace(/^\s*[-*+]\s+/, ''))}</li>`);
        i++;
      }
      out.push('</ul>');
      continue;
    }

    // --- Lista numerada ---
    if (/^\s*\d+\.\s+/.test(linea)) {
      out.push('<ol>');
      while (i < lineas.length && /^\s*\d+\.\s+/.test(lineas[i])) {
        out.push(`<li>${inlineMd(lineas[i].replace(/^\s*\d+\.\s+/, ''))}</li>`);
        i++;
      }
      out.push('</ol>');
      continue;
    }

    // --- Línea vacía ---
    if (linea.trim() === '') {
      i++;
      continue;
    }

    // --- Párrafo ---
    out.push(`<p>${inlineMd(linea)}</p>`);
    i++;
  }

  return out.join('\n');
}

// ============================================================
// HELPER — Construir HTML de catálogo (Biblioteca/Repositorio)
// items: [{ titulo, subtitulo, meta, badge }]
// ============================================================
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function catalogoAHtml(items = []) {
  if (!Array.isArray(items) || items.length === 0) {
    return '<p style="text-align:center;color:#94a3b8;font-style:italic;">Sin elementos para mostrar.</p>';
  }
  return items
    .map(
      (it) => `
      <div class="card">
        <div class="card-titulo">${escapeHtml(it.titulo || '')}</div>
        ${it.subtitulo ? `<div class="card-sub">${escapeHtml(it.subtitulo)}</div>` : ''}
        ${it.meta ? `<div class="card-meta">${escapeHtml(it.meta)}</div>` : ''}
        ${it.badge ? `<div><span class="badge">${escapeHtml(it.badge)}</span></div>` : ''}
      </div>
    `
    )
    .join('');
}

// ============================================================
// FUNCIÓN PRINCIPAL — generarPDF()
// ============================================================
export function generarPDF({
  titulo = 'Documento',
  subtitulo = '',
  contenido = '',
  metadata = {},
  saltosPorH1 = false,
}) {
  // 1. Preparar cuerpo
  let cuerpo = sanitizarContenido(contenido);
  cuerpo = detectarSaltosPagina(cuerpo, { saltosPorH1 });

  // 2. Metadatos del encabezado
  const metaPartes = [];
  if (metadata.fecha) metaPartes.push(`Fecha: ${metadata.fecha}`);
  if (metadata.autor) metaPartes.push(`Por: ${metadata.autor}`);
  if (metadata.centro) metaPartes.push(metadata.centro);
  if (Array.isArray(metadata.extra)) metaPartes.push(...metadata.extra);
  const metaHTML = metaPartes.length
    ? `<div class="meta">${metaPartes.map(escapeHtml).join(' &nbsp;|&nbsp; ')}</div>`
    : '';

  // 3. Documento completo
  const fechaGen = new Date().toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(titulo)}</title>
  <style>${estilosPrint}</style>
</head>
<body>
  <div class="encabezado">
    <div class="titulo">${escapeHtml(titulo)}</div>
    ${subtitulo ? `<div class="subtitulo">${escapeHtml(subtitulo)}</div>` : ''}
    ${metaHTML}
  </div>

  <div class="cuerpo">
    ${cuerpo}
  </div>

  <div class="pie">
    ${escapeHtml(titulo)} &nbsp;·&nbsp; Generado el ${fechaGen} &nbsp;·&nbsp; CJ Fisioterapia
  </div>
</body>
</html>`;

  // 4. Abrir ventana
  const ventana = window.open('', '_blank', 'width=900,height=720,scrollbars=yes');
  if (!ventana) {
    alert(
      'No se pudo abrir la ventana de impresión.\n\n' +
        'Permite las ventanas emergentes para este sitio e inténtalo de nuevo.'
    );
    return false;
  }

  ventana.document.open();
  ventana.document.title = titulo;
  ventana.document.write(html);
  ventana.document.close();

  // 5. Disparar diálogo de impresión (con delay para que cargue el layout)
  const lanzarPrint = () => {
    try {
      ventana.focus();
      ventana.print();
    } catch (err) {
      console.warn('print() falló, reintentando…', err);
      setTimeout(() => {
        try { ventana.focus(); ventana.print(); } catch (_) {}
      }, 500);
    }
  };

  // Doble intento: por si onload ya pasó antes del setTimeout
  if (ventana.document.readyState === 'complete') {
    setTimeout(lanzarPrint, 250);
  } else {
    ventana.addEventListener('load', () => setTimeout(lanzarPrint, 250));
    // Fallback por si load nunca dispara (raro)
    setTimeout(lanzarPrint, 900);
  }

  return true;
}