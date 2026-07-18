// test/itemResponse.quiz.test.js
// Prueba de integración contra un ítem real (CB1, del quiz de
// chk-conceptos-basicos) ya cargado en src/config/itemBank.json. Corre sin
// ANTHROPIC_API_KEY configurada a propósito: confirma que una falla de Claude
// no bloquea la respuesta (feedback degrada a null, el resto sigue
// resolviéndose bien) — ver el manejo de fallos en src/routes/itemResponse.js.
import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { itemResponseRouter } from "../src/routes/itemResponse.js";

test("POST /api/item-response con un ítem real devuelve nextItemId y degrada el feedback si Claude falla", async () => {
  const app = express();
  app.use(express.json());
  app.use("/api", itemResponseRouter);

  const server = app.listen(0);
  const { port } = server.address();

  const response = await fetch(`http://localhost:${port}/api/item-response`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      actorId: "alumno-test-quiz-1",
      checkpointId: "chk-conceptos-basicos",
      itemId: "CB1",
      isCorrect: true,
    }),
  });
  const json = await response.json();

  assert.equal(response.status, 200);
  assert.equal(json.status, "resuelto");
  assert.ok(typeof json.nextItemId === "string" || json.nextItemId === null);
  assert.equal(json.feedback, null); // sin ANTHROPIC_API_KEY, Claude falla y degrada a null
  assert.ok(json.diagnostico);
  assert.ok(json.diagnostico.nivel);

  server.close();
});

test("POST /api/item-response con itemId inexistente responde 404", async () => {
  const app = express();
  app.use(express.json());
  app.use("/api", itemResponseRouter);

  const server = app.listen(0);
  const { port } = server.address();

  const response = await fetch(`http://localhost:${port}/api/item-response`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      actorId: "alumno-test-quiz-2",
      checkpointId: "chk-conceptos-basicos",
      itemId: "ITEM-NO-EXISTE",
      isCorrect: true,
    }),
  });

  assert.equal(response.status, 404);
  server.close();
});
