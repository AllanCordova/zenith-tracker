import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorEnvelopeDto } from '../common/http-envelope.dto';
import { JwtAuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import type { PublicUser } from '../auth/auth.service';
import { BillingService } from './billing.service';
import { CreateOrderDto } from './dto/create-order.dto';

@ApiTags('billing')
@Controller('billing')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('TRAINER')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ type: ErrorEnvelopeDto })
@ApiForbiddenResponse({ type: ErrorEnvelopeDto })
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('plans')
  @ApiOperation({ summary: 'Catálogo de planos com preços do servidor.' })
  @ApiOkResponse({ description: 'Lista de planos.' })
  listPlans() {
    return this.billingService.listPlans();
  }

  @Post('orders')
  @ApiOperation({ summary: 'Cria Pedido PENDING com valor do catálogo.' })
  @ApiCreatedResponse({ description: 'Pedido PENDING criado.' })
  createOrder(
    @Req() req: { user: PublicUser },
    @Body() dto: CreateOrderDto,
  ) {
    return this.billingService.createPendingOrder(req.user.id, dto.planCode);
  }

  @Get('orders/current')
  @ApiOperation({ summary: 'Devolve o Pedido PENDING atual do treinador.' })
  @ApiOkResponse({ description: 'Pedido PENDING atual.' })
  async currentOrder(@Req() req: { user: PublicUser }) {
    const order = await this.billingService.findCurrentPendingOrder(
      req.user.id,
    );
    if (!order) {
      throw new NotFoundException('Nenhum Pedido Pendente');
    }
    return order;
  }

  @Get('checkout-config')
  @ApiOperation({
    summary: 'Public key do Mercado Pago para o formulário do treinador.',
  })
  @ApiOkResponse({ description: 'Configuração pública do checkout.' })
  checkoutConfig() {
    return this.billingService.checkoutConfig();
  }
}
