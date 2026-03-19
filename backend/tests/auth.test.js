const request = require('supertest');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const prisma = require('../src/lib/prisma');

process.env.JWT_SECRET = 'test-secret';

jest.mock('../src/lib/prisma', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
}));

beforeEach(() => {
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
      .send({ email: 'test@example.com', password: 'short' });
    expect(res.status).toBe(400);
  });

  it('returns 409 if email already in use', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: '1', email: 'test@example.com' });
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'password123' });
    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Email already in use');
  });

  it('creates user and returns 201 with token', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'abc123',
      email: 'test@example.com',
      createdAt: new Date().toISOString(),
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('test@example.com');
  });

  it('returns 500 on unexpected error', async () => {
    prisma.user.findUnique.mockRejectedValue(new Error('DB error'));
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'password123' });
    expect(res.status).toBe(500);
  });
});

describe('POST /api/auth/login', () => {
  it('returns 400 for missing fields', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
  });

  it('returns 401 if user not found', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'password123' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid credentials');
  });

  it('returns 401 for wrong password', async () => {
    const passwordHash = await bcrypt.hash('correctpassword', 10);
    prisma.user.findUnique.mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      passwordHash,
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'wrongpassword' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid credentials');
  });

  it('returns 200 with token on valid credentials', async () => {
    const passwordHash = await bcrypt.hash('password123', 10);
    prisma.user.findUnique.mockResolvedValue({
      id: 'abc123',
      email: 'test@example.com',
      passwordHash,
      createdAt: new Date().toISOString(),
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('test@example.com');
  });

  it('returns 500 on unexpected error', async () => {
    prisma.user.findUnique.mockRejectedValue(new Error('DB error'));
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });
    expect(res.status).toBe(500);
  });
});

describe('GET /api/auth/me', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns 401 with invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalidtoken');
    expect(res.status).toBe(401);
  });

  it('returns 401 if user no longer exists', async () => {
    const token = jwt.sign({ sub: 'ghost' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    prisma.user.findUnique.mockResolvedValue(null);
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('User not found');
  });

  it('returns 200 with user data for valid token', async () => {
    const user = {
      id: 'abc123',
      email: 'test@example.com',
      passwordHash: 'hash',
      createdAt: new Date().toISOString(),
    };
    const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    prisma.user.findUnique.mockResolvedValue(user);

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe('test@example.com');
    expect(res.body.passwordHash).toBeUndefined();
  });
});
