import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Game } from './components/game/Game'
import { PlayPage } from './components/game/PlayPage'
import { GameLobby } from './components/game/GameLobby'
import { CardsPage } from './components/game/CardsPage'
import { MatchHistoryPage } from './components/game/MatchHistoryPage'
import { useGameEngine } from './lib/hooks/useGameEngine'
import { useGameStore } from './stores/gameStore'
import { useEffect, useState } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { CONTRACT_ADDRESSES } from './lib/web3/config'
import { GameEngineABI } from './lib/contracts/GameEngineABI'

// Main menu/welcome page
function HomePage() {
  const { startDemoMode } = useGameStore()
  const { user } = usePrivy()
  
  return (
    <div className="min-h-screen bg-eth-dark flex items-center justify-center">
      <div className="text-center">
        <div className="mb-6">
          <img 
            src="/Cover_TokenTycoon.png" 
            alt="Token Tycoon Cover" 
            className="mx-auto max-w-2xl w-full h-auto rounded-lg shadow-2xl"
          />
        </div>
        <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
          Play onchain games against other players or explore the card collection 
          in this fully decentralized trading card game.
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="#/play"
            className="btn-primary text-lg px-8 py-3"
          >
            🎮 Play Onchain
          </a>
          <a
            href="#/cards"
            className="btn-secondary text-lg px-8 py-3"
          >
            🃏 View Cards
          </a>
          <a
            href="#/history"
            className="btn-secondary text-lg px-8 py-3"
          >
            🏆 Match History
          </a>
        </div>
      </div>
    </div>
  )
}

// Game page wrapper that loads game from ID
function GamePage({ gameId }: { gameId: number }) {
  const { getDetailedGameState, getFullGameState } = useGameEngine()
  
  const { 
    updateGameFromContract, 
    activateOnchainGame, 
    setContractGameId,
    updatePlayerHandFromContract,
    updatePlayerBattlefieldFromContract
  } = useGameStore()
  const { wallets } = useWallets()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const loadGame = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Set the game ID in store
        setContractGameId(gameId)
        
        // Check if getDetailedGameState exists
        if (!getDetailedGameState) {
          console.error('GamePage: getDetailedGameState is not available')
          setError('Game engine not initialized. Please refresh the page.')
          setLoading(false)
          return
        }
        
        // First, let's try a simple contract call to test connection
        try {
          const { readContract } = await import('wagmi/actions')
          const { wagmiConfig } = await import('@/lib/web3/wagmiConfig')
          const testCall = await readContract(wagmiConfig, {
            address: CONTRACT_ADDRESSES.GAME_ENGINE,
            abi: GameEngineABI,
            functionName: 'nextGameId',
            args: [],
          })
        } catch (testError) {
          console.error('GamePage: Contract connection test failed:', testError)
          setError('Cannot connect to smart contract. Please ensure blockchain is running.')
          setLoading(false)
          return
        }
        
        // Load game state with timeout
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout loading game state')), 5000)
        )
        
        const gameState = await Promise.race([
          getDetailedGameState(gameId),
          timeoutPromise
        ]).catch(err => {
          console.error('GamePage: Error calling getDetailedGameState:', err)
          throw err
        })
        
        
        if (!gameState) {
          console.error('GamePage: No game state returned for gameId:', gameId)
          setError(`Game #${gameId} not found. The game may not exist yet.`)
          return
        }
        
        
        // Update store with contract data
        updateGameFromContract(gameState)
        
        // If game is started, activate it and load full state
        if (gameState && 'isStarted' in gameState && gameState.isStarted) {
          const player1Address = gameState.player1 as `0x${string}`
          const player2Address = gameState.player2 as `0x${string}`
          
          // Activate the game without overwriting contract data
          activateOnchainGame(player1Address, player2Address)
          
          // Load full game state including hands
          await getFullGameState(gameId)
        } else {
          // Check if we were just redirected from starting the game
          const urlParams = new URLSearchParams(window.location.search)
          const justStarted = urlParams.get('started') === 'true'
          
          if (justStarted) {
            console.log('GamePage: Game was just started, waiting for blockchain confirmation...')
            // Wait a bit for the transaction to be mined
            await new Promise(resolve => setTimeout(resolve, 2000))
            
            // Retry loading the game state using the direct games mapping
            console.log('GamePage: Retrying to load game state using direct mapping...')
            
            // Import and use the getGameState function that reads the games mapping directly
            const { useGameEngine } = await import('@/lib/hooks/useGameEngine')
            const gameEngineHook = useGameEngine()
            
            // Try the direct mapping query
            const { readContract } = await import('wagmi/actions')
            const { wagmiConfig } = await import('@/lib/web3/wagmiConfig')
            const directGameData = await readContract(wagmiConfig, {
              address: CONTRACT_ADDRESSES.GAME_ENGINE,
              abi: GameEngineABI,
              functionName: 'games',
              args: [BigInt(gameId)],
            })
            
            console.log('Direct game data:', directGameData)
            
            // Parse it correctly with fixed indices
            const isGameStarted = directGameData[5]  // isStarted is at index 5
            const isGameFinished = directGameData[6]  // isFinished is at index 6
            
            console.log('Parsed from direct mapping - isStarted:', isGameStarted, 'isFinished:', isGameFinished)
            
            let retryGameState = await getDetailedGameState(gameId)
            
            if (retryGameState && retryGameState.isStarted) {
              console.log('GamePage: Game is now started after retry')
              const player1Address = retryGameState.player1
              const player2Address = retryGameState.player2
              
              updateGameFromContract(retryGameState)
              activateOnchainGame(player1Address, player2Address)
              await getFullGameState(gameId)
            } else {
              console.log('GamePage: Game still not started after retry, redirecting to lobby')
              window.location.hash = `#/lobby/${gameId}`
              return
            }
          } else {
            console.log('GamePage: Game not started yet, redirecting to lobby')
            // Game exists but isn't started - redirect to lobby
            window.location.hash = `#/lobby/${gameId}`
            return
          }
        }
        
        setLoading(false)
      } catch (err: any) {
        console.error('GamePage: Error loading game:', err)
        
        // Provide more specific error messages
        if (err.message?.includes('Timeout')) {
          setError('Connection timed out. Please check your blockchain connection.')
        } else if (err.message?.includes('not found')) {
          setError(`Game #${gameId} not found.`)
        } else if (err.message?.includes('network')) {
          setError('Network error. Please check your connection to localhost:8545')
        } else {
          setError(`Failed to load game: ${err.message || 'Unknown error'}`)
        }
        
        setLoading(false)
      }
    }
    
    loadGame()
  }, [gameId]) // Only re-run when gameId changes
  
  if (loading) {
    return (
      <div className="min-h-screen bg-eth-dark flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-2xl mb-4">Loading Game #{gameId}...</div>
          <div className="text-sm text-gray-400">
            Fetching game state from blockchain...
          </div>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-eth-dark flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6">❌</div>
          <div className="text-2xl mb-4 text-red-500">Error Loading Game</div>
          <div className="text-lg text-gray-300 mb-4">{error}</div>
          <div className="flex gap-4 justify-center">
            <a href="#/" className="btn-primary">Back to Home</a>
            <a href="#/play/create" className="btn-secondary">Create New Game</a>
          </div>
        </div>
      </div>
    )
  }
  
  return <Game isRouted={true} routedGameId={gameId} />
}

