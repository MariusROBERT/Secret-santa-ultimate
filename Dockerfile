# Build
FROM	node:25-alpine3.22 AS builder
WORKDIR	/app
COPY	svelte/package.json .
COPY	svelte/package-lock.json .
RUN		npm install
COPY	svelte .

RUN		mkdir -p /app/data
RUN		npm run db:generate
RUN		npm run db:migrate

RUN		npm run build


# Run
FROM	node:25-alpine3.22
WORKDIR	/app
COPY	--from=builder /app/build /app/build
COPY	--from=builder /app/node_modules /app/node_modules

RUN		mkdir -p /app/data
VOLUME ["/app/data"]
COPY	--from=builder /app/data/secretSantaUltimate.sql /app/data

ENTRYPOINT	["node", "build/index.js"]
