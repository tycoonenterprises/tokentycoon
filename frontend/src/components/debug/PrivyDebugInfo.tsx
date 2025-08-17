import { useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useAccount } from 'wagmi'
import { ChevronDown, ChevronUp, Wallet } from 'lucide-react'

export function PrivyDebugInfo() {
  const [isOpen, setIsOpen] = useState(false)
  const { 
    user, 
    authenticated, 
    ready, 
    login, 
    logout, 
    createWallet,
    connectWallet,
    exportWallet
  } = usePrivy()
  
  const { address, isConnected } = useAccount()

  if (!ready) {
    return <div className="p-4 text-white">Loading Privy...</div>
  }

  if (!authenticated) {
    return (
      <div className="p-4 text-white">
        <button 
          onClick={login} 
          className="bg-blue-600 px-4 py-2 rounded text-white"
        >
          Login with Privy
        </button>
      </div>
    )
  }

  const walletAccounts = user?.linkedAccounts?.filter(acc => acc.type === 'wallet') || []
  const embeddedWallets = walletAccounts.filter(acc => 
    acc.walletClientType === 'privy'
  )

  return (
    <div className={`fixed bottom-0 right-48 z-40 bg-gray-900 border border-gray-700 shadow-xl transition-all duration-300 ${
      isOpen ? 'w-96 max-w-[90vw] rounded-t-lg' : 'w-20 h-8 rounded-tr-lg'
    }`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between hover:bg-gray-800 transition-colors ${
          isOpen ? 'p-3' : 'p-2'
        }`}
      >
        <div className="flex items-center gap-2">
          <Wallet className={`text-purple-400 ${isOpen ? 'w-5 h-5' : 'w-4 h-4'}`} />
          {isOpen && <span className="font-semibold text-white">Privy Debug</span>}
          {isOpen && isConnected && (
            <span className="text-xs text-green-400">Connected</span>
          )}
          {!isOpen && isConnected && (
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          )}
        </div>
        {isOpen && (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {isOpen && (
        <div className="border-t border-gray-700 p-4 space-y-4 text-white">
          <div className="space-y-2 text-sm">
            <div>Authenticated: {authenticated ? '✅' : '❌'}</div>
            <div>Ready: {ready ? '✅' : '❌'}</div>
            <div>User ID: {user?.id || 'N/A'}</div>
            <div>Wagmi Address: {address || 'N/A'}</div>
            <div>Wagmi Connected: {isConnected ? '✅' : '❌'}</div>
          </div>

          <div className="space-y-2">
            <div className="font-semibold">Linked Accounts ({user?.linkedAccounts?.length || 0}):</div>
            {user?.linkedAccounts?.map((account, i) => (
              <div key={i} className="pl-4 text-xs bg-gray-700 p-2 rounded">
                <div>Type: {account.type}</div>
                <div>Address: {'address' in account ? account.address : 'N/A'}</div>
                {'walletClientType' in account && <div>Client Type: {account.walletClientType}</div>}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="font-semibold">Wallet Accounts ({walletAccounts.length}):</div>
            <div className="font-semibold">Embedded Wallets ({embeddedWallets.length}):</div>
          </div>

          <div className="space-y-2">
            <div className="space-x-2">
              <button 
                onClick={() => { createWallet?.(); }}
                className="bg-green-600 px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors"
              >
                Create Wallet
              </button>
              <button 
                onClick={() => { connectWallet?.(); }}
                className="bg-blue-600 px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
              >
                Connect Wallet
              </button>
              <button 
                onClick={() => console.log('Privy user:', user)}
                className="bg-purple-600 px-3 py-1 rounded text-xs hover:bg-purple-700 transition-colors"
              >
                Log User
              </button>
              <button 
                onClick={logout}
                className="bg-red-600 px-3 py-1 rounded text-xs hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
            
            {/* Switch Active Wallet Buttons */}
            <div className="space-y-1">
              <div className="text-xs font-semibold">Switch Active Wallet:</div>
              {walletAccounts.map((wallet, i) => {
                const isActive = address === wallet.address
                const isEmbedded = wallet.walletClientType === 'privy'
                return (
                  <button
                    key={i}
                    onClick={() => console.log('Switch to wallet:', wallet.address)}
                    className={`block w-full text-left px-2 py-1 rounded text-xs ${
                      isActive 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    }`}
                  >
                    {isEmbedded ? '🔐 Embedded' : '🦊 External'}: {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
                    {isActive && ' (Active)'}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}