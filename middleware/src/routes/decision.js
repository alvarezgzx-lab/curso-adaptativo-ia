// src/routes/decision.js
// Llamado por decisionEngine.js (Adapt) cuando el alumno llega a un
// checkpoint, para saber si ya puede avanzar y a qué nextBlockId. NO llama
// a Claude — el enrutamiento es 100% bayesEngine.resolveNextBlockId(),
// determinista y auditable.

import { Router } from "express";
import { getCheckpointSpec, createEngineForCheckpoint, loadSpec } from "../checkpointSpecs.js";
import { loadState, hydrateEngine } from "../stateStore.js";

export const decisionRouter = Router();

// POST /api/decision
// body: { actorId, checkpointId }
decisionRouter.post("/decision", (req, res) => {
  const { actorId, checkpointId } = req.body ?? {};

  if (!actorId || !checkpointId) {
    return res.status(400).json({ error: "actorId y checkpointId son requeridos" });
  }

  try {
    const specGlobal = loadSpec();
    const checkpointSpec = getCheckpointSpec(checkpointId);
    const engine = createEngineForCheckpoint(specGlobal, checkpointId);

    const savedJson = loadState(actorId, checkpointId);
    if (savedJson) hydrateEngine(engine, savedJson);

    const nextBlockId = engine.resolveNextBlockId(checkpointSpec);

    if (nextBlockId === null) {
      return res.json({ nextBlockId: null, status: "en_progreso", diagnostico: engine.getDecisionPayload() });
    }

    res.json({ nextBlockId, status: "resuelto", diagnostico: engine.getDecisionPayload() });
  } catch (error) {
    req.log?.error?.(error);
    res.status(502).json({ error: "No se pudo resolver el checkpoint", detail: error.message });
  }
});
