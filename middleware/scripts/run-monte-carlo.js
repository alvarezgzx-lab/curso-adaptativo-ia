#!/usr/bin/env node
// scripts/run-monte-carlo.js
// Uso: npm run monte-carlo -- <checkpointId>
// Corre la validación Monte Carlo de un checkpoint usando la config y el
// banco de ítems ya copiados a src/config/. Falla (exit 1) si hay alerta.

import { runMonteCarloValidation } from "../src/monteCarloValidate.js";
import { loadSpec, getCheckpointSpec, getItemBank } from "../src/checkpointSpecs.js";

const checkpointId = process.argv[2];
if (!checkpointId) {
  console.error("Uso: npm run monte-carlo -- <checkpointId>");
  process.exit(1);
}

const specGlobal = loadSpec();
const checkpointSpec = getCheckpointSpec(checkpointId);
const bank = getItemBank(checkpointId);

if (bank.length === 0) {
  console.error(`No hay ítems en el banco para "${checkpointId}" (src/config/itemBank.json). Nada que validar.`);
  process.exit(1);
}

const result = runMonteCarloValidation({
  hypothesisSpace: {
    ids: specGlobal.espacioDeHipotesis.nivel.ids,
    thetas: specGlobal.espacioDeHipotesis.nivel.thetas,
  },
  errorFactors: specGlobal.espacioDeHipotesis.factoresDeError ?? {},
  bank,
  config: checkpointSpec.configMotor ?? {},
});

console.log(JSON.stringify(result, null, 2));
if (result.alerta) {
  console.error(result.alerta);
  process.exit(1);
}
