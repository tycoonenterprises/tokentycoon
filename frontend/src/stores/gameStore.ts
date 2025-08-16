import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { ContractCard } from '@/lib/types/contracts'

export interface Card {
  id: string
  name: string
  type: 'unit' | 'spell' | 'upgrade' | 'resource' | 'Chain' | 'DeFi' | 'EOA' | 'Action'
  cost: number // Gas cost from contract
  power?: number
  toughness?: number
  text: string // Description from contract
  abilities?: string // Abilities from contract
}

// Convert contract enum to string
const cardTypeEnumToString = (enumValue: number): string => {
  const cardTypes = ['Chain', 'DeFi', 'EOA', 'Action']
  return cardTypes[enumValue] || 'unknown'
}

// Extract primary ability from contract abilities array
const extractPrimaryAbility = (abilities: any[]): string => {
  if (!Array.isArray(abilities) || abilities.length === 0) {
    return ''
  }
  
  // Return the name of the first ability
  const firstAbility = abilities[0]
  return firstAbility?.name || ''
}

// Convert contract card to game card
export const contractCardToGameCard = (contractCard: ContractCard, instanceId?: string): Card => {
  // Debug logging to see actual contract data structure
  console.log('Converting contract card:', contractCard)
  
  // Convert enum cardType (0=Chain, 1=DeFi, 2=EOA, 3=Action)
  const cardType = cardTypeEnumToString(Number(contractCard.cardType)).toLowerCase()
  
  // Extract primary ability
  const primaryAbility = extractPrimaryAbility(contractCard.abilities)
  
  // Safely handle other fields
  const safeName = String(contractCard.name || 'Unknown Card')
  const safeDescription = String(contractCard.description || '')
  const safeCost = Number(contractCard.cost || 0)
  
  return {
    id: instanceId || `${safeName.toLowerCase().replace(/\s+/g, '-')}-${contractCard.id}`,
    name: safeName,
    type: cardType as Card['type'],
    cost: safeCost,
    text: safeDescription,
    abilities: primaryAbility,
    // Default values for power/toughness - could be enhanced later
    power: cardType === 'eoa' ? 2 : undefined,
    toughness: cardType === 'eoa' ? 2 : undefined,
  }
}

export interface PlayerState {
  id: string
  balance: number
  gas: number
  maxGas: number
  hand: Card[]
  board: Card[]
}

export type GamePhase = 'draw' | 'main' | 'combat' | 'end'

export interface GameState {
  matchId: string | null
  currentTurn: number
  currentPhase: GamePhase
  activePlayer: string
  players: {
    player1: PlayerState
    player2: PlayerState
  }
  winner: string | null
  isGameActive: boolean
  
  // Card registry from blockchain
  availableCards: Card[]
  isLoadingCards: boolean
  cardLoadError: string | null
}

export interface GameActions {
  // Game management
  startGame: (player1Id: string, player2Id: string) => void
  endGame: (winnerId?: string) => void
  nextPhase: () => void
  nextTurn: () => void
  
  // Card actions
  playCard: (playerId: string, cardId: string, targetId?: string) => void
  drawCard: (playerId: string) => void
  moveCard: (playerId: string, cardId: string, from: 'hand' | 'board', to: 'hand' | 'board') => void
  
  // Player actions
  updatePlayerGas: (playerId: string, amount: number) => void
  updatePlayerBalance: (playerId: string, amount: number) => void
  
  // Card registry actions
  loadCardsFromBlockchain: (contractCards: ContractCard[]) => void
  setCardLoadError: (error: string | null) => void
  setLoadingCards: (loading: boolean) => void
  
  // Reset
  resetGame: () => void
}

