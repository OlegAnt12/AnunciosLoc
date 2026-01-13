const request = require('supertest');
const app = require('../src/server');

let authToken;
let receiverToken;

beforeAll(async () => {
  const r = await request(app).post('/api/auth/register').send({ username: 'msguser', password: 'pwd12345' });
  authToken = r.body.data.token;

  const r2 = await request(app).post('/api/auth/register').send({ username: 'receiver', password: 'pwd12345' });
  receiverToken = r2.body.data.token;
});

afterAll(async () => {
  if (global.__dbEnd) await global.__dbEnd();
});

describe('Messages API', () => {
  let msgId;

  test('POST /api/messages - create message', async () => {
    const res = await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Test message',
        body: 'Hello world',
        latitude: 41.1579,
        longitude: -8.6291,
        radius_m: 500
      });

    expect([200,201]).toContain(res.status);
    expect(res.body.success).toBe(true);
    msgId = res.body.data && res.body.data.id;
  });

  test('GET /api/messages - list user messages', async () => {
    const res = await request(app).get('/api/messages').set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBeTruthy();
  });

  test('POST /api/messages - fail without location or coords', async () => {
    const res = await request(app).post('/api/messages').set('Authorization', `Bearer ${authToken}`).send({ title: 'Bad', body: 'No location' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('Unauthorized user cannot delete someone else\'s message', async () => {
    // create a new message by auth user
    const resp = await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Protected', body: 'Author message', latitude: 41.1579, longitude: -8.6291, radius_m: 100 });

    const newMsgId = resp.body.data.id;

    // Attempt to delete by receiverToken (different user)
    const res = await request(app).delete(`/api/messages/${newMsgId}`).set('Authorization', `Bearer ${receiverToken}`);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/messages/:id/receive - receiver can receive message', async () => {
    if (!msgId) return;
    const res = await request(app)
      .post(`/api/messages/${msgId}/receive`)
      .set('Authorization', `Bearer ${receiverToken}`)
      .send({ deviceId: 'device-1' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
  });

  test('GET /api/messages/sent - list sent messages (author)', async () => {
    const res = await request(app).get('/api/messages/sent').set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('messages');
  });

  test('PUT /api/messages/:id - update message', async () => {
    if (!msgId) return;
    const res = await request(app)
      .put(`/api/messages/${msgId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ titulo: 'Updated title' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const getRes = await request(app).get(`/api/messages/${msgId}`).set('Authorization', `Bearer ${authToken}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.data.titulo).toBe('Updated title');
  });

  test('DELETE /api/messages/:id - delete message', async () => {
    if (!msgId) return;
    const res = await request(app).delete(`/api/messages/${msgId}`).set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
