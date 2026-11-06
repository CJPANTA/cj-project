// src/components/icons/IconosRango.jsx
import React from 'react';

// 0 - 500 XP: Estudiante Novato
export function IconNovato({ className = "w-8 h-8" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8.5 7a3.5 3.5 0 0 1 7 0v2.2a3.5 3.5 0 0 1-7 0V7Z" />
      <path d="M8.6 7.5c1.2.1 2.1-.5 2.8-1.2.8.8 1.8 1.2 4.1 1.2" />
      <path d="m9.5 12 2.5 1.5 2.5-1.5" />
      <path d="M9.5 12c-.8.3-1.5.8-2 1.5M14.5 12c.8.3 1.5.8 2 1.5" />
      <path d="M12 15.2c-2-1.3-4.1-1.6-7-1v6c2.9-.6 5-.3 7 1" />
      <path d="M12 15.2c2-1.3 4.1-1.6 7-1v6c-2.9-.6-5-.3-7 1" />
      <path d="M12 15.2v6" />
      <path d="M7.5 16.2c1.2-.1 2.3 0 3.3.5M16.5 16.2c-1.2-.1-2.3 0-3.3.5" />
    </svg>
  );
}

// 500 - 1500 XP: Interno de Clínica
export function IconInterno({ className = "w-8 h-8" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="5.5" r="2" />
      <path d="M9.5 8c-1.4.5-2.2 1.7-2.2 3.2v2.1" />
      <path d="M14.5 8c1.4.5 2.2 1.7 2.2 3.2v2.1" />
      <path d="M10 8.2 12 10l2-1.8" />
      <path d="M12 10v2.5" />
      <circle cx="18.4" cy="13.4" r="1.3" />
      <path d="M17.2 14.1 14.8 15l-2.8-.4-2.6 1.2" />
      <path d="m9.4 15.8-1.3 1.5M14.8 15l1.1 1.6" />
      <path d="M4 17.5h16" />
      <path d="M5.5 17.5v3M18.5 17.5v3" />
      <path d="M4 16v1.5M20 16v1.5" />
      <path d="M3.5 16h17" />
    </svg>
  );
}

// 1500 - 3000 XP: Terapeuta en Práctica
export function IconTerapeuta({ className = "w-8 h-8" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="8" cy="4.5" r="1.8" />
      <path d="M7 6.3 6 11l2.5 2.1 3.1-1.4" />
      <path d="m7.2 7.5 2.5 2 2.7-.7" />
      <path d="m6 11-1.2 5.7M8.5 13.1l1.2 4.2" />
      <circle cx="16.8" cy="13" r="1.5" />
      <path d="m15.5 14-2.8 1.6-2.5-.5" />
      <path d="m15.5 14 2.6 1.3 2.2-.8" />
      <path d="m12.7 15.6-2.3 3.2M15.5 15.6l1.2 3.4" />
      <path d="m11.2 9.8 2.1 3.4" />
      <path d="M4 20h16" />
    </svg>
  );
}

// 3000+ XP: Especialista CJ (Creado basado en tu imagen)
export function IconEspecialista({ className = "w-8 h-8" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {/* Columna vertebral */}
      <path d="M12 2v12" />
      <path d="M9 4h6M9.5 6h5M9.5 8h5M9.5 10h5M9 12h6" />
      {/* Manos sosteniendo */}
      <path d="M6 14c0 2.5 2 4.5 6 4.5s6-2 6-4.5" />
      <path d="M6 14v2a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3v-2" />
      <path d="M4 16c0-2 1.5-3 3-3M20 16c0-2-1.5-3-3-3" />
    </svg>
  );
}