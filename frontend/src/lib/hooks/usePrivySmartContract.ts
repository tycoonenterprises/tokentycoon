import { usePrivy, useWallets, useFundWallet, useSendTransaction } from '@privy-io/react-auth'
import { useState } from 'react'
import { encodeFunctionData, type Abi } from 'viem'
import { usePublicClient } from 'wagmi'

interface WriteContractArgs {
  address: `0x${string}`
  abi: Abi
  functionName: string
  args?: any[]
}

export function usePrivySmartContract() {
  const { user } = usePrivy()
  const { wallets } = useWallets()
  const { fundWallet } = useFundWallet()
  const { sendTransaction } = useSendTransaction()
  const publicClient = usePublicClient()
  const [isPending, setIsPending] = useState(false)

  const getPrivyWallet = () => {
    // Get the embedded wallet (Privy wallet)
    const embeddedWallet = wallets.find(
      wallet => wallet.walletClientType === 'privy'
    )
    
    if (!embeddedWallet) {
      // Try to get any connected wallet
      const anyWallet = wallets[0]
      if (!anyWallet) {
        console.error('No wallet found. Please create a wallet first.')
        return null
      }
      return anyWallet
    }
    
    return embeddedWallet
  }

  const checkBalance = async (address: string, requiredAmount: bigint): Promise<boolean> => {
    try {
      if (!publicClient) return true // Assume sufficient balance if no client
      
      const balance = await publicClient.getBalance({
        address: address as `0x${string}`
      })
      
      return balance >= requiredAmount
    } catch (error) {
      console.error('Error checking balance for address:', address, error)
      return false
    }
  }

  const promptFundingIfNeeded = async (address: string, error: any): Promise<void> => {
    // Check if error is related to insufficient funds
    const errorMessage = error?.message || error?.toString() || ''
    const isInsufficientFunds = errorMessage.toLowerCase().includes('insufficient') || 
                               errorMessage.toLowerCase().includes('funds') ||
                               errorMessage.toLowerCase().includes('balance')
    
    const wallet = getPrivyWallet()
    if (isInsufficientFunds && wallet?.walletClientType === 'privy') {
      console.log('Insufficient funds detected, triggering funding flow for:', address)
      
      try {
        console.log('Triggering funding for wallet address:', address)
        // Fund on Base (cheaper than mainnet) - use simple configuration
        await fundWallet(address)
        console.log('Funding flow completed successfully')
      } catch (fundingError) {
        console.error('Funding flow failed for wallet:', address, fundingError)
      }
    }
  }

  const writeContract = async (config: WriteContractArgs) => {
    setIsPending(true)
    try {
      // Get the Privy embedded wallet
      const wallet = getPrivyWallet()
      if (!wallet) {
        throw new Error('No wallet available. Please create a wallet in the Privy debug panel.')
      }

      // Encode the function call
      const data = encodeFunctionData({
        abi: config.abi,
        functionName: config.functionName,
        args: config.args || [],
      })

      // Estimate gas if public client is available
      let estimatedGas = 300000n // Default gas limit
      if (publicClient) {
        try {
          estimatedGas = await publicClient.estimateGas({
            account: wallet.address as `0x${string}`,
            to: config.address,
            data,
          })
          console.log('Estimated gas:', estimatedGas)
        } catch (estimateError) {
          console.warn('Gas estimation failed, using default:', estimateError)
        }
      }

      // Check balance if possible
      if (publicClient) {
        const gasPrice = await publicClient.getGasPrice()
        const gasCost = estimatedGas * gasPrice
        const hasSufficientFunds = await checkBalance(wallet.address, gasCost)
        
        if (!hasSufficientFunds) {
          console.log('Insufficient funds for transaction, prompting funding...')
          await promptFundingIfNeeded(wallet.address, new Error('Insufficient funds for gas'))
          throw new Error('Insufficient funds for transaction. Please fund your wallet and try again.')
        }
      }

      // Use Privy's sendTransaction directly
      console.log('Sending transaction with Privy...')
      
      const txReceipt = await sendTransaction({
        to: config.address,
        data,
        value: 0n,
      }, {
        // Disable UI for auto-approval if this is a Privy wallet
        uiOptions: wallet.walletClientType === 'privy' ? { 
          showWalletUIs: false 
        } : undefined
      })
      
      console.log('Transaction sent successfully:', txReceipt.hash)
      return txReceipt.hash
    } catch (error) {
      console.error('Error sending transaction with Privy:', error)
      
      // If transaction fails due to insufficient funds, prompt for funding
      const wallet = getPrivyWallet()
      if (wallet) {
        await promptFundingIfNeeded(wallet.address, error)
      }
      
      throw error
    } finally {
      setIsPending(false)
    }
  }

  return {
    writeContract,
    isPending,
    wallets,
  }
}