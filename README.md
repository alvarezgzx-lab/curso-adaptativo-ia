# curso-adaptativo-ia

Curso adaptativo construido en **Adapt Framework**, alojado/lanzado desde
**Moodle**, con métricas registradas como statements **xAPI** en **Learning
Locker**, y un motor de personalización basado en la **API de Claude**.
Proyecto base del video showcase técnico.

## Arquitectura

```
Alumno → Curso Adapt (embebido/lanzado desde Moodle como paquete SCORM)
            │
            ├─ interacciones del alumno → statements xAPI → Learning Locker (LRS)
            │
            └─ en puntos de decisión → llamada a Middleware (Node.js)
                                              │
                                              ├─ lee historial del alumno en el LRS
                                              ├─ llama a la API de Claude con ese contexto
                                              └─ devuelve la siguiente ruta/bloque a mostrar
```

Detalle completo de las decisiones de arquitectura: [`docs/proyecto-tecnico.md`](docs/proyecto-tecnico.md).
Plan del video showcase: [`docs/brief-video-showcase.md`](docs/brief-video-showcase.md).
Puntos a validar durante el build (no asumir, confirmar en código): [`docs/riesgos.md`](docs/riesgos.md).

## Estructura del repo

```
curso-adaptativo-ia/
├── docker-compose.yml     # Moodle + Learning Locker + middleware
├── .env.example
├── course/                # curso Adapt Framework (ver course/SETUP.md)
├── middleware/             # API Node.js: decisión adaptativa vía Claude
├── moodle/                 # notas de config específicas de Moodle
├── learninglocker/          # notas de config específicas del LRS
├── docs/                   # briefs y riesgos técnicos
└── .github/workflows/       # CI (lint + test del middleware)
```

## Stack

| Componente | Versión |
|---|---|
| Node.js | 24 (Active LTS) |
| Moodle | 4.5 (LTS) |
| Adapt Framework | última estable del repo oficial |
| Learning Locker | Community Edition (Docker) |

## Cómo levantar el entorno local

```bash
cp .env.example .env
# completar ANTHROPIC_API_KEY y el resto de credenciales en .env

docker-compose up -d moodle-db moodle ll-mongo ll-redis ll-app
```

Luego seguir, en orden:

1. [`learninglocker/README.md`](learninglocker/README.md) — crear organización/usuario del LRS y obtener `LRS_KEY`/`LRS_SECRET`.
2. [`course/SETUP.md`](course/SETUP.md) — inicializar el curso Adapt, configurar el endpoint xAPI, definir los puntos de decisión.
3. [`moodle/README.md`](moodle/README.md) — subir el curso como paquete SCORM.
4. `docker-compose up -d middleware` — levantar el servicio que conecta Claude con el LRS.

## Middleware

API mínima en `middleware/`:

- `GET /health`
- `POST /api/decision` — `{ actorId, courseId, checkpointId }` → consulta el
  historial del alumno en el LRS, llama a Claude, devuelve
  `{ nextBlockId, rationale }`.

```bash
cd middleware
npm install
npm run lint
npm test
npm run dev
```

## Estado

Proyecto en construcción — sin fecha límite fija. Ver `docs/riesgos.md` para
lo que falta confirmar en código real antes de grabar el video showcase.
