import {Body, Controller, Get, Post} from '@nestjs/common';
import {AppService, NewSecretSanta} from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('/create')
  create(@Body() data: NewSecretSanta) {
    return this.appService.create(data);
  }
}
