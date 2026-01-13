const request = require('supertest');
const app = require('../src/server');

let token;
let userId;
let messageId;

beforeAll(async () => {
  const r = await request(app).post('/api/auth/register').send({ username: 'notifmaker', password: 'pwd12345' });
  token = r.body.data.token;
  userId = r.body.data.id;

  // create a test message to attach notification
  const m = await request(app)
    .post('/api/messages')
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Notif message', body: 'Hello', latitude: 41.1579, longitude: -8.6291, radius_m: 100 });

  messageId = m.body.data && m.body.data.id;
});

afterAll(async () => {
  if (global.__dbEnd) await global.__dbEnd();
});

describe('Notification create', () => {
  test('POST /api/notifications - create log entry', async () => {
    const res = await request(app)
      .post('/api/notifications')
      .set('Authorization', `Bearer ${token}`)
      .send({ user_id: userId, mensagem_id: messageId, acao: 'NOTIFICACAO', detalhes: 'Test' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});