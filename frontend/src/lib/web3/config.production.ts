// Production configuration for Base Sepolia deployment
// This file is used by GitHub Actions during deployment

// Base Sepolia configuration
export const baseSepolia = {
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

// Ethereum mainnet configuration (needed for funding)
export const mainnet = {
  id: 1,
  name: 'Ethereum',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://ethereum.publicnode.com'] },
  },
  blockExplorers: {
    default: { name: 'Etherscan', url: 'https://etherscan.io' },
  },
} as const

// Base mainnet (alternative for funding)
export const base = {
  id: 8453,
  name: 'Base',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://mainnet.base.org'] },
  },
  blockExplorers: {
    default: { name: 'BaseScan', url: 'https://basescan.org' },
  },
} as const

// Local chain (kept for compatibility but not used in production)
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

// Privy configuration
export const privyConfig = {
  appId: import.meta.env.VITE_PRIVY_APP_ID || 'local-dev-app-id',
  config: {
    loginMethods: ['email' as const, 'wallet' as const, 'sms' as const],
    appearance: {
      theme: 'dark' as const,
      accentColor: '#627eea' as `#${string}`,
      logo: undefined,
    },
    embeddedWallets: {
      createOnLogin: 'all-users' as const,
      requireUserPasswordOnCreate: false,
      noPromptOnSignature: true,
      showWalletUIs: false,
    },
    externalWallets: {
      metamask: true,
      coinbaseWallet: { connectionOptions: 'all' as const },
      walletConnect: { enabled: true },
    },
    supportedChains: [baseSepolia, mainnet, base],
    defaultChain: baseSepolia,
    mfa: {
      noPromptOnMfaRequired: false,
    },
    legal: {
      termsAndConditionsUrl: '',
      privacyPolicyUrl: '',
    },
  },
}

// Contract addresses - will be replaced by GitHub Actions
export const CONTRACT_ADDRESSES = {
  CARD_REGISTRY: 'REPLACE_CARD_REGISTRY' as `0x${string}`,
  DECK_REGISTRY: 'REPLACE_DECK_REGISTRY' as `0x${string}`,
  GAME_ENGINE: 'REPLACE_GAME_ENGINE' as `0x${string}`,
} as const