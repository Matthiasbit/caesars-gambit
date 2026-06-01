import GameCard from './GameCard'
import { Chat } from '../ui/chat'
import { useCallback, useEffect, useRef, useState } from 'react'
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

import { Badge } from '@/components/ui/badge'

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

    const territoryOwnedByCurrentUser = useCallback((territoryId: string): boolean => {
        const territory = territories.find((t) => t.territory === territoryId)
        return territory?.owner === currentUsername
    }, [territories, currentUsername])

    function territoryTroopCount(territoryId: string): number {
        const territory = territories.find((t) => t.territory === territoryId)
        return territory ? territory.troops : 0
    }

    const isValidHoverTarget = useCallback((regionId: string): boolean => {
        if (!regionClicked || regionId === regionClicked) {
            return false
        }

        if (territoryOwnedByCurrentUser(regionId)) {
            return findWayIfPossible(regionClicked, regionId, territories, currentUsername)
        }

        return isAdjacent(regionClicked, regionId)
    }, [regionClicked, territories, currentUsername, territoryOwnedByCurrentUser])

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
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setShowAttackDice(false)
            attackRollTotalRef.current = 0
            return
        }

        const result = eventsource.attackResult
        attackRollTotalRef.current = result.attackerDice.length + result.defenderDice.length
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAttackRollResult(result)
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setShowAttackDice(true)
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAttackRollSequence((prev) => prev + 1)
    }, [eventsource.attackResult]);

    const handleAttackDieRoll = () => {
        attackRollCountRef.current += 1
        const nextCount = attackRollCountRef.current

        if (nextCount >= attackRollTotalRef.current && attackRollResult) {
            setTimeout(() => {
                if (attackRollResult.territoryWon && attackRollResult.territoryTo !== lastConqueredRef.current) {
                    lastConqueredRef.current = attackRollResult.territoryTo
                    setJustConqueredTerritory(attackRollResult.territoryTo)
                }
                attackRollCountRef.current = 0
            }, 8000)
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

    const [clickableRegions, setClickableRegions] = useState<string[]>([])

    useEffect(() => {
        if (!eventsource.gameStateJson) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setClickableRegions([])
            return
        }

        if (eventsource.pendingDistCount && eventsource.pendingDistCount > 0) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setClickableRegions(territories.filter(t => t.owner === currentUsername).map(t => t.territory))
            return
        }

        if (eventsource.currentPlayer !== currentUsername) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setClickableRegions([])
            return
        }

        if (!regionClicked) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setClickableRegions(territories.filter(t => t.owner === currentUsername && t.troops >= 2).map(t => t.territory))
        } else {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setClickableRegions(territories.filter(t => isValidHoverTarget(t.territory)).map(t => t.territory))
        }
    }, [eventsource.gameStateJson, eventsource.pendingDistCount, eventsource.currentPlayer, currentUsername, regionClicked, territories, isValidHoverTarget])

    function showGameError(message: string) {
        if (message.includes('403') || message.includes('401')) {
            window.location.assign('/');
            return;
        }
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
        if (!eventsource.gameStateJson || eventsource.currentPlayer !== currentUsername || eventsource.initialPhase) {
            showGameError('Der Zug ist gerade nicht möglich. Prüfe, ob das Spiel aktiv ist und es dein Zug ist.')
            return
        }

        setMoveDialog(false)

        try {
            await moveTroops({ sum: num, from: moveFrom!, to: moveTo!, roomId });
            setMoveExecuted(true)
        } catch (err: unknown) {
            console.error('Move failed:', err)
            let msg = 'Die Truppen konnten nicht verschoben werden.'
            if (err && typeof err === 'object' && err !== null && 'body' in err) {
                try {
                    const body = JSON.parse((err as { body: string }).body)
                    if (body.message) msg = body.message
                } catch {
                    if ((err as { body: string }).body) msg = (err as { body: string }).body
                }
            }
            showGameError(msg)
        }
    }

    async function handleAttackConfirm(num: number) {
        if (!eventsource.gameStateJson || eventsource.currentPlayer !== currentUsername || eventsource.initialPhase) {
            showGameError('Ein Angriff ist gerade nicht möglich. Prüfe, ob das Spiel aktiv ist und es dein Zug ist.')
            return
        }

        setAttackDialog(false)

        try {
            await attack({ sum: num, from: moveFrom!, to: moveTo!, roomId });
        } catch (err: unknown) {
            console.error('Attack failed:', err)
            let msg = 'Der Angriff konnte nicht ausgeführt werden.'
            if (err && typeof err === 'object' && err !== null && 'body' in err) {
                try {
                    const body = JSON.parse((err as { body: string }).body)
                    if (body.message) msg = body.message
                } catch {
                    if ((err as { body: string }).body) msg = (err as { body: string }).body
                }
            }
            showGameError(msg)
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

        if (eventsource.initialPhase) {
            showGameError('Während der Startphase können keine Gebiete angegriffen oder Truppen verschoben werden.')
            return
        }

        if (regionClicked === regionId) {
            setRegionClicked(null)
            return;
        }

        if (!regionClicked) {
            if (!territoryOwnedByCurrentUser(regionId)) {
                showGameError('Du kannst nur deine eigenen Gebiete auswählen.')
                return
            }
            if (territoryTroopCount(regionId) < 2) {
                showGameError('Dieses Gebiet hat nicht genug Truppen (mind. 2 benötigt).')
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

            if (moveExecuted) {
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
        if (!eventsource.gameStateJson || (eventsource.pendingDistCount || 0) > 0 || eventsource.initialPhase) {
            return
        }

        try {
            await endTurn(roomId);
            setMoveExecuted(false)
        } catch (err: unknown) {
            console.error('End turn failed:', err)
            let msg = 'Der Zug konnte nicht beendet werden.'
            if (err && typeof err === 'object' && err !== null && 'body' in err) {
                try {
                    const body = JSON.parse((err as { body: string }).body)
                    if (body.message) msg = body.message
                } catch {
                    if ((err as { body: string }).body) msg = (err as { body: string }).body
                }
            }
            showGameError(msg)
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
            <div className="flex flex-col text-white w-full pb-10 relative z-10 overflow-x-hidden">
                <div
                    className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 p-4 lg:p-8 w-full max-w-[1600px] mx-auto"
                >
                    {/* Sidebar: Players & Timeline */}
                    <div className="flex flex-col gap-6 order-1 lg:order-1 h-fit">
                        <div className="rounded-3xl border border-blue-500/10 bg-slate-900/40 p-6 shadow-2xl backdrop-blur-md">
                            <h2 className="text-[10px] font-bold text-blue-300/70 uppercase tracking-widest mb-6">Spieler</h2>
                            <div className="flex flex-col gap-2">
                                {eventsource.playerNames.map((name, index) => (
                                    <div key={index} className="flex items-center gap-3 p-2.5 rounded-xl border border-blue-500/10 hover:border-blue-500/30 transition-all" style={{ backgroundColor: name === eventsource.currentPlayer ? 'rgba(59, 131, 246, 0.12)' : 'rgba(255,255,255,0.02)' }}>
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs text-white font-black shadow-inner shadow-blue-400/20"
                                            style={{ backgroundColor: getColorForOwner(name, ownerColorMap) }}
                                        >
                                            {name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="text-sm font-bold truncate flex items-center gap-2 text-slate-200">
                                            {name}
                                            {name === currentUsername && <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-[9px] h-4 uppercase tracking-tighter">ICH</Badge>}
                                        </div>
                                    </div>
                                )
                                )}
                            </div>
                        </div>

                        <GamePhaseTimeline
                            eventsource={eventsource}
                            currentUsername={currentUsername}
                            moveExecuted={moveExecuted}
                            onEndTurn={handleEndTurn}
                        />

                        {/* Chat on desktop sidebar */}
                        <div className="hidden lg:flex flex-col rounded-3xl border border-blue-500/10 bg-slate-900/40 p-5 shadow-2xl backdrop-blur-md h-[400px]">
                            <Chat msg={eventsource.chatMessages} roomId={roomId} theme="dark" />
                        </div>
                    </div>

                    {/* Main Content: Map */}
                    <div className="order-2 lg:order-2 flex flex-col gap-6 w-full min-w-0">
                        <div className="relative rounded-3xl border border-blue-500/10 bg-black/40 overflow-hidden shadow-2xl backdrop-blur-sm aspect-[4/3] lg:aspect-auto">
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
                                clickableRegions={clickableRegions}
                            />
                            <AttackRollDialog
                                attackRollResult={attackRollResult}
                                showAttackDice={showAttackDice}
                                attackRollSequence={attackRollSequence}
                                diceRefs={attackDiceRefs}
                                onDieRoll={handleAttackDieRoll}
                                territories={territories}
                                ownerColorMap={ownerColorMap}
                                onClose={() => { setShowAttackDice(false); setAttackRollResult(null) }}
                            />
                        </div>

                        {/* Chat on mobile below map */}
                        <div className="flex lg:hidden flex-col rounded-3xl border border-blue-500/10 bg-slate-900/40 p-5 shadow-2xl backdrop-blur-md h-[350px] order-3">
                            <Chat msg={eventsource.chatMessages} roomId={roomId} theme="dark" />
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
                    moveExecuted={moveExecuted}
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
