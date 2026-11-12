import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { configureApp } from './../src/common/configure-app';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  const uiOrigin = 'http://localhost:3001';

  beforeEach(async () => {
    process.env.JWT_SECRET ??= 'e2e-only-jwt-secret';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  });

  it('/ (GET) wraps the payload in the success envelope', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect({ statusCode: 200, data: 'Hello World!' });
  });

  it('POST /auth/register with an extra body field returns 400 envelope without stack or password', async () => {
    const email = `extra.envelope.${Date.now()}@example.com`;
    const password = 'Senha123';

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Ana Aluna',
        email,
        password,
        role: 'STUDENT',
        extra: true,
      })
      .expect(400);

    expect(response.body).toEqual({
      statusCode: 400,
      message: expect.anything(),
      error: expect.any(String),
    });
    expect(Object.keys(response.body).sort()).toEqual(
      ['error', 'message', 'statusCode'].sort(),
    );
    expect(JSON.stringify(response.body)).not.toMatch(/stack/i);
    expect(JSON.stringify(response.body)).not.toContain(password);
    expect(JSON.stringify(response.body)).not.toMatch(/token/i);

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password });

    expect(login.status).toBe(401);
  });

  it('POST /probe is gone', async () => {
    const response = await request(app.getHttpServer())
      .post('/probe')
      .send({ name: 'ok' });

    expect(response.status).toBe(404);
  });

  it('OPTIONS /auth/register from the UI origin is not a 404 preflight and returns CORS', async () => {
    const response = await request(app.getHttpServer())
      .options('/auth/register')
      .set('Origin', uiOrigin)
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'content-type');

    expect(response.status).not.toBe(404);
    expect(response.text).not.toMatch(/Cannot OPTIONS/i);
    expect(response.headers['access-control-allow-origin']).toBe(uiOrigin);
  });

  it('sends security headers on success and on error', async () => {
    const ok = await request(app.getHttpServer()).get('/').expect(200);

    expect(ok.headers['x-content-type-options']).toBe('nosniff');
    expect(ok.headers['x-frame-options']).toBe('DENY');
    expect(ok.headers['referrer-policy']).toBe('no-referrer');
    expect(ok.headers['permissions-policy']).toBe(
      'camera=(), microphone=(), geolocation=()',
    );

    const bad = await request(app.getHttpServer()).post('/auth/register').send({});

    expect(bad.status).toBe(400);
    expect(bad.headers['x-content-type-options']).toBe('nosniff');
    expect(bad.headers['x-frame-options']).toBe('DENY');
  });

  it('GET /docs publishes the story routes', async () => {
    const ui = await request(app.getHttpServer()).get('/docs').expect(200);

    expect(ui.headers['content-type']).toMatch(/html/);
    expect(ui.text).toMatch(/swagger/i);
    expect(ui.headers['x-content-type-options']).toBe('nosniff');

    const spec = await request(app.getHttpServer()).get('/docs-json').expect(200);

    expect(Object.keys(spec.body.paths as Record<string, unknown>)).toEqual(
      expect.arrayContaining([
        '/auth/register',
        '/auth/login',
        '/auth/me',
        '/student/area',
        '/trainer/area',
      ]),
    );
    const serialized = JSON.stringify(spec.body);
    expect(serialized).not.toMatch(/passwordHash/);
    expect(serialized).not.toMatch(/eyJ/);
  });

  it('POST /auth/register from the UI origin returns CORS', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .set('Origin', uiOrigin)
      .send({});

    expect(response.status).not.toBe(404);
    expect(response.headers['access-control-allow-origin']).toBe(uiOrigin);
  });

  afterEach(async () => {
    await app.close();
  });
});
