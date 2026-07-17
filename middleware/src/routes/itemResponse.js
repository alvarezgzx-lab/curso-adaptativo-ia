// src/routes/itemResponse.js
// Llamado por decisionEngine.js tras CADA ítem respondido dentro de un
// checkpoint (no solo al llegar al checkpoint) — así el motor actualiza el
// posterior de forma incremental y elige el siguiente ítem del banco.

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

  try {
    const specGlobal = loadSpec();
    getCheckpointSpec(checkpointId); // valida que el checkpoint existe
    const bank = getItemBank(checkpointId);
    const item = bank.find((it) => it.itemId === itemId);
    if (!item) {
      return res.status(404).json({ error: `itemId no encontrado en el banco: ${itemId}` });
    }

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

    const nextItem = engine.selectNextItem(bank);
    const diagnostico = engine.getDecisionPayload();

    let feedback = null;
    if (wantsFeedback) {
      const result = await generateFeedback(diagnostico, { itemId, isCorrect, category: item.category });
      feedback = result.feedback;
    }

    res.json({ nextItemId: nextItem?.itemId ?? null, diagnostico, feedback });
  } catch (error) {
    req.log?.error?.(error);
    res.status(502).json({ error: "No se pudo registrar la respuesta", detail: error.message });
  }
});
