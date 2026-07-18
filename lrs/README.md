# lrs/ — configuración del LRS (Learning Record Store)

El LRS corre vía Docker: un solo servicio, `lrs`, en el `docker-compose.yml`
de la raíz, usando la imagen `yetanalytics/lrsql` (SQL LRS, de Yet Analytics).

> Se eligió LRSQL en vez de Learning Locker: la imagen de Learning Locker
> planeada originalmente no existe como paquete descargable, y su despliegue
> oficial actual son 7 contenedores compilados con una versión de Node.js sin
> soporte — alto riesgo de romperse. LRSQL es un solo contenedor, de código
> abierto (Apache 2.0), mantenido activamente, y usa SQLite por defecto (sin
> necesitar Mongo/Redis aparte). Ver `docs/riesgos.md`.

## Primer arranque

1. Completa en `.env` (copiado de `.env.example`): `LRS_KEY`, `LRS_SECRET`
   (la pareja de credenciales que usará el middleware para autenticarse),
   y `LRS_ADMIN_USER`/`LRS_ADMIN_PASSWORD` (para entrar al panel de admin).
   Estas credenciales las defines tú antes de levantar el contenedor — LRSQL
   las usa como la cuenta por defecto al arrancar, no hay que crearlas desde
   una interfaz después.
2. `docker-compose up -d lrs`
3. Entrar a `http://localhost:8081/admin` con `LRS_ADMIN_USER`/`LRS_ADMIN_PASSWORD`
   para confirmar que levantó correctamente.
4. El endpoint de statements xAPI que usa el middleware (`LRS_ENDPOINT`) es
   `http://localhost:8081/xapi/` — ya viene así en `.env.example`, no hace
   falta descubrirlo en ninguna interfaz.
5. Autenticación: LRSQL espera el header `Authorization` con `LRS_KEY:LRS_SECRET`
   combinados y codificados en Base64 (autenticación básica estándar de xAPI).
   `middleware/src/lrs.js` ya arma el header exactamente en ese formato —
   hoy ese archivo no se usa en el flujo activo del middleware (el motor
   bayesiano guarda su propio estado, no lee el LRS), pero sirve de
   referencia para quien programe el envío de statements desde Adapt
   directamente al LRS (pendiente, ver `docs/riesgos.md`).
