/**
 * bayesEngine.js
 * ─────────────────────────────────────────────────────────────────────────
 * Motor bayesiano adaptativo — implementación de referencia.
 *
 * Basado en el "Protocolo para sistemas educativos adaptativos bayesianos"
 * de Juan José de Haro (https://jjdeharo.github.io/recursos-adaptativos/),
 * versión 2.6. Cada función referencia la sección del protocolo o de los
 * fundamentos matemáticos de la que proviene, para trazabilidad.
 *
 * Configuración instanciada para el caso elegido:
 *   · Perfil A+C combinado — nivel ordinal (IRT 3PL) + factores de error
 *     que pueden coexistir (distribuciones binarias paralelas).
 *   · Modo Itinerario con práctica interna en cada etapa — dentro de una
 *     etapa se comporta como una sesión de Práctica (olvido activo,
 *     selección en dos fases, sin criterio de parada duro); la etapa se
 *     da por superada con el criterio de promoción de "Itinerarios por
 *     etapas" (protocolo §13.3 / §17), no con el criterio de cierre de
 *     Diagnóstico.
 *
 * No es código de producción listo para desplegar: es la lógica de
 * decisión que reemplaza el juicio cualitativo de middleware/src/claude.js
 * para el enrutamiento (nextBlockId). Claude API se reserva para lo que
 * este módulo no hace: redactar feedback, generar variantes de contenido,
 * ajustar registro. Ver docs/arquitectura-motor-bayesiano-adaptativo.md.
 *
 * Sin dependencias externas — ES module puro, usable en Node (middleware)
 * o en cliente (decisionEngine.js) según dónde convenga mantener el estado.
 * ─────────────────────────────────────────────────────────────────────────
 */

// ════════════════════════════════════════════════════════════════════════
// 1. Utilidades matemáticas base
// ════════════════════════════════════════════════════════════════════════

/** Techo/suelo de dominio — fundamentos §4.3, §8.3; especificación "Verosimilitudes".
 *  Evita que P(acierto)→1 dispare el posterior de forma casi determinista
 *  tras un solo fallo en un ítem fácil (modela el descuido / slip). */
export function clampDomain(p, ceiling = 0.95, floor = 0.05) {
  return Math.min(Math.max(p, floor), ceiling);
}

/** Curva característica del ítem, modelo IRT de 3 parámetros.
 *  fundamentos §4.2. `aEf` es la discriminación EFECTIVA objetivo (no `a`
 *  directamente): a = aEf / (1 - cq). Con aEf=1.25 por defecto:
 *  abierta(cq=0)→a=1.25 · 4 opc(cq=.25)→a≈1.667 · V/F(cq=.5)→a=2.5. */
export function icc3pl({ theta, b, cq = 0, aEf = 1.25 }) {
  const a = aEf / (1 - cq);
  const raw = cq + (1 - cq) / (1 + Math.exp(-a * (theta - b)));
  return clampDomain(raw);
}

/** Entropía de Shannon — fundamentos §5, protocolo §16. Mide en bits la
 *  incertidumbre de una distribución de probabilidades. */
export function shannonEntropy(p) {
  return -p.reduce((acc, pi) => acc + (pi > 0 ? pi * Math.log2(pi) : 0), 0);
}

/** Umbral de parada derivado de p_min — especificación "Criterio de parada".
 *  H_stop = -p_min·log2(p_min) - (1-p_min)·log2((1-p_min)/(n-1)) */
export function hStop(pmin, n) {
  if (n <= 1) return 0;
  return -pmin * Math.log2(pmin) - (1 - pmin) * Math.log2((1 - pmin) / (n - 1));
}

function normalize(p) {
  const s = p.reduce((a, b) => a + b, 0);
  return s > 0 ? p.map((pi) => pi / s) : p.map(() => 1 / p.length);
}

/** Actualización bayesiana estándar — fundamentos §3.3. */
export function bayesUpdate(prior, likelihoods) {
  return normalize(prior.map((pi, i) => pi * likelihoods[i]));
}

