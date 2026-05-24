import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'
import { distTroops } from './distTroops'

describe('distTroops', () => {
  beforeEach(() => {
    global.fetch = vi.fn() as Mock
  })

  it('should succeed with valid parameters', async () => {
    ;(global.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: () => Promise.resolve(''),
    })

    await expect(distTroops({ sum: 5, to: 'Palatin', roomId: '123' })).resolves.toBeUndefined()
  })

  it('should throw error on 401 unauthorized', async () => {
    ;(global.fetch as Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      text: () => Promise.resolve(''),
    })
    

    await expect(distTroops({ sum: 5, to: 'Palatin', roomId: '123' })).rejects.toThrow('API request failed with status')
  })

  it('should throw error on 500 server error', async () => {
    ;(global.fetch as Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      text: () => Promise.resolve(''),
    })

    await expect(distTroops({ sum: 5, to: 'Palatin', roomId: '123' })).rejects.toThrow('API request failed with status')
  })

  it('should send correct parameters in body', async () => {
    ;(global.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: () => Promise.resolve(''),
    })

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
