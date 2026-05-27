import GameCard from './GameCard'
import { Chat } from '../ui/chat'
import { useEffect, useState } from 'react'
import { DistributionDialog } from './DistributionDialog'
import { getColorForOwner, useOwnerColorMap } from '@/lib/useOwnerColorMap'
import { distTroops } from '../api/distTroops'
import { useGetCurrentUser } from '../api/getCurrentUser'
import { moveTroops } from '../api/moveTroops'
import { attack } from '../api/attack'
import { endTurn } from '../api/endTurn'
import { EventsourceTypes } from '../hooks/useGameStream'
import { findWayIfPossible, isAdjacent } from '@/lib/territories'

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
    const [dialogTerritory, setDialogTerritory] = useState<string | null>(null);
    const [territories, setTerritories] = useState<TerritoryData[]>([])
    const [moveDialog, setMoveDialog] = useState(false)
    const [moveTroopsCount, setMoveTroopsCount] = useState<number | null>(null)
    const [moveFrom, setMoveFrom] = useState<string | null>(null)
    const [moveTo, setMoveTo] = useState<string | null>(null)
    const [attackDialog, setAttackDialog] = useState(false)
    const ownerColorMap = useOwnerColorMap(territories)
    const currentUser = useGetCurrentUser()
    const [currentUsername, setCurrentUsername] = useState<string | null>(null)

    useEffect(() => {
        if (currentUser.isSuccess && currentUser.data) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCurrentUsername(currentUser.data.username);
        }
    }, [currentUser]);

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

    function onDistSubmit(territoryId: string) {
        if (eventsource.pendingDistCount == null) return
        if (!territoryOwnedByCurrentUser(territoryId)) {
            console.log("Hier noch was einbauen für UX")
            return;
        }

        setDialogTerritory(territoryId)
    }

    async function handleDialogConfirm(num: number) {
        if (eventsource.pendingDistCount == null || !dialogTerritory) return

        await distTroops({sum: num, to: dialogTerritory, roomId});
        // @ts-expect-error - kein Plan warum er hier rumheult
        eventsource.setPendingDistCount((prev: number | null) => {
            const remaining = prev !== null ? prev - num : null
            return remaining !== null ? remaining > 0 ? remaining : null : null
        })

        setDialogTerritory(null)
    }

    async function handleMoveConfirm(num: number) {
        setMoveDialog(false)
        await moveTroops({sum: num, from: moveFrom!, to: moveTo!, roomId});
    }

    async function handleAttackConfirm(num: number) {
        setAttackDialog(false)
        await attack({sum: num, from: moveFrom!, to: moveTo!, roomId});

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

        if (!regionClicked && !territoryOwnedByCurrentUser(regionId)) {
            console.log("Hier einbauen, dass nicht eigenes Gebiert ist")
            return
        }

        if (eventsource.pendingDistCount) {
            onDistSubmit(regionId)
            return
        }

        if (regionClicked === regionId) {
            return;
        }
        if (regionClicked) {
            if (territoryOwnedByCurrentUser(regionId)) {
                if (!findWayIfPossible(regionClicked, regionId, territories, currentUsername)) {
                    console.log('Kein zusammenhängender Weg für Bewegung:', regionClicked, regionId)
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
                console.log('Nicht benachbart:', regionClicked, regionId)
                return
            }

            setAttackDialog(true)
            setMoveTroopsCount(territoryTroopCount(regionClicked) - 1)
            setMoveTo(regionId)
            setMoveFrom(regionClicked)
            setRegionClicked(null)
            return;
        }
        console.log('Region angeklickt:', regionId, regionClicked)
        setRegionClicked(regionId)
    }

    async function handleEndTurn() {
        if (eventsource.pendingDistCount) {
            return
        }
        await endTurn(roomId);
    }

    return (
        <>
            {eventsource.pendingDistCount != null && (
                <div style={{ position: 'fixed', right: 16, top: 16, zIndex: 2000 }}>
                    <div className="rounded bg-[#0b1220] border border-[rgba(59,130,246,0.25)] px-4 py-3 text-white shadow">
                        <div className="flex items-center gap-3">
                            <div>
                                <strong>{eventsource.pendingDistCount}</strong> Truppen verteilen — klicke auf ein Gebiet, das du besitzt.
                            </div>
                            <div>
                                <button className="ml-2 px-2 py-1 bg-red-600 rounded" onClick={() => eventsource.setPendingDistCount(null)}>Abbrechen</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <div style={{ background: '#07142a', height: "100vh", display: "flex", color: "white", width: "100%" }}>
                <div
                    className={`gap-6 rounded-32`}
                    style={{ display: 'flex', flexDirection: 'row', width: '100%', height: 'fit-content', padding: '24px', borderRadius: '12px', boxSizing: 'border-box', alignItems: 'center', background: "rgba(255,255,255,0.02)", border: "1px solid rgba(59,130,246,0.08)", margin: "16px" }}
                >
                    <div className="flex-1 flex flex-col gap-6 min-w-96" style={{ height: 'fit-content', display: 'flex', flexDirection: 'column' }}>

                        <div className="space-y-2 flex-shrink-0">
                            <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgba(189,215,255,0.65)' }}>Spieler</h2>
                            {eventsource.playerNames.map((name, index) => (
                                <div key={index} className="flex items-center gap-3 p-2 rounded-md border border-[rgba(59,130,246,0.1)] hover:border-[rgba(59,130,246,0.3)] transition-colors">
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
                            />
                            <button onClick={() => handleEndTurn()}>EndTurn</button>
                        </div>
                    </div>
                </div>
                <DistributionDialog
                    isOpen={dialogTerritory != null || moveDialog || attackDialog}
                    territoryName={moveDialog ? "Truppen hierhin verschieben " + moveTo : attackDialog ? "Truppen angreifen " + moveTo : dialogTerritory || ""}
                    availableTroops={(moveDialog || attackDialog) ? moveTroopsCount || 0 : eventsource.pendingDistCount || 0}
                    onConfirm={moveDialog ? handleMoveConfirm : attackDialog ? handleAttackConfirm : handleDialogConfirm}
                    onCancel={() => { setDialogTerritory(null); setMoveDialog(false); setAttackDialog(false) }}
                    moveDialog={moveDialog}
                    attackDialog={attackDialog}
                />
            </div>
        </>
    )
}
