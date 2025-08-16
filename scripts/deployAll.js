import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Default Anvil private key (account #0)
const PRIVATE_KEY = process.env.PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

async function deployAll() {
  console.log('🚀 Starting full deployment...\n');
  
  // Step 1: Deploy contracts using Forge
  console.log('Step 1: Deploying contracts with Forge...');
  try {
    const output = execSync(
      `PRIVATE_KEY=${PRIVATE_KEY} forge script script/DeployAll.s.sol:DeployAll --rpc-url http://localhost:8545 --broadcast -vvv`,
      { encoding: 'utf-8', cwd: join(__dirname, '..') }
    );
    
    // Parse output to find deployed addresses
    const cardRegistryMatch = output.match(/CardRegistry deployed at:\s+(0x[a-fA-F0-9]{40})/);
    const deckRegistryMatch = output.match(/DeckRegistry deployed at:\s+(0x[a-fA-F0-9]{40})/);
    const gameEngineMatch = output.match(/GameEngine deployed at:\s+(0x[a-fA-F0-9]{40})/);
    
    if (!cardRegistryMatch || !deckRegistryMatch || !gameEngineMatch) {
      throw new Error('Could not find deployed contract addresses in output');
    }
    
    const cardRegistryAddress = cardRegistryMatch[1];
    const deckRegistryAddress = deckRegistryMatch[1];
    const gameEngineAddress = gameEngineMatch[1];
    
    console.log('✓ Contracts deployed successfully');
    console.log(`  CardRegistry: ${cardRegistryAddress}`);
    console.log(`  DeckRegistry: ${deckRegistryAddress}`);
    console.log(`  GameEngine: ${gameEngineAddress}`);
    
    // Step 2: Initialize cards
    console.log('\nStep 2: Initializing cards from JSON...');
    execSync(
      `node scripts/deployCards.js ${cardRegistryAddress}`,
      { stdio: 'inherit', cwd: join(__dirname, '..') }
    );
    
    // Step 3: Initialize decks
    console.log('\nStep 3: Initializing decks from JSON...');
    execSync(
      `node scripts/deployDecks.js ${deckRegistryAddress}`,
      { stdio: 'inherit', cwd: join(__dirname, '..') }
    );
    
    console.log('\n🎉 Full deployment complete!');
    console.log('\nContract Addresses:');
    console.log(`  CardRegistry: ${cardRegistryAddress}`);
    console.log(`  DeckRegistry: ${deckRegistryAddress}`);
    console.log(`  GameEngine: ${gameEngineAddress}`);
    
    // Save addresses to file for reference
    const addresses = {
      cardRegistry: cardRegistryAddress,
      deckRegistry: deckRegistryAddress,
      gameEngine: gameEngineAddress,
      deployedAt: new Date().toISOString()
    };
    
    const fs = await import('fs');
    fs.writeFileSync(
      join(__dirname, '..', 'deployed-addresses.json'),
      JSON.stringify(addresses, null, 2)
    );
    console.log('\nAddresses saved to deployed-addresses.json');
    
  } catch (error) {
    console.error('Deployment failed:', error.message);
    process.exit(1);
  }
}

// Run deployment
deployAll().catch(error => {
  console.error('Deployment failed:', error);
  process.exit(1);
});