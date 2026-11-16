import { ApiProperty } from '@nestjs/swagger';

export class ErrorEnvelopeDto {
  @ApiProperty({ example: 400 })
  statusCode!: number;

  @ApiProperty({
    oneOf: [
      { type: 'string', example: 'Dados inválidos' },
      { type: 'array', items: { type: 'string' } },
    ],
  })
  message!: string | string[];

  @ApiProperty({ example: 'Bad Request' })
  error!: string;
}

export class PublicUserDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Ana Aluna' })
  name!: string;

  @ApiProperty({ format: 'email', example: 'ana@example.com' })
  email!: string;

  @ApiProperty({ enum: ['STUDENT', 'TRAINER'], example: 'STUDENT' })
  role!: 'STUDENT' | 'TRAINER';
}

export class AuthSessionDto {
  @ApiProperty({ description: 'Credencial Bearer da sessão.' })
  accessToken!: string;

  @ApiProperty({ type: PublicUserDto })
  user!: PublicUserDto;
}

export class AuthSessionEnvelopeDto {
  @ApiProperty({ example: 201 })
  statusCode!: number;

  @ApiProperty({ type: AuthSessionDto })
  data!: AuthSessionDto;
}

export class PublicUserEnvelopeDto {
  @ApiProperty({ example: 200 })
  statusCode!: number;

  @ApiProperty({ type: PublicUserDto })
  data!: PublicUserDto;
}

export class EmptyDataEnvelopeDto {
  @ApiProperty({ example: 200 })
  statusCode!: number;

  @ApiProperty({ type: 'object', additionalProperties: false, example: {} })
  data!: Record<string, never>;
}

export class HelloEnvelopeDto {
  @ApiProperty({ example: 200 })
  statusCode!: number;

  @ApiProperty({ example: 'Hello World!' })
  data!: string;
}
