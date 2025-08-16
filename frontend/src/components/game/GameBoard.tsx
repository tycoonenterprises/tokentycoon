import { useGameStore, type Card } from '@/stores/gameStore'

interface BoardCardProps {
  card: Card
  playerId: string
  isOpponent?: boolean
}

function BoardCard({ card, playerId, isOpponent = false }: BoardCardProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'unit': return 'border-eth-success'
      case 'spell': return 'border-eth-primary'
      case 'resource': return 'border-eth-secondary'
      case 'upgrade': return 'border-purple-500'
      default: return 'border-gray-500'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'unit': return '⚔️'
      case 'spell': return '✨'
      case 'resource': return '⛽'
      case 'upgrade': return '🔧'
      default: return '❓'
    }
  }

  return (
    <div
      className={`w-24 h-32 card cursor-pointer transition-all duration-200 hover:scale-105 ${getTypeColor(card.type)} ${
        isOpponent ? 'transform rotate-180' : ''
      }`}
    >
      {/* Card Header */}
      <div className="p-1 border-b border-gray-600">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-400">
            {getTypeIcon(card.type)}
          </div>
          {card.cost > 0 && (
            <div className="bg-eth-secondary text-xs px-1 py-0.5 rounded font-bold">
              {card.cost}
            </div>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-1 flex-1">
        <h4 className="text-xs font-bold text-white mb-1 leading-tight">
          {card.name}
        </h4>
      </div>

      {/* Card Footer - Power/Toughness for units */}
      {card.type === 'unit' && card.power !== undefined && card.toughness !== undefined && (
        <div className="p-1 border-t border-gray-600">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-eth-danger">{card.power}</span>
            <span className="text-eth-success">{card.toughness}</span>
          </div>
        </div>
      )}
    </div>
  )
}

interface BoardRowProps {
  cards: Card[]
  playerId: string
  isOpponent?: boolean
  label: string
}

function BoardRow({ cards, playerId, isOpponent = false, label }: BoardRowProps) {
  return (
    <div className={`min-h-36 p-4 border-2 border-dashed ${
      isOpponent ? 'border-red-500/30 bg-red-500/5' : 'border-blue-500/30 bg-blue-500/5'
    } rounded-lg`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-300">{label}</h4>
        <span className="text-xs text-gray-400">{cards.length} cards</span>
      </div>
      
      {cards.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-500 min-h-24">
          <div className="text-center">
            <div className="text-2xl mb-1">🏟️</div>
            <div className="text-xs">No cards on board</div>
          </div>
        </div>
      ) : (
        <div className="flex gap-2 flex-wrap">
          {cards.map((card) => (
            <BoardCard
              key={card.id}
              card={card}
              playerId={playerId}
              isOpponent={isOpponent}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function GameBoard() {
  const { players, activePlayer } = useGameStore()
  const { player1, player2 } = players

  return (
    <div className="flex-1 p-6 bg-gradient-to-b from-gray-800 to-eth-dark">
      <div className="max-w-6xl mx-auto h-full">
        <div className="h-full flex flex-col gap-6">
          {/* Opponent Board (Player 2) */}
          <BoardRow
            cards={player2.board}
            playerId="player2"
            isOpponent={true}
            label="Opponent Board"
          />

          {/* Battlefield Separator */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-eth-primary/50"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-eth-dark px-4 py-1 text-eth-primary font-medium border border-eth-primary/30 rounded-full">
                ⚔️ BATTLEFIELD ⚔️
              </span>
            </div>
          </div>

          {/* Player Board (Player 1) */}
          <BoardRow
            cards={player1.board}
            playerId="player1"
            isOpponent={false}
            label="Your Board"
          />

          {/* Game Controls */}
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-2">
              {activePlayer === 'player1' ? '🟢 Your Turn' : '🔴 Opponent\'s Turn'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}