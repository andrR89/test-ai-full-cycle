import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser, registerUser, getErrorMessage } from '../api/auth'
import type { LoginRequest, RegisterRequest } from '../types/auth'

const AUTH_TOKEN_KEY = 'auth_token'

export function useAuth() {
  const setToken = (token: string) => localStorage.setItem(AUTH_TOKEN_KEY, token)
  const getToken = () => localStorage.getItem(AUTH_TOKEN_KEY)
  const clearToken = () => localStorage.removeItem(AUTH_TOKEN_KEY)
  const isAuthenticated = () => !!localStorage.getItem(AUTH_TOKEN_KEY)
  return { setToken, getToken, clearToken, isAuthenticated }
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem('token')
}

export function useLogin() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const login = useCallback(async (data: LoginRequest) => {
    setLoading(true)
    setError(null)
    try {
      const res = await loginUser(data)
      localStorage.setItem('token', res.token)
      navigate('/dashboard')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [navigate])

  return { login, loading, error }
}

export function useRegister() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const register = useCallback(async (data: RegisterRequest) => {
    setLoading(true)
    setError(null)
    try {
      const res = await registerUser({ email: data.email, password: data.password })
      localStorage.setItem('token', res.token)
      navigate('/dashboard')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [navigate])

  return { register, loading, error }
}
