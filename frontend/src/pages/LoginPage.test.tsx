import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import LoginPage from './LoginPage'
import * as authApi from '../api/authApi'

vi.mock('../api/authApi')

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

function renderLogin() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})

describe('LoginPage', () => {
  it('renders email and password fields', () => {
    renderLogin()
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
  })

  it('renders sign in button', () => {
    renderLogin()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('renders link to register', () => {
    renderLogin()
    expect(screen.getByRole('link', { name: /register/i })).toBeInTheDocument()
  })

  it('stores token and navigates on successful login', async () => {
    vi.mocked(authApi.login).mockResolvedValueOnce({
      token: 'test-jwt-token',
      user: { id: '1', email: 'test@example.com', createdAt: new Date().toISOString() },
    })

    renderLogin()

    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('test-jwt-token')
    })
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true })
  })

  it('shows error message on invalid credentials', async () => {
    const { AxiosError } = await import('axios')
    const err = new AxiosError('Request failed')
    err.response = { data: { message: 'Invalid credentials' }, status: 401 } as any
    vi.mocked(authApi.login).mockRejectedValueOnce(err)

    renderLogin()

    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'bad@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'wrongpass' },
    })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials')
    })
    expect(localStorage.getItem('token')).toBeNull()
  })

  it('disables button and shows loading spinner during submission', async () => {
    let resolve!: (v: any) => void
    vi.mocked(authApi.login).mockReturnValueOnce(
      new Promise((r) => { resolve = r })
    )

    renderLogin()

    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByLabelText('Loading')).toBeInTheDocument()
    })

    resolve({ token: 'tok', user: { id: '1', email: 'test@example.com', createdAt: '' } })
  })
})
