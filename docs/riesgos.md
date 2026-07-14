# Riesgos técnicos a validar durante el build

Puntos donde este scaffold toma una decisión razonable pero no verificada en
código real. Confirmar cada uno la primera vez que se levanta esa parte del
stack, y actualizar este archivo con lo que resulte.

- **Tag de imagen de Learning Locker**: `learninglocker/learninglocker2-app:latest`
  en `docker-compose.yml` es un placeholder razonable — Learning Locker no
  publica un `docker-compose.yml` oficial único y mantenido; hay varias
  implementaciones comunitarias. Al primer `docker-compose up`, si esta imagen
  no levanta limpio, revisar `https://github.com/adlnet/learninglocker-docker`
  y ajustar el servicio `ll-app` (puede requerir separar `ll-app` de un
  contenedor `nginx` adicional).
- **Endpoint exacto de statements de Learning Locker**: se asume
  `/data/xAPI/` como en versiones documentadas públicamente; confirmar en la
  UI de administración del LRS una vez levantado.
- **Lanzamiento del curso Adapt desde Moodle vía SCORM**: `adapt-contrib-spoor`
  es el plugin estándar para exportar Adapt como paquete SCORM 1.2/2004. El
  nombre exacto de la tarea Grunt para ese export puede variar según la
  versión del framework — confirmar en `course/grunt/` tras clonar el
  framework.
- **Envío de statements xAPI en paralelo al SCORM**: el objetivo es que Adapt
  mande statements xAPI *directo* a Learning Locker (para capturar detalle de
  interacción) mientras Moodle solo trackea finalización vía SCORM. Confirmar
  que ambos flujos no chocan (por ejemplo, que Moodle no intente también
  reenviar sus propios eventos SCORM como xAPI vía algún plugin adicional no
  contemplado en este scaffold).
- **Compatibilidad de versión de Node dentro de la imagen de Learning Locker**:
  es un proyecto Node separado del middleware; no debería haber conflicto de
  versiones entre contenedores, pero se confirma al levantar el compose.
