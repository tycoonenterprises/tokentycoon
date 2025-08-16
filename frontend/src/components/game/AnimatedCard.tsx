import { motion } from 'framer-motion'
import type { Card } from '@/stores/gameStore'

interface AnimatedCardProps {
  card: Card
  onPlay?: (cardId: string) => void
  canPlay?: boolean
  size?: 'small' | 'medium' | 'large'
  className?: string
  children?: React.ReactNode
}

export function AnimatedCard({ 
  card, 
  onPlay, 
  canPlay = true, 
  size = 'medium', 
  className = '',
  children 
}: AnimatedCardProps) {
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

  const sizeClasses = {
    small: 'w-20 h-28',
    medium: 'w-32 h-44',
    large: 'w-40 h-56',
  }

  const textSizes = {
    small: { title: 'text-xs', body: 'text-xs', stats: 'text-xs' },
    medium: { title: 'text-sm', body: 'text-xs', stats: 'text-sm' },
    large: { title: 'text-base', body: 'text-sm', stats: 'text-base' },
  }

  const handleClick = () => {
    if (canPlay && onPlay) {
      onPlay(card.id)
    }
  }

  return (
    <motion.div
      className={`${sizeClasses[size]} card cursor-pointer ${getTypeColor(card.type)} ${
        canPlay ? 'hover:shadow-lg opacity-100' : 'opacity-60 cursor-not-allowed'
      } ${className}`}
      whileHover={canPlay ? { scale: 1.05, y: -4 } : {}}
      whileTap={canPlay ? { scale: 0.95 } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      onClick={handleClick}
    >
      {/* Glow effect for playable cards */}
      {canPlay && (
        <motion.div
          className={`absolute inset-0 rounded-lg ${getTypeColor(card.type)} opacity-0`}
          whileHover={{ opacity: 0.3, boxShadow: '0 0 20px currentColor' }}
          transition={{ duration: 0.2 }}
        />
      )}

      {/* Card Header */}
      <motion.div 
        className="p-2 border-b border-gray-600 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between">
          <div className={`${textSizes[size].body} text-gray-400 flex items-center`}>
            <span className="mr-1">{getTypeIcon(card.type)}</span>
            {size !== 'small' && card.type.toUpperCase()}
          </div>
          {card.cost.gas && (
            <motion.div
              className="bg-eth-secondary text-xs px-2 py-1 rounded-full font-bold"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              {card.cost.gas}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Card Body */}
      <motion.div 
        className="p-2 flex-1 relative z-10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <h4 className={`${textSizes[size].title} font-bold text-white mb-2 leading-tight`}>
          {card.name}
        </h4>
        
        {size !== 'small' && (
          <p className={`${textSizes[size].body} text-gray-300 leading-tight`}>
            {card.text}
          </p>
        )}
      </motion.div>

      {/* Card Footer - Power/Toughness for units */}
      {card.type === 'unit' && card.power !== undefined && card.toughness !== undefined && (
        <motion.div
          className="p-2 border-t border-gray-600 relative z-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className={`flex justify-between ${textSizes[size].stats} font-bold`}>
            <span className="text-eth-danger">{card.power}</span>
            <span className="text-eth-success">{card.toughness}</span>
          </div>
        </motion.div>
      )}

      {children}
    </motion.div>
  )
}

// Specialized variants
export function AnimatedHandCard({ card, onPlay, canPlay }: { 
  card: Card
  onPlay: (cardId: string) => void
  canPlay: boolean 
}) {
  return (
    <AnimatedCard
      card={card}
      onPlay={onPlay}
      canPlay={canPlay}
      size="medium"
      className="card-hover"
    />
  )
}

export function AnimatedBoardCard({ card }: { card: Card }) {
  return (
    <AnimatedCard
      card={card}
      size="small"
      canPlay={false}
    />
  )
}

export function AnimatedDeckCard({ 
  card, 
  isSelected, 
  onSelect 
}: { 
  card: Card
  isSelected: boolean
  onSelect: (cardId: string) => void 
}) {
  return (
    <motion.div className="relative">
      <AnimatedCard
        card={card}
        onPlay={onSelect}
        canPlay={true}
        size="medium"
        className={isSelected ? 'ring-2 ring-eth-primary' : ''}
      >
        {isSelected && (
          <motion.div
            className="absolute top-2 right-2 w-6 h-6 bg-eth-primary rounded-full flex items-center justify-center z-20"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <span className="text-white text-xs">✓</span>
          </motion.div>
        )}
      </AnimatedCard>
    </motion.div>
  )
}