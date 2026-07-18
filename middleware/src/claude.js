// src/claude.js
// Wrapper delgado sobre el SDK de Anthropic — SOLO redacción de feedback y
// generación de variantes de contenido. Ya NO decide nextBlockId (eso lo
// hace bayesEngine.resolveNextBlockId(), determinista). Ver
// docs/arquitectura-motor-bayesiano-adaptativo.md, secciones 1-2.

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-5";

/**
 * Redacta feedback para el alumno tras un ítem, usando el diagnóstico
 * bayesiano como contexto (nunca como algo que Claude deba decidir o
 * cuestionar).
 * @param {object} decisionPayload - salida de bayesEngine.getDecisionPayload()
 * @param {object} itemResult - { itemId, isCorrect, category }
 * @returns {Promise<{ feedback: string }>}
 */
export async function generateFeedback(decisionPayload, itemResult) {
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 300,
    system:
      "Redactas feedback breve y humano para un alumno de un curso adaptativo, " +
      "en español, tono cercano (ver criterios H1/H2 de evaluador-di-rubrica: " +
      "nunca sonar a plantilla). Recibes el diagnóstico bayesiano actual (nivel, " +
      "factores de error) y el resultado del último ítem. NUNCA menciones " +
      "probabilidades, entropía ni nombres internos de hipótesis — tradúcelos a " +
      "lenguaje natural para el alumno. No decides qué bloque sigue, solo redactas.",
    messages: [
      {
        role: "user",
        content: JSON.stringify({ decisionPayload, itemResult }),
      },
    ],
  });

  const text = message.content?.[0]?.text ?? "";
  return { feedback: text };
}
