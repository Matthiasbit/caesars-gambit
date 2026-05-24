import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'
import { sendMessage } from './sendMessage'


describe('sendMessage', () => {
  beforeEach(() => {
    global.fetch = vi.fn() as Mock
  })

  it('should succeed with valid message', async () => {
    ;(global.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: () => Promise.resolve(''),
    })

    await expect(sendMessage({ id: 123, message: 'Hello' })).resolves.toBeUndefined()
  })

  it('should throw error on failed send', async () => {
    ;(global.fetch as Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      text: () => Promise.resolve(''),
    })

    await expect(sendMessage({ id: 123, message: 'Hello' })).rejects.toThrow('API request failed with status')
  })

  it('should send message with correct body and URL', async () => {
    ;(global.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: () => Promise.resolve(''),
    })

    await sendMessage({ id: 789, message: 'Test message' })

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8080/api/rooms/message/789',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ message: 'Test message' }),
      })
    )
  })
})
