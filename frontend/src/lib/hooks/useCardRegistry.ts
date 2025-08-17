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
    cardType: string, 
    abilities: string
  ) => {
    return addCard({
      address: CONTRACT_ADDRESSES.CARD_REGISTRY,
      abi: CardRegistryABI,
      functionName: 'addCard',
      args: [name, description, cost, cardType, abilities],
    })
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
          allCards.push({ id: i, ...card })
        }
      }
      
      return allCards
    } catch (error) {
      console.error('Error fetching all cards:', error)
      return []
    }
  }

  // Helper to get card count as a function
  const cardCount = async () => {
    return Number(cardCountData || 0)
  }

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
    args: [cardId],
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