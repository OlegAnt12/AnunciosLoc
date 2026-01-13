const request = require('supertest');
const app = require('../src/server');

let token;
let deviceId;

afterAll(async () => {
  if (global.__dbEnd) await global.__dbEnd();
});

beforeAll(async () => {
  const r = await request(app).post('/api/auth/register').send({ username: 'devuser', password: 'pwd12345' });
  token = r.body.data.token;
});

describe('Devices API', () => {
  test('POST /api/devices - register device', async () => {
    const res = await request(app)
      .post('/api/devices')
      .set('Authorization', `Bearer ${token}`)
      .send({ device_id: 'dev-123', device_name: 'My Phone', tipo: 'PHONE', so_version: 'Android 12' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    deviceId = res.body.data.id;
  });

  test('GET /api/devices - list devices', async () => {
    const res = await request(app).get('/api/devices').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBeTruthy();
  });

  test('DELETE /api/devices/:id - remove device', async () => {
    if (!deviceId) return;
    const res = await request(app).delete(`/api/devices/${deviceId}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});