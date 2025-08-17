import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useState } from 'react'

export function SessionStatus() {
  const { user } = usePrivy()
  const { wallets } = useWallets()
  const [showDetails, setShowDetails] = useState(false)
  
  // Check if using embedded wallet with auto-approval
  const embeddedWallet = wallets.find(w => w.walletClientType === 'privy')
  // Auto-approval is enabled when using embedded wallet with showWalletUIs: false
  const hasAutoApproval = !!embeddedWallet
  
  if (!user) return null
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {hasAutoApproval ? (
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            ) : (
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            )}
            <span className="text-sm text-white font-medium">
              {hasAutoApproval ? 'Auto-Approval Active' : 'Manual Approval'}
            </span>
          </div>
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            {showDetails ? 'Hide' : 'Info'}
          </button>
        </div>
        
        {showDetails && (
          <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-400">
            <div className="mb-2">
              {hasAutoApproval 
                ? "✅ Transactions auto-approve with your embedded wallet"
                : "⚠️ Using external wallet - manual approval required"
              }
            </div>
            {embeddedWallet && (
              <div>Wallet: {embeddedWallet.address.slice(0, 6)}...{embeddedWallet.address.slice(-4)}</div>
            )}
          </div>
        )}
      </div>
      
      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
        <div className="bg-gray-800 text-white text-xs rounded px-3 py-2 max-w-xs">
          {hasAutoApproval 
            ? "Transactions are automatically approved. No popups needed!"
            : "Connect with Privy to enable auto-approval."
          }
        </div>
      </div>
    </div>
  )
}