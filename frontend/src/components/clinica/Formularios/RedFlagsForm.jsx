// src/components/clinica/Formularios/RedFlagsForm.jsx
import React from 'react';

// ============================================================
// CATÁLOGO DE BANDERAS ROJAS
// ============================================================
const BANDERAS = {
  // Universales
  cancer: { label: 'Antecedente de cáncer (últimos 5 años)', grupo: 'universal' },
  anticoagulantes: { label: 'Uso de anticoagulantes (warfarina, rivaroxabán, etc.)', grupo: 'universal' },
  marcapasos: { label: 'Marcapasos o dispositivo implantado', grupo: 'universal' },
  cirugia_reciente: { label: 'Cirugía reciente (< 6 semanas) en la zona afectada', grupo: 'universal' },
  perdida_peso: { label: 'Pérdida de peso inexplicable en los últimos 3 meses', grupo: 'universal' },
  fiebre_persistente: { label: 'Fiebre o sudoración nocturna persistente', grupo: 'universal' },

  // Por sexo
  embarazo: { label: 'Embarazo o sospecha de embarazo', grupo: 'sexo' },

  // Por síntoma (tipo_dolor)
  deficit_motor: { label: 'Pérdida de fuerza o sensibilidad progresiva en extremidades', grupo: 'sintoma' },
  deficit_neuro: { label: 'Déficit neurológico progresivo (adormecimiento, entumecimiento)', grupo: 'sintoma' },

  // Por mecanismo
  trauma: { label: 'Trauma grave reciente (>1m de altura o accidente)', grupo: 'mecanismo' },

  // Por tiempo
  cronico_peso: { label: 'Pérdida de peso inexplicable asociada al dolor', grupo: 'tiempo' },

  // Por región
  esfinteres: { label: 'Pérdida de control de esfínteres (orina o heces)', grupo: 'region_lumbar' },
  silla_montar: { label: 'Alteración de sensibilidad en silla de montar', grupo: 'region_lumbar' },
  deficit_mmii: { label: 'Déficit neurológico progresivo en miembros inferiores', grupo: 'region_lumbar' },
  rigidez_nuca: { label: 'Rigidez de nuca intensa con fiebre', grupo: 'region_cervical' },
};

// ============================================================
// EVALUAR QUÉ BANDERAS APARECEN SEGÚN CONTEXTO
// ============================================================
const evaluarBanderasAplicables = (evaluacion) => {
  const ids = [];

  // Universales: siempre
  ['cancer', 'anticoagulantes', 'marcapasos', 'cirugia_reciente', 'perdida_peso', 'fiebre_persistente']
    .forEach(id => ids.push(id));

  // Sexo
  if (evaluacion.sexo === 'Femenino') ids.push('embarazo');

  // Síntomas por tipo de dolor
  const tipoDolor = evaluacion.tipo_dolor || [];
  if (tipoDolor.includes('Hormigueo') || tipoDolor.includes('Quema')) {
    ids.push('deficit_motor');
  }

  // Síntomas asociados (texto)
  const sintomas = (evaluacion.sintomas_asociados || '').toLowerCase();
  if (
    sintomas.includes('hormigueo') ||
    sintomas.includes('adormecimiento') ||
    sintomas.includes('entumecimiento') ||
    sintomas.includes('debilidad') ||
    sintomas.includes('pérdida de fuerza') ||
    sintomas.includes('perdida de fuerza')
  ) {
    ids.push('deficit_neuro');
  }

  // Mecanismo de lesión
  const mecanismo = (evaluacion.mecanismo_lesion || '').toLowerCase();
  if (
    mecanismo.includes('caida') ||
    mecanismo.includes('caída') ||
    mecanismo.includes('golpe') ||
    mecanismo.includes('accidente') ||
    mecanismo.includes('trauma')
  ) {
    ids.push('trauma');
  }

  // Tiempo de evolución (crónico)
  const tiempo = (evaluacion.tiempo_evolucion || '').toLowerCase();
  if (tiempo.includes('mes') || tiempo.includes('año') || tiempo.includes('años')) {
    ids.push('cronico_peso');
  }

  // Por región
  const regiones = evaluacion.regiones || [];
  const tieneLumbar = regiones.some(r =>
    r.includes('lumbar') || r.includes('sacro') || r.includes('coxis') || r.includes('ilion') || r.includes('isquion')
  );
  if (tieneLumbar) {
    ids.push('esfinteres');
    ids.push('silla_montar');
    ids.push('deficit_mmii');
  }

  const tieneCervical = regiones.some(r =>
    r.includes('cervical') || r.includes('cuello') || r.includes('nuca')
  );
  if (tieneCervical) {
    ids.push('rigidez_nuca');
  }

  // Deduplicar
  return [...new Set(ids)];
};