export function AppRouter() {
  // Removed noisy AppRouter debug log
  return (
    <HashRouter>
      <Routes>
        {/* Home page */}
        <Route path="/" element={<HomePage />} />
        
        {/* Play/Matchmaking page */}
        <Route path="/play" element={<PlayPage />} />
        
        {/* Create game */}
        <Route path="/play/create" element={<PlayPage initialView="create" />} />
        
        {/* Join games */}
        <Route path="/play/join" element={<PlayPage initialView="join" />} />
        
        {/* Game lobby (waiting for players) */}
        <Route path="/lobby/:gameId" element={
          <GameLobbyWrapper />
        } />
        
        {/* Active game */}
        <Route path="/game/:gameId" element={
          <GameWrapper />
        } />
        
        {/* Cards collection */}
        <Route path="/cards" element={<CardsPage />} />
        
        {/* Match history */}
        <Route path="/history" element={<MatchHistoryPage onClose={() => window.location.hash = '#/'} />} />
        
        {/* Demo mode game */}
        <Route path="/demo" element={<Game />} />
        
        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}

// Wrapper components to extract params
function GameWrapper() {
  const gameId = parseInt(window.location.hash.split('/')[2])
  console.log('🔄 GameWrapper: parsed gameId from URL:', gameId, 'from hash:', window.location.hash)
  if (isNaN(gameId)) {
    console.log('❌ GameWrapper: gameId is NaN, redirecting to home')
    return <Navigate to="/" replace />
  }
  console.log('✅ GameWrapper: calling GamePage with gameId:', gameId)
  return <GamePage gameId={gameId} />
}

function GameLobbyWrapper() {
  const gameId = parseInt(window.location.hash.split('/')[2])
  const { getGameState, startGame } = useGameEngine()
  const [gameState, setGameState] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { wallets } = useWallets()
  const privyWallet = wallets.find(w => w.walletClientType === 'privy')
  const address = privyWallet?.address
  
  useEffect(() => {
    // Poll for game state
    const loadGameState = async () => {
      try {
        const state = await getGameState(gameId)
        setGameState(state)
        setLoading(false)
        
        // If game started, redirect to game page
        if (state?.isStarted) {
          window.location.hash = `#/game/${gameId}`
        }
      } catch (err) {
        console.error('Error loading game state:', err)
        setLoading(false)
      }
    }
    
    loadGameState()
    const interval = setInterval(loadGameState, 2000)
    
    return () => clearInterval(interval)
  }, [gameId])
  
  if (loading) {
    return (
      <div className="min-h-screen bg-eth-dark flex items-center justify-center">
        <div className="text-white">Loading lobby...</div>
      </div>
    )
  }
  
  if (!gameState) {
    return <Navigate to="/" replace />
  }
  
  const handleStartGame = async () => {
    try {
      console.log('Starting game', gameId)
      await startGame(gameId)
      // Wait a moment for transaction to be mined
      await new Promise(resolve => setTimeout(resolve, 3000))
      // Manually redirect to game page
      window.location.hash = `#/game/${gameId}`
    } catch (err) {
      console.error('Error starting game:', err)
    }
  }
  
  const isHost = !!(address && (
    address.toLowerCase() === gameState?.player1?.toLowerCase() || 
    address.toLowerCase() === gameState?.creator?.toLowerCase()
  ))
  
  return (
    <div className="min-h-screen bg-eth-dark flex items-center justify-center">
      <div className="bg-gray-900 rounded-lg p-8 max-w-2xl w-full">
        <GameLobby
          gameId={gameId}
          gameState={gameState}
          availableDecks={[]}
          onStartGame={handleStartGame}
          onBack={() => window.location.hash = '#/play'}
          isHost={isHost}
          isStartingGame={false}
        />
      </div>
    </div>
  )
}