import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Ana Aluna' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ format: 'email', example: 'ana@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({
    format: 'password',
    minLength: 8,
    description: 'Mínimo de 8 caracteres, com ao menos uma letra e um dígito.',
  })
  @IsString()
  @MinLength(8)
  @Matches(/[A-Za-z]/)
  @Matches(/\d/)
  password!: string;

  @ApiProperty({ enum: ['STUDENT', 'TRAINER'], example: 'STUDENT' })
  @IsIn(['STUDENT', 'TRAINER'])
  role!: 'STUDENT' | 'TRAINER';
}
