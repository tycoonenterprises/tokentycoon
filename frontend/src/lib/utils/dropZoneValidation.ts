import type { Card } from '@/stores/gameStore'
import type { PlayabilityResult } from './cardPlayability'
import { getCardDestination } from './cardPlayability'

export type DropZone = 'board' | 'hand' | 'discard'

export interface DropValidation {
  isValid: boolean
  canDrop: boolean
  message: string
  visualState: 'valid' | 'invalid' | 'neutral'
}

/**
 * Validates if a card can be dropped in a specific zone
 */
export const validateDrop = (
  card: Card | null,
  targetZone: DropZone,
  playability: PlayabilityResult,
  boardCards: Card[] = []
): DropValidation => {
  
  // No card being dragged
  if (!card) {
    return {
      isValid: false,
      canDrop: false,
      message: 'No card selected',
      visualState: 'neutral'
    }
  }

  // Card cannot be played at all
  if (!playability.canPlay) {
    return {
      isValid: false,
      canDrop: false,
      message: playability.reasons[0] || 'Cannot play this card',
      visualState: 'invalid'
    }
  }

  // Validate specific drop zones
  switch (targetZone) {
    case 'board':
      return validateBoardDrop(card, boardCards)
    
    case 'hand':
      return validateHandDrop(card)
    
    case 'discard':
      return validateDiscardDrop(card)
    
    default:
      return {
        isValid: false,
        canDrop: false,
        message: 'Unknown drop zone',
        visualState: 'invalid'
      }
  }
}

/**
 * Validates dropping a card onto the game board
 */
const validateBoardDrop = (card: Card, boardCards: Card[]): DropValidation => {
  const expectedDestination = getCardDestination(card)
  
  // Check if card should go to board
  if (expectedDestination !== 'board') {
    return {
      isValid: false,
      canDrop: false,
      message: `${card.type} cards don't stay on the board`,
      visualState: 'invalid'
    }
  }

  // Check board space limits (optional rule)
  const maxBoardCards = 7 // Example limit
  if (boardCards.length >= maxBoardCards) {
    return {
      isValid: false,
      canDrop: false,
      message: 'Board is full',
      visualState: 'invalid'
    }
  }

  return {
    isValid: true,
    canDrop: true,
    message: `Play ${card.name} to the board`,
    visualState: 'valid'
  }
}

/**
 * Validates dropping a card back to hand (usually invalid)
 */
const validateHandDrop = (card: Card): DropValidation => {
  return {
    isValid: false,
    canDrop: false,
    message: 'Cannot return cards to hand',
    visualState: 'invalid'
  }
}

/**
 * Validates dropping a card to discard pile
 */
const validateDiscardDrop = (card: Card): DropValidation => {
  const expectedDestination = getCardDestination(card)
  
  if (expectedDestination === 'discard') {
    return {
      isValid: true,
      canDrop: true,
      message: `Cast ${card.name} (goes to discard)`,
      visualState: 'valid'
    }
  }

  // Permanent cards don't normally go to discard when played
  return {
    isValid: false,
    canDrop: false,
    message: `${card.type} cards stay on the board`,
    visualState: 'invalid'
  }
}

/**
 * Gets CSS classes for drop zone visual state
 */
export const getDropZoneClasses = (
  validation: DropValidation,
  isDragActive: boolean = false
): string => {
  const baseClasses = 'drop-zone transition-all duration-200'
  
  if (!isDragActive) {
    return baseClasses
  }

  switch (validation.visualState) {
    case 'valid':
      return `${baseClasses} drop-zone-valid border-eth-success bg-eth-success/10`
    
    case 'invalid':
      return `${baseClasses} drop-zone-invalid border-eth-danger bg-eth-danger/10`
    
    case 'neutral':
    default:
      return `${baseClasses} drop-zone-neutral border-gray-500 bg-gray-500/5`
  }
}

/**
 * Gets appropriate cursor style for drop zone
 */
export const getDropZoneCursor = (validation: DropValidation): string => {
  if (validation.canDrop) {
    return 'cursor-copy'
  } else {
    return 'cursor-not-allowed'
  }
}