import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {UserEntity} from './database/entities/user.entity';
import {Repository} from 'typeorm';
import {SecretSantaEntity} from './database/entities/secretsanta.entity';
import {response} from 'express';
import {Cron} from "@nestjs/schedule";
import {solve} from "./utils/SecretSantaSolver";
import {MailerService} from "@nestjs-modules/mailer";
import * as process from "process";

export interface NewSecretSanta {
  name: string,
  mail_date: string,
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
      private secretSantaRepository: Repository<SecretSantaEntity>,
      private readonly mailerService: MailerService,
  ) {
  }

  //every day at 8am
  @Cron('0 0 8 * * *')
  async sendMails() {
    const todayDate = new Date();
    todayDate.setHours(22, 0, 0, 0);
    todayDate.setDate(todayDate.getDate() - 1);
    const tomorrowDate = new Date();
    tomorrowDate.setHours(22, 0, 0, 0);

    const today = await this.secretSantaRepository
        .createQueryBuilder('secretsanta')
        .where('secretsanta.mail_date >= :todayDate', {todayDate})
        .andWhere('secretsanta.mail_date < :tomorrowDate', {tomorrowDate})
        .leftJoinAndSelect('secretsanta.users', 'users')
        .getMany();
    if (today.length === 0) {
      // console.log('No secret santa', todayDate);
      return;
    }
    for (const secretSanta of today) {
      console.log(secretSanta.mail_date.toLocaleDateString(), secretSanta.name);
      const solution = solve(secretSanta);
      if (!solution) {
        console.error('No suitable solution for ', secretSanta.name, secretSanta.code);
        return;
      }

      const mailPromises = [];
      const backupPromises = [];
      console.log('start');
      for (const solutionElement of solution) {
        // console.log(solutionElement[0].id, '->', solutionElement[1].id)
        backupPromises.push(
            this.userRepository
                .createQueryBuilder()
                .update(UserEntity)
                .set({gift_to: solutionElement[1].id})
                .where('id = :id', {id: solutionElement[0].id})
                .execute()
        );
        mailPromises.push(this.sendMail(secretSanta, solutionElement[0], solutionElement[1]));
      }
      Promise.all(mailPromises).then(() => console.log('Mails sent for', secretSanta.name));
      Promise.all(backupPromises).then(() => console.log('Backup done for', secretSanta.name));
      Promise.all([...mailPromises, ...backupPromises]).then(() => console.log('All done for', secretSanta.name));
    }
  }

  async sendMail(secretSanta: SecretSantaEntity, to: UserEntity, giftee: UserEntity) {
    const html = `
      <html lang="en">
        <body>
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td style="background: linear-gradient(0deg, #9a0000, #f00); padding: 150px 0;" align="center" width="100%">
                <table>
                  <tr>
                    <td style="background-color: white; border-radius: 10px; padding: 50px;text-align: center;">
                      <h1 style="color: blue;">Hello ${to.name} 👋</h1>
                      <p>This year, for ${secretSanta.name}'s secret santa, you will gift ${giftee.name}<br/>
                      Good luck and have fun!</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>`;

    await this.mailerService.sendMail({
      to: to.mail,
      from: process.env.EMAIL_ADDRESS,
      subject: secretSanta.name + '\'s secret santa',
      html,
    }).then().catch((err) => {
      console.error(secretSanta.name, to.name, 'error:', err.response);
    });
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
    if (!data.name || data.name === '' || !data.mail_date || data.mail_date === '')
      throw new BadRequestException('Missing data');
    const newSecretSanta = this.secretSantaRepository.create();
    newSecretSanta.name = data.name;
    newSecretSanta.mail_date = new Date(data.mail_date);

    let checkCode: SecretSantaEntity;
    let code: string;
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

  async getInfos(code: string) {
    if (!code || code === '')
      throw new BadRequestException('Missing code');
    if (!/^[A-Z0-9]{6}$/.test(code))
      throw new NotFoundException('Invalid code');
    const secretSanta = await this.secretSantaRepository
        .createQueryBuilder('secretsanta')
        .leftJoinAndSelect('secretsanta.users', 'users')
        .where('secretsanta.code = :code', {code})
        .getOne();
    if (!secretSanta)
      throw new NotFoundException('Invalid code');
    return {...secretSanta, 
			users: secretSanta.users.map(({ gift_to, ...rest }) => rest)
		}
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
      users: secretSanta.users.concat([user]).map(({ gift_to, ...rest }) => rest),
    };
  }

  async delUser(code: string, data: { id: number }) {
    if (!data.id || !code || code === '')
      throw new BadRequestException('Missing data');

    const secretSanta = await this.secretSantaRepository
        .createQueryBuilder('secretsanta')
        .where('secretSanta.code = :code', {code})
        .leftJoinAndSelect('secretsanta.users', 'users')
        .getOne();
    if (!secretSanta)
      throw new BadRequestException('Invalid code');
    if (!secretSanta.users.find(user => user.id === data.id))
        throw new BadRequestException('User not in secret santa');

    await this.userRepository
        .createQueryBuilder('user')
        .delete()
        .where('"user"."id" = :id', {id: data.id})
        .execute();
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
        ...secretSanta.users.filter((oldUser) => oldUser.id != user.id).map(({ gift_to, ...rest }) => rest),
		(({ gift_to, ...rest }) => rest)(user)],
    }
  }

  editTitle(code: string, data: { name: string }) {
    if (!data.name || data.name === '' || !code || code === '')
      throw new BadRequestException('Missing data');
    return this.secretSantaRepository
        .createQueryBuilder('secretsanta')
        .update()
        .set({name: data.name})
        .where('secretsanta.code = :code', {code})
        .execute();
  }

  editDate(code: string, data: { date: string }) {
    if (!data.date || data.date === '' || !code || code === '')
      throw new BadRequestException('Missing data');
    return this.secretSantaRepository
        .createQueryBuilder('secretsanta')
        .update()
        .set({mail_date: new Date(data.date)})
        .where('secretsanta.code = :code', {code})
        .execute();
  }
}
