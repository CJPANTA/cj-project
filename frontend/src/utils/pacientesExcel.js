// ============================================================
// src/utils/pacientesExcel.js
// Import/Export de pacientes en Excel (.xlsx)
// ============================================================
import * as XLSX from 'xlsx';
import { supabase } from '../lib/supabaseClient';

// ============================================================
// DEFINICIÓN DE CAMPOS
// ============================================================
const CAMPOS = {
  nombre: {
    label: 'Nombre',
    obligatorio: true,
    alias: ['nombre', 'nombres', 'name', 'first name', 'primer nombre'],
  },
  apellidos: {
    label: 'Apellidos',
    obligatorio: true,
    alias: ['apellidos', 'apellido', 'surname', 'last name', 'segundo nombre'],
  },
  fecha_nacimiento: {
    label: 'Fecha de Nacimiento',
    obligatorio: false,
    alias: ['fecha nacimiento', 'fecha_nacimiento', 'nacimiento', 'fecha nac', 'birthdate', 'fec nac'],
  },
  dni: {
    label: 'DNI / Documento',
    obligatorio: false,
    alias: ['dni', 'documento', 'cedula', 'identificacion', 'document', 'doc'],
  },
  telefono: {
    label: 'Teléfono',
    obligatorio: false,
    alias: ['telefono', 'teléfono', 'celular', 'movil', 'móvil', 'phone', 'tel'],
  },
  email: {
    label: 'Email',
    obligatorio: false,
    alias: ['email', 'correo', 'e-mail', 'mail', 'correo electronico'],
  },
  direccion: {
    label: 'Dirección',
    obligatorio: false,
    alias: ['direccion', 'dirección', 'address', 'domicilio'],
  },
  motivo_de_visita: {
    label: 'Motivo de Visita',
    obligatorio: false,
    alias: ['motivo', 'motivo de visita', 'motivo de consulta', 'razon', 'razón'],
  },
  antecedentes_medicos: {
    label: 'Antecedentes Médicos',
    obligatorio: false,
    alias: ['antecedentes', 'antecedentes medicos', 'antecedentes médicos', 'historial'],
  },
  alergias: {
    label: 'Alergias',
    obligatorio: false,
    alias: ['alergias', 'alergia'],
  },
  diagnostico: {
    label: 'Diagnóstico',
    obligatorio: false,
    alias: ['diagnostico', 'diagnóstico', 'dx'],
  },
};

export const LISTA_CAMPOS = Object.entries(CAMPOS).map(([key, def]) => ({
  key,
  label: def.label,
  obligatorio: def.obligatorio,
  alias: def.alias,
}));

// ============================================================
// 1. EXPORTAR PACIENTES + EQUIPO (2 hojas)
// ============================================================
export async function exportarPacientes(centroId) {
  if (!centroId) throw new Error('centroId es obligatorio');

  // 1. Traer pacientes del centro
  const { data: pacientes, error: errPac } = await supabase
    .from('pacientes')
    .select('*')
    .eq('centro_id', centroId)
    .order('apellidos', { ascending: true });

  if (errPac) throw errPac;
  if (!pacientes || pacientes.length === 0) {
    throw new Error('No hay pacientes registrados en este centro.');
  }

  // 2. Mapear pacientes a formato Excel
  const filas = pacientes.map((p) => ({
    'nombre': p.nombre || '',
    'apellidos': p.apellidos || '',
    'fecha_nacimiento': p.fecha_nacimiento || '',
    'dni': p.dni || '',
    'telefono': p.telefono || '',
    'email': p.email || '',
    'direccion': p.direccion || '',
    'motivo_de_visita': p.motivo_de_visita || '',
    'antecedentes_medicos': p.antecedentes_medicos || '',
    'alergias': p.alergias || '',
    'diagnostico': p.diagnostico || '',
    'notas_importacion': p.notas_importacion || '',
    'fecha_registro': p.created_at ? new Date(p.created_at).toLocaleDateString('es-ES') : '',
  }));

  const wsPacientes = XLSX.utils.json_to_sheet(filas);
  wsPacientes['!cols'] = [
    { wch: 20 }, { wch: 22 }, { wch: 14 }, { wch: 12 }, { wch: 14 },
    { wch: 24 }, { wch: 28 }, { wch: 30 }, { wch: 30 }, { wch: 24 },
    { wch: 30 }, { wch: 20 }, { wch: 14 },
  ];

  // 3. Traer equipo del centro
  const { data: equipo } = await supabase
    .from('profiles')
    .select('nombre_completo, rol, tipo_profesional, dni, numero_colegiatura, estado, created_at')
    .eq('centro_id', centroId)
    .order('nombre_completo');

  const tipoRolMap = {
    1: 'Director', 2: 'Estudiante', 3: 'Licenciado', 4: 'Híbrido',
    5: 'Paciente', 6: 'Demo', 7: 'Admin Centro', 8: 'Independiente',
  };

  const filasEquipo = (equipo || []).map((u) => ({
    'nombre_completo': u.nombre_completo || '',
    'rol': tipoRolMap[u.rol] || `Rol ${u.rol}`,
    'tipo_profesional': u.tipo_profesional || '',
    'dni': u.dni || '',
    'numero_colegiatura': u.numero_colegiatura || '',
    'estado': u.estado || '',
    'fecha_alta': u.created_at ? new Date(u.created_at).toLocaleDateString('es-ES') : '',
  }));

  const wsEquipo = XLSX.utils.json_to_sheet(
    filasEquipo.length > 0 ? filasEquipo : [{ 'nombre_completo': 'Sin equipo registrado' }]
  );
  wsEquipo['!cols'] = [
    { wch: 28 }, { wch: 16 }, { wch: 18 }, { wch: 12 },
    { wch: 16 }, { wch: 12 }, { wch: 14 },
  ];

  // 4. Crear libro
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsPacientes, 'Pacientes');
  XLSX.utils.book_append_sheet(wb, wsEquipo, 'Equipo del Centro');

  // 5. Nombre del archivo
  const fecha = new Date().toISOString().slice(0, 10);
  const nombreArchivo = `pacientes_${centroId}_${fecha}.xlsx`;
  XLSX.writeFile(wb, nombreArchivo);

  return { total: filas.length, archivo: nombreArchivo };
}

