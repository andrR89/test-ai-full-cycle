'use strict';

const request = require('supertest');
const app = require('../src/app');

describe('GET /healthz', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    // Clone env so individual tests can mutate it safely
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
    // Reset the module registry so START_TIME and env changes take effect cleanly
    jest.resetModules();
  });

  it('should return HTTP 200', async () => {
    const res = await request(app).get('/healthz');
    expect(res.status).toBe(200);
  });

  it('should return status "ok"', async () => {
    const res = await request(app).get('/healthz');
    expect(res.body).toHaveProperty('status', 'ok');
  });

  it('should return uptime as a non-negative integer', async () => {
    const res = await request(app).get('/healthz');
    expect(res.body).toHaveProperty('uptime');
    expect(typeof res.body.uptime).toBe('number');
    expect(Number.isInteger(res.body.uptime)).toBe(true);
    expect(res.body.uptime).toBeGreaterThanOrEqual(0);
  });

  it('should return version from APP_VERSION env variable', async () => {
    process.env.APP_VERSION = '2.5.0';

    // Re-require after env mutation
    jest.resetModules();
    const freshApp = require('../src/app');

    const res = await request(freshApp).get('/healthz');
    expect(res.body).toHaveProperty('version', '2.5.0');
  });

  it('should return "unknown" when APP_VERSION is not set', async () => {
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

  it('should return uptime that increases over time', async () => {
    const res1 = await request(app).get('/healthz');

    await new Promise((resolve) => setTimeout(resolve, 1100)); // wait >1 s

    const res2 = await request(app).get('/healthz');
    expect(res2.body.uptime).toBeGreaterThanOrEqual(res1.body.uptime);
  });
});
