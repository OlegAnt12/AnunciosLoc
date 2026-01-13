const request = require('supertest');
const app = require('../src/server');

let pubToken;
let recvToken;
let recvId;
let msgId;

beforeAll(async () => {
  const r1 = await request(app).post('/api/auth/register').send({ username: 'policyPub', password: 'pwd12345' });
  pubToken = r1.body.data.token;

  const r2 = await request(app).post('/api/auth/register').send({ username: 'policyRecv', password: 'pwd12345' });
  recvToken = r2.body.data.token;
  recvId = r2.body.data.id;

  // create a location
  await request(app)
    .post('/api/locations')
    .set('Authorization', `Bearer ${pubToken}`)
    .send({ nome: 'PolicyLoc', descricao: 'loc', tipo: 'GPS', coordenadas: { latitude: 41.1579, longitude: -8.6291, raio_metros: 100 } });

  // create a message with WHITELIST requiring city=Porto
  const res = await request(app)
    .post('/api/messages')
    .set('Authorization', `Bearer ${pubToken}`)
    .send({ title: 'Policy Message', body: 'Restricted', latitude: 41.1579, longitude: -8.6291, radius_m: 100, policy_type: 'WHITELIST', policy_rules: [{ key: 'city', value: 'Porto' }] });

  msgId = res.body.data.id;
});

afterAll(async () => {
  if (global.__dbEnd) await global.__dbEnd();
});

describe('Policy enforcement', () => {
  test('Receiver without profile cannot receive', async () => {
    const res = await request(app).post(`/api/messages/${msgId}/receive`).set('Authorization', `Bearer ${recvToken}`).send({ deviceId: 'dev-xyz' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('Add profile and then receiver can receive', async () => {
    // Add profile key city=Porto for receiver
    const res1 = await request(app).post('/api/profiles/key').set('Authorization', `Bearer ${recvToken}`).send({ key: 'city', value: 'Porto' });
    expect(res1.status).toBe(200);

    const res = await request(app).post(`/api/messages/${msgId}/receive`).set('Authorization', `Bearer ${recvToken}`).send({ deviceId: 'dev-xyz' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});