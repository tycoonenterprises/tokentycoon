import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { DndContext, DragOverlay, closestCorners, closestCenter, useDroppable, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useGameStore, type Card } from '@/stores/gameStore'
import { DeckElement } from './DeckElement'
import { ColdStorage } from './ColdStorage'
import { HotWallet } from './HotWallet'
import { CardImage } from '@/components/ui/CardImage'
import { CardDetailModal } from '@/components/ui/CardDetailModal'
import { useGameEngine } from '@/lib/hooks/useGameEngine'
import { useWallets } from '@privy-io/react-auth'
import { usePrivy } from '@privy-io/react-auth'
import { getAssetUrl } from '@/lib/utils/assets'

interface WalletCardFooterProps {
  card: Card
  playerId: string
  playerETH: number
  isActivePlayer: boolean
}

function WalletCardFooter({ card, playerId, playerETH, isActivePlayer }: WalletCardFooterProps) {
  const { depositETHToWalletCard } = useGameStore()
  
  const handleDeposit = () => {
    if (isActivePlayer && playerETH >= 1) {
      depositETHToWalletCard(playerId, card.id, 1)
    }
  }

  return (
    <div className="p-2 border-t border-gray-600">
      <div className="text-center">
        <div className="text-xs text-gray-400">ETH Balance</div>
        <div className="text-sm font-bold text-eth-secondary">
          {card.heldETH || 0} ETH
        </div>
        {isActivePlayer && playerETH >= 1 && (
          <button
            onClick={handleDeposit}
            className="mt-1 text-xs bg-eth-secondary hover:bg-eth-primary px-2 py-1 rounded transition-colors"
          >
            +1 ETH
          </button>
        )}
      </div>
    </div>
  )
}

interface DeFiCardFooterProps {
  card: Card
  playerId: string
  playerETH: number
  isActivePlayer: boolean
  gameId: number | null
}

