// src/utils/stickmans.js
// ============================================================
// SVGs de stickman para ejercicios (versiones inicio y fin)
// Se usan tanto en el informe impreso como en la vista previa.
// ============================================================

export const NEGRO = '#334155';
export const GRIS = '#94a3b8';

export const svgBipedo = (variante) => {
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

export const svgSupino = (variante) => {
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

export const svgProno = (variante) => {
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

export const svgCuadrupedia = (variante) => {
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

export const svgSedente = (variante) => {
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

export const svgPorPosicion = (posicion, variante) => {
  switch (posicion) {
    case 'supino': return svgSupino(variante);
    case 'prono': return svgProno(variante);
    case 'cuadrupedia': return svgCuadrupedia(variante);
    case 'sedente': return svgSedente(variante);
    case 'bipedo':
    default: return svgBipedo(variante);
  }
};

export const getIconoPosicion = (posicion) => {
  const map = {
    bipedo: 'De pie',
    supino: 'Boca arriba',
    prono: 'Boca abajo',
    cuadrupedia: 'En 4 apoyos',
    sedente: 'Sentado/a',
  };
  return map[posicion] || 'De pie';
};

/**
 * Genera el HTML completo con las dos poses (inicio → fin)
 * @param {string} posicion - bipedo | supino | prono | cuadrupedia | sedente
 * @param {string} tamaño - small | medium | large
 */
export const generarStickmanEjercicio = (posicion, tamaño = 'medium') => {
  const sizes = { small: 55, medium: 90, large: 120 };
  const arrowSizes = { small: '14pt', medium: '20pt', large: '26pt' };
  const labelSizes = { small: '6pt', medium: '8pt', large: '9pt' };
  const s = sizes[tamaño] || 90;
  const a = arrowSizes[tamaño] || '20pt';
  const l = labelSizes[tamaño] || '8pt';

  const inicio = svgPorPosicion(posicion, 'inicio');
  const fin = svgPorPosicion(posicion, 'fin');

  return `
    <div style="display:flex;align-items:center;gap:6px;justify-content:center;">
      <div style="text-align:center;">
        <div style="font-size:${l};font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px;">INICIO</div>
        <svg viewBox="0 0 100 100" width="${s}" height="${s}" xmlns="http://www.w3.org/2000/svg">${inicio}</svg>
      </div>
      <div style="font-size:${a};color:#22d3ee;font-weight:900;line-height:1;">→</div>
      <div style="text-align:center;">
        <div style="font-size:${l};font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px;">FIN</div>
        <svg viewBox="0 0 100 100" width="${s}" height="${s}" xmlns="http://www.w3.org/2000/svg">${fin}</svg>
      </div>
    </div>
  `;
};