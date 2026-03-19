import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LoginPage from './LoginPage'
import * as authApi from '../api/authApi'

vi.mock('../api/authApi')
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => vi.fn() }
})

const renderLogin = () =>
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  )

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('renders email and password fields', () => {
    renderLogin()
    expect(screen.getByLabelText(/email address/i)).toBeDefined()
    expect(screen.getByLabelText(/^password$/i)).toBeDefined()
  })

  it('renders sign in button', () => {
    renderLogin()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeDefined()
  })

  it('renders link to register page', () => {
    renderLogin()
    expect(screen.getByRole('link', { name: /register/i })).toBeDefined()
  })

  it('shows validation errors when submitting empty form', async () => {
    renderLogin()
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeDefined()
      expect(screen.getByText(/password is required/i)).toBeDefined()
    })
  })

  it('shows invalid email error', async () => {
    renderLogin()
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'notanemail' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => {
      expect(screen.getByText(/enter a valid email/i)).toBeDefined()
    })
  })

  it('calls loginApi with correct credentials', async () => {
    const mockLogin = vi.spyOn(authApi, 'loginApi').mockResolvedValue({
      token: 'test-token',
      user: { id: '1', email: 'test@example.com', createdAt: '' },
    })
    renderLogin()
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password123' })
    })
  })

  it('stores token in localStorage on success', async () => {
    vi.spyOn(authApi, 'loginApi').mockResolvedValue({
      token: 'jwt-token-xyz',
      user: { id: '1', email: 'test@example.com', createdAt: '' },
    })
    renderLogin()
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('jwt-token-xyz')
    })
  })

  it('shows error alert on invalid credentials', async () => {
    const axiosError = Object.assign(new Error(), {
      isAxiosError: true,
      response: { data: { message: 'Invalid credentials' }, status: 401 },
    })
    vi.spyOn(authApi, 'loginApi').mockRejectedValue(axiosError)
    vi.spyOn(authApi, 'getApiErrorMessage').mockReturnValue('Invalid email or password')
    renderLogin()
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'wrong@example.com' } })
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'wrongpass' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeDefined()
      expect(screen.getByText(/invalid email or password/i)).toBeDefined()
    })
  })
})
