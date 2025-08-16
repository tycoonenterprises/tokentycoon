import { useGameStore } from '@/stores/gameStore'

interface DeckElementProps {
  playerId: string
  position: 'lower-left' | 'upper-right'
}

export function DeckElement({ playerId, position }: DeckElementProps) {
  const { 
    players, 
    activePlayer, 
    drawCard 
  } = useGameStore()
  
  const player = players[playerId as keyof typeof players]
  const canDraw = false // Manual drawing disabled - automatic on turn start
  const deckSize = player?.deck?.length || 0
  
  const handleDeckClick = () => {
    // Drawing is now automatic at turn start - no manual drawing
    console.log('Deck click - drawing happens automatically at turn start')
  }

  const positionClasses = position === 'lower-left' 
    ? 'bottom-4 left-4' 
    : 'top-4 right-4'

  return (
    <div className={`fixed ${positionClasses} z-10`}>
      <div 
        onClick={handleDeckClick}
        className={`relative w-20 h-28 cursor-pointer transition-all duration-200 ${
          canDraw 
            ? 'hover:scale-105 hover:shadow-lg' 
            : 'opacity-60 cursor-not-allowed'
        }`}
      >
        {/* Deck Stack Effect */}
        <div className="absolute inset-0 bg-gray-800 border-2 border-gray-600 rounded-lg transform translate-x-1 translate-y-1" />
        <div className="absolute inset-0 bg-gray-700 border-2 border-gray-500 rounded-lg transform translate-x-0.5 translate-y-0.5" />
        
        {/* Main Deck Card */}
        <div className={`relative w-full h-full bg-gray-900 border-2 rounded-lg flex flex-col items-center justify-center ${
          canDraw ? 'border-eth-primary' : 'border-gray-400'
        }`}>
          {/* Deck Icon */}
          <div className="text-2xl mb-1">🃏</div>
          
          {/* Deck Count */}
          <div className="text-xs font-bold text-white mb-1">
            {deckSize}
          </div>
          
          {/* Player Indicator */}
          <div className="text-xs text-gray-400">
            {`P${playerId === 'player1' ? '1' : '2'} Deck`}
          </div>
          
          {/* Draw Indicator */}
          {canDraw && (
            <div className="absolute -top-2 -right-2 bg-eth-primary text-xs px-2 py-1 rounded-full font-bold animate-pulse">
              DRAW
            </div>
          )}
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