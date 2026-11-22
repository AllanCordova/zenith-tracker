import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PaymentsGateway } from './payments.gateway';

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
}