/** Olvido exponencial ANCLADO A LA PROBABILIDAD A PRIORI INICIAL (no a la
 *  uniforme) — fundamentos §3.5. Se aplica ANTES de incorporar cada nueva
 *  respuesta:
 *    P(t+1)(Hi) ∝ [P(t)(Hi)]^λ · πi^(1-λ)
 *  con λ=1 → sin olvido (Bayes estándar). Memoria efectiva ≈ 1/(1-λ).
 *  Regla práctica: λ = 1 - 1/W, con W = nº de respuestas recientes que
 *  deben dominar la estimación (10-20 en práctica típica). CRÍTICO: anclar
 *  a π (inicial), nunca a la uniforme, o el sistema deriva hacia la
 *  ignorancia total sin evidencia nueva (hallazgo N1, CAMBIOS_METODOLOGIA.md). */
export function applyForgetting(posterior, priorInicial, lambda) {
  if (lambda >= 1) return posterior;
  return normalize(
    posterior.map((pi, i) => Math.pow(pi, lambda) * Math.pow(priorInicial[i], 1 - lambda))
  );
}

/** Ganancia esperada de información para un ítem ordinal (perfil A, IRT) —
 *  fundamentos §6, protocolo §5.7.
 *  IG(q) = H(antes) - [P(A)·H(después|acierto) + P(F)·H(después|fallo)] */
export function expectedInformationGainOrdinal({ posterior, thetas, itemParams }) {
  const likelihoods = thetas.map((theta) => icc3pl({ theta, ...itemParams }));
  const pA = posterior.reduce((acc, pi, i) => acc + pi * likelihoods[i], 0);
  const pF = 1 - pA;
  const postA = bayesUpdate(posterior, likelihoods);
  const postF = bayesUpdate(posterior, likelihoods.map((l) => 1 - l));
  const hBefore = shannonEntropy(posterior);
  const hAfter = pA * shannonEntropy(postA) + pF * shannonEntropy(postF);
  return Math.max(0, hBefore - hAfter); // la IG esperada nunca es negativa (info mutua)
}

/** Ganancia esperada de información para un factor nominal binario
 *  (presente/ausente) — mismo desarrollo que arriba, aplicado a un vector
 *  de 2 hipótesis con verosimilitudes explícitas por ítem. */
export function expectedInformationGainNominal({ posterior, likelihoodAusente, likelihoodPresente }) {
  const likelihoods = [likelihoodAusente, likelihoodPresente];
  const pA = posterior[0] * likelihoods[0] + posterior[1] * likelihoods[1];
  const pF = 1 - pA;
  const postA = bayesUpdate(posterior, likelihoods);
  const postF = bayesUpdate(posterior, likelihoods.map((l) => 1 - l));
  const hBefore = shannonEntropy(posterior);
  const hAfter = pA * shannonEntropy(postA) + pF * shannonEntropy(postF);
  return Math.max(0, hBefore - hAfter);
}

function uniformPrior(n) {
  return new Array(n).fill(1 / n);
}

function weightedRandomPick(items, weights, rng = Math.random) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rng() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

// ════════════════════════════════════════════════════════════════════════
// 2. Motor — estado, actualización, selección, promoción
// ════════════════════════════════════════════════════════════════════════

