import { describe, it, expect, vi } from 'vitest'
import { attack } from './attack'
import * as api from './api'

vi.mock('./api', () => ({
  postJson: vi.fn(),
}))

describe('attack', () => {
  it('should call postJson with correct parameters', async () => {
    const payload = { sum: 3, from: 'Territory A', to: 'Territory B', roomId: 'room1' }
    await attack(payload)
    
    expect(api.postJson).toHaveBeenCalledWith('/api/game/attack', {
      from: 'Territory A',
      to: 'Territory B',
      sum: 3,
      roomId: 'room1'
    })
  })
})
