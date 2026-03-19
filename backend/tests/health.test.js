const request = require('supertest');
const app = require('../src/app');
const { SERVER_START_TIME } = require('../src/routes/health');

describe('GET /healthz', () => {
  describe('when APP_VERSION is set', () => {
    const originalEnv = process.env.APP_VERSION;

    beforeAll(() => {
      process.env.APP_VERSION = '1.2.3';
    });

    afterAll(() => {
      if (originalEnv === undefined) {
        delete process.env.APP_VERSION;
      } else {
        process.env.APP_VERSION = originalEnv;
      }
    });

    it('should return HTTP 200', async () => {
      const res = await request(app).get('/healthz');
      expect(res.status).toBe(200);
    });

    it('should return status ok', async () => {
      const res = await request(app).get('/healthz');
      expect(res.body.status).toBe('ok');
    });

    it('should return version from APP_VERSION env var', async () => {
      const res = await request(app).get('/healthz');
      expect(res.body.version).toBe('1.2.3');
    });

    it('should return uptime as a non-negative integer', async () => {
      const res = await request(app).get('/healthz');
      expect(typeof res.body.uptime).toBe('number');
      expect(Number.isInteger(res.body.uptime)).toBe(true);
      expect(res.body.uptime).toBeGreaterThanOrEqual(0);
    });

    it('should return uptime that is consistent with server start time', async () => {
      const before = Math.floor((Date.now() - SERVER_START_TIME) / 1000);
      const res = await request(app).get('/healthz');
      const after = Math.floor((Date.now() - SERVER_START_TIME) / 1000);
      expect(res.body.uptime).toBeGreaterThanOrEqual(before);
      expect(res.body.uptime).toBeLessThanOrEqual(after + 1);
    });

    it('should return a JSON content-type', async () => {
      const res = await request(app).get('/healthz');
      expect(res.headers['content-type']).toMatch(/application\/json/);
    });

    it('should return all required fields', async () => {
      const res = await request(app).get('/healthz');
      expect(res.body).toHaveProperty('status');
      expect(res.body).toHaveProperty('uptime');
      expect(res.body).toHaveProperty('version');
    });
  });

  describe('when APP_VERSION is NOT set', () => {
    const originalEnv = process.env.APP_VERSION;

    beforeAll(() => {
      delete process.env.APP_VERSION;
    });

    afterAll(() => {
      if (originalEnv !== undefined) {
        process.env.APP_VERSION = originalEnv;
      }
    });

    it('should return HTTP 200', async () => {
      const res = await request(app).get('/healthz');
      expect(res.status).toBe(200);
    });

    it('should return version as "unknown" when APP_VERSION is not set', async () => {
      const res = await request(app).get('/healthz');
      expect(res.body.version).toBe('unknown');
    });

    it('should still return status ok when APP_VERSION is not set', async () => {
      const res = await request(app).get('/healthz');
      expect(res.body.status).toBe('ok');
    });
  });

  describe('404 for unknown routes', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await request(app).get('/nonexistent');
      expect(res.status).toBe(404);
    });
  });
});
