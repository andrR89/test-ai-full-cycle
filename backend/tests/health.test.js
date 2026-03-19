const request = require('supertest');
const app = require('../src/app');

describe('GET /healthz', () => {
  afterAll(() => {
    // Clean up any open handles if needed
  });

  it('should return 200 OK', async () => {
    const res = await request(app).get('/healthz');
    expect(res.statusCode).toBe(200);
  });

  it('should return status: ok', async () => {
    const res = await request(app).get('/healthz');
    expect(res.body).toHaveProperty('status', 'ok');
  });

  it('should return uptime as a non-negative number', async () => {
    const res = await request(app).get('/healthz');
    expect(res.body).toHaveProperty('uptime');
    expect(typeof res.body.uptime).toBe('number');
    expect(res.body.uptime).toBeGreaterThanOrEqual(0);
  });

  it('should return version from APP_VERSION env variable', async () => {
    process.env.APP_VERSION = '1.2.3';
    // Re-require to pick up env change — use isolated module cache
    jest.resetModules();
    const freshApp = require('../src/app');
    const res = await request(freshApp).get('/healthz');
    expect(res.body).toHaveProperty('version', '1.2.3');
    delete process.env.APP_VERSION;
  });

  it('should return version as "unknown" when APP_VERSION is not set', async () => {
    delete process.env.APP_VERSION;
    jest.resetModules();
    const freshApp = require('../src/app');
    const res = await request(freshApp).get('/healthz');
    expect(res.body).toHaveProperty('version', 'unknown');
  });

  it('should return a JSON content-type', async () => {
    const res = await request(app).get('/healthz');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/unknown-route');
    expect(res.statusCode).toBe(404);
  });
});
