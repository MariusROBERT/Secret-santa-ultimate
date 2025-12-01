#build
FROM	node:25-alpine3.22 AS builder
WORKDIR	/app
COPY	svelte/package.json .
COPY	svelte/package-lock.json .
RUN		npm install
COPY	svelte .
RUN		npm run build


# run
FROM	node:25-alpine3.22
WORKDIR	/app
COPY	--from=builder /app/build /app/build
COPY	--from=builder /app/node_modules /app/node_modules

ENTRYPOINT	["node", "build/index.js"]
