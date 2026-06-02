import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface GameErrorDialogProps {
    isOpen: boolean
    message: string | null
    onClose: () => void
}

export function GameErrorDialog({ isOpen, message, onClose }: GameErrorDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md bg-[#0b1220] border-blue-500/20 text-white">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Spielaktion nicht möglich</DialogTitle>
                </DialogHeader>
                <div className="py-4 text-sm text-[rgba(189,215,255,0.85)]">
                    {message}
                </div>
                <div className="flex justify-end">
                    <Button
                        variant="primary"
                        onClick={onClose}
                        className="w-auto px-4"
                    >
                        Schließen
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
