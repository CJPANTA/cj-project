// ============================================================
// src/components/icons/IconIA.jsx
// Ícono de "Asistente IA" (sparkles) — usa currentColor
// ============================================================
export default function IconIA({ className = 'w-6 h-6' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Sparkle grande (izquierda) */}
      <path d="M8 2.5 L9.3 8.2 L15 9.5 L9.3 10.8 L8 16.5 L6.7 10.8 L1 9.5 L6.7 8.2 Z" />
      {/* Sparkle mediano (arriba derecha) */}
      <path d="M18 3.5 L18.8 6.2 L21.5 7 L18.8 7.8 L18 10.5 L17.2 7.8 L14.5 7 L17.2 6.2 Z" />
      {/* Sparkle pequeño (abajo derecha) */}
      <path
        d="M17.5 13.5 L18 15.5 L20 16 L18 16.5 L17.5 18.5 L17 16.5 L15 16 L17 15.5 Z"
        opacity="0.65"
      />
    </svg>
  );
}