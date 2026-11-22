import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';

export class WebhookPaymentDataDto {
  @ApiProperty({ example: '1234567890' })
  @IsString()
  @IsNotEmpty()
  id!: string;
}

export class WebhookNotificationDto {
  @ApiProperty({ type: WebhookPaymentDataDto })
  @ValidateNested()
  @Type(() => WebhookPaymentDataDto)
  data!: WebhookPaymentDataDto;

  @ApiProperty({ example: 'approved' })
  @IsString()
  @IsNotEmpty()
  status!: string;
}
