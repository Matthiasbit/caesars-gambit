import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface DistributionDialogProps {
    isOpen: boolean
    territoryName: string
    availableTroops: number
    onConfirm: (count: number) => void
    onCancel: () => void
    moveDialog: boolean
    attackDialog: boolean
}

export const DistributionDialog: React.FC<DistributionDialogProps> = ({
    isOpen,
    territoryName,
    availableTroops,
    onConfirm,
    onCancel,
    moveDialog,
    attackDialog
}) => {
    const [count, setCount] = useState(1)

    if (!isOpen) return null

    const handleConfirm = () => {
        if (count > 0 && count <= availableTroops) {
            setCount(1)
            onConfirm(count)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleConfirm()
        } else if (e.key === 'Escape') {
            onCancel()
        }
    }

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 3000,
            }}
            onClick={onCancel}
        >
            <div
                className="rounded-lg border border-[rgba(59,130,246,0.25)] bg-[#0b1220] p-6 shadow-lg text-white max-w-sm"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-lg font-bold mb-2">{moveDialog ?  "Truppen verschieben" : attackDialog ? "Truppen angreifen" : "Truppen verteilen"}</h2>
                <p className="text-sm text-[rgba(189,215,255,0.85)] mb-4">
                    Gebiet: <strong>{territoryName}</strong>
                </p>
                <p className="text-sm text-[rgba(189,215,255,0.85)] mb-6">
                    Verfügbar: <strong>{availableTroops}</strong> Truppen
                </p>

                <div className="mb-6">
                    <label className="block text-sm font-semibold mb-2">
                        Anzahl auswählen:
                    </label>
                    <div className="flex items-center gap-3">
                        <Button
                            size="sm"
                            variant="secondary"
                            className="w-10"
                            onClick={() => setCount((prev) => Math.max(1, prev - 1))}
                        >
                            -
                        </Button>
                        <input
                            type="number"
                            min="1"
                            max={availableTroops}
                            value={count}
                            onChange={(e) => {
                                const val = parseInt(e.target.value, 10)
                                if (!isNaN(val) && val >= 1 && val <= availableTroops) {
                                    setCount(val)
                                }
                            }}
                            onKeyDown={handleKeyDown}
                            className="w-20 text-center px-2 py-1 rounded bg-[rgba(15,23,42,0.85)] border border-[rgba(59,130,246,0.18)] text-white"
                        />
                        <Button
                            size="sm"
                            variant="secondary"
                            className="w-10"
                            onClick={() => setCount((prev) => Math.min(availableTroops, prev + 1))}
                        >
                            +
                        </Button>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="primary"
                        onClick={handleConfirm}
                        disabled={count <= 0 || count > availableTroops}
                        className="flex-1"
                    >
                        Bestätigen
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={onCancel}
                        className="flex-1"
                    >
                        Abbrechen
                    </Button>
                </div>
            </div>
        </div>
    )
}
