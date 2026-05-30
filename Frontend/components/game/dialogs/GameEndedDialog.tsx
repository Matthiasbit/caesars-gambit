import { useRouter } from 'next/navigation'
import { getColorForOwner } from '@/lib/useOwnerColorMap'

interface GameEndedDialogProps {
    winner: string | null
    ownerColorMap: Record<string, string>
    roomId: string
}

export function GameEndedDialog({ winner, ownerColorMap, roomId }: GameEndedDialogProps) {
    const router = useRouter()

    if (!winner) return null

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000 }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.35)' }} />
            <div style={{
                position: 'relative',
                zIndex: 4001,
                backgroundColor: '#07142a',
                border: '2px solid rgba(255,210,60,0.7)',
                boxShadow: '0 0 40px rgba(255,210,60,0.35), 0 0 80px rgba(255,210,60,0.15)',
                borderRadius: '16px',
                padding: '52px 60px',
                textAlign: 'center',
                color: 'white',
                maxWidth: '520px',
                width: '90%',
            }}>
                <div style={{ fontSize: '56px', marginBottom: '12px' }}>👑</div>
                <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px', color: 'rgba(255,210,60,0.95)' }}>Spiel beendet!</h1>
                <p style={{ fontSize: '20px', marginBottom: '32px', color: 'rgba(189,215,255,0.85)' }}>
                    <span style={{ color: getColorForOwner(winner, ownerColorMap), fontWeight: 700, fontSize: '24px' }}>
                        {winner}
                    </span>
                    {' hat das Spiel gewonnen!'}
                </p>
                <button
                    onClick={() => router.push(`/room/${roomId}`)}
                    style={{
                        padding: '12px 32px',
                        backgroundColor: 'rgba(255,210,60,0.15)',
                        border: '1px solid rgba(255,210,60,0.6)',
                        borderRadius: '10px',
                        color: 'rgba(255,210,60,0.95)',
                        fontWeight: 600,
                        fontSize: '16px',
                        cursor: 'pointer',
                    }}
                >
                    Zurück zur Lobby
                </button>
            </div>
        </div>
    )
}
