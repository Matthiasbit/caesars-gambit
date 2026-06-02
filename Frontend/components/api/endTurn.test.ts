import { describe, it, expect, vi } from 'vitest'
import { endTurn } from './endTurn'
import * as api from './api'

vi.mock('./api', () => ({
  postJson: vi.fn(),
}))

describe('endTurn', () => {
  it('should call postJson with correct parameters', async () => {
    await endTurn('room1')
    
    expect(api.postJson).toHaveBeenCalledWith('/api/game/endTurn', { roomId: 'room1' })
  })
})
