# Arquitectura: motor bayesiano adaptativo para el curso adaptativo IA

> Complementa `guion-instruccional-adaptativo` (marco LXD 7 fases) y
> `evaluador-di-rubrica` (rúbrica DI 20 criterios). No los reemplaza: les
> añade un motor de decisión cuantificado donde hoy hay un juicio
> cualitativo de LLM.

## 0. Decisiones ya tomadas (entrevista de elicitación)

| Decisión | Elegido | Implicación técnica |
|---|---|---|
| Estructura de sesión | Itinerario con práctica interna por etapa | Dentro de cada etapa se comporta como `Práctica` (olvido activo λ<1, selección en dos fases, sin cierre duro); la etapa se supera con el criterio de **promoción** de "Itinerarios por etapas" (protocolo §13.3), no con el criterio de cierre de `Diagnóstico`. |
| Espacio de hipótesis | Perfil A+C combinado | `nivel` ordinal (IRT 3PL, prior uniforme) + `factoresDeError` binarios en paralelo (prior informativo 0.2–0.3, nunca uniforme), organizados en bloques pedagógicos. |
| Ambición | Ambicioso | IRT completo con discriminación efectiva calibrable, Claude genera contenido dinámico (no rutas), validación Monte Carlo del banco antes de desplegar. |

## 1. Qué cambia y qué no

**No cambia:** el marco de 7 fases de `guion-instruccional-adaptativo` sigue siendo el proceso de diseño (Backward Design → checkpoints → storyboard → xAPI → evaluación → assets → UDL). El `course.json` de Adapt, el glosario de IDs y la estructura de bloques se mantienen.

**Cambia el corazón de la Fase 2.** Hoy, `middleware/src/claude.js` recibe el historial xAPI de un checkpoint y le pide a Claude, en lenguaje natural, que elija un `nextBlockId`. Eso se reemplaza por `bayesEngine.js`: un módulo determinista que mantiene una distribución de probabilidad sobre hipótesis, la actualiza con cada respuesta vía Bayes+IRT, y decide la ruta cuando la entropía cae por debajo de un umbral. Claude deja de decidir **rutas** y pasa a decidir **redacción**.

## 2. División de responsabilidades

| Capa | Antes | Ahora |
|---|---|---|
| Enrutamiento (`nextBlockId`) | Claude, juicio en lenguaje natural sobre `criterioDeSeleccion` | `bayesEngine.resolveNextBlockId()`, determinista, auditable, sin llamada a API |
| Selección del siguiente ítem/actividad dentro de una etapa | No existía como tal (Adapt seguía la secuencia lineal del bloque) | `bayesEngine.selectNextItem()`, por máxima ganancia de información + bloques pedagógicos + desempate aleatorio ponderado |
| Redacción de feedback tras un ítem | No cubierto explícitamente | Claude API, usando `getDecisionPayload()` como contexto — nunca decide la ruta, solo el lenguaje |
| Generación de variantes de contenido (nivel "Ambicioso") | No cubierto | Claude API genera variantes parametrizadas del mismo ítem/explicación cuando el banco tiene poca redundancia local en una zona diagnóstica |
| Caso sin historial previo | Ya se resolvía sin llamar a Claude | Igual — `resolveNextBlockId` lo resuelve en la primera línea, cero llamadas |

## 3. Integración con `evaluador-di-rubrica`

**a) En diseño.** El criterio **P1 (alineación Bloom)** ancla `nivel.ids` a niveles Bloom reales, no solo a una posición en una escala logit. El criterio **P2 (profundidad SOLO)** informa qué tipo de ítem cuenta como **ítem de salida** válido para la promoción de etapa.

**b) Antes de desplegar (gate de calidad).** Antes de activar `bayesEngine` sobre un checkpoint nuevo, correr `evaluador-di-rubrica` sobre el storyboard de esa etapa — en particular C1-C3 y A1-A4.

## 4. Validación Monte Carlo (nivel Ambicioso)

`monteCarloValidate.js` simula alumnos sintéticos por hipótesis (sembrado y reproducible) y reporta exactitud equilibrada (alerta si <0.70), tasa de indeterminados, y longitud media de sesión. Correrlo antes de activar un checkpoint en producción, cada vez que se recalibre el banco.

## 5. Supuestos documentados

1. El motor vive en `middleware/` (Node), no en el cliente. Requiere persistencia del estado bayesiano (`nivel.posterior`, `errores.*.posterior`) entre llamadas por alumno/checkpoint — ver `middleware/src/stateStore.js`.
2. `lambda=0.9` y `alphaUtility=0.5` son valores de arranque razonables, no calibrados a contenido real — se ajustan con Monte Carlo una vez haya un banco real.
3. El "factor de error" se modela como binario presente/ausente por simplicidad.
4. No se toca el diccionario xAPI existente (`checkpoint-reached`, `decision-requested`, `route-assigned`).

## 6. Lo que falta para instanciar esto en el curso real

Por cada etapa del itinerario: niveles Bloom concretos que separan `H_basico/H_medio/H_avanzado`, factores de error específicos del tema, y un primer banco de ítems por checkpoint. **Esto es trabajo de Ángel, no de esta integración técnica.**
