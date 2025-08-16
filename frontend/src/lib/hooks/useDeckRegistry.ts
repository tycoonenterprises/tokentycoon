import { useReadContract, useWriteContract } from 'wagmi'
import { CONTRACT_ADDRESSES } from '@/lib/web3/config'
import { DeckRegistryABI } from '@/lib/contracts/DeckRegistryABI'
import { ContractDeck, ExpandedDeckCard } from '@/lib/types/contracts'

export const useDeckRegistry = () => {
  // Read functions
  const { data: decks, isLoading: isLoadingDecks, refetch: refetchDecks } = useReadContract({
    address: CONTRACT_ADDRESSES.DECK_REGISTRY,
    abi: DeckRegistryABI,
    functionName: 'getAllDecks',
  })

  const { data: deckCount } = useReadContract({
    address: CONTRACT_ADDRESSES.DECK_REGISTRY,
    abi: DeckRegistryABI,
    functionName: 'getDeckCount',
  })

  const { data: isInitialized } = useReadContract({
    address: CONTRACT_ADDRESSES.DECK_REGISTRY,
    abi: DeckRegistryABI,
    functionName: 'isInitialized',
  })

  // Write functions
  const { writeContract: addDeck, isPending: isAddingDeck } = useWriteContract()

  const handleAddDeck = async (
    name: string,
    description: string,
    cardNames: string[],
    cardCounts: number[]
  ) => {
    return addDeck({
      address: CONTRACT_ADDRESSES.DECK_REGISTRY,
      abi: DeckRegistryABI,
      functionName: 'addDeck',
      args: [name, description, cardNames, cardCounts],
    })
  }

  return {
    // Data
    decks: decks as ContractDeck[] | undefined,
    deckCount: deckCount as number | undefined,
    isInitialized: isInitialized as boolean | undefined,
    
    // Loading states
    isLoadingDecks,
    isAddingDeck,
    
    // Actions
    addDeck: handleAddDeck,
    refetchDecks,
  }
}

export const useGetDeck = (deckId: number) => {
  const { data: deck, isLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.DECK_REGISTRY,
    abi: DeckRegistryABI,
    functionName: 'getDeck',
    args: [deckId],
  })

  return {
    deck: deck as ContractDeck | undefined,
    isLoading,
  }
}

export const useGetDeckByName = (deckName: string) => {
  const { data: deck, isLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.DECK_REGISTRY,
    abi: DeckRegistryABI,
    functionName: 'getDeckByName',
    args: [deckName],
  })

  return {
    deck: deck as ContractDeck | undefined,
    isLoading,
  }
}

export const useExpandDeck = (deckId: number) => {
  const { data: expandedCards, isLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.DECK_REGISTRY,
    abi: DeckRegistryABI,
    functionName: 'expandDeck',
    args: [deckId],
  })

  return {
    expandedCards: expandedCards as ExpandedDeckCard[] | undefined,
    isLoading,
  }
}