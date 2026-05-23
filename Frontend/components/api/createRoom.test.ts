import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'
import { createRoom } from './createRoom'


describe('createRoom', () => {
  beforeEach(() => {
    global.fetch = vi.fn() as Mock
  })

  it('should return room data on success', async () => {
    const mockRoomData = { id: 123, name: 'Test Room', players: [] }
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    ;(global.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockRoomData),
    })
    try {
      const result = await createRoom()
      expect(result).toEqual(mockRoomData)
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/rooms/create',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        })
      )
    } finally {
      consoleLogSpy.mockRestore()
    }
  })

  it('should throw error on 401 unauthorized', async () => {
    ;(global.fetch as Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
    })

    await expect(createRoom()).rejects.toThrow('Failed to create room')
  })

  it('should throw error on 500 server error', async () => {
    ;(global.fetch as Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    })

    await expect(createRoom()).rejects.toThrow('Failed to create room')
  })

})
