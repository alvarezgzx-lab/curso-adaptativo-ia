# Fase 1 — Análisis y objetivos

> Backward Design (Wiggins & McTighe): define primero resultados y evidencia,
> recién después actividades. No pases a `03-storyboard.md` sin cerrar este
> documento — es el error más común (diseñar pantallas antes de saber qué se
> evalúa).

## Público objetivo

Profesionales sin requisito de título profesional (instructores/capacitadores,
diseñadores y desarrolladores de contenido) que buscan certificarse en
EC1705, Nivel 3 del Sistema Nacional de Competencias. Acceso a
computadora/tablet/dispositivo móvil con Internet.

## Prerrequisitos

Ninguno formal; manejo elemental de computadora e Internet.

## Duración total estimada

12 horas (Módulo 1), distribuidas en bloques de 10-40 min, más ~1-1.5 h
adicionales para quien toma la rama avanzada opcional. La ruta interactiva
mínima suma ~4.5-5.5 h según la ruta adaptativa tomada; el resto corresponde
a lectura autónoma y práctica adicional no cronometrada.

## Objetivos de aprendizaje (Bloom revisado)

Formato: **verbo medible + condición + criterio**. Evitar verbos no
observables ("entender", "conocer") — usar los de la taxonomía revisada
(recordar, comprender, aplicar, analizar, evaluar, crear).

| # | Objetivo (verbo + condición + criterio) | Nivel Bloom | Obligatorio para certificación | Checkpoint(s) donde se evalúa |
|---|---|---|---|---|
| O1 | Explicar el concepto de Inteligencia Artificial Generativa y su propósito principal, usando correctamente los términos *prompt* y *generación*, con ≥70% de aciertos en el quiz formativo y ≥70% en la evaluación sumativa. | Comprender | Sí | `chk-conceptos-basicos`; evaluación sumativa |
| O2 | Distinguir los tres tipos de contenido digital creables con IA generativa (texto, imagen, video), clasificando correctamente ejemplos dados. | Comprender | Sí | `chk-conceptos-basicos`; evaluación sumativa |
| O3 | Localizar en la interfaz de una herramienta de IA generativa (ChatGPT/Gemini/Claude/Copilot u otra) el campo de prompt, el botón de generación, las condiciones de uso, la diferencia entre plan gratuito y de pago, y las secciones específicas para texto/imagen/video. | Aplicar | Sí | Evidencia práctica en `b-integracion-final`; parcialmente en evaluación sumativa (conocimiento) |
| O4 | Aplicar precauciones básicas de seguridad y privacidad al explorar herramientas de IA generativa en línea (revisar política de privacidad; evitar ingresar información sensible cuando la política no es clara). | Aplicar | Sí | `chk-conceptos-basicos`; `b-reflexion-guiada-privacidad`; evaluación sumativa |
| O5 | Reconocer las capacidades generales y limitaciones comunes de la IA generativa a nivel básico (qué puede y qué no puede garantizar). | Comprender | Sí | `chk-conceptos-basicos`; evaluación sumativa |
| O6 | Explicar, a nivel conceptual, la diferencia entre arquitecturas autoregresivas (texto) y de difusión (imagen), el límite de la ventana de contexto, y la diferencia entre herramientas comerciales y alternativas de código abierto/self-hosted; reconocer la función de la Clasificación de Niza y de los principios éticos de UNESCO antes de publicar contenido generado por IA. | Comprender | **No** — enriquecimiento de ruta avanzada, ver nota de diseño al inicio del documento | Solo si el alumno toma `b-fundamentos-avanzados`/`b-etica-legal-avanzado` (`chk-avance-fundamentos`) |

## Mapa de evidencia

Para cada objetivo: ¿qué comportamiento/respuesta observable demuestra que
se logró? Esto alimenta directamente el diseño de los checkpoints en
`02-especificacion-decision-checkpoints.json` — no se puede llenar ese
archivo sin esta tabla resuelta primero.

| Objetivo | Evidencia observable | Cómo se captura (interacción Adapt → statement xAPI) |
|---|---|---|
| O1 | Alumno explica correctamente qué es IAGen y usa "prompt"/"generación" de forma correcta en actividades y quiz. | `b-terminologia-basica` (matching) → `attempted`/`completed`; `b-quiz-conceptos` → `answered`/`passed`/`failed` |
| O2 | Alumno clasifica correctamente ejemplos de texto/imagen/video. | `b-tipos-contenido` → `answered`; `b-quiz-conceptos` → `answered` |
| O3 | Alumno marca/localiza correctamente los elementos de interfaz en una herramienta real o en captura anotada. | `b-practica-exploracion-principiante` / `b-practica-exploracion-avanzada` → `attempted`/`completed`; `b-integracion-final` (checklist) → `completed`/`mastered` |
| O4 | Alumno identifica correctamente qué NO compartir y por qué, y redacta una reflexión coherente. | `b-precauciones-seguridad` → `attempted` (clasificación); `b-reflexion-guiada-privacidad` → `completed`; `b-quiz-conceptos` ítem CB4 → `answered` |
| O5 | Alumno identifica correctamente un ejemplo de limitación de la IA generativa. | `b-capacidades-limitaciones` → `experienced`; `b-quiz-conceptos` ítem CB5 → `answered`; evaluación sumativa ítem Q5 → `answered` |
| O6 | Alumno explica correctamente la diferencia autoregresivo/difusión o identifica correctamente la función de la Clasificación de Niza (solo si tomó la ruta avanzada). | `b-fundamentos-avanzados` / `b-etica-legal-avanzado` → `experienced` → `answered` (ítems AV1/AV2) |