export class BayesianAdaptiveEngine {
  /**
   * @param {Object} params
   * @param {Object} params.hypothesisSpace - { ids, thetas, priorInicial? }
   *   Perfil A (nivel ordinal). Ancla `ids` a niveles Bloom si aplica
   *   (ver integración con evaluador-di-rubrica, criterio P1).
   *   Prior de nivel: uniforme si no hay información previa fiable
   *   (especificación "Estado del alumno").
   * @param {Object} [params.errorFactors] - { factorId: { priorPresente } }
   *   Perfil C (multifactorial). NUNCA prior uniforme — usa 0.2–0.3
   *   (especificación "Estado del alumno").
   * @param {Object} [params.config]
   */
  constructor({ hypothesisSpace, errorFactors = {}, config = {} }) {
    const n = hypothesisSpace.ids.length;
    this.nivel = {
      ids: hypothesisSpace.ids,
      thetas: hypothesisSpace.thetas,
      priorInicial: hypothesisSpace.priorInicial ?? uniformPrior(n),
      posterior: [...(hypothesisSpace.priorInicial ?? uniformPrior(n))],
    };

    this.errores = {};
    for (const [factorId, cfg] of Object.entries(errorFactors)) {
      const p0 = cfg.priorPresente ?? 0.25; // prior informativo moderado, nunca 0.5
      this.errores[factorId] = {
        priorInicial: [1 - p0, p0], // [ausente, presente]
        posterior: [1 - p0, p0],
        attempts: 0,
      };
    }

    this.config = {
      lambda: config.lambda ?? 0.9, // memoria efectiva ≈ 10 respuestas por defecto (práctica)
      aEf: config.aEf ?? 1.25,
      pmin: config.pmin ?? 0.8,
      minAttemptsPerCategory: config.minAttemptsPerCategory ?? 2, // fase diagnóstica, protocolo §13.1
      recentExclusionWindow: config.recentExclusionWindow ?? 5, // anti-repetición, especificación "Selección adaptativa"
      alphaUtility: config.alphaUtility ?? 0.5, // pondera IG vs brecha de dominio en refuerzo, protocolo §13.1
      minFactorAttemptsToDecide: config.minFactorAttemptsToDecide ?? 2,
      floorProbability: config.floorProbability ?? 0.01, // ninguna hipótesis a 0 irreversible, especificación v2.5
    };

    this.history = [];
    this.recentItemIds = [];
  }

  // ── Registro de respuesta ────────────────────────────────────────────

  /**
   * @param {Object} r
   * @param {string} r.itemId
   * @param {string} r.category - concepto/categoría, para muestreo mínimo y diversidad
   * @param {Object} r.itemParams - { b, cq } si es ítem de nivel (IRT);
   *   { likelihoodAusente, likelihoodPresente } si es ítem diagnóstico de un factor
   * @param {string|null} [r.factorId] - null → actualiza `nivel`; si no, ese factor
   * @param {number} [r.s] - crédito parcial en [0,1]; por defecto isCorrect ? 1 : 0
   * @param {boolean} r.isCorrect
   * @param {boolean} [r.itemYaVistoConCorreccion] - si es reintento tras ver la
   *   explicación: aplica crédito parcial reducido al acierto, nunca exclusión
   *   en modo Práctica (especificación "Selección adaptativa" — evidencia de
   *   ítem reutilizado). Pásalo ya resuelto en `r.s` si lo calculas fuera.
   */
  registerResponse({ itemId, category, isCorrect, itemParams, factorId = null, s = null }) {
    const score = s ?? (isCorrect ? 1 : 0);
    if (factorId) {
      this._updateErrorFactor(factorId, itemParams, score);
    } else {
      this._updateNivel(itemParams, score);
    }
    this.history.push({ itemId, category, factorId, isCorrect, score, t: this.history.length });
    this.recentItemIds.push(itemId);
    if (this.recentItemIds.length > this.config.recentExclusionWindow) this.recentItemIds.shift();
  }

  _updateNivel(itemParams, score) {
    let prior = this.nivel.posterior;
    if (this.config.lambda < 1) {
      prior = applyForgetting(prior, this.nivel.priorInicial, this.config.lambda);
    }
    const pAcierto = this.nivel.thetas.map((theta) =>
      icc3pl({ theta, ...itemParams, aEf: this.config.aEf })
    );
    // Crédito parcial: interpola linealmente entre verosimilitud de fallo y de
    // acierto (aproximación recomendada; fundamentos §4.8/5.8 para el caso exacto).
    const likelihoods = pAcierto.map((p) => score * p + (1 - score) * (1 - p));
    this.nivel.posterior = bayesUpdate(prior, likelihoods);
    this._enforceNoIrreversibleElimination(this.nivel.posterior);
  }

  _updateErrorFactor(factorId, itemParams, score) {
    const f = this.errores[factorId];
    if (!f) throw new Error(`Factor de error desconocido: ${factorId}`);
    let prior = f.posterior;
    if (this.config.lambda < 1) {
      prior = applyForgetting(prior, f.priorInicial, this.config.lambda);
    }
    const lAusente = score * itemParams.likelihoodAusente + (1 - score) * (1 - itemParams.likelihoodAusente);
    const lPresente = score * itemParams.likelihoodPresente + (1 - score) * (1 - itemParams.likelihoodPresente);
    f.posterior = bayesUpdate(prior, [lAusente, lPresente]);
    f.attempts += 1;
    this._enforceNoIrreversibleElimination(f.posterior);
  }

