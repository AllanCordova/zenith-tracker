import { createHmac } from 'node:crypto';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { configureApp } from './../src/common/configure-app';
import { createDb } from './../src/prisma/db';

const db = createDb(process.env.DATABASE_URL ?? '');
const WEBHOOK_SECRET =
  process.env.PAGAMENTO_WEBHOOK_SECRET ?? 'e2e-only-webhook-secret';

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

function signWebhook(dataId: string, requestId: string, secret: string) {
  const ts = String(Date.now());
  const canonical = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const v1 = createHmac('sha256', secret).update(canonical).digest('hex');
  return {
    'x-signature': `ts=${ts},v1=${v1}`,
    'x-request-id': requestId,
  };
}

describe('Payments webhook (e2e)', () => {
  let app: INestApplication<App>;
  const createdEmails: string[] = [];

  beforeEach(async () => {
    process.env.PAGAMENTO_WEBHOOK_SECRET = WEBHOOK_SECRET;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

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
    const storedEmail = `treinador.webhook.${suffix}@example.com`;
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

  it('authenticated approved webhook marks Order PAID, activates Subscription, previous ACTIVE becomes INACTIVE (CA2)', async () => {
    const trainer = await registerTrainer(`${Date.now()}-ca2`);

    const previousOrder = await db.orm.public.Order.create({
      trainerId: trainer.trainerId,
      planCode: 'MONTHLY',
      amountCents: 4990,
      status: 'PAID',
    });
    const previousSubscription = await db.orm.public.Subscription.create({
      trainerId: trainer.trainerId,
      orderId: previousOrder.id,
      planCode: 'MONTHLY',
      status: 'ACTIVE',
      activatedAt: Temporal.Now.instant(),
    });

    const order = await db.orm.public.Order.create({
      trainerId: trainer.trainerId,
      planCode: 'YEARLY',
      amountCents: 39900,
      status: 'PENDING',
    });
    const gatewayPaymentId = `gw-approved-${Date.now()}`;
    await db.orm.public.Payment.create({
      orderId: order.id,
      gatewayPaymentId,
      status: 'pending',
      receivedAt: Temporal.Now.instant(),
    });

    const requestId = `req-${Date.now()}`;
    const headers = signWebhook(gatewayPaymentId, requestId, WEBHOOK_SECRET);

    const response = await request(app.getHttpServer())
      .post('/payments/webhook')
      .set(headers)
      .send({
        data: { id: gatewayPaymentId },
        status: 'approved',
      });

    expect(response.status).toBe(200);

    const orderAfter = await db.orm.public.Order.first({ id: order.id });
    expect(orderAfter).not.toBeNull();
    expect(orderAfter!.status).toBe('PAID');

    const previousAfter = await db.orm.public.Subscription.first({
      id: previousSubscription.id,
    });
    expect(previousAfter).not.toBeNull();
    expect(previousAfter!.status).toBe('INACTIVE');

    const active = await db.orm.public.Subscription.first({
      trainerId: trainer.trainerId,
      status: 'ACTIVE',
    });
    expect(active).not.toBeNull();
    expect(active!.orderId).toBe(order.id);
    expect(active!.planCode).toBe('YEARLY');
    expect(active!.id).not.toBe(previousSubscription.id);

    const current = await request(app.getHttpServer())
      .get('/billing/subscription/current')
      .set('Authorization', `Bearer ${trainer.accessToken}`);

    expect(current.status).toBe(200);
    expect(current.body.data).toEqual({
      id: active!.id,
      trainerId: trainer.trainerId,
      orderId: order.id,
      planCode: 'YEARLY',
      status: 'ACTIVE',
      activatedAt: expect.any(String),
    });
  });

  it('authenticated rejected webhook marks Order REFUSED without new ACTIVE Subscription; trainer can create new Order (CA5)', async () => {
    const trainer = await registerTrainer(`${Date.now()}-ca5-refused`);

    const order = await db.orm.public.Order.create({
      trainerId: trainer.trainerId,
      planCode: 'MONTHLY',
      amountCents: 4990,
      status: 'PENDING',
    });
    const gatewayPaymentId = `gw-rejected-${Date.now()}`;
    await db.orm.public.Payment.create({
      orderId: order.id,
      gatewayPaymentId,
      status: 'pending',
      receivedAt: Temporal.Now.instant(),
    });

    const requestId = `req-rejected-${Date.now()}`;
    const headers = signWebhook(gatewayPaymentId, requestId, WEBHOOK_SECRET);

    const response = await request(app.getHttpServer())
      .post('/payments/webhook')
      .set(headers)
      .send({
        data: { id: gatewayPaymentId },
        status: 'rejected',
      });

    expect(response.status).toBe(200);

    const orderAfter = await db.orm.public.Order.first({ id: order.id });
    expect(orderAfter).not.toBeNull();
    expect(orderAfter!.status).toBe('REFUSED');

    const active = await db.orm.public.Subscription.first({
      trainerId: trainer.trainerId,
      status: 'ACTIVE',
    });
    expect(active).toBeNull();

    const newOrder = await request(app.getHttpServer())
      .post('/billing/orders')
      .set('Authorization', `Bearer ${trainer.accessToken}`)
      .send({ planCode: 'MONTHLY' });

    expect(newOrder.status).toBe(201);
    expect(newOrder.body.data.status).toBe('PENDING');
    expect(newOrder.body.data.id).not.toBe(order.id);
  });

  it('authenticated expired webhook marks Order EXPIRED without new ACTIVE Subscription; trainer can create new Order (CA5)', async () => {
    const trainer = await registerTrainer(`${Date.now()}-ca5-expired`);

    const order = await db.orm.public.Order.create({
      trainerId: trainer.trainerId,
      planCode: 'YEARLY',
      amountCents: 39900,
      status: 'PENDING',
    });
    const gatewayPaymentId = `gw-expired-${Date.now()}`;
    await db.orm.public.Payment.create({
      orderId: order.id,
      gatewayPaymentId,
      status: 'pending',
      receivedAt: Temporal.Now.instant(),
    });

    const requestId = `req-expired-${Date.now()}`;
    const headers = signWebhook(gatewayPaymentId, requestId, WEBHOOK_SECRET);

    const response = await request(app.getHttpServer())
      .post('/payments/webhook')
      .set(headers)
      .send({
        data: { id: gatewayPaymentId },
        status: 'expired',
      });

    expect(response.status).toBe(200);

    const orderAfter = await db.orm.public.Order.first({ id: order.id });
    expect(orderAfter).not.toBeNull();
    expect(orderAfter!.status).toBe('EXPIRED');

    const active = await db.orm.public.Subscription.first({
      trainerId: trainer.trainerId,
      status: 'ACTIVE',
    });
    expect(active).toBeNull();

    const newOrder = await request(app.getHttpServer())
      .post('/billing/orders')
      .set('Authorization', `Bearer ${trainer.accessToken}`)
      .send({ planCode: 'YEARLY' });

    expect(newOrder.status).toBe(201);
    expect(newOrder.body.data.status).toBe('PENDING');
    expect(newOrder.body.data.id).not.toBe(order.id);
  });

  it('webhook with wrong or missing signature leaves Order and Subscription unchanged (CA6)', async () => {
    const trainer = await registerTrainer(`${Date.now()}-ca6`);

    const previousOrder = await db.orm.public.Order.create({
      trainerId: trainer.trainerId,
      planCode: 'MONTHLY',
      amountCents: 4990,
      status: 'PAID',
    });
    const previousSubscription = await db.orm.public.Subscription.create({
      trainerId: trainer.trainerId,
      orderId: previousOrder.id,
      planCode: 'MONTHLY',
      status: 'ACTIVE',
      activatedAt: Temporal.Now.instant(),
    });

    const order = await db.orm.public.Order.create({
      trainerId: trainer.trainerId,
      planCode: 'YEARLY',
      amountCents: 39900,
      status: 'PENDING',
    });
    const gatewayPaymentId = `gw-invalid-sig-${Date.now()}`;
    await db.orm.public.Payment.create({
      orderId: order.id,
      gatewayPaymentId,
      status: 'pending',
      receivedAt: Temporal.Now.instant(),
    });

    const wrongSecretHeaders = signWebhook(
      gatewayPaymentId,
      `req-wrong-${Date.now()}`,
      'definitely-wrong-secret',
    );

    const wrongSecretResponse = await request(app.getHttpServer())
      .post('/payments/webhook')
      .set(wrongSecretHeaders)
      .send({
        data: { id: gatewayPaymentId },
        status: 'approved',
      });

    expect(wrongSecretResponse.status).toBe(401);

    const missingSignatureResponse = await request(app.getHttpServer())
      .post('/payments/webhook')
      .send({
        data: { id: gatewayPaymentId },
        status: 'approved',
      });

    expect(missingSignatureResponse.status).toBe(401);

    const orderAfter = await db.orm.public.Order.first({ id: order.id });
    expect(orderAfter).not.toBeNull();
    expect(orderAfter!.status).toBe('PENDING');

    const previousAfter = await db.orm.public.Subscription.first({
      id: previousSubscription.id,
    });
    expect(previousAfter).not.toBeNull();
    expect(previousAfter!.status).toBe('ACTIVE');

    const subscriptionsForOrder = await db.orm.public.Subscription.where({
      orderId: order.id,
    }).all();
    expect(subscriptionsForOrder).toHaveLength(0);
  });

  it('repeated approved webhook for same payment is idempotent 2xx and does not alter Order/Subscription again (CA7)', async () => {
    const trainer = await registerTrainer(`${Date.now()}-ca7-repeat`);

    const order = await db.orm.public.Order.create({
      trainerId: trainer.trainerId,
      planCode: 'MONTHLY',
      amountCents: 4990,
      status: 'PENDING',
    });
    const gatewayPaymentId = `gw-idempotent-${Date.now()}`;
    await db.orm.public.Payment.create({
      orderId: order.id,
      gatewayPaymentId,
      status: 'pending',
      receivedAt: Temporal.Now.instant(),
    });

    const payload = {
      data: { id: gatewayPaymentId },
      status: 'approved',
    };

    const firstHeaders = signWebhook(
      gatewayPaymentId,
      `req-idem-1-${Date.now()}`,
      WEBHOOK_SECRET,
    );
    const first = await request(app.getHttpServer())
      .post('/payments/webhook')
      .set(firstHeaders)
      .send(payload);
    expect(first.status).toBe(200);

    const activeAfterFirst = await db.orm.public.Subscription.first({
      trainerId: trainer.trainerId,
      status: 'ACTIVE',
    });
    expect(activeAfterFirst).not.toBeNull();
    const subscriptionId = activeAfterFirst!.id;

    const secondHeaders = signWebhook(
      gatewayPaymentId,
      `req-idem-2-${Date.now()}`,
      WEBHOOK_SECRET,
    );
    const second = await request(app.getHttpServer())
      .post('/payments/webhook')
      .set(secondHeaders)
      .send(payload);

    expect(second.status).toBe(200);

    const orderAfter = await db.orm.public.Order.first({ id: order.id });
    expect(orderAfter).not.toBeNull();
    expect(orderAfter!.status).toBe('PAID');

    const activeAfterSecond = await db.orm.public.Subscription.where({
      trainerId: trainer.trainerId,
      status: 'ACTIVE',
    }).all();
    expect(activeAfterSecond).toHaveLength(1);
    expect(activeAfterSecond[0]!.id).toBe(subscriptionId);
    expect(activeAfterSecond[0]!.orderId).toBe(order.id);
  });

  it('webhook for terminal Order responds 2xx without changing Order or Subscription (CA7)', async () => {
    const trainer = await registerTrainer(`${Date.now()}-ca7-terminal`);

    const order = await db.orm.public.Order.create({
      trainerId: trainer.trainerId,
      planCode: 'YEARLY',
      amountCents: 39900,
      status: 'REFUSED',
    });
    const gatewayPaymentId = `gw-terminal-${Date.now()}`;
    await db.orm.public.Payment.create({
      orderId: order.id,
      gatewayPaymentId,
      status: 'rejected',
      receivedAt: Temporal.Now.instant(),
    });

    const headers = signWebhook(
      gatewayPaymentId,
      `req-terminal-${Date.now()}`,
      WEBHOOK_SECRET,
    );
    const response = await request(app.getHttpServer())
      .post('/payments/webhook')
      .set(headers)
      .send({
        data: { id: gatewayPaymentId },
        status: 'approved',
      });

    expect(response.status).toBe(200);

    const orderAfter = await db.orm.public.Order.first({ id: order.id });
    expect(orderAfter).not.toBeNull();
    expect(orderAfter!.status).toBe('REFUSED');

    const active = await db.orm.public.Subscription.first({
      trainerId: trainer.trainerId,
      status: 'ACTIVE',
    });
    expect(active).toBeNull();
  });
});
