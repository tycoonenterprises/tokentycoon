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
  CARD_REGISTRY: '0x525C7063E7C20997BaaE9bDa922159152D0e8417' as `0x${string}`,
  DECK_REGISTRY: '0x38a024C0b412B9d1db8BC398140D00F5Af3093D4' as `0x${string}`,
  GAME_ENGINE: '0x5fc748f1FEb28d7b76fa1c6B07D8ba2d5535177c' as `0x${string}`,
} as const