  /** Ninguna respuesta aislada elimina una hipótesis de forma irreversible
   *  — especificación v2.5 / "Reglas de diseño". */
  _enforceNoIrreversibleElimination(dist) {
    const floor = this.config.floorProbability;
    for (let i = 0; i < dist.length; i++) if (dist[i] < floor) dist[i] = floor;
    const s = dist.reduce((a, b) => a + b, 0);
    for (let i = 0; i < dist.length; i++) dist[i] /= s;
  }

  // ── Selección adaptativa: bloques pedagógicos, dos fases, IG total ───

  _countAttemptsPerCategory() {
    const counts = {};
    for (const h of this.history) counts[h.category] = (counts[h.category] ?? 0) + 1;
    return counts;
  }

  _masteryEstimate(category) {
    const relevant = this.history.filter((h) => h.category === category);
    if (relevant.length === 0) return 0.5;
    return relevant.reduce((a, h) => a + h.score, 0) / relevant.length;
  }

  /**
   * Selecciona el siguiente ítem del banco. `bank` es un array de ítems,
   * cada uno con: itemId, category, factorId (null si es de nivel),
   * y los parámetros de verosimilitud correspondientes.
   *
   * Bloques pedagógicos (protocolo §14, especificación "Selección
   * adaptativa · bloques pedagógicos"): la ganancia total al comparar
   * ítems de distinto bloque (nivel vs. un factor de error concreto) es
   * la suma de sus IG marginales — aquí se comparan directamente porque
   * cada ítem pertenece a un solo bloque.
   */
  selectNextItem(bank) {
    const attemptsPerCategory = this._countAttemptsPerCategory();
    const underSampled = bank.filter(
      (it) => (attemptsPerCategory[it.category] ?? 0) < this.config.minAttemptsPerCategory
    );
    const pool = underSampled.length > 0 ? underSampled : bank; // fase diagnóstica → fase de refuerzo, §13.1
    const candidates = pool.filter((it) => !this.recentItemIds.includes(it.itemId));
    // Banco insuficiente: si no hay alternativa, reusar (documentar como
    // limitación, nunca simular variedad falsa) — especificación "Selección adaptativa".
    const usable = candidates.length > 0 ? candidates : pool;

    const scored = usable.map((item) => {
      const ig = this._computeItemIG(item);
      const utility = underSampled.length > 0 ? ig : this._blendUtility(ig, item);
      return { item, utility };
    });

    return this._weightedTieBreak(scored);
  }

  _computeItemIG(item) {
    if (item.factorId) {
      const f = this.errores[item.factorId];
      return expectedInformationGainNominal({
        posterior: f.posterior,
        likelihoodAusente: item.likelihoodAusente,
        likelihoodPresente: item.likelihoodPresente,
      });
    }
    return expectedInformationGainOrdinal({
      posterior: this.nivel.posterior,
      thetas: this.nivel.thetas,
      itemParams: { b: item.b, cq: item.cq ?? 0, aEf: this.config.aEf },
    });
  }

  /** Refuerzo continuo (protocolo §13.1/13.2): no maximiza solo IG —
   *  también prioriza lo menos dominado, ponderado por `alphaUtility`. */
  _blendUtility(ig, item) {
    const domGap = item.factorId ? this.errores[item.factorId].posterior[1] : 1 - this._masteryEstimate(item.category);
    const a = this.config.alphaUtility;
    return a * ig + (1 - a) * domGap;
  }

  /** Desempate por selección aleatoria ponderada dentro de un margen del
   *  máximo — NUNCA determinista (especificación "Selección adaptativa").
   *  Favorece categorías menos repetidas. */
  _weightedTieBreak(scored, margin = 0.05, rng = Math.random) {
    if (scored.length === 0) return null;
    const max = Math.max(...scored.map((s) => s.utility));
    const near = scored.filter((s) => s.utility >= max - margin);
    if (near.length === 1) return near[0].item;
    const freq = this._countAttemptsPerCategory();
    const weights = near.map((s) => 1 / (1 + (freq[s.item.category] ?? 0)));
    return weightedRandomPick(near.map((s) => s.item), weights, rng);
  }

