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
    loginMethods: ['email' as const, 'wallet' as const],
    appearance: {
      theme: 'dark' as const,
      accentColor: '#627eea' as `#${string}`,
      logo: undefined,
    },
    embeddedWallets: {
      createOnLogin: 'users-without-wallets' as const,
    },
    supportedChains: [localChain],
    defaultChain: localChain,
  },
}

// Contract addresses from deployment
export const CONTRACT_ADDRESSES = {
  CARD_REGISTRY: '0x5FbDB2315678afecb367f032d93F642f64180aa3' as `0x${string}`,
  DECK_REGISTRY: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512' as `0x${string}`,
  GAME_ENGINE: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0' as `0x${string}`,
} as const