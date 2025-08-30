import fs from 'fs';
import { ethers } from 'ethers';

// Load deployed contracts
const deployedContracts = JSON.parse(fs.readFileSync('./data/nft/deployed-contracts.json', 'utf8'));

// Contract ABI
const CARDS_ABI = [
    "function getCardMetadata(uint256 cardId) external view returns (tuple(string name, string description, uint256 cost, uint8 cardType, address svgPointer, address jsonPointer, bytes32 contentHash, uint256 maxSupply, uint256 totalMinted, bool tradeable, bool finalized))",
    "function finalizeMetadata(uint256 cardId) external"
];

async function main() {
    console.log("🔍 Check Finalization Status");
    console.log("============================");
    
    // Parse arguments
    const args = process.argv.slice(2);
    const action = args[0]; // 'check' or 'finalize'
    const startCard = parseInt(args[1]) || 1;
    const endCard = parseInt(args[2]) || 91;
    
    // Setup provider
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
    
    // Setup wallet if finalizing
    let wallet = null;
    let contract = null;
    
    if (action === 'finalize') {
        const privateKey = process.env.PRIVATE_KEY;
        if (!privateKey) {
            console.error("❌ PRIVATE_KEY required for finalization");
            process.exit(1);
        }
        wallet = new ethers.Wallet(privateKey, provider);
        contract = new ethers.Contract(deployedContracts.TokenTycoonCards, CARDS_ABI, wallet);
        console.log(`👤 Wallet: ${wallet.address}`);
    } else {
        contract = new ethers.Contract(deployedContracts.TokenTycoonCards, CARDS_ABI, provider);
    }
    
    console.log(`📍 Contract: ${deployedContracts.TokenTycoonCards}`);
    console.log(`📋 Checking cards ${startCard} to ${endCard}\n`);
    
    const unfinalizedCards = [];
    const finalizedCards = [];
    const emptyCards = [];
    
    // Check each card
    for (let cardId = startCard; cardId <= endCard; cardId++) {
        try {
            const metadata = await contract.getCardMetadata(cardId);
            
            if (metadata.name === "") {
                emptyCards.push(cardId);
                console.log(`Card ${cardId}: ⏭️  Not initialized`);
            } else if (metadata.finalized) {
                finalizedCards.push(cardId);
                console.log(`Card ${cardId}: 🔒 "${metadata.name}" - Finalized`);
            } else {
                unfinalizedCards.push(cardId);
                console.log(`Card ${cardId}: 🔓 "${metadata.name}" - Not finalized`);
            }
            
        } catch (error) {
            console.log(`Card ${cardId}: ❌ Error - ${error.message.substring(0, 50)}`);
        }
    }
    
    // Summary
    console.log("\n📊 Summary:");
    console.log(`   🔒 Finalized: ${finalizedCards.length} cards`);
    console.log(`   🔓 Not finalized: ${unfinalizedCards.length} cards`);
    console.log(`   ⏭️  Not initialized: ${emptyCards.length} cards`);
    
    if (unfinalizedCards.length > 0) {
        console.log(`\n🔓 Unfinalized cards: [${unfinalizedCards.join(', ')}]`);
    }
    
    // Finalize if requested
    if (action === 'finalize' && unfinalizedCards.length > 0) {
        console.log("\n🔒 Finalizing unfinalized cards...");
        
        for (const cardId of unfinalizedCards) {
            try {
                console.log(`  Finalizing card ${cardId}...`);
                const tx = await contract.finalizeMetadata(cardId);
                await tx.wait();
                console.log(`  ✅ Card ${cardId} finalized`);
            } catch (error) {
                console.log(`  ❌ Card ${cardId} failed: ${error.message.substring(0, 50)}`);
            }
        }
    }
    
    if (action === 'check' && unfinalizedCards.length > 0) {
        console.log("\n💡 To finalize these cards, run:");
        console.log(`   PRIVATE_KEY=xxx node scripts/nft/updateUnfinalizedCards.js finalize ${startCard} ${endCard}`);
    }
}

main().catch(console.error);