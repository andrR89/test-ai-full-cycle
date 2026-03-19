import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as apiLogin, register as apiRegister } from '../api/authApi';
import type { LoginCredentials, RegisterCredentials } from '../types/auth';

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleLogin(credentials: LoginCredentials) {
    setLoading(true);
    setError(null);
    try {
      const { token } = await apiLogin(credentials);
      localStorage.setItem('token', token);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return { handleLogin, loading, error };
}

export function useRegister() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleRegister(credentials: Omit<RegisterCredentials, 'confirmPassword'>) {
    setLoading(true);
    setError(null);
    try {
      const { token } = await apiRegister(credentials);
      localStorage.setItem('token', token);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return { handleRegister, loading, error };
}

export function isAuthenticated(): boolean {
  return Boolean(localStorage.getItem('token'));
}
