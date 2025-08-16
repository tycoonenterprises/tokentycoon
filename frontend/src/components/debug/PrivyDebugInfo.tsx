import { usePrivy } from '@privy-io/react-auth'
import { useAccount } from 'wagmi'

export function PrivyDebugInfo() {
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
    acc.walletClient === 'privy' || acc.walletClientType === 'privy'
  )

  return (
    <div className="p-4 space-y-4 text-white bg-gray-800 border border-gray-600 rounded-lg">
      <h3 className="text-lg font-bold">Privy Debug Info</h3>
      
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
            <div>Address: {account.address || 'N/A'}</div>
            {'walletClient' in account && <div>Client: {account.walletClient}</div>}
            {'walletClientType' in account && <div>Client Type: {account.walletClientType}</div>}
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div className="font-semibold">Wallet Accounts ({walletAccounts.length}):</div>
        <div className="font-semibold">Embedded Wallets ({embeddedWallets.length}):</div>
      </div>

      <div className="space-x-2">
        <button 
          onClick={() => createWallet().catch(console.error)}
          className="bg-green-600 px-3 py-1 rounded text-xs"
        >
          Create Wallet
        </button>
        <button 
          onClick={() => connectWallet().catch(console.error)}
          className="bg-blue-600 px-3 py-1 rounded text-xs"
        >
          Connect Wallet
        </button>
        <button 
          onClick={logout}
          className="bg-red-600 px-3 py-1 rounded text-xs"
        >
          Logout
        </button>
      </div>
    </div>
  )
}