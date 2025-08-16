import { createConfig, http } from 'wagmi'

// Local development network configuration
export const localChain = {
  id: 1337,
  name: 'Local Development',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['http://localhost:8545'] },
  },
  blockExplorers: {
    default: { name: 'Local Explorer', url: 'http://localhost:8545' },
  },
} as const

// Wagmi configuration for local development
export const config = createConfig({
  chains: [localChain],
  transports: {
    [localChain.id]: http('http://localhost:8545'),
  },
})

// Privy configuration
export const privyConfig = {
  appId: import.meta.env.VITE_PRIVY_APP_ID || 'local-dev-app-id',
  config: {
    loginMethods: ['email', 'wallet', 'discord', 'farcaster'],
    appearance: {
      theme: 'dark' as const,
      accentColor: '#627eea' as `#${string}`,
      logo: undefined,
    },
    embeddedWallets: {
      createOnLogin: 'users-without-wallets' as const,
    },
    defaultChain: localChain,
  },
}

// Contract addresses (to be updated when contracts are deployed)
export const CONTRACT_ADDRESSES = {
  CARD_REGISTRY: '0x0000000000000000000000000000000000000000', // Placeholder
} as const