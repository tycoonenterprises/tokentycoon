import { useEffect } from 'react'
import { useCardRegistry } from '@/lib/hooks/useCardRegistry'
import { useGameStore } from '@/stores/gameStore'

/**
 * CardLoader component - Loads cards from blockchain and updates game store
 * This component runs invisibly in the background to sync blockchain data with game state
 */
export function CardLoader() {
  const { cards, isLoadingCards: isContractLoading, cardCount } = useCardRegistry()
  const { 
    loadCardsFromBlockchain, 
    setLoadingCards, 
    setCardLoadError,
    isLoadingCards,
    cardLoadError,
    availableCards
  } = useGameStore()

  // Load cards when component mounts and when contract data changes
  useEffect(() => {
    if (isContractLoading) {
      setLoadingCards(true)
      setCardLoadError(null)
      return
    }

    if (cards && cards.length > 0) {
      console.log(`Loading ${cards.length} cards from CardRegistry into game store`)
      loadCardsFromBlockchain(cards)
    } else if (cardCount === 0) {
      setCardLoadError('No cards found in CardRegistry. Please deploy cards to the contract.')
      setLoadingCards(false)
    }
  }, [cards, isContractLoading, cardCount, loadCardsFromBlockchain, setLoadingCards, setCardLoadError])

  // Debug logging
  useEffect(() => {
    if (availableCards.length > 0) {
      console.log('Game store now has cards:', availableCards)
    }
  }, [availableCards])

  // This component doesn't render anything - it's just for data loading
  return null
}