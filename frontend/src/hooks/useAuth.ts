import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser, registerUser, getErrorMessage } from '../api/auth'
import type { LoginRequest, RegisterRequest } from '../types/auth'

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
