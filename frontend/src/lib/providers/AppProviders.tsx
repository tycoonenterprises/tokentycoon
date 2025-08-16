import type { ReactNode } from 'react'
import { PrivyProvider } from '@privy-io/react-auth'
// Import WagmiProvider from @privy-io/wagmi instead of wagmi
import { WagmiProvider } from '@privy-io/wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// We'll need to update the config to use @privy-io/wagmi's createConfig
import { privyConfig } from '@/lib/web3/config'
import { wagmiConfig } from '@/lib/web3/wagmiConfig'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <PrivyProvider
      appId={privyConfig.appId}
      config={privyConfig.config}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          {children}
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  )
}