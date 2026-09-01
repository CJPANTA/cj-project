// src/components/clinica/Stickman.jsx
import React from 'react';

export default function Stickman({
  // Coordenadas relativas (0-100) para cada articulación
  cabeza = { cx: 50, cy: 15, r: 8 },
  tronco = { x1: 50, y1: 22, x2: 50, y2: 55 },
  brazoIzq = { x1: 50, y1: 30, x2: 30, y2: 45 },
  brazoDer = { x1: 50, y1: 30, x2: 70, y2: 45 },
  piernaIzq = { x1: 50, y1: 55, x2: 35, y2: 85 },
  piernaDer = { x1: 50, y1: 55, x2: 65, y2: 85 },
  color = '#22d3ee',
  tamaño = 200,
  strokeWidth = 4,
}) {
  return (
    <svg viewBox="0 0 100 100" width={tamaño} height={tamaño} style={{ display: 'block' }}>
      {/* Cabeza */}
      <circle cx={cabeza.cx} cy={cabeza.cy} r={cabeza.r} fill="none" stroke={color} strokeWidth={strokeWidth} />
      
      {/* Tronco */}
      <line x1={tronco.x1} y1={tronco.y1} x2={tronco.x2} y2={tronco.y2} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      
      {/* Brazos */}
      <line x1={brazoIzq.x1} y1={brazoIzq.y1} x2={brazoIzq.x2} y2={brazoIzq.y2} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <line x1={brazoDer.x1} y1={brazoDer.y1} x2={brazoDer.x2} y2={brazoDer.y2} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      
      {/* Piernas */}
      <line x1={piernaIzq.x1} y1={piernaIzq.y1} x2={piernaIzq.x2} y2={piernaIzq.y2} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <line x1={piernaDer.x1} y1={piernaDer.y1} x2={piernaDer.x2} y2={piernaDer.y2} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}