import { useState, useEffect } from 'react'
import Button from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { getColorForOwner } from '@/lib/useOwnerColorMap'

interface DistributionDialogProps {
    isOpen: boolean
    availableTroops: number
    onConfirm: (count: number) => void
    onCancel: () => void
    moveDialog: boolean
    attackDialog: boolean
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

    if (!isOpen) return null

    const handleConfirm = () => {
        if (count > 0 && count <= availableTroops) {
            onConfirm(count)
        }
    }

    const getTerritoryOwner = (id: string | null) => {
        if (!id) return null
        return territories.find(t => t.territory === id)?.owner || null
    }

    const sourceOwner = moveFrom ? getTerritoryOwner(moveFrom) : null
    const targetOwner = moveTo ? getTerritoryOwner(moveTo) : (distTo ? getTerritoryOwner(distTo) : null)

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[3000] p-4" onClick={onCancel}>
            <div 
                className="w-full max-w-md rounded-2xl border border-blue-500/20 bg-[#0b1220] p-8 shadow-2xl text-white"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-6">
                    <h2 className="text-2xl font-black uppercase tracking-tight mb-2 italic">
                        {moveDialog ? "Truppen verschieben" : attackDialog ? "Truppen angreifen" : "Truppen verteilen"}
                    </h2>
                    <div className="h-1 w-12 bg-blue-600 rounded-full" />
                </div>

                <div className="space-y-4 mb-8">
                    {attackDialog && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-red-400 mb-2">Angriff</div>
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex flex-col gap-1">
                                    <span className="text-slate-400 text-xs">Von</span>
                                    <span className="font-bold" style={{ color: sourceOwner ? getColorForOwner(sourceOwner, ownerColorMap) : 'white' }}>
                                        {moveFrom}
                                    </span>
                                </div>
                                <div className="text-red-500 font-black">→</div>
                                <div className="flex flex-col gap-1 text-right">
                                    <span className="text-slate-400 text-xs">Ziel</span>
                                    <span className="font-bold" style={{ color: targetOwner ? getColorForOwner(targetOwner, ownerColorMap) : 'white' }}>
                                        {moveTo}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {moveDialog && (
                        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-2">Verschieben</div>
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex flex-col gap-1">
                                    <span className="text-slate-400 text-xs">Von</span>
                                    <span className="font-bold" style={{ color: sourceOwner ? getColorForOwner(sourceOwner, ownerColorMap) : 'white' }}>
                                        {moveFrom}
                                    </span>
                                </div>
                                <div className="text-blue-500 font-black">→</div>
                                <div className="flex flex-col gap-1 text-right">
                                    <span className="text-slate-400 text-xs">Nach</span>
                                    <span className="font-bold" style={{ color: targetOwner ? getColorForOwner(targetOwner, ownerColorMap) : 'white' }}>
                                        {moveTo}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {!attackDialog && !moveDialog && (
                        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-2">Verteilung</div>
                            <div className="flex flex-col gap-1">
                                <span className="text-slate-400 text-xs">Zielgebiet</span>
                                <span className="font-bold" style={{ color: targetOwner ? getColorForOwner(targetOwner, ownerColorMap) : 'white' }}>
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
                    
                    <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-500">
                        <span>1</span>
                        <span>{availableTroops} VERFÜGBAR</span>
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
                        className="flex-1 h-12 rounded-xl border-none font-bold text-sm uppercase tracking-wider"
                    >
                        Abbrechen
                    </Button>
                </div>
            </div>
        </div>
    )
}
