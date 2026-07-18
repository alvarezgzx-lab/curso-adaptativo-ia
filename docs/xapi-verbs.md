# Diccionario de verbos xAPI custom

Verbos que NO tienen equivalente directo en el vocabulario ADL estándar,
usados por la capa de decisión adaptativa. Preferir siempre verbos ADL
estándar (`experienced`, `attempted`, `answered`, `completed`, `mastered`,
`passed`, `failed`, `commented`) para cualquier interacción de contenido —
ver `lxd/04-diccionario-xapi.md` para esos casos. Un verbo custom nuevo aquí
solo se justifica si ningún verbo ADL cubre el caso.

## checkpoint-reached

Alumno llega a un checkpoint de decisión adaptativa. `object` = checkpointId.
`context.extensions` incluye el historial relevante enviado al motor de
decisión.

## decision-requested

El middleware solicita una decisión de ruta (a `bayesEngine.resolveNextBlockId`,
o antes del motor bayesiano, a Claude). `object` = checkpointId.
`context.extensions` incluye la lista de `nextBlockId` candidatos.

## route-assigned

El middleware asigna la ruta resuelta. `object` = `nextBlockId` asignado.
`result.response` = el `nextBlockId` elegido. Es el registro de auditoría de
cada decisión de branching.

---

No se modifican estos 3 verbos en este PR — ver
`docs/arquitectura-motor-bayesiano-adaptativo.md`, supuesto 5.4: "No se toca
el diccionario xAPI existente".
