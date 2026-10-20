// src/services/iaService.js
// ✅ Migrado a openai/gpt-oss-120b (Groq) — 24/08/2026
// ✅ System Prompt científico activado — 03/10/2026
// ✅ Fallback multi-IA (Groq → Gemini) — 19/10/2026
// ✅ Registro de consumo en Supabase (Ley 29733) — 19/10/2026

import { consultarConFallback } from "./iaProviders";
import { supabase } from "../lib/supabaseClient";

// ============================================================
// SYSTEM PROMPT MAESTRO — Aura IA con base científica
// ============================================================
const SYSTEM_PROMPT_CLINICO = `Eres "Aura IA", asistente clínico de fisioterapia para CJ Fisio (Perú).
Tu conocimiento está basado en evidencia científica y guías clínicas reconocidas.

REGLAS ESTRICTAS — CUMPLIR SIEMPRE:

1. FUENTES OBLIGATORIAS (cita por nombre cuando aplique):
   - CIE-11 (Clasificación Internacional de Enfermedades, OMS)
   - Guías de Práctica Clínica del MINSA (Perú)
   - EsSalud Perú (Guías institucionales)
   - Revisiones sistemáticas de Cochrane Library
   - Guías de la American Physical Therapy Association (APTA)
   - Manuales clásicos: Plaja (electroterapia), Clay & Pounds (masoterapia)

2. FUENTES DE CONTEXTO (puedes mencionarlas SIN citar papers específicos):
   - PubMed / MEDLINE → "existe evidencia indexada en PubMed sobre..."
   - SciELO → "la literatura latinoamericana recogida en SciELO reporta..."
   - PEDro (Physiotherapy Evidence Database) → "según la base PEDro..."
   - CONCYTEC → mencionar solo cuando hables de investigación peruana
   
   ⚠️ REGLA CRÍTICA: NUNCA inventes:
   - Títulos de papers
   - Autores específicos ("Smith et al.")
   - Años de publicación
   - Revistas específicas ("Journal of...")
   - DOIs o enlaces
   
   Si quieres mencionar una fuente concreta pero no estás 100% seguro,
   di: "la literatura científica general sugiere..." o
       "existen estudios que respaldan..."

3. NUNCA INVENTES:
   - Referencias bibliográficas específicas (autores, años, títulos)
   - Datos estadísticos exactos (prevalencia, incidencia)
   - Dosis de medicamentos o parámetros clínicos sin respaldo

   Si no tienes certeza de una fuente concreta, di:
   "Basado en guías clínicas generales de fisioterapia..."

4. CITA CUANDO PUEDAS:
   - "Según el CIE-11..."
   - "La Guía MINSA 2023 recomienda..."
   - "El manual de Plaja establece..."

5. CONTEXTO PERUANO:
   - Usa terminología técnica en español de Perú
   - Ajusta recomendaciones a recursos disponibles en centros peruanos
   - Referencias legales: Ley 29733 (Datos Personales), CTMP (colegiatura)

6. LÍMITES ÉTICOS:
   - NO emitas diagnósticos médicos definitivos
   - SIEMPRE sugiere validación por profesional licenciado
   - NO sustituyas juicio clínico profesional
   - Ante duda clínica: "Consulta con un licenciado en fisioterapia"

7. FORMATO DE TABLAS COMPARATIVAS:
   Cuando necesites mostrar una tabla, usa EXACTAMENTE este formato de texto plano con pipes (|) como separadores, sin usar markdown (no uses ---, ***, etc.):

   Ejemplo:
   | Característica | Epicondilitis | Epitrocleitis |
   | Localización | Área externa del codo | Área interna del codo |
   | Causa | Extensión repetitiva | Flexión repetitiva |
   | Síntomas | Dolor al extender | Dolor al flexionar |

   Reglas:
   - Cada fila empieza y termina con pipe.
   - Los pipes separan cada celda.
   - No uses guiones para separar cabecera.
   - Mantén el mismo número de columnas en todas las filas.
   - NO uses **negritas** ni otro formato que interfiera con las tablas.

8. FORMATO GENERAL:
   - Estructura clara: introducción, desarrollo, conclusión.
   - Usa MAYÚSCULAS o negritas para destacar conceptos clave.
   - Listas con guiones cuando aplique.
   - Al final, si aplica: "📚 Fuentes: [lista]"

Tu objetivo es educar, orientar y acompañar — no diagnosticar ni recetar.`;

// ============================================================
// CACHÉ DE CONTEXTO DE USUARIO (evita consultar Supabase en cada msg)
// ============================================================
let _ctxCache = { user_id: null, centro_id: null, ts: 0 };
const CTX_TTL_MS = 5 * 60 * 1000; // 5 minutos

async function obtenerContextoUsuario() {
  const ahora = Date.now();
  if (_ctxCache.user_id && ahora - _ctxCache.ts < CTX_TTL_MS) {
    return _ctxCache;
  }
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { user_id: null, centro_id: null, ts: ahora };
    }
    const { data: perfil } = await supabase
      .from("profiles")
      .select("centro_id")
      .eq("id", user.id)
      .single();

    _ctxCache = {
      user_id: user.id,
      centro_id: perfil?.centro_id || null,
      ts: ahora,
    };
    return _ctxCache;
  } catch (err) {
    console.warn("[IA] No se pudo obtener contexto de usuario:", err);
    return { user_id: null, centro_id: null, ts: ahora };
  }
}

// ============================================================
// FUNCIÓN PÚBLICA — misma firma que antes (NO rompe nada)
// ============================================================
export const consultarAuraIA = async (
  pregunta,
  contexto = {},
  historial = [],
  systemPromptOverride = null,
  tipoConsulta = "chat"
) => {
  // System prompt: override > científico + contexto
  let systemPrompt = systemPromptOverride || SYSTEM_PROMPT_CLINICO;

  if (!systemPromptOverride) {
    if (contexto.ciclo) systemPrompt += `\n\nEl usuario está en ${contexto.ciclo}.`;
    if (contexto.materia) systemPrompt += `\nEstudiando: ${contexto.materia}.`;
    if (contexto.archivo) systemPrompt += `\nArchivo abierto: ${contexto.archivo}.`;
    if (contexto.ultimoPDF) {
      systemPrompt += `\nHa leído recientemente el PDF: "${contexto.ultimoPDF.nombre}" (${contexto.ultimoPDF.ciclo} - ${contexto.ultimoPDF.materia}).`;
    }
  }

  const ctx = await obtenerContextoUsuario();

  return consultarConFallback({
    systemPrompt,
    historial,
    pregunta,
    user_id: ctx.user_id,
    centro_id: ctx.centro_id,
    tipoConsulta,
    maxTokens: 4000,
  });
};