import fs from 'fs';
import { ethers } from 'ethers';

// Load card data
const cardInitData = JSON.parse(fs.readFileSync('./data/nft/cardInitData.json', 'utf8'));
const deployedContracts = JSON.parse(fs.readFileSync('./data/nft/deployed-contracts.json', 'utf8'));

// Contract ABI
const CARDS_ABI = [
    "function setCardMetadata(uint256 cardId, string name, string description, uint256 cost, uint8 cardType, bytes svgData, uint256 maxSupply) external",
    "function setCardAbilities(uint256 cardId, tuple(string abilityType, uint256 amount)[] abilities) external", 
    "function finalizeMetadata(uint256 cardId) external",
    "function getCardMetadata(uint256 cardId) external view returns (tuple(string name, string description, uint256 cost, uint8 cardType, address svgPointer, address jsonPointer, bytes32 contentHash, uint256 maxSupply, uint256 totalMinted, bool tradeable, bool finalized))",
    "function hasRole(bytes32 role, address account) external view returns (bool)"
];

// Check the actual state of a card
async function checkCardState(contract, cardId) {
    try {
        const metadata = await contract.getCardMetadata(cardId);
        
        const hasName = metadata.name !== "";
        const hasSvgPointer = metadata.svgPointer !== "0x0000000000000000000000000000000000000000";
        const hasJsonPointer = metadata.jsonPointer !== "0x0000000000000000000000000000000000000000";
        const isFinalized = metadata.finalized;
        
        // Check if SVG pointer actually has data
        let svgPointerHasData = false;
        if (hasSvgPointer) {
            const provider = contract.runner?.provider || contract.provider;
            const code = await provider.getCode(metadata.svgPointer);
            svgPointerHasData = code.length > 2; // More than just "0x"
        }
        
        return {
            cardId,
            name: metadata.name,
            hasName,
            hasSvgPointer,
            hasJsonPointer,
            svgPointerHasData,
            isFinalized,
            svgPointer: metadata.svgPointer,
            jsonPointer: metadata.jsonPointer,
            needsFix: hasName && (!hasSvgPointer || !svgPointerHasData) && !isFinalized
        };
    } catch (error) {
        return {
            cardId,
            error: error.message,
            needsFix: false
        };
    }
}

// Re-initialize a card with proper SVG data
async function reinitializeCard(contract, wallet, card) {
    console.log(`\n🔧 Re-initializing Card ${card.cardId}: ${card.name}`);
    
    // Convert SVG string to bytes
    const svgBytes = ethers.toUtf8Bytes(card.svgData);
    console.log(`  📊 SVG data length: ${svgBytes.length} bytes`);
    
    // Convert abilities format
    const abilities = card.abilities.map(ability => [
        ability.abilityType,
        ability.amount
    ]);
    
    try {
        // Re-set metadata with SVG data
        console.log(`  📝 Re-setting metadata with SVG data...`);
        
        const tx = await contract.setCardMetadata(
            card.cardId,
            card.name,
            card.description,
            card.cost,
            card.cardType,
            svgBytes,
            card.maxSupply,
            {
                gasLimit: 2000000
            }
        );
        
        console.log(`    ⏳ Waiting for tx: ${tx.hash}`);
        const receipt = await tx.wait();
        console.log(`    ✅ Metadata re-set (block: ${receipt.blockNumber})`);
        
        // Re-set abilities if any
        if (abilities.length > 0) {
            console.log(`  ⚡ Re-setting ${abilities.length} abilities...`);
            
            const abilitiesTx = await contract.setCardAbilities(
                card.cardId,
                abilities,
                {
                    gasLimit: 500000
                }
            );
            
            await abilitiesTx.wait();
            console.log(`    ✅ Abilities re-set`);
        }
        
        // Check the new state
        const newState = await checkCardState(contract, card.cardId);
        console.log(`  📋 New state:`);
        console.log(`     SVG Pointer: ${newState.svgPointer}`);
        console.log(`     Has data: ${newState.svgPointerHasData ? '✅' : '❌'}`);
        
        return true;
        
    } catch (error) {
        console.error(`  ❌ Failed to re-initialize: ${error.message}`);
        return false;
    }
}

async function main() {
    console.log("🔧 Fix Empty SSTORE2 Pointers");
    console.log("==============================");
    
    // Parse command line arguments
    const args = process.argv.slice(2);
    let startCard = parseInt(args[0]) || 1;
    let endCard = parseInt(args[1]) || 91;
    
    console.log(`📋 Checking cards ${startCard} to ${endCard}`);
    
    // Setup provider and wallet
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
    
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        console.error("❌ Please set PRIVATE_KEY environment variable");
        process.exit(1);
    }
    
    const wallet = new ethers.Wallet(privateKey, provider);
    console.log(`👤 Using wallet: ${wallet.address}`);
    
    // Connect to contract
    const contract = new ethers.Contract(
        deployedContracts.TokenTycoonCards,
        CARDS_ABI,
        wallet
    );
    
    console.log(`📍 Contract: ${deployedContracts.TokenTycoonCards}`);
    
    // Check admin permissions
    const ADMIN_ROLE = "0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775";
    const hasAdminRole = await contract.hasRole(ADMIN_ROLE, wallet.address);
    
    if (!hasAdminRole) {
        console.error("❌ Wallet does not have ADMIN_ROLE permissions");
        process.exit(1);
    }
    
    console.log("✅ Admin permissions confirmed");
    
    // Check each card's state
    console.log("\n🔍 Checking card states...");
    const cardsToFix = [];
    
    for (let cardId = startCard; cardId <= endCard; cardId++) {
        const state = await checkCardState(contract, cardId);
        
        if (state.error) {
            console.log(`  Card ${cardId}: ❌ Error - ${state.error}`);
        } else if (state.needsFix) {
            console.log(`  Card ${cardId}: ⚠️  "${state.name}" - Empty SVG pointer, needs fix`);
            cardsToFix.push(cardId);
        } else if (!state.hasName) {
            console.log(`  Card ${cardId}: ⏭️  Not initialized`);
        } else if (state.isFinalized) {
            console.log(`  Card ${cardId}: 🔒 "${state.name}" - Finalized`);
        } else {
            console.log(`  Card ${cardId}: ✅ "${state.name}" - OK`);
        }
    }
    
    if (cardsToFix.length === 0) {
        console.log("\n✅ No cards need fixing!");
        return;
    }
    
    console.log(`\n⚠️  Found ${cardsToFix.length} cards with empty SVG pointers: [${cardsToFix.join(', ')}]`);
    
    // Ask for confirmation
    console.log("\n🔧 Attempting to fix these cards...");
    
    // Fix each card
    let successCount = 0;
    let failCount = 0;
    
    for (const cardId of cardsToFix) {
        const cardData = cardInitData.find(c => c.cardId === cardId);
        if (!cardData) {
            console.log(`  ❌ Card ${cardId}: No init data found`);
            failCount++;
            continue;
        }
        
        const success = await reinitializeCard(contract, wallet, cardData);
        if (success) {
            successCount++;
        } else {
            failCount++;
        }
        
        // Add delay between transactions
        if (cardId !== cardsToFix[cardsToFix.length - 1]) {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
    
    console.log("\n📊 Results:");
    console.log(`   ✅ Fixed: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
    
    if (successCount > 0) {
        console.log("\n🎉 Successfully fixed some cards!");
        console.log("Run 'node scripts/nft/sampleCardMetadata.js' to verify the fix");
    }
}

main().catch(error => {
    console.error("❌ Script failed:", error);
    process.exit(1);
});