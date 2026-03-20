import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import LoginPage from '../LoginPage'
import * as useAuthModule from '../../hooks/useAuth'

const mockLogin = vi.fn()

vi.mock('../../hooks/useAuth', () => ({
  useLogin: vi.fn(() => ({ login: mockLogin, loading: false, error: null })),
  useRegister: vi.fn(() => ({ register: vi.fn(), loading: false, error: null })),
}))

const renderLogin = () =>
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  )

describe('LoginPage', () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()
    vi.mocked(useAuthModule.useLogin).mockReturnValue({ login: mockLogin, loading: false, error: null })
  })

  it('renders email and password fields', () => {
    renderLogin()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
  })

  it('renders sign in button', () => {
    renderLogin()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('renders link to register page', () => {
    renderLogin()
    expect(screen.getByRole('link', { name: /register/i })).toBeInTheDocument()
  })

  it('calls login with email and password on submit', async () => {
    renderLogin()
    await user.type(screen.getByLabelText(/email address/i), 'test@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'secret123')
    fireEvent.submit(screen.getByRole('button', { name: /sign in/i }).closest('form')!)
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({ email: 'test@example.com', password: 'secret123' })
    })
  })

  it('shows error alert when error is present', () => {
    vi.mocked(useAuthModule.useLogin).mockReturnValue({ login: mockLogin, loading: false, error: 'Invalid credentials' })
    renderLogin()
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials')
  })

  it('shows loading spinner and disables button when loading', () => {
    vi.mocked(useAuthModule.useLogin).mockReturnValue({ login: mockLogin, loading: true, error: null })
    renderLogin()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeDisabled()
  })
})
