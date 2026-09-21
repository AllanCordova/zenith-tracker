import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth.guard';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

@Controller('trainer')
export class TrainerAreaController {
  @Get('area')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TRAINER')
  area(): Record<string, never> {
    return {};
  }
}
