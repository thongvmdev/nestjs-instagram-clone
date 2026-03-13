import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const testUser = {
    username: `e2e_test_${Date.now()}`,
    password: 'testpassword123',
  };

  let accessToken: string;

  it('POST /auth/signup — creates a new user', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/signup')
      .send(testUser)
      .expect(201);

    const body = res.body as {
      access_token: string;
      user: { username: string };
    };
    expect(body).toHaveProperty('access_token');
    expect(body.user.username).toBe(testUser.username);
    accessToken = body.access_token;
  });

  it('POST /auth/signup — rejects duplicate username', async () => {
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send(testUser)
      .expect(400);
  });

  it('POST /auth/signup — rejects invalid data', async () => {
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ username: 'ab', password: '123' })
      .expect(400);
  });

  it('POST /auth/signin — signs in with valid credentials', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/signin')
      .send(testUser)
      .expect(201);

    const body = res.body as { access_token: string };
    expect(body).toHaveProperty('access_token');
    accessToken = body.access_token;
  });

  it('POST /auth/signin — rejects wrong password', async () => {
    await request(app.getHttpServer())
      .post('/auth/signin')
      .send({ username: testUser.username, password: 'wrongpassword' })
      .expect(401);
  });

  it('GET /auth/me — returns current user with valid token', async () => {
    const res = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const body = res.body as { username: string };
    expect(body.username).toBe(testUser.username);
    expect(body).not.toHaveProperty('password');
  });

  it('GET /auth/me — rejects without token', async () => {
    await request(app.getHttpServer()).get('/auth/me').expect(401);
  });

  it('GET /auth/me — rejects with invalid token', async () => {
    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
  });
});
