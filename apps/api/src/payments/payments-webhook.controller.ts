import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorEnvelopeDto } from '../common/http-envelope.dto';
import { WebhookNotificationDto } from './dto/webhook-notification.dto';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@Controller('payments')
export class PaymentsWebhookController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Recebe notificação autenticada do gateway e ativa Assinatura quando aprovado.',
  })
  @ApiOkResponse({ description: 'Notificação recebida.' })
  @ApiUnauthorizedResponse({ type: ErrorEnvelopeDto })
  webhook(
    @Headers('x-signature') xSignature: string | undefined,
    @Headers('x-request-id') xRequestId: string | undefined,
    @Body() dto: WebhookNotificationDto,
  ) {
    return this.paymentsService.handleWebhook({
      xSignature,
      xRequestId,
      gatewayPaymentId: dto.data.id,
      status: dto.status,
    });
  }
}
