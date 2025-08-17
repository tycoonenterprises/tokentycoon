import { useState, useEffect } from 'react'
import { mainnet } from 'wagmi/chains'

/**
 * Custom hook to resolve ENS names from wallet addresses
 * Uses a simple fetch to ENS resolution API since we're on localhost
 */
export function useENSName(address: string | undefined) {
  const [ensName, setEnsName] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!address) {
      setEnsName(null)
      return
    }

    // Validate address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      setEnsName(null)
      return
    }

    setLoading(true)

    const resolveENS = async () => {
      try {
        // Use a public ENS resolver API
        const response = await fetch(`https://api.ensdata.net/${address}`)
        const data = await response.json()
        
        if (data.ens) {
          setEnsName(data.ens)
        } else {
          setEnsName(null)
        }
      } catch (error) {
        console.log('ENS resolution failed:', error)
        setEnsName(null)
      } finally {
        setLoading(false)
      }
    }

    resolveENS()
  }, [address])

  return { ensName, loading }
}

/**
 * Utility function to display either ENS name or shortened address
 */
export function formatWalletDisplay(address: string | undefined, ensName: string | null): string {
  if (!address) return 'Unknown'
  
  if (ensName) {
    return ensName
  }
  
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}