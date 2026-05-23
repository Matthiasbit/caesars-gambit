import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'
import { startGame } from './startGame'


describe('startGame', () => {
  beforeEach(() => {
    global.fetch = vi.fn() as Mock
  })

  it('should succeed with valid room id', async () => {
    ;(global.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
    })

    await expect(startGame(123)).resolves.toBeUndefined()
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8080/api/rooms/start/123',
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('should throw error on 401 unauthorized', async () => {
    ;(global.fetch as Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
    })

    // Todo: Error Message funktioniert so glaube ich nicht müsste in component und hier jenachdem angepasst werden
    
    await expect(startGame(123)).rejects.toThrow('Failed to start game')
  })

  it('should throw error on 404 room not found', async () => {
    ;(global.fetch as Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
    })

    await expect(startGame(999)).rejects.toThrow('Failed to start game')
  })
})
