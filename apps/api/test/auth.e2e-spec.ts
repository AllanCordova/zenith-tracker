import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import * as bcrypt from 'bcrypt';
import { AppModule } from './../src/app.module';
import { configureApp } from './../src/common/configure-app';
import { createDb } from './../src/prisma/db';

const db = createDb(process.env.DATABASE_URL ?? '');

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

  it('POST /auth/register with the same email in another capitalization does not create another user', async () => {
    const suffix = `${Date.now()}-dup`;
    const storedEmail = `duplicado.ca2.${suffix}@example.com`;
    createdEmails.push(storedEmail);

    const first = await request(app.getHttpServer()).post('/auth/register').send({
      name: 'Primeira Conta',
      email: storedEmail,
      password: 'Senha123',
      role: 'STUDENT',
    });

    expect(first.status).toBe(201);

    const second = await request(app.getHttpServer()).post('/auth/register').send({
      name: 'Segunda Tentativa',
      email: `Duplicado.CA2.${suffix}@Example.COM`,
      password: 'OutraSenha1',
      role: 'TRAINER',
    });

    expect(second.status).toBe(409);
    expect(second.body).toEqual({
      statusCode: 409,
      message: expect.any(String),
      error: expect.any(String),
    });
    expect(String(second.body.message).toLowerCase()).toMatch(/e-mail já existe/);
    expect(second.body).not.toHaveProperty('data');
    expect(second.body).not.toHaveProperty('accessToken');

    const rows = await db.orm.public.User.where({ email: storedEmail }).all();
    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe('Primeira Conta');
    expect(rows[0].role).toBe('STUDENT');
  });

  it('POST /auth/login with the right password returns accessToken and user without passwordHash', async () => {
    const suffix = `${Date.now()}-login`;
    const storedEmail = `login.ca3.${suffix}@example.com`;
    createdEmails.push(storedEmail);

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Lia Login',
        email: storedEmail,
        password: 'Senha123',
        role: 'STUDENT',
      })
      .expect(201);

    const response = await request(app.getHttpServer()).post('/auth/login').send({
      email: `Login.CA3.${suffix}@Example.COM`,
      password: 'Senha123',
    });

    expect(response.status).toBe(201);
    expect(response.body.statusCode).toBe(201);
    expect(response.body.data.accessToken).toEqual(expect.any(String));
    expect(response.body.data.user).toEqual({
      id: expect.any(String),
      name: 'Lia Login',
      email: storedEmail,
      role: 'STUDENT',
    });
    expect(response.body.data.user.passwordHash).toBeUndefined();
    expect(JSON.stringify(response.body)).not.toMatch(/passwordHash/);
  });

  it('POST /auth/login with unknown email or wrong password returns 401 with the same combination message', async () => {
    const suffix = `${Date.now()}-login-fail`;
    const storedEmail = `login.fail.ca3.${suffix}@example.com`;
    createdEmails.push(storedEmail);

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Conta Existente',
        email: storedEmail,
        password: 'Senha123',
        role: 'TRAINER',
      })
      .expect(201);

    const unknownEmail = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: `ausente.ca3.${suffix}@example.com`,
        password: 'Senha123',
      });

    const wrongPassword = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: storedEmail,
        password: 'SenhaErrada1',
      });

    expect(unknownEmail.status).toBe(401);
    expect(wrongPassword.status).toBe(401);
    expect(unknownEmail.body).toEqual({
      statusCode: 401,
      message: expect.any(String),
      error: expect.any(String),
    });
    expect(wrongPassword.body).toEqual(unknownEmail.body);
    expect(String(unknownEmail.body.message).toLowerCase()).toMatch(
      /combinação não confere/,
    );
    expect(String(unknownEmail.body.message).toLowerCase()).not.toMatch(
      /e-mail|senha|password|user/,
    );
    expect(unknownEmail.body).not.toHaveProperty('data');
    expect(unknownEmail.body).not.toHaveProperty('accessToken');
    expect(JSON.stringify(unknownEmail.body)).not.toMatch(/passwordHash/);
    expect(JSON.stringify(wrongPassword.body)).not.toMatch(/passwordHash/);
  });

  it('GET /auth/me and area routes without Bearer return 401', async () => {
    const me = await request(app.getHttpServer()).get('/auth/me');
    const studentArea = await request(app.getHttpServer()).get('/student/area');
    const trainerArea = await request(app.getHttpServer()).get('/trainer/area');

    expect(me.status).toBe(401);
    expect(studentArea.status).toBe(401);
    expect(trainerArea.status).toBe(401);
    expect(me.body).not.toHaveProperty('data');
    expect(studentArea.body).not.toHaveProperty('data');
    expect(trainerArea.body).not.toHaveProperty('data');
    expect(JSON.stringify(me.body)).not.toMatch(/passwordHash|carteira|plano/);
    expect(JSON.stringify(studentArea.body)).not.toMatch(/passwordHash|carteira|plano/);
    expect(JSON.stringify(trainerArea.body)).not.toMatch(/passwordHash|carteira|plano/);
  });

  it('GET /trainer/area with STUDENT JWT returns 403 without resource body', async () => {
    const suffix = `${Date.now()}-ca4`;
    const storedEmail = `aluno.ca4.${suffix}@example.com`;
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

    const response = await request(app.getHttpServer())
      .get('/trainer/area')
      .set('Authorization', `Bearer ${registered.body.data.accessToken}`);

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      statusCode: 403,
      message: expect.any(String),
      error: expect.any(String),
    });
    expect(response.body).not.toHaveProperty('data');
    expect(JSON.stringify(response.body)).not.toMatch(/passwordHash|carteira|plano/);
  });

  it('GET /student/area with TRAINER JWT returns 403 without resource body', async () => {
    const suffix = `${Date.now()}-ca5`;
    const storedEmail = `treinador.ca5.${suffix}@example.com`;
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

    const response = await request(app.getHttpServer())
      .get('/student/area')
      .set('Authorization', `Bearer ${registered.body.data.accessToken}`);

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      statusCode: 403,
      message: expect.any(String),
      error: expect.any(String),
    });
    expect(response.body).not.toHaveProperty('data');
    expect(JSON.stringify(response.body)).not.toMatch(/passwordHash|carteira|plano/);
  });

  it('POST /auth/register with invalid password or payload returns 400 and does not create User', async () => {
    const suffix = `${Date.now()}-ca9`;
    const cases: Array<{ title: string; email: string; body: Record<string, unknown> }> = [
      {
        title: 'senha curta',
        email: `curta.ca9.${suffix}@example.com`,
        body: {
          name: 'Ana Aluna',
          email: `curta.ca9.${suffix}@example.com`,
          password: 'Abcdef1',
          role: 'STUDENT',
        },
      },
      {
        title: 'senha sem letra',
        email: `semletra.ca9.${suffix}@example.com`,
        body: {
          name: 'Ana Aluna',
          email: `semletra.ca9.${suffix}@example.com`,
          password: '12345678',
          role: 'STUDENT',
        },
      },
      {
        title: 'senha sem dígito',
        email: `semdigito.ca9.${suffix}@example.com`,
        body: {
          name: 'Ana Aluna',
          email: `semdigito.ca9.${suffix}@example.com`,
          password: 'Abcdefgh',
          role: 'STUDENT',
        },
      },
      {
        title: 'nome vazio',
        email: `nomevazio.ca10.${suffix}@example.com`,
        body: {
          name: '',
          email: `nomevazio.ca10.${suffix}@example.com`,
          password: 'Senha123',
          role: 'STUDENT',
        },
      },
      {
        title: 'e-mail sem formato',
        email: 'nao-e-email',
        body: {
          name: 'Ana Aluna',
          email: 'nao-e-email',
          password: 'Senha123',
          role: 'STUDENT',
        },
      },
      {
        title: 'role ausente',
        email: `sempapel.ca10.${suffix}@example.com`,
        body: {
          name: 'Ana Aluna',
          email: `sempapel.ca10.${suffix}@example.com`,
          password: 'Senha123',
        },
      },
      {
        title: 'role inválido',
        email: `papelinvalido.ca10.${suffix}@example.com`,
        body: {
          name: 'Ana Aluna',
          email: `papelinvalido.ca10.${suffix}@example.com`,
          password: 'Senha123',
          role: 'ADMIN',
        },
      },
      {
        title: 'campo extra',
        email: `extra.ca10.${suffix}@example.com`,
        body: {
          name: 'Ana Aluna',
          email: `extra.ca10.${suffix}@example.com`,
          password: 'Senha123',
          role: 'STUDENT',
          extra: true,
        },
      },
    ];

    for (const testCase of cases) {
      createdEmails.push(testCase.email.toLowerCase());

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testCase.body);

      expect({ title: testCase.title, status: response.status }).toEqual({
        title: testCase.title,
        status: 400,
      });
      expect(response.body).toEqual({
        statusCode: 400,
        message: expect.anything(),
        error: expect.any(String),
      });
      expect(response.body).not.toHaveProperty('data');
      expect(response.body).not.toHaveProperty('accessToken');
      expect(JSON.stringify(response.body)).not.toMatch(/stack/i);
      expect(JSON.stringify(response.body)).not.toContain(String(testCase.body.password));

      const row = await db.orm.public.User.first({
        email: testCase.email.toLowerCase(),
      });
      expect(row).toBeNull();
    }
  });
});
