# Build
FROM	node:25-alpine3.22 AS builder
WORKDIR	/app
RUN		mkdir -p data

COPY	svelte/package.json .
COPY	svelte/package-lock.json .
RUN		npm install
COPY	svelte .
RUN		npm run build

RUN		npm run db:generate
RUN		npm run db:migrate


# Run
FROM	node:25-alpine3.22
WORKDIR	/app

COPY	--from=builder /app/build /app/build
COPY	svelte/package*.json /app
RUN		npm install --omit=dev

COPY	svelte/drizzle.config.js .

RUN		mkdir -p /app/data
VOLUME	["/app/data"]
COPY	--from=builder /app/data/secretSantaUltimate.sql app/data

HEALTHCHECK	--interval=30s --timeout=3s \
	CMD	wget -qO- --tries=1 --spider http://127.0.0.1:3000/api/v1/health || exit 1


CMD		["node", "/app/build/index.js"]
