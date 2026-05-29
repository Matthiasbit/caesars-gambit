import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { Ref } from 'react'
import type { ReactDiceRef } from 'react-dice-complete'
import { AttackRollDialog } from './AttackRollDialog'

vi.mock('react-dice-complete', () => {
    const React = require('react')

    return {
        __esModule: true,
        default: React.forwardRef((props: { faceColor?: string }, ref: React.Ref<ReactDiceRef>) => {
            React.useImperativeHandle(ref, () => ({
                rollAll: vi.fn(),
            }))

            return <div data-testid="dice" data-facecolor={props.faceColor} />
        }),
    }
})

describe('AttackRollDialog', () => {
    it('uses the territory owner colors for attacker and defender dice', () => {
        const diceRefs = { current: [] as Array<ReactDiceRef | null> } as Ref<Array<ReactDiceRef | null>>

        render(
            <AttackRollDialog
                attackRollResult={{
                    attackerDice: [6],
                    defenderDice: [4],
                    lostTroopsAttack: 1,
                    lostTroopsDefense: 1,
                    territoryFrom: 'Alaska',
                    territoryTo: 'Canada',
                    territoryWon: false,
                }}
                showAttackDice={true}
                attackRollSequence={1}
                diceRefs={diceRefs}
                onDieRoll={vi.fn()}
                territories={[
                    { territory: 'Alaska', owner: 'Alice', troops: 5 },
                    { territory: 'Canada', owner: 'Bob', troops: 3 },
                ]}
                ownerColorMap={{
                    Alice: '#e6194b',
                    Bob: '#3cb44b',
                }}
            />
        )

        const dice = screen.getAllByTestId('dice')

        expect(dice).toHaveLength(2)
        expect(dice[0]).toHaveAttribute('data-facecolor', '#e6194b')
        expect(dice[1]).toHaveAttribute('data-facecolor', '#3cb44b')
    })
})
