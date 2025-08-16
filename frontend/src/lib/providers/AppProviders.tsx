import type { ReactNode } from 'react'
import { PrivyProvider } from '@privy-io/react-auth'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config, privyConfig } from '@/lib/web3/config'

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
    <QueryClientProvider client={queryClient}>
      <PrivyProvider
        appId={privyConfig.appId}
        config={privyConfig.config}
      >
        <WagmiProvider config={config}>
          {children}
        </WagmiProvider>
      </PrivyProvider>
    </QueryClientProvider>
  )
}