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
  it('returns 400 if email is invalid', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'bad', password: 'password123' });
    expect(res.status).toBe(400);
  });

  it('returns 400 if password too short', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'a@b.com', password: 'short' });
    expect(res.status).toBe(400);
  });

  it('returns 409 if email already taken', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: '1', email: 'a@b.com' });
    const res = await request(app).post('/api/auth/register').send({ email: 'a@b.com', password: 'password123' });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/email already in use/i);
  });

  it('returns 201 with user and token on success', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    const created = { id: 'cuid1', email: 'a@b.com', createdAt: new Date().toISOString() };
    prisma.user.create.mockResolvedValue(created);

    const res = await request(app).post('/api/auth/register').send({ email: 'a@b.com', password: 'password123' });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('a@b.com');
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it('returns 500 on unexpected error', async () => {
    prisma.user.findUnique.mockRejectedValue(new Error('db error'));
    const res = await request(app).post('/api/auth/register').send({ email: 'a@b.com', password: 'password123' });
    expect(res.status).toBe(500);
  });
});

describe('POST /api/auth/login', () => {
  it('returns 400 if email is invalid', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'bad', password: 'pass' });
    expect(res.status).toBe(400);
  });

  it('returns 400 if password missing', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'a@b.com', password: '' });
    expect(res.status).toBe(400);
  });

  it('returns 401 if user not found', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    const res = await request(app).post('/api/auth/login').send({ email: 'a@b.com', password: 'password123' });
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/invalid credentials/i);
  });

  it('returns 401 if password wrong', async () => {
    const hash = await bcrypt.hash('correct', 10);
    prisma.user.findUnique.mockResolvedValue({ id: '1', email: 'a@b.com', passwordHash: hash });
    const res = await request(app).post('/api/auth/login').send({ email: 'a@b.com', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  it('returns 200 with token on valid credentials', async () => {
    const hash = await bcrypt.hash('password123', 10);
    prisma.user.findUnique.mockResolvedValue({ id: 'cuid1', email: 'a@b.com', passwordHash: hash, createdAt: new Date() });
    const res = await request(app).post('/api/auth/login').send({ email: 'a@b.com', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    const payload = jwt.verify(res.body.token, JWT_SECRET);
    expect(payload.sub).toBe('cuid1');
  });

  it('returns 500 on unexpected error', async () => {
    prisma.user.findUnique.mockRejectedValue(new Error('db error'));
    const res = await request(app).post('/api/auth/login').send({ email: 'a@b.com', password: 'password123' });
    expect(res.status).toBe(500);
  });
});

describe('GET /api/auth/me', () => {
  function makeToken(userId) {
    return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '1h' });
  }

  it('returns 401 with no token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns 401 with malformed token', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer badtoken');
    expect(res.status).toBe(401);
  });

  it('returns 401 if user no longer exists', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    const token = makeToken('ghost');
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(401);
  });

  it('returns 200 with user data on valid token', async () => {
    const user = { id: 'cuid1', email: 'a@b.com', passwordHash: 'h', createdAt: new Date() };
    prisma.user.findUnique.mockResolvedValue(user);
    const token = makeToken('cuid1');
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.id).toBe('cuid1');
    expect(res.body.user.passwordHash).toBeUndefined();
  });
});
