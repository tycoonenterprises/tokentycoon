#!/usr/bin/env node

import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { foundry } from 'viem/chains';

const DeckRegistryABI = [
  {
    "inputs": [{"internalType": "string", "name": "_name", "type": "string"}, {"internalType": "string", "name": "_description", "type": "string"}, {"internalType": "uint256[]", "name": "_cardIds", "type": "uint256[]"}],
    "name": "addDeck",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getDeckCount", 
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

const PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
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

  // Create simple deck with just a few cards (no duplicates to avoid potential issues)
  const deckCardIds = [0, 1, 2, 3, 4]; // Just use first 5 cards, one of each
  
  console.log('Adding simple starter deck...');
  
  try {
    const { request } = await publicClient.simulateContract({
      account,
      address: DECK_REGISTRY,
      abi: DeckRegistryABI,
      functionName: 'addDeck',
      args: ["Test Deck", "Simple test deck", deckCardIds]
    });
    
    const hash = await walletClient.writeContract(request);
    console.log('✅ Deck added! Transaction:', hash);
    
    // Check final count
    const count = await publicClient.readContract({
      address: DECK_REGISTRY,
      abi: DeckRegistryABI,
      functionName: 'getDeckCount'
    });
    
    console.log(`Total decks: ${count}`);
  } catch (error) {
    console.error('❌ Failed to add deck:', error.message);
    
    // Try even simpler - just one card
    console.log('Trying with single card...');
    try {
      const { request } = await publicClient.simulateContract({
        account,
        address: DECK_REGISTRY,
        abi: DeckRegistryABI,
        functionName: 'addDeck',
        args: ["Single Card", "Minimal deck", [0]]
      });
      
      const hash = await walletClient.writeContract(request);
      console.log('✅ Single card deck added!', hash);
    } catch (err) {
      console.error('❌ Even single card failed:', err.message);
    }
  }
}

main().catch(console.error);