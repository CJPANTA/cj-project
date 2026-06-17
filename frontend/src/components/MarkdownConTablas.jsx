import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Función para detectar y parsear tablas en texto plano
const parsearTablas = (texto) => {
  const lineas = texto.split('\n');
  let enTabla = false;
  let tablaActual = [];
  let resultado = [];
  let i = 0;
  
  while (i < lineas.length) {
    const linea = lineas[i];
    // Detectar línea que parece inicio de tabla: contiene | y al menos dos pipes
    if (linea.includes('|') && (linea.match(/\|/g) || []).length >= 2) {
      if (!enTabla) {
        enTabla = true;
        tablaActual = [];
      }
      tablaActual.push(linea);
      i++;
      continue;
    } else {
      if (enTabla) {
        // Procesar la tabla acumulada
        const tablaHtml = convertirATablaHtml(tablaActual);
        resultado.push(tablaHtml);
        enTabla = false;
        tablaActual = [];
      }
      resultado.push(linea);
      i++;
    }
  }
  if (enTabla && tablaActual.length) {
    resultado.push(convertirATablaHtml(tablaActual));
  }
  return resultado.join('\n');
};

const convertirATablaHtml = (lineasTabla) => {
  // Filtrar líneas vacías o separadores (líneas con solo |---|)
  const lineasValidas = lineasTabla.filter(l => l.trim() !== '' && !/^\|[\s\-:]+\|$/.test(l));
  if (lineasValidas.length === 0) return '';
  
  // Determinar número de columnas
  const numCols = (lineasValidas[0].match(/\|/g) || []).length - 1;
  
  let html = '<div class="overflow-x-auto my-4"><table class="min-w-full border-collapse border border-gray-300 dark:border-gray-700 text-sm">';
  
  // Procesar cada línea como fila
  lineasValidas.forEach((linea, idx) => {
    const celdas = linea.split('|').slice(1, -1).map(c => c.trim());
    while (celdas.length < numCols) celdas.push('');
    const tag = idx === 0 ? 'th' : 'td';
    html += '<tr>';
    celdas.forEach(celda => {
      html += `<${tag} class="border border-gray-300 dark:border-gray-700 p-2 ${tag === 'th' ? 'bg-gray-100 dark:bg-gray-800 font-bold' : ''}">${celda}</${tag}>`;
    });
    html += '</tr>';
  });
  
  html += '</table></div>';
  return html;
};

const MarkdownConTablas = ({ children, temaOscuro }) => {
  // Si children no es texto, renderizar normal
  if (typeof children !== 'string') {
    return <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>;
  }
  
  // Procesar el texto: reemplazar bloques de tabla por HTML
  const textoConTablasHtml = parsearTablas(children);
  
  // Ahora renderizar el HTML resultante junto con markdown normal
  // Para evitar doble renderizado, partimos el texto por los marcadores HTML insertados
  // Simplemente devolvemos un div con contenido procesado
  return (
    <div className={`prose prose-sm max-w-none ${temaOscuro ? 'prose-invert' : ''}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Asegurar que las tablas ya insertadas no se procesen de nuevo
          div: ({ node, ...props }) => {
            if (props.className?.includes('overflow-x-auto')) {
              return <div {...props} />;
            }
            return <div {...props} />;
          }
        }}
      >
        {textoConTablasHtml}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownConTablas;