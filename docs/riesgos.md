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
- ~~Superficie real de `Adapt.blocks` / eventos en `decisionEngine.js`~~ —
  Adapt Framework (v5.56.2) instalado y probado localmente en `course/`.
  La extensión real (`course/src/extensions/adapt-contrib-decisionEngine/`)
  usa APIs confirmadas leyendo el código fuente del framework instalado, no
  supuestas: `Adapt.on('questionView:submitted', ...)` para saber cuándo se
  respondió una pregunta, `data.findById(id)` (`core/js/data.js`) para
  ubicar bloques/componentes, y `_isAvailable` + `Adapt.parentView.
  addChildren()` para revelar contenido dinámicamente — el mismo mecanismo
  que usa `adapt-contrib-trickle` para desbloquear contenido progresivo.
  Verificado con `grunt build` (el código de la extensión queda en el
  bundle final) y en vivo contra el middleware real corriendo (ver el
  commit de `decisionEngine.js` para el detalle de qué se probó en
  navegador vs. qué se confirmó llamando al middleware directamente).
- ~~Acceso al actor xAPI desde adapt-contrib-spoor~~ — confirmado:
  `core/js/offlineStorage.js` (`offlineStorage.get('learnerinfo')`) expone
  `cmi.core.student_id` sin necesidad de llamar a la API SCORM directamente
  — es lo que usa `decisionEngine.js` para el `actorId`.

## Brecha #1 — Claude no conoce las rutas válidas (RESUELTA ARQUITECTÓNICAMENTE, pendiente de datos reales)

Resuelta en el diseño: `middleware/src/claude.js` ya no decide `nextBlockId`.
`bayesEngine.js` (ver `docs/arquitectura-motor-bayesiano-adaptativo.md`) enruta
de forma determinista vía `resolveNextBlockId()`, con guardrails estructurales
(solo puede devolver un `nextBlockId` que exista en `checkpointSpec.rutasPosibles`
o `casoSinHistorialPrevio` — no hay superficie para que devuelva algo fuera de
esa lista). Claude queda solo para redactar feedback (`POST /api/item-response`).

Pendiente real (actualizado): `lxd/00` a `lxd/07` completos para el Módulo 1
(EC1705/E5336) y los checkpoints de apertura/cierre de curso. `lxd/02` tiene
los 4 checkpoints reales con rutas y `criterioDeSeleccion` documentado.
Mientras `espacioDeHipotesis`/`hipotesisAsociadas`/`factorAsociado`/
`rutaPorDefectoSiAmbiguo` sigan sin calibrar, el enrutamiento de
`chk-diagnostico-inicial` y `chk-conceptos-basicos` lo resuelve
`middleware/src/simpleCheckpointRules.js` (implementación literal del
`criterioDeSeleccion`, no el motor bayesiano) — ver la nota de arquitectura
en `lxd/02`. `lxd/08` tiene los 5 ítems del quiz de `chk-conceptos-basicos`
(CB1-CB5) con `b` elicitado del criterio cualitativo del instructor
(Básico/Medio/Avanzado), usados para selección adaptativa pregunta-por-
pregunta — no calibración psicométrica real. `course/` tiene Adapt
Framework instalado y el contenido de Módulo 1 construido y verificado
(`grunt build`); `decisionEngine.js` conecta ambos extremos. Sigue
bloqueado para producción real hasta calibrar `espacioDeHipotesis` con
datos de uso y pasar `npm run monte-carlo -- <checkpointId>` con exactitud
equilibrada ≥ 0.70 (ver `ROADMAP.md`, "Gate del motor bayesiano").

Actualización (corrección de Módulo 1): se agregó el checkpoint
`chk-avance-fundamentos` y 2 bloques de ruta avanzada opcional, sin afectar
el estado de calibración IRT descrito arriba — sigue pendiente exactamente
igual, ahora con 5 checkpoints totales en vez de 4.

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
  que ambos flujos no chocan. `decisionEngine.js` no implementa esto
  todavía — solo llama al middleware, no escribe statements xAPI al LRS
  directamente.
- **`chk-evaluacion-final-curso` sin implementar en `decisionEngine.js`**:
  depende de que existan Módulos 2 y 3 (ver `lxd/03-storyboard.md`, bloques
  reservados `b-evaluacion-final-estandar`/`b-evaluacion-final-repaso-dirigido`).
  No hay nada que conectar todavía para este checkpoint.
- **Interacción completa en navegador (D2/D3 del diagnóstico) no confirmada
  en vivo**: se verificó D1 completo end-to-end (clic → evento → llamada al
  middleware simulada → notificación) y se confirmó por separado, llamando
  al middleware directamente con el payload exacto que arma la extensión,
  que `POST /api/decision` y `POST /api/item-response` responden
  correctamente — pero el flujo de clics D2/D3 completo dentro del
  navegador no se pudo confirmar en esta sesión por inestabilidad de la
  herramienta de automatización (coordenadas de clic no se refrescaban
  tras cambios de scroll/DOM). Repetir la prueba manualmente antes de dar
  por cerrada la integración.
- **Calibración de `lxd/08` (CB1-CB5) es criterio cualitativo del
  instructor, no psicométrico**: los valores de dificultad (`b`) se
  elicitaron pidiéndole a Ángel que clasificara cada pregunta como
  Básico/Medio/Avanzado, no de datos reales de alumnos. Suficiente para que
  la selección adaptativa del quiz funcione de forma razonable, pero sigue
  bloqueado para producción real hasta pasar `npm run monte-carlo` con
  datos de uso (ver `ROADMAP.md`, "Gate del motor bayesiano").

`docker-compose up` de `moodle-db`, `moodle` y `middleware` sí se probó de
punta a punta (Docker Desktop en Windows) — de ahí salieron los tres
hallazgos ya marcados como resueltos arriba. El servicio `lrs` (LRSQL) es
nuevo en este cambio y todavía no se ha probado levantado. Adapt Framework
sí se instaló, construyó (`grunt build`) y sirvió localmente con éxito.
