# Brief técnico — Video showcase (Adapt + Moodle + xAPI + Claude API)

Documento de referencia con todas las decisiones técnicas (no de contenido/guion) definidas en la entrevista de elicitación. Úsalo como checklist mientras construyes el entorno y produces el video.

## 1. Estado del proyecto

El entorno (Docker, Moodle, Adapt Framework, LRS, integración Claude API) **no está armado todavía**. No hay fecha límite fija — se construye con calma y se graba cuando esté realmente listo para lucir bien. No planifiques fecha de grabación hasta completar la sección 8 (checklist de construcción).

## 2. Especificaciones de grabación

- Formato único: **horizontal 16:9**, sin recortes verticales (el contenido — tablas, dashboards, código — pierde legibilidad en vertical).
- Resolución: 1920×1080 mínimo (2560×1440 si tu monitor lo permite, da margen para zoom en edición).
- Frame rate: 60fps para que el cursor y las transiciones se vean fluidas.
- Setup de pantallas: laptop + monitor externo — suficiente para tener el guion en una pantalla y la captura limpia en la otra. No hace falta teleprompter adicional.
- Grabar pantalla **en silencio primero**, narrar después viendo la repetición (separa la actuación técnica de la actuación de voz, reduce errores).
- Herramienta de captura: OBS Studio (sin marca de agua, sin límite de tiempo) o Cap (open source, más liviano) para las escenas de UI; asciinema para terminal/API calls (texto nítido incluso acelerado).

## 3. Audio y narración

- Micrófono: USB dedicado (ya disponible).
- Narración: **dos versiones completas, español e inglés** — mismo guion visual, doble grabación de voz.
- Ensaya cada guion en voz alta antes de grabar la toma final; graba 2-3 tomas por segmento para tener opciones en edición.

## 4. Publicación y formatos de salida

- Duración objetivo: **60-90 segundos**, misma duración en ambas plataformas.
- LinkedIn: subir como **video nativo** (nunca como link externo — LinkedIn penaliza el alcance de posts con enlaces salientes).
- YouTube: mismo corte de 60-90s, subido directamente (público o no listado según prefieras).
- Al ser el mismo corte en ambas, no hace falta editar dos versiones de duración distinta — sí necesitas dos exportaciones (una por idioma) × posiblemente duplicadas si quieres ES y EN en ambas plataformas. Define esto antes de exportar: ¿subes las 2 versiones de idioma en cada plataforma, o eliges un idioma por plataforma?

## 5. Subtítulos

- LinkedIn: subtítulos **quemados (hardcoded)** en el video — se consume mayormente sin audio.
- YouTube: archivo **.srt separado** por idioma, subido como pista alterna.
- Generación: Whisper (local, gratis) + ffmpeg para el borrador automático; revisar a mano términos técnicos (Adapt, xAPI, Moodle, LRS suelen transcribirse mal).

## 6. Música

- Librería: Uppbeat (gratis, con atribución) — dar crédito al autor en la descripción del video en ambas plataformas.

## 7. Identidad visual (branding)

Ya tienes un sistema de diseño definido en tu CV/portafolio (`diseno-visual.md`) — reutilízalo para overlays, captions y outro, así todo tu material profesional se ve consistente:

- Tipografía display/títulos: **Fraunces** (Google Fonts, serif variable 400-700).
- Tipografía de cuerpo/captions: **Inter** (400, 500, 600).
- Tipografía técnica (código, JSON, timestamps, etiquetas): **IBM Plex Mono**.
- Paleta:
  - `#171717` Negro editorial — texto principal, fondos oscuros.
  - `#F4EFE6` Crema cálida — fondo principal (nunca blanco puro).
  - `#B85C38` Terracota — acento primario, énfasis.
  - `#17324D` Marino profundo — acento secundario, headers.
  - `#6F8F72` Salvia — acento terciario, etiquetas de estado.
- Un solo color de acento por escena/overlay — evitar que el video se vea "arcoíris".

## 8. Datos del entorno

Pendiente de decidir — **recomendación: diseña el entorno con datos 100% ficticios desde el inicio** (usuario "alumno demo", curso de ejemplo, sin tokens ni emails reales). Es más simple que enmascarar después frame por frame en edición, y elimina el riesgo de exponer algo sensible en el video final.

## 9. Editor de video

**DaVinci Resolve** (gratis, sin marca de agua, multitrack completo, subtítulos por texto, corrección de color) — confirmado dado tu equipo.

## 10. Checklist técnico por escena (raw footage a capturar)

1. **Hook (0-6s):** terminal vacío, fuente grande (20-24pt), tema oscuro, cursor parpadeando. Graba 15-20s de sobra.
2. **Setup (6-20s):** en tiempo real (sin cortar) — `git clone`, `docker-compose up`, instalación Moodle, scaffolding Adapt, config JSON del endpoint xAPI. Usa asciinema para esta parte. Enmascara cualquier key real. 3-5 min de bruto.
3. **Adaptividad (20-35s):** dos tomas — respuesta correcta (ruta avanzada) y respuesta incorrecta (ruta remedial). Pantalla completa, clic resaltado visualmente.
4. **xAPI en vivo (35-50s):** dos fuentes sincronizadas (curso + consola/dashboard con statements entrando) — usa una marca visual compartida ("clap sync") para alinear en edición.
5. **Claude API (50-65s):** llamada real vía asciinema (key oculta) + resultado reflejado en la interfaz del curso. Mismo clap-sync.
6. **Resultados (65-80s):** dashboard con datos ya poblados (corre sesiones de prueba antes de grabar), scroll suave, zoom a cifras clave.
7. **Cierre (80-90s):** overlay estático en edición (nombre, logos del stack, link) — no requiere grabación de pantalla.

## 11. Antes de exportar

- Revisar frame por frame las escenas 2 y 5 (terminal/config) buscando keys, tokens o emails reales.
- Confirmar subtítulos generados por Whisper contra el guion final.
- Exportar: LinkedIn (subtítulos quemados, nativo) y YouTube (con .srt), en el idioma o idiomas que definas en la sección 4.

## 12. Decisiones abiertas

- ¿Subes ambas versiones de idioma (ES/EN) en cada plataforma, o un idioma por plataforma? (sección 4)
- Confirmar datos ficticios como estándar del entorno (sección 8) antes de empezar a construir.

---

Siguiente paso sugerido: guion palabra por palabra (narración + captions) por escena, en ambos idiomas.
