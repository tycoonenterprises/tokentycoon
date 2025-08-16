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
  heldETH?: number // For wallet/EOA cards that can hold ETH
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
  coldStorageWithdrawnThisTurn: number // Track ETH withdrawn from cold storage this turn
  hand: Card[]
  board: Card[]
  deck: Card[] // Actual deck cards for drawing
  deckRemaining: number // Cards remaining in deck
  battlefieldSize: number // Number of cards on battlefield
}

// Phases removed - turns are now handled directly by smart contract

export interface GameState {
  matchId: string | null
  gameId: number | null // Contract game ID
  currentTurn: number
  turnNumber: number // Turn number from contract
  activePlayer: string
  viewingPlayer: string // Which player's perspective we're viewing in demo mode
  isDemoMode: boolean // Whether we're in demo mode (user plays both sides)
  needsToDraw: boolean // Whether current player needs to draw to start turn (from contract)
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
  // nextPhase removed - turns handled by contract endTurn
  endTurn: (useContract?: boolean) => void
  
  // Blockchain integration
  updateGameFromContract: (gameView: any) => void // Update from contract GameView
  updatePlayerHandFromContract: (playerId: string, cardIds: number[]) => void
  updatePlayerBattlefieldFromContract: (playerId: string, instanceIds: number[]) => void
  
  // Card actions
  playCard: (playerId: string, cardId: string, targetId?: string) => void
  playCardByIndex: (playerId: string, cardIndex: number) => void
  drawCard: (playerId: string) => void
  drawToStartTurn: () => Promise<void>
  moveCard: (playerId: string, cardId: string, from: 'hand' | 'board', to: 'hand' | 'board') => void
  
  // Player actions
  updatePlayerETH: (playerId: string, amount: number) => void
  updatePlayerBalance: (playerId: string, amount: number) => void
  transferToColdStorage: (playerId: string, amount: number) => void
  transferFromColdStorage: (playerId: string, amount: number) => void
  transferFromWalletCardToColdStorage: (playerId: string, cardId: string, amount: number) => void
  depositETHToWalletCard: (playerId: string, cardId: string, amount: number) => void
  
  // Card registry actions
  loadCardsFromBlockchain: (contractCards: ContractCard[]) => void
  setCardLoadError: (error: string | null) => void
  setLoadingCards: (loading: boolean) => void
  
  // Reset
  resetGame: () => void

