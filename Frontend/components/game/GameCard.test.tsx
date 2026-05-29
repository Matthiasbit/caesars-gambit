import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'
import { render } from '@testing-library/react'
import GameCard from './GameCard'

vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}))

vi.mock('./TerritoryLabels', () => ({
  TerritoryLabels: () => <div />,
}))

describe('GameCard', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      text: () => Promise.resolve('<svg><path id="region-1" /></svg>'),
    }) as Mock
  })

  it('should load SVG from correct path', async () => {
    render(<GameCard />)
    await new Promise(r => setTimeout(r, 50))
    expect(global.fetch).toHaveBeenCalledWith('/assets/Karte-neutral.svg')
  })

  it('should call onRegionClick when region is clicked', async () => {
    const mockClick = vi.fn()
    const { container } = render(<GameCard onRegionClick={mockClick} />)
    await new Promise(r => setTimeout(r, 50))
    
    const region = container.querySelector('path#region-1') as SVGElement
    region?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    
    expect(mockClick).toHaveBeenCalledWith('region-1')
  })

  it('should handle SVG load error', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    ;(global.fetch as Mock).mockRejectedValueOnce(new Error('SVG not found'))
    
    render(<GameCard />)
    await new Promise(r => setTimeout(r, 50))
    
    expect(consoleError).toHaveBeenCalled()
    consoleError.mockRestore()
  })
})
