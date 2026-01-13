const request = require('supertest');
const app = require('../src/server');

let token;
let createdUser;

beforeAll(async () => {
  const r = await request(app).post('/api/auth/register').send({ username: 'admin', password: 'pwd12345' });
  token = r.body.data.token;
});

afterAll(async () => {
  if (global.__dbEnd) await global.__dbEnd();
});

describe('Users API', () => {
  test('GET /api/users - list users (protected)', async () => {
    const res = await request(app).get('/api/users').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBeTruthy();
  });

  test('POST /api/users - create user (protected)', async () => {
    const res = await request(app).post('/api/users').set('Authorization', `Bearer ${token}`).send({ username: 'newuser', password: 'pwd123' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    createdUser = res.body.data;
  });

  test('GET /api/users/:id - get user by id', async () => {
    const res = await request(app).get(`/api/users/${createdUser.id}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
  });

  test('PUT /api/users/:id - update user', async () => {
    const res = await request(app).put(`/api/users/${createdUser.id}`).set('Authorization', `Bearer ${token}`).send({ username: 'updateduser' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('DELETE /api/users/:id - deactivate user', async () => {
    const res = await request(app).delete(`/api/users/${createdUser.id}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});