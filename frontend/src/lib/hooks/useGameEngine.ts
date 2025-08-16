import { useReadContract, useAccount } from 'wagmi'
import { CONTRACT_ADDRESSES } from '@/lib/web3/config'
import { wagmiConfig } from '@/lib/web3/wagmiConfig'
import { GameEngineABI } from '@/lib/contracts/GameEngineABI'
import { usePrivySmartContract } from './usePrivySmartContract'
import type { GameSession, PlayerHand } from '@/lib/types/contracts'
import { useCallback } from 'react'
import { useTransactionStore, type TransactionRecord } from '@/stores/transactionStore'

export const useGameEngine = () => {
  const { address } = useAccount()
  
  // Use Privy's smart contract hook for write operations
  const { writeContract: privyWriteContract, isPending: isPrivyPending } = usePrivySmartContract()

  // Use global transaction store
  const { addTransaction, updateTransaction } = useTransactionStore()
  
  // Helper function to track transactions
  const trackTransaction = useCallback(async (
    functionName: string,
    args: any[],
    txHash: string
  ): Promise<TransactionRecord> => {
    const txId = `${Date.now()}_${Math.random()}`
    
    // Create initial transaction record
    const initialRecord: TransactionRecord = {
      id: txId,
      functionName,
      args,
      hash: txHash,
      gasUsed: 0n,
      gasPrice: 0n,
      totalCost: 0n,
      timestamp: Date.now(),
      status: 'pending'
    }
    
    // Add to global transaction store
    addTransaction(initialRecord)
    
    try {
      // Wait for transaction receipt to get gas information
      const { createPublicClient, http } = await import('viem')
      
      const publicClient = createPublicClient({
        transport: http('http://localhost:8545')
      })
      
      const receipt = await publicClient.waitForTransactionReceipt({ 
        hash: txHash as `0x${string}` 
      })
      
      // Update transaction record with gas information
      const updatedRecord: TransactionRecord = {
        ...initialRecord,
        gasUsed: receipt.gasUsed,
        gasPrice: receipt.effectiveGasPrice,
        totalCost: receipt.gasUsed * receipt.effectiveGasPrice,
        status: receipt.status === 'success' ? 'success' : 'failed'
      }
      
      // Update in global store
      updateTransaction(txId, updatedRecord)
      
      return updatedRecord
    } catch (error) {
      console.error('Error tracking transaction:', error)
      
      // Mark as failed
      const failedRecord: TransactionRecord = {
        ...initialRecord,
        status: 'failed'
      }
      
      // Update in global store
      updateTransaction(txId, failedRecord)
      
      return failedRecord
    }
  }, [addTransaction, updateTransaction])

  // Read functions - DISABLED to prevent filter spam
  // These hooks might be creating eth_getFilterChanges requests
  const sessionCount = undefined
  const myGames = undefined
  const refetchMyGames = async () => {}
  const availableGames = undefined
  const refetchAvailableGames = async () => {}
  
  /*
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
  */

  const createGame = async (deckId: number) => {
    try {
      const args = [BigInt(deckId)]
      
      // Use Privy's writeContract directly
      const txHash = await privyWriteContract({
        address: CONTRACT_ADDRESSES.GAME_ENGINE,
        abi: GameEngineABI,
        functionName: 'createGame',
        args,
      })
      
      console.log('Game creation transaction sent with Privy:', txHash)
      
      // Track the transaction (async, don't wait for it)
      trackTransaction('createGame', args, txHash)
      
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
      const args = [BigInt(gameId), BigInt(deckId)]
      
      // Use Privy's writeContract directly
      const result = await privyWriteContract({
        address: CONTRACT_ADDRESSES.GAME_ENGINE,
        abi: GameEngineABI,
        functionName: 'joinGame',
        args,
      })
      
      // Track the transaction
      trackTransaction('joinGame', args, result)
      
      return result
    } catch (error) {
      console.error('Error joining game:', error)
      throw error
    }
  }

  const startGame = async (gameId: number) => {
    try {
      const args = [BigInt(gameId)]
      
      // Use Privy's writeContract directly
      const result = await privyWriteContract({
        address: CONTRACT_ADDRESSES.GAME_ENGINE,
        abi: GameEngineABI,
        functionName: 'startGame',
        args,
      })
      
      // Track the transaction
      trackTransaction('startGame', args, result)
      
      return result
    } catch (error) {
      console.error('Error starting game:', error)
      throw error
    }
  }

  const drawCard = async (gameId: number) => {
    const args = [BigInt(gameId)]
    
    // Use Privy's writeContract directly
    const result = await privyWriteContract({
      address: CONTRACT_ADDRESSES.GAME_ENGINE,
      abi: GameEngineABI,
      functionName: 'drawCard',
      args,
    })
    
    // Track the transaction
    trackTransaction('drawCard', args, result)
    
    return result
  }

  const drawToStartTurn = async (gameId: number) => {
    try {
      console.log(`Drawing to start turn for game ${gameId}`)
      const args = [BigInt(gameId)]
      
      const result = await privyWriteContract({
        address: CONTRACT_ADDRESSES.GAME_ENGINE,
        abi: GameEngineABI,
        functionName: 'drawToStartTurn',
        args,
      })
      
      // Track the transaction
      trackTransaction('drawToStartTurn', args, result)
      
      console.log('Draw to start turn successful:', result)
      return result
    } catch (error) {
      console.error('Error drawing to start turn:', error)
      throw error
    }
  }

  const endTurn = async (gameId: number) => {
    try {
      console.log(`Ending turn for game ${gameId}`)
      const args = [BigInt(gameId)]
      
      const result = await privyWriteContract({
        address: CONTRACT_ADDRESSES.GAME_ENGINE,
        abi: GameEngineABI,
        functionName: 'endTurn',
        args,
      })
      
      // Track the transaction
      trackTransaction('endTurn', args, result)
      
      console.log('Turn ended successfully:', result)
      return result
    } catch (error) {
      console.error('Error ending turn:', error)
      throw error
    }
  }

  const playCard = async (gameId: number, cardIndex: number) => {
    try {
      // Validate inputs
      if (cardIndex === undefined || cardIndex === null || cardIndex < 0) {
        throw new Error(`Invalid card index: ${cardIndex}`)
      }
      
      console.log(`Playing card at index ${cardIndex} for game ${gameId}`)
      const args = [BigInt(gameId), BigInt(cardIndex)]
      
      const result = await privyWriteContract({
        address: CONTRACT_ADDRESSES.GAME_ENGINE,
        abi: GameEngineABI,
        functionName: 'playCard',
        args,
      })
      
      // Track the transaction
      trackTransaction('playCard', args, result)
      
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
      const args = [BigInt(gameId), BigInt(instanceId), BigInt(amount)]
      
      const result = await privyWriteContract({
        address: CONTRACT_ADDRESSES.GAME_ENGINE,
        abi: GameEngineABI,
        functionName: 'stakeETH',
        args,
      })
      
      // Track the transaction
      trackTransaction('stakeETH', args, result)
      
      console.log('ETH staked successfully:', result)
      return result
    } catch (error) {
      console.error('Error staking ETH:', error)
      throw error
    }
  }

  const depositToColdStorage = async (gameId: number, amount: number) => {
    try {
      console.log(`Depositing ${amount} ETH to cold storage for game ${gameId}`)
      const args = [BigInt(gameId), BigInt(amount)]
      
      const result = await privyWriteContract({
        address: CONTRACT_ADDRESSES.GAME_ENGINE,
        abi: GameEngineABI,
        functionName: 'depositToColdStorage',
        args,
      })
      
      // Track the transaction
      trackTransaction('depositToColdStorage', args, result)
      
      console.log('ETH deposited to cold storage successfully:', result)
      return result
    } catch (error) {
      console.error('Error depositing to cold storage:', error)
      throw error
    }
  }

  const withdrawFromColdStorage = async (gameId: number, amount: number) => {
    try {
      console.log(`Withdrawing ${amount} ETH from cold storage for game ${gameId}`)
      const args = [BigInt(gameId), BigInt(amount)]
      
      const result = await privyWriteContract({
        address: CONTRACT_ADDRESSES.GAME_ENGINE,
        abi: GameEngineABI,
        functionName: 'withdrawFromColdStorage',
        args,
      })
      
      // Track the transaction
      trackTransaction('withdrawFromColdStorage', args, result)
      
      console.log('ETH withdrawn from cold storage successfully:', result)
      return result
    } catch (error) {
      console.error('Error withdrawing from cold storage:', error)
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
      
      return gameStateView
    } catch (error: any) {
      // Silently fail to avoid console spam
      throw error
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
      
      
      if (!gameData) {
        return null
      }
      
      // Try accessing by index first (arrays in Solidity return as indexed)
      // NOTE: PlayerState structs are not returned by public mappings, so indices shift!
      const gameId_ = gameData[0]
      const player1 = gameData[1]
      const player2 = gameData[2]
      const player1DeckId = gameData[3]
      const player2DeckId = gameData[4]
      // gameData[5] and gameData[6] would be player1State and player2State but they're not returned
      const isStarted = gameData[5]  // Shifted due to missing structs
      const isFinished = gameData[6]  // Shifted due to missing structs
      const currentTurn = gameData[7]  // Shifted due to missing structs
      const turnNumber = gameData[8]  // Shifted due to missing structs
      const needsToDraw = gameData[9]  // Shifted due to missing structs
      const createdAt = gameData[10]  // Shifted due to missing structs
      const startedAt = gameData[11]  // Shifted due to missing structs
      
      console.log('  Player1:', player1)
      console.log('  Player2:', player2)
      console.log('  Player1 Deck ID:', player1DeckId)
      console.log('  Player2 Deck ID:', player2DeckId)
      console.log('  Is Started (index 5):', isStarted)
      console.log('  Is Finished (index 6):', isFinished)
      console.log('  Current Turn (index 7):', currentTurn)
      console.log('  Turn Number (index 8):', turnNumber)
      console.log('  needsToDraw (index 9):', needsToDraw)
      console.log('  createdAt (index 10):', createdAt)
      console.log('  startedAt (index 11):', startedAt)
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

  // Get transactions and controls from global store
  const transactions = useTransactionStore(state => state.transactions)
  const clearTransactions = useTransactionStore(state => state.clearTransactions)
  const getTotalGasCost = useTransactionStore(state => state.getTotalGasCost)
  const getTotalGasUsed = useTransactionStore(state => state.getTotalGasUsed)
  const totalGasCost = getTotalGasCost()
  const totalGasUsed = getTotalGasUsed()

  // Comprehensive debug function to get full game state
  const getFullGameState = async (gameId: number) => {
    try {
      const { readContract } = await import('wagmi/actions')
      const { useGameStore } = await import('@/stores/gameStore')
      
      
      // Get basic game state
      const gameState = await getDetailedGameState(gameId)
      
      if (!gameState) {
        console.error('No game state found')
        return null
      }
      
      // Update the basic game state in the store
      useGameStore.getState().updateGameFromContract(gameState)
      
      // Get player hands and update store
      try {
        const player1Hand = await readContract(wagmiConfig, {
          address: CONTRACT_ADDRESSES.GAME_ENGINE,
          abi: GameEngineABI,
          functionName: 'getPlayerHand',
          args: [BigInt(gameId), gameState.player1],
        })
        
        if (player1Hand && Array.isArray(player1Hand)) {
          // Convert BigInt array to number array
          const cardIds = player1Hand.map(id => Number(id))
          useGameStore.getState().updatePlayerHandFromContract('player1', cardIds)
        }
        
        const player2Hand = await readContract(wagmiConfig, {
          address: CONTRACT_ADDRESSES.GAME_ENGINE,
          abi: GameEngineABI,
          functionName: 'getPlayerHand',
          args: [BigInt(gameId), gameState.player2],
        })
        
        if (player2Hand && Array.isArray(player2Hand)) {
          // Convert BigInt array to number array
          const cardIds = player2Hand.map(id => Number(id))
          useGameStore.getState().updatePlayerHandFromContract('player2', cardIds)
        }
      } catch (err) {
        console.error('Error fetching player hands:', err)
      }
      
      // Get player battlefields and update store
      try {
        const player1Battlefield = await readContract(wagmiConfig, {
          address: CONTRACT_ADDRESSES.GAME_ENGINE,
          abi: GameEngineABI,
          functionName: 'getPlayerBattlefield',
          args: [BigInt(gameId), gameState.player1],
        })
        
        if (player1Battlefield && Array.isArray(player1Battlefield)) {
          // Convert BigInt array to number array
          const instanceIds = player1Battlefield.map(id => Number(id))
          useGameStore.getState().updatePlayerBattlefieldFromContract('player1', instanceIds)
          
          // Get card instance details for battlefield cards
          // Removed battlefield details logging for performance
        }
        
        const player2Battlefield = await readContract(wagmiConfig, {
          address: CONTRACT_ADDRESSES.GAME_ENGINE,
          abi: GameEngineABI,
          functionName: 'getPlayerBattlefield',
          args: [BigInt(gameId), gameState.player2],
        })
        
        if (player2Battlefield && Array.isArray(player2Battlefield)) {
          // Convert BigInt array to number array
          const instanceIds = player2Battlefield.map(id => Number(id))
          useGameStore.getState().updatePlayerBattlefieldFromContract('player2', instanceIds)
          
          // Get card instance details for battlefield cards
          // Removed battlefield details logging for performance
        }
      } catch (err) {
        console.error('Error fetching player battlefields:', err)
      }
      
      return gameState
    } catch (error) {
      console.error('Error fetching full game state:', error)
      return null
    }
  }

  return {
    // Data
    sessionCount: sessionCount as number | undefined,
    myGames: myGames as number[] | undefined,
    availableGames: availableGames as number[] | undefined,
    
    // Transaction tracking
    transactions,
    totalGasCost,
    totalGasUsed,
    clearTransactions,
    
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
    drawToStartTurn,
    endTurn,
    playCard,
    stakeETH,
    depositToColdStorage,
    withdrawFromColdStorage,
    getActiveGames,
    getGameState,
    getDetailedGameState,
    getFullGameState,
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