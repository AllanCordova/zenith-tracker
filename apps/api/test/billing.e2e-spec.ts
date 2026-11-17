import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { configureApp } from './../src/common/configure-app';
import { createDb } from './../src/prisma/db';

const db = createDb(process.env.DATABASE_URL ?? '');

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
    await db.orm.public.Order.where({ id: order.id }).delete();
  }
  await db.orm.public.User.where({ email }).delete();
}

async function countPendingOrders(): Promise<number> {
  return (await db.orm.public.Order.where({ status: 'PENDING' }).all()).length;
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
      await deleteUserByEmail(email);
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

  async function registerStudent(suffix: string) {
    const storedEmail = `aluno.billing.${suffix}@example.com`;
    createdEmails.push(storedEmail);

    const registered = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Ana Aluna',
        email: storedEmail,
        password: 'Senha123',
        role: 'STUDENT',
      })
      .expect(201);

    return {
      email: storedEmail,
      accessToken: registered.body.data.accessToken as string,
      userId: registered.body.data.user.id as string,
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

  it('POST /billing/orders with ACTIVE MONTHLY + YEARLY creates PENDING yearly; Subscription stays ACTIVE', async () => {
    const trainer = await registerTrainer(`${Date.now()}-ca3`);

    const activatingOrder = await db.orm.public.Order.create({
      trainerId: trainer.trainerId,
      planCode: 'MONTHLY',
      amountCents: 4990,
      status: 'PAID',
    });

    // TODO #26 — quem cria Assinatura pelo pagamento é a #26
    const subscription = await db.orm.public.Subscription.create({
      trainerId: trainer.trainerId,
      orderId: activatingOrder.id,
      planCode: 'MONTHLY',
      status: 'ACTIVE',
      activatedAt: Temporal.Now.instant(),
    });

    const response = await request(app.getHttpServer())
      .post('/billing/orders')
      .set('Authorization', `Bearer ${trainer.accessToken}`)
      .send({ planCode: 'YEARLY' });

    expect(response.status).toBe(201);
    expect(response.body.statusCode).toBe(201);
    expect(response.body.data).toEqual({
      id: expect.any(String),
      trainerId: trainer.trainerId,
      planCode: 'YEARLY',
      amountCents: 39900,
      status: 'PENDING',
      createdAt: expect.any(String),
    });

    const pending = await db.orm.public.Order.first({
      id: response.body.data.id,
    });
    expect(pending).not.toBeNull();
    expect(pending!.planCode).toBe('YEARLY');
    expect(pending!.amountCents).toBe(39900);
    expect(pending!.status).toBe('PENDING');

    const subscriptionAfter = await db.orm.public.Subscription.first({
      id: subscription.id,
    });
    expect(subscriptionAfter).not.toBeNull();
    expect(subscriptionAfter!.status).toBe('ACTIVE');
    expect(subscriptionAfter!.planCode).toBe('MONTHLY');
  });

  it('POST /billing/orders twice reuses PENDING and updates planCode/amountCents', async () => {
    const trainer = await registerTrainer(`${Date.now()}-ca4`);

    const first = await request(app.getHttpServer())
      .post('/billing/orders')
      .set('Authorization', `Bearer ${trainer.accessToken}`)
      .send({ planCode: 'MONTHLY' });

    expect(first.status).toBe(201);
    expect(first.body.data).toEqual({
      id: expect.any(String),
      trainerId: trainer.trainerId,
      planCode: 'MONTHLY',
      amountCents: 4990,
      status: 'PENDING',
      createdAt: expect.any(String),
    });

    const second = await request(app.getHttpServer())
      .post('/billing/orders')
      .set('Authorization', `Bearer ${trainer.accessToken}`)
      .send({ planCode: 'YEARLY' });

    expect(second.status).toBe(201);
    expect(second.body.data).toEqual({
      id: first.body.data.id,
      trainerId: trainer.trainerId,
      planCode: 'YEARLY',
      amountCents: 39900,
      status: 'PENDING',
      createdAt: expect.any(String),
    });

    const pendingOrders = await db.orm.public.Order.where({
      trainerId: trainer.trainerId,
      status: 'PENDING',
    }).all();
    expect(pendingOrders).toHaveLength(1);
    expect(pendingOrders[0]!.id).toBe(first.body.data.id);
    expect(pendingOrders[0]!.planCode).toBe('YEARLY');
    expect(pendingOrders[0]!.amountCents).toBe(39900);
  });

  it('billing routes without Bearer return 401 and create no Order', async () => {
    const pendingBefore = await countPendingOrders();

    const postOrders = await request(app.getHttpServer())
      .post('/billing/orders')
      .send({ planCode: 'MONTHLY' });
    const getPlans = await request(app.getHttpServer()).get('/billing/plans');
    const getCurrent = await request(app.getHttpServer()).get(
      '/billing/orders/current',
    );
    const getCheckout = await request(app.getHttpServer()).get(
      '/billing/checkout-config',
    );

    expect(postOrders.status).toBe(401);
    expect(getPlans.status).toBe(401);
    expect(getCurrent.status).toBe(401);
    expect(getCheckout.status).toBe(401);

    expect(postOrders.body).not.toHaveProperty('data');
    expect(getPlans.body).not.toHaveProperty('data');
    expect(getCurrent.body).not.toHaveProperty('data');
    expect(getCheckout.body).not.toHaveProperty('data');

    expect(await countPendingOrders()).toBe(pendingBefore);
  });

  it('billing routes with STUDENT JWT return 403 and create no Order', async () => {
    const student = await registerStudent(`${Date.now()}-ca7`);
    const pendingBefore = await countPendingOrders();

    const postOrders = await request(app.getHttpServer())
      .post('/billing/orders')
      .set('Authorization', `Bearer ${student.accessToken}`)
      .send({ planCode: 'MONTHLY' });
    const getPlans = await request(app.getHttpServer())
      .get('/billing/plans')
      .set('Authorization', `Bearer ${student.accessToken}`);
    const getCurrent = await request(app.getHttpServer())
      .get('/billing/orders/current')
      .set('Authorization', `Bearer ${student.accessToken}`);
    const getCheckout = await request(app.getHttpServer())
      .get('/billing/checkout-config')
      .set('Authorization', `Bearer ${student.accessToken}`);

    expect(postOrders.status).toBe(403);
    expect(getPlans.status).toBe(403);
    expect(getCurrent.status).toBe(403);
    expect(getCheckout.status).toBe(403);

    expect(postOrders.body).toEqual({
      statusCode: 403,
      message: expect.any(String),
      error: expect.any(String),
    });
    expect(postOrders.body).not.toHaveProperty('data');
    expect(getPlans.body).not.toHaveProperty('data');
    expect(getCurrent.body).not.toHaveProperty('data');
    expect(getCheckout.body).not.toHaveProperty('data');

    const ordersForStudent = await db.orm.public.Order.where({
      trainerId: student.userId,
    }).all();
    expect(ordersForStudent).toHaveLength(0);
    expect(await countPendingOrders()).toBe(pendingBefore);
  });
});
