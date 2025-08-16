# Card Interaction & Phase Management Implementation Plan

## Overview

This document outlines the implementation plan for proper card dragging, playing, and phase-based game mechanics in the Ethereum Trading Card Game frontend. The goal is to create intuitive, rules-based card interactions that respect game phases and provide clear visual feedback.

## Current State Analysis

### Existing Systems
- ✅ **DnD Kit Integration**: Basic drag-and-drop setup in `DragDropGameBoard.tsx`
- ✅ **Game Store**: Turn-based state management with phases (draw, main, combat, end)
- ✅ **Card Components**: `Hand.tsx` displays cards with hover effects
- ✅ **Real Contract Data**: Cards loaded from blockchain with proper abilities

### Current Limitations
- ❌ **No Phase Restrictions**: Cards can be played during any phase
- ❌ **No Drag Validation**: All cards are draggable regardless of playability
- ❌ **No Drop Zone Validation**: Cards can be dropped anywhere
- ❌ **No Visual Feedback**: No indication of valid/invalid moves
- ❌ **No Cost Checking**: Gas costs not validated during drag

## Game Rules & Phase System

### Phase Flow
```
Draw Phase → Main Phase → Combat Phase → End Phase → (Next Turn)
```

### Phase-Based Card Restrictions
1. **Draw Phase**: 
   - Only system actions (automatic card draw)
   - No manual card playing allowed
   
2. **Main Phase**: 
   - ✅ Play Chain cards (permanent resources)
   - ✅ Play DeFi cards (yield generators)  
   - ✅ Play EOA cards (units/creatures)
   - ✅ Play Action cards (instant effects)
   - ✅ All card types playable
   
3. **Combat Phase**:
   - ❌ No new cards can be played
   - ✅ Declare attacks with existing EOA units
   - ✅ Activate abilities of cards on board
   
4. **End Phase**:
   - ❌ No card playing
   - System cleanup and turn advancement

### Card Play Requirements
- **Gas Cost**: Player must have sufficient gas to pay card cost
- **Valid Phase**: Card type must be playable in current phase
- **Valid Target**: Some cards may require targets (future enhancement)
- **Board Space**: Board must have space for permanent cards

## Implementation Plan

### Phase 1: Enhanced Drag State Management

#### 1.1 Drag Context Provider
```typescript
// src/lib/contexts/DragContext.tsx
interface DragContextType {
  draggedCard: Card | null
  isDragging: boolean
  canPlayCard: (card: Card) => boolean
  getDropValidation: (dropZone: string) => DropValidation
  startDrag: (card: Card) => void
  endDrag: () => void
}
```

#### 1.2 Card Playability Logic
```typescript
// src/lib/utils/cardPlayability.ts
export const canPlayCard = (
  card: Card, 
  currentPhase: GamePhase, 
  playerGas: number,
  activePlayer: string,
  currentPlayer: string
): PlayabilityResult => {
  // Phase validation
  // Gas cost validation  
  // Player turn validation
  // Return detailed result with reasons
}
```

#### 1.3 Drop Zone Validation
```typescript
// Drop zones: hand, board, discard
// Validation rules per zone and card type
export const getDropZoneRules = (
  zone: DropZone,
  card: Card,
  gameState: GameState
): DropValidation
```

### Phase 2: Visual Feedback System

#### 2.1 Card Visual States
- **Draggable**: Subtle glow when hoverable and playable
- **Non-Draggable**: Dimmed/grayed out when not playable
- **Dragging**: Enhanced glow and scale during drag
- **Invalid**: Red border/tint when drag is invalid
- **Valid Drop**: Green highlight on valid drop zones

#### 2.2 Drop Zone Indicators
```typescript
interface DropZoneProps {
  zone: 'board' | 'hand' | 'discard'
  isValidDrop: boolean
  isActive: boolean  // Card being dragged over
  children: React.ReactNode
}
```

