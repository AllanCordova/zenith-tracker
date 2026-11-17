import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ enum: ['MONTHLY', 'YEARLY'], example: 'MONTHLY' })
  @IsIn(['MONTHLY', 'YEARLY'])
  planCode!: 'MONTHLY' | 'YEARLY';
}
