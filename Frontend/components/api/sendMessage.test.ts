import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'
import { sendMessage } from './sendMessage'
import { ApiError } from './api'


describe('sendMessage', () => {
  beforeEach(() => {
    global.fetch = vi.fn() as Mock
  })

  it('should succeed with valid message', async () => {
    ;(global.fetch as Mock).mockResolvedValueOnce({ ok: true })

    await expect(sendMessage({ id: 123, message: 'Hello' })).resolves.toBeUndefined()
  })

  it('should throw error on failed send', async () => {
    ;(global.fetch as Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    })

    const request = sendMessage({ id: 123, message: 'Hello' })
    await expect(request).rejects.toBeInstanceOf(ApiError)
    await expect(request).rejects.toMatchObject({ status: 500 })
  })

  it('should send message with correct body and URL', async () => {
    ;(global.fetch as Mock).mockResolvedValueOnce({ ok: true })

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
