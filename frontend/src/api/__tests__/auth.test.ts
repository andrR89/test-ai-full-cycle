import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { loginUser, registerUser, getErrorMessage } from '../auth'

vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal<typeof import('axios')>()
  return {
    default: {
      ...actual.default,
      create: vi.fn(() => ({
        post: vi.fn(),
      })),
    },
  }
})

const mockPost = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(axios.create).mockReturnValue({ post: mockPost } as never)
})

describe('getErrorMessage', () => {
  it('returns message from AxiosError response', () => {
    const { AxiosError } = require('axios')
    const err = new AxiosError('Request failed')
    err.response = { data: { message: 'Invalid credentials' } }
    expect(getErrorMessage(err)).toBe('Invalid credentials')
  })

  it('returns Error message for generic Error', () => {
    expect(getErrorMessage(new Error('Something went wrong'))).toBe('Something went wrong')
  })

  it('returns fallback for unknown error', () => {
    expect(getErrorMessage('unknown')).toBe('An unexpected error occurred')
  })
})
