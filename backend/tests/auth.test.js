const request = require('supertest');
const app = require('../src/server');
const db = require('../config/database');

let authToken;

afterAll(async () => {
  if (global.__dbEnd) await global.__dbEnd();
});

describe('Auth API', () => {
  test('POST /api/auth/register - should register new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        password: 'testpass123'
      });
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('token');
    authToken = response.body.data.token;
  });

  test('POST /api/auth/login - should login user', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testuser',
        password: 'testpass123'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('token');
  });

  test('Protected route with token should return profile (empty)', async () => {
    const res = await request(app).get('/api/profiles/me').set('Authorization', `Bearer ${authToken}`);
    expect([200, 404]).toContain(res.status);
  });
});