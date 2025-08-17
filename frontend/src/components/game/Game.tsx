import { useState, useEffect, useCallback, useRef } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useGameStore, type Card } from '@/stores/gameStore'
import { PlayerStats } from './PlayerStats'
import { DragDropGameBoard } from './DragDropGameBoard'
import { Web3Actions } from './Web3Actions'
import { DeckBuilder } from './DeckBuilder'
import { CardsPage } from './CardsPage'
import { DecksPage } from './DecksPage'
import { PlayPage } from './PlayPage'
import { ContractDebugPanel } from '@/components/debug/ContractDebugPanel'
import { PrivyDebugInfo } from '@/components/debug/PrivyDebugInfo'
import { GameDebugPanel } from '@/components/debug/GameDebugPanel'
import { useGameEngine } from '@/lib/hooks/useGameEngine'
import { watchContractEvent } from 'wagmi/actions'
import { wagmiConfig } from '@/lib/web3/wagmiConfig'
import { CONTRACT_ADDRESSES } from '@/lib/web3/config'
import { GameEngineABI } from '@/lib/contracts/GameEngineABI'
import { SessionStatus } from '@/components/SessionStatus'
import { AutoApprovalSetup } from '@/components/AutoApprovalSetup'

interface GameProps {
  isRouted?: boolean;
  routedGameId?: number;
}

