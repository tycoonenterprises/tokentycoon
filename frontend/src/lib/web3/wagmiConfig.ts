// Import createConfig from @privy-io/wagmi, not wagmi
import { createConfig } from '@privy-io/wagmi'
import { http } from 'wagmi'

// Local development network configuration (Anvil default)
export const localChain = {
  id: 31337,
  name: 'Local Development',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['http://localhost:8545'] },
  },
  blockExplorers: {
    default: { name: 'Local Explorer', url: 'http://localhost:8545' },
  },
} as const

// Wagmi configuration using @privy-io/wagmi's createConfig
// This ensures proper integration with Privy's embedded wallets
export const wagmiConfig = createConfig({
  chains: [localChain],
  transports: {
    [localChain.id]: http('http://localhost:8545'),
  },
})