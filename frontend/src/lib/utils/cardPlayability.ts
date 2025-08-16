import type { Card } from '@/stores/gameStore'
import type { GamePhase } from '@/stores/gameStore'

export interface PlayabilityResult {
  canPlay: boolean
  reasons: string[]
  phase: 'valid' | 'invalid' | 'wrong-phase'
  gas: 'valid' | 'insufficient'
  turn: 'valid' | 'not-your-turn'
}

/**
 * Determines if a card can be played based on current game state
 */
export const canPlayCard = (
  card: Card,
  currentPhase: GamePhase,
  playerGas: number,
  activePlayer: string,
  currentPlayer: string,
  isGameActive: boolean
): PlayabilityResult => {
  const reasons: string[] = []
  let phase: PlayabilityResult['phase'] = 'valid'
  let gas: PlayabilityResult['gas'] = 'valid'
  let turn: PlayabilityResult['turn'] = 'valid'

  // Check if game is active
  if (!isGameActive) {
    reasons.push('Game is not active')
    return {
      canPlay: false,
      reasons,
      phase: 'invalid',
      gas,
      turn
    }
  }

  // Check if it's the player's turn
  if (activePlayer !== currentPlayer) {
    reasons.push('Not your turn')
    turn = 'not-your-turn'
  }

  // Check gas requirements
  if (playerGas < card.cost) {
    reasons.push(`Insufficient gas: need ${card.cost}, have ${playerGas}`)
    gas = 'insufficient'
  }

  // Check phase requirements
  const phaseResult = canPlayCardInPhase(card, currentPhase)
  if (!phaseResult.canPlay) {
    reasons.push(...phaseResult.reasons)
    phase = 'wrong-phase'
  }

  const canPlay = reasons.length === 0
  
  return {
    canPlay,
    reasons,
    phase,
    gas,
    turn
  }
}

/**
 * Determines if a card type can be played in the given phase
 */
export const canPlayCardInPhase = (
  card: Card,
  currentPhase: GamePhase
): { canPlay: boolean; reasons: string[] } => {
  const reasons: string[] = []

  switch (currentPhase) {
    case 'draw':
      // No manual card playing during draw phase
      reasons.push('Cannot play cards during Draw phase')
      return { canPlay: false, reasons }

    case 'main':
      // All card types can be played during main phase
      return { canPlay: true, reasons: [] }

    case 'combat':
      // No new cards during combat (only abilities/attacks)
      reasons.push('Cannot play new cards during Combat phase')
      return { canPlay: false, reasons }

    case 'end':
      // No card playing during end phase
      reasons.push('Cannot play cards during End phase')
      return { canPlay: false, reasons }

    default:
      reasons.push('Unknown game phase')
      return { canPlay: false, reasons }
  }
}

/**
 * Gets user-friendly phase restriction message
 */
export const getPhaseRestrictionMessage = (currentPhase: GamePhase): string => {
  switch (currentPhase) {
    case 'draw':
      return 'Draw Phase: Cards are drawn automatically'
    case 'main':
      return 'Main Phase: Play any cards you can afford'
    case 'combat':
      return 'Combat Phase: Attack with units on the board'
    case 'end':
      return 'End Phase: Turn will advance automatically'
    default:
      return 'Unknown phase'
  }
}

/**
 * Determines where a card should be placed when played
 */
export const getCardDestination = (card: Card): 'board' | 'discard' => {
  switch (card.type.toLowerCase()) {
    case 'chain':    // Permanent resources
    case 'defi':     // Yield generators
    case 'eoa':      // Units/creatures
      return 'board'
    
    case 'action':   // One-time effects
    default:
      return 'discard'
  }
}

/**
 * Gets visual styling class based on playability
 */
export const getCardPlayabilityClass = (playability: PlayabilityResult): string => {
  if (playability.canPlay) {
    return 'card-playable'
  }
  
  if (playability.turn === 'not-your-turn') {
    return 'card-not-your-turn'
  }
  
  if (playability.gas === 'insufficient') {
    return 'card-insufficient-gas'
  }
  
  if (playability.phase === 'wrong-phase') {
    return 'card-wrong-phase'
  }
  
  return 'card-not-playable'
}