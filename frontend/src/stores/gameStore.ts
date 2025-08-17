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
  originalCardId?: number // Original card ID from contract
  handIndex?: number // Index in player's hand for contract calls
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
  // Removed noisy contract card conversion log
  
  // Convert enum cardType (0=Chain, 1=DeFi, 2=EOA, 3=Action)
  const cardType = cardTypeEnumToString(Number(contractCard.cardType)).toLowerCase()
  
  // Extract primary ability
  const primaryAbility = extractPrimaryAbility(contractCard.abilities)
  
  // Safely handle other fields
  const safeName = String(contractCard.name || 'Unknown Card')
  const safeDescription = String(contractCard.description || '')
  const safeCost = Number(contractCard.cost || 0)
  const cardId = Number(contractCard.id || 0)
  
  const result = {
    id: instanceId || `card-${cardId}`,
    originalCardId: cardId, // Preserve the original card ID from the contract
    name: safeName,
    type: cardType as Card['type'],
    cost: safeCost,
    text: safeDescription,
    abilities: primaryAbility,
    // Default values for power/toughness - could be enhanced later
    power: cardType === 'eoa' ? 2 : undefined,
    toughness: cardType === 'eoa' ? 2 : undefined,
  } as Card
  
  console.log(`🔄 Converted card: ID ${cardId} -> "${safeName}" (type: ${cardType})`)
  return result
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
  activateOnchainGame: (player1Id: string, player2Id: string) => void
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
          activePlayer: player1Id,
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

      activateOnchainGame: (player1Id: string, player2Id: string) => {
        // Activate game without overwriting contract data
        // This is used when loading an onchain game that's already started
        const currentState = get()
        
        set({
          isGameActive: true,
          isGameStarted: true,
          activePlayer: currentState.activePlayer || player1Id, // Keep current active player from contract
          // Keep the existing players data from contract - don't overwrite!
          players: {
            ...currentState.players,
            player1: {
              ...currentState.players.player1,
              id: player1Id, // Just update the IDs
            },
            player2: {
              ...currentState.players.player2,
              id: player2Id,
            },
          },
        })
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
          needsToDraw: gameView.needsToDraw || false,
          isGameActive: gameView.isStarted && !gameView.isFinished,
          isGameStarted: gameView.isStarted,
          winner: null,
          players: {
            player1: {
              id: gameView.player1, // Use actual contract addresses
              balance: 20, // Default health
              eth: convertBigInt(gameView.player1ETH),
              coldStorage: convertBigInt(gameView.player1ColdStorage || 0),
              coldStorageWithdrawnThisTurn: convertBigInt(gameView.player1ColdStorageWithdrawnThisTurn || 0),
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
              coldStorage: convertBigInt(gameView.player2ColdStorage || 0),
              coldStorageWithdrawnThisTurn: convertBigInt(gameView.player2ColdStorageWithdrawnThisTurn || 0),
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
        // Convert BigInt values to numbers
        const convertBigInt = (value: any): number => {
          if (typeof value === 'bigint') {
            return Number(value)
          }
          return Number(value) || 0
        }
        
        // Get the actual player addresses from gameView (these are the source of truth from contract)
        const player1Id = gameView.player1
        const player2Id = gameView.player2
        
        // Convert currentTurn to number first to ensure correct comparison
        const currentTurnNumber = convertBigInt(gameView.currentTurn)
        
        // Set activePlayer to the actual address of the current turn player
        // currentTurn from contract: 0 = player1's turn, 1 = player2's turn
        const activePlayer = currentTurnNumber === 0 ? player1Id : player2Id
        
        const previousState = get()
        // Removed noisy update game from contract log
        
        set({
          gameId: convertBigInt(gameView.gameId),
          currentTurn: currentTurnNumber,
          turnNumber: convertBigInt(gameView.turnNumber),
          activePlayer,
          needsToDraw: gameView.needsToDraw || false,
          isGameStarted: gameView.isStarted,
          isGameActive: gameView.isStarted && !gameView.isFinished,
          players: {
            player1: {
              ...get().players.player1,
              id: player1Id, // Ensure player ID is set
              eth: convertBigInt(gameView.player1ETH),
              coldStorage: convertBigInt(gameView.player1ColdStorage || 0),
              coldStorageWithdrawnThisTurn: convertBigInt(gameView.player1ColdStorageWithdrawnThisTurn || 0),
              deckRemaining: convertBigInt(gameView.player1DeckRemaining),
              battlefieldSize: convertBigInt(gameView.player1BattlefieldSize),
            },
            player2: {
              ...get().players.player2,
              id: player2Id, // Ensure player ID is set
              eth: convertBigInt(gameView.player2ETH),
              coldStorage: convertBigInt(gameView.player2ColdStorage || 0),
              coldStorageWithdrawnThisTurn: convertBigInt(gameView.player2ColdStorageWithdrawnThisTurn || 0),
              deckRemaining: convertBigInt(gameView.player2DeckRemaining),
              battlefieldSize: convertBigInt(gameView.player2BattlefieldSize),
            },
          },
        })
      },

      // Update player hand from contract
      updatePlayerHandFromContract: (playerId: string, cardIds: number[]) => {
        const { players, availableCards } = get()
        const player = players[playerId as keyof typeof players]
        
        console.log('🎴 HAND UPDATE DEBUG - START')
        console.log('👤 Player:', playerId)
        console.log('🌐 Card IDs from contract:', cardIds)
        console.log('📋 Available cards in registry:', availableCards.length, 'cards')
        console.log('🗺️ Available cards mapping:', availableCards.map((c, i) => `[${i}]: ${c.name} (id: ${c.id})`).slice(0, 10))
        
        // Convert contract card IDs to game cards
        const handCards = cardIds.map((cardId, index) => {
          // Cards from the contract are 1-indexed (Card IDs start at 1 in CardRegistry)
          // Try to find by array index (cardId - 1 since arrays are 0-indexed)
          let availableCard = null
          
          // If we have enough cards loaded, use the cardId as direct index
          // CardRegistry IDs are 0-based, so cardId 0 = index 0
          if (cardId >= 0 && cardId < availableCards.length) {
            availableCard = availableCards[cardId]
            console.log(`🎯 Mapped: Contract cardId ${cardId} -> Array index ${cardId} -> Card: ${availableCard?.name}`)
          }
          
          // Fallback: try to match by parsing the ID string
          if (!availableCard) {
            console.log(`🔍 Trying fallback match for cardId ${cardId}`)
            availableCard = availableCards.find(card => {
              const cardIdNum = parseInt(card.id.split('-').pop() || '0')
              console.log(`  Checking ${card.id} -> parsed as ${cardIdNum} === ${cardId}? ${cardIdNum === cardId}`)
              return cardIdNum === cardId
            })
            if (availableCard) {
              console.log(`✅ Found card by ID parsing: ${availableCard.name}`)
            } else {
              console.log(`❌ No match found for cardId ${cardId}`)
            }
          }
          
          if (availableCard) {
            return {
              ...availableCard,
              // Store both the unique ID for React and the original card data
              id: `hand-${playerId}-${index}-${cardId}`,
              originalCardId: cardId, // Store the original contract card ID
              handIndex: index // Store the index in hand for easy lookup
            }
          }
          
          // If card not found in available cards, create a usable placeholder
          // with data based on common card patterns
          console.warn(`Card ID ${cardId} not found in available cards (have ${availableCards.length} cards loaded). Creating placeholder.`)
          
          // Create a functional placeholder based on card ID ranges
          let cardType: Card['type'] = 'Action'
          let cardName = `Card #${cardId}`
          let cardCost = 2
          let cardAbilities = ''
          
          // Guess card type based on ID ranges (based on typical deployment order)
          if (cardId <= 20) {
            cardType = 'Chain'
            cardName = `Chain Card #${cardId}`
            cardCost = 1
            cardAbilities = 'income'
          } else if (cardId <= 40) {
            cardType = 'DeFi'
            cardName = `DeFi Protocol #${cardId}`
            cardCost = 3
            cardAbilities = 'yield'
          } else if (cardId <= 60) {
            cardType = 'EOA'
            cardName = `Wallet #${cardId}`
            cardCost = 2
          } else {
            cardType = 'Action'
            cardName = `Action #${cardId}`
            cardCost = 1
          }
          
          return {
            id: `hand-${playerId}-${index}-${cardId}`,
            originalCardId: cardId,
            handIndex: index,
            name: cardName,
            type: cardType,
            cost: cardCost,
            text: `Blockchain card #${cardId}`,
            abilities: cardAbilities
          }
        })
        
        console.log('🎴 Final hand:', handCards.map((c, i) => `[${i}]: ${c.name} (originalId: ${c.originalCardId})`))
        console.log('🎴 HAND UPDATE DEBUG - END')
        
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
      updatePlayerBattlefieldFromContract: (playerId: string, instanceIds: number[], cardInstances?: any[]) => {
        const { players, availableCards } = get()
        const player = players[playerId as keyof typeof players]
        
        console.log('🏟️ BATTLEFIELD UPDATE DEBUG - START')
        console.log('🆔 Instance IDs:', instanceIds)
        console.log('🃏 Card instances data:', cardInstances)
        
        // Convert contract instance IDs to game cards
        const battlefieldCards = instanceIds.map((instanceId, index) => {
          // If we have card instance data, use it to get the actual card
          if (cardInstances && cardInstances[index]) {
            const instance = cardInstances[index]
            const cardId = Number(instance.cardId)
            console.log(`🎯 Instance ${instanceId} has cardId ${cardId}`)
            
            // Find the card in available cards by its ID
            let availableCard = null
            if (cardId >= 0 && cardId < availableCards.length) {
              availableCard = availableCards[cardId]
              console.log(`✅ Found card for battlefield: ${availableCard?.name}`)
            }
            
            if (availableCard) {
              return {
                ...availableCard,
                id: `instance-${instanceId}`, // Keep unique instance ID
                instanceId: instanceId,
                originalCardId: cardId
              }
            }
          }
          
          // Fallback if we don't have instance data (shouldn't happen)
          console.warn(`⚠️ No card instance data for instanceId ${instanceId}`)
          return {
            id: `instance-${instanceId}`,
            name: `Card Instance #${instanceId}`,
            type: 'Action' as Card['type'],
            cost: 0,
            text: 'Loading...',
            abilities: ''
          }
        })
        
        console.log('🏟️ Final battlefield:', battlefieldCards.map(c => c.name))
        console.log('🏟️ BATTLEFIELD UPDATE DEBUG - END')
        
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

      // Contract-only endTurn - no demo mode support

      endTurn: async () => {
        const { gameId } = get()
        
        // Use contract for all games
        if (contractFunctions.endTurn && gameId !== null) {
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
        console.log(`updatePlayerETH called for ${playerId} with ${amount} - handled by contract`)
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
        // Deprecated: Use contract functions via useGameEngine hook instead
        console.warn('transferToColdStorage is deprecated. Use depositToColdStorage from useGameEngine instead.')
      },

      transferFromColdStorage: (playerId: string, amount: number) => {
        // Deprecated: Use contract functions via useGameEngine hook instead
        console.warn('transferFromColdStorage is deprecated. Use withdrawFromColdStorage from useGameEngine instead.')
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
        console.log('🎮 Setting contract gameId in store:', gameId)
        set({ gameId })
      },

      setContractFunctions: (functions: ContractFunctions) => {
        contractFunctions = { ...contractFunctions, ...functions }
      },
      }
    },
    { name: 'game-store' }
  )
)