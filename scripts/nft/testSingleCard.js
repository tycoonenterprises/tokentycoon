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

async function testCard(cardId) {
    console.log(`=== Testing Card ${cardId} ===`);
    
    // Setup provider and wallet
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        console.error("Please set PRIVATE_KEY environment variable");
        process.exit(1);
    }
    
    const wallet = new ethers.Wallet(privateKey, provider);
    console.log("Using wallet:", wallet.address);
    
    // Connect to contract
    const cardsContract = new ethers.Contract(
        deployedContracts.TokenTycoonCards,
        CARDS_ABI,
        wallet
    );
    
    // Find the card in our data
    const card = cardInitData.find(c => c.cardId === cardId);
    if (!card) {
        console.error(`Card ${cardId} not found in data`);
        process.exit(1);
    }
    
    console.log(`Card: ${card.name}`);
    console.log(`Description: ${card.description}`);
    console.log(`Cost: ${card.cost}, Type: ${card.cardType}`);
    console.log(`SVG length: ${card.svgData.length} characters`);
    console.log(`Abilities: ${card.abilities.length}`);
    
    try {
        // Test with much smaller SVG first
        const testSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="#000"/><text x="50" y="50" fill="white" text-anchor="middle">Test</text></svg>';
        
        console.log("Testing with simple SVG...");
        const svgBytes = ethers.toUtf8Bytes(testSvg);
        
        console.log(`SVG bytes length: ${svgBytes.length}`);
        
        // Set card metadata
        console.log("Setting metadata...");
        const metadataTx = await cardsContract.setCardMetadata(
            card.cardId,
            card.name,
            card.description,
            card.cost,
            card.cardType,
            svgBytes,
            card.maxSupply,
            {
                gasLimit: 3000000 // High gas limit
            }
        );
        
        console.log(`Metadata tx: ${metadataTx.hash}`);
        const receipt = await metadataTx.wait();
        console.log(`✅ Metadata set (gas used: ${receipt.gasUsed})`);
        
        // Set abilities
        const abilities = card.abilities.map(ability => [
            ability.abilityType,
            ability.amount
        ]);
        
        console.log("Setting abilities...");
        const abilitiesTx = await cardsContract.setCardAbilities(
            card.cardId,
            abilities,
            {
                gasLimit: 500000
            }
        );
        
        await abilitiesTx.wait();
        console.log(`✅ Abilities set (tx: ${abilitiesTx.hash})`);
        
        // Don't finalize yet - let's test the metadata first
        console.log("✅ Card initialized successfully (not finalized)");
        
        // Test reading the metadata back
        console.log("\nTesting metadata readback...");
        const metadata = await cardsContract.getCardMetadata(card.cardId);
        console.log("Retrieved metadata:");
        console.log(`- Name: "${metadata[0]}"`);
        console.log(`- Description: "${metadata[1]}"`);
        console.log(`- Cost: ${metadata[2]}`);
        console.log(`- Type: ${metadata[3]}`);
        console.log(`- Finalized: ${metadata[10]}`);
        
    } catch (error) {
        console.error("❌ Failed:", error.message);
        if (error.data) {
            console.error("Error data:", error.data);
        }
    }
}

// Get card ID from command line or use default
const cardId = parseInt(process.argv[2]) || 10; // Use card 10 as test (should be empty)
testCard(cardId).catch(console.error);