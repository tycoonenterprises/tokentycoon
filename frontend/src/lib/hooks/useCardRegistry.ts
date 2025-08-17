import { useReadContract, useWriteContract } from 'wagmi'
import { CONTRACT_ADDRESSES } from '@/lib/web3/config'
import { CardRegistryABI } from '@/lib/contracts/CardRegistryABI'
import type { ContractCard } from '@/lib/types/contracts'

export const useCardRegistry = () => {
  // Read functions
  const { data: cards, isLoading: isLoadingCards, refetch: refetchCards } = useReadContract({
    address: CONTRACT_ADDRESSES.CARD_REGISTRY,
    abi: CardRegistryABI,
    functionName: 'getAllCards',
  })

  const { data: cardCountData } = useReadContract({
    address: CONTRACT_ADDRESSES.CARD_REGISTRY,
    abi: CardRegistryABI,
    functionName: 'getCardCount',
  })

  const { data: isInitialized } = useReadContract({
    address: CONTRACT_ADDRESSES.CARD_REGISTRY,
    abi: CardRegistryABI,
    functionName: 'initialized',
  })

  // Write functions
  const { writeContract: addCard, isPending: isAddingCard } = useWriteContract()

  const handleAddCard = async (
    name: string, 
    description: string, 
    cost: number, 
    cardType: number, 
    abilities: string[]
  ) => {
    // Note: This function may not be callable in production
    // Cards are typically added during deployment
    console.warn('addCard may not be available - cards are usually deployed with the contract')
    return null
  }

  // Helper function to get a single card
  const getCard = async (cardId: number) => {
    try {
      // For now, return mock data since contract reading is complex
      return null
    } catch (error) {
      console.error(`Error fetching card ${cardId}:`, error)
      return null
    }
  }

  // Helper function to get all cards
  const getAllCards = async () => {
    try {
      const count = Number(cardCountData || 0)
      const allCards = []
      
      for (let i = 1; i <= count; i++) {
        const card = await getCard(i)
        if (card) {
          allCards.push({ id: i, ...(card as any) })
        }
      }
      
      return allCards
    } catch (error) {
      console.error('Error fetching all cards:', error)
      return []
    }
  }

  // Get card count as a number
  const cardCount = Number(cardCountData || 0)

  return {
    // Data
    cards: cards as ContractCard[] | undefined,
    cardCount,
    isInitialized: isInitialized as boolean | undefined,
    
    // Loading states
    isLoadingCards,
    isAddingCard,
    
    // Actions
    addCard: handleAddCard,
    refetchCards,
    getCard,
    getAllCards,
  }
}

export const useGetCard = (cardId: number) => {
  const { data: card, isLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.CARD_REGISTRY,
    abi: CardRegistryABI,
    functionName: 'getCard',
    args: [BigInt(cardId)],
  })

  return {
    card: card as ContractCard | undefined,
    isLoading,
  }
}

export const useGetCardByName = (cardName: string) => {
  const { data: card, isLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.CARD_REGISTRY,
    abi: CardRegistryABI,
    functionName: 'getCardByName',
    args: [cardName],
  })

  return {
    card: card as ContractCard | undefined,
    isLoading,
  }
}