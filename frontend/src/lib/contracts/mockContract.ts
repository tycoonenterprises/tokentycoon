// Mock contract data for local development
// This simulates what would come from deployed smart contracts

export interface ContractCard {
  tokenId: number
  name: string
  cardType: string
  cost: number
  power: number
  toughness: number
  text: string
  owner: string
}

// Mock contract state
let mockTokenIdCounter = 1
let mockCards: ContractCard[] = []
let mockBalances: Record<string, number> = {}

export const mockContract = {
  // ERC721 functions
  balanceOf: async (owner: string): Promise<number> => {
    return mockBalances[owner] || 0
  },

  ownerOf: async (tokenId: number): Promise<string> => {
    const card = mockCards.find(c => c.tokenId === tokenId)
    return card?.owner || '0x0000000000000000000000000000000000000000'
  },

  totalSupply: async (): Promise<number> => {
    return mockCards.length
  },

  // Card-specific functions
  getCard: async (tokenId: number): Promise<ContractCard | null> => {
    return mockCards.find(c => c.tokenId === tokenId) || null
  },

  mintStarterPack: async (to: string): Promise<number[]> => {
    const starterCards = [
      {
        name: 'Mining Rig',
        cardType: 'unit',
        cost: 2,
        power: 2,
        toughness: 1,
        text: 'Generate 1 gas per turn'
      },
      {
        name: 'Smart Contract',
        cardType: 'spell',
        cost: 1,
        power: 0,
        toughness: 0,
        text: 'Draw a card'
      },
      {
        name: 'Validator Node',
        cardType: 'unit',
        cost: 3,
        power: 3,
        toughness: 3,
        text: 'Cannot be blocked'
      },
      {
        name: 'Gas Station',
        cardType: 'resource',
        cost: 1,
        power: 0,
        toughness: 0,
        text: 'Add 2 gas to your pool'
      },
      {
        name: 'Firewall',
        cardType: 'upgrade',
        cost: 2,
        power: 0,
        toughness: 0,
        text: 'Prevent 1 damage to all your units'
      }
    ]

    const newTokenIds: number[] = []

    for (const cardData of starterCards) {
      const tokenId = mockTokenIdCounter++
      const newCard: ContractCard = {
        tokenId,
        owner: to,
        ...cardData
      }
      
      mockCards.push(newCard)
      newTokenIds.push(tokenId)
    }

    // Update balance
    mockBalances[to] = (mockBalances[to] || 0) + starterCards.length

    return newTokenIds
  },

  transferFrom: async (from: string, to: string, tokenId: number): Promise<boolean> => {
    const cardIndex = mockCards.findIndex(c => c.tokenId === tokenId && c.owner === from)
    if (cardIndex === -1) return false

    mockCards[cardIndex].owner = to
    mockBalances[from] = Math.max(0, (mockBalances[from] || 0) - 1)
    mockBalances[to] = (mockBalances[to] || 0) + 1

    return true
  },

  // Utility functions for testing
  getAllCardsForOwner: async (owner: string): Promise<ContractCard[]> => {
    return mockCards.filter(c => c.owner === owner)
  },

  reset: () => {
    mockTokenIdCounter = 1
    mockCards = []
    mockBalances = {}
  }
}

// Export for debugging
export const getMockContractState = () => ({
  cards: mockCards,
  balances: mockBalances,
  nextTokenId: mockTokenIdCounter
})