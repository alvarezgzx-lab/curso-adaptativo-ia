// src/checkpointSpecs.js
// Carga la especificación de checkpoints (espacioDeHipotesis + configMotor + rutas)
// traducida de lxd/02-especificacion-decision-checkpoints.json (formato bayesiano).
//
// No se lee lxd/ directamente en runtime para no acoplar el contenedor de
// middleware a la carpeta completa de diseño pedagógico. Copia manual: cuando
// lxd/02-especificacion-decision-checkpoints.json esté completo y validado
// (gate de ROADMAP.md), cópialo a middleware/src/config/checkpointSpecs.json
// y reconstruye la imagen. Igual para el banco de ítems (lxd/08 →
// middleware/src/config/itemBank.json).

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { BayesianAdaptiveEngine } from "./bayesEngine.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SPEC_PATH = process.env.CHECKPOINT_SPEC_PATH || path.join(__dirname, "config", "checkpointSpecs.json");
const BANK_PATH = process.env.ITEM_BANK_PATH || path.join(__dirname, "config", "itemBank.json");

let spec = null;
export function loadSpec() {
  if (!spec) {
    spec = JSON.parse(readFileSync(SPEC_PATH, "utf-8"));
  }
  return spec;
}

export function getCheckpointSpec(checkpointId) {
  const { checkpoints } = loadSpec();
  const found = checkpoints.find((c) => c.checkpointId === checkpointId);
  if (!found) throw new Error(`checkpointId desconocido: ${checkpointId}`);
  return found;
}

/** Banco de ítems por checkpoint. `bank[checkpointId]` es un array de ítems
 *  con la forma que bayesEngine.js espera (ver lxd/08-banco-items-bayesiano.json). */
export function getItemBank(checkpointId) {
  const bank = JSON.parse(readFileSync(BANK_PATH, "utf-8"));
  return bank[checkpointId] ?? [];
}

/** Crea un engine nuevo (prior inicial) para un checkpoint, según el espacio
 *  de hipótesis global y la configMotor específica de ese checkpoint. */
export function createEngineForCheckpoint(specGlobal, checkpointId) {
  const { espacioDeHipotesis } = specGlobal;
  const cp = getCheckpointSpec(checkpointId);
  return new BayesianAdaptiveEngine({
    hypothesisSpace: {
      ids: espacioDeHipotesis.nivel.ids,
      thetas: espacioDeHipotesis.nivel.thetas,
    },
    errorFactors: Object.fromEntries(
      Object.entries(espacioDeHipotesis.factoresDeError ?? {})
        .filter(([id]) => id !== "_comentario")
        .map(([id, cfg]) => [id, { priorPresente: cfg.priorPresente }])
    ),
    config: cp.configMotor ?? {},
  });
}
