import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService, PublicUser } from './auth.service';
import { JwtAuthGuard } from './auth.guard';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: { user: PublicUser & { passwordHash: string } }): PublicUser {
    return this.authService.toPublicUser(req.user);
  }
}
