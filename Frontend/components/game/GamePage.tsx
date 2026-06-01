import GameCard from './GameCard'
import { Chat } from '../ui/chat'
import { useEffect, useRef, useState } from 'react'
import { DistributionDialog } from './dialogs/DistributionDialog'
import { GameEndedDialog } from './dialogs/GameEndedDialog'
import { ContinentConqueredDialog } from './dialogs/ContinentConqueredDialog'
import { GameErrorDialog } from './dialogs/GameErrorDialog'
import { AttackRollDialog } from './dialogs/AttackRollDialog'
import { getColorForOwner, useOwnerColorMap } from '@/lib/useOwnerColorMap'
import { distTroops } from '../api/distTroops'
import { useGetCurrentUser } from '../api/getCurrentUser'
import { moveTroops } from '../api/moveTroops'
import { attack } from '../api/attack'
import { endTurn } from '../api/endTurn'
import type { ReactDiceRef } from 'react-dice-complete'
import { AttackResult, EventsourceTypes } from '../hooks/useGameStream'
import { findWayIfPossible, isAdjacent } from '@/lib/territories'
import { GamePhaseTimeline } from './GamePhaseTimeline'

type GamePageProps = {
    roomId: string
    eventsource: EventsourceTypes
}

type TerritoryData = {
    territory: string
    owner: string | null
    troops: number
}

