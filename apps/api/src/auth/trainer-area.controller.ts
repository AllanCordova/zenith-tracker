import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  EmptyDataEnvelopeDto,
  ErrorEnvelopeDto,
} from '../common/http-envelope.dto';
import { JwtAuthGuard } from './auth.guard';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

@ApiTags('trainer')
@Controller('trainer')
export class TrainerAreaController {
  @Get('area')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TRAINER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Área do treinador. Exige papel TRAINER.' })
  @ApiOkResponse({ type: EmptyDataEnvelopeDto })
  @ApiUnauthorizedResponse({ type: ErrorEnvelopeDto })
  @ApiForbiddenResponse({ type: ErrorEnvelopeDto })
  area(): Record<string, never> {
    return {};
  }
}
