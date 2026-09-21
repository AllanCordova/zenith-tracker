import { IsEmail, IsIn, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @Matches(/[A-Za-z]/)
  @Matches(/\d/)
  password!: string;

  @IsIn(['STUDENT', 'TRAINER'])
  role!: 'STUDENT' | 'TRAINER';
}
