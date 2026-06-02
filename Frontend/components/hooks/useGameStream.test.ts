import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGameStream } from './useGameStream'

describe('useGameStream', () => {
  let mockEventSource: {
    addEventListener: ReturnType<typeof vi.fn>;
    close: ReturnType<typeof vi.fn>;
    onerror: ((event: Event) => unknown) | null;
  }
  
  beforeEach(() => {
    mockEventSource = {
      addEventListener: vi.fn(),
      close: vi.fn(),
      onerror: null,
    }
    
    const MockEventSource = vi.fn(function() {
      return mockEventSource
    })
    
    vi.stubGlobal('EventSource', MockEventSource)
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should initialize EventSource with correct URL', () => {
    renderHook(() => useGameStream('123'))
    
    expect(global.EventSource).toHaveBeenCalledWith(
      expect.stringContaining('/api/game/stream/123'),
      expect.objectContaining({ withCredentials: true })
    )
  })

  it('should update player names on playerJoined event', () => {
    const { result } = renderHook(() => useGameStream('123'))
    
    const playerJoinedCallback = vi.mocked(mockEventSource.addEventListener).mock.calls.find(call => call[0] === 'playerJoined')?.[1] as (event: { data: string }) => void
    
    act(() => {
      playerJoinedCallback({ data: JSON.stringify([{ username: 'Alice', host: true }, { username: 'Bob', host: false }]) })
    })
    
    expect(result.current.playerNames).toEqual(['Alice', 'Bob'])
  })

  it('should update gameStarted on gameStarted event', () => {
    const onGameStarted = vi.fn()
    const { result } = renderHook(() => useGameStream('123', onGameStarted))
    
    const gameStartedCallback = vi.mocked(mockEventSource.addEventListener).mock.calls.find(call => call[0] === 'gameStarted')?.[1] as () => void
    
    act(() => {
      gameStartedCallback()
    })
    
    expect(result.current.gameStarted).toBe(true)
    expect(onGameStarted).toHaveBeenCalled()
  })

  it('should handle attackResult event with delay', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useGameStream('123'))
    
    const attackResultCallback = vi.mocked(mockEventSource.addEventListener).mock.calls.find(call => call[0] === 'attackResult')?.[1] as (event: { data: string }) => void
    
    const attackData = { territoryFrom: 'A', territoryTo: 'B', attackerDice: [6], defenderDice: [1], lostTroopsAttack: 0, lostTroopsDefense: 1, territoryWon: true }
    
    act(() => {
      attackResultCallback({ data: JSON.stringify(attackData) })
    })
    
    expect(result.current.attackResult).toEqual(attackData)
    
    act(() => {
      vi.advanceTimersByTime(5500)
    })
    
    expect(result.current.attackResult).toBeNull()
  })

  it('should close EventSource on unmount', () => {
    const { unmount } = renderHook(() => useGameStream('123'))
    unmount()
    expect(mockEventSource.close).toHaveBeenCalled()
  })
})
