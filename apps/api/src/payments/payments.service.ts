import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service';
import { PaymentsGateway } from './payments.gateway';
import { verifyPagamentoWebhookSignature } from './webhook-signature';

export type PaymentResponse = {
  id: string;
  orderId: string;
  gatewayPaymentId: string;
  status: string;
  receivedAt: string;
};

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: PaymentsGateway,
    private readonly config: ConfigService,
  ) {}

  async chargeOrder(
    trainerId: string,
    orderId: string,
    token: string,
  ): Promise<PaymentResponse> {
    const order = await this.prisma.db.orm.public.Order.first({
      id: orderId,
      trainerId,
      status: 'PENDING',
    });
    if (!order) {
      throw new NotFoundException('Pedido Pendente não encontrado');
    }

    const idempotencyKey = `order-${orderId}-charge`;
    const charged = await this.gateway.charge({
      token,
      amountCents: order.amountCents,
      idempotencyKey,
    });

    const payment = await this.prisma.db.orm.public.Payment.create({
      orderId,
      gatewayPaymentId: charged.gatewayPaymentId,
      status: charged.status,
      receivedAt: Temporal.Now.instant(),
    });

    const receivedAt =
      typeof payment.receivedAt === 'string'
        ? payment.receivedAt
        : payment.receivedAt.toString();

    return {
      id: payment.id,
      orderId: payment.orderId,
      gatewayPaymentId: payment.gatewayPaymentId,
      status: payment.status,
      receivedAt,
    };
  }

  async handleWebhook(input: {
    xSignature: string | undefined;
    xRequestId: string | undefined;
    gatewayPaymentId: string;
    status: string;
  }): Promise<{ received: true }> {
    const secret = this.config.getOrThrow<string>('PAGAMENTO_WEBHOOK_SECRET');
    const valid = verifyPagamentoWebhookSignature({
      secret,
      xSignature: input.xSignature,
      xRequestId: input.xRequestId,
      dataId: input.gatewayPaymentId,
    });
    if (!valid) {
      throw new UnauthorizedException('Assinatura do webhook inválida');
    }

    if (input.status !== 'approved') {
      return { received: true };
    }

    const payment = await this.prisma.db.orm.public.Payment.first({
      gatewayPaymentId: input.gatewayPaymentId,
    });
    if (!payment) {
      throw new NotFoundException('Pagamento não encontrado');
    }

    const order = await this.prisma.db.orm.public.Order.first({
      id: payment.orderId,
      status: 'PENDING',
    });
    if (!order) {
      throw new NotFoundException('Pedido Pendente não encontrado');
    }

    await this.prisma.db.orm.public.Order.where({ id: order.id }).update({
      status: 'PAID',
    });

    const activeSubscriptions = await this.prisma.db.orm.public.Subscription.where(
      {
        trainerId: order.trainerId,
        status: 'ACTIVE',
      },
    ).all();
    for (const subscription of activeSubscriptions) {
      await this.prisma.db.orm.public.Subscription.where({
        id: subscription.id,
      }).update({ status: 'INACTIVE' });
    }

    await this.prisma.db.orm.public.Subscription.create({
      trainerId: order.trainerId,
      orderId: order.id,
      planCode: order.planCode,
      status: 'ACTIVE',
      activatedAt: Temporal.Now.instant(),
    });

    return { received: true };
  }
}
