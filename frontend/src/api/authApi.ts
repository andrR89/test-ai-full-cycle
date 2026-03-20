import axios, { AxiosError } from 'axios'
import type { LoginRequest, RegisterRequest, AuthResponse, User } from '../types/auth'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export async function loginApi(data: LoginRequest): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>('/auth/login', data)
  return res.data
}

export async function registerApi(data: Omit<RegisterRequest, 'confirmPassword'>): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>('/auth/register', data)
  return res.data
}

export async function getMeApi(): Promise<User> {
  const res = await api.get<User>('/auth/me')
  return res.data
}

export function getApiErrorMessage(error: unknown, fallback = 'An unexpected error occurred'): string {
  if (error instanceof AxiosError) {
    return error.response?.data?.message ?? error.message ?? fallback
  }
  return fallback
}

// Aliases used by tests
export const login = loginApi
export const register = registerApi
export const getMe = getMeApi
