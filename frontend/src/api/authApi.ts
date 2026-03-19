import axios, { AxiosError } from 'axios'
import type { LoginRequest, RegisterRequest, AuthResponse, User } from '../types/auth'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/login', data)
  return response.data
}

export async function register(data: Omit<RegisterRequest, 'confirmPassword'>): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/register', data)
  return response.data
}

export async function getMe(): Promise<User> {
  const response = await api.get<User>('/auth/me')
  return response.data
}

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    return error.response?.data?.message ?? error.message
  }
  return 'An unexpected error occurred'
}
