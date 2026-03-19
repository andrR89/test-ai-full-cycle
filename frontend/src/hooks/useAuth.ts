import { useCallback } from 'react';

const TOKEN_KEY = 'auth_token';

export function useAuth() {
  const getToken = useCallback(() => localStorage.getItem(TOKEN_KEY), []);

  const setToken = useCallback((token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
  }, []);

  const clearToken = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
  }, []);

  const isAuthenticated = useCallback(() => !!localStorage.getItem(TOKEN_KEY), []);

  return { getToken, setToken, clearToken, isAuthenticated };
}
