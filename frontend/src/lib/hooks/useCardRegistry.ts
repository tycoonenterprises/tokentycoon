import { useReadContract, useWriteContract } from 'wagmi'
import { CONTRACT_ADDRESSES } from '@/lib/web3/config'
import { CardRegistryABI } from '@/lib/contracts/CardRegistryABI'
import { ContractCard } from '@/stores/gameStore'

export const useCardRegistry = () => {
  // Read functions
  const { data: cards, isLoading: isLoadingCards, refetch: refetchCards } = useReadContract({
    address: CONTRACT_ADDRESSES.CARD_REGISTRY,
    abi: CardRegistryABI,
    functionName: 'getAllCards',
  })

  const { data: cardCount } = useReadContract({
    address: CONTRACT_ADDRESSES.CARD_REGISTRY,
    abi: CardRegistryABI,
    functionName: 'getCardCount',
  })

  const { data: isInitialized } = useReadContract({
    address: CONTRACT_ADDRESSES.CARD_REGISTRY,
    abi: CardRegistryABI,
    functionName: 'isInitialized',
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

  return {
    // Data
    cards: cards as ContractCard[] | undefined,
    cardCount: cardCount as number | undefined,
    isInitialized: isInitialized as boolean | undefined,
    
    // Loading states
    isLoadingCards,
    isAddingCard,
    
    // Actions
    addCard: handleAddCard,
    refetchCards,
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