import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useState } from 'react'
import { encodeFunctionData, type Abi } from 'viem'
import type { WalletWithMetadata } from '@privy-io/react-auth'

interface WriteContractArgs {
  address: `0x${string}`
  abi: Abi
  functionName: string
  args?: any[]
}

export function usePrivySmartContract() {
  const { user } = usePrivy()
  const { wallets } = useWallets()
  const [isPending, setIsPending] = useState(false)

  const getPrivyWallet = async (): Promise<WalletWithMetadata | null> => {
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

  const writeContract = async (config: WriteContractArgs) => {
    setIsPending(true)
    try {
      const wallet = await getPrivyWallet()
      if (!wallet) {
        throw new Error('No wallet available. Please create a wallet in the Privy debug panel.')
      }

      // Switch to the correct chain if needed (local chain)
      await wallet.switchChain(31337)

      // Get the ethereum provider from the wallet
      const provider = await wallet.getEthereumProvider()
      
      // Encode the function call
      const data = encodeFunctionData({
        abi: config.abi,
        functionName: config.functionName,
        args: config.args || [],
      })

      // First, estimate gas for the transaction
      const estimatedGas = await provider.request({
        method: 'eth_estimateGas',
        params: [{
          from: wallet.address as `0x${string}`,
          to: config.address,
          data,
        }],
      })

      console.log('Estimated gas:', estimatedGas)

      // Get current gas price
      const gasPrice = await provider.request({
        method: 'eth_gasPrice',
        params: [],
      })

      // Create and send the transaction with gas parameters
      const txRequest = {
        from: wallet.address as `0x${string}`,
        to: config.address,
        data,
        gas: estimatedGas, // Use estimated gas
        gasPrice: gasPrice, // Use current gas price
        value: '0x0', // No ETH value for contract calls
      }

      console.log('Sending transaction with Privy wallet:', txRequest)
      
      // Send the transaction using the Privy wallet's provider
      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [txRequest],
      })

      console.log('Transaction sent successfully:', txHash)
      return txHash
    } catch (error) {
      console.error('Error sending transaction with Privy:', error)
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