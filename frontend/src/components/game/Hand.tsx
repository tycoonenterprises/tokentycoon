import { useGameStore, type Card } from '@/stores/gameStore'
import { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { useDragContext } from '@/lib/contexts/DragContext'

interface CardProps {
  card: Card
  playerId: string
  onPlay: (cardId: string) => void
}

function GameCard({ card, playerId, onPlay }: CardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { getCardPlayabilityClass, isCardPlayable, startDrag } = useDragContext()
  
  const canPlay = isCardPlayable(card)
  const playabilityClass = getCardPlayabilityClass(card)
  
  const {
    attributes,
    listeners,
    setNodeRef,
    isDragging,
  } = useDraggable({
    id: card.id,
    disabled: !canPlay,
    data: {
      card,
      playerId,
    },
  })

  // Override DnD kit's cursor when disabled
  const cursorStyle = canPlay ? 'cursor-grab' : 'cursor-not-allowed'

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

  const handleDragStart = () => {
    startDrag(card)
  }

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`relative w-32 h-44 card transition-all duration-200 ${cursorStyle} ${
        isHovered && !isDragging ? 'transform -translate-y-2 scale-105' : ''
      } ${isDragging ? 'card-dragging' : ''} ${getTypeColor(card.type)} ${playabilityClass}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDragStart={handleDragStart}
      onClick={() => canPlay && onPlay(card.id)}
    >
      {/* Card Header */}
      <div className="p-2 border-b border-gray-600">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-400 flex items-center">
            <span className="mr-1">{getTypeIcon(card.type)}</span>
            {card.type.toUpperCase()}
          </div>
          {card.cost > 0 && (
            <div className="bg-eth-secondary text-xs px-2 py-1 rounded-full font-bold">
              {card.cost}
            </div>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-2 flex-1">
        <h4 className="text-sm font-bold text-white mb-2 leading-tight">
          {card.name}
        </h4>
        
        <p className="text-xs text-gray-300 leading-tight">
          {card.text}
        </p>
      </div>

      {/* Card Footer - Power/Toughness for units */}
      {card.type === 'unit' && card.power !== undefined && card.toughness !== undefined && (
        <div className="p-2 border-t border-gray-600">
          <div className="flex justify-between text-sm font-bold">
            <span className="text-eth-danger">{card.power}</span>
            <span className="text-eth-success">{card.toughness}</span>
          </div>
        </div>
      )}

      {/* Hover tooltip */}
      {isHovered && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-black border border-gray-600 rounded-lg p-3 z-50">
          <div className="text-sm">
            <div className="font-bold text-white mb-1">{card.name}</div>
            <div className="text-eth-secondary text-xs mb-2">
              {card.type.toUpperCase()} - Cost: {card.cost}
            </div>
            <div className="text-gray-300 text-xs leading-relaxed">
              {card.text}
            </div>
            {card.type === 'unit' && (
              <div className="flex justify-between mt-2 text-xs">
                <span className="text-eth-danger">Power: {card.power}</span>
                <span className="text-eth-success">Toughness: {card.toughness}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

interface HandProps {
  playerId: string
}

export function Hand({ playerId }: HandProps) {
  const { players, playCard, activePlayer } = useGameStore()
  const player = players[playerId as keyof typeof players]
  
  const canPlayCards = activePlayer === playerId // Always allow playing cards during your turn

  const handlePlayCard = (cardId: string) => {
    if (canPlayCards) {
      playCard(playerId, cardId)
    }
  }

  // Playability is now handled by DragContext

  if (!player.hand.length) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <div className="text-4xl mb-2">🃏</div>
          <p>No cards in hand</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 bg-gray-900 border-t border-gray-700">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            {playerId === 'player1' ? 'Your' : 'Opponent'} Hand ({player.hand.length})
          </h3>
          {canPlayCards && (
            <div className="text-sm text-eth-success">
              ⚡ You can play cards
            </div>
          )}
        </div>
        
        <div className="flex gap-3 overflow-x-auto pb-2">
          {player.hand.map((card) => (
            <GameCard
              key={card.id}
              card={card}
              playerId={playerId}
              onPlay={handlePlayCard}
            />
          ))}
        </div>
        
        {canPlayCards && (
          <div className="mt-3 text-xs text-gray-400">
            💡 Click cards to play them. ETH available: {player.eth}
          </div>
        )}
      </div>
    </div>
  )
}