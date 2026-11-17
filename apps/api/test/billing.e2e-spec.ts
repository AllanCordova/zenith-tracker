import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { configureApp } from './../src/common/configure-app';
import { createDb } from './../src/prisma/db';

const db = createDb(process.env.DATABASE_URL ?? '');

async function deleteTrainerByEmail(email: string): Promise<void> {
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
    await db.orm.public.Order.where({ id: order.id }).delete();
  }
  await db.orm.public.User.where({ email }).delete();
}

describe('Billing orders (e2e)', () => {
  let app: INestApplication<App>;
  const createdEmails: string[] = [];

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterEach(async () => {
    for (const email of createdEmails.splice(0)) {
      await deleteTrainerByEmail(email);
    }
    await app.close();
  });

  afterAll(async () => {
    await db.close();
  });

  async function registerTrainer(suffix: string) {
    const storedEmail = `treinador.billing.${suffix}@example.com`;
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

  it('POST /billing/orders with TRAINER without subscription creates PENDING with catalog amountCents', async () => {
    const trainer = await registerTrainer(`${Date.now()}-ca1`);

    const monthly = await request(app.getHttpServer())
      .post('/billing/orders')
      .set('Authorization', `Bearer ${trainer.accessToken}`)
      .send({ planCode: 'MONTHLY' });

    expect(monthly.status).toBe(201);
    expect(monthly.body.statusCode).toBe(201);
    expect(monthly.body.data).toEqual({
      id: expect.any(String),
      trainerId: trainer.trainerId,
      planCode: 'MONTHLY',
      amountCents: 4990,
      status: 'PENDING',
      createdAt: expect.any(String),
    });

    const row = await db.orm.public.Order.first({ id: monthly.body.data.id });
    expect(row).not.toBeNull();
    expect(row!.planCode).toBe('MONTHLY');
    expect(row!.amountCents).toBe(4990);
    expect(row!.status).toBe('PENDING');
    expect(row!.trainerId).toBe(trainer.trainerId);

    await db.orm.public.Order.where({ id: monthly.body.data.id }).delete();

    const yearly = await request(app.getHttpServer())
      .post('/billing/orders')
      .set('Authorization', `Bearer ${trainer.accessToken}`)
      .send({ planCode: 'YEARLY' });

    expect(yearly.status).toBe(201);
    expect(yearly.body.data).toEqual({
      id: expect.any(String),
      trainerId: trainer.trainerId,
      planCode: 'YEARLY',
      amountCents: 39900,
      status: 'PENDING',
      createdAt: expect.any(String),
    });

    const yearlyRow = await db.orm.public.Order.first({ id: yearly.body.data.id });
    expect(yearlyRow).not.toBeNull();
    expect(yearlyRow!.amountCents).toBe(39900);
    expect(yearlyRow!.status).toBe('PENDING');
  });

  it('GET /billing/checkout-config returns PAGAMENTO_PUBLIC_KEY for TRAINER', async () => {
    const trainer = await registerTrainer(`${Date.now()}-config`);

    const response = await request(app.getHttpServer())
      .get('/billing/checkout-config')
      .set('Authorization', `Bearer ${trainer.accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.statusCode).toBe(200);
    expect(response.body.data).toEqual({
      publicKey: process.env.PAGAMENTO_PUBLIC_KEY,
    });
    expect(response.body.data.publicKey).toEqual(expect.any(String));
    expect(response.body.data.publicKey.length).toBeGreaterThan(0);
  });

  it('POST /billing/orders with ACTIVE subscription on same planCode does not create Order', async () => {
    const trainer = await registerTrainer(`${Date.now()}-ca2`);

    const activatingOrder = await db.orm.public.Order.create({
      trainerId: trainer.trainerId,
      planCode: 'MONTHLY',
      amountCents: 4990,
      status: 'PAID',
    });

    // TODO #26 — quem cria Assinatura pelo pagamento é a #26
    await db.orm.public.Subscription.create({
      trainerId: trainer.trainerId,
      orderId: activatingOrder.id,
      planCode: 'MONTHLY',
      status: 'ACTIVE',
      activatedAt: Temporal.Now.instant(),
    });

    const pendingBefore = await db.orm.public.Order.create({
      trainerId: trainer.trainerId,
      planCode: 'YEARLY',
      amountCents: 39900,
      status: 'PENDING',
    });

    const ordersBefore = await db.orm.public.Order.where({
      trainerId: trainer.trainerId,
    }).all();

    const response = await request(app.getHttpServer())
      .post('/billing/orders')
      .set('Authorization', `Bearer ${trainer.accessToken}`)
      .send({ planCode: 'MONTHLY' });

    expect(response.status).toBe(409);
    expect(response.body.statusCode).toBe(409);
    expect(response.body.message).toMatch(/já está ativa/i);

    const ordersAfter = await db.orm.public.Order.where({
      trainerId: trainer.trainerId,
    }).all();
    expect(ordersAfter).toHaveLength(ordersBefore.length);

    const pendingAfter = await db.orm.public.Order.first({
      id: pendingBefore.id,
    });
    expect(pendingAfter).not.toBeNull();
    expect(pendingAfter!.planCode).toBe('YEARLY');
    expect(pendingAfter!.amountCents).toBe(39900);
    expect(pendingAfter!.status).toBe('PENDING');
  });
});
