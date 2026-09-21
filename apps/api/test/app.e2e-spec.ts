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

  it('POST /probe with an extra body field returns 400 envelope without stack', async () => {
    const response = await request(app.getHttpServer())
      .post('/probe')
      .send({ name: 'ok', extra: true })
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
    expect(JSON.stringify(response.body)).not.toMatch(/password/i);
    expect(JSON.stringify(response.body)).not.toMatch(/token/i);
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
