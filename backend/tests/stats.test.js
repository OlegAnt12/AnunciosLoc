const request = require('supertest');
const app = require('../src/server');

let token;

afterAll(async () => {
  if (global.__dbEnd) await global.__dbEnd();
});

beforeAll(async () => {
  const r = await request(app).post('/api/auth/register').send({ username: 'statsuser', password: 'pwd12345' });
  token = r.body.data.token;
});

describe('Stats API', () => {
  test('GET /api/stats - requires auth and returns counts', async () => {
    const res = await request(app).get('/api/stats').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('users');
    expect(res.body.data).toHaveProperty('locations');
  });
});