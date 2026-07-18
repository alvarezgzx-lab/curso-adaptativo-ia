// test/simpleCheckpointRules.test.js
import { test } from "node:test";
import assert from "node:assert/strict";
import { hasSimpleRule, resolveSimpleRoute } from "../src/simpleCheckpointRules.js";

test("hasSimpleRule reconoce los 3 checkpoints con reglas deterministas y ninguno más", () => {
  assert.equal(hasSimpleRule("chk-diagnostico-curso-inicial"), true);
  assert.equal(hasSimpleRule("chk-diagnostico-inicial"), true);
  assert.equal(hasSimpleRule("chk-conceptos-basicos"), true);
  assert.equal(hasSimpleRule("chk-evaluacion-final-curso"), false);
  assert.equal(hasSimpleRule("checkpoint-inexistente"), false);
});

test("chk-diagnostico-curso-inicial siempre resuelve a b-bienvenida-m1, sin importar signals", () => {
  assert.equal(resolveSimpleRoute("chk-diagnostico-curso-inicial", undefined), "b-bienvenida-m1");
  assert.equal(resolveSimpleRoute("chk-diagnostico-curso-inicial", { cualquierCosa: true }), "b-bienvenida-m1");
});

test("chk-diagnostico-inicial: cualquier señal de baja confianza manda a la ruta guiada", () => {
  assert.equal(
    resolveSimpleRoute("chk-diagnostico-inicial", { diagnostico: { d1: "no", d2: "si", d3Correcta: true } }),
    "b-exploracion-guiada-principiante"
  );
  assert.equal(
    resolveSimpleRoute("chk-diagnostico-inicial", { diagnostico: { d1: "si", d2: "no_seguro", d3Correcta: true } }),
    "b-exploracion-guiada-principiante"
  );
  assert.equal(
    resolveSimpleRoute("chk-diagnostico-inicial", { diagnostico: { d1: "si", d2: "si", d3Correcta: false } }),
    "b-exploracion-guiada-principiante"
  );
});

test("chk-diagnostico-inicial: las 3 señales positivas mandan a la ruta directa", () => {
  assert.equal(
    resolveSimpleRoute("chk-diagnostico-inicial", { diagnostico: { d1: "si", d2: "si", d3Correcta: true } }),
    "b-exploracion-directa-experiencia"
  );
});

test("chk-diagnostico-inicial: sin signals devuelve null (el caller usa casoSinHistorialPrevio)", () => {
  assert.equal(resolveSimpleRoute("chk-diagnostico-inicial", undefined), null);
  assert.equal(resolveSimpleRoute("chk-diagnostico-inicial", {}), null);
});

test("chk-conceptos-basicos: score bajo o 2+ fallos manda a refuerzo", () => {
  assert.equal(
    resolveSimpleRoute("chk-conceptos-basicos", { quiz: { scoreScaled: 0.4, intentosFallidos: 0 } }),
    "b-refuerzo-conceptos-basicos"
  );
  assert.equal(
    resolveSimpleRoute("chk-conceptos-basicos", { quiz: { scoreScaled: 0.9, intentosFallidos: 2 } }),
    "b-refuerzo-conceptos-basicos"
  );
});

test("chk-conceptos-basicos: score >= 0.70 manda a síntesis avanzada", () => {
  assert.equal(
    resolveSimpleRoute("chk-conceptos-basicos", { quiz: { scoreScaled: 0.7, intentosFallidos: 0 } }),
    "b-sintesis-avanzada"
  );
});

test("chk-conceptos-basicos: sin signals devuelve null", () => {
  assert.equal(resolveSimpleRoute("chk-conceptos-basicos", undefined), null);
});
