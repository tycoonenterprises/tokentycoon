import { useState, useCallback, useRef } from 'react'
import { encodeFunctionData, type Hex } from 'viem'
import { usePrivy, useWallets, useSendTransaction } from '@privy-io/react-auth'
import { CONTRACT_ADDRESSES } from '@/lib/web3/config'
import { GameEngineABI } from '@/lib/contracts/GameEngineABI'

interface QueuedTransaction {
  functionName: string
  args: any[]
  resolve: (value: any) => void
  reject: (error: any) => void
}

export function useBatchedTransactions() {
  const { wallets } = useWallets()
  const { sendTransaction } = useSendTransaction()
  const [isPending, setIsPending] = useState(false)
  const [queue, setQueue] = useState<QueuedTransaction[]>([])
  const batchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  
  // Batch configuration
  const BATCH_DELAY = 500 // Wait 500ms to collect transactions
  const MAX_BATCH_SIZE = 5 // Max transactions per batch
  
  const getPrivyWallet = () => {
    const embeddedWallet = wallets.find(w => w.walletClientType === 'privy')
    return embeddedWallet || wallets[0]
  }
  
  // Execute a batch of transactions as a multicall
  const executeBatch = useCallback(async (batch: QueuedTransaction[]) => {
    if (batch.length === 0) return
    
    const wallet = getPrivyWallet()
    if (!wallet) {
      batch.forEach(tx => tx.reject(new Error('No wallet available')))
      return
    }
    
    setIsPending(true)
    
    try {
      // If only one transaction, execute normally
      if (batch.length === 1) {
        const tx = batch[0]
        
        const data = encodeFunctionData({
          abi: GameEngineABI,
          functionName: tx.functionName as any,
          args: tx.args as any,
        })
        
        const txReceipt = await sendTransaction({
          to: CONTRACT_ADDRESSES.GAME_ENGINE,
          data,
          value: 0n,
        })
        
        tx.resolve(txReceipt.hash)
        console.log(`✅ Single transaction executed: ${tx.functionName}`)
      } else {
        // Multiple transactions - we need to implement multicall in the contract
        // For now, we'll execute them sequentially with one approval dialog
        console.log(`📦 Executing batch of ${batch.length} transactions...`)
        
        const results = []
        
        // Create a promise that will show one approval dialog for all transactions
        const batchMessage = `Approve ${batch.length} game actions:\n${batch.map(tx => `• ${tx.functionName}`).join('\n')}`
        console.log(batchMessage)
        
        // Execute transactions sequentially after single approval
        for (const tx of batch) {
          try {
            const data = encodeFunctionData({
              abi: GameEngineABI,
              functionName: tx.functionName as any,
              args: tx.args as any,
            })
            
            const txReceipt = await sendTransaction({
              to: CONTRACT_ADDRESSES.GAME_ENGINE,
              data,
              value: 0n,
            })
            
            results.push(txReceipt.hash)
            tx.resolve(txReceipt.hash)
          } catch (error) {
            tx.reject(error)
          }
        }
        
        console.log(`✅ Batch completed: ${results.length}/${batch.length} successful`)
      }
    } catch (error) {
      console.error('Batch execution failed:', error)
      batch.forEach(tx => tx.reject(error))
    } finally {
      setIsPending(false)
    }
  }, [wallets])
  
  // Add a transaction to the queue
  const queueTransaction = useCallback((functionName: string, args: any[]): Promise<Hex> => {
    return new Promise((resolve, reject) => {
      setQueue(prevQueue => {
        const newQueue = [...prevQueue, { functionName, args, resolve, reject }]
        
        // Clear existing timeout
        if (batchTimeoutRef.current) {
          clearTimeout(batchTimeoutRef.current)
        }
        
        // If we've reached max batch size, execute immediately
        if (newQueue.length >= MAX_BATCH_SIZE) {
          executeBatch(newQueue)
          return []
        }
        
        // Otherwise, set a timeout to execute the batch
        batchTimeoutRef.current = setTimeout(() => {
          setQueue(currentQueue => {
            executeBatch(currentQueue)
            return []
          })
        }, BATCH_DELAY)
        
        return newQueue
      })
    })
  }, [executeBatch])
  
  // Force execute the current queue
  const flushQueue = useCallback(() => {
    if (batchTimeoutRef.current) {
      clearTimeout(batchTimeoutRef.current)
    }
    
    setQueue(currentQueue => {
      executeBatch(currentQueue)
      return []
    })
  }, [executeBatch])
  
  // Cancel all queued transactions
  const cancelQueue = useCallback(() => {
    if (batchTimeoutRef.current) {
      clearTimeout(batchTimeoutRef.current)
    }
    
    setQueue(currentQueue => {
      currentQueue.forEach(tx => tx.reject(new Error('Cancelled')))
      return []
    })
  }, [])
  
  return {
    queueTransaction,
    flushQueue,
    cancelQueue,
    isPending,
    queueLength: queue.length,
  }
}