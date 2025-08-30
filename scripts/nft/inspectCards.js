import fs from 'fs';
import { ethers } from 'ethers';

// Load deployed contracts
const deployedContracts = JSON.parse(fs.readFileSync('./data/nft/deployed-contracts.json', 'utf8'));

// Contract ABI
const CARDS_ABI = [
    "function getCardMetadata(uint256 cardId) external view returns (tuple(string name, string description, uint256 cost, uint8 cardType, address svgPointer, address jsonPointer, bytes32 contentHash, uint256 maxSupply, uint256 totalMinted, bool tradeable, bool finalized))",
    "function getCardAbilities(uint256 cardId) external view returns (tuple(string abilityType, uint256 amount)[])",
    "function uri(uint256 tokenId) external view returns (string)"
];

const cardTypeNames = ['Chain', 'DeFi', 'EOA', 'Action'];

// Helper to wait for user input
const waitForInput = () => {
    return new Promise((resolve) => {
        process.stdin.resume();
        process.stdin.setEncoding('utf8');
        console.log('\nPress Enter to continue, or type "q" to quit...');
        process.stdin.once('data', (data) => {
            if (data.trim().toLowerCase() === 'q') {
                process.exit(0);
            }
            resolve();
        });
    });
};

async function inspectCard(cardsContract, cardId, pause = true) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`🔍 INSPECTING CARD ${cardId}`);
    console.log(`${'='.repeat(50)}`);
    
    try {
        // Get metadata
        console.log("📋 Fetching metadata...");
        const metadata = await cardsContract.getCardMetadata(cardId);
        const [name, description, cost, cardType, svgPointer, jsonPointer, contentHash, maxSupply, totalMinted, tradeable, finalized] = metadata;
        
        // Display metadata
        console.log(`\n📊 METADATA:`);
        console.log(`   Name: "${name}"`);
        console.log(`   Description: "${description}"`);
        console.log(`   Cost: ${cost}`);
        console.log(`   Type: ${cardType} (${cardTypeNames[cardType] || 'Unknown'})`);
        console.log(`   SVG Pointer: ${svgPointer}`);
        console.log(`   JSON Pointer: ${jsonPointer}`);
        console.log(`   Content Hash: ${contentHash}`);
        console.log(`   Max Supply: ${maxSupply === 0n ? 'Unlimited' : maxSupply.toString()}`);
        console.log(`   Total Minted: ${totalMinted}`);
        console.log(`   Tradeable: ${tradeable}`);
        console.log(`   Finalized: ${finalized ? '🔒 YES' : '🔓 NO'}`);
        
        // Check if card has any data
        const hasData = name !== '' || description !== '' || cost > 0;
        console.log(`\n📈 STATUS: ${hasData ? '✅ HAS DATA' : '❌ EMPTY'}`);
        
        // Get abilities
        try {
            console.log("\n🎯 Fetching abilities...");
            const abilities = await cardsContract.getCardAbilities(cardId);
            if (abilities.length > 0) {
                console.log(`   Abilities (${abilities.length}):`);
                abilities.forEach((ability, i) => {
                    console.log(`   ${i + 1}. ${ability.abilityType}: ${ability.amount}`);
                });
            } else {
                console.log(`   No abilities found`);
            }
        } catch (error) {
            console.log(`   ❌ Failed to get abilities: ${error.message}`);
        }
        
        // Try to get URI
        try {
            console.log("\n🎨 Testing URI function...");
            const uri = await cardsContract.uri(cardId);
            if (uri && uri.length > 0) {
                console.log(`   ✅ URI available (${uri.length} chars)`);
                if (uri.startsWith('data:')) {
                    console.log(`   🎨 Contains data URI`);
                } else {
                    console.log(`   📄 URI: ${uri.substring(0, 100)}...`);
                }
            } else {
                console.log(`   ❌ Empty URI`);
            }
        } catch (error) {
            console.log(`   ❌ URI failed: ${error.message.split(':')[0]}`);
        }
        
        // Check pointer validity
        const svgPointerValid = svgPointer !== '0x0000000000000000000000000000000000000000';
        const jsonPointerValid = jsonPointer !== '0x0000000000000000000000000000000000000000';
        
        console.log(`\n🔗 POINTERS:`);
        console.log(`   SVG Pointer: ${svgPointerValid ? '✅ Set' : '❌ Null'}`);
        console.log(`   JSON Pointer: ${jsonPointerValid ? '✅ Set' : '❌ Null'}`);
        
    } catch (error) {
        console.log(`❌ FAILED TO INSPECT CARD ${cardId}:`);
        console.log(`   Error: ${error.message}`);
    }
    
    if (pause) {
        await waitForInput();
    }
}

async function main() {
    const args = process.argv.slice(2);
    const startCard = parseInt(args[0]) || 1;
    const endCard = parseInt(args[1]) || 10;
    const noPause = args.includes('--no-pause') || args.includes('-n');
    
    console.log(`🔍 Card Inspector`);
    console.log(`📊 Inspecting cards ${startCard} to ${endCard}`);
    console.log(`⏯️  Pause mode: ${noPause ? 'OFF' : 'ON'}`);
    console.log(`\nContract: ${deployedContracts.TokenTycoonCards}`);
    
    // Setup provider
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
    const cardsContract = new ethers.Contract(
        deployedContracts.TokenTycoonCards,
        CARDS_ABI,
        provider
    );
    
    let validCards = 0;
    let emptyCards = 0;
    let errorCards = 0;
    
    console.log(`\nStarting inspection...`);
    
    for (let cardId = startCard; cardId <= endCard; cardId++) {
        try {
            const metadata = await cardsContract.getCardMetadata(cardId);
            const [name] = metadata;
            
            if (name && name !== '') {
                validCards++;
                console.log(`\n[${cardId}] ✅ "${name}"`);
            } else {
                emptyCards++;
                console.log(`\n[${cardId}] ❌ Empty`);
            }
            
            // Only do detailed inspection if requested or if there's an issue
            if (!noPause || name === '') {
                await inspectCard(cardsContract, cardId, !noPause);
            }
            
        } catch (error) {
            errorCards++;
            console.log(`\n[${cardId}] 💥 Error: ${error.message.split(':')[0]}`);
            if (!noPause) {
                await inspectCard(cardsContract, cardId, true);
            }
        }
    }
    
    console.log(`\n${'='.repeat(50)}`);
    console.log(`📊 SUMMARY (Cards ${startCard}-${endCard}):`);
    console.log(`   ✅ Valid cards: ${validCards}`);
    console.log(`   ❌ Empty cards: ${emptyCards}`);
    console.log(`   💥 Error cards: ${errorCards}`);
    console.log(`   📈 Total inspected: ${endCard - startCard + 1}`);
    console.log(`${'='.repeat(50)}`);
}

console.log(`
🔍 Card Inspector Tool

Usage:
  node scripts/nft/inspectCards.js [start] [end] [--no-pause]

Examples:
  node scripts/nft/inspectCards.js           # Inspect cards 1-10 with pause
  node scripts/nft/inspectCards.js 1 20     # Inspect cards 1-20 with pause  
  node scripts/nft/inspectCards.js 1 91 -n  # Inspect all cards without pause
  node scripts/nft/inspectCards.js 3 5      # Just cards 3-5 with pause
`);

main().catch(error => {
    console.error("Script failed:", error);
    process.exit(1);
});