/**
 * monteCarloValidate.js
 * ─────────────────────────────────────────────────────────────────────────
 * Validación Monte Carlo del banco de ítems calibrado — especificación
 * "Si la finalidad es diagnóstica": utilidad de validación aparte, sembrada
 * y reproducible, con exactitud equilibrada (balanced accuracy), tasa de
 * indeterminados, longitud media de sesión, y alerta si la exactitud cae
 * por debajo de 0.70. Nivel "Ambicioso" del rediseño.
 *
 * Uso típico: correrlo en CI antes de desplegar un checkpoint nuevo o un
 * banco de ítems recalibrado, no en producción con alumnos reales.
 * ─────────────────────────────────────────────────────────────────────────
 */

import { BayesianAdaptiveEngine, icc3pl } from './bayesEngine.js';

/** PRNG determinista (mulberry32) — reproducibilidad exigida por el protocolo. */
function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Simula un alumno "verdadero" en la hipótesis `trueThetaIdx` respondiendo
 * según las probabilidades reales del banco (no las que el motor cree),
 * hasta que la etapa se da por superada o se alcanza `maxItems`.
 */
function simulateStudent({ hypothesisSpace, errorFactors, bank, config, trueThetaIdx, trueFactors, rng, maxItems = 40 }) {
  const engine = new BayesianAdaptiveEngine({ hypothesisSpace, errorFactors, config });
  let items = 0;
  let promoted = false;

  while (items < maxItems) {
    const item = engine.selectNextItem(bank);
    if (!item) break;

    let isCorrect;
    if (item.factorId) {
      const pReal = trueFactors[item.factorId] ? item.likelihoodPresente : item.likelihoodAusente;
      isCorrect = rng() < pReal;
    } else {
      const trueTheta = hypothesisSpace.thetas[trueThetaIdx];
      const pReal = icc3pl({ theta: trueTheta, b: item.b, cq: item.cq ?? 0, aEf: config.aEf ?? 1.25 });
      isCorrect = rng() < pReal;
    }

    engine.registerResponse({
      itemId: item.itemId,
      category: item.category,
      factorId: item.factorId ?? null,
      itemParams: item,
      isCorrect,
    });
    items += 1;

    const promo = engine.evaluateStagePromotion();
    if (promo.promote) {
      promoted = true;
      break;
    }
  }

  return {
    items,
    promoted,
    diagnostico: engine.getDecisionPayload(),
    aciertoNivel: promoted && engine.getDecisionPayload().nivel.hipotesisGanadora === hypothesisSpace.ids[trueThetaIdx],
  };
}

/**
 * @param {Object} params - hypothesisSpace, errorFactors, bank, config
 * @param {number} [nPerHypothesis=200] - alumnos sintéticos por hipótesis
 * @param {number} [seed=42]
 */
export function runMonteCarloValidation({ hypothesisSpace, errorFactors = {}, bank, config = {}, nPerHypothesis = 200, seed = 42 }) {
  const rng = mulberry32(seed);
  const results = [];
  const n = hypothesisSpace.ids.length;

  for (let h = 0; h < n; h++) {
    for (let s = 0; s < nPerHypothesis; s++) {
      const trueFactors = Object.fromEntries(
        Object.keys(errorFactors).map((fid) => [fid, rng() < (errorFactors[fid].priorPresente ?? 0.25)])
      );
      results.push({
        trueThetaIdx: h,
        ...simulateStudent({ hypothesisSpace, errorFactors, bank, config, trueThetaIdx: h, trueFactors, rng }),
      });
    }
  }

  // Exactitud equilibrada: promedio de la exactitud por hipótesis (no
  // ponderada por frecuencia), para que una hipótesis rara no se diluya.
  const porHipotesis = hypothesisSpace.ids.map((id, idx) => {
    const subset = results.filter((r) => r.trueThetaIdx === idx);
    const promovidos = subset.filter((r) => r.promoted);
    const aciertos = subset.filter((r) => r.aciertoNivel).length;
    return {
      hipotesis: id,
      nSimulados: subset.length,
      tasaPromocion: promovidos.length / subset.length,
      exactitud: aciertos / subset.length,
      longitudMedia: subset.reduce((a, r) => a + r.items, 0) / subset.length,
    };
  });

  const balancedAccuracy = porHipotesis.reduce((a, h) => a + h.exactitud, 0) / porHipotesis.length;
  const tasaIndeterminados = results.filter((r) => !r.promoted).length / results.length;
  const longitudMediaGlobal = results.reduce((a, r) => a + r.items, 0) / results.length;

  return {
    seed,
    nTotal: results.length,
    balancedAccuracy,
    tasaIndeterminados,
    longitudMediaGlobal,
    porHipotesis,
    alerta: balancedAccuracy < 0.7
      ? `ALERTA: exactitud equilibrada (${balancedAccuracy.toFixed(3)}) por debajo de 0.70. Banco de ítems o umbrales requieren revisión antes de desplegar.`
      : null,
  };
}