export default function RedFlagsForm({ evaluacion, handleInputChange, temaOscuro }) {
  const textoPrincipal = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const bgSubtitulo = temaOscuro ? 'bg-[#0f1a24] border-gray-700' : 'bg-gray-50 border-gray-200';

  const banderasAplicables = evaluarBanderasAplicables(evaluacion);
  const seleccionadas = evaluacion.banderas_rojas || [];

  const toggleBandera = (id) => {
    if (seleccionadas.includes(id)) {
      handleInputChange('banderas_rojas', seleccionadas.filter(x => x !== id));
    } else {
      handleInputChange('banderas_rojas', [...seleccionadas, id]);
    }
  };

  const haySeleccionadas = seleccionadas.length > 0;
  const regionesVacias = !evaluacion.regiones || evaluacion.regiones.length === 0;

  return (
    <div className="space-y-4">
      <div>
        <h3 className={`text-sm font-bold ${textoPrincipal} uppercase tracking-wider border-b border-gray-600 pb-2 mb-2`}>
          Banderas Rojas (Red Flags)
        </h3>
        <p className="text-[10px] text-gray-400 mb-4">
          Marca los signos de alarma que presente el paciente. Si marcas al menos uno, se generará una alerta en el informe clínico.
        </p>
      </div>

      {regionesVacias && (
        <div className={`p-3 rounded-xl border ${bgSubtitulo} text-[10px] text-gray-400 italic`}>
          Las banderas rojas específicas por región se activarán cuando marques las regiones afectadas en el Paso 2.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {banderasAplicables.map(id => {
          const bandera = BANDERAS[id];
          if (!bandera) return null;
          const checked = seleccionadas.includes(id);
          return (
            <label
              key={id}
              className={`flex items-start gap-2 p-3 rounded-xl border cursor-pointer transition-all text-xs ${textoPrincipal} ${
                checked
                  ? 'bg-red-500/10 border-red-500/40'
                  : temaOscuro
                  ? 'bg-black/10 border-white/10 hover:border-red-500/30'
                  : 'bg-gray-50 border-gray-200 hover:border-red-400/50'
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleBandera(id)}
                className="mt-0.5 accent-red-500 w-4 h-4 shrink-0"
              />
              <span className={checked ? 'font-bold text-red-400' : ''}>{bandera.label}</span>
            </label>
          );
        })}
      </div>

      {haySeleccionadas && (
        <div className="p-4 rounded-xl border border-red-500/40 bg-red-500/10">
          <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">
            Advertencia clínica
          </p>
          <p className="text-xs text-red-300">
            El paciente presenta {seleccionadas.length} bandera(s) roja(s). Estas condiciones pueden requerir evaluación médica previa antes de iniciar el tratamiento. Documenta tu decisión clínica y considera la derivación si corresponde.
          </p>
          <ul className="mt-2 list-disc list-inside text-xs text-red-300">
            {seleccionadas.map(id => {
              const b = BANDERAS[id];
              return b ? <li key={id}>{b.label}</li> : null;
            })}
          </ul>
        </div>
      )}
    </div>
  );
}