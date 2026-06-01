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
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-[4000]">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <div className="relative pointer-events-auto space-y-6 p-10 rounded-3xl border border-blue-500/20 bg-[#0b1220] shadow-2xl max-w-4xl w-full mx-4">
                {/* Attack Direction Header */}
                <div className="flex items-center justify-center gap-12 mb-8">
                    <div className="flex flex-col items-center gap-3">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Angreifer</div>
                        <div
                            className="px-6 py-3 rounded-xl font-black text-white text-lg shadow-lg"
                            style={{ backgroundColor: attackerAccent }}
                        >
                            {attackerTerritory?.territory}
                        </div>
                    </div>
                    
                    <div className="text-4xl font-black text-blue-500 animate-pulse">VS</div>
                    
                    <div className="flex flex-col items-center gap-3">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verteidiger</div>
                        <div
                            className="px-6 py-3 rounded-xl font-black text-white text-lg shadow-lg"
                            style={{ backgroundColor: defenderAccent }}
                        >
                            {defenderTerritory?.territory}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-12">
                    {/* Attacker Dice Area */}
                    <div className="space-y-4">
                        <div className="h-1 w-12 bg-blue-600 rounded-full mx-auto" />
                        <div
                            className="flex flex-wrap justify-center items-center gap-6"
                        >
                            {attackRollResult.attackerDice.map((_, index) => (
                                <div key={`attacker-${attackRollSequence}-${index}`} className="flex flex-col items-center">
                                    <ReactDice
                                        key={`attacker-dice-${attackRollSequence}-${index}`}
                                        ref={(diceRef) => {
                                            // @ts-expect-error - We know that the refs will be set at this point, but TypeScript doesn't
                                            diceRefs.current[index] = diceRef
                                        }}
                                        dieSize={80}
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
                    </div>

                    {/* Defender Dice Area */}
                    <div className="space-y-4">
                        <div className="h-1 w-12 bg-red-600 rounded-full mx-auto" />
                        <div
                            className="flex flex-wrap justify-center items-center gap-6"
                        >
                            {attackRollResult.defenderDice.map((_, index) => (
                                <div key={`defender-${attackRollSequence}-${index}`} className="flex flex-col items-center">
                                    <ReactDice
                                        key={`defender-dice-${attackRollSequence}-${index}`}
                                        ref={(diceRef) => {
                                            // @ts-expect-error - We know that the refs will be set at this point, but TypeScript doesn't
                                            diceRefs.current[attackerDiceCount + index] = diceRef
                                        }}
                                        dieSize={80}
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
                
                <div className="pt-8 text-center text-[10px] font-black uppercase tracking-[0.3em] text-blue-400/50">
                    Schlacht im Gange...
                </div>
            </div>
        </div>
    )
}