export default function GamePage({ roomId, eventsource }: GamePageProps) {
    const [regionClicked, setRegionClicked] = useState<string | null>(null)
    const [hoveredRegionId, setHoveredRegionId] = useState<string | null>(null)
    const [justConqueredTerritory, setJustConqueredTerritory] = useState<string | null>(null)
    const [dialogTerritory, setDialogTerritory] = useState<string | null>(null);
    const [territories, setTerritories] = useState<TerritoryData[]>([])
    const [moveDialog, setMoveDialog] = useState(false)
    const [moveTroopsCount, setMoveTroopsCount] = useState<number | null>(null)
    const [moveFrom, setMoveFrom] = useState<string | null>(null)
    const [moveTo, setMoveTo] = useState<string | null>(null)
    const [attackDialog, setAttackDialog] = useState(false)
    const [gameError, setGameError] = useState<string | null>(null)
    const ownerColorMap = useOwnerColorMap(eventsource.playerNames)
    const currentUser = useGetCurrentUser()
    const [currentUsername, setCurrentUsername] = useState<string | null>(null)
    const [attackRollResult, setAttackRollResult] = useState<AttackResult | null>(null)
    const [showAttackDice, setShowAttackDice] = useState(false)
    const [attackRollSequence, setAttackRollSequence] = useState(0)
    const [moveExecuted, setMoveExecuted] = useState(false)
    const lastConqueredRef = useRef<string | null>(null)
    const attackDiceRefs = useRef<Array<ReactDiceRef | null>>([])
    const attackRollTotalRef = useRef(0)
    const attackRollCountRef = useRef(0)

    useEffect(() => {
        if (currentUser.isSuccess && currentUser.data) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCurrentUsername(currentUser.data.username);
        }
    }, [currentUser]);

    useEffect(() => {
        attackDiceRefs.current = []
        attackRollCountRef.current = 0

        if (!eventsource.attackResult) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setAttackRollResult(null)
            setShowAttackDice(false)
            attackRollTotalRef.current = 0
            return
        }

        const result = eventsource.attackResult
        attackRollTotalRef.current = result.attackerDice.length + result.defenderDice.length
        setAttackRollResult(result)
        setShowAttackDice(true)
        setAttackRollSequence((prev) => prev + 1)
    }, [eventsource.attackResult]);

    const handleAttackDieRoll = () => {
        attackRollCountRef.current += 1
        const nextCount = attackRollCountRef.current

        if (nextCount >= attackRollTotalRef.current && attackRollResult) {
            setTimeout(() => {
                setShowAttackDice(false)
                setAttackRollResult(null)

                if (attackRollResult.territoryWon && attackRollResult.territoryTo !== lastConqueredRef.current) {
                    lastConqueredRef.current = attackRollResult.territoryTo
                    setJustConqueredTerritory(attackRollResult.territoryTo)
                }

                attackRollCountRef.current = 0
            }, 5000)
        }
    }

    useEffect(() => {
        if (!eventsource.gameStateJson) return
        try {
            const parsed = JSON.parse(eventsource.gameStateJson)
            if (Array.isArray(parsed)) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setTerritories(parsed)
            }
        } catch (err) {
            console.error('Fehler beim Parsen von gameStateJson:', err)
        }
    }, [eventsource.gameStateJson])

    function territoryOwnedByCurrentUser(territoryId: string): boolean {
        const territory = territories.find((t) => t.territory === territoryId)
        return territory?.owner === currentUsername
    }

    function territoryTroopCount(territoryId: string): number {
        const territory = territories.find((t) => t.territory === territoryId)
        return territory ? territory.troops : 0
    }

    function isValidHoverTarget(regionId: string): boolean {
        if (!regionClicked || regionId === regionClicked) {
            return false
        }

        if (territoryOwnedByCurrentUser(regionId)) {
            return findWayIfPossible(regionClicked, regionId, territories, currentUsername)
        }

        return isAdjacent(regionClicked, regionId)
    }

    function showGameError(message: string) {
        setGameError(message)
    }

    function onDistSubmit(territoryId: string) {
        if (!eventsource.gameStateJson || eventsource.pendingDistCount == null) {
            return
        }
        
        if (!territoryOwnedByCurrentUser(territoryId)) {
            showGameError('Diese Region gehört dir nicht. Bitte wähle ein eigenes Gebiet aus.')
            return;
        }

        setDialogTerritory(territoryId)
    }

    async function handleDialogConfirm(num: number) {
        if (!eventsource.gameStateJson || !eventsource.pendingDistCount || !dialogTerritory) {
            return
        }

        try {
            await distTroops({ sum: num, to: dialogTerritory, roomId });
            // @ts-expect-error - kein Plan warum er hier rumheult
            eventsource.setPendingDistCount((prev: number | null) => {
                const remaining = prev !== null ? prev - num : null
                return remaining !== null ? remaining > 0 ? remaining : null : null
            })
            setDialogTerritory(null)
        } catch (err) {
            console.error('Distribution failed:', err)
        }
    }

    async function handleMoveConfirm(num: number) {
        if (!eventsource.gameStateJson || eventsource.currentPlayer !== currentUsername) {
            showGameError('Der Zug ist gerade nicht möglich. Prüfe, ob das Spiel aktiv ist und es dein Zug ist.')
            return
        }
        
        setMoveDialog(false)
        
        try {
            await moveTroops({ sum: num, from: moveFrom!, to: moveTo!, roomId });
            setMoveExecuted(true)
        } catch (err) {
            console.error('Move failed:', err)
            setMoveDialog(true) 
        }
    }

    async function handleAttackConfirm(num: number) {
        if (!eventsource.gameStateJson || eventsource.currentPlayer !== currentUsername) {
            showGameError('Der Zug ist gerade nicht möglich. Prüfe, ob das Spiel aktiv ist und es dein Zug ist.')
            return
        }
        
        setAttackDialog(false)
        
        try {
            await attack({ sum: num, from: moveFrom!, to: moveTo!, roomId });
        } catch (err) {
            console.error('Attack failed:', err)
            setAttackDialog(true) 
        }
    }

    function handleRegionHover(regionId: string | null) {
        if (!regionClicked) {
            setHoveredRegionId(null)
            return
        }

        if (!regionId || regionId === regionClicked) {
            setHoveredRegionId(null)
            return
        }

        setHoveredRegionId(isValidHoverTarget(regionId) ? regionId : null)
    }

    function handleRegionClick(regionId: string) {
        setHoveredRegionId(null)

        if (!eventsource.gameStateJson) {
            showGameError('Das Spiel ist derzeit nicht aktiv.')
            return
        }

        if (eventsource.pendingDistCount && eventsource.pendingDistCount > 0) {
            onDistSubmit(regionId)
            return
        }

        if (eventsource.currentPlayer !== currentUsername) {
            showGameError('Du bist derzeit nicht am Zug.')
            return
        }

        if (regionClicked === regionId) {
            setRegionClicked(null)
            return;
        }

        if (!regionClicked) {
            if (!territoryOwnedByCurrentUser(regionId)) {
                showGameError('Diese Region ist nicht auswählbar.')
                return
            }
            setRegionClicked(regionId)
            return
        }

        if (regionClicked) {
            if (territoryOwnedByCurrentUser(regionId)) {
                if (!findWayIfPossible(regionClicked, regionId, territories, currentUsername)) {
                    showGameError('Für die Bewegung ist kein zusammenhängender Weg vorhanden.')
                    return
                }
                setMoveDialog(true)
                setMoveTroopsCount(territoryTroopCount(regionClicked) - 1)
                setMoveTo(regionId)
                setMoveFrom(regionClicked)
                setRegionClicked(null)
                return;
            }

            if (!isAdjacent(regionClicked, regionId)) {
                showGameError('Die gewählte Region ist nicht benachbart.')
                return
            }

            if(moveExecuted) {
                showGameError('Du hast bereits Truppen bewegt, du darfst nicht mehr angreifen.')
                return
            }

            setAttackDialog(true)
            setMoveTroopsCount(territoryTroopCount(regionClicked) - 1)
            setMoveTo(regionId)
            setMoveFrom(regionClicked)
            setRegionClicked(null)
            return;
        }
    }

    async function handleEndTurn() {
        if (!eventsource.gameStateJson || (eventsource.pendingDistCount || 0) > 0) {
            return
        }
        
        try {
            await endTurn(roomId);
            setMoveExecuted(false)
        } catch (err) {
            console.error('End turn failed:', err)
        }
    }

    return (
        <>
            <GameErrorDialog isOpen={gameError !== null} message={gameError} onClose={() => setGameError(null)} />
            <GameEndedDialog winner={eventsource.gameEnded} ownerColorMap={ownerColorMap} roomId={roomId} />
            <ContinentConqueredDialog 
                data={eventsource.continentConquered} 
                onClose={() => eventsource.setContinentConquered(null)}
            />
            <div style={{ background: '#07142a', height: "100vh", display: "flex", color: "white", width: "100%" }}>
                <div
                    className={`gap-6 rounded-32`}
                    style={{ display: 'flex', flexDirection: 'row', width: '100%', height: 'fit-content', padding: '24px', borderRadius: '12px', boxSizing: 'border-box', alignItems: 'center', background: "rgba(255,255,255,0.02)", border: "1px solid rgba(59,130,246,0.08)", margin: "16px" }}
                >
                    <div className="flex-1 flex flex-col gap-6 min-w-96" style={{ height: 'fit-content', display: 'flex', flexDirection: 'column' }}>

                        <div className="space-y-2 flex-shrink-0">
                            <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgba(189,215,255,0.65)' }}>Spieler</h2>
                            {eventsource.playerNames.map((name, index) => (
                                <div key={index} className="flex items-center gap-3 p-2 rounded-md border border-[rgba(59,130,246,0.1)] hover:border-[rgba(59,130,246,0.3)] transition-colors" style={{ backgroundColor: name === eventsource.currentPlayer ? 'rgba(59, 131, 246, 0.17)' : 'transparent' }}>
                                    <div
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm text-white font-semibold flex-shrink-0"
                                        style={{ backgroundColor: getColorForOwner(name, ownerColorMap) }}
                                    >
                                        {name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="text-sm font-medium truncate">{name} {name === currentUsername && <span>(you)</span>}</div>
                                </div>
                            )
                            )}
                        </div>
                        <GamePhaseTimeline 
                            eventsource={eventsource} 
                            currentUsername={currentUsername} 
                            moveExecuted={moveExecuted}
                            onEndTurn={handleEndTurn}
                        />
                        <div className="flex-grow flex flex-col min-h-0 overflow-hidden">
                            <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgba(189,215,255,0.65)' }}>Chat</h2>
                            <div className="bg-white border rounded-md p-3 shadow-sm flex-grow flex flex-col overflow-hidden w-full">
                                <Chat msg={eventsource.chatMessages} roomId={roomId} />
                            </div>
                        </div>
                    </div>

                    <div className="flex-grow flex flex-col">
                        <div className="relative rounded-xl border border-[rgba(59,130,246,0.25)] bg-black/30 overflow-hidden shadow-md w-full" style={{}}>
                            <GameCard
                                onRegionClick={handleRegionClick}
                                onRegionHover={handleRegionHover}
                                gameStateJson={eventsource.gameStateJson}
                                selectedRegionId={regionClicked}
                                hoveredRegionId={hoveredRegionId}
                                justConqueredTerritory={justConqueredTerritory}
                                onTerritoryAnimationEnd={(territoryId) => {
                                    setJustConqueredTerritory((current) => current === territoryId ? null : current)
                                }}
                                continentConquered={eventsource.continentConquered}
                                playerNames={eventsource.playerNames}
                            />
                            <AttackRollDialog
                                attackRollResult={attackRollResult}
                                showAttackDice={showAttackDice}
                                attackRollSequence={attackRollSequence}
                                diceRefs={attackDiceRefs}
                                onDieRoll={handleAttackDieRoll}
                                territories={territories}
                                ownerColorMap={ownerColorMap}
                            />
                        </div>
                    </div>
                </div>
                <DistributionDialog
                    isOpen={dialogTerritory != null || moveDialog || attackDialog}
                    availableTroops={(moveDialog || attackDialog) ? moveTroopsCount || 0 : eventsource.pendingDistCount || 0}
                    onConfirm={moveDialog ? handleMoveConfirm : attackDialog ? handleAttackConfirm : handleDialogConfirm}
                    onCancel={() => { setDialogTerritory(null); setMoveDialog(false); setAttackDialog(false) }}
                    moveDialog={moveDialog}
                    attackDialog={attackDialog}
                    moveFrom={moveFrom}
                    moveTo={moveTo}
                    distTo={dialogTerritory}
                    ownerColorMap={ownerColorMap}
                    territories={territories}
                />
            </div>
        </>
    )
}
