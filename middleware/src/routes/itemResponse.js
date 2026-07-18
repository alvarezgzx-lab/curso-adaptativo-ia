// src/routes/itemResponse.js
// Llamado por decisionEngine.js tras CADA ítem respondido dentro de un
// checkpoint (no solo al llegar al checkpoint) — así el motor actualiza el
// posterior de forma incremental y elige el siguiente ítem del banco.
//
// Ante una falla técnica (LRS/SQLite/Claude), nunca se bloquea al alumno: se
// responde 200 con nextItemId/feedback en null y un status que lo indica, para
// que decisionEngine.js siga con su propio orden de respaldo — ver
// docs/riesgos.md.

import { Router } from "express";
import { getCheckpointSpec, createEngineForCheckpoint, getItemBank, loadSpec } from "../checkpointSpecs.js";
import { loadState, saveState, hydrateEngine } from "../stateStore.js";
import { generateFeedback } from "../claude.js";

export const itemResponseRouter = Router();

// POST /api/item-response
// body: { actorId, checkpointId, itemId, isCorrect, factorId?, wantsFeedback? }
itemResponseRouter.post("/item-response", async (req, res) => {
  const { actorId, checkpointId, itemId, isCorrect, factorId = null, wantsFeedback = true } = req.body ?? {};

  if (!actorId || !checkpointId || !itemId || typeof isCorrect !== "boolean") {
    return res.status(400).json({
      error: "actorId, checkpointId, itemId e isCorrect (boolean) son requeridos",
    });
  }

  let bank;
  let item;
  try {
    getCheckpointSpec(checkpointId); // valida que el checkpoint existe
    bank = getItemBank(checkpointId);
    item = bank.find((it) => it.itemId === itemId);
  } catch (error) {
    return res.status(400).json({
      error: `checkpointId o banco de ítems inválido: ${checkpointId}`,
      detail: error.message,
    });
  }
  if (!item) {
    return res.status(404).json({ error: `itemId no encontrado en el banco: ${itemId}` });
  }

  let diagnostico = null;
  let nextItem = null;
  try {
    const specGlobal = loadSpec();
    const engine = createEngineForCheckpoint(specGlobal, checkpointId);
    const savedJson = loadState(actorId, checkpointId);
    if (savedJson) hydrateEngine(engine, savedJson);

    engine.registerResponse({
      itemId,
      category: item.category,
      isCorrect,
      itemParams: item,
      factorId: factorId ?? item.factorId ?? null,
    });

    saveState(actorId, checkpointId, engine);

    nextItem = engine.selectNextItem(bank);
    diagnostico = engine.getDecisionPayload();
  } catch (error) {
    req.log?.error?.(error);
    // Falla técnica registrando el estado: no se pierde el intento del
    // alumno, solo la selección adaptativa y el feedback de este ítem.
    return res.json({
      nextItemId: null,
      diagnostico: null,
      feedback: null,
      status: "fallo_tecnico",
      error: error.message,
    });
  }

  let feedback = null;
  if (wantsFeedback) {
    try {
      const result = await generateFeedback(diagnostico, { itemId, isCorrect, category: item.category });
      feedback = result.feedback;
    } catch (error) {
      req.log?.error?.(error);
      // El estado ya se guardó correctamente — una falla solo de Claude no
      // debe invalidar el resto de la respuesta.
      feedback = null;
    }
  }

  res.json({ nextItemId: nextItem?.itemId ?? null, diagnostico, feedback, status: "resuelto" });
});
