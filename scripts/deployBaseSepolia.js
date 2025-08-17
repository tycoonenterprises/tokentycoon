import fs from 'fs';
import { exec as execCallback } from 'child_process';
import { promisify } from 'util';

const exec = promisify(execCallback);

async function deployToBaseSepolia() {
  console.log('🚀 Deploying to Base Sepolia...');
  
  // Check if PRIVATE_KEY is set
  if (!process.env.PRIVATE_KEY) {
    console.error('❌ Error: PRIVATE_KEY environment variable not set');
    console.log('Please set your private key: export PRIVATE_KEY="your-private-key-here"');
    process.exit(1);
  }
  
  try {
    // Build first to ensure everything compiles
    console.log('🔨 Building contracts...');
    await exec('forge build');
    
    // First, deploy CardRegistry
    console.log('📋 Deploying CardRegistry...');
    const cardRegistryCmd = `forge create --rpc-url base_sepolia --private-key ${process.env.PRIVATE_KEY} src/CardRegistry.sol:CardRegistry --json`;
    const cardRegistryResult = await exec(cardRegistryCmd);
    console.log('CardRegistry output:', cardRegistryResult.stdout);
    const cardRegistryAddress = extractContractAddress(cardRegistryResult.stdout);
    console.log(`✅ CardRegistry deployed at: ${cardRegistryAddress}`);
    
    // Deploy DeckRegistry
    console.log('📚 Deploying DeckRegistry...');
    const deckRegistryCmd = `forge create --rpc-url base_sepolia --private-key ${process.env.PRIVATE_KEY} src/DeckRegistry.sol:DeckRegistry --constructor-args ${cardRegistryAddress} --json`;
    const deckRegistryResult = await exec(deckRegistryCmd);
    console.log('DeckRegistry output:', deckRegistryResult.stdout);
    const deckRegistryAddress = extractContractAddress(deckRegistryResult.stdout);
    console.log(`✅ DeckRegistry deployed at: ${deckRegistryAddress}`);
    
    // Deploy GameEngine
    console.log('🎮 Deploying GameEngine...');
    const gameEngineCmd = `forge create --rpc-url base_sepolia --private-key ${process.env.PRIVATE_KEY} src/GameEngine.sol:GameEngine --constructor-args ${cardRegistryAddress} ${deckRegistryAddress} --json`;
    const gameEngineResult = await exec(gameEngineCmd);
    console.log('GameEngine output:', gameEngineResult.stdout);
    const gameEngineAddress = extractContractAddress(gameEngineResult.stdout);
    console.log(`✅ GameEngine deployed at: ${gameEngineAddress}`);
    
    // Save addresses to config file
    const config = {
      CARD_REGISTRY: cardRegistryAddress,
      DECK_REGISTRY: deckRegistryAddress,
      GAME_ENGINE: gameEngineAddress,
      CHAIN_ID: 84532, // Base Sepolia
      RPC_URL: 'https://sepolia.base.org'
    };
    
    fs.writeFileSync('base-sepolia-addresses.json', JSON.stringify(config, null, 2));
    console.log('💾 Contract addresses saved to base-sepolia-addresses.json');
    
    // Initialize cards and decks
    console.log('🎴 Initializing cards...');
    console.log('Note: You\'ll need to initialize cards separately with:');
    console.log(`PRIVATE_KEY=$PRIVATE_KEY CARD_REGISTRY_ADDRESS=${cardRegistryAddress} node scripts/deployCards.js`);
    
    console.log('🃏 Initializing decks...');
    console.log('Note: You\'ll need to initialize decks separately with:');
    console.log(`PRIVATE_KEY=$PRIVATE_KEY DECK_REGISTRY_ADDRESS=${deckRegistryAddress} node scripts/deployDecks.js`);
    
    console.log('🎉 Deployment complete!');
    console.log('\n📋 Summary:');
    console.log(`CardRegistry: ${cardRegistryAddress}`);
    console.log(`DeckRegistry: ${deckRegistryAddress}`);
    console.log(`GameEngine: ${gameEngineAddress}`);
    console.log('\n🔗 Update your frontend config with these addresses.');
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    if (error.stderr) {
      console.error('Error details:', error.stderr);
    }
    if (error.stdout) {
      console.error('Output:', error.stdout);
    }
    process.exit(1);
  }
}

function extractContractAddress(output) {
  // Try JSON format first
  try {
    const json = JSON.parse(output);
    if (json.deployedTo) {
      return json.deployedTo;
    }
  } catch (e) {
    // Not JSON, try regex
  }
  
  // Try standard output format
  const match = output.match(/Deployed to: (0x[a-fA-F0-9]{40})/);
  if (match) {
    return match[1];
  }
  
  // Try another common format
  const match2 = output.match(/Contract deployed at: (0x[a-fA-F0-9]{40})/);
  if (match2) {
    return match2[1];
  }
  
  // Try to find any hex address
  const match3 = output.match(/(0x[a-fA-F0-9]{40})/);
  if (match3) {
    return match3[1];
  }
  
  throw new Error('Could not extract contract address from output:\n' + output);
}

// Run deployment
deployToBaseSepolia().catch(console.error);

export { deployToBaseSepolia };