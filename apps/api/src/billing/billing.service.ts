import { ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service';
import {
  amountCentsFor,
  PLAN_CATALOG,
  type PlanCode,
} from './plan-catalog';

export type OrderRecord = {
  id: string;
  trainerId: string;
  planCode: PlanCode;
  amountCents: number;
  status: 'PENDING' | 'PAID' | 'REFUSED' | 'EXPIRED';
  createdAt: { toString(): string } | string;
};

export type OrderResponse = {
  id: string;
  trainerId: string;
  planCode: PlanCode;
  amountCents: number;
  status: 'PENDING' | 'PAID' | 'REFUSED' | 'EXPIRED';
  createdAt: string;
};

@Injectable()
export class BillingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  listPlans() {
    return (Object.keys(PLAN_CATALOG) as PlanCode[]).map((planCode) => ({
      planCode,
      amountCents: PLAN_CATALOG[planCode],
    }));
  }

  checkoutConfig() {
    return {
      publicKey: this.config.getOrThrow<string>('PAGAMENTO_PUBLIC_KEY'),
    };
  }

  async createPendingOrder(
    trainerId: string,
    planCode: PlanCode,
  ): Promise<OrderResponse> {
    const activeSamePlan = await this.prisma.db.orm.public.Subscription.first({
      trainerId,
      planCode,
      status: 'ACTIVE',
    });
    if (activeSamePlan) {
      throw new ConflictException('Assinatura já está ativa neste plano');
    }

    const amountCents = amountCentsFor(planCode);
    const order = await this.prisma.db.orm.public.Order.create({
      trainerId,
      planCode,
      amountCents,
      status: 'PENDING',
    });
    return this.toOrderResponse(order as OrderRecord);
  }

  async findCurrentPendingOrder(
    trainerId: string,
  ): Promise<OrderResponse | null> {
    const order = await this.prisma.db.orm.public.Order.first({
      trainerId,
      status: 'PENDING',
    });
    if (!order) {
      return null;
    }
    return this.toOrderResponse(order as OrderRecord);
  }

  private toOrderResponse(order: OrderRecord): OrderResponse {
    const createdAt =
      typeof order.createdAt === 'string'
        ? order.createdAt
        : order.createdAt.toString();
    return {
      id: order.id,
      trainerId: order.trainerId,
      planCode: order.planCode,
      amountCents: order.amountCents,
      status: order.status,
      createdAt,
    };
  }
}
