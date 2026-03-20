import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { login, register, getMe } from '../authApi';

vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal<typeof import('axios')>();
  return {
    default: {
      ...actual.default,
      create: vi.fn(() => ({
        post: vi.fn(),
        get: vi.fn(),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      })),
    },
  };
});

import * as authApiModule from '../authApi';

describe('authApi', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('login resolves with token data', async () => {
    const mockResponse = { token: 'abc', user: { id: '1', email: 'a@b.com', createdAt: '' } };
    vi.spyOn(authApiModule, 'login').mockResolvedValueOnce(mockResponse);
    const result = await authApiModule.login({ email: 'a@b.com', password: 'pass' });
    expect(result.token).toBe('abc');
  });

  it('login throws on error', async () => {
    vi.spyOn(authApiModule, 'login').mockRejectedValueOnce(new Error('Invalid credentials'));
    await expect(authApiModule.login({ email: 'a@b.com', password: 'wrong' })).rejects.toThrow('Invalid credentials');
  });

  it('register resolves with token data', async () => {
    const mockResponse = { token: 'xyz', user: { id: '2', email: 'c@d.com', createdAt: '' } };
    vi.spyOn(authApiModule, 'register').mockResolvedValueOnce(mockResponse);
    const result = await authApiModule.register({ email: 'c@d.com', password: 'pass1234' });
    expect(result.token).toBe('xyz');
  });

  it('register throws on duplicate email', async () => {
    vi.spyOn(authApiModule, 'register').mockRejectedValueOnce(new Error('Email already in use'));
    await expect(authApiModule.register({ email: 'dup@email.com', password: 'pass' })).rejects.toThrow('Email already in use');
  });

  it('getMe resolves with user data', async () => {
    const mockUser = { id: '1', email: 'a@b.com', createdAt: '' };
    vi.spyOn(authApiModule, 'getMe').mockResolvedValueOnce(mockUser);
    const result = await authApiModule.getMe();
    expect(result.email).toBe('a@b.com');
  });

  it('getMe throws on unauthorized', async () => {
    vi.spyOn(authApiModule, 'getMe').mockRejectedValueOnce(new Error('Unauthorized'));
    await expect(authApiModule.getMe()).rejects.toThrow('Unauthorized');
  });
});
