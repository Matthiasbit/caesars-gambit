import '@testing-library/jest-dom'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import React from 'react'

if (!global.fetch) {
  global.fetch = vi.fn()
}

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver

class IntersectionObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.IntersectionObserver = IntersectionObserverMock as unknown as typeof IntersectionObserver

vi.mock('next/dynamic', () => ({
  default: (loader: () => Promise<React.ComponentType | { default: React.ComponentType }>) => {
    let Component: React.ComponentType | null = null
    loader().then((mod) => {
      Component = 'default' in mod ? mod.default : mod
    })
    return (props: Record<string, unknown>) => {
      if (!Component) return null
      return React.createElement(Component, props)
    }
  },
}))

const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
}

const mockUsePathname = vi.fn(() => '/')
const mockUseSearchParams = vi.fn(() => new URLSearchParams())
const mockUseParams = vi.fn(() => ({}))

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => mockUsePathname(),
  useSearchParams: () => mockUseSearchParams(),
  useParams: () => mockUseParams(),
}))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})
