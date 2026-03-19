import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, beforeEach } from 'vitest';
import ProtectedRoute from '../ProtectedRoute';

function renderWithRoutes(token: string | null) {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div>Protected Content</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => localStorage.clear());

  it('renders children when token is present', () => {
    renderWithRoutes('valid-token');
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to /login when no token', () => {
    renderWithRoutes(null);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });
});
