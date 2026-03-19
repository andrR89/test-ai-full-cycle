import { loginApi, registerApi } from './auth';

const mockFetch = jest.fn();
global.fetch = mockFetch;

const okResp = (body: unknown) =>
  Promise.resolve({ ok: true, json: () => Promise.resolve(body) } as Response);

const errResp = (status: number, body: unknown) =>
  Promise.resolve({ ok: false, status, json: () => Promise.resolve(body) } as Response);

beforeEach(() => mockFetch.mockReset());

test('loginApi sends POST and returns auth response', async () => {
  mockFetch.mockReturnValueOnce(okResp({ token: 't', user: { id: '1', email: 'a@b.com', createdAt: '' } }));
  const res = await loginApi({ email: 'a@b.com', password: 'pass' });
  expect(res.token).toBe('t');
  expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', expect.objectContaining({ method: 'POST' }));
});

test('loginApi throws with server message on error', async () => {
  mockFetch.mockReturnValueOnce(errResp(401, { message: 'Invalid credentials' }));
  await expect(loginApi({ email: 'x@y.com', password: 'bad' })).rejects.toThrow('Invalid credentials');
});

test('registerApi sends POST and returns auth response', async () => {
  mockFetch.mockReturnValueOnce(okResp({ token: 'r', user: { id: '2', email: 'b@c.com', createdAt: '' } }));
  const res = await registerApi({ email: 'b@c.com', password: 'pass123' });
  expect(res.token).toBe('r');
  expect(mockFetch).toHaveBeenCalledWith('/api/auth/register', expect.objectContaining({ method: 'POST' }));
});

test('registerApi throws on 409', async () => {
  mockFetch.mockReturnValueOnce(errResp(409, { message: 'Email already taken' }));
  await expect(registerApi({ email: 'dup@b.com', password: 'pass123' })).rejects.toThrow('Email already taken');
});

test('loginApi throws generic message when no message in body', async () => {
  mockFetch.mockReturnValueOnce(errResp(500, {}));
  await expect(loginApi({ email: 'a@b.com', password: 'p' })).rejects.toThrow('HTTP 500');
});
