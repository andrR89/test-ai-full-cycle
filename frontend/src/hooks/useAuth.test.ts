import { renderHook, act } from '@testing-library/react';
import { useAuth } from './useAuth';

beforeEach(() => localStorage.clear());

test('setToken stores token', () => {
  const { result } = renderHook(() => useAuth());
  act(() => result.current.setToken('abc'));
  expect(localStorage.getItem('auth_token')).toBe('abc');
});

test('getToken returns stored token', () => {
  localStorage.setItem('auth_token', 'xyz');
  const { result } = renderHook(() => useAuth());
  expect(result.current.getToken()).toBe('xyz');
});

test('clearToken removes token', () => {
  localStorage.setItem('auth_token', 'xyz');
  const { result } = renderHook(() => useAuth());
  act(() => result.current.clearToken());
  expect(localStorage.getItem('auth_token')).toBeNull();
});

test('isAuthenticated returns true when token present', () => {
  localStorage.setItem('auth_token', 'tok');
  const { result } = renderHook(() => useAuth());
  expect(result.current.isAuthenticated()).toBe(true);
});

test('isAuthenticated returns false when no token', () => {
  const { result } = renderHook(() => useAuth());
  expect(result.current.isAuthenticated()).toBe(false);
});
