FROM node:24-alpine

WORKDIR /app

# better-sqlite3 compila un binding nativo — si no hay binario prebuilt para
# esta plataforma (musl/alpine), necesita toolchain de compilación. Si el
# build falla aquí, ver docs/riesgos.md ("better-sqlite3 en alpine").
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY src ./src
COPY scripts ./scripts
RUN mkdir -p /app/data

ENV NODE_ENV=production
EXPOSE 4000

CMD ["node", "src/index.js"]
