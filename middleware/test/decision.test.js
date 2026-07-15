// test/decision.test.js
// Test unitario mínimo para validar el contrato del endpoint de decisión sin
// depender de credenciales reales de Claude ni del LRS (eso se cubre en pruebas
// de integración más adelante, cuando el stack completo esté levantado).
import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { decisionRouter } from "../src/routes/decision.js";

test("POST /api/decision responde 400 si faltan campos requeridos", async () => {
  const app = express();
  app.use(express.json());
  app.use("/api", decisionRouter);

  const server = app.listen(0);
  const { port } = server.address();

  const response = await fetch(`http://localhost:${port}/api/decision`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  assert.equal(response.status, 400);
  server.close();
});
