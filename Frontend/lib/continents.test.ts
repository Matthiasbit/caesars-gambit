import { describe, it, expect } from 'vitest'
import { getContinentForTerritory, CONTINENTS } from './continents'

describe('continents', () => {
  it('should return the correct continent for a given territory', () => {
    expect(getContinentForTerritory('Palatin')).toBe('BLAUE_KUESTE')
    expect(getContinentForTerritory('Toscana + Unburia')).toBe('ANTIKENHERZ')
    expect(getContinentForTerritory('Eichenwald')).toBe('WESTKUESTE')
    expect(getContinentForTerritory('Aquitane')).toBe('NORDOSTEN')
    expect(getContinentForTerritory('Felsdüne')).toBe('SUEDMITTE')
    expect(getContinentForTerritory('Alabre Kuste')).toBe('SUEDOSTEN')
  })

  it('should return null for an unknown territory', () => {
    expect(getContinentForTerritory('Unknown Territory')).toBeNull()
  })

  it('should have the correct number of continents', () => {
    expect(Object.keys(CONTINENTS)).toHaveLength(6)
  })

  it('should have territories defined for each continent', () => {
    for (const continent of Object.values(CONTINENTS)) {
      expect(continent.territories.length).toBeGreaterThan(0)
    }
  })
})
