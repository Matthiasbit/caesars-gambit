import { type Ref, useEffect } from 'react'
import type { AttackResult } from '@/components/hooks/useGameStream'
import ReactDice, { ReactDiceRef } from 'react-dice-complete'

type AttackRollDialogProps = {
    attackRollResult: AttackResult | null
    showAttackDice: boolean
    attackRollSequence: number
    diceRefs: Ref<Array<ReactDiceRef | null>>
    onDieRoll: () => void
}

const attackerAccent = '#ef4444'
const defenderAccent = '#2563eb'

export function AttackRollDialog({
    attackRollResult,
    showAttackDice,
    attackRollSequence,
    diceRefs,
    onDieRoll,
}: AttackRollDialogProps) {
    const attackerDiceCount = attackRollResult?.attackerDice.length ?? 0
    const defenderDiceCount = attackRollResult?.defenderDice.length ?? 0

    useEffect(() => {
        if (!showAttackDice || !attackRollResult) return

        attackRollResult.attackerDice.forEach((value, index) => {
            // @ts-expect-error - We know that the refs will be set at this point, but TypeScript doesn't
            const diceRef = diceRefs.current[index]
            diceRef?.rollAll([value])
        })

        attackRollResult.defenderDice.forEach((value, index) => {
            // @ts-expect-error - We know that the refs will be set at this point, but TypeScript doesn't
            const diceRef = diceRefs.current[attackerDiceCount + index]
            diceRef?.rollAll([value])
        })
    }, [attackRollResult, attackerDiceCount, diceRefs, attackRollSequence, showAttackDice])

    if (!showAttackDice || !attackRollResult) return null

    return (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
            <div className="pointer-events-auto space-y-6 p-6 ">
                <div className="space-y-8">
                <div
                    className="grid w-full items-center gap-8"
                    style={{ gridTemplateColumns: `repeat(${attackerDiceCount}, minmax(0, 1fr))` }}
                >
                    {attackRollResult.attackerDice.map((value, index) => (
                        <div key={`attacker-${attackRollSequence}-${index}`} className="flex flex-col items-center gap-8 mx-4">
                            <ReactDice
                                key={`attacker-dice-${attackRollSequence}-${index}`}
                                ref={(diceRef) => {
                                    // @ts-expect-error - We know that the refs will be set at this point, but TypeScript doesn't
                                    diceRefs.current[index] = diceRef
                                }}
                                dieSize={120}
                                numDice={1}
                                rollTime={3}
                                faceColor={attackerAccent}
                                dotColor="#fff"
                                rollDone={onDieRoll}
                                disableIndividual
                            />
                        </div>
                    ))}
                </div>
                <div
                    className="grid w-full items-center gap-8 mt-12"
                    style={{ gridTemplateColumns: `repeat(${defenderDiceCount}, minmax(0, 1fr))` }}
                >
                    {attackRollResult.defenderDice.map((value, index) => (
                        <div key={`defender-${attackRollSequence}-${index}`} className="flex flex-col items-center">
                            <ReactDice
                                key={`defender-dice-${attackRollSequence}-${index}`}
                                ref={(diceRef) => {
                                    // @ts-expect-error - We know that the refs will be set at this point, but TypeScript doesn't
                                    diceRefs.current[attackerDiceCount + index] = diceRef
                                }}
                                dieSize={120}
                                numDice={1}
                                rollTime={3}
                                faceColor={defenderAccent}
                                dotColor="#fff"
                                rollDone={onDieRoll}
                                disableIndividual
                            />
                        </div>
                    ))}
                </div>
                </div>
            </div>
        </div>
    )
}
