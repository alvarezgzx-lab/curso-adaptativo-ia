// test/decision.rules.test.js
// Pruebas de integración de POST /api/decision contra los checkpoints de
// Módulo 1 ya cargados en src/config/checkpointSpecs.json (copiado de
// lxd/02-especificacion-decision-checkpoints.json).
import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { decisionRouter } from "../src/routes/decision.js";

async function postDecision(port, body) {
  const response = await fetch(`http://localhost:${port}/api/decision`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return { status: response.status, json: await response.json() };
}

function withServer(fn) {
  return async () => {
    const app = express();
    app.use(express.json());
    app.use("/api", decisionRouter);
    const server = app.listen(0);
    const { port } = server.address();
    try {
      await fn(port);
    } finally {
      server.close();
    }
  };
}

test(
  "chk-conceptos-basicos con score aprobatorio resuelve por reglas deterministas a síntesis avanzada",
  withServer(async (port) => {
    const { status, json } = await postDecision(port, {
      actorId: "alumno-test-1",
      checkpointId: "chk-conceptos-basicos",
      signals: { quiz: { scoreScaled: 0.8, intentosFallidos: 0 } },
    });
    assert.equal(status, 200);
    assert.equal(json.nextBlockId, "b-sintesis-avanzada");
    assert.equal(json.status, "resuelto");
    assert.equal(json.metodo, "reglas_deterministas");
  })
);

test(
  "chk-conceptos-basicos sin signals cae a casoSinHistorialPrevio (b-refuerzo-conceptos-basicos, sin el texto explicativo)",
  withServer(async (port) => {
    const { status, json } = await postDecision(port, {
      actorId: "alumno-test-2",
      checkpointId: "chk-conceptos-basicos",
    });
    assert.equal(status, 200);
    assert.equal(json.nextBlockId, "b-refuerzo-conceptos-basicos");
    assert.equal(json.status, "resuelto_por_defecto");
  })
);

test(
  "chk-diagnostico-curso-inicial siempre resuelve a b-bienvenida-m1",
  withServer(async (port) => {
    const { json } = await postDecision(port, {
      actorId: "alumno-test-3",
      checkpointId: "chk-diagnostico-curso-inicial",
    });
    assert.equal(json.nextBlockId, "b-bienvenida-m1");
  })
);

test(
  "checkpointId desconocido responde 400",
  withServer(async (port) => {
    const { status, json } = await postDecision(port, {
      actorId: "alumno-test-4",
      checkpointId: "chk-no-existe",
    });
    assert.equal(status, 400);
    assert.match(json.error, /checkpointId desconocido/);
  })
);
