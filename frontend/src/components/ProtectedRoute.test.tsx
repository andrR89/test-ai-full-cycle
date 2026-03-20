import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'

const renderWithRouter = (token: string | null) => {
  if (token) localStorage.setItem('token', token)
  else localStorage.removeItem('token')

  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div>Dashboard Content</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  )
}

describe('ProtectedRoute', () => {
  afterEach(() => localStorage.clear())

  it('renders children when authenticated', () => {
    renderWithRouter('valid-token')
    expect(screen.getByText('Dashboard Content')).toBeDefined()
  })

  it('redirects to /login when not authenticated', () => {
    renderWithRouter(null)
    expect(screen.getByText('Login Page')).toBeDefined()
  })
})
