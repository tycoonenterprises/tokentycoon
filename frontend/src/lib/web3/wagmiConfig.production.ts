// Production configuration for Base Sepolia
import { createConfig } from '@privy-io/wagmi'
import { http } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'

// Wagmi configuration for production (Base Sepolia)
export const wagmiConfig = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http('https://sepolia.base.org'),
  },
})