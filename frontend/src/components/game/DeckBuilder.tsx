import { useState } from 'react'
import { useNFTCards } from '@/lib/hooks/useNFTCards'
import type { Card } from '@/stores/gameStore'

interface DeckBuilderProps {
  onDeckReady: (deck: Card[]) => void
  onClose: () => void
}

export function DeckBuilder({ onDeckReady, onClose }: DeckBuilderProps) {
  const { 
    cards, 
    isLoading, 
    error, 
    mintStarterPack, 
    hasCards,
    convertNFTToGameCard,
    buildDeckFromNFTs 
  } = useNFTCards()
  
  const [selectedCards, setSelectedCards] = useState<string[]>([])
  const [isMinting, setIsMinting] = useState(false)

  const handleMintCards = async () => {
    setIsMinting(true)
    try {
      await mintStarterPack()
    } catch (error) {
      console.error('Failed to mint cards:', error)
    } finally {
      setIsMinting(false)
    }
  }

  const toggleCardSelection = (tokenId: string) => {
    setSelectedCards(prev => 
      prev.includes(tokenId)
        ? prev.filter(id => id !== tokenId)
        : [...prev, tokenId]
    )
  }

  const handleBuildDeck = () => {
    if (selectedCards.length === 0) {
      // Use all available cards if none selected
      const deck = buildDeckFromNFTs(20)
      onDeckReady(deck)
    } else {
      // Use selected cards
      const selectedNFTs = cards.filter(card => 
        selectedCards.includes(card.tokenId.toString())
      )
      const deck = selectedNFTs.map(convertNFTToGameCard)
      onDeckReady(deck)
    }
  }

  const getCardTypeColor = (type: string) => {
    switch (type) {
      case 'unit': return 'border-eth-success'
      case 'spell': return 'border-eth-primary'
      case 'resource': return 'border-eth-secondary'
      case 'upgrade': return 'border-purple-500'
      default: return 'border-gray-500'
    }
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="card p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-eth-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading your NFT cards...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-eth-dark border border-gray-700 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Deck Builder</h2>
              <p className="text-gray-400">Build your deck from owned NFT cards</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {error && (
            <div className="bg-eth-danger/20 border border-eth-danger rounded-lg p-4 mb-6">
              <p className="text-eth-danger">{error}</p>
            </div>
          )}

          {!hasCards ? (
            // No cards state
            <div className="text-center py-12">
              <div className="text-6xl mb-6">🃏</div>
              <h3 className="text-xl font-bold text-white mb-4">
                No NFT Cards Found
              </h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                You need to own NFT cards to build a custom deck. 
                Mint your first starter pack to get started!
              </p>
              <button
                onClick={handleMintCards}
                disabled={isMinting}
                className="btn-primary px-8 py-3"
              >
                {isMinting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 inline-block"></div>
                    Minting Cards...
                  </>
                ) : (
                  '🎁 Mint Starter Pack (5 Cards)'
                )}
              </button>
            </div>
          ) : (
            // Cards available
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Your NFT Collection ({cards.length} cards)
                  </h3>
                  <p className="text-sm text-gray-400">
                    Selected: {selectedCards.length} cards
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedCards([])}
                    className="btn-secondary text-sm"
                  >
                    Clear Selection
                  </button>
                  <button
                    onClick={() => setSelectedCards(cards.map(c => c.tokenId.toString()))}
                    className="btn-secondary text-sm"
                  >
                    Select All
                  </button>
                </div>
              </div>

              {/* Card Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
                {cards.map((card) => {
                  const isSelected = selectedCards.includes(card.tokenId.toString())
                  return (
                    <div
                      key={card.tokenId}
                      className={`card cursor-pointer transition-all duration-200 hover:scale-105 ${
                        getCardTypeColor(card.cardType)
                      } ${
                        isSelected 
                          ? 'ring-2 ring-eth-primary shadow-lg' 
                          : ''
                      }`}
                      onClick={() => toggleCardSelection(card.tokenId.toString())}
                    >
                      <div className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-400">
                            #{card.tokenId}
                          </span>
                          {card.cost > 0 && (
                            <span className="bg-eth-secondary text-xs px-2 py-1 rounded font-bold">
                              {card.cost}
                            </span>
                          )}
                        </div>
                        
                        <h4 className="text-sm font-bold text-white mb-2 leading-tight">
                          {card.name}
                        </h4>
                        
                        <p className="text-xs text-gray-300 mb-2 leading-tight">
                          {card.text}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400 capitalize">
                            {card.cardType}
                          </span>
                          {card.cardType === 'unit' && (
                            <span className="text-white">
                              {card.power}/{card.toughness}
                            </span>
                          )}
                        </div>
                        
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-eth-primary rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Quick Actions */}
              <div className="flex gap-4 justify-center mb-6">
                <button
                  onClick={handleMintCards}
                  disabled={isMinting}
                  className="btn-secondary"
                >
                  {isMinting ? 'Minting...' : 'Mint More Cards'}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {hasCards && (
          <div className="p-6 border-t border-gray-700">
            <div className="flex gap-4 justify-end">
              <button
                onClick={onClose}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleBuildDeck}
                className="btn-primary"
                disabled={!hasCards}
              >
                {selectedCards.length > 0 
                  ? `Build Deck (${selectedCards.length} cards)`
                  : 'Use All Cards'
                }
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              💡 If no cards are selected, all available cards will be used for your deck
            </p>
          </div>
        )}
      </div>
    </div>
  )
}