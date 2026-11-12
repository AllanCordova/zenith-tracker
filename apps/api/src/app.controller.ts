import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HelloEnvelopeDto } from './common/http-envelope.dto';
import { AppService } from './app.service';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Resposta de vida da API.' })
  @ApiOkResponse({ type: HelloEnvelopeDto })
  getHello(): string {
    return this.appService.getHello();
  }
}
