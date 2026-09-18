import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { ProbeWriteDto } from './common/probe-write.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('probe')
  probeWrite(@Body() body: ProbeWriteDto): ProbeWriteDto {
    return body;
  }
}
