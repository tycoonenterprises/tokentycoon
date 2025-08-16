import React, { useState, useEffect } from 'react';
import { X, Search, Filter } from 'lucide-react';
import { CardImage } from '@/components/ui/CardImage';

interface CardsPageProps {
  onClose: () => void;
}

type CardType = 'Chain' | 'DeFi' | 'EOA' | 'Action';

export const CardsPage: React.FC<CardsPageProps> = ({ onClose }) => {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<CardType | 'All'>('All');
  const [selectedCard, setSelectedCard] = useState<any>(null);

  useEffect(() => {
    // Just use mock data for now to avoid contract issues
    setLoading(true);
    // Simulate loading delay
    setTimeout(() => {
      setCards(getMockCards());
      setLoading(false);
    }, 500);
  }, []);

  const getMockCards = () => {
    // Mock data matching the card files we found
    const cardNames = [
      '51 Percent Attack', 'Aave', 'Altcoin Validator', 'Ape FOMO', 'Arbitrum',
      'Attend a Conference', 'Auditor', 'Base', 'Bridge Exploit', 'Bug Bounty',
      'Cold Storage', 'Crypto Whale', 'Curve', 'DAO Hack', 'DeFi Llama Research',
      'Diamond DAO', 'Diamond Hands', 'Dune Research', 'Dust Attack', 'EIP 1559 Burn',
      'Ethena', 'Exit Scam', 'Flash Loan', 'Flashbots', 'Flow', 'Force Sell',
      'Fork', 'Front Run Bot', 'Gas Fee Spike', 'Gas War', 'Gasless Transaction',
      'Governance Vote', 'Hard Fork', 'Insurance', 'Invalid Op Code', 'Jito',
      'Jupiter', 'Lido', 'Liquidation Cascade', 'Liquidity Mining', 'Lost Keys',
      'MEV Extractor', 'Morpho', 'Multi Sig Wallet', 'NFT Rugpull', 'Oracles',
      'Pendle', 'Polygon', 'Ponzinomics', 'Proof of Stake', 'Proof of Work',
      'Pump and Dump', 'Ragequit', 'Re-entrant Attack', 'Read a Whitepaper',
      'Rocketpool Validator', 'Rollup Wars', 'Sandwich Attack', 'Secret Key Leak',
      'Sequencer Outage', 'Sharding', 'Slashing', 'Soft Fork', 'Testnet',
      'Time Bomb Stablecoin', 'Uniswap', 'Validator Cluster', 'Validator Node',
      'Vitalik Tweet', 'Wallet', 'Wormhole', 'Yield Aggregator'
    ];

    return cardNames.map((name, index) => ({
      id: index + 1,
      name,
      description: `${name} card description`,
      cost: Math.floor(Math.random() * 5) + 1,
      cardType: ['Chain', 'DeFi', 'EOA', 'Action'][Math.floor(Math.random() * 4)] as CardType,
      abilities: [],
      imagePath: `/cards/${name.toLowerCase().replace(/\s+/g, '-')}.svg`
    }));
  };

  const cardTypeToEnum = (type: string): number => {
    switch (type) {
      case 'Chain': return 0;
      case 'DeFi': return 1;
      case 'EOA': return 2;
      case 'Action': return 3;
      default: return 0;
    }
  };

  const enumToCardType = (enumValue: number): CardType => {
    switch (enumValue) {
      case 0: return 'Chain';
      case 1: return 'DeFi';
      case 2: return 'EOA';
      case 3: return 'Action';
      default: return 'Chain';
    }
  };

  const filteredCards = cards.filter(card => {
    const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          card.description.toLowerCase().includes(searchTerm.toLowerCase());
    const cardType = typeof card.cardType === 'number' ? enumToCardType(card.cardType) : card.cardType;
    const matchesType = selectedType === 'All' || cardType === selectedType;
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type: CardType) => {
    switch (type) {
      case 'Chain': return 'bg-blue-600';
      case 'DeFi': return 'bg-purple-600';
      case 'EOA': return 'bg-green-600';
      case 'Action': return 'bg-orange-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <div className="w-full max-w-7xl h-[90vh] bg-gray-900 rounded-lg flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">All Cards</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search cards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex gap-2">
              {(['All', 'Chain', 'DeFi', 'EOA', 'Action'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedType === type
                      ? type === 'All' 
                        ? 'bg-cyan-600 text-white'
                        : `${getTypeColor(type as CardType)} text-white`
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-2 text-sm text-gray-400">
            Showing {filteredCards.length} of {cards.length} cards
          </div>
        </div>

        {/* Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-white">Loading cards from contract...</div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredCards.map(card => {
                const cardType = typeof card.cardType === 'number' ? enumToCardType(card.cardType) : card.cardType;
                return (
                  <div
                    key={card.id}
                    className="cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => setSelectedCard(card)}
                  >
                    <div className="bg-gray-800 rounded-lg p-2 border border-gray-700 hover:border-cyan-500">
                      {/* Card Image */}
                      <div className="aspect-[3/4] bg-gray-900 rounded mb-2 overflow-hidden">
                        <CardImage 
                          card={card} 
                          className="w-full h-full"
                          fallbackIcon="🃏"
                        />
                      </div>
                      
                      {/* Card Info */}
                      <div className="text-xs">
                        <div className="font-semibold text-white mb-1 truncate">{card.name}</div>
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 rounded text-white ${getTypeColor(cardType)}`}>
                            {cardType}
                          </span>
                          <span className="text-cyan-400">⚡ {card.cost}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Card Detail Modal */}
      {selectedCard && (
        <div 
          className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setSelectedCard(null)}
        >
          <div 
            className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex gap-6">
              {/* Card Image */}
              <div className="w-64 flex-shrink-0">
                <div className="aspect-[3/4] bg-gray-800 rounded-lg overflow-hidden">
                  <CardImage 
                    card={selectedCard} 
                    className="w-full h-full"
                    fallbackIcon="🃏"
                  />
                </div>
              </div>

              {/* Card Details */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">{selectedCard.name}</h3>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded text-white ${
                        getTypeColor(typeof selectedCard.cardType === 'number' ? enumToCardType(selectedCard.cardType) : selectedCard.cardType)
                      }`}>
                        {typeof selectedCard.cardType === 'number' ? enumToCardType(selectedCard.cardType) : selectedCard.cardType}
                      </span>
                      <span className="text-cyan-400 font-semibold">Cost: {selectedCard.cost} ETH</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCard(null)}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <div className="text-gray-300 mb-4">
                  {selectedCard.description}
                </div>

                {/* Abilities */}
                {selectedCard.abilities && selectedCard.abilities.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Abilities</h4>
                    <div className="space-y-2">
                      {selectedCard.abilities.map((ability: any, index: number) => (
                        <div key={index} className="bg-gray-800 rounded p-3">
                          <div className="font-medium text-cyan-400 mb-1">{ability.name}</div>
                          <div className="text-sm text-gray-400">
                            {ability.keys && ability.values && ability.keys.map((key: string, i: number) => (
                              <div key={i}>
                                <span className="text-gray-500">{key}:</span> {ability.values[i]}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 text-xs text-gray-500">
                  Card ID: #{selectedCard.id}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};