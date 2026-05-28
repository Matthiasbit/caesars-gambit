import { Button } from '@/components/ui/button'

interface GameErrorDialogProps {
    isOpen: boolean
    message: string | null
    onClose: () => void
}

export function GameErrorDialog({ isOpen, message, onClose }: GameErrorDialogProps) {
    if (!isOpen || !message) return null

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.55)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 4000,
            }}
            onClick={onClose}
        >
            <div
                className="rounded-lg border border-[rgba(59,130,246,0.25)] bg-[#0b1220] p-6 shadow-lg text-white max-w-sm"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-lg font-bold mb-2">Spielaktion nicht möglich</h2>
                <p className="text-sm text-[rgba(189,215,255,0.85)] mb-6">{message}</p>
                <div className="flex justify-end">
                    <Button
                        variant="primary"
                        onClick={onClose}
                        className="w-auto px-4"
                    >
                        Schließen
                    </Button>
                </div>
            </div>
        </div>
    )
}
