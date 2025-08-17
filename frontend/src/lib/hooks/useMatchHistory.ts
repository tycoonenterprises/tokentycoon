import { useState, useEffect } from 'react'
import { useWallets } from '@privy-io/react-auth'
import { CONTRACT_ADDRESSES } from '@/lib/web3/config'
import { GameEngineABI } from '@/lib/contracts/GameEngineABI'

interface MatchHistoryEntry {
  gameId: number
  player1: string
  player2: string
  winner?: string
  isFinished: boolean
  isStarted: boolean
  createdAt?: number
  startedAt?: number
  finishedAt?: number
  userRole: 'player1' | 'player2' | 'spectator'
  result: 'won' | 'lost' | 'in-progress' | 'waiting'
}

export function useMatchHistory() {
  const [matchHistory, setMatchHistory] = useState<MatchHistoryEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { wallets } = useWallets()
  const privyWallet = wallets.find(w => w.walletClientType === 'privy')
  const userAddress = privyWallet?.address?.toLowerCase()

  const fetchMatchHistory = async () => {
    if (!userAddress) return
    
    setLoading(true)
    setError(null)
    
    try {
      const { readContract, createPublicClient, http, parseAbiItem } = await import('viem')
      const { wagmiConfig } = await import('@/lib/web3/wagmiConfig')
      
      // Create a public client for event fetching
      const publicClient = createPublicClient({
        transport: http('http://localhost:8545')
      })
      
      // Get total number of games to know the range
      const nextGameId = await readContract(wagmiConfig, {
        address: CONTRACT_ADDRESSES.GAME_ENGINE,
        abi: GameEngineABI,
        functionName: 'nextGameId',
        args: [],
      })
      
      const totalGames = Number(nextGameId)
      if (totalGames === 0) {
        setMatchHistory([])
        setLoading(false)
        return
      }
      
      // Fetch game states for all games where user participated
      const userMatches: MatchHistoryEntry[] = []
      
      // Check last 50 games or all games if less than 50
      const gamesToCheck = Math.min(totalGames, 50)
      
      for (let i = totalGames - 1; i >= Math.max(0, totalGames - gamesToCheck); i--) {
        try {
          const gameState = await readContract(wagmiConfig, {
            address: CONTRACT_ADDRESSES.GAME_ENGINE,
            abi: GameEngineABI,
            functionName: 'getGameState',
            args: [BigInt(i)],
          })
          
          const player1Address = gameState.player1.toLowerCase()
          const player2Address = gameState.player2.toLowerCase()
          
          // Only include games where the user is a participant
          if (player1Address === userAddress || player2Address === userAddress) {
            const userRole = player1Address === userAddress ? 'player1' : 'player2'
            
            let result: 'won' | 'lost' | 'in-progress' | 'waiting' = 'waiting'
            if (gameState.isFinished) {
              if (gameState.winner) {
                const winnerAddress = gameState.winner.toLowerCase()
                result = winnerAddress === userAddress ? 'won' : 'lost'
              }
            } else if (gameState.isStarted) {
              result = 'in-progress'
            }
            
            userMatches.push({
              gameId: i,
              player1: gameState.player1,
              player2: gameState.player2,
              winner: gameState.winner,
              isFinished: gameState.isFinished,
              isStarted: gameState.isStarted,
              userRole,
              result
            })
          }
        } catch (error) {
          console.error(`Error fetching game ${i}:`, error)
          // Continue to next game
        }
      }
      
      // Try to get timestamps from events (optional enhancement)
      try {
        const currentBlock = await publicClient.getBlockNumber()
        const fromBlock = currentBlock > 10000n ? currentBlock - 10000n : 0n
        
        // Fetch GameCreated events
        const gameCreatedLogs = await publicClient.getLogs({
          address: CONTRACT_ADDRESSES.GAME_ENGINE,
          event: parseAbiItem('event GameCreated(uint256 indexed gameId, address indexed creator)'),
          fromBlock,
          toBlock: currentBlock
        })
        
        // Fetch GameStarted events
        const gameStartedLogs = await publicClient.getLogs({
          address: CONTRACT_ADDRESSES.GAME_ENGINE,
          event: parseAbiItem('event GameStarted(uint256 indexed gameId, address indexed player1, address indexed player2)'),
          fromBlock,
          toBlock: currentBlock
        })
        
        // Fetch GameFinished events
        const gameFinishedLogs = await publicClient.getLogs({
          address: CONTRACT_ADDRESSES.GAME_ENGINE,
          event: parseAbiItem('event GameFinished(uint256 indexed gameId, address indexed winner)'),
          fromBlock,
          toBlock: currentBlock
        })
        
        // Add timestamps to matches
        userMatches.forEach(match => {
          const createdLog = gameCreatedLogs.find(log => Number(log.args?.gameId) === match.gameId)
          const startedLog = gameStartedLogs.find(log => Number(log.args?.gameId) === match.gameId)
          const finishedLog = gameFinishedLogs.find(log => Number(log.args?.gameId) === match.gameId)
          
          // Convert block numbers to approximate timestamps (12 second block time)
          if (createdLog) {
            match.createdAt = Number(createdLog.blockNumber) * 12
          }
          if (startedLog) {
            match.startedAt = Number(startedLog.blockNumber) * 12
          }
          if (finishedLog) {
            match.finishedAt = Number(finishedLog.blockNumber) * 12
          }
        })
      } catch (eventError) {
        console.log('Could not fetch event timestamps:', eventError)
        // Continue without timestamps
      }
      
      // Sort by gameId descending (most recent first)
      userMatches.sort((a, b) => b.gameId - a.gameId)
      
      setMatchHistory(userMatches)
    } catch (error) {
      console.error('Error fetching match history:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch match history')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userAddress) {
      fetchMatchHistory()
    }
  }, [userAddress])

  return {
    matchHistory,
    loading,
    error,
    refetch: fetchMatchHistory
  }
}