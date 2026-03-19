import axios, { AxiosError } from 'axios'
import type { LoginRequest, RegisterRequest, AuthResponse } from '../types/auth'

const api = axios.create({ baseURL: '/api' })

export async function loginUser(data: LoginRequest): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>('/auth/login', data)
  return res.data
}

export async function registerUser(data: Omit<RegisterRequest, 'confirmPassword'>): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>('/auth/register', data)
  return res.data
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    return error.response?.data?.message ?? error.message
  }
  if (error instanceof Error) return error.message
  return 'An unexpected error occurred'
}
