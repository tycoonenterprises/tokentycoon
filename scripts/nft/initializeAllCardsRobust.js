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

// Enhanced retry logic with exponential backoff
async function retryWithBackoff(fn, maxRetries = 5, baseDelay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            const isLastAttempt = attempt === maxRetries;
            const shouldRetry = 
                error.message.includes('replacement fee too low') ||
                error.message.includes('nonce too low') ||
                error.message.includes('nonce has already been used') ||
                error.message.includes('network busy') ||
                error.message.includes('timeout');

            if (isLastAttempt || !shouldRetry) {
                throw error;
            }

            const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
            console.log(`    ⏳ Attempt ${attempt} failed, retrying in ${Math.round(delay)}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

// Get fresh nonce for wallet
async function getFreshNonce(wallet) {
    const pendingNonce = await wallet.getNonce("pending");
    const latestNonce = await wallet.getNonce("latest");
    return Math.max(pendingNonce, latestNonce);
}

// Get dynamic gas pricing
async function getGasPrice(provider) {
    const feeData = await provider.getFeeData();
    return {
        maxFeePerGas: feeData.maxFeePerGas ? feeData.maxFeePerGas * BigInt(120) / BigInt(100) : ethers.parseUnits('3', 'gwei'),
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? feeData.maxPriorityFeePerGas * BigInt(110) / BigInt(100) : ethers.parseUnits('1.5', 'gwei')
    };
}

// Check if card is already initialized
async function isCardInitialized(contract, cardId) {
    try {
        const metadata = await contract.getCardMetadata(cardId);
        return metadata.finalized || metadata.name !== "";
    } catch (error) {
        return false;
    }
}

async function initializeCard(contract, wallet, provider, card) {
    console.log(`\n🔄 Initializing Card ${card.cardId}: ${card.name}`);
    
    // Check if already initialized
    if (await isCardInitialized(contract, card.cardId)) {
        console.log(`  ✅ Card ${card.cardId} already initialized, skipping`);
        return true;
    }

    // Convert SVG string to bytes
    const svgBytes = ethers.toUtf8Bytes(card.svgData);
    
    // Convert abilities format
    const abilities = card.abilities.map(ability => [
        ability.abilityType,
        ability.amount
    ]);

    let currentNonce = await getFreshNonce(wallet);
    const gasPrice = await getGasPrice(provider);

    // Step 1: Set metadata
    console.log(`  📝 Setting metadata... (Cost: ${card.cost}, Type: ${card.cardType})`);
    
    const metadataTx = await retryWithBackoff(async () => {
        const tx = await contract.setCardMetadata(
            card.cardId,
            card.name,
            card.description,
            card.cost,
            card.cardType,
            svgBytes,
            card.maxSupply,
            {
                gasLimit: 2000000,
                nonce: currentNonce++,
                ...gasPrice
            }
        );
        return tx;
    });
    
    await metadataTx.wait();
    console.log(`    ✅ Metadata set (tx: ${metadataTx.hash})`);

    // Step 2: Set abilities if any
    if (abilities.length > 0) {
        console.log(`  ⚡ Setting ${abilities.length} abilities...`);
        
        const abilitiesTx = await retryWithBackoff(async () => {
            const tx = await contract.setCardAbilities(
                card.cardId,
                abilities,
                {
                    gasLimit: 500000,
                    nonce: currentNonce++,
                    ...gasPrice
                }
            );
            return tx;
        });
        
        await abilitiesTx.wait();
        console.log(`    ✅ Abilities set (tx: ${abilitiesTx.hash})`);
    }

    // Step 3: Finalize metadata
    console.log(`  🔒 Finalizing metadata...`);
    
    const finalizeTx = await retryWithBackoff(async () => {
        const tx = await contract.finalizeMetadata(card.cardId, {
            gasLimit: 300000,
            nonce: currentNonce++,
            ...gasPrice
        });
        return tx;
    });
    
    await finalizeTx.wait();
    console.log(`    ✅ Metadata finalized (tx: ${finalizeTx.hash})`);

    console.log(`✅ Card ${card.cardId} (${card.name}) initialized successfully!`);
    return true;
}

async function main() {
    console.log("=== ROBUST CARD INITIALIZATION ===");
    console.log("This script handles all blockchain issues automatically");
    
    // Parse command line arguments
    const args = process.argv.slice(2);
    let startCard = 1;
    let endCard = null;
    let onlyEmpty = false;
    
    // Parse arguments
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--only-empty') {
            onlyEmpty = true;
        } else if (!startCard || startCard === 1) {
            startCard = parseInt(args[i]) || 1;
        } else if (!endCard) {
            endCard = parseInt(args[i]) || null;
        }
    }
    
    if (args.length >= 2 && !onlyEmpty) {
        console.log(`Processing cards ${startCard} to ${endCard || 'end'}`);
    } else if (onlyEmpty) {
        console.log('Processing only empty cards');
    }
    
    // Setup provider and wallet
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
    
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        console.error("Please set PRIVATE_KEY environment variable");
        console.error("Usage: PRIVATE_KEY=your_key node scripts/nft/initializeAllCardsRobust.js [options]");
        console.error("Options:");
        console.error("  [startCard] [endCard]  # Process specific range");
        console.error("  --only-empty           # Process only empty cards");
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
    
    // Check admin permissions
    const ADMIN_ROLE = "0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775";
    const hasAdminRole = await cardsContract.hasRole(ADMIN_ROLE, wallet.address);
    
    if (!hasAdminRole) {
        console.error("❌ Wallet does not have ADMIN_ROLE permissions");
        process.exit(1);
    }
    
    console.log("✅ Admin permissions confirmed");

    // Filter cards based on arguments
    let cardsToProcess = cardInitData;
    
    if (onlyEmpty) {
        // Find only empty cards
        console.log("🔍 Checking which cards are empty...");
        const emptyCards = [];
        
        for (const card of cardInitData) {
            if (!(await isCardInitialized(cardsContract, card.cardId))) {
                emptyCards.push(card);
            }
        }
        
        cardsToProcess = emptyCards;
        console.log(`Found ${emptyCards.length} empty cards to initialize`);
    } else if (startCard > 1 || endCard !== null) {
        cardsToProcess = cardInitData.filter(card => {
            const id = card.cardId;
            if (endCard !== null) {
                return id >= startCard && id <= endCard;
            }
            return id >= startCard;
        });
        console.log(`Filtered to ${cardsToProcess.length} cards (IDs ${startCard}-${endCard || 'end'})`);
    }

    if (cardsToProcess.length === 0) {
        console.log("✅ No cards to process!");
        return;
    }

    console.log(`\n🚀 Processing ${cardsToProcess.length} cards...`);
    
    let successCount = 0;
    let failureCount = 0;
    const failedCards = [];
    
    // Process each card with robust error handling
    for (let i = 0; i < cardsToProcess.length; i++) {
        const card = cardsToProcess[i];
        
        try {
            await initializeCard(cardsContract, wallet, provider, card);
            successCount++;
            
            // Longer delay between cards to avoid issues
            await new Promise(resolve => setTimeout(resolve, 2000));
            
        } catch (error) {
            console.error(`❌ Failed to initialize card ${card.cardId}: ${error.message}`);
            failureCount++;
            failedCards.push({ 
                cardId: card.cardId, 
                name: card.name, 
                error: error.message.substring(0, 100) 
            });
            
            // Continue with next card
            continue;
        }
    }
    
    console.log(`\n=== INITIALIZATION COMPLETE ===`);
    console.log(`📊 Results:`);
    console.log(`   Total processed: ${cardsToProcess.length}`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${failureCount}`);
    console.log(`   📈 Success rate: ${Math.round((successCount / cardsToProcess.length) * 100)}%`);
    
    if (failedCards.length > 0) {
        console.log(`\n📋 Failed Cards (can be retried):`);
        failedCards.forEach(failed => {
            console.log(`   - Card ${failed.cardId} (${failed.name}): ${failed.error}`);
        });
        console.log(`\n🔄 To retry failures: PRIVATE_KEY=xxx node scripts/nft/initializeAllCardsRobust.js --only-empty`);
    }
    
    if (successCount === cardsToProcess.length) {
        console.log(`\n🎉 ALL CARDS INITIALIZED SUCCESSFULLY!`);
    }
}

// Handle errors
main().catch(error => {
    console.error("❌ Script failed:", error);
    process.exit(1);
});