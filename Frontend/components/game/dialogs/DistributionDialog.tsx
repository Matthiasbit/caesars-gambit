import { useState, useEffect } from 'react'
import Button from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { getColorForOwner } from '@/lib/useOwnerColorMap'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface DistributionDialogProps {
    isOpen: boolean
    availableTroops: number
    onConfirm: (count: number) => void
    onCancel: () => void
    moveDialog: boolean
    attackDialog: boolean
    moveExecuted: boolean
    moveFrom?: string | null
    moveTo?: string | null
    distTo?: string | null
    ownerColorMap: Record<string, string>
    territories: Array<{ territory: string; owner: string | null; troops: number }>
}

export const DistributionDialog: React.FC<DistributionDialogProps> = ({
    isOpen,
    availableTroops,
    onConfirm,
    onCancel,
    moveDialog,
    attackDialog,
    moveExecuted,
    moveFrom,
    moveTo,
    distTo,
    ownerColorMap,
    territories
}) => {
    const [count, setCount] = useState(1)

    useEffect(() => {
        if (isOpen) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCount(1)
        }
    }, [isOpen])

    const handleConfirm = () => {
        if (count > 0 && count <= availableTroops) {
            onConfirm(count)
        }
    }

    const getTerritoryData = (id: string | null) => {
        if (!id) return null
        return territories.find(t => t.territory === id) || null
    }

    const sourceData = moveFrom ? getTerritoryData(moveFrom) : null
    const targetData = moveTo ? getTerritoryData(moveTo) : (distTo ? getTerritoryData(distTo) : null)

    const sourceOwner = sourceData?.owner || null
    const targetOwner = targetData?.owner || null

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
            <DialogContent className="sm:max-w-md bg-[#0b1220] border-blue-500/20 text-white p-8">
                <DialogHeader className="mb-6">
                    <DialogTitle className="text-2xl font-black uppercase tracking-tight mb-2 italic text-center">
                        {moveDialog ? "TRUPPEN VERSCHIEBEN" : attackDialog ? "ANGREIFEN" : "TRUPPEN VERTEILEN"}
                    </DialogTitle>
                    <div className="h-1 w-12 bg-blue-600 rounded-full mx-auto" />
                </DialogHeader>

                {moveDialog && !moveExecuted && (
                    <div className="mb-6 p-3 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold text-center">
                        ⚠️ Achtung: Nach dem Verschieben kannst du in diesem Zug nicht mehr angreifen!
                    </div>
                )}

                <div className="space-y-4 mb-8">
                    {(attackDialog || moveDialog) && (
                        <div className={`p-4 rounded-xl ${attackDialog ? 'bg-red-500/10 border-red-500/20' : 'bg-blue-500/10 border-blue-500/20'} border`}>
                            <div className={`text-[10px] font-bold uppercase tracking-widest ${attackDialog ? 'text-red-400' : 'text-blue-400'} mb-2`}>
                                {attackDialog ? 'Angriff' : 'Verschieben'}
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex flex-col gap-1 items-center flex-1">
                                    <span className="text-slate-400 text-[10px] uppercase font-bold tracking-tight">Von {attackDialog && `(${sourceOwner})`}</span>
                                    <span className="font-bold text-base text-center" style={{ color: sourceOwner ? getColorForOwner(sourceOwner, ownerColorMap) : 'white' }}>
                                        {moveFrom}
                                    </span>
                                </div>
                                
                                <div className="relative flex flex-col items-center px-4">
                                    <div className={`${attackDialog ? 'text-red-500' : 'text-blue-500'} font-black text-xl`}>→</div>
                                    <div className={`absolute -top-2 px-2 py-0.5 rounded-full text-[10px] font-black ${attackDialog ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'} shadow-sm`}>
                                        {count}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1 items-center flex-1">
                                    <span className="text-slate-400 text-[10px] uppercase font-bold tracking-tight">{attackDialog ? 'Ziel' : 'Nach'} {attackDialog && `(${targetOwner})`}</span>
                                    <span className="font-bold text-base text-center" style={{ color: targetOwner ? getColorForOwner(targetOwner, ownerColorMap) : 'white' }}>
                                        {moveTo}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {!attackDialog && !moveDialog && (
                        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-2 text-center">Verteilung</div>
                            <div className="flex flex-col gap-1 items-center">
                                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-tight">Zielgebiet ({targetOwner})</span>
                                <span className="font-bold text-base" style={{ color: targetOwner ? getColorForOwner(targetOwner, ownerColorMap) : 'white' }}>
                                    {distTo}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mb-8">
                    <div className="flex justify-between items-end mb-4">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Anzahl Truppen</label>
                        <div className="text-3xl font-black text-blue-400">{count}</div>
                    </div>
                    
                    {availableTroops > 1 ? (
                        <div className="px-2">
                            <Slider
                                value={[count]}
                                min={1}
                                max={availableTroops}
                                step={1}
                                onValueChange={(vals) => setCount(vals[0])}
                                className="py-4"
                            />
                        </div>
                    ) : (
                        <div className="px-2 py-6 text-center text-slate-500 text-xs italic">
                            Nur eine Option verfügbar
                        </div>
                    )}
                    
                    <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-500">
                        <span>1</span>
                        <span className="uppercase">{availableTroops} Verfügbar</span>
                    </div>
                </div>

                <div className="flex gap-3 mt-8">
                    <Button
                        variant="primary"
                        onClick={handleConfirm}
                        disabled={availableTroops === 0}
                        className="flex-1 h-12 rounded-xl border-none font-bold text-sm uppercase tracking-wider"
                    >
                        Bestätigen
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={onCancel}
                        className="flex-1 h-12 rounded-xl border-none font-bold text-sm uppercase tracking-wider text-slate-400 hover:text-white"
                    >
                        Abbrechen
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
