FROM	node:latest

RUN		npm i -g @nestjs/cli

WORKDIR	/app
COPY	script.sh /
RUN		chmod +x /script.sh
CMD		["/script.sh"]
