import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'
import { leaveRoom } from './leaveRoom'
import { ApiError } from './api'

describe('leaveRoom', () => {
  beforeEach(() => {
    global.fetch = vi.fn() as Mock
  })

  it('should succeed with valid room id', async () => {
    ;(global.fetch as Mock).mockResolvedValueOnce({ ok: true })

    await expect(leaveRoom(123)).resolves.toBeUndefined()
  })

  it('should throw error on 401 unauthorized', async () => {
    ;(global.fetch as Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
    })

    // TODO: Error Message muss in dazugehöriger component angepasst werden

    const request = leaveRoom(123)
    await expect(request).rejects.toBeInstanceOf(ApiError)
    await expect(request).rejects.toMatchObject({ status: 401 })
  })

  it('should throw error on 404 room not found', async () => {
    ;(global.fetch as Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
    })

    const request = leaveRoom(999)
    await expect(request).rejects.toBeInstanceOf(ApiError)
    await expect(request).rejects.toMatchObject({ status: 404 })
  })

  it('should call correct URL with room id', async () => {
    ;(global.fetch as Mock).mockResolvedValueOnce({ ok: true })

    await leaveRoom(456)

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8080/api/rooms/leave/456',
      expect.objectContaining({ method: 'POST' })
    )
})})
