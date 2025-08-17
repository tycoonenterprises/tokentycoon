import { useState } from 'react'
import { useMatchHistory } from '@/lib/hooks/useMatchHistory'
import { useENSName, formatWalletDisplay } from '@/lib/hooks/useENSName'
import { X, Trophy, Clock, Users, Eye } from 'lucide-react'

interface MatchHistoryPageProps {
  onClose: () => void
}

function PlayerDisplay({ address }: { address: string }) {
  const { ensName } = useENSName(address)
  return (
    <span className="font-medium">
      {formatWalletDisplay(address, ensName)}
    </span>
  )
}

function MatchRow({ match }: { match: any }) {
  const getStatusIcon = () => {
    switch (match.result) {
      case 'won':
        return <Trophy className="w-4 h-4 text-yellow-500" />
      case 'lost':
        return <div className="w-4 h-4 text-red-500">💀</div>
      case 'in-progress':
        return <Clock className="w-4 h-4 text-blue-500" />
      case 'waiting':
        return <Users className="w-4 h-4 text-gray-500" />
      default:
        return <Eye className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusText = () => {
    switch (match.result) {
      case 'won':
        return 'Victory'
      case 'lost':
        return 'Defeat'
      case 'in-progress':
        return 'In Progress'
      case 'waiting':
        return 'Waiting for Player'
      default:
        return 'Unknown'
    }
  }

  const getStatusColor = () => {
    switch (match.result) {
      case 'won':
        return 'text-yellow-500'
      case 'lost':
        return 'text-red-500'
      case 'in-progress':
        return 'text-blue-500'
      case 'waiting':
        return 'text-gray-500'
      default:
        return 'text-gray-500'
    }
  }

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'Unknown'
    return new Date(timestamp * 1000).toLocaleString()
  }

  const navigateToGame = () => {
    if (match.isStarted || match.isFinished) {
      window.location.hash = `#/game/${match.gameId}`
    } else {
      window.location.hash = `#/lobby/${match.gameId}`
    }
  }

  return (
    <div 
      className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer"
      onClick={navigateToGame}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <div className="font-bold text-white">Game #{match.gameId}</div>
            <div className={`text-sm ${getStatusColor()}`}>{getStatusText()}</div>
          </div>
        </div>
        <div className="text-right text-sm text-gray-400">
          {match.finishedAt && (
            <div>Finished: {formatDate(match.finishedAt)}</div>
          )}
          {match.startedAt && !match.finishedAt && (
            <div>Started: {formatDate(match.startedAt)}</div>
          )}
          {match.createdAt && !match.startedAt && (
            <div>Created: {formatDate(match.createdAt)}</div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${match.userRole === 'player1' ? 'bg-blue-500' : 'bg-gray-600'}`}></div>
            <PlayerDisplay address={match.player1} />
            {match.userRole === 'player1' && (
              <span className="text-xs text-blue-400">(You)</span>
            )}
          </div>
          
          <span className="text-gray-500">vs</span>
          
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${match.userRole === 'player2' ? 'bg-red-500' : 'bg-gray-600'}`}></div>
            {match.player2 && match.player2 !== '0x0000000000000000000000000000000000000000' ? (
              <>
                <PlayerDisplay address={match.player2} />
                {match.userRole === 'player2' && (
                  <span className="text-xs text-red-400">(You)</span>
                )}
              </>
            ) : (
              <span className="text-gray-500 italic">Waiting for opponent</span>
            )}
          </div>
        </div>

        {match.isFinished && match.winner && (
          <div className="flex items-center gap-1 text-yellow-500">
            <Trophy className="w-3 h-3" />
            <span className="text-xs">
              {match.winner.toLowerCase() === match.player1.toLowerCase() ? 'Player 1' : 'Player 2'} Won
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export function MatchHistoryPage({ onClose }: MatchHistoryPageProps) {
  const { matchHistory, loading, error, refetch } = useMatchHistory()
  const [filter, setFilter] = useState<'all' | 'won' | 'lost' | 'in-progress'>('all')

  const filteredHistory = matchHistory.filter(match => {
    if (filter === 'all') return true
    return match.result === filter
  })

  const stats = {
    total: matchHistory.length,
    won: matchHistory.filter(m => m.result === 'won').length,
    lost: matchHistory.filter(m => m.result === 'lost').length,
    inProgress: matchHistory.filter(m => m.result === 'in-progress').length,
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white">Match History</h2>
            <p className="text-gray-400 text-sm">Your onchain game history</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Stats Bar */}
        <div className="p-6 border-b border-gray-700">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-xs text-gray-400">Total Games</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="text-2xl font-bold text-yellow-500">{stats.won}</div>
              <div className="text-xs text-gray-400">Won</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="text-2xl font-bold text-red-500">{stats.lost}</div>
              <div className="text-xs text-gray-400">Lost</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-500">{stats.inProgress}</div>
              <div className="text-xs text-gray-400">In Progress</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'All Games' },
              { key: 'won', label: 'Won' },
              { key: 'lost', label: 'Lost' },
              { key: 'in-progress', label: 'In Progress' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  filter === key
                    ? 'bg-eth-secondary text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eth-primary mx-auto mb-4"></div>
                <p className="text-gray-400">Loading match history...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="text-red-500 text-xl mb-2">⚠️</div>
                <p className="text-red-500 mb-4">Error loading match history</p>
                <p className="text-gray-400 text-sm mb-4">{error}</p>
                <button
                  onClick={refetch}
                  className="btn-secondary"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="text-6xl mb-4">🎮</div>
                <p className="text-gray-400 text-lg mb-2">
                  {filter === 'all' ? 'No games played yet' : `No ${filter} games found`}
                </p>
                <p className="text-gray-500 text-sm">
                  {filter === 'all' 
                    ? 'Start playing to see your match history here!'
                    : 'Try changing the filter to see other games.'
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHistory.map((match) => (
                <MatchRow key={match.gameId} match={match} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700">
          <div className="flex justify-between items-center">
            <button
              onClick={refetch}
              disabled={loading}
              className="btn-secondary disabled:opacity-50"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
            <p className="text-gray-500 text-sm">
              Showing {filteredHistory.length} of {stats.total} games
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}