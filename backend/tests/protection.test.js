const request = require('supertest');
const app = require('../src/server');

describe('Protected routes should deny access without token', () => {
  test('GET /api/profiles/me without token', async () => {
    const res = await request(app).get('/api/profiles/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/devices without token', async () => {
    const res = await request(app).get('/api/devices');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});