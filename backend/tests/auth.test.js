const request = require('supertest');
const app = require('../src/server');
const db = require('../src/config/database');

describe('Auth API', () => {
  beforeAll(async () => {
    // Setup test database if needed
  });

  afterAll(async () => {
    await db.end();
  });

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
});