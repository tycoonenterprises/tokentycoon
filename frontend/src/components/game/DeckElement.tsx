import { useGameStore } from '@/stores/gameStore'

interface DeckElementProps {
  playerId: string
  position: 'lower-left' | 'upper-right'
}

export function DeckElement({ playerId, position }: DeckElementProps) {
  const { 
    players, 
    activePlayer, 
    currentPhase, 
    viewingPlayer,
    isDemoMode 
  } = useGameStore()
  
  const player = players[playerId as keyof typeof players]
  const isCurrentPlayer = viewingPlayer === playerId
  const deckSize = player?.deck?.length || 0
  
  // Deck is no longer interactive - drawing happens automatically at turn start
  const handleDeckClick = () => {
    // No manual drawing - cards are drawn automatically at the start of each turn
  }

  const positionClasses = position === 'lower-left' 
    ? 'bottom-4 left-4' 
    : 'top-4 right-4'

  return (
    <div className={`fixed ${positionClasses} z-10`}>
      <div 
        className="relative w-20 h-28 transition-all duration-200"
      >
        {/* Deck Stack Effect */}
        <div className="absolute inset-0 bg-gray-800 border-2 border-gray-600 rounded-lg transform translate-x-1 translate-y-1" />
        <div className="absolute inset-0 bg-gray-700 border-2 border-gray-500 rounded-lg transform translate-x-0.5 translate-y-0.5" />
        
        {/* Main Deck Card */}
        <div className="relative w-full h-full bg-gray-900 border-2 border-gray-400 rounded-lg flex flex-col items-center justify-center">
          {/* Deck Icon */}
          <div className="text-2xl mb-1">🃏</div>
          
          {/* Deck Count */}
          <div className="text-xs font-bold text-white mb-1">
            {deckSize}
          </div>
          
          {/* Player Indicator */}
          <div className="text-xs text-gray-400">
            {isCurrentPlayer ? 'Your Deck' : `P${playerId === 'player1' ? '1' : '2'} Deck`}
          </div>
        </div>
        
        {/* Empty Deck Indicator */}
        {deckSize === 0 && (
          <div className="absolute inset-0 bg-red-900/50 border-2 border-red-500 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg">💀</div>
              <div className="text-xs text-red-300 font-bold">EMPTY</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}