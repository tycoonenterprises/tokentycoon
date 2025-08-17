// Import createConfig from @privy-io/wagmi, not wagmi
import { createConfig } from '@privy-io/wagmi'
import { http } from 'wagmi'

// Local development network configuration (Anvil default)
const localChain = {
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

// Base Sepolia chain for production
const baseSepoliaChain = {
  id: 84532,
  name: 'Base Sepolia',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://sepolia.base.org'] },
  },
  blockExplorers: {
    default: { name: 'Base Sepolia Explorer', url: 'https://sepolia.basescan.org' },
  },
} as const

// Determine which chain to use based on environment
const isProduction = import.meta.env.PROD
const chains = isProduction ? [baseSepoliaChain] : [localChain, baseSepoliaChain]

// Wagmi configuration using @privy-io/wagmi's createConfig
// This ensures proper integration with Privy's embedded wallets
export const wagmiConfig = createConfig({
  chains,
  transports: {
    [localChain.id]: http('http://localhost:8545'),
    [baseSepoliaChain.id]: http('https://sepolia.base.org'),
  },
})