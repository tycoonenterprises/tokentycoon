import { useReadContract, useAccount } from 'wagmi'
import { CONTRACT_ADDRESSES } from '@/lib/web3/config'
import { wagmiConfig } from '@/lib/web3/wagmiConfig'
import { GameEngineABI } from '@/lib/contracts/GameEngineABI'
import { usePrivySmartContract } from './usePrivySmartContract'
import type { GameSession, PlayerHand } from '@/lib/types/contracts'

export const useGameEngine = () => {
  const { address } = useAccount()
  
  // Use Privy's smart contract hook for write operations
  const { writeContract: privyWriteContract, isPending: isPrivyPending } = usePrivySmartContract()

  // Read functions
  const { data: sessionCount } = useReadContract({
    address: CONTRACT_ADDRESSES.GAME_ENGINE,
    abi: GameEngineABI,
    functionName: 'sessionCount',
  })

  const { data: myGames, refetch: refetchMyGames } = useReadContract({
    address: CONTRACT_ADDRESSES.GAME_ENGINE,
    abi: GameEngineABI,
    functionName: 'getPlayerGames',
    args: address ? [address] : undefined,
  })

  const { data: availableGames, refetch: refetchAvailableGames } = useReadContract({
    address: CONTRACT_ADDRESSES.GAME_ENGINE,
    abi: GameEngineABI,
    functionName: 'getAvailableGames',
  })

  const createGame = async (deckId: number) => {
    try {
      // Use Privy's writeContract directly
      const txHash = await privyWriteContract({
        address: CONTRACT_ADDRESSES.GAME_ENGINE,
        abi: GameEngineABI,
        functionName: 'createGame',
        args: [BigInt(deckId)],
      })
      
      console.log('Game creation transaction sent with Privy:', txHash)
      
      // Wait a bit for the transaction to be mined
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Get the latest game ID - nextGameId gives us the next game ID, so we need current - 1
      try {
        const { readContract } = await import('wagmi/actions')
        const nextGameId = await readContract(wagmiConfig, {
          address: CONTRACT_ADDRESSES.GAME_ENGINE,
          abi: GameEngineABI,
          functionName: 'nextGameId',
          args: [],
        })
        
        // nextGameId is the next game ID, so the game we just created is nextGameId - 1
        const gameId = Number(nextGameId) - 1
        console.log('Created game with ID:', gameId)
        return gameId
      } catch (readError) {
        console.error('Error reading nextGameId:', readError)
        // Return a default game ID if we can't read it
        // In production, you'd parse the transaction receipt for the GameCreated event
        return 0
      }
    } catch (error) {
      console.error('Error creating game:', error)
      throw error
    }
  }

  const joinGame = async (gameId: number, deckId: number) => {
    try {
      // Use Privy's writeContract directly
      const result = await privyWriteContract({
        address: CONTRACT_ADDRESSES.GAME_ENGINE,
        abi: GameEngineABI,
        functionName: 'joinGame',
        args: [BigInt(gameId), BigInt(deckId)],
      })
      return result
    } catch (error) {
      console.error('Error joining game:', error)
      throw error
    }
  }

  const startGame = async (gameId: number) => {
    try {
      // Use Privy's writeContract directly
      const result = await privyWriteContract({
        address: CONTRACT_ADDRESSES.GAME_ENGINE,
        abi: GameEngineABI,
        functionName: 'startGame',
        args: [BigInt(gameId)],
      })
      return result
    } catch (error) {
      console.error('Error starting game:', error)
      throw error
    }
  }

  const drawCard = async (gameId: number) => {
    // Use Privy's writeContract directly
    return privyWriteContract({
      address: CONTRACT_ADDRESSES.GAME_ENGINE,
      abi: GameEngineABI,
      functionName: 'drawCard',
      args: [BigInt(gameId)],
    })
  }

  // Helper function to get active games from the blockchain
  const getActiveGames = async (minutesAgo: number = 30) => {
    try {
      // Get the total number of games
      const { readContract } = await import('wagmi/actions')
      const gameCount = await readContract(wagmiConfig, {
        address: CONTRACT_ADDRESSES.GAME_ENGINE,
        abi: GameEngineABI,
        functionName: 'gameCounter',
        args: [],
      })
      
      if (!gameCount || Number(gameCount) === 0) return []
      
      // Fetch recent games (fetch last 10 games or all if less than 10)
      const gamesToFetch = Math.min(Number(gameCount), 10)
      const games = []
      
      for (let i = Number(gameCount); i > Number(gameCount) - gamesToFetch && i > 0; i--) {
        const gameData = await readContract(wagmiConfig, {
          address: CONTRACT_ADDRESSES.GAME_ENGINE,
          abi: GameEngineABI,
          functionName: 'games',
          args: [BigInt(i)],
        })
        
        if (gameData && gameData.gameState === 0) { // Only show waiting games
          games.push({
            gameId: i,
            creator: gameData.player1,
            player2: gameData.player2 || '0x0000000000000000000000000000000000000000',
            status: 'waiting' as const,
            createdAt: Date.now() - (Number(gameCount) - i) * 60000, // Estimate time
            deckIds: { 
              player1: Number(gameData.player1DeckId || 0), 
              player2: 0 
            }
          })
        }
      }
      
      return games
    } catch (error) {
      console.error('Error fetching active games:', error)
      return []
    }
  }

  // Helper function to get game state from blockchain
  const getGameState = async (gameId: number) => {
    try {
      // Query the actual game state from the blockchain
      const { readContract } = await import('wagmi/actions')
      const gameData = await readContract(wagmiConfig, {
        address: CONTRACT_ADDRESSES.GAME_ENGINE,
        abi: GameEngineABI,
        functionName: 'games',
        args: [BigInt(gameId)],
      })
      
      if (!gameData) return null
      
      // Parse the game data from contract
      return {
        gameId,
        creator: gameData.player1 || '0x0000000000000000000000000000000000000000',
        player2: gameData.player2 || '0x0000000000000000000000000000000000000000',
        status: gameData.gameState === 0 ? 'waiting' : gameData.gameState === 1 ? 'ready' : 'started',
        deckIds: { 
          player1: Number(gameData.player1DeckId || 0), 
          player2: Number(gameData.player2DeckId || 0) 
        }
      }
    } catch (error) {
      console.error('Error fetching game state:', error)
      return null
    }
  }

  return {
    // Data
    sessionCount: sessionCount as number | undefined,
    myGames: myGames as number[] | undefined,
    availableGames: availableGames as number[] | undefined,
    
    // Loading states - use Privy's pending state
    isCreatingGame: isPrivyPending,
    isJoiningGame: isPrivyPending,
    isStartingGame: isPrivyPending,
    isDrawingCard: isPrivyPending,
    
    // Actions
    createGame,
    joinGame,
    startGame,
    drawCard,
    getActiveGames,
    getGameState,
    refetchMyGames,
    refetchAvailableGames,
  }
}

export const useGameSession = (gameId: number) => {
  const { data: session, refetch: refetchSession } = useReadContract({
    address: CONTRACT_ADDRESSES.GAME_ENGINE,
    abi: GameEngineABI,
    functionName: 'getGameSession',
    args: [gameId],
  })

  return {
    session: session as GameSession | undefined,
    refetchSession,
  }
}

export const usePlayerHand = (gameId: number, playerAddress?: string) => {
  const { address } = useAccount()
  const player = playerAddress || address

  const { data: hand, refetch: refetchHand } = useReadContract({
    address: CONTRACT_ADDRESSES.GAME_ENGINE,
    abi: GameEngineABI,
    functionName: 'getPlayerHand',
    args: player ? [gameId, player] : undefined,
  })

  return {
    hand: hand as string[] | undefined,
    refetchHand,
  }
}