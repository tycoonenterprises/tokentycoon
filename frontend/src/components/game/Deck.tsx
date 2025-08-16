import React, { useState } from 'react'
import { useGameStore } from '@/stores/gameStore'

interface DeckProps {
  playerId: string
  isActive: boolean // Whether it's this player's turn
  canDraw: boolean // Whether the player can draw (turn hasn't started yet)
}

export function Deck({ playerId, isActive, canDraw }: DeckProps) {
  const { players, drawCard, viewingPlayer, isDemoMode } = useGameStore()
  const [isDrawing, setIsDrawing] = useState(false)
  
  const player = players[playerId as keyof typeof players]
  const isViewingPlayer = viewingPlayer === playerId
  
  const handleDrawCard = async () => {
    if (!canDraw || !isActive) return
    
    setIsDrawing(true)
    
    // Add a small delay for visual feedback
    setTimeout(() => {
      drawCard(playerId)
      setIsDrawing(false)
    }, 300)
  }

  const deckHeight = Math.min(player.deckRemaining * 2, 40) // Visual stack height
  
  return (
    <div className="flex flex-col items-center gap-2">
      {/* Deck Label */}
      <div className="text-sm font-medium text-gray-300">
        {isViewingPlayer ? 'Your Deck' : `Player ${playerId === 'player1' ? '1' : '2'} Deck`}
      </div>
      
      {/* Deck Stack */}
      <div className="relative">
        <button
          onClick={handleDrawCard}
          disabled={!canDraw || !isActive || isDrawing}
          className={`
            relative w-20 h-28 rounded-lg border-2 transition-all duration-200
            ${canDraw && isActive 
              ? 'border-eth-primary bg-eth-primary/20 hover:bg-eth-primary/30 cursor-pointer shadow-lg shadow-eth-primary/30' 
              : 'border-gray-600 bg-gray-800/50 cursor-not-allowed'
            }
            ${isDrawing ? 'scale-95' : 'hover:scale-105'}
          `}
          style={{
            boxShadow: canDraw && isActive ? '0 0 20px rgba(59, 130, 246, 0.5)' : 'none'
          }}
        >
          {/* Card Back Design */}
          <div className="absolute inset-1 rounded border border-gray-500 bg-gradient-to-br from-gray-700 to-gray-900">
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-2xl opacity-70">🃏</div>
            </div>
          </div>
          
          {/* Stack Effect - Multiple card shadows */}
          {player.deckRemaining > 1 && (
            <>
              <div className="absolute inset-0 rounded-lg bg-gray-800 -translate-x-0.5 -translate-y-0.5 -z-10" />
              {player.deckRemaining > 2 && (
                <div className="absolute inset-0 rounded-lg bg-gray-900 -translate-x-1 -translate-y-1 -z-20" />
              )}
            </>
          )}
          
          {/* Draw Indication */}
          {canDraw && isActive && (
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs text-eth-primary font-bold animate-pulse">
              Click to Draw
            </div>
          )}
          
          {/* Drawing Animation */}
          {isDrawing && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-eth-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </button>
        
        {/* Cards Remaining Counter */}
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
          <div className="bg-gray-900 border border-gray-600 rounded-full px-2 py-1 text-xs text-white min-w-8 text-center">
            {player.deckRemaining}
          </div>
        </div>
      </div>
      
      {/* Status Indicators */}
      <div className="text-center space-y-1">
        {canDraw && isActive && (
          <div className="text-xs text-eth-primary font-medium">
            🎯 Draw to start turn
          </div>
        )}
        
        {!canDraw && isActive && (
          <div className="text-xs text-gray-400">
            Turn in progress
          </div>
        )}
        
        {!isActive && (
          <div className="text-xs text-gray-500">
            {isDemoMode ? 'Not your turn' : 'Waiting...'}
          </div>
        )}
        
        {player.deckRemaining === 0 && (
          <div className="text-xs text-red-400 font-medium">
            ⚠️ Deck empty
          </div>
        )}
      </div>
    </div>
  )
}