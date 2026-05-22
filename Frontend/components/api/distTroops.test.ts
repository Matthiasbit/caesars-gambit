import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'
import { distTroops } from './distTroops'
import { ApiError } from './api'

describe('distTroops', () => {
  beforeEach(() => {
    global.fetch = vi.fn() as Mock
  })

  it('should succeed with valid parameters', async () => {
    ;(global.fetch as Mock).mockResolvedValueOnce({
      ok: true,
    })

    await expect(distTroops({ sum: 5, to: 'Palatin', roomId: '123' })).resolves.toBeUndefined()
  })

  it('should throw error on 401 unauthorized', async () => {
    ;(global.fetch as Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
    })
    

    const request = distTroops({ sum: 5, to: 'Palatin', roomId: '123' })
    await expect(request).rejects.toBeInstanceOf(ApiError)
    await expect(request).rejects.toMatchObject({ status: 401 })
  })

  it('should throw error on 500 server error', async () => {
    ;(global.fetch as Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    })

    const request = distTroops({ sum: 5, to: 'Palatin', roomId: '123' })
    await expect(request).rejects.toBeInstanceOf(ApiError)
    await expect(request).rejects.toMatchObject({ status: 500 })
  })

  it('should send correct parameters in body', async () => {
    ;(global.fetch as Mock).mockResolvedValueOnce({ ok: true })

    await distTroops({ sum: 5, to: 'Palatin', roomId: '123' })

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8080/api/game/distTroops',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ to: 'Palatin', sum: 5, roomId: '123' }),
      })
    )
  })
})
