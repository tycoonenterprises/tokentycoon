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
      store.setLoadingCards(true)
      store.setCardLoadError(null)
      return
    }


    // Only load cards once when they become available
    if (cards && cards.length > 0 && !hasLoadedRef.current) {
      store.loadCardsFromBlockchain(cards)
      hasLoadedRef.current = true
    } else if (!hasLoadedRef.current && !cards) {
      store.setCardLoadError('Using mock cards - CardRegistry not accessible')
      store.setLoadingCards(false)
      hasLoadedRef.current = true
    } else if (!hasLoadedRef.current && cardCount !== undefined && cardCount === 0) {
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