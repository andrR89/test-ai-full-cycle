import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import RegisterPage from './RegisterPage'
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

function renderRegister() {
  return render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})

describe('RegisterPage', () => {
  it('renders all form fields', () => {
    renderRegister()
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument()
  })

  it('renders link to login', () => {
    renderRegister()
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows error when passwords do not match', async () => {
    renderRegister()

    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    })
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'different' },
    })
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Passwords do not match')
    })
    expect(authApi.register).not.toHaveBeenCalled()
  })

  it('shows error when password is too short', async () => {
    renderRegister()

    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: '123' },
    })
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: '123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('at least 6 characters')
    })
  })

  it('submits and navigates on successful registration', async () => {
    vi.mocked(authApi.register).mockResolvedValueOnce({
      token: 'reg-token',
      user: { id: '2', email: 'new@example.com', createdAt: new Date().toISOString() },
    })

    renderRegister()

    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'new@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'securepass' },
    })
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'securepass' },
    })
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('reg-token')
    })
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true })
  })

  it('shows API error on registration failure', async () => {
    const { AxiosError } = await import('axios')
    const err = new AxiosError('Conflict')
    err.response = { data: { message: 'Email already taken' }, status: 409 } as any
    vi.mocked(authApi.register).mockRejectedValueOnce(err)

    renderRegister()

    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'taken@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    })
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Email already taken')
    })
  })

  it('disables button during submission', async () => {
    let resolve!: (v: any) => void
    vi.mocked(authApi.register).mockReturnValueOnce(
      new Promise((r) => { resolve = r })
    )

    renderRegister()

    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'new@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    })
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByLabelText('Loading')).toBeInTheDocument()
    })

    resolve({ token: 'tok', user: { id: '1', email: 'new@example.com', createdAt: '' } })
  })
})
