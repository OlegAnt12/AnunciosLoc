const request = require('supertest');
const app = require('../src/server');

let token;
let sessionId;

afterAll(async () => {
  if (global.__dbEnd) await global.__dbEnd();
});

describe('Auth flow - refresh and logout', () => {
  test('register and login', async () => {
    const r = await request(app).post('/api/auth/register').send({ username: 'flowuser', password: 'pwd12345' });
    expect(r.status).toBe(201);
    token = r.body.data.token;

    const login = await request(app).post('/api/auth/login').send({ username: 'flowuser', password: 'pwd12345' });
    expect(login.status).toBe(200);
    expect(login.body.data).toHaveProperty('sessionId');
    sessionId = login.body.data.sessionId;
  });

  test('refresh token', async () => {
    const res = await request(app).post('/api/auth/refresh').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('token');
  });

  test('logout invalidates session', async () => {
    const res = await request(app).post('/api/auth/logout').set('Authorization', `Bearer ${token}`).send({ sessionId });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});