#build
FROM	node:latest as builder
WORKDIR	/app
COPY	docker-storage/package.json .
COPY	docker-storage/yarn.lock .
RUN		yarn install -ci
COPY	docker-storage .
RUN		yarn build

# nginx
FROM	nginx:latest
WORKDIR	/etc/nginx/html
RUN		rm -rf ./*
COPY	--from=builder /app/dist .
COPY	nginx/nginx.conf /etc/nginx/conf.d/default.conf

ENTRYPOINT	["nginx", "-g", "daemon off;"]
