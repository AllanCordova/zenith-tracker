import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService, type PublicUser } from './auth.service';
import { JwtAuthGuard } from './auth.guard';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: { user: PublicUser & { passwordHash: string } }): PublicUser {
    return this.authService.toPublicUser(req.user);
  }
}
