import fs from 'fs';
import { ethers } from 'ethers';

// Load card data
const cardInitData = JSON.parse(fs.readFileSync('./data/nft/cardInitData.json', 'utf8'));
const deployedContracts = JSON.parse(fs.readFileSync('./data/nft/deployed-contracts.json', 'utf8'));

// Contract ABI - minimal ABI for the functions we need
const CARDS_ABI = [
    "function setCardMetadata(uint256 cardId, string name, string description, uint256 cost, uint8 cardType, bytes svgData, uint256 maxSupply) external",
    "function setCardAbilities(uint256 cardId, tuple(string abilityType, uint256 amount)[] abilities) external", 
    "function finalizeMetadata(uint256 cardId) external",
    "function getCardMetadata(uint256 cardId) external view returns (tuple(string name, string description, uint256 cost, uint8 cardType, address svgPointer, address jsonPointer, bytes32 contentHash, uint256 maxSupply, uint256 totalMinted, bool tradeable, bool finalized))",
    "function hasRole(bytes32 role, address account) external view returns (bool)"
];

async function main() {
    console.log("=== Initializing All Cards ===");
    
    // Parse command line arguments for batch processing
    const args = process.argv.slice(2);
    let startCard = 1;
    let endCard = null;
    
    if (args.length >= 2) {
        startCard = parseInt(args[0]) || 1;
        endCard = parseInt(args[1]) || null;
        console.log(`Processing cards ${startCard} to ${endCard || 'end'}`);
    }
    
    // Setup provider and wallet
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
    
    // Use private key from environment or prompt user
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        console.error("Please set PRIVATE_KEY environment variable");
        console.error("Usage: PRIVATE_KEY=your_key node scripts/nft/initializeAllCards.js [startCard] [endCard]");
        console.error("Examples:");
        console.error("  PRIVATE_KEY=your_key node scripts/nft/initializeAllCards.js           # All cards");
        console.error("  PRIVATE_KEY=your_key node scripts/nft/initializeAllCards.js 1 10      # Cards 1-10");
        console.error("  PRIVATE_KEY=your_key node scripts/nft/initializeAllCards.js 50 91     # Cards 50-91");
        process.exit(1);
    }
    
    const wallet = new ethers.Wallet(privateKey, provider);
    console.log("Using wallet:", wallet.address);
    
    // Connect to contracts
    const cardsContract = new ethers.Contract(
        deployedContracts.TokenTycoonCards,
        CARDS_ABI,
        wallet
    );
    
    console.log("Cards contract:", deployedContracts.TokenTycoonCards);
    console.log("Total cards to initialize:", cardInitData.length);
    
    // Check if we have admin rights
    const ADMIN_ROLE = "0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775";
    const hasAdminRole = await cardsContract.hasRole(ADMIN_ROLE, wallet.address);
    
    if (!hasAdminRole) {
        console.error("Wallet does not have ADMIN_ROLE permissions");
        process.exit(1);
    }
    
    console.log("✅ Admin permissions confirmed");
    
    // Filter cards based on command line arguments
    let cardsToProcess = cardInitData;
    if (startCard > 1 || endCard !== null) {
        cardsToProcess = cardInitData.filter(card => {
            const id = card.cardId;
            if (endCard !== null) {
                return id >= startCard && id <= endCard;
            }
            return id >= startCard;
        });
        console.log(`Filtered to ${cardsToProcess.length} cards (IDs ${startCard}-${endCard || 'end'})`);
    }
    
    // Process filtered cards
    const startIndex = 0;
    const endIndex = cardsToProcess.length;
    
    console.log(`\nProcessing ${cardsToProcess.length} cards...`);
    console.log("Note: Cards 1-2 may fail if already finalized, but we'll continue with the rest");
    
    let successCount = 0;
    let failureCount = 0;
    const failedCards = [];
    
    for (let i = startIndex; i < endIndex; i++) {
        const card = cardsToProcess[i];
        console.log(`\n[${i + 1}/${cardsToProcess.length}] Initializing Card ${card.cardId}: ${card.name}`);
        
        try {
            // Convert SVG string to bytes
            const svgBytes = ethers.toUtf8Bytes(card.svgData);
            
            // Convert abilities format
            const abilities = card.abilities.map(ability => [
                ability.abilityType,
                ability.amount
            ]);
            
            console.log(`  - Setting metadata... (Cost: ${card.cost}, Type: ${card.cardType})`);
            
            // Set card metadata
            const metadataTx = await cardsContract.setCardMetadata(
                card.cardId,
                card.name,
                card.description,
                card.cost,
                card.cardType,
                svgBytes,
                card.maxSupply,
                {
                    gasLimit: 2000000 // Set high gas limit for complex SVGs
                }
            );
            
            await metadataTx.wait();
            console.log(`  ✅ Metadata set (tx: ${metadataTx.hash})`);
            
            // Set abilities if any
            if (abilities.length > 0) {
                console.log(`  - Setting ${abilities.length} abilities...`);
                const abilitiesTx = await cardsContract.setCardAbilities(
                    card.cardId,
                    abilities,
                    {
                        gasLimit: 500000
                    }
                );
                await abilitiesTx.wait();
                console.log(`  ✅ Abilities set (tx: ${abilitiesTx.hash})`);
            }
            
            // Finalize metadata to make it immutable
            console.log(`  - Finalizing metadata...`);
            const finalizeTx = await cardsContract.finalizeMetadata(card.cardId, {
      gasLimit: 300000,
      maxFeePerGas: ethers.parseUnits('2', 'gwei'), // Higher gas price
      maxPriorityFeePerGas: ethers.parseUnits('1', 'gwei')
  });
            await finalizeTx.wait();
            console.log(`  ✅ Metadata finalized (tx: ${finalizeTx.hash})`);
            
            console.log(`✅ Card ${card.cardId} (${card.name}) initialized successfully!`);
            successCount++;
            
            // Add small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
            
        } catch (error) {
            console.error(`❌ Failed to initialize card ${card.cardId}: ${error.message}`);
            if (error.data) {
                console.error("Error data:", error.data);
            }
            failureCount++;
            failedCards.push({ cardId: card.cardId, name: card.name, error: error.message });
            
            // Continue with next card instead of failing completely
            continue;
        }
    }
    
    console.log(`\n=== CARDS INITIALIZATION COMPLETE ===`);
    console.log(`Total cards processed: ${cardsToProcess.length}`);
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${failureCount}`);
    
    if (failedCards.length > 0) {
        console.log(`\n📋 Failed Cards Summary:`);
        failedCards.forEach(failed => {
            console.log(`  - Card ${failed.cardId} (${failed.name}): ${failed.error}`);
        });
    }
    
    if (successCount > 0) {
        console.log(`\nNext steps:`);
        console.log(`1. Test a card: cast call --rpc-url https://sepolia.base.org ${deployedContracts.TokenTycoonCards} "getCardMetadata(uint256)" 3`);
        console.log(`2. Try card URI: cast call --rpc-url https://sepolia.base.org ${deployedContracts.TokenTycoonCards} "uri(uint256)" 3`);
        console.log(`3. Check abilities: cast call --rpc-url https://sepolia.base.org ${deployedContracts.TokenTycoonCards} "getCardAbilities(uint256)" 3`);
        console.log(`4. ${successCount} cards now have proper metadata and SVG artwork!`);
    }
    
    if (failureCount > 0) {
        console.log(`\n⚠️  Some cards failed to initialize. This is normal for:`);
        console.log(`   - Cards 1-2 (already finalized with corrupted data)`);
        console.log(`   - Cards with gas limit issues (can be retried)`);
        console.log(`   - Network connectivity issues (temporary)`);
    }
}

// Handle errors
main().catch(error => {
    console.error("Script failed:", error);
    process.exit(1);
});
