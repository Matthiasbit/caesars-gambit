import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { AttackRollDialog } from './AttackRollDialog'

import React from 'react'

// Mock react-dice-complete
vi.mock('react-dice-complete', () => ({
  default: ({ ref }: any) => {
    React.useEffect(() => {
      if (typeof ref === 'function') {
        ref({ rollAll: vi.fn() })
      }
    }, [ref])
    return <div data-testid="react-dice" />
  },
}))

describe('AttackRollDialog', () => {
  const mockOnClose = vi.fn()
  const mockOnDieRoll = vi.fn()
  const diceRefs = { current: [] }
  const ownerColorMap = { 'Attacker': '#ff0000', 'Defender': '#0000ff' }
  const territories = [
    { territory: 'Territory A', owner: 'Attacker', troops: 10 },
    { territory: 'Territory B', owner: 'Defender', troops: 5 },
  ]
  const attackRollResult = {
    attackerDice: [6, 5, 4],
    defenderDice: [3, 2],
    territoryFrom: 'Territory A',
    territoryTo: 'Territory B',
    lostTroopsAttack: 1,
    lostTroopsDefense: 2,
    territoryWon: true,
  }

  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('should render correctly with initial data', () => {
    render(
      <AttackRollDialog
        attackRollResult={attackRollResult}
        showAttackDice={true}
        attackRollSequence={1}
        diceRefs={diceRefs}
        onDieRoll={mockOnDieRoll}
        territories={territories}
        ownerColorMap={ownerColorMap}
        onClose={mockOnClose}
      />
    )

    expect(screen.getByText('DIE WÜRFEL FALLEN...')).toBeInTheDocument()
    expect(screen.getByText('Territory A')).toBeInTheDocument()
    expect(screen.getByText('Territory B')).toBeInTheDocument()
    expect(screen.getByText('Angreifer (Attacker)')).toBeInTheDocument()
    expect(screen.getByText('Verteidiger (Defender)')).toBeInTheDocument()
  })

  it('should show results after a delay', () => {
    render(
      <AttackRollDialog
        attackRollResult={attackRollResult}
        showAttackDice={true}
        attackRollSequence={1}
        diceRefs={diceRefs}
        onDieRoll={mockOnDieRoll}
        territories={territories}
        ownerColorMap={ownerColorMap}
        onClose={mockOnClose}
      />
    )

    act(() => {
      vi.advanceTimersByTime(2500)
    })

    expect(screen.getByText('SIEG!')).toBeInTheDocument()
    expect(screen.getByText('Attacker hat das Gebiet erobert!')).toBeInTheDocument()
  })

  it('should call onClose when clicking the close button after results are shown', () => {
    render(
      <AttackRollDialog
        attackRollResult={attackRollResult}
        showAttackDice={true}
        attackRollSequence={1}
        diceRefs={diceRefs}
        onDieRoll={mockOnDieRoll}
        territories={territories}
        ownerColorMap={ownerColorMap}
        onClose={mockOnClose}
      />
    )

    act(() => {
      vi.advanceTimersByTime(2500)
    })

    const button = screen.getByRole('button', { name: /Schließen/i })
    fireEvent.click(button)
    
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('should not render when attackRollResult is null', () => {
    const { container } = render(
      <AttackRollDialog
        attackRollResult={null}
        showAttackDice={true}
        attackRollSequence={1}
        diceRefs={diceRefs}
        onDieRoll={mockOnDieRoll}
        territories={territories}
        ownerColorMap={ownerColorMap}
        onClose={mockOnClose}
      />
    )
    expect(container.firstChild).toBeNull()
  })
})
