import React from 'react';
import { TIPOS_FORMULARIO } from './plantillas';

export default function AnamnesisForm({
  evaluacion,
  handleInputChange,
  iniciarDictado,
  escuchando,
  campoActivo,
  temaOscuro,
  tipoFormulario,
  setTipoFormulario,
  setPaso,
}) {
  const bgInput = temaOscuro ? 'bg-black/20 border-white/10 text-white' : 'bg-gray-100 border-gray-300 text-[#0f172a]';
  const textoPrincipal = temaOscuro ? 'text-white' : 'text-[#0f172a]';

  const toggleTipo = (tipoKey) => {
    if (tipoFormulario.includes(tipoKey)) {
      setTipoFormulario(tipoFormulario.filter(t => t !== tipoKey));
    } else {
      setTipoFormulario([...tipoFormulario, tipoKey]);
    }
  };

  const preguntasAdicionales = tipoFormulario.reduce((acc, key) => {
    const preguntas = TIPOS_FORMULARIO[key]?.preguntas || [];
    return [...acc, ...preguntas];
  }, []);

  const preguntasUnicas = preguntasAdicionales.filter((p, idx, self) =>
    idx === self.findIndex((p2) => p2.label === p.label)
  );

  // Función para saber si un campo debe tener micrófono
  const tieneMicrofono = (tipo) => {
    return tipo === 'text' || tipo === 'textarea' || tipo === 'number' || tipo === 'tel' || !tipo;
  };

  return (
    <div className="space-y-6">
      {/* Selector de tipo de formulario */}
      <div className="mb-4">
        <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>
          Tipos de formulario especializado (puedes elegir varios)
        </label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(TIPOS_FORMULARIO).map(([key, { nombre }]) => (
            <button
              key={key}
              onClick={() => toggleTipo(key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                tipoFormulario.includes(key)
                  ? 'bg-[#22d3ee] text-black shadow-lg shadow-[#22d3ee]/30'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              {nombre}
            </button>
          ))}
        </div>
        <p className="text-[9px] text-gray-400 mt-1">
          Selecciona uno o varios tipos para adaptar las preguntas al caso.
        </p>
        {tipoFormulario.length > 0 && (
          <p className="text-[9px] text-[#22d3ee] mt-1">
            ✅ {tipoFormulario.length} tipo(s) seleccionado(s): {tipoFormulario.map(k => TIPOS_FORMULARIO[k]?.nombre).join(', ')}
          </p>
        )}
      </div>

      {/* ===== BLOQUE 1: DATOS PERSONALES ===== */}
      <div className="mb-6">
        <h3 className={`text-sm font-bold ${textoPrincipal} uppercase tracking-wider border-b border-gray-600 pb-2 mb-3`}>1. Datos Personales</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Edad</label>
            <div className="relative">
              <input type="number" value={evaluacion.edad} onChange={(e) => handleInputChange('edad', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`} placeholder="Ej: 45" />
              <button onClick={() => iniciarDictado('edad')} className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${escuchando && campoActivo === 'edad' ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all text-xs`}>🎙️</button>
            </div>
          </div>
          <div>
            <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Sexo</label>
            <select value={evaluacion.sexo} onChange={(e) => handleInputChange('sexo', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`}>
              <option value="">Seleccionar</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
              <option value="Otro">Otro</option>
            </select>
            {/* Sin micrófono en select */}
          </div>
          <div>
            <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Ocupación</label>
            <div className="relative">
              <input type="text" value={evaluacion.ocupacion} onChange={(e) => handleInputChange('ocupacion', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`} placeholder="Ej: Ingeniero, Profesor..." />
              <button onClick={() => iniciarDictado('ocupacion')} className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${escuchando && campoActivo === 'ocupacion' ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all text-xs`}>🎙️</button>
            </div>
          </div>
          <div>
            <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Estado Civil</label>
            <select value={evaluacion.estado_civil} onChange={(e) => handleInputChange('estado_civil', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`}>
              <option value="">Seleccionar</option>
              <option value="Soltero/a">Soltero/a</option>
              <option value="Casado/a">Casado/a</option>
              <option value="Divorciado/a">Divorciado/a</option>
              <option value="Viudo/a">Viudo/a</option>
            </select>
            {/* Sin micrófono en select */}
          </div>
          <div>
            <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Teléfono</label>
            <div className="relative">
              <input type="text" value={evaluacion.telefono} onChange={(e) => handleInputChange('telefono', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`} placeholder="Ej: 987654321" />
              <button onClick={() => iniciarDictado('telefono')} className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${escuchando && campoActivo === 'telefono' ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all text-xs`}>🎙️</button>
            </div>
          </div>
          <div className="md:col-span-2">
            <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Dirección</label>
            <div className="relative">
              <input type="text" value={evaluacion.direccion} onChange={(e) => handleInputChange('direccion', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`} placeholder="Calle, número, ciudad..." />
              <button onClick={() => iniciarDictado('direccion')} className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${escuchando && campoActivo === 'direccion' ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all text-xs`}>🎙️</button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== BLOQUE 2: MOTIVO DE CONSULTA ===== */}
      <div className="mb-6">
        <h3 className={`text-sm font-bold ${textoPrincipal} uppercase tracking-wider border-b border-gray-600 pb-2 mb-3`}>2. Motivo de Consulta</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Motivo principal</label>
            <div className="relative">
              <textarea value={evaluacion.motivo_consulta} onChange={(e) => handleInputChange('motivo_consulta', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm resize-none min-h-[60px]`} placeholder="Describe el motivo de la consulta..." />
              <button onClick={() => iniciarDictado('motivo_consulta')} className={`absolute right-2 top-2 p-1.5 rounded-full ${escuchando && campoActivo === 'motivo_consulta' ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all text-xs`}>🎙️</button>
            </div>
          </div>
          <div>
            <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Tiempo de evolución</label>
            <div className="relative">
              <input type="text" value={evaluacion.tiempo_evolucion} onChange={(e) => handleInputChange('tiempo_evolucion', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`} placeholder="Ej: 2 semanas" />
              <button onClick={() => iniciarDictado('tiempo_evolucion')} className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${escuchando && campoActivo === 'tiempo_evolucion' ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all text-xs`}>🎙️</button>
            </div>
          </div>
          <div>
            <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Mecanismo de lesión</label>
            <div className="relative">
              <input type="text" value={evaluacion.mecanismo_lesion} onChange={(e) => handleInputChange('mecanismo_lesion', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`} placeholder="Caída, sobrecarga, etc." />
              <button onClick={() => iniciarDictado('mecanismo_lesion')} className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${escuchando && campoActivo === 'mecanismo_lesion' ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all text-xs`}>🎙️</button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== BLOQUE 3: ANTECEDENTES ===== */}
      <div className="mb-6">
        <h3 className={`text-sm font-bold ${textoPrincipal} uppercase tracking-wider border-b border-gray-600 pb-2 mb-3`}>3. Antecedentes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Antecedentes médicos</label>
            <div className="relative">
              <input type="text" value={evaluacion.antecedentes_medicos} onChange={(e) => handleInputChange('antecedentes_medicos', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`} placeholder="Diabetes, hipertensión, etc." />
              <button onClick={() => iniciarDictado('antecedentes_medicos')} className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${escuchando && campoActivo === 'antecedentes_medicos' ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all text-xs`}>🎙️</button>
            </div>
          </div>
          <div>
            <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Alergias</label>
            <div className="relative">
              <input type="text" value={evaluacion.alergias} onChange={(e) => handleInputChange('alergias', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`} placeholder="Medicamentos, alimentos, etc." />
              <button onClick={() => iniciarDictado('alergias')} className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${escuchando && campoActivo === 'alergias' ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all text-xs`}>🎙️</button>
            </div>
          </div>
          <div>
            <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Medicamentos actuales</label>
            <div className="relative">
              <input type="text" value={evaluacion.medicamentos} onChange={(e) => handleInputChange('medicamentos', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`} placeholder="Ibuprofeno, etc." />
              <button onClick={() => iniciarDictado('medicamentos')} className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${escuchando && campoActivo === 'medicamentos' ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all text-xs`}>🎙️</button>
            </div>
          </div>
          <div>
            <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Cirugías previas</label>
            <div className="relative">
              <input type="text" value={evaluacion.cirugias_previas} onChange={(e) => handleInputChange('cirugias_previas', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`} placeholder="Tipo y año" />
              <button onClick={() => iniciarDictado('cirugias_previas')} className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${escuchando && campoActivo === 'cirugias_previas' ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all text-xs`}>🎙️</button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== BLOQUE 4: EVALUACIÓN DEL DOLOR ===== */}
      <div className="mb-6">
        <h3 className={`text-sm font-bold ${textoPrincipal} uppercase tracking-wider border-b border-gray-600 pb-2 mb-3`}>4. Evaluación del Dolor</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Tipo de dolor</label>
            <div className="flex flex-wrap gap-2">
              {['Latido', 'Destello', 'Lanciante', 'Cortante', 'Calambre', 'Quema', 'Hormigueo', 'Sordo', 'Pesado'].map((tipo) => (
                <label key={tipo} className={`flex items-center gap-1 text-xs ${textoPrincipal}`}>
                  <input type="checkbox" checked={(evaluacion.tipo_dolor || []).includes(tipo)} onChange={(e) => {
                    const current = evaluacion.tipo_dolor || [];
                    const nuevos = e.target.checked ? [...current, tipo] : current.filter(t => t !== tipo);
                    handleInputChange('tipo_dolor', nuevos);
                  }} className="accent-[#22d3ee]" />
                  {tipo}
                </label>
              ))} 
            </div>
          </div>
          <div>
            <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Intensidad (EVA) en reposo</label>
            <div className="relative">
              <input type="number" min="0" max="10" value={evaluacion.intensidad_reposo} onChange={(e) => handleInputChange('intensidad_reposo', parseInt(e.target.value) || 0)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`} />
              <button onClick={() => iniciarDictado('intensidad_reposo')} className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${escuchando && campoActivo === 'intensidad_reposo' ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all text-xs`}>🎙️</button>
            </div>
          </div>
          <div>
            <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Intensidad (EVA) en actividad</label>
            <div className="relative">
              <input type="number" min="0" max="10" value={evaluacion.intensidad_actividad} onChange={(e) => handleInputChange('intensidad_actividad', parseInt(e.target.value) || 0)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`} />
              <button onClick={() => iniciarDictado('intensidad_actividad')} className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${escuchando && campoActivo === 'intensidad_actividad' ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all text-xs`}>🎙️</button>
            </div>
          </div>
          <div className="md:col-span-2">
            <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Factores agravantes</label>
            <div className="relative">
              <input type="text" value={evaluacion.factores_agravantes} onChange={(e) => handleInputChange('factores_agravantes', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`} placeholder="¿Qué empeora el dolor?" />
              <button onClick={() => iniciarDictado('factores_agravantes')} className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${escuchando && campoActivo === 'factores_agravantes' ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all text-xs`}>🎙️</button>
            </div>
          </div>
          <div className="md:col-span-2">
            <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Factores atenuantes</label>
            <div className="relative">
              <input type="text" value={evaluacion.factores_atenuantes} onChange={(e) => handleInputChange('factores_atenuantes', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`} placeholder="¿Qué alivia el dolor?" />
              <button onClick={() => iniciarDictado('factores_atenuantes')} className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${escuchando && campoActivo === 'factores_atenuantes' ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all text-xs`}>🎙️</button>
            </div>
          </div>
          <div className="md:col-span-2">
            <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Síntomas asociados</label>
            <div className="relative">
              <input type="text" value={evaluacion.sintomas_asociados} onChange={(e) => handleInputChange('sintomas_asociados', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`} placeholder="Hormigueo, debilidad, mareos..." />
              <button onClick={() => iniciarDictado('sintomas_asociados')} className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${escuchando && campoActivo === 'sintomas_asociados' ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all text-xs`}>🎙️</button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== BLOQUE 5: PREGUNTAS ADICIONALES ===== */}
      {preguntasUnicas.length > 0 && (
        <div className="mb-6">
          <h3 className={`text-sm font-bold text-[#22d3ee] uppercase tracking-wider border-b border-[#22d3ee]/30 pb-2 mb-3`}>
            5. Evaluación Especializada Combinada
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {preguntasUnicas.map((pregunta, idx) => {
              const campoId = `especial_combinada_${idx}`;
              const valor = evaluacion[campoId] || '';
              const esSelect = pregunta.tipo === 'select';
              const esCheckbox = pregunta.tipo === 'checkbox';
              const esTextarea = pregunta.tipo === 'textarea';
              const mostrarMicro = !esSelect && !esCheckbox && tieneMicrofono(pregunta.tipo);

              return (
                <div key={idx} className={esTextarea ? 'md:col-span-2' : ''}>
                  <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>
                    {pregunta.label}
                  </label>
                  <div className="relative">
                    {esTextarea ? (
                      <textarea
                        value={valor}
                        onChange={(e) => handleInputChange(campoId, e.target.value)}
                        className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm resize-none min-h-[60px]`}
                        placeholder={pregunta.placeholder || ''}
                      />
                    ) : esSelect ? (
                      <select
                        value={valor}
                        onChange={(e) => handleInputChange(campoId, e.target.value)}
                        className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`}
                      >
                        <option value="">Seleccionar</option>
                        {pregunta.opciones.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={pregunta.tipo || 'text'}
                        value={valor}
                        onChange={(e) => handleInputChange(campoId, e.target.value)}
                        className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`}
                        placeholder={pregunta.placeholder || ''}
                      />
                    )}
                    {mostrarMicro && (
                      <button
                        onClick={() => iniciarDictado(campoId)}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${escuchando && campoActivo === campoId ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all text-xs`}
                      >
                        🎙️
                      </button>
                    )}
                  </div>
                  {pregunta.ayuda && (
                    <p className="text-[9px] text-gray-400 mt-1">{pregunta.ayuda}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex justify-end mt-6">
        <button
          onClick={() => setPaso(2)}
          className="px-6 py-3 bg-[#22d3ee] text-black font-black rounded-xl text-sm hover:scale-105 transition-all"
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}