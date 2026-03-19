const request = require('supertest');
const app = require('../src/app');

describe('GET /healthz', () => {
  const ORIGINAL_APP_VERSION = process.env.APP_VERSION;

  afterEach(() => {
    // Restore original env after each test
    if (ORIGINAL_APP_VERSION === undefined) {
      delete process.env.APP_VERSION;
    } else {
      process.env.APP_VERSION = ORIGINAL_APP_VERSION;
    }
  });

  it('should return HTTP 200', async () => {
    const res = await request(app).get('/healthz');
    expect(res.statusCode).toBe(200);
  });

  it('should return status: ok', async () => {
    const res = await request(app).get('/healthz');
    expect(res.body).toHaveProperty('status', 'ok');
  });

  it('should return uptime as a non-negative integer in seconds', async () => {
    const res = await request(app).get('/healthz');
    expect(res.body).toHaveProperty('uptime');
    expect(typeof res.body.uptime).toBe('number');
    expect(res.body.uptime).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(res.body.uptime)).toBe(true);
  });

  it('should return uptime that increases between requests', async () => {
    // Wait 1100ms to guarantee at least 1 second of uptime has elapsed
    await new Promise((resolve) => setTimeout(resolve, 1100));
    const res = await request(app).get('/healthz');
    expect(res.body.uptime).toBeGreaterThanOrEqual(1);
  });

  it('should return version from APP_VERSION env variable when set', async () => {
    process.env.APP_VERSION = '2.3.1';
    // Re-require to pick up potentially fresh module, but since START_TIME is
    // module-level we just read version dynamically — no re-require needed.
    const res = await request(app).get('/healthz');
    expect(res.body).toHaveProperty('version', '2.3.1');
  });

  it('should return version "unknown" when APP_VERSION env variable is not set', async () => {
    delete process.env.APP_VERSION;
    const res = await request(app).get('/healthz');
    expect(res.body).toHaveProperty('version', 'unknown');
  });

  it('should return a JSON content-type header', async () => {
    const res = await request(app).get('/healthz');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it('response body should contain exactly status, uptime, and version keys', async () => {
    const res = await request(app).get('/healthz');
    const keys = Object.keys(res.body).sort();
    expect(keys).toEqual(['status', 'uptime', 'version']);
  });

  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/unknown-route');
    expect(res.statusCode).toBe(404);
  });
});
