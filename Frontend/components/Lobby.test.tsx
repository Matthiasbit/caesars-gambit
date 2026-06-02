import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Lobby } from './Lobby'
import { useGetCurrentUser } from './api/getCurrentUser'
import { startGame } from './api/startGame'
import { leaveRoom } from './api/leaveRoom'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { EventsourceTypes } from './hooks/useGameStream'

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
  const mockRouter = { push: vi.fn() } as unknown as AppRouterInstance
  const eventsource = {
    playerNames: ['Player 1', 'Player 2'],
    chatMessages: [],
    setGameStarted: vi.fn(),
    gameStarted: false,
    gameStateJson: null,
    pendingDistCount: null,
    currentPlayer: null,
    initialPhase: false,
    continentConquered: null,
    attackResult: null,
    gameEnded: null,
    setContinentConquered: vi.fn(),
    setAttackResult: vi.fn(),
    setPendingDistCount: vi.fn(),
  } as unknown as EventsourceTypes

  it('should render player names and room info', () => {
    vi.mocked(useGetCurrentUser).mockReturnValue({ data: { username: 'Player 1' } } as unknown as ReturnType<typeof useGetCurrentUser>)
    
    render(<Lobby roomId={roomId} eventsource={eventsource} router={mockRouter} />)
    
    expect(screen.getByText('Room #123')).toBeInTheDocument()
    expect(screen.getByText('Player 1')).toBeInTheDocument()
    expect(screen.getByText('Player 2')).toBeInTheDocument()
    expect(screen.getByText('STAB')).toBeInTheDocument() // Badge for current user
  })

  it('should disable start button if less than 2 players', () => {
    vi.mocked(useGetCurrentUser).mockReturnValue({ data: { username: 'Player 1' } } as unknown as ReturnType<typeof useGetCurrentUser>)
    const emptyEventsource = { ...eventsource, playerNames: ['Player 1'] }
    
    render(<Lobby roomId={roomId} eventsource={emptyEventsource} router={mockRouter} />)
    
    const startButton = screen.getByRole('button', { name: /Spiel Starten/i })
    expect(startButton).toBeDisabled()
  })

  it('should call startGame and setGameStarted when clicking start', async () => {
    vi.mocked(useGetCurrentUser).mockReturnValue({ data: { username: 'Player 1' } } as unknown as ReturnType<typeof useGetCurrentUser>)
    
    render(<Lobby roomId={roomId} eventsource={eventsource} router={mockRouter} />)
    
    const startButton = screen.getByRole('button', { name: /Spiel Starten/i })
    fireEvent.click(startButton)
    
    expect(startGame).toHaveBeenCalledWith(123)
    await waitFor(() => {
      expect(eventsource.setGameStarted).toHaveBeenCalledWith(true)
    })
  })

  it('should call leaveRoom and redirect when clicking leave', async () => {
    vi.mocked(useGetCurrentUser).mockReturnValue({ data: { username: 'Player 1' } } as unknown as ReturnType<typeof useGetCurrentUser>)
    
    render(<Lobby roomId={roomId} eventsource={eventsource} router={mockRouter} />)
    
    const leaveButton = screen.getByRole('button', { name: /Raum verlassen/i })
    fireEvent.click(leaveButton)
    
    expect(leaveRoom).toHaveBeenCalledWith(123)
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/')
    })
  })
})
