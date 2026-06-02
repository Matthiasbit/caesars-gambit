import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiFetch, getJson, postJson, putJson, ApiError, apiUrl } from './api'

describe('api', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  describe('apiUrl', () => {
    it('should prepend API_BASE if path starts with slash', () => {
      expect(apiUrl('/test')).toContain('/test')
    })
    
    it('should prepend API_BASE and slash if path does not start with slash', () => {
      expect(apiUrl('test')).toContain('/test')
    })
  })

  describe('apiFetch', () => {
    it('should call fetch with correct URL and headers', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify({ success: true })),
      } as Response)

      const result = await apiFetch<{ success: boolean }>('/test')

      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/test'), expect.objectContaining({
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      }))
      expect(result).toEqual({ success: true })
    })

    it('should throw ApiError if response is not ok', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: () => Promise.resolve('Error message'),
      } as Response)

      await expect(apiFetch('/test')).rejects.toThrow(ApiError)
      await expect(apiFetch('/test')).rejects.toMatchObject({
        status: 404,
        message: 'API request failed with status 404 Not Found',
        body: 'Error message',
      })
    })

    it('should return undefined for 204 No Content', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 204,
        text: () => Promise.resolve(''),
      } as Response)

      const result = await apiFetch('/test')
      expect(result).toBeUndefined()
    })

    it('should return raw text if JSON parsing fails', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve('not json'),
      } as Response)

      const result = await apiFetch('/test')
      expect(result).toBe('not json')
    })
  })

  describe('getJson', () => {
    it('should call apiFetch with GET method', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve('{}'),
      } as Response)

      await getJson('/test')
      expect(fetch).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ method: 'GET' }))
    })
  })

  describe('postJson', () => {
    it('should call apiFetch with POST method and body', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve('{}'),
      } as Response)

      await postJson('/test', { key: 'value' })
      expect(fetch).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ key: 'value' }),
      }))
    })
  })

  describe('putJson', () => {
    it('should call apiFetch with PUT method and body', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve('{}'),
      } as Response)

      await putJson('/test', { key: 'value' })
      expect(fetch).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ key: 'value' }),
      }))
    })
  })
})
