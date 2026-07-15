// src/routes/decision.js
import { Router } from "express";
import { getActorHistory } from "../lrs.js";
import { decideNextStep } from "../claude.js";

export const decisionRouter = Router();

// POST /api/decision
// body: { actorId, courseId, checkpointId }
// El curso Adapt llama a este endpoint en cada punto de decisión adaptativa.
decisionRouter.post("/decision", async (req, res) => {
  const { actorId, courseId, checkpointId } = req.body ?? {};

  if (!actorId || !checkpointId) {
    return res.status(400).json({ error: "actorId y checkpointId son requeridos" });
  }

  try {
    const history = await getActorHistory(actorId, courseId);
    const decision = await decideNextStep(history, checkpointId);
    res.json(decision);
  } catch (error) {
    req.log?.error?.(error);
    res.status(502).json({ error: "No se pudo calcular la siguiente ruta", detail: error.message });
  }
});
