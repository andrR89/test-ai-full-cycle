const request = require('supertest');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const prisma = require('../src/lib/prisma');

process.env.JWT_SECRET = 'test-secret';

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  passwordHash: '',
  createdAt: new Date(),
};

beforeAll(async () => {
  mockUser.passwordHash = await bcrypt.hash('password123', 10);
});

beforeEach(() => {
  jest.clearAllMocks();
});

jest.mock('../src/lib/prisma', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
}));

describe('POST /api/auth/register', () => {
  it('creates a user and returns 201 with token', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'user-1',
      email: 'new@example.com',
      createdAt: new Date(),
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'new@example.com', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('new@example.com');
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it('returns 409 when email already exists', async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser);

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/already in use/i);
  });

  it('returns 400 for invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: 'password123' });

    expect(res.status).toBe(400);
  });

  it('returns 400 for short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'valid@example.com', password: 'short' });

    expect(res.status).toBe(400);
  });

  it('returns 500 on unexpected prisma error', async () => {
    prisma.user.findUnique.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'err@example.com', password: 'password123' });

    expect(res.status).toBe(500);
  });
});

describe('POST /api/auth/login', () => {
  it('returns 200 with token on valid credentials', async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    const payload = jwt.verify(res.body.token, 'test-secret');
    expect(payload.sub).toBe('user-1');
  });

  it('returns 401 for unknown email', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'password123' });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/invalid credentials/i);
  });

  it('returns 401 for wrong password', async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
  });

  it('returns 400 for missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com' });

    expect(res.status).toBe(400);
  });

  it('returns 500 on DB error', async () => {
    prisma.user.findUnique.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(res.status).toBe(500);
  });
});

describe('GET /api/auth/me', () => {
  const validToken = () => jwt.sign({ sub: 'user-1' }, 'test-secret', { expiresIn: '1h' });

  it('returns 200 with user data for valid token', async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser);

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${validToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe('test@example.com');
    expect(res.body.passwordHash).toBeUndefined();
  });

  it('returns 401 with no token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns 401 with malformed token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid.token.here');
    expect(res.status).toBe(401);
  });

  it('returns 401 when user no longer exists', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${validToken()}`);

    expect(res.status).toBe(401);
  });

  it('returns 401 for expired token', async () => {
    const expiredToken = jwt.sign({ sub: 'user-1' }, 'test-secret', { expiresIn: '0s' });
    await new Promise((r) => setTimeout(r, 10));

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(res.status).toBe(401);
  });
});
