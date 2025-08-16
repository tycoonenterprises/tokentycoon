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
  stakedETH?: number // For DeFi cards
  yieldAmount?: number // Yield multiplier for DeFi cards
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
  balance: number // Player's life/health (for game end condition)
  eth: number // ETH resources for paying card costs
  coldStorage: number // ETH in cold storage (win condition: 10 ETH)
  hand: Card[]
  board: Card[]
  deck: Card[] // Actual deck cards for drawing
  deckRemaining: number // Cards remaining in deck
  battlefieldSize: number // Number of cards on battlefield
}

export type GamePhase = 'draw' | 'upkeep' | 'main'

export interface GameState {
  matchId: string | null
  gameId: number | null // Contract game ID
  currentTurn: number
  turnNumber: number // Turn number from contract
  currentPhase: GamePhase
  activePlayer: string
  viewingPlayer: string // Which player's perspective we're viewing in demo mode
  isDemoMode: boolean // Whether we're in demo mode (user plays both sides)
  players: {
    player1: PlayerState
    player2: PlayerState
  }
  winner: string | null
  isGameActive: boolean
  isGameStarted: boolean // Whether contract game has started
  
  // Card registry from blockchain
  availableCards: Card[]
  isLoadingCards: boolean
  cardLoadError: string | null
}

export interface GameActions {
  // Game management
  startGame: (player1Id: string, player2Id: string) => void
  startDemoMode: (player1Id: string, player2Id: string) => void
  switchViewingPlayer: () => void
  endGame: (winnerId?: string) => void
  nextPhase: () => void
  endTurn: () => void
  
  // Blockchain integration
  updateGameFromContract: (gameView: any) => void // Update from contract GameView
  updatePlayerHandFromContract: (playerId: string, cardIds: number[]) => void
  updatePlayerBattlefieldFromContract: (playerId: string, instanceIds: number[]) => void
  
  // Card actions
  playCard: (playerId: string, cardId: string, targetId?: string) => void
  drawCard: (playerId: string) => void
  moveCard: (playerId: string, cardId: string, from: 'hand' | 'board', to: 'hand' | 'board') => void
  
  // Player actions
  updatePlayerETH: (playerId: string, amount: number) => void
  updatePlayerBalance: (playerId: string, amount: number) => void
  transferToColdStorage: (playerId: string, amount: number) => void
  transferFromColdStorage: (playerId: string, amount: number) => void
  
  // Card registry actions
  loadCardsFromBlockchain: (contractCards: ContractCard[]) => void
  setCardLoadError: (error: string | null) => void
  setLoadingCards: (loading: boolean) => void
  
  // Reset
  resetGame: () => void
}

// Mock cards for testing when blockchain isn't connected
const getMockCards = (): Card[] => [
  {
    id: 'test-ethereum-1',
    name: 'Ethereum',
    type: 'Chain',
    cost: 1,
    text: 'The original smart contract platform',
    abilities: 'income',
    power: undefined,
    toughness: undefined,
  },
  {
    id: 'test-uniswap-2',
    name: 'Uniswap',
    type: 'DeFi',
    cost: 2,
    text: 'Decentralized exchange protocol',
    abilities: 'yield',
    power: undefined,
    toughness: undefined,
  },
  {
    id: 'test-vitalik-3',
    name: 'Vitalik Buterin',
    type: 'EOA',
    cost: 3,
    text: 'Ethereum founder and developer',
    abilities: 'draw',
    power: 3,
    toughness: 3,
  },
  {
    id: 'test-gas-4',
    name: 'Gas Spike',
    type: 'Action',
    cost: 1,
    text: 'Deal 2 damage to target player',
    abilities: 'damage',
    power: undefined,
    toughness: undefined,
  },
]

