const request = require('supertest');
const app = require('../src/server');

let token;
let muleToken;
let muleId;

beforeAll(async () => {
  const r = await request(app).post('/api/auth/register').send({ username: 'pub', password: 'pwd12345' });
  token = r.body.data.token;

  const m = await request(app).post('/api/auth/register').send({ username: 'mule1', password: 'pwd12345' });
  muleToken = m.body.data.token;
  muleId = m.body.data.id;

  // Add mule config for user
  const db = require('../config/database');
  await db.execute('INSERT INTO config_mulas (utilizador_id, espaco_maximo_mensagens, ativo) VALUES (?, ?, ?)', [muleId, 5, true]);
});

afterAll(async () => {
  if (global.__dbEnd) await global.__dbEnd();
});

describe('Mulas routing', () => {
  test('Message with DESCENTRALIZADO assigns mule', async () => {
    const res = await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Mule msg', body: 'Will route via mule', latitude: 41.1579, longitude: -8.6291, radius_m: 100, delivery_mode: 'DESCENTRALIZADO' });

    expect([200,201]).toContain(res.status);
    expect(res.body.success).toBe(true);
    const messageId = res.body.data.id;

    // Check mulas_mensagens entry
    const db = require('../config/database');
    const [rows] = await db.execute('SELECT * FROM mulas_mensagens WHERE mensagem_id = ?', [messageId]);
    expect(rows.length).toBeGreaterThan(0);
  });
});