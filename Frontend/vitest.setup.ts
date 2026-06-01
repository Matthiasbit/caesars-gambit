import '@testing-library/jest-dom'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

if (!global.fetch) {
  global.fetch = vi.fn()
}

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserverMock

class IntersectionObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.IntersectionObserver = IntersectionObserverMock

vi.mock('next/dynamic', () => ({
  default: (loader: any) => {
    const React = require('react')
    let Component: any = null
    loader().then((mod: any) => {
      Component = mod.default || mod
    })
    return (props: any) => {
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
