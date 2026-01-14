const request = require('supertest');
const app = require('../src/server');

let authToken;
let locId;

beforeAll(async () => {
  const r = await request(app).post('/api/auth/register').send({ username: 'locuser', password: 'pwd12345' });
  authToken = r.body.data.token;
});

afterAll(async () => {
  if (global.__dbEnd) await global.__dbEnd();
});

describe('Locations API', () => {
  test('POST /api/locations - create GPS location', async () => {
    const res = await request(app)
      .post('/api/locations')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        nome: 'Test Park',
        descricao: 'Parque de testes',
        tipo: 'GPS',
        coordenadas: { latitude: 41.1579, longitude: -8.6291, raio_metros: 500 }
      });

    expect([200,201]).toContain(res.status);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    locId = res.body.data.id;
  });

<<<<<<< HEAD
  test('PUT /api/locations/:id - update location', async () => {
    const res = await request(app)
      .put(`/api/locations/${locId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ nome: 'Updated Park', coordenadas: { latitude: 41.1580, longitude: -8.6290, raio_metros: 250 } });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const getRes = await request(app).get(`/api/locations/${locId}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.data.nome).toBe('Updated Park');
    expect(getRes.body.data.coordenadas).toHaveProperty('latitude');
  });

=======
>>>>>>> origin/main
  test('GET /api/locations/:id - get location and coordinates', async () => {
    const res = await request(app).get(`/api/locations/${locId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('coordenadas');
    expect(res.body.data.coordenadas).toHaveProperty('latitude');
  });

  test('POST /api/locations/nearby - find nearby by coords', async () => {
    const res = await request(app)
      .post('/api/locations/nearby')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ latitude: 41.1579, longitude: -8.6291 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBeTruthy();
  });

  test('DELETE /api/locations/:id - delete location', async () => {
    const res = await request(app).delete(`/api/locations/${locId}`).set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const getRes = await request(app).get(`/api/locations/${locId}`);
    expect(getRes.status).toBe(404);
  });
});
