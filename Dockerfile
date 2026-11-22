# Build
FROM node:24-alpine3.22 AS builder
WORKDIR /app
RUN		mkdir -p data

COPY svelte/package.json svelte/package-lock.json ./
RUN npm ci
COPY svelte .
RUN mkdir -p /app/data && npm run build

# Run
FROM node:24-alpine3.22
WORKDIR /app

COPY --from=builder /app/build ./build
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/migrate.js ./migrate.js
COPY svelte/package.json svelte/package-lock.json ./
RUN npm ci --omit=dev && mkdir -p /app/data

VOLUME ["/app/data"]
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- --tries=1 --spider http://127.0.0.1:3000/api/v1/health || exit 1

CMD ["sh", "-c", "npm run db:migrate && node /app/build/index.js"]
