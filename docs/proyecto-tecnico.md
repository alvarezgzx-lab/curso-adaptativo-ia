# Brief técnico del proyecto — curso-adaptativo-ia

Resumen consolidado de todas las decisiones de arquitectura y configuración definidas en la entrevista. Antes de generar el scaffold, revisa especialmente la sección 8 (riesgos a validar) — son los puntos donde recomendé algo sin poder verificarlo al 100% hoy.

## 1. Qué es el proyecto

Un curso corto construido en **Adapt Framework**, alojado/lanzado desde **Moodle**, que registra cada interacción como statements **xAPI** en un LRS propio, y usa la **API de Claude** como motor de decisión para personalizar la ruta de aprendizaje del alumno. Sirve como base técnica real del video showcase.

Nombre del proyecto: **curso-adaptativo-ia** (repo, contenedores Docker y título por defecto del curso demo).

## 2. Arquitectura y flujo de datos

```
Alumno → Curso Adapt (embebido/lanzado desde Moodle)
            │
            ├─ interacciones del alumno → statements xAPI → Learning Locker (LRS)
            │
            └─ en puntos de decisión → llamada a Middleware (Node.js)
                                              │
                                              ├─ lee historial del alumno en el LRS
                                              ├─ llama a la API de Claude con ese contexto
                                              └─ devuelve la siguiente ruta/bloque a mostrar
```

- **Middleware separado en Node.js** (no client-side, no plugin PHP en Moodle): mantiene la `ANTHROPIC_API_KEY` segura del lado servidor y centraliza toda la lógica de decisión en un solo lugar. Expone una API REST propia que el curso Adapt consulta en cada punto de decisión.
- **Moodle** actúa como LMS que aloja/lanza el curso (vía SCORM o LTI — a validar, ver sección 8) y da el contexto "curso dentro de un LMS real" que buscas mostrar.
- **Learning Locker** captura el detalle fino de las interacciones directamente desde Adapt (no solo el resultado final que vería Moodle vía SCORM) — es lo que te da métricas xAPI ricas para el dashboard del video.
- **Claude** no reemplaza la lógica de branching de Adapt; la complementa: Adapt maneja la interfaz y el estado del curso, Claude decide *qué* mostrar a continuación con base en el historial xAPI del alumno.

## 3. Stack y versiones (verificado hoy)

| Componente | Versión recomendada | Motivo |
|---|---|---|
| Node.js | **24** (Active LTS) | Cumple el mínimo de Adapt (`>=16`, LTS par recomendado) y es la LTS activa vigente. |
| Adapt Framework | última versión estable del repo oficial (`adaptlearning/adapt_framework`) | Se fija la versión exacta al iniciar el build. |
| Moodle | **4.5 LTS** | Es la última release con soporte de largo plazo; 5.2 es más nueva pero con ventana de soporte más corta, y 5.3 (próxima LTS) no sale hasta octubre 2026 — no conviene construir sobre algo aún no liberado. |
| Learning Locker | Community Edition, vía Docker (imagen basada en `adlnet/learninglocker-docker` o equivalente mantenida) | Open source, gratis, pensada para correr en docker-compose junto a Mongo y Redis. |
| Middleware | Node.js 24 + Express (o Fastify) | Liviano, mismo lenguaje que el resto del stack. |

## 4. Infraestructura

- **Desarrollo:** todo local vía Docker Compose — Moodle + MariaDB, Learning Locker (app + Mongo + Redis + nginx), middleware Node.js, y el build estático de Adapt. Cero costo mientras construyes.
- **Demo grabada:** despliegue temporal a un VPS barato (ej. Hetzner/DigitalOcean droplet pequeño) justo antes de grabar, usando el mismo docker-compose. Lo apagas después para no pagar de más.

## 5. Estructura del repositorio (monorepo)

```
curso-adaptativo-ia/
├── docker-compose.yml
├── .env.example
├── README.md
├── course/              # curso Adapt Framework
├── middleware/          # servicio Node.js (API de decisión con Claude)
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── moodle/              # config/plugins específicos de Moodle (docker override, si aplica)
├── learninglocker/      # config específica del LRS (si el docker-compose lo requiere)
└── .github/
    └── workflows/       # CI: lint + test
```

## 6. Variables de entorno (`.env.example`)

Convención: `.env` local (nunca se sube, va en `.gitignore`) + `.env.example` versionado en el repo documentando qué variables existen, sin valores reales.

```
# Claude
ANTHROPIC_API_KEY=
CLAUDE_MODEL=claude-sonnet-5

# Middleware
MIDDLEWARE_PORT=4000

# Moodle
MOODLE_URL=http://localhost:8080
MOODLE_WS_TOKEN=
MOODLE_DB_HOST=
MOODLE_DB_USER=
MOODLE_DB_PASSWORD=
MOODLE_DB_NAME=

# Learning Locker (LRS)
LRS_ENDPOINT=
LRS_KEY=
LRS_SECRET=
MONGO_URI=
REDIS_URL=
```

## 7. Alcance del MVP técnico

2-3 puntos de decisión adaptativa (árbol simple, no lineal de un solo salto ni ramificación profunda). Esto dimensiona: cuántos "verbos" xAPI custom necesitas definir, cuántos endpoints distintos expone el middleware, y cuánta lógica de branching necesita el curso Adapt.

## 8. Riesgos técnicos a validar al iniciar el build (no asumir, confirmar en código)

- **Cómo lanza Moodle el curso Adapt:** lo más común es empaquetar el build de Adapt como SCORM (vía `adapt-contrib-spoor`) y subirlo como actividad SCORM en Moodle. Alternativa: LTI. Se decide la mejor opción al ver qué tan bien se conserva el envío de statements xAPI directo al LRS en cada caso — esto se valida en la práctica, no en la entrevista.
- **Versión exacta de Adapt Framework y sus plugins de xAPI:** se fija al clonar el repo oficial, revisando su changelog vigente en ese momento.
- **Compatibilidad de la imagen Docker de Learning Locker con Node 24:** las imágenes comunitarias pueden traer su propia versión de Node interna (Learning Locker es un proyecto aparte del middleware) — no debería haber conflicto, pero se confirma al levantar el compose por primera vez.

## 9. Gestión de secretos

`.env` local + `.env.example` en el repo — estándar, simple, suficiente para un proyecto de una sola persona. Sin gestor externo (Doppler/Vault) por ahora; se puede migrar después si el proyecto crece.

## 10. Repositorio y control de versiones

- Visibilidad: **privado** por ahora.
- Falta definir la convención exacta de cuenta/organización de GitHub — pendiente, ver sección 11.
- CI: **GitHub Actions desde el inicio** — workflow mínimo de lint + test en cada push, ubicado en `.github/workflows/`.

## 11. Pendientes antes de generar el scaffold

- Confirmar bajo qué cuenta/organización de GitHub se crea el repo privado `curso-adaptativo-ia`.
- Decidir si Moodle lanza el curso vía SCORM o LTI (sección 8) — puedo proponer SCORM como default razonable si no tienes preferencia, y lo ajustamos si en la práctica no captura bien los statements.

---

Cuando confirmes estos dos pendientes, genero el scaffold completo: carpetas, `docker-compose.yml`, `package.json` del middleware, `.env.example`, `README.md` y el workflow de CI.