#### 2.3 Phase Indicator Enhancement
```typescript
// Enhanced PlayerStats to show phase restrictions
interface PhaseInfo {
  currentPhase: GamePhase
  allowedActions: string[]
  nextPhaseAvailable: boolean
  phaseTimeRemaining?: number  // Future: turn timers
}
```

### Phase 3: Enhanced Drag & Drop Implementation

#### 3.1 Card Drag Behavior
```typescript
// In Hand.tsx - Enhanced card rendering
const CardInHand = ({ card, index }: CardInHandProps) => {
  const { canPlayCard } = useDragContext()
  const { currentPhase, activePlayer, players } = useGameStore()
  
  const playability = canPlayCard(card)
  
  return (
    <DraggableCard
      card={card}
      disabled={!playability.canPlay}
      dragOverlay={<CardDragOverlay card={card} />}
      onDragStart={() => showDropZones()}
      onDragEnd={(result) => handleCardPlay(result)}
    />
  )
}
```

#### 3.2 Smart Drop Zones
```typescript
// In DragDropGameBoard.tsx
const SmartDropZone = ({ zone, onDrop }: SmartDropZoneProps) => {
  const { draggedCard } = useDragContext()
  const validation = getDropValidation(zone, draggedCard)
  
  return (
    <DroppableArea
      id={zone}
      className={getDropZoneClassName(validation)}
      disabled={!validation.isValid}
      onDrop={(card) => handleValidatedDrop(card, zone, validation)}
    />
  )
}
```

#### 3.3 Card Play Resolution
```typescript
const handleCardPlay = (card: Card, targetZone: string) => {
  // 1. Final validation check
  // 2. Deduct gas cost
  // 3. Apply card effects
  // 4. Move card to appropriate zone
  // 5. Update game state
  // 6. Trigger animations
  // 7. Check for phase advancement
}
```

### Phase 4: Card Effect System

#### 4.1 Ability Resolution
```typescript
// src/lib/game/abilities.ts
export const resolveCardAbility = (card: Card, gameState: GameState): GameState => {
  switch(card.abilities) {
    case 'income':
      return addPlayerGas(gameState, gameState.activePlayer, 1)
    case 'draw':
      return drawCards(gameState, gameState.activePlayer, 2)
    case 'yield':
      return applyYieldEffect(gameState, card)
    default:
      return gameState
  }
}
```

#### 4.2 Card Type Placement
```typescript
// Different card types go to different zones
const getDestinationZone = (card: Card): 'board' | 'discard' => {
  switch(card.type) {
    case 'chain':
    case 'defi':
    case 'eoa':
      return 'board'  // Permanent cards
    case 'action':
      return 'discard'  // One-time effects
    default:
      return 'discard'
  }
}
```

### Phase 5: Animation & Polish

#### 5.1 Card Animation States
```css
/* Card transition animations */
.card-dragging { transform: scale(1.05) rotate(5deg); }
.card-dropping { animation: dropToZone 0.3s ease-out; }
.card-invalid { animation: shake 0.3s ease-in-out; }
.card-played { animation: playEffect 0.5s ease-out; }
```

#### 5.2 Drop Zone Animations
```css
/* Drop zone feedback */
.drop-zone-valid { border: 2px dashed #4ade80; background: rgba(74, 222, 128, 0.1); }
.drop-zone-invalid { border: 2px dashed #ef4444; background: rgba(239, 68, 68, 0.1); }
.drop-zone-active { animation: pulse 1s infinite; }
```

#### 5.3 Phase Transition Effects
```typescript
// Smooth phase transitions with visual cues
const PhaseTransition = ({ fromPhase, toPhase }: PhaseTransitionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
    >
      {toPhase} Phase
    </motion.div>
  )
}
```

## Implementation Priority

### High Priority (Must Have)
1. ✅ **Phase-based card playing restrictions**
2. ✅ **Gas cost validation before allowing drags**
3. ✅ **Proper card placement (board vs discard)**
4. ✅ **Visual feedback for playability**
5. ✅ **Card ability resolution**

