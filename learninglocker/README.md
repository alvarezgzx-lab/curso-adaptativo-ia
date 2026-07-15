# learninglocker/ — configuración del LRS

Learning Locker corre vía Docker (servicios `ll-mongo`, `ll-redis`, `ll-app` en
el `docker-compose.yml` de la raíz).

## Primer arranque

1. `docker-compose up ll-mongo ll-redis ll-app`
2. Entrar a `http://localhost:8081` y crear la organización + usuario admin
   (primer arranque de Learning Locker lo pide automáticamente).
3. Generar un **Client** (LRS credentials) desde el panel de Learning Locker →
   copiar `LRS_KEY` / `LRS_SECRET` al `.env` de la raíz.
4. Confirmar la URL exacta del endpoint de statements (`LRS_ENDPOINT`) — suele
   ser `http://localhost:8081/data/xAPI/`, pero se valida contra la versión de
   imagen que termines usando (ver `docs/riesgos.md`).
