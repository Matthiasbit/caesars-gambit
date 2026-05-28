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
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' }} />
            <div style={{ position: 'relative', zIndex: 3001, backgroundColor: '#0b1220', border: '2px solid rgba(59,130,246,0.5)', borderRadius: '12px', padding: '40px', textAlign: 'center', color: 'white', maxWidth: '500px' }}>
                <h1 className="text-3xl font-bold mb-4">🏆 Kontinent erobert!</h1>
                <p className="text-xl mb-6">
                    <span style={{ color: 'rgba(59,130,246,1)', fontWeight: 'bold' }}>{data.player}</span>
                    {' hat den Kontinent '}
                    <span style={{ color: 'rgb(255, 255, 255)', fontWeight: 'bold' }}>{data.continent}</span>
                    {' erobert!'}
                </p>
                <button 
                    onClick={onClose}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-colors"
                >
                    OK
                </button>
            </div>
        </div>
    )
}