// Helper function to get random cards from available cards
const getRandomCards = (availableCards: Card[], count: number): Card[] => {
  if (availableCards.length === 0) {
    // Fallback: use mock cards for testing
    console.log('🎭 Using mock cards for demo')
    availableCards = getMockCards()
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
  gameId: null,
  currentTurn: 0, // Contract uses 0 for player1, 1 for player2
  turnNumber: 1,
  currentPhase: 'main',
  activePlayer: 'player1',
  viewingPlayer: 'player1',
  isDemoMode: false,
  players: {
    player1: {
      id: 'player1',
      balance: 20, // Health/life points
      eth: 3, // Starting ETH resources
      coldStorage: 0, // ETH in cold storage
      hand: [],
      board: [],
      deck: [],
      deckRemaining: 30,
      battlefieldSize: 0,
    },
    player2: {
      id: 'player2',
      balance: 20, // Health/life points
      eth: 3, // Starting ETH resources
      coldStorage: 0, // ETH in cold storage
      hand: [],
      board: [],
      deck: [],
      deckRemaining: 30,
      battlefieldSize: 0,
    },
  },
  winner: null,
  isGameActive: false,
  isGameStarted: false,
  
  // Card registry state
  availableCards: getMockCards(), // Start with mock cards for demo
  isLoadingCards: false,
  cardLoadError: null,
}

export const useGameStore = create<GameState & GameActions>()(
  devtools(
    (set, get) => ({
      ...initialState,


      startGame: (player1Id: string, player2Id: string) => {
        const { availableCards } = get()
        const player1Deck = getRandomCards(availableCards, 30)
        const player2Deck = getRandomCards(availableCards, 30)
        
        set({
          matchId: `game-${Date.now()}`,
          isGameActive: true,
          isGameStarted: true,
          isDemoMode: false,
          viewingPlayer: 'player1',
          activePlayer: 'player1',
          currentPhase: 'draw',
          players: {
            player1: {
              id: player1Id,
              balance: 20,
              eth: 3,
              coldStorage: 0,
              hand: player1Deck.slice(0, 5),
              board: [],
              deck: player1Deck.slice(5),
              deckRemaining: 25,
              battlefieldSize: 0,
            },
            player2: {
              id: player2Id,
              balance: 20,
              eth: 3,
              coldStorage: 0,
              hand: player2Deck.slice(0, 5),
              board: [],
              deck: player2Deck.slice(5),
              deckRemaining: 25,
              battlefieldSize: 0,
            },
          },
        })
      },

      startDemoMode: (player1Id: string, player2Id: string) => {
        const { availableCards } = get()
        const player1Deck = getRandomCards(availableCards, 30)
        const player2Deck = getRandomCards(availableCards, 30)
        
        set({
          matchId: `demo-${Date.now()}`,
          isGameActive: true,
          isGameStarted: false,
          isDemoMode: true,
          viewingPlayer: 'player1',
          activePlayer: 'player1',
          currentPhase: 'draw',
          players: {
            player1: {
              id: player1Id,
              balance: 20,
              eth: 3,
              coldStorage: 0,
              hand: player1Deck.slice(0, 5),
              board: [],
              deck: player1Deck.slice(5),
              deckRemaining: 25,
              battlefieldSize: 0,
            },
            player2: {
              id: player2Id,
              balance: 20,
              eth: 3,
              coldStorage: 0,
              hand: player2Deck.slice(0, 5),
              board: [],
              deck: player2Deck.slice(5),
              deckRemaining: 25,
              battlefieldSize: 0,
            },
          },
        })
      },

      switchViewingPlayer: () => {
        const { viewingPlayer, isDemoMode } = get()
        if (isDemoMode) {
          set({
            viewingPlayer: viewingPlayer === 'player1' ? 'player2' : 'player1'
          })
        }
      },

      // Update game state from contract GameView
      updateGameFromContract: (gameView: any) => {
        const activePlayer = gameView.currentTurn === 0 ? 'player1' : 'player2'
        set({
          gameId: gameView.gameId,
          currentTurn: gameView.currentTurn,
          turnNumber: gameView.turnNumber,
          activePlayer,
          isGameStarted: gameView.isStarted,
          isGameActive: gameView.isStarted && !gameView.isFinished,
          players: {
            player1: {
              ...get().players.player1,
              eth: gameView.player1ETH,
              deckRemaining: gameView.player1DeckRemaining,
              battlefieldSize: gameView.player1BattlefieldSize,
            },
            player2: {
              ...get().players.player2,
              eth: gameView.player2ETH,
              deckRemaining: gameView.player2DeckRemaining,
              battlefieldSize: gameView.player2BattlefieldSize,
            },
          },
        })
      },

      // Update player hand from contract
      updatePlayerHandFromContract: (playerId: string, cardIds: number[]) => {
        const { players, availableCards } = get()
        const player = players[playerId as keyof typeof players]
        
        // Convert contract card IDs to game cards
        const handCards = cardIds.map(cardId => {
          const availableCard = availableCards.find(card => 
            parseInt(card.id.split('-')[1]) === cardId
          )
          return availableCard ? {
            ...availableCard,
            id: `${availableCard.id}-hand-${cardId}`
          } : null
        }).filter(card => card !== null) as Card[]
        
        set({
          players: {
            ...players,
            [playerId]: {
              ...player,
              hand: handCards,
            },
          },
        })
      },

      // Update player battlefield from contract
      updatePlayerBattlefieldFromContract: (playerId: string, instanceIds: number[]) => {
        const { players, availableCards } = get()
        const player = players[playerId as keyof typeof players]
        
        // Convert contract instance IDs to game cards
        // Note: This is simplified - in reality you'd query cardInstances mapping
        const battlefieldCards = instanceIds.map(instanceId => {
          // For now, create placeholder cards - would need to query contract for actual card data
          return {
            id: `instance-${instanceId}`,
            name: `Card Instance ${instanceId}`,
            type: 'unit' as Card['type'],
            cost: 1,
            text: 'Card from battlefield',
            power: 2,
            toughness: 2,
          }
        })
        
        set({
          players: {
            ...players,
            [playerId]: {
              ...player,
              board: battlefieldCards,
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
        const phaseOrder: GamePhase[] = ['draw', 'upkeep', 'main']
        const currentIndex = phaseOrder.indexOf(currentPhase)
        const nextIndex = (currentIndex + 1) % phaseOrder.length
        
        if (nextIndex === 0) {
          // If we're going back to draw phase, end turn (handled by contract)
          get().endTurn()
        } else {
          set({ currentPhase: phaseOrder[nextIndex] })
        }
      },

      endTurn: () => {
        const { activePlayer, players, turnNumber, isGameStarted, isDemoMode, viewingPlayer } = get()
        
        // In practice/demo mode (when not connected to contract), simulate turn progression
        if (!isGameStarted) {
          const newActivePlayer = activePlayer === 'player1' ? 'player2' : 'player1'
          const newTurnNumber = activePlayer === 'player2' ? turnNumber + 1 : turnNumber
          
          // Give ETH to the new active player (simulate upkeep)
          const currentPlayer = players[newActivePlayer as keyof typeof players]
          
          set({
            activePlayer: newActivePlayer,
            currentTurn: newActivePlayer === 'player1' ? 0 : 1,
            turnNumber: newTurnNumber,
            currentPhase: 'main', // Skip draw/upkeep phases in practice mode
            viewingPlayer: isDemoMode ? newActivePlayer : viewingPlayer, // Auto-switch viewing in demo mode
            players: {
              ...players,
              [newActivePlayer]: {
                ...currentPlayer,
                eth: currentPlayer.eth + 1, // Gain 1 ETH per turn
              },
            },
          })
          
          // Auto-draw a card for the new player
          get().drawCard(newActivePlayer)
        } else {
          // In contract mode, this would trigger the blockchain transaction
          console.log('Turn ended - contract should handle the transition')
        }
      },

      playCard: (playerId: string, cardId: string, targetId?: string) => {
        const { players } = get()
        const player = players[playerId as keyof typeof players]
        const card = player.hand.find(c => c.id === cardId)
        
        if (!card || player.eth < card.cost) {
          return // Cannot play card - insufficient ETH or card not found
        }
        
        const newHand = player.hand.filter(c => c.id !== cardId)
        const newETH = player.eth - card.cost
        
        if (card.type === 'unit' || card.type === 'EOA' || card.type === 'Chain' || card.type === 'DeFi') {
          // Place permanent cards on board
          const newBoard = [...player.board, card]
          set({
            players: {
              ...players,
              [playerId]: {
                ...player,
                hand: newHand,
                board: newBoard,
                eth: newETH,
                battlefieldSize: player.battlefieldSize + 1,
              },
            },
          })
        } else if (card.type === 'Action') {
          // Handle Action card effects (they don't go to battlefield)
          // Apply card-specific effects based on abilities
          if (card.abilities === 'draw') {
            // Draw a card effect
            get().drawCard(playerId)
          } else if (card.abilities === 'income') {
            // Income effect - add ETH
            get().updatePlayerETH(playerId, 1)
          }
          
          set({
            players: {
              ...players,
              [playerId]: {
                ...player,
                hand: newHand,
                eth: newETH,
              },
            },
          })
        }
      },

      drawCard: (playerId: string) => {
        const { players } = get()
        const player = players[playerId as keyof typeof players]
        
        if (player.deck.length === 0) {
          console.warn('Cannot draw card: deck is empty')
          return
        }
        
        const newCard = player.deck[0]
        const newDeck = player.deck.slice(1)
        
        set({
          players: {
            ...players,
            [playerId]: {
              ...player,
              hand: [...player.hand, newCard],
              deck: newDeck,
              deckRemaining: newDeck.length,
            },
          },
        })
        
        // Check for cold storage win condition
        if (player.coldStorage >= 10) {
          get().endGame(playerId)
        }
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

      updatePlayerETH: (playerId: string, amount: number) => {
        const { players } = get()
        const player = players[playerId as keyof typeof players]
        
        set({
          players: {
            ...players,
            [playerId]: {
              ...player,
              eth: Math.max(0, player.eth + amount),
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

      transferToColdStorage: (playerId: string, amount: number) => {
        const { players } = get()
        const player = players[playerId as keyof typeof players]
        
        if (player.eth >= amount) {
          const newColdStorage = player.coldStorage + amount
          
          set({
            players: {
              ...players,
              [playerId]: {
                ...player,
                eth: player.eth - amount,
                coldStorage: newColdStorage,
              },
            },
          })
          
          // Check for cold storage win condition
          if (newColdStorage >= 10) {
            get().endGame(playerId)
          }
        }
      },

      transferFromColdStorage: (playerId: string, amount: number) => {
        const { players } = get()
        const player = players[playerId as keyof typeof players]
        
        if (player.coldStorage >= amount) {
          set({
            players: {
              ...players,
              [playerId]: {
                ...player,
                eth: player.eth + amount,
                coldStorage: player.coldStorage - amount,
              },
            },
          })
        }
      },

      resetGame: () => {
        const { availableCards } = get()
        set({
          ...initialState,
          availableCards, // Preserve loaded cards
        })
      },
    }),
    { name: 'game-store' }
  )
)