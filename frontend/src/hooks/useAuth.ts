import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as apiLogin, register as apiRegister, getApiErrorMessage } from '../api/authApi'
import type { LoginRequest, RegisterRequest } from '../types/auth'

export function useLogin() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const submit = useCallback(async (data: LoginRequest) => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiLogin(data)
      localStorage.setItem('token', response.token)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [navigate])

  return { submit, loading, error }
}

export function useRegister() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const submit = useCallback(async (data: Omit<RegisterRequest, 'confirmPassword'>) => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiRegister(data)
      localStorage.setItem('token', response.token)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [navigate])

  return { submit, loading, error }
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem('token')
}
