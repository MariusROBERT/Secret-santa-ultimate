FROM	node:latest

RUN		npm i -g @nestjs/cli

RUN mkdir /app
WORKDIR	/app

ENV NODE_ENV=production

COPY	docker-storage/package.json .
COPY	docker-storage/yarn.lock .
RUN		yarn install -ci
COPY	docker-storage .

RUN npx tsc

ENTRYPOINT ["nest", "start"]
