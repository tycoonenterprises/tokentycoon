import { useEffect, useRef } from 'react'
import { useCardRegistry } from '@/lib/hooks/useCardRegistry'
import { useGameStore } from '@/stores/gameStore'

/**
 * CardLoader component - Loads cards from blockchain and updates game store
 * This component runs invisibly in the background to sync blockchain data with game state
 */
export function CardLoader() {
  const { cards, isLoadingCards: isContractLoading, cardCount } = useCardRegistry()
  const availableCards = useGameStore(state => state.availableCards)
  
  // Use ref to track if we've already loaded cards to prevent infinite loops
  const hasLoadedRef = useRef(false)

  // Load cards when component mounts and when contract data changes
  useEffect(() => {
    const store = useGameStore.getState()
    
    // Early return if we're still loading from contract
    if (isContractLoading) {
      console.log('CardLoader: Still loading cards from contract...')
      store.setLoadingCards(true)
      store.setCardLoadError(null)
      return
    }

    console.log('CardLoader: Contract loading complete. Cards:', cards?.length || 0, 'CardCount:', cardCount)

    // Only load cards once when they become available
    if (cards && cards.length > 0 && !hasLoadedRef.current) {
      console.log('🎴 CARD REGISTRY DEBUG - START')
      console.log(`📋 Loading ${cards.length} cards from CardRegistry`)
      console.log('🌐 First 10 cards from blockchain:', cards.slice(0, 10).map((c: any, i: number) => ({
        index: i,
        id: c.id,
        name: c.name,
        type: c.cardType,
        cost: c.cost
      })))
      console.log('🎴 CARD REGISTRY DEBUG - END')
      store.loadCardsFromBlockchain(cards)
      hasLoadedRef.current = true
    } else if (!hasLoadedRef.current && !cards) {
      console.log('CardLoader: No cards returned from contract, using mock cards')
      store.setCardLoadError('Using mock cards - CardRegistry not accessible')
      store.setLoadingCards(false)
      hasLoadedRef.current = true
    } else if (!hasLoadedRef.current && cardCount === 0) {
      console.log('CardLoader: CardCount is 0')
      store.setCardLoadError('No cards found in CardRegistry. Please deploy cards to the contract.')
      store.setLoadingCards(false)
      hasLoadedRef.current = true
    }
  }, [cards, isContractLoading, cardCount])

  // Debug logging removed - too noisy

  // This component doesn't render anything - it's just for data loading
  return null
}