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

## Ruta: `b-fundamentos-avanzados` / `b-etica-legal-avanzado` (rama avanzada opcional, nueva)

**Representación múltiple**
- [x] Texto con términos técnicos (*transformer*, *difusión*, VRAM, Clasificación de Niza) acompañado de diagrama/infografía de apoyo (`lxd/06-assets.md`) y alt-text.
- [x] Toda afirmación técnica tiene cita a fuente oficial visible (`docs/fuentes-pedagogicas.md`), no solo texto denso sin respaldo.

**Acción y expresión múltiple**
- [x] Ítems AV1/AV2 son autoevaluación no calificada (mcq con retroalimentación), no ensayo obligatorio — reduce barrera de entrada a quien solo quiere explorar el tema.
- [x] Alumno puede detenerse después de `b-fundamentos-avanzados` sin completar `b-etica-legal-avanzado`; ambos bloques quedan registrados como `experienced` de forma independiente.

**Motivación (compromiso) múltiple**
- [x] Acceso solo por interés explícito (`interesAvanzado = "Sí"`), nunca forzado — refuerza autonomía y evita sobrecarga a quien no lo pidió.
- [x] Encuadre explícito como "más allá de lo básico de este curso", evitando que se perciba como examen oculto o requisito disfrazado.
- [x] Cierre de `b-etica-legal-avanzado` conecta explícitamente con `b-precauciones-seguridad` ya visto, reforzando pertenencia al mismo hilo del módulo en vez de sentirse un añadido aislado.

**Checklist global:** ☑ Las 6 rutas (default + 5 `nextBlockId` distintos, contando la rama avanzada de 2 bloques como una sola ruta) de Módulo 1 tienen su bloque completo arriba.

Pendiente: checklist UDL de `b-evaluacion-final-estandar` y
`b-evaluacion-final-repaso-dirigido` una vez se diseñe su contenido real. La
ruta `b-bienvenida-m1` de `chk-diagnostico-curso-inicial` ya queda cubierta
por la ruta `default` de arriba (es el mismo bloque de entrada).
