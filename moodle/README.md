# moodle/ — configuración específica de Moodle

Moodle corre desde la imagen oficial `bitnami/moodle:4.5` definida en el
`docker-compose.yml` de la raíz — no se vendoriza código de Moodle aquí.

## Pasos manuales tras `docker-compose up`

1. Entrar a `http://localhost:8080` y loguearse con `admin` / `MOODLE_ADMIN_PASSWORD`.
2. Crear un curso nuevo → Actividad → **Paquete SCORM**.
3. Subir el `.zip` generado por `grunt build --_target=scorm` en `course/`.
4. Configurar el método de calificación/tracking del paquete SCORM según el
   modo de finalización que quieras mostrar en el video (no afecta el envío de
   statements xAPI, que va directo de Adapt al LRS).
5. Generar un token de Web Services (`MOODLE_WS_TOKEN`) si el middleware necesita
   leer datos de Moodle además de los del LRS (por ahora el MVP no lo requiere).
