import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'
import { joinRoom } from './joinRoom'
import { ApiError } from './api'


describe('joinRoom', () => {
  beforeEach(() => {
    global.fetch = vi.fn() as Mock
  })

  it('should succeed with valid room id', async () => {
    ;(global.fetch as Mock).mockResolvedValueOnce({ ok: true })

    await expect(joinRoom(123)).resolves.toBeUndefined()
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8080/api/rooms/join/123',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ host: false }),
      })
    )
  })

  it('should accept host parameter as true', async () => {
    ;(global.fetch as Mock).mockResolvedValueOnce({ ok: true })

    await joinRoom(123, true)
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8080/api/rooms/join/123',
      expect.objectContaining({
        body: JSON.stringify({ host: true }),
      })
    )
  })

  it('should throw error on 404 room not found', async () => {
    ;(global.fetch as Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
    })

    const request = joinRoom(999)
    await expect(request).rejects.toBeInstanceOf(ApiError)
    await expect(request).rejects.toMatchObject({ status: 404 })
  })
})
