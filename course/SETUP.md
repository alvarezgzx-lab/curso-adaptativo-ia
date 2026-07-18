# course/ — curso Adapt Framework

Esta carpeta contiene el proyecto de Adapt Framework. No se vendoriza el
framework completo en este repo (es un proyecto upstream grande con su
propio ciclo de releases, `course/.gitignore` lo excluye) — solo se
versionan el contenido del curso (`src/course/es/*.json`) y la extensión
`adapt-contrib-decisionEngine`. Para tenerlo corriendo localmente:

1. Clonar el framework oficial dentro de esta carpeta (carpeta vacía salvo
   `SETUP.md`/`.gitignore`, o `--force`/mezclar si ya tienes archivos):
   `git clone https://github.com/adaptlearning/adapt_framework.git .`
2. `npm install` — instala el framework y `src/core` (vía submódulo git,
   `adapt-contrib-core`). Node ≥18 (confirmado con Node 22, sin problemas).
3. Instalar el Adapt CLI y traer los plugins de contenido:
   `npm install -g adapt-cli && adapt install` — trae los 23 plugins
   declarados en `adapt.json` (`adapt-contrib-mcq`, `adapt-contrib-matching`,
   `adapt-contrib-spoor`, etc.). `adapt-contrib-decisionEngine` NO se
   instala así — ya vive en `src/extensions/` como parte de este repo (es
   nuestra extensión, no un plugin público).
4. `_defaultLanguage` en `src/course/config.json` ya está en `"es"` — todo
   el contenido vive en `src/course/es/`.
5. Configurar `src/course/config.json` → `_decisionEngine._middlewareUrl`
   (por defecto `http://localhost:4000/api`, coincide con `MIDDLEWARE_PORT`
   de `.env.example`). El middleware necesita CORS habilitado para aceptar
   llamadas desde el origen donde sirvas el curso — ya está (`middleware/src/index.js`,
   paquete `cors`).
   **Nota:** `adapt-contrib-spoor` sigue siendo tracking SCORM hacia Moodle,
   no envío de statements xAPI al LRS — eso sigue pendiente (ver
   `docs/riesgos.md`, "Envío de statements xAPI en paralelo al SCORM").
6. La extensión `adapt-contrib-decisionEngine` (`src/extensions/adapt-contrib-decisionEngine/`)
   ya implementa los puntos de decisión del Módulo 1: escucha
   `questionView:submitted` en los bloques de diagnóstico (`b-diagnostico-previo`)
   y del quiz (`b-quiz-conceptos`), llama a `POST /api/decision` y
   `POST /api/item-response` del middleware, y revela el bloque/ítem que
   corresponda (`_isAvailable` + `Adapt.parentView.addChildren()`). El
   `actorId` sale de `offlineStorage.get('learnerinfo').id` (SCORM, vía
   spoor) — no hace falta pantalla de login aparte.
7. Build de desarrollo: `grunt server`.
   **Conocido:** en Git Bash/Windows, `grunt server` puede fallar con
   `Fatal error: spawn cmd ENOENT` al intentar abrir el navegador
   automáticamente (aunque el servidor sí queda arriba en el puerto
   indicado antes de fallar). Alternativa confiable: `grunt build` y servir
   `build/` con cualquier servidor estático (`npx serve build`), navegando
   manualmente.
8. Build para exportar como paquete SCORM (para subir a Moodle):
   `grunt build` (no existe un target `--_target=scorm` separado — el
   paquete SCORM se genera automáticamente porque `adapt-contrib-spoor`
   está instalado). El resultado queda en `build/` y se comprime con
   `scripts/package-scorm.sh` (pendiente de crear, ver `docs/riesgos.md`).

Ver `docs/riesgos.md` para los puntos de esta integración que ya se
validaron en la práctica y los que siguen pendientes.
