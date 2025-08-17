import { useState } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { useWallets } from '@privy-io/react-auth'
import { useGameEngine } from '@/lib/hooks/useGameEngine'

interface ColdStorageProps {
  playerId: string
}

export function ColdStorage({ playerId }: ColdStorageProps) {
  const { 
    players, 
    activePlayer, 
    gameId
  } = useGameStore()
  const { depositToColdStorage, withdrawFromColdStorage, getFullGameState } = useGameEngine()
  const [transferAmount, setTransferAmount] = useState(1)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [isTransferring, setIsTransferring] = useState(false)
  
  const { wallets } = useWallets()
  const player = players[playerId as keyof typeof players]
  
  // Get current user's wallet address
  const privyWallet = wallets.find(w => w.walletClientType === 'privy')
  const userAddress = privyWallet?.address
  
  // Check if the current user's address matches the activePlayer
  const isCurrentPlayer = Boolean(activePlayer && userAddress && activePlayer.toLowerCase() === userAddress.toLowerCase())
  const canTransfer = isCurrentPlayer
  
  const coldStorageBalance = Number(player?.coldStorage || 0)
  const hotWalletBalance = Number(player?.eth || 0)
  const withdrawnThisTurn = Number(player?.coldStorageWithdrawnThisTurn || 0)
  const remainingWithdrawal = Math.max(0, 1 - withdrawnThisTurn)
  const winAmount = 20 // 20 ETH wins the game
  
  // For contract-based cold storage, only use hot wallet ETH
  const totalAvailableETH = hotWalletBalance
  
  const handleTransferToColdStorage = async () => {
    
    if (!canTransfer || gameId === null || gameId === undefined || isTransferring) {
      return
    }
    
    if (hotWalletBalance >= transferAmount) {
      try {
        setIsTransferring(true)
        const result = await depositToColdStorage(gameId, transferAmount)
        
        // Refresh game state after transaction
        setTimeout(async () => {
          await getFullGameState(gameId)
        }, 3000)
        
        setShowTransferModal(false)
        setTransferAmount(1)
      } catch (error) {
        console.error('❌ Failed to deposit to cold storage:', error)
      } finally {
        setIsTransferring(false)
      }
    } else {
    }
  }

  const handleTransferFromColdStorage = async () => {
    if (!canTransfer || gameId === null || gameId === undefined || isTransferring || coldStorageBalance < transferAmount || remainingWithdrawal < transferAmount) return
    
    try {
      setIsTransferring(true)
      await withdrawFromColdStorage(gameId, transferAmount)
      
      // Refresh game state after transaction
      setTimeout(async () => {
        await getFullGameState(gameId)
      }, 3000)
      
      setShowTransferModal(false)
      setTransferAmount(1)
    } catch (error) {
      console.error('Failed to withdraw from cold storage:', error)
    } finally {
      setIsTransferring(false)
    }
  }

  // Simplified - only hot wallet balance
  const getSelectedSourceBalance = () => hotWalletBalance

  const progressPercentage = Math.min((coldStorageBalance / winAmount) * 100, 100)
  const isWinner = coldStorageBalance >= winAmount

  return (
    <>
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 w-48">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🏦</span>
            <h3 className="text-sm font-bold text-white">Cold Storage</h3>
          </div>
          {isWinner && (
            <div className="bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-bold">
              WIN!
            </div>
          )}
        </div>

        {/* Balance Display */}
        <div className="mb-3">
          <div className="text-2xl font-bold text-eth-primary mb-1">
            {coldStorageBalance.toFixed(1)} ETH
          </div>
          <div className="text-xs text-gray-400">
'Your cold storage'
          </div>
        </div>

        {/* Win Progress */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Win Progress</span>
            <span>{coldStorageBalance}/{winAmount} ETH</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                isWinner ? 'bg-yellow-500' : 'bg-eth-primary'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Available ETH Info */}
        <div className="text-xs text-gray-400 mb-2 text-center">
          {totalAvailableETH} ETH available in hot wallet
        </div>

        {/* Transfer Button - Only show for current player */}
        {isCurrentPlayer && canTransfer && (
          <button
            onClick={() => setShowTransferModal(true)}
            className="w-full btn-primary text-xs py-2"
          >
            💰 Transfer ETH ({totalAvailableETH} available)
          </button>
        )}

        {/* Status for non-interactive states */}
        {!canTransfer && (
          <div className="text-center text-xs text-gray-400">
            {!isCurrentPlayer ? 'Not your turn' : 'Cannot transfer during this phase'}
          </div>
        )}
      </div>

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-80">
            <h3 className="text-lg font-bold text-white mb-4">Transfer ETH</h3>
            
            <div className="space-y-4">
              {/* Current Balances */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-eth-secondary font-bold">Hot Wallet</div>
                  <div className="text-white">{hotWalletBalance} ETH</div>
                </div>
                <div className="text-center">
                  <div className="text-eth-primary font-bold">Cold Storage</div>
                  <div className="text-white">{coldStorageBalance} ETH</div>
                </div>
              </div>

              {/* Withdrawal Limit Warning */}
              {withdrawnThisTurn > 0 && (
                <div className="bg-yellow-900/30 border border-yellow-600 rounded p-2 text-center">
                  <div className="text-yellow-400 text-xs font-semibold">
                    ⚠️ Cold Storage Limit: {withdrawnThisTurn}/1 ETH withdrawn this turn
                  </div>
                  {remainingWithdrawal === 0 && (
                    <div className="text-red-400 text-xs mt-1">
                      No more withdrawals allowed this turn
                    </div>
                  )}
                </div>
              )}

              {withdrawnThisTurn === 0 && (
                <div className="bg-blue-900/30 border border-blue-600 rounded p-2 text-center">
                  <div className="text-blue-400 text-xs">
                    🏦 Cold Storage Withdrawal: {remainingWithdrawal} ETH allowed this turn
                  </div>
                </div>
              )}

              {/* Total Available */}
              <div className="text-center text-sm text-gray-400">
                Total Available: {totalAvailableETH} ETH in hot wallet
              </div>

              {/* Transfer Amount */}
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Transfer Amount (ETH)
                </label>
                <input
                  type="number"
                  min="1"
                  max={Math.max(getSelectedSourceBalance(), Math.min(coldStorageBalance, remainingWithdrawal))}
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
                />
              </div>

              {/* Transfer Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleTransferToColdStorage}
                  disabled={isTransferring || getSelectedSourceBalance() < transferAmount}
                  className="flex-1 btn-primary text-sm py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTransferring ? 'Transferring...' : '→ Cold Storage'}
                </button>
                <button
                  onClick={handleTransferFromColdStorage}
                  disabled={isTransferring || coldStorageBalance < transferAmount || remainingWithdrawal < transferAmount}
                  className="flex-1 btn-secondary text-sm py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTransferring ? 'Transferring...' : '→ Hot Wallet'}
                  {!isTransferring && remainingWithdrawal < transferAmount && remainingWithdrawal < coldStorageBalance && (
                    <div className="text-xs mt-1">Limit: {remainingWithdrawal} ETH</div>
                  )}
                </button>
              </div>

              {/* Cancel */}
              <button
                onClick={() => setShowTransferModal(false)}
                disabled={isTransferring}
                className="w-full text-gray-400 hover:text-white transition-colors text-sm disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}