function DeFiCardFooter({ card, playerId, playerETH, isActivePlayer, gameId }: DeFiCardFooterProps) {
  const { stakeETH } = useGameEngine()
  const [showStakeModal, setShowStakeModal] = useState(false)
  const [stakeAmount, setStakeAmount] = useState(1)
  const [isStaking, setIsStaking] = useState(false)
  
  // For now we'll track staked ETH locally since we need cardInstance data
  // In full implementation, this would come from contract state
  const stakedETH = card.stakedETH || 0
  const yieldAmount = card.yieldAmount || 1 // Default 1x multiplier

  const handleStake = async () => {
    if (isActivePlayer && playerETH >= stakeAmount && gameId) {
      setIsStaking(true)
      try {
        // Note: This would need the actual card instance ID from the contract
        // For demo purposes, we'll use a placeholder instanceId
        // In full implementation, card instances would have their own IDs from the contract
        const cardInstanceId = parseInt(card.id.split('-').pop() || '0')
        
        await stakeETH(gameId, cardInstanceId, stakeAmount)
        setShowStakeModal(false)
      } catch (error) {
        console.error('Failed to stake ETH:', error)
      } finally {
        setIsStaking(false)
      }
    }
  }

  return (
    <>
      <div className="p-2 border-t border-gray-600">
        <div className="text-center">
          <div className="text-xs text-gray-400">Staked ETH</div>
          <div className="text-sm font-bold text-purple-400">
            {stakedETH} ETH
          </div>
          {stakedETH > 0 && (
            <div className="text-xs text-gray-400">
              Yield: {yieldAmount}x per turn
            </div>
          )}
          {isActivePlayer && playerETH >= 1 && (
            <button
              onClick={() => setShowStakeModal(true)}
              className="mt-1 text-xs bg-purple-600 hover:bg-purple-500 px-2 py-1 rounded transition-colors"
            >
              Stake ETH
            </button>
          )}
        </div>
      </div>

      {/* Staking Modal */}
      {showStakeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 w-80">
            <h3 className="text-lg font-bold text-white mb-4">Stake ETH on {card.name}</h3>
            
            <div className="space-y-4">
              <div className="text-sm text-gray-300">
                Staked ETH earns yield during upkeep phases
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Stake Amount (ETH)
                </label>
                <input
                  type="number"
                  min="1"
                  max={playerETH}
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleStake}
                  disabled={playerETH < stakeAmount || isStaking}
                  className="flex-1 bg-purple-600 hover:bg-purple-500 py-2 rounded font-semibold disabled:opacity-50"
                >
                  {isStaking ? 'Staking...' : `Stake ${stakeAmount} ETH`}
                </button>
                <button
                  onClick={() => setShowStakeModal(false)}
                  disabled={isStaking}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

interface DraggableCardProps {
  card: Card
  playerId: string
  source: 'hand' | 'board'
  canDrag: boolean
}

interface ExtendedDraggableCardProps extends DraggableCardProps {
  playerETH: number
  isActivePlayer: boolean
  gameId: number | null
  onCardClick: (card: Card, source?: 'hand' | 'board', playerId?: string) => void
  handIndex?: number
  currentViewingPlayer?: string
  isDragInProgress?: boolean
}

function DraggableCard({ card, playerId, source, canDrag, playerETH, isActivePlayer, gameId, handIndex, onCardClick, currentViewingPlayer, isDragInProgress = false }: ExtendedDraggableCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0, isOpponentCard: false })
  const cardRef = useRef<HTMLDivElement>(null)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `${source}-${card.id}`,
    data: { card, playerId, source, handIndex },
    disabled: !canDrag,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  // Determine the specific reason why a card cannot be played
  const canAfford = playerETH >= card.cost
  const inMainPhase = true // Always allow playing cards now
  
  const getCardState = () => {
    if (source === 'board') return 'playable' // Board cards are just displayed
    
    if (!isActivePlayer) return 'not-your-turn'
    if (!inMainPhase) return 'wrong-phase'
    if (!canAfford) return 'cant-afford'
    return 'playable'
  }
  
  // Check if this DeFi card has chain attachment opportunities  
  const hasChainTargets = card.type.toLowerCase() === 'defi' && source === 'hand' && isActivePlayer && canAfford

  const cardState = getCardState()
  
  // Debug logging for cursor troubleshooting
  if (source === 'hand') {
    // })
  }

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

  const getCardVisualState = () => {
    switch (cardState) {
      case 'playable':
        return {
          className: 'hover:scale-105 cursor-grab',
          opacity: '1',
          filter: 'none'
        }
      case 'cant-afford':
        return {
          className: 'cursor-not-allowed',
          opacity: '0.5',
          filter: 'grayscale(0.8) brightness(0.7)'
        }
      case 'wrong-phase':
        return {
          className: 'cursor-not-allowed',
          opacity: '0.7',
          filter: 'grayscale(0.3)'
        }
      case 'not-your-turn':
        return {
          className: 'cursor-not-allowed',
          opacity: '0.6',
          filter: 'grayscale(0.5)'
        }
      default:
        return {
          className: 'cursor-not-allowed',
          opacity: '0.6',
          filter: 'grayscale(0.5)'
        }
    }
  }

  const visualState = getCardVisualState()
  const cardSize = source === 'board' ? 'w-32 h-44' : 'w-24 h-32'

  // Determine if this is an opponent card by checking if playerId doesn't match current viewing player
  const isOpponentCard = playerId !== (currentViewingPlayer || 'player1')

  // Clear hover when any dragging starts (local or global)
  useEffect(() => {
    if (isDragging || isDragInProgress) {
      setIsHovered(false)
    }
  }, [isDragging, isDragInProgress])

  return (
    <div className="relative"
      onMouseEnter={(e) => {
        if (!isDragging && !isDragInProgress) {
          const rect = e.currentTarget.getBoundingClientRect()
          setHoverPosition({
            x: rect.left + rect.width / 2,
            y: rect.top,
            isOpponentCard // Add this info to position data
          })
          setIsHovered(true)
        }
      }}
      onMouseLeave={() => {
        setIsHovered(false)
      }}
      onMouseDown={() => {
        // Also clear on mouse down to prepare for potential drag
        setIsHovered(false)
      }}
    >
      <div
        ref={setNodeRef}
        style={{
          ...style,
          filter: visualState.filter,
        }}
        {...attributes}
        {...(canDrag ? listeners : {})}
        onClick={() => onCardClick && onCardClick(card, source, playerId)}
        className={`${cardSize} flex-shrink-0 card transition-all duration-200 ${getTypeColor(card.type)} ${visualState.className} ${isDragging ? 'z-50' : ''} ${hasChainTargets ? 'ring-1 ring-purple-400/50' : ''} cursor-pointer hover:shadow-xl`}
      >
      
      {/* Chain attachment indicator for DeFi cards */}
      {hasChainTargets && (
        <div className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold z-10">
          🔗
        </div>
      )}
      
      {/* Chain card indicator */}
      {card.type.toLowerCase() === 'chain' && (
        <div className="absolute -top-1 -left-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold z-10">
          ⛓️
        </div>
      )}
      {/* Cost overlay for both hand and board cards */}
      {card.cost > 0 && (
        <div className="absolute top-1 right-1 z-10">
          <div className={`text-white text-xs px-1.5 py-0.5 rounded-full font-bold shadow-lg ${
            source === 'hand' && cardState === 'cant-afford' 
              ? 'bg-red-600 border border-red-400' 
              : 'bg-eth-secondary'
          }`}>
            {card.cost}
          </div>
        </div>
      )}

      {/* Card Body */}
      <div className="flex-1 relative">
        {/* Clean card image view for both hand and board */}
        <CardImage 
          card={card} 
          className="w-full h-full rounded"
          fallbackIcon={getTypeIcon(card.type)}
        />
      </div>

      {/* Card Footer - Power/Toughness for units, ETH balance for wallet cards, or staking for DeFi cards */}
      {card.type === 'unit' && card.power !== undefined && card.toughness !== undefined ? (
        <div className="p-2 border-t border-gray-600">
          <div className="flex justify-between text-sm font-bold">
            <span className="text-eth-danger">{card.power}</span>
            <span className="text-eth-success">{card.toughness}</span>
          </div>
        </div>
      ) : card.type === 'DeFi' && source === 'board' ? (
        <DeFiCardFooter 
          card={card}
          playerId={playerId}
          playerETH={playerETH}
          isActivePlayer={isActivePlayer}
          gameId={gameId}
        />
      ) : null}
      </div>
      
      {/* Portal-based hover overlay that renders at document root */}
      {isHovered && !isDragging && !isDragInProgress && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed pointer-events-none z-[99999] transition-opacity duration-200"
          style={{
            left: hoverPosition.x - 180, // Center the larger card image
            top: hoverPosition.isOpponentCard ? hoverPosition.y + 20 : hoverPosition.y - 520, // Position below opponent cards, above player cards
          }}
        >
          <CardImage 
            card={card} 
            className="w-80 h-[30rem] rounded-lg shadow-2xl shadow-black/50 animate-in zoom-in-95 duration-200"
            fallbackIcon={getTypeIcon(card.type)}
          />
        </div>,
        document.body
      )}
    </div>
  )
}

