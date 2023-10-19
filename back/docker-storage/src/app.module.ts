import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {ConfigModule} from '@nestjs/config';
import {TypeOrmModule} from '@nestjs/typeorm';
import {SecretSantaEntity} from './database/entities/secretsanta.entity';
import {UserEntity} from './database/entities/user.entity';
import {DatabaseModule} from './database/database.module';
import {ScheduleModule} from "@nestjs/schedule";
import {MailerModule} from "@nestjs-modules/mailer";
import {HandlebarsAdapter} from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import * as process from "process";

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    DatabaseModule,
    TypeOrmModule.forFeature([UserEntity, SecretSantaEntity]),
    ScheduleModule.forRoot(),
    MailerModule.forRoot({
      transport:
          {
            host: process.env.EMAIL_SMTP,
            port: process.env.EMAIL_PORT, // The port for SMTP
            secure: true, // Set to true if you're using a secure connection (e.g., for Gmail)
            auth: {
              user: process.env.EMAIL_ADDRESS,
              pass: process.env.EMAIL_PASSWORD,
            },
          },
      template: {
        dir: __dirname + '/templates',
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        }
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
}
