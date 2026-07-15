// src/index.js
import "dotenv/config";
import express from "express";
import { decisionRouter } from "./routes/decision.js";

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api", decisionRouter);

const port = process.env.PORT || 4000;

// Evita levantar el servidor durante los tests (node --test importa este módulo indirectamente
// solo si algún test lo requiere explícitamente; por ahora los tests son unitarios y no lo tocan).
if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Middleware escuchando en puerto ${port}`);
  });
}

export default app;
