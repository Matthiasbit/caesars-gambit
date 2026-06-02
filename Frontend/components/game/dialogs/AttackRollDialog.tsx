import { type Ref, useEffect, useState } from 'react'
import type { AttackResult } from '@/components/hooks/useGameStream'
import { getColorForOwner } from '@/lib/useOwnerColorMap'
import { SlidingNumber } from '@/components/animate-ui/primitives/texts/sliding-number'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import Button from '@/components/ui/button'
import dynamic from 'next/dynamic'

// Dynamically import ReactDice to avoid "self is not defined" SSR error
const ReactDice = dynamic(() => import('react-dice-complete').then(mod => mod.default), {
    ssr: false,
})

type TerritoryData = {
    territory: string
    owner: string | null
    troops: number
}

type AttackRollDialogProps = {
    attackRollResult: AttackResult | null
    showAttackDice: boolean
    attackRollSequence: number
    diceRefs: Ref<Array<unknown | null>>
    onDieRoll: () => void
    territories: TerritoryData[]
    ownerColorMap: Record<string, string>
    onClose: () => void
}

export function AttackRollDialog({
    attackRollResult,
    showAttackDice,
    attackRollSequence,
    diceRefs,
    onDieRoll,
    territories,
    ownerColorMap,
    onClose,
}: AttackRollDialogProps) {
    const [showResults, setShowResults] = useState(false)
    const [lastSequence, setLastSequence] = useState(attackRollSequence)

    if (attackRollSequence !== lastSequence) {
        setLastSequence(attackRollSequence)
        setShowResults(false)
    }

    const attackerDiceCount = attackRollResult?.attackerDice.length ?? 0

    const attackerTerritoryData = attackRollResult
        ? territories.find((territory) => territory.territory.trim() === attackRollResult.territoryFrom.trim())
        : undefined
    const defenderTerritoryData = attackRollResult
        ? territories.find((territory) => territory.territory.trim() === attackRollResult.territoryTo.trim())
        : undefined

    const attackerAccent = getColorForOwner(attackerTerritoryData?.owner ?? null, ownerColorMap)
    const initialDefenderAccent = getColorForOwner(defenderTerritoryData?.owner ?? null, ownerColorMap)

    useEffect(() => {
        if (!showAttackDice || !attackRollResult) return

        const timer = setTimeout(() => {
            attackRollResult.attackerDice.forEach((value, index) => {
                const diceRef = (diceRefs as React.MutableRefObject<Array<{ rollAll: (vals: number[]) => void } | null>>).current[index]
                diceRef?.rollAll([value])
            })

            attackRollResult.defenderDice.forEach((value, index) => {
                const diceRef = (diceRefs as React.MutableRefObject<Array<{ rollAll: (vals: number[]) => void } | null>>).current[attackerDiceCount + index]
                diceRef?.rollAll([value])
            })
        }, 300)

        return () => clearTimeout(timer)
    }, [attackRollResult, attackerDiceCount, diceRefs, attackRollSequence, showAttackDice])

    const handleInternalDieRoll = () => {
        onDieRoll()
    }

    useEffect(() => {
        if (showAttackDice) {
            const timer = setTimeout(() => {
                    setShowResults(true)
            }, 2500)
            return () => clearTimeout(timer)
        }
    }, [showAttackDice, attackRollSequence])

    if (!attackRollResult) return null

    const isVictory = attackRollResult.territoryWon

    const initialAttackerTroops = attackerTerritoryData?.troops ?? 0
    const initialDefenderTroops = defenderTerritoryData?.troops ?? 0

    const attackerTroopsAfter = initialAttackerTroops - (attackRollResult.lostTroopsAttack || 0)
    // On victory, the remaining attacking troops move to the new territory.
    const defenderTroopsAfter = isVictory 
        ? (attackerDiceCount - (attackRollResult.lostTroopsAttack || 0)) 
        : (initialDefenderTroops - (attackRollResult.lostTroopsDefense || 0))

    const currentDefenderOwner = (showResults && isVictory) ? attackerTerritoryData?.owner : defenderTerritoryData?.owner
    const currentDefenderAccent = (showResults && isVictory) ? attackerAccent : initialDefenderAccent

    return (
        <Dialog open={showAttackDice} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-3xl bg-[#0b1220] border-blue-500/20 text-white p-6 outline-none shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-center text-blue-400 uppercase tracking-widest text-[10px] mb-2">
                        {showResults ? (isVictory ? 'SIEG!' : 'SCHLACHT BEENDET') : 'DIE WÜRFEL FALLEN...'}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex items-center justify-center gap-6 mb-6">
                    <div className="flex flex-col items-center gap-2 flex-1">
                        <div className="text-[9px] font-black uppercase tracking-tight text-slate-500" style={{ color: attackerAccent }}>Angreifer ({attackerTerritoryData?.owner})</div>
                        <div
                            className="px-4 py-2 rounded-lg font-black text-white text-sm shadow-lg border border-white/5 w-full text-center truncate"
                            style={{ backgroundColor: attackerAccent }}
                        >
                            {attackRollResult.territoryFrom}
                        </div>
                        <div className="text-xl font-black h-7">
                            <SlidingNumber 
                                number={showResults ? attackerTroopsAfter : initialAttackerTroops} 
                                fromNumber={showResults ? initialAttackerTroops : undefined}
                                initiallyStable={true}
                            />
                        </div>
                    </div>
                    
                    <div className={`flex flex-col items-center gap-1 transition-all duration-500 ${showResults && isVictory ? 'scale-110' : ''}`}>
                        <div className={`text-3xl font-black ${showResults && isVictory ? 'text-green-500' : 'text-blue-500 animate-pulse'}`}>
                            {showResults && isVictory ? '🏆' : 'VS'}
                        </div>
                        <div className="text-[8px] font-bold text-slate-500 uppercase text-center mt-1">
                           Angriff mit<br/>
                           <span className="text-blue-400 text-xs">{attackerDiceCount} Truppen</span>
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-center gap-2 flex-1">
                        <div className="text-[9px] font-black uppercase tracking-tight text-slate-500" style={{ color: currentDefenderAccent }}>
                            Verteidiger ({currentDefenderOwner})
                        </div>
                        <div
                            className={`px-4 py-2 rounded-lg font-black text-white text-sm shadow-lg border transition-all duration-1000 w-full text-center truncate ${ (showResults && isVictory) ? 'border-green-500/50 animate-pulse' : 'border-white/5'}`}
                            style={{ backgroundColor: currentDefenderAccent }}
                        >
                            {attackRollResult.territoryTo}
                        </div>
                        <div className="text-xl font-black h-7">
                            <SlidingNumber 
                                number={showResults ? defenderTroopsAfter : initialDefenderTroops} 
                                fromNumber={showResults ? initialDefenderTroops : undefined}
                                initiallyStable={true}
                            />
                        </div>
                    </div>
                </div>

                {showResults && (
                    <div className="text-center mb-6 animate-in fade-in zoom-in duration-500">
                        <div className={`text-sm font-black italic uppercase tracking-tighter ${isVictory ? 'text-green-400' : 'text-orange-400'}`}>
                            {isVictory 
                                ? `${attackerTerritoryData?.owner} hat das Gebiet erobert!` 
                                : `Angriff abgewehrt! ${defenderTerritoryData?.owner} hält die Stellung.`}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="space-y-2">
                        <div className="h-0.5 w-8 bg-blue-600 rounded-full mx-auto opacity-50" />
                        <div className="flex flex-wrap justify-center items-center gap-4 min-h-[80px]">
                            {attackRollResult.attackerDice.map((_, index) => (
                                <div key={`attacker-${attackRollSequence}-${index}`} className="flex flex-col items-center">
                                    <ReactDice
                                        key={`attacker-dice-${attackRollSequence}-${index}`}
                                        ref={(diceRef: unknown) => {
                                            if (diceRef && (diceRefs as React.MutableRefObject<Array<unknown | null>>).current) (diceRefs as React.MutableRefObject<Array<unknown | null>>).current[index] = diceRef
                                        }}
                                        dieSize={60}
                                        numDice={1}
                                        rollTime={2}
                                        faceColor={attackerAccent}
                                        dotColor="#fff"
                                        rollDone={handleInternalDieRoll}
                                        disableIndividual
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="h-0.5 w-8 bg-red-600 rounded-full mx-auto opacity-50" />
                        <div className="flex flex-wrap justify-center items-center gap-4 min-h-[80px]">
                            {attackRollResult.defenderDice.map((_, index) => (
                                <div key={`defender-${attackRollSequence}-${index}`} className="flex flex-col items-center">
                                    <ReactDice
                                        key={`defender-dice-${attackRollSequence}-${index}`}
                                        ref={(diceRef: unknown) => {
                                            if (diceRef && (diceRefs as React.MutableRefObject<Array<unknown | null>>).current) (diceRefs as React.MutableRefObject<Array<unknown | null>>).current[attackerDiceCount + index] = diceRef
                                        }}
                                        dieSize={60}
                                        numDice={1}
                                        rollTime={2}
                                        faceColor={initialDefenderAccent}
                                        dotColor="#fff"
                                        rollDone={handleInternalDieRoll}
                                        disableIndividual
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {showResults && (
                    <div className="flex justify-center border-t border-white/5 pt-6">
                        <Button 
                            variant="primary" 
                            onClick={onClose}
                            className="w-auto px-10 text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20"
                        >
                            Schließen
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
