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
      
      console.log('🎯 CONTRACT CALL DEBUG - START')
      console.log(`📍 Playing card at index ${cardIndex} for game ${gameId}`)
      console.log(`🔢 Converting to BigInt: gameId=${gameId} -> ${BigInt(gameId)}, cardIndex=${cardIndex} -> ${BigInt(cardIndex)}`)
      const args = [BigInt(gameId), BigInt(cardIndex)]
      console.log('📤 Sending to contract:', args)
      console.log('🎯 CONTRACT CALL DEBUG - END')
      
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
      
      // First, let's check the game state before attempting the transaction
      try {
        const gameState = await getDetailedGameState(gameId)
        console.log('🔍 Game state before cold storage deposit:', gameState)
        console.log('🔍 Current user address (wagmi):', address)
        console.log('🔍 Game analysis:', {
          gameId,
          isStarted: gameState.isStarted,
          isFinished: gameState.isFinished,
          currentTurn: gameState.currentTurn,
          player1: gameState.player1,
          player2: gameState.player2,
          player1ETH: gameState.player1ETH.toString(),
          player2ETH: gameState.player2ETH.toString(),
          currentPlayer: gameState.currentTurn === 0n ? gameState.player1 : gameState.player2,
          transactionFrom: '0xeDd0a97Ae0524F50dE414c8805779d478E1a7C9c',
          needsToDraw: gameState.needsToDraw
        })
        
        // Check all the conditions that could cause revert
        const conditions = {
          gameNotActive: !gameState.isStarted || gameState.isFinished,
          notInGame: '0xeDd0a97Ae0524F50dE414c8805779d478E1a7C9c' !== gameState.player1 && '0xeDd0a97Ae0524F50dE414c8805779d478E1a7C9c' !== gameState.player2,
          notYourTurn: '0xeDd0a97Ae0524F50dE414c8805779d478E1a7C9c' !== (gameState.currentTurn === 0n ? gameState.player1 : gameState.player2),
          insufficientETH: gameState.player1ETH < BigInt(amount)
        }
        console.log('🚨 Potential revert conditions:', conditions)
        
        // Check if any condition would cause a revert
        if (conditions.gameNotActive) console.error('❌ REVERT: GameNotActive')
        if (conditions.notInGame) console.error('❌ REVERT: NotInGame')
        if (conditions.notYourTurn) console.error('❌ REVERT: NotYourTurn')
        if (conditions.insufficientETH) console.error('❌ REVERT: InsufficientETH')
        
        // Since all conditions are false, let's test if the contract exists by calling a simple view function
        try {
          const { readContract } = await import('wagmi/actions')
          const nextGameIdTest = await readContract(wagmiConfig, {
            address: CONTRACT_ADDRESSES.GAME_ENGINE,
            abi: GameEngineABI,
            functionName: 'nextGameId',
            args: [],
          })
          console.log('✅ Contract exists, nextGameId:', nextGameIdTest)
        } catch (contractError) {
          console.error('❌ Contract does not exist or is not responding:', contractError)
        }
        
      } catch (debugError) {
        console.warn('Could not fetch game state for debugging:', debugError)
      }
      
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
          const gameView = await readContract(wagmiConfig, {
            address: CONTRACT_ADDRESSES.GAME_ENGINE,
            abi: GameEngineABI,
            functionName: 'getGameState',
            args: [BigInt(i)],
          })
          
          console.log(`Game ${i} data:`, gameView)
          
          // Only show games that are waiting for players (not started and no player2)
          const hasPlayer2 = gameView.player2 && gameView.player2 !== '0x0000000000000000000000000000000000000000'
          if (gameView && !gameView.isStarted && !hasPlayer2) {
            console.log(`Game ${i} is available for joining`)
            games.push({
              gameId: i,
              creator: gameView.player1,
              player2: gameView.player2 || '0x0000000000000000000000000000000000000000',
              status: 'waiting' as const,
              createdAt: Date.now() - (totalGames - 1 - i) * 60000, // Estimate time
              deckIds: { 
                player1: undefined, // Deck IDs not available in GameView
                player2: undefined
              }
            })
          } else {
            console.log(`Game ${i} is not available: isStarted=${gameView.isStarted}, hasPlayer2=${hasPlayer2}`)
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

  // Helper function to get game state from blockchain using getGameState view function
  const getGameState = async (gameId: number) => {
    try {
      // Use the getGameState function which returns a proper struct
      const { readContract } = await import('wagmi/actions')
      const gameView = await readContract(wagmiConfig, {
        address: CONTRACT_ADDRESSES.GAME_ENGINE,
        abi: GameEngineABI,
        functionName: 'getGameState',
        args: [BigInt(gameId)],
      })
      
      if (!gameView) {
        return null
      }
      
      console.log('🎮 Game State from getGameState:', gameView)
      
      // GameView struct has named fields, much cleaner!
      const hasPlayer2 = gameView.player2 && gameView.player2 !== '0x0000000000000000000000000000000000000000'
      const status = gameView.isStarted ? 'started' : (hasPlayer2 ? 'ready' : 'waiting')
      
      return {
        gameId,
        player1: gameView.player1,
        creator: gameView.player1, // Keep for backwards compat
        player2: gameView.player2,
        status,
        isStarted: gameView.isStarted,
        isFinished: gameView.isFinished,
        currentTurn: gameView.currentTurn ? Number(gameView.currentTurn) : undefined,
        turnNumber: gameView.turnNumber ? Number(gameView.turnNumber) : undefined,
        needsToDraw: gameView.needsToDraw,
        // Add ETH and cold storage data
        player1ETH: gameView.player1ETH ? Number(gameView.player1ETH) : 0,
        player2ETH: gameView.player2ETH ? Number(gameView.player2ETH) : 0,
        player1ColdStorage: gameView.player1ColdStorage ? Number(gameView.player1ColdStorage) : 0,
        player2ColdStorage: gameView.player2ColdStorage ? Number(gameView.player2ColdStorage) : 0,
        // Note: Deck IDs are not in GameView, would need to query games mapping for those
        deckIds: { 
          player1: undefined, 
          player2: undefined
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
      console.log('🔄 Fetching player hands from contract...')
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
          console.log('📥 Player1 hand from contract:', cardIds, '(', cardIds.length, 'cards)')
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
          console.log('📥 Player2 hand from contract:', cardIds, '(', cardIds.length, 'cards)')
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
          
          // Get card instance details for each battlefield card
          const cardInstances = await Promise.all(
            instanceIds.map(async (instanceId) => {
              try {
                const instance = await readContract(wagmiConfig, {
                  address: CONTRACT_ADDRESSES.GAME_ENGINE,
                  abi: GameEngineABI,
                  functionName: 'getCardInstance',
                  args: [BigInt(instanceId)],
                })
                console.log(`🃏 Instance ${instanceId} data:`, instance)
                return instance
              } catch (err) {
                console.error(`Failed to fetch instance ${instanceId}:`, err)
                return null
              }
            })
          )
          
          useGameStore.getState().updatePlayerBattlefieldFromContract('player1', instanceIds, cardInstances)
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
          
          // Get card instance details for each battlefield card
          const cardInstances = await Promise.all(
            instanceIds.map(async (instanceId) => {
              try {
                const instance = await readContract(wagmiConfig, {
                  address: CONTRACT_ADDRESSES.GAME_ENGINE,
                  abi: GameEngineABI,
                  functionName: 'getCardInstance',
                  args: [BigInt(instanceId)],
                })
                return instance
              } catch (err) {
                console.error(`Failed to fetch instance ${instanceId}:`, err)
                return null
              }
            })
          )
          
          useGameStore.getState().updatePlayerBattlefieldFromContract('player2', instanceIds, cardInstances)
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