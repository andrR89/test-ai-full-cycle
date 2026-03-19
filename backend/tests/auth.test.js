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

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

const mockUser = {
  id: 'cuid123',
  email: 'test@example.com',
  passwordHash: '',
  createdAt: new Date('2024-01-01'),
};

beforeAll(async () => {
  mockUser.passwordHash = await bcrypt.hash('password123', 10);
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/auth/register', () => {
  test('201 — creates user with hashed password', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: mockUser.id,
      email: mockUser.email,
      createdAt: mockUser.createdAt,
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('test@example.com');
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  test('409 — duplicate email', async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser);

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Email already in use');
  });

  test('400 — invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: 'password123' });

    expect(res.status).toBe(400);
  });

  test('400 — short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'short' });

    expect(res.status).toBe(400);
  });

  test('400 — missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({});

    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  test('200 — valid credentials return JWT', async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    const payload = jwt.verify(res.body.token, JWT_SECRET);
    expect(payload.sub).toBe(mockUser.id);
    expect(payload.email).toBe(mockUser.email);
  });

  test('401 — wrong password', async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid credentials');
  });

  test('401 — user not found', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'password123' });

    expect(res.status).toBe(401);
  });

  test('400 — missing email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: 'password123' });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/auth/me', () => {
  function makeToken(overrides = {}) {
    return jwt.sign(
      { sub: mockUser.id, email: mockUser.email, ...overrides },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
  }

  test('200 — returns user data with valid token', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: mockUser.id,
      email: mockUser.email,
      createdAt: mockUser.createdAt,
    });

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(mockUser.email);
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  test('401 — no token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('401 — invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalidtoken');

    expect(res.status).toBe(401);
  });

  test('401 — expired token', async () => {
    const token = jwt.sign(
      { sub: mockUser.id, email: mockUser.email },
      JWT_SECRET,
      { expiresIn: '-1s' }
    );

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(401);
  });

  test('401 — user not found in db', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(401);
  });
});
