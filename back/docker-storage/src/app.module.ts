import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import {TypeOrmModule} from '@nestjs/typeorm';
import {SecretSantaEntity} from './database/entities/secretsanta.entity';
import {UserEntity} from './database/entities/user.entity';
import {DatabaseModule} from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    TypeOrmModule.forFeature([UserEntity, SecretSantaEntity]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
