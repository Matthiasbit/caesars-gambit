import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'
import { leaveRoom } from './leaveRoom'

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

    await expect(leaveRoom(123)).rejects.toThrow('Failed to leave room')
  })

  it('should throw error on 404 room not found', async () => {
    ;(global.fetch as Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
    })

    await expect(leaveRoom(999)).rejects.toThrow('Failed to leave room')
  })

  it('should call correct URL with room id', async () => {
    ;(global.fetch as Mock).mockResolvedValueOnce({ ok: true })

    await leaveRoom(456)

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8080/api/rooms/leave/456',
      expect.objectContaining({ method: 'POST' })
    )
})})
