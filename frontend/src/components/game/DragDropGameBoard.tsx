import React, { useState } from 'react'
import { DndContext, DragOverlay, closestCenter, useDroppable, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useGameStore, type Card } from '@/stores/gameStore'

interface DraggableCardProps {
  card: Card
  playerId: string
  source: 'hand' | 'board'
  canDrag: boolean
}

function DraggableCard({ card, playerId, source, canDrag }: DraggableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `${source}-${card.id}`,
    data: { card, playerId, source },
    disabled: !canDrag,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
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

  const cardSize = source === 'board' ? 'w-24 h-32' : 'w-32 h-44'

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(canDrag ? listeners : {})}
      className={`${cardSize} card cursor-pointer transition-all duration-200 ${getTypeColor(card.type)} ${
        canDrag ? 'hover:scale-105' : 'opacity-60 cursor-not-allowed'
      } ${isDragging ? 'z-50' : ''}`}
    >
      {/* Card Header */}
      <div className="p-2 border-b border-gray-600">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-400 flex items-center">
            <span className="mr-1">{getTypeIcon(card.type)}</span>
            {source === 'hand' && card.type.toUpperCase()}
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
        <h4 className={`${source === 'board' ? 'text-xs' : 'text-sm'} font-bold text-white mb-2 leading-tight`}>
          {card.name}
        </h4>
        
        {source === 'hand' && (
          <p className="text-xs text-gray-300 leading-tight">
            {card.text}
          </p>
        )}
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
}

function DropZone({ id, children, label, isEmpty, canDrop, isOver: isOverProp = false }: DropZoneProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
    disabled: !canDrop
  })


  return (
    <div
      ref={setNodeRef}
      className={`min-h-36 p-4 border-2 border-dashed rounded-lg transition-all duration-200 ${
        canDrop
          ? isOver
            ? 'border-eth-primary/70 bg-eth-primary/20'
            : 'border-blue-500/30 bg-blue-500/5'
          : 'border-gray-500/30 bg-gray-500/5'
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
              {id.includes('board') ? '🏟️' : '🃏'}
            </div>
            <div className="text-xs">
              {id.includes('board') ? 'Drop units here' : 'No cards in hand'}
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

export function DragDropGameBoard() {
  const { 
    players, 
    activePlayer, 
    viewingPlayer,
    isDemoMode,
    currentPhase,
    playCard,
    moveCard 
  } = useGameStore()
  
  const [activeId, setActiveId] = useState<string | null>(null)
  const [draggedCard, setDraggedCard] = useState<Card | null>(null)

  const { player1, player2 } = players
  
  // In demo mode, the viewing player can play cards if it's their turn
  const currentViewingPlayer = viewingPlayer
  
  // Simplified: in demo mode, always allow the viewing player to play cards if it's their turn and main phase
  const canPlayCards = activePlayer === viewingPlayer && currentPhase === 'main'
  
  
  // Determine which player's perspective we're showing
  const playerHand = currentViewingPlayer === 'player1' ? player1 : player2
  const opponentHand = currentViewingPlayer === 'player1' ? player2 : player1
  const playerBoard = currentViewingPlayer === 'player1' ? player1 : player2
  const opponentBoard = currentViewingPlayer === 'player1' ? player2 : player1

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    setActiveId(active.id as string)
    
    const data = active.data.current
    if (data) {
      setDraggedCard(data.card)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    setDraggedCard(null)

    if (!over) return

    const activeData = active.data.current
    const overId = over.id as string

    if (!activeData) return

    const { card, playerId, source } = activeData

    // Handle card play from hand to board
    const targetBoard = `${currentViewingPlayer}-board`
    if (source === 'hand' && overId === targetBoard && playerId === currentViewingPlayer) {
      if (canPlayCards && playerHand.eth >= card.cost) {
        playCard(playerId, card.id)
      }
    }
    
    // Handle moving cards between zones (for future features)
    if (active.id !== over.id && source !== 'hand') {
      // This would handle board-to-board moves, board-to-hand returns, etc.
      // For now, we'll keep it simple
    }
  }

  const canDragCard = (card: Card, source: 'hand' | 'board', playerId: string) => {
    // In demo mode, allow the current viewing player to drag their cards
    // In practice mode, only allow player1
    if (isDemoMode) {
      if (playerId !== currentViewingPlayer) return false
    } else {
      if (playerId !== 'player1') return false
    }
    
    if (source === 'hand') {
      return canPlayCards && playerHand.eth >= card.cost
    }
    return false // Board cards can't be moved yet
  }

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 p-6 bg-gradient-to-b from-gray-800 to-eth-dark">
        <div className="max-w-6xl mx-auto h-full">
          <div className="h-full flex flex-col gap-6">
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
                  <div
                    key={card.id}
                    className="w-24 h-32 card border-red-500/50 transform rotate-180"
                  >
                    <div className="p-1 border-b border-gray-600">
                      <div className="text-xs text-center text-gray-300">
                        {card.name}
                      </div>
                    </div>
                    <div className="p-1 flex-1 flex items-center justify-center">
                      <div className="text-lg">🃏</div>
                    </div>
                    {card.type === 'unit' && (
                      <div className="p-1 border-t border-gray-600">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-eth-danger">{card.power}</span>
                          <span className="text-eth-success">{card.toughness}</span>
                        </div>
                      </div>
                    )}
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

            {/* Player Board - Droppable */}
            <DropZone
              id={`${currentViewingPlayer}-board`}
              label={`Your Board (Player ${currentViewingPlayer === 'player1' ? '1' : '2'})`}
              isEmpty={playerBoard.board.length === 0}
              canDrop={canPlayCards}
            >
              <SortableContext 
                items={playerBoard.board.map(card => `board-${card.id}`)}
                strategy={verticalListSortingStrategy}
              >
                {playerBoard.board.map((card) => (
                  <DraggableCard
                    key={card.id}
                    card={card}
                    playerId={currentViewingPlayer}
                    source="board"
                    canDrag={canDragCard(card, 'board', currentViewingPlayer)}
                  />
                ))}
              </SortableContext>
            </DropZone>

            {/* Player Hand */}
            <div className="p-4 bg-gray-900 border-t border-gray-700">
              <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    Your Hand ({playerHand.hand.length})
                  </h3>
                  {canPlayCards && (
                    <div className="text-sm text-eth-success">
                      ⚡ Drag cards to board to play
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3 overflow-x-auto pb-2">
                  <SortableContext 
                    items={playerHand.hand.map(card => `hand-${card.id}`)}
                    strategy={verticalListSortingStrategy}
                  >
                    {playerHand.hand.map((card) => (
                      <DraggableCard
                        key={card.id}
                        card={card}
                        playerId={currentViewingPlayer}
                        source="hand"
                        canDrag={canDragCard(card, 'hand', currentViewingPlayer)}
                      />
                    ))}
                  </SortableContext>
                </div>
                
                {canPlayCards && (
                  <div className="mt-3 text-xs text-gray-400">
                    💡 Drag cards from hand to board to play them. ETH available: {playerHand.eth}
                  </div>
                )}
                
                {isDemoMode && !canPlayCards && (
                  <div className="mt-3 text-xs text-yellow-400">
                    🔄 {activePlayer !== currentViewingPlayer ? 'Not your turn' : 'Wrong phase'} - Use "Switch Player" or "Next Phase" to continue
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
            <div className="p-2 flex-1 flex items-center justify-center">
              <div className="text-2xl">🃏</div>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}