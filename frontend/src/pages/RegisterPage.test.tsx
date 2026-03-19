import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RegisterPage from './RegisterPage'
import * as authApi from '../api/authApi'

vi.mock('../api/authApi')
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => vi.fn() }
})

const renderRegister = () =>
  render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>
  )

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('renders all form fields', () => {
    renderRegister()
    expect(screen.getByLabelText(/email address/i)).toBeDefined()
    expect(screen.getByLabelText(/^password$/i)).toBeDefined()
    expect(screen.getByLabelText(/confirm password/i)).toBeDefined()
  })

  it('renders register button', () => {
    renderRegister()
    expect(screen.getByRole('button', { name: /register/i })).toBeDefined()
  })

  it('renders link to sign in page', () => {
    renderRegister()
    expect(screen.getByRole('link', { name: /sign in/i })).toBeDefined()
  })

  it('shows validation errors when submitting empty form', async () => {
    renderRegister()
    fireEvent.click(screen.getByRole('button', { name: /register/i }))
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeDefined()
      expect(screen.getByText(/password is required/i)).toBeDefined()
      expect(screen.getByText(/please confirm your password/i)).toBeDefined()
    })
  })

  it('shows error when passwords do not match', async () => {
    renderRegister()
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'user@example.com' } })
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } })
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'different' } })
    fireEvent.click(screen.getByRole('button', { name: /register/i }))
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeDefined()
    })
  })

  it('shows error when password is too short', async () => {
    renderRegister()
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'user@example.com' } })
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'short' } })
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'short' } })
    fireEvent.click(screen.getByRole('button', { name: /register/i }))
    await waitFor(() => {
      expect(screen.getByText(/at least 8 characters/i)).toBeDefined()
    })
  })

  it('calls registerApi with correct data when form is valid', async () => {
    const mockRegister = vi.spyOn(authApi, 'registerApi').mockResolvedValue({
      token: 'new-token',
      user: { id: '2', email: 'user@example.com', createdAt: '' },
    })
    renderRegister()
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'user@example.com' } })
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } })
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /register/i }))
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({ email: 'user@example.com', password: 'password123' })
    })
  })

  it('stores token in localStorage on successful registration', async () => {
    vi.spyOn(authApi, 'registerApi').mockResolvedValue({
      token: 'reg-token-abc',
      user: { id: '2', email: 'user@example.com', createdAt: '' },
    })
    renderRegister()
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'user@example.com' } })
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } })
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /register/i }))
    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('reg-token-abc')
    })
  })

  it('shows error alert on duplicate email (409)', async () => {
    vi.spyOn(authApi, 'registerApi').mockRejectedValue(new Error())
    vi.spyOn(authApi, 'getApiErrorMessage').mockReturnValue('Email already in use')
    renderRegister()
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'taken@example.com' } })
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } })
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /register/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeDefined()
      expect(screen.getByText(/email already in use/i)).toBeDefined()
    })
  })
})
