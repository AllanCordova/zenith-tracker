import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import * as bcrypt from 'bcrypt';
import { AppModule } from './../src/app.module';
import { configureApp } from './../src/common/configure-app';
import { db } from './../src/prisma/db';

async function deleteUserByEmail(email: string): Promise<void> {
  await db.orm.public.User.where({ email }).delete();
}

describe('Auth register (e2e)', () => {
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

  it('POST /auth/register as STUDENT returns accessToken and user without passwordHash', async () => {
    const suffix = `${Date.now()}`;
    const storedEmail = `aluno.ca1.${suffix}@example.com`;
    createdEmails.push(storedEmail);

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Ana Aluna',
        email: `Aluno.CA1.${suffix}@Example.COM`,
        password: 'Senha123',
        role: 'STUDENT',
      });

    expect(response.status).toBe(201);
    expect(response.body.statusCode).toBe(201);
    expect(response.body.data.accessToken).toEqual(expect.any(String));
    expect(response.body.data.user).toEqual({
      id: expect.any(String),
      name: 'Ana Aluna',
      email: storedEmail,
      role: 'STUDENT',
    });
    expect(response.body.data.user.passwordHash).toBeUndefined();
    expect(JSON.stringify(response.body)).not.toMatch(/passwordHash/);

    const row = await db.orm.public.User.first({ email: storedEmail });
    expect(row).not.toBeNull();
    expect(row!.email).toBe(storedEmail);
    expect(row!.passwordHash).not.toBe('Senha123');
    expect(await bcrypt.compare('Senha123', row!.passwordHash)).toBe(true);

    const me = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${response.body.data.accessToken}`)
      .expect(200);

    expect(me.body.data.name).toBe('Ana Aluna');
    expect(JSON.stringify(me.body)).not.toMatch(/passwordHash/);
  });

  it('POST /auth/register as TRAINER returns accessToken and user without passwordHash', async () => {
    const suffix = `${Date.now()}-t`;
    const storedEmail = `treinador.ca1.${suffix}@example.com`;
    createdEmails.push(storedEmail);

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Téo Treinador',
        email: `Treinador.CA1.${suffix}@Example.COM`,
        password: 'Senha123',
        role: 'TRAINER',
      });

    expect(response.status).toBe(201);
    expect(response.body.data.accessToken).toEqual(expect.any(String));
    expect(response.body.data.user).toEqual({
      id: expect.any(String),
      name: 'Téo Treinador',
      email: storedEmail,
      role: 'TRAINER',
    });
    expect(response.body.data.user.passwordHash).toBeUndefined();

    const row = await db.orm.public.User.first({ email: storedEmail });
    expect(row).not.toBeNull();
    expect(row!.passwordHash).not.toBe('Senha123');
    expect(await bcrypt.compare('Senha123', row!.passwordHash)).toBe(true);

    const me = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${response.body.data.accessToken}`)
      .expect(200);

    expect(me.body.data.name).toBe('Téo Treinador');
  });
});
