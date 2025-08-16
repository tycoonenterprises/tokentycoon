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
      createOnLogin: 'all-users' as const, // Create embedded wallet for all users
      noPromptOnSignature: false, // Allow signature prompts
    },
    supportedChains: [localChain],
    defaultChain: localChain,
  },
}

// Contract addresses from deployment (deployed-addresses.json)
export const CONTRACT_ADDRESSES = {
  CARD_REGISTRY: '0xaC47e91215fb80462139756f43438402998E4A3a' as `0x${string}`,
  DECK_REGISTRY: '0x9BcC604D4381C5b0Ad12Ff3Bf32bEdE063416BC7' as `0x${string}`,
  GAME_ENGINE: '0x63fea6E447F120B8Faf85B53cdaD8348e645D80E' as `0x${string}`,
} as const