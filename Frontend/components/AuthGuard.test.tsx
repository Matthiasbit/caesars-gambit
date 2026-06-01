import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import AuthGuard from './AuthGuard'
import { useRouter, usePathname } from 'next/navigation'

const mockReplace = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    replace: mockReplace,
  })),
  usePathname: vi.fn(),
}))

describe('AuthGuard', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
    mockReplace.mockClear()
  })

  it('should render children and not fetch for public paths', () => {
    vi.mocked(usePathname).mockReturnValue('/')
    
    render(<AuthGuard><div>Children</div></AuthGuard>)
    
    expect(screen.getByText('Children')).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('should fetch currentUser for protected paths and allow access if ok', async () => {
    vi.mocked(usePathname).mockReturnValue('/room/123')
    vi.mocked(fetch).mockResolvedValueOnce({ ok: true } as Response)

    render(<AuthGuard><div>Protected Content</div></AuthGuard>)
    
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/user/currentUser'), expect.anything())
    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })
  })

  it('should redirect to login if fetch fails (403)', async () => {
    vi.mocked(usePathname).mockReturnValue('/room/123')
    vi.mocked(fetch).mockResolvedValueOnce({ ok: false, status: 403 } as Response)

    render(<AuthGuard><div>Protected Content</div></AuthGuard>)
    
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(expect.stringContaining('/auth/login'))
    })
  })

  it('should redirect to login if fetch throws error', async () => {
    vi.mocked(usePathname).mockReturnValue('/room/123')
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

    render(<AuthGuard><div>Protected Content</div></AuthGuard>)
    
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(expect.stringContaining('/auth/login'))
    })
  })
})
