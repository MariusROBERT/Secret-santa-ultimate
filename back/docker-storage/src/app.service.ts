import {BadRequestException, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {UserEntity} from './database/entities/user.entity';
import {Repository} from 'typeorm';
import {SecretSantaEntity} from './database/entities/secretsanta.entity';
import {response} from 'express';

export interface NewSecretSanta {
  name: string,
  mailDate: string,
}

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(SecretSantaEntity)
    private secretSantaRepository: Repository<SecretSantaEntity>
  ) {
  }

  getHello(): string {
    return 'Hello World!';
  }

  generateCode() {
    const available = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += available.charAt(Math.floor(Math.random() * available.length));
    }
    return code;
  }

  async create(data: NewSecretSanta) {
    if (!data.name || data.name === '' || !data.mailDate || data.mailDate === '')
      throw new BadRequestException('Missing data')
    const newSecretSanta = await this.secretSantaRepository.create();
    newSecretSanta.name = data.name;
    newSecretSanta.mailDate = new Date(data.mailDate);

    let checkCode;
    let code;
    do {
      code = this.generateCode();
      checkCode = await this.secretSantaRepository
        .createQueryBuilder('secretsanta')
        .where('secretsanta.code = :code', {code: newSecretSanta.code})
        .getOne();
    } while (checkCode)

    newSecretSanta.code = code;
    try {
      await this.secretSantaRepository.save(newSecretSanta);
    } catch (e) {
      console.error(e);
      return response.status(501).send('Error while creating secret santa');
    }

    return {code};
  }
}
