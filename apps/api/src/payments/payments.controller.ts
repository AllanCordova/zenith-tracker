import {
  Body,
  Controller,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorEnvelopeDto } from '../common/http-envelope.dto';
import { JwtAuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import type { PublicUser } from '../auth/auth.service';
import { ChargeOrderDto } from './dto/charge-order.dto';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@Controller('billing/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('TRAINER')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ type: ErrorEnvelopeDto })
@ApiForbiddenResponse({ type: ErrorEnvelopeDto })
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post(':orderId/charge')
  @ApiOperation({
    summary: 'Cobra o token do cartão no gateway sem marcar o Pedido como pago.',
  })
  @ApiCreatedResponse({ description: 'Payment criado; Pedido permanece PENDING.' })
  charge(
    @Req() req: { user: PublicUser },
    @Param('orderId') orderId: string,
    @Body() dto: ChargeOrderDto,
  ) {
    return this.paymentsService.chargeOrder(req.user.id, orderId, dto.token);
  }
}
