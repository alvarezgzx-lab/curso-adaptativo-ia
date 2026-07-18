// src/routes/decision.js
// Llamado por decisionEngine.js (Adapt) cuando el alumno llega a un
// checkpoint, para saber si ya puede avanzar y a qué nextBlockId.
//
// Dos mecanismos de resolución, elegidos por checkpointId:
//   1. Reglas deterministas (simpleCheckpointRules.js) — para checkpoints cuyo
//      criterioDeSeleccion ya es una regla explícita pero que el motor
//      bayesiano aún no puede resolver por falta de calibración. Requieren
//      `signals` en el body (ver simpleCheckpointRules.js para el contrato
//      exacto por checkpoint).
//   2. bayesEngine.resolveNextBlockId() — determinista también, pero basado en
//      el estado bayesiano persistido, para checkpoints ya calibrados.
// Ninguno de los dos llama a Claude.

import { Router } from "express";
import { getCheckpointSpec, createEngineForCheckpoint, loadSpec } from "../checkpointSpecs.js";
import { loadState, hydrateEngine } from "../stateStore.js";
import { hasSimpleRule, resolveSimpleRoute } from "../simpleCheckpointRules.js";
import { extractBlockId } from "../bayesEngine.js";

export const decisionRouter = Router();

// POST /api/decision
// body: { actorId, checkpointId, signals? }
decisionRouter.post("/decision", (req, res) => {
  const { actorId, checkpointId, signals } = req.body ?? {};

  if (!actorId || !checkpointId) {
    return res.status(400).json({ error: "actorId y checkpointId son requeridos" });
  }

  let checkpointSpec;
  try {
    checkpointSpec = getCheckpointSpec(checkpointId);
  } catch (error) {
    return res.status(400).json({ error: `checkpointId desconocido: ${checkpointId}`, detail: error.message });
  }

  if (hasSimpleRule(checkpointId)) {
    const nextBlockId = resolveSimpleRoute(checkpointId, signals);
    return res.json({
      nextBlockId: nextBlockId ?? extractBlockId(checkpointSpec.casoSinHistorialPrevio),
      status: nextBlockId ? "resuelto" : "resuelto_por_defecto",
      metodo: "reglas_deterministas",
    });
  }

  try {
    const specGlobal = loadSpec();
    const engine = createEngineForCheckpoint(specGlobal, checkpointId);

    const savedJson = loadState(actorId, checkpointId);
    if (savedJson) hydrateEngine(engine, savedJson);

    const nextBlockId = engine.resolveNextBlockId(checkpointSpec);

    if (nextBlockId === null) {
      return res.json({ nextBlockId: null, status: "en_progreso", diagnostico: engine.getDecisionPayload() });
    }

    res.json({ nextBlockId, status: "resuelto", metodo: "motor_bayesiano", diagnostico: engine.getDecisionPayload() });
  } catch (error) {
    req.log?.error?.(error);
    // Ruta segura por defecto ante una falla técnica (LRS/SQLite/etc.) — el
    // alumno nunca se bloquea por un problema de infraestructura; el error
    // queda en la respuesta para que quede registrado y se revise aparte
    // (ver docs/riesgos.md). Mismo principio que casoSinHistorialPrevio:
    // ausencia de evidencia (aquí, técnica) nunca se trata como evidencia de
    // dificultad.
    res.json({
      nextBlockId: extractBlockId(checkpointSpec.casoSinHistorialPrevio),
      status: "resuelto_por_fallo_tecnico",
      error: error.message,
    });
  }
});
