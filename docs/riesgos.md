# Riesgos técnicos a validar durante el build

Puntos donde este scaffold toma una decisión razonable pero no verificada
contra una instancia real corriendo. Confirmar cada uno la primera vez que se
levanta esa parte del stack, y actualizar este archivo con lo que resulte.

## Resueltos

- ~~Line endings CRLF/LF al clonar en Windows~~ — resuelto con
  `.gitattributes` (`* text=auto eol=lf`). Si vuelves a ver "todo modified"
  después de un `git pull`, corre `git add --renormalize .` una vez.
- ~~Tarea Grunt para exportar SCORM~~ — verificado contra la documentación
  oficial del framework: **no existe** un target `--_target=scorm` separado.
  El comando es simplemente `grunt build`; genera el paquete SCORM
  automáticamente porque `adapt-contrib-spoor` está instalado. El resultado
  queda en `course/build/` y se comprime con `scripts/package-scorm.sh`.
- ~~`bitnami/moodle` sin tags disponibles~~ — Bitnami congeló los tags
  gratuitos de sus imágenes en Docker Hub (agosto 2025) y movió el historial
  a `bitnamilegacy/*` (sin actualizaciones futuras, solo para migración).
  Corregido en `docker-compose.yml` a `bitnamilegacy/moodle:5.0.2` — mismo
  contenido/env vars que `bitnami/moodle`, pero sin soporte a futuro;
  considerar una imagen mantenida (p. ej. `moodlehq/moodle-php-apache` +
  código de Moodle montado aparte) si esto se vuelve a romper.
- ~~`mariadb:11` con collation por defecto incompatible con Moodle~~ —
  MariaDB 11 usa por defecto `utf8mb4_uca1400_ai_ci` (colación UCA-14.0), que
  el chequeo de entorno "unicode" del instalador de Moodle 5.0.2 no reconoce
  como UTF-8 válido — el install fallaba en seco (`!! unicode !!`) sin
  mensaje claro en los logs del contenedor (solo visible corriendo
  `admin/cli/install.php` a mano dentro del contenedor). Corregido agregando
  `command: --character-set-server=utf8mb4
  --collation-server=utf8mb4_unicode_ci` al servicio `moodle-db`.
- ~~`MONGO_URI`/`REDIS_URL` con hostnames que no existen~~ — `.env.example`
  apuntaba a `learninglocker-mongo`/`learninglocker-redis`, pero los
  servicios en `docker-compose.yml` se llaman `ll-mongo`/`ll-redis` — con
  esos hostnames `ll-app` no habría podido resolver DNS dentro de la red de
  Docker. Corregido en `.env`/`.env.example`.

## Brecha #1 — Claude no conoce las rutas válidas (pendiente de cerrar en código)

`middleware/src/claude.js` hoy le pasa a Claude el historial xAPI crudo y el
`checkpointId`, pero no le dice cuáles son los `nextBlockId` posibles ni el
criterio de selección — Claude está decidiendo sin saber sobre qué conjunto
de opciones. Esto se resuelve con datos, no con más código: una vez
`lxd/02-especificacion-decision-checkpoints.json` esté completo, hay que:

1. Cargar ese JSON en el middleware (o una versión reducida) y pasarlo como
   parte del contexto del system prompt, junto con el `checkpointId` actual.
2. Agregar instrucción explícita en el system prompt de nunca devolver un
   `nextBlockId` fuera de la lista de rutas válidas para ese checkpoint —
   hoy no hay ningún guardrail para eso, `decideNextStep()` confía
   ciegamente en lo que Claude devuelva.
3. Manejar el caso "sin historial previo" (definido por checkpoint en el
   mismo JSON) como un atajo *antes* de llamar a Claude — no tiene sentido
   ni costo pagar una llamada a la API para una decisión que ya es fija.

No hay nada que hacer en código hasta que exista esa especificación — ver
`lxd/README.md` y `ROADMAP.md`.

## Pendientes (confirmar contra código real)

- **`learninglocker/learninglocker2-app` no existe como imagen descargable**
  (confirmado: `pull access denied`, repo inexistente). Learning Locker no
  publica un contenedor todo-en-uno; el despliegue oficial actual
  (`adlnet/learninglocker-docker`) son 7 contenedores (api/ui/worker/xapi/
  mongo/redis/nginx) que se compilan desde código fuente con `node:10`
  (EOL) sobre `LearningLocker/learninglocker@v7.1.1` — build largo y con
  riesgo de romper por deriva de dependencias. `ll-mongo`/`ll-redis`/`ll-app`
  quedan abajo hasta decidir e implementar ese stack (o una alternativa);
  mientras tanto el resto del compose se levanta con `docker compose up
  --no-deps moodle-db moodle middleware`.
- **Endpoint exacto de statements de Learning Locker**: se asume
  `/data/xAPI/` como en versiones documentadas públicamente; confirmar en la
  UI de administración del LRS una vez levantado.
- **Superficie real de `Adapt.blocks` / eventos en `decisionEngine.js`**: el
  extension skeleton en `course/src/extensions/adapt-contrib-decisionEngine/`
  asume una API de Backbone/Adapt razonable pero no se probó contra una
  instancia clonada real. Verificar contra `adapt_framework/src/core/js/`
  de la versión que termines usando, especialmente `blockView:postRender` y
  el acceso a `Adapt.offlineStorage`.
- **Acceso al actor xAPI desde adapt-contrib-spoor**: `getActorId()` en la
  extensión usa un placeholder; spoor expone el actor de otra forma internamente
  — confirmar el método correcto al integrar.
- **Envío de statements xAPI en paralelo al SCORM**: el objetivo es que Adapt
  mande statements xAPI *directo* a Learning Locker (para capturar detalle de
  interacción) mientras Moodle solo trackea finalización vía SCORM. Confirmar
  que ambos flujos no chocan.
- **Compatibilidad de versión de Node dentro de la imagen de Learning Locker**:
  es un proyecto Node separado del middleware; no debería haber conflicto de
  versiones entre contenedores, pero se confirma al levantar el compose.

`docker-compose up` de `moodle-db`, `moodle` y `middleware` sí se probó de
punta a punta (Docker Desktop en Windows) — de ahí salieron los tres
hallazgos ya marcados como resueltos arriba. `ll-mongo`/`ll-redis`/`ll-app`
quedan sin probar hasta resolver la brecha de la imagen de Learning Locker.