  // Contract integration
  setContractGameId: (gameId: number) => void
  initializeGameFromContract: (gameView: any) => void
  setContractFunctions: (functions: {
    endTurn?: (gameId: number) => Promise<any>
    playCard?: (gameId: number, cardIndex: number) => Promise<any>
    stakeETH?: (gameId: number, instanceId: number, amount: number) => Promise<any>
    getDetailedGameState?: (gameId: number) => Promise<any>
    drawToStartTurn?: (gameId: number) => Promise<any>
    getFullGameState?: (gameId: number) => Promise<any>
  }) => void
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

// Contract functions type
type ContractFunctions = {
  endTurn?: (gameId: number) => Promise<any>
  playCard?: (gameId: number, cardIndex: number) => Promise<any>
  stakeETH?: (gameId: number, instanceId: number, amount: number) => Promise<any>
  getDetailedGameState?: (gameId: number) => Promise<any>
  drawToStartTurn?: (gameId: number) => Promise<any>
  getFullGameState?: (gameId: number) => Promise<any>
}

const initialState: GameState = {
  matchId: null,
  gameId: null,
  currentTurn: 0, // Contract uses 0 for player1, 1 for player2
  turnNumber: 1,
  activePlayer: 'player1',
  viewingPlayer: 'player1',
  isDemoMode: false,
  needsToDraw: false, // Initially false
  players: {
    player1: {
      id: 'player1',
      balance: 20, // Health/life points
      eth: 3, // Starting ETH resources
      coldStorage: 0, // ETH in cold storage
      coldStorageWithdrawnThisTurn: 0, // Reset each turn
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
      coldStorageWithdrawnThisTurn: 0, // Reset each turn
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
    (set, get) => {
      // Internal contract functions storage
      let contractFunctions: ContractFunctions = {}

      return {
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
          viewingPlayer: player1Id, // Use actual player ID
          activePlayer: player1Id,  // Use actual player ID
          players: {
            player1: {
              id: player1Id,
              balance: 20,
              eth: 3,
              coldStorage: 0,
              coldStorageWithdrawnThisTurn: 0,
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
              coldStorageWithdrawnThisTurn: 0,
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
          players: {
            player1: {
              id: player1Id,
              balance: 20,
              eth: 3,
              coldStorage: 0,
              coldStorageWithdrawnThisTurn: 0,
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
              coldStorageWithdrawnThisTurn: 0,
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
        const { viewingPlayer, isDemoMode, players } = get()
        if (isDemoMode) {
          // Switch between actual player IDs
          const player1Id = players.player1.id
          const player2Id = players.player2.id
          set({
            viewingPlayer: viewingPlayer === player1Id ? player2Id : player1Id
          })
        }
      },

      // Initialize game from contract state (for onchain games)
      initializeGameFromContract: (gameView: any) => {
        const activePlayer = gameView.currentTurn === 0 ? 'player1' : 'player2'
        
        // Convert BigInt values to numbers
        const convertBigInt = (value: any): number => {
          if (typeof value === 'bigint') {
            return Number(value)
          }
          return Number(value) || 0
        }
        
        set({
          matchId: `contract-game-${gameView.gameId}`,
          gameId: convertBigInt(gameView.gameId),
          currentTurn: convertBigInt(gameView.currentTurn),
          turnNumber: convertBigInt(gameView.turnNumber),
          activePlayer,
          viewingPlayer: 'player1', // Always view as player1 initially
          isDemoMode: false,
          needsToDraw: gameView.needsToDraw || false,
          isGameActive: gameView.isStarted && !gameView.isFinished,
          isGameStarted: gameView.isStarted,
          winner: null,
          players: {
            player1: {
              id: gameView.player1, // Use actual contract addresses
              balance: 20, // Default health
              eth: convertBigInt(gameView.player1ETH),
              coldStorage: 0,
              coldStorageWithdrawnThisTurn: 0,
              hand: [], // Will be populated by updatePlayerHandFromContract
              board: [], // Will be populated by updatePlayerBattlefieldFromContract
              deck: [], // Not available from contract GameView
              deckRemaining: convertBigInt(gameView.player1DeckRemaining),
              battlefieldSize: convertBigInt(gameView.player1BattlefieldSize),
            },
            player2: {
              id: gameView.player2, // Use actual contract addresses
              balance: 20, // Default health
              eth: convertBigInt(gameView.player2ETH),
              coldStorage: 0,
              coldStorageWithdrawnThisTurn: 0,
              hand: [], // Will be populated by updatePlayerHandFromContract
              board: [], // Will be populated by updatePlayerBattlefieldFromContract
              deck: [], // Not available from contract GameView
              deckRemaining: convertBigInt(gameView.player2DeckRemaining),
              battlefieldSize: convertBigInt(gameView.player2BattlefieldSize),
            },
          },
        })
      },
      
      // Update game state from contract GameView
      // This function receives real ETH balances from the smart contract
      updateGameFromContract: (gameView: any) => {
        // Get the actual player addresses from current state or gameView
        const { players } = get()
        const player1Id = players.player1.id || gameView.player1
        const player2Id = players.player2.id || gameView.player2
        
        // Set activePlayer to the actual address of the current turn player
        const activePlayer = gameView.currentTurn === 0 ? player1Id : player2Id
        
        set({
          gameId: gameView.gameId,
          currentTurn: gameView.currentTurn,
          turnNumber: gameView.turnNumber,
          activePlayer,
          needsToDraw: gameView.needsToDraw || false,
          isGameStarted: gameView.isStarted,
          isGameActive: gameView.isStarted && !gameView.isFinished,
          players: {
            player1: {
              ...get().players.player1,
              id: player1Id, // Ensure player ID is set
              eth: gameView.player1ETH,
              deckRemaining: gameView.player1DeckRemaining,
              battlefieldSize: gameView.player1BattlefieldSize,
            },
            player2: {
              ...get().players.player2,
              id: player2Id, // Ensure player ID is set
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

      // nextPhase removed - use endTurn directly

      endTurn: async (useContract = true) => {
        const { gameId, isDemoMode, activePlayer, players, currentTurn } = get()
        
        // Use contract for real games
        if (useContract && contractFunctions.endTurn && gameId !== null) {
          try {
            console.log('Ending turn using contract for game', gameId)
            await contractFunctions.endTurn(gameId)
            
            // Wait a moment then refresh game state from contract
            setTimeout(async () => {
              if (contractFunctions.getDetailedGameState) {
                const gameStateView = await contractFunctions.getDetailedGameState(gameId)
                if (gameStateView) {
                  get().updateGameFromContract(gameStateView)
                }
              }
            }, 2000)
            
          } catch (error) {
            console.error('Contract endTurn failed:', error)
            throw error
          }
        } else if (isDemoMode) {
          // Demo mode - simulate turn switching locally
          const nextPlayer = activePlayer === 'player1' ? 'player2' : 'player1'
          const nextPlayerState = players[nextPlayer]
          
          // Simulate drawing a card (like the contract's _startTurn function)
          let newHand = nextPlayerState.hand
          let newDeck = nextPlayerState.deck
          let newDeckIndex = nextPlayerState.deckRemaining
          
          if (newDeck.length > 0 && newHand.length < 10) {
            const drawnCard = newDeck[0]
            newHand = [...newHand, drawnCard]
            newDeck = newDeck.slice(1)
            newDeckIndex = newDeck.length
          }
          
          // Simulate gaining 1 ETH (like the contract's upkeep)
          const newETH = nextPlayerState.eth + 1
          
          set({
            activePlayer: nextPlayer,
            currentTurn: currentTurn === 0 ? 1 : 0,
            turnNumber: get().turnNumber + 1,
            players: {
              ...players,
              [nextPlayer]: {
                ...nextPlayerState,
                hand: newHand,
                deck: newDeck,
                deckRemaining: newDeckIndex,
                eth: newETH,
                coldStorageWithdrawnThisTurn: 0, // Reset withdrawal limit
              }
            }
          })
          
          console.log(`Demo mode: Turn ended, now ${nextPlayer}'s turn`)
        } else {
          console.warn('Cannot end turn: missing contract functions or gameId')
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
          const cardToPlay = card.type === 'EOA' || card.name.toLowerCase().includes('wallet') 
            ? { ...card, heldETH: 0 } // Initialize wallet cards with 0 ETH
            : card
          const newBoard = [...player.board, cardToPlay]
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
          // Action card effects are handled by the smart contract
          // No local simulation needed - contract processes abilities automatically
          console.log(`Action card ${card.name} played - effects handled by contract`)
          
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

      playCardByIndex: async (playerId: string, cardIndex: number) => {
        const { gameId } = get()
        
        // Always use contract for card playing
        if (contractFunctions.playCard && gameId !== null) {
          try {
            console.log(`Playing card at index ${cardIndex} using contract for game ${gameId}`)
            await contractFunctions.playCard(gameId, cardIndex)
            
            // Wait a moment then refresh game state from contract
            setTimeout(async () => {
              if (contractFunctions.getDetailedGameState) {
                const gameStateView = await contractFunctions.getDetailedGameState(gameId)
                if (gameStateView) {
                  get().updateGameFromContract(gameStateView)
                }
              }
            }, 2000)
            
          } catch (error) {
            console.error('Contract playCard failed:', error)
            throw error
          }
        } else {
          console.warn('Cannot play card: missing contract functions or gameId')
        }
      },

      drawCard: async (playerId: string) => {
        const { gameId } = get()
        
        // Note: Drawing is handled automatically by the contract during turn phases
        // This function exists for manual drawing scenarios, but typically not needed
        // since the contract handles draw phase automatically
        console.log('Manual draw card requested - this may not be needed with contract integration')
        
        // If we need manual drawing in the future, we can use:
        // if (contractFunctions.drawCard && gameId !== null) {
        //   await contractFunctions.drawCard(gameId)
        // }
      },

      drawToStartTurn: async () => {
        const { gameId } = get()
        
        // Use contract for explicit turn starting
        if (contractFunctions.drawToStartTurn && gameId !== null) {
          try {
            console.log('Drawing to start turn using contract for game', gameId)
            await contractFunctions.drawToStartTurn(gameId)
            
            // Wait a moment then refresh game state from contract
            setTimeout(async () => {
              if (contractFunctions.getDetailedGameState) {
                const gameStateView = await contractFunctions.getDetailedGameState(gameId)
                if (gameStateView) {
                  get().updateGameFromContract(gameStateView)
                }
              }
            }, 2000)
            
          } catch (error) {
            console.error('Contract drawToStartTurn failed:', error)
            throw error
          }
        } else {
          console.warn('Cannot draw to start turn: missing contract functions or gameId')
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
        // ETH resources are managed by the contract in real games
        // In demo mode, allow local updates for simulation
        const { isDemoMode, players } = get()
        if (isDemoMode) {
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
        } else {
          console.log(`updatePlayerETH called for ${playerId} with ${amount} - handled by contract`)
        }
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
        // Cold storage is a UI-only feature for now
        // Keep local simulation until contract supports it
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
        
        // Enforce 1 ETH per turn withdrawal limit
        const maxWithdrawal = 1 - player.coldStorageWithdrawnThisTurn
        const actualAmount = Math.min(amount, maxWithdrawal, player.coldStorage)
        
        if (actualAmount > 0) {
          set({
            players: {
              ...players,
              [playerId]: {
                ...player,
                eth: player.eth + actualAmount,
                coldStorage: player.coldStorage - actualAmount,
                coldStorageWithdrawnThisTurn: player.coldStorageWithdrawnThisTurn + actualAmount,
              },
            },
          })
        }
      },

      transferFromWalletCardToColdStorage: (playerId: string, cardId: string, amount: number) => {
        const { players } = get()
        const player = players[playerId as keyof typeof players]
        const card = player.board.find(c => c.id === cardId)
        
        if (card && card.heldETH && card.heldETH >= amount) {
          const updatedBoard = player.board.map(c => 
            c.id === cardId 
              ? { ...c, heldETH: (c.heldETH || 0) - amount }
              : c
          )
          
          const newColdStorage = player.coldStorage + amount
          
          set({
            players: {
              ...players,
              [playerId]: {
                ...player,
                board: updatedBoard,
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

      depositETHToWalletCard: (playerId: string, cardId: string, amount: number) => {
        const { players } = get()
        const player = players[playerId as keyof typeof players]
        const card = player.board.find(c => c.id === cardId)
        
        if (card && (card.type === 'EOA' || card.name.toLowerCase().includes('wallet')) && player.eth >= amount) {
          const updatedBoard = player.board.map(c => 
            c.id === cardId 
              ? { ...c, heldETH: (c.heldETH || 0) + amount }
              : c
          )
          
          set({
            players: {
              ...players,
              [playerId]: {
                ...player,
                eth: player.eth - amount,
                board: updatedBoard,
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

      // Contract integration functions
      setContractGameId: (gameId: number) => {
        set({ gameId })
      },

      setContractFunctions: (functions: ContractFunctions) => {
        contractFunctions = { ...contractFunctions, ...functions }
        console.log('Contract functions updated:', contractFunctions)
      },
      }
    },
    { name: 'game-store' }
  )
)