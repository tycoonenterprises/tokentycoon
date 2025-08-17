import React, { useState } from 'react'
import type { Card } from '@/stores/gameStore'
import { CardImage } from './CardImage'
import { useGameEngine } from '@/lib/hooks/useGameEngine'
import { useGameStore } from '@/stores/gameStore'
import { useWallets } from '@privy-io/react-auth'

interface CardDetailModalProps {
  card: Card | null
  isOpen: boolean
  onClose: () => void
  isOnBattlefield?: boolean
  isOwnCard?: boolean
  gameId?: number | null
}

export function CardDetailModal({ card, isOpen, onClose, isOnBattlefield = false, isOwnCard = false, gameId }: CardDetailModalProps) {
  const [stakeAmount, setStakeAmount] = useState(1)
  const [isStaking, setIsStaking] = useState(false)
  const { stakeETH, getFullGameState } = useGameEngine()
  const { wallets } = useWallets()
  const players = useGameStore(state => state.players)
  
  if (!isOpen || !card) return null
  
  // Get live card data from the store if it's a battlefield card
  const liveCard = (() => {
    if (!isOnBattlefield || !card.instanceId) return card
    
    // Find the live card data from the store
    const allPlayers = [players.player1, players.player2]
    for (const player of allPlayers) {
      const foundCard = player.board.find(c => c.instanceId === card.instanceId)
      if (foundCard) {
        console.log('🔄 Using live card data:', foundCard.name, 'staked:', foundCard.stakedETH)
        return foundCard
      }
    }
    console.log('⚠️ Live card not found, using original:', card.name)
    return card
  })()
  
  // Get current player's ETH
  const privyWallet = wallets.find(w => w.walletClientType === 'privy')
  const userAddress = privyWallet?.address
  const isPlayer1 = userAddress?.toLowerCase() === players.player1.id?.toLowerCase()
  const currentPlayer = isPlayer1 ? players.player1 : players.player2
  const playerETH = currentPlayer.eth

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

  const handleStake = async () => {
    if (!gameId || !liveCard.instanceId || stakeAmount <= 0 || stakeAmount > playerETH) return
    
    setIsStaking(true)
    try {
      console.log('🎯 Staking', stakeAmount, 'ETH on instance', liveCard.instanceId)
      await stakeETH(gameId, liveCard.instanceId, stakeAmount)
      console.log('✅ Stake transaction completed, refreshing game state...')
      
      // Add delay to ensure contract state is updated
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Check the contract state directly
      try {
        const { readContract } = await import('wagmi/actions')
        const { wagmiConfig } = await import('@/lib/web3/wagmiConfig')
        const { GameEngineABI } = await import('@/lib/contracts/GameEngineABI')
        const { CONTRACT_ADDRESSES } = await import('@/lib/web3/config')
        
        const instance = await readContract(wagmiConfig, {
          address: CONTRACT_ADDRESSES.GAME_ENGINE,
          abi: GameEngineABI,
          functionName: 'getCardInstance',
          args: [BigInt(liveCard.instanceId)],
        })
        console.log('📊 Contract instance data after stake:', instance)
      } catch (err) {
        console.error('Error checking contract instance:', err)
      }
      
      // Refresh game state to show updated staked amount
      console.log('🔄 Starting game state refresh...')
      await getFullGameState(gameId)
      console.log('🔄 Game state refreshed')
      
      setStakeAmount(1)
    } catch (error) {
      console.error('Failed to stake ETH:', error)
    } finally {
      setIsStaking(false)
    }
  }

  // Check if card can be staked (DeFi cards only)
  const canStake = isOnBattlefield && isOwnCard && liveCard.type.toLowerCase() === 'defi' && gameId
  
  // Debug staking conditions
  console.log('Staking debug:', {
    isOnBattlefield,
    isOwnCard,
    cardType: liveCard.type,
    cardTypeLower: liveCard.type.toLowerCase(),
    gameId,
    canStake,
    cardInstanceId: liveCard.instanceId,
    stakedETH: liveCard.stakedETH
  })

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
        <div className={`w-full aspect-[5/7] card transition-all duration-200 ${getTypeColor(liveCard.type)} flex flex-col`}>
          {/* Card Header */}
          <div className="p-3 border-b border-gray-600 flex-shrink-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getTypeIcon(liveCard.type)}</span>
                <span className="text-xs font-bold text-gray-300">{liveCard.type.toUpperCase()}</span>
              </div>
              {liveCard.cost > 0 && (
                <div className="bg-eth-secondary text-white text-sm px-2 py-1 rounded-full font-bold">
                  {liveCard.cost}
                </div>
              )}
            </div>
            <h2 className="text-lg font-bold text-white leading-tight">{liveCard.name}</h2>
          </div>

          {/* Card Image - takes up most of the space */}
          <div className="flex-1 p-2 relative">
            <CardImage 
              card={liveCard} 
              className="w-full h-full rounded object-cover"
              fallbackIcon={getTypeIcon(liveCard.type)}
            />
          </div>

          {/* Card Footer - compact info */}
          <div className="p-3 border-t border-gray-600 flex-shrink-0 space-y-2">
            {/* Card Text */}
            {liveCard.text && (
              <p className="text-xs text-gray-200 leading-relaxed">{liveCard.text}</p>
            )}

            {/* Abilities */}
            {liveCard.abilities && (
              <div className="text-xs">
                <span className="text-eth-primary font-medium">{liveCard.abilities}</span>
              </div>
            )}

            {/* Stats/Info Row */}
            <div className="flex justify-between items-center text-xs">
              {/* Stats for units */}
              {liveCard.type === 'unit' && liveCard.power !== undefined && liveCard.toughness !== undefined && (
                <div className="flex gap-3">
                  <span className="text-eth-danger font-bold">{liveCard.power} ATK</span>
                  <span className="text-eth-success font-bold">{liveCard.toughness} DEF</span>
                </div>
              )}

              {/* DeFi card staking info */}
              {liveCard.type === 'DeFi' && liveCard.stakedETH !== undefined && (
                <div className="flex gap-2 text-purple-400">
                  <span className="font-bold">{liveCard.stakedETH || 0} ETH</span>
                  {liveCard.yieldAmount && <span>({liveCard.yieldAmount}x yield)</span>}
                </div>
              )}

              {/* Wallet card ETH balance */}
              {(liveCard.type === 'EOA' || liveCard.name.toLowerCase().includes('wallet')) && liveCard.heldETH !== undefined && (
                <div className="text-eth-secondary font-bold">
                  {liveCard.heldETH || 0} ETH held
                </div>
              )}

              {/* Original card ID */}
              {liveCard.originalCardId !== undefined && (
                <span className="text-gray-500 ml-auto">#{liveCard.originalCardId}</span>
              )}
            </div>

            {/* Staking UI for DeFi cards on battlefield */}
            {canStake && (
              <div className="mt-3 pt-3 border-t border-gray-600">
                <div className="text-xs text-gray-300 mb-2">
                  <div className="flex justify-between mb-1">
                    <span>Your ETH:</span>
                    <span className="font-bold text-eth-secondary">{playerETH} ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Currently Staked:</span>
                    <span className="font-bold text-purple-400">{liveCard.stakedETH || 0} ETH</span>
                  </div>
                </div>
                
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    min="1"
                    max={playerETH}
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(Math.max(1, Math.min(playerETH, Number(e.target.value))))}
                    className="flex-1 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                    disabled={isStaking}
                  />
                  <button
                    onClick={handleStake}
                    disabled={isStaking || stakeAmount > playerETH || stakeAmount <= 0}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 disabled:opacity-50 rounded text-sm font-semibold transition-colors"
                  >
                    {isStaking ? 'Staking...' : `Stake ${stakeAmount} ETH`}
                  </button>
                </div>
                
                {liveCard.yieldAmount && (
                  <div className="text-xs text-purple-300 mt-2">
                    This card yields {liveCard.yieldAmount}x staked ETH per turn
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}