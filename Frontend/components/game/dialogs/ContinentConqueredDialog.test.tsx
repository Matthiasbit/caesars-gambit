import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ContinentConqueredDialog } from './ContinentConqueredDialog'

describe('ContinentConqueredDialog', () => {
  const mockOnClose = vi.fn()
  const data = { player: 'Player 1', continent: 'BLAUE_KUESTE' }

  it('should render correctly when open', () => {
    render(<ContinentConqueredDialog data={data} onClose={mockOnClose} />)
    
    expect(screen.getByText('Kontinent erobert!')).toBeInTheDocument()
    expect(screen.getByText('Player 1')).toBeInTheDocument()
    expect(screen.getByText('BLAUE_KUESTE')).toBeInTheDocument()
  })

  it('should call onClose when the button is clicked', () => {
    render(<ContinentConqueredDialog data={data} onClose={mockOnClose} />)
    
    const button = screen.getByRole('button', { name: /Fortfahren/i })
    fireEvent.click(button)
    
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('should not render content when data is null', () => {
    const { container } = render(<ContinentConqueredDialog data={null} onClose={mockOnClose} />)
    expect(container.firstChild).toBeNull()
  })
})
