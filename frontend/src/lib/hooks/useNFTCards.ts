import { useState, useCallback, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { mockContract, type ContractCard } from '@/lib/contracts/mockContract'
import type { Card } from '@/stores/gameStore'

export interface NFTCardData extends ContractCard {
  isOwned: boolean
  canUse: boolean
}

export function useNFTCards() {
  const { address, isConnected } = useAccount()
  const [cards, setCards] = useState<NFTCardData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const loadUserCards = useCallback(async () => {
    if (!address || !isConnected) {
      setCards([])
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const userCards = await mockContract.getAllCardsForOwner(address)
      const nftCards: NFTCardData[] = userCards.map(card => ({
        ...card,
        isOwned: true,
        canUse: true,
      }))

      setCards(nftCards)
    } catch (err: any) {
      setError(`Failed to load cards: ${err.message}`)
      setCards([])
    } finally {
      setIsLoading(false)
    }
  }, [address, isConnected])

  const mintStarterPack = useCallback(async () => {
    if (!address) throw new Error('No wallet connected')

    setIsLoading(true)
    setError('')

    try {
      const tokenIds = await mockContract.mintStarterPack(address)
      await loadUserCards() // Reload cards after minting
      return tokenIds
    } catch (err: any) {
      setError(`Failed to mint cards: ${err.message}`)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [address, loadUserCards])

  const getCardBalance = useCallback(async () => {
    if (!address) return 0
    return await mockContract.balanceOf(address)
  }, [address])

  const convertNFTToGameCard = useCallback((nftCard: NFTCardData): Card => {
    return {
      id: `nft-${nftCard.tokenId}`,
      name: nftCard.name,
      type: nftCard.cardType as Card['type'],
      cost: { gas: nftCard.cost },
      power: nftCard.power || undefined,
      toughness: nftCard.toughness || undefined,
      text: nftCard.text,
    }
  }, [])

  const buildDeckFromNFTs = useCallback((maxCards: number = 30): Card[] => {
    const availableCards = cards.filter(card => card.canUse)
    const gameCards = availableCards.map(convertNFTToGameCard)
    
    // For now, just return up to maxCards
    // In a real game, you'd have deck building rules
    return gameCards.slice(0, maxCards)
  }, [cards, convertNFTToGameCard])

  // Load cards when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      loadUserCards()
    }
  }, [isConnected, address, loadUserCards])

  return {
    cards,
    isLoading,
    error,
    loadUserCards,
    mintStarterPack,
    getCardBalance,
    convertNFTToGameCard,
    buildDeckFromNFTs,
    hasCards: cards.length > 0,
  }
}