const request = require('supertest');
const app = require('../src/server');

let authToken;

beforeAll(async () => {
  const r = await request(app).post('/api/auth/register').send({ username: 'notifyuser', password: 'pwd12345' });
  authToken = r.body.data.token;
});

afterAll(async () => {
  if (global.__dbEnd) await global.__dbEnd();
});

describe('Notifications API', () => {
  test('GET /api/notifications - returns array', async () => {
    const res = await request(app).get('/api/notifications').set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBeTruthy();
  });

  test('PUT /api/notifications/:id/read - mark as read', async () => {
    const res = await request(app).put('/api/notifications/1/read').set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});