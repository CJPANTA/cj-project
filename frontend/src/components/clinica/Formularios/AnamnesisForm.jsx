import React, { useState } from 'react';
import { TIPOS_FORMULARIO } from './plantillas';
import RedFlagsForm from './RedFlagsForm';

const IconMic = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
  </svg>
);

const evaluarSignosVitales = (sv) => {
  const alertas = [];
  if (!sv) return alertas;
  const s = parseFloat(sv.ta_sistolica);
  const d = parseFloat(sv.ta_diastolica);
  if (!isNaN(s) || !isNaN(d)) {
    if (s >= 140 || d >= 90) alertas.push({ campo: 'TA', nivel: 'roja', msg: 'Presión arterial elevada' });
    else if (s >= 130 || d >= 85) alertas.push({ campo: 'TA', nivel: 'amarilla', msg: 'Presión arterial limítrofe' });
    else if (s < 90 || d < 60) alertas.push({ campo: 'TA', nivel: 'amarilla', msg: 'Presión arterial baja' });
  }
  const fc = parseFloat(sv.fc);
  if (!isNaN(fc)) {
    if (fc > 110 || fc < 50) alertas.push({ campo: 'FC', nivel: 'roja', msg: 'Frecuencia cardíaca fuera de rango' });
    else if (fc > 100 || fc < 60) alertas.push({ campo: 'FC', nivel: 'amarilla', msg: 'Frecuencia cardíaca limítrofe' });
  }
  const fr = parseFloat(sv.fr);
  if (!isNaN(fr)) {
    if (fr > 24 || fr < 10) alertas.push({ campo: 'FR', nivel: 'roja', msg: 'Frecuencia respiratoria fuera de rango' });
    else if (fr > 20 || fr < 12) alertas.push({ campo: 'FR', nivel: 'amarilla', msg: 'Frecuencia respiratoria limítrofe' });
  }
  const temp = parseFloat(sv.temperatura);
  if (!isNaN(temp)) {
    if (temp >= 38 || temp < 35.5) alertas.push({ campo: 'T°', nivel: 'roja', msg: 'Temperatura fuera de rango' });
    else if (temp > 37.2) alertas.push({ campo: 'T°', nivel: 'amarilla', msg: 'Febrícula' });
  }
  const spo2 = parseFloat(sv.spo2);
  if (!isNaN(spo2)) {
    if (spo2 < 90) alertas.push({ campo: 'SpO2', nivel: 'roja', msg: 'Saturación de oxígeno baja' });
    else if (spo2 < 95) alertas.push({ campo: 'SpO2', nivel: 'amarilla', msg: 'Saturación limítrofe' });
  }
  const glu = parseFloat(sv.glucemia);
  if (!isNaN(glu)) {
    if (glu > 140 || glu < 60) alertas.push({ campo: 'Glucemia', nivel: 'roja', msg: 'Glucemia fuera de rango' });
    else if (glu > 110 || glu < 70) alertas.push({ campo: 'Glucemia', nivel: 'amarilla', msg: 'Glucemia limítrofe' });
  }
  return alertas;
};

const calcularIMC = (peso, talla) => {
  const p = parseFloat(peso);
  const t = parseFloat(talla);
  if (!p || !t || t <= 0) return null;
  const tallaM = t > 3 ? t / 100 : t;
  const imc = p / (tallaM * tallaM);
  if (!isFinite(imc) || imc <= 0) return null;
  return imc.toFixed(1);
};

const clasificarIMC = (imc) => {
  if (imc === null) return null;
  const n = parseFloat(imc);
  if (n < 18.5) return { nivel: 'amarilla', msg: 'Bajo peso' };
  if (n < 25) return { nivel: 'normal', msg: 'Normal' };
  if (n < 30) return { nivel: 'amarilla', msg: 'Sobrepeso' };
  return { nivel: 'roja', msg: 'Obesidad' };
};

