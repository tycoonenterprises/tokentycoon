import { createWalletClient, createPublicClient, http, parseAbi, defineChain } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Default Anvil private key (account #0)
const PRIVATE_KEY = process.env.PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

// Define Anvil chain configuration
const anvil = defineChain({
  id: 31337,
  name: 'Anvil',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['http://localhost:8545'] },
  },
});

// Get DeckRegistry address from command line or environment
const DECK_REGISTRY_ADDRESS = process.argv[2] || process.env.DECK_REGISTRY_ADDRESS;

if (!DECK_REGISTRY_ADDRESS) {
  console.error('Please provide DeckRegistry address as argument or set DECK_REGISTRY_ADDRESS env variable');
  console.error('Usage: node scripts/deployDecks.js <DECK_REGISTRY_ADDRESS>');
  process.exit(1);
}

// DeckRegistry ABI
const deckRegistryAbi = parseAbi([
  'function addDeck(string memory _name, string memory _description, string[] memory _cardNames, uint256[] memory _cardCounts) public returns (uint256)',
  'function markInitialized() external',
  'function getDeckCount() external view returns (uint256)',
  'function owner() external view returns (address)'
]);

async function deployDecks() {
  console.log('Setting up clients...');
  
  // Setup account
  const account = privateKeyToAccount(PRIVATE_KEY);
  
  // Setup clients
  const walletClient = createWalletClient({
    account,
    chain: anvil,
    transport: http('http://localhost:8545'),
  });
  
  const publicClient = createPublicClient({
    chain: anvil,
    transport: http('http://localhost:8545'),
  });
  
  console.log('Using account:', account.address);
  console.log('DeckRegistry address:', DECK_REGISTRY_ADDRESS);
  
  // Check owner
  const owner = await publicClient.readContract({
    address: DECK_REGISTRY_ADDRESS,
    abi: deckRegistryAbi,
    functionName: 'owner',
  });
  
  console.log('Contract owner:', owner);
  
  if (owner.toLowerCase() !== account.address.toLowerCase()) {
    console.error('Error: Current account is not the owner of DeckRegistry');
    process.exit(1);
  }
  
  // Load decks from JSON
  const decksPath = join(__dirname, '..', 'data', 'decks.json');
  const decksData = JSON.parse(readFileSync(decksPath, 'utf8'));
  
  console.log(`Loading ${decksData.decks.length} decks from decks.json...`);
  
  // Deploy each deck
  for (const deck of decksData.decks) {
    console.log(`\nAdding deck: ${deck.name}`);
    console.log(`  Description: ${deck.description}`);
    
    // Prepare card names and counts arrays
    const cardNames = [];
    const cardCounts = [];
    
    for (const card of deck.cards) {
      cardNames.push(card.name);
      cardCounts.push(BigInt(card.count));
    }
    
    console.log(`  Cards: ${deck.cards.map(c => `${c.count}x ${c.name}`).join(', ')}`);
    
    try {
      const hash = await walletClient.writeContract({
        address: DECK_REGISTRY_ADDRESS,
        abi: deckRegistryAbi,
        functionName: 'addDeck',
        args: [
          deck.name,
          deck.description,
          cardNames,
          cardCounts
        ],
      });
      
      console.log(`  Transaction hash: ${hash}`);
      
      // Wait for transaction
      await publicClient.waitForTransactionReceipt({ hash });
      console.log(`  ✓ Deck added successfully`);
    } catch (error) {
      console.error(`  ✗ Failed to add deck: ${error.message}`);
    }
  }
  
  // Mark as initialized
  console.log('\nMarking registry as initialized...');
  const initHash = await walletClient.writeContract({
    address: DECK_REGISTRY_ADDRESS,
    abi: deckRegistryAbi,
    functionName: 'markInitialized',
  });
  
  await publicClient.waitForTransactionReceipt({ hash: initHash });
  console.log('✓ Registry marked as initialized');
  
  // Get final deck count
  const deckCount = await publicClient.readContract({
    address: DECK_REGISTRY_ADDRESS,
    abi: deckRegistryAbi,
    functionName: 'getDeckCount',
  });
  
  console.log(`\n✅ Successfully deployed ${deckCount} decks!`);
}

// Run deployment
deployDecks().catch(error => {
  console.error('Deployment failed:', error);
  process.exit(1);
});