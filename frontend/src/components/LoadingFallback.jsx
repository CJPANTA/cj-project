// ============================================================
// src/components/LoadingFallback.jsx
// Pantalla de carga mientras los chunks se descargan (lazy load)
// ============================================================
export default function LoadingFallback() {
  return (
    <div className="min-h-screen bg-[#0a141d] flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-[#22d3ee]/30 border-t-[#22d3ee]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[#22d3ee] text-xl">✨</span>
        </div>
      </div>
      <p className="text-[#22d3ee] text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">
        Cargando CJ Fisio
      </p>
    </div>
  );
}