interface DropZoneProps {
  id: string
  children: React.ReactNode
  label: string
  isEmpty: boolean
  canDrop: boolean
  isOver?: boolean
  isChainTarget?: boolean
}

function DropZone({ id, children, label, isEmpty, canDrop, isOver: isOverProp = false, isChainTarget = false }: DropZoneProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
    disabled: !canDrop
  })
  
  // Debug drop zone state
  useEffect(() => {
    if (isOver) {
      console.log(`✨ DropZone ${id} is being hovered over! canDrop: ${canDrop}`)
    }
  }, [isOver, id, canDrop])
  
  return (
    <div
      ref={setNodeRef}
      className={`min-h-36 p-4 border-2 rounded-lg transition-all duration-200 ${
        isChainTarget 
          ? canDrop
            ? isOver
              ? 'border-purple-400/70 bg-purple-400/20 border-solid' 
              : 'border-purple-500/50 bg-purple-500/10 border-dashed'
            : 'border-gray-500/30 bg-gray-500/5 border-dashed'
          : canDrop
            ? isOver
              ? 'border-eth-primary/70 bg-eth-primary/20 border-solid'
              : 'border-blue-500/30 bg-blue-500/5 border-dashed'
            : 'border-gray-500/30 bg-gray-500/5 border-dashed'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-300">{label}</h4>
        <span className="text-xs text-gray-400">
          {React.Children.count(children)} cards
        </span>
      </div>
      
      {isEmpty ? (
        <div className="flex-1 flex items-center justify-center text-gray-500 min-h-24">
          <div className="text-center">
            <div className="text-2xl mb-1">
              {id.includes('board') ? '🏟️' : isChainTarget ? '🔗' : '🃏'}
            </div>
            <div className="text-xs">
              {id.includes('board') 
                ? 'Drop cards to play (L1)' 
                : isChainTarget 
                  ? 'Drop DeFi cards here'
                  : 'No cards in hand'
              }
            </div>
          </div>
        </div>
      ) : (
        <div className="flex gap-2 flex-wrap">
          {children}
        </div>
      )}
    </div>
  )
}

// New component for individual Chain card drop targets
interface ChainDropTargetProps {
  chainCard: Card
  playerId: string
  canDrop: boolean
  children?: React.ReactNode
}

function ChainDropTarget({ chainCard, playerId, canDrop, children }: ChainDropTargetProps) {
  const dropId = `chain-${chainCard.id}`
  const { isOver, setNodeRef } = useDroppable({
    id: dropId,
    disabled: !canDrop,
    data: { chainCard, playerId, type: 'chain-target' }
  })

  // Debug logging
  useEffect(() => {
    console.log('🔗 ChainDropTarget created:', {
      dropId,
      chainCard: chainCard.name,
      canDrop,
      disabled: !canDrop
    })
  }, [dropId, chainCard.name, canDrop])

  return (
    <div 
      ref={setNodeRef}
      className={`relative ${
        canDrop && isOver 
          ? 'ring-4 ring-purple-400 ring-offset-2 ring-offset-gray-900 bg-purple-100/20 shadow-lg shadow-purple-400/50' 
          : canDrop 
            ? 'ring-3 ring-purple-500/70 bg-purple-50/10 shadow-md shadow-purple-500/30' 
            : ''
      } transition-all duration-200 rounded`}
    >
      {/* Chain card */}
      {children}
      
      {/* Visual indicator for Chain target when dragging DeFi cards */}
      {canDrop && (
        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-200 ${
          isOver ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="bg-purple-600/90 text-white text-xs px-2 py-1 rounded font-bold">
            🔗 Attach to Chain
          </div>
        </div>
      )}
      
      {/* Attached DeFi cards indicator */}
      {chainCard.attachedCards && chainCard.attachedCards.length > 0 && (
        <div className="absolute -bottom-2 -right-2 bg-purple-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
          {chainCard.attachedCards.length}
        </div>
      )}
    </div>
  )
}

interface DragDropGameBoardProps {
  gameId?: number | null
}

export function DragDropGameBoard({ gameId: propGameId }: DragDropGameBoardProps = {}) {
  // Subscribe to specific store values to ensure re-renders
  const players = useGameStore(state => state.players)
  const activePlayer = useGameStore(state => state.activePlayer)
  const playCardByIndex = useGameStore(state => state.playCardByIndex)
  const storeGameId = useGameStore(state => state.gameId)
  
  // Use prop gameId if provided, otherwise fall back to store
  const gameId = propGameId !== undefined ? propGameId : storeGameId
  const needsToDraw = useGameStore(state => state.needsToDraw)
  const currentTurn = useGameStore(state => state.currentTurn)
  const updateGameFromContract = useGameStore(state => state.updateGameFromContract)
  
  // Debug gameId
  useEffect(() => {
  }, [gameId])
  
  const { wallets, ready: walletsReady } = useWallets()
  const { endTurn, drawToStartTurn, getDetailedGameState, getFullGameState, playCard } = useGameEngine()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [draggedCard, setDraggedCard] = useState<Card | null>(null)
  const [isEndingTurn, setIsEndingTurn] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const [isPlayingCard, setIsPlayingCard] = useState(false)
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [shouldWiggleDrawButton, setShouldWiggleDrawButton] = useState(false)
  const [isDragInProgress, setIsDragInProgress] = useState(false)

  const { player1, player2 } = players
  
  // Get current user's wallet address
  const privyWallet = wallets.find(w => w.walletClientType === 'privy')
  const userAddress = privyWallet?.address
  
  
  // Determine which player we're viewing based on wallet address
  const isViewingPlayer1 = userAddress?.toLowerCase() === player1.id?.toLowerCase()
  const currentViewingPlayer = isViewingPlayer1 ? 'player1' : 'player2'
  
  
  // DISABLED polling to stop request spam
  useEffect(() => {
    // Polling disabled due to request spam
    return
  }, [gameId]) // Only depend on gameId
  
  
  // Simply check if the current user's address matches the activePlayer
  // Wait for wallets to be ready before checking
  const canPlayCards = walletsReady && Boolean(activePlayer && userAddress && activePlayer.toLowerCase() === userAddress.toLowerCase())
  
  
  // Turn state tracking (debug logging removed)
  
  
  
  
  
  // Determine which player's perspective we're showing
  const playerHand = isViewingPlayer1 ? player1 : player2
  const playerBoard = isViewingPlayer1 ? player1 : player2
  const opponentBoard = isViewingPlayer1 ? player2 : player1

  const handleCardClick = (card: Card, source?: 'hand' | 'board', playerId?: string) => {
    // Add metadata to the card for the modal
    const cardWithMetadata = {
      ...card,
      source,
      playerId
    }
    setSelectedCard(cardWithMetadata)
    setIsModalOpen(true)
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    setActiveId(active.id as string)
    setIsDragInProgress(true)
    
    const data = active.data.current
    if (data) {
      setDraggedCard(data.card)
      console.log('🎯 Started dragging:', {
        cardName: data.card.name,
        cardType: data.card.type,
        activeId: active.id
      })
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    setDraggedCard(null)
    setIsDragInProgress(false)

    console.log('🎯 Drag ended:', {
      active: active.id,
      over: over?.id,
      overData: over?.data?.current
    })

    if (!over) {
      console.log('❌ No drop target found')
      return
    }

    const activeData = active.data.current
    const overData = over.data.current
    const overId = over.id as string

    if (!activeData) {
      console.log('❌ No active data found')
      return
    }

    const { card, playerId, source, handIndex } = activeData
    
    // Debug the drop logic
    const targetBoard = `${currentViewingPlayer}-board`
    
    // Also accept drops on individual board cards as dropping "on the board"
    const isDropOnBoard = overId === targetBoard || (
      overId.startsWith('board-') && 
      !overId.startsWith('chain-') && 
      source === 'hand'
    )
    
    console.log('🎯 Drop logic debug:', {
      source,
      overId,
      targetBoard,
      isTargetBoard: overId === targetBoard,
      isDropOnBoard,
      playerId,
      currentViewingPlayer,
      playerIdMatch: playerId === currentViewingPlayer
    })

    // Handle DeFi card attachment to Chain cards
    if (source === 'hand' && card.type.toLowerCase() === 'defi' && overId.startsWith('chain-') && overData?.type === 'chain-target') {
      console.log('🔗 Attempting to attach DeFi card to Chain:', { card: card.name, chain: overData.chainCard.name })
      
      // Check prerequisites for playing to Chain
      if (needsToDraw && canPlayCards) {
        setShouldWiggleDrawButton(true)
        setTimeout(() => setShouldWiggleDrawButton(false), 1000)
        return
      }
      
      if (!canPlayCards || playerHand.eth < card.cost) {
        return
      }

      if (handIndex !== undefined && handIndex !== null && handIndex >= 0) {
        setIsPlayingCard(true)
        
        try {
          if (gameId === null || gameId === undefined) {
            console.error('No gameId available')
            return
          }
          
          // TODO: Add contract support for Chain attachments
          // For now, play the card normally and simulate Chain attachment in UI
          // In a full implementation, this would be: await playCardToChain(gameId, handIndex, overData.chainCard.instanceId)
          await playCard(gameId, handIndex)
          
          console.log(`📎 DeFi card ${card.name} would be attached to Chain ${overData.chainCard.name} (UI simulation)`)
          
          await new Promise(resolve => setTimeout(resolve, 1000))
          await getFullGameState(gameId)
          await new Promise(resolve => setTimeout(resolve, 500))
          await getFullGameState(gameId)
        } catch (error) {
          console.error('Failed to attach card to Chain:', error)
          if (gameId !== null && gameId !== undefined) {
            await getFullGameState(gameId)
          }
        } finally {
          setIsPlayingCard(false)
        }
      }
      return
    }

    // Handle standard card play from hand to board (L1)
    
    if (source === 'hand' && isDropOnBoard && playerId === currentViewingPlayer) {
      console.log('🏟️ Playing card to L1 board:', { card: card.name, overId })
      
      // Check if player needs to draw cards first
      if (needsToDraw && canPlayCards) {
        setShouldWiggleDrawButton(true)
        setTimeout(() => setShouldWiggleDrawButton(false), 1000)
        return
      }
      
      if (!canPlayCards) {
        return
      }
      
      if (playerHand.eth < card.cost) {
        return
      }
      
      if (canPlayCards && playerHand.eth >= card.cost) {
        const cardIndex = handIndex
        
        if (cardIndex !== undefined && cardIndex !== null && cardIndex >= 0) {
          setIsPlayingCard(true)
          
          try {
            if (gameId === null || gameId === undefined) {
              console.error('No gameId available')
              return
            }
            
            console.log(`🏟️ Playing ${card.name} to L1 (main board)`)
            await playCard(gameId, cardIndex)
            
            await new Promise(resolve => setTimeout(resolve, 1000))
            await getFullGameState(gameId)
            await new Promise(resolve => setTimeout(resolve, 500))
            await getFullGameState(gameId)
          } catch (error) {
            console.error('Failed to play card to board:', error)
            if (gameId !== null && gameId !== undefined) {
              await getFullGameState(gameId)
            }
          } finally {
            setIsPlayingCard(false)
          }
        } else {
          console.error('Card index not found in drag data')
        }
      }
    }
  }

  const canDragCard = (card: Card, source: 'hand' | 'board', playerId: string) => {
    // Only allow the current player to drag their cards
    if (playerId !== currentViewingPlayer) return false
    
    // Don't allow dragging while a card is being played
    if (isPlayingCard) return false
    
    if (source === 'hand') {
      const canDrag = canPlayCards && playerHand.eth >= card.cost
      return canDrag
    }
    return false // Board cards can't be moved yet
  }

  // Handle draw card to start turn
  const handleDrawToStartTurn = async () => {
    if (gameId === null || gameId === undefined || !canPlayCards || !needsToDraw) return
    
    try {
      setIsDrawing(true)
      await drawToStartTurn(gameId)
      
      // Immediately fetch the updated game state
      // The polling will pick up the change, but we fetch immediately for responsiveness
      const gameState = await getDetailedGameState(gameId)
      if (gameState) {
        updateGameFromContract(gameState)
      }
      // Also fetch full state for hands/battlefield
      await getFullGameState(gameId)
    } catch (error) {
      console.error('Failed to draw:', error)
    } finally {
      setIsDrawing(false)
    }
  }

  // Handle end turn
  const handleEndTurn = async () => {
    if (gameId === null || gameId === undefined) {
      return
    }
    
    // Basic validation
    if (!canPlayCards) {
      return
    }
    
    if (needsToDraw) {
      return
    }
    
    try {
      setIsEndingTurn(true)
      await endTurn(gameId)
      
      // Immediately fetch the updated game state
      // The polling will pick up the change, but we fetch immediately for responsiveness
      const gameState = await getDetailedGameState(gameId)
      if (gameState) {
        updateGameFromContract(gameState)
      }
      // Also fetch full state for hands/battlefield  
      await getFullGameState(gameId)
    } catch (error) {
      console.error('Failed to end turn:', error)
    } finally {
      setIsEndingTurn(false)
    }
  }

  return (
    <div className="relative">
      <DndContext
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={(event) => {
          console.log('🔄 Dragging over:', {
            active: event.active.id,
            over: event.over?.id,
            overData: event.over?.data?.current
          })
        }}
      >
        <div className="flex-1 p-6 bg-gradient-to-b from-gray-800 to-eth-dark">
          <div className="max-w-6xl mx-auto h-full">
            <div className="h-full flex flex-col gap-6">
            {/* Opponent Hand - Face Down Cards */}
            <div className="p-4 bg-gray-900 border-b border-gray-700">
              <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    Opponent Hand ({opponentBoard.hand?.length || 0})
                  </h3>
                  <div className="text-sm text-gray-400">
                    🙈 Cards hidden
                  </div>
                </div>
                
                <div className="flex gap-2 justify-center overflow-x-auto pb-2 min-h-0">
                  {(opponentBoard.hand || []).map((_, index) => (
                    <div
                      key={`opponent-hand-${index}`}
                      className="w-24 h-32 flex-shrink-0 card transition-all duration-200 border-red-500/50 cursor-not-allowed opacity-75"
                    >
                      {/* Card Back using PNG */}
                      <img 
                        src={getAssetUrl('token-tycoon-card-back.png')} 
                        alt="Token Tycoon Card Back" 
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                  ))}
                  
                  {/* Show placeholder if no cards */}
                  {(!opponentBoard.hand || opponentBoard.hand.length === 0) && (
                    <div className="flex-1 flex items-center justify-center text-gray-500 min-h-24">
                      <div className="text-center">
                        <div className="text-2xl mb-1">🃏</div>
                        <div className="text-xs">No cards in hand</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Opponent Board - Not droppable for now */}
            <DropZone
              id={`${currentViewingPlayer === 'player1' ? 'player2' : 'player1'}-board`}
              label={`Opponent Board (Player ${currentViewingPlayer === 'player1' ? '2' : '1'})`}
              isEmpty={opponentBoard.board.length === 0}
              canDrop={false}
            >
              <SortableContext 
                items={opponentBoard.board.map(card => `board-${card.id}`)}
                strategy={verticalListSortingStrategy}
              >
                {opponentBoard.board.map((card) => (
                  <div key={card.id} className="transform rotate-180">
                    <DraggableCard
                      card={card}
                      playerId={currentViewingPlayer === 'player1' ? 'player2' : 'player1'}
                      source="board"
                      canDrag={false}
                      playerETH={opponentBoard.eth}
                      isActivePlayer={false}
                      gameId={gameId}
                      onCardClick={handleCardClick}
                      currentViewingPlayer={currentViewingPlayer}
                      isDragInProgress={isDragInProgress}
                    />
                  </div>
                ))}
              </SortableContext>
            </DropZone>

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

            {/* Player Board - Two-layer system: L1 board + Chain targets */}
            <div className="space-y-4">
              {/* L1 Board Drop Zone - More precise */}
              <DropZone
                id={`${currentViewingPlayer}-board`}
                label={`Your Board (Player ${currentViewingPlayer === 'player1' ? '1' : '2'}) - L1 Layer`}
                isEmpty={playerBoard.board.length === 0}
                canDrop={canPlayCards}
              >
                {/* Separate Chain cards from regular sortable cards to avoid conflicts */}
                <div className="flex gap-3 flex-wrap">
                  {/* Chain cards - rendered outside SortableContext as separate drop targets */}
                  {playerBoard.board
                    .filter(card => card.type.toLowerCase() === 'chain')
                    .map((card) => {
                      const isDraggingDeFi = draggedCard?.type.toLowerCase() === 'defi'
                      const canDropOnChain = canPlayCards && isDraggingDeFi
                      
                      console.log('🔗 Rendering Chain card:', {
                        cardName: card.name,
                        cardType: card.type,
                        isDraggingDeFi,
                        canDropOnChain,
                        canPlayCards
                      })
                      
                      return (
                        <ChainDropTarget
                          key={`chain-${card.id}`}
                          chainCard={card}
                          playerId={currentViewingPlayer}
                          canDrop={canDropOnChain}
                        >
                          <DraggableCard
                            card={card}
                            playerId={currentViewingPlayer}
                            source="board"
                            canDrag={canDragCard(card, 'board', currentViewingPlayer)}
                            playerETH={playerHand.eth}
                            isActivePlayer={activePlayer?.toLowerCase() === userAddress?.toLowerCase()}
                            gameId={gameId}
                            onCardClick={handleCardClick}
                            currentViewingPlayer={currentViewingPlayer}
                            isDragInProgress={isDragInProgress}
                          />
                        </ChainDropTarget>
                      )
                    })}
                  
                  {/* Non-Chain cards in SortableContext */}
                  <SortableContext 
                    items={playerBoard.board
                      .filter(card => card.type.toLowerCase() !== 'chain')
                      .map(card => `board-${card.id}`)}
                    strategy={verticalListSortingStrategy}
                  >
                    {playerBoard.board
                      .filter(card => card.type.toLowerCase() !== 'chain')
                      .map((card) => (
                        <DraggableCard
                          key={card.id}
                          card={card}
                          playerId={currentViewingPlayer}
                          source="board"
                          canDrag={canDragCard(card, 'board', currentViewingPlayer)}
                          playerETH={playerHand.eth}
                          isActivePlayer={activePlayer?.toLowerCase() === userAddress?.toLowerCase()}
                          gameId={gameId}
                          onCardClick={handleCardClick}
                          currentViewingPlayer={currentViewingPlayer}
                          isDragInProgress={isDragInProgress}
                        />
                      ))}
                  </SortableContext>
                </div>
              </DropZone>
              
              {/* Legend for drop targets */}
              {canPlayCards && (
                <div className="text-xs text-center text-gray-400 space-x-4">
                  <span>🏟️ <strong>L1:</strong> Drop cards in the main board area above</span>
                  <span>🔗 <strong>Chain:</strong> Drop DeFi cards directly onto Chain cards</span>
                </div>
              )}
            </div>

            {/* Player Hand */}
            <div className="p-4 bg-gray-900 border-t border-gray-700">
              <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    Your Hand ({playerHand.hand.length})
                  </h3>
                  <div className="text-sm">
                    {canPlayCards ? (
                      <>
                        <span className="text-eth-success">⚡ Drag cards to board (L1) to play</span>
                        <span className="text-purple-400 ml-4">🔗 Drag DeFi cards to Chains for attachment</span>
                        <span className="text-gray-400 ml-4">💰 {playerHand.eth} ETH available</span>
                      </>
                    ) : !walletsReady ? (
                      <span className="text-gray-400">🔄 Loading wallet...</span>
                    ) : (
                      <span className="text-gray-400">⏳ Opponent's turn</span>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 overflow-x-auto pb-2 pt-20 pb-20 min-h-0">
                  <SortableContext 
                    items={playerHand.hand.map(card => `hand-${card.id}`)}
                    strategy={verticalListSortingStrategy}
                  >
                    {playerHand.hand.map((card, index) => (
                      <DraggableCard
                        key={card.id}
                        card={card}
                        playerId={currentViewingPlayer}
                        source="hand"
                        canDrag={canDragCard(card, 'hand', currentViewingPlayer)}
                        playerETH={playerHand.eth}
                        isActivePlayer={activePlayer?.toLowerCase() === userAddress?.toLowerCase()}
                        gameId={gameId}
                        onCardClick={handleCardClick}
                        handIndex={index}
                        currentViewingPlayer={currentViewingPlayer}
                        isDragInProgress={isDragInProgress}
                      />
                    ))}
                  </SortableContext>
                </div>
                
                {canPlayCards && (
                  <div className="mt-3 text-xs text-gray-400 space-y-1">
                    <div>💡 <strong>Basic Play:</strong> Drag cards to board (L1) to play them directly</div>
                    <div>🔗 <strong>Chain Play:</strong> Drag DeFi cards onto Chain cards to attach them</div>
                    <div>💰 <strong>Resources:</strong> {playerHand.eth} ETH available</div>
                  </div>
                )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeId && draggedCard ? (
            <div className="w-32 h-44 card border-eth-primary shadow-2xl opacity-90 transform rotate-12">
              <div className="p-2 border-b border-gray-600">
                <div className="text-xs text-center text-white font-bold">
                  {draggedCard.name}
                </div>
              </div>
              <div className="p-2 flex-1">
                <CardImage 
                  card={draggedCard} 
                  className="w-full h-full rounded"
                  fallbackIcon="🃏"
                />
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Game UI Elements - Outside DndContext to avoid interference */}
      
      {/* Opponent's wallet displays (upper left, below logo) - read-only */}
      <div className="fixed top-40 left-4 z-10 flex flex-col gap-3">
        {/* Opponent Hot Wallet */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 w-48 opacity-75">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔥</span>
              <h3 className="text-sm font-bold text-white">Opponent Hot Wallet</h3>
            </div>
          </div>
          <div className="mb-3">
            <div className="text-2xl font-bold text-eth-secondary mb-1">
              {Number(opponentBoard.eth || 0).toFixed(1)} ETH
            </div>
            <div className="text-xs text-gray-400">
              Available funds
            </div>
          </div>
        </div>

        {/* Opponent Cold Storage */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 w-48 opacity-75">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🏦</span>
              <h3 className="text-sm font-bold text-white">Opponent Cold Storage</h3>
            </div>
            {Number(opponentBoard.coldStorage || 0) >= 20 && (
              <div className="bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-bold">
                WIN!
              </div>
            )}
          </div>
          <div className="mb-3">
            <div className="text-2xl font-bold text-eth-primary mb-1">
              {Number(opponentBoard.coldStorage || 0).toFixed(1)} ETH
            </div>
            <div className="text-xs text-gray-400">
              Saved funds
            </div>
          </div>
          {/* Win Progress */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Win Progress</span>
              <span>{Number(opponentBoard.coldStorage || 0)}/20 ETH</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  Number(opponentBoard.coldStorage || 0) >= 20 ? 'bg-yellow-500' : 'bg-eth-primary'
                }`}
                style={{ width: `${Math.min((Number(opponentBoard.coldStorage || 0) / 20) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Player's wallet controls (lower right) */}
      <div className="fixed bottom-4 right-4 z-10 flex flex-col gap-3">
        <HotWallet playerId={currentViewingPlayer} />
        <ColdStorage playerId={currentViewingPlayer} />
      </div>

      {/* Combined Turn Action button - Draw Card or End Turn */}
      <div className="fixed bottom-40 left-4 z-20">
        {needsToDraw ? (
          <button
            onClick={handleDrawToStartTurn}
            disabled={isDrawing || !canPlayCards}
            className={`px-10 py-6 rounded-xl
                     text-white font-bold text-xl
                     transform transition-all duration-300
                     flex items-center justify-center gap-3
                     shadow-lg
                     ${shouldWiggleDrawButton 
                       ? 'bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 scale-110 shadow-2xl'
                       : canPlayCards && !isDrawing
                         ? 'bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500 hover:scale-110 glow-pulse-blue cursor-pointer'
                         : 'bg-gray-700 opacity-60 cursor-not-allowed'
                     }
                     ${shouldWiggleDrawButton ? 'animate-bounce animate-pulse' : ''}`}
          >
            {isDrawing ? (
              <>
                <span className="animate-spin text-2xl">⏳</span>
                <span>Drawing...</span>
              </>
            ) : (
              <>
                <span className="text-3xl">🃏</span>
                <span className="text-xl">Draw Card</span>
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleEndTurn}
            disabled={isEndingTurn || !canPlayCards}
            className={`px-10 py-6 rounded-xl
                     text-white font-bold text-xl
                     transform transition-all duration-300
                     flex items-center justify-center gap-3
                     shadow-lg
                     ${canPlayCards && !isEndingTurn
                       ? 'bg-gradient-to-r from-red-600 to-red-700 hover:scale-110 glow-pulse-red cursor-pointer'
                       : 'bg-gray-700 opacity-60 cursor-not-allowed'
                     }`}
          >
            {isEndingTurn ? (
              <>
                <span className="animate-spin text-2xl">⏳</span>
                <span>Ending Turn...</span>
              </>
            ) : (
              <>
                <span className="text-2xl">⏸️</span>
                <span className="text-xl">End Turn</span>
              </>
            )}
          </button>
        )}
      </div>


      {/* Card Detail Modal */}
      <CardDetailModal
        card={selectedCard}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedCard(null)
        }}
        isOnBattlefield={selectedCard?.source === 'board'}
        isOwnCard={selectedCard?.playerId === currentViewingPlayer}
        gameId={gameId}
      />

    </div>
  )
}
