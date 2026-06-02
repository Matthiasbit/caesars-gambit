import { describe, it, expect, vi } from 'vitest'
import { updateCurrentUsername } from './updateCurrentUsername'
import * as api from './api'

vi.mock('./api', () => ({
  putJson: vi.fn(),
  ApiError: class ApiError extends Error {
    constructor(public status: number, message: string, public body?: string) {
      super(message);
    }
  }
}))

describe('updateCurrentUsername', () => {
  it('should call putJson with correct parameters', async () => {
    const mockUser = { username: 'newname', id: '1' }
    vi.mocked(api.putJson).mockResolvedValueOnce(mockUser)

    const result = await updateCurrentUsername({ username: 'newname' })
    expect(result).toEqual(mockUser)
    expect(api.putJson).toHaveBeenCalledWith('/api/user/username', { username: 'newname' })
  })

  it('should throw parsed error message from ApiError body', async () => {
    vi.mocked(api.putJson).mockRejectedValueOnce(new api.ApiError(400, 'Bad Request', JSON.stringify({ error: 'Username taken' })))

    await expect(updateCurrentUsername({ username: 'taken' })).rejects.toThrow('Username taken')
  })

  it('should rethrow ApiError if body is missing or invalid', async () => {
    const apiError = new api.ApiError(500, 'Server Error')
    vi.mocked(api.putJson).mockRejectedValueOnce(apiError)

    await expect(updateCurrentUsername({ username: 'name' })).rejects.toThrow(apiError)
  })
})
