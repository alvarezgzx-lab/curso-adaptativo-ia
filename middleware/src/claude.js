// src/claude.js
// Wrapper delgado sobre el SDK de Anthropic para pedir la siguiente ruta adaptativa
// con base en el historial xAPI del alumno.

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-5";

/**
 * Decide el siguiente bloque/ruta del curso según el historial de statements del alumno.
 * @param {object[]} history - statements xAPI del alumno hasta este punto de decisión
 * @param {string} checkpointId - id del punto de decisión actual definido en el curso Adapt
 * @returns {Promise<{ nextBlockId: string, rationale: string }>}
 */
export async function decideNextStep(history, checkpointId) {
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 300,
    system:
      "Eres el motor de decisión de un curso adaptativo. Recibes el historial de " +
      "interacciones xAPI de un alumno y el punto de decisión actual. Responde " +
      "únicamente con un JSON de la forma {\"nextBlockId\": string, \"rationale\": string}.",
    messages: [
      {
        role: "user",
        content: JSON.stringify({ checkpointId, history }),
      },
    ],
  });

  const text = message.content?.[0]?.text ?? "{}";
  return JSON.parse(text);
}
