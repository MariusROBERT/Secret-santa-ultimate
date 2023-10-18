import {Body, Controller, Get, Param, Patch, Post} from '@nestjs/common';
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

  @Post('/setForbidden/:code')
  addForbidden(@Param('code') code: string, @Body() data: { id: number, forbidden: number[] }) {
    return this.appService.addForbidden(code, data);
  }

  @Patch('editTitle/:code')
  changeName(@Param('code') code: string, @Body() data: { name: string }) {
    return this.appService.editTitle(code, data);
  }

  @Patch('editDate/:code')
    changeDate(@Param('code') code: string, @Body() data: { date: string }) {
      return this.appService.editDate(code, data);
  }
}
