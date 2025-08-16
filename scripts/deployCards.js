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

// Get CardRegistry address from command line or environment
const CARD_REGISTRY_ADDRESS = process.argv[2] || process.env.CARD_REGISTRY_ADDRESS;

if (!CARD_REGISTRY_ADDRESS) {
  console.error('Please provide CardRegistry address as argument or set CARD_REGISTRY_ADDRESS env variable');
  console.error('Usage: node scripts/deployCards.js <CARD_REGISTRY_ADDRESS>');
  process.exit(1);
}

// CardRegistry ABI
const cardRegistryAbi = parseAbi([
  'function addCard(string memory _name, string memory _description, uint256 _cost, uint8 _cardType, string[] memory _abilityNames, string[][] memory _abilityKeys, string[][] memory _abilityValues) public returns (uint256)',
  'function addCardSimple(string memory _name, string memory _description, uint256 _cost, uint8 _cardType) external returns (uint256)',
  'function markInitialized() external',
  'function getCardCount() external view returns (uint256)',
  'function owner() external view returns (address)'
]);

// Card types enum - updated to match contract
const CardTypes = {
  'Chain': 0,
  'DeFi': 1,
  'EOA': 2,
  'Action': 3
};

async function deployCards() {
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
  console.log('CardRegistry address:', CARD_REGISTRY_ADDRESS);
  
  // Check owner
  const owner = await publicClient.readContract({
    address: CARD_REGISTRY_ADDRESS,
    abi: cardRegistryAbi,
    functionName: 'owner',
  });
  
  console.log('Contract owner:', owner);
  
  if (owner.toLowerCase() !== account.address.toLowerCase()) {
    console.error('Error: Current account is not the owner of CardRegistry');
    process.exit(1);
  }
  
  // Load cards from JSON
  const cardsPath = join(__dirname, '..', 'data', 'cards.json');
  const cardsData = JSON.parse(readFileSync(cardsPath, 'utf8'));
  
  console.log(`Loading ${cardsData.cards.length} cards from cards.json...`);
  
  // Deploy each card
  for (const card of cardsData.cards) {
    console.log(`\nAdding card: ${card.name}`);
    
    // Prepare abilities data
    const abilityNames = [];
    const abilityKeys = [];
    const abilityValues = [];
    
    // Handle abilities as an object with nested ability objects
    if (card.abilities && typeof card.abilities === 'object') {
      for (const [abilityName, abilityData] of Object.entries(card.abilities)) {
        abilityNames.push(abilityName);
        
        const keys = [];
        const values = [];
        
        // Each ability is an object with properties
        if (abilityData && typeof abilityData === 'object') {
          for (const [key, value] of Object.entries(abilityData)) {
            keys.push(key);
            values.push(String(value));
          }
        }
        
        abilityKeys.push(keys);
        abilityValues.push(values);
      }
    }
    
    // Validate card type
    if (!CardTypes.hasOwnProperty(card.cardType)) {
      console.error(`  ✗ Invalid card type: ${card.cardType}`);
      console.error(`    Valid types are: ${Object.keys(CardTypes).join(', ')}`);
      continue;
    }
    
    try {
      // If card has abilities, use addCard; otherwise use addCardSimple
      if (abilityNames.length > 0) {
        const hash = await walletClient.writeContract({
          address: CARD_REGISTRY_ADDRESS,
          abi: cardRegistryAbi,
          functionName: 'addCard',
          args: [
            card.name,
            card.description,
            BigInt(card.cost),
            CardTypes[card.cardType],
            abilityNames,
            abilityKeys,
            abilityValues
          ],
        });
        
        console.log(`  Transaction hash: ${hash}`);
        
        // Wait for transaction
        await publicClient.waitForTransactionReceipt({ hash });
        console.log(`  ✓ Card added successfully`);
        console.log(`    Type: ${card.cardType}`);
        console.log(`    Abilities: ${abilityNames.join(', ')}`);
      } else {
        const hash = await walletClient.writeContract({
          address: CARD_REGISTRY_ADDRESS,
          abi: cardRegistryAbi,
          functionName: 'addCardSimple',
          args: [
            card.name,
            card.description,
            BigInt(card.cost),
            CardTypes[card.cardType]
          ],
        });
        
        console.log(`  Transaction hash: ${hash}`);
        
        // Wait for transaction
        await publicClient.waitForTransactionReceipt({ hash });
        console.log(`  ✓ Card added successfully (no abilities)`);
        console.log(`    Type: ${card.cardType}`);
      }
    } catch (error) {
      console.error(`  ✗ Failed to add card: ${error.message}`);
    }
  }
  
  // Mark as initialized
  console.log('\nMarking registry as initialized...');
  const initHash = await walletClient.writeContract({
    address: CARD_REGISTRY_ADDRESS,
    abi: cardRegistryAbi,
    functionName: 'markInitialized',
  });
  
  await publicClient.waitForTransactionReceipt({ hash: initHash });
  console.log('✓ Registry marked as initialized');
  
  // Get final card count
  const cardCount = await publicClient.readContract({
    address: CARD_REGISTRY_ADDRESS,
    abi: cardRegistryAbi,
    functionName: 'getCardCount',
  });
  
  console.log(`\n✅ Successfully deployed ${cardCount} cards!`);
}

// Run deployment
deployCards().catch(error => {
  console.error('Deployment failed:', error);
  process.exit(1);
});