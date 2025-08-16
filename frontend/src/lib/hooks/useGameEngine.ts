import { useReadContract, useWriteContract } from 'wagmi'
import { CONTRACT_ADDRESSES } from '@/lib/web3/config'
import { GameEngineABI } from '@/lib/contracts/GameEngineABI'
import { useAccount } from 'wagmi'

// Types based on the smart contract
export interface GameSession {
  id: number
  player1: string
  player2: string
  isActive: boolean
  isComplete: boolean
  createdAt: number
  completedAt: number
}

export interface PlayerHand {
  gameId: number
  player: string
  cards: string[]
}

export const useGameEngine = () => {
  const { address } = useAccount()

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

  // Write functions
  const { writeContract: createGameContract, isPending: isCreatingGame } = useWriteContract()
  const { writeContract: joinGameContract, isPending: isJoiningGame } = useWriteContract()
  const { writeContract: startGameContract, isPending: isStartingGame } = useWriteContract()
  const { writeContract: drawCardContract, isPending: isDrawingCard } = useWriteContract()

  const createGame = async (deckId: number) => {
    return createGameContract({
      address: CONTRACT_ADDRESSES.GAME_ENGINE,
      abi: GameEngineABI,
      functionName: 'createGame',
      args: [deckId],
    })
  }

  const joinGame = async (gameId: number, deckId: number) => {
    return joinGameContract({
      address: CONTRACT_ADDRESSES.GAME_ENGINE,
      abi: GameEngineABI,
      functionName: 'joinGame',
      args: [gameId, deckId],
    })
  }

  const startGame = async (gameId: number) => {
    return startGameContract({
      address: CONTRACT_ADDRESSES.GAME_ENGINE,
      abi: GameEngineABI,
      functionName: 'startGame',
      args: [gameId],
    })
  }

  const drawCard = async (gameId: number) => {
    return drawCardContract({
      address: CONTRACT_ADDRESSES.GAME_ENGINE,
      abi: GameEngineABI,
      functionName: 'drawCard',
      args: [gameId],
    })
  }

  return {
    // Data
    sessionCount: sessionCount as number | undefined,
    myGames: myGames as number[] | undefined,
    availableGames: availableGames as number[] | undefined,
    
    // Loading states
    isCreatingGame,
    isJoiningGame,
    isStartingGame,
    isDrawingCard,
    
    // Actions
    createGame,
    joinGame,
    startGame,
    drawCard,
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