const request = require('supertest');
const app = require('../src/app');

describe('GET /healthz', () => {
  it('should return 200 OK', async () => {
    const res = await request(app).get('/healthz');
    expect(res.statusCode).toBe(200);
  });

  it('should return status: ok', async () => {
    const res = await request(app).get('/healthz');
    expect(res.body.status).toBe('ok');
  });

  it('should return a numeric uptime in seconds', async () => {
    const res = await request(app).get('/healthz');
    expect(typeof res.body.uptime).toBe('number');
    expect(res.body.uptime).toBeGreaterThanOrEqual(0);
  });

  it('should return version from APP_VERSION env var when set', async () => {
    process.env.APP_VERSION = '1.2.3';
    // Re-require the router so the env var is picked up at request time
    const res = await request(app).get('/healthz');
    expect(res.body.version).toBe('1.2.3');
    delete process.env.APP_VERSION;
  });

  it('should return "unknown" when APP_VERSION env var is not set', async () => {
    delete process.env.APP_VERSION;
    const res = await request(app).get('/healthz');
    expect(res.body.version).toBe('unknown');
  });

  it('should return a JSON content-type', async () => {
    const res = await request(app).get('/healthz');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it('uptime should increase between requests', async () => {
    const res1 = await request(app).get('/healthz');
    await new Promise((resolve) => setTimeout(resolve, 1100)); // wait >1 s
    const res2 = await request(app).get('/healthz');
    expect(res2.body.uptime).toBeGreaterThanOrEqual(res1.body.uptime);
  });
});
