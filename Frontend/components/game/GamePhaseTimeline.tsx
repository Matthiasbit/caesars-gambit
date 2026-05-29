import { EventsourceTypes } from '../hooks/useGameStream'

interface GamePhaseTimelineProps {
  eventsource: EventsourceTypes
  currentUsername: string | null
  moveExecuted: boolean
}

export function GamePhaseTimeline({
  eventsource,
  currentUsername,
  moveExecuted,
}: GamePhaseTimelineProps) {
  let activeIndex = 0

  if (eventsource.pendingDistCount != null) {
    activeIndex = 0
  } else if (!moveExecuted) {
    activeIndex = 1
  } else {
    activeIndex = 2
  }

  if (eventsource.currentPlayer !== currentUsername) {
    return null
  }

  const phases = [
    'Truppen verteilen',
    'Angriff',
    'Verschieben'
  ]

  return (
    <div className="w-full px-4 py-3 rounded-lg border border-[rgba(59,130,246,0.25)] bg-[rgba(59,130,246,0.08)]">
      <div
        className="text-xs font-semibold uppercase tracking-wider mb-3"
        style={{ color: 'rgba(189,215,255,0.65)' }}
      >
        Spielphase
      </div>
      <div className="flex items-center gap-0 w-full">
        {phases.map((phase, index) => {
          const isCompleted = index < activeIndex
          const isActive = index === activeIndex
          const isLast = index === phases.length - 1

          return (
            <div key={index} className="flex items-center flex-1">
              <div className="flex flex-col items-center w-full">
                {/* Timeline Dot */}
                <div
                  style={{
                    width: '1.5rem',
                    height: '1.5rem',
                    borderRadius: '50%',
                    backgroundColor: isCompleted || isActive ? '#ffffff' : '#000000',
                    border: isCompleted || isActive ? '2px solid #ffffff' : '2px solid #000000',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isCompleted && (
                    <span style={{ color: '#000000', fontWeight: 'bold', fontSize: '0.875rem' }}>✓</span>
                  )}
                  {isActive && (
                    <span style={{ color: '#000000', fontSize: '0.75rem' }}>●</span>
                  )}
                </div>

                {/* Phase Label */}
                <div
                  className="text-center mt-2 text-xs font-medium"
                  style={{
                    color: isCompleted || isActive ? '#ffffff' : '#000000',
                    transition: 'color 0.3s ease',
                  }}
                >
                  {phase}
                </div>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div
                  style={{
                    height: '0.25rem',
                    flex: 1,
                    backgroundColor: isCompleted ? '#ffffff' : '#000000',
                    marginTop: '-2rem',
                    transition: 'background-color 0.3s ease',
                  }}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
