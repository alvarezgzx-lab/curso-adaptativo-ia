// test/bayesEngine.smoke.test.js
import { test } from "node:test";
import assert from "node:assert/strict";
import { BayesianAdaptiveEngine, extractBlockId } from "../src/bayesEngine.js";

test("extractBlockId separa el blockId de la explicación en prosa (convención lxd/02)", () => {
  assert.equal(
    extractBlockId("b-refuerzo-conceptos-basicos — sin intento registrado, tratar como si necesitara refuerzo."),
    "b-refuerzo-conceptos-basicos"
  );
  assert.equal(extractBlockId("b-inicio"), "b-inicio"); // sin explicación, no cambia nada
  assert.equal(extractBlockId(null), null);
});

test("responder bien repetidamente sube la confianza hacia el nivel más alto", () => {
  const engine = new BayesianAdaptiveEngine({
    hypothesisSpace: { ids: ["bajo", "medio", "alto"], thetas: [-2, 0, 2] },
    config: { pmin: 0.8 },
  });

  for (let i = 0; i < 8; i++) {
    engine.registerResponse({
      itemId: `q${i}`,
      category: "cat-1",
      isCorrect: true,
      itemParams: { b: 1, cq: 0.25 },
    });
  }

  const payload = engine.getDecisionPayload();
  assert.equal(payload.nivel.hipotesisGanadora, "alto");
  assert.ok(payload.nivel.confianza >= 0.8);
});

test("resolveNextBlockId devuelve casoSinHistorialPrevio sin historial", () => {
  const engine = new BayesianAdaptiveEngine({
    hypothesisSpace: { ids: ["bajo", "alto"], thetas: [-1, 1] },
  });
  const nextBlockId = engine.resolveNextBlockId({ casoSinHistorialPrevio: "b-inicio" });
  assert.equal(nextBlockId, "b-inicio");
});
