// src/index.js
import "dotenv/config";
import express from "express";
import { decisionRouter } from "./routes/decision.js";
import { itemResponseRouter } from "./routes/itemResponse.js";

const app = express();
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
