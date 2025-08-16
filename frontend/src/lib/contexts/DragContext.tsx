import React, { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { Card } from '@/stores/gameStore'
import type { PlayabilityResult } from '@/lib/utils/cardPlayability'
import type { DropValidation, DropZone } from '@/lib/utils/dropZoneValidation'
import { canPlayCard } from '@/lib/utils/cardPlayability'
import { validateDrop } from '@/lib/utils/dropZoneValidation'
import { useGameStore } from '@/stores/gameStore'
import { useWallets } from '@privy-io/react-auth'

interface DragContextType {
  // Current drag state
  draggedCard: Card | null
  isDragging: boolean
  
  // Playability for current card
  playability: PlayabilityResult | null
  
  // Drag actions
  startDrag: (card: Card) => void
  endDrag: () => void
  
  // Validation helpers
  canPlayCurrentCard: () => boolean
  getDropValidation: (targetZone: DropZone) => DropValidation
  
  // Visual state helpers
  getCardPlayabilityClass: (card: Card) => string
  isCardPlayable: (card: Card) => boolean
}

const DragContext = createContext<DragContextType | null>(null)

interface DragProviderProps {
  children: ReactNode
}

export const DragProvider: React.FC<DragProviderProps> = ({ children }) => {
  const [draggedCard, setDraggedCard] = useState<Card | null>(null)
  const [playability, setPlayability] = useState<PlayabilityResult | null>(null)
  
  const {
    activePlayer,
    players,
    isGameActive,
    needsToDraw,
  } = useGameStore()
  
  const { wallets } = useWallets()
  
  const isDragging = draggedCard !== null

  // Get current viewing player by comparing wallet address (same logic as DragDropGameBoard)
  const privyWallet = wallets.find(w => w.walletClientType === 'privy')
  const userAddress = privyWallet?.address
  const player1 = players.player1
  const player2 = players.player2
  const isViewingPlayer1 = userAddress?.toLowerCase() === player1.id?.toLowerCase()
  const currentPlayer = isViewingPlayer1 ? 'player1' : 'player2'
  const playerState = players[currentPlayer as keyof typeof players]

  const startDrag = useCallback((card: Card) => {
    console.log('Starting drag for card:', card.name)
    
    // Calculate playability when drag starts
    const cardPlayability = canPlayCard(
      card,
      'main', // Always allow playing cards now - no phases
      playerState.eth,
      activePlayer,
      currentPlayer,
      isGameActive,
      needsToDraw
    )
    
    console.log('Card playability:', cardPlayability)
    
    setDraggedCard(card)
    setPlayability(cardPlayability)
  }, [playerState.eth, activePlayer, currentPlayer, isGameActive, needsToDraw])

  const endDrag = useCallback(() => {
    console.log('Ending drag')
    setDraggedCard(null)
    setPlayability(null)
  }, [])

  const canPlayCurrentCard = useCallback(() => {
    return playability?.canPlay ?? false
  }, [playability])

  const getDropValidation = useCallback((targetZone: DropZone): DropValidation => {
    if (!draggedCard || !playability) {
      return {
        isValid: false,
        canDrop: false,
        message: 'No card being dragged',
        visualState: 'neutral'
      }
    }

    return validateDrop(
      draggedCard,
      targetZone,
      playability,
      playerState.board
    )
  }, [draggedCard, playability, playerState.board])

  const getCardPlayabilityClass = useCallback((card: Card): string => {
    const cardPlayability = canPlayCard(
      card,
      'main', // Always allow playing cards now - no phases
      playerState.eth,
      activePlayer,
      currentPlayer,
      isGameActive,
      needsToDraw
    )

    if (cardPlayability.canPlay) {
      return 'card-playable'
    }
    
    if (cardPlayability.turn === 'not-your-turn') {
      return 'card-not-your-turn'
    }
    
    if (cardPlayability.eth === 'insufficient') {
      return 'card-insufficient-eth'
    }
    
    if (cardPlayability.phase === 'wrong-phase') {
      return 'card-wrong-phase'
    }
    
    return 'card-not-playable'
  }, [playerState.eth, activePlayer, currentPlayer, isGameActive, needsToDraw])

  const isCardPlayable = useCallback((card: Card): boolean => {
    const cardPlayability = canPlayCard(
      card,
      'main', // Always allow playing cards now - no phases
      playerState.eth,
      activePlayer,
      currentPlayer,
      isGameActive,
      needsToDraw
    )
    return cardPlayability.canPlay
  }, [playerState.eth, activePlayer, currentPlayer, isGameActive, needsToDraw])

  const value: DragContextType = {
    draggedCard,
    isDragging,
    playability,
    startDrag,
    endDrag,
    canPlayCurrentCard,
    getDropValidation,
    getCardPlayabilityClass,
    isCardPlayable,
  }

  return (
    <DragContext.Provider value={value}>
      {children}
    </DragContext.Provider>
  )
}

export const useDragContext = (): DragContextType => {
  const context = useContext(DragContext)
  if (!context) {
    throw new Error('useDragContext must be used within a DragProvider')
  }
  return context
}