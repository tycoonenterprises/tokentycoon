import { useGameStore } from '@/stores/gameStore'

export function PlayerStats() {
  const { 
    players, 
    currentTurn, 
    turnNumber,
    currentPhase, 
    activePlayer,
    isGameActive,
    isGameStarted
  } = useGameStore()

  const { player1, player2 } = players

  const formatPhase = (phase: string) => {
    return phase.charAt(0).toUpperCase() + phase.slice(1)
  }

  return (
    <div className="bg-eth-dark border-b border-gray-700 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Game Status */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
            <span>Turn {turnNumber}</span>
            <span>•</span>
            <span>{formatPhase(currentPhase)} Phase</span>
            <span>•</span>
            <span className={`font-medium ${isGameStarted ? 'text-eth-success' : 'text-yellow-500'}`}>
              {isGameStarted ? 'Game Started' : 'Practice Mode'}
            </span>
          </div>
        </div>

        {/* Player Stats */}
        <div className="grid grid-cols-2 gap-8">
          {/* Player 1 */}
          <div className={`card p-4 ${
            activePlayer === 'player1' && isGameActive 
              ? 'border-eth-primary shadow-eth-primary/20' 
              : 'border-gray-700'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white">Player 1</h3>
              {activePlayer === 'player1' && isGameActive && (
                <span className="px-2 py-1 bg-eth-primary text-white text-xs rounded-full">
                  Active
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-400">Balance</div>
                <div className={`text-xl font-bold ${
                  player1.balance <= 5 ? 'text-eth-danger' : 'text-white'
                }`}>
                  {player1.balance}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400">ETH</div>
                <div className="text-xl font-bold text-eth-secondary">
                  {player1.eth}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400">Hand</div>
                <div className="text-lg text-white">
                  {player1.hand.length} cards
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400">Board</div>
                <div className="text-lg text-white">
                  {player1.board.length} units
                </div>
              </div>
            </div>
          </div>

          {/* Player 2 */}
          <div className={`card p-4 ${
            activePlayer === 'player2' && isGameActive 
              ? 'border-eth-primary shadow-eth-primary/20' 
              : 'border-gray-700'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white">Player 2</h3>
              {activePlayer === 'player2' && isGameActive && (
                <span className="px-2 py-1 bg-eth-primary text-white text-xs rounded-full">
                  Active
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-400">Balance</div>
                <div className={`text-xl font-bold ${
                  player2.balance <= 5 ? 'text-eth-danger' : 'text-white'
                }`}>
                  {player2.balance}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400">ETH</div>
                <div className="text-xl font-bold text-eth-secondary">
                  {player2.eth}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400">Hand</div>
                <div className="text-lg text-white">
                  {player2.hand.length} cards
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400">Board</div>
                <div className="text-lg text-white">
                  {player2.board.length} units
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}