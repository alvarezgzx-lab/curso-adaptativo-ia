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

12 horas (Módulo 1), distribuidas en bloques de 10-40 min. La ruta
interactiva mínima suma ~4.5-5.5 h según la ruta adaptativa tomada; el resto
corresponde a lectura autónoma y práctica adicional no cronometrada.

## Objetivos de aprendizaje (Bloom revisado)

Formato: **verbo medible + condición + criterio**. Evitar verbos no
observables ("entender", "conocer") — usar los de la taxonomía revisada
(recordar, comprender, aplicar, analizar, evaluar, crear).

| # | Objetivo (verbo + condición + criterio) | Nivel Bloom | Checkpoint(s) donde se evalúa |
|---|---|---|---|
| O1 | Explicar el concepto de Inteligencia Artificial Generativa y su propósito principal, usando correctamente los términos *prompt* y *generación*, con ≥70% de aciertos en el quiz formativo y ≥70% en la evaluación sumativa. | Comprender | `chk-conceptos-basicos`; evaluación sumativa |
| O2 | Distinguir los tres tipos de contenido digital creables con IA generativa (texto, imagen, video), clasificando correctamente ejemplos dados. | Comprender | `chk-conceptos-basicos`; evaluación sumativa |
| O3 | Localizar en la interfaz de una herramienta de IA generativa (ChatGPT/Gemini/Claude/Copilot u otra) el campo de prompt, el botón de generación, las condiciones de uso, la diferencia entre plan gratuito y de pago, y las secciones específicas para texto/imagen/video. | Aplicar | Evidencia práctica en `b-integracion-final`; parcialmente en evaluación sumativa (conocimiento) |
| O4 | Aplicar precauciones básicas de seguridad y privacidad al explorar herramientas de IA generativa en línea (revisar política de privacidad; evitar ingresar información sensible cuando la política no es clara). | Aplicar | `chk-conceptos-basicos`; `b-reflexion-guiada-privacidad`; evaluación sumativa |
| O5 | Reconocer las capacidades generales y limitaciones comunes de la IA generativa a nivel básico (qué puede y qué no puede garantizar). | Comprender | `chk-conceptos-basicos`; evaluación sumativa |

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

## Gate antes de pasar a Fase 2

- [x] Todo objetivo tiene al menos una fila de evidencia.
- [x] Toda evidencia tiene claro en qué checkpoint (de `00-glosario-ids.json`) se observa.
