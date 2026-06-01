import { describe, it, expect, vi } from 'vitest'
import { moveTroops } from './moveTroops'
import * as api from './api'

vi.mock('./api', () => ({
  postJson: vi.fn(),
}))

describe('moveTroops', () => {
  it('should call postJson with correct parameters', async () => {
    const payload = { sum: 5, from: 'Territory A', to: 'Territory B', roomId: 'room1' }
    await moveTroops(payload)
    
    expect(api.postJson).toHaveBeenCalledWith('/api/game/move', {
      from: 'Territory A',
      to: 'Territory B',
      sum: 5,
      roomId: 'room1'
    })
  })
})
