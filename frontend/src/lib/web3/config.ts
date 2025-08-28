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

// Determine default chain based on environment
const getDefaultChain = () => {
  const isProduction = import.meta.env.PROD || 
                     import.meta.env.VITE_ENVIRONMENT === 'production' ||
                     window.location.hostname !== 'localhost'
  
  return isProduction ? baseSepolia : localChain
}

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
      noPromptOnSignature: true, // Auto-approve message signatures
      showWalletUIs: false, // Hide wallet UI for seamless experience
    },
    externalWallets: {
      metamask: true,
      coinbaseWallet: { connectionOptions: 'all' as const },
      walletConnect: { enabled: true },
    },
    supportedChains: [localChain, baseSepolia, mainnet, base],
    defaultChain: getDefaultChain(),
    mfa: {
      noPromptOnMfaRequired: false,
    },
    legal: {
      termsAndConditionsUrl: '',
      privacyPolicyUrl: '',
    },
  },
}

// Function to get contract addresses based on environment
const getContractAddresses = () => {
  const isProduction = import.meta.env.PROD || 
                     import.meta.env.VITE_ENVIRONMENT === 'production' ||
                     window.location.hostname !== 'localhost'

  if (isProduction) {
    // Base Sepolia production addresses
    return {
      CARD_REGISTRY: '0x8f0c54b31077a505A98fCE72FBc2eeF247F40550' as `0x${string}`,
      DECK_REGISTRY: '0x464636fAC3b95EB37B9C5e1CFDa13A1d5E382D64' as `0x${string}`,
      GAME_ENGINE: '0x947F43184d438d7C4D0ceBD9D28751e7C5296891' as `0x${string}`,
      NFT_CARDS: '0x6e887D54A2cd242cF0abcf16679eC1BEcF2D8c16' as `0x${string}`,
      NFT_DECKS: '0x75a850EF4fB0B4665430d7Dc4ccfA510C6498308' as `0x${string}`,
      NFT_PACKS: '0x99B22E8FfA132C7F6D57Ef3de97Dc143FE7AeC8F' as `0x${string}`,
    }
  }

  // Local development addresses
  return {
    CARD_REGISTRY: '0x5FbDB2315678afecb367f032d93F642f64180aa3' as `0x${string}`,
    DECK_REGISTRY: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512' as `0x${string}`,
    GAME_ENGINE: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0' as `0x${string}`,
    NFT_CARDS: '0x6e887D54A2cd242cF0abcf16679eC1BEcF2D8c16' as `0x${string}`,
    NFT_DECKS: '0x75a850EF4fB0B4665430d7Dc4ccfA510C6498308' as `0x${string}`,
    NFT_PACKS: '0x99B22E8FfA132C7F6D57Ef3de97Dc143FE7AeC8F' as `0x${string}`,
  }
}

// Export contract addresses
export const CONTRACT_ADDRESSES = getContractAddresses()

// Export the function for use in other files
export { getContractAddresses }