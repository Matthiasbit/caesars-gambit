import { type Ref, useEffect } from 'react'
import type { AttackResult } from '@/components/hooks/useGameStream'
import { getColorForOwner } from '@/lib/useOwnerColorMap'
import ReactDice, { ReactDiceRef } from 'react-dice-complete'

type TerritoryData = {
    territory: string
    owner: string | null
    troops: number
}

type AttackRollDialogProps = {
    attackRollResult: AttackResult | null
    showAttackDice: boolean
    attackRollSequence: number
    diceRefs: Ref<Array<ReactDiceRef | null>>
    onDieRoll: () => void
    territories: TerritoryData[]
    ownerColorMap: Record<string, string>
}

export function AttackRollDialog({
    attackRollResult,
    showAttackDice,
    attackRollSequence,
    diceRefs,
    onDieRoll,
    territories,
    ownerColorMap,
}: AttackRollDialogProps) {
    const attackerDiceCount = attackRollResult?.attackerDice.length ?? 0
    const defenderDiceCount = attackRollResult?.defenderDice.length ?? 0

    const attackerTerritory = attackRollResult
        ? territories.find((territory) => territory.territory === attackRollResult.territoryFrom)
        : undefined
    const defenderTerritory = attackRollResult
        ? territories.find((territory) => territory.territory === attackRollResult.territoryTo)
        : undefined

    const attackerAccent = getColorForOwner(attackerTerritory?.owner ?? null, ownerColorMap)
    const defenderAccent = getColorForOwner(defenderTerritory?.owner ?? null, ownerColorMap)

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
                {/* Attack Direction Header */}
                <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="flex flex-col items-center gap-2">
                        <div
                            className="px-4 py-2 rounded-lg font-semibold text-white"
                            style={{ backgroundColor: attackerAccent }}
                        >
                            {attackerTerritory?.territory}
                        </div>
                        <span className="text-sm text-gray-600">Angreifer</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-2xl">→</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div
                            className="px-4 py-2 rounded-lg font-semibold text-white"
                            style={{ backgroundColor: defenderAccent }}
                        >
                            {defenderTerritory?.territory}
                        </div>
                        <span className="text-sm text-gray-600">Verteidiger</span>
                    </div>
                </div>
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
