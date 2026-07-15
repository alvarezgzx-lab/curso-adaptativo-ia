# Roadmap — diseño LXD de curso-adaptativo-ia

Este roadmap asume un solo operador (Ángel) cubriendo las 6 fases de diseño
de experiencia de aprendizaje del proyecto. No hay fecha límite fija (ver
`docs/proyecto-tecnico.md`), así que este roadmap ordena por **dependencias
lógicas e iteraciones**, no por calendario — tú decides el ritmo.

Metodología de proceso: **SAM (Successive Approximation Model)**, no ADDIE
lineal. Eso significa que las iteraciones de abajo se esperan revisitar — es
normal volver a la Fase 1 después de armar el storyboard si un objetivo
resulta mal calibrado. El orden es un punto de partida, no una camisa de
fuerza.

## Por qué este orden y no otro

El **Glosario de IDs** va primero porque es la única pieza que el código ya
construido necesita literalmente igual (mismo string) en `course.json`,
`checkpointId` y `nextBlockId` — si cambia después, hay que propagar el
cambio a mano en varios archivos. Definirlo tarde es el error más caro de
deshacer.

La **Fase 2 (especificación de decisión)** va antes que el storyboard
completo aunque parezca contraintuitivo, porque el storyboard depende de
saber cuántas rutas existen por checkpoint — diseñar contenido antes de saber
cuántas variantes necesitas duplica trabajo.

## Iteración 0 — Fundación (antes de diseñar nada de contenido)

- [ ] `lxd/00-glosario-ids.json` — al menos un borrador: `courseId`, lista
  provisional de `checkpointId` (2-3, ya acordado con desarrollo), IDs de
  `contentObject`/bloque aunque cambien después. Esto desbloquea todo lo
  demás.

## Iteración 1 — Análisis y la decisión adaptativa (el núcleo del proyecto)

- [ ] Fase 1 → `lxd/01-analisis-objetivos.md`: público, prerrequisitos,
  duración, objetivos con Bloom, mapa de evidencia.
- [ ] Fase 2 → `lxd/02-especificacion-decision-checkpoints.json`: por cada
  checkpoint, señales evaluadas, rutas posibles, criterio de selección, caso
  "sin historial previo". **Este es el entregable más crítico del proyecto**
  — es lo que cierra la brecha #1 (ver `docs/riesgos.md`) y lo que desarrollo
  usa para poner guardrails reales en `middleware/src/claude.js`.

Gate de esta iteración: todo objetivo de la Fase 1 debe poder trazarse a al
menos un checkpoint de la Fase 2. Si un objetivo no se puede evaluar en
ningún checkpoint, o el objetivo está mal planteado o falta un checkpoint.

## Iteración 2 — Contenido y tracking

- [ ] Fase 3 → `lxd/03-storyboard.md`: bloque por bloque, usando Merrill's
  First Principles como estructura interna de cada `contentObject`
  (problema real → activación → demostración → aplicación → integración).
- [ ] Fase 4 → `lxd/04-diccionario-xapi.md`: completa/ajusta
  `docs/xapi-verbs.md` con cada interacción real que el storyboard terminó
  definiendo. Preferir verbos ADL estándar sobre los 3 custom ya definidos.

Gate de esta iteración: todo `nextBlockId` mencionado en la Fase 2 existe
como fila en el storyboard (Definition of Done del proyecto completo).

## Iteración 3 — Producción y validación

- [ ] Fase 5 → `lxd/05-banco-evaluacion.md` + `lxd/06-assets.md`: ítems de
  evaluación con rúbrica, lista de medios con specs técnicas.
- [ ] Fase 6 → `lxd/07-checklist-udl.md`: aplicado a cada variante de ruta
  adaptativa, no solo a la ruta default — cada rama es una obligación de
  accesibilidad aparte, no un extra opcional.

## Handoff a desarrollo (después de la Iteración 3)

Cuando las tres gates de arriba estén cerradas, el paquete completo de
`lxd/` es lo que desarrollo (tú mismo, usando Claude Code) traduce a:

1. `course.json` real de Adapt (Fase 3 → estructura Adapt).
2. Configuración de `adapt-contrib-spoor` (Fase 4 → tracking).
3. System prompt de `middleware/src/claude.js` con guardrails que limiten
   `nextBlockId` a las rutas válidas de la Fase 2 (hoy no existen — ver
   `docs/riesgos.md`, sección "brecha #1").

## Qué NO cubre este roadmap

La investigación de la teoría de aprendizaje que sustenta tus decisiones
pedagógicas (qué modelo de Bloom aplicar a este dominio específico, qué
literatura de instructional design respalda el diseño de cada bloque) es
trabajo tuyo, no de este documento — este roadmap solo ordena el *proceso* y
prepara la *estructura técnica* donde ese trabajo va a vivir.
