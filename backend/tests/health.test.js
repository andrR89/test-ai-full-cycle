const request = require('supertest');
const app = require('../src/app');
const { START_TIME } = require('../src/routes/health');

describe('GET /healthz', () => {
  beforeAll(() => {
    // Ensure a clean env state before tests
    delete process.env.APP_VERSION;
  });

  afterAll(() => {
    delete process.env.APP_VERSION;
  });

  it('should return 200 OK', async () => {
    const res = await request(app).get('/healthz');
    expect(res.status).toBe(200);
  });

  it('should return status: ok', async () => {
    const res = await request(app).get('/healthz');
    expect(res.body.status).toBe('ok');
  });

  it('should return uptime as a non-negative integer', async () => {
    const res = await request(app).get('/healthz');
    expect(typeof res.body.uptime).toBe('number');
    expect(Number.isInteger(res.body.uptime)).toBe(true);
    expect(res.body.uptime).toBeGreaterThanOrEqual(0);
  });

  it('should return uptime that is consistent with START_TIME', async () => {
    const before = Math.floor((Date.now() - START_TIME) / 1000);
    const res = await request(app).get('/healthz');
    const after = Math.floor((Date.now() - START_TIME) / 1000);
    expect(res.body.uptime).toBeGreaterThanOrEqual(before);
    expect(res.body.uptime).toBeLessThanOrEqual(after + 1);
  });

  it('should return version as "unknown" when APP_VERSION is not set', async () => {
    delete process.env.APP_VERSION;
    const res = await request(app).get('/healthz');
    expect(res.body.version).toBe('unknown');
  });

  it('should return the version from the APP_VERSION environment variable', async () => {
    process.env.APP_VERSION = '1.2.3';
    const res = await request(app).get('/healthz');
    expect(res.body.version).toBe('1.2.3');
  });

  it('should return a JSON content-type', async () => {
    const res = await request(app).get('/healthz');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/unknown-route');
    expect(res.status).toBe(404);
  });
});
