# Fase 3 — Storyboard / mapa de contenido

> Estructura interna de cada bloque según Merrill's First Principles:
> problema real → activación de conocimiento previo → demostración →
> aplicación → integración. No todos los bloques necesitan las 5 etapas
> completas, pero cada uno debería poder ubicarse en una de ellas.

> Definition of Done del proyecto completo: todo `nextBlockId` mencionado en
> `02-especificacion-decision-checkpoints.json` debe existir como fila aquí.

## Módulo 1 — Fundamentos, ética y marco regulatorio (17 bloques)

| contentObject id (= blockId en glosario) | Tipo de componente Adapt | Contenido / guion | Objetivo(s) Bloom que sirve | Etapa Merrill | ¿Parte de una ruta adaptativa específica? |
|---|---|---|---|---|---|
| `b-bienvenida-m1` | narrative | "¡Bienvenido/a al Módulo 1! Imagina que te piden crear en una hora un anuncio con texto, una imagen y un boceto de video para redes sociales, sin diseñador ni copywriter disponibles. Hoy la IA generativa lo hace posible. Aquí aprenderás qué es, qué herramientas existen (ChatGPT, Gemini, Claude, Copilot) y cómo navegar su interfaz con seguridad, antes de generar contenido en el Módulo 2." | O1 | Problema real | default |
| `b-que-es-iagen` | text | "La IA Generativa (IAGen) es un tipo de IA capaz de crear contenido nuevo y original —textos, imágenes o videos— que no existía antes, a partir de lo que tú le indiques. A diferencia de un buscador, no encuentra información existente: la genera. Sirve para producir contenido digital rápido a partir de una descripción en lenguaje natural." | O1 | Activación | default |
| `b-terminologia-basica` | component | "Dos palabras que usarás todo el curso — **Prompt**: la instrucción, pregunta o frase que le das a la herramienta para indicarle qué contenido quieres y con qué características. **Generación**: el proceso con el que la herramienta produce contenido nuevo a partir de tu prompt. Actividad: relaciona cada término con su definición." | O1 | Demostración | default |
| `b-tipos-contenido` | graphic | "Con las herramientas de este curso puedes crear tres tipos de contenido: **Texto** (posts, artículos, guiones), **Imagen** (ilustraciones, banners, fotografías sintéticas) y **Video** (clips cortos, ideas y guiones). Observa los tres ejemplos e identifica cuál corresponde a cada tipo." | O2 | Demostración | default |
| `b-diagnostico-previo` | component | "Responde con honestidad, no hay respuesta incorrecta — D1: ¿Has usado antes una herramienta de IA generativa (ChatGPT, Gemini, Claude, Copilot u otra)? D2: ¿Sabrías identificar el campo donde se escribe un prompt en una de estas herramientas? D3: Un prompt es: (a) un tipo de archivo (b) una instrucción que le das a la IA (c) un error de la herramienta." | (diagnóstico, alimenta O1/O3) | Activación (diagnóstica) | default → `chk-diagnostico-inicial` |
| `b-exploracion-guiada-principiante` | video / narrative | "Vamos paso a paso: 1) Inicia sesión o crea una cuenta gratuita. 2) Busca 'Términos de uso' o 'Política de privacidad' y ábrelo. 3) Localiza el recuadro para escribir tu prompt. 4) Encuentra el botón para enviar/generar. 5) Ubica los menús o pestañas para texto, imagen y video, si existen. Marca cada paso en tu checklist." | O3 | Demostración (guiada) | `chk-diagnostico-inicial` → `b-exploracion-guiada-principiante` |
| `b-practica-exploracion-principiante` | component (mcq) | "Mira esta captura de [Herramienta]. Señala: (1) dónde escribirías tu prompt, (2) el botón para generar, (3) dónde verificarías si tu cuenta es gratuita o de pago. Si te equivocas, verás la respuesta correcta con una breve explicación." | O3 | Aplicación | `b-exploracion-guiada-principiante` |
| `b-exploracion-directa-experiencia` | text / graphic | "Ya conoces lo básico. Reto: abre dos herramientas de IA generativa distintas y completa la tabla comparando condiciones de uso, diferencias entre plan gratuito y de pago, y qué secciones tiene cada una para texto, imagen y video." | O3 | Aplicación | `chk-diagnostico-inicial` → `b-exploracion-directa-experiencia` |
| `b-practica-exploracion-avanzada` | component | "Sube o pega tu tabla comparativa. Verifica que incluya: campo de prompt, botón de generación, condiciones de uso, diferencia gratis/pago y secciones de texto/imagen/video, para ambas herramientas." | O3 | Aplicación | `b-exploracion-directa-experiencia` |
| `b-precauciones-seguridad` | narrative | "Antes de seguir: revisa siempre la política de privacidad de una herramienta de IA antes de usarla con datos reales. Evita ingresar información personal o confidencial si la política no es clara o no ofrece garantías suficientes. Regla práctica: si no compartirías ese dato con un desconocido, no se lo compartas a una IA sin verificar antes." | O4 | Demostración | default |
| `b-capacidades-limitaciones` | text | "La IA generativa es potente, pero no perfecta. **Puede**: redactar textos, generar ideas de imagen y bocetos de video en segundos. **No puede** (de forma confiable): garantizar que todo dato entregado sea 100% correcto, ni sustituir siempre el criterio humano. Ejemplo: puede inventar una fecha o cifra que suena creíble pero es falsa. En el Módulo 3 aprenderás a verificarlo." | O5 | Demostración | default |
| `b-quiz-conceptos` | component (mcq) | "Quiz rápido (5 preguntas, repetible): concepto de IA generativa, prompt/generación, tipos de contenido, precauciones de privacidad y capacidades/limitaciones. Necesitas 70% o más para avanzar directo a la síntesis; si no, verás un repaso breve antes de reintentar." | O1, O2, O4, O5 | Aplicación (formativa) | default → `chk-conceptos-basicos` |
| `b-refuerzo-conceptos-basicos` | text / graphic | "Repasemos los puntos con más dudas: un prompt es la instrucción que TÚ le das a la IA (no un tipo de archivo); la IA generativa CREA contenido nuevo (no busca información existente); siempre revisa la política de privacidad antes de ingresar datos sensibles. Aquí tienes 2 ejemplos resueltos antes de tu siguiente intento." | O1, O2, O4, O5 | Activación (refuerzo) | `chk-conceptos-basicos` → `b-refuerzo-conceptos-basicos` |
| `b-sintesis-avanzada` | text / component | "Reto de síntesis: tu equipo necesita un post para redes sociales, una imagen de producto y una idea de video en 20 minutos, con una herramienta gratuita. Explica en 3-4 líneas qué herramienta usarías, qué prompt escribirías para cada tipo de contenido, y qué precaución de privacidad aplicarías antes de empezar." | O1-O5 (integrador) | Integración | `chk-conceptos-basicos` → `b-sintesis-avanzada` |
| `b-reflexion-guiada-privacidad` | component | "Responde en máximo 150 palabras: piensa en tu trabajo o un caso que conozcas. ¿Qué tipo de información NO deberías ingresar a una herramienta de IA generativa sin verificar antes su política de privacidad? Da un ejemplo concreto." | O4 | Integración | default (post-checkpoint 2) |
| `b-integracion-final` | narrative / component | "Actividad final: abre una herramienta de IA generativa y completa el checklist marcando que identificaste: cuenta/acceso, condiciones de uso, diferencia gratis/pago, campo de prompt, botón de generación y secciones de texto/imagen/video. Esta es la misma evidencia que se te pedirá en tu evaluación de certificación EC1705." | O1-O5 (evidencia central de E5336) | Integración | default |
| `b-evaluacion-modulo1` | component (mcq) | "Evaluación del Módulo 1 (30 min, opción múltiple, 8 ítems): concepto de IA generativa, terminología, tipos de contenido, aspectos de acceso/uso, precauciones de privacidad y capacidades/limitaciones — alineada a los conocimientos del Elemento E5336." | O1, O2, O3 (conocimiento), O4, O5 | Integración (sumativa) | default |

