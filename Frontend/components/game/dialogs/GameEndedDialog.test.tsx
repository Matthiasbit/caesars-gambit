import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GameEndedDialog } from './GameEndedDialog'
import { useRouter } from 'next/navigation'

describe('GameEndedDialog', () => {
  const ownerColorMap = { 'Winner': '#ff0000' }
  const roomId = 'room123'

  it('should render correctly when winner is provided', () => {
    render(<GameEndedDialog winner="Winner" ownerColorMap={ownerColorMap} roomId={roomId} />)
    
    expect(screen.getByText('Spiel beendet!')).toBeInTheDocument()
    expect(screen.getByText('Winner')).toBeInTheDocument()
    expect(screen.getByText(/hat das Spiel gewonnen!/)).toBeInTheDocument()
  })

  it('should redirect to home when clicking the button', () => {
    const { push } = useRouter()
    render(<GameEndedDialog winner="Winner" ownerColorMap={ownerColorMap} roomId={roomId} />)
    
    const button = screen.getByRole('button', { name: /Zurück zur Lobby/i })
    fireEvent.click(button)
    
    expect(push).toHaveBeenCalledWith(`/room/${roomId}`)
  })

  it('should not render content when winner is null', () => {
    const { container } = render(<GameEndedDialog winner={null} ownerColorMap={ownerColorMap} roomId={roomId} />)
    expect(container.firstChild).toBeNull()
  })
})
