// Contract types for the Ethereum Trading Card Game

export interface ContractCard {
  id: number
  name: string
  description: string
  cost: number
  cardType: string
  abilities: string
}

export interface ContractDeck {
  id: number
  name: string
  description: string
  cardNames: string[]
  cardCounts: number[]
}

export interface ExpandedDeckCard {
  name: string
  count: number
}

export interface GameSession {
  id: number
  player1: string
  player2: string
  isActive: boolean
  isComplete: boolean
  createdAt: number
  completedAt: number
}

export interface PlayerHand {
  gameId: number
  player: string
  cards: string[]
}