# lxd/ — especificación de diseño de experiencia de aprendizaje

Esta carpeta es el paquete de especificación pedagógica que el stack técnico
ya construido (Adapt + Moodle + xAPI + middleware con Claude) necesita para
tener contenido que mostrar y un criterio sobre el cual decidir. Sin esto, el
código funciona pero no tiene curso real dentro.

División del trabajo en este proyecto: la investigación de teoría de
aprendizaje y las decisiones didácticas/pedagógicas de cada archivo de esta
carpeta son responsabilidad de Ángel. Lo que ya viene resuelto en los
templates es la parte técnica — formato, IDs, y cómo cada documento se
conecta con el código existente (`middleware/`, `course/`,
`docs/xapi-verbs.md`) — para que el trabajo de investigación/diseño no se
pierda por un desajuste de formato con lo que desarrollo espera.

## Orden de trabajo

Ver `../ROADMAP.md` para la secuencia completa con dependencias. Resumen:

1. `00-glosario-ids.json` — primero, siempre.
2. `01-analisis-objetivos.md` + `02-especificacion-decision-checkpoints.json`
3. `03-storyboard.md` + `04-diccionario-xapi.md`
4. `05-banco-evaluacion.md` + `06-assets.md` + `07-checklist-udl.md`
5. `08-banco-items-bayesiano.json` — solo si el checkpoint usa el motor
   bayesiano (ver `docs/arquitectura-motor-bayesiano-adaptativo.md`).
   Necesario antes de correr `npm run monte-carlo` en `middleware/`.

## Definition of Done (todo el paquete)

- [ ] Todo `nextBlockId` mencionado en `02-especificacion-decision-checkpoints.json` existe como fila en `03-storyboard.md`.
- [ ] Todo verbo xAPI usado en `04-diccionario-xapi.md` es ADL estándar o está justificado como custom.
- [ ] Ningún checkpoint en `02-especificacion-decision-checkpoints.json` quedó sin `casoSinHistorialPrevio`.
- [ ] Si el checkpoint usa motor bayesiano: `npm run monte-carlo -- <checkpointId>` corrido sin alerta (exactitud equilibrada ≥ 0.70) antes de activarlo en producción.

Cuando las tres casillas estén marcadas, el paquete está listo para que
desarrollo lo traduzca a `course.json`, config de `adapt-contrib-spoor`, y
guardrails reales en `middleware/src/claude.js` (ver `docs/riesgos.md`,
sección "brecha #1").
