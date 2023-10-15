import {Body, Controller, Get, Param, Post} from '@nestjs/common';
import {AppService, NewSecretSanta, NewUser} from './app.service';

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

  @Get('/infos/:code')
  getInfos(@Param('code') code: string) {
    return this.appService.getInfos(code);
  }

  @Post('/addUser/:code')
  addUser(@Param('code') code: string, @Body() data: NewUser) {
    return this.appService.addUser(code, data);
  }
}
