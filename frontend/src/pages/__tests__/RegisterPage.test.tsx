import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import RegisterPage from '../RegisterPage'
import * as useAuthModule from '../../hooks/useAuth'

const mockRegister = vi.fn()

vi.mock('../../hooks/useAuth', () => ({
  useLogin: vi.fn(() => ({ login: vi.fn(), loading: false, error: null })),
  useRegister: vi.fn(() => ({ register: mockRegister, loading: false, error: null })),
}))

const renderRegister = () =>
  render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>
  )

describe('RegisterPage', () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()
    vi.mocked(useAuthModule.useRegister).mockReturnValue({ register: mockRegister, loading: false, error: null })
  })

  it('renders email, password, and confirm password fields', () => {
    renderRegister()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
  })

  it('renders create account button', () => {
    renderRegister()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('renders link back to login', () => {
    renderRegister()
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows validation error when passwords do not match', async () => {
    renderRegister()
    await user.type(screen.getByLabelText(/email address/i), 'test@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'different123')
    fireEvent.submit(screen.getByRole('button', { name: /create account/i }).closest('form')!)
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Passwords do not match')
    })
    expect(mockRegister).not.toHaveBeenCalled()
  })

  it('shows validation error when password is too short', async () => {
    renderRegister()
    await user.type(screen.getByLabelText(/email address/i), 'test@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'short')
    await user.type(screen.getByLabelText(/confirm password/i), 'short')
    fireEvent.submit(screen.getByRole('button', { name: /create account/i }).closest('form')!)
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('at least 8 characters')
    })
  })

  it('calls register when passwords match and are valid', async () => {
    renderRegister()
    await user.type(screen.getByLabelText(/email address/i), 'test@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'password123')
    fireEvent.submit(screen.getByRole('button', { name: /create account/i }).closest('form')!)
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      })
    })
  })

  it('shows API error when error is present', () => {
    vi.mocked(useAuthModule.useRegister).mockReturnValue({ register: mockRegister, loading: false, error: 'Email already taken' })
    renderRegister()
    expect(screen.getByRole('alert')).toHaveTextContent('Email already taken')
  })

  it('disables button when loading', () => {
    vi.mocked(useAuthModule.useRegister).mockReturnValue({ register: mockRegister, loading: true, error: null })
    renderRegister()
    expect(screen.getByRole('button', { name: /create account/i })).toBeDisabled()
  })
})