// ============================================================
// 2. DESCARGAR PLANTILLA EN BLANCO
// ============================================================
export function descargarPlantilla() {
  const ejemplo = [{
    'nombre': 'Juan',
    'apellidos': 'Pérez Gómez',
    'fecha_nacimiento': '1985-06-15',
    'dni': '12345678',
    'telefono': '987654321',
    'email': 'juan@ejemplo.com',
    'direccion': 'Av. Principal 123, Lima',
    'motivo_de_visita': 'Dolor lumbar persistente',
    'antecedentes_medicos': 'Hipertensión controlada',
    'alergias': 'Penicilina',
    'diagnostico': 'Lumbalgia mecánica',
  }];

  const wsPacientes = XLSX.utils.json_to_sheet(ejemplo);
  wsPacientes['!cols'] = [
    { wch: 20 }, { wch: 22 }, { wch: 16 }, { wch: 12 }, { wch: 14 },
    { wch: 24 }, { wch: 28 }, { wch: 30 }, { wch: 30 }, { wch: 24 }, { wch: 30 },
  ];

  // Hoja de instrucciones
  const instrucciones = [
    ['INSTRUCCIONES — IMPORTACIÓN DE PACIENTES'],
    [''],
    ['• Los campos marcados con * son OBLIGATORIOS. Si faltan, la fila NO se importa.'],
    ['• Los campos marcados con 🟡 son recomendados. Si faltan, se importa con advertencia.'],
    ['• Los campos sin marca son opcionales.'],
    [''],
    ['CAMPO', 'OBLIGATORIO', 'FORMATO', 'EJEMPLO'],
    ['nombre*', 'Sí', 'Texto', 'Juan'],
    ['apellidos*', 'Sí', 'Texto', 'Pérez Gómez'],
    ['fecha_nacimiento', '🟡', 'DD/MM/AAAA o AAAA-MM-DD', '15/06/1985'],
    ['dni', '🟡', 'Solo números', '12345678'],
    ['telefono', '🟡', 'Solo números', '987654321'],
    ['email', 'No', 'Email válido', 'juan@ejemplo.com'],
    ['direccion', 'No', 'Texto', 'Av. Principal 123, Lima'],
    ['motivo_de_visita', '🟡', 'Texto', 'Dolor lumbar persistente'],
    ['antecedentes_medicos', 'No', 'Texto', 'Hipertensión controlada'],
    ['alergias', 'No', 'Texto', 'Penicilina'],
    ['diagnostico', 'No', 'Texto', 'Lumbalgia mecánica'],
    [''],
    ['⚠️ NO cambies los nombres de las columnas en la hoja "Pacientes".'],
    ['⚠️ Puedes borrar la fila de ejemplo antes de llenar la tuya.'],
['⚠️ Formatos de fecha aceptados: 15/06/1985, 15-06-1985 o 1985-06-15.'],
    ['⚠️ Duplicados por DNI se detectan automáticamente al importar.'],
  ];
  const wsInstrucciones = XLSX.utils.aoa_to_sheet(instrucciones);
  wsInstrucciones['!cols'] = [{ wch: 28 }, { wch: 14 }, { wch: 20 }, { wch: 32 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsPacientes, 'Pacientes');
  XLSX.utils.book_append_sheet(wb, wsInstrucciones, 'Instrucciones');

  XLSX.writeFile(wb, 'plantilla_pacientes.xlsx');
}

// ============================================================
// 3. PARSEAR EXCEL SUBIDO
// ============================================================
export function parsearExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: 'array', cellDates: true });

        // Buscar hoja "Pacientes" o usar la primera
        const nombreHoja = wb.SheetNames.find(
          (n) => n.toLowerCase().includes('paciente')
        ) || wb.SheetNames[0];

        const ws = wb.Sheets[nombreHoja];
        const json = XLSX.utils.sheet_to_json(ws, { defval: '' });

        if (!json || json.length === 0) {
          reject(new Error('El archivo está vacío o no tiene datos.'));
          return;
        }

        const columnas = Object.keys(json[0] || {});
        resolve({ filas: json, columnas, nombreHoja });
      } catch (err) {
        reject(new Error('Error al leer el archivo: ' + err.message));
      }
    };
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
    reader.readAsArrayBuffer(file);
  });
}

