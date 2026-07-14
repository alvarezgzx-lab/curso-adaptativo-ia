// src/lrs.js
// Cliente mínimo para leer statements xAPI de Learning Locker (Statements API).
// Referencia: https://opensource.learninglocker.net/ (Statements API sigue la spec xAPI 1.0.3)

const LRS_ENDPOINT = process.env.LRS_ENDPOINT;
const LRS_KEY = process.env.LRS_KEY;
const LRS_SECRET = process.env.LRS_SECRET;

function authHeader() {
  const token = Buffer.from(`${LRS_KEY}:${LRS_SECRET}`).toString("base64");
  return `Basic ${token}`;
}

/**
 * Obtiene el historial de statements de un actor (alumno) para un curso dado.
 * @param {string} actorId - identificador del alumno (mbox o account)
 * @param {string} courseId - identificador del curso/actividad Adapt
 * @returns {Promise<object[]>} lista de statements xAPI
 */
export async function getActorHistory(actorId, courseId) {
  const url = new URL("statements", LRS_ENDPOINT);
  url.searchParams.set("agent", JSON.stringify({ mbox: `mailto:${actorId}` }));
  if (courseId) url.searchParams.set("activity", courseId);

  const response = await fetch(url, {
    headers: {
      Authorization: authHeader(),
      "X-Experience-API-Version": "1.0.3",
    },
  });

  if (!response.ok) {
    throw new Error(`LRS respondió ${response.status} al consultar statements`);
  }

  const data = await response.json();
  return data.statements ?? [];
}
