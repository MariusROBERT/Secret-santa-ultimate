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

export interface NewUser {
  name: string,
  mail: string,
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
      throw new BadRequestException('Missing data');
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
    } while (checkCode);

    newSecretSanta.code = code;
    try {
      await this.secretSantaRepository.save(newSecretSanta);
    } catch (e) {
      console.error(e);
      return response.status(501).send('Error while creating secret santa');
    }

    return {code};
  }

  getInfos(code: string) {
    if (!code || code === '')
      throw new BadRequestException('Missing code');
    return this.secretSantaRepository
        .createQueryBuilder('secretsanta')
        .leftJoinAndSelect('secretsanta.users', 'users')
        .where('secretsanta.code = :code', {code})
        .getOne();
  }

  async addUser(code: string, data: NewUser) {
    if (!code || code === '')
      throw new BadRequestException('Missing code');
    if (!data.name || data.name === '' || !data.mail || data.mail === '')
      throw new BadRequestException('Missing data');

    const secretSanta = await this.secretSantaRepository
        .createQueryBuilder('secretsanta')
        .where('secretsanta.code = :code', {code})
        .leftJoinAndSelect('secretsanta.users', 'users')
        .getOne();
    if (!secretSanta)
      throw new BadRequestException('Invalid code');

    if (secretSanta.users.find(user => user.mail === data.mail)
        || secretSanta.users.find(user => user.name === data.name))
      throw new BadRequestException('User already exists');

    const user = await this.userRepository.create();
    user.name = data.name;
    user.mail = data.mail;
    user.secretSanta = secretSanta;
    try {
      await this.userRepository.save(user);
    } catch (e) {
      console.error(e);
      return response.status(501).send('Error while creating user');
    }
    return {
      users: secretSanta.users.concat([user]),
    };
  }

  async addForbidden(code: string, data: { id: number, forbidden: number[] }) {
    if (!data.id || !data.forbidden || !code || code === '')
      throw new BadRequestException('Missing data');
    const secretSanta = await this.secretSantaRepository
        .createQueryBuilder('secretsanta')
        .where('secretsanta.code = :code', {code})
        .leftJoinAndSelect('secretsanta.users', 'users')
        .getOne();
    if (!secretSanta)
      throw new BadRequestException('Invalid code');
    const user = await this.userRepository
        .createQueryBuilder('user')
        .where('user.id = :id', {id: data.id})
        .getOne();
    if (!user)
      throw new BadRequestException('Invalid user');

    // Check if all forbidden users are in the secret santa
    for (const forbidden of data.forbidden) {
      if (!secretSanta.users.find(u => u.id === forbidden))
        throw new BadRequestException('Invalid forbidden user');
    }

    // Check if the user is in the secret santa
    if (!secretSanta.users.find(u => u.id === data.id))
      throw new BadRequestException('Invalid user');

    // Add forbidden users to the user forbidden list
    user.forbidden = data.forbidden;
    try {
      await this.userRepository.save(user);
    } catch (e) {
      console.error(e);
      return response.status(501).send('Error while adding forbidden users');
    }

    return {
      users: [
        ...secretSanta.users.filter((oldUser) => oldUser.id != user.id)
        , user],
    }
  }
}
