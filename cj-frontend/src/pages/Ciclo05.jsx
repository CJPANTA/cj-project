import { useState } from 'react';

const Ciclo05 = () => {
  const [nota, setNota] = useState('');

  const handleGuardar = () => {
    // Simulación de guardado de nota
    console.log('Apunte guardado:', nota);
  };

  const handleLimpiar = () => {
    setNota('');
  };

  return (
    <main className="min-h-screen bg-[#06101c] text-white p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 gap-6 xl:grid-cols-12">
        <section className="xl:col-span-8 bg-[#091923]/90 border border-white/10 shadow-2xl shadow-cyan-500/5 rounded-[32px] backdrop-blur-xl p-6 flex flex-col gap-6">
          <header className="flex flex-col gap-3">
            <p className="text-sm uppercase tracking-[0.35em] text-cj-cyan/70">Área de Trabajo Activa</p>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              CICLO 05 <span className="text-cj-emerald font-light">| EN CURSO</span>
            </h1>
            <p className="text-sm text-gray-400 max-w-2xl">
              Espacio principal para visualizar material académico, anotar ideas y gestionar recursos del ciclo actual.
            </p>
          </header>

          <div className="flex-1 rounded-[28px] border border-white/10 bg-[#06101c]/80 p-6 shadow-inner shadow-black/30 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.22em] text-cj-cyan border border-cj-cyan/15">
                Visor de Documentos Activo
              </div>
              <div className="rounded-3xl border border-white/10 bg-[#07131f]/80 px-5 py-12 text-center text-gray-400 shadow-lg shadow-cyan-500/5 transition-all hover:border-cj-cyan/30">
                <p className="text-xl font-semibold text-white">Visor de Documentos Activo</p>
                <p className="mt-2 text-sm text-gray-500">Aquí se cargará el visor PDF en futuras versiones.</p>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
              <div className="text-sm text-gray-400">Sube nuevo contenido de clase, apuntes o recursos multimedia.</div>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cj-cyan/15 px-6 py-3 text-sm font-bold text-cj-cyan border border-cj-cyan/20 hover:bg-cj-cyan/25 transition-all duration-200"
              >
                + Subir Nuevo Material
              </button>
            </div>
          </div>
        </section>

        <aside className="xl:col-span-4 bg-[#091923]/90 border border-white/10 shadow-2xl shadow-emerald-500/5 rounded-[32px] backdrop-blur-xl p-6 flex flex-col gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cj-emerald/70">Bloc de Notas</p>
                <h2 className="text-2xl font-black text-white">Apuntes Clínicos</h2>
              </div>
              <span className="rounded-full bg-cj-cyan/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-cj-cyan border border-cj-cyan/20">
                Rápido
              </span>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#06101c]/80 p-4">
              <textarea
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                placeholder="Escribe aquí tus apuntes clínicos..."
                className="min-h-[220px] w-full resize-none rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white placeholder:text-gray-500 focus:border-cj-emerald/40 focus:outline-none focus:ring-2 focus:ring-cj-emerald/10 transition-all"
              />
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[#06101c]/90 p-5 shadow-inner shadow-black/30">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.32em] text-gray-500">Modo Aura</p>
                <h3 className="text-lg font-bold text-white">Asistente IA</h3>
              </div>
              <button
                type="button"
                className="group inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-cj-cyan/15 text-cj-cyan border border-cj-cyan/20 shadow-lg shadow-cj-cyan/10 transition-transform duration-200 hover:scale-105 hover:bg-cj-cyan/25 hover:animate-pulse"
                aria-label="Activar modo aura"
              >
                <span className="text-2xl">🎙️</span>
              </button>
            </div>
            <p className="mt-4 text-sm leading-6 text-gray-400">
              Usa el micrófono para activar el asistente de notas y capturar ideas clínicas de forma natural.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={handleGuardar}
              className="rounded-2xl bg-cj-emerald/15 px-4 py-3 text-sm font-bold text-cj-emerald border border-cj-emerald/20 hover:bg-cj-emerald/25 transition-all"
            >
              Guardar Apunte
            </button>
            <button
              type="button"
              onClick={handleLimpiar}
              className="rounded-2xl bg-white/5 px-4 py-3 text-sm font-bold text-gray-200 border border-white/10 hover:bg-white/10 transition-all"
            >
              Limpiar
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
};

export default Ciclo05;
