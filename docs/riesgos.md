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
- ~~`MONGO_URI`/`REDIS_URL` con hostnames que no existen~~ — hallazgo del
  stack de Learning Locker original; ya no aplica, ver el punto siguiente.
- ~~Learning Locker no se puede desplegar~~ — confirmado: la imagen
  `learninglocker/learninglocker2-app` no existe como paquete descargable
  (`pull access denied`, repo inexistente), y el despliegue oficial actual
  (`adlnet/learninglocker-docker`) son 7 contenedores compilados desde
  código fuente con `node:10` (EOL) — build largo y con riesgo real de
  romperse. **Reemplazado por LRSQL** (`yetanalytics/lrsql`, Yet Analytics):
  un solo contenedor, código abierto (Apache 2.0), mantenido activamente,
  SQLite por defecto. El endpoint de statements es `/xapi/` (antes se
  asumía `/data/xAPI/` de Learning Locker) y la autenticación sigue siendo
  Base64 de `LRS_KEY:LRS_SECRET` en el header `Authorization` — el
  middleware no necesitó ningún cambio de código. Ver `lrs/README.md`
  (antes `learninglocker/README.md`) y el servicio `lrs` en
  `docker-compose.yml`.

## Brecha #1 — Claude no conoce las rutas válidas (RESUELTA ARQUITECTÓNICAMENTE, pendiente de datos reales)

Resuelta en el diseño: `middleware/src/claude.js` ya no decide `nextBlockId`.
`bayesEngine.js` (ver `docs/arquitectura-motor-bayesiano-adaptativo.md`) enruta
de forma determinista vía `resolveNextBlockId()`, con guardrails estructurales
(solo puede devolver un `nextBlockId` que exista en `checkpointSpec.rutasPosibles`
o `casoSinHistorialPrevio` — no hay superficie para que devuelva algo fuera de
esa lista). Claude queda solo para redactar feedback (`POST /api/item-response`).

Pendiente real: no hay banco de ítems ni checkpoints reales todavía (`lxd/`
sigue en plantilla), así que esto no se ha probado con datos de un alumno
real — sigue bloqueado hasta que exista `lxd/02` + `lxd/08` completos y pase
la validación Monte Carlo (ver `ROADMAP.md`, "Gate del motor bayesiano").

## Brecha #2 — persistencia del estado bayesiano no probada contra uso real

`middleware/src/stateStore.js` usa SQLite en modo WAL, adecuado para
lecturas/escrituras de un mismo alumno en un checkpoint a la vez, pero no se
ha probado con escritura concurrente real (dos pestañas del mismo alumno,
por ejemplo). Confirmar la primera vez que haya tráfico real; si se vuelve
un problema, la migración natural es Postgres, no más SQLite tuning.

## Brecha #3 — `better-sqlite3` en `node:24-alpine` no probado

`better-sqlite3` compila un binding nativo. Puede que no haya binario
prebuilt para musl/alpine en esta arquitectura, forzando compilación desde
código fuente (por eso el Dockerfile ahora instala `python3 make g++`). Si
el build de `docker compose build middleware` falla aquí, la alternativa es
cambiar la imagen base a `node:24-slim` (glibc, sin ese riesgo) — confirmar
al primer build real, no antes.

## Pendientes (confirmar contra código real)

- **`lrs` (LRSQL) sin probar contra un `docker compose up` real todavía**:
  el servicio se agregó y configuró contra la documentación oficial de
  `yetanalytics/lrsql`, pero no se ha levantado en esta máquina. Confirmar
  el primer arranque: que el contenedor inicie con las credenciales por
  defecto, que `http://localhost:8081/admin` responda, y que el middleware
  pueda escribir/leer statements contra `LRS_ENDPOINT` real.
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
  mande statements xAPI *directo* al LRS (para capturar detalle de
  interacción) mientras Moodle solo trackea finalización vía SCORM. Confirmar
  que ambos flujos no chocan.

`docker-compose up` de `moodle-db`, `moodle` y `middleware` sí se probó de
punta a punta (Docker Desktop en Windows) — de ahí salieron los tres
hallazgos ya marcados como resueltos arriba. El servicio `lrs` (LRSQL) es
nuevo en este cambio y todavía no se ha probado levantado.
