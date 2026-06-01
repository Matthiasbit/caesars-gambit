import { EventsourceTypes } from '../hooks/useGameStream'
import Button from '@/components/ui/button'

interface GamePhaseTimelineProps {
  eventsource: EventsourceTypes
  currentUsername: string | null
  moveExecuted: boolean
  onEndTurn: () => void
}

export function GamePhaseTimeline({
  eventsource,
  currentUsername,
  moveExecuted,
  onEndTurn,
}: GamePhaseTimelineProps) {
  const isMyTurn = eventsource.currentPlayer === currentUsername
  const isInitialPhase = eventsource.initialPhase

  // Don't show timeline if game hasn't started or no current player
  if (!eventsource.gameStarted || !eventsource.currentPlayer) {
    return null
  }

  if (isInitialPhase) {
    return (
      <div className={`w-full px-4 py-4 rounded-lg border transition-all duration-300 ${isMyTurn ? 'border-orange-500/60 bg-orange-500/5 shadow-[0_0_15px_rgba(249,115,22,0.1)]' : 'border-blue-500/20 bg-blue-500/5'}`}>
        <div className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2 text-blue-300/70">
          Startphase: Truppen verteilen
        </div>
        <div className="text-sm leading-relaxed text-slate-200">
          {isMyTurn ? (
            <p>
              Du musst noch <strong className="text-blue-400 font-bold">{eventsource.pendingDistCount || 0}</strong> Truppen verteilen. 
              Wenn alle Spieler ihre initialen Truppen verteilt haben, kannst du deinen Spielzug beginnen.
            </p>
          ) : (
            <p>
              Du musst noch <strong className="text-blue-400 font-bold">{eventsource.pendingDistCount || 0}</strong> Truppen verteilen. 
              Wenn alle Spieler ihre initialen Truppen verteilt haben, kann Spieler <strong className="text-orange-400 font-bold">{eventsource.currentPlayer}</strong> mit seinem Zug beginnen.
            </p>
          )}
        </div>
      </div>
    )
  }

  // Regular game logic
  let activeIndex = 0
  if (eventsource.pendingDistCount != null && eventsource.pendingDistCount > 0) {
    activeIndex = 0
  } else if (!moveExecuted) {
    activeIndex = 1
  } else {
    activeIndex = 2
  }

  const phases = [
    'Verteilen',
    'Angriff',
    'Verschieben'
  ]

  return (
    <div className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 ${isMyTurn ? 'border-orange-500/60 bg-orange-500/5 shadow-[0_0_15px_rgba(249,115,22,0.1)]' : 'border-blue-500/20 bg-blue-500/5'}`}>
      <div className="flex justify-between items-center mb-4">
        <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-blue-300/70">
          {isMyTurn ? 'Du bist am Zug' : `${eventsource.currentPlayer} ist am Zug`}
        </div>
        {isMyTurn && (
          <Button 
            size="sm" 
            variant="primary" 
            onClick={onEndTurn}
            disabled={(eventsource.pendingDistCount || 0) > 0}
            className="h-7 px-3 text-[10px] uppercase font-black tracking-widest border-none w-auto"
          >
            Zug beenden
          </Button>
        )}
      </div>
      
      <div className="flex items-center gap-0 w-full relative">
        {phases.map((phase, index) => {
          const isCompleted = index < activeIndex
          const isActive = index === activeIndex
          const isLast = index === phases.length - 1

          return (
            <div key={index} className="flex items-center flex-1 relative z-10">
              <div className="flex flex-col items-center w-full">
                {/* Timeline Dot */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${
                    isCompleted 
                      ? 'bg-blue-500 border-blue-400' 
                      : isActive 
                        ? 'bg-blue-600 border-white shadow-[0_0_12px_rgba(255,255,255,0.4)]' 
                        : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  {isCompleted && (
                    <span className="text-white font-bold text-[10px]">✓</span>
                  )}
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  )}
                </div>

                {/* Phase Label */}
                <div
                  className={`text-center mt-2 text-[9px] font-bold uppercase tracking-tighter transition-colors duration-500 ${
                    isActive ? 'text-white' : isCompleted ? 'text-blue-300' : 'text-slate-600'
                  }`}
                >
                  {phase}
                </div>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div
                  className={`absolute h-[2px] w-full top-3 left-1/2 -z-10 transition-colors duration-500 ${
                    isCompleted ? 'bg-blue-500' : 'bg-slate-800'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
