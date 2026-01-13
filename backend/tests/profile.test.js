const request = require('supertest');
const app = require('../src/server');

let authToken;

beforeAll(async () => {
  // Register a user and get token
  const r = await request(app).post('/api/auth/register').send({ username: 'profileuser', password: 'pwd12345' });
  authToken = r.body.data.token;
});

afterAll(async () => {
  if (global.__dbEnd) await global.__dbEnd();
});

describe('Profiles API', () => {
  test('POST /api/profiles/key - add profile key', async () => {
    const res = await request(app)
      .post('/api/profiles/key')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ key: 'lang', value: 'pt' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('GET /api/profiles/me - contains the key', async () => {
    const res = await request(app)
      .get('/api/profiles/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('lang');
  });

  test('DELETE /api/profiles/key - remove key', async () => {
    const res = await request(app)
      .delete('/api/profiles/key')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ key: 'lang' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});