  // ── Criterio de promoción de etapa (modo Itinerario, protocolo §13.3) ─

  /**
   * @param {Array} [exitItemResults] - resultados de ítems de SALIDA,
   *   seleccionados con dificultad representativa SIN criterio de máxima
   *   IG (protocolo §13.3). Evitar V/F; exigir 2/2 con 4-5 opciones.
   *   Cada elemento: { correct: boolean }.
   */
  evaluateStagePromotion({ exitItemResults = [] } = {}) {
    const { pmin } = this.config;
    const n = this.nivel.ids.length;
    const localConfidence = Math.max(...this.nivel.posterior) >= pmin;
    const localEntropy = shannonEntropy(this.nivel.posterior) <= hStop(pmin, n);
    const exitOk = exitItemResults.length === 0 || exitItemResults.every((r) => r.correct);
    const errorFactorsResolved = Object.values(this.errores).every(
      (f) => f.attempts < this.config.minFactorAttemptsToDecide || f.posterior[1] >= 0.7 || f.posterior[1] <= 0.3
    );
    return {
      promote: localConfidence && localEntropy && exitOk,
      detalle: { localConfidence, localEntropy, exitOk, errorFactorsResolved },
      diagnostico: this.getDecisionPayload(),
    };
  }

  /** Payload de diagnóstico — esto es lo único que se pasa a Claude API
   *  para generar feedback/contenido; Claude no decide la ruta. */
  getDecisionPayload() {
    const maxP = Math.max(...this.nivel.posterior);
    const dominantIdx = this.nivel.posterior.indexOf(maxP);
    return {
      nivel: {
        hipotesisGanadora: this.nivel.ids[dominantIdx],
        posterior: [...this.nivel.posterior],
        entropia: shannonEntropy(this.nivel.posterior),
        confianza: maxP,
      },
      errores: Object.fromEntries(
        Object.entries(this.errores).map(([id, f]) => [
          id,
          {
            pPresente: f.posterior[1],
            estado:
              f.attempts < this.config.minFactorAttemptsToDecide
                ? 'sin_evidencia_suficiente'
                : f.posterior[1] >= 0.7
                ? 'presente'
                : f.posterior[1] <= 0.3
                ? 'ausente'
                : 'indeterminado',
          },
        ])
      ),
    };
  }

  // ── Resolución de ruta (reemplaza la decisión cualitativa de Claude) ──

  /**
   * @param {Object} checkpointSpec - ver plantilla-checkpoints-decision-bayesiano.json
   * @returns {string|null} nextBlockId, o null si aún es indeterminado
   *   (=> seguir en el bloque actual / seguir en fase de práctica; NO
   *   llamar a Claude para "decidir", solo para dar feedback del ítem).
   */
  resolveNextBlockId(checkpointSpec) {
    if (this.history.length === 0) {
      return checkpointSpec.casoSinHistorialPrevio; // trivial: nunca llama a Claude para esto
    }
    const promo = this.evaluateStagePromotion({
      exitItemResults: checkpointSpec._exitItemResults ?? [],
    });
    if (!promo.promote) return null;

    const diag = promo.diagnostico;
    // Perfil A+C: si el nivel es alto pero persiste un error, es un MATIZ del
    // nivel, no una conclusión contradictoria (especificación "Estado del
    // alumno" — bloques pedagógicos). Se resuelve dando prioridad a rutas de
    // refuerzo asociadas a un factor "presente" por encima de la ruta de
    // avance de nivel puro, si el checkpoint las distingue.
    const rutaPorError = checkpointSpec.rutasPosibles.find((r) =>
      r.factorAsociado && diag.errores[r.factorAsociado]?.estado === 'presente'
    );
    if (rutaPorError) return rutaPorError.nextBlockId;

    const rutaPorNivel = checkpointSpec.rutasPosibles.find((r) =>
      r.hipotesisAsociadas?.includes(diag.nivel.hipotesisGanadora)
    );
    return rutaPorNivel ? rutaPorNivel.nextBlockId : checkpointSpec.rutaPorDefectoSiAmbiguo ?? null;
  }
}
