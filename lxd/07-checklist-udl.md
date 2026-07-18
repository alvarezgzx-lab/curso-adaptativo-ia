# Fase 6 — Checklist UDL / accesibilidad

> Aplicar esta checklist a **cada variante de ruta adaptativa**, no solo a la
> ruta default — cada rama del árbol de decisión es una obligación de
> accesibilidad aparte, no un extra opcional.

Repetir el bloque de abajo una vez por cada `nextBlockId` (incluida la ruta
default) definido en `02-especificacion-decision-checkpoints.json`.

## Ruta: `default`

**Representación múltiple**
- [x] Alternativa de texto para toda imagen/video no textual (infografías con alt-text, video de bienvenida con transcripción).
- [x] Subtítulos/transcripción en el audio de bienvenida.
- [x] Contraste de color verificado en infografías (no depender solo del color en "qué sí/no compartir").

**Acción y expresión múltiple**
- [x] Navegación completa por teclado en quiz formativo y sumativo, sin trampas de foco.
- [x] Tiempo ajustable en evaluación sumativa (ajuste razonable disponible).

**Motivación (compromiso) múltiple**
- [x] Escenarios de bienvenida y ejemplos ajustables por sector (marketing/educación/atención a cliente).
- [x] Retroalimentación clara e inmediata en `b-terminologia-basica`, `b-tipos-contenido`, `b-quiz-conceptos`.

## Ruta: `b-exploracion-guiada-principiante`

**Representación múltiple**
- [x] Video con subtítulos + transcripción + versión solo-texto con capturas numeradas (tres formatos del mismo contenido).
- [x] Alt-text detallado en cada captura de `b-practica-exploracion-principiante`.

**Acción y expresión múltiple**
- [x] Alumno puede seguir los pasos en la herramienta real o en la captura interactiva simulada si no tiene acceso inmediato.
- [x] Intentos ilimitados sin penalización en la práctica de identificación.

**Motivación (compromiso) múltiple**
- [x] Checklist con progreso visible paso a paso (reduce carga cognitiva y ansiedad de principiante).
- [x] Retroalimentación explicativa (no solo correcto/incorrecto) ante cada error.

## Ruta: `b-exploracion-directa-experiencia`

**Representación múltiple**
- [x] Plantilla comparativa disponible en formato tabla editable y en formato lista.
- [x] Alt-text en capturas usadas para autoevaluación.

**Acción y expresión múltiple**
- [x] Entrega por escrito o por audio/video corto (elección del alumno).
- [x] Elección del par de herramientas a comparar entre 4 opciones (autonomía).

**Motivación (compromiso) múltiple**
- [x] Reto formulado como desafío profesional (no como tarea remedial).
- [x] Comparación opcional contra ejemplo modelo, sin obligatoriedad.

## Ruta: `b-refuerzo-conceptos-basicos`

**Representación múltiple**
- [x] Texto + video corto opcional de repaso con subtítulos.
- [x] Ejemplos resueltos con explicación paso a paso.

**Acción y expresión múltiple**
- [x] Reintento del quiz sin límite de intentos ni penalización en calificación final.
- [x] Ejemplos interactivos navegables por teclado.

**Motivación (compromiso) múltiple**
- [x] Tono de mensaje sin lenguaje punitivo ("repasemos", no "fallaste").
- [x] Progreso visible hacia el siguiente intento.

## Ruta: `b-sintesis-avanzada`

**Representación múltiple**
- [x] Instrucciones del reto en texto ≤60 palabras, disponibles también en audio.
- [x] Caso de uso con imágenes de apoyo opcionales.

**Acción y expresión múltiple**
- [x] Respuesta en texto, audio o esquema visual (elección del alumno).
- [x] Caso ajustable al sector/contexto laboral propio del alumno.

**Motivación (compromiso) múltiple**
- [x] Reto formulado como desafío de aplicación real, con reconocimiento explícito de haber aprobado el quiz.
- [x] Retroalimentación inmediata al completar.

**Checklist global:** ☑ Las 5 rutas (default + 4 `nextBlockId`) de Módulo 1 tienen su bloque completo arriba.

Pendiente: checklist UDL de `b-evaluacion-final-estandar` y
`b-evaluacion-final-repaso-dirigido` una vez se diseñe su contenido real. La
ruta `b-bienvenida-m1` de `chk-diagnostico-curso-inicial` ya queda cubierta
por la ruta `default` de arriba (es el mismo bloque de entrada).
