// src/index.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import { decisionRouter } from "./routes/decision.js";
import { itemResponseRouter } from "./routes/itemResponse.js";

const app = express();
// El curso Adapt (decisionEngine.js) llama a esta API desde el navegador,
// desde el origen donde Moodle/el hosting sirva el curso — siempre un
// origen distinto al del middleware. Sin CORS, el navegador bloquea esas
// llamadas. No hay cookies/sesión de por medio (solo JSON con actorId), así
// que un origen abierto es razonable aquí; restringir vía CORS_ORIGIN si
// se necesita más adelante.
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api", decisionRouter);
app.use("/api", itemResponseRouter);

const port = process.env.PORT || 4000;

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Middleware escuchando en puerto ${port}`);
  });
}

export default app;
