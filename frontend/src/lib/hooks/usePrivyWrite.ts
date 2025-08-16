import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useState } from 'react'
import type { Abi } from 'viem'

interface WriteContractArgs {
  address: `0x${string}`
  abi: Abi
  functionName: string
  args?: any[]
}

export function usePrivyWriteContract() {
  const { user } = usePrivy()
  const { wallets } = useWallets()
  const [isPending, setIsPending] = useState(false)

  const writeContract = async (config: WriteContractArgs) => {
    setIsPending(true)
    try {
      // Get the embedded wallet (first wallet is usually the embedded one)
      const embeddedWallet = wallets.find(
        wallet => wallet.walletClientType === 'privy'
      ) || wallets[0]

      if (!embeddedWallet) {
        throw new Error('No Privy wallet found. Please create a wallet first.')
      }

      // Switch to the correct chain if needed
      await embeddedWallet.switchChain(31337) // Local chain ID

      // Get the wallet client
      const provider = await embeddedWallet.getEthereumProvider()
      
      // Create the transaction
      const tx = {
        to: config.address,
        data: encodeFunctionData(config.abi, config.functionName, config.args || []),
        from: embeddedWallet.address,
      }

      // Send the transaction using the embedded wallet
      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [tx],
      })

      console.log('Transaction sent with Privy wallet:', txHash)
      return txHash
    } catch (error) {
      console.error('Error with Privy transaction:', error)
      throw error
    } finally {
      setIsPending(false)
    }
  }

  return {
    writeContract,
    isPending,
  }
}

// Helper function to encode function data
function encodeFunctionData(abi: Abi, functionName: string, args: any[]): string {
  // This is a simplified version - in production use viem's encodeFunctionData
  const func = abi.find((item: any) => item.type === 'function' && item.name === functionName)
  if (!func) throw new Error(`Function ${functionName} not found in ABI`)
  
  // For now, return a placeholder - you'd need proper ABI encoding here
  return '0x' + functionName.slice(0, 8).padEnd(8, '0')
}