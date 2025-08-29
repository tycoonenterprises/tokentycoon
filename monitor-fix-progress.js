import fs from 'fs';
import { ethers } from 'ethers';

// Load deployed contracts
const deployedContracts = JSON.parse(fs.readFileSync('./data/nft/deployed-contracts.json', 'utf8'));

// Contract ABI
const CARDS_ABI = [
    "function getCardMetadata(uint256 cardId) external view returns (tuple(string name, string description, uint256 cost, uint8 cardType, address svgPointer, address jsonPointer, bytes32 contentHash, uint256 maxSupply, uint256 totalMinted, bool tradeable, bool finalized))"
];

async function monitorProgress() {
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
    const contract = new ethers.Contract(deployedContracts.TokenTycoonCards, CARDS_ABI, provider);
    
    console.log(`🔍 Monitoring SSTORE2 Fix Progress`);
    console.log(`📍 Contract: ${deployedContracts.TokenTycoonCards}`);
    console.log(`⏰ ${new Date().toLocaleTimeString()}\n`);
    
    let fixedCount = 0;
    let emptyCount = 0;
    let errorCount = 0;
    
    // Sample a few key cards to check progress
    const sampleCards = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 91];
    
    for (const cardId of sampleCards) {
        try {
            const metadata = await contract.getCardMetadata(cardId);
            
            // Check SVG pointer
            if (metadata.svgPointer !== "0x0000000000000000000000000000000000000000") {
                const svgBytecode = await provider.getCode(metadata.svgPointer);
                
                if (svgBytecode.length > 2) {
                    console.log(`  Card ${cardId}: ✅ "${metadata.name}" - SVG data found (${svgBytecode.length} chars)`);
                    fixedCount++;
                } else {
                    console.log(`  Card ${cardId}: ⏳ "${metadata.name}" - Still empty`);
                    emptyCount++;
                }
            } else {
                console.log(`  Card ${cardId}: ❌ "${metadata.name}" - Zero address pointer`);
                errorCount++;
            }
            
        } catch (error) {
            console.log(`  Card ${cardId}: ❌ Error - ${error.message}`);
            errorCount++;
        }
    }
    
    console.log(`\n📊 Sample Status (${sampleCards.length} cards checked):`);
    console.log(`   ✅ Fixed: ${fixedCount}`);
    console.log(`   ⏳ Empty: ${emptyCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📈 Fix rate: ${Math.round((fixedCount / sampleCards.length) * 100)}%`);
}

// Run monitoring
monitorProgress().catch(console.error);