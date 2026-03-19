import { LoginRequest, RegisterRequest, AuthResponse } from '../types/auth';

const BASE = '/api/auth';

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { message?: string }).message || `HTTP ${res.status}`;
    const err = new Error(msg) as Error & { status: number };
    err.status = res.status;
    throw err;
  }
  return data as T;
}

export async function loginApi(payload: LoginRequest): Promise<AuthResponse> {
  const res = await fetch(`${BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<AuthResponse>(res);
}

export async function registerApi(payload: Omit<RegisterRequest, 'confirmPassword'>): Promise<AuthResponse> {
  const res = await fetch(`${BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<AuthResponse>(res);
}
