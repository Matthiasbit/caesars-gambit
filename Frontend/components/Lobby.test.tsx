import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Lobby } from './Lobby'
import { useGetCurrentUser } from './api/getCurrentUser'
import { startGame } from './api/startGame'
import { leaveRoom } from './api/leaveRoom'

vi.mock('./api/getCurrentUser', () => ({
  useGetCurrentUser: vi.fn(),
}))

vi.mock('./api/startGame', () => ({
  startGame: vi.fn(),
}))

vi.mock('./api/leaveRoom', () => ({
  leaveRoom: vi.fn(),
}))

vi.mock('./ui/chat', () => ({
  Chat: () => <div data-testid="chat" />,
}))

describe('Lobby', () => {
  const roomId = '123'
  const mockRouter = { push: vi.fn() } as any
  const eventsource = {
    playerNames: ['Player 1', 'Player 2'],
    chatMessages: [],
    setGameStarted: vi.fn(),
  } as any

  it('should render player names and room info', () => {
    vi.mocked(useGetCurrentUser).mockReturnValue({ data: { username: 'Player 1' } } as any)
    
    render(<Lobby roomId={roomId} eventsource={eventsource} router={mockRouter} />)
    
    expect(screen.getByText('Operationszentrum #123')).toBeInTheDocument()
    expect(screen.getByText('Player 1')).toBeInTheDocument()
    expect(screen.getByText('Player 2')).toBeInTheDocument()
    expect(screen.getByText('STAB')).toBeInTheDocument() // Badge for current user
  })

  it('should disable start button if less than 2 players', () => {
    vi.mocked(useGetCurrentUser).mockReturnValue({ data: { username: 'Player 1' } } as any)
    const emptyEventsource = { ...eventsource, playerNames: ['Player 1'] }
    
    render(<Lobby roomId={roomId} eventsource={emptyEventsource} router={mockRouter} />)
    
    const startButton = screen.getByRole('button', { name: /Feldzug Starten/i })
    expect(startButton).toBeDisabled()
  })

  it('should call startGame and setGameStarted when clicking start', async () => {
    vi.mocked(useGetCurrentUser).mockReturnValue({ data: { username: 'Player 1' } } as any)
    
    render(<Lobby roomId={roomId} eventsource={eventsource} router={mockRouter} />)
    
    const startButton = screen.getByRole('button', { name: /Feldzug Starten/i })
    fireEvent.click(startButton)
    
    expect(startGame).toHaveBeenCalledWith(123)
    await waitFor(() => {
      expect(eventsource.setGameStarted).toHaveBeenCalledWith(true)
    })
  })

  it('should call leaveRoom and redirect when clicking leave', async () => {
    vi.mocked(useGetCurrentUser).mockReturnValue({ data: { username: 'Player 1' } } as any)
    
    render(<Lobby roomId={roomId} eventsource={eventsource} router={mockRouter} />)
    
    const leaveButton = screen.getByRole('button', { name: /Raum verlassen/i })
    fireEvent.click(leaveButton)
    
    expect(leaveRoom).toHaveBeenCalledWith(123)
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/')
    })
  })
})
