import { createWalletClient, createPublicClient, http, parseAbi, defineChain } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Default Anvil private key (account #0)
const PRIVATE_KEY = process.env.PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

// Define chain configuration based on environment
const baseSepolia = defineChain({
  id: 84532,
  name: 'Base Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['https://sepolia.base.org'] },
    public: { http: ['https://sepolia.base.org'] },
  },
});

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

// Determine which chain to use
const isBaseSepolia = process.env.NETWORK === 'base_sepolia';
console.log("Using chain:", isBaseSepolia ? "Base Sepolia" : "Anvil");
const chain = isBaseSepolia ? baseSepolia : anvil;

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
  const startTime = Date.now();
  console.log('🎴 Starting deck deployment...\n');
  console.log('Setting up clients...');
  
  // Setup account
  const account = privateKeyToAccount(PRIVATE_KEY);
  
  // Setup clients
  const walletClient = createWalletClient({
    account,
    chain: chain,
    transport: http(chain.rpcUrls.default.http[0]),
  });
  
  const publicClient = createPublicClient({
    chain: chain,
    transport: http(chain.rpcUrls.default.http[0]),
  });
  
  console.log('Using account:', account.address);
  console.log('DeckRegistry address:', DECK_REGISTRY_ADDRESS);
  
  // Skip owner check for Base Sepolia - contract might not be initialized yet
  if (!isBaseSepolia) {
    try {
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
    } catch (error) {
      console.log('Warning: Could not verify owner (might be expected for new deployment)');
    }
  } else {
    console.log('Skipping owner check for Base Sepolia deployment');
  }
  
  // Load decks from JSON
  const decksPath = join(__dirname, '..', 'data', 'decks.json');
  const decksData = JSON.parse(readFileSync(decksPath, 'utf8'));
  
  const totalDecks = decksData.decks.length;
  console.log(`\n📦 Loading ${totalDecks} decks from decks.json...\n`);
  
  // Function to update progress bar
  function updateProgress(current, total, message) {
    const percentage = Math.round((current / total) * 100);
    const barLength = 30;
    const filledLength = Math.round((current / total) * barLength);
    const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
    
    // Clear current line and write progress
    process.stdout.write(`\r[${bar}] ${percentage}% (${current}/${total}) - ${message}`);
  }
  
  console.log('⚡ Sending all deck transactions rapidly...\n');
  
  const transactions = [];
  const failedDecks = [];
  
  // Send all transactions without waiting
  for (let i = 0; i < decksData.decks.length; i++) {
    const deck = decksData.decks[i];
    updateProgress(i + 1, totalDecks, `Sending: ${deck.name}`);
    
    // Prepare card names and counts arrays
    const cardNames = [];
    const cardCounts = [];
    
    for (const card of deck.cards) {
      cardNames.push(card.name);
      cardCounts.push(BigInt(card.count));
    }
    
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
      
      transactions.push({ hash, deck: deck.name });
      
    } catch (error) {
      console.error(`\n❌ Failed to send tx for ${deck.name}: ${error.message?.substring(0, 100)}`);
      failedDecks.push(`${deck.name}`);
    }
  }
  
  // Complete progress bar
  updateProgress(totalDecks, totalDecks, 'All transactions sent!');
  
  console.log(`\n⏳ Waiting for ${transactions.length} transactions to be confirmed...\n`);
  
  // Now wait for all transactions to be confirmed
  let confirmedCount = 0;
  const confirmationPromises = transactions.map(async (tx) => {
    try {
      await publicClient.waitForTransactionReceipt({ hash: tx.hash });
      confirmedCount++;
      updateProgress(confirmedCount, transactions.length, `Confirmed: ${tx.deck}`);
      return true;
    } catch (error) {
      console.error(`\n❌ Failed to confirm ${tx.deck}: ${error.message?.substring(0, 100)}`);
      failedDecks.push(`${tx.deck} (confirmation failed)`);
      return false;
    }
  });
  
  const confirmationResults = await Promise.all(confirmationPromises);
  const successCount = confirmationResults.filter(r => r).length;
  console.log('\n');
  
  // Show results
  if (failedDecks.length > 0) {
    console.log(`\n⚠️  Failed to add ${failedDecks.length} decks:`);
    failedDecks.forEach(deck => console.log(`   - ${deck}`));
  }
  
  // Mark as initialized
  process.stdout.write('\n📝 Marking registry as initialized...');
  const initHash = await walletClient.writeContract({
    address: DECK_REGISTRY_ADDRESS,
    abi: deckRegistryAbi,
    functionName: 'markInitialized',
  });
  
  await publicClient.waitForTransactionReceipt({ hash: initHash });
  console.log(' ✓');
  
  // Get final deck count
  const deckCount = await publicClient.readContract({
    address: DECK_REGISTRY_ADDRESS,
    abi: deckRegistryAbi,
    functionName: 'getDeckCount',
  });
  
  const endTime = Date.now();
  const totalTime = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log(`\n✅ Successfully deployed ${successCount}/${totalDecks} decks in ${totalTime} seconds!`);
  console.log(`   Total decks in registry: ${deckCount}`);
  console.log(`   Average time per deck: ${(totalTime / successCount).toFixed(2)}s`);
}

// Run deployment
deployDecks().catch(error => {
  console.error('Deployment failed:', error);
  process.exit(1);
});