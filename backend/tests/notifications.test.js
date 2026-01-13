const request = require('supertest');
const app = require('../src/server');

let authToken;
let userId;

beforeAll(async () => {
  const r = await request(app).post('/api/auth/register').send({ username: 'notifyuser', password: 'pwd12345' });
  authToken = r.body.data.token;
  userId = r.body.data.id;
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

  test('GET /api/notifications/count - returns count and reflects new notifications', async () => {
    const before = await request(app).get('/api/notifications/count').set('Authorization', `Bearer ${authToken}`);
    expect(before.status).toBe(200);
    expect(before.body.success).toBe(true);
    expect(typeof before.body.data.count).toBe('number');

    const createRes = await request(app)
      .post('/api/notifications')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ user_id: userId, mensagem_id: 0, acao: 'NOTIFICACAO', detalhes: 'Test count' });

    expect(createRes.status).toBe(201);

    const after = await request(app).get('/api/notifications/count').set('Authorization', `Bearer ${authToken}`);
    expect(after.status).toBe(200);
    expect(after.body.success).toBe(true);
    expect(typeof after.body.data.count).toBe('number');
    expect(after.body.data.count).toBeGreaterThanOrEqual(before.body.data.count);
  });

  test('DELETE /api/notifications/:id - delete notification', async () => {
    // create a notification
    const createRes = await request(app)
      .post('/api/notifications')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ user_id: userId, mensagem_id: 0, acao: 'NOTIFICACAO', detalhes: 'To delete' });

    expect(createRes.status).toBe(201);

    // fetch notifications and delete the newest
    const list = await request(app).get('/api/notifications').set('Authorization', `Bearer ${authToken}`);
    expect(list.status).toBe(200);
    const idToDelete = list.body.data && list.body.data[0] && list.body.data[0].id;
    expect(idToDelete).toBeTruthy();

    const del = await request(app).delete(`/api/notifications/${idToDelete}`).set('Authorization', `Bearer ${authToken}`);
    expect(del.status).toBe(200);
    expect(del.body.success).toBe(true);

    // ensure it's removed
    const list2 = await request(app).get('/api/notifications').set('Authorization', `Bearer ${authToken}`);
    const ids = (list2.body.data || []).map(n => n.id);
    expect(ids).not.toContain(idToDelete);
  });
});