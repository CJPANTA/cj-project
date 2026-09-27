// src/components/clinica/EjercicioPreview.jsx
import React from 'react';
import { generarStickmanEjercicio, getIconoPosicion } from '../../utils/stickmans';

/**
 * Vista previa visual de un ejercicio (inicio → fin) con su stickman.
 * Se usa en la pantalla de evaluación antes de generar el informe.
 */
export default function EjercicioPreview({
  posicion = 'bipedo',
  tamaño = 'small',
  temaOscuro = true,
  mostrarPosicion = true,
}) {
  const html = generarStickmanEjercicio(posicion, tamaño);
  const bgColor = temaOscuro ? '#0f1a24' : '#f8fafc';
  const borderColor = temaOscuro ? '#1e293b' : '#e2e8f0';
  const textColor = temaOscuro ? '#94a3b8' : '#64748b';

  return (
    <div
      className="rounded-xl border flex flex-col items-center justify-center p-1"
      style={{
        backgroundColor: bgColor,
        borderColor: borderColor,
        minWidth: tamaño === 'small' ? 130 : tamaño === 'medium' ? 200 : 280,
      }}
    >
      <div dangerouslySetInnerHTML={{ __html: html }} />
      {mostrarPosicion && (
        <div
          className="text-[8px] font-bold uppercase tracking-wider mt-0.5"
          style={{ color: textColor }}
        >
          {getIconoPosicion(posicion)}
        </div>
      )}
    </div>
  );
}