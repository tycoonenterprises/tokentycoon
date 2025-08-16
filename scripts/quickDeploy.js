#!/usr/bin/env node

import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { foundry } from 'viem/chains';

// ABIs (simplified)
const CardRegistryABI = [
  {
    "inputs": [{"internalType": "string", "name": "_name", "type": "string"}, {"internalType": "string", "name": "_description", "type": "string"}, {"internalType": "uint256", "name": "_cost", "type": "uint256"}, {"internalType": "enum CardRegistry.CardType", "name": "_cardType", "type": "uint8"}],
    "name": "addCard",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCardCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

const DeckRegistryABI = [
  {
    "inputs": [{"internalType": "string", "name": "_name", "type": "string"}, {"internalType": "string", "name": "_description", "type": "string"}, {"internalType": "uint256[]", "name": "_cardIds", "type": "uint256[]"}],
    "name": "addDeck",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const CARD_REGISTRY = '0x20d7B364E8Ed1F4260b5B90C41c2deC3C1F6D367';
const DECK_REGISTRY = '0xf5C3953Ae4639806fcbCC3196f71dd81B0da4348';

async function main() {
  const account = privateKeyToAccount(PRIVATE_KEY);
  
  const publicClient = createPublicClient({
    chain: foundry,
    transport: http('http://localhost:8545')
  });
  
  const walletClient = createWalletClient({
    account,
    chain: foundry,
    transport: http('http://localhost:8545')
  });

  console.log('🔍 Checking current state...');
  
  // Check how many cards exist
  const cardCount = await publicClient.readContract({
    address: CARD_REGISTRY,
    abi: CardRegistryABI,
    functionName: 'getCardCount'
  });
  
  console.log(`Found ${cardCount} cards in registry`);
  
  if (cardCount < 4) {
    console.log('📦 Adding basic test cards...');
    
    // Add 4 basic cards
    const basicCards = [
      { name: "Ethereum", description: "The original smart contract platform", cost: 1, type: 0 }, // Chain
      { name: "Uniswap", description: "Decentralized exchange", cost: 2, type: 1 }, // DeFi  
      { name: "Vitalik", description: "Ethereum founder", cost: 3, type: 2 }, // EOA
      { name: "Gas Spike", description: "Network congestion", cost: 1, type: 3 }  // Action
    ];
    
    for (let i = 0; i < basicCards.length; i++) {
      const card = basicCards[i];
      console.log(`Adding card ${i+1}/4: ${card.name}`);
      
      const { request } = await publicClient.simulateContract({
        account,
        address: CARD_REGISTRY,
        abi: CardRegistryABI,
        functionName: 'addCard',
        args: [card.name, card.description, card.cost, card.type]
      });
      
      await walletClient.writeContract(request);
    }
  }
  
  console.log('📚 Adding basic test deck...');
  
  // Create a simple deck with first 4 cards (IDs 0, 1, 2, 3)
  const deckCardIds = [0, 0, 0, 1, 1, 1, 2, 2, 3, 3]; // 10 card deck
  
  const { request } = await publicClient.simulateContract({
    account,
    address: DECK_REGISTRY,
    abi: DeckRegistryABI,
    functionName: 'addDeck',
    args: ["Starter Deck", "Basic deck for testing", deckCardIds]
  });
  
  await walletClient.writeContract(request);
  
  console.log('✅ Quick deployment complete!');
  console.log('  - Cards: ' + (cardCount + 4));
  console.log('  - Decks: 1');
}

main().catch(console.error);