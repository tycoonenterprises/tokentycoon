// Contract types for the Ethereum Trading Card Game

export interface ContractCard {
  id: number
  name: string
  description: string
  cost: number
  cardType: number // Enum: 0=Chain, 1=DeFi, 2=EOA, 3=Action
  abilities: any[] // Complex struct array from contract
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