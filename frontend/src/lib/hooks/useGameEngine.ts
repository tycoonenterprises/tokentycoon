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

  const endTurn = async (gameId: number) => {
    try {
      console.log(`Ending turn for game ${gameId}`)
      const result = await privyWriteContract({
        address: CONTRACT_ADDRESSES.GAME_ENGINE,
        abi: GameEngineABI,
        functionName: 'endTurn',
        args: [BigInt(gameId)],
      })
      console.log('Turn ended successfully:', result)
      return result
    } catch (error) {
      console.error('Error ending turn:', error)
      throw error
    }
  }

  const playCard = async (gameId: number, cardIndex: number) => {
    try {
      console.log(`Playing card at index ${cardIndex} for game ${gameId}`)
      const result = await privyWriteContract({
        address: CONTRACT_ADDRESSES.GAME_ENGINE,
        abi: GameEngineABI,
        functionName: 'playCard',
        args: [BigInt(gameId), BigInt(cardIndex)],
      })
      console.log('Card played successfully:', result)
      return result
    } catch (error) {
      console.error('Error playing card:', error)
      throw error
    }
  }

  const stakeETH = async (gameId: number, instanceId: number, amount: number) => {
    try {
      console.log(`Staking ${amount} ETH on instance ${instanceId} for game ${gameId}`)
      const result = await privyWriteContract({
        address: CONTRACT_ADDRESSES.GAME_ENGINE,
        abi: GameEngineABI,
        functionName: 'stakeETH',
        args: [BigInt(gameId), BigInt(instanceId), BigInt(amount)],
      })
      console.log('ETH staked successfully:', result)
      return result
    } catch (error) {
      console.error('Error staking ETH:', error)
      throw error
    }
  }

  // Helper function to get active games from the blockchain
  const getActiveGames = async (minutesAgo: number = 30) => {
    try {
      // Get the total number of games
      const { readContract } = await import('wagmi/actions')
      const nextGameId = await readContract(wagmiConfig, {
        address: CONTRACT_ADDRESSES.GAME_ENGINE,
        abi: GameEngineABI,
        functionName: 'nextGameId',
        args: [],
      })
      
      console.log('Next game ID from contract:', nextGameId)
      
      if (!nextGameId || Number(nextGameId) === 0) {
        console.log('No games exist yet')
        return []
      }
      
      // Fetch recent games (fetch last 10 games or all if less than 10)
      const totalGames = Number(nextGameId)
      const gamesToFetch = Math.min(totalGames, 10)
      const games = []
      
      console.log(`Fetching ${gamesToFetch} games, total games: ${totalGames}`)
      
      // Games are 0-indexed, so if nextGameId is 3, we have games 0, 1, 2
      for (let i = totalGames - 1; i >= Math.max(0, totalGames - gamesToFetch); i--) {
        try {
          const gameData = await readContract(wagmiConfig, {
            address: CONTRACT_ADDRESSES.GAME_ENGINE,
            abi: GameEngineABI,
            functionName: 'games',
            args: [BigInt(i)],
          })
          
          console.log(`Game ${i} data:`, gameData)
          
          // Only show games that are waiting for players (not started and no player2)
          const hasPlayer2 = gameData.player2 && gameData.player2 !== '0x0000000000000000000000000000000000000000'
          if (gameData && !gameData.isStarted && !hasPlayer2) {
            console.log(`Game ${i} is available for joining`)
            games.push({
              gameId: i,
              creator: gameData.player1,
              player2: gameData.player2 || '0x0000000000000000000000000000000000000000',
              status: 'waiting' as const,
              createdAt: Date.now() - (totalGames - 1 - i) * 60000, // Estimate time
              deckIds: { 
                player1: Number(gameData.player1DeckId || 0), 
                player2: Number(gameData.player2DeckId || 0) 
              }
            })
          } else {
            console.log(`Game ${i} is not available: isStarted=${gameData.isStarted}, hasPlayer2=${hasPlayer2}`)
          }
        } catch (err) {
          console.warn(`Error fetching game ${i}:`, err)
        }
      }
      
      console.log('Returning games:', games)
      return games
    } catch (error) {
      console.error('Error fetching active games:', error)
      return []
    }
  }

  // Helper function to get detailed game state using contract's getGameState function
  const getDetailedGameState = async (gameId: number) => {
    try {
      const { readContract } = await import('wagmi/actions')
      const gameStateView = await readContract(wagmiConfig, {
        address: CONTRACT_ADDRESSES.GAME_ENGINE,
        abi: GameEngineABI,
        functionName: 'getGameState',
        args: [BigInt(gameId)],
      })
      
      console.log('Detailed game state from contract:', gameStateView)
      return gameStateView
    } catch (error) {
      console.error('Error fetching detailed game state:', error)
      return null
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
      
      console.log('===== RAW GAME DATA FROM CONTRACT =====')
      console.log('Game ID:', gameId)
      console.log('Raw game data:', gameData)
      console.log('Type of game data:', typeof gameData)
      console.log('Is array?:', Array.isArray(gameData))
      
      if (!gameData) {
        console.log('No game data returned!')
        return null
      }
      
      // The games mapping returns a tuple, which viem converts to an object
      // Let's see what properties are actually available
      console.log('Game data keys:', Object.keys(gameData))
      console.log('Game data entries:', Object.entries(gameData))
      
      // Try accessing by index first (arrays in Solidity return as indexed)
      const gameId_ = gameData[0]
      const player1 = gameData[1]
      const player2 = gameData[2]
      const player1DeckId = gameData[3]
      const player2DeckId = gameData[4]
      const player1State = gameData[5]
      const player2State = gameData[6]
      const isStarted = gameData[7]
      const isFinished = gameData[8]
      const currentTurn = gameData[9]
      const turnNumber = gameData[10]
      const createdAt = gameData[11]
      const startedAt = gameData[12]
      
      console.log('Parsed values:')
      console.log('  Game ID:', gameId_)
      console.log('  Player1:', player1)
      console.log('  Player2:', player2)
      console.log('  Is Started:', isStarted)
      console.log('  Player1 Deck ID:', player1DeckId)
      console.log('  Player2 Deck ID:', player2DeckId)
      console.log('=======================================')
      
      // Parse the game data from contract
      // Status: 'waiting' if no player2, 'ready' if player2 joined but not started, 'started' if isStarted is true
      const hasPlayer2 = player2 && player2 !== '0x0000000000000000000000000000000000000000'
      const status = isStarted ? 'started' : (hasPlayer2 ? 'ready' : 'waiting')
      
      return {
        gameId,
        player1: player1,
        creator: player1, // Keep for backwards compat
        player2: player2,
        status,
        isStarted: isStarted,
        isFinished: isFinished,
        currentTurn: currentTurn ? Number(currentTurn) : undefined,
        turnNumber: turnNumber ? Number(turnNumber) : undefined,
        deckIds: { 
          player1: player1DeckId ? Number(player1DeckId) : undefined, 
          player2: player2DeckId ? Number(player2DeckId) : undefined
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
    endTurn,
    playCard,
    stakeETH,
    getActiveGames,
    getGameState,
    getDetailedGameState,
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