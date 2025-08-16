import { useState, useEffect } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useGameStore, type Card } from '@/stores/gameStore'
import { PlayerStats } from './PlayerStats'
import { DragDropGameBoard } from './DragDropGameBoard'
import { Web3Actions } from './Web3Actions'
import { DeckBuilder } from './DeckBuilder'
import { CardsPage } from './CardsPage'
import { PlayPage } from './PlayPage'
import { ContractDebugPanel } from '@/components/debug/ContractDebugPanel'
import { PrivyDebugInfo } from '@/components/debug/PrivyDebugInfo'
import { useSearchParams } from 'react-router-dom'
import { useGameEngine } from '@/lib/hooks/useGameEngine'
import { watchContractEvent } from 'wagmi/actions'
import { wagmiConfig } from '@/lib/web3/wagmiConfig'
import { CONTRACT_ADDRESSES } from '@/lib/web3/config'
import { GameEngineABI } from '@/lib/contracts/GameEngineABI'

export function Game() {
  const { logout, user } = usePrivy()
  const [searchParams] = useSearchParams()
  const { 
    startGame,
    startDemoMode,
    switchViewingPlayer,
    resetGame, 
    isGameActive, 
    activePlayer,
    isDemoMode,
    winner,
    setContractFunctions,
    setContractGameId,
    gameId,
    updateGameFromContract,
    initializeGameFromContract,
    needsToDraw,
    drawToStartTurn
  } = useGameStore()
  
  // Get contract functions
  const { endTurn, playCard, stakeETH, getDetailedGameState, getFullGameState, drawToStartTurn } = useGameEngine()
  
  const [showWeb3Panel, setShowWeb3Panel] = useState(false)
  const [showDeckBuilder, setShowDeckBuilder] = useState(false)
  const [showCardsPage, setShowCardsPage] = useState(false)
  const [showPlayPage, setShowPlayPage] = useState(false)
  const [currentGameId, setCurrentGameId] = useState<number | null>(null)
  const [customDeck, setCustomDeck] = useState<Card[] | null>(null)
  
  // Set up contract functions in game store
  useEffect(() => {
    setContractFunctions({
      endTurn,
      playCard,
      stakeETH,
      getDetailedGameState,
      getFullGameState,
      drawToStartTurn
    })
  }, [endTurn, playCard, stakeETH, getDetailedGameState, setContractFunctions, drawToStartTurn, getFullGameState])

  // Check URL parameters on mount to restore PlayPage state
  useEffect(() => {
    const viewParam = searchParams.get('view')
    const gameIdParam = searchParams.get('gameId')
    
    // If there's a view parameter or gameId, show the PlayPage
    if (viewParam || gameIdParam) {
      setShowPlayPage(true)
      
      // If there's a gameId, set it in the store
      if (gameIdParam) {
        const gameId = parseInt(gameIdParam)
        if (!isNaN(gameId)) {
          setContractGameId(gameId)
        }
      }
    }
  }, [searchParams, setContractGameId]) // Only run when search params change

  // Set up event listeners for the current game
  useEffect(() => {
    if (!gameId) return

    console.log('Setting up event listeners for game', gameId)

    // Listen for game events that affect the current game
    const unsubscribeEvents = [
      // Turn events
      watchContractEvent(wagmiConfig, {
        address: CONTRACT_ADDRESSES.GAME_ENGINE,
        abi: GameEngineABI,
        eventName: 'TurnStarted',
        args: { gameId: BigInt(gameId) },
        onLogs: (logs) => {
          console.log('TurnStarted event:', logs)
          // Refresh game state
          setTimeout(() => {
            if (getDetailedGameState) {
              getDetailedGameState(gameId).then(state => {
                if (state) updateGameFromContract(state)
              })
            }
          }, 1000)
        }
      }),

      watchContractEvent(wagmiConfig, {
        address: CONTRACT_ADDRESSES.GAME_ENGINE,
        abi: GameEngineABI,
        eventName: 'TurnEnded',
        args: { gameId: BigInt(gameId) },
        onLogs: (logs) => {
          console.log('TurnEnded event:', logs)
          // Refresh game state
          setTimeout(() => {
            if (getDetailedGameState) {
              getDetailedGameState(gameId).then(state => {
                if (state) updateGameFromContract(state)
              })
            }
          }, 1000)
        }
      }),

      // Card events
      watchContractEvent(wagmiConfig, {
        address: CONTRACT_ADDRESSES.GAME_ENGINE,
        abi: GameEngineABI,
        eventName: 'CardPlayed',
        args: { gameId: BigInt(gameId) },
        onLogs: (logs) => {
          console.log('CardPlayed event:', logs)
          // Refresh game state
          setTimeout(() => {
            if (getDetailedGameState) {
              getDetailedGameState(gameId).then(state => {
                if (state) updateGameFromContract(state)
              })
            }
          }, 1000)
        }
      }),

      // Resource events
      watchContractEvent(wagmiConfig, {
        address: CONTRACT_ADDRESSES.GAME_ENGINE,
        abi: GameEngineABI,
        eventName: 'ResourcesGained',
        args: { gameId: BigInt(gameId) },
        onLogs: (logs) => {
          console.log('ResourcesGained event:', logs)
          // Refresh game state
          setTimeout(() => {
            if (getDetailedGameState) {
              getDetailedGameState(gameId).then(state => {
                if (state) updateGameFromContract(state)
              })
            }
          }, 1000)
        }
      }),

      // Ability events
      watchContractEvent(wagmiConfig, {
        address: CONTRACT_ADDRESSES.GAME_ENGINE,
        abi: GameEngineABI,
        eventName: 'UpkeepTriggered',
        args: { gameId: BigInt(gameId) },
        onLogs: (logs) => {
          console.log('UpkeepTriggered event (ability processed):', logs)
          // Refresh game state to get updated resources
          setTimeout(() => {
            if (getDetailedGameState) {
              getDetailedGameState(gameId).then(state => {
                if (state) updateGameFromContract(state)
              })
            }
          }, 1000)
        }
      }),

      // Card draw events
      watchContractEvent(wagmiConfig, {
        address: CONTRACT_ADDRESSES.GAME_ENGINE,
        abi: GameEngineABI,
        eventName: 'CardDrawn',
        args: { gameId: BigInt(gameId) },
        onLogs: (logs) => {
          console.log('CardDrawn event (ability effect):', logs)
          // Refresh game state to get updated hand
          setTimeout(() => {
            if (getDetailedGameState) {
              getDetailedGameState(gameId).then(state => {
                if (state) updateGameFromContract(state)
              })
            }
          }, 1000)
        }
      })
    ]

    // Cleanup function
    return () => {
      console.log('Cleaning up event listeners for game', gameId)
      unsubscribeEvents.forEach(unsubscribe => unsubscribe())
    }
  }, [gameId, getDetailedGameState, updateGameFromContract])

  const handleStartGame = () => {
    startGame(user?.id || 'player1', 'player2')
  }

  const handleStartDemoMode = () => {
    startDemoMode(user?.id || 'player1', 'player2')
  }

  const handleStartWithCustomDeck = () => {
    setShowDeckBuilder(true)
  }

  const handleDeckReady = (deck: Card[]) => {
    setCustomDeck(deck)
    setShowDeckBuilder(false)
    // Here you would modify the game store to use the custom deck
    // For now, we'll just start demo mode
    startDemoMode(user?.id || 'player1', 'player2')
  }

  const handleEndTurn = () => {
    // End turn is now handled directly by the contract
    // The contract automatically handles draw and upkeep for the next player
    // For demo mode, we need to call the game store's endTurn function
    if (isDemoMode) {
      useGameStore.getState().endTurn(false) // Don't use contract in demo mode for now
    } else {
      useGameStore.getState().endTurn(true) // Use contract in real games
    }
  }

  const handleDrawToStartTurn = async () => {
    try {
      await drawToStartTurn()
      console.log('Draw to start turn completed')
    } catch (error) {
      console.error('Failed to draw to start turn:', error)
    }
  }

  const handleGetGameState = async () => {
    console.log('=== CURRENT GAME STATE DEBUG ===')
    const state = useGameStore.getState()
    console.log('Game Store State:', {
      gameId: state.gameId,
      currentTurn: state.currentTurn,
      turnNumber: state.turnNumber,
      activePlayer: state.activePlayer,
      isGameActive: state.isGameActive,
      isGameStarted: state.isGameStarted,
      isDemoMode: state.isDemoMode,
      players: {
        player1: {
          id: state.players.player1.id,
          balance: state.players.player1.balance,
          eth: state.players.player1.eth,
          coldStorage: state.players.player1.coldStorage,
          handSize: state.players.player1.hand.length,
          boardSize: state.players.player1.board.length,
          deckSize: state.players.player1.deck.length,
          deckRemaining: state.players.player1.deckRemaining,
          battlefieldSize: state.players.player1.battlefieldSize,
          hand: state.players.player1.hand.map(card => ({ id: card.id, name: card.name, cost: card.cost, type: card.type })),
          board: state.players.player1.board.map(card => ({ id: card.id, name: card.name, cost: card.cost, type: card.type })),
          deck: state.players.player1.deck.slice(0, 5).map(card => ({ id: card.id, name: card.name, cost: card.cost, type: card.type })) // Show first 5 deck cards
        },
        player2: {
          id: state.players.player2.id,
          balance: state.players.player2.balance,
          eth: state.players.player2.eth,
          coldStorage: state.players.player2.coldStorage,
          handSize: state.players.player2.hand.length,
          boardSize: state.players.player2.board.length,
          deckSize: state.players.player2.deck.length,
          deckRemaining: state.players.player2.deckRemaining,
          battlefieldSize: state.players.player2.battlefieldSize,
          hand: state.players.player2.hand.map(card => ({ id: card.id, name: card.name, cost: card.cost, type: card.type })),
          board: state.players.player2.board.map(card => ({ id: card.id, name: card.name, cost: card.cost, type: card.type })),
          deck: state.players.player2.deck.slice(0, 5).map(card => ({ id: card.id, name: card.name, cost: card.cost, type: card.type })) // Show first 5 deck cards
        }
      }
    })
    
    if (gameId && getFullGameState) {
      try {
        console.log('=== FETCHING COMPREHENSIVE CONTRACT STATE ===')
        await getFullGameState(gameId)
      } catch (error) {
        console.error('Error fetching comprehensive contract state:', error)
      }
    } else {
      console.log('No gameId or getFullGameState function available')
      console.log('Available functions:', { getDetailedGameState: !!getDetailedGameState, getFullGameState: !!getFullGameState })
    }
    console.log('=== END GAME STATE DEBUG ===')
  }

  const handleLogout = () => {
    resetGame()
    logout()
  }

  const handleOnchainGameStart = async (gameId: number) => {
    setCurrentGameId(gameId)
    setShowPlayPage(false)
    setContractGameId(gameId)
    
    // Load the actual game state from the blockchain
    if (getDetailedGameState) {
      try {
        console.log('Loading game state from contract for game', gameId)
        const contractState = await getDetailedGameState(gameId)
        if (contractState) {
          // Initialize game store with contract state (for new onchain games)
          initializeGameFromContract(contractState)
          console.log('Game initialized from contract:', contractState)
        } else {
          console.error('No contract state returned for game', gameId)
          // Fallback to local demo for now
          startGame(user?.id || 'player1', 'player2')
        }
      } catch (error) {
        console.error('Error loading contract state:', error)
        // Fallback to local demo for now
        startGame(user?.id || 'player1', 'player2')
      }
    } else {
      console.warn('No getDetailedGameState function available')
      startGame(user?.id || 'player1', 'player2')
    }
  }

  return (
    <div className="min-h-screen bg-eth-dark flex flex-col">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-700 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white">Ethereum TCG</h1>
            <span className="text-sm text-gray-400">
              Welcome, {user?.email?.address || user?.wallet?.address?.slice(0, 8)}...
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCardsPage(true)}
              className="btn-secondary text-sm"
            >
              🃏 Cards
            </button>
            
            <button
              onClick={() => setShowWeb3Panel(!showWeb3Panel)}
              className="btn-secondary text-sm"
            >
              {showWeb3Panel ? 'Hide' : 'Show'} Web3 Panel
            </button>
            
            {!isGameActive ? (
              <>
                <button
                  onClick={() => setShowPlayPage(true)}
                  className="btn-primary"
                >
                  🎮 Play
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleStartDemoMode}
                    className="btn-primary"
                  >
                    Demo Mode
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                {/* Draw Card button when turn needs to be started */}
                {needsToDraw && !isDemoMode && activePlayer === 'player1' && (
                  <button
                    onClick={handleDrawToStartTurn}
                    className="btn-primary text-sm animate-pulse"
                  >
                    🃏 Draw Card to Start Turn
                  </button>
                )}
                
                {isDemoMode && (
                  <button
                    onClick={switchViewingPlayer}
                    className="btn-secondary text-sm"
                    disabled={!isDemoMode}
                  >
                    Switch Player
                  </button>
                )}
                
                {/* Only show End Turn button if not waiting to draw */}
                {!needsToDraw && (
                  <button
                    onClick={handleEndTurn}
                    className="btn-primary text-sm"
                    disabled={!isDemoMode && activePlayer !== 'player1'}
                  >
                    End Turn
                  </button>
                )}
                
                <button
                  onClick={handleGetGameState}
                  className="btn-secondary text-sm"
                >
                  Get Game State
                </button>
                <button
                  onClick={resetGame}
                  className="btn-secondary text-sm"
                >
                  Reset Game
                </button>
              </div>
            )}
            
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-white transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Game Status */}
      <PlayerStats />

      {/* Game Content */}
      <div className="flex-1 flex">
        {/* Main Game Area */}
        <div className="flex-1 flex flex-col">
          {!isGameActive && !winner ? (
            // Welcome Screen
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-6">🃏</div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Ready to Play?
                </h2>
                <p className="text-gray-400 mb-8 max-w-lg">
                  Start Demo Mode to control both players and fully test all game mechanics, 
                  card interactions, and onchain functionality.
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={handleStartDemoMode}
                    className="btn-primary text-lg px-8 py-3"
                  >
                    🔄 Start Demo Mode
                  </button>
                  <button
                    onClick={handleStartWithCustomDeck}
                    className="btn-secondary text-lg px-8 py-3"
                  >
                    🃏 Custom Deck
                  </button>
                </div>
                {customDeck && (
                  <p className="text-sm text-eth-success mt-4">
                    ✓ Custom deck ready with {customDeck.length} cards
                  </p>
                )}
              </div>
            </div>
          ) : winner ? (
            // Game Over Screen
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-6">
                  {winner === 'player1' ? '🏆' : '💀'}
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  {winner === 'player1' ? 'Victory!' : 'Defeat!'}
                </h2>
                <p className="text-gray-400 mb-8">
                  {winner === 'player1' 
                    ? 'Congratulations! You defeated your opponent!' 
                    : 'Better luck next time. Your opponent emerged victorious.'}
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={handleStartDemoMode}
                    className="btn-primary"
                  >
                    Play Again
                  </button>
                  <button
                    onClick={resetGame}
                    className="btn-secondary"
                  >
                    Back to Lobby
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Active Game
            <DragDropGameBoard />
          )}
        </div>

        {/* Web3 Actions Panel */}
        {showWeb3Panel && (
          <div className="w-80 border-l border-gray-700 bg-gray-900">
            <Web3Actions />
          </div>
        )}
      </div>

      {/* Turn Indicator */}
      {isGameActive && !winner && (
        <div className="fixed bottom-4 left-4 bg-eth-dark border border-gray-700 rounded-lg px-4 py-2">
          <div className="text-sm text-white">
            <div className="font-bold">TURN {gameId ? 'ACTIVE' : 'DEMO'}</div>
            <div className="text-gray-400 text-xs">
              {needsToDraw && !isDemoMode && activePlayer === 'player1' 
                ? '🃏 Draw card to start turn'
                : isDemoMode 
                  ? `Player ${activePlayer === 'player1' ? '1' : '2'}'s turn`
                  : activePlayer === 'player1' 
                    ? 'Your turn' 
                    : "Opponent's turn"
              }
            </div>
          </div>
        </div>
      )}

      {/* Deck Builder Modal */}
      {showDeckBuilder && (
        <DeckBuilder
          onDeckReady={handleDeckReady}
          onClose={() => setShowDeckBuilder(false)}
        />
      )}

      {/* Cards Page Modal */}
      {showCardsPage && (
        <CardsPage onClose={() => setShowCardsPage(false)} />
      )}

      {/* Play Page Modal */}
      {showPlayPage && (
        <PlayPage 
          onClose={() => setShowPlayPage(false)} 
          onGameStart={handleOnchainGameStart}
        />
      )}

      {/* Debug Panels */}
      <PrivyDebugInfo />
      <ContractDebugPanel />
    </div>
  )
}