## Gate antes de pasar a Fase 2

- [x] Todo objetivo tiene al menos una fila de evidencia.
- [x] Toda evidencia tiene claro en qué checkpoint (de `00-glosario-ids.json`) se observa.
- [x] O6 está marcado explícitamente como no obligatorio para certificación, consistente con la corrección de espectro básico↔avanzado (ver blockquote de corrección en `guion-instruccional-modulo-1-EC1705.md`).

## Módulo 2 — Producción práctica: Texto e Imagen (E5337, desempeños 1-3)

### Público objetivo

El mismo de Módulo 1 — profesionales sin requisito de título profesional,
que ya completaron el Módulo 1 (fundamentos, terminología, exploración de
interfaz, precauciones básicas).

### Prerrequisito

Haber completado Módulo 1 (en particular, `b-terminologia-basica` y
`b-integracion-final` — el alumno ya sabe ubicar el campo de prompt y el
botón de generación).

### Duración total estimada

18 horas (según `OUTLINE.txt`), de las cuales la ruta básica (piso de
certificación) representa ~9-10 h de interacción directa; las 2 ramas
avanzadas opcionales agregan ~4-5 h adicionales para quien las toma.

### Objetivos de aprendizaje (Bloom revisado)

| # | Objetivo (verbo + condición + criterio) | Nivel Bloom | Obligatorio para certificación | Checkpoint(s) donde se evalúa |
|---|---|---|---|---|
| O1 | Seleccionar la herramienta de IA generativa adecuada según el tipo de contenido a crear (texto o imagen) y acceder a ella desde un dispositivo compatible (computadora/tablet/móvil). | Aplicar | Sí | Evidencia continua en `b-preparar-generacion-texto` y `b-preparar-generacion-imagen`; verificado en integración final |
| O2 | Generar un texto básico (post, artículo o guion breve) mediante un prompt efectivo, ajustando tono/longitud/estilo cuando la herramienta lo permita y es pertinente, y guardarlo en formato digital. | Aplicar | Sí | `chk-avance-texto`; evaluación sumativa |
| O3 | Generar una imagen mediante un prompt descriptivo, ajustando tamaño/estilo/nivel de detalle cuando la herramienta lo permita y es pertinente, y guardarla en formato PNG/JPG. | Aplicar | Sí | `chk-avance-imagen`; evaluación sumativa |
| O4 | Verificar que el texto y la imagen generados correspondan con lo solicitado, no presenten errores evidentes (ortográficos/de redacción en texto; visuales en imagen), y registrar el prompt usado para que el proceso sea repetible. | Analizar | Sí | `b-verificacion-outputs`; integración final; evaluación sumativa |
| O5 | Explicar el efecto de parámetros de generación más finos (temperature, top-p, pasos/steps, guidance scale, seed) y distinguir, a nivel conceptual, entre herramientas comerciales y alternativas de código abierto/self-hosted. | Comprender | **No** — enriquecimiento de ruta avanzada | Solo si el alumno toma `b-texto-avanzado` y/o `b-imagen-avanzada` |

### Mapa de evidencia

| Objetivo | Evidencia observable | Cómo se captura (interacción Adapt → statement xAPI) |
|---|---|---|
| O1 | Alumno accede correctamente a la herramienta elegida y ubica los controles necesarios. | `b-preparar-generacion-texto` / `b-preparar-generacion-imagen` → `experienced`/`completed` |
| O2 | Alumno entrega un texto que corresponde al prompt, con ajustes reflejados, sin errores evidentes, guardado. | `b-practica-texto-basico` → `attempted`/`completed`; rúbrica en `lxd/05-banco-evaluacion.md` |
| O3 | Alumno entrega una imagen que corresponde a la descripción, con ajustes reflejados, sin errores visuales evidentes, en PNG/JPG. | `b-practica-imagen-basico` → `attempted`/`completed`; rúbrica en `lxd/05-banco-evaluacion.md` |
| O4 | Alumno identifica correctamente discrepancias entre lo pedido y lo obtenido, y documenta el prompt exacto usado. | `b-verificacion-outputs` → `attempted`; `b-integracion-final-m2` → `completed` |
| O5 | Alumno explica correctamente el efecto de un parámetro avanzado o distingue una herramienta self-hosted de una comercial. | `b-texto-avanzado`/`b-imagen-avanzada` → `answered` (solo si toma la ruta) |

**Gate:** ☑ Todo objetivo tiene al menos una fila de evidencia. ☑ O5 está marcado explícitamente como no obligatorio, consistente con el principio de diseño de espectro básico↔avanzado (mismo patrón que O6 de Módulo 1).
