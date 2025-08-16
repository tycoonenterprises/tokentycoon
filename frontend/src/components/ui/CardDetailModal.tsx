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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="relative max-w-lg w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 z-10 w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center text-white border border-gray-600"
        >
          ✕
        </button>

        {/* Large card display */}
        <div className={`w-full max-w-sm mx-auto card transition-all duration-200 ${getTypeColor(card.type)}`}>
          {/* Card Header */}
          <div className="p-4 border-b border-gray-600">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{getTypeIcon(card.type)}</span>
                <span className="text-sm font-bold text-gray-300">{card.type.toUpperCase()}</span>
              </div>
              {card.cost > 0 && (
                <div className="bg-eth-secondary text-white text-sm px-3 py-1 rounded-full font-bold">
                  {card.cost} ETH
                </div>
              )}
            </div>
            <h2 className="text-xl font-bold text-white">{card.name}</h2>
          </div>

          {/* Card Image */}
          <div className="p-4 bg-gray-800">
            <CardImage 
              card={card} 
              className="w-full h-64 rounded"
              fallbackIcon={getTypeIcon(card.type)}
            />
          </div>

          {/* Card Details */}
          <div className="p-4 space-y-3">
            {/* Card Text */}
            {card.text && (
              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-1">Description</h3>
                <p className="text-sm text-gray-200 leading-relaxed">{card.text}</p>
              </div>
            )}

            {/* Abilities */}
            {card.abilities && (
              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-1">Abilities</h3>
                <p className="text-sm text-eth-primary font-medium">{card.abilities}</p>
              </div>
            )}

            {/* Stats for units */}
            {card.type === 'unit' && card.power !== undefined && card.toughness !== undefined && (
              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-1">Combat Stats</h3>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Power:</span>
                    <span className="text-sm font-bold text-eth-danger">{card.power}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Toughness:</span>
                    <span className="text-sm font-bold text-eth-success">{card.toughness}</span>
                  </div>
                </div>
              </div>
            )}

            {/* DeFi card staking info */}
            {card.type === 'DeFi' && card.stakedETH !== undefined && (
              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-1">Staking Info</h3>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Staked ETH:</span>
                    <span className="text-purple-400 font-bold">{card.stakedETH || 0} ETH</span>
                  </div>
                  {card.yieldAmount && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Yield Rate:</span>
                      <span className="text-purple-400 font-bold">{card.yieldAmount}x per turn</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Wallet card ETH balance */}
            {(card.type === 'EOA' || card.name.toLowerCase().includes('wallet')) && card.heldETH !== undefined && (
              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-1">Wallet Balance</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Held ETH:</span>
                  <span className="text-eth-secondary font-bold">{card.heldETH || 0} ETH</span>
                </div>
              </div>
            )}

            {/* Original card ID (for debugging) */}
            {card.originalCardId !== undefined && (
              <div className="pt-2 border-t border-gray-700">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Card ID:</span>
                  <span>#{card.originalCardId}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}