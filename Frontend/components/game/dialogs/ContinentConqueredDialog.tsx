import Button from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface ContinentData {
    player: string
    continent: string
}

interface ContinentConqueredDialogProps {
    data: ContinentData | null
    onClose: () => void
}

export function ContinentConqueredDialog({ data, onClose }: ContinentConqueredDialogProps) {
    return (
        <Dialog open={data !== null} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md bg-[#0b1220] border-blue-500/20 text-white text-center">
                <DialogHeader>
                    <div className="mb-4 flex justify-center">
                        <div className="text-6xl animate-bounce">🏆</div>
                    </div>
                    <DialogTitle className="text-3xl font-black uppercase tracking-tight mb-2 italic">
                        Kontinent erobert!
                    </DialogTitle>
                </DialogHeader>
                <div className="h-1 w-12 bg-blue-600 rounded-full mx-auto mb-6" />
                
                <p className="text-lg leading-relaxed text-slate-300 mb-8">
                    {data && (
                        <>
                            <span className="text-blue-400 font-black">{data.player}</span>
                            {' hat den Kontinent '}
                            <span className="text-white font-black underline decoration-blue-500/50 decoration-4 underline-offset-4">{data.continent}</span>
                            {' erobert!'}
                        </>
                    )}
                </p>
                
                <Button 
                    variant="primary"
                    onClick={onClose}
                    className="w-full h-12 rounded-xl border-none font-bold text-sm uppercase tracking-widest shadow-lg shadow-blue-600/20"
                >
                    Fortfahren
                </Button>
            </DialogContent>
        </Dialog>
    )
}
