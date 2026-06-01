import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useOwnerColorMap, getColorForOwner } from './useOwnerColorMap'

describe('useOwnerColorMap', () => {
  it('should map player names to colors from the palette', () => {
    const players = ['Player 1', 'Player 2', 'Player 3']
    const { result } = renderHook(() => useOwnerColorMap(players))
    
    expect(result.current['Player 1']).toBe('#e6194b')
    expect(result.current['Player 2']).toBe('#3cb44b')
    expect(result.current['Player 3']).toBe('#ffe119')
  })

  it('should wrap around the palette if there are more players than colors', () => {
    // There are 10 colors in the palette
    const players = Array.from({ length: 11 }, (_, i) => `Player ${i + 1}`)
    const { result } = renderHook(() => useOwnerColorMap(players))
    
    expect(result.current['Player 1']).toBe('#e6194b')
    expect(result.current['Player 11']).toBe('#e6194b')
  })

  it('should return an empty map for an empty player list', () => {
    const { result } = renderHook(() => useOwnerColorMap([]))
    expect(result.current).toEqual({})
  })
})

describe('getColorForOwner', () => {
  const colorMap = {
    'Player 1': '#e6194b',
    'Player 2': '#3cb44b',
  }

  it('should return the correct color for a known owner', () => {
    expect(getColorForOwner('Player 1', colorMap)).toBe('#e6194b')
  })

  it('should return the default color for an unknown owner', () => {
    expect(getColorForOwner('Unknown Player', colorMap)).toBe('#888888')
  })

  it('should return the default color for a null owner', () => {
    expect(getColorForOwner(null, colorMap)).toBe('#666666')
  })
})
