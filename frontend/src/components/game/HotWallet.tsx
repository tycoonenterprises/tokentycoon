import { useGameStore } from '@/stores/gameStore'

interface HotWalletProps {
  playerId: string
}

export function HotWallet({ playerId }: HotWalletProps) {
  const { players, viewingPlayer, activePlayer } = useGameStore()
  
  const player = players[playerId as keyof typeof players]
  const isCurrentPlayer = viewingPlayer === playerId
  const balance = player?.eth || 0
  
  // Show earnings animation during turn start
  const isActiveTurn = activePlayer === playerId
  const baseEarnings = 1 // Base 1 ETH per turn
  
  // Calculate yield from board cards (DeFi cards with staked ETH)
  const yieldEarnings = player?.board?.reduce((total, card) => {
    if (card.type === 'DeFi' && card.stakedETH && card.yieldAmount) {
      return total + (card.stakedETH * card.yieldAmount)
    }
    return total
  }, 0) || 0
  
  const totalEarnings = baseEarnings + yieldEarnings

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 w-48">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔥</span>
          <h3 className="text-sm font-bold text-white">Hot Wallet</h3>
        </div>
        {isActiveTurn && (
          <div className="bg-green-500 text-black text-xs px-2 py-1 rounded-full font-bold animate-pulse">
            +{totalEarnings}
          </div>
        )}
      </div>

      {/* Balance Display */}
      <div className="mb-3">
        <div className={`text-2xl font-bold mb-1 transition-all duration-500 ${
          isActiveTurn ? 'text-green-400' : 'text-eth-secondary'
        }`}>
          {balance.toFixed(1)} ETH
        </div>
        <div className="text-xs text-gray-400">
          {isCurrentPlayer ? 'Your hot wallet' : `Player ${playerId === 'player1' ? '1' : '2'}'s wallet`}
        </div>
      </div>

      {/* Earnings Breakdown */}
      <div className="space-y-2">
        {/* Base Income */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Base income:</span>
          <span className="text-green-400">+{baseEarnings} ETH/turn</span>
        </div>

        {/* Yield Income */}
        {yieldEarnings > 0 && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">DeFi yield:</span>
            <span className="text-purple-400">+{yieldEarnings.toFixed(1)} ETH/turn</span>
          </div>
        )}

        {/* Total */}
        {yieldEarnings > 0 && (
          <div className="flex items-center justify-between text-xs font-bold border-t border-gray-600 pt-2">
            <span className="text-white">Total income:</span>
            <span className="text-eth-success">+{totalEarnings.toFixed(1)} ETH/turn</span>
          </div>
        )}
      </div>

      {/* Usage Info */}
      <div className="mt-3 pt-3 border-t border-gray-700">
        <div className="text-xs text-gray-400 text-center">
          💳 Used for card costs & fees
        </div>
        {balance < 3 && (
          <div className="text-xs text-yellow-400 text-center mt-1">
            ⚠️ Low balance
          </div>
        )}
      </div>

      {/* Turn-specific messages */}
      {isCurrentPlayer && isActiveTurn && (
        <div className="mt-2 text-xs text-center text-green-400">
          💰 Your turn - income received!
        </div>
      )}
    </div>
  )
}