export function Game({ isRouted = false, routedGameId }: GameProps) {
  const { logout, user } = usePrivy()
  const { wallets, ready: walletsReady } = useWallets()
  const { 
    startGame,
    resetGame, 
    isGameActive, 
    isGameStarted,
    activePlayer,
    activateOnchainGame,
    winner,
    setContractFunctions,
    setContractGameId,
    gameId: storeGameId,
    updateGameFromContract,
    initializeGameFromContract,
    needsToDraw,
  } = useGameStore()
  
  // Use routedGameId if this is a routed game, otherwise use store gameId
  const gameId = isRouted && routedGameId !== undefined ? routedGameId : storeGameId
  
  // Use a ref to always have the current game ID in callbacks
  const gameIdRef = useRef(gameId)
  useEffect(() => {
    gameIdRef.current = gameId
  }, [gameId])
  
  // Get contract functions
  const { endTurn, playCard, stakeETH, getDetailedGameState, getFullGameState, drawToStartTurn } = useGameEngine()
  
  const [showWeb3Panel, setShowWeb3Panel] = useState(false)
  const [showDeckBuilder, setShowDeckBuilder] = useState(false)
  const [showCardsPage, setShowCardsPage] = useState(false)
  const [showDecksPage, setShowDecksPage] = useState(false)
  const [showPlayPage, setShowPlayPage] = useState(false)
  const [currentGameId, setCurrentGameId] = useState<number | null>(null)
  const [customDeck, setCustomDeck] = useState<Card[] | null>(null)
  
  // Set up contract functions in game store - only once on mount
  useEffect(() => {
    setContractFunctions({
      endTurn,
      playCard,
      stakeETH,
      getDetailedGameState,
      getFullGameState,
      drawToStartTurn
    })
  }, []) // Empty deps - only set once

  // Listen for critical game events - specifically TurnEnded to update UI
  useEffect(() => {
    // Check if we have a valid game ID
    if (gameIdRef.current === null || gameIdRef.current === undefined) {
      return
    }
    
    
    // Capture current functions in closure
    const currentGetDetailedGameState = getDetailedGameState
    const currentGetFullGameState = getFullGameState
    
    let lastBlockNumber = 0n
    
    const pollForEvents = async () => {
      try {
        const { createPublicClient, http, parseAbiItem } = await import('viem')
        const publicClient = createPublicClient({
          transport: http('http://localhost:8545')
        })
        
        const currentBlock = await publicClient.getBlockNumber()
        
        if (lastBlockNumber === 0n) {
          lastBlockNumber = currentBlock - 10n // Start from 10 blocks ago
        }
        
        if (currentBlock > lastBlockNumber) {
          // Poll for TurnEnded events
          const turnEndedLogs = await publicClient.getLogs({
            address: CONTRACT_ADDRESSES.GAME_ENGINE,
            event: parseAbiItem('event TurnEnded(uint256 indexed gameId, address indexed player)'),
            fromBlock: lastBlockNumber + 1n,
            toBlock: currentBlock
          })
          
          // Poll for CardDrawn events
          const cardDrawnLogs = await publicClient.getLogs({
            address: CONTRACT_ADDRESSES.GAME_ENGINE,
            event: parseAbiItem('event CardDrawn(uint256 indexed gameId, address indexed player, uint256 cardId)'),
            fromBlock: lastBlockNumber + 1n,
            toBlock: currentBlock
          })
          
          if (cardDrawnLogs.length > 0) {
            let shouldUpdateState = false
            cardDrawnLogs.forEach(log => {
              if (Number(log.args?.gameId) === gameIdRef.current) {
                shouldUpdateState = true
              }
            })
            
            // If we detected card draw events for our game, update the state
            if (shouldUpdateState && gameIdRef.current !== null) {
              await currentGetFullGameState(gameIdRef.current)
            }
          }
          
          // Poll for CardPlayed events
          const cardPlayedLogs = await publicClient.getLogs({
            address: CONTRACT_ADDRESSES.GAME_ENGINE,
            event: parseAbiItem('event CardPlayed(uint256 indexed gameId, address indexed player, uint256 cardId, uint256 instanceId)'),
            fromBlock: lastBlockNumber + 1n,
            toBlock: currentBlock
          })
          
          if (cardPlayedLogs.length > 0) {
            cardPlayedLogs.forEach(log => {
              if (Number(log.args?.gameId) === gameIdRef.current) {
              }
            })
          }
          
          const logs = turnEndedLogs
          
          if (logs.length > 0) {
            const relevantLogs = logs.filter(log => {
              const eventGameId = log.args?.gameId
              // Use current game ID from ref
              return eventGameId && Number(eventGameId) === gameIdRef.current
            })
            
            if (relevantLogs.length > 0) {
              // Update game state
              const store = useGameStore.getState()
              // Use current game ID from ref
              if (gameIdRef.current !== null) {
                const state = await currentGetDetailedGameState(gameIdRef.current)
                if (state) {
                  // Ensure gameId is included in the state object
                  const stateWithGameId = {
                    ...state,
                    gameId: gameIdRef.current
                  }
                  store.updateGameFromContract(stateWithGameId)
                  await currentGetFullGameState(gameIdRef.current)
                }
              }
            }
          }
          
          lastBlockNumber = currentBlock
        }
      } catch (error) {
        // Silent fail for event polling
      }
    }
    
    // Poll immediately on first load
    pollForEvents()
    
    // Poll every 2 seconds
    const eventPollInterval = setInterval(pollForEvents, 2000)
    
    // Also try the original watchContractEvent (might still work)
    const unsubscribe = watchContractEvent(wagmiConfig, {
      address: CONTRACT_ADDRESSES.GAME_ENGINE,
      abi: GameEngineABI,
      eventName: 'TurnEnded',
      onLogs: async () => {
        // Silent success - events are being detected
      }
    })
    
    // Listen for CardDrawn events
    const unsubscribeCardDrawn = watchContractEvent(wagmiConfig, {
      address: CONTRACT_ADDRESSES.GAME_ENGINE,
      abi: GameEngineABI,
      eventName: 'CardDrawn',
      onLogs: async (logs) => {
        // Event detected - updates handled by polling
      }
    })
    
    // Listen for CardPlayed events
    const unsubscribeCardPlayed = watchContractEvent(wagmiConfig, {
      address: CONTRACT_ADDRESSES.GAME_ENGINE,
      abi: GameEngineABI,
      eventName: 'CardPlayed',
      onLogs: async (logs) => {
        // Event detected - updates handled by polling
      }
    })

    // Also set up a simple 2-second poll as backup
    const pollInterval = setInterval(async () => {
      try {
        if (currentGetDetailedGameState) {
          // Always use the current game ID from ref
          const currentGameId = gameIdRef.current
          if (currentGameId !== null) {
            const state = await currentGetDetailedGameState(currentGameId)
            if (state) {
              console.log('🔄 POLLING: Got game state:', {
                gameId: currentGameId,
                isStarted: state.isStarted,
                isFinished: state.isFinished,
                timestamp: new Date().toISOString()
              })
              const store = useGameStore.getState()
              const oldActivePlayer = store.activePlayer
              
              // Ensure gameId is included in the state object
              const stateWithGameId = {
                ...state,
                gameId: currentGameId
              }
              store.updateGameFromContract(stateWithGameId)
              
              // Check if active player changed
              const newActivePlayer = store.activePlayer
              if (oldActivePlayer !== newActivePlayer) {
                // Also fetch full game state
                await currentGetFullGameState(currentGameId)
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error polling game:`, error)
      }
    }, 2000)

    // Cleanup function
    return () => {
      unsubscribe()
      unsubscribeCardDrawn()
      unsubscribeCardPlayed()
      clearInterval(pollInterval)
      clearInterval(eventPollInterval)
    }
  }, [gameId, isRouted, routedGameId]) // Depend on gameId props to handle route changes

  const handleStartWithCustomDeck = () => {
    setShowDeckBuilder(true)
  }

  const handleDeckReady = (deck: Card[]) => {
    setCustomDeck(deck)
    setShowDeckBuilder(false)
    // Here you would modify the game store to use the custom deck
    startGame(user?.id || 'player1', 'player2')
  }

  const handleGetGameState = async () => {
    const state = useGameStore.getState()
    console.log('Game State Debug:', {
      gameId: state.gameId,
      activePlayer: state.activePlayer,
      currentTurn: state.currentTurn,
      turnNumber: state.turnNumber,
      player1HandSize: state.players.player1.hand.length,
      player2HandSize: state.players.player2.hand.length
    })
    
    if (gameId && getFullGameState) {
      try {
        await getFullGameState(gameId)
      } catch (error) {
        console.error('Error fetching comprehensive contract state:', error)
      }
    } else {
      console.log('No gameId or getFullGameState function available')
    }
  }

  const handleLogout = () => {
    resetGame()
    logout()
  }

  const handleOnchainGameStart = useCallback(async (gameId: number) => {
    setCurrentGameId(gameId)
    setShowPlayPage(false) // Close the PlayPage modal
    setContractGameId(gameId)
    
    // Navigate to the game route using hash routing
    window.location.hash = `#/game/${gameId}`
    
    // Get the current user's wallet address
    const privyWallet = wallets.find(w => w.walletClientType === 'privy')
    const userAddress = privyWallet?.address
    
    // Load the game state from the blockchain
    if (getDetailedGameState && getFullGameState) {
      try {
        const gameStateView = await getDetailedGameState(gameId)
        if (gameStateView) {
          
          // Update the contract state first
          updateGameFromContract(gameStateView)
          
          // Set player IDs from the contract addresses
          const player1Address = gameStateView.player1
          const player2Address = gameStateView.player2
          
          
          // Use activateOnchainGame instead of startGame to preserve contract data
          activateOnchainGame(player1Address, player2Address)
          
          // Set the viewing player based on which player the current user is
          if (userAddress) {
            if (userAddress.toLowerCase() === player1Address.toLowerCase()) {
              // Current user is player1
              // viewingPlayer should already be set to player1
            } else if (userAddress.toLowerCase() === player2Address.toLowerCase()) {
              // Current user is player2 - viewing will be handled by DragDropGameBoard
            }
          }
          
          // Load full game state including hands and battlefield
          await getFullGameState(gameId)
        } else {
          console.error('No game state returned from contract')
        }
      } catch (error) {
        console.error('Error loading game state:', error)
      }
    } else {
      console.error('Missing contract functions:', { getDetailedGameState: !!getDetailedGameState, getFullGameState: !!getFullGameState })
    }
  }, [wallets, getDetailedGameState, getFullGameState, updateGameFromContract, activateOnchainGame, setContractGameId])

  return (
    <div className="min-h-screen bg-eth-dark flex flex-col">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-700 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="#/" className="flex items-center hover:opacity-80 transition-opacity">
              <img 
                src="/token-tycoon-title.png" 
                alt="Token Tycoon" 
                className="h-8 w-auto cursor-pointer"
              />
            </a>
            <span className="text-sm text-gray-400">
              Welcome, {user?.email?.address || user?.wallet?.address?.slice(0, 8)}...
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            {!isGameActive ? (
              <button
                onClick={() => setShowPlayPage(true)}
                className="btn-primary"
              >
                🎮 Play
              </button>
            ) : null}
            
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-white transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>


      {/* Game Content */}
      <div className="flex-1 flex">
        {/* Main Game Area */}
        <div className="flex-1 flex flex-col">
          {/* Priority 1: If we're routed and loading, or have a gameId from URL and game is loading */}
          {(isRouted || gameId) && !isGameActive && !winner ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-2xl mb-4">Loading Game #{routedGameId || gameId || 'from blockchain'}...</div>
                <div className="text-sm text-gray-400">
                  Fetching game state from blockchain...
                </div>
              </div>
            </div>
          ) : !isGameActive && !winner && !isRouted && !gameId ? (
            // Welcome Screen (only show if no gameId)
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-6">🃏</div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Ready to Play?
                </h2>
                <p className="text-gray-400 mb-8 max-w-lg">
                  Join an onchain game to play against other players with real blockchain transactions.
                </p>
                <div className="flex flex-col gap-4 items-center">
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => setShowPlayPage(true)}
                      className="btn-primary text-lg px-8 py-3"
                    >
                      🎮 Start Playing
                    </button>
                    <button
                      onClick={handleStartWithCustomDeck}
                      className="btn-secondary text-lg px-8 py-3"
                    >
                      🃏 Custom Deck
                    </button>
                  </div>
                  
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => setShowCardsPage(true)}
                      className="btn-secondary text-sm px-6 py-2"
                    >
                      🃏 Cards
                    </button>
                    <button
                      onClick={() => setShowDecksPage(true)}
                      className="btn-secondary text-sm px-6 py-2"
                    >
                      📚 Decks
                    </button>
                  </div>
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
                {(() => {
                  // Determine if current user won or lost
                  const { players } = useGameStore.getState()
                  const privyWallet = wallets.find(w => w.walletClientType === 'privy')
                  const userAddress = privyWallet?.address?.toLowerCase()
                  const player1Address = players.player1.id?.toLowerCase()
                  const isCurrentUserPlayer1 = userAddress === player1Address
                  const didCurrentUserWin = (winner === 'player1' && isCurrentUserPlayer1) || (winner === 'player2' && !isCurrentUserPlayer1)
                  
                  console.log('🏁 Winner screen logic:', {
                    winner,
                    userAddress,
                    player1Address,
                    player2Address: players.player2.id?.toLowerCase(),
                    isCurrentUserPlayer1,
                    didCurrentUserWin
                  })
                  
                  return (
                    <>
                      <div className="text-6xl mb-6">
                        {didCurrentUserWin ? '🏆' : '💀'}
                      </div>
                      <h2 className="text-3xl font-bold text-white mb-4">
                        {didCurrentUserWin ? 'Victory!' : 'Defeat!'}
                      </h2>
                      <p className="text-gray-400 mb-8">
                        {didCurrentUserWin
                          ? 'Congratulations! You reached 20 ETH in cold storage and won the game!'
                          : 'Your opponent reached 20 ETH in cold storage first. Better luck next time!'}
                      </p>
                    </>
                  )
                })()}
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => setShowPlayPage(true)}
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
          ) : isGameActive ? (
            // Active Game
            <DragDropGameBoard gameId={gameId} />
          ) : (
            // Fallback - this shouldn't happen
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-2xl mb-4">Loading game state...</div>
                <div className="text-sm text-gray-400">
                  isGameActive: {String(isGameActive)}<br/>
                  isGameStarted: {String(isGameStarted)}<br/>
                  gameId: {gameId}<br/>
                  showPlayPage: {String(showPlayPage)}
                </div>
              </div>
            </div>
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
            <div className="font-bold">TURN ACTIVE</div>
            <div className="text-gray-400 text-xs">
              {(() => {
                if (!walletsReady) {
                  return '🔄 Loading wallet...'
                }
                
                const privyWallet = wallets.find(w => w.walletClientType === 'privy')
                const userAddress = privyWallet?.address?.toLowerCase()
                const isMyTurn = activePlayer?.toLowerCase() === userAddress
                
                if (isMyTurn && needsToDraw) {
                  return '🃏 Draw card to start turn'
                } else if (isMyTurn) {
                  return 'Your turn'
                } else {
                  return "Opponent's turn"
                }
              })()}
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

      {/* Decks Page Modal */}
      {showDecksPage && (
        <DecksPage onClose={() => setShowDecksPage(false)} />
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
      
      {/* Game Debug Panel - Only show during active games */}
      {isGameActive && (
        <GameDebugPanel
          showWeb3Panel={showWeb3Panel}
          onToggleWeb3Panel={() => setShowWeb3Panel(!showWeb3Panel)}
          onGetGameState={handleGetGameState}
          onResetGame={resetGame}
        />
      )}
      
      {/* Session Status - Show when user is authenticated */}
      <SessionStatus />
      
      {/* Auto Approval Setup Instructions */}
      <AutoApprovalSetup />
    </div>
  )
}