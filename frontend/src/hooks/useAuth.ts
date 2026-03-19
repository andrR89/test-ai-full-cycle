import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginApi, registerApi, getApiErrorMessage } from '../api/authApi'
import type { LoginRequest, RegisterRequest } from '../types/auth'

export function useLogin() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const login = useCallback(async (data: LoginRequest) => {
    setLoading(true)
    setError(null)
    try {
      const res = await loginApi(data)
      localStorage.setItem('token', res.token)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err, 'Invalid email or password'))
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

  const register = useCallback(async (data: Omit<RegisterRequest, 'confirmPassword'>) => {
    setLoading(true)
    setError(null)
    try {
      const res = await registerApi(data)
      localStorage.setItem('token', res.token)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err, 'Registration failed'))
    } finally {
      setLoading(false)
    }
  }, [navigate])

  return { register, loading, error }
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem('token')
}
