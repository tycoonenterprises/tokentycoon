import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface Card {
  id: string
  name: string
  type: 'unit' | 'spell' | 'upgrade' | 'resource'
  cost: { gas?: number; collateral?: number }
  power?: number
  toughness?: number
  text: string
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
  
  // Reset
  resetGame: () => void
}

// Mock card data for testing
const MOCK_CARDS: Card[] = [
  {
    id: 'mining-rig-1',
    name: 'Mining Rig',
    type: 'unit',
    cost: { gas: 2 },
    power: 2,
    toughness: 1,
    text: 'Generate 1 gas per turn'
  },
  {
    id: 'smart-contract-1',
    name: 'Smart Contract',
    type: 'spell',
    cost: { gas: 1 },
    text: 'Draw a card'
  },
  {
    id: 'validator-1',
    name: 'Validator Node',
    type: 'unit',
    cost: { gas: 3 },
    power: 3,
    toughness: 3,
    text: 'Cannot be blocked'
  },
  {
    id: 'gas-station-1',
    name: 'Gas Station',
    type: 'resource',
    cost: { gas: 1 },
    text: 'Add 2 gas to your pool'
  },
  {
    id: 'firewall-1',
    name: 'Firewall',
    type: 'upgrade',
    cost: { gas: 2 },
    text: 'Prevent 1 damage to all your units'
  },
]

const getRandomCards = (count: number): Card[] => {
  const shuffled = [...MOCK_CARDS].sort(() => 0.5 - Math.random())
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
      hand: getRandomCards(5),
      board: [],
    },
    player2: {
      id: 'player2',
      balance: 20,
      gas: 1,
      maxGas: 1,
      hand: getRandomCards(5),
      board: [],
    },
  },
  winner: null,
  isGameActive: false,
}

export const useGameStore = create<GameState & GameActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      startGame: (player1Id: string, player2Id: string) => {
        set({
          matchId: `match-${Date.now()}`,
          isGameActive: true,
          players: {
            player1: {
              id: player1Id,
              balance: 20,
              gas: 1,
              maxGas: 1,
              hand: getRandomCards(5),
              board: [],
            },
            player2: {
              id: player2Id,
              balance: 20,
              gas: 1,
              maxGas: 1,
              hand: getRandomCards(5),
              board: [],
            },
          },
        })
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
        
        if (!card || !card.cost.gas || player.gas < card.cost.gas) {
          return // Cannot play card
        }
        
        const newHand = player.hand.filter(c => c.id !== cardId)
        const newGas = player.gas - card.cost.gas
        
        if (card.type === 'unit') {
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
          // Handle spell/resource/upgrade effects
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
        const { players } = get()
        const player = players[playerId as keyof typeof players]
        const newCard = getRandomCards(1)[0]
        
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
        set({
          ...initialState,
          players: {
            player1: {
              ...initialState.players.player1,
              hand: getRandomCards(5),
            },
            player2: {
              ...initialState.players.player2,
              hand: getRandomCards(5),
            },
          },
        })
      },
    }),
    { name: 'game-store' }
  )
)