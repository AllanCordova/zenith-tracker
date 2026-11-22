import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ChargeOrderDto {
  @ApiProperty({ example: 'card-token-from-brick' })
  @IsString()
  @IsNotEmpty()
  token!: string;
}
