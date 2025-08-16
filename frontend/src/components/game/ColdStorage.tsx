import { useState } from 'react'
import { useGameStore } from '@/stores/gameStore'

interface ColdStorageProps {
  playerId: string
}

export function ColdStorage({ playerId }: ColdStorageProps) {
  const { players, viewingPlayer, activePlayer, isDemoMode, transferToColdStorage, transferFromColdStorage } = useGameStore()
  const [transferAmount, setTransferAmount] = useState(1)
  const [showTransferModal, setShowTransferModal] = useState(false)
  
  const player = players[playerId as keyof typeof players]
  const isCurrentPlayer = viewingPlayer === playerId
  const canTransfer = activePlayer === playerId && (isDemoMode || playerId === 'player1')
  
  const coldStorageBalance = player?.coldStorage || 0
  const hotWalletBalance = player?.eth || 0
  const winAmount = 10 // 10 ETH wins the game
  
  const handleTransferToColdStorage = () => {
    if (canTransfer && hotWalletBalance >= transferAmount) {
      transferToColdStorage(playerId, transferAmount)
      setShowTransferModal(false)
      setTransferAmount(1)
    }
  }

  const handleTransferFromColdStorage = () => {
    if (canTransfer && coldStorageBalance >= transferAmount) {
      transferFromColdStorage(playerId, transferAmount)
      setShowTransferModal(false)
      setTransferAmount(1)
    }
  }

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
            {isCurrentPlayer ? 'Your cold storage' : `Player ${playerId === 'player1' ? '1' : '2'}'s storage`}
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

        {/* Transfer Button - Only show for current player */}
        {isCurrentPlayer && canTransfer && (
          <button
            onClick={() => setShowTransferModal(true)}
            className="w-full btn-primary text-xs py-2"
          >
            💰 Transfer ETH
          </button>
        )}

        {/* Status for non-interactive states */}
        {isCurrentPlayer && !canTransfer && (
          <div className="text-center text-xs text-gray-400">
            {activePlayer !== playerId ? 'Not your turn' : 'Cannot transfer during this phase'}
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

              {/* Transfer Amount */}
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Transfer Amount (ETH)
                </label>
                <input
                  type="number"
                  min="1"
                  max={Math.max(hotWalletBalance, coldStorageBalance)}
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
                />
              </div>

              {/* Transfer Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleTransferToColdStorage}
                  disabled={hotWalletBalance < transferAmount}
                  className="flex-1 btn-primary text-sm py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  → Cold Storage
                </button>
                <button
                  onClick={handleTransferFromColdStorage}
                  disabled={coldStorageBalance < transferAmount}
                  className="flex-1 btn-secondary text-sm py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  → Hot Wallet
                </button>
              </div>

              {/* Cancel */}
              <button
                onClick={() => setShowTransferModal(false)}
                className="w-full text-gray-400 hover:text-white transition-colors text-sm"
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