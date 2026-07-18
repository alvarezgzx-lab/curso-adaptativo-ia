// src/simpleCheckpointRules.js
// Reglas de enrutamiento deterministas para checkpoints cuyo criterioDeSeleccion
// (lxd/02-especificacion-decision-checkpoints.json) ya es una regla simple y
// explícita, pero que bayesEngine.resolveNextBlockId() todavía no puede
// resolver porque espacioDeHipotesis/hipotesisAsociadas/factorAsociado/
// rutaPorDefectoSiAmbiguo siguen sin calibrar (ver notaParaDesarrollo de ese
// archivo). Esto es una implementación literal de esos criterios — nada de
// inferencia estadística. Se puede reemplazar por el motor bayesiano checkpoint
// por checkpoint, sin tocar el contrato de POST /api/decision, el día que
// exista la calibración real.
//
// Contrato de `signals` esperado por checkpoint (lo arma decisionEngine.js del
// lado de Adapt, con datos que ya tiene de la actividad recién completada):
//   chk-diagnostico-curso-inicial: no requiere signals.
//   chk-diagnostico-inicial: { diagnostico: { d1: "si"|"no", d2: "si"|"no"|"no_seguro", d3Correcta: boolean } }
//   chk-conceptos-basicos:   { quiz: { scoreScaled: number, intentosFallidos: number } }

const RULES = {
  "chk-diagnostico-curso-inicial": () => "b-bienvenida-m1",

  "chk-diagnostico-inicial": (signals) => {
    const d = signals?.diagnostico;
    if (!d || typeof d.d1 !== "string") return null;
    const bajaExperienciaOConfianza = d.d1 === "no" || d.d2 === "no_seguro" || d.d3Correcta === false;
    return bajaExperienciaOConfianza ? "b-exploracion-guiada-principiante" : "b-exploracion-directa-experiencia";
  },

  "chk-conceptos-basicos": (signals) => {
    const q = signals?.quiz;
    if (!q || typeof q.scoreScaled !== "number") return null;
    // rutaPorDefectoSiAmbiguo (lxd/02) documenta un caso sin resolver: score
    // aprobatorio logrado después del 2° intento. Aquí se simplifica a "solo
    // importa el score final", sin límite de intentos para la ruta de avance —
    // confirmar con Ángel si se requiere una regla distinta.
    const necesitaRefuerzo = q.scoreScaled < 0.7 || (q.intentosFallidos ?? 0) >= 2;
    return necesitaRefuerzo ? "b-refuerzo-conceptos-basicos" : "b-sintesis-avanzada";
  },
};

export function hasSimpleRule(checkpointId) {
  return Object.prototype.hasOwnProperty.call(RULES, checkpointId);
}

/**
 * @returns {string|null} nextBlockId, o null si faltan las señales necesarias
 *   (=> el caller debe usar casoSinHistorialPrevio del checkpointSpec).
 */
export function resolveSimpleRoute(checkpointId, signals) {
  const rule = RULES[checkpointId];
  return rule ? rule(signals) : null;
}
