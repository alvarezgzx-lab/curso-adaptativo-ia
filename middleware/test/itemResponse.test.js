// test/itemResponse.test.js
import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { itemResponseRouter } from "../src/routes/itemResponse.js";

test("POST /api/item-response responde 400 si faltan campos requeridos", async () => {
  const app = express();
  app.use(express.json());
  app.use("/api", itemResponseRouter);

  const server = app.listen(0);
  const { port } = server.address();

  const response = await fetch(`http://localhost:${port}/api/item-response`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  assert.equal(response.status, 400);
  server.close();
});