## Bloques reservados de apertura/cierre de curso (contenido pendiente)

Estas 3 filas existen para cumplir la Definition of Done (todo `nextBlockId`
de `02-especificacion-decision-checkpoints.json` debe tener fila aquí), pero
su contenido real todavía no está diseñado — depende de que se defina el
alcance completo de la línea base de curso (`b-diagnostico-curso-inicial`) y
de que existan Módulos 2 y 3 (los dos bloques de evaluación final).

| contentObject id (= blockId en glosario) | Tipo de componente Adapt | Contenido / guion | Objetivo(s) Bloom que sirve | Etapa Merrill | ¿Parte de una ruta adaptativa específica? |
|---|---|---|---|---|---|
| `b-diagnostico-curso-inicial` | component | *(PENDIENTE DE DISEÑO — bloque reservado para la línea base de todo el curso; ver `chk-diagnostico-curso-inicial` en `lxd/02`. Ángel diseñará el contenido real de este ítem cuando defina el alcance completo de la línea base.)* | — | — | `chk-diagnostico-curso-inicial` (checkpoint de apertura) |
| `b-evaluacion-final-estandar` | component | *(PENDIENTE DE DISEÑO — examen de certificación EC1705 estándar. Depende de que Módulos 2 y 3 existan primero.)* | — | — | `chk-evaluacion-final-curso` → ruta estándar |
| `b-evaluacion-final-repaso-dirigido` | block | *(PENDIENTE DE DISEÑO — repaso dirigido antes del examen final, basado en señales acumuladas de todos los módulos. Depende de que Módulos 2 y 3 existan primero.)* | — | — | `chk-evaluacion-final-curso` → ruta de repaso |

## Checklist antes de pasar a Fase 4

- [x] Todo `nextBlockId` de `02-especificacion-decision-checkpoints.json` tiene fila aquí.
- [ ] Todo bloque tiene al menos un objetivo de la Fase 1 asociado.

Excepción documentada: los 3 bloques reservados de apertura/cierre de curso
no tienen objetivo asignado porque su contenido aún no se diseña (dependen
de Módulos 2 y 3). No aplica a los 17 bloques de Módulo 1, que sí cumplen la
regla.