// Helper function to get random cards from available cards
const getRandomCards = (availableCards: Card[], count: number): Card[] => {
  if (availableCards.length === 0) {
    // Fallback: return empty array if no cards are loaded
    return []
  }
  
  // Create multiple instances of each card for deck variety
  const expandedCards: Card[] = []
  availableCards.forEach((card, index) => {
    // Add multiple copies of each card type (simulating a deck)
    const copies = card.type === 'unit' || card.type === 'EOA' ? 3 : 2
    for (let i = 0; i < copies; i++) {
      expandedCards.push({
        ...card,
        id: `${card.id}-instance-${index}-${i}` // Unique instance ID
      })
    }
  })
  
  const shuffled = [...expandedCards].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

const initialState: GameState = {
  matchId: null,
  currentTurn: 1,
  currentPhase: 'draw',
  activePlayer: 'player1',
  players: {
    player1: {
      id: 'player1',
      balance: 20,
      gas: 1,
      maxGas: 1,
      hand: [], // Will be populated once cards are loaded from blockchain
      board: [],
    },
    player2: {
      id: 'player2',
      balance: 20,
      gas: 1,
      maxGas: 1,
      hand: [], // Will be populated once cards are loaded from blockchain
      board: [],
    },
  },
  winner: null,
  isGameActive: false,
  
  // Card registry state
  availableCards: [],
  isLoadingCards: false,
  cardLoadError: null,
}

export const useGameStore = create<GameState & GameActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      startGame: (player1Id: string, player2Id: string) => {
        const { availableCards } = get()
        set({
          matchId: `match-${Date.now()}`,
          isGameActive: true,
          players: {
            player1: {
              id: player1Id,
              balance: 20,
              gas: 1,
              maxGas: 1,
              hand: getRandomCards(availableCards, 5),
              board: [],
            },
            player2: {
              id: player2Id,
              balance: 20,
              gas: 1,
              maxGas: 1,
              hand: getRandomCards(availableCards, 5),
              board: [],
            },
          },
        })
      },

      // Card registry actions
      loadCardsFromBlockchain: (contractCards: ContractCard[]) => {
        try {
          const gameCards = contractCards.map(contractCard => 
            contractCardToGameCard(contractCard)
          )
          set({
            availableCards: gameCards,
            isLoadingCards: false,
            cardLoadError: null,
          })
        } catch (error) {
          console.error('Failed to convert contract cards:', error)
          set({
            cardLoadError: 'Failed to load cards from blockchain',
            isLoadingCards: false,
          })
        }
      },

      setCardLoadError: (error: string | null) => {
        set({ cardLoadError: error })
      },

      setLoadingCards: (loading: boolean) => {
        set({ isLoadingCards: loading })
      },

      endGame: (winnerId?: string) => {
        set({ 
          isGameActive: false, 
          winner: winnerId || null 
        })
      },

      nextPhase: () => {
        const { currentPhase } = get()
        const phaseOrder: GamePhase[] = ['draw', 'main', 'combat', 'end']
        const currentIndex = phaseOrder.indexOf(currentPhase)
        const nextIndex = (currentIndex + 1) % phaseOrder.length
        
        if (nextIndex === 0) {
          // If we're going back to draw phase, advance turn
          get().nextTurn()
        } else {
          set({ currentPhase: phaseOrder[nextIndex] })
        }
      },

      nextTurn: () => {
        const { currentTurn, activePlayer, players } = get()
        const newActivePlayer = activePlayer === 'player1' ? 'player2' : 'player1'
        const newTurn = activePlayer === 'player2' ? currentTurn + 1 : currentTurn
        
        // Increase max gas for the new active player
        const currentPlayer = players[newActivePlayer as keyof typeof players]
        const newMaxGas = Math.min(currentPlayer.maxGas + 1, 10)
        
        set({
          currentTurn: newTurn,
          currentPhase: 'draw',
          activePlayer: newActivePlayer,
          players: {
            ...players,
            [newActivePlayer]: {
              ...currentPlayer,
              maxGas: newMaxGas,
              gas: newMaxGas,
            },
          },
        })
        
        // Auto-draw card at start of turn
        get().drawCard(newActivePlayer)
      },

      playCard: (playerId: string, cardId: string, targetId?: string) => {
        const { players } = get()
        const player = players[playerId as keyof typeof players]
        const card = player.hand.find(c => c.id === cardId)
        
        if (!card || player.gas < card.cost) {
          return // Cannot play card - insufficient gas or card not found
        }
        
        const newHand = player.hand.filter(c => c.id !== cardId)
        const newGas = player.gas - card.cost
        
        if (card.type === 'unit' || card.type === 'EOA') {
          // Place unit on board
          const newBoard = [...player.board, card]
          set({
            players: {
              ...players,
              [playerId]: {
                ...player,
                hand: newHand,
                board: newBoard,
                gas: newGas,
              },
            },
          })
        } else {
          // Handle spell/resource/upgrade/action effects
          let effectApplied = false
          
          // Apply card-specific effects based on abilities
          if (card.abilities === 'draw') {
            // Draw a card effect
            get().drawCard(playerId)
            effectApplied = true
          } else if (card.abilities === 'income') {
            // Income effect - add gas
            get().updatePlayerGas(playerId, 1)
            effectApplied = true
          }
          
          set({
            players: {
              ...players,
              [playerId]: {
                ...player,
                hand: newHand,
                gas: newGas,
              },
            },
          })
        }
      },

      drawCard: (playerId: string) => {
        const { players, availableCards } = get()
        const player = players[playerId as keyof typeof players]
        const newCards = getRandomCards(availableCards, 1)
        
        if (newCards.length === 0) {
          console.warn('Cannot draw card: no available cards loaded from blockchain')
          return
        }
        
        const newCard = newCards[0]
        
        set({
          players: {
            ...players,
            [playerId]: {
              ...player,
              hand: [...player.hand, newCard],
            },
          },
        })
      },

      moveCard: (playerId: string, cardId: string, from: 'hand' | 'board', to: 'hand' | 'board') => {
        const { players } = get()
        const player = players[playerId as keyof typeof players]
        
        const fromArray = from === 'hand' ? player.hand : player.board
        const toArray = to === 'hand' ? player.hand : player.board
        
        const card = fromArray.find(c => c.id === cardId)
        if (!card) return
        
        const newFromArray = fromArray.filter(c => c.id !== cardId)
        const newToArray = [...toArray, card]
        
        set({
          players: {
            ...players,
            [playerId]: {
              ...player,
              [from]: newFromArray,
              [to]: newToArray,
            },
          },
        })
      },

      updatePlayerGas: (playerId: string, amount: number) => {
        const { players } = get()
        const player = players[playerId as keyof typeof players]
        
        set({
          players: {
            ...players,
            [playerId]: {
              ...player,
              gas: Math.max(0, player.gas + amount),
            },
          },
        })
      },

      updatePlayerBalance: (playerId: string, amount: number) => {
        const { players } = get()
        const player = players[playerId as keyof typeof players]
        const newBalance = Math.max(0, player.balance + amount)
        
        set({
          players: {
            ...players,
            [playerId]: {
              ...player,
              balance: newBalance,
            },
          },
        })
        
        // Check for game end
        if (newBalance <= 0) {
          const winnerId = playerId === 'player1' ? 'player2' : 'player1'
          get().endGame(winnerId)
        }
      },

      resetGame: () => {
        const { availableCards } = get()
        set({
          ...initialState,
          availableCards, // Preserve loaded cards
          players: {
            player1: {
              ...initialState.players.player1,
              hand: getRandomCards(availableCards, 5),
            },
            player2: {
              ...initialState.players.player2,
              hand: getRandomCards(availableCards, 5),
            },
          },
        })
      },
    }),
    { name: 'game-store' }
  )
)