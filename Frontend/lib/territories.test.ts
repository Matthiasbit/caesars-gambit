import { describe, expect, it } from 'vitest'
import { findWayIfPossible, getNeighbors, isAdjacent } from './territories'

describe('territory adjacency helpers', () => {
    it('returns true for real neighboring territories', () => {
        expect(isAdjacent('Agualaine', 'Montegro')).toBe(true)
        expect(isAdjacent('Tuskulum', 'Maureniet')).toBe(true)
    })

    it('returns false for non-neighboring territories', () => {
        expect(isAdjacent('Agualaine', 'Tenubra')).toBe(false)
    })

    it('exposes the adjacency list for a territory', () => {
        expect(getNeighbors('Agualaine')).toContain('Montegro')
        expect(getNeighbors('Agualaine')).toContain('Augusta Nemeters')
    })

    it('finds a connected path across owned territories from gameStateJson data', () => {
        const gameState = [
            { territory: 'Agualaine', owner: 'Alice', troops: 2 },
            { territory: 'Tuskulum', owner: 'Alice', troops: 3 },
            { territory: 'Maureniet', owner: 'Alice', troops: 1 },
        ]

        expect(findWayIfPossible('Agualaine', 'Maureniet', gameState, 'Alice')).toBe(true)
    })

    it('rejects movement when the destination is not reachable through owned territories', () => {
        const gameState = [
            { territory: 'Agualaine', owner: 'Alice', troops: 2 },
            { territory: 'Tuskulum', owner: 'Bob', troops: 3 },
            { territory: 'Maureniet', owner: 'Alice', troops: 1 },
        ]

        expect(findWayIfPossible('Agualaine', 'Maureniet', gameState, 'Alice')).toBe(false)
    })
})
