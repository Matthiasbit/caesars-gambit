import { useRouter } from 'next/navigation'
import { getColorForOwner } from '@/lib/useOwnerColorMap'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface GameEndedDialogProps {
    winner: string | null
    ownerColorMap: Record<string, string>
    roomId: string
}

export function GameEndedDialog({ winner, ownerColorMap, roomId }: GameEndedDialogProps) {
    const router = useRouter()

    return (
        <Dialog open={winner !== null} onOpenChange={() => router.push(`/room/${roomId}`)}>
            <DialogContent className="sm:max-w-md bg-[#07142a] border-[rgba(255,210,60,0.7)] text-white text-center shadow-[0_0_40px_rgba(255,210,60,0.35)]">
                <DialogHeader>
                    <div className="text-6xl mb-4">👑</div>
                    <DialogTitle className="text-2xl font-bold mb-2 text-[rgba(255,210,60,0.95)]">
                        Spiel beendet!
                    </DialogTitle>
                </DialogHeader>
                <p className="text-lg mb-8 text-[rgba(189,215,255,0.85)]">
                    {winner && (
                        <>
                            <span style={{ color: getColorForOwner(winner, ownerColorMap), fontWeight: 700, fontSize: '24px' }}>
                                {winner}
                            </span>
                            {' hat das Spiel gewonnen!'}
                        </>
                    )}
                </p>
                <button
                    onClick={() => router.push(`/room/${roomId}`)}
                    className="px-8 py-3 bg-[rgba(255,210,60,0.15)] border border-[rgba(255,210,60,0.6)] rounded-xl text-[rgba(255,210,60,0.95)] font-bold text-lg hover:bg-[rgba(255,210,60,0.25)] transition-colors"
                >
                    Zurück zur Lobby
                </button>
            </DialogContent>
        </Dialog>
    )
}

