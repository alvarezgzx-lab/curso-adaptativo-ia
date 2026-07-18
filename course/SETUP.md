# course/ — curso Adapt Framework

Esta carpeta contiene el proyecto de Adapt Framework. No se vendoriza el framework
completo en este repo (es un proyecto upstream grande con su propio ciclo de
releases) — se inicializa localmente siguiendo estos pasos:

1. Clonar el framework oficial dentro de esta carpeta:
   `git clone https://github.com/adaptlearning/adapt_framework.git .`
   (o usar el Adapt CLI si prefieres scaffolding guiado)
2. `npm install`
3. Confirmar/instalar el plugin `adapt-contrib-spoor` (tracking SCORM/xAPI) —
   viene incluido por defecto en la mayoría de builds recientes del framework;
   verificar en `adapt.json`.
4. Configurar en `course/course.json` (o el config de spoor correspondiente) el
   endpoint xAPI apuntando al LRS (LRSQL):
   - `_endpoint`: valor de `LRS_ENDPOINT` (ver `.env` en la raíz del repo)
   - `_user` / `_password`: `LRS_KEY` / `LRS_SECRET`
5. Definir los 2-3 puntos de decisión adaptativa del MVP como componentes/bloques
   que, en el evento correspondiente, hacen `fetch` a
   `${MIDDLEWARE_URL}/api/decision` con `{ actorId, courseId, checkpointId }` y
   usan la respuesta (`nextBlockId`) para decidir qué bloque mostrar.
6. Build de desarrollo: `grunt server`
7. Build para exportar como paquete SCORM (para subir a Moodle):
   `grunt build --_target=scorm` (el nombre exacto de la tarea se confirma contra
   la versión de spoor instalada — puede variar entre releases).

Ver `docs/riesgos.md` para los puntos de esta integración que se validan en la
práctica, no se asumen de antemano.
