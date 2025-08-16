import { useState, useEffect } from 'react'
import { CardImage } from '@/components/ui/CardImage'

// Type definitions to match the JSON structure
interface DeckCardEntry {
  name: string
  count: number
}

interface DeckData {
  name: string
  description: string
  cards: DeckCardEntry[]
}

interface CardData {
  name: string
  description: string
  cost: number
  cardType: 'Chain' | 'DeFi' | 'EOA' | 'Action'
  abilities?: { [key: string]: { amount: number } }
  tokens?: number
}

interface DecksPageProps {
  onClose: () => void
}

export function DecksPage({ onClose }: DecksPageProps) {
  const [selectedDeck, setSelectedDeck] = useState<DeckData | null>(null)
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null)
  const [decks, setDecks] = useState<DeckData[]>([])
  const [cards, setCards] = useState<CardData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [decksResponse, cardsResponse] = await Promise.all([
          fetch('/decks.json'),
          fetch('/cards.json')
        ])
        
        const decksData = await decksResponse.json()
        const cardsData = await cardsResponse.json()
        
        setDecks(decksData.decks || [])
        setCards(cardsData.cards || [])
      } catch (error) {
        console.error('Failed to load deck/card data:', error)
        // Fallback to empty arrays
        setDecks([])
        setCards([])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Get card details by name
  const getCardByName = (name: string): CardData | null => {
    return cards.find(card => card.name === name) || null
  }

  // Get expanded card list for a deck (respecting count)
  const getExpandedDeckCards = (deck: DeckData): CardData[] => {
    const expandedCards: CardData[] = []
    deck.cards.forEach(deckCard => {
      const cardData = getCardByName(deckCard.name)
      if (cardData) {
        // Add multiple copies based on count
        for (let i = 0; i < deckCard.count; i++) {
          expandedCards.push(cardData)
        }
      }
    })
    return expandedCards
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Chain': return 'border-eth-secondary bg-eth-secondary/10'
      case 'DeFi': return 'border-purple-500 bg-purple-500/10'
      case 'EOA': return 'border-eth-success bg-eth-success/10'
      case 'Action': return 'border-eth-primary bg-eth-primary/10'
      default: return 'border-gray-500 bg-gray-500/10'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Chain': return '🔗'
      case 'DeFi': return '💰'
      case 'EOA': return '👤'
      case 'Action': return '⚡'
      default: return '❓'
    }
  }

  const handleCardClick = (card: CardData) => {
    setSelectedCard(card)
  }

  const handleBackToDeckView = () => {
    setSelectedDeck(null)
    setSelectedCard(null)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-6xl w-full h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-4">
            {selectedDeck && (
              <button
                onClick={handleBackToDeckView}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ← Back
              </button>
            )}
            <h2 className="text-2xl font-bold text-white">
              {selectedDeck ? `${selectedDeck.name} Cards` : 'All Decks'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            // Loading State
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-eth-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Loading decks...</p>
              </div>
            </div>
          ) : !selectedDeck ? (
            // Decks List View
            <div className="p-6 h-full overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {decks.map((deck, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedDeck(deck)}
                    className="bg-gray-800 border border-gray-600 rounded-lg p-6 cursor-pointer hover:border-eth-primary transition-colors"
                  >
                    <h3 className="text-xl font-bold text-white mb-2">{deck.name}</h3>
                    <p className="text-gray-400 text-sm mb-4">{deck.description}</p>
                    
                    {/* Card count summary */}
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-300">
                        Cards ({deck.cards.reduce((sum, card) => sum + card.count, 0)} total):
                      </div>
                      {deck.cards.map((deckCard, cardIndex) => {
                        const cardData = getCardByName(deckCard.name)
                        return (
                          <div key={cardIndex} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              {cardData && (
                                <span className={`w-4 h-4 rounded text-xs flex items-center justify-center ${getTypeColor(cardData.cardType)}`}>
                                  {getTypeIcon(cardData.cardType)}
                                </span>
                              )}
                              <span className="text-gray-300">{deckCard.name}</span>
                            </div>
                            <span className="text-gray-400">×{deckCard.count}</span>
                          </div>
                        )
                      })}
                    </div>
                    
                    <div className="mt-4 text-center">
                      <span className="text-eth-primary text-sm font-medium">
                        Click to view all cards →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Deck Cards View
            <div className="flex h-full">
              {/* Cards Grid */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="mb-4">
                  <p className="text-gray-400">{selectedDeck.description}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Total cards: {getExpandedDeckCards(selectedDeck).length}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {getExpandedDeckCards(selectedDeck).map((card, index) => (
                    <div
                      key={index}
                      onClick={() => handleCardClick(card)}
                      className={`card w-full aspect-[2/3] cursor-pointer transition-all duration-200 hover:scale-105 ${getTypeColor(card.cardType)}`}
                    >
                      {/* Card Header */}
                      <div className="p-2 border-b border-gray-600">
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-400 flex items-center">
                            <span className="mr-1">{getTypeIcon(card.cardType)}</span>
                            {card.cardType.toUpperCase()}
                          </div>
                          {card.cost > 0 && (
                            <div className="text-xs px-2 py-1 rounded-full font-bold bg-eth-secondary text-white">
                              {card.cost} ETH
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="flex-1 p-2">
                        <CardImage 
                          card={{
                            id: `${card.name}-${index}`,
                            name: card.name,
                            type: card.cardType.toLowerCase() as any,
                            cost: card.cost,
                            text: card.description,
                          }}
                          className="w-full h-16 rounded mb-2"
                          fallbackIcon={getTypeIcon(card.cardType)}
                        />
                        
                        <h4 className="text-xs font-bold text-white leading-tight">
                          {card.name}
                        </h4>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Detail Panel */}
              {selectedCard && (
                <div className="w-80 border-l border-gray-700 bg-gray-800 p-6 overflow-y-auto">
                  <div className="mb-4">
                    <button
                      onClick={() => setSelectedCard(null)}
                      className="text-gray-400 hover:text-white transition-colors mb-2"
                    >
                      ← Back to deck
                    </button>
                    <h3 className="text-xl font-bold text-white">{selectedCard.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-1 rounded text-xs ${getTypeColor(selectedCard.cardType)}`}>
                        {getTypeIcon(selectedCard.cardType)} {selectedCard.cardType}
                      </span>
                      {selectedCard.cost > 0 && (
                        <span className="px-2 py-1 rounded text-xs bg-eth-secondary text-white">
                          {selectedCard.cost} ETH
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Image */}
                  <div className="mb-4">
                    <CardImage 
                      card={{
                        id: selectedCard.name,
                        name: selectedCard.name,
                        type: selectedCard.cardType.toLowerCase() as any,
                        cost: selectedCard.cost,
                        text: selectedCard.description,
                      }}
                      className="w-full h-40 rounded"
                      fallbackIcon={getTypeIcon(selectedCard.cardType)}
                    />
                  </div>

                  {/* Card Description */}
                  <div className="mb-4">
                    <h4 className="text-sm font-bold text-gray-300 mb-2">Description</h4>
                    <p className="text-sm text-gray-400">{selectedCard.description}</p>
                  </div>

                  {/* Abilities */}
                  {selectedCard.abilities && Object.keys(selectedCard.abilities).length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-bold text-gray-300 mb-2">Abilities</h4>
                      <div className="space-y-2">
                        {Object.entries(selectedCard.abilities).map(([ability, config]) => (
                          <div key={ability} className="flex items-center justify-between text-sm">
                            <span className="text-gray-400 capitalize">{ability}</span>
                            <span className="text-white">{config.amount}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Special Properties */}
                  {selectedCard.tokens && (
                    <div className="mb-4">
                      <h4 className="text-sm font-bold text-gray-300 mb-2">Special Properties</h4>
                      <div className="text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Tokens</span>
                          <span className="text-white">{selectedCard.tokens}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}