import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { configureApp } from './../src/common/configure-app';
import { createDb } from './../src/prisma/db';
import { PaymentsGateway } from './../src/payments/payments.gateway';

const db = createDb(process.env.DATABASE_URL ?? '');

type ChargeCall = {
  token: string;
  amountCents: number;
  idempotencyKey: string;
};

async function deleteUserByEmail(email: string): Promise<void> {
  const user = await db.orm.public.User.first({ email });
  if (!user) {
    return;
  }
  const subscriptions = await db.orm.public.Subscription.where({
    trainerId: user.id,
  }).all();
  for (const subscription of subscriptions) {
    await db.orm.public.Subscription.where({ id: subscription.id }).delete();
  }
  const orders = await db.orm.public.Order.where({
    trainerId: user.id,
  }).all();
  for (const order of orders) {
    const payments = await db.orm.public.Payment.where({
      orderId: order.id,
    }).all();
    for (const payment of payments) {
      await db.orm.public.Payment.where({ id: payment.id }).delete();
    }
    await db.orm.public.Order.where({ id: order.id }).delete();
  }
  await db.orm.public.User.where({ email }).delete();
}

describe('Payments charge (e2e)', () => {
  let app: INestApplication<App>;
  const createdEmails: string[] = [];
  const charges: ChargeCall[] = [];

  beforeEach(async () => {
    charges.splice(0);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PaymentsGateway)
      .useValue({
        charge: async (input: ChargeCall) => {
          charges.push(input);
          return {
            gatewayPaymentId: `stub-gw-${charges.length}`,
            status: 'pending',
          };
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterEach(async () => {
    for (const email of createdEmails.splice(0)) {
      await deleteUserByEmail(email);
    }
    await app.close();
  });

  afterAll(async () => {
    await db.close();
  });

  async function registerTrainer(suffix: string) {
    const storedEmail = `treinador.charge.${suffix}@example.com`;
    createdEmails.push(storedEmail);

    const registered = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Téo Treinador',
        email: storedEmail,
        password: 'Senha123',
        role: 'TRAINER',
      })
      .expect(201);

    return {
      email: storedEmail,
      accessToken: registered.body.data.accessToken as string,
      trainerId: registered.body.data.user.id as string,
    };
  }

  it('POST charge with token + PENDING Order creates Payment, Order stays PENDING, amount from DB (CA1)', async () => {
    const trainer = await registerTrainer(`${Date.now()}-ca1`);

    const order = await db.orm.public.Order.create({
      trainerId: trainer.trainerId,
      planCode: 'MONTHLY',
      amountCents: 4990,
      status: 'PENDING',
    });

    const response = await request(app.getHttpServer())
      .post(`/billing/orders/${order.id}/charge`)
      .set('Authorization', `Bearer ${trainer.accessToken}`)
      .send({ token: 'fake-card-token' });

    expect(response.status).toBe(201);
    expect(response.body.statusCode).toBe(201);
    expect(response.body.data).toEqual({
      id: expect.any(String),
      orderId: order.id,
      gatewayPaymentId: expect.any(String),
      status: expect.any(String),
      receivedAt: expect.any(String),
    });

    const payment = await db.orm.public.Payment.first({
      id: response.body.data.id,
    });
    expect(payment).not.toBeNull();
    expect(payment!.orderId).toBe(order.id);
    expect(payment!.gatewayPaymentId).toBe(response.body.data.gatewayPaymentId);

    const orderAfter = await db.orm.public.Order.first({ id: order.id });
    expect(orderAfter).not.toBeNull();
    expect(orderAfter!.status).toBe('PENDING');
    expect(orderAfter!.amountCents).toBe(4990);

    expect(charges).toHaveLength(1);
    expect(charges[0]).toEqual({
      token: 'fake-card-token',
      amountCents: 4990,
      idempotencyKey: expect.any(String),
    });
    expect(charges[0]!.idempotencyKey.length).toBeGreaterThan(0);
  });

  it('POST charge with price or amountCents in body returns 400 (CA8)', async () => {
    const trainer = await registerTrainer(`${Date.now()}-ca8`);

    const order = await db.orm.public.Order.create({
      trainerId: trainer.trainerId,
      planCode: 'MONTHLY',
      amountCents: 4990,
      status: 'PENDING',
    });

    const withAmountCents = await request(app.getHttpServer())
      .post(`/billing/orders/${order.id}/charge`)
      .set('Authorization', `Bearer ${trainer.accessToken}`)
      .send({ token: 'fake-card-token', amountCents: 1 });

    const withPrice = await request(app.getHttpServer())
      .post(`/billing/orders/${order.id}/charge`)
      .set('Authorization', `Bearer ${trainer.accessToken}`)
      .send({ token: 'fake-card-token', price: 1 });

    expect(withAmountCents.status).toBe(400);
    expect(withAmountCents.body.statusCode).toBe(400);
    expect(withAmountCents.body).not.toHaveProperty('data');

    expect(withPrice.status).toBe(400);
    expect(withPrice.body.statusCode).toBe(400);
    expect(withPrice.body).not.toHaveProperty('data');

    expect(charges).toHaveLength(0);

    const payments = await db.orm.public.Payment.where({
      orderId: order.id,
    }).all();
    expect(payments).toHaveLength(0);

    const orderAfter = await db.orm.public.Order.first({ id: order.id });
    expect(orderAfter).not.toBeNull();
    expect(orderAfter!.status).toBe('PENDING');
    expect(orderAfter!.amountCents).toBe(4990);
  });
});
