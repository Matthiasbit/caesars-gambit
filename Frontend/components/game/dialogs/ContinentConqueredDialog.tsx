import Button from '@/components/ui/button'

interface ContinentData {
    player: string
    continent: string
}

interface ContinentConqueredDialogProps {
    data: ContinentData | null
    onClose: () => void
}

export function ContinentConqueredDialog({ data, onClose }: ContinentConqueredDialogProps) {
    if (!data) return null

    return (
        <div className="fixed inset-0 flex items-center justify-center z-[5000] p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
            <div className="relative z-10 w-full max-w-md rounded-3xl border border-blue-500/20 bg-[#0b1220] p-10 shadow-2xl text-center text-white">
                <div className="mb-6 flex justify-center">
                    <div className="text-6xl animate-bounce">🏆</div>
                </div>
                
                <h2 className="text-3xl font-black uppercase tracking-tight mb-4 italic">
                    Kontinent erobert!
                </h2>
                <div className="h-1 w-12 bg-blue-600 rounded-full mx-auto mb-8" />
                
                <p className="text-lg leading-relaxed text-slate-300 mb-8">
                    <span className="text-blue-400 font-black">{data.player}</span>
                    {' hat den Kontinent '}
                    <span className="text-white font-black underline decoration-blue-500/50 decoration-4 underline-offset-4">{data.continent}</span>
                    {' erobert!'}
                </p>
                
                <Button 
                    variant="primary"
                    onClick={onClose}
                    className="w-full h-12 rounded-xl border-none font-bold text-sm uppercase tracking-widest shadow-lg shadow-blue-600/20"
                >
                    Fortfahren
                </Button>
            </div>
        </div>
    )
}
