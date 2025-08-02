const request = require('supertest');
const app = require('./app');

describe('GET /', () => {
  it('should return 200 when not logged in', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
  });
});

describe('GET /login', () => {
  it('should return 200 when not logged in', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
  });
});