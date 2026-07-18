# Fase 4 — Diccionario de tracking xAPI

> Extiende `docs/xapi-verbs.md` (que ya define los 3 verbos custom de la
> capa de decisión: `checkpoint-reached`, `decision-requested`,
> `route-assigned`). Esta tabla cubre las interacciones de *contenido*, no
> las de decisión. Preferir siempre vocabulario ADL estándar (`experienced`,
> `attempted`, `answered`, `completed`, `mastered`, `passed`, `failed`) sobre
> inventar un verbo custom — un verbo custom nuevo solo se justifica si
> ningún verbo ADL cubre el caso.

| Interacción (bloque/componente) | Verbo (ADL estándar preferido) | Objeto/actividad | Resultado (`result.success`/`score`/`completion`) | Extensiones necesarias |
|---|---|---|---|---|
| Ver bloque de contenido (`narrative`/`text`/`graphic`/`video`) | `experienced` | `activityId` = blockId | `completion: true` | — |
| Completar actividad interactiva no evaluable (matching, checklist de práctica) | `completed` | `activityId` = blockId | `completion: true` | — |
| Responder autodiagnóstico (`b-diagnostico-previo`) | `answered` | `activityId` = `b-diagnostico-previo` | `response`; sin `success` (no evaluado) | `usadoParaBranching: true` |
| Intentar quiz formativo (`b-quiz-conceptos`) | `attempted` | `activityId` = `b-quiz-conceptos` | `score.scaled`, número de intento | `checkpointAsociado: "chk-conceptos-basicos"` |
| Aprobar/reprobar quiz formativo | `passed` / `failed` | `activityId` = `b-quiz-conceptos` | `score.scaled` ≥/< 0.70 | — |
| Completar checklist de integración (`b-integracion-final`) | `completed` → `mastered` | `activityId` = `b-integracion-final` | `completion: true`; `success: true` si 100% marcado | — |
| Aprobar/reprobar evaluación sumativa | `passed` / `failed` | `activityId` = `b-evaluacion-modulo1` | `score.raw`, `score.max`, `score.scaled` | Criterio de aprobación del curso (rúbrica general) |
| Alumno llega a un checkpoint | `checkpoint-reached` *(custom)* | `activityId` = checkpointId | `context.extensions`: historial relevante enviado al middleware | Verbo custom — sin equivalente ADL para "llegada a punto de decisión" |
| Middleware solicita decisión a Claude | `decision-requested` *(custom)* | `activityId` = checkpointId | `context.extensions`: lista de `nextBlockId` candidatos | Verbo custom — evento interno de infraestructura, no de aprendizaje pedagógico estándar |
| Middleware asigna ruta | `route-assigned` *(custom)* | `activityId` = `nextBlockId` asignado | `result.response` = `nextBlockId` elegido | Verbo custom — auditoría de la decisión de branching |
| Retroalimentación recibida (automática o de un facilitador humano) sobre un bloque abierto, ej. `b-reflexion-guiada-privacidad` | `commented` *(ADL estándar)* | `activityId` = blockId revisado | `result.response` = texto de la retro | `context.extensions.autor`: "sistema" \| "facilitador"; ver nota de arquitectura multi-módulo en `guion-instruccional-modulo-1-EC1705.md`, sección 11 |
| Responder pregunta de interés opcional al final de `b-sintesis-avanzada` | `answered` | `activityId` = `b-sintesis-avanzada` | `response` (Sí/No) | `result.extensions.interesAvanzado`: "Sí" \| "No" — mismo patrón que `chk-avance-texto`/`chk-avance-imagen` en Módulo 2 |
| Ver bloque de ruta avanzada opcional (`b-fundamentos-avanzados`, `b-etica-legal-avanzado`) | `experienced` → `answered` | `activityId` = blockId | `completion: true`; `answered` con `response` a AV1/AV2 (no calificados) | `context.extensions.rutaOpcional: true` — para que la evaluación final pueda distinguir evidencia de piso obligatorio de evidencia de enriquecimiento |

**Convención obligatoria** (para que la evaluación final de curso funcione
sin reescribirse cuando se agreguen módulos): todo statement de este módulo
(y de cualquier módulo futuro) debe incluir
`context.contextActivities.grouping = courseId` (`curso-adaptativo-ia`)
además de `context.contextActivities.parent = moduleId` (`m1-fundamentos-iagen`
para este módulo). El `grouping` a nivel de curso es lo que permite que
`chk-evaluacion-final-curso` agregue todo el histórico sin importar cuándo
se lanzó cada módulo.

## Checklist antes de pasar a Fase 5

- [x] Todo verbo usado es ADL estándar, o está justificado como custom (¿por qué ningún verbo ADL cubre el caso?).
- [x] Toda interacción trackeable del storyboard (Fase 3) tiene fila aquí.
