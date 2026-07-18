// adapt-contrib-decisionEngine
// ─────────────────────────────────────────────────────────────────────────
// El puente entre el curso Adapt y el middleware de curso-adaptativo-ia.
// NO decide nada por sí misma — solo recolecta señales de la interacción
// del alumno, se las pasa al middleware, y revela el bloque/ítem que el
// middleware devuelve. Toda la lógica de decisión vive en el servidor
// (middleware/src/routes/decision.js, simpleCheckpointRules.js,
// bayesEngine.js) — ver docs/arquitectura-motor-bayesiano-adaptativo.md.
//
// Decisiones de arquitectura ya elicitadas con Ángel (no reabrir sin
// confirmar con él):
//   - actorId: cmi.core.student_id vía SCORM/spoor (offlineStorage).
//   - Navegación: bloqueada hasta resolver — los bloques condicionales
//     arrancan con _isAvailable:false en el JSON del curso, así que
//     simplemente no hay nada que el alumno pueda ver/clickear hasta que
//     esta extensión los revele. No hace falta lógica de bloqueo aparte.
//   - Quiz de chk-conceptos-basicos: selección adaptativa pregunta-por-
//     pregunta (POST /api/item-response por cada una de las 5 preguntas
//     CB1-CB5), no un envío único de las 5 juntas.
//   - Reintentos: NO se resetea el estado — bayesEngine ya acumula
//     evidencia por diseño (ver middleware/src/stateStore.js).
//   - Fallo de red: ruta segura por defecto + aviso discreto (ver api.js).
//   - Feedback de Claude: notify.push() (notificación breve, no bloqueante).
// ─────────────────────────────────────────────────────────────────────────

import Adapt from 'core/js/adapt';
import data from 'core/js/data';
import offlineStorage from 'core/js/offlineStorage';
import notify from 'core/js/notify';
import { postDecision, postItemResponse } from './api';

const CB_TOTAL_ITEMS = 5; // CB1-CB5, ver lxd/08-banco-items-bayesiano.json

class DecisionEngine extends Backbone.Controller {

  initialize() {
    this._diagnostico = {};
    this._quizAnswered = new Set();
    this._quizFailedCount = 0;
    this.listenTo(Adapt, 'app:dataReady', this.onDataReady);
  }

  onDataReady() {
    this.listenTo(Adapt, 'questionView:submitted', this.onQuestionSubmitted);
  }

  // ── Identidad del alumno ────────────────────────────────────────────

  getActorId() {
    const info = offlineStorage.get('learnerinfo') || {};
    return info.id || 'alumno-anonimo';
  }

  // ── Enrutador de eventos de pregunta ────────────────────────────────

  onQuestionSubmitted(view) {
    const model = view.model;
    const parentBlockId = model.get('_parentId');

    if (parentBlockId === 'b-diagnostico-previo') {
      this._handleDiagnosticoAnswer(model);
      return;
    }
    if (parentBlockId === 'b-quiz-conceptos') {
      this._handleQuizAnswer(model);
    }
  }

  // ── chk-diagnostico-inicial (D1/D2/D3) ──────────────────────────────

  _selectedOptionLabel(model, labels) {
    const items = model.get('_items');
    const selected = model.getActiveItems()[0];
    const index = items.indexOf(selected);
    return labels[index] ?? null;
  }

  async _handleDiagnosticoAnswer(model) {
    const id = model.get('_id');
    if (id === 'c-diagnostico-d1') {
      this._diagnostico.d1 = this._selectedOptionLabel(model, ['si', 'no']);
    } else if (id === 'c-diagnostico-d2') {
      this._diagnostico.d2 = this._selectedOptionLabel(model, ['si', 'no', 'no_seguro']);
    } else if (id === 'c-diagnostico-d3') {
      this._diagnostico.d3Correcta = model.get('_isCorrect');
    } else {
      return;
    }

    const { d1, d2, d3Correcta } = this._diagnostico;
    if (d1 === undefined || d2 === undefined || d3Correcta === undefined) return; // faltan preguntas por responder

    const result = await postDecision(Adapt, {
      actorId: this.getActorId(),
      checkpointId: 'chk-diagnostico-inicial',
      signals: { diagnostico: { d1, d2, d3Correcta } }
    });
    await this._revealBlock(result.nextBlockId);
  }

  // ── chk-conceptos-basicos (quiz adaptativo CB1-CB5) ─────────────────

  async _handleQuizAnswer(model) {
    const itemId = model.get('title'); // CB1..CB5 — ver generate-course-json, title = q.id
    const isCorrect = model.get('_isCorrect');

    this._quizAnswered.add(itemId);
    if (!isCorrect) this._quizFailedCount += 1;

    const actorId = this.getActorId();
    const result = await postItemResponse(Adapt, {
      actorId, checkpointId: 'chk-conceptos-basicos', itemId, isCorrect
    });

    if (result.feedback) {
      notify.push({ title: 'Retroalimentación', body: result.feedback, _timeout: 8000 });
    }

    // El banco solo tiene 5 ítems fijos — selectNextItem() del motor puede
    // reciclarlos indefinidamente (ver bayesEngine.js, "banco insuficiente").
    // Aquí es donde se decide cuándo el quiz termina, no en el motor.
    if (this._quizAnswered.size < CB_TOTAL_ITEMS && result.nextItemId) {
      await this._revealComponent(`c-quiz-${result.nextItemId.toLowerCase()}`);
      return;
    }

    const scoreScaled = (this._quizAnswered.size - this._quizFailedCount) / this._quizAnswered.size;
    const decision = await postDecision(Adapt, {
      actorId,
      checkpointId: 'chk-conceptos-basicos',
      signals: { quiz: { scoreScaled, intentosFallidos: this._quizFailedCount } }
    });
    await this._revealBlock(decision.nextBlockId);
  }

  // ── Revelar contenido (_isAvailable + re-render) ────────────────────
  // getAvailableChildModels() filtra por _isAvailable:true (ver
  // core/js/models/adaptModel.js) y addChildren() la usa para decidir qué
  // renderizar a continuación (core/js/views/adaptView.js) — el mismo
  // mecanismo que usa adapt-contrib-trickle para revelar contenido
  // bloqueado dinámicamente.

  async _revealBlock(blockId) {
    if (!blockId) return; // "en_progreso": todavía no hay suficiente evidencia, no revelar nada
    this._reveal(blockId);
  }

  async _revealComponent(componentId) {
    this._reveal(componentId);
  }

  async _reveal(id) {
    const model = data.findById(id);
    if (!model) {
      console.warn('[decisionEngine] id devuelto por el middleware no existe en el curso:', id);
      return;
    }
    if (model.get('_isAvailable')) return; // ya visible
    model.set('_isAvailable', true, { pluginName: 'decisionEngine' });
    if (Adapt.parentView) await Adapt.parentView.addChildren();
  }
}

export default new DecisionEngine();
