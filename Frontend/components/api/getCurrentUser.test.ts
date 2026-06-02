import { describe, it, expect, vi } from 'vitest'
import { getCurrentUser } from './getCurrentUser'
import * as api from './api'

vi.mock('./api', () => ({
  getJson: vi.fn(),
  ApiError: class ApiError extends Error {
    constructor(public status: number, message: string) {
      super(message);
    }
  }
}))

describe('getCurrentUser', () => {
  it('should return user data on success', async () => {
    const mockUser = { username: 'testuser', id: '1' }
    vi.mocked(api.getJson).mockResolvedValueOnce(mockUser)

    const result = await getCurrentUser()
    expect(result).toEqual(mockUser)
    expect(api.getJson).toHaveBeenCalledWith('/api/user/currentUser')
  })

  it('should return null if API returns 403', async () => {
    vi.mocked(api.getJson).mockRejectedValueOnce(new api.ApiError(403, 'Forbidden'))

    const result = await getCurrentUser()
    expect(result).toBeNull()
  })

  it('should rethrow other errors', async () => {
    const error = new Error('Network error')
    vi.mocked(api.getJson).mockRejectedValueOnce(error)

    await expect(getCurrentUser()).rejects.toThrow('Network error')
  })
})
