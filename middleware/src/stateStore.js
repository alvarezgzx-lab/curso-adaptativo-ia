// src/stateStore.js
// Persistencia del estado del motor bayesiano (nivel.posterior, errores.*.posterior,
// history, recentItemIds) por alumno + checkpoint, entre llamadas al middleware.
// Ver docs/arquitectura-motor-bayesiano-adaptativo.md, sección 5, punto 1.
//
// SQLite dedicado al middleware — desacoplado del ll-redis de Learning Locker
// (distinto ciclo de vida/política de eviction). Migrar a Postgres si un
// segundo/tercer curso confirma que hace falta más que esto.

import DatabaseConstructor from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const DB_PATH = process.env.STATE_DB_PATH || "./data/bayes-state.sqlite";

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new DatabaseConstructor(DB_PATH);
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS engine_state (
    actor_id TEXT NOT NULL,
    checkpoint_id TEXT NOT NULL,
    state_json TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    PRIMARY KEY (actor_id, checkpoint_id)
  );
`);

const getStmt = db.prepare(
  "SELECT state_json FROM engine_state WHERE actor_id = ? AND checkpoint_id = ?"
);
const upsertStmt = db.prepare(`
  INSERT INTO engine_state (actor_id, checkpoint_id, state_json, updated_at)
  VALUES (?, ?, ?, datetime('now'))
  ON CONFLICT(actor_id, checkpoint_id)
  DO UPDATE SET state_json = excluded.state_json, updated_at = excluded.updated_at
`);

/** Serializa solo los datos del engine (no las funciones/clase). */
export function serializeEngine(engine) {
  return JSON.stringify({
    nivel: engine.nivel,
    errores: engine.errores,
    history: engine.history,
    recentItemIds: engine.recentItemIds,
  });
}

/** Reconstituye un engine ya inicializado (mismo hypothesisSpace/config) con el estado guardado. */
export function hydrateEngine(engine, savedJson) {
  const saved = JSON.parse(savedJson);
  engine.nivel.posterior = saved.nivel.posterior;
  for (const [factorId, f] of Object.entries(saved.errores ?? {})) {
    if (engine.errores[factorId]) {
      engine.errores[factorId].posterior = f.posterior;
      engine.errores[factorId].attempts = f.attempts;
    }
  }
  engine.history = saved.history ?? [];
  engine.recentItemIds = saved.recentItemIds ?? [];
  return engine;
}

export function loadState(actorId, checkpointId) {
  const row = getStmt.get(actorId, checkpointId);
  return row ? row.state_json : null;
}

export function saveState(actorId, checkpointId, engine) {
  upsertStmt.run(actorId, checkpointId, serializeEngine(engine));
}
