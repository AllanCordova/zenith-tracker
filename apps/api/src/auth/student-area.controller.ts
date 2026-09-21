import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth.guard';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

@Controller('student')
export class StudentAreaController {
  @Get('area')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  area(): Record<string, never> {
    return {};
  }
}
