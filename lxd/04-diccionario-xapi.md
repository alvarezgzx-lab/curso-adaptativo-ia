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
| | | | | |

## Checklist antes de pasar a Fase 5

- [ ] Todo verbo usado es ADL estándar, o está justificado como custom (¿por qué ningún verbo ADL cubre el caso?).
- [ ] Toda interacción trackeable del storyboard (Fase 3) tiene fila aquí.
