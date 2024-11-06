import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import * as dotenv from 'dotenv';
import {frontURL} from './constants';
import * as fs from 'fs';
import * as process from 'process';
import {json} from 'express';
import {ValidationPipe} from '@nestjs/common';

dotenv.config();

const httpsOptions = fs.existsSync('./security/privkey.pem') ? {
  httpsOptions: {
    key: fs.readFileSync('./security/privkey.pem'),
    cert: fs.readFileSync('./security/fullchain.pem'),
  }
} : undefined;

const envVars = [
  'POSTGRES_HOST',
  'POSTGRES_PORT',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'POSTGRES_DB',
  'EMAIL_ADDRESS',
  'EMAIL_PASSWORD',
  'EMAIL_SMTP',
  'EMAIL_PORT',
];

let error = false;

for (const envVar of envVars) {
  if (!process.env[envVar]) {
    console.error(`${envVar} is not defined in .env file`);
    error = true;
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, httpsOptions);

  app.setGlobalPrefix('api/v1');

  app.enableCors({
    origin: [frontURL],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Permettre les cookies, si nécessaire
  });
  app.useGlobalPipes(
      new ValidationPipe({
        transform: true, // transforme elements en le type precisé (ex : mesQueryParams: GetPaginatedTodosDto)
        whitelist: true, // accepte seulement ce qu'on a demandé (evite les injections sql par exemple)
        forbidNonWhitelisted: true,
      }),
  );
  app.use(json({limit: '50mb'}));
  await app.listen(3001);
}

if (!error)
  bootstrap();
