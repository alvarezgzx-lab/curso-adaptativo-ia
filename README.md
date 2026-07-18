# curso-adaptativo-ia

Curso adaptativo construido en **Adapt Framework**, alojado/lanzado desde
**Moodle**, con métricas registradas como statements **xAPI** en un **LRS**
(Learning Record Store, vía LRSQL), y un motor de personalización basado en
la **API de Claude**. Proyecto base del video showcase técnico.

## Empieza aquí

Si vienes a diseñar el curso (investigación, teoría de aprendizaje,
decisiones didácticas): [`ROADMAP.md`](ROADMAP.md) → [`lxd/README.md`](lxd/README.md).
Si vienes a tocar código/infraestructura: sigue leyendo este README.

## Arquitectura

```
Alumno → Curso Adapt (embebido/lanzado desde Moodle como paquete SCORM)
            │
            ├─ interacciones del alumno → statements xAPI → LRS (LRSQL)
            │
            ├─ por cada ítem → POST /api/item-response (Middleware)
            │                       │
            │                       ├─ bayesEngine.js actualiza el estado (Bayes/IRT)
            │                       ├─ persiste el estado (SQLite, stateStore.js)
            │                       └─ Claude API SOLO redacta el feedback del ítem
            │
            └─ en cada checkpoint → POST /api/decision (Middleware)
                                          │
                                          └─ bayesEngine.resolveNextBlockId()
                                             (determinista, sin llamar a Claude)
                                             → nextBlockId
```

Motor de decisión adaptativa (bayesiano): [`docs/arquitectura-motor-bayesiano-adaptativo.md`](docs/arquitectura-motor-bayesiano-adaptativo.md).
Detalle completo de las decisiones de arquitectura: [`docs/proyecto-tecnico.md`](docs/proyecto-tecnico.md).
Plan del video showcase: [`docs/brief-video-showcase.md`](docs/brief-video-showcase.md).
Vocabulario xAPI custom del proyecto: [`docs/xapi-verbs.md`](docs/xapi-verbs.md).
Puntos a validar durante el build (no asumir, confirmar en código): [`docs/riesgos.md`](docs/riesgos.md).
Especificación pedagógica (LXD) que le da contenido al stack: [`lxd/`](lxd/), roadmap en [`ROADMAP.md`](ROADMAP.md).

## Estructura del repo

```
curso-adaptativo-ia/
├── ROADMAP.md               # secuencia de trabajo para el diseño LXD (solo operador)
├── docker-compose.yml        # Moodle + LRS (LRSQL) + middleware
├── .env.example
├── .gitattributes            # normaliza line endings a LF (evita el problema CRLF al clonar en Windows)
├── course/                   # curso Adapt Framework (ver course/SETUP.md)
│   └── src/extensions/adapt-contrib-decisionEngine/  # llama al middleware en cada punto de decisión
├── middleware/                # API Node.js: decisión adaptativa vía Claude
├── moodle/                    # notas de config específicas de Moodle
├── lrs/                        # notas de config específicas del LRS (LRSQL)
├── scripts/package-scorm.sh    # empaqueta course/build/ como .zip SCORM para Moodle
├── lxd/                        # especificación pedagógica: objetivos, checkpoints, storyboard, xAPI, evaluación, UDL
├── docs/                       # briefs, verbos xAPI y riesgos técnicos
└── .github/workflows/           # CI (lint + test del middleware)
```

## Stack

| Componente | Versión |
|---|---|
| Node.js | 24 (Active LTS) |
| Moodle | 4.5 (LTS) |
| Adapt Framework | última estable del repo oficial |
| LRS | LRSQL (Yet Analytics), Docker, código abierto |

## Cómo levantar el entorno local

```bash
cp .env.example .env
# completar ANTHROPIC_API_KEY y el resto de credenciales en .env

docker-compose up -d moodle-db moodle lrs
```

Luego seguir, en orden:

1. [`lrs/README.md`](lrs/README.md) — completar `LRS_KEY`/`LRS_SECRET`/credenciales de admin en `.env` y confirmar que el LRS levantó.
2. [`course/SETUP.md`](course/SETUP.md) — inicializar el curso Adapt, instalar la extensión `decisionEngine`, configurar el endpoint xAPI, definir los puntos de decisión.
3. `./scripts/package-scorm.sh` — empaquetar el build del curso como `.zip` SCORM.
4. [`moodle/README.md`](moodle/README.md) — subir ese paquete a Moodle.
5. `docker-compose up -d middleware` — levantar el servicio que conecta Claude con el LRS.

## Middleware

API mínima en `middleware/`:

- `GET /health`
- `POST /api/item-response` — `{ actorId, checkpointId, itemId, isCorrect, factorId? }`
  → registra la respuesta en el motor bayesiano, persiste el estado, devuelve
  `{ nextItemId, diagnostico, feedback }`.
- `POST /api/decision` — `{ actorId, checkpointId }` → resuelve, sin llamar a
  Claude, si el alumno ya puede avanzar de etapa y a qué `nextBlockId`.
  Ver `docs/arquitectura-motor-bayesiano-adaptativo.md`.

```bash
cd middleware
npm install
npm run lint
npm test
npm run dev
```

## Estado

Proyecto en construcción — sin fecha límite fija. Ver `docs/riesgos.md` para
lo técnico pendiente y `ROADMAP.md` para el diseño pedagógico pendiente.
