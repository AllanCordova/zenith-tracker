import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  AuthSessionEnvelopeDto,
  ErrorEnvelopeDto,
  PublicUserEnvelopeDto,
} from '../common/http-envelope.dto';
import { AuthService, type PublicUser } from './auth.service';
import { JwtAuthGuard } from './auth.guard';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Cria a conta e devolve a sessão.' })
  @ApiCreatedResponse({ type: AuthSessionEnvelopeDto })
  @ApiBadRequestResponse({ type: ErrorEnvelopeDto })
  @ApiConflictResponse({ type: ErrorEnvelopeDto })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Entra com e-mail e senha.' })
  @ApiCreatedResponse({ type: AuthSessionEnvelopeDto })
  @ApiBadRequestResponse({ type: ErrorEnvelopeDto })
  @ApiUnauthorizedResponse({ type: ErrorEnvelopeDto })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Devolve a pessoa autenticada.' })
  @ApiOkResponse({ type: PublicUserEnvelopeDto })
  @ApiUnauthorizedResponse({ type: ErrorEnvelopeDto })
  me(@Req() req: { user: PublicUser & { passwordHash: string } }): PublicUser {
    return this.authService.toPublicUser(req.user);
  }
}
