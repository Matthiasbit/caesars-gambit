import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { TerritoryLabels } from './TerritoryLabels'

describe('TerritoryLabels', () => {
  const mockGameState = [
    { territory: 'Palatin', owner: 'Player1', troops: 5 },
    { territory: 'Laterano', owner: 'Player2', troops: 3 },
  ]

  it('should parse and display valid gameStateJson', async () => {
    const { container } = render(<TerritoryLabels gameStateJson={JSON.stringify(mockGameState)} />)
    
    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })

  it('should handle null gameStateJson gracefully', () => {
    const { container } = render(<TerritoryLabels gameStateJson={null} />)
   
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg?.querySelectorAll('g').length).toBe(0)
  })

  it('should handle invalid JSON gracefully', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<TerritoryLabels gameStateJson="invalid { json" />)
    expect(consoleError).toHaveBeenCalled()
    consoleError.mockRestore()
  })

  it('should update when gameStateJson changes', async () => {
    const { rerender } = render(
      <TerritoryLabels gameStateJson={JSON.stringify(mockGameState)} />
    )
    await waitFor(() => expect(screen.getByText('5')).toBeInTheDocument())
    
    rerender(<TerritoryLabels gameStateJson={JSON.stringify([
      { territory: 'Neapel', owner: 'Player1', troops: 10 }
    ])} />)
    
    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument()
    })
  })

  it('should notify hover changes for territory labels', async () => {
    const onTerritoryHover = vi.fn()

    const { container } = render(
      <TerritoryLabels
        gameStateJson={JSON.stringify(mockGameState)}
        onTerritoryHover={onTerritoryHover}
      />
    )

    await waitFor(() => expect(screen.getByText('5')).toBeInTheDocument())

    const territoryGroup = container.querySelector('svg g') as SVGGElement
    fireEvent.mouseEnter(territoryGroup)
    fireEvent.mouseLeave(territoryGroup)

    await waitFor(() => {
      expect(onTerritoryHover).toHaveBeenCalledWith('Palatin')
      expect(onTerritoryHover).toHaveBeenCalledWith(null)
    })
  })
})