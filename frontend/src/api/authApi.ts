import axios, { AxiosError } from 'axios';
import type { LoginCredentials, RegisterCredentials, AuthResponse, AuthUser } from '../types/auth';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function extractMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    return error.response?.data?.message ?? error.message;
  }
  return 'An unexpected error occurred';
}

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    const { data } = await api.post<AuthResponse>('/auth/login', credentials);
    return data;
  } catch (error) {
    throw new Error(extractMessage(error));
  }
}

export async function register(credentials: Omit<RegisterCredentials, 'confirmPassword'>): Promise<AuthResponse> {
  try {
    const { data } = await api.post<AuthResponse>('/auth/register', credentials);
    return data;
  } catch (error) {
    throw new Error(extractMessage(error));
  }
}

export async function getMe(): Promise<AuthUser> {
  try {
    const { data } = await api.get<AuthUser>('/auth/me');
    return data;
  } catch (error) {
    throw new Error(extractMessage(error));
  }
}
