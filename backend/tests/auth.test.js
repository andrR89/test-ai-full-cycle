const request = require('supertest');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const prisma = require('../src/lib/prisma');

jest.mock('../src/lib/prisma', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
}));

const JWT_SECRET = 'test-secret';

beforeAll(() => {
  process.env.JWT_SECRET = JWT_SECRET;
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/auth/register', () => {
  it('returns 400 for invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: 'password123' });
    expect(res.status).toBe(400);
  });

  it('returns 400 for short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'user@example.com', password: '123' });
    expect(res.status).toBe(400);
  });

  it('returns 409 if email already taken', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: '1', email: 'user@example.com' });
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'user@example.com', password: 'password123' });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/already in use/i);
  });

  it('returns 201 and token on success', async () => {
    const now = new Date();
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({ id: 'abc', email: 'user@example.com', createdAt: now });
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'user@example.com', password: 'password123' });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('user@example.com');
  });

  it('returns 500 on unexpected error', async () => {
    prisma.user.findUnique.mockRejectedValue(new Error('DB error'));
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'user@example.com', password: 'password123' });
    expect(res.status).toBe(500);
  });
});

describe('POST /api/auth/login', () => {
  it('returns 400 for missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'bad-email', password: '' });
    expect(res.status).toBe(400);
  });

  it('returns 401 if user not found', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@example.com', password: 'password123' });
    expect(res.status).toBe(401);
  });

  it('returns 401 if password is wrong', async () => {
    const hash = await bcrypt.hash('correctpassword', 10);
    prisma.user.findUnique.mockResolvedValue({
      id: '1',
      email: 'user@example.com',
      passwordHash: hash,
      createdAt: new Date(),
    });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@example.com', password: 'wrongpassword' });
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/invalid credentials/i);
  });

  it('returns 200 and token on valid credentials', async () => {
    const hash = await bcrypt.hash('password123', 10);
    const now = new Date();
    prisma.user.findUnique.mockResolvedValue({
      id: '1',
      email: 'user@example.com',
      passwordHash: hash,
      createdAt: now,
    });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@example.com', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('user@example.com');
  });

  it('returns 500 on unexpected error', async () => {
    prisma.user.findUnique.mockRejectedValue(new Error('DB error'));
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@example.com', password: 'password123' });
    expect(res.status).toBe(500);
  });
});

describe('GET /api/auth/me', () => {
  function makeToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
  }

  it('returns 401 with no token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns 401 with invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid.token.here');
    expect(res.status).toBe(401);
  });

  it('returns 401 if user not found in DB', async () => {
    const token = makeToken({ sub: 'abc', email: 'user@example.com' });
    prisma.user.findUnique.mockResolvedValue(null);
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(401);
  });

  it('returns 200 with user data for valid token', async () => {
    const now = new Date();
    const token = makeToken({ sub: 'abc', email: 'user@example.com' });
    prisma.user.findUnique.mockResolvedValue({ id: 'abc', email: 'user@example.com', createdAt: now });
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.id).toBe('abc');
    expect(res.body.user.email).toBe('user@example.com');
  });

  it('returns 500 on unexpected error', async () => {
    const token = makeToken({ sub: 'abc', email: 'user@example.com' });
    prisma.user.findUnique.mockRejectedValue(new Error('DB error'));
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(500);
  });
});
