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

  test('POST /api/notifications - create a notification (no mensagem_id)', async () => {
    const res = await request(app).post('/api/notifications').set('Authorization', `Bearer ${authToken}`).send({ detalhes: 'Teste criação' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
  });

  test('GET /api/notifications/count - returns number', async () => {
    const res = await request(app).get('/api/notifications/count').set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.data.count).toBe('number');
  });

  test('DELETE /api/notifications/:id - delete the first notification', async () => {
    const list = await request(app).get('/api/notifications').set('Authorization', `Bearer ${authToken}`);
    expect(list.status).toBe(200);
    const items = list.body.data;

    if (items.length === 0) return; // nothing to delete in rare cases

    const idToDelete = items[0].id;
    const res = await request(app).delete(`/api/notifications/${idToDelete}`).set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('PUT /api/notifications/:id/read - mark as read', async () => {
    const res = await request(app).put('/api/notifications/1/read').set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});