import type { Card } from '@/stores/gameStore'
import type { GamePhase } from '@/stores/gameStore'

export interface PlayabilityResult {
  canPlay: boolean
  reasons: string[]
  phase: 'valid' | 'invalid' | 'wrong-phase'
  eth: 'valid' | 'insufficient'
  turn: 'valid' | 'not-your-turn'
}

/**
 * Determines if a card can be played based on current game state
 */
export const canPlayCard = (
  card: Card,
  currentPhase: GamePhase,
  playerETH: number,
  activePlayer: string,
  currentPlayer: string,
  isGameActive: boolean
): PlayabilityResult => {
  const reasons: string[] = []
  let phase: PlayabilityResult['phase'] = 'valid'
  let eth: PlayabilityResult['eth'] = 'valid'
  let turn: PlayabilityResult['turn'] = 'valid'

  // Check if game is active
  if (!isGameActive) {
    reasons.push('Game is not active')
    return {
      canPlay: false,
      reasons,
      phase: 'invalid',
      eth,
      turn
    }
  }

  // Check if it's the player's turn
  if (activePlayer !== currentPlayer) {
    reasons.push('Not your turn')
    turn = 'not-your-turn'
  }

  // Check ETH requirements
  if (playerETH < card.cost) {
    reasons.push(`Insufficient ETH: need ${card.cost}, have ${playerETH}`)
    eth = 'insufficient'
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
    eth,
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
      // No manual card playing during draw phase (automatic)
      reasons.push('Cannot play cards during Draw phase')
      return { canPlay: false, reasons }

    case 'upkeep':
      // No manual card playing during upkeep phase (automatic abilities trigger)
      reasons.push('Cannot play cards during Upkeep phase')
      return { canPlay: false, reasons }

    case 'main':
      // All card types can be played during main phase
      return { canPlay: true, reasons: [] }

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
    case 'upkeep':
      return 'Upkeep Phase: Abilities trigger automatically, gain ETH'
    case 'main':
      return 'Main Phase: Play any cards you can afford'
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
  
  if (playability.eth === 'insufficient') {
    return 'card-insufficient-eth'
  }
  
  if (playability.phase === 'wrong-phase') {
    return 'card-wrong-phase'
  }
  
  return 'card-not-playable'
}