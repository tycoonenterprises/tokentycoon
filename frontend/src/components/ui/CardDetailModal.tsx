import React from 'react'
import type { Card } from '@/stores/gameStore'
import { CardImage } from './CardImage'

interface CardDetailModalProps {
  card: Card | null
  isOpen: boolean
  onClose: () => void
}

export function CardDetailModal({ card, isOpen, onClose }: CardDetailModalProps) {
  if (!isOpen || !card) return null

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'unit': return 'border-eth-success'
      case 'eoa': return 'border-eth-success'
      case 'spell': return 'border-eth-primary'
      case 'action': return 'border-eth-primary'
      case 'chain': return 'border-eth-secondary'
      case 'defi': return 'border-purple-500'
      case 'resource': return 'border-eth-secondary'
      case 'upgrade': return 'border-purple-500'
      default: return 'border-gray-500'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'unit': return '⚔️'
      case 'eoa': return '👤'
      case 'spell': return '✨'
      case 'action': return '⚡'
      case 'chain': return '🔗'
      case 'defi': return '💰'
      case 'resource': return '⛽'
      case 'upgrade': return '🔧'
      default: return '❓'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="relative w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-10 w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center text-white border border-gray-600 text-lg shadow-lg"
        >
          ✕
        </button>

        {/* Large card display - proper card proportions */}
        <div className={`w-full aspect-[5/7] card transition-all duration-200 ${getTypeColor(card.type)} flex flex-col`}>
          {/* Card Header */}
          <div className="p-3 border-b border-gray-600 flex-shrink-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getTypeIcon(card.type)}</span>
                <span className="text-xs font-bold text-gray-300">{card.type.toUpperCase()}</span>
              </div>
              {card.cost > 0 && (
                <div className="bg-eth-secondary text-white text-sm px-2 py-1 rounded-full font-bold">
                  {card.cost}
                </div>
              )}
            </div>
            <h2 className="text-lg font-bold text-white leading-tight">{card.name}</h2>
          </div>

          {/* Card Image - takes up most of the space */}
          <div className="flex-1 p-2 relative">
            <CardImage 
              card={card} 
              className="w-full h-full rounded object-cover"
              fallbackIcon={getTypeIcon(card.type)}
            />
          </div>

          {/* Card Footer - compact info */}
          <div className="p-3 border-t border-gray-600 flex-shrink-0 space-y-2">
            {/* Card Text */}
            {card.text && (
              <p className="text-xs text-gray-200 leading-relaxed">{card.text}</p>
            )}

            {/* Abilities */}
            {card.abilities && (
              <div className="text-xs">
                <span className="text-eth-primary font-medium">{card.abilities}</span>
              </div>
            )}

            {/* Stats/Info Row */}
            <div className="flex justify-between items-center text-xs">
              {/* Stats for units */}
              {card.type === 'unit' && card.power !== undefined && card.toughness !== undefined && (
                <div className="flex gap-3">
                  <span className="text-eth-danger font-bold">{card.power} ATK</span>
                  <span className="text-eth-success font-bold">{card.toughness} DEF</span>
                </div>
              )}

              {/* DeFi card staking info */}
              {card.type === 'DeFi' && card.stakedETH !== undefined && (
                <div className="flex gap-2 text-purple-400">
                  <span className="font-bold">{card.stakedETH || 0} ETH</span>
                  {card.yieldAmount && <span>({card.yieldAmount}x yield)</span>}
                </div>
              )}

              {/* Wallet card ETH balance */}
              {(card.type === 'EOA' || card.name.toLowerCase().includes('wallet')) && card.heldETH !== undefined && (
                <div className="text-eth-secondary font-bold">
                  {card.heldETH || 0} ETH held
                </div>
              )}

              {/* Original card ID */}
              {card.originalCardId !== undefined && (
                <span className="text-gray-500 ml-auto">#{card.originalCardId}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}