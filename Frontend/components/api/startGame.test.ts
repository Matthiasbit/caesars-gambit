import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'
import { startGame } from './startGame'
import { ApiError } from './api'


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
    
    const request = startGame(123)
    await expect(request).rejects.toBeInstanceOf(ApiError)
    await expect(request).rejects.toMatchObject({ status: 401 })
  })

  it('should throw error on 404 room not found', async () => {
    ;(global.fetch as Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
    })

    const request = startGame(999)
    await expect(request).rejects.toBeInstanceOf(ApiError)
    await expect(request).rejects.toMatchObject({ status: 404 })
  })
})
