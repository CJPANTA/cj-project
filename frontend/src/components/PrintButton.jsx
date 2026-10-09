// ============================================================
// src/components/PrintButton.jsx
// Botón reutilizable de impresión.
// Usa el sistema unificado de printService.js
// ============================================================
import { useState } from 'react';
import { generarPDF } from '../utils/printService';

/**
 * Props:
 *   titulo       {string}   Título del documento
 *   subtitulo    {string}   Bajada opcional
 *   contenido    {string}   HTML ya construido (usa mdAHtml si es markdown)
 *   metadata     {object}   { fecha, autor, centro, extra: [] }
 *   icon         {string}   Emoji por defecto '🖨️'
 *   label        {string}   Si se pasa, muestra texto al lado del icono
 *   className    {string}   Clases Tailwind del botón (por defecto: circular oscuro)
 *   title        {string}   Tooltip (por defecto 'Imprimir')
 *   disabled     {boolean}
 *   onBefore     {function} Callback antes de abrir la ventana
 *   onAfter      {function} Callback después de abrir
 */
export default function PrintButton({
  titulo,
  subtitulo = '',
  contenido,
  metadata = {},
  icon = '🖨️',
  label,
  className = 'p-2 rounded-full bg-slate-700 text-white hover:bg-slate-600 transition-all disabled:opacity-50',
  title = 'Imprimir',
  disabled = false,
  onBefore,
  onAfter,
}) {
  const [generando, setGenerando] = useState(false);

  const handleClick = () => {
    if (disabled || generando) return;
    setGenerando(true);
    try {
      onBefore?.();
      const ok = generarPDF({ titulo, subtitulo, contenido, metadata });
      if (ok) onAfter?.();
    } catch (err) {
      console.error('❌ PrintButton error:', err);
      alert('Error al generar el documento. Intenta de nuevo.');
    } finally {
      setTimeout(() => setGenerando(false), 400);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || generando}
      className={className}
      title={title}
    >
      {generando ? '⏳' : label ? `${icon} ${label}` : icon}
    </button>
  );
}