// ============================================================
// 4. AUTO-DETECTAR MAPEO DE COLUMNAS
// ============================================================
function normalizar(str) {
  return String(str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_\-\s]+/g, ' ')
    .trim();
}

export function autoDetectarMapeo(columnasExcel) {
  const mapeo = {};

  LISTA_CAMPOS.forEach((campo) => {
    const match = columnasExcel.find((col) => {
      const colNorm = normalizar(col);
      return campo.alias.some((alias) => {
        const aliasNorm = normalizar(alias);
        return colNorm === aliasNorm || colNorm.includes(aliasNorm) || aliasNorm.includes(colNorm);
      });
    });
    mapeo[campo.key] = match || '';
  });

  return mapeo;
}

// ============================================================
// 5. VALIDAR FILAS
// ============================================================
function parsearFecha(valor) {
  if (!valor) return null;

  // Caso 1: Excel devuelve un objeto Date
  if (valor instanceof Date && !isNaN(valor)) {
    const y = valor.getFullYear();
    const m = String(valor.getMonth() + 1).padStart(2, '0');
    const d = String(valor.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  const str = String(valor).trim();
  if (!str) return null;

  // Caso 2: ISO (1985-06-15 o 1985-06-15 00:00:00)
  const mISO = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (mISO) {
    const [, y, mes, d] = mISO;
    return `${y}-${mes.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // Caso 3: DD/MM/YYYY o DD-MM-YYYY (formato latino)
  const mDMY = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (mDMY) {
    const [, d, mes, y] = mDMY;
    const anio = y.length === 2 ? `20${y}` : y;
    return `${anio}-${mes.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // Caso 4: formato largo de JS (Sat Jun 15 1985...)
  const tryDate = new Date(str);
  if (!isNaN(tryDate)) {
    const y = tryDate.getFullYear();
    const m = String(tryDate.getMonth() + 1).padStart(2, '0');
    const d = String(tryDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  return null;
}

export function validarFilas(filas, mapeo) {
  const ok = [];
  const warnings = [];
  const errores = [];

  filas.forEach((fila, idx) => {
    const filaNum = idx + 2; // +2 porque la fila 1 del Excel son headers
    const datos = {};
    const problemas = [];

    // Extraer valores según mapeo
    Object.keys(mapeo).forEach((campo) => {
  const colExcel = mapeo[campo];
  if (!colExcel) {
    datos[campo] = '';
    return;
  }
  const valorRaw = fila[colExcel];
  // Si Excel ya lo interpretó como fecha, preservar el objeto Date
  if (valorRaw instanceof Date) {
    datos[campo] = valorRaw;
  } else {
    datos[campo] = String(valorRaw || '').trim();
  }
});

    // Validación: obligatorios
    if (!datos.nombre) problemas.push('Falta nombre');
    if (!datos.apellidos) problemas.push('Falta apellidos');

    if (problemas.length > 0) {
      errores.push({ fila: filaNum, datos, motivo: problemas.join(' · ') });
      return;
    }

    // Validación: recomendados (warnings)
    const advertencias = [];
    if (!datos.fecha_nacimiento) advertencias.push('sin fecha de nacimiento');
    if (!datos.dni) advertencias.push('sin DNI');
    if (!datos.telefono) advertencias.push('sin teléfono');
    if (!datos.motivo_de_visita) advertencias.push('sin motivo de visita');

    // Normalizar fecha
    if (datos.fecha_nacimiento) {
      const fechaNorm = parsearFecha(datos.fecha_nacimiento);
      if (!fechaNorm) {
        advertencias.push('fecha de nacimiento inválida (se ignorará)');
        datos.fecha_nacimiento = null;
      } else {
        datos.fecha_nacimiento = fechaNorm;
      }
    } else {
      datos.fecha_nacimiento = null;
    }

    // Limpiar DNI (solo números)
    if (datos.dni) datos.dni = datos.dni.replace(/\D/g, '');

    if (advertencias.length > 0) {
      warnings.push({ fila: filaNum, datos, motivo: advertencias.join(' · ') });
    } else {
      ok.push({ fila: filaNum, datos });
    }
  });

  return { ok, warnings, errores };
}

// ============================================================
// 6. DETECTAR DUPLICADOS POR DNI
// ============================================================
export async function detectarDuplicados(filasValidas, centroId) {
  const dnis = filasValidas.map((f) => f.datos.dni).filter(Boolean);
  if (dnis.length === 0) return [];

  const { data: existentes, error } = await supabase
    .from('pacientes')
    .select('id, nombre, apellidos, dni')
    .eq('centro_id', centroId)
    .in('dni', dnis);

  if (error) throw error;

  const mapaExistentes = new Map((existentes || []).map((p) => [p.dni, p]));

  return filasValidas
    .filter((f) => f.datos.dni && mapaExistentes.has(f.datos.dni))
    .map((f) => ({
      fila: f.fila,
      datos: f.datos,
      existente: mapaExistentes.get(f.datos.dni),
    }));
}

// ============================================================
// 7. IMPORTAR PACIENTES
// ============================================================
export async function importarPacientes(
  filas,
  centroId,
  opcionDuplicados = 'skip'
) {
  if (!centroId) throw new Error('centroId es obligatorio');
  if (!filas || filas.length === 0) return { insertados: 0, actualizados: 0, omitidos: 0 };

  const { data: { user } } = await supabase.auth.getUser();
  const fechaNota = new Date().toLocaleDateString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
  const nota = `Importado desde Excel el ${fechaNota}`;

  let insertados = 0;
  let actualizados = 0;
  let omitidos = 0;

  // Traer DNIs existentes una sola vez
  const dnis = filas.map((f) => f.datos.dni).filter(Boolean);
  let mapaExist = {};
  if (dnis.length > 0) {
    const { data: existentes } = await supabase
      .from('pacientes')
      .select('id, dni')
      .eq('centro_id', centroId)
      .in('dni', dnis);
    (existentes || []).forEach((p) => { mapaExist[p.dni] = p.id; });
  }

  for (const { datos } of filas) {
    const payload = {
      centro_id: centroId,
      user_id: user?.id || null,
      nombre: datos.nombre,
      apellidos: datos.apellidos,
      fecha_nacimiento: datos.fecha_nacimiento || null,
      dni: datos.dni || null,
      telefono: datos.telefono || null,
      email: datos.email || null,
      direccion: datos.direccion || null,
      motivo_de_visita: datos.motivo_de_visita || null,
      antecedentes_medicos: datos.antecedentes_medicos || null,
      alergias: datos.alergias || null,
      diagnostico: datos.diagnostico || null,
      notas_importacion: nota,
    };

    // Eliminar campos que no existan en la tabla (evita PGRST204)
    Object.keys(payload).forEach((k) => {
      if (payload[k] === undefined) delete payload[k];
    });

    const existeId = datos.dni ? mapaExist[datos.dni] : null;

    if (existeId) {
      if (opcionDuplicados === 'skip') {
        omitidos++;
        continue;
      }
      if (opcionDuplicados === 'overwrite') {
        const { error } = await supabase
          .from('pacientes')
          .update(payload)
          .eq('id', existeId);
        if (!error) actualizados++;
        else console.error('Error actualizando:', error);
        continue;
      }
      // 'create' → cae al insert normal
    }

    const { error } = await supabase.from('pacientes').insert([payload]);
    if (!error) insertados++;
    else console.error('Error insertando:', error, datos);
  }

  return { insertados, actualizados, omitidos };
}