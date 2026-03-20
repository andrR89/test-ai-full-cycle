import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'

vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal<typeof import('axios')>()
  return {
    ...actual,
    default: {
      ...actual.default,
      create: vi.fn(() => ({
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
        post: vi.fn(),
        get: vi.fn(),
      })),
    },
  }
})

describe('getApiErrorMessage', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('extracts message from AxiosError response', async () => {
    const { getApiErrorMessage } = await import('./authApi')
    const { AxiosError } = await import('axios')
    const err = new AxiosError('fail')
    err.response = { data: { message: 'Invalid credentials' }, status: 401 } as any
    expect(getApiErrorMessage(err)).toBe('Invalid credentials')
  })

  it('uses error message when no response data', async () => {
    const { getApiErrorMessage } = await import('./authApi')
    const { AxiosError } = await import('axios')
    const err = new AxiosError('Network Error')
    expect(getApiErrorMessage(err)).toBe('Network Error')
  })

  it('returns generic message for unknown errors', async () => {
    const { getApiErrorMessage } = await import('./authApi')
    expect(getApiErrorMessage(new Error('something'))).toBe('An unexpected error occurred')
  })
})