### Medium Priority (Should Have)
1. **Enhanced animations and transitions**
2. **Detailed error messages for invalid plays**
3. **Undo last action functionality**
4. **Card hover preview during drag**

### Low Priority (Nice to Have)
1. **Sound effects for card plays**
2. **Advanced card interactions (targeting)**
3. **Turn timers and phase automation**
4. **Replay system for debugging**

## Technical Architecture

### File Structure
```
src/
├── lib/
│   ├── contexts/
│   │   └── DragContext.tsx         # Drag state management
│   ├── utils/
│   │   ├── cardPlayability.ts      # Play validation logic
│   │   ├── dropZoneValidation.ts   # Drop zone rules
│   │   └── cardEffects.ts          # Ability resolution
│   ├── hooks/
│   │   ├── useCardDrag.ts          # Drag behavior hook
│   │   ├── useDropZone.ts          # Drop zone behavior
│   │   └── usePhaseValidation.ts   # Phase rule enforcement
│   └── types/
│       └── dragDrop.ts             # Drag & drop type definitions
├── components/
│   ├── game/
│   │   ├── DraggableCard.tsx       # Enhanced card with drag
│   │   ├── SmartDropZone.tsx       # Validated drop areas
│   │   ├── PhaseIndicator.tsx      # Phase status display
│   │   └── CardPlayFeedback.tsx    # Visual feedback component
└── styles/
    └── cardInteractions.css        # Animation styles
```

### State Management Updates
```typescript
// Enhanced game store actions
interface EnhancedGameActions {
  // Existing actions...
  validateCardPlay: (cardId: string, targetZone: string) => PlayValidation
  executeCardPlay: (cardId: string, targetZone: string) => void
  canAdvancePhase: () => boolean
  forcePhaseAdvance: () => void  // For testing
  undoLastAction: () => void     // Future enhancement
}
```

## Success Criteria

### Functional Requirements
- ✅ Cards can only be played during appropriate phases
- ✅ Gas costs are enforced before card play
- ✅ Card abilities resolve correctly
- ✅ Invalid plays are prevented with clear feedback
- ✅ Game state remains consistent after all interactions

### User Experience Requirements
- ✅ Intuitive drag and drop feels natural
- ✅ Clear visual feedback for all states
- ✅ Responsive animations don't block gameplay
- ✅ Error states are helpful, not frustrating

### Technical Requirements
- ✅ No memory leaks from drag operations
- ✅ Performant on mid-range devices
- ✅ Accessible with keyboard navigation
- ✅ Compatible with existing Web3 integration

## Implementation Timeline

### Week 1: Core Mechanics
- Day 1-2: Card playability validation system
- Day 3-4: Phase-based restrictions
- Day 5-7: Basic drag & drop with validation

### Week 2: Polish & Enhancement  
- Day 1-3: Visual feedback and animations
- Day 4-5: Card ability resolution
- Day 6-7: Testing and bug fixes

### Week 3: Integration & Testing
- Day 1-3: Integration with existing game flow
- Day 4-5: Cross-browser testing
- Day 6-7: Performance optimization and documentation

## Risk Mitigation

### Technical Risks
1. **DnD Kit Complexity**: Start with simple implementation, enhance gradually
2. **State Synchronization**: Use strict validation to prevent desync
3. **Performance**: Profile early, optimize animations

### UX Risks
1. **Learning Curve**: Provide clear visual cues and onboarding
2. **Frustration**: Always explain why actions are invalid
3. **Accessibility**: Test with keyboard and screen readers

## Future Enhancements

### Multiplayer Considerations
- Real-time drag state synchronization
- Opponent action visibility
- Network lag compensation

### Advanced Features
- Card targeting system for spells
- Chain reactions and complex interactions
- Tournament mode with stricter timing

This plan provides a comprehensive roadmap for implementing sophisticated card interaction mechanics while maintaining code quality and user experience standards.