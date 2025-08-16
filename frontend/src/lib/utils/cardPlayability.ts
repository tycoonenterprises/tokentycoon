import type { Card } from '@/stores/gameStore'

// Phase type for backwards compatibility - phases are now handled by smart contract
type GamePhase = 'main'

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
  isGameActive: boolean,
  needsToDraw: boolean = false
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

  // Check if player needs to draw to start turn
  if (needsToDraw && activePlayer === currentPlayer) {
    reasons.push('Must draw card to start turn first')
    phase = 'wrong-phase'
  }

  // Check ETH requirements
  if (playerETH < card.cost) {
    reasons.push(`Insufficient ETH: need ${card.cost}, have ${playerETH}`)
    eth = 'insufficient'
  }

  // Phase requirements are now simplified - always allow during your turn
  // (phases are handled automatically by the smart contract)

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
  // Phases removed - always allow playing cards during your turn
  return { canPlay: true, reasons: [] }
}

/**
 * Gets user-friendly phase restriction message
 */
export const getPhaseRestrictionMessage = (currentPhase: GamePhase): string => {
  return 'Your Turn: Play any cards you can afford'
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