export default function AnamnesisForm({
  evaluacion, handleInputChange, iniciarDictado, escuchando, campoActivo,
  temaOscuro, tipoFormulario, setTipoFormulario, setPaso,
}) {
  const [tabActiva, setTabActiva] = useState('datos');

  const bgInput = temaOscuro ? 'bg-black/20 border-white/10 text-white' : 'bg-gray-100 border-gray-300 text-[#0f172a]';
  const textoPrincipal = temaOscuro ? 'text-white' : 'text-[#0f172a]';
  const bgSubtitulo = temaOscuro ? 'bg-[#0f1a24] border-gray-700' : 'bg-gray-50 border-gray-200';
  const bgCard = temaOscuro ? 'bg-[#0a141d] border-gray-700' : 'bg-white border-gray-200';

  const esDeportista = tipoFormulario.includes('deportivo');

  const toggleTipo = (tipoKey) => {
    if (tipoFormulario.includes(tipoKey)) setTipoFormulario(tipoFormulario.filter(t => t !== tipoKey));
    else setTipoFormulario([...tipoFormulario, tipoKey]);
  };

  const preguntasAdicionales = tipoFormulario.reduce((acc, key) => {
    const preguntas = TIPOS_FORMULARIO[key]?.preguntas || [];
    return [...acc, ...preguntas];
  }, []);
  const preguntasUnicas = preguntasAdicionales.filter((p, idx, self) =>
    idx === self.findIndex((p2) => p.label === p.label)
  );

  const tieneMicrofono = (tipo) => tipo === 'text' || tipo === 'textarea' || tipo === 'number' || tipo === 'tel' || !tipo;

  // ===== HIJOS =====
  const hijos = evaluacion.hijos || [];
  const agregarHijo = () => handleInputChange('hijos', [...hijos, { edad: '', sexo: '' }]);
  const eliminarHijo = (idx) => handleInputChange('hijos', hijos.filter((_, i) => i !== idx));
  const actualizarHijo = (idx, campo, valor) => {
    handleInputChange('hijos', hijos.map((h, i) => i === idx ? { ...h, [campo]: valor } : h));
  };

  // ===== CONTACTOS DE EMERGENCIA =====
  const contactos = evaluacion.contactos_emergencia || [{ nombre: '', telefono: '', parentesco: '' }, { nombre: '', telefono: '', parentesco: '' }];
  const actualizarContacto = (idx, campo, valor) => {
    handleInputChange('contactos_emergencia', contactos.map((c, i) => i === idx ? { ...c, [campo]: valor } : c));
  };

  // ===== SIGNOS VITALES =====
  const sv = evaluacion.signos_vitales || {};
  const actualizarSV = (campo, valor) => {
    handleInputChange('signos_vitales', { ...sv, [campo]: valor, fecha_toma: sv.fecha_toma || new Date().toISOString() });
  };
  const imc = calcularIMC(sv.peso, sv.talla);
  const clasifIMC = clasificarIMC(imc);
  const alertasSV = evaluarSignosVitales(sv);

  // ===== ANTECEDENTES FAMILIARES =====
  const familiares = evaluacion.antecedentes_familiares || [];
  const toggleFamiliar = (nombre) => {
    handleInputChange('antecedentes_familiares',
      familiares.includes(nombre) ? familiares.filter(f => f !== nombre) : [...familiares, nombre]);
  };

  // ===== HÁBITOS =====
  const habitos = evaluacion.habitos || { tabaquismo: false, cigarrillos_dia: '', alcohol: false, alcohol_frecuencia: '', drogas: false, dependencia_medicamentos: false };
  const actualizarHabito = (campo, valor) => {
    handleInputChange('habitos', { ...habitos, [campo]: valor });
  };

  // ===== GINECO-OBSTÉTRICOS / UROLÓGICOS (condicional) =====
  const edadNum = parseInt(evaluacion.edad) || 0;
  const mostrarGineco = evaluacion.sexo === 'Femenino';
  const mostrarUro = evaluacion.sexo === 'Masculino' && edadNum >= 40;
  const mostrarGinecoTab = mostrarGineco || mostrarUro;

  const gineco = evaluacion.gineco_obstetricos || {
    embarazo: '', lactancia: '', fum: '', metodo_anticonceptivo: '',
    menopausia: '', edad_menopausia: '', num_embarazos: '', num_partos: '', num_abortos: '',
  };
  const actualizarGineco = (campo, valor) => {
    handleInputChange('gineco_obstetricos', { ...gineco, [campo]: valor });
  };

  const uro = evaluacion.urologicos || {
    visita_urologo: '', hiperplasia_prostata: '', medicacion_prostata: '',
  };
  const actualizarUro = (campo, valor) => {
    handleInputChange('urologicos', { ...uro, [campo]: valor });
  };

  // ===== COMPLETADO DE TABS =====
  const tieneDatosDatos = evaluacion.edad && evaluacion.sexo && evaluacion.estado_civil;
  const tieneDatosMotivo = evaluacion.motivo_consulta && evaluacion.tiempo_evolucion;
  const tieneDatosAntec = evaluacion.antecedentes_medicos || evaluacion.alergias || evaluacion.medicamentos || evaluacion.cirugias_previas || familiares.length > 0;
  const tieneDatosDolor = (evaluacion.tipo_dolor && evaluacion.tipo_dolor.length > 0) || evaluacion.intensidad_reposo > 0 || evaluacion.intensidad_actividad > 0;
  const tieneDatosGineco = mostrarGineco
    ? (gineco.embarazo || gineco.fum)
    : (uro.visita_urologo || uro.hiperplasia_prostata);

  // ===== TABS DINÁMICAS =====
  const tabs = [];
  let n = 1;
  tabs.push({ key: 'datos', label: `${n++}. Datos generales`, completado: tieneDatosDatos });
  tabs.push({ key: 'motivo', label: `${n++}. Motivo de consulta`, completado: tieneDatosMotivo });
  tabs.push({ key: 'antecedentes', label: `${n++}. Antecedentes`, completado: tieneDatosAntec });
  tabs.push({ key: 'dolor', label: `${n++}. Evaluación del dolor`, completado: tieneDatosDolor });
  if (mostrarGinecoTab) {
    tabs.push({
      key: 'gineco',
      label: `${n++}. ${mostrarGineco ? 'Gineco-obstétricos' : 'Urológicos'}`,
      completado: tieneDatosGineco,
    });
  }
  tabs.push({ key: 'banderas', label: `${n++}. Banderas Rojas`, completado: (evaluacion.banderas_rojas || []).length > 0 });
  if (preguntasUnicas.length > 0) {
    tabs.push({ key: 'especializada', label: `${n++}. Evaluación especializada`, completado: false });
  }

  return (
    <div className="space-y-6">
      {/* SELECTOR DE FORMULARIOS */}
      <div className="mb-4">
        <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>
          Tipos de formulario especializado (puedes elegir varios)
        </label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(TIPOS_FORMULARIO).map(([key, { nombre }]) => (
            <button key={key} onClick={() => toggleTipo(key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                tipoFormulario.includes(key) ? 'bg-[#22d3ee] text-black shadow-lg shadow-[#22d3ee]/30' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}>
              {nombre}
            </button>
          ))}
        </div>
        {tipoFormulario.length > 0 && (<p className="text-[9px] text-[#22d3ee] mt-2">{tipoFormulario.length} tipo(s) seleccionado(s)</p>)}
      </div>

      {/* TABS */}
      <div className="flex border-b border-gray-700 overflow-x-auto">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setTabActiva(tab.key)}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
              tabActiva === tab.key ? 'text-[#22d3ee] border-[#22d3ee]' : 'text-gray-500 border-transparent hover:text-gray-300'
            }`}>
            {tab.label}
            {tab.completado && (<span className="w-2 h-2 rounded-full bg-green-400"></span>)}
          </button>
        ))}
      </div>

      {/* TAB 1: DATOS GENERALES */}
      {tabActiva === 'datos' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <h3 className={`text-sm font-bold ${textoPrincipal} uppercase tracking-wider border-b border-gray-600 pb-2`}>Datos personales</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Edad *</label>
                <div className="relative">
                  <input type="number" value={evaluacion.edad} onChange={(e) => handleInputChange('edad', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`} placeholder="Ej: 45" />
                  <button onClick={() => iniciarDictado('edad')} className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${escuchando && campoActivo === 'edad' ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all`}><IconMic /></button>
                </div>
              </div>
              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Sexo *</label>
                <select value={evaluacion.sexo} onChange={(e) => handleInputChange('sexo', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`}>
                  <option value="">Seleccionar</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Estado Civil *</label>
                <select value={evaluacion.estado_civil} onChange={(e) => handleInputChange('estado_civil', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`}>
                  <option value="">Seleccionar</option>
                  <option value="Soltero/a">Soltero/a</option>
                  <option value="Casado/a">Casado/a</option>
                  <option value="Conviviente">Conviviente</option>
                  <option value="Divorciado/a">Divorciado/a</option>
                  <option value="Viudo/a">Viudo/a</option>
                </select>
              </div>
              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Ocupación</label>
                <div className="relative">
                  <input type="text" value={evaluacion.ocupacion} onChange={(e) => handleInputChange('ocupacion', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`} placeholder="Ej: Docente" />
                  <button onClick={() => iniciarDictado('ocupacion')} className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${escuchando && campoActivo === 'ocupacion' ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all`}><IconMic /></button>
                </div>
              </div>
              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Nivel educativo</label>
                <select value={evaluacion.nivel_educativo || ''} onChange={(e) => handleInputChange('nivel_educativo', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`}>
                  <option value="">Seleccionar</option>
                  <option value="Ninguno">Ninguno</option>
                  <option value="Primaria">Primaria</option>
                  <option value="Secundaria">Secundaria</option>
                  <option value="Técnico">Técnico</option>
                  <option value="Universitario">Universitario</option>
                  <option value="Postgrado">Postgrado</option>
                </select>
              </div>
              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Teléfono</label>
                <div className="relative">
                  <input type="text" value={evaluacion.telefono} onChange={(e) => handleInputChange('telefono', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`} placeholder="Ej: 987654321" />
                  <button onClick={() => iniciarDictado('telefono')} className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${escuchando && campoActivo === 'telefono' ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all`}><IconMic /></button>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Dirección</label>
                <div className="relative">
                  <input type="text" value={evaluacion.direccion} onChange={(e) => handleInputChange('direccion', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`} placeholder="Calle, número, ciudad..." />
                  <button onClick={() => iniciarDictado('direccion')} className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${escuchando && campoActivo === 'direccion' ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all`}><IconMic /></button>
                </div>
              </div>
              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>¿Cómo llegó al centro?</label>
                <select value={evaluacion.como_llego || ''} onChange={(e) => handleInputChange('como_llego', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`}>
                  <option value="">Seleccionar</option>
                  <option value="Recomendación médica">Recomendación médica</option>
                  <option value="Familiar/amigo">Familiar / amigo</option>
                  <option value="Redes sociales">Redes sociales</option>
                  <option value="Publicidad">Publicidad</option>
                  <option value="Caminando por la zona">Caminando por la zona</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
            </div>

            <div className={`mt-4 p-3 rounded-xl border ${bgSubtitulo}`}>
              <div className="flex items-center justify-between mb-2">
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal}`}>Hijos (opcional)</label>
                <button type="button" onClick={agregarHijo} className="px-3 py-1 bg-[#22d3ee]/20 text-[#22d3ee] text-[10px] font-bold rounded-lg hover:bg-[#22d3ee] hover:text-black transition-all">+ Agregar hijo</button>
              </div>
              {hijos.length === 0 ? (<p className="text-[10px] text-gray-500 italic">Sin hijos registrados.</p>) : (
                <div className="space-y-2">
                  {hijos.map((hijo, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold ${textoPrincipal} w-16`}>Hijo {idx + 1}:</span>
                      <input type="number" placeholder="Edad" value={hijo.edad || ''} onChange={(e) => actualizarHijo(idx, 'edad', e.target.value)} className={`w-20 ${bgInput} border p-1.5 rounded-lg outline-none focus:border-[#22d3ee] text-xs`} />
                      <select value={hijo.sexo || ''} onChange={(e) => actualizarHijo(idx, 'sexo', e.target.value)} className={`w-28 ${bgInput} border p-1.5 rounded-lg outline-none focus:border-[#22d3ee] text-xs`}>
                        <option value="">Sexo</option>
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                      </select>
                      <button type="button" onClick={() => eliminarHijo(idx)} className="p-1 text-red-400 hover:text-red-300 text-xs font-bold">X</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={`p-3 rounded-xl border ${bgSubtitulo}`}>
              <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-2`}>Contactos de emergencia (máx. 2)</label>
              <div className="space-y-3">
                {[0, 1].map((idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
                    <span className={`text-[10px] font-bold ${textoPrincipal}`}>Contacto {idx + 1}:</span>
                    <input type="text" placeholder="Nombre" value={contactos[idx]?.nombre || ''} onChange={(e) => actualizarContacto(idx, 'nombre', e.target.value)} className={`${bgInput} border p-1.5 rounded-lg outline-none focus:border-[#22d3ee] text-xs`} />
                    <input type="tel" placeholder="Teléfono" value={contactos[idx]?.telefono || ''} onChange={(e) => actualizarContacto(idx, 'telefono', e.target.value)} className={`${bgInput} border p-1.5 rounded-lg outline-none focus:border-[#22d3ee] text-xs`} />
                    <select value={contactos[idx]?.parentesco || ''} onChange={(e) => actualizarContacto(idx, 'parentesco', e.target.value)} className={`${bgInput} border p-1.5 rounded-lg outline-none focus:border-[#22d3ee] text-xs`}>
                      <option value="">Parentesco</option>
                      <option value="Cónyuge">Cónyuge</option>
                      <option value="Madre">Madre</option>
                      <option value="Padre">Padre</option>
                      <option value="Hijo/a">Hijo/a</option>
                      <option value="Hermano/a">Hermano/a</option>
                      <option value="Amigo/a">Amigo/a</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SIGNOS VITALES */}
          <div className="lg:col-span-1">
            <div className={`p-3 rounded-xl border ${bgCard} sticky top-4`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className={`text-xs font-bold ${textoPrincipal} uppercase tracking-wider`}>Signos Vitales</h3>
                <span className="text-[9px] text-gray-500 italic">(opcional)</span>
              </div>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={`block text-[9px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>TA Sistólica</label>
                    <input type="number" placeholder="mmHg" value={sv.ta_sistolica || ''} onChange={(e) => actualizarSV('ta_sistolica', e.target.value)} className={`w-full ${bgInput} border p-2 rounded-lg outline-none focus:border-[#22d3ee] text-xs`} />
                  </div>
                  <div>
                    <label className={`block text-[9px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>TA Diastólica</label>
                    <input type="number" placeholder="mmHg" value={sv.ta_diastolica || ''} onChange={(e) => actualizarSV('ta_diastolica', e.target.value)} className={`w-full ${bgInput} border p-2 rounded-lg outline-none focus:border-[#22d3ee] text-xs`} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={`block text-[9px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>FC (lpm)</label>
                    <input type="number" placeholder="lpm" value={sv.fc || ''} onChange={(e) => actualizarSV('fc', e.target.value)} className={`w-full ${bgInput} border p-2 rounded-lg outline-none focus:border-[#22d3ee] text-xs`} />
                  </div>
                  <div>
                    <label className={`block text-[9px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>FR (rpm)</label>
                    <input type="number" placeholder="rpm" value={sv.fr || ''} onChange={(e) => actualizarSV('fr', e.target.value)} className={`w-full ${bgInput} border p-2 rounded-lg outline-none focus:border-[#22d3ee] text-xs`} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={`block text-[9px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Temperatura (°C)</label>
                    <input type="number" step="0.1" placeholder="°C" value={sv.temperatura || ''} onChange={(e) => actualizarSV('temperatura', e.target.value)} className={`w-full ${bgInput} border p-2 rounded-lg outline-none focus:border-[#22d3ee] text-xs`} />
                  </div>
                  <div>
                    <label className={`block text-[9px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>SpO2 (%)</label>
                    <input type="number" placeholder="%" value={sv.spo2 || ''} onChange={(e) => actualizarSV('spo2', e.target.value)} className={`w-full ${bgInput} border p-2 rounded-lg outline-none focus:border-[#22d3ee] text-xs`} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={`block text-[9px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Peso (kg)</label>
                    <input type="number" step="0.1" placeholder="kg" value={sv.peso || ''} onChange={(e) => actualizarSV('peso', e.target.value)} className={`w-full ${bgInput} border p-2 rounded-lg outline-none focus:border-[#22d3ee] text-xs`} />
                  </div>
                  <div>
                    <label className={`block text-[9px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Talla (cm)</label>
                    <input type="number" placeholder="cm" value={sv.talla || ''} onChange={(e) => actualizarSV('talla', e.target.value)} className={`w-full ${bgInput} border p-2 rounded-lg outline-none focus:border-[#22d3ee] text-xs`} />
                  </div>
                </div>
                <div className={`p-2 rounded-lg border ${bgSubtitulo}`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-[9px] font-bold uppercase ${textoPrincipal}`}>IMC</span>
                    <span className="text-sm font-black text-[#22d3ee]">{imc || '--'}</span>
                  </div>
                  {clasifIMC && (
                    <p className={`text-[9px] font-bold mt-1 ${
                      clasifIMC.nivel === 'roja' ? 'text-red-400' : clasifIMC.nivel === 'amarilla' ? 'text-yellow-400' : 'text-green-400'
                    }`}>{clasifIMC.msg}</p>
                  )}
                </div>
                <div>
                  <label className={`block text-[9px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Glucemia (mg/dL)</label>
                  <input type="number" placeholder="mg/dL" value={sv.glucemia || ''} onChange={(e) => actualizarSV('glucemia', e.target.value)} className={`w-full ${bgInput} border p-2 rounded-lg outline-none focus:border-[#22d3ee] text-xs`} />
                </div>
                {sv.fecha_toma && (<div className="text-[9px] text-gray-500 text-right">Registro: {new Date(sv.fecha_toma).toLocaleString('es-ES')}</div>)}
              </div>
              {alertasSV.length > 0 && (
                <div className="mt-3 space-y-1">
                  {alertasSV.map((a, i) => (
                    <div key={i} className={`p-2 rounded-lg text-[10px] font-bold border ${
                      a.nivel === 'roja' ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                    }`}>{a.campo}: {a.msg}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MOTIVO */}
      {tabActiva === 'motivo' && (
        <div className="space-y-4">
          <h3 className={`text-sm font-bold ${textoPrincipal} uppercase tracking-wider border-b border-gray-600 pb-2`}>Motivo de consulta</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Motivo principal *</label>
              <div className="relative">
                <textarea value={evaluacion.motivo_consulta} onChange={(e) => handleInputChange('motivo_consulta', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm resize-none min-h-[80px]`} placeholder="Describe el motivo de la consulta..." />
                <button onClick={() => iniciarDictado('motivo_consulta')} className={`absolute right-2 top-2 p-1.5 rounded-full ${escuchando && campoActivo === 'motivo_consulta' ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all`}><IconMic /></button>
              </div>
            </div>
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Tiempo de evolución *</label>
              <div className="relative">
                <input type="text" value={evaluacion.tiempo_evolucion} onChange={(e) => handleInputChange('tiempo_evolucion', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`} placeholder="Ej: 2 semanas" />
                <button onClick={() => iniciarDictado('tiempo_evolucion')} className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${escuchando && campoActivo === 'tiempo_evolucion' ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all`}><IconMic /></button>
              </div>
            </div>
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Mecanismo de lesión</label>
              <div className="relative">
                <input type="text" value={evaluacion.mecanismo_lesion} onChange={(e) => handleInputChange('mecanismo_lesion', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`} placeholder="Caída, sobrecarga, etc." />
                <button onClick={() => iniciarDictado('mecanismo_lesion')} className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${escuchando && campoActivo === 'mecanismo_lesion' ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all`}><IconMic /></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ANTECEDENTES */}
      {tabActiva === 'antecedentes' && (
        <div className="space-y-6">
          <div>
            <h3 className={`text-sm font-bold ${textoPrincipal} uppercase tracking-wider border-b border-gray-600 pb-2 mb-4`}>Antecedentes personales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Antecedentes médicos</label>
                <div className="relative">
                  <input type="text" value={evaluacion.antecedentes_medicos} onChange={(e) => handleInputChange('antecedentes_medicos', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`} placeholder="Diabetes, hipertensión, etc." />
                  <button onClick={() => iniciarDictado('antecedentes_medicos')} className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${escuchando && campoActivo === 'antecedentes_medicos' ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all`}><IconMic /></button>
                </div>
              </div>
              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Alergias</label>
                <div className="relative">
                  <input type="text" value={evaluacion.alergias} onChange={(e) => handleInputChange('alergias', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`} placeholder="Medicamentos, alimentos, etc." />
                  <button onClick={() => iniciarDictado('alergias')} className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${escuchando && campoActivo === 'alergias' ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all`}><IconMic /></button>
                </div>
              </div>
              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Medicamentos actuales</label>
                <div className="relative">
                  <input type="text" value={evaluacion.medicamentos} onChange={(e) => handleInputChange('medicamentos', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`} placeholder="Ibuprofeno, etc." />
                  <button onClick={() => iniciarDictado('medicamentos')} className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${escuchando && campoActivo === 'medicamentos' ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all`}><IconMic /></button>
                </div>
              </div>
              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Cirugías previas</label>
                <div className="relative">
                  <input type="text" value={evaluacion.cirugias_previas} onChange={(e) => handleInputChange('cirugias_previas', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`} placeholder="Tipo y año" />
                  <button onClick={() => iniciarDictado('cirugias_previas')} className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${escuchando && campoActivo === 'cirugias_previas' ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all`}><IconMic /></button>
                </div>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-xl border ${bgSubtitulo}`}>
            <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-3`}>Antecedentes familiares</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {['Diabetes', 'Hipertensión', 'Cardiopatía', 'Cáncer', 'Obesidad', 'Tiroides', 'Artritis', 'Otros'].map((nombre) => (
                <label key={nombre} className={`flex items-center gap-2 text-xs ${textoPrincipal} cursor-pointer`}>
                  <input type="checkbox" checked={familiares.includes(nombre)} onChange={() => toggleFamiliar(nombre)} className="accent-[#22d3ee]" />
                  {nombre}
                </label>
              ))}
            </div>
            {familiares.includes('Otros') && (
              <div className="mt-3">
                <input type="text" value={evaluacion.antecedentes_familiares_otros || ''} onChange={(e) => handleInputChange('antecedentes_familiares_otros', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`} placeholder="Especificar otros antecedentes familiares..." />
              </div>
            )}
          </div>

          <div className={`p-4 rounded-xl border ${bgSubtitulo}`}>
            <h3 className={`text-sm font-bold ${textoPrincipal} uppercase tracking-wider mb-4`}>3.1 Hábitos y estilo de vida</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                <label className={`flex items-center gap-2 text-xs ${textoPrincipal} cursor-pointer font-bold`}>
                  <input type="checkbox" checked={habitos.tabaquismo || false} onChange={(e) => actualizarHabito('tabaquismo', e.target.checked)} className="accent-[#22d3ee] w-4 h-4" />
                  Tabaquismo
                </label>
                {habitos.tabaquismo && (
                  <>
                    <input type="number" placeholder="Cigarrillos/día" value={habitos.cigarrillos_dia || ''} onChange={(e) => actualizarHabito('cigarrillos_dia', e.target.value)} className={`${bgInput} border p-2 rounded-lg outline-none focus:border-[#22d3ee] text-xs`} />
                    <input type="number" placeholder="Años de consumo" value={habitos.anios_tabaquismo || ''} onChange={(e) => actualizarHabito('anios_tabaquismo', e.target.value)} className={`${bgInput} border p-2 rounded-lg outline-none focus:border-[#22d3ee] text-xs`} />
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                <label className={`flex items-center gap-2 text-xs ${textoPrincipal} cursor-pointer font-bold`}>
                  <input type="checkbox" checked={habitos.alcohol || false} onChange={(e) => actualizarHabito('alcohol', e.target.checked)} className="accent-[#22d3ee] w-4 h-4" />
                  Consumo de alcohol
                </label>
                {habitos.alcohol && (
                  <select value={habitos.alcohol_frecuencia || ''} onChange={(e) => actualizarHabito('alcohol_frecuencia', e.target.value)} className={`${bgInput} border p-2 rounded-lg outline-none focus:border-[#22d3ee] text-xs md:col-span-2`}>
                    <option value="">Frecuencia</option>
                    <option value="Ocasional">Ocasional (eventos sociales)</option>
                    <option value="1-2 por semana">1-2 veces por semana</option>
                    <option value="3+ por semana">3 o más veces por semana</option>
                    <option value="Diario">Diario</option>
                  </select>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                <label className={`flex items-center gap-2 text-xs ${textoPrincipal} cursor-pointer font-bold`}>
                  <input type="checkbox" checked={habitos.drogas || false} onChange={(e) => actualizarHabito('drogas', e.target.checked)} className="accent-[#22d3ee] w-4 h-4" />
                  Drogas recreativas
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                <label className={`flex items-center gap-2 text-xs ${textoPrincipal} cursor-pointer font-bold`}>
                  <input type="checkbox" checked={habitos.dependencia_medicamentos || false} onChange={(e) => actualizarHabito('dependencia_medicamentos', e.target.checked)} className="accent-[#22d3ee] w-4 h-4" />
                  Dependencia a medicamentos
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                <label className={`text-xs ${textoPrincipal} font-bold`}>
                  {esDeportista ? 'Nivel deportivo' : 'Actividad física habitual'}
                </label>
                {esDeportista ? (
                  <div className="md:col-span-2 grid grid-cols-2 gap-2">
                    <select value={evaluacion.nivel_deportivo || ''} onChange={(e) => handleInputChange('nivel_deportivo', e.target.value)} className={`${bgInput} border p-2 rounded-lg outline-none focus:border-[#22d3ee] text-xs`}>
                      <option value="">Nivel</option>
                      <option value="Recreativo">Recreativo</option>
                      <option value="Amateur">Amateur</option>
                      <option value="Competitivo">Competitivo</option>
                      <option value="Profesional">Profesional / Élite</option>
                    </select>
                    <input type="text" placeholder="Deporte que practica" value={evaluacion.deporte_practicado || ''} onChange={(e) => handleInputChange('deporte_practicado', e.target.value)} className={`${bgInput} border p-2 rounded-lg outline-none focus:border-[#22d3ee] text-xs`} />
                  </div>
                ) : (
                  <select value={evaluacion.actividad_fisica || ''} onChange={(e) => handleInputChange('actividad_fisica', e.target.value)} className={`${bgInput} border p-2 rounded-lg outline-none focus:border-[#22d3ee] text-xs md:col-span-2`}>
                    <option value="">Seleccionar</option>
                    <option value="Sedentario">Sedentario</option>
                    <option value="Ligero">Ligero (1-2 veces por semana)</option>
                    <option value="Moderado">Moderado (3-4 veces por semana)</option>
                    <option value="Intenso">Intenso (5+ veces por semana)</option>
                  </select>
                )}
              </div>

              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-2`}>Calidad del sueño (0-10)</label>
                <div className="flex flex-wrap gap-1">
                  {[0,1,2,3,4,5,6,7,8,9,10].map((num) => (
                    <button key={num} type="button" onClick={() => handleInputChange('calidad_suenio', num)}
                      className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${
                        evaluacion.calidad_suenio === num ? 'bg-[#22d3ee] text-black scale-110 shadow-lg shadow-[#22d3ee]/30' : `${temaOscuro ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'} hover:scale-110`
                      }`}>{num}</button>
                  ))}
                </div>
                <div className="flex justify-between text-[9px] text-gray-400 mt-1"><span>Muy mala</span><span>Excelente</span></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                <label className={`text-xs ${textoPrincipal} font-bold`}>Estrés percibido</label>
                <select value={evaluacion.estres_percibido || ''} onChange={(e) => handleInputChange('estres_percibido', e.target.value)} className={`${bgInput} border p-2 rounded-lg outline-none focus:border-[#22d3ee] text-xs md:col-span-2`}>
                  <option value="">Seleccionar</option>
                  <option value="Bajo">Bajo</option>
                  <option value="Medio">Medio</option>
                  <option value="Alto">Alto</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DOLOR */}
      {tabActiva === 'dolor' && (
        <div className="space-y-4">
          <h3 className={`text-sm font-bold ${textoPrincipal} uppercase tracking-wider border-b border-gray-600 pb-2`}>Evaluación del dolor</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Tipo de dolor</label>
              <div className="flex flex-wrap gap-2">
                {['Latido', 'Destello', 'Lanciante', 'Cortante', 'Calambre', 'Quema', 'Hormigueo', 'Sordo', 'Pesado'].map((tipo) => (
                  <label key={tipo} className={`flex items-center gap-1 text-xs ${textoPrincipal} cursor-pointer`}>
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
              <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>EVA en reposo</label>
              <div className="relative">
                <input type="number" min="0" max="10" value={evaluacion.intensidad_reposo} onChange={(e) => handleInputChange('intensidad_reposo', parseInt(e.target.value) || 0)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`} />
                <button onClick={() => iniciarDictado('intensidad_reposo')} className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${escuchando && campoActivo === 'intensidad_reposo' ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all`}><IconMic /></button>
              </div>
            </div>
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>EVA en actividad</label>
              <div className="relative">
                <input type="number" min="0" max="10" value={evaluacion.intensidad_actividad} onChange={(e) => handleInputChange('intensidad_actividad', parseInt(e.target.value) || 0)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`} />
                <button onClick={() => iniciarDictado('intensidad_actividad')} className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${escuchando && campoActivo === 'intensidad_actividad' ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all`}><IconMic /></button>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Factores agravantes</label>
              <div className="relative">
                <input type="text" value={evaluacion.factores_agravantes} onChange={(e) => handleInputChange('factores_agravantes', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`} placeholder="¿Qué empeora el dolor?" />
                <button onClick={() => iniciarDictado('factores_agravantes')} className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${escuchando && campoActivo === 'factores_agravantes' ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all`}><IconMic /></button>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Factores atenuantes</label>
              <div className="relative">
                <input type="text" value={evaluacion.factores_atenuantes} onChange={(e) => handleInputChange('factores_atenuantes', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`} placeholder="¿Qué alivia el dolor?" />
                <button onClick={() => iniciarDictado('factores_atenuantes')} className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${escuchando && campoActivo === 'factores_atenuantes' ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all`}><IconMic /></button>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Síntomas asociados</label>
              <div className="relative">
                <input type="text" value={evaluacion.sintomas_asociados} onChange={(e) => handleInputChange('sintomas_asociados', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`} placeholder="Hormigueo, debilidad, mareos..." />
                <button onClick={() => iniciarDictado('sintomas_asociados')} className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${escuchando && campoActivo === 'sintomas_asociados' ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all`}><IconMic /></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: GINECO-OBSTÉTRICOS / UROLÓGICOS (condicional) */}
      {tabActiva === 'gineco' && mostrarGineco && (
        <div className="space-y-6">
          <h3 className={`text-sm font-bold ${textoPrincipal} uppercase tracking-wider border-b border-gray-600 pb-2`}>
            Gineco-obstétricos
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>¿Está embarazada?</label>
              <select value={gineco.embarazo || ''} onChange={(e) => actualizarGineco('embarazo', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`}>
                <option value="">Seleccionar</option>
                <option value="No">No</option>
                <option value="Sí">Sí</option>
                <option value="No sabe">No sabe</option>
              </select>
            </div>
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>¿En período de lactancia?</label>
              <select value={gineco.lactancia || ''} onChange={(e) => actualizarGineco('lactancia', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`}>
                <option value="">Seleccionar</option>
                <option value="No">No</option>
                <option value="Sí">Sí</option>
              </select>
            </div>
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Fecha de última menstruación (FUM)</label>
              <input type="date" value={gineco.fum || ''} onChange={(e) => actualizarGineco('fum', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`} />
            </div>
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Método anticonceptivo</label>
              <select value={gineco.metodo_anticonceptivo || ''} onChange={(e) => actualizarGineco('metodo_anticonceptivo', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`}>
                <option value="">Seleccionar</option>
                <option value="Ninguno">Ninguno</option>
                <option value="Pastillas">Pastillas</option>
                <option value="DIU">DIU</option>
                <option value="Implante">Implante</option>
                <option value="Inyectable">Inyectable</option>
                <option value="Preservativo">Preservativo</option>
                <option value="Ligadura">Ligadura de trompas</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>¿Menopausia?</label>
              <select value={gineco.menopausia || ''} onChange={(e) => actualizarGineco('menopausia', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`}>
                <option value="">Seleccionar</option>
                <option value="No">No</option>
                <option value="Sí">Sí</option>
              </select>
            </div>
            {gineco.menopausia === 'Sí' && (
              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Edad de inicio de menopausia</label>
                <input type="number" value={gineco.edad_menopausia || ''} onChange={(e) => actualizarGineco('edad_menopausia', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`} placeholder="Ej: 50" />
              </div>
            )}
          </div>

          <div className={`p-4 rounded-xl border ${bgSubtitulo}`}>
            <h4 className={`text-xs font-bold ${textoPrincipal} uppercase tracking-wider mb-3`}>Historia obstétrica</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Nº de embarazos</label>
                <input type="number" min="0" value={gineco.num_embarazos || ''} onChange={(e) => actualizarGineco('num_embarazos', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`} placeholder="0" />
              </div>
              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Nº de partos</label>
                <input type="number" min="0" value={gineco.num_partos || ''} onChange={(e) => actualizarGineco('num_partos', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`} placeholder="0" />
              </div>
              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>Nº de abortos</label>
                <input type="number" min="0" value={gineco.num_abortos || ''} onChange={(e) => actualizarGineco('num_abortos', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`} placeholder="0" />
              </div>
            </div>
          </div>

          {/* Alerta de embarazo */}
          {gineco.embarazo === 'Sí' && (
            <div className="p-3 rounded-xl border border-red-500/30 bg-red-500/10">
              <p className="text-xs font-bold text-red-400">
                ⚠️ Paciente embarazada: revisar contraindicaciones antes de aplicar agentes físicos, masoterapia profunda o electroterapia.
              </p>
            </div>
          )}
        </div>
      )}

      {tabActiva === 'gineco' && mostrarUro && (
        <div className="space-y-6">
          <h3 className={`text-sm font-bold ${textoPrincipal} uppercase tracking-wider border-b border-gray-600 pb-2`}>
            Antecedentes urológicos
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>¿Ha visitado al urólogo en el último año?</label>
              <select value={uro.visita_urologo || ''} onChange={(e) => actualizarUro('visita_urologo', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`}>
                <option value="">Seleccionar</option>
                <option value="No">No</option>
                <option value="Sí">Sí</option>
              </select>
            </div>
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>¿Hiperplasia prostática diagnosticada?</label>
              <select value={uro.hiperplasia_prostata || ''} onChange={(e) => actualizarUro('hiperplasia_prostata', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`}>
                <option value="">Seleccionar</option>
                <option value="No">No</option>
                <option value="Sí">Sí</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>¿Toma medicación para la próstata?</label>
              <select value={uro.medicacion_prostata || ''} onChange={(e) => actualizarUro('medicacion_prostata', e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`}>
                <option value="">Seleccionar</option>
                <option value="No">No</option>
                <option value="Sí">Sí</option>
              </select>
            </div>
          </div>
        </div>
      )}
      {/* TAB 5: BANDERAS ROJAS */}
      {tabActiva === 'banderas' && (
        <RedFlagsForm
          evaluacion={evaluacion}
          handleInputChange={handleInputChange}
          temaOscuro={temaOscuro}
        />
      )}

      {/* TAB 6: ESPECIALIZADA */}
      {tabActiva === 'especializada' && preguntasUnicas.length > 0 && (
        <div className="space-y-4">
          <h3 className={`text-sm font-bold text-[#22d3ee] uppercase tracking-wider border-b border-[#22d3ee]/30 pb-2`}>Evaluación especializada combinada</h3>
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
                  <label className={`block text-[10px] font-bold uppercase tracking-wider ${textoPrincipal} mb-1`}>{pregunta.label}</label>
                  <div className="relative">
                    {esTextarea ? (
                      <textarea value={valor} onChange={(e) => handleInputChange(campoId, e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm resize-none min-h-[60px]`} placeholder={pregunta.placeholder || ''} />
                    ) : esSelect ? (
                      <select value={valor} onChange={(e) => handleInputChange(campoId, e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`}>
                        <option value="">Seleccionar</option>
                        {pregunta.opciones.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
                      </select>
                    ) : (
                      <input type={pregunta.tipo || 'text'} value={valor} onChange={(e) => handleInputChange(campoId, e.target.value)} className={`w-full ${bgInput} border p-2.5 rounded-xl outline-none focus:border-[#22d3ee] transition-all text-sm`} placeholder={pregunta.placeholder || ''} />
                    )}
                    {mostrarMicro && (
                      <button onClick={() => iniciarDictado(campoId)} className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${escuchando && campoActivo === campoId ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} text-white hover:opacity-80 transition-all`}><IconMic /></button>
                    )}
                  </div>
                  {pregunta.ayuda && (<p className="text-[9px] text-gray-400 mt-1">{pregunta.ayuda}</p>)}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex justify-end mt-6 pt-4 border-t border-gray-700">
        <button onClick={() => setPaso(2)} className="px-6 py-3 bg-[#22d3ee] text-black font-black rounded-xl text-sm hover:scale-105 transition-all">
          Siguiente
        </button>
      </div>
    </div>
  );
}