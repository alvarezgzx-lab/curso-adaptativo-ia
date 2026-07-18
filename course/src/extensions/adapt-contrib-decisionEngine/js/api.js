// api.js — cliente HTTP hacia el middleware (POST /api/decision, POST
// /api/item-response). Ver middleware/src/routes/decision.js e
// itemResponse.js para el contrato exacto de cada endpoint.
//
import notify from 'core/js/notify';
//
// Fallback ante fallo de RED (el fetch mismo falla — servidor caído,
// sin conexión): el middleware ya tiene su propia ruta segura por defecto
// para fallos internos (LRS/SQLite/Claude, ver docs/riesgos.md), pero si la
// petición nunca llega, decisionEngine necesita su propio respaldo local
// para no bloquear al alumno — elicitado con Ángel: "ruta segura por
// defecto + aviso discreto". Estos valores están duplicados a propósito de
// lxd/02-especificacion-decision-checkpoints.json (casoSinHistorialPrevio);
// si cambian ahí, hay que actualizarlos aquí también.
const CASO_SIN_HISTORIAL_PREVIO_LOCAL = {
  'chk-diagnostico-curso-inicial': 'b-bienvenida-m1',
  'chk-diagnostico-inicial': 'b-exploracion-guiada-principiante',
  'chk-conceptos-basicos': 'b-refuerzo-conceptos-basicos',
  'chk-evaluacion-final-curso': 'b-evaluacion-final-estandar'
};

function getMiddlewareUrl(Adapt) {
  const config = Adapt.course.get('_decisionEngine') || {};
  return config._middlewareUrl || 'http://localhost:4000/api';
}

function showAvisoDiscreto(mensaje) {
  // Aviso discreto y no bloqueante (elicitado: nunca detener la experiencia
  // por una falla técnica) — notify.push() del core de Adapt: notificación
  // pequeña, no modal, se autodescarta.
  console.warn('[decisionEngine]', mensaje);
  notify.push({ title: 'Aviso', body: 'Hubo un problema técnico menor — puedes seguir, ya quedó registrado para revisión.', _timeout: 6000 });
}

/**
 * @param {object} Adapt
 * @param {object} params - { actorId, checkpointId, signals }
 * @returns {Promise<{ nextBlockId: string, status: string }>}
 */
export async function postDecision(Adapt, { actorId, checkpointId, signals }) {
  const url = `${getMiddlewareUrl(Adapt)}/decision`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actorId, checkpointId, signals })
    });
    if (!response.ok) throw new Error(`POST /decision respondió ${response.status}`);
    return await response.json();
  } catch (error) {
    showAvisoDiscreto(`No se pudo contactar al middleware para ${checkpointId} (${error.message}). Usando ruta segura por defecto.`);
    return {
      nextBlockId: CASO_SIN_HISTORIAL_PREVIO_LOCAL[checkpointId] ?? null,
      status: 'resuelto_por_fallo_de_red'
    };
  }
}

/**
 * @param {object} Adapt
 * @param {object} params - { actorId, checkpointId, itemId, isCorrect, wantsFeedback }
 * @returns {Promise<{ nextItemId: string|null, feedback: string|null, status: string }>}
 */
export async function postItemResponse(Adapt, { actorId, checkpointId, itemId, isCorrect, wantsFeedback = true }) {
  const url = `${getMiddlewareUrl(Adapt)}/item-response`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actorId, checkpointId, itemId, isCorrect, wantsFeedback })
    });
    if (!response.ok) throw new Error(`POST /item-response respondió ${response.status}`);
    return await response.json();
  } catch (error) {
    showAvisoDiscreto(`No se pudo registrar la respuesta de ${itemId} (${error.message}). Se continúa sin selección adaptativa ni feedback para este ítem.`);
    return { nextItemId: null, feedback: null, status: 'fallo_de_red